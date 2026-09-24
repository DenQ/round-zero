import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { ActivityHeatmap } from '@widgets/activity-heatmap'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <Stack spacing={3}>
      <Stack spacing={1.5}>
        <Typography variant="h4" component="h1">
          {t('home.title')}
        </Typography>
        <Typography color="text.secondary">{t('home.description')}</Typography>
      </Stack>
      <ActivityHeatmap />
    </Stack>
  )
}
