import { useEffect, useState } from 'react'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { emailReport } from '../data/api'
import { sendConfirmation, saveSubmission, supabaseEnabled } from '../data/supabase'

// Builds a plain-text report and opens the visitor's own mail app with a draft to themselves (no server needed).
function draftBody(profile) {
  const R = profile.report
  const list = (c) => (c || []).map((x) => `${x.name} ${x.hex}`).join(', ')
  const mk = R.makeupPalette
  const looks = (profile.outfits || []).slice(0, 3).map((l) => `- ${l.name} (${l.occasion})\n` + l.pieces.map((p) => `    ${p.role}: ${p.name}${p.url ? ' ' + p.url : ''}`).join('\n')).join('\n')
  return [
    `My CLTH.Y colour report`, ``, `Season: ${R.seasonType}`, R.skinReading?.plain || '', ``,
    `Power colours: ${list(R.powerColors)}`, `Colours to avoid: ${list(R.dissonantColors)}`,
    mk ? `\nMakeup and hair\nLips: ${list(mk.lips)}\nBlush: ${list(mk.blush)}\nEyes: ${list(mk.eyes)}\nHair: ${list(mk.hair)}` : '',
    looks ? `\nLooks picked for me\n${looks}` : '', ``, `https://clthy.vercel.app`,
  ].filter((x) => x !== undefined).join('\n')
}

// "Email me this report": the visitor types their own address and gets one email back right away.
export default function EmailReport({ profile }) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [trap, setTrap] = useState('') // hidden field; real people never fill it
  const [state, setState] = useState({ status: 'idle', message: '' })
  const [available, setAvailable] = useState(false)
  const [keeps, setKeeps] = useState(false)

  // Only show the card when the server has email set up.
  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then((h) => { setAvailable(!!h.emailConfigured); setKeeps(!!h.leadsSaved) }).catch(() => setAvailable(false))
  }, [])

  const send = async (e) => {
    e.preventDefault()
    if (draftMode) {
      const body = draftBody(profile).slice(0, 1800)
      window.location.href = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent('My CLTH.Y colour report: ' + profile.report.seasonType)}&body=${encodeURIComponent(body)}`
      setState({ status: 'sent', message: 'Your email app should open with the report ready. Press Send to keep a copy in your inbox.' })
      return
    }
    setState({ status: 'sending', message: '' })
    try {
      if (viaSupabase) {
        await saveSubmission(email.trim(), profile.report.seasonType, (profile.outfits || []).length)
        await sendConfirmation(email.trim(), { season: profile.report.seasonType })
        setState({ status: 'sent', message: `Done. A confirmation email is on its way to ${email.trim()} (check spam too).` })
        return
      }
      await emailReport(profile, email.trim(), consent, trap)
      setState({ status: 'sent', message: `Sent. Check ${email.trim()} (and your spam folder).` })
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  const viaSupabase = !available && supabaseEnabled // visitor-only confirmation through Supabase
  const draftMode = !available && !supabaseEnabled

  return (
    <section className="no-print mt-14 bg-white hairline rounded-3xl p-7 md:p-9">
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-11 h-11 rounded-full bg-coral/20 text-wine flex items-center justify-center"><Mail size={20} /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl text-wine font-semibold leading-tight">Get this report in your inbox</h2>
          <p className="text-sm text-bronze mt-1 max-w-xl">{viaSupabase ? 'We’ll send a confirmation email to your inbox so you can come back to your season any time.' : draftMode ? 'We’ll open an email draft addressed to you with your season, colours, makeup shades and top looks, so you can keep it and shop from your phone.' : 'We’ll email your season, colours, makeup shades and top looks, with the exact product links, so you can shop from your phone.'}</p>
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
                  {state.status === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} {draftMode ? 'Open email draft' : viaSupabase ? 'Send confirmation' : 'Email me'}
                </button>
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <label className="flex items-start gap-2 text-xs text-bronze cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#3E1F47]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{viaSupabase ? 'Send me a confirmation email. My address is saved in the site’s sign-up list, and nothing is sent to anyone else.' : draftMode ? 'Open an email draft to myself. Nothing is sent or saved by this site.' : <>Send me this one email. I understand the site owner is notified that a report was sent{keeps ? ' and may keep my address to follow up' : ', and my address is not saved'}.</>}</span>
              </label>
              {state.status === 'error' && <p className="flex items-start gap-2 text-sm text-red-800"><AlertCircle size={16} className="shrink-0 mt-0.5" /> {state.message}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
