import { portrait } from './placeholders'

export const PHOTO_SLOTS = [
  { id: 1, key: 'frontFace', title: 'Front Face', hint: 'Bare face, hair pulled back, neutral daylight, eyes to lens.', guide: 'oval' },
  { id: 2, key: 'sideFace', title: 'Side Face 90°', hint: 'Pure profile, ear visible, chin level — maps jaw & nose bridge.', guide: 'profile' },
  { id: 3, key: 'bodyFront', title: 'Full Body Front', hint: 'Head to toe, arms relaxed, fitted neutral clothing.', guide: 'body' },
  { id: 4, key: 'bodySide', title: 'Side Full Body', hint: 'Head to toe in profile — maps posture & hip apex line.', guide: 'body-side' },
  { id: 5, key: 'candid', title: 'Candid Pose', hint: 'Natural drape pose, mid-motion — tests fabric movement.', guide: 'candid' },
]

export const DEFAULT_PHOTOS = {
  1: portrait({ kind: 'face-front', label: 'Slot 1 · Front face', bg: '#F3EBDF', accent: '#4A121A' }),
  2: portrait({ kind: 'face-side', label: 'Slot 2 · Side face 90°', bg: '#EFE3D3', accent: '#4A121A' }),
  3: portrait({ kind: 'body-front', label: 'Slot 3 · Full body front', bg: '#F1E8DC', accent: '#4A121A' }),
  4: portrait({ kind: 'body-side', label: 'Slot 4 · Side full body', bg: '#ECE0D0', accent: '#4A121A' }),
  5: portrait({ kind: 'candid', label: 'Slot 5 · Candid drape', bg: '#F0E5D6', accent: '#4A121A' }),
}

export const SHOPPING_APPS = ['Myntra', 'Ajio', 'Tata CLiQ', 'Zara', 'H&M']
export const BUDGET_TIERS = ['Value Essentials', 'Mid-Range Contemporary', 'Premium Designer', 'Luxury Atelier']
export const OCCASIONS = ['Smart Casual / Workwear', 'Brunch & Day Out', 'Evening & Cocktail', 'Wedding Guest', 'Travel & Airport', 'Date Night']
export const STYLE_GENRES = ['Quiet Luxury', 'Korean Minimal', 'Modern Indo-Western', 'Soft Romantic', 'Street Tailored', 'Vintage Editorial']
export const GENDERS = ['Female', 'Male', 'Non-binary']

export const DEFAULT_DEMOGRAPHICS = {
  heightCm: 165,
  weightKg: 58,
  age: 24,
  gender: 'Female',
  origin: 'Pune, Western India',
  preferredApps: ['Myntra', 'Ajio', 'Zara', 'H&M'],
  budgetTier: 'Mid-Range Contemporary',
  budgetMax: 12000,
  occasion: 'Smart Casual / Workwear',
  styles: ['Quiet Luxury', 'Korean Minimal'],
  customFit: 'High-waist bottoms only; prefer fluid drape, avoid stiff boxy tops and stark white near the face.',
}

export const DEFAULT_DIAGNOSTIC_REPORT = {
  clinic: 'DOES Studio · Hongdae, Seoul',
  clinicId: '#KR-8821',
  engineVersion: 'CLTH.Y Diagnostic Engine 2.4',
  powerColors: [
    { name: 'Velvet Burgundy', hex: '#5B141C', note: 'Deepens the warm undertone; lifts lip and cheek flush.' },
    { name: 'Emerald Forest', hex: '#134E39', note: 'Complementary contrast makes the skin read luminous.' },
    { name: 'Terracotta Amber', hex: '#C45D36', note: 'Mirrors the natural golden-olive base for a seamless glow.' },
    { name: 'Espresso Noir', hex: '#3B2219', note: 'Soft-contrast anchor in place of harsh true black.' },
    { name: 'Golden Ochre', hex: '#DDA15E', note: 'Warm midtone that brightens the eye area.' },
    { name: 'Imperial Brushed Gold', hex: '#D4AF37', note: 'Hardware and accent tone that echoes skin warmth.' },
  ],
  dissonantColors: [
    { name: 'Icy Cyan Blue', hex: '#E0F7FA', risk: 'Cool pastel drains warmth; skin reads sallow beneath the eyes.' },
    { name: 'Cool Ash Lilac', hex: '#E1BEE7', risk: 'Blue-violet cast amplifies under-eye shadow and dullness.' },
    { name: 'Chalk Sleet Grey', hex: '#B0BEC5', risk: 'Low-chroma cool grey flattens complexion and adds visual fatigue.' },
    { name: 'Optical Stark White', hex: '#FFFFFF', risk: 'High reflectance exaggerates redness and shadows near the face.' },
    { name: 'Fluorescent Magenta', hex: '#FF1493', risk: 'Over-saturated chroma overpowers soft features, highlights blemishes.' },
    { name: 'Acidic Neon Green', hex: '#00E676', risk: 'Reflects green cast onto skin; clashes with warm undertone.' },
  ],
  facial: {
    thirds: 'Compact Middle-Third',
    ratio: 0.88,
    summary: 'Upper : Middle : Lower proportion of 1 : 0.88 : 1.02 — a gently compact mid-face that rewards open, curved necklines.',
    necklines: ['Sweetheart', 'Cowl', 'Boatneck'],
    avoid: ['High crew / mock necks that visually shorten the mid-face', 'Heavy chokers at the throat line'],
  },
  skeletal: {
    frame: 'Wave / Soft Classic',
    rise: 'High-waist rise',
    tailoring: 'Fluid drape tailoring',
    summary: 'Soft, rounded bone structure with a short-to-mid torso. Garments should follow the body in motion, with the waist defined high.',
  },
  fabrics: ['Mulberry silk', 'Satin charmeuse', 'Modal crepe'],
  hardware: ['Antique brushed gold', 'Matte champagne gold'],
  avoidFabrics: ['Stiff structured denim in boxy cuts', 'Rigid polyester shine', 'Chunky oversize knits'],
}
