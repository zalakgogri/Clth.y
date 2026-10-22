import { ANALYSIS_SYSTEM, STYLIST_SYSTEM, analysisUserText, stylistUserText } from './prompts.js'
import { allowedDomains, canonUrl, normalizeStoreName, resolveStores, verifyProductUrl } from './stores.js'

// All model calls go through OpenRouter (OpenAI-compatible). The key stays on the server.
// NOTE: this workspace's OpenRouter guardrail only permits Google Gemini models, so Gemini is the default.
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
export const MODEL = () => process.env.AI_MODEL || 'google/gemini-3.1-pro-preview'
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
      body: JSON.stringify({ model: MODEL(), ...body }),
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

const SLOT_LABELS = { 1: 'Slot 1 front face', 2: 'Slot 2 side face 90°', 3: 'Slot 3 full body front', 4: 'Slot 4 full body side', 5: 'Slot 5 candid pose' }

// photos: { "1": dataUrl, ... } — only real raster uploads are usable by the vision model.
export function imageBlocks(photos = {}) {
  const blocks = []
  const labels = []
  for (const slot of [1, 2, 3, 4, 5]) {
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
    max_tokens: 16000,
    reasoning: { effort: 'medium' },
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM },
      { role: 'user', content: [...blocks, { type: 'text', text: analysisUserText(demographics, labels) }] },
    ],
  })
  const report = extractJson(text)
  return sanitizeReport(report)
}

const HEX = /^#[0-9a-f]{6}$/i
function sanitizeReport(r) {
  const fixColors = (list, extra) =>
    (Array.isArray(list) ? list : []).filter((c) => c && HEX.test(c.hex)).slice(0, 6).map((c) => ({ name: String(c.name || c.hex), hex: c.hex.toUpperCase(), [extra]: String(c[extra] || '') }))
  const power = fixColors(r.powerColors, 'note')
  const dis = fixColors(r.dissonantColors, 'risk')
  if (power.length < 3 || dis.length < 3) throw new Error('Analysis was missing colour swatches.')
  return { ...r, powerColors: power, dissonantColors: dis, facial: { ...r.facial, ratio: Number(r.facial?.ratio) || null }, model: MODEL(), generatedAt: new Date().toISOString() }
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

async function runStylist(body, seen) {
  const { text, annotations } = await chat(body)
  collectSeenUrls(annotations, seen)
  return text
}

const MIN_LOOKS = 5
const MAX_ROUNDS = 4

const fullyLinked = (l) => l.pieces.every((p) => p.url)

export async function generateOutfits({ photos, demographics, analysis, stores: wanted, occasions, count = 10, request }) {
  const stores = resolveStores(wanted?.length ? wanted : demographics?.preferredApps || [])
  if (!stores.length) {
    throw new AiError('Select at least one supported store (Myntra, Ajio, Tata CLiQ, Zara, H&M).', 400, 'no_store')
  }
  const { blocks } = imageBlocks(photos)
  const seen = new Set()
  const good = []
  const usedUrls = new Set()
  let failures = 0
  let lastError
  let rounds = 0

  // A look is only ever suggested if ALL THREE pieces have a verified exact product link.
  // Keep asking (with already-used products excluded) until we have enough such looks.
  while (rounds < MAX_ROUNDS && (rounds === 0 || good.length < MIN_LOOKS)) {
    const want = rounds === 0 ? count : Math.max(MIN_LOOKS - good.length + 2, 2)
    const per = 2
    const batches = []
    for (let i = 0; i < want; i += per) batches.push(Math.min(per, want - i))
    const results = await Promise.allSettled(batches.map(async (n, i) => {
      const occ = occasions.filter((_, k) => k % batches.length === i % batches.length).slice(0, 3)
      const text = await runStylist({
        max_tokens: 24000,
        reasoning: { effort: 'medium' },
        tools: [{ type: 'openrouter:web_search', parameters: { engine: 'exa', max_results: 10, max_uses: 12, allowed_domains: allowedDomains(stores) } }],
        messages: [
          { role: 'system', content: STYLIST_SYSTEM },
          { role: 'user', content: [...blocks, { type: 'text', text: stylistUserText({ analysis, demographics, stores, count: n, occasions: occ.length ? occ : occasions, request, avoidUrls: [...usedUrls] }) }] },
        ],
      }, seen)
      return extractJson(text).looks || []
    }))
    failures += results.filter((r) => r.status === 'rejected').length
    lastError = results.find((r) => r.status === 'rejected')?.reason ?? lastError
    const raw = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    const looks = raw.map((l, i) => normalizeLook(l, good.length + i, seen)).filter(Boolean)
    await dropDeadLinks(looks)
    for (const l of looks.filter(fullyLinked)) {
      if (l.pieces.some((p) => usedUrls.has(p.url))) continue
      l.pieces.forEach((p) => usedUrls.add(p.url))
      good.push(l)
    }
    rounds++
  }

  if (!good.length) throw lastError || new AiError('No looks with verified product links could be found for these stores. Try selecting more stores or loosening the budget.', 404, 'no_linked_looks')
  return {
    looks: good, stores, linkedPieces: good.length * 3, totalPieces: good.length * 3,
    shortfall: good.length < MIN_LOOKS ? MIN_LOOKS - good.length : 0,
    rounds, partialFailures: failures, model: MODEL(), generatedAt: new Date().toISOString(),
  }
}

// Last check: a verified-looking URL that the store says does not exist (404/410) is removed.
// Stores that block bots (403 etc.) are not treated as dead.
async function dropDeadLinks(looks) {
  await Promise.all(looks.flatMap((l) => l.pieces).filter((p) => p.url).map(async (p) => {
    try {
      const r = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CLTHY-linkcheck)' }, redirect: 'follow', signal: AbortSignal.timeout(8000) })
      if (r.status === 404 || r.status === 410) p.url = null
    } catch { /* unreachable from here — keep the verified link */ }
  }))
}

function normalizeLook(l, i, seen) {
  const mk = (role, p, extra) => {
    if (!p || !p.name) return null
    const store = normalizeStoreName(p.store) || p.store
    return {
      role, name: String(p.name), brand: String(p.brand || ''), platform: store,
      price: Number.isFinite(Number(p.price)) && p.price !== null ? Math.round(Number(p.price)) : null,
      color: HEX.test(p.color) ? p.color.toUpperCase() : '#7A6B68',
      url: verifyProductUrl({ url: p.productUrl, store, seenUrls: seen }),
      fabric: p.fabric || '', ...extra,
    }
  }
  const top = mk('Topwear', l.top, { neckline: l.top?.neckline || 'Crew' })
  const bottom = mk('Bottomwear', l.bottom, { rise: l.bottom?.rise || 'Mid' })
  const shoe = mk('Footwear', l.shoe, { heel: Number(l.shoe?.heel) || 3 })
  if (!top || !bottom || !shoe) return null
  const pieces = [top, bottom, shoe]
  const priced = pieces.every((p) => p.price != null)
  const subtotal = priced ? pieces.reduce((s, p) => s + p.price, 0) : null
  return {
    id: `ai-${Date.now().toString(36)}-${i}`,
    name: String(l.name || `Look ${i + 1}`), occasion: String(l.occasion || 'Everyday'),
    suitability: Math.max(0, Math.min(100, Math.round(Number(l.suitability) || 85))),
    harmony: String(l.harmony || ''), discount: 0,
    top, bottom, shoe, pieces, subtotal, bundlePrice: subtotal, savings: 0, source: 'ai',
  }
}
