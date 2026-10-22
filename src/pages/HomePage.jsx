import { Link } from 'react-router-dom'
import { ArrowRight, Camera, ScanFace, Shirt, ShieldCheck, Lock, EyeOff } from 'lucide-react'
import { DEFAULT_DIAGNOSTIC_REPORT as R } from '../data/defaultProfile'

const STEPS = [
  { icon: Camera, t: '01 · Capture', d: 'Five guided photographs — face front, profile, full body front, side and a candid drape — build your biometric baseline.' },
  { icon: ScanFace, t: '02 · Diagnose', d: 'Our engine normalises LAB undertones, measures facial thirds and classifies bone frame into an 18-parameter DOES passport.' },
  { icon: Shirt, t: '03 · Style', d: 'Ten complete top, bottom and shoe looks are rendered on your own frame and linked straight to the retail apps you shop.' },
]

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-wine text-cream">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 20%, #D4AF37 0, transparent 45%), radial-gradient(circle at 10% 90%, #C35831 0, transparent 40%)' }} />
        <div className="relative max-w-7xl mx-auto px-5 py-24 md:py-32 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="animate-fade-up">
            <div className="eyebrow !text-gold-warm">Hongdae, Seoul · Protocol {R.clinicId}</div>
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.02] mt-5">Celebrity-grade<br />image diagnostics,<br /><em className="text-gold-warm">worn on you.</em></h1>
            <p className="mt-6 text-cream/75 max-w-xl leading-relaxed">CLTH.Y brings the clinical precision of South Korea's DOES Clinic to your wardrobe: a measured colour, face and frame diagnosis, then outfits you can see on your own body before you buy.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/intake" className="inline-flex items-center gap-2 bg-gold-warm text-charcoal font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-cream transition-colors">Begin intake <ArrowRight size={16} /></Link>
              <Link to="/report" className="inline-flex items-center gap-2 border border-cream/30 text-cream text-sm rounded-full px-7 py-3.5 hover:bg-white/10">See a sample report</Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3">
            {R.powerColors.map((c) => (
              <div key={c.hex} className="aspect-[3/4] rounded-xl flex items-end p-2.5 border border-white/10" style={{ background: c.hex }}>
                <span className="text-[0.58rem] tracking-widest uppercase" style={{ color: ['#DDA15E', '#D4AF37'].includes(c.hex) ? '#1E1E1E' : '#FAF7F2' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="eyebrow">The DOES methodology</div>
        <h2 className="text-4xl md:text-5xl text-wine font-semibold mt-3 max-w-3xl">A clinic's measurements, not a quiz's guesses.</h2>
        <p className="text-bronze mt-4 max-w-2xl text-sm leading-relaxed">Korean image consulting scores personal colour, facial proportion, body structure, material and detail as separate measurable modules. CLTH.Y keeps that rigour — every recommendation traces back to a reading.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {STEPS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white hairline rounded-2xl p-7">
              <Icon className="text-gold" size={26} />
              <h3 className="text-2xl text-wine font-semibold mt-5">{t}</h3>
              <p className="text-sm text-bronze mt-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-subtle-border">
        <div className="max-w-7xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8">
          {[
            { i: Lock, t: 'Stays on your device', d: 'Profile, photos and saved looks live in your browser\'s local storage.' },
            { i: EyeOff, t: 'No hidden sharing', d: 'Photos are never sent anywhere unless you explicitly call the diagnostic API.' },
            { i: ShieldCheck, t: 'You approve everything', d: 'Styling unlocks only after you review and approve your report.' },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <Icon className="text-wine shrink-0 mt-1" size={22} />
              <div><h3 className="text-xl text-wine font-semibold">{t}</h3><p className="text-sm text-bronze mt-1 leading-relaxed">{d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
