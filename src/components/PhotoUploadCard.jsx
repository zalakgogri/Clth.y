import { useRef, useState } from 'react'
import { Camera, Upload, ImageDown, X, Check } from 'lucide-react'

function Guide({ type }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeDasharray: '4 4' }
  return (
    <svg viewBox="0 0 120 150" className="w-16 h-20 text-bronze/50">
      {type === 'oval' && <><ellipse cx="60" cy="62" rx="32" ry="44" {...common} /><path d="M30 148 Q60 110 90 148" {...common} /></>}
      {type === 'profile' && <path d="M50 20 Q92 22 88 62 L100 80 L88 86 Q90 120 58 124 Q36 110 38 62Q36 30 50 20Z" {...common} />}
      {(type === 'body' || type === 'candid') && <><circle cx="60" cy="22" r="14" {...common} /><path d="M38 44 Q60 38 82 44 L78 94 L86 144 L66 144 L60 100 L54 144 L34 144 L42 94Z" {...common} /></>}
      {type === 'body-side' && <><circle cx="60" cy="22" r="13" {...common} /><path d="M46 42 Q64 38 74 46 L70 96 L72 144 L54 144 L52 98Z" {...common} /></>}
    </svg>
  )
}

export default function PhotoUploadCard({ slot, src, isCustom, onChange, onClear, onSample }) {
  const fileRef = useRef(null)
  const camRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const read = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      // Downscale so localStorage stays within quota.
      const img = new Image()
      img.onload = () => {
        const max = 640
        const k = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k)
        c.height = Math.round(img.height * k)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        onChange(slot.id, c.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white hairline rounded-2xl overflow-hidden flex flex-col">
      <div
        className={`relative aspect-[3/4] flex items-center justify-center transition-colors ${drag ? 'bg-gold/10' : 'bg-cream'}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files?.[0]) }}
      >
        {src ? <img src={src} alt={slot.title} className="absolute inset-0 w-full h-full object-cover" /> : (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Guide type={slot.guide} />
            <span className="text-[0.7rem] text-bronze">Drop a photo here</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[0.6rem] font-semibold tracking-widest bg-wine text-cream rounded-full px-2 py-0.5">SLOT {slot.id}</span>
        {src && (
          <span className={`absolute top-2 right-2 text-[0.6rem] font-semibold rounded-full px-2 py-0.5 flex items-center gap-1 ${isCustom ? 'bg-emerald-700 text-white' : 'bg-white/90 text-bronze'}`}>
            <Check size={10} /> {isCustom ? 'Your photo' : 'Sample'}
          </span>
        )}
        {isCustom && (
          <button onClick={() => onClear(slot.id)} aria-label="Remove photo" className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1.5 text-wine"><X size={14} /></button>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-wine leading-tight">{slot.title}</h3>
        <p className="text-[0.72rem] text-bronze mt-1 leading-snug flex-1">{slot.hint}</p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <button onClick={() => camRef.current?.click()} className="flex flex-col items-center gap-0.5 text-[0.62rem] py-2 rounded-lg border border-subtle-border text-charcoal hover:border-wine hover:text-wine"><Camera size={14} />Camera</button>
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-0.5 text-[0.62rem] py-2 rounded-lg border border-subtle-border text-charcoal hover:border-wine hover:text-wine"><Upload size={14} />Upload</button>
          <button onClick={() => onSample(slot.id)} className="flex flex-col items-center gap-0.5 text-[0.62rem] py-2 rounded-lg border border-subtle-border text-charcoal hover:border-wine hover:text-wine"><ImageDown size={14} />Sample</button>
        </div>
        <input ref={camRef} type="file" accept="image/*" capture="user" hidden onChange={(e) => read(e.target.files?.[0])} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
      </div>
    </div>
  )
}
