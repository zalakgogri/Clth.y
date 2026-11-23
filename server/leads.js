// Optional: keep a record of every visitor who asks for a report by email, in the owner's Supabase project.
// Uses Supabase's REST API with the service-role key (kept on the server only). Table: supabase/report_requests.sql
export const leadsConfigured = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function saveLead({ email, season, looksCount, ip }) {
  if (!leadsConfigured()) return false
  const base = process.env.SUPABASE_URL.replace(/\/+$/, '')
  const res = await fetch(`${base}/rest/v1/report_requests`, {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ email, season, looks_count: looksCount, ip }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Supabase insert failed (${res.status})`)
  return true
}
