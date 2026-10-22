import { portrait } from './placeholders'

export const PHOTO_SLOTS = [
  { id: 1, key: 'frontFace', title: 'Front Face', hint: 'Bare face, hair pulled back off ears, neutral daylight, eyes to the lens.', guide: 'oval', example: '/examples/front.jpg' },
  { id: 2, key: 'leftSide', title: 'Left Side', hint: 'Pure profile showing your left side, ear visible, chin level.', guide: 'profile', example: '/examples/left.jpg' },
  { id: 3, key: 'rightSide', title: 'Right Side', hint: 'Pure profile showing your right side, ear visible, chin level.', guide: 'profile', example: '/examples/right.jpg' },
  { id: 4, key: 'fullBody', title: 'Full Body', hint: 'Head to toe, standing straight, arms relaxed, fitted plain clothes.', guide: 'body', example: '/examples/body.jpg' },
]

// Drawn stand-ins used only by the demo diagnosis (never sent to the AI).
export const DEFAULT_PHOTOS = {
  1: portrait({ kind: 'face-front', label: 'Front face', bg: '#F3EBDF', accent: '#4A121A' }),
  2: portrait({ kind: 'face-side', label: 'Left side', bg: '#EFE3D3', accent: '#4A121A' }),
  3: portrait({ kind: 'face-side', label: 'Right side', bg: '#ECE0D0', accent: '#4A121A' }),
  4: portrait({ kind: 'body-front', label: 'Full body', bg: '#F1E8DC', accent: '#4A121A' }),
}

export const SHOPPING_APPS = ['Myntra', 'Ajio', 'Tata CLiQ', 'Zara', 'H&M']
export const OCCASIONS = ['Smart Casual / Workwear', 'Brunch & Day Out', 'Evening & Cocktail', 'Wedding Guest', 'Travel & Airport', 'Date Night']
export const OTHER_OCCASION = 'Others'
export const effectiveOccasion = (d) => (d.occasion === OTHER_OCCASION ? (d.customOccasion || '').trim() : d.occasion)
export const GENDERS = ['Female', 'Male', 'Non-binary']

export const DEFAULT_DEMOGRAPHICS = {
  heightCm: 165,
  weightKg: 58,
  age: 24,
  gender: 'Female',
  origin: 'Pune, Western India',
  preferredApps: ['Myntra', 'Ajio', 'Zara', 'H&M'],
  budgetMax: 12000,
  occasion: 'Smart Casual / Workwear',
  customOccasion: '', // used when occasion is 'Others'
  selfCheck: { vein: '', sun: '', metal: '' }, // optional undertone self-checks
  customFit: 'High-waist bottoms only; prefer fluid drape, avoid stiff boxy tops and stark white near the face.',
}

export const DEFAULT_DIAGNOSTIC_REPORT = {
  clinic: 'DOES Studio',
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
