import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PHOTO_SLOTS, DEFAULT_DIAGNOSTIC_REPORT } from '../data/defaultProfile'
import { useProfile } from '../data/ProfileContext'
import { analysisKey, analyzeProfile, hasRealPhotos } from '../data/api'

const PHASES = [
  'Calibrating optics · reading skin undertone and chroma under neutral light…',
  'Mapping facial thirds · measuring middle-third ratio and jaw contour…',
  'Reading skeletal frame · classifying bone structure from body and side views…',
  'Cross-referencing the 18 DOES feature codes against Korean consulting scales…',
  'Formulating your DOES Passport · waiting for the master analyst’s report…',
]
const STEP_MS = 1500

export default function AnalyzingPage() {
  const { profile, setAnalysis } = useProfile()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState('Contacting the DOES master analyst…')
  const started = useRef(false)

  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const t0 = useRef(Date.now())
  useEffect(() => {
    const t = setInterval(() => setElapsed((Date.now() - t0.current) / 1000), 250)
    return () => clearInterval(t)
  }, [])

  // Prompt 1: the client's real photos + intake details go to the vision model, which answers as a DOES master analyst.
  const run = async () => {
    setError('')
    setStatus('Sending your photos to the AI analyst…')
    try {
      const key = analysisKey(profile)
      if (profile.reportSource === 'ai' && profile.analysisKey === key) { setDone(true); setStatus('Using your saved analysis — same photos, same result'); return }
      const report = await analyzeProfile(profile)
      setAnalysis({ ...DEFAULT_DIAGNOSTIC_REPORT, ...report, photosUsed: Object.keys(profile.customPhotos) }, 'ai', report.photoNotes || '', key)
      setDone(true)
      setStatus('Diagnosis complete')
    } catch (e) {
      setError(e.message || 'The analysis failed.')
    }
  }
  const continueWithDemo = (why) => {
    setAnalysis(DEFAULT_DIAGNOSTIC_REPORT, 'preset', why)
    setDone(true)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!hasRealPhotos(profile)) continueWithDemo('Demo diagnosis: no real photos were added, so there was nothing to analyse. Add your photos in Intake for a personalised reading.')
    else run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ticker advances on a timer, but holds on the last phase until the AI has actually answered.
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, PHASES.length - 1)), STEP_MS)
    return () => clearInterval(t)
  }, [])
  const finished = done && step >= PHASES.length - 1
  useEffect(() => {
    if (finished) { const t = setTimeout(() => navigate('/report'), 700); return () => clearTimeout(t) }
  }, [finished, navigate])

  const active = step
  const slot = PHOTO_SLOTS[active % PHOTO_SLOTS.length]
  // Smooth, never-stalling progress that eases toward 98% while the AI is still working.
  const pct = finished ? 100 : error ? 0 : Math.min(98, Math.round(100 * (1 - Math.exp(-elapsed / 16))))

  return (
    <div className="bg-charcoal min-h-[80vh] text-cream">
      <div className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative mx-auto w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-gold-warm/40">
          <img src={profile.photos[slot.id]} alt={slot.title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute left-0 right-0 h-0.5 bg-gold-warm shadow-[0_0_18px_4px_rgba(212,175,55,0.7)] animate-scan" />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute bottom-3 left-3 text-[0.62rem] tracking-[0.2em] uppercase bg-black/60 rounded px-2 py-1">Scanning · {slot.title}</div>
        </div>

        <div>
          <div className="eyebrow !text-gold-warm">AI diagnostic calibration</div>
          <h1 className="text-5xl font-semibold mt-3">Analysing</h1>

          <div className="relative w-36 h-36 my-8">
            <div className="absolute inset-0 rounded-full border border-gold-warm/40" />
            <div className="absolute inset-5 rounded-full border border-gold-warm/25" />
            <div className="absolute inset-10 rounded-full border border-gold-warm/15" />
            <div className="absolute inset-0 rounded-full animate-radar" style={{ background: 'conic-gradient(from 0deg, rgba(212,175,55,0.55), transparent 28%)' }} />
            <div className="absolute inset-0 flex items-center justify-center font-editorial text-3xl text-gold-warm">{pct}%</div>
          </div>

          {error ? (
            <div className="-mt-4 mb-6 rounded-xl border border-red-300/40 bg-red-950/40 p-4 text-sm">
              <p className="font-semibold text-red-200">The AI analysis failed — no result was made up.</p>
              <p className="text-red-100/80 mt-1 break-words">{error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={run} className="bg-gold-warm text-charcoal text-xs font-semibold rounded-full px-5 py-2">Try again</button>
                <button onClick={() => continueWithDemo(`AI analysis failed (${error}). You chose to continue with the demo diagnosis.`)} className="border border-cream/30 text-xs rounded-full px-5 py-2">Continue with demo diagnosis</button>
              </div>
            </div>
          ) : <p className="text-xs text-gold-warm -mt-4 mb-5">{status}</p>}
          <ol className="space-y-3">
            {PHASES.map((p, i) => (
              <li key={p} className={`text-sm flex gap-3 transition-opacity ${i <= step ? 'opacity-100' : 'opacity-25'}`}>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${i < step || finished ? 'bg-emerald-400' : i === step ? 'bg-gold-warm animate-pulse' : 'bg-white/30'}`} />
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
