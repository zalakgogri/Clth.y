import { useEffect, useMemo, useState } from 'react'

// A swatch book of real cloth: pinked-edge fabric snippets, woven texture, soft folds, stitching and a
// Pantone tag on each side of every leaf. Colours are Pantone's published sRGB values (approximate on screen).
// Pantone® is a registered trademark of Pantone LLC; names/codes are shown for colour reference only.
const CLOTHS = [
  ['Peach Fuzz', '13-1023', '#FFBE98'], ['Living Coral', '16-1546', '#FF6F61'], ['Tangerine Tango', '17-1463', '#DD4124'], ['Mimosa', '14-0848', '#EFC050'],
  ['Greenery', '15-0343', '#88B04B'], ['Emerald', '17-5641', '#009473'], ['Turquoise', '15-5519', '#45B5AA'], ['Cerulean', '15-4020', '#9BB7D4'],
  ['Serenity', '15-3919', '#92A8D1'], ['Very Peri', '17-3938', '#6667AB'], ['Radiant Orchid', '18-3224', '#B163A3'], ['Honeysuckle', '18-2120', '#D94F70'],
  ['Viva Magenta', '18-1750', '#BB2649'], ['Chili Pepper', '19-1557', '#9B1B30'], ['Marsala', '18-1438', '#955251'], ['Mocha Mousse', '17-1230', '#A47864'],
  ['Classic Blue', '19-4052', '#0F4C81'], ['Ultimate Gray', '17-5104', '#939597'], ['Sand Dollar', '13-1106', '#DECDBE'], ['Cloud Dancer', '11-4201', '#F0EEE9'],
]
const LEAVES = Array.from({ length: CLOTHS.length / 2 }, (_, i) => ({ front: CLOTHS[2 * i], back: CLOTHS[2 * i + 1] }))
const N = LEAVES.length
const TURN_MS = 2600

const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) }

// Pinking-shears edge: a zig-zag polygon around the rectangle (percent coordinates).
function pinked(tooth = 1.6, step = 4.2) {
  const pts = []
  const push = (x, y) => pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  let k = 0
  for (let x = 0; x < 100; x += step) push(x, (k++ % 2) * tooth)
  k = 0
  for (let y = 0; y < 100; y += step * 0.62) push(100 - (k++ % 2) * tooth, y)
  k = 0
  for (let x = 100; x > 0; x -= step) push(x, 100 - (k++ % 2) * tooth)
  k = 0
  for (let y = 100; y > 0; y -= step * 0.62) push((k++ % 2) * tooth, y)
  return `polygon(${pts.join(',')})`
}

function Fold({ seed, dark }) {
  // Soft, slightly different drape folds on every swatch.
  const a = 96 + ((seed * 37) % 28)
  const s1 = 14 + ((seed * 11) % 14)
  const s2 = 52 + ((seed * 7) % 16)
  const hi = dark ? 0.16 : 0.34
  const lo = dark ? 0.30 : 0.16
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
  const clip = useMemo(() => pinked(1.7 + (seed % 3) * 0.2), [seed])
  return (
    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: side === 'back' ? 'rotateY(180deg)' : undefined }}>
      {/* the card the fabric is mounted on */}
      <div className="absolute inset-0 bg-[#F6F1E7]" style={{ borderRadius: side === 'back' ? '9px 2px 2px 9px' : '2px 9px 9px 2px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07), 0 1px 0 rgba(255,255,255,.7) inset' }} />
      <div className="absolute inset-0 opacity-50 mix-blend-multiply" style={{ background: 'linear-gradient(120deg, rgba(0,0,0,.05), transparent 40%, rgba(0,0,0,.04))' }} />
      {/* the fabric snippet */}
      <div className="absolute" style={{ left: '8%', right: '8%', top: '6%', bottom: '22%', filter: 'drop-shadow(0 2px 2.5px rgba(0,0,0,.35))' }}>
        <div className="absolute inset-0" style={{ background: hex, clipPath: clip }}>
          {/* warp & weft threads */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            <rect width="100%" height="100%" filter="url(#cloth-warp)" opacity={dark ? 0.55 : 0.42} style={{ mixBlendMode: 'multiply' }} />
            <rect width="100%" height="100%" filter="url(#cloth-weft)" opacity={dark ? 0.35 : 0.28} style={{ mixBlendMode: 'multiply' }} />
            <rect width="100%" height="100%" filter="url(#cloth-fuzz)" opacity={0.5} style={{ mixBlendMode: 'soft-light' }} />
          </svg>
          <Fold seed={seed} dark={dark} />
          <div className="absolute inset-[7%] border border-dashed rounded-[2px]" style={{ borderColor: dark ? 'rgba(255,255,255,.38)' : 'rgba(60,40,20,.30)' }} />
        </div>
      </div>
      {/* paper tag */}
      <div className="absolute left-[12%] right-[12%] bottom-[5%] h-[13%] bg-[#FBF8F1] rounded-[2px] flex flex-col items-center justify-center leading-tight" style={{ boxShadow: '0 1px 2px rgba(0,0,0,.18)' }}>
        <span className="text-[0.55rem] tracking-[0.26em] uppercase text-charcoal/80">{name}</span>
        <span className="text-[0.46rem] tracking-[0.2em] uppercase text-bronze">Pantone® {code} TCX</span>
      </div>
      {/* shade toward the spine */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: side === 'back' ? 'linear-gradient(270deg, rgba(0,0,0,.22), transparent 22%)' : 'linear-gradient(90deg, rgba(0,0,0,.22), transparent 22%)', borderRadius: side === 'back' ? '9px 2px 2px 9px' : '2px 9px 9px 2px' }} />
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
    <figure className="select-none" aria-label="Pantone cloth swatch book">
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
        <div className="absolute inset-0 rounded-[10px] bg-[#E9E1D2]" />
        {[0, 1, 2].map((k) => <div key={k} className="absolute top-[1%] bottom-[1%] w-1/2 bg-[#F1EBDD] border-r border-black/10" style={{ left: `calc(50% + ${k * 3}px)`, borderRadius: '0 8px 8px 0' }} />)}
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
