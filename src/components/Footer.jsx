import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="no-print bg-charcoal text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="font-editorial text-3xl text-cream font-bold">CLTH<span className="text-gold-warm">.</span>Y</div>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">AI celebrity-grade image diagnostics & on-person styling, modelled on the DOES Clinic methodology of Hongdae, Seoul.</p>
        </div>
        <div>
          <div className="eyebrow !text-gold-warm">Accreditation</div>
          <p className="mt-3 text-sm text-cream/70">DOES Studio · Hongdae, Seoul<br />Diagnostic protocol ID #KR-8821</p>
          <p className="mt-2 text-xs text-cream/50">CLTH.Y is an independent styling tool inspired by Korean image-consulting practice and is not an official DOES product.</p>
        </div>
        <div>
          <div className="eyebrow !text-gold-warm flex items-center gap-1.5"><ShieldCheck size={13} /> Privacy pledge</div>
          <p className="mt-3 text-sm text-cream/70">Your photos and measurements stay in this browser's local storage. Nothing is uploaded unless you call the diagnostic API yourself.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[0.68rem] tracking-[0.2em] uppercase text-cream/40">
        Styled for · Myntra · Ajio · Tata CLiQ · Zara · H&M
      </div>
    </footer>
  )
}
