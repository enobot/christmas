import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled with the site (no requests to outside font services).
import '@fontsource/im-fell-english/latin-400.css'
import '@fontsource/im-fell-english/latin-400-italic.css'
import '@fontsource/dancing-script/latin-500.css'
import '@fontsource/dancing-script/latin-700.css'
import '@fontsource/orbitron/latin-700.css'
import './index.css'
import App from './App.jsx'
import { SurpriseErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SurpriseErrorBoundary>
      <App />
    </SurpriseErrorBoundary>
  </StrictMode>,
)
