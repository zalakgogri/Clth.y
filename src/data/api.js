import { effectiveOccasion } from './defaultProfile'

// Thin client for the local Express server that talks to the AI model (the API key never reaches the browser).
async function post(path, body) {
  let res
  try {
    res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw Object.assign(new Error('Cannot reach the CLTH.Y server. Start it with `npm run dev`.'), { code: 'offline' })
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.message || `Request failed (${res.status})`), { code: data.error || 'failed' })
  return data
}

const rasterOnly = (profile) =>
  Object.fromEntries(Object.entries(profile.customPhotos).filter(([slot]) => profile.photos[slot]).map(([slot]) => [slot, profile.photos[slot]]))

export const hasRealPhotos = (profile) => Object.keys(profile.customPhotos || {}).length > 0

export const analyzeProfile = (profile) =>
  post('/api/analyze', { photos: rasterOnly(profile), demographics: profile.demographics })

export const MIN_LOOKS = 5
const WAVES = [6, 4, 3] // parallel server calls per wave; each call styles 2 looks

// Styles looks in parallel waves and reports each look as soon as its call finishes, so the page fills
// in progressively instead of waiting for everything. Stops once MIN_LOOKS fully-linked, in-stock looks exist.
export async function requestOutfits(profile, request, onProgress, onLooks, allowUnverified = false) {
  const base = { occasions: [effectiveOccasion(profile.demographics)].filter(Boolean), photos: rasterOnly(profile), demographics: profile.demographics, analysis: profile.report, request: request || undefined, count: 2, allowUnverified }
  const good = []
  const used = new Set()
  let stores = []
  let lastError
  for (let w = 0; w < WAVES.length && good.length < MIN_LOOKS; w++) {
    onProgress?.({ wave: w + 1, found: good.length })
    const avoidUrls = [...used]
    await Promise.all(Array.from({ length: WAVES[w] }, () =>
      post('/api/outfits', { ...base, avoidUrls }).then((out) => {
        stores = out.stores
        const fresh = []
        for (const l of out.looks) {
          if (l.pieces.filter((p) => used.has(p.url)).length >= 2) continue // near-duplicate of a look we already have
          l.pieces.forEach((p) => used.add(p.url))
          fresh.push(l)
        }
        good.push(...fresh)
        if (fresh.length) onLooks?.([...good])
        onProgress?.({ wave: w + 1, found: good.length })
      }).catch((e) => { lastError = e })))
  }
  if (!good.length) throw lastError || Object.assign(new Error('No in-stock looks with verified product links could be found. Try selecting more stores.'), { code: 'no_linked_looks' })
  return { looks: good, stores, linkedPieces: good.length * 3, totalPieces: good.length * 3, shortfall: Math.max(0, MIN_LOOKS - good.length), generatedAt: new Date().toISOString() }
}
