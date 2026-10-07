import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { levelFromScore, useRating } from '@entities/rating'
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
  const { t, i18n } = useTranslation()
  const rating = useRating()
  const { level } = levelFromScore(rating.score)
  const scoreLabel = rating.score.toLocaleString(i18n.resolvedLanguage ?? i18n.language)
  const ratingLabel = t('header.ratingLabel', { level, score: scoreLabel })
  const settingsLabel = t('nav.settings')

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
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={ratingLabel}>
            <Typography
              variant="body2"
              noWrap
              aria-label={ratingLabel}
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', px: 1 }}
            >
              {t('header.rating', { level, score: scoreLabel })}
            </Typography>
          </Tooltip>
          <Tooltip title={settingsLabel}>
            <IconButton color="inherit" component={Link} to="/settings" aria-label={settingsLabel}>
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export { DRAWER_WIDTH }
