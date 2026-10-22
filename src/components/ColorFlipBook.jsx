import { useEffect, useState } from 'react'

// A flip book of cloth swatches: every leaf has a colour on its front and another on its back,
// so each turn of the page reveals two new fabrics.
const CLOTHS = [
  ['Blush Silk', '#F1C6B8'], ['Rose Quartz', '#E5AEB9'], ['Lilac Mist', '#C9B8E6'], ['Powder Blue', '#B5CFEA'],
  ['Mint Cream', '#BEE2D0'], ['Butter Linen', '#F4E2A0'], ['Apricot', '#F6B48A'], ['Coral', '#EC7B6F'],
  ['Raspberry', '#B53B60'], ['Burgundy', '#6B1D2A'], ['Plum', '#5A2A52'], ['Midnight Navy', '#1F2D4D'],
  ['Deep Teal', '#1F6F6B'], ['Forest', '#2D5A3D'], ['Olive', '#6B7A2A'], ['Mustard', '#D2A21A'],
  ['Camel', '#C19A6B'], ['Cocoa', '#4A2C1B'], ['Slate', '#5F6B7A'], ['Ivory', '#F3ECDD'],
]
const LEAVES = Array.from({ length: CLOTHS.length / 2 }, (_, i) => ({ front: CLOTHS[2 * i], back: CLOTHS[2 * i + 1] }))
const N = LEAVES.length
const TURN_MS = 2300

const isDark = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140 }

function Cloth({ name, hex, side }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: hex, backfaceVisibility: 'hidden', transform: side === 'back' ? 'rotateY(180deg)' : undefined, borderRadius: side === 'back' ? '10px 2px 2px 10px' : '2px 10px 10px 2px' }}>
      {/* woven texture + soft drape shading */}
      <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 1px, transparent 1px 3px)' }} />
      <div className="absolute inset-0" style={{ background: side === 'back' ? 'linear-gradient(270deg, rgba(0,0,0,.20), rgba(255,255,255,.10) 30%, rgba(0,0,0,.06) 70%, rgba(255,255,255,.12))' : 'linear-gradient(90deg, rgba(0,0,0,.20), rgba(255,255,255,.10) 30%, rgba(0,0,0,.06) 70%, rgba(255,255,255,.12))' }} />
      <div className="absolute inset-3 border border-dashed rounded-[3px]" style={{ borderColor: isDark(hex) ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.18)' }} />
      <span className="absolute bottom-5 left-0 right-0 text-center text-[0.62rem] tracking-[0.28em] uppercase" style={{ color: isDark(hex) ? 'rgba(255,255,255,.85)' : 'rgba(30,30,30,.7)' }}>{name}</span>
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

  const shownRight = flipped < N ? LEAVES[flipped].front : LEAVES[0].front
  const shownLeft = flipped > 0 ? LEAVES[flipped - 1].back : null

  return (
    <figure className="select-none" aria-label="Cloth colour flip book">
      <div className="relative mx-auto" style={{ width: 'min(440px, 86vw)', height: 'min(340px, 66vw)', perspective: '1600px' }}>
        {/* soft shadow under the book */}
        <div className="absolute left-[8%] right-[8%] -bottom-3 h-6 rounded-[50%] bg-black/10 blur-xl" />
        {/* left page rest */}
        <div className="absolute top-0 bottom-0 left-0 w-1/2 rounded-l-[10px] bg-[#F3EDE2] border border-subtle-border" />
        <div className="absolute top-0 bottom-0 left-1/2 w-1/2 rounded-r-[10px] bg-[#F3EDE2] border border-subtle-border" />
        {LEAVES.map((leaf, i) => {
          const isFlipped = flipped > i
          return (
            <div key={i} className="absolute top-0 bottom-0 left-1/2 w-1/2"
              onClick={() => setFlipped((f) => (f === i + 1 ? i : i + 1))}
              style={{
                transformStyle: 'preserve-3d', transformOrigin: 'left center', cursor: 'pointer',
                transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                transition: `transform ${flipped === 0 && !isFlipped ? 600 : 1200}ms cubic-bezier(.45,.05,.2,1)`,
                zIndex: isFlipped ? i : N - i,
              }}>
              <Cloth name={leaf.front[0]} hex={leaf.front[1]} side="front" />
              <Cloth name={leaf.back[0]} hex={leaf.back[1]} side="back" />
            </div>
          )
        })}
        {/* spine */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/25 z-50" />
        {Array.from({ length: 5 }).map((_, k) => (
          <span key={k} className="absolute left-1/2 -ml-[5px] w-[10px] h-[10px] rounded-full border border-black/30 bg-[#EFE8DA] z-50" style={{ top: `${10 + k * 20}%` }} />
        ))}
      </div>
      <figcaption className="mt-8 text-center text-[0.7rem] tracking-[0.3em] uppercase text-bronze h-4" aria-live="off">
        {shownLeft ? `${shownLeft[0]}  ·  ` : ''}{shownRight[0]}
      </figcaption>
    </figure>
  )
}
