import { AppThemeProvider } from '@shared/lib/theme'
import { AppRouter } from './router'

export function App() {
  return (
    <AppThemeProvider>
      <AppRouter />
    </AppThemeProvider>
  )
}
