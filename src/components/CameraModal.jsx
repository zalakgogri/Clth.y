import { useEffect, useRef, useState } from 'react'
import { X, Camera, RefreshCw, Timer } from 'lucide-react'

// Live in-browser camera (getUserMedia). Returns a resized JPEG data URL via onCapture.
export default function CameraModal({ slot, onCapture, onClose, onFallback }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facing, setFacing] = useState(slot.id === 4 ? 'environment' : 'user')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [timer, setTimer] = useState(slot.id === 4) // full body: self-timer on by default
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setError('')
    ;(async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setError('This browser cannot open the camera here (needs HTTPS or localhost).'); return }
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
        setReady(true)
      } catch (e) {
        setError(e.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow camera access in your browser, or use Upload.' : e.name === 'NotFoundError' ? 'No camera was found on this device. Use Upload instead.' : `Could not start the camera (${e.message}).`)
      }
    })()
    return () => { cancelled = true }
  }, [facing])

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const k = Math.min(1, 800 / Math.max(v.videoWidth, v.videoHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(v.videoWidth * k)
    c.height = Math.round(v.videoHeight * k)
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height) // saved un-mirrored, like a normal photo
    onCapture(slot.id, c.toDataURL('image/jpeg', 0.85))
  }

  const shoot = () => {
    if (!timer) return snap()
    let n = 5
    setCount(n)
    const t = setInterval(() => {
      n -= 1
      if (n <= 0) { clearInterval(t); setCount(0); snap() } else setCount(n)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-subtle-border">
          <div><div className="eyebrow">Live camera</div><div className="text-lg font-semibold text-wine leading-tight">{slot.title}</div></div>
          <button onClick={onClose} aria-label="Close camera"><X size={20} /></button>
        </div>
        <div className="relative bg-black aspect-[3/4]">
          <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`} />
          {!error && <img src={slot.example} alt="" className="absolute right-3 top-3 w-20 rounded-lg border-2 border-white/80 opacity-90" />}
          {count > 0 && <div className="absolute inset-0 flex items-center justify-center text-white text-8xl font-editorial drop-shadow">{count}</div>}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-cream text-sm">
              <p>{error}</p>
              <button onClick={onFallback} className="bg-gold-warm text-charcoal text-xs font-semibold rounded-full px-5 py-2">Use device camera app / upload</button>
            </div>
          )}
        </div>
        <p className="px-5 pt-3 text-[0.72rem] text-bronze">{slot.hint}</p>
        <div className="p-5 flex items-center gap-3">
          <button onClick={() => setTimer(!timer)} className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3.5 py-2 border ${timer ? 'bg-wine text-cream border-wine' : 'border-subtle-border'}`}><Timer size={13} /> 5s timer</button>
          <button onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')} className="inline-flex items-center gap-1.5 text-xs rounded-full px-3.5 py-2 border border-subtle-border"><RefreshCw size={13} /> Flip</button>
          <button onClick={shoot} disabled={!ready || count > 0} className="ml-auto inline-flex items-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full px-6 py-2.5 disabled:opacity-40"><Camera size={15} /> Capture</button>
        </div>
      </div>
    </div>
  )
}
