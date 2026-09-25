import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { countUntouchedQuestions } from '@entities/activity'
import { QUESTION_TYPES, type Question, type QuestionType } from '@entities/question'
import type { RoundSize } from '../model/constants'
import { areAllQuestionTypesSelected } from '../model/toggleQuestionTypes'

const toggleGroupSx = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 1,
  '& .MuiToggleButtonGroup-grouped': {
    m: 0,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  },
  '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
    borderLeft: '1px solid',
    borderLeftColor: 'divider',
    marginLeft: 0,
  },
} as const

type PlayOfferProps = {
  questions: Question[]
  roundSize: RoundSize
  sizeOptions: readonly number[]
  onRoundSizeChange: (size: RoundSize) => void
  typeFilter: readonly QuestionType[]
  onToggleTypeFilter: (clicked: QuestionType | 'all') => void
  onPlay: () => void
}

export function PlayOffer({
  questions,
  roundSize,
  sizeOptions,
  onRoundSizeChange,
  typeFilter,
  onToggleTypeFilter,
  onPlay,
}: PlayOfferProps) {
  const { t } = useTranslation()
  const allTypesSelected = areAllQuestionTypesSelected(typeFilter)
  const canPlay = questions.length > 0
  const untouched = countUntouchedQuestions(questions.map((question) => question.id))
  const packStats =
    untouched > 0
      ? `${t('quiz.game.packSize', { count: questions.length })} ${t('quiz.game.packUntouched', { n: untouched })}`
      : `${t('quiz.game.packSize', { count: questions.length })} ${t('quiz.game.packAllTouched')}`
  const subtitle =
    roundSize === 'all'
      ? t('quiz.game.subtitleAll')
      : t('quiz.game.subtitle', { count: roundSize })

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
      <ToggleButtonGroup size="small" aria-label={t('quiz.game.typeFilter')} sx={toggleGroupSx}>
        <ToggleButton
          value="all"
          selected={allTypesSelected}
          onClick={() => onToggleTypeFilter('all')}
        >
          {t('quiz.game.types.all')}
        </ToggleButton>
        {QUESTION_TYPES.map((type) => (
          <ToggleButton
            key={type}
            value={type}
            selected={typeFilter.includes(type)}
            onClick={() => onToggleTypeFilter(type)}
          >
            {t(`quiz.game.types.${type}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <IconButton
        onClick={onPlay}
        disabled={!canPlay}
        aria-label={t('quiz.game.play')}
        sx={{
          width: 112,
          height: 112,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <PlayArrowIcon sx={{ fontSize: 64 }} />
      </IconButton>
      <Typography variant="h6" component="p">
        {t('quiz.game.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        {packStats}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {subtitle}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={roundSize}
        aria-label={t('quiz.game.roundSize')}
        onChange={(_event, value: RoundSize | null) => {
          if (value !== null) {
            onRoundSizeChange(value)
          }
        }}
        sx={toggleGroupSx}
      >
        {sizeOptions.map((size) => (
          <ToggleButton key={size} value={size} sx={{ minWidth: 40 }}>
            {size}
          </ToggleButton>
        ))}
        <ToggleButton value="all">{t('quiz.game.all')}</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
