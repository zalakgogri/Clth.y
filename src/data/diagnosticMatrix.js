// Diagnostic Feature Extraction Matrix — transcribed row-for-row from the client's source PDF
// ("Personal Color & Styling: Diagnostic Feature Extraction Matrix", Korean Image Consulting Methodology).
// measure = Measurement / Diagnostic Method · scale = Classification Options & Scales
// clothing / makeup = the matrix's general "Impact on …" columns; finding = demo-mode default result.
const p = (name, measure, scale, clothing, makeup, finding) => ({ name, measure, scale, clothing, makeup, finding })

export const DIAGNOSTIC_MODULES = [
  {
    id: 1, title: "Personal Color (Optics)",
    params: [
      p("Temperature / Undertone", "Draping warm vs cool gold/silver & base drapes", "Warm (Yellow/Peach), Cool (Pink/Blue), Neutral", "Metal hardware (Gold/Silver), primary fabric hue base", "Foundation base (warm/cool), blush/lip undertone", "Warm (golden-olive), LAB b* +17.4"),
      p("Saturation Sensitivity (Chroma)", "Testing high vivids vs medium/muted vs dull greyish", "Vivid/Bright, Medium/Moderate, Soft/Muted (Grey-cast)", "High saturation tolerance vs muted/soft earthy hues", "Lipstick pigmentation: sheer MLBB vs saturated bold", "Soft–Medium chroma tolerance"),
      p("Brightness / Value (Lightness)", "Evaluating pale/pastel vs mid-tone vs deep/dark drapes", "High Lightness (Light), Medium (Soft/Mute), Low (Deep)", "Color placement (light tops vs dark bottoms), contrast", "Eye shadow depth, contour intensity, brow tint", "Medium-Deep (L* 58)"),
      p("Facial Reaction & Clarity", "Visual check of dark circles, jawline shadowing, dullness", "Shadow clearing, brightening, redness reduction", "Avoid worst shades that cast green/grey under chin", "Concealer correction tone, color-correcting primers", "Brightens under emerald & burgundy; sallows under icy pastels"),
      p("Contrast Tolerance", "Testing light/dark simultaneous contrast drapes", "High Contrast, Medium Contrast, Low / Monochromatic", "Color blocking, print contrast vs tonal pairing", "Eyeliner sharpness, lip contrast vs skin tone", "Low-Medium contrast"),
      p("Achromatic Base Affinity", "Pure stark white, ivory, beige, charcoal, black test", "Pure White, Soft Off-white, Greyish/Oatmeal, Jet Black", "Core wardrobe investment staples (coats, shirts, knits)", "Highlighter finish (pearl vs champagne vs bronze)", "Espresso Noir & warm cream; avoid stark white"),
    ],
  },
  {
    id: 2, title: "Facial Proportions",
    params: [
      p("Vertical Thirds Ratio", "Measuring hairline-to-brow, brow-to-nose, nose-to-chin", "Short Middle Third (Youthful), Balanced, Long Middle", "Collar height, neck plunge, neck tie / scarf styling", "Nose contouring technique, lip overlining, blush placement", "Compact Middle-Third, ratio 0.88"),
      p("Face Shape & Jawline Contour", "Facial contour perimeter scan", "Oval, Round, Hexagonal, Square, Heart, Diamond", "Neckline shapes: softening angular jaw vs framing round", "Bronzer placement, jawline shading, earring shape", "Soft Oval-Heart, gentle jaw"),
      p("Curvature vs Linearity", "Eyebrow arch, eye slant, nose bridge, lip corners", "Curved (Feminine/Soft), Straight (Chic/Sharp), Hybrid", "Lapel cut (peaked vs shawl), silhouette structure", "Brow shape (arched vs straight), eyeliner wing style", "Curved-dominant"),
      p("Feature Scale (Omil-Jomil)", "Relative size of facial organs to total face surface", "Small/Delicate (Omil-Jomil), Medium, Bold/Voluminous", "Print scale (micro-floral vs large bold motif), accessory size", "False lash volume, eyeshadow blending radius", "Medium, softly mixed"),
    ],
  },
  {
    id: 3, title: "Body Type & Silhouette",
    params: [
      p("Skeletal Bone Structure (Honebana)", "3-Type Frame Analysis (Honebana) & bone prominence", "Straight (Muscular/Structured), Wave (Soft), Natural (Bone)", "Fabric stiffness, tailored suits vs relaxed fluid layers", "Grooming sharpness, structural vs natural aesthetic", "Wave / Soft Classic"),
      p("Shoulder & Clavicle Frame", "Clavicle visibility, shoulder slope, acromion angle", "Sharp/Squared, Sloped, Prominent Clavicle, Soft", "Shoulder pads, raglan sleeves, off-shoulder cut", "Necklace length and collarbone highlighter", "Sloped, narrow-to-balanced"),
      p("Center of Gravity & Torso", "Bust height, waistline position, torso length", "High Center of Gravity vs Low Center of Gravity", "Waistline placement (high-waist vs mid/low-rise)", "Overall visual vertical balance", "Mid-to-low; benefits from high-waist"),
      p("Hip & Glute Apex Line", "Lateral hip curve and vertical glute apex positioning", "High/Curved (Apple/Rounded) vs Flat/Straight Line", "Bottom silhouette: pencil, A-line, wide-leg, bias cut", "Belt width and focal positioning", "Mid apex, soft curve"),
      p("Neckline Compatibility", "Drape testing Scoop, Square, V-neck, Boat, Heart/Cowl", "Boat, U-neck, Sweetheart, Square, Deep V, Turtleneck", "Specific top / dress necklines that balance chin/clavicle", "Earring length and necklace drop pairing", "Sweetheart / Cowl / Boatneck"),
    ],
  },
  {
    id: 4, title: "Material & Texture",
    params: [
      p("Fabric Weight & Thickness", "Drape test of sheer chiffon vs heavy wool/tweed", "Lightweight (Fluid), Medium-weight, Heavy / Structured", "Seasonality, drape quality, avoidance of bulky appearance", "Makeup heaviness: lightweight tint vs full coverage", "Light-to-medium"),
      p("Surface Finish & Luster", "Matte cotton/linen vs satin/silk vs plush cashmere", "High Sheen (Satin/Silk), Matte, Plush (Alpaca/Knit), Boucle", "Matching natural skin luster and personal elegance", "Skin finish: dewy vs semi-matte vs velvet matte", "Soft sheen – satin"),
      p("Pattern Scale & Density", "Overlay of geometric, floral, animal, stripe drapes", "Solids, Micro-prints, Houndstooth, Abstract, Animal", "Dominant print selection for dresses, scarves, tops", "Lip intensity to balance busy outfit prints", "Small–medium, low density"),
      p("Drape Dynamism", "Stiff boxy silhouette vs fluid wind-blown drape", "Architectural/Tailored vs Fluid/Draped/Ruched", "Ruching, bias cuts, trench fluidity, pleated skirts", "Hair texture: sleek straight vs soft dynamic waves", "Fluid"),
    ],
  },
  {
    id: 5, title: "Styling & Details",
    params: [
      p("Garment Details & Hardware", "Belt width, embroidery, metallic buttons, pocket style", "Minimalist/Clean vs Elaborate/Embroidered/Belts", "Waist-cinching belts, accent hardware placement", "Metallic eye accents, lip gloss vs velvet stain", "Delicate-to-medium, antique gold"),
      p("Hairstyle & Hair Volume", "Evaluation of jaw clearance, cheekbone volume, bangs", "Long layered, Sleek bob, Curled waves, Curtain bangs", "Upper body garment visual weight harmony", "Framing facial shape and forehead proportions", "Soft waves, medium volume"),
      p("Accessory & Eyewear Sizing", "Scale testing of glasses frames and jewelry items", "Petite/Delicate, Medium-scale, Oversized Statement", "Eyewear frame bridge and width, bag size proportions", "Complementing delicate vs bold makeup focus", "Medium, rounded"),
    ],
  },
]

// The 18-parameter client sheet.
const f = (code, param, value, rating, action) => ({ code, param, value, rating, action })
export const FEATURE_CODES = [
  f('PC-01', 'Temperature / Undertone', 'Golden-olive; LAB b* +17.4', 'Warm', 'Choose gold-based warm hues; gold hardware over silver.'),
  f('PC-02', 'Saturation Sensitivity', 'Handles soft–medium chroma', 'Soft-Medium', 'Keep chroma muted-to-medium; avoid neon.'),
  f('PC-03', 'Brightness / Value', 'L* 58 skin, deep hair', 'Medium-Deep', 'Use mid-to-deep tones, avoid pale tints near the face.'),
  f('PC-04', 'Contrast Tolerance', 'Hair–skin–eye delta is gentle', 'Low-Medium', 'Tonal outfits; espresso instead of black.'),
  f('PC-05', 'Achromatic Base', 'Skin lifts in espresso & cream', 'Espresso / Warm Cream', 'Replace stark white with warm cream.'),
  f('FP-01', 'Vertical Thirds', '1 : 0.88 : 1.02', 'Compact Middle-Third', 'Open curved necklines; avoid mock/crew.'),
  f('FP-02', 'Face Shape & Jaw', 'Soft oval-heart', 'Soft Oval-Heart', 'Soft collars and fluid frames.'),
  f('FP-03', 'Curvature vs Linearity', 'Curved-dominant', 'Curved', 'Rounded cuts, drape and cowl lines.'),
  f('FP-04', 'Feature Scale', 'Medium, soft mix', 'Medium', 'Medium-scale accessories & prints.'),
  f('BT-01', 'Skeletal Frame (Honebana)', 'Rounded joints, soft bone', 'Wave / Soft Classic', 'Fluid drape tailoring.'),
  f('BT-02', 'Shoulder & Clavicle', 'Sloped, narrow-balanced', 'Sloped', 'Boatneck and soft shoulders.'),
  f('BT-03', 'Center of Gravity', 'Mid-to-low', 'Mid-Low', 'High-waist rise to lift proportion.'),
  f('BT-04', 'Neckline Compatibility', 'Open-curved works best', 'Sweetheart / Cowl / Boat', 'Prescribe these three necklines.'),
  f('TX-01', 'Fabric Weight & Luster', 'Light–medium, soft sheen', 'Light-Medium · Satin', 'Mulberry silk, satin charmeuse, modal crepe.'),
  f('TX-02', 'Pattern & Drape', 'Small prints, fluid movement', 'Small-Medium · Fluid', 'Low-density prints; avoid stiff boxy cuts.'),
  f('MK-01', 'Makeup Palette', 'Warm terracotta & rose-brown', 'Warm Soft', 'Terracotta blush, brown liner, gold highlight.'),
  f('MK-02', 'Hairstyle', 'Soft waves, curtain fringe', 'Soft Wave', 'Face-framing layers; avoid sleek centre-part.'),
  f('MK-03', 'Accessories & Eyewear', 'Medium, rounded', 'Medium · Round', 'Antique gold, rounded warm-tortoise frames.'),
]

export const CONSULT_META = {
  consultantTeam: 'DOES Studio Diagnostics Team',
  sessionType: 'All-in-One Image & Color Consultation',
}
