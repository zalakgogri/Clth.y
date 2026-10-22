// Procedural on-person try-on renderer: draws the client's silhouette dressed in
// the selected top / bottom / shoes, from Front, Side or Candid angle.
const SKIN = '#D9A98B'
const HAIR = '#2A1712'

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const c = (v) => Math.max(0, Math.min(255, v + amt))
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('')}`
}

export default function ModelFigure({ top, bottom, shoe, angle = 'front', skin = SKIN, className = '' }) {
  const side = angle === 'side'
  const candid = angle === 'candid'
  const tc = top.color
  const bc = bottom.color
  const sc = shoe.color
  const neck = top.neckline || 'Crew'
  const skirt = /skirt/i.test(bottom.name)
  const heel = Math.min(11, shoe.heel || 4)
  const sx = side ? 0.62 : 1 // horizontal squeeze for profile
  const tilt = candid ? 'rotate(-5 200 300)' : ''

  const neckPath = {
    Sweetheart: 'M150 150 Q175 168 200 156 Q225 168 250 150 L250 158 L150 158Z',
    Cowl: 'M160 150 Q200 200 240 150 L240 160 L160 160Z',
    Boatneck: 'M146 148 Q200 138 254 148 L254 156 L146 156Z',
    'V-neck': 'M165 150 L200 205 L235 150 L235 160 L165 160Z',
    Crew: 'M172 150 Q200 170 228 150 L228 160 L172 160Z',
    Mock: 'M174 138 L226 138 L226 160 L174 160Z',
    Collar: 'M168 148 L200 186 L232 148 L232 160 L168 160Z',
  }[neck] || ''

  return (
    <svg viewBox="0 0 400 640" className={className} role="img" aria-label={`${angle} try-on view`}>
      <defs>
        <linearGradient id={`bg-${angle}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5EEE3" /><stop offset="1" stopColor="#E3D6C3" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.45" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="640" fill={`url(#bg-${angle})`} />
      <ellipse cx="200" cy="610" rx="120" ry="12" fill="#000" opacity="0.1" />
      <g transform={`translate(${200 - 200 * sx} 0) scale(${sx} 1)`}>
        <g transform={tilt}>
          {/* head & hair */}
          <rect x="188" y="112" width="24" height="40" rx="10" fill={skin} />
          <ellipse cx="200" cy="82" rx="34" ry="42" fill={skin} />
          <path d="M162 84 Q158 26 200 24 Q244 26 238 84 Q232 50 200 48 Q168 50 162 84Z" fill={HAIR} />
          {!side && <><ellipse cx="187" cy="86" rx="5" ry="2.5" fill="#3B2219" /><ellipse cx="213" cy="86" rx="5" ry="2.5" fill="#3B2219" /><path d="M192 104 Q200 110 208 104" stroke="#9B4A3A" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>}
          {/* arms (skin under sleeves) */}
          <rect x="122" y="160" width="20" height="150" rx="10" fill={skin} transform={candid ? 'rotate(-14 132 160)' : ''} />
          <rect x="258" y="160" width="20" height="150" rx="10" fill={skin} transform={candid ? 'rotate(26 268 160)' : ''} />
          {/* top */}
          <path d="M142 150 Q200 136 258 150 L270 190 L252 210 L248 300 Q200 312 152 300 L148 210 L130 190Z" fill={tc} />
          <path d="M142 150 Q200 136 258 150 L270 190 L252 210 L248 300 Q200 312 152 300 L148 210 L130 190Z" fill="url(#sheen)" />
          <path d={neckPath} fill={skin} />
          {/* bottom */}
          {skirt ? (
            <path d="M150 296 Q200 306 250 296 L282 470 Q200 490 118 470Z" fill={bc} />
          ) : (
            <>
              <path d="M150 296 Q200 306 250 296 L262 578 L214 578 L200 340 L186 578 L138 578Z" fill={bc} />
              <path d="M150 296 Q200 306 250 296 L262 578 L214 578 L200 340 L186 578 L138 578Z" fill="url(#sheen)" />
            </>
          )}
          <rect x="150" y="294" width="100" height="10" fill={shade(bc, -22)} />
          <rect x="192" y="294" width="16" height="10" fill="#D4AF37" rx="2" />
          {/* legs under skirt */}
          {skirt && <><rect x="168" y="470" width="22" height={112 - heel} fill={skin} /><rect x="210" y="470" width="22" height={112 - heel} fill={skin} /></>}
          {/* shoes */}
          <path d={`M158 ${582 - heel} L196 ${582 - heel} L202 ${598} L148 ${598}Z`} fill={sc} stroke={shade(sc, -40)} strokeWidth="1" />
          <path d={`M204 ${582 - heel} L242 ${582 - heel} L252 ${598} L198 ${598}Z`} fill={sc} stroke={shade(sc, -40)} strokeWidth="1" />
          <rect x="148" y="596" width="54" height={Math.max(4, heel)} rx="2" fill={shade(sc, -50)} />
          <rect x="198" y="596" width="54" height={Math.max(4, heel)} rx="2" fill={shade(sc, -50)} />
        </g>
      </g>
      <text x="200" y="630" textAnchor="middle" fontSize="10" letterSpacing="3" fill="#7A6B68">{angle.toUpperCase()} VIEW · RENDERED ON YOUR FRAME</text>
    </svg>
  )
}
