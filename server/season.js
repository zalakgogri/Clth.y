// Module 1 of the client's Diagnostic Feature Extraction Matrix (Personal Color), computed from evidence —
// not guessed. Method follows the 12-season wheel explained in the referenced colour-analysis video:
//   undertone = a vote of six indicators (skin tone, eyes, hair, vein colour, sun reaction, gold-vs-silver)
//   value     = depth of skin, hair and eyes      contrast = value difference between hair/eyes and skin
//   chroma    = clear/bright vs soft/muted        season   = where these land on the wheel
import { SEASONS } from './palettes.js'

const HAIR_L = { black: 12, 'dark brown': 22, brown: 32, chestnut: 36, auburn: 38, red: 40, 'ash brown': 42, caramel: 50, 'dark blonde': 58, 'golden blonde': 70, blonde: 72, grey: 65, white: 85 }
const HAIR_TONE = { black: 'neutral', grey: 'cool', white: 'cool', 'ash brown': 'cool', blonde: 'cool', 'dark blonde': 'cool', chestnut: 'warm', caramel: 'warm', 'rich brown': 'warm', brown: 'neutral', 'dark brown': 'neutral', auburn: 'warm', red: 'warm', 'golden blonde': 'warm' }
const EYE_L = { black: 12, 'dark brown': 22, brown: 32, hazel: 45, amber: 48, green: 50, blue: 55, grey: 58 }
const EYE_TONE = { grey: 'cool', green: 'cool', blue: 'cool', hazel: 'warm', amber: 'warm', brown: 'warm', 'dark brown': 'warm', black: 'warm' } // per the video's rule

const sgn = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0)

export function assessModule1({ skin, appearance = {}, selfCheck = {} }) {
  const hair = appearance.hair?.visible === false ? null : appearance.hair
  const eyes = appearance.eyes?.visible === false ? null : appearance.eyes
  const hairKey = String(hair?.color || '').toLowerCase()
  const eyeKey = String(eyes?.color || '').toLowerCase()

  // ── Temperature: six-indicator vote ───────────────────────────────
  const votes = []
  const add = (indicator, source, result, note) => result && votes.push({ indicator, source, result, note })
  // Deeper skin photographs redder, so its warm/cool boundary sits a few degrees lower.
  const mid = skin.L < 50 ? 51 : 55
  const skinTone = skin.hue < mid - 5 ? 'cool' : skin.hue > mid + 5 ? 'warm' : 'neutral'
  add('Skin tone (photo)', 'photo', skinTone, `Skin hue ${skin.hue.toFixed(0)}° — ${skinTone === 'cool' ? 'pink/red leaning' : skinTone === 'warm' ? 'yellow/golden leaning' : 'in between'}`)
  add('Eyes (photo)', 'photo', EYE_TONE[eyeKey], eyeKey && `${eyeKey} eyes`)
  add('Hair (photo)', 'photo', HAIR_TONE[hairKey] || (hair?.tone && ['warm', 'cool', 'neutral'].includes(hair.tone) ? hair.tone : null), hairKey && `${hairKey} hair`)
  const vein = { green: 'warm', blue: 'cool', mix: 'neutral' }[selfCheck.vein]
  add('Wrist veins (you)', 'you', vein, selfCheck.vein && `veins look ${selfCheck.vein}`)
  const sun = { tans: 'warm', burns: 'cool' }[selfCheck.sun]
  add('Sun reaction (you)', 'you', sun, selfCheck.sun && (selfCheck.sun === 'tans' ? 'tans easily, rarely burns' : 'burns easily, rarely tans'))
  const metal = { gold: 'warm', silver: 'cool', both: 'neutral' }[selfCheck.metal]
  add('Gold vs silver (you)', 'you', metal, selfCheck.metal && `${selfCheck.metal} flatters most`)
  const count = (r) => votes.filter((v) => v.result === r).length
  const warm = count('warm'), cool = count('cool'), neutral = count('neutral')
  const diff = warm - cool
  const temperature = diff >= 2 ? 'warm' : diff <= -2 ? 'cool' : 'neutral'
  const lean = sgn(diff) || sgn(skin.hue - mid) || 1 // tie-break on skin hue; warm if still equal

  // ── Value (depth) & contrast ─────────────────────────────────────
  const hairL = HAIR_L[hairKey] ?? null
  const eyeL = EYE_L[eyeKey] ?? null
  const parts = [skin.L, hairL, eyeL].filter((v) => v != null)
  const depthL = parts.reduce((a, b) => a + b, 0) / parts.length
  const value = depthL > 58 ? 'light' : depthL > 40 ? 'medium' : 'deep'
  const diffs = [hairL, eyeL].filter((v) => v != null).map((v) => Math.abs(skin.L - v))
  const dL = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null
  const contrast = dL == null ? 'medium' : dL >= 33 ? 'high' : dL >= 18 ? 'medium' : 'low'

  // ── Chroma (clear vs soft) ───────────────────────────────────────
  let c = 0
  if (skin.chroma >= 26) c += 1; else if (skin.chroma <= 18) c -= 1
  if (eyes?.clarity === 'clear') c += 1; else if (eyes?.clarity === 'soft') c -= 1
  if (contrast === 'high') c += 1; else if (contrast === 'low') c -= 1
  if (hair?.tone === 'cool' && /ash|grey|white/.test(hairKey)) c -= 1
  const chroma = c >= 2 ? 'bright' : c <= -1 ? 'soft' : 'medium'

  // ── Place on the 12-season wheel ─────────────────────────────────
  const family = temperature === 'warm' || (temperature === 'neutral' && lean > 0) ? 'warm' : 'cool'
  let season
  if (family === 'cool') {
    if (chroma === 'bright' || contrast === 'high' || value === 'deep') season = chroma === 'bright' && value !== 'deep' ? 'Bright Winter' : value === 'deep' ? 'Dark Winter' : 'True Winter'
    else season = value === 'light' ? 'Light Summer' : chroma === 'soft' ? 'Soft Summer' : 'True Summer'
  } else {
    const s = (value === 'light' ? 1 : 0) + (chroma === 'bright' ? 1 : 0) + (contrast === 'high' ? 0.5 : 0) - (value === 'deep' ? 1 : 0) - (chroma === 'soft' ? 1 : 0)
    if (s >= 0.5) season = chroma === 'bright' ? 'Bright Spring' : value === 'light' ? 'Light Spring' : 'True Spring'
    else season = chroma === 'soft' ? 'Soft Autumn' : value === 'deep' ? 'Dark Autumn' : 'True Autumn'
  }
  if (temperature === 'neutral' && chroma === 'soft') season = family === 'warm' ? 'Soft Autumn' : 'Soft Summer'

  return { votes, tally: { warm, cool, neutral }, temperature, lean: lean > 0 ? 'warm' : 'cool', value, contrast, chroma, season, numbers: { skinL: +skin.L.toFixed(1), hairL, eyeL, depthL: +depthL.toFixed(1), contrastDelta: dL == null ? null : +dL.toFixed(1), skinChroma: +skin.chroma.toFixed(1) } }
}

// ── Plain-language Module 1 rows, written from the matrix's own classification options and impact columns ──
const TEMP = {
  warm: ['Warm (Yellow/Peach)', 'Your skin, eyes and hair lean golden — yellow and peach tones sit naturally in your colouring.', 'Choose gold-toned hardware and warm, yellow-based colours; skip icy blue-pinks.', 'Pick a warm (yellow/peach) foundation, peach-coral blush and warm lip tones.'],
  cool: ['Cool (Pink/Blue)', 'Your colouring leans pink and blue, so cool, blue-based colours look clean on you.', 'Choose silver-toned hardware and blue-based colours; avoid orange and mustard near the face.', 'Pick a pink-neutral foundation, rose or berry blush and blue-based lip colours.'],
  neutral: ['Neutral', 'Your undertone sits between warm and cool, so you can borrow from both sides if the shade is the right depth.', 'Gold and silver both work; choose colours by depth and softness rather than strict warm/cool.', 'A neutral foundation base; rosy-peach blush and lip shades work well.'],
}
const CHROMA = {
  bright: ['Vivid/Bright', 'Your colouring is clear and strong, so it carries bright, saturated colours without being swallowed.', 'You can wear high-saturation colours; muted, greyed shades will look dull on you.', 'Saturated lip colour and defined colour work are worth it.'],
  medium: ['Medium/Moderate', 'Your colouring is balanced — not very bright, not very soft.', 'Medium-saturation colours are safest; very neon or very greyed shades are the extremes to avoid.', 'Medium-intensity lips and blush — neither sheer nor very bold.'],
  soft: ['Soft/Muted (Grey-cast)', 'Your colouring is gentle and slightly muted, so softer, greyed colours blend with you.', 'Prefer soft, muted, earthy or dusty colours; bright neon colours can overpower you.', 'Sheer, “my lips but better” lip colours and soft blended eyeshadow.'],
}
const VALUE = {
  light: ['High Lightness (Light)', 'Your overall colouring is light, so light and mid-tone colours suit you best.', 'Place lighter colours near the face; very dark colours work better lower down or as accents.', 'Light eyeshadow depth, soft contour and lightly tinted brows.'],
  medium: ['Medium (Soft/Mute)', 'Your colouring has medium depth — neither pale nor very dark.', 'Mid-tone colours are your base; pale and very dark colours work as accents.', 'Medium eyeshadow depth, moderate contour and natural brow tint.'],
  deep: ['Low (Deep)', 'Your colouring is deep, so rich, deeper colours look balanced on you.', 'Deep and rich colours suit you; very pale pastels can look washed out.', 'Deeper eyeshadow, stronger contour and darker brow tint.'],
}
const CONTRAST = {
  high: ['High Contrast', 'There is a strong difference between your hair/eyes and your skin.', 'Colour-blocking and strong light-dark pairings suit you.', 'Sharper eyeliner and a lip colour that contrasts with your skin.'],
  medium: ['Medium Contrast', 'The difference between your hair/eyes and skin is moderate.', 'Moderate colour contrast works; avoid extremes of stark black-and-white or all-pastel.', 'Softly defined liner and a lip colour a few shades from skin tone.'],
  low: ['Low / Monochromatic', 'Your hair, eyes and skin are close in depth, so you look best in blended colours.', 'Tonal, same-family outfits and gentle print contrast.', 'Soft liner and tonal lip and blush.'],
}
const ACHROMATIC = {
  'Light Spring': ['Soft Off-white', 'Ivory and cream; keep black away from the face.'], 'True Spring': ['Soft Off-white', 'Warm ivory and camel; brown in place of black.'], 'Bright Spring': ['Pure White', 'Clear warm white; black only in small doses.'],
  'Light Summer': ['Soft Off-white', 'Soft white and light grey.'], 'True Summer': ['Greyish/Oatmeal', 'Soft white, blue-grey and navy in place of black.'], 'Soft Summer': ['Greyish/Oatmeal', 'Oatmeal, soft grey and charcoal.'],
  'Soft Autumn': ['Greyish/Oatmeal', 'Oatmeal, beige and soft brown.'], 'True Autumn': ['Soft Off-white', 'Cream, camel and dark chocolate in place of black.'], 'Dark Autumn': ['Soft Off-white', 'Cream and espresso; black only softened.'],
  'Bright Winter': ['Pure White', 'Pure white and jet black both work.'], 'True Winter': ['Pure White', 'Pure white, charcoal and black.'], 'Dark Winter': ['Jet Black', 'Black, charcoal and crisp white.'],
}

export function module1Rows(a) {
  const t = TEMP[a.temperature], ch = CHROMA[a.chroma], v = VALUE[a.value], c = CONTRAST[a.contrast], ac = ACHROMATIC[a.season] || ['Soft Off-white', '']
  const tally = `${a.tally.warm} warm · ${a.tally.cool} cool · ${a.tally.neutral} neutral of ${a.votes.length} indicators`
  const n = a.numbers
  return {
    'Temperature / Undertone': { classification: a.temperature === 'neutral' ? `Neutral (leans ${a.lean})` : t[0], plain: t[1], evidence: `Undertone vote: ${tally}.`, confidence: a.votes.length >= 5 ? 'high' : a.votes.length >= 3 ? 'medium' : 'low', clothing: t[2], makeup: t[3] },
    'Saturation Sensitivity (Chroma)': { classification: ch[0], plain: ch[1], evidence: `Skin chroma ${n.skinChroma}; eye clarity and hair/skin contrast considered.`, confidence: 'medium', clothing: ch[2], makeup: ch[3] },
    'Brightness / Value (Lightness)': { classification: v[0], plain: v[1], evidence: `Depth of skin (L* ${n.skinL}), hair and eyes averages ${n.depthL}.`, confidence: 'medium', clothing: v[2], makeup: v[3] },
    'Contrast Tolerance': { classification: c[0], plain: c[1], evidence: n.contrastDelta == null ? 'Hair and eyes not clearly visible — estimated.' : `Hair/eye to skin lightness difference ≈ ${n.contrastDelta}.`, confidence: n.contrastDelta == null ? 'low' : 'medium', clothing: c[2], makeup: c[3] },
    'Achromatic Base Affinity': { classification: ac[0], plain: `Your best neutrals follow your ${a.season} season.`, evidence: `Derived from your season (${a.season}).`, confidence: 'medium', clothing: ac[1], makeup: 'Highlighter: pearl for cool/light, champagne for neutral, bronze/gold for warm/deep.' },
  }
}

export function paletteFor(season, a) {
  const pal = SEASONS[season]
  const why = `${a.temperature === 'neutral' ? `neutral (${a.lean}-leaning)` : a.temperature} undertone, ${a.value} depth, ${a.chroma} chroma`
  return {
    power: pal.power.map((c) => ({ ...c, note: `In your ${season} range — matches your ${why}.` })),
    avoid: pal.avoid.map((c) => ({ ...c, risk: `Outside the ${season} range — clashes with your ${why}.` })),
  }
}
