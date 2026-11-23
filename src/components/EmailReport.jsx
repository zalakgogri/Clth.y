import { useEffect, useState } from 'react'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { emailReport } from '../data/api'

// "Email me this report": the visitor types their own address and gets one email back right away.
export default function EmailReport({ profile }) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [trap, setTrap] = useState('') // hidden field; real people never fill it
  const [state, setState] = useState({ status: 'idle', message: '' })
  const [available, setAvailable] = useState(false)

  // Only show the card when the server has email set up.
  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then((h) => setAvailable(!!h.emailConfigured)).catch(() => setAvailable(false))
  }, [])

  const send = async (e) => {
    e.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      await emailReport(profile, email.trim(), consent, trap)
      setState({ status: 'sent', message: `Sent. Check ${email.trim()} (and your spam folder).` })
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  if (!available) return null

  return (
    <section className="no-print mt-14 bg-white hairline rounded-3xl p-7 md:p-9">
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-11 h-11 rounded-full bg-coral/20 text-wine flex items-center justify-center"><Mail size={20} /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl text-wine font-semibold leading-tight">Get this report in your inbox</h2>
          <p className="text-sm text-bronze mt-1 max-w-xl">We’ll email your season, colours, makeup shades and top looks, with the exact product links, so you can shop from your phone.</p>
          {state.status === 'sent' ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-teal font-medium"><CheckCircle2 size={18} /> {state.message}</p>
          ) : (
            <form onSubmit={send} className="mt-5 flex flex-col gap-3 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1">
                  <span className="sr-only">Your email address</span>
                  <input id="report-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cream border border-subtle-border rounded-full px-5 py-3 text-sm focus:outline-none focus:border-wine" />
                </label>
                <button type="submit" disabled={state.status === 'sending' || !consent}
                  className="inline-flex items-center justify-center gap-2 bg-wine text-cream text-sm font-semibold rounded-full px-7 py-3 hover:bg-charcoal disabled:opacity-40">
                  {state.status === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Email me
                </button>
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <label className="flex items-start gap-2 text-xs text-bronze cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#3E1F47]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Send me this one email. I understand the site owner is notified that a report was sent, and my address is not saved.</span>
              </label>
              {state.status === 'error' && <p className="flex items-start gap-2 text-sm text-red-800"><AlertCircle size={16} className="shrink-0 mt-0.5" /> {state.message}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
