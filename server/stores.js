// Supported stores, and the rules an outfit-item URL must pass before we ever show it.
// A link is attached only if it (1) is on the store's own domain, (2) has the shape of a
// single-product page, not a search/listing/home page, and (3) was returned by the model's
// live web search in this very request (so the model cannot invent it).
export const STORES = {
  Myntra: { domains: ['myntra.com'], product: /^\/(?:[^/]+\/)+\d{5,}\/buy\/?$/i },
  Ajio: { domains: ['ajio.com'], product: /\/p\/[0-9a-z]+_?[0-9a-z]*\/?$/i },
  'Tata CLiQ': { domains: ['tatacliq.com'], product: /-p-mp\d+\/?$|\/p-mp\d+\/?$/i },
  Zara: { domains: ['zara.com'], region: /^\/in\//i, product: /-p\d{6,}\.html$/i },
  'H&M': { domains: ['hm.com'], region: /^\/en_in\//i, product: /productpage\.\d+\.html$/i },
}

export const storeNames = Object.keys(STORES)

export function normalizeStoreName(name) {
  const n = String(name || '').toLowerCase().replace(/[^a-z]/g, '')
  if (n.startsWith('zara')) return 'Zara'
  if (n.startsWith('hm') || n.includes('handm')) return 'H&M'
  if (n.includes('tata') || n.includes('cliq')) return 'Tata CLiQ'
  return storeNames.find((s) => s.toLowerCase().replace(/[^a-z]/g, '') === n) || null
}

// The user's selection ("Zara", "H&M", "Zara / H&M", ...) -> concrete supported stores.
export function resolveStores(selected = []) {
  const out = new Set()
  for (const raw of selected) {
    const direct = normalizeStoreName(raw)
    if (direct) out.add(direct)
    if (/zara/i.test(raw)) out.add('Zara')
    if (/h\s*&\s*m/i.test(raw)) out.add('H&M')
    if (/myntra/i.test(raw)) out.add('Myntra')
    if (/ajio/i.test(raw)) out.add('Ajio')
    if (/cliq/i.test(raw)) out.add('Tata CLiQ')
  }
  return [...out]
}

export const allowedDomains = (stores) => stores.flatMap((s) => STORES[s].domains)

const canon = (u) => {
  try {
    const x = new URL(u)
    return `${x.hostname.replace(/^www\d?\./, '')}${x.pathname.replace(/\/+$/, '')}`.toLowerCase()
  } catch { return null }
}

// Returns a clean https URL or null.
export function verifyProductUrl({ url, store, seenUrls }) {
  const rule = STORES[store]
  if (!rule || !url) return null
  let u
  try { u = new URL(url) } catch { return null }
  if (u.protocol !== 'https:') return null
  const host = u.hostname.toLowerCase()
  if (!rule.domains.some((d) => host === d || host.endsWith(`.${d}`))) return null
  if (!rule.product.test(u.pathname)) return null
  if (rule.region && !rule.region.test(u.pathname)) return null // India storefront only
  if (/search|\/c\/|categor/i.test(u.pathname) && !rule.product.test(u.pathname)) return null
  if (!seenUrls.has(canon(url))) return null
  return `${u.origin}${u.pathname}`
}

export const canonUrl = canon
