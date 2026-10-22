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

export const requestOutfits = (profile, request) =>
  post('/api/outfits', {
    photos: rasterOnly(profile),
    demographics: profile.demographics,
    analysis: profile.report,
    occasions: undefined,
    request: request || undefined,
  })
