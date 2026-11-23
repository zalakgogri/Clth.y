// Visitor confirmation email through the owner's Supabase project (Supabase Auth sends it).
// The anon key is public by design (it ships in the browser); row-level security and Auth rules protect the data.
const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabaseEnabled = !!(URL && KEY)

export async function sendConfirmation(email, meta = {}) {
  let res
  try {
    res = await fetch(`${URL}/auth/v1/otp?redirect_to=${encodeURIComponent(window.location.origin)}`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: true, data: { source: 'clthy-report', ...meta } }),
    })
  } catch {
    throw new Error('Could not reach the email service. Check your connection and try again.')
  }
  if (res.ok) return true
  const body = await res.json().catch(() => ({}))
  const code = body.error_code || body.code || ''
  if (code === 'over_email_send_rate_limit' || res.status === 429) throw new Error('Too many emails were requested. Please try again in a little while.')
  if (/not_authorized|not authorized/i.test(code + ' ' + (body.msg || body.message || ''))) throw new Error('Our email service is not open to the public yet. The owner needs to switch on custom email sending in Supabase.')
  if (code === 'email_address_invalid' || res.status === 422) throw new Error('That email address was not accepted. Please check it.')
  throw new Error(body.msg || body.message || 'The confirmation email could not be sent.')
}

// Records the submission in the owner's Supabase table (visitors can only add rows; the owner reads them in the dashboard).
export async function saveSubmission(email, season, looksCount) {
  try {
    await fetch(`${URL}/rest/v1/report_requests`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email, season: season || null, looks_count: looksCount ?? null }),
    })
  } catch { /* the visitor's confirmation still goes out */ }
}
