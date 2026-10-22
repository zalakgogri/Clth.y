import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles, Tag } from 'lucide-react'
import { inr } from '../data/retail'

export default function OutfitCard({ outfit, rank }) {
  return (
    <article className="bg-white hairline rounded-2xl overflow-hidden flex flex-col print-break">
      <div className="flex h-28">
        {outfit.pieces.map((p) => (
          <div key={p.role} className="flex-1 relative" style={{ background: p.color }}>
            <span className="absolute bottom-1.5 left-2 text-[0.55rem] uppercase tracking-widest" style={{ color: ['#FFFFFF', '#DDA15E', '#D4AF37'].includes(p.color) ? '#1E1E1E' : '#FAF7F2' }}>{p.role}</span>
          </div>
        ))}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[0.6rem] tracking-widest uppercase font-semibold text-gold border border-gold/40 rounded-full px-2.5 py-0.5">{outfit.occasion}</span>
            {outfit.source !== 'ai' && <span className="ml-2 text-[0.58rem] uppercase tracking-widest text-bronze">Demo look</span>}
            <h3 className="text-2xl font-semibold text-wine mt-2 leading-tight">{rank ? `${rank}. ` : ''}{outfit.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-editorial font-bold text-wine">{outfit.suitability}%</div>
            <div className="text-[0.55rem] tracking-widest uppercase text-bronze">Suitability</div>
          </div>
        </div>
        <div className="h-1.5 bg-cream rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-gold to-gold-warm" style={{ width: `${outfit.suitability}%` }} /></div>

        <ul className="mt-4 divide-y divide-subtle-border">
          {outfit.pieces.map((p) => (
            <li key={p.role} className="py-2.5 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border border-subtle-border shrink-0" style={{ background: p.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[0.82rem] font-medium truncate">{p.name}</div>
                <div className="text-[0.68rem] text-bronze">{p.role} · {p.brand} · {inr(p.price)}</div>
                {(p.sizes?.length > 0 || p.stock === 'verified') && <div className={`text-[0.62rem] ${p.stock === 'verified' ? 'text-emerald-800' : 'text-bronze'}`}>{p.stock === 'verified' ? '✓ In stock (checked on store)' : 'In stock per AI page reading — confirm on store'}{p.sizes?.length ? ` · ${p.sizes.slice(0, 6).join(', ')}` : ''}</div>}
              </div>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="no-print shrink-0 inline-flex items-center gap-0.5 text-[0.68rem] font-semibold text-wine border border-wine/30 rounded-full px-2.5 py-1 hover:bg-wine hover:text-cream transition-colors">
                  Buy on {p.platform} <ArrowUpRight size={12} />
                </a>
              ) : (
                <span title="The AI could not verify an exact product page for this item" className="no-print shrink-0 text-[0.62rem] text-bronze/70 border border-dashed border-subtle-border rounded-full px-2.5 py-1">{p.platform} · no exact link</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 text-[0.72rem] text-bronze"><Tag size={13} className="text-gold" /> {outfit.discount > 0 ? `Bundle −${outfit.discount}%` : 'Look total'}</div>
          <div className="text-right">
            {outfit.discount > 0 && <span className="text-xs text-bronze line-through mr-2">{inr(outfit.subtotal)}</span>}
            <span className="font-semibold text-wine">{inr(outfit.bundlePrice)}</span>
            {outfit.savings > 0 && <span className="text-[0.65rem] text-emerald-800 ml-2">save {inr(outfit.savings)}</span>}
          </div>
        </div>

        <p className="mt-3 text-[0.76rem] leading-relaxed text-bronze flex-1"><b className="text-charcoal font-semibold">DOES harmony · </b>{outfit.harmony}</p>

        <Link to={`/tryon/${outfit.id}`} className="no-print mt-4 inline-flex items-center justify-center gap-2 bg-wine text-cream text-[0.8rem] font-semibold tracking-wide rounded-full py-3 hover:bg-charcoal transition-colors">
          <Sparkles size={14} /> View On-Person Try-On
        </Link>
      </div>
    </article>
  )
}
