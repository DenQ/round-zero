import FlagIcon from '@mui/icons-material/Flag'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { ActivityPackRef } from '@entities/activity'
import { toggleCrookedQuestion, useCrookedQuestions, type CrookedQuestion } from '@entities/crooked-question'
import type { Question } from '@entities/question'
import { useTranslation } from 'react-i18next'

type FlagCrookedQuestionButtonProps = {
  question: Question
  pack: ActivityPackRef
}

export function FlagCrookedQuestionButton({ question, pack }: FlagCrookedQuestionButtonProps) {
  const { t } = useTranslation()
  const flagged = useCrookedQuestions().items.some((item) => item.id === question.id)
  const label = flagged ? t('quiz.crooked.unflag') : t('quiz.crooked.flag')

  const item: Omit<CrookedQuestion, 'flaggedAt'> = {
    id: question.id,
    type: question.type,
    pack,
  }

  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        color={flagged ? 'warning' : 'default'}
        aria-label={label}
        aria-pressed={flagged}
        onClick={() => toggleCrookedQuestion(item)}
      >
        {flagged ? <FlagIcon fontSize="small" /> : <FlagOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}
