import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useProfile } from '../data/ProfileContext'

// Wraps pages that require the Mandatory User Approval Gate on /report.
export default function ApprovalGate({ children }) {
  const { profile } = useProfile()
  if (profile.approved) return children
  return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Lock className="mx-auto text-gold" size={30} />
      <h1 className="text-4xl text-wine font-semibold mt-4">Approval required</h1>
      <p className="text-bronze mt-3 text-sm leading-relaxed">Your styling is unlocked only after you review and approve your DOES diagnostic report. This guarantees every look is built on a profile you agree with.</p>
      <Link to="/report" className="inline-block mt-7 bg-wine text-cream text-sm font-semibold rounded-full px-7 py-3 hover:bg-charcoal">Review my report</Link>
    </div>
  )
}
