// No synthetic store links anywhere in the app: a piece only gets a URL when the AI found
// that exact product page via live web search and the server verified it (server/stores.js).
export const retailUrl = () => null

export const inr = (n) => (n == null ? 'Price on store' : `₹${Math.round(n).toLocaleString('en-IN')}`)

export const LINK_MISSING = 'Exact link not found'
