import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { ActivityPackRef } from '@entities/activity'
import { PackContext } from './PackContext'

type RoundResultProps = {
  pack: ActivityPackRef
  score: number
  total: number
  onReplay: () => void
}

export function RoundResult({ pack, score, total, onReplay }: RoundResultProps) {
  const { t } = useTranslation()
  const missed = total - score

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', py: 4 }}>
      <Typography variant="h4" component="h1">
        {t('quiz.game.resultTitle')}
      </Typography>
      <PackContext pack={pack} />

      <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="h2" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {score}
        </Typography>
        <Typography color="text.secondary">{t('quiz.game.resultPoints')}</Typography>
        <Typography>{t('quiz.game.resultScore', { score, total })}</Typography>
      </Stack>

      <Stack direction="row" spacing={4}>
        <Stat label={t('quiz.game.correct')} value={score} />
        <Stat label={t('quiz.game.incorrect')} value={missed} />
      </Stack>

      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        onClick={onReplay}
      >
        {t('quiz.game.playAgain')}
      </Button>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center', minWidth: 96 }}>
      <Typography variant="h5" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}
