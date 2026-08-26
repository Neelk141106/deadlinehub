import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App2.jsx'
import { DeadlineProvider } from './context/DeadlineContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DeadlineProvider>
      <App />
    </DeadlineProvider>
  </StrictMode>,
)

