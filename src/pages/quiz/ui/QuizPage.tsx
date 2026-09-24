import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslation } from 'react-i18next'
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
    <QuizGame
      questions={state.pack.questions}
      pack={{
        stack: state.pack.stack,
        topic: state.pack.topic,
        level: state.pack.level,
      }}
    />
  )
}
