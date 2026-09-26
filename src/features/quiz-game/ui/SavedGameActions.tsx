import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

type SavedGameActionsProps = {
  label?: string
  step: number
  total: number
  onContinue: () => void
  onDiscard: () => void
}

export function SavedGameActions({ label, step, total, onContinue, onDiscard }: SavedGameActionsProps) {
  const { t } = useTranslation()

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
    >
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        {label ? (
          <Typography variant="body2" component="p">
            {label}
          </Typography>
        ) : (
          <Typography variant="body2" component="p">
            {t('quiz.game.unfinished')}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('quiz.game.progress', { current: step + 1, total })}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" onClick={onContinue}>
          {t('quiz.game.continue')}
        </Button>
        <Button size="small" color="inherit" onClick={onDiscard}>
          {t('quiz.game.discard')}
        </Button>
      </Stack>
    </Stack>
  )
}
