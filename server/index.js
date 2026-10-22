import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

try { process.loadEnvFile(new URL('../.env', import.meta.url)) } catch { /* no .env — rely on real environment */ }

const { analyzePhotos, generateOutfits, hasCredentials, MODEL, AiError } = await import('./ai.js')

const app = express()
app.use(cors())
app.use(express.json({ limit: '40mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', aiConfigured: hasCredentials(), model: MODEL() })
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

// Production: serve the built UI from the same server.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (!process.env.VERCEL && fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

export default app

const PORT = process.env.PORT || 4000
if (!process.env.VERCEL) app.listen(PORT, () => console.log(`CLTH.Y listening on :${PORT} · AI ${hasCredentials() ? `ready via OpenRouter (${MODEL()})` : 'NOT configured (no OPENROUTER_API_KEY)'}`))
