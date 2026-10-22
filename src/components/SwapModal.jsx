import { X, Check } from 'lucide-react'
import { inr } from '../data/retail'

export default function SwapModal({ title, items, current, onPick, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-2xl text-wine font-semibold">{title}</h3><button onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <ul className="space-y-2">
          {items.map((it) => {
            const on = it.name === current.name
            return (
              <li key={it.id ?? it.name}>
                <button onClick={() => onPick(it)} className={`w-full flex items-center gap-3 text-left bg-white rounded-xl p-3 border ${on ? 'border-wine' : 'border-subtle-border hover:border-wine'}`}>
                  <span className="w-8 h-8 rounded-full border border-subtle-border shrink-0" style={{ background: it.color }} />
                  <span className="flex-1"><span className="block text-sm font-medium">{it.name}</span><span className="block text-[0.7rem] text-bronze">{it.brand} · {it.platform} · {inr(it.price)}</span></span>
                  {on && <Check size={16} className="text-wine" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
