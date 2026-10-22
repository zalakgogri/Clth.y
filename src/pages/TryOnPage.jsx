import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Heart, Repeat, ShoppingBag, SplitSquareHorizontal } from 'lucide-react'
import ApprovalGate from '../components/ApprovalGate'
import ModelFigure from '../components/ModelFigure'
import SwapModal from '../components/SwapModal'
import { useProfile } from '../data/ProfileContext'
import { getOutfit } from '../data/outfitsData'
import { STUDIO_BOTTOMS, STUDIO_SHOES, STUDIO_TOPS, calculateHarmonyMetrics } from '../data/studioItems'
import { inr } from '../data/retail'

const ANGLES = [{ id: 'front', label: 'Front', photo: 4 }, { id: 'side', label: 'Side', photo: 2 }, { id: 'candid', label: 'Candid', photo: 4 }]
const PRESET_POOL = { Topwear: STUDIO_TOPS, Bottomwear: STUDIO_BOTTOMS, Footwear: STUDIO_SHOES }

function TryOn({ outfit }) {
  const { profile, toggleWishlist } = useProfile()
  const [pieces, setPieces] = useState({ top: outfit.top, bottom: outfit.bottom, shoe: outfit.shoe })
  const [angle, setAngle] = useState('front')
  const [compare, setCompare] = useState(false)
  const [split, setSplit] = useState(50)
  const [swap, setSwap] = useState(null) // 'top' | 'bottom' | 'shoe'
  const aiPieces = profile.outfits.flatMap((o) => o.pieces)
  const poolFor = (role) => (aiPieces.some((p) => p.role === role) ? aiPieces.filter((p) => p.role === role) : PRESET_POOL[role])

  const list = [pieces.top, pieces.bottom, pieces.shoe]
  const changed = list.some((p, i) => p.name !== outfit.pieces[i].name)
  const metrics = useMemo(() => calculateHarmonyMetrics(pieces.top, pieces.bottom, pieces.shoe), [pieces])
  const score = changed ? metrics.overall : outfit.suitability
  const total = list.every((p) => p.price != null) ? list.reduce((s, p) => s + p.price, 0) : null
  const price = changed ? total : outfit.bundlePrice
  const key = `tryon:${list.map((p) => p.name).join('|')}`
  const saved = profile.wishlist.some((w) => w.key === key)
  const rawPhoto = profile.photos[ANGLES.find((a) => a.id === angle).photo]

  const save = () => toggleWishlist({ key, label: changed ? `${outfit.name} (customised)` : outfit.name, pieces: list, total: price, score, occasion: outfit.occasion })
  const linked = list.filter((p) => p.url)
  const openAll = () => linked.forEach((p) => window.open(p.url, '_blank', 'noopener,noreferrer'))

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <Link to="/wardrobe" className="text-xs text-bronze hover:text-wine">← Wardrobe Hub</Link>
      <div className="mt-3 grid lg:grid-cols-[3fr_2fr] gap-8">
        <div>
          <div className="relative bg-white hairline rounded-2xl overflow-hidden mx-auto max-w-xl aspect-[400/640]">
            <ModelFigure top={pieces.top} bottom={pieces.bottom} shoe={pieces.shoe} angle={angle} className="absolute inset-0 w-full h-full" />
            {compare && (
              <>
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                  <img src={rawPhoto} alt="Raw photo" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 text-[0.6rem] tracking-widest bg-charcoal/80 text-cream rounded-full px-2.5 py-1">RAW PHOTO</span>
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-gold-warm" style={{ left: `${split}%` }} />
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {ANGLES.map((a) => <button key={a.id} onClick={() => setAngle(a.id)} className={`text-xs rounded-full px-5 py-2 border ${angle === a.id ? 'bg-wine text-cream border-wine' : 'bg-white border-subtle-border'}`}>{a.label}</button>)}
            <button onClick={() => setCompare(!compare)} className={`inline-flex items-center gap-1.5 text-xs rounded-full px-5 py-2 border ${compare ? 'bg-gold-warm text-charcoal border-gold-warm' : 'bg-white border-subtle-border'}`}><SplitSquareHorizontal size={13} /> Compare raw</button>
          </div>
          {compare && <input type="range" min="0" max="100" value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label="Comparison slider" className="block mx-auto mt-3 w-64 accent-[#4A121A]" />}
        </div>

        <aside>
          <div className="eyebrow">{outfit.occasion}</div>
          <h1 className="text-5xl text-wine font-semibold mt-1">{outfit.name}</h1>

          <div className="mt-5 bg-white hairline rounded-2xl p-5">
            <div className="flex items-end justify-between"><span className="text-[0.68rem] uppercase tracking-widest text-bronze">DOES suitability</span><span className="text-4xl font-editorial font-bold text-wine">{score}%</span></div>
            <div className="h-2 bg-cream rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-gold to-gold-warm transition-all" style={{ width: `${score}%` }} /></div>
            <p className="text-xs text-bronze mt-3 leading-relaxed">{changed ? metrics.notes.join(' ') : outfit.harmony}</p>
          </div>

          <ul className="mt-5 bg-white hairline rounded-2xl divide-y divide-subtle-border">
            {[['top', pieces.top], ['bottom', pieces.bottom], ['shoe', pieces.shoe]].map(([k, p]) => (
              <li key={k} className="p-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-subtle-border shrink-0" style={{ background: p.color }} />
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.name}</div><div className="text-[0.7rem] text-bronze">{p.role} · {p.brand} · {inr(p.price)}</div></div>
                <button onClick={() => setSwap(k)} title="Swap piece" className="text-bronze hover:text-wine p-1.5"><Repeat size={15} /></button>
                {p.url
                  ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[0.68rem] font-semibold text-wine border border-wine/30 rounded-full px-2.5 py-1 inline-flex items-center gap-0.5 hover:bg-wine hover:text-cream">{p.platform} <ArrowUpRight size={12} /></a>
                  : <span className="text-[0.62rem] text-bronze/70 border border-dashed border-subtle-border rounded-full px-2.5 py-1">no exact link</span>}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-end justify-between px-1">
            <span className="text-xs text-bronze">{changed || !outfit.discount ? 'Look total' : `Bundle −${outfit.discount}%`}</span>
            <span><span className="text-sm text-bronze line-through mr-2">{changed || !outfit.discount ? '' : inr(total)}</span><span className="text-3xl font-editorial font-bold text-wine">{inr(price)}</span></span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={openAll} disabled={!linked.length} className="inline-flex items-center justify-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full py-3.5 hover:bg-charcoal disabled:opacity-40"><ShoppingBag size={15} /> Open {linked.length} item page{linked.length === 1 ? '' : 's'}</button>
            <button onClick={save} className={`inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-full py-3.5 border ${saved ? 'bg-gold-warm border-gold-warm text-charcoal' : 'border-wine text-wine hover:bg-wine hover:text-cream'}`}><Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save look'}</button>
          </div>
          <p className="text-[0.66rem] text-bronze mt-3">"Open item pages" opens each verified product page in its own tab — allow pop-ups if your browser blocks some.</p>
          <button onClick={() => setPieces({ top: outfit.top, bottom: outfit.bottom, shoe: outfit.shoe })} className="mt-2 text-xs text-bronze underline">Reset to original look</button>
        </aside>
      </div>

      {swap && (
        <SwapModal title={`Swap ${pieces[swap].role.toLowerCase()}`}
          items={[outfit[swap], ...poolFor(pieces[swap].role).filter((x) => x.name !== outfit[swap].name)]}
          current={pieces[swap]} onClose={() => setSwap(null)} onPick={(it) => { setPieces({ ...pieces, [swap]: it }); setSwap(null) }} />
      )}
    </div>
  )
}

export default function TryOnPage() {
  const { id } = useParams()
  const { profile } = useProfile()
  const outfit = getOutfit(id, profile.outfits)
  return (
    <ApprovalGate>
      {outfit ? <TryOn key={outfit.id} outfit={outfit} /> : (
        <div className="max-w-xl mx-auto py-24 text-center"><h1 className="text-4xl text-wine">Look not found</h1><Link to="/wardrobe" className="underline text-sm mt-4 inline-block">Back to Wardrobe Hub</Link></div>
      )}
    </ApprovalGate>
  )
}
