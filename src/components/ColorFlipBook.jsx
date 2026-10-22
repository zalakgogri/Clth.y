import { useEffect, useMemo, useState } from 'react'

// A fabric swatch book: every page is a plain, matte cotton swatch with pinked edges on a white label band,
// bound in a dark board. Each leaf has a different fabric colour on its front and its back.
const CLOTHS = [
  ['Lavender', '#CBC8DE'], ['Ochre', '#CB8A25'], ['Poppy Red', '#DF2A45'], ['Dark Teal', '#2B4149'],
  ['Lime Green', '#6EB32A'], ['Chocolate', '#6B352F'], ['Peacock Teal', '#11707B'], ['Brick Red', '#9B3029'],
  ['Aubergine', '#4F2539'], ['Olive Gold', '#A18A33'], ['Peach', '#FFBE98'], ['Coral', '#FF6F61'],
  ['Marigold', '#EFC050'], ['Emerald', '#009473'], ['Periwinkle', '#92A8D1'], ['Violet', '#6667AB'],
  ['Raspberry', '#BB2649'], ['Mocha', '#A47864'], ['Cobalt', '#0F4C81'], ['Ivory', '#F0EEE9'],
]
const LEAVES = Array.from({ length: CLOTHS.length / 2 }, (_, i) => ({ front: CLOTHS[2 * i], back: CLOTHS[2 * i + 1] }))
const N = LEAVES.length
const TURN_MS = 2600

// Pinked (zig-zag) left, right and bottom edges; straight top where the swatch is glued under the label band.
function pinked(tooth = 1.3, stepY = 2.6, stepX = 3.4) {
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

function Face({ cloth, side, number, seed }) {
  const [name, hex] = cloth
  const clip = useMemo(() => pinked(1.2 + (seed % 3) * 0.1), [seed])
  const label = (
    <div className="flex-1 min-w-0 overflow-hidden text-center leading-[1.2] px-[2px]">
      <div className="text-[0.36rem] text-bronze tracking-[0.18em]">COLOUR {String(number).padStart(2, '0')}</div>
      <div className="text-[0.42rem] text-charcoal/85 font-semibold tracking-[0.12em] uppercase truncate">{name}</div>
    </div>
  )
  return (
    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: side === 'back' ? 'rotateY(180deg)' : undefined }}>
      <div className="absolute inset-[2%]" style={{ filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,.28))' }}>
        <div className="absolute inset-0 flex flex-col" style={{ clipPath: clip }}>
          <div className="bg-[#FBFAF7] flex items-center px-[5%] shrink-0" style={{ height: '15%', borderBottom: '1px solid rgba(0,0,0,.07)' }}>
            {label}{label}{label}{label}
          </div>
          {/* plain matte cloth: a flat colour with only a barely-there fine grain and soft overhead light */}
          <div className="relative flex-1" style={{ background: hex }}>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
              <rect width="100%" height="100%" filter="url(#cloth-fuzz)" opacity="0.32" style={{ mixBlendMode: 'soft-light' }} />
            </svg>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.10), transparent 35%, rgba(0,0,0,.07))' }} />
          </div>
        </div>
      </div>
      {/* a little shade where the page meets the binding */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: side === 'back' ? 'linear-gradient(270deg, rgba(0,0,0,.22), transparent 16%)' : 'linear-gradient(90deg, rgba(0,0,0,.22), transparent 16%)' }} />
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
    <figure className="select-none" aria-label="Fabric swatch book">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="cloth-fuzz" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="5" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
      </svg>
      {/* the whole book sits on a table, tilted slightly toward the viewer */}
      <div style={{ perspective: '1600px' }}>
        <div className="relative mx-auto" style={{ width: 'min(470px, 88vw)', height: 'min(380px, 72vw)', transform: 'rotateX(14deg) rotateZ(-1.2deg)', transformStyle: 'preserve-3d' }}>
          <div className="absolute left-[4%] right-[4%] -bottom-6 h-9 rounded-[50%] bg-black/25 blur-xl" />
          {/* board, with a leather-like finish */}
          <div className="absolute -inset-[9px] rounded-[10px]" style={{ background: 'linear-gradient(135deg, #4A3C35, #2E2420)', boxShadow: '0 14px 30px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08), inset 0 2px 3px rgba(255,255,255,.12)' }} />
          <div className="absolute inset-0 rounded-[8px] bg-[#E4E0D8]" />
          {/* page-block edges, left and right */}
          {[0, 1, 2, 3].map((k) => <div key={`r${k}`} className="absolute top-[.6%] bottom-[.6%] w-1/2 bg-[#F2EFE8] border-r border-black/10" style={{ left: `calc(50% + ${k * 2.5}px)`, borderRadius: '0 7px 7px 0' }} />)}
          {[0, 1, 2, 3].map((k) => <div key={`l${k}`} className="absolute top-[.6%] bottom-[.6%] w-1/2 bg-[#F2EFE8] border-l border-black/10" style={{ right: `calc(50% + ${k * 2.5}px)`, borderRadius: '7px 0 0 7px' }} />)}
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
                <Face cloth={leaf.front} side="front" number={2 * i + 1} seed={2 * i} />
                <Face cloth={leaf.back} side="back" number={2 * i + 2} seed={2 * i + 1} />
                {/* shadow that sweeps across the page as it turns */}
                <div key={String(isFlipped)} className="absolute inset-0 pointer-events-none leaf-turn-shade" style={{ transform: 'translateZ(1px)' }} />
              </div>
            )
          })}
          {/* binding: stitched spine with rings */}
          <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-black/40 z-50" />
          {[14, 38, 62, 86].map((t) => (
            <span key={t} className="absolute left-1/2 -ml-[6px] w-[12px] h-[12px] rounded-full z-50" style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 30%, #F4EEE2, #B9AE9C 60%, #6F6456)', boxShadow: '0 1px 2px rgba(0,0,0,.5)' }} />
          ))}
        </div>
      </div>
      <figcaption className="mt-10 text-center text-[0.68rem] tracking-[0.3em] uppercase text-bronze h-4" aria-live="off">
        {left ? `${left[0]}  ·  ` : ''}{right[0]}
      </figcaption>
    </figure>
  )
}
