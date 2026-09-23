import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage?.startsWith('ru') ? 'ru' : 'en'
  const nextLanguage = language === 'ru' ? 'en' : 'ru'
  const label = t(`language.to.${nextLanguage}`)

  return (
    <Tooltip title={label}>
      <IconButton
        color="inherit"
        onClick={() => {
          void i18n.changeLanguage(nextLanguage)
        }}
        aria-label={label}
      >
        <Typography variant="button" component="span" sx={{ minWidth: 20 }}>
          {t(`language.${language}`)}
        </Typography>
      </IconButton>
    </Tooltip>
  )
}
