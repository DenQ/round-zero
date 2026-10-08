import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import type { ActivityPackRef } from '@entities/activity'
import { isQuestionCorrect, QuestionCard, type Question } from '@entities/question'
import { FlagCrookedQuestionButton } from '@features/flag-crooked-question'
import { packLevelLabel, packTopicLabel } from '@shared/lib/packs'
import { GameHeader } from './GameHeader'

type QuizRoundProps = {
  pack: ActivityPackRef
  question: Question
  step: number
  total: number
  selectedIndex: number | null
  revealed: boolean
  correctCount: number
  incorrectCount: number
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
  correctCount,
  incorrectCount,
  onSelect,
  onNext,
}: QuizRoundProps) {
  const { t } = useTranslation()
  const isCorrect = selectedIndex !== null && isQuestionCorrect(question, selectedIndex)

  return (
    <Stack spacing={2}>
      <GameHeader
        questionId={question.id}
        step={step}
        total={total}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        pendingCorrect={revealed ? isCorrect : null}
      />

      <QuestionCard
        question={question}
        index={step}
        topicLabel={packTopicLabel(pack, t)}
        levelLabel={packLevelLabel(pack, t)}
        selectedIndex={selectedIndex}
        revealed={revealed}
        onSelect={onSelect}
        headerEnd={<FlagCrookedQuestionButton question={question} pack={pack} />}
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
