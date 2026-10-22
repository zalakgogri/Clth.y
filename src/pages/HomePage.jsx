import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ColorFlipBook from '../components/ColorFlipBook'

const STEP_BG = ['#F26B5B', '#F2B134', '#167A7C']
const STEP_FG = ['#2B2230', '#2B2230', '#FBF6EE']
const STEPS = [
  { n: '01', t: 'Capture', d: 'Four simple photographs — front face, both profiles and full body — taken in daylight.' },
  { n: '02', t: 'Diagnose', d: 'Your skin tone is measured from your photo, then your colours, face and frame are read in plain language.' },
  { n: '03', t: 'Style', d: 'Looks for your occasion and budget, in stock, with the exact item linked — and tried on you.' },
]

export default function HomePage() {
  return (
    <div className="bg-cream">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 grid md:grid-cols-[1fr_1.05fr] gap-14 items-center">
        <div className="animate-fade-up">
          <div className="text-[0.68rem] tracking-[0.34em] uppercase text-bronze">Personal colour &amp; styling atelier</div>
          <h1 className="mt-6 text-5xl md:text-7xl font-medium leading-[1.04] text-charcoal">
            The colours<br />that were<br /><em className="text-wine font-normal">always yours.</em>
          </h1>
          <p className="mt-7 text-[0.95rem] leading-relaxed text-bronze max-w-md">
            A quiet, precise colour consultation in the Korean tradition — from your own photographs, in minutes. Then outfits chosen for you, for the occasion, within your budget.
          </p>
          <div className="mt-10 flex items-center gap-7">
            <Link to="/intake" className="inline-flex items-center gap-2 bg-wine text-cream text-[0.8rem] tracking-[0.12em] uppercase rounded-full px-8 py-3.5 hover:bg-charcoal transition-colors">
              Begin <ArrowRight size={15} />
            </Link>
            <Link to="/methodology" className="text-[0.78rem] text-bronze underline underline-offset-[6px] decoration-subtle-border hover:text-wine hover:decoration-wine transition-colors">The methodology</Link>
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '.15s' }}>
          <ColorFlipBook />
        </div>
      </section>

      <section className="border-t border-subtle-border">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="rounded-[28px] p-9" style={{ background: STEP_BG[i], color: STEP_FG[i] }}>
              <div className="font-editorial text-6xl font-bold leading-none">{s.n}</div>
              <h2 className="mt-4 text-4xl font-semibold">{s.t}</h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed opacity-90">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-wine">
        <p className="max-w-6xl mx-auto px-6 py-10 text-center text-[0.72rem] tracking-[0.2em] uppercase text-cream/80">
          Your photos stay in your browser · nothing is shared without your say-so
        </p>
      </section>
    </div>
  )
}
