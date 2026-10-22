import { useRef, useState } from 'react'
import { Camera, Upload, X, Check } from 'lucide-react'
import CameraModal from './CameraModal'

export default function PhotoUploadCard({ slot, src, isCustom, onChange, onClear }) {
  const fileRef = useRef(null)
  const nativeCamRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [camera, setCamera] = useState(false)

  const read = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      // Downscale so localStorage and the request body stay small.
      const img = new Image()
      img.onload = () => {
        const k = Math.min(1, 800 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k)
        c.height = Math.round(img.height * k)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        onChange(slot.id, c.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white hairline rounded-2xl overflow-hidden flex flex-col">
      <div
        className={`relative aspect-[3/4] transition-colors ${drag ? 'bg-gold/10' : 'bg-cream'}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files?.[0]) }}
      >
        <img src={isCustom ? src : slot.example} alt={isCustom ? `${slot.title} (your photo)` : `${slot.title} example`} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-2 left-2 text-[0.6rem] font-semibold tracking-widest bg-wine text-cream rounded-full px-2 py-0.5">SLOT {slot.id}</span>
        <span className={`absolute top-2 right-2 text-[0.6rem] font-semibold rounded-full px-2 py-0.5 flex items-center gap-1 ${isCustom ? 'bg-emerald-700 text-white' : 'bg-white/90 text-bronze'}`}>
          {isCustom ? <><Check size={10} /> Your photo</> : 'Example pose'}
        </span>
        {!isCustom && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[0.68rem] px-3 pt-8 pb-2">Match this pose — drop your photo here</div>}
        {isCustom && (
          <button onClick={() => onClear(slot.id)} aria-label="Remove photo" className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1.5 text-wine"><X size={14} /></button>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-wine leading-tight">{slot.title}</h3>
        <p className="text-[0.72rem] text-bronze mt-1 leading-snug flex-1">{slot.hint}</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button onClick={() => setCamera(true)} className="flex flex-col items-center gap-0.5 text-[0.65rem] py-2 rounded-lg border border-subtle-border text-charcoal hover:border-wine hover:text-wine"><Camera size={14} />Camera</button>
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-0.5 text-[0.65rem] py-2 rounded-lg border border-subtle-border text-charcoal hover:border-wine hover:text-wine"><Upload size={14} />Upload</button>
        </div>
        <input ref={nativeCamRef} type="file" accept="image/*" capture={slot.id === 4 ? 'environment' : 'user'} hidden onChange={(e) => read(e.target.files?.[0])} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
      </div>
      {camera && (
        <CameraModal slot={slot} onClose={() => setCamera(false)}
          onCapture={(id, url) => { onChange(id, url); setCamera(false) }}
          onFallback={() => { setCamera(false); nativeCamRef.current?.click() }} />
      )}
    </div>
  )
}
