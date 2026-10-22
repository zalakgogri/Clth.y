import { retailUrl } from './retail'
import { DEFAULT_DIAGNOSTIC_REPORT as R } from './defaultProfile'

const mk = (id, role, name, brand, platform, price, color, extra) => ({
  id, role, name, brand, platform, price, color, url: retailUrl(platform, `${brand} ${name}`), ...extra,
})

export const STUDIO_TOPS = [
  mk('t1', 'Topwear', 'Sweetheart Satin Blouse', 'Mango', 'Myntra', 3290, '#5B141C', { neckline: 'Sweetheart' }),
  mk('t2', 'Topwear', 'Boatneck Modal Top', 'H&M', 'H&M', 1799, '#134E39', { neckline: 'Boatneck' }),
  mk('t3', 'Topwear', 'Cowl-Neck Silk Top', 'Zara', 'Zara', 3490, '#C45D36', { neckline: 'Cowl' }),
  mk('t4', 'Topwear', 'Cowl Drape Blouse', 'Vero Moda', 'Myntra', 1999, '#DDA15E', { neckline: 'Cowl' }),
  mk('t5', 'Topwear', 'Sweetheart Corset Top', 'Zara', 'Zara', 3990, '#3B2219', { neckline: 'Sweetheart' }),
  mk('t6', 'Topwear', 'Satin Shell with Gold Trim', 'H&M', 'H&M', 1999, '#D4AF37', { neckline: 'Sweetheart' }),
  mk('t7', 'Topwear', 'Classic Crew Tee', 'Uniqlo', 'Myntra', 990, '#3B2219', { neckline: 'Crew' }),
  mk('t8', 'Topwear', 'High Mock-Neck Knit', 'AND', 'Tata CLiQ', 2490, '#5B141C', { neckline: 'Mock' }),
  mk('t9', 'Topwear', 'Icy Lilac Poplin Shirt', 'Zara', 'Zara', 2290, '#E1BEE7', { neckline: 'Collar' }),
  mk('t10', 'Topwear', 'Optic White V-Neck', 'H&M', 'H&M', 899, '#FFFFFF', { neckline: 'V-neck' }),
]

export const STUDIO_BOTTOMS = [
  mk('b1', 'Bottomwear', 'High-Rise Pleated Trousers', 'Zara', 'Zara', 3990, '#3B2219', { rise: 'High' }),
  mk('b2', 'Bottomwear', 'High-Waist Satin Midi Skirt', 'Vero Moda', 'Myntra', 2499, '#C45D36', { rise: 'High' }),
  mk('b3', 'Bottomwear', 'Wide-Leg High-Rise Trousers', 'AND', 'Tata CLiQ', 3199, '#3B2219', { rise: 'High' }),
  mk('b4', 'Bottomwear', 'High-Rise Fluid Pants', 'H&M', 'H&M', 2299, '#134E39', { rise: 'High' }),
  mk('b5', 'Bottomwear', 'Bias-Cut Satin Skirt', 'Mango', 'Myntra', 4590, '#5B141C', { rise: 'High' }),
  mk('b6', 'Bottomwear', 'High-Waist Palazzo', 'Biba', 'Tata CLiQ', 2990, '#C45D36', { rise: 'High' }),
  mk('b7', 'Bottomwear', 'High-Rise Silk Slip Skirt', 'Zara', 'Zara', 4290, '#134E39', { rise: 'High' }),
  mk('b8', 'Bottomwear', 'Mid-Rise Straight Chinos', 'Levi\'s', 'Myntra', 2799, '#DDA15E', { rise: 'Mid' }),
  mk('b9', 'Bottomwear', 'Low-Rise Cargo Pants', 'H&M', 'H&M', 2499, '#B0BEC5', { rise: 'Low' }),
  mk('b10', 'Bottomwear', 'Low-Rise Neon Mini', 'Zara', 'Zara', 1990, '#00E676', { rise: 'Low' }),
]

export const STUDIO_SHOES = [
  mk('s1', 'Footwear', 'Gold-Buckle Block Heel Pump', 'Charles & Keith', 'Tata CLiQ', 4590, '#D4AF37', { heel: 5 }),
  mk('s2', 'Footwear', 'Tan Slingback Flat', 'Aldo', 'Ajio', 3299, '#DDA15E', { heel: 2 }),
  mk('s3', 'Footwear', 'Espresso Pointed Mule', 'Steve Madden', 'Myntra', 4199, '#3B2219', { heel: 6 }),
  mk('s4', 'Footwear', 'Gold Strappy Sandal', 'Inc.5', 'Ajio', 2790, '#D4AF37', { heel: 4 }),
  mk('s5', 'Footwear', 'Gold Ankle-Strap Stiletto', 'Charles & Keith', 'Tata CLiQ', 5990, '#D4AF37', { heel: 8 }),
  mk('s6', 'Footwear', 'Burgundy Kitten Heel', 'Aldo', 'Myntra', 3590, '#5B141C', { heel: 4 }),
  mk('s7', 'Footwear', 'Cream-Tan Leather Sneaker', 'Puma', 'Myntra', 3999, '#DDA15E', { heel: 3 }),
  mk('s8', 'Footwear', 'Antique Gold Block Sandal', 'Aldo', 'Ajio', 4290, '#D4AF37', { heel: 6 }),
  mk('s9', 'Footwear', 'Sleet Grey Platform Sneaker', 'Nike', 'Myntra', 5499, '#B0BEC5', { heel: 4 }),
  mk('s10', 'Footwear', 'Stark White Skyscraper Heel', 'Zara', 'Zara', 3990, '#FFFFFF', { heel: 11 }),
]

const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const dist = (a, b) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)]
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))

// 0..100: how close a colour sits to the power palette vs the dissonant palette.
export function colorScore(hex) {
  const pw = Math.min(...R.powerColors.map((c) => dist(hex, c.hex)))
  const ds = Math.min(...R.dissonantColors.map((c) => dist(hex, c.hex)))
  if (ds < 70) return clamp(30 - (70 - ds) / 3)
  return clamp(100 - Math.max(0, pw - 25) * 0.45)
}

const NECK = { Sweetheart: 100, Cowl: 97, Boatneck: 95, 'V-neck': 62, Collar: 50, Crew: 42, Mock: 25 }
const RISE = { High: 100, Mid: 62, Low: 28 }

export function calculateHarmonyMetrics(top, bottom, shoe) {
  const colors = [top, bottom, shoe].map((i) => colorScore(i.color))
  const color = clamp(colors.reduce((a, b) => a + b, 0) / 3)
  const neckline = NECK[top.neckline] ?? 55
  const waist = RISE[bottom.rise] ?? 55
  const h = shoe.heel
  const heel = h >= 3 && h <= 7 ? 100 : h === 2 ? 82 : h === 8 ? 78 : clamp(100 - Math.abs(h - 5) * 14)
  const overall = clamp(color * 0.35 + neckline * 0.25 + waist * 0.25 + heel * 0.15)

  const notes = []
  if (color >= 80) notes.push('Palette sits inside your power-colour range.')
  else if (color < 55) notes.push('One or more pieces drift toward your dissonant colours.')
  if (neckline >= 90) notes.push(`${top.neckline} neckline matches your compact middle-third prescription.`)
  else if (neckline < 60) notes.push(`${top.neckline} neckline shortens the 0.88 mid-face; try sweetheart, cowl or boatneck.`)
  if (waist >= 90) notes.push('High rise respects the Wave frame and lengthens the torso.')
  else notes.push(`${bottom.rise} rise breaks the Wave waistline; high-waist is prescribed.`)
  if (heel >= 90) notes.push(`${h} cm heel is inside your ergonomic 3–7 cm band.`)
  else notes.push(`${h} cm heel is outside the 3–7 cm ergonomic band.`)
  return { color, neckline, waist, heel, overall, notes }
}
