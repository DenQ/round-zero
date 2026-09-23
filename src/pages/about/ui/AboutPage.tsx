import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <Stack spacing={1.5}>
      <Typography variant="h4" component="h1">
        {t('about.title')}
      </Typography>
      <Typography color="text.secondary">{t('about.description')}</Typography>
    </Stack>
  )
}
