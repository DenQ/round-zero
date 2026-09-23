import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import { useThemeMode } from '@shared/lib/theme'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const { mode, toggleMode } = useThemeMode()
  const label = mode === 'light' ? t('theme.toDark') : t('theme.toLight')

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleMode} aria-label={label}>
        {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}
