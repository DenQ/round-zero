import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { ActivityPackRef } from '@entities/activity'
import { QuestionCard } from '@entities/question'
import type { Question } from '@entities/question'
import { packLevelLabel, packTopicLabel } from '@shared/lib/packs'

type QuizRoundProps = {
  pack: ActivityPackRef
  question: Question
  step: number
  total: number
  selectedIndex: number | null
  revealed: boolean
  onSelect: (optionIndex: number) => void
  onNext: () => void
}

export function QuizRound({
  pack,
  question,
  step,
  total,
  selectedIndex,
  revealed,
  onSelect,
  onNext,
}: QuizRoundProps) {
  const { t } = useTranslation()
  const isCorrect = selectedIndex === question.correctIndex

  return (
    <Stack spacing={2}>
      <Typography
        variant="h5"
        component="p"
        aria-live="polite"
        sx={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
      >
        {t('quiz.game.progress', { current: step + 1, total })}
      </Typography>

      <QuestionCard
        question={question}
        index={step}
        topicLabel={packTopicLabel(pack, t)}
        levelLabel={packLevelLabel(pack, t)}
        selectedIndex={selectedIndex}
        revealed={revealed}
        onSelect={onSelect}
      />

      {revealed ? (
        <Alert severity={isCorrect ? 'success' : 'error'}>
          {isCorrect ? t('quiz.game.correct') : t('quiz.game.incorrect')}
        </Alert>
      ) : null}

      {revealed ? (
        <Button variant="contained" size="large" onClick={onNext} sx={{ alignSelf: 'center', minWidth: 200 }}>
          {t('quiz.game.next')}
        </Button>
      ) : null}
    </Stack>
  )
}
