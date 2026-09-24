import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@features/language-switcher'
import { ThemeSwitcher } from '@features/theme-switcher'

const DRAWER_WIDTH = 240

type AppHeaderProps = {
  menuExpanded: boolean
  menuLabel: string
  onToggleMenu: () => void
}

export function AppHeader({ menuExpanded, menuLabel, onToggleMenu }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Tooltip title={menuLabel}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label={menuLabel}
            aria-expanded={menuExpanded}
            onClick={onToggleMenu}
            sx={{ mr: 1 }}
          >
            {menuExpanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none' }}
        >
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
