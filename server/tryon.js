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

const isImg = (u) => /^data:image\/(jpeg|png|webp);base64,/.test(u || '')
const REF_LABELS = { 1: 'front face', 2: 'left side profile', 3: 'right side profile', 4: 'full body' }

export async function tryOn({ photos = {}, pieces }) {
  const photo = photos[4]
  if (!isImg(photo)) {
    throw new AiError('Add your own full-body photo in Intake first — the try-on is drawn on your real photo.', 400, 'no_photo')
  }
  const garments = []
  for (const p of (pieces || []).slice(0, 3)) {
    const img = p.image ? await fetchAsDataUrl(p.image) : null
    if (img) garments.push({ role: p.role, name: p.name, img })
  }
  if (!garments.length) throw new AiError('Could not load the product photos for these items from their store pages.', 502, 'no_garment_images')

  // Identity references: every photo of the client (face front, both profiles, full body).
  const refs = [4, 1, 2, 3].filter((k) => isImg(photos[k]))
  const content = [
    ...refs.flatMap((k, i) => [
      { type: 'text', text: `IMAGE ${i + 1} — the client, ${REF_LABELS[k]}${k === 4 ? ' (this is the photo to edit; keep this exact pose and body)' : ' (identity reference: same person)'}:` },
      { type: 'image_url', image_url: { url: photos[k] } },
    ]),
    ...garments.flatMap((g, i) => [
      { type: 'text', text: `IMAGE ${refs.length + i + 1} — ${g.role} to put on the client (${g.name}):` },
      { type: 'image_url', image_url: { url: g.img } },
    ]),
    { type: 'text', text: `Edit IMAGE 1 so the client is wearing the exact garment${garments.length > 1 ? 's' : ''} shown in the other images (${garments.map((g) => g.role.toLowerCase()).join(', ')}). Reproduce each garment faithfully — same colour, fabric look, print, cut, neckline, length and details as its product photo. Keep the client's face, hair, skin tone, body shape and pose exactly as in the client photos (use the face and profile photos to keep the identity accurate); only the clothing changes, and it must fit the body naturally with realistic folds and shadows. Anything not covered by a provided garment stays as in IMAGE 1. Replace the background with a clean, pure white (#FFFFFF) seamless studio background with a soft natural floor shadow, like an e-commerce model photo. Output one photorealistic full-length image, head to toe fully visible, no text or borders.` },
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
