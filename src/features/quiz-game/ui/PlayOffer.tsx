import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { summarizePackActivity, useActivity } from '@entities/activity'
import { QUESTION_TYPES, type Question, type QuestionType } from '@entities/question'
import { MIN_ROUND_SIZE, type RoundSize } from '../model/constants'
import { countQuestionsByType } from '../model/filterQuestions'
import { countQuestionsByPoolMode, QUIZ_POOL_MODES, type QuizPoolMode } from '../model/pool-mode'
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
  typed: Question[]
  pool: Question[]
  poolMode: QuizPoolMode
  onPoolModeChange: (mode: QuizPoolMode) => void
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
  typed,
  pool,
  poolMode,
  onPoolModeChange,
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
  const activity = useActivity()
  const allTypesSelected = areAllQuestionTypesSelected(typeFilter)
  const typeCounts = countQuestionsByType(questions)
  const modeCounts = countQuestionsByPoolMode(typed, activity)
  const stats = summarizePackActivity(
    typed.map((question) => question.id),
    activity,
  )
  const canPlay = pool.length > 0
  const usingAll = roundSize === 'all' || resolvedRoundSize === pool.length
  const coverageLabel =
    stats.total === 0
      ? t('quiz.game.packSize', { count: 0 })
      : `${t('quiz.game.packSize', { count: stats.total })} ${t('quiz.game.packCoverage', { percent: stats.coveragePercent })}`
  const untouchedLabel =
    stats.untouched > 0
      ? t('quiz.game.packUntouched', { n: stats.untouched })
      : t('quiz.game.packAllTouched')
  const mistakesLabel =
    stats.everWrong > 0
      ? t('quiz.game.packEverWrong', { n: stats.everWrong })
      : t('quiz.game.packNoMistakes')
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
      <Box
        role="group"
        aria-label={t('quiz.game.poolMode')}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 1.5,
          rowGap: 2.5,
          px: 1,
        }}
      >
        {QUIZ_POOL_MODES.map((mode) => (
          <TypeToggle
            key={mode}
            value={mode}
            selected={poolMode === mode}
            count={modeCounts[mode]}
            onClick={() => onPoolModeChange(mode)}
          >
            {t(`quiz.game.modes.${mode}`)}
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
      <Stack spacing={0.75} sx={{ alignItems: 'center', width: 'min(100%, 22rem)', px: 2 }}>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          {coverageLabel}
        </Typography>
        {stats.total > 0 ? (
          <LinearProgress
            variant="determinate"
            value={stats.coveragePercent}
            aria-label={t('quiz.game.packCoverage', { percent: stats.coveragePercent })}
            sx={{ width: '100%', height: 8, borderRadius: 1 }}
          />
        ) : null}
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          {untouchedLabel} {mistakesLabel}
        </Typography>
      </Stack>
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
