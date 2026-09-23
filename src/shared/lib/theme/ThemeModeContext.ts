import { createContext } from 'react'
import type { ThemeMode } from './theme-mode'

export type ThemeModeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
  null,
)
