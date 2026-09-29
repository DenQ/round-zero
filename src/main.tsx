import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app'
import { installActivityRecovery } from '@entities/activity'
import '@shared/config/i18n'
import '@app/styles/index.css'

installActivityRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
