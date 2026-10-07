import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { clearActivity } from '@entities/activity'
import { clearRating } from '@entities/rating'
import { useTranslation } from 'react-i18next'

export function SettingsPage() {
  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const reset = () => {
    clearActivity()
    clearRating()
    setConfirmOpen(false)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        {t('settings.title')}
      </Typography>

      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          {t('settings.ratingTitle')}
        </Typography>
        <Typography color="text.secondary">{t('settings.points')}</Typography>
        <Typography color="text.secondary">{t('settings.streak')}</Typography>
        <Typography color="text.secondary">{t('settings.levels')}</Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h6" component="h2">
          {t('settings.resetTitle')}
        </Typography>
        <Typography color="text.secondary">{t('settings.resetDescription')}</Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setConfirmOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('settings.reset')}
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('settings.resetConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('settings.resetConfirmBody')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('settings.cancel')}</Button>
          <Button color="error" onClick={reset}>
            {t('settings.resetConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
