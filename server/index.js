import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

try { process.loadEnvFile(new URL('../.env', import.meta.url)) } catch { /* no .env — rely on real environment */ }

const { tryOn } = await import('./tryon.js')
const { sendReportEmail, mailConfigured } = await import('./mail.js')
const { leadsConfigured } = await import('./leads.js')
const { analyzePhotos, generateOutfits, hasCredentials, MODEL, AiError, checkPage } = await import('./ai.js')

const app = express()
app.use(cors())
app.use(express.json({ limit: '40mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', aiConfigured: hasCredentials(), model: MODEL(), emailConfigured: mailConfigured(), leadsSaved: leadsConfigured() })
})

const needKey = (res) =>
  res.status(503).json({ error: 'no_key', message: 'OPENROUTER_API_KEY is not set. Copy .env.example to .env, add your key, and restart.' })

function fail(res, err) {
  console.error('[ai]', err?.status ?? '', err?.message ?? err)
  const status = err instanceof AiError || err?.status ? err.status : 500
  res.status(status).json({ error: err?.code || 'failed', message: err?.message || 'Unexpected error' })
}

// Prompt 1 — Korean master colour & frame analysis from the client's photos.
app.post('/api/analyze', async (req, res) => {
  if (!hasCredentials()) return needKey(res)
  try {
    const { photos, demographics } = req.body ?? {}
    res.json(await analyzePhotos({ photos, demographics }))
  } catch (e) { fail(res, e) }
})

// Prompt 2 — outfits built from the photos + the analysis + the selected stores, with verified product links.
app.post('/api/outfits', async (req, res) => {
  if (!hasCredentials()) return needKey(res)
  try {
    const { photos, demographics, analysis, occasions, request, count, avoidUrls, allowUnverified } = req.body ?? {}
    if (!analysis) return res.status(400).json({ error: 'missing_analysis', message: 'Run the analysis first.' })
    const n = Math.min(Number(count) || Number(process.env.OUTFIT_COUNT) || 10, 10)
    res.json(await generateOutfits({
      photos, demographics, analysis, stores: demographics?.preferredApps,
      occasions: occasions?.length ? occasions : ['Smart Casual / Workwear', 'Brunch & Day Out', 'Evening & Cocktail', 'Wedding Guest', 'Travel & Airport', 'Date Night'],
      count: n, request, allowUnverified: !!allowUnverified, avoidUrls: Array.isArray(avoidUrls) ? avoidUrls.slice(0, 80) : [],
    }))
  } catch (e) { fail(res, e) }
})

// Email the visitor their report (they ask for it) and notify the site owner. Small in-memory rate limit.
const hits = new Map()
function limited(key, max, windowMs) {
  const now = Date.now()
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
  if (arr.length >= max) return true
  arr.push(now); hits.set(key, arr)
  return false
}
app.post('/api/email-report', async (req, res) => {
  try {
    const { email, report, website, consent } = req.body ?? {}
    if (website) return res.json({ sent: true }) // honeypot: bots fill hidden fields; pretend success
    if (!consent) return res.status(400).json({ error: 'no_consent', message: 'Please tick the box to receive the email.' })
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
    if (limited(`ip:${ip}`, 5, 3600_000) || limited(`em:${String(email).toLowerCase()}`, 2, 3600_000)) {
      return res.status(429).json({ error: 'rate_limited', message: 'That is a lot of emails. Please try again in an hour.' })
    }
    const siteUrl = process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`
    res.json(await sendReportEmail({ to: String(email || '').trim(), report, siteUrl, ip }))
  } catch (e) { fail(res, e) }
})

// Virtual try-on: the client's own photo wearing the exact garments from their verified product pages.
app.post('/api/tryon', async (req, res) => {
  if (!hasCredentials()) return needKey(res)
  try {
    const { photos, pieces } = req.body ?? {}
    res.json(await tryOn({ photos, pieces }))
  } catch (e) { fail(res, e) }
})

// Quick live stock re-check for the pieces of one look (used right before a try-on).
app.post('/api/stock', async (req, res) => {
  try {
    const pieces = (Array.isArray(req.body?.pieces) ? req.body.pieces : []).slice(0, 6)
    const out = await Promise.all(pieces.map(async (p) => {
      try {
        const u = new URL(p.url)
        if (u.protocol !== 'https:' || !/(^|\.)(myntra|tatacliq|ajio|zara|hm)\.com$/.test(u.hostname)) return { url: p.url, status: 'unknown' }
        const probe = { url: p.url, platform: p.platform }
        const r = await checkPage(probe)
        return { url: p.url, status: r === 'out' || r === 'dead' ? 'out' : 'ok', check: r, http: probe.httpStatus, len: probe.htmlLen }
      } catch { return { url: p.url, status: 'unknown' } }
    }))
    res.json({ results: out })
  } catch (e) { fail(res, e) }
})

// Production: serve the built UI from the same server.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (!process.env.VERCEL && fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

export default app

const PORT = process.env.PORT || 4000
if (!process.env.VERCEL) app.listen(PORT, () => console.log(`CLTH.Y listening on :${PORT} · AI ${hasCredentials() ? `ready via OpenRouter (${MODEL()})` : 'NOT configured (no OPENROUTER_API_KEY)'}`))
