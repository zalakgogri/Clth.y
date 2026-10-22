import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Download, FileJson, CheckCircle2, Printer } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'
import { DIAGNOSTIC_MODULES, FEATURE_CODES as BASE_CODES, CONSULT_META } from '../data/diagnosticMatrix'

const Section = ({ eyebrow, title, children, className = '' }) => (
  <section className={`mt-14 ${className}`}>
    <div className="eyebrow">{eyebrow}</div>
    <h2 className="text-4xl text-wine font-semibold mt-1 mb-6">{title}</h2>
    {children}
  </section>
)

export default function ReportPage() {
  const { profile, approveReport, updateDemographics } = useProfile()
  const navigate = useNavigate()
  const R = profile.report
  const d = profile.demographics
  const findings = R.moduleFindings || {}
  const FEATURE_CODES = BASE_CODES.map((f) => {
    const ai = (R.featureCodes || []).find((x) => x.code === f.code)
    return ai ? { ...f, value: ai.value || f.value, rating: ai.rating || f.rating, action: ai.action || f.action } : f
  })
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const clientName = d.clientName ?? ''

  const approve = () => {
    approveReport(true)
    const end = Date.now() + 1200
    ;(function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#D4AF37', '#C35831', '#4A121A'] })
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#D4AF37', '#C35831', '#4A121A'] })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
    setTimeout(() => navigate('/wardrobe'), 1500)
  }

  const downloadJson = () => {
    const dossier = {
      generatedAt: new Date().toISOString(),
      client: { name: clientName || 'Client', demographics: d },
      clinic: R.clinic, clinicId: R.clinicId, engine: R.engineVersion,
      colors: { power: R.powerColors, dissonant: R.dissonantColors },
      facial: R.facial, skeletal: R.skeletal, fabrics: R.fabrics, hardware: R.hardware,
      source: profile.reportSource, seasonType: R.seasonType, summary: R.summary,
      modules: DIAGNOSTIC_MODULES.map((m) => ({ ...m, params: m.params.map((p) => ({ ...p, finding: findings[p.name] || p.finding })) })), featureCodes: FEATURE_CODES,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'clthy-diagnostic-dossier.json' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dossier-root max-w-6xl mx-auto px-5 py-12">
      <header className="border-b-2 border-wine pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">{R.clinic} · ID {R.clinicId}</div>
          <h1 className="text-5xl md:text-6xl text-wine font-semibold mt-2">All-in-One Image &amp; Color Consultation</h1>
          <p className="text-sm text-bronze mt-2">{profile.reportSource === 'ai' ? `AI · ${R.model || ''}` : R.engineVersion} · {d.gender}, {d.age} · {d.heightCm} cm · {d.weightKg} kg · {d.origin}</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-wine text-cream text-xs font-semibold rounded-full px-5 py-3 hover:bg-charcoal"><Download size={14} /> Download Diagnostic Analysis Dossier (PDF)</button>
          <button onClick={downloadJson} className="inline-flex items-center gap-2 border border-wine/40 text-wine text-xs font-semibold rounded-full px-5 py-3 hover:bg-wine hover:text-cream"><FileJson size={14} /> Download JSON Diagnostic Dossier</button>
        </div>
      </header>

      <div className={`no-print mt-6 rounded-xl border px-5 py-3 text-xs ${profile.reportSource === 'ai' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
        {profile.reportSource === 'ai'
          ? <>Personalised reading by AI as a DOES master analyst from your photos{R.seasonType ? <> · <b>{R.seasonType}</b></> : null}.{profile.reportNote ? <> Note: {profile.reportNote}</> : null}</>
          : <>{profile.reportNote || 'Demo diagnosis (not generated from your photos).'}</>}
      </div>
      {profile.reportSource === 'ai' && (
        <div className="no-print mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] text-bronze">
          <span>Analysed from:</span>
          {(R.photosUsed || []).map((slot) => <img key={slot} src={profile.photos[slot]} alt="" className="w-9 h-12 object-cover rounded border border-subtle-border" />)}
          <span>· generated {R.generatedAt ? new Date(R.generatedAt).toLocaleString() : ''} by {R.model}</span>
        </div>
      )}
      {R.summary && <p className="mt-5 text-sm text-bronze leading-relaxed max-w-3xl">{R.summary}</p>}

      <Section eyebrow="Optical Chromatics" title="Your 6 power colours">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {R.powerColors.map((c) => (
            <div key={c.hex} className="print-break bg-white hairline rounded-xl overflow-hidden">
              <div className="h-24" style={{ background: c.hex }} />
              <div className="p-3"><div className="text-sm font-semibold">{c.name}</div><div className="text-[0.65rem] text-bronze font-mono">{c.hex}</div><p className="text-[0.68rem] text-bronze mt-1.5 leading-snug">{c.note}</p></div>
            </div>
          ))}
        </div>
        <h3 className="text-2xl text-wine font-semibold mt-10 mb-4">6 unsuitable / dissonant colours</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {R.dissonantColors.map((c) => (
            <div key={c.hex} className="print-break bg-white hairline rounded-xl overflow-hidden">
              <div className="h-24 relative border-b border-subtle-border" style={{ background: c.hex }}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 10 10"><line x1="0" y1="10" x2="10" y2="0" stroke="#7A1F1F" strokeWidth="0.3" /></svg>
              </div>
              <div className="p-3"><div className="text-sm font-semibold">{c.name}</div><div className="text-[0.65rem] text-bronze font-mono">{c.hex}</div><p className="text-[0.68rem] text-red-900/80 mt-1.5 leading-snug">{c.risk}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid md:grid-cols-2 gap-6 mt-14">
        <section className="print-break bg-white hairline rounded-2xl p-7">
          <div className="eyebrow">Facial architecture</div>
          <h2 className="text-3xl text-wine font-semibold mt-1">{R.facial.thirds} · {R.facial.ratio}</h2>
          <p className="text-sm text-bronze mt-3 leading-relaxed">{R.facial.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">{R.facial.necklines.map((n) => <span key={n} className="text-xs bg-wine text-cream rounded-full px-3 py-1">{n}</span>)}</div>
          <ul className="mt-4 text-xs text-red-900/80 list-disc pl-4 space-y-1">{R.facial.avoid.map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
        <section className="print-break bg-white hairline rounded-2xl p-7">
          <div className="eyebrow">Skeletal tailoring</div>
          <h2 className="text-3xl text-wine font-semibold mt-1">{R.skeletal.frame}</h2>
          <p className="text-sm text-bronze mt-3 leading-relaxed">{R.skeletal.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2"><span className="text-xs bg-wine text-cream rounded-full px-3 py-1">{R.skeletal.rise}</span><span className="text-xs bg-wine text-cream rounded-full px-3 py-1">{R.skeletal.tailoring}</span></div>
        </section>
        <section className="print-break bg-white hairline rounded-2xl p-7 md:col-span-2">
          <div className="eyebrow">Fabric &amp; hardware matrix</div>
          <div className="grid sm:grid-cols-3 gap-6 mt-3 text-sm">
            <div><h3 className="text-xl text-wine font-semibold">Fabrics</h3><ul className="mt-2 space-y-1 text-bronze">{R.fabrics.map((f) => <li key={f}>✓ {f}</li>)}</ul></div>
            <div><h3 className="text-xl text-wine font-semibold">Hardware</h3><ul className="mt-2 space-y-1 text-bronze">{R.hardware.map((f) => <li key={f}>✓ {f}</li>)}</ul></div>
            <div><h3 className="text-xl text-red-900 font-semibold">Avoid</h3><ul className="mt-2 space-y-1 text-bronze">{R.avoidFabrics.map((f) => <li key={f}>✗ {f}</li>)}</ul></div>
          </div>
        </section>
      </div>

      <Section eyebrow="Korean image consulting methodology" title="Diagnostic Feature Extraction Matrix" className="print-page-break">
        <div className="space-y-8">
          {DIAGNOSTIC_MODULES.map((m) => (
            <div key={m.id}>
              <h3 className="text-2xl text-wine font-semibold mb-2">Module {m.id} · {m.title}</h3>
              <div className="overflow-x-auto bg-white hairline rounded-xl">
                <table className="w-full text-left text-[0.72rem] leading-snug">
                  <thead className="bg-cream text-bronze uppercase tracking-wider text-[0.6rem]"><tr>
                    {['Sub-feature / metric', 'Measurement / diagnostic method', 'Classification options & scales', 'Your result', 'Impact on clothing selection', 'Impact on makeup & styling'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>{m.params.map((p) => {
                    const f = findings[p.name]
                    const res = typeof f === 'object' ? f : { classification: f || p.finding }
                    return (
                    <tr key={p.name} className="border-t border-subtle-border align-top print-break">
                      <td className="px-3 py-2.5 font-semibold text-wine">{p.name}</td><td className="px-3 py-2.5">{p.measure}</td><td className="px-3 py-2.5 text-bronze">{p.scale}</td>
                      <td className="px-3 py-2.5 min-w-40"><div className="font-semibold text-charcoal">{res.classification}</div>{res.evidence && <div className="text-bronze mt-0.5">{res.evidence}</div>}{res.confidence && <div className="text-[0.6rem] uppercase tracking-wider text-gold mt-1">{res.confidence} confidence</div>}</td>
                      <td className="px-3 py-2.5 min-w-44">{res.clothing ? <><div className="font-medium">{res.clothing}</div><div className="text-bronze/80 mt-1">Matrix: {p.clothing}</div></> : p.clothing}</td>
                      <td className="px-3 py-2.5 min-w-44">{res.makeup ? <><div className="font-medium">{res.makeup}</div><div className="text-bronze/80 mt-1">Matrix: {p.makeup}</div></> : p.makeup}</td>
                    </tr>)})}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Client consultation" title="Intake & Feature Diagnosis Sheet" className="print-page-break">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-subtle-border border border-subtle-border rounded-xl overflow-hidden text-sm mb-5">
          <div className="bg-white p-3"><div className="text-[0.6rem] uppercase tracking-widest text-bronze">Client name</div>
            <input value={clientName} placeholder="Enter client name" onChange={(e) => updateDemographics({ clientName: e.target.value })} className="no-print w-full mt-1 border-b border-subtle-border focus:outline-none focus:border-wine bg-transparent" />
            <div className="print-only font-medium mt-1">{clientName || '—'}</div></div>
          <div className="bg-white p-3"><div className="text-[0.6rem] uppercase tracking-widest text-bronze">Consultant team</div><div className="mt-1 font-medium">{CONSULT_META.consultantTeam}</div></div>
          <div className="bg-white p-3"><div className="text-[0.6rem] uppercase tracking-widest text-bronze">Date</div><div className="mt-1 font-medium">{today}</div></div>
          <div className="bg-white p-3"><div className="text-[0.6rem] uppercase tracking-widest text-bronze">Session type</div><div className="mt-1 font-medium">{CONSULT_META.sessionType}</div></div>
        </div>
        <div className="overflow-x-auto bg-white hairline rounded-xl">
          <table className="w-full text-left text-[0.74rem]">
            <thead className="bg-wine text-cream uppercase tracking-wider text-[0.6rem]"><tr>
              {['Code', 'Evaluated parameter', 'Observed value / findings', 'Diagnosis rating', 'Recommended guidelines & actions'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>{FEATURE_CODES.map((f) => (
              <tr key={f.code} className="border-t border-subtle-border align-top print-break">
                <td className="px-3 py-2.5 font-mono font-semibold text-gold">{f.code}</td><td className="px-3 py-2.5 font-medium">{f.param}</td>
                <td className="px-3 py-2.5 text-bronze">{f.value}</td><td className="px-3 py-2.5 font-semibold text-wine">{f.rating}</td><td className="px-3 py-2.5">{f.action}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </Section>

      <section className="no-print mt-16 bg-wine text-cream rounded-3xl p-10 text-center">
        <div className="eyebrow !text-gold-warm">Mandatory approval gate</div>
        <h2 className="text-4xl font-semibold mt-2">Does this profile feel like you?</h2>
        <p className="text-cream/70 text-sm mt-3 max-w-xl mx-auto">Review the diagnosis above. Styling and try-on unlock only once you approve. You can re-run intake any time.</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <button onClick={approve} className="inline-flex items-center gap-2 bg-gold-warm text-charcoal font-semibold text-sm rounded-full px-9 py-4 hover:bg-cream"><CheckCircle2 size={16} /> Confirm &amp; Style Me</button>
          <button onClick={() => navigate('/intake')} className="border border-cream/30 text-sm rounded-full px-7 py-4 hover:bg-white/10">Redo intake</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-cream/30 text-sm rounded-full px-7 py-4 hover:bg-white/10"><Printer size={14} /> Print</button>
        </div>
        {profile.approved && <p className="mt-4 text-xs text-gold-warm">Already approved — <button className="underline" onClick={() => navigate('/wardrobe')}>go to Wardrobe Hub</button></p>}
      </section>
    </div>
  )
}
