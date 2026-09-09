import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App2.jsx'
import { DeadlineProvider } from './context/DeadlineContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DeadlineProvider>
          <App />
        </DeadlineProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
