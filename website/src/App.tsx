import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './models/App.css'
import Navigation from './components/Navigation'
import BlobHero from './components/BlobHero'
import ProblemStatement from './components/ProblemStatement'
import Solution from './components/Solution'
import SurveyCTA from './components/SurveyCTA'
import Footer from './components/Footer'
import Survey from './pages/Survey'
import Verify from './pages/Verify'
import Transparency from './pages/Transparency'
import Admin from './pages/Admin'
import Research from './pages/Research'
import Guides from './pages/Guides'

function Landing() {
  return (
    <>
      <div className="flex flex-col relative z-20">
        <BlobHero />
        <ProblemStatement />
        <Solution />
        <SurveyCTA />
      </div>
    </>
  )
}

import { SolanaWalletProvider } from './providers/WalletProvider'
import { SuiWalletProvider } from './providers/SuiWalletProvider'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function HackathonBadge() {
  const [expanded, setExpanded] = useState(false)
  const [showHint, setShowHint] = useState(true)

  // Hide the "tap" hint after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Escape key to close
  useEffect(() => {
    if (!expanded) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  return (
    <>
      {/* Pulse keyframes injected once */}
      <style>{`
        @keyframes badge-pulse {
          0%, 100% {
            border-color: rgba(168,85,247,0.4);
            box-shadow: 0 0 6px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.15), 0 4px 57px rgba(0,0,0,0.4);
          }
          50% {
            border-color: rgba(200,140,255,0.95);
            box-shadow: 0 0 14px rgba(200,140,255,0.9), 0 0 88px rgba(168,85,247,0.35), 0 4px 77px rgba(0,0,0,0.5);
          }
        }
      `}</style>

      {/* Backdrop overlay when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Badge */}
      <div
        className="fixed z-50 transition-all duration-500 ease-in-out cursor-pointer"
        style={expanded ? {
          bottom: '50%',
          left: '50%',
          transform: 'translate(-50%, 50%) scale(2.2)',
        } : {
          bottom: '1rem',
          left: '1rem',
          transform: 'translate(0, 0) scale(1)',
        }}
        onClick={() => {
          if (!expanded) {
            setExpanded(true)
            setShowHint(false)
          }
        }}
      >
        <img
          src="/branding/hackathon-badge.png"
          alt="Monolith Solana Mobile Hackathon — Registered"
          className={`w-36 md:w-44 rounded-xl border-2 transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
          style={{ animation: 'badge-pulse 3s ease-in-out infinite' }}
        />

        {/* Tap hint — appears on load, fades out after 4s */}
        {!expanded && (
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-zinc-900/90 border border-purple-500/30 text-[10px] text-purple-300 font-bold uppercase tracking-widest rounded-full backdrop-blur-sm transition-all duration-1000 ${showHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}
          >
            Tap to explore
          </div>
        )}

        {expanded && (
          <a
            href="https://solanamobile.com/hackathon"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-purple-500 transition-colors shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Hackathon →
          </a>
        )}
      </div>
    </>
  )
}

function App() {
  return (
    <SolanaWalletProvider>
      <SuiWalletProvider>
        <main className="min-h-screen bg-black scroll-smooth">
          <ScrollToTop />
          <Navigation />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/research" element={<Research />} />
            <Route path="/research/consent" element={<Research />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/teepin" element={<Guides />} />
            <Route path="/session-bind-guide" element={<Guides />} />
            <Route path="/sovereign-guide" element={<Guides />} />
          </Routes>
          <Footer />

          {/* Monolith Hackathon Badge */}
          <HackathonBadge />
        </main>
      </SuiWalletProvider>
    </SolanaWalletProvider>
  )
}

export default App
