// Reference palettes for the 12-season Korean personal-colour system. Each season: 6 flattering colours
// and 6 colours to avoid. The season itself is derived from MEASURED skin values (server/skin.js).
const c = (name, hex) => ({ name, hex })

export const SEASONS = {
  'Light Spring': {
    power: [c('Soft Peach', '#FFCBA4'), c('Coral Pink', '#F88379'), c('Warm Ivory', '#FFF1D0'), c('Light Aqua', '#8FD6C8'), c('Buttercream', '#F7E08C'), c('Fresh Apricot', '#FDB777')],
    avoid: [c('Black', '#111111'), c('Burgundy', '#5B141C'), c('Cool Grey', '#8C92AC'), c('Dark Navy', '#1B2A49'), c('Heavy Brown', '#4A2C1B'), c('Stark White', '#FFFFFF')],
  },
  'True Spring': {
    power: [c('Golden Camel', '#D9A441'), c('Warm Coral', '#FF7F50'), c('Leaf Green', '#7DB84B'), c('Turquoise', '#2BB5A8'), c('Cream', '#FFF0C9'), c('Tangerine', '#F59A3C')],
    avoid: [c('Black', '#111111'), c('Icy Lilac', '#DCCBF0'), c('Cool Grey', '#9AA3B2'), c('Fuchsia', '#C2185B'), c('Stark White', '#FFFFFF'), c('Dusty Mauve', '#A98A9A')],
  },
  'Bright Spring': {
    power: [c('Clear Coral', '#FF6F61'), c('Bright Turquoise', '#00B8C4'), c('Lemon Yellow', '#FFE135'), c('Fresh Green', '#3CB44B'), c('Warm White', '#FFF8EC'), c('Hot Pink', '#FF4F8B')],
    avoid: [c('Dusty Rose', '#C49A9A'), c('Muted Olive', '#6B6B3A'), c('Greyed Taupe', '#8B7E74'), c('Charcoal', '#3A3A3A'), c('Dull Brown', '#6B4F3A'), c('Soft Beige', '#D8C8B0')],
  },
  'Light Summer': {
    power: [c('Powder Blue', '#B4D4F0'), c('Soft Pink', '#F4B6C8'), c('Lavender', '#C9B8E8'), c('Mint', '#B5E3D0'), c('Soft White', '#F6F4F2'), c('Light Rose', '#E8A5B5')],
    avoid: [c('Black', '#111111'), c('Orange', '#F57C00'), c('Mustard', '#C99A1D'), c('Rust', '#A4452C'), c('Olive', '#6B6B2A'), c('Dark Brown', '#3B2219')],
  },
  'True Summer': {
    power: [c('Rose Pink', '#D9728F'), c('Cornflower Blue', '#6A8FD1'), c('Cool Lavender', '#A58FD6'), c('Raspberry', '#B8305F'), c('Blue Grey', '#7F93A8'), c('Cool White', '#F3F6FA')],
    avoid: [c('Orange', '#F57C00'), c('Mustard', '#D4A017'), c('Warm Brown', '#7B4A2A'), c('Terracotta', '#C45D36'), c('Olive Green', '#6B7A2A'), c('Gold Yellow', '#F2C230')],
  },
  'Soft Summer': {
    power: [c('Dusty Rose', '#C9929C'), c('Soft Teal', '#6FA3A0'), c('Mauve', '#A58AA5'), c('Slate Blue', '#7C8DA8'), c('Sage', '#A3B5A0'), c('Soft Grey-Brown', '#9A8B86')],
    avoid: [c('Neon Pink', '#FF1493'), c('Bright Orange', '#FF6A00'), c('Stark Black', '#000000'), c('Electric Blue', '#0047FF'), c('Lemon Yellow', '#FFEB3B'), c('Stark White', '#FFFFFF')],
  },
  'Soft Autumn': {
    power: [c('Soft Terracotta', '#C57B5A'), c('Sage Green', '#9CA877'), c('Camel', '#C19A6B'), c('Dusty Teal', '#5E8B87'), c('Warm Taupe', '#A08C7A'), c('Muted Gold', '#C9A24D')],
    avoid: [c('Neon Green', '#39FF14'), c('Icy Blue', '#D6EEF8'), c('Fuchsia', '#E0147A'), c('Stark White', '#FFFFFF'), c('Jet Black', '#000000'), c('Cool Lilac', '#D3C2EE')],
  },
  'True Autumn': {
    power: [c('Pumpkin', '#D2691E'), c('Olive Green', '#6B7A2A'), c('Mustard Gold', '#D4A017'), c('Warm Brown', '#7B4A2A'), c('Cream', '#F5E6C8'), c('Deep Teal', '#1F6F6B')],
    avoid: [c('Icy Pink', '#F8D7E3'), c('Cool Grey', '#9AA3B2'), c('Royal Blue', '#2E4BC6'), c('Magenta', '#C2185B'), c('Stark White', '#FFFFFF'), c('Lilac', '#CDB8EA')],
  },
  'Dark Autumn': {
    power: [c('Deep Burgundy', '#6B1D2A'), c('Forest Green', '#1F4D2B'), c('Espresso', '#3B2219'), c('Burnt Orange', '#B5501F'), c('Deep Teal', '#0E5A5B'), c('Antique Gold', '#B8893A')],
    avoid: [c('Pastel Pink', '#F8D7E3'), c('Baby Blue', '#BBD8F2'), c('Lavender', '#CDB8EA'), c('Pale Yellow', '#FFF3A3'), c('Light Grey', '#D5D8DC'), c('Stark White', '#FFFFFF')],
  },
  'True Winter': {
    power: [c('Royal Blue', '#2B4CC0'), c('Fuchsia', '#C2185B'), c('Emerald', '#0B8A5B'), c('Icy Grey', '#C9D1DC'), c('Pure White', '#FFFFFF'), c('Cool Burgundy', '#7A1840')],
    avoid: [c('Orange', '#F57C00'), c('Mustard', '#C99A1D'), c('Warm Beige', '#D8BE9A'), c('Camel', '#C19A6B'), c('Olive', '#6B6B2A'), c('Peach', '#FFCBA4')],
  },
  'Dark Winter': {
    power: [c('True Black', '#0A0A0A'), c('Deep Emerald', '#0A5C3E'), c('Ruby Red', '#A0112B'), c('Midnight Navy', '#14213D'), c('Plum', '#5A1A5C'), c('Pure White', '#FFFFFF')],
    avoid: [c('Beige', '#D8C8B0'), c('Peach', '#FFCBA4'), c('Mustard', '#C99A1D'), c('Soft Pastel Yellow', '#FFF3A3'), c('Dusty Rose', '#C9929C'), c('Warm Camel', '#C19A6B')],
  },
  'Bright Winter': {
    power: [c('Electric Blue', '#1F4FFF'), c('Hot Magenta', '#E0187A'), c('Lemon', '#FFF200'), c('Emerald Green', '#00A86B'), c('Pure White', '#FFFFFF'), c('Jet Black', '#000000')],
    avoid: [c('Dusty Rose', '#C49A9A'), c('Muted Khaki', '#A89F7A'), c('Soft Beige', '#D8C8B0'), c('Greyed Teal', '#6F8F8A'), c('Warm Taupe', '#A08C7A'), c('Muted Peach', '#E8B49A')],
  },
}
