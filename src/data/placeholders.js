// Offline-safe editorial portrait placeholders (SVG data URIs) so the app
// works out of the box with no network and no uploaded photos.
const enc = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const SKIN = '#D9A98B'
const HAIR = '#2A1712'

export function portrait({ kind, label, bg = '#EFE6DA', accent = '#4A121A' }) {
  const frame = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#D8CBB9"/></linearGradient></defs>
    <rect width="300" height="400" fill="url(#g)"/>${inner}
    <text x="150" y="388" font-family="Georgia,serif" font-size="11" letter-spacing="3" text-anchor="middle" fill="#7A6B68">${label.toUpperCase()}</text></svg>`

  const faceFront = `
    <path d="M60 400 Q70 300 150 285 Q230 300 240 400Z" fill="${accent}"/>
    <rect x="132" y="240" width="36" height="55" rx="14" fill="${SKIN}"/>
    <path d="M100 150 Q96 70 150 62 Q204 70 200 150 Q198 230 150 252 Q102 230 100 150Z" fill="${SKIN}"/>
    <path d="M92 160 Q80 60 150 52 Q222 60 208 160 Q200 100 150 92 Q100 100 92 160Z" fill="${HAIR}"/>
    <ellipse cx="127" cy="155" rx="9" ry="4" fill="#3B2219"/><ellipse cx="173" cy="155" rx="9" ry="4" fill="#3B2219"/>
    <path d="M140 200 Q150 208 160 200" stroke="#9B4A3A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <line x1="150" y1="158" x2="150" y2="188" stroke="#C48D70" stroke-width="2"/>`
  const faceSide = `
    <path d="M70 400 Q90 300 160 285 Q220 300 230 400Z" fill="${accent}"/>
    <rect x="140" y="240" width="34" height="55" rx="14" fill="${SKIN}"/>
    <path d="M120 150 Q118 70 160 62 Q205 72 196 140 L214 168 L196 176 Q198 232 160 252 Q122 232 120 150Z" fill="${SKIN}"/>
    <path d="M110 170 Q96 62 165 54 Q214 60 198 130 Q170 96 130 128 Q118 150 110 170Z" fill="${HAIR}"/>
    <ellipse cx="184" cy="150" rx="7" ry="3.5" fill="#3B2219"/>`
  const body = (side) => `
    <ellipse cx="150" cy="58" rx="${side ? 20 : 24}" ry="28" fill="${SKIN}"/>
    <path d="M${side ? 128 : 124} 50 Q150 20 ${side ? 172 : 176} 50 Q170 36 150 34 Q132 36 ${side ? 128 : 124} 50Z" fill="${HAIR}"/>
    <rect x="141" y="82" width="18" height="22" fill="${SKIN}"/>
    <path d="M${side ? 118 : 96} 112 Q150 98 ${side ? 182 : 204} 112 L${side ? 176 : 196} 215 Q150 225 ${side ? 124 : 104} 215Z" fill="${accent}"/>
    <path d="M${side ? 124 : 104} 215 L${side ? 176 : 196} 215 L${side ? 182 : 206} 335 L${side ? 156 : 160} 335 L150 245 L${side ? 150 : 140} 335 L${side ? 120 : 94} 335Z" fill="#2B2320"/>
    <rect x="${side ? 118 : 92}" y="335" width="${side ? 40 : 52}" height="14" rx="6" fill="#1E1E1E"/>
    ${side ? '' : '<rect x="156" y="335" width="52" height="14" rx="6" fill="#1E1E1E"/>'}
    ${side ? '' : `<rect x="72" y="118" width="22" height="105" rx="10" fill="${accent}"/><rect x="206" y="118" width="22" height="105" rx="10" fill="${accent}"/>`}`
  if (kind === 'face-front') return enc(frame(faceFront))
  if (kind === 'face-side') return enc(frame(faceSide))
  if (kind === 'body-front') return enc(frame(body(false)))
  if (kind === 'body-side') return enc(frame(body(true)))
  return enc(frame(body(false) + `<path d="M205 118 Q250 170 232 250" stroke="${SKIN}" stroke-width="14" fill="none" stroke-linecap="round"/>`))
}
