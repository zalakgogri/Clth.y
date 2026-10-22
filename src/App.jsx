import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ProfileProvider } from './data/ProfileContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import IntakePage from './pages/IntakePage'
import AnalyzingPage from './pages/AnalyzingPage'
import ReportPage from './pages/ReportPage'
import WardrobePage from './pages/WardrobePage'
import TryOnPage from './pages/TryOnPage'
import StudioPage from './pages/StudioPage'
import SavedPage from './pages/SavedPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <main className="min-h-[70vh]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/tryon/:id" element={<TryOnPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ProfileProvider>
  )
}
