import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeModeContext } from './ThemeModeContext'
import {
  THEME_STORAGE_KEY,
  readStoredThemeMode,
  type ThemeMode,
} from './theme-mode'

type AppThemeProviderProps = {
  children: ReactNode
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(readStoredThemeMode)

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: {
          fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
        },
      }),
    [mode],
  )

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
