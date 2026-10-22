import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DIAGNOSTIC_MODULES } from '../data/diagnosticMatrix'

export default function MethodologyPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <Link to="/" className="no-print inline-flex items-center gap-1.5 text-xs text-bronze hover:text-wine"><ArrowLeft size={13} /> Back</Link>
      <div className="eyebrow mt-4">Reference</div>
      <h1 className="text-5xl text-wine font-semibold mt-2">Korean Image Consulting Methodology</h1>
      <p className="text-bronze text-sm mt-3 max-w-3xl leading-relaxed">
        Personal colour, facial proportion, body structure, material and styling detail are assessed as separate, measurable modules. This is the
        Diagnostic Feature Extraction Matrix your analysis follows: 5 modules, 22 sub-features, each with how it is measured, the scale it is
        classified on, and what it changes in clothing and in makeup &amp; styling. Your own result for every row appears in your diagnostic report.
      </p>
      <section className="mt-8 max-w-3xl rounded-xl bg-white hairline p-5 text-sm leading-relaxed text-bronze">
        <h2 className="text-2xl text-wine font-semibold">How your colour season is decided</h2>
        <p className="mt-2">Colours are never guessed. Your photo is measured (skin tone) and read (eyes, hair), and you can add three self-checks. Together they give an <b>undertone vote</b> (skin tone, eyes, hair, wrist veins, sun reaction, gold-versus-silver), plus your <b>value</b> (depth), <b>contrast</b> (difference between hair/eyes and skin) and <b>chroma</b> (clear versus soft). Those place you on the 12-season wheel — Bright, True and Dark Winter; Bright, True and Light Spring; Light, True and Soft Summer; Soft, True and Dark Autumn — and your palette comes from that season.</p>
        <p className="mt-2 text-xs">The season-wheel framework and the six undertone checks follow the explanation in <a className="underline text-wine" href="https://www.youtube.com/watch?v=iPaRdP2S6ms" target="_blank" rel="noopener noreferrer">this colour-analysis video</a>. Black hair is counted as neutral because it suits every undertone (the video notes this is a confusing indicator). A second link you shared (a YouTube Short) has no spoken content to draw on, so it was not used.</p>
      </section>
      <div className="mt-10 space-y-10">
        {DIAGNOSTIC_MODULES.map((m) => (
          <section key={m.id}>
            <h2 className="text-3xl text-wine font-semibold mb-3">Module {m.id} · {m.title}</h2>
            <div className="overflow-x-auto bg-white hairline rounded-xl">
              <table className="w-full text-left text-[0.74rem] leading-snug">
                <thead className="bg-cream text-bronze uppercase tracking-wider text-[0.6rem]">
                  <tr>{['Sub-feature / metric', 'Measurement / diagnostic method', 'Classification options & scales', 'Impact on clothing selection', 'Impact on makeup & styling'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {m.params.map((p) => (
                    <tr key={p.name} className="border-t border-subtle-border align-top">
                      <td className="px-3 py-2.5 font-semibold text-wine">{p.name}</td>
                      <td className="px-3 py-2.5">{p.measure}</td>
                      <td className="px-3 py-2.5 text-bronze">{p.scale}</td>
                      <td className="px-3 py-2.5">{p.clothing}</td>
                      <td className="px-3 py-2.5">{p.makeup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-bronze">Drape-based tests (Module 1, 3, 4) cannot be performed physically from photos; the AI estimates them from visible cues and states its confidence on your report.</p>
    </div>
  )
}
