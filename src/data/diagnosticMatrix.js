// Korean Image Consulting methodology — Diagnostic Feature Extraction Matrix.
// Each parameter: what is measured, the classification scale, and the dual impact.
const p = (name, measure, scale, clothing, makeup, finding) => ({ name, measure, scale, clothing, makeup, finding })

export const DIAGNOSTIC_MODULES = [
  {
    id: 1, title: 'Personal Color (Optics)',
    params: [
      p('Temperature / Undertone', 'Vein hue, LAB b* value of cheek & inner wrist under D65 light', 'Warm · Neutral-Warm · Neutral · Neutral-Cool · Cool', 'Select gold-based, yellow-leaning hues over blue-based hues', 'Foundation undertone, gold vs. silver highlighter', 'Warm (golden-olive), LAB b* +17.4'),
      p('Saturation Sensitivity (Chroma)', 'Skin response to muted vs. vivid drapes', 'Muted · Soft · Medium · Clear · Vivid', 'Favour muted-to-medium chroma; avoid neon and fluorescent', 'Blush & lip intensity capped at soft-medium', 'Soft–Medium chroma tolerance'),
      p('Brightness / Value (Lightness)', 'LAB L* of skin, hair & iris', 'Light · Medium-Light · Medium · Medium-Deep · Deep', 'Mid-to-deep tones carry best; very light tints wash out', 'Mid-depth base, avoid ashy highlight', 'Medium-Deep (L* 58)'),
      p('Facial Reaction & Clarity', 'Observed skin clarity under test drapes', 'Brightens · Neutral · Dulls / Sallows', 'Keep power colours at the neckline', 'Colour-correct under-eye if needed', 'Brightens under emerald & burgundy; sallows under icy pastels'),
      p('Contrast Tolerance', 'Value difference between hair, skin, eyes', 'Low · Low-Medium · Medium · High', 'Tonal, low-medium contrast outfits; avoid stark black/white split', 'Soft-defined brow and liner', 'Low-Medium contrast'),
      p('Achromatic Base Affinity', 'Reaction to black / white / grey / cream / espresso drapes', 'Black · Charcoal · Espresso · Cream · White', 'Use espresso & warm cream as neutrals', 'Brown liner over black', 'Espresso Noir & warm cream; avoid stark white'),
    ],
  },
  {
    id: 2, title: 'Facial Proportions',
    params: [
      p('Vertical Thirds Ratio', 'Hairline–brow : brow–nose base : nose base–chin', 'Compact · Balanced · Elongated middle-third', 'Open curved necklines add mid-face length', 'Blush placement extended slightly upward', 'Compact Middle-Third, ratio 0.88'),
      p('Face Shape & Jawline Contour', 'Width at cheekbone : jaw : forehead; jaw angle', 'Oval · Round · Heart · Square · Long · Diamond', 'Softly open necklines echo the oval-heart contour', 'Soft contouring along the jaw', 'Soft Oval-Heart, gentle jaw'),
      p('Curvature vs Linearity', 'Ratio of curved to straight facial lines', 'Curved · Mixed · Linear', 'Curved collars, drape and fluid lines', 'Rounded brow arch & curved lip line', 'Curved-dominant'),
      p('Feature Scale (Omil-Jomil)', 'Size of eyes, nose, lips relative to face', 'Small · Medium · Large · Mixed', 'Medium-scale prints, delicate jewellery', 'Balanced lip & eye emphasis, not both heavy', 'Medium, softly mixed'),
    ],
  },
  {
    id: 3, title: 'Body Type & Silhouette',
    params: [
      p('Skeletal Bone Structure (Honebana)', 'Wrist, ankle & joint prominence, bone-to-flesh ratio', 'Straight · Wave · Natural', 'Fluid, soft-edged tailoring; avoid rigid structure', 'Soft-defined silhouette in styling', 'Wave / Soft Classic'),
      p('Shoulder & Clavicle Frame', 'Shoulder slope and width; collarbone prominence', 'Narrow · Sloped · Balanced · Broad', 'Boatneck & off-shoulder lines; soft shoulders', 'Hair volume at shoulder line', 'Sloped, narrow-to-balanced'),
      p('Center of Gravity & Torso', 'Waist-to-hip & leg-to-torso proportion', 'High · Mid · Low centre of gravity', 'High-waist trousers extend the leg line', 'Hairstyle height balances lower mass', 'Mid-to-low; benefits from high-waist'),
      p('Hip & Glute Apex Line', 'Side-profile apex height of hip curve', 'High · Mid · Low apex', 'Fluid drape over the hip; skirts with bias cut', 'Not applicable beyond silhouette', 'Mid apex, soft curve'),
      p('Neckline Compatibility', 'Neck length, chest width & mid-face ratio', 'Sweetheart · Cowl · Boat · V · Crew · Mock', 'Sweetheart, cowl, boatneck prescribed', 'Collar-bone highlight, light jewellery', 'Sweetheart / Cowl / Boatneck'),
    ],
  },
  {
    id: 4, title: 'Material & Texture',
    params: [
      p('Fabric Weight & Thickness', 'Gsm tolerated vs. body softness', 'Gossamer · Light · Medium · Heavy', 'Light-to-medium weights that fall softly', 'Soft-matte finish textures', 'Light-to-medium'),
      p('Surface Finish & Luster', 'Matte vs. satin vs. high-shine', 'Matte · Soft sheen · Satin · High gloss', 'Satin charmeuse & mulberry silk glow', 'Glow-forward base, subtle gloss lip', 'Soft sheen – satin'),
      p('Pattern Scale & Density', 'Print size relative to facial & body scale', 'Micro · Small · Medium · Large', 'Small-medium, low-density prints', 'Minimal, delicate nail & accessory motifs', 'Small–medium, low density'),
      p('Drape Dynamism', 'Fabric movement (stiff ↔ flowing)', 'Rigid · Structured · Soft · Fluid', 'Fluid and soft drape', 'Loose waves over sharp blowouts', 'Fluid'),
    ],
  },
  {
    id: 5, title: 'Styling & Details',
    params: [
      p('Garment Details & Hardware', 'Buckles, buttons, trims relative to frame', 'Delicate · Medium · Bold', 'Antique brushed gold, small-medium hardware', 'Gold-tone jewellery', 'Delicate-to-medium, antique gold'),
      p('Hairstyle & Hair Volume', 'Hair texture, density and silhouette', 'Sleek · Soft wave · Voluminous', 'Soft waves frame the compact mid-face', 'Face-framing layers, curtain fringe', 'Soft waves, medium volume'),
      p('Accessory & Eyewear Sizing', 'Frame width : face width; accessory scale', 'Petite · Medium · Statement', 'Medium accessories, rounded eyewear', 'Round-soft frames in warm tortoise', 'Medium, rounded'),
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
  consultantTeam: 'DOES Studio Diagnostics Team · Hongdae, Seoul',
  sessionType: 'All-in-One Image & Color Consultation',
}
