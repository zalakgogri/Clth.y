import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as store from './storage'

const Ctx = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => store.getUserProfile())

  const wrap = useCallback((fn) => (...args) => {
    const next = fn(...args)
    setProfile({ ...next })
    return next
  }, [])

  const api = useMemo(() => ({
    profile,
    updateDemographics: wrap(store.updateDemographics),
    updatePhotos: wrap(store.updatePhotos),
    loadSamplePhotos: wrap(store.loadSamplePhotos),
    completeIntake: wrap(store.completeIntake),
    approveReport: wrap(store.approveReport),
    setAnalysis: wrap(store.setAnalysis),
    setOutfits: wrap(store.setOutfits),
    toggleWishlist: wrap(store.toggleWishlist),
    resetProfile: () => setProfile(store.resetProfile()),
  }), [profile, wrap])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(Ctx)
