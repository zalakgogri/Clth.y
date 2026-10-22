import { retailUrl } from './retail'

const piece = (role, name, brand, platform, price, color, extra = {}) => ({
  role,
  name,
  brand,
  platform,
  price,
  color,
  url: retailUrl(platform, `${brand} ${name}`),
  ...extra,
})

const RAW = [
  {
    id: 'velvet-boardroom', name: 'Velvet Boardroom', occasion: 'Smart Casual / Workwear', suitability: 98, discount: 12,
    harmony: 'Sweetheart-cut burgundy charmeuse opens the compact middle-third; a high-rise espresso trouser stretches the Wave torso and brushed-gold hardware echoes the skin\'s warmth.',
    top: piece('Topwear', 'Sweetheart Satin Blouse', 'Mango', 'Myntra', 3290, '#5B141C', { neckline: 'Sweetheart', fabric: 'Satin charmeuse' }),
    bottom: piece('Bottomwear', 'High-Rise Pleated Trousers', 'Zara', 'Zara', 3990, '#3B2219', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Gold-Buckle Block Heel Pump', 'Charles & Keith', 'Tata CLiQ', 4590, '#D4AF37', { heel: 5 }),
  },
  {
    id: 'emerald-brunch', name: 'Emerald Brunch', occasion: 'Brunch & Day Out', suitability: 97, discount: 10,
    harmony: 'Emerald Forest is the complementary contrast to the warm undertone — skin reads luminous. A boatneck widens the mid-face visually while a fluid midi skirt follows Wave movement.',
    top: piece('Topwear', 'Boatneck Modal Top', 'H&M', 'H&M', 1799, '#134E39', { neckline: 'Boatneck', fabric: 'Modal crepe' }),
    bottom: piece('Bottomwear', 'High-Waist Satin Midi Skirt', 'Vero Moda', 'Myntra', 2499, '#C45D36', { rise: 'High', fabric: 'Satin charmeuse' }),
    shoe: piece('Footwear', 'Tan Leather Slingback Flat', 'Aldo', 'Ajio', 3299, '#DDA15E', { heel: 2 }),
  },
  {
    id: 'terracotta-edit', name: 'Terracotta Edit', occasion: 'Smart Casual / Workwear', suitability: 96, discount: 11,
    harmony: 'Terracotta Amber mirrors the golden-olive base for a seamless, monochrome-adjacent line. High-waist wide-leg drape lengthens the skeleton without adding bulk.',
    top: piece('Topwear', 'Cowl-Neck Silk Blend Top', 'Zara', 'Zara', 3490, '#C45D36', { neckline: 'Cowl', fabric: 'Mulberry silk' }),
    bottom: piece('Bottomwear', 'Wide-Leg High-Rise Trousers', 'AND', 'Tata CLiQ', 3199, '#3B2219', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Espresso Pointed Mule', 'Steve Madden', 'Myntra', 4199, '#3B2219', { heel: 6 }),
  },
  {
    id: 'ochre-afternoon', name: 'Golden Ochre Afternoon', occasion: 'Brunch & Day Out', suitability: 95, discount: 9,
    harmony: 'Ochre brightens the eye area; a cowl neckline softens the face thirds. Deep emerald bottoms ground the warmth with chromatic contrast.',
    top: piece('Topwear', 'Cowl Drape Blouse', 'Vero Moda', 'Myntra', 1999, '#DDA15E', { neckline: 'Cowl', fabric: 'Satin charmeuse' }),
    bottom: piece('Bottomwear', 'High-Rise Straight Fluid Pants', 'H&M', 'H&M', 2299, '#134E39', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Brushed-Gold Strappy Sandal', 'Inc.5', 'Ajio', 2790, '#D4AF37', { heel: 4 }),
  },
  {
    id: 'noir-evening', name: 'Espresso Noir Evening', occasion: 'Evening & Cocktail', suitability: 97, discount: 14,
    harmony: 'Espresso Noir replaces stark black for softer contrast. A sweetheart bodice plus high-rise satin skirt creates a defined waistline that suits the Soft Classic frame.',
    top: piece('Topwear', 'Sweetheart Corset Satin Top', 'Zara', 'Zara', 3990, '#3B2219', { neckline: 'Sweetheart', fabric: 'Satin charmeuse' }),
    bottom: piece('Bottomwear', 'Bias-Cut Satin Midi Skirt', 'Mango', 'Myntra', 4590, '#5B141C', { rise: 'High', fabric: 'Satin charmeuse' }),
    shoe: piece('Footwear', 'Gold Ankle-Strap Stiletto', 'Charles & Keith', 'Tata CLiQ', 5990, '#D4AF37', { heel: 8 }),
  },
  {
    id: 'burgundy-wedding', name: 'Burgundy Wedding Guest', occasion: 'Wedding Guest', suitability: 98, discount: 15,
    harmony: 'Velvet Burgundy deepens warmth and lifts the lips; boatneck drape frames the collarbone, while a gold embroidered border ties to the antique brushed-gold hardware rule.',
    top: piece('Topwear', 'Boatneck Silk Kurta Top', 'Libas', 'Ajio', 2790, '#5B141C', { neckline: 'Boatneck', fabric: 'Mulberry silk' }),
    bottom: piece('Bottomwear', 'High-Waist Palazzo with Gold Border', 'Biba', 'Tata CLiQ', 2990, '#C45D36', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Gold Embellished Kolhapuri Heel', 'Fabindia', 'Ajio', 2490, '#D4AF37', { heel: 5 }),
  },
  {
    id: 'amber-airport', name: 'Amber Airport', occasion: 'Travel & Airport', suitability: 94, discount: 8,
    harmony: 'Modal crepe moves with the Wave body, so comfort doesn\'t cost line. Ochre and espresso keep the palette inside the power range even in relaxed travel pieces.',
    top: piece('Topwear', 'Soft Boatneck Modal Tee', 'H&M', 'H&M', 999, '#DDA15E', { neckline: 'Boatneck', fabric: 'Modal crepe' }),
    bottom: piece('Bottomwear', 'High-Rise Drape Joggers', 'Zara', 'Zara', 2590, '#3B2219', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Cream-Tan Leather Sneaker', 'Puma', 'Myntra', 3999, '#DDA15E', { heel: 3 }),
  },
  {
    id: 'forest-date', name: 'Forest Date Night', occasion: 'Date Night', suitability: 96, discount: 12,
    harmony: 'A cowl-neck emerald top lights the complexion; high-waist burgundy satin trousers form a rich analogous pairing in the warm-deep register.',
    top: piece('Topwear', 'Emerald Cowl Silk Top', 'AND', 'Tata CLiQ', 3490, '#134E39', { neckline: 'Cowl', fabric: 'Mulberry silk' }),
    bottom: piece('Bottomwear', 'High-Waist Satin Trousers', 'Mango', 'Myntra', 3590, '#5B141C', { rise: 'High', fabric: 'Satin charmeuse' }),
    shoe: piece('Footwear', 'Antique Gold Block Sandal', 'Aldo', 'Ajio', 4290, '#D4AF37', { heel: 6 }),
  },
  {
    id: 'ochre-office', name: 'Imperial Gold Office', occasion: 'Smart Casual / Workwear', suitability: 95, discount: 10,
    harmony: 'Gold-toned top with sweetheart hem for soft authority; espresso high-rise pencil skirt defines the waist and respects the Soft Classic frame.',
    top: piece('Topwear', 'Sweetheart Neck Satin Shell', 'H&M', 'H&M', 1999, '#D4AF37', { neckline: 'Sweetheart', fabric: 'Satin charmeuse' }),
    bottom: piece('Bottomwear', 'High-Rise Crepe Pencil Skirt', 'Zara', 'Zara', 2990, '#3B2219', { rise: 'High', fabric: 'Modal crepe' }),
    shoe: piece('Footwear', 'Burgundy Kitten Heel Pump', 'Aldo', 'Myntra', 3590, '#5B141C', { heel: 4 }),
  },
  {
    id: 'terracotta-cocktail', name: 'Terracotta Cocktail', occasion: 'Evening & Cocktail', suitability: 97, discount: 13,
    harmony: 'Terracotta satin under evening light is the single most flattering warm tone for this undertone. Boatneck keeps the neckline calm while the skirt provides fluid motion.',
    top: piece('Topwear', 'Boatneck Satin Bodysuit', 'Mango', 'Myntra', 3190, '#C45D36', { neckline: 'Boatneck', fabric: 'Satin charmeuse' }),
    bottom: piece('Bottomwear', 'High-Rise Silk Slip Skirt', 'Zara', 'Zara', 4290, '#134E39', { rise: 'High', fabric: 'Mulberry silk' }),
    shoe: piece('Footwear', 'Espresso Strappy Heel', 'Charles & Keith', 'Tata CLiQ', 4990, '#3B2219', { heel: 7 }),
  },
]

export const OUTFITS = RAW.map((o) => {
  const pieces = [o.top, o.bottom, o.shoe]
  const subtotal = pieces.reduce((s, p) => s + p.price, 0)
  const bundlePrice = Math.round(subtotal * (1 - o.discount / 100))
  return { ...o, pieces, subtotal, bundlePrice, savings: subtotal - bundlePrice }
})

export const OUTFIT_OCCASIONS = ['All', ...Array.from(new Set(RAW.map((o) => o.occasion)))]

export const getOutfit = (id, generated = []) => [...generated, ...OUTFITS].find((o) => o.id === id)

export const PROMPT_SUGGESTIONS = [
  'Wedding guest in warm jewel tones',
  'Airport comfort that still looks polished',
  'Sweetheart neckline for a cocktail evening',
  'Workwear under ₹10,000 in burgundy',
]

// Natural-language prompt → ranked looks with a reasoning trace.
export function curateByPrompt(prompt) {
  const q = prompt.toLowerCase()
  const rules = [
    { re: /wedding|sangeet|festive|ethnic/, occasion: 'Wedding Guest', why: 'Detected festive intent → prioritising embellished, gold-hardware looks.' },
    { re: /airport|travel|flight|comfort/, occasion: 'Travel & Airport', why: 'Detected comfort/travel intent → prioritising modal crepe drape.' },
    { re: /cocktail|evening|party|night out/, occasion: 'Evening & Cocktail', why: 'Detected evening intent → prioritising satin & higher heels.' },
    { re: /date|dinner|romantic/, occasion: 'Date Night', why: 'Detected date intent → prioritising cowl necklines & rich tones.' },
    { re: /work|office|meeting|interview|corporate/, occasion: 'Smart Casual / Workwear', why: 'Detected workwear intent → prioritising structured-soft tailoring.' },
    { re: /brunch|day out|casual|lunch/, occasion: 'Brunch & Day Out', why: 'Detected daytime intent → prioritising ochre/emerald day palettes.' },
  ]
  const trace = ['Parsed request against your DOES Passport (warm undertone · compact mid-third · Wave frame).']
  const hit = rules.filter((r) => r.re.test(q))
  hit.forEach((r) => trace.push(r.why))
  const colorWords = { burgundy: '#5B141C', emerald: '#134E39', green: '#134E39', terracotta: '#C45D36', gold: '#D4AF37', ochre: '#DDA15E', brown: '#3B2219', espresso: '#3B2219' }
  const wantedColors = Object.entries(colorWords).filter(([w]) => q.includes(w)).map(([, h]) => h)
  if (wantedColors.length) trace.push('Colour request matched to your 6 power swatches.')
  const neck = ['sweetheart', 'cowl', 'boatneck'].find((n) => q.includes(n))
  if (neck) trace.push(`Neckline "${neck}" is on your prescription list — boosting matches.`)
  const cap = (q.match(/(?:under|below|within)\s*₹?\s*([\d,]+)/) || [])[1]
  const budget = cap ? Number(cap.replace(/,/g, '')) : null
  if (budget) trace.push(`Budget ceiling ₹${budget.toLocaleString('en-IN')} applied to bundle price.`)
  if (/white|neon|pastel/.test(q)) trace.push('Note: stark white / neon / icy pastels are on your dissonant list — substituting power tones.')

  const scored = OUTFITS.map((o) => {
    let s = o.suitability
    if (hit.some((r) => r.occasion === o.occasion)) s += 20
    if (wantedColors.some((c) => o.pieces.some((p) => p.color === c))) s += 8
    if (neck && o.top.neckline.toLowerCase() === neck) s += 8
    if (budget && o.bundlePrice > budget) s -= 40
    return { o, s }
  }).sort((a, b) => b.s - a.s)
  trace.push(`Ranked ${OUTFITS.length} looks; returning the top 10 by harmony score.`)
  return { looks: scored.map((x) => x.o), trace }
}
