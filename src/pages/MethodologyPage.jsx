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
