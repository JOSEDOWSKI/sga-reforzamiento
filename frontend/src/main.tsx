import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// NO importar index.css aquí - se carga condicionalmente en App.tsx
// Solo importar estilos base mínimos si es necesario
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
