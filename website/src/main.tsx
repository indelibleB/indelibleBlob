import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment (required for Sui/Solana SDKs)
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
