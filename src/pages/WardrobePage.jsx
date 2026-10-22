import { useEffect, useMemo, useRef, useState } from 'react'
import { Brain, Send, Layers, MessageSquareText, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'
import { requestOutfits } from '../data/api'
import ApprovalGate from '../components/ApprovalGate'
import OutfitCard from '../components/OutfitCard'
import { PROMPT_SUGGESTIONS, curateByPrompt } from '../data/outfitsData'

function Hub() {
  const { profile, setOutfits } = useProfile()
  const [mode, setMode] = useState('A')
  const [occasion, setOccasion] = useState('All')
  const [prompt, setPrompt] = useState('')
  const [custom, setCustom] = useState(null) // { looks, request }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [allowUnverified, setAllowUnverified] = useState(false)
  const started = useRef(false)

  const generated = profile.outfits
  const base = generated // never show un-linked demo looks
  const isDemo = !generated.length

  // Prompt 2: photos + analysis + chosen stores -> real looks with verified product links.
  const generate = async (request) => {
    setBusy(true); setError('')
    try {
      const out = await requestOutfits(
        profile, request,
        ({ wave, found }) => setProgress(`Search wave ${wave} · ${found} in-stock look${found === 1 ? '' : 's'} found so far`),
        (looks) => { if (request) setCustom({ looks, request }); else setOutfits(looks, { stores: profile.demographics.preferredApps, shortfall: 0 }) },
        allowUnverified,
      )
      if (request) { setCustom({ looks: out.looks, request, meta: out }); setOutfits([...out.looks, ...generated], profile.outfitsMeta) }
      else setOutfits(out.looks, { stores: out.stores, linkedPieces: out.linkedPieces, totalPieces: out.totalPieces, shortfall: out.shortfall, generatedAt: out.generatedAt, model: out.model })
    } catch (e) {
      setError(e.code === 'no_key' ? 'The AI is not configured — add OPENROUTER_API_KEY to .env and restart. ' : e.message)
    } finally { setBusy(false) }
  }

  useEffect(() => {
    if (started.current || generated.length) return
    started.current = true
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const occasions = ['All', ...Array.from(new Set(base.map((o) => o.occasion)))]
  const looks = useMemo(() => {
    const src = mode === 'B' && custom ? custom.looks : base
    return occasion === 'All' ? src : src.filter((o) => o.occasion === occasion)
  }, [mode, custom, occasion, base])
  const trace = mode === 'B' && prompt ? curateByPrompt(prompt).trace : null
  const meta = profile.outfitsMeta

  const run = (text) => {
    const t = (text ?? prompt).trim()
    if (!t) return
    setPrompt(t)
    generate(t)
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="eyebrow">Dual curation hub</div>
      <h1 className="text-5xl text-wine font-semibold mt-2">Your wardrobe, diagnosed</h1>
      <p className="text-bronze text-sm mt-3 max-w-2xl">Complete top + bottom + shoes looks that the AI styled from your photos and diagnosis, using only the stores you selected. Each “Buy” button opens that exact product page — if The AI could not verify one, it says so instead of guessing.</p>
      {busy && <div className="mt-5 flex items-center gap-3 bg-white hairline rounded-xl px-5 py-4 text-sm text-bronze"><Loader2 className="animate-spin text-wine" size={18} /> The AI is styling you and searching {profile.demographics.preferredApps.join(', ')} for real products… this can take a few minutes. {progress}</div>}
      <label className="mt-4 flex items-start gap-2 text-xs text-bronze max-w-2xl cursor-pointer">
        <input type="checkbox" className="mt-0.5 accent-[#4A121A]" checked={allowUnverified} onChange={(e) => { setAllowUnverified(e.target.checked) }} />
        <span>Also include H&amp;M, Zara and Ajio. They block automated stock checks, so by default only <b>Myntra</b> and <b>Tata CLiQ</b> items — whose stock is checked live on the store page — are shown. Items from the others rely on the AI's reading of the page and may sell out.</span>
      </label>
      {error && <div className="mt-5 flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-5 py-4 text-sm"><AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}</div>}
      {!isDemo && meta && <p className="mt-4 text-xs text-bronze">Every piece in these {generated.length} looks has a verified exact product link{meta.shortfall ? ` (only ${generated.length} fully-linked looks could be found — try adding more stores)` : ''} · stores: {meta.stores.join(', ')} · <button onClick={() => generate()} disabled={busy} className="underline inline-flex items-center gap-1"><RefreshCw size={11} /> regenerate</button></p>}
      {isDemo && !busy && <p className="mt-4 text-sm text-bronze">No looks yet. <button onClick={() => generate()} className="underline font-semibold text-wine">Generate looks with verified product links</button></p>}

      <div className="mt-8 inline-flex rounded-full bg-white hairline p-1">
        <button onClick={() => setMode('A')} className={`inline-flex items-center gap-2 text-xs font-semibold rounded-full px-5 py-2.5 ${mode === 'A' ? 'bg-wine text-cream' : 'text-bronze'}`}><Layers size={14} /> Mode A · Curated 10 looks</button>
        <button onClick={() => setMode('B')} className={`inline-flex items-center gap-2 text-xs font-semibold rounded-full px-5 py-2.5 ${mode === 'B' ? 'bg-wine text-cream' : 'text-bronze'}`}><MessageSquareText size={14} /> Mode B · Ask in your own words</button>
      </div>

      {mode === 'B' && (
        <div className="mt-6 bg-white hairline rounded-2xl p-6">
          <form onSubmit={(e) => { e.preventDefault(); run() }} className="flex gap-2">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Burgundy workwear under ₹10,000 with a sweetheart neckline"
              className="flex-1 border border-subtle-border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-wine" />
            <button className="inline-flex items-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full px-6"><Send size={14} /> Curate</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">{PROMPT_SUGGESTIONS.map((s) => <button key={s} onClick={() => run(s)} className="text-[0.72rem] text-bronze border border-subtle-border rounded-full px-3 py-1.5 hover:border-wine hover:text-wine">{s}</button>)}</div>
          {trace && (
            <div className="mt-5 bg-cream rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-wine"><Brain size={14} /> How your request was read</div>
              <ul className="mt-2 space-y-1 text-xs text-bronze list-disc pl-4">{trace.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {occasions.map((o) => (
          <button key={o} onClick={() => setOccasion(o)} className={`text-xs rounded-full px-4 py-2 border ${occasion === o ? 'bg-wine text-cream border-wine' : 'bg-white border-subtle-border text-charcoal hover:border-wine'}`}>{o}</button>
        ))}
      </div>

      {mode === 'B' && !custom
        ? <p className="mt-10 text-sm text-bronze">Describe an occasion, colour, neckline or budget above to see ranked looks.</p>
        : looks.length === 0
          ? <p className="mt-10 text-sm text-bronze">No looks match that occasion — try "All".</p>
          : <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-6">{looks.map((o, i) => <OutfitCard key={o.id} outfit={o} rank={mode === 'B' && custom ? i + 1 : undefined} />)}</div>}
    </div>
  )
}

export default function WardrobePage() {
  return <ApprovalGate><Hub /></ApprovalGate>
}
