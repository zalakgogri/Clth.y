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
const MAX_ROUNDS = 5

// Runs styling rounds until at least MIN_LOOKS fully-linked looks exist (each round is one server call).
export async function requestOutfits(profile, request, onProgress) {
  const base = { occasions: [effectiveOccasion(profile.demographics)].filter(Boolean), photos: rasterOnly(profile), demographics: profile.demographics, analysis: profile.report, request: request || undefined }
  let good = []
  let avoidUrls = []
  let stores = []
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    onProgress?.({ round, found: good.length })
    const out = await post('/api/outfits', { ...base, count: round === 1 ? 10 : Math.max(MIN_LOOKS - good.length + 2, 2), avoidUrls })
    good = [...good, ...out.looks]
    avoidUrls = out.usedUrls
    stores = out.stores
    if (good.length >= MIN_LOOKS) break
  }
  if (!good.length) throw Object.assign(new Error('No looks with verified product links could be found. Try selecting more stores or loosening the budget.'), { code: 'no_linked_looks' })
  return { looks: good, stores, linkedPieces: good.length * 3, totalPieces: good.length * 3, shortfall: Math.max(0, MIN_LOOKS - good.length), generatedAt: new Date().toISOString() }
}
