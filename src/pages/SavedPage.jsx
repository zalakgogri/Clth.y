import { Link } from 'react-router-dom'
import { ArrowUpRight, Printer, Trash2 } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'
import { inr } from '../data/retail'

export default function SavedPage() {
  const { profile, toggleWishlist } = useProfile()
  const items = profile.wishlist
  const d = profile.demographics
  const R = profile.report

  return (
    <div className="dossier-root max-w-5xl mx-auto px-5 py-12">
      <header className="border-b-2 border-wine pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Client lookbook · {R.clinic}</div>
          <h1 className="text-5xl text-wine font-semibold mt-2">Saved ensembles</h1>
          <p className="text-xs text-bronze mt-2">{d.clientName || 'Client'} · {R.skeletal.frame} · Compact middle-third {R.facial.ratio} · Prepared {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <button onClick={() => window.print()} disabled={!items.length} className="no-print inline-flex items-center gap-2 bg-wine text-cream text-xs font-semibold rounded-full px-5 py-3 disabled:opacity-40"><Printer size={14} /> Export client PDF</button>
      </header>

      <div className="print-only mt-4 flex gap-1.5">{R.powerColors.map((c) => <span key={c.hex} className="w-8 h-8 rounded-full border border-subtle-border" style={{ background: c.hex }} />)}</div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-bronze text-sm">Your lookbook is empty.</p>
          <div className="mt-5 flex justify-center gap-3 no-print">
            <Link to="/wardrobe" className="bg-wine text-cream text-sm rounded-full px-6 py-3">Browse looks</Link>
            <Link to="/studio" className="border border-wine text-wine text-sm rounded-full px-6 py-3">Open studio</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {items.map((w, i) => (
            <article key={w.key} className="print-break bg-white hairline rounded-2xl overflow-hidden">
              <div className="flex h-14">{w.pieces.map((p) => <div key={p.role + p.name} className="flex-1" style={{ background: p.color }} />)}</div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><div className="eyebrow">Look {String(i + 1).padStart(2, '0')} · {w.occasion}</div><h2 className="text-3xl text-wine font-semibold mt-1">{w.label}</h2></div>
                  <div className="text-right"><div className="text-3xl font-editorial font-bold text-wine">{w.score}%</div><div className="text-[0.6rem] uppercase tracking-widest text-bronze">Suitability</div></div>
                </div>
                <table className="w-full text-sm mt-4"><tbody>
                  {w.pieces.map((p) => (
                    <tr key={p.role + p.name} className="border-t border-subtle-border">
                      <td className="py-2 w-28 text-[0.68rem] uppercase tracking-widest text-bronze">{p.role}</td>
                      <td className="py-2"><span className="inline-block w-3 h-3 rounded-full mr-2 align-middle border border-subtle-border" style={{ background: p.color }} />{p.name} <span className="text-bronze">· {p.brand}</span></td>
                      <td className="py-2 text-right text-bronze">{inr(p.price)}</td>
                      <td className="py-2 text-right no-print">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] font-semibold text-wine inline-flex items-center gap-0.5">Buy on {p.platform} <ArrowUpRight size={12} /></a> : <span className="text-[0.65rem] text-bronze/70">no exact link</span>}</td>
                      <td className="py-2 text-right print-only text-[0.7rem] text-bronze">{p.platform}</td>
                    </tr>))}
                </tbody></table>
                <div className="mt-3 flex items-center justify-between border-t border-subtle-border pt-3">
                  <span className="text-xs text-bronze">Saved {new Date(w.savedAt).toLocaleDateString('en-GB')}</span>
                  <span className="font-semibold text-wine">{inr(w.total)}</span>
                  <button onClick={() => toggleWishlist(w)} className="no-print text-bronze hover:text-red-700" aria-label="Remove look"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="print-only text-[0.65rem] text-bronze mt-10 text-center">CLTH.Y · Styling dossier inspired by DOES Studio methodology · Prices are indicative; confirm on retailer.</p>
    </div>
  )
}
