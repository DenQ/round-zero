import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { MobileNavSheet } from './MobileNavSheet'

export function AppLayout() {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [layoutIsDesktop, setLayoutIsDesktop] = useState(isDesktop)

  if (layoutIsDesktop !== isDesktop) {
    setLayoutIsDesktop(isDesktop)
    if (isDesktop) {
      setMobileOpen(false)
    }
  }

  const menuExpanded = isDesktop ? desktopOpen : mobileOpen
  const menuLabel = menuExpanded
    ? t(isDesktop ? 'nav.collapse' : 'nav.close')
    : t('nav.open')

  const toggleMenu = () => {
    if (isDesktop) {
      setDesktopOpen((open) => !open)
      return
    }

    setMobileOpen((open) => !open)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <AppHeader menuExpanded={menuExpanded} menuLabel={menuLabel} onToggleMenu={toggleMenu} />
      {isDesktop ? <AppSidebar open={desktopOpen} /> : null}
      <MobileNavSheet
        open={!isDesktop && mobileOpen}
        onOpen={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
