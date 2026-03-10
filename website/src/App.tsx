import { Routes, Route } from 'react-router-dom'
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
import Teepin from './pages/Teepin'
import SessionBind from './pages/SessionBind'
import SovereignMode from './pages/SovereignMode'

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

function App() {
  return (
    <SolanaWalletProvider>
      <SuiWalletProvider>
        <main className="min-h-screen bg-black scroll-smooth">
          <Navigation />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/research" element={<Research />} />
            <Route path="/research/consent" element={<Research />} />
            <Route path="/teepin" element={<Teepin />} />
            <Route path="/session-bind-guide" element={<SessionBind />} />
            <Route path="/sovereign-guide" element={<SovereignMode />} />
          </Routes>
          <Footer />
        </main>
      </SuiWalletProvider>
    </SolanaWalletProvider>
  )
}

export default App
