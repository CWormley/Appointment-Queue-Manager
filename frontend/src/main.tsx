/**
 * Main Entry Point
 * 
 * @description
 * Application entry point. Renders the root React component with StrictMode
 * enabled for development checks and warnings.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
