import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { QuestionPack } from '@entities/question'
import { QuizGame } from '@features/quiz-game'
import { useQuestionPack } from '../model/useQuestionPack'

export function QuizPage() {
  const { t } = useTranslation()
  const state = useQuestionPack()

  if (state.status === 'invalid') {
    return <Alert severity="error">{t('quiz.notFound')}</Alert>
  }

  if (state.status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label={t('quiz.loading')} />
      </Box>
    )
  }

  if (state.status === 'error') {
    return <Alert severity="error">{t('quiz.error')}</Alert>
  }

  return (
    <ReadyQuiz
      questions={state.pack.questions}
      stack={state.pack.stack}
      topic={state.pack.topic}
      level={state.pack.level}
    />
  )
}

function ReadyQuiz({
  questions,
  stack,
  topic,
  level,
}: {
  questions: QuestionPack['questions']
  stack: QuestionPack['stack']
  topic: QuestionPack['topic']
  level: QuestionPack['level']
}) {
  const pack = useMemo(() => ({ stack, topic, level }), [stack, topic, level])

  return <QuizGame questions={questions} pack={pack} />
}
