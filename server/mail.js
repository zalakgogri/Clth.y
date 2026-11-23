// Emails the visitor their own colour report (they ask for it) and notifies the site owner.
// Sent through SMTP (e.g. a Gmail address with an app password). Nothing is stored.
import nodemailer from 'nodemailer'
import { SEASONS } from './palettes.js'
import { leadsConfigured, saveLead } from './leads.js'

const HEX = /^#[0-9a-f]{6}$/i
const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,}$/
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export const mailConfigured = () => !!((process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.EMAIL_DRY_RUN)

function transporter() {
  if (process.env.EMAIL_DRY_RUN) return nodemailer.createTransport({ jsonTransport: true })
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

// Only accept a small, validated shape — this endpoint must never become a way to send arbitrary text.
export function cleanReport(r = {}) {
  const season = Object.keys(SEASONS).includes(r.season) ? r.season : null
  if (!season) return null
  const colours = (list, n = 6) => (Array.isArray(list) ? list : []).filter((c) => c && HEX.test(c.hex)).slice(0, n).map((c) => ({ name: String(c.name || '').slice(0, 40), hex: c.hex.toUpperCase() }))
  const looks = (Array.isArray(r.looks) ? r.looks : []).slice(0, 3).map((l) => ({
    name: String(l.name || '').slice(0, 60), occasion: String(l.occasion || '').slice(0, 60),
    pieces: (Array.isArray(l.pieces) ? l.pieces : []).slice(0, 3).map((p) => ({
      role: String(p.role || '').slice(0, 20), name: String(p.name || '').slice(0, 90), platform: String(p.platform || '').slice(0, 20),
      price: p.price != null && Number.isFinite(Number(p.price)) ? Math.round(Number(p.price)) : null,
      url: typeof p.url === 'string' && /^https:\/\/([a-z0-9-]+\.)*(tatacliq|myntra|ajio|zara|hm)\.com\//i.test(p.url) ? p.url.slice(0, 400) : null,
    })),
  }))
  const mk = r.makeupPalette && typeof r.makeupPalette === 'object' ? r.makeupPalette : null
  return {
    season, summary: String(r.summary || '').slice(0, 400), skinPlain: String(r.skinPlain || '').slice(0, 300),
    power: colours(r.power), avoid: colours(r.avoid),
    makeup: mk ? { lips: colours(mk.lips, 3), blush: colours(mk.blush, 2), eyes: colours(mk.eyes, 3), hair: colours(mk.hair, 3) } : null,
    looks,
  }
}

const row = (list) => `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${list.map((c) => `<td style="padding:0 8px 8px 0"><div style="width:84px;height:54px;border-radius:10px;background:${c.hex};border:1px solid #E7DDE9"></div><div style="font:600 12px Arial,sans-serif;color:#2B2230;margin-top:5px;width:84px">${esc(c.name)}</div><div style="font:11px monospace;color:#5B4E63">${c.hex}</div></td>`).join('')}</tr></table>`

export function reportHtml(d, siteUrl, keeps = false) {
  const h = (t) => `<h2 style="font:700 20px Georgia,serif;color:#3E1F47;margin:26px 0 8px">${t}</h2>`
  const inr = (n) => (n == null ? 'price on store' : `₹${n.toLocaleString('en-IN')}`)
  return `<!doctype html><html><body style="margin:0;background:#FBF6EE"><div style="max-width:620px;margin:0 auto;padding:28px 20px;font:15px/1.55 Arial,sans-serif;color:#2B2230">
<div style="background:#3E1F47;color:#FBF6EE;border-radius:16px;padding:28px"><div style="font:12px Arial;letter-spacing:3px;text-transform:uppercase;color:#F2B134">CLTH.Y colour report</div>
<div style="font:700 34px Georgia,serif;margin-top:6px">Your season: ${esc(d.season)}</div>${d.skinPlain ? `<p style="margin:10px 0 0;color:#EBD9F0">${esc(d.skinPlain)}</p>` : ''}</div>
${d.summary ? `<p style="margin-top:18px">${esc(d.summary)}</p>` : ''}
${h('Your 6 power colours')}${row(d.power)}
${h('6 colours to avoid')}${row(d.avoid)}
${d.makeup ? `${h('Makeup and hair')}<p style="margin:0 0 6px;color:#5B4E63">Lips</p>${row(d.makeup.lips)}<p style="margin:8px 0 6px;color:#5B4E63">Blush</p>${row(d.makeup.blush)}<p style="margin:8px 0 6px;color:#5B4E63">Eyes</p>${row(d.makeup.eyes)}<p style="margin:8px 0 6px;color:#5B4E63">Hair</p>${row(d.makeup.hair)}` : ''}
${d.looks.length ? h('Looks picked for you') + d.looks.map((l) => `<div style="border:1px solid #E7DDE9;border-radius:12px;padding:14px;margin-bottom:10px;background:#fff"><b>${esc(l.name)}</b> <span style="color:#5B4E63">· ${esc(l.occasion)}</span>${l.pieces.map((p) => `<div style="margin-top:6px">${esc(p.role)}: ${p.url ? `<a href="${esc(p.url)}" style="color:#3E1F47">${esc(p.name)}</a>` : esc(p.name)} <span style="color:#5B4E63">· ${esc(p.platform)} · ${inr(p.price)}</span></div>`).join('')}</div>`).join('') : ''}
<p style="margin-top:26px"><a href="${esc(siteUrl)}" style="display:inline-block;background:#3E1F47;color:#FBF6EE;text-decoration:none;padding:12px 22px;border-radius:99px">Open CLTH.Y</a></p>
<p style="font-size:12px;color:#5B4E63;margin-top:22px">You asked for this email on CLTH.Y, so this is a one-off message. ${keeps ? 'The site owner may keep your address to follow up.' : 'We do not save your address.'} Colours come from your photos and are a guide, not a guarantee.</p>
</div></body></html>`
}

export async function sendReportEmail({ to, report, siteUrl, ip }) {
  if (!EMAIL.test(to)) throw Object.assign(new Error('Please enter a valid email address.'), { status: 400, code: 'bad_email' })
  const data = cleanReport(report)
  if (!data) throw Object.assign(new Error('Run the analysis first, then email your report.'), { status: 400, code: 'no_report' })
  if (!mailConfigured()) throw Object.assign(new Error('Email is not set up on this server yet.'), { status: 503, code: 'email_not_configured' })
  const t = transporter()
  const from = process.env.SMTP_FROM || `CLTH.Y <${process.env.SMTP_USER || 'no-reply@clthy.local'}>`
  const visitor = await t.sendMail({ from, to, subject: `Your CLTH.Y colour report: ${data.season}`, html: reportHtml(data, siteUrl, leadsConfigured()), text: `Your CLTH.Y season is ${data.season}. Open ${siteUrl} for the full report.` })
  const owner = process.env.NOTIFY_EMAIL
  let notified = false
  if (owner) {
    await t.sendMail({
      from, to: owner, subject: `CLTH.Y: a visitor emailed their report (${data.season})`,
      text: `A visitor asked for their colour report by email.\n\nSent to: ${to}\nSeason: ${data.season}\nLooks included: ${data.looks.length}\nTime: ${new Date().toISOString()}\nIP: ${ip || 'unknown'}\n`,
    }).then(() => { notified = true }).catch((e) => console.error('[mail] owner notification failed:', e.message))
  }
  let saved = false
  await saveLead({ email: to, season: data.season, looksCount: data.looks.length, ip }).then((ok) => { saved = ok }).catch((e) => console.error('[leads]', e.message))
  return { sent: true, notified, saved, dryRun: !!process.env.EMAIL_DRY_RUN, preview: process.env.EMAIL_DRY_RUN ? visitor.message : undefined }
}
