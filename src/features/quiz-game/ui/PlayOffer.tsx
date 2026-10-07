import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { countUntouchedQuestions } from '@entities/activity'
import { QUESTION_TYPES, type Question, type QuestionType } from '@entities/question'
import { MIN_ROUND_SIZE, type RoundSize } from '../model/constants'
import { countQuestionsByType } from '../model/filterQuestions'
import { areAllQuestionTypesSelected } from '../model/toggleQuestionTypes'
import { SavedGameActions } from './SavedGameActions'

const typeToggleSx = {
  overflow: 'visible',
  px: 1.5,
} as const

const typeBadgeSx = {
  '& .MuiBadge-badge': {
    pointerEvents: 'none',
  },
} as const

type PlayOfferProps = {
  questions: Question[]
  pool: Question[]
  roundSize: RoundSize
  resolvedRoundSize: number
  onRoundSizeChange: (size: RoundSize) => void
  typeFilter: readonly QuestionType[]
  onToggleTypeFilter: (clicked: QuestionType | 'all') => void
  onPlay: () => void
  unfinished: { step: number; total: number } | null
  onResume: () => void
  onDiscard: () => void
}

export function PlayOffer({
  questions,
  pool,
  roundSize,
  resolvedRoundSize,
  onRoundSizeChange,
  typeFilter,
  onToggleTypeFilter,
  onPlay,
  unfinished,
  onResume,
  onDiscard,
}: PlayOfferProps) {
  const { t } = useTranslation()
  const allTypesSelected = areAllQuestionTypesSelected(typeFilter)
  const typeCounts = countQuestionsByType(questions)
  const canPlay = pool.length > 0
  const usingAll = roundSize === 'all' || resolvedRoundSize === pool.length
  const untouched = countUntouchedQuestions(pool.map((question) => question.id))
  const packStats =
    untouched > 0
      ? `${t('quiz.game.packSize', { count: pool.length })} ${t('quiz.game.packUntouched', { n: untouched })}`
      : `${t('quiz.game.packSize', { count: pool.length })} ${t('quiz.game.packAllTouched')}`
  const subtitle = usingAll
    ? t('quiz.game.subtitleAll')
    : t('quiz.game.subtitle', { count: resolvedRoundSize })

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
      <Box
        role="group"
        aria-label={t('quiz.game.typeFilter')}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 1.5,
          rowGap: 2.5,
          pt: 1,
          px: 1,
        }}
      >
        <TypeToggle
          value="all"
          selected={allTypesSelected}
          count={questions.length}
          onClick={() => onToggleTypeFilter('all')}
        >
          {t('quiz.game.types.all')}
        </TypeToggle>
        {QUESTION_TYPES.map((type) => (
          <TypeToggle
            key={type}
            value={type}
            selected={typeFilter.includes(type)}
            count={typeCounts[type]}
            onClick={() => onToggleTypeFilter(type)}
          >
            {t(`quiz.game.types.${type}`)}
          </TypeToggle>
        ))}
      </Box>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
      >
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
        {unfinished ? (
          <SavedGameActions
            step={unfinished.step}
            total={unfinished.total}
            onContinue={onResume}
            onDiscard={onDiscard}
          />
        ) : null}
      </Stack>
      <Typography variant="h6" component="p">
        {t('quiz.game.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        {packStats}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {subtitle}
      </Typography>
      {pool.length > 0 ? (
        <Slider
          size="small"
          min={Math.min(MIN_ROUND_SIZE, pool.length)}
          max={pool.length}
          step={1}
          value={resolvedRoundSize}
          valueLabelDisplay="auto"
          marks={roundSizeMarks(pool.length, t('quiz.game.all'))}
          aria-label={t('quiz.game.roundSize')}
          onChange={(_event, value) => {
            if (typeof value !== 'number') {
              return
            }

            onRoundSizeChange(value === pool.length ? 'all' : value)
          }}
          sx={{ width: 'min(100%, 22rem)', mx: 2 }}
        />
      ) : null}
    </Stack>
  )
}

function roundSizeMarks(max: number, allLabel: string): { value: number; label: string }[] {
  if (max <= 1) {
    return [{ value: max, label: allLabel }]
  }

  return [
    { value: 1, label: '1' },
    { value: max, label: allLabel },
  ]
}

function TypeToggle({
  value,
  selected,
  count,
  onClick,
  children,
}: {
  value: string
  selected: boolean
  count: number
  onClick: () => void
  children: string
}) {
  return (
    <Badge badgeContent={count} color="primary" showZero max={999} overlap="rectangular" sx={typeBadgeSx}>
      <ToggleButton
        value={value}
        selected={selected}
        size="small"
        onClick={onClick}
        aria-label={`${children} ${count}`}
        sx={typeToggleSx}
      >
        {children}
      </ToggleButton>
    </Badge>
  )
}
