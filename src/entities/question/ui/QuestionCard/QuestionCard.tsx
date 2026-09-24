import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { CodeBlock } from '@shared/ui/CodeBlock'
import { getQuestionCorrectIndex } from '../../model/is-correct'
import type { Question } from '../../model/types'
import styles from './QuestionCard.module.css'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

type QuestionCardProps = {
  question: Question
  index: number
  topicLabel?: string
  levelLabel?: string
  selectedIndex?: number | null
  revealed?: boolean
  onSelect?: (optionIndex: number) => void
}

export function QuestionCard({
  question,
  index,
  topicLabel,
  levelLabel,
  selectedIndex = null,
  revealed = false,
  onSelect,
}: QuestionCardProps) {
  const { t } = useTranslation()

  return (
    <Card variant="outlined" component="article">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('quiz.question', { n: index + 1 })}
          </Typography>
          {question.type === 'code' && question.language ? (
            <Chip size="small" label={question.language.toUpperCase()} />
          ) : null}
          {topicLabel ? <Chip size="small" variant="outlined" label={topicLabel} /> : null}
          {levelLabel ? <Chip size="small" variant="outlined" label={levelLabel} /> : null}
        </Stack>

        {question.type === 'code' ? (
          <CodeBlock code={question.text} language={question.language} />
        ) : (
          <Typography variant="body1" className={styles.prompt}>
            {question.text}
          </Typography>
        )}

        <QuestionActions
          question={question}
          selectedIndex={selectedIndex}
          revealed={revealed}
          onSelect={onSelect}
        />

        {question.type === 'recall' && revealed ? (
          <div className={styles.answer}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('quiz.game.answer')}
            </Typography>
            <Typography variant="body1" className={styles.answerText}>
              {question.answer}
            </Typography>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function QuestionActions({
  question,
  selectedIndex,
  revealed,
  onSelect,
}: {
  question: Question
  selectedIndex: number | null
  revealed: boolean
  onSelect?: (optionIndex: number) => void
}) {
  const { t } = useTranslation()
  const correctIndex = getQuestionCorrectIndex(question)
  const options = questionOptions(question, t)

  return (
    <ul className={styles.options}>
      {options.map((option, optionIndex) => {
        if (!onSelect) {
          return (
            <li key={`${question.id}-${optionIndex}`} className={styles.option}>
              {option.label ? <span className={styles.optionLabel}>{option.label}</span> : null}
              <span>{option.text}</span>
            </li>
          )
        }

        const status = optionStatus(optionIndex, correctIndex, selectedIndex, revealed)

        return (
          <li key={`${question.id}-${optionIndex}`} className={styles.optionItem}>
            <button
              type="button"
              className={optionClassName(status)}
              disabled={revealed}
              aria-pressed={selectedIndex === optionIndex}
              onClick={() => onSelect(optionIndex)}
            >
              {option.label ? <span className={styles.optionLabel}>{option.label}</span> : null}
              <span>{option.text}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function questionOptions(
  question: Question,
  t: (key: string) => string,
): { label?: string; text: string }[] {
  if (question.type === 'boolean') {
    return [{ text: t('quiz.game.true') }, { text: t('quiz.game.false') }]
  }

  if (question.type === 'recall') {
    return [{ text: t('quiz.game.know') }, { text: t('quiz.game.dontKnow') }]
  }

  return question.options.map((text, optionIndex) => ({
    label: OPTION_LABELS[optionIndex],
    text,
  }))
}

function optionStatus(
  optionIndex: number,
  correctIndex: number,
  selectedIndex: number | null,
  revealed: boolean,
): 'default' | 'correct' | 'wrong' | 'dimmed' {
  if (!revealed || selectedIndex === null) {
    return 'default'
  }

  if (optionIndex === correctIndex) {
    return 'correct'
  }

  if (optionIndex === selectedIndex) {
    return 'wrong'
  }

  return 'dimmed'
}

function optionClassName(status: 'default' | 'correct' | 'wrong' | 'dimmed'): string {
  if (status === 'correct') {
    return `${styles.optionButton} ${styles.optionCorrect}`
  }

  if (status === 'wrong') {
    return `${styles.optionButton} ${styles.optionWrong}`
  }

  if (status === 'dimmed') {
    return `${styles.optionButton} ${styles.optionDimmed}`
  }

  return styles.optionButton
}
