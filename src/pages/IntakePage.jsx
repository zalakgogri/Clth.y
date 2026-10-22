import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Wand2, AlertCircle } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'
import { PHOTO_SLOTS, SHOPPING_APPS, OCCASIONS, OTHER_OCCASION, GENDERS } from '../data/defaultProfile'
import PhotoUploadCard from '../components/PhotoUploadCard'
import { inr } from '../data/retail'

const chip = (on) => `text-xs rounded-full px-3.5 py-2 border transition-colors ${on ? 'bg-wine text-cream border-wine' : 'bg-white text-charcoal border-subtle-border hover:border-wine'}`
const field = 'w-full bg-white border border-subtle-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-wine'
const Label = ({ children }) => <label className="block text-[0.68rem] uppercase tracking-[0.16em] font-semibold text-bronze mb-1.5">{children}</label>

function Toggle({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-subtle-border bg-white p-0.5">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={`text-[0.7rem] px-3 py-1 rounded-full ${value === o ? 'bg-wine text-cream' : 'text-bronze'}`}>{o}</button>
      ))}
    </div>
  )
}

export default function IntakePage() {
  const { profile, updatePhotos, updateDemographics, completeIntake } = useProfile()
  const navigate = useNavigate()
  const [tab, setTab] = useState('A')
  const [hUnit, setHUnit] = useState('cm')
  const [wUnit, setWUnit] = useState('kg')
  const [errors, setErrors] = useState([])
  const d = profile.demographics

  const cmToFtIn = (cm) => { const t = Math.round(cm / 2.54); return { ft: Math.floor(t / 12), inch: t % 12 } }
  const { ft, inch } = cmToFtIn(d.heightCm)
  const toggleIn = (key, v) => updateDemographics({ [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] })

  const realCount = Object.keys(profile.customPhotos).length
  const submit = (demo = false) => {
    const errs = []
    if (!(d.heightCm >= 120 && d.heightCm <= 230)) errs.push('Height must be between 120 and 230 cm.')
    if (!(d.weightKg >= 30 && d.weightKg <= 250)) errs.push('Weight must be between 30 and 250 kg.')
    if (!(d.age >= 13 && d.age <= 100)) errs.push('Age must be between 13 and 100.')
    if (!d.preferredApps.length) errs.push('Select at least one shopping app.')
    if (d.occasion === OTHER_OCCASION && !(d.customOccasion || '').trim()) errs.push('Describe your occasion in the “Others” box.')
    if (!demo && realCount < PHOTO_SLOTS.length) errs.push('Add all 4 photos (front face, left side, right side, full body) — or use the demo diagnosis without photos.')
    setErrors(errs)
    if (errs.length) { setTab(errs.some((e) => e.includes('photos')) ? 'A' : 'B'); return }
    completeIntake()
    navigate('/analyzing')
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="eyebrow">Dual Intake Chamber</div>
      <h1 className="text-5xl text-wine font-semibold mt-2">Your biometric intake</h1>
      <p className="text-bronze text-sm mt-3 max-w-2xl">Use real photos for the most faithful result, or load the sample set to explore instantly. Everything is stored locally in your browser.</p>

      <div className="flex gap-2 mt-8 border-b border-subtle-border">
        {[['A', 'Part A · Photo Chamber'], ['B', 'Part B · Demographics & Preferences']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-3 text-sm font-medium -mb-px border-b-2 ${tab === k ? 'border-wine text-wine' : 'border-transparent text-bronze'}`}>{l}</button>
        ))}
      </div>

      {tab === 'A' && (
        <section className="mt-8">
          <div className={`mb-5 rounded-xl border px-5 py-3 text-xs ${Object.keys(profile.customPhotos).length ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            {Object.keys(profile.customPhotos).length
              ? 'Your photos (and only those) are sent to the AI model (via OpenRouter) for the DOES master analysis and outfit styling. Nothing is stored on the server.'
              : 'The pictures shown are example poses only. The AI analyses real photos you take or upload — without them you get a demo diagnosis.'}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-xs text-bronze">{realCount} of 4 photos added. Use the Camera for a live shot or Upload a file.</p>

          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PHOTO_SLOTS.map((s) => (
              <PhotoUploadCard key={s.id} slot={s} src={profile.photos[s.id]} isCustom={!!profile.customPhotos[s.id]}
                onChange={(id, url) => updatePhotos(id, url)} onClear={(id) => updatePhotos(id, null)}
                />
            ))}
          </div>
          <div className="mt-8 flex justify-end"><button onClick={() => setTab('B')} className="inline-flex items-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full px-7 py-3">Continue to Part B <ArrowRight size={16} /></button></div>
        </section>
      )}

      {tab === 'B' && (
        <section className="mt-8 grid lg:grid-cols-2 gap-x-10 gap-y-7 bg-white hairline rounded-2xl p-6 md:p-9">
          <div>
            <div className="flex items-center justify-between"><Label>Height</Label><Toggle value={hUnit} options={['cm', 'ft']} onChange={setHUnit} /></div>
            {hUnit === 'cm'
              ? <input type="number" className={field} value={d.heightCm} onChange={(e) => updateDemographics({ heightCm: Number(e.target.value) })} />
              : <div className="grid grid-cols-2 gap-2">
                  <input type="number" aria-label="feet" className={field} value={ft} onChange={(e) => updateDemographics({ heightCm: Math.round((Number(e.target.value) * 12 + inch) * 2.54) })} />
                  <input type="number" aria-label="inches" className={field} value={inch} onChange={(e) => updateDemographics({ heightCm: Math.round((ft * 12 + Number(e.target.value)) * 2.54) })} />
                </div>}
          </div>
          <div>
            <div className="flex items-center justify-between"><Label>Weight</Label><Toggle value={wUnit} options={['kg', 'lbs']} onChange={setWUnit} /></div>
            <input type="number" className={field} value={wUnit === 'kg' ? d.weightKg : Math.round(d.weightKg * 2.20462)}
              onChange={(e) => updateDemographics({ weightKg: wUnit === 'kg' ? Number(e.target.value) : Math.round(Number(e.target.value) / 2.20462) })} />
          </div>
          <div><Label>Age</Label><input type="number" className={field} value={d.age} onChange={(e) => updateDemographics({ age: Number(e.target.value) })} /></div>
          <div><Label>Gender</Label><select className={field} value={d.gender} onChange={(e) => updateDemographics({ gender: e.target.value })}>{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div className="lg:col-span-2"><Label>Heritage / Origin</Label><input className={field} value={d.origin} onChange={(e) => updateDemographics({ origin: e.target.value })} /></div>

          <div className="lg:col-span-2"><Label>Shopping apps</Label>
            <div className="flex flex-wrap gap-2">{SHOPPING_APPS.map((a) => <button key={a} type="button" className={chip(d.preferredApps.includes(a))} onClick={() => toggleIn('preferredApps', a)}>{a}</button>)}</div></div>

          <div><Label>Budget per look · up to {inr(d.budgetMax)}</Label>
            <input type="range" min="2000" max="50000" step="500" value={d.budgetMax} onChange={(e) => updateDemographics({ budgetMax: Number(e.target.value) })} className="w-full accent-[#4A121A]" /></div>

          <div className="lg:col-span-2"><Label>Primary occasion</Label>
            <div className="flex flex-wrap gap-2">
              {[...OCCASIONS, OTHER_OCCASION].map((o) => <button key={o} type="button" className={chip(d.occasion === o)} onClick={() => updateDemographics({ occasion: o })}>{o}</button>)}
            </div>
            {d.occasion === OTHER_OCCASION && (
              <input className={`${field} mt-3`} autoFocus placeholder="Describe it — e.g. beach engagement shoot, college farewell, job interview at a bank…"
                value={d.customOccasion || ''} onChange={(e) => updateDemographics({ customOccasion: e.target.value })} />
            )}
          </div>

          <div className="lg:col-span-2"><Label>Custom fit requests</Label>
            <textarea rows={3} className={field} value={d.customFit} onChange={(e) => updateDemographics({ customFit: e.target.value })} /></div>
        </section>
      )}

      {errors.length > 0 && (
        <div className="mt-6 flex gap-3 bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" /><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <button onClick={() => submit(true)} className="mr-3 text-xs text-bronze underline">Use demo diagnosis (no photos)</button>
        <button onClick={() => submit(false)} className="inline-flex items-center gap-2 bg-gold-warm text-charcoal text-sm font-semibold rounded-full px-9 py-4 hover:bg-wine hover:text-cream transition-colors">
          Begin AI diagnostic <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
