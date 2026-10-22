import { useEffect, useMemo, useState } from 'react'

// A swatch book of Pantone TCX cotton swatch cards: white legend band with the repeating code and name,
// a pinked-edge cotton swatch, woven texture — modelled on the Pantone Fashion Color Trend Report cards. Colours are Pantone's published sRGB values (approximate on screen).
// Pantone® is a registered trademark of Pantone LLC; names/codes are shown for colour reference only.
const CLOTHS = [
  // Pantone Fashion Color Trend Report, London Fashion Week A/W 2025/26 — top 10 standout colours
  ['Lavender Blue', '14-3805', '#CBC8DE'], ['Desert Sun', '16-1149', '#CB8A25'], ['Poppy Red', '17-1664', '#DF2A45'], ['Magical Forest', '19-4908', '#2B4149'],
  ['Salad Lime', '17-0232', '#6EB32A'], ['Hot Chocolate', '19-1325', '#6B352F'], ['Fanfare', '18-4936', '#11707B'], ['Chili Oil', '18-1440', '#9B3029'],
  ['Fig', '19-1718', '#4F2539'], ['Bronze Mist', '17-0843', '#A18A33'],
  // more Pantone TCX favourites
  ['Peach Fuzz', '13-1023', '#FFBE98'], ['Living Coral', '16-1546', '#FF6F61'], ['Mimosa', '14-0848', '#EFC050'], ['Emerald', '17-5641', '#009473'],
  ['Serenity', '15-3919', '#92A8D1'], ['Very Peri', '17-3938', '#6667AB'], ['Viva Magenta', '18-1750', '#BB2649'], ['Mocha Mousse', '17-1230', '#A47864'],
  ['Classic Blue', '19-4052', '#0F4C81'], ['Cloud Dancer', '11-4201', '#F0EEE9'],
]
const LEAVES = Array.from({ length: CLOTHS.length / 2 }, (_, i) => ({ front: CLOTHS[2 * i], back: CLOTHS[2 * i + 1] }))
const N = LEAVES.length
const TURN_MS = 2600

const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) }

// Pantone TCX swatch outline: straight top, pinked (zig-zag) left, right and bottom edges.
function pinked(tooth = 1.5, stepY = 2.6, stepX = 3.4) {
  const pts = []
  const push = (x, y) => pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  push(0, 0); push(100, 0)
  let k = 0
  for (let y = 0; y < 100; y += stepY) push(100 - (k++ % 2) * tooth, y)
  k = 0
  for (let x = 100; x > 0; x -= stepX) push(x, 100 - (k++ % 2) * tooth * 1.6)
  k = 0
  for (let y = 100; y > 0; y -= stepY) push((k++ % 2) * tooth, y)
  return `polygon(${pts.join(',')})`
}

function Fold({ seed, dark }) {
  // Soft, slightly different drape folds on every swatch.
  const a = 96 + ((seed * 37) % 28)
  const s1 = 14 + ((seed * 11) % 14)
  const s2 = 52 + ((seed * 7) % 16)
  const hi = dark ? 0.08 : 0.14
  const lo = dark ? 0.16 : 0.08
  return (
    <div className="absolute inset-0" style={{
      background: `
        linear-gradient(${a}deg, transparent ${s1 - 10}%, rgba(255,255,255,${hi}) ${s1}%, rgba(0,0,0,${lo}) ${s1 + 7}%, transparent ${s1 + 17}%),
        linear-gradient(${a + 12}deg, transparent ${s2 - 12}%, rgba(255,255,255,${hi * 0.8}) ${s2}%, rgba(0,0,0,${lo * 0.9}) ${s2 + 9}%, transparent ${s2 + 20}%),
        radial-gradient(120% 80% at 30% 0%, rgba(255,255,255,${dark ? 0.10 : 0.22}), transparent 60%),
        radial-gradient(120% 90% at 80% 110%, rgba(0,0,0,.20), transparent 60%)`,
    }} />
  )
}

function Face({ cloth, side, seed }) {
  const [name, code, hex] = cloth
  const dark = lum(hex) < 140
  const clip = useMemo(() => pinked(1.3 + (seed % 3) * 0.12), [seed])
  const label = (
    <div className="flex-1 text-center leading-[1.15] px-[1px]">
      <div className="text-[0.38rem] text-charcoal/70 tracking-wide">PANTONE®</div>
      <div className="text-[0.4rem] text-charcoal/85 font-semibold tracking-wide">{code} TCX</div>
      <div className="text-[0.36rem] text-bronze tracking-wide truncate">{name}</div>
    </div>
  )
  return (
    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: side === 'back' ? 'rotateY(180deg)' : undefined }}>
      <div className="absolute inset-[2%]" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.30))' }}>
        <div className="absolute inset-0 flex flex-col" style={{ clipPath: clip }}>
          {/* white header band with the repeating Pantone legend, like the real TCX cards */}
          <div className="bg-[#FBFAF7] flex items-center px-[5%] shrink-0" style={{ height: '15%', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            {label}{label}{label}{label}
          </div>
          {/* the cotton swatch */}
          <div className="relative flex-1" style={{ background: hex }}>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
              <rect width="100%" height="100%" filter="url(#cloth-warp)" opacity={dark ? 0.34 : 0.2} style={{ mixBlendMode: 'multiply' }} />
              <rect width="100%" height="100%" filter="url(#cloth-weft)" opacity={dark ? 0.16 : 0.1} style={{ mixBlendMode: 'multiply' }} />
              <rect width="100%" height="100%" filter="url(#cloth-fuzz)" opacity={0.45} style={{ mixBlendMode: 'soft-light' }} />
            </svg>
            <Fold seed={seed} dark={dark} />
          </div>
        </div>
      </div>
      {/* shade toward the binding */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: side === 'back' ? 'linear-gradient(270deg, rgba(0,0,0,.20), transparent 18%)' : 'linear-gradient(90deg, rgba(0,0,0,.20), transparent 18%)' }} />
    </div>
  )
}

export default function ColorFlipBook() {
  const [flipped, setFlipped] = useState(0)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setFlipped((f) => (f >= N ? 0 : f + 1)), TURN_MS)
    return () => clearInterval(t)
  }, [reduced])

  const right = flipped < N ? LEAVES[flipped].front : LEAVES[0].front
  const left = flipped > 0 ? LEAVES[flipped - 1].back : null

  return (
    <figure className="select-none" aria-label="Pantone TCX cotton swatch book">
      {/* thread / weave filters, defined once and shared by every swatch */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="cloth-warp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.9" numOctaves="2" seed="3" /><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.15" /></filter>
          <filter id="cloth-weft" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.035" numOctaves="2" seed="8" /><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.15" /></filter>
          <filter id="cloth-fuzz" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="3" seed="5" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
      </svg>
      <div className="relative mx-auto" style={{ width: 'min(470px, 88vw)', height: 'min(380px, 72vw)', perspective: '1800px' }}>
        <div className="absolute left-[6%] right-[6%] -bottom-4 h-7 rounded-[50%] bg-black/15 blur-xl" />
        {/* the book board and the page stack's edge */}
        <div className="absolute -inset-[7px] rounded-[12px] bg-[#3A2F2A]" style={{ boxShadow: '0 10px 30px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.06)' }} />
        <div className="absolute inset-0 rounded-[10px] bg-[#DCD8D0]" />
        {[0, 1, 2].map((k) => <div key={k} className="absolute top-[1%] bottom-[1%] w-1/2 bg-[#ECE9E2] border-r border-black/10" style={{ left: `calc(50% + ${k * 3}px)`, borderRadius: '0 8px 8px 0' }} />)}
        {LEAVES.map((leaf, i) => {
          const isFlipped = flipped > i
          return (
            <div key={i} className="absolute top-0 bottom-0 left-1/2 w-1/2" onClick={() => setFlipped((f) => (f === i + 1 ? i : i + 1))}
              style={{
                transformStyle: 'preserve-3d', transformOrigin: 'left center', cursor: 'pointer',
                transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                transition: `transform ${flipped === 0 && !isFlipped ? 700 : 1300}ms cubic-bezier(.5,.02,.2,1)`,
                zIndex: isFlipped ? i : N - i,
              }}>
              <Face cloth={leaf.front} side="front" seed={i * 2} />
              <Face cloth={leaf.back} side="back" seed={i * 2 + 1} />
            </div>
          )
        })}
        {/* binding */}
        <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-black/35 z-50" />
        {[14, 38, 62, 86].map((t) => (
          <span key={t} className="absolute left-1/2 -ml-[6px] w-[12px] h-[12px] rounded-full z-50" style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 30%, #F4EEE2, #B9AE9C 60%, #7B6F60)', boxShadow: '0 1px 2px rgba(0,0,0,.45)' }} />
        ))}
      </div>
      <figcaption className="mt-9 text-center text-[0.68rem] tracking-[0.3em] uppercase text-bronze h-4" aria-live="off">
        {left ? `${left[0]}  ·  ` : ''}{right[0]}
      </figcaption>
      <p className="mt-2 text-center text-[0.55rem] tracking-wide text-bronze/60">Pantone® is a trademark of Pantone LLC · colours approximate on screen</p>
    </figure>
  )
}
