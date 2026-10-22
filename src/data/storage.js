import { DEFAULT_DEMOGRAPHICS, DEFAULT_DIAGNOSTIC_REPORT, DEFAULT_PHOTOS } from './defaultProfile'

export const STORAGE_KEY = 'clthy_user_profile'

const fresh = () => ({
  schema: 2,
  photos: { ...DEFAULT_PHOTOS },
  customPhotos: {}, // slots that hold real uploads
  demographics: { ...DEFAULT_DEMOGRAPHICS },
  report: DEFAULT_DIAGNOSTIC_REPORT,
  approved: false,
  wishlist: [], // [{ key, label, pieces:[{role,name,brand,platform,price,color,url}], total, savedAt }]
  intakeComplete: false,
  reportSource: 'preset', // 'ai' once the AI analysis has run
  reportNote: '',
  outfits: [], // AI-generated looks (empty -> preset demo looks)
  outfitsMeta: null,
})

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fresh()
    let saved = JSON.parse(raw)
    const base = fresh()
    // Photo slots changed (front / left / right / full body): drop photos saved under the old 5-slot layout.
    if (saved.schema !== 2) saved = { ...saved, photos: {}, customPhotos: {}, schema: 2 }
    return {
      ...base,
      ...saved,
      photos: { ...base.photos, ...(saved.photos || {}) },
      demographics: { ...base.demographics, ...(saved.demographics || {}) },
      report: saved.report || base.report,
    }
  } catch {
    return fresh()
  }
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Quota exceeded (large photos) — retry without the heavy photo payloads.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, photos: {}, customPhotos: {} }))
    } catch { /* storage unavailable; app keeps running in-memory */ }
  }
  return profile
}

export function updateDemographics(patch) {
  const p = getUserProfile()
  p.demographics = { ...p.demographics, ...patch }
  return saveUserProfile(p)
}

export function updatePhotos(slot, dataUrl) {
  const p = getUserProfile()
  if (dataUrl) {
    p.photos[slot] = dataUrl
    p.customPhotos = { ...p.customPhotos, [slot]: true }
  } else {
    p.photos[slot] = DEFAULT_PHOTOS[slot]
    const { [slot]: _removed, ...rest } = p.customPhotos
    p.customPhotos = rest
  }
  return saveUserProfile(p)
}

export function completeIntake() {
  const p = getUserProfile()
  p.intakeComplete = true
  p.approved = false
  return saveUserProfile(p)
}

export function approveReport(approved = true) {
  const p = getUserProfile()
  p.approved = approved
  return saveUserProfile(p)
}

export function toggleWishlist(entry) {
  const p = getUserProfile()
  const i = p.wishlist.findIndex((w) => w.key === entry.key)
  if (i >= 0) p.wishlist.splice(i, 1)
  else p.wishlist.unshift({ ...entry, savedAt: new Date().toISOString() })
  return saveUserProfile(p)
}

export function setAnalysis(report, source, note = '', key = '') {
  const p = getUserProfile()
  p.analysisKey = key
  p.report = report
  p.reportSource = source
  p.reportNote = note
  p.outfits = []
  p.outfitsMeta = null
  p.approved = false
  return saveUserProfile(p)
}

export function setOutfits(outfits, meta) {
  const p = getUserProfile()
  p.outfits = outfits
  p.outfitsMeta = meta
  return saveUserProfile(p)
}

export function resetProfile() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  return fresh()
}
