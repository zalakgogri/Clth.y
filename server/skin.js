// Measures the client's skin from the pixels of their own photo (not from the model's impression),
// then derives depth, undertone and a colour season from those numbers.
import jpeg from 'jpeg-js'

const srgb = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
export function rgbToLab(r, g, b) {
  const [R, G, B] = [srgb(r), srgb(g), srgb(b)]
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return { L: 116 * f(Y) - 16, a: 500 * (f(X) - f(Y)), b: 200 * (f(Y) - f(Z)) }
}
const hex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const median = (arr) => { const s = [...arr].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }

// Skin-pixel test in YCbCr (classic, tolerant of most skin tones) plus a sanity range on brightness.
const isSkin = (r, g, b) => {
  const Y = 0.299 * r + 0.587 * g + 0.114 * b
  const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
  const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
  return Y > 35 && Y < 245 && Cb > 72 && Cb < 130 && Cr > 133 && Cr < 180 && r > g && g > b * 0.8
}

// Deterministic face finder: the largest connected patch of skin-coloured pixels on a coarse grid.
function autoFaceBox(img) {
  const { width: W, height: H, data } = img
  const G = 64, gw = G, gh = Math.max(8, Math.round((G * H) / W))
  const mask = new Uint8Array(gw * gh)
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    const x = Math.min(W - 1, Math.floor(((gx + 0.5) / gw) * W)), y = Math.min(H - 1, Math.floor(((gy + 0.5) / gh) * H))
    const i = (y * W + x) * 4
    mask[gy * gw + gx] = isSkin(data[i], data[i + 1], data[i + 2]) ? 1 : 0
  }
  const seen = new Uint8Array(gw * gh)
  let best = null
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || seen[s]) continue
    const stack = [s]; seen[s] = 1
    let n = 0, x0 = gw, x1 = 0, y0 = gh, y1 = 0
    while (stack.length) {
      const p = stack.pop(); const px = p % gw, py = (p / gw) | 0
      n++; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx, ny = py + dy
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue
        const q = ny * gw + nx
        if (mask[q] && !seen[q]) { seen[q] = 1; stack.push(q) }
      }
    }
    if (!best || n > best.n) best = { n, x0, x1, y0, y1 }
  }
  if (!best || best.n < 12) return null
  return { x: best.x0 / gw, y: best.y0 / gh, w: (best.x1 - best.x0 + 1) / gw, h: (best.y1 - best.y0 + 1) / gh }
}

// box: normalised {x,y,w,h} of the FACE in the photo (from the vision model). Samples the cheek/forehead band.
export function measureSkin(dataUrl, box) {
  const m = /^data:image\/jpe?g;base64,(.+)$/.exec(dataUrl || '')
  if (!m) return null
  let img
  try { img = jpeg.decode(Buffer.from(m[1], 'base64'), { useTArray: true, maxMemoryUsageInMB: 256 }) } catch { return null }
  const { width: W, height: H, data } = img
  const b = (box && box.w > 0.05 && box.h > 0.05 ? box : null) || autoFaceBox(img) || { x: 0.25, y: 0.12, w: 0.5, h: 0.45 }
  const x0 = Math.max(0, Math.floor((b.x + b.w * 0.2) * W)), x1 = Math.min(W, Math.ceil((b.x + b.w * 0.8) * W))
  const y0 = Math.max(0, Math.floor((b.y + b.h * 0.3) * H)), y1 = Math.min(H, Math.ceil((b.y + b.h * 0.75) * H))
  const R = [], G = [], B = []
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const i = (y * W + x) * 4
    if (isSkin(data[i], data[i + 1], data[i + 2])) { R.push(data[i]); G.push(data[i + 1]); B.push(data[i + 2]) }
  }
  if (R.length < 150) return null
  const r = median(R), g = median(G), bl = median(B)
  const lab = rgbToLab(r, g, bl)
  return { hex: hex(r, g, bl), ...lab, hue: (Math.atan2(lab.b, lab.a) * 180) / Math.PI, chroma: Math.hypot(lab.a, lab.b), samples: R.length }
}

export function describeSkin(s) {
  const depth = s.L > 74 ? 'very fair' : s.L > 66 ? 'fair' : s.L > 58 ? 'light-medium' : s.L > 50 ? 'medium' : s.L > 42 ? 'tan' : s.L > 33 ? 'deep' : 'very deep'
  // Hue angle of skin in CIELAB: pinker (smaller) = cooler, yellower (larger) = warmer.
  const undertone = s.hue < 49 ? 'cool' : s.hue < 55 ? 'neutral-cool' : s.hue < 61 ? 'neutral' : s.hue < 67 ? 'warm' : 'warm-golden/olive'
  return { depth, undertone }
}

// contrast: 'low' | 'medium' | 'high' (model's read of hair-skin-eye contrast)
export function pickSeason(s, contrast = 'medium') {
  const warm = s.hue >= 61
  const cool = s.hue < 52
  const lightness = s.L > 66 ? 'light' : s.L > 50 ? 'mid' : 'deep'
  const high = contrast === 'high', low = contrast === 'low'
  if (warm) {
    if (lightness === 'light') return high ? 'Spring Bright' : 'Spring Light'
    if (lightness === 'mid') return high ? 'Spring Warm' : low ? 'Autumn Mute' : 'Autumn Warm'
    return 'Autumn Deep'
  }
  if (cool) {
    if (lightness === 'light') return high ? 'Winter Cool' : low ? 'Summer Light' : 'Summer Cool'
    if (lightness === 'mid') return high ? 'Winter Cool' : low ? 'Summer Mute' : 'Summer Cool'
    return high ? 'Winter Deep' : 'Winter Bright'
  }
  // neutral: let depth and contrast decide
  if (lightness === 'light') return low ? 'Summer Light' : high ? 'Spring Bright' : 'Summer Mute'
  if (lightness === 'mid') return low ? 'Summer Mute' : high ? 'Winter Bright' : 'Autumn Mute'
  return high ? 'Winter Deep' : 'Autumn Deep'
}
