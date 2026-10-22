import { ANALYSIS_SYSTEM, DESIGNER_SYSTEM, FINDER_SYSTEM, analysisUserText, designerUserText, finderUserText } from './prompts.js'
import { SEASONS } from './palettes.js'
import { describeSkin, measureSkin, pickSeason } from './skin.js'
import { allowedDomains, canonUrl, normalizeStoreName, resolveStores, verifyProductUrl } from './stores.js'

// All model calls go through OpenRouter (OpenAI-compatible). The key stays on the server.
// NOTE: this workspace's OpenRouter guardrail only permits Google Gemini models, so Gemini is the default.
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
// Separate models per job so the slow, search-heavy styling step can use a faster model than the analysis.
export const MODEL = (task) =>
  (task === 'analysis' ? process.env.ANALYSIS_MODEL : task === 'stylist' ? process.env.STYLIST_MODEL : task === 'designer' ? process.env.DESIGNER_MODEL : null) ||
  (task === 'designer' ? 'google/gemini-3.1-pro-preview' : null) ||
  process.env.AI_MODEL || 'google/gemini-3.5-flash'
const EFFORT = (task) => process.env[`${task.toUpperCase()}_EFFORT`] || (task === 'analysis' ? 'minimal' : 'low')
export const hasCredentials = () => !!process.env.OPENROUTER_API_KEY

export class AiError extends Error {
  constructor(message, status = 502, code = 'ai_error') { super(message); this.status = status; this.code = code }
}

async function chat(body) {
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'CLTH.Y' },
      body: JSON.stringify({ model: MODEL(body.task), ...body, task: undefined }),
      signal: AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS) || 600000),
    })
  } catch (e) {
    throw new AiError(`Could not reach OpenRouter: ${e.message}`, 502, 'offline')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) {
    const msg = data.error?.message || `OpenRouter request failed (${res.status})`
    const status = res.status === 401 ? 401 : res.status === 402 ? 402 : res.status === 429 ? 429 : 502
    const code = status === 401 ? 'bad_key' : status === 402 ? 'no_credit' : status === 429 ? 'rate_limited' : 'ai_error'
    throw new AiError(msg, status, code)
  }
  const choice = data.choices?.[0]
  if (!choice) throw new AiError('The model returned no answer.')
  if (choice.finish_reason === 'length') throw new AiError('The model response was cut off (max_tokens).')
  if (choice.finish_reason === 'content_filter') throw new AiError('The model declined to process this request.', 422, 'refused')
  return { text: choice.message?.content || '', annotations: choice.message?.annotations || [], usage: data.usage }
}

const SLOT_LABELS = { 1: 'Photo 1: front face', 2: 'Photo 2: left side profile', 3: 'Photo 3: right side profile', 4: 'Photo 4: full body' }

// photos: { "1": dataUrl, ... } — only real raster uploads are usable by the vision model.
export function imageBlocks(photos = {}) {
  const blocks = []
  const labels = []
  for (const slot of [1, 2, 3, 4]) {
    const url = photos[slot] || ''
    if (!/^data:image\/(?:jpeg|png|webp);base64,/.test(url)) continue
    blocks.push({ type: 'text', text: `${SLOT_LABELS[slot]}:` })
    blocks.push({ type: 'image_url', image_url: { url } })
    labels.push(SLOT_LABELS[slot])
  }
  return { blocks, labels }
}

export function extractJson(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('The model returned no JSON object.')
  return JSON.parse(body.slice(start, end + 1))
}

/* ───────────── Prompt 1: Korean master colour / frame analysis ───────────── */
export async function analyzePhotos({ photos, demographics }) {
  const { blocks, labels } = imageBlocks(photos)
  if (!blocks.length) {
    throw new AiError('No uploaded photos to analyse. Upload at least one real photo (sample presets are drawings, not photos).', 400, 'no_photos')
  }
  const { text } = await chat({
    task: 'analysis',
    max_tokens: 16000,
    reasoning: { effort: EFFORT('analysis') },
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM },
      { role: 'user', content: [...blocks, { type: 'text', text: analysisUserText(demographics, labels) }] },
    ],
  })
  const report = sanitizeReport(extractJson(text))
  return applyMeasuredColour(report, photos)
}

// Replace the model's colour guess with colours derived from skin pixels actually measured in the photo.
function applyMeasuredColour(r, photos) {
  const order = [Number(r.faceBoxPhoto), 1, 2, 3, 4].filter((n, i, a) => n >= 1 && n <= 4 && a.indexOf(n) === i)
  let skin = null
  for (const slot of order) {
    skin = measureSkin(photos?.[slot], slot === Number(r.faceBoxPhoto) ? r.faceBox : null)
    if (skin) break
  }
  if (!skin) return { ...r, colourSource: 'estimated' }
  const { depth, undertone } = describeSkin(skin)
  const season = pickSeason(skin, String(r.skinReading?.contrast || '').toLowerCase())
  const pal = SEASONS[season]
  const mf = { ...(r.moduleFindings || {}) }
  const evidence = `Measured from the skin pixels in your photo (lightness L* ${skin.L.toFixed(0)}, hue ${skin.hue.toFixed(0)}°).`
  mf['Temperature / Undertone'] = { ...(mf['Temperature / Undertone'] || {}), classification: undertone.startsWith('warm') ? 'Warm (Yellow/Peach)' : undertone.includes('cool') ? 'Cool (Pink/Blue)' : 'Neutral', evidence, confidence: 'medium' }
  mf['Brightness / Value (Lightness)'] = { ...(mf['Brightness / Value (Lightness)'] || {}), classification: skin.L > 66 ? 'High Lightness (Light)' : skin.L > 50 ? 'Medium (Soft/Mute)' : 'Low (Deep)', evidence, confidence: 'medium' }
  return {
    ...r, moduleFindings: mf, seasonType: season, colourSource: 'measured',
    skinReading: { ...r.skinReading, depth, undertone, skinHex: skin.hex, measured: { L: +skin.L.toFixed(1), a: +skin.a.toFixed(1), b: +skin.b.toFixed(1), hue: +skin.hue.toFixed(1), samples: skin.samples } },
    powerColors: pal.power.map((c) => ({ ...c, note: `Part of the ${season} range — flatters ${undertone}, ${depth} skin.` })),
    dissonantColors: pal.avoid.map((c) => ({ ...c, risk: `Outside the ${season} range — tends to wash out or overpower ${undertone}, ${depth} skin.` })),
  }
}

const HEX = /^#[0-9a-f]{6}$/i
function sanitizeReport(r) {
  const fixColors = (list, extra) =>
    (Array.isArray(list) ? list : []).filter((c) => c && HEX.test(c.hex)).slice(0, 6).map((c) => ({ name: String(c.name || c.hex), hex: c.hex.toUpperCase(), [extra]: String(c[extra] || '') }))
  const power = fixColors(r.powerColors, 'note')
  const dis = fixColors(r.dissonantColors, 'risk')
  if (power.length < 3 || dis.length < 3) throw new Error('Analysis was missing colour swatches.')
  const mf = {}
  for (const [k, v] of Object.entries(r.moduleFindings || {})) {
    if (v && typeof v === 'object') mf[k] = { plain: String(v.plain || ''), classification: String(v.classification || ''), evidence: String(v.evidence || ''), confidence: String(v.confidence || ''), clothing: String(v.clothing || ''), makeup: String(v.makeup || '') }
    else if (typeof v === 'string') mf[k] = { classification: v, evidence: '', confidence: '', clothing: '', makeup: '' }
  }
  return { ...r, moduleFindings: mf, powerColors: power, dissonantColors: dis, facial: { ...r.facial, ratio: Number(r.facial?.ratio) || null }, model: MODEL('analysis'), generatedAt: new Date().toISOString() }
}

/* ───────────── Prompt 2: outfits from photos + analysis + chosen stores ───────────── */
// url_citation annotations (Exa engine) carry the real result URLs — the allow-list for link verification.
function collectSeenUrls(annotations, seen) {
  for (const a of annotations) {
    const u = a?.url_citation?.url
    const c = u && canonUrl(u)
    if (c) seen.add(c)
  }
}

const fullyLinked = (l) => l.pieces.every((p) => p.url)

// Stores whose product pages we can read from the server, so stock can really be checked.
// H&M / Ajio block server requests and Zara renders in JS, so their stock can't be verified here.
export const VERIFIABLE_STORES = ['Myntra', 'Tata CLiQ']

// Myntra serves a "Site Maintenance" stub to datacenter IPs (e.g. Vercel), so its stock can't be read from
// there. Probe once (cached) and only treat Myntra as verifiable where its real product data is reachable.
let myntraProbe = { at: 0, ok: false }
async function myntraReachable() {
  if (Date.now() - myntraProbe.at < 10 * 60_000) return myntraProbe.ok
  const probe = { url: 'https://www.myntra.com/skirts/tilism/tilism-womens-high-waist-a-line-maxi-skirt/30202574/buy', platform: 'Myntra' }
  const r = await checkPage(probe)
  myntraProbe = { at: Date.now(), ok: (probe.htmlLen || 0) > 5000 && r !== 'unknown' || r === 'verified' || r === 'out' }
  return myntraProbe.ok
}

export async function generateOutfits({ photos, demographics, analysis, stores: wanted, occasions, count = 10, request, avoidUrls = [], allowUnverified = false }) {
  let stores = resolveStores(wanted?.length ? wanted : demographics?.preferredApps || [])
  if (!allowUnverified) {
    const myntraOk = stores.includes('Myntra') ? await myntraReachable() : false
    stores = stores.filter((s) => (s === 'Myntra' ? myntraOk : VERIFIABLE_STORES.includes(s)))
    if (!stores.length) throw new AiError('Stock can be checked live only on Tata CLiQ here (Myntra, H&M, Ajio and Zara block automated checks from this server). Select Tata CLiQ in Intake, or tick “include stores whose stock can’t be verified”.', 400, 'unverifiable_stores')
  }
  if (!stores.length) {
    throw new AiError('Select at least one supported store (Myntra, Ajio, Tata CLiQ, Zara, H&M).', 400, 'no_store')
  }
  const { blocks } = imageBlocks(photos)
  const used = new Set(avoidUrls)
  const per = Math.min(count, 4)
  // The client's budget is a hard cap for the WHOLE look (top + bottom + shoes) and is never changed here.
  const budget = Math.min(50000, Math.max(1500, Math.round(Number(demographics?.budgetMax) || 0))) || null

  // Stage 1 — design the looks (fast, no web search).
  const askDesigner = () => chat({
    task: 'designer', max_tokens: 12000, reasoning: { effort: EFFORT('designer') }, response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: DESIGNER_SYSTEM },
      { role: 'user', content: [...blocks, { type: 'text', text: designerUserText({ analysis, demographics, count: per, occasions, request, budget }) }] },
    ],
  })
  let design
  try { design = await askDesigner(); extractJson(design.text) } catch { design = await askDesigner() } // one retry if the reply was empty/cut off
  const designs = (extractJson(design.text).looks || []).slice(0, per)

  // Stage 2 — one focused web search per piece, all in parallel. URLs come only from that search's results.
  const gender = demographics?.gender || 'Female'
  const findFor = async (role, spec) => {
    const seen = new Set()
    const { text, annotations } = await chat({
      task: 'stylist', max_tokens: 4000, reasoning: { effort: EFFORT('stylist') },
      tools: [{ type: 'openrouter:web_search', parameters: { engine: 'exa', max_results: 10, max_uses: 3, allowed_domains: allowedDomains(stores) } }],
      messages: [
        { role: 'system', content: FINDER_SYSTEM },
        { role: 'user', content: finderUserText({ role, query: spec?.query || `${gender} ${role}`, color: spec?.color || '#000000', stores, gender, avoidUrls: [...used], occasion: occasions.join(' | '), maxPrice: spec?.maxPrice || (budget ? Math.round(budget * 0.5) : null) }) },
      ],
    })
    collectSeenUrls(annotations, seen)
    return (extractJson(text).candidates || []).map((c) => ({ ...c, _seen: seen }))
  }
  const results = await Promise.allSettled(designs.map(async (d, i) => {
    const [top, bottom, shoe] = await Promise.all([findFor('Topwear', d.top), findFor('Bottomwear', d.bottom), findFor('Footwear', d.shoe)])
    return { ...d, top: withCandidates(d.top, top), bottom: withCandidates(d.bottom, bottom), shoe: withCandidates(d.shoe, shoe) }
  }))
  const failures = results.filter((r) => r.status === 'rejected')
  const raw = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
  if (!raw.length && failures.length) throw failures[0].reason

  const looks = raw.map((l, i) => normalizeLook(l, i)).filter(Boolean)
  await verifyStock(looks, allowUnverified, budget)
  if (process.env.DEBUG_STYLE) for (const l of looks) console.log('[style]', l.name, l.pieces.map((p) => `${p.platform}:${p.stock ?? (p.url ? 'nocheck' : 'nolink')}:${p.inStock}:${(p.sizes || []).join("/")}:${p.url}`).join(' | '))
  const good = []
  const inBudget = (l) => !budget || (l.pieces.every((p) => p.price != null) && l.pieces.reduce((t, p) => t + p.price, 0) <= budget)
  looks.forEach((l) => budget && fitBudget(l, budget))
  for (const l of looks.filter((l) => fullyLinked(l) && inBudget(l))) {
    if (l.pieces.filter((p) => used.has(p.url)).length >= 2) continue // too similar to a look we already have
    l.pieces.forEach((p) => used.add(p.url))
    good.push(l)
  }
  return { looks: good, stores, usedUrls: [...used], partialFailures: failures.length, budget, model: MODEL('stylist'), generatedAt: new Date().toISOString() }
}

// If a look is over budget, swap its dearest pieces for cheaper in-stock alternates until it fits.
function fitBudget(l, budget) {
  const total = () => l.pieces.reduce((t, p) => t + (p.price ?? 0), 0)
  for (let i = 0; i < 6 && total() > budget; i++) {
    let best = null
    for (const p of l.pieces) {
      const cheaper = (p.alternates || []).filter((a) => a.price != null && p.price != null && a.price < p.price).sort((x, y) => x.price - y.price)[0]
      if (cheaper && (!best || p.price - cheaper.price > best.gain)) best = { p, cheaper, gain: p.price - cheaper.price }
    }
    if (!best) break
    const { p, cheaper } = best
    const rest = (p.alternates || []).filter((a) => a !== cheaper)
    Object.assign(p, cheaper, { role: p.role, alternates: rest })
  }
  l.subtotal = l.pieces.every((p) => p.price != null) ? total() : null
  l.bundlePrice = l.subtotal
}

// Live check of each product page: drop dead pages and anything the store itself marks out of stock.
// Myntra exposes per-size availability in its page data, so it is verified exactly. Stores that block
// server-side requests (H&M, Zara) cannot be fetched from here, so for those the model must have read
// in-stock sizes off the page (see STYLIST_SYSTEM); the piece is then marked stock: 'reported'.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const BROWSER_HEADERS = {
  'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.9',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Upgrade-Insecure-Requests': '1', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'none', 'Sec-Fetch-User': '?1',
  'sec-ch-ua': '"Chromium";v="120", "Not?A_Brand";v="24"', 'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"macOS"',
}

export async function checkPage(p) {
  let res
  try {
    res = await fetch(p.url, { headers: BROWSER_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(7000) })
  } catch { return 'unknown' }
  p.httpStatus = res.status
  if (res.status === 404 || res.status === 410) return 'dead'
  if (!res.ok) return 'unknown'
  const html = await res.text()
  p.htmlLen = html.length
  const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1]?.trim()
  if (og) p.image = og.startsWith('//') ? `https:${og}` : og.replace(/^http:/, 'https:')
  const pm = /"price"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/.exec(html)
  if (pm && /"priceCurrency"\s*:\s*"INR"/.test(html)) p.price = Math.round(Number(pm[1]))
  if (/"availability"\s*:\s*"(?:https?:\/\/schema\.org\/)?(?:OutOfStock|SoldOut|Discontinued)"/i.test(html)) return 'out'
  if (/"availability"\s*:\s*"(?:https?:\/\/schema\.org\/)?(?:InStock|LimitedAvailability)"/i.test(html) && p.platform !== 'Myntra') return 'verified'
  if (p.platform === 'Myntra') {
    if (/"outOfStock":true/.test(html)) return 'out'
    const sizes = [...html.matchAll(/"label":"([^"]{1,12})","available":(true|false)/g)]
    if (sizes.length) {
      const ok = [...new Set(sizes.filter((m) => m[2] === 'true').map((m) => m[1]))]
      if (!ok.length) return 'out'
      p.sizes = ok
      return 'verified'
    }
  }
  return 'unknown'
}

async function judge(p, allowUnverified) {
  if (!p.url) return false
  const r = await checkPage(p)
  if (r === 'dead' || r === 'out') return false
  if (r === 'verified') { p.stock = 'verified'; return true }
  // Could not read the page ourselves: only with the explicit opt-in, and only if the model quoted in-stock sizes it saw.
  if (allowUnverified && p.inStock === true && p.sizes?.length && p.stockEvidence && !/sold out|out of stock|unavailable|notify me|coming soon/i.test(p.stockEvidence)) { p.stock = 'reported'; return true }
  return false
}

// Each piece comes with alternative products. All are checked in parallel; the first one that is really in
// stock is used, and the other in-stock ones are kept as `alternates` so the try-on can swap instantly if the
// chosen item sells out in the meantime.
async function verifyStock(looks, allowUnverified, budget) {
  await Promise.all(looks.flatMap((l) => l.pieces).map(async (piece) => {
    const options = [piece, ...(piece.candidates || [])]
    delete piece.candidates
    const ok = await Promise.all(options.map((c) => judge(c, allowUnverified)))
    let good = options.filter((_, i) => ok[i])
    if (budget) { const cap = budget * 0.5; good = [...good.filter((c) => c.price == null || c.price <= cap), ...good.filter((c) => c.price != null && c.price > cap)] }
    if (!good.length) { piece.url = null; piece.stock = 'unavailable'; return }
    const [first, ...rest] = good
    const alternates = rest.map((c) => { const { candidates, ...clean } = c; return clean }).slice(0, 3)
    if (first !== piece) Object.assign(piece, first)
    piece.alternates = alternates
  }))
  for (const l of looks) {
    l.subtotal = l.pieces.every((p) => p.price != null) ? l.pieces.reduce((s, p) => s + p.price, 0) : null
    l.bundlePrice = l.subtotal
  }
}

// Merge a design spec (colour, neckline, rise, heel) with the products found for it.
function withCandidates(spec = {}, found = []) {
  if (!found.length) return null
  const [main, ...rest] = found
  return { ...spec, ...main, color: main.color || spec.color, alternatives: rest.slice(0, 3) }
}

function normalizeLook(l, i) {
  const mk = (role, p, extra) => {
    if (!p || !p.name) return null
    const store = normalizeStoreName(p.store) || p.store
    return {
      role, name: String(p.name), brand: String(p.brand || ''), platform: store,
      price: Number.isFinite(Number(p.price)) && p.price !== null ? Math.round(Number(p.price)) : null,
      color: HEX.test(p.color) ? p.color.toUpperCase() : '#7A6B68',
      url: verifyProductUrl({ url: p.productUrl, store, seenUrls: p._seen || new Set() }),
      fabric: p.fabric || '', inStock: p.inStock === true, stockEvidence: String(p.stockEvidence || '').slice(0, 200),
      sizes: Array.isArray(p.sizesAvailable) ? p.sizesAvailable.map(String).slice(0, 12) : [], ...extra,
    }
  }
  const build = (role, p, extra) => {
    const main = mk(role, p, extra)
    if (main) main.candidates = (Array.isArray(p.alternatives) ? p.alternatives.slice(0, 2) : []).map((a) => mk(role, a, extra)).filter((c) => c && c.url)
    return main
  }
  const top = build('Topwear', l.top, { neckline: l.top?.neckline || 'Crew' })
  const bottom = build('Bottomwear', l.bottom, { rise: l.bottom?.rise || 'Mid' })
  const shoe = build('Footwear', l.shoe, { heel: Number(l.shoe?.heel) || 3 })
  if (!top || !bottom || !shoe) return null
  const pieces = [top, bottom, shoe]
  const priced = pieces.every((p) => p.price != null)
  const subtotal = priced ? pieces.reduce((s, p) => s + p.price, 0) : null
  return {
    id: `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${i}`,
    name: String(l.name || `Look ${i + 1}`), occasion: String(l.occasion || 'Everyday'),
    suitability: Math.max(0, Math.min(100, Math.round(Number(l.suitability) || 85))),
    harmony: String(l.harmony || ''), occasionFit: String(l.occasionFit || ''), discount: 0,
    top, bottom, shoe, pieces, subtotal, bundlePrice: subtotal, savings: 0, source: 'ai',
  }
}
