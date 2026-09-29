import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useActivity, type QuestionAttempt } from '@entities/activity'

const LOG_LIMIT = 10
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

type GameHeaderProps = {
  questionId: number
  step: number
  total: number
}

export function GameHeader({ questionId, step, total }: GameHeaderProps) {
  const { t, i18n } = useTranslation()
  const activity = useActivity()
  const history = activity.byQuestion[questionId]?.log ?? []
  const log = history.slice(-LOG_LIMIT)
  const correctCount = history.filter((attempt) => attempt.correct).length
  const incorrectCount = history.length - correctCount
  const locale = i18n.language.startsWith('ru') ? 'ru' : 'en'

  return (
    <Stack
      component="header"
      direction="row"
      spacing={1.5}
      aria-live="polite"
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        px: 2,
        py: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="body1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {t('quiz.game.progress', { current: step + 1, total })}
      </Typography>
      <Separator />
      <Typography variant="body1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {t('quiz.game.headerScore', {
          correct: correctCount,
          errors: t('quiz.game.errorCount', { count: incorrectCount }),
        })}
      </Typography>
      {log.length > 0 ? (
        <>
          <Separator />
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Typography variant="body1">{t('quiz.game.log')}:</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {log.map((attempt, index) => (
                <AttemptMark key={`${attempt.at}-${index}`} attempt={attempt} locale={locale} />
              ))}
            </Stack>
          </Stack>
        </>
      ) : null}
    </Stack>
  )
}

function Separator() {
  return (
    <Typography variant="body1" color="text.secondary" aria-hidden>
      |
    </Typography>
  )
}

function AttemptMark({ attempt, locale }: { attempt: QuestionAttempt; locale: string }) {
  const label = formatAttemptAt(attempt.at, locale)

  return (
    <Tooltip title={label} arrow>
      <Box
        component="span"
        role="img"
        aria-label={label}
        sx={{
          width: 14,
          height: 14,
          borderRadius: '2px',
          bgcolor: attempt.correct ? 'primary.main' : 'error.main',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    </Tooltip>
  )
}

function formatAttemptAt(at: string, locale: string): string {
  if (DATE_ONLY.test(at)) {
    const [year, month, day] = at.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return new Date(at).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
