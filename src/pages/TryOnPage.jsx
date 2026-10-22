import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Heart, Loader2, Repeat, ShoppingBag, SplitSquareHorizontal, AlertCircle, Sparkles } from 'lucide-react'
import { checkStock, requestTryOn } from '../data/api'
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
  const [real, setReal] = useState({ status: 'idle', image: null, error: '' })
  const [showIllustration, setShowIllustration] = useState(false)
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
  const hasRealPhoto = !!profile.customPhotos?.[4]
  const allImages = list.every((p) => p.image)
  const rawPhoto = hasRealPhoto ? profile.photos[4] : profile.photos[ANGLES.find((a) => a.id === angle).photo]
  const sig = list.map((p) => p.url || p.name).join('|')

  const [notice, setNotice] = useState('')

  // "Try on me": re-check stock first; if something sold out, swap in an in-stock alternative, then dress your photo.
  const runTryOn = async () => {
    setNotice('')
    setReal({ status: 'loading', image: null, error: '' })
    let current = { ...pieces }
    try {
      const keys = ['top', 'bottom', 'shoe']
      const checks = await checkStock(keys.map((k) => current[k])).catch(() => [])
      const msgs = []
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        if (checks[i]?.status === 'out') {
          const alt = (current[k].alternates || []).find((a) => a.url && a.url !== current[k].url)
          if (!alt) { setReal({ status: 'error', image: null, error: `“${current[k].name}” just sold out and there is no in-stock alternative saved. Go back and generate a fresh look.` }); return }
          msgs.push(`“${current[k].name}” sold out — swapped for “${alt.name}”.`)
          current = { ...current, [k]: { ...alt, role: current[k].role, alternates: (current[k].alternates || []).filter((a) => a.url !== alt.url) } }
        }
      }
      if (msgs.length) { setPieces(current); setNotice(msgs.join(' ')) }
      const out = await requestTryOn(profile, [current.top, current.bottom, current.shoe])
      setReal({ status: 'done', image: out.image, error: '' })
      setShowIllustration(false)
    } catch (e) {
      setReal({ status: 'error', image: null, error: e.message })
    }
  }
  // Opening a look goes straight into the try-on (cached results appear instantly).
  const autoRan = useRef(false)
  useEffect(() => {
    if (autoRan.current || !hasRealPhoto || !allImages) return
    autoRan.current = true
    runTryOn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const showReal = real.status === 'done' && !showIllustration


  const save = () => toggleWishlist({ key, label: changed ? `${outfit.name} (customised)` : outfit.name, pieces: list, total: price, score, occasion: outfit.occasion })
  const linked = list.filter((p) => p.url)
  const openAll = () => linked.forEach((p) => window.open(p.url, '_blank', 'noopener,noreferrer'))

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <Link to="/wardrobe" className="text-xs text-bronze hover:text-wine">← Wardrobe Hub</Link>
      <div className="mt-3 grid lg:grid-cols-[3fr_2fr] gap-8">
        <div>
          <div className="relative bg-white hairline rounded-2xl overflow-hidden mx-auto max-w-xl aspect-[400/640]">
            {showReal
              ? <img src={real.image} alt="You wearing this look" className="absolute inset-0 w-full h-full object-contain bg-cream" />
              : <ModelFigure top={pieces.top} bottom={pieces.bottom} shoe={pieces.shoe} angle={angle} className="absolute inset-0 w-full h-full" />}
            {real.status === 'loading' && (
              <div className="absolute inset-0 bg-charcoal/55 flex flex-col items-center justify-center text-cream text-center px-8 gap-3">
                <Loader2 className="animate-spin" size={30} />
                <p className="text-sm">Checking stock, then dressing you in the real items from the store pages…</p>
                <p className="text-[0.7rem] text-cream/70">About 15–30 seconds</p>
              </div>
            )}
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
            {!showReal && ANGLES.map((a) => <button key={a.id} onClick={() => setAngle(a.id)} className={`text-xs rounded-full px-5 py-2 border ${angle === a.id ? 'bg-wine text-cream border-wine' : 'bg-white border-subtle-border'}`}>{a.label}</button>)}
            {real.status === 'done' && <button onClick={() => setShowIllustration(!showIllustration)} className="text-xs rounded-full px-5 py-2 border bg-white border-subtle-border">{showIllustration ? 'Show my real try-on' : 'Show illustration'}</button>}
            <button onClick={() => setCompare(!compare)} className={`inline-flex items-center gap-1.5 text-xs rounded-full px-5 py-2 border ${compare ? 'bg-gold-warm text-charcoal border-gold-warm' : 'bg-white border-subtle-border'}`}><SplitSquareHorizontal size={13} /> Compare raw</button>
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={runTryOn} disabled={!hasRealPhoto || !allImages || real.status === 'loading'}
              className="inline-flex items-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-charcoal disabled:opacity-40">
              <Sparkles size={15} /> {real.status === 'done' ? 'Try on again' : real.status === 'loading' ? 'Trying on…' : 'Try on me'}
            </button>
          </div>
          {!hasRealPhoto && <p className="mt-3 text-center text-xs text-bronze">Add your own photos in Intake (especially the <b>full-body</b> one) to see these exact items on you, on a white background. Showing a generic illustration.</p>}
          {hasRealPhoto && !allImages && <p className="mt-3 text-center text-xs text-bronze">A piece here has no store photo, so the real try-on is unavailable — showing the illustration.</p>}
          {notice && <div className="mt-3 mx-auto max-w-xl bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-xs">{notice}</div>}
          {real.status === 'error' && <div className="mt-3 mx-auto max-w-xl flex gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-xs"><AlertCircle size={15} className="shrink-0 mt-0.5" /><span>{real.error} <button className="underline" onClick={runTryOn}>Try again</button></span></div>}
          {compare && <input type="range" min="0" max="100" value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label="Comparison slider" className="block mx-auto mt-3 w-64 accent-[#3E1F47]" />}
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
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.name}</div><div className="text-[0.7rem] text-bronze">{p.role} · {p.brand} · {inr(p.price)}{p.sizes?.length > 0 && <> · <span className={p.stock === 'verified' ? 'text-emerald-800' : ''}>sizes {p.sizes.slice(0, 5).join(', ')}</span></>}</div></div>
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
