import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App2.jsx'
import { DeadlineProvider } from './context/DeadlineContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <DeadlineProvider>
        <App />
      </DeadlineProvider>
    </ThemeProvider>
  </StrictMode>,
)
