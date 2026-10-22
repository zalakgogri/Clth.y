import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MapPin, RotateCcw, Menu, X, Sparkles } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'

const LINKS = [
  { to: '/intake', label: 'Intake' },
  { to: '/report', label: 'Diagnostic Report' },
  { to: '/wardrobe', label: 'Wardrobe Hub' },
  { to: '/studio', label: 'Mix & Match Studio' },
  { to: '/saved', label: 'Lookbook' },
]

export default function Navbar() {
  const { profile, resetProfile } = useProfile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const persona = profile.report.skeletal.frame
  const cls = ({ isActive }) =>
    `text-[0.78rem] tracking-wide transition-colors ${isActive ? 'text-wine font-semibold' : 'text-bronze hover:text-wine'}`

  return (
    <nav className="no-print sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-subtle-border">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-editorial text-2xl font-bold text-wine tracking-tight">CLTH<span className="text-gold-warm">.</span>Y</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-bronze border border-subtle-border rounded-full px-2.5 py-1 bg-white">
            <MapPin size={11} className="text-gold" /> Hongdae · Seoul
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={cls}>{l.label}</NavLink>)}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-[0.68rem] text-bronze border border-subtle-border rounded-full px-3 py-1 bg-white">
            Persona · <b className="text-wine font-semibold">{persona}</b>
          </span>
          <button
            onClick={() => { if (confirm('Reset your profile and saved looks?')) { resetProfile(); navigate('/') } }}
            title="Reset profile" className="p-2 text-bronze hover:text-wine"
          ><RotateCcw size={16} /></button>
          <Link to="/intake" className="inline-flex items-center gap-1.5 bg-wine text-cream text-xs font-semibold tracking-wide px-4 py-2 rounded-full hover:bg-charcoal transition-colors">
            <Sparkles size={13} /> Consultation
          </Link>
        </div>

        <button className="lg:hidden p-2 text-wine" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-subtle-border bg-cream px-5 py-4 flex flex-col gap-3">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={cls} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
          <button className="text-left text-xs text-bronze" onClick={() => { resetProfile(); setOpen(false); navigate('/') }}>Reset profile</button>
        </div>
      )}
    </nav>
  )
}
