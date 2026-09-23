import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@features/language-switcher'
import { ThemeSwitcher } from '@features/theme-switcher'

const DRAWER_WIDTH = 240

export function AppHeader() {
  const { t } = useTranslation()

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t('app.title')}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export { DRAWER_WIDTH }
