// Virtual try-on: the client's own full-body photo + the product photos of the exact items they picked
// (taken from the verified product pages) go to an image-editing model, which dresses the person in them.
import { AiError } from './ai.js'

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
export const TRYON_MODEL = () => process.env.TRYON_MODEL || 'google/gemini-3.1-flash-image'
const MAX_BYTES = 4_000_000

const ALLOWED_IMAGE_HOSTS = [/(^|\.)myntassets\.com$/, /(^|\.)tatacliq\.com$/, /(^|\.)ajio\.com$/, /(^|\.)zara\.net$/, /(^|\.)zara\.com$/, /(^|\.)hm\.com$/, /(^|\.)ajioimg\.com$/, /(^|\.)assets-jiocdn\.com$/]

async function fetchAsDataUrl(url) {
  let u
  try { u = new URL(url.startsWith('//') ? `https:${url}` : url.replace(/^http:/, 'https:')) } catch { return null }
  if (u.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.some((re) => re.test(u.hostname))) return null
  try {
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' }, signal: AbortSignal.timeout(10000) })
    if (!r.ok) return null
    const type = (r.headers.get('content-type') || '').split(';')[0]
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return null
    const buf = Buffer.from(await r.arrayBuffer())
    if (!buf.length || buf.length > MAX_BYTES) return null
    return `data:${type};base64,${buf.toString('base64')}`
  } catch { return null }
}

export async function tryOn({ photo, pieces }) {
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(photo || '')) {
    throw new AiError('Add your own full-body photo in Intake first — the try-on is drawn on your real photo.', 400, 'no_photo')
  }
  const garments = []
  for (const p of (pieces || []).slice(0, 3)) {
    const img = p.image ? await fetchAsDataUrl(p.image) : null
    if (img) garments.push({ role: p.role, name: p.name, img })
  }
  if (!garments.length) throw new AiError('Could not load the product photos for these items from their store pages.', 502, 'no_garment_images')

  const content = [
    { type: 'text', text: 'IMAGE 1 — the client (keep this exact person):' },
    { type: 'image_url', image_url: { url: photo } },
    ...garments.flatMap((g, i) => [
      { type: 'text', text: `IMAGE ${i + 2} — ${g.role} to put on the client (${g.name}):` },
      { type: 'image_url', image_url: { url: g.img } },
    ]),
    { type: 'text', text: `Edit IMAGE 1 so the client is wearing the exact garment${garments.length > 1 ? 's' : ''} shown in the other images (${garments.map((g) => g.role.toLowerCase()).join(', ')}). Reproduce each garment faithfully — same colour, fabric look, print, cut, neckline, length and details as its product photo. Keep the client's face, hair, skin tone, body shape, pose, framing and background exactly as in IMAGE 1; only the clothing changes, and it must fit the body naturally with realistic folds and shadows. Anything not covered by a provided garment stays as in IMAGE 1. Output one photorealistic full-length image, no text or borders.` },
  ]

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'X-Title': 'CLTH.Y' },
    body: JSON.stringify({ model: TRYON_MODEL(), modalities: ['image', 'text'], messages: [{ role: 'user', content }] }),
    signal: AbortSignal.timeout(240000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new AiError(data.error?.message || `Try-on request failed (${res.status})`, res.status === 429 ? 429 : 502, 'tryon_failed')
  const out = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
  if (!out) throw new AiError('The image model returned no picture (it may have declined this photo). Try again or use a clearer full-body photo.', 502, 'no_image')
  return { image: out, used: garments.map((g) => g.role), skipped: (pieces || []).length - garments.length, model: TRYON_MODEL() }
}
