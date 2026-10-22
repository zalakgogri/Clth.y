import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, ArrowUpRight } from 'lucide-react'
import ModelFigure from '../components/ModelFigure'
import { useProfile } from '../data/ProfileContext'
import { STUDIO_BOTTOMS, STUDIO_SHOES, STUDIO_TOPS, calculateHarmonyMetrics } from '../data/studioItems'
import { inr } from '../data/retail'

function Carousel({ title, items, index, setIndex }) {
  const it = items[index]
  const go = (d) => setIndex((index + d + items.length) % items.length)
  return (
    <div className="bg-white hairline rounded-2xl p-5">
      <div className="flex items-center justify-between"><h3 className="text-xl text-wine font-semibold">{title}</h3><span className="text-[0.65rem] text-bronze">{index + 1} / {items.length}</span></div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => go(-1)} aria-label={`Previous ${title}`} className="p-2 rounded-full border border-subtle-border hover:border-wine"><ChevronLeft size={16} /></button>
        <div className="flex-1 h-24 rounded-xl border border-subtle-border flex items-end p-3" style={{ background: it.color }}>
          <span className="text-[0.62rem] tracking-widest uppercase px-2 py-1 rounded bg-white/80">{it.neckline || (it.rise && `${it.rise} rise`) || `${it.heel} cm heel`}</span>
        </div>
        <button onClick={() => go(1)} aria-label={`Next ${title}`} className="p-2 rounded-full border border-subtle-border hover:border-wine"><ChevronRight size={16} /></button>
      </div>
      <div className="mt-3 text-sm font-medium">{it.name}</div>
      <div className="flex items-center justify-between text-[0.72rem] text-bronze"><span>{it.brand} · {inr(it.price)}</span>
        {it.url ? <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-wine">Buy on {it.platform} <ArrowUpRight size={12} /></a> : <span className="text-bronze/70">no exact link</span>}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">{items.map((x, i) => <button key={x.id ?? x.name + i} onClick={() => setIndex(i)} aria-label={x.name} className={`w-5 h-5 rounded-full border ${i === index ? 'border-wine ring-2 ring-wine/30' : 'border-subtle-border'}`} style={{ background: x.color }} />)}</div>
    </div>
  )
}

const Bar = ({ label, v }) => (
  <div><div className="flex justify-between text-[0.7rem] text-bronze"><span>{label}</span><span className="font-semibold text-charcoal">{v}</span></div>
    <div className="h-1.5 bg-cream rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-gold to-gold-warm transition-all" style={{ width: `${v}%` }} /></div></div>
)

export default function StudioPage() {
  const { profile, toggleWishlist } = useProfile()
  const [ti, setTi] = useState(0)
  const [bi, setBi] = useState(0)
  const [si, setSi] = useState(0)
  const [angle, setAngle] = useState('front')
  // Prefer the real, linked pieces the AI chose for this client; fall back to the demo catalogue.
  const ai = profile.outfits.flatMap((o) => o.pieces)
  const dedupe = (arr) => arr.filter((p, i) => arr.findIndex((q) => q.name === p.name && q.platform === p.platform) === i)
  const pool = (role, preset) => { const l = dedupe(ai.filter((p) => p.role === role)); return l.length ? l : preset }
  const TOPS = pool('Topwear', STUDIO_TOPS), BOTTOMS = pool('Bottomwear', STUDIO_BOTTOMS), SHOES = pool('Footwear', STUDIO_SHOES)
  const top = TOPS[ti % TOPS.length], bottom = BOTTOMS[bi % BOTTOMS.length], shoe = SHOES[si % SHOES.length]
  const m = calculateHarmonyMetrics(top, bottom, shoe)
  const key = `studio:${[top, bottom, shoe].map((p) => p.id ?? p.name).join('|')}`
  const saved = profile.wishlist.some((w) => w.key === key)
  const total = [top, bottom, shoe].every((p) => p.price != null) ? top.price + bottom.price + shoe.price : null
  const verdict = m.overall >= 90 ? 'Exceptional harmony' : m.overall >= 75 ? 'Good harmony' : m.overall >= 55 ? 'Workable, with caveats' : 'Dissonant pairing'

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="eyebrow">Interactive atelier</div>
      <h1 className="text-5xl text-wine font-semibold mt-2">Mix &amp; Match Studio</h1>
      <p className="text-bronze text-sm mt-3 max-w-2xl">Cycle through ten tops, bottoms and shoes. The Harmony Calculator rescored your ensemble instantly against your DOES passport.</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_1.1fr_1fr] gap-6 items-start">
        <div className="space-y-4">
          <Carousel title="Topwear" items={TOPS} index={ti} setIndex={setTi} />
          <Carousel title="Bottomwear" items={BOTTOMS} index={bi} setIndex={setBi} />
          <Carousel title="Footwear" items={SHOES} index={si} setIndex={setSi} />
        </div>

        <div>
          <div className="bg-white hairline rounded-2xl overflow-hidden aspect-[400/640] max-w-sm mx-auto relative">
            <ModelFigure top={top} bottom={bottom} shoe={shoe} angle={angle} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="flex justify-center gap-2 mt-3">{['front', 'side', 'candid'].map((a) => <button key={a} onClick={() => setAngle(a)} className={`text-xs capitalize rounded-full px-4 py-1.5 border ${angle === a ? 'bg-wine text-cream border-wine' : 'bg-white border-subtle-border'}`}>{a}</button>)}</div>
          <div className="mt-4 flex h-8 rounded-full overflow-hidden border border-subtle-border max-w-sm mx-auto" aria-label="Live palette">
            {[top, bottom, shoe].map((p) => <div key={p.role} className="flex-1" style={{ background: p.color }} title={p.name} />)}
          </div>
        </div>

        <div className="bg-white hairline rounded-2xl p-6 lg:sticky lg:top-24">
          <div className="eyebrow">Harmony calculator</div>
          <div className="flex items-end gap-3 mt-1"><span className="text-6xl font-editorial font-bold text-wine leading-none">{m.overall}</span><span className="text-sm text-bronze pb-1.5">/ 100 · {verdict}</span></div>
          <div className="mt-5 space-y-3">
            <Bar label="Colour temperature & palette" v={m.color} />
            <Bar label="Neckline vs middle-third (0.88)" v={m.neckline} />
            <Bar label="Waistline · Wave high-rise" v={m.waist} />
            <Bar label="Heel height ergonomics" v={m.heel} />
          </div>
          <ul className="mt-5 text-xs text-bronze space-y-1.5 list-disc pl-4">{m.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          <div className="mt-5 flex items-center justify-between border-t border-subtle-border pt-4"><span className="text-xs text-bronze">Ensemble total</span><span className="text-2xl font-editorial font-bold text-wine">{inr(total)}</span></div>
          <button onClick={() => toggleWishlist({ key, label: 'Custom ensemble', pieces: [top, bottom, shoe], total, score: m.overall, occasion: 'Mix & Match Studio' })}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-full py-3.5 border ${saved ? 'bg-gold-warm border-gold-warm text-charcoal' : 'bg-wine text-cream border-wine hover:bg-charcoal'}`}>
            <Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved to lookbook' : 'Save custom ensemble'}
          </button>
        </div>
      </div>
    </div>
  )
}
