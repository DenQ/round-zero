import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parsePackKey, readActivity, toLocalDateKey } from '@entities/activity'
import type { DayActivity, ISODate } from '@entities/activity'
import { packLabel } from '@shared/lib/packs'
import { buildHeatmapWeeks, dateFromKey, type HeatmapDay } from '../lib/build-weeks'
import {
  ACTIVITY_LEVELS,
  getActivityLevel,
  getActivityLevelColor,
  getActivityLevelRange,
  type ActivityLevelRange,
} from '../lib/intensity'

const CELL = 11
const GAP = 2
const WEEKDAY_COL = 22
const MONTH_ROW = 16
const RING = 2
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const WEEKDAY_LABELS = new Set(['mon', 'wed', 'fri'])

export function ActivityHeatmap() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const measureRef = useRef<HTMLDivElement>(null)
  const activity = useMemo(() => readActivity(), [])
  const weeks = useMemo(() => buildHeatmapWeeks(activity.byDay), [activity])
  const locale = i18n.resolvedLanguage ?? i18n.language
  const today = toLocalDateKey()
  const [selectedDate, setSelectedDate] = useState<ISODate | null>(today)
  const [cell, setCell] = useState(CELL)
  const total = weeks.flat().reduce((sum, day) => (day.inFuture ? sum : sum + day.total), 0)
  const selectedDay = weeks.flat().find((day) => day.date === selectedDate) ?? null

  useLayoutEffect(() => {
    const node = measureRef.current
    if (!node) {
      return
    }

    const update = () => {
      const width = node.clientWidth
      const size = (width - WEEKDAY_COL - GAP * weeks.length) / weeks.length
      if (size > 0) {
        setCell(size)
      }
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [weeks.length])

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
            {t('home.activity.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('home.activity.summary', { count: total })}
          </Typography>
        </Stack>

        <Box sx={{ p: `${RING}px`, minWidth: 0 }}>
          <Box ref={measureRef} sx={{ width: '100%', minWidth: 0 }}>
          <Box
            sx={{
              display: 'grid',
              width: '100%',
              minWidth: 0,
              gridTemplateColumns: `${WEEKDAY_COL}px repeat(${weeks.length}, ${cell}px)`,
              gridTemplateRows: `${MONTH_ROW}px repeat(7, ${cell}px)`,
              columnGap: `${GAP}px`,
              rowGap: `${GAP}px`,
            }}
          >
            <Box />
            {weeks.map((week, weekIndex) => (
              <Box key={`month-${week[0].date}`} sx={{ position: 'relative', overflow: 'visible' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    lineHeight: `${MONTH_ROW}px`,
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {weekMonthLabel(weeks, weekIndex, locale)}
                </Typography>
              </Box>
            ))}

            {WEEKDAYS.map((weekday, dayIndex) => (
              <Fragment key={weekday}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    height: cell,
                    lineHeight: `${cell}px`,
                    fontSize: 10,
                    overflow: 'hidden',
                  }}
                >
                  {WEEKDAY_LABELS.has(weekday) ? t(`home.activity.weekdays.${weekday}`) : ''}
                </Typography>
                {weeks.map((week) => (
                  <HeatmapCell
                    key={week[dayIndex].date}
                    day={week[dayIndex]}
                    size={cell}
                    locale={locale}
                    mode={theme.palette.mode}
                    selected={week[dayIndex].date === selectedDate}
                    onSelect={setSelectedDate}
                  />
                ))}
              </Fragment>
            ))}
          </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant="caption" color="text.secondary">
            {t('home.activity.less')}
          </Typography>
          {ACTIVITY_LEVELS.map((level) => {
            const label = legendLabel(getActivityLevelRange(level), t)

            return (
              <Tooltip key={level} title={label} arrow enterDelay={0} enterTouchDelay={0}>
                <Box
                  tabIndex={0}
                  aria-label={label}
                  sx={{
                    width: CELL,
                    height: CELL,
                    borderRadius: '2px',
                    bgcolor: getActivityLevelColor(level, theme.palette.mode),
                    boxShadow: cellShadow(theme.palette.mode),
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            )
          })}
          <Typography variant="caption" color="text.secondary">
            {t('home.activity.more')}
          </Typography>
        </Stack>

        <DayDetails
          day={selectedDay}
          packs={selectedDate ? activity.byDay[selectedDate] : undefined}
          locale={locale}
        />
      </Stack>
    </Paper>
  )
}

function HeatmapCell({
  day,
  size,
  locale,
  mode,
  selected,
  onSelect,
}: {
  day: HeatmapDay
  size: number
  locale: string
  mode: 'light' | 'dark'
  selected: boolean
  onSelect: (date: ISODate) => void
}) {
  const { t } = useTranslation()
  const level = getActivityLevel(day.inFuture ? 0 : day.total)
  const label = cellLabel(day, locale, t)

  if (day.inFuture) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '2px',
          bgcolor: 'transparent',
        }}
      />
    )
  }

  return (
    <Tooltip title={label} arrow>
      <Box
        component="button"
        type="button"
        aria-label={label}
        aria-pressed={selected}
        onClick={() => onSelect(day.date)}
        sx={{
          width: size,
          height: size,
          p: 0,
          border: 0,
          borderRadius: '2px',
          bgcolor: getActivityLevelColor(level, mode),
          boxShadow: selected
            ? `0 0 0 ${RING}px ${mode === 'dark' ? '#f0f6fc' : '#1f2328'}`
            : cellShadow(mode),
          cursor: 'pointer',
          display: 'block',
          zIndex: selected ? 1 : 0,
          '&:hover': {
            outline: '1px solid',
            outlineColor: 'text.secondary',
          },
        }}
      />
    </Tooltip>
  )
}

function DayDetails({
  day,
  packs,
  locale,
}: {
  day: HeatmapDay | null
  packs: DayActivity | undefined
  locale: string
}) {
  const { t } = useTranslation()

  if (!day) {
    return (
      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {t('home.activity.hint')}
        </Typography>
      </Box>
    )
  }

  const packLines = Object.entries(packs?.packs ?? {})
    .map(([key, attempts]) => {
      const pack = parsePackKey(key)
      if (!pack) {
        return null
      }

      return {
        key,
        label: packLabel(pack, t),
        wins: attempts.wins.length,
        loses: attempts.loses.length,
        count: attempts.wins.length + attempts.loses.length,
      }
    })
    .filter((line): line is { key: string; label: string; wins: number; loses: number; count: number } => line !== null)

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
      <Typography variant="subtitle2">{formatSelectedDate(day.date, locale)}</Typography>
      <Typography variant="body2" color="text.secondary">
        {day.total === 0
          ? t('home.activity.selectedEmpty')
          : t('home.activity.selectedSummary', {
              total: day.total,
              wins: day.wins,
              loses: day.loses,
            })}
      </Typography>
      {packLines.length > 0 ? (
        <Stack spacing={0.25} sx={{ mt: 0.75 }}>
          {packLines.map((line) => (
            <Typography key={line.key} variant="body2">
              {t('home.activity.packLine', {
                pack: line.label,
                count: line.count,
                wins: line.wins,
                loses: line.loses,
              })}
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Box>
  )
}

function weekMonthLabel(weeks: HeatmapDay[][], weekIndex: number, locale: string): string {
  const week = weeks[weekIndex]
  const firstOfMonth = week.find((day) => dateFromKey(day.date).getDate() === 1)
  if (firstOfMonth) {
    return formatMonth(firstOfMonth.date, locale)
  }

  if (weekIndex === 0) {
    const nextWeek = weeks[1]
    const nextHasFirst = nextWeek?.some((day) => dateFromKey(day.date).getDate() === 1)
    if (nextHasFirst) {
      return ''
    }

    return formatMonth(week[0].date, locale)
  }

  return ''
}

function formatMonth(key: ISODate, locale: string): string {
  return dateFromKey(key).toLocaleDateString(locale, { month: 'short' })
}

function formatSelectedDate(key: ISODate, locale: string): string {
  const date = dateFromKey(key)
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' })
  const rest = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${capitalizeFirst(weekday)}, ${rest}`
}

function capitalizeFirst(value: string): string {
  const first = value.charAt(0)
  return first ? first.toLocaleUpperCase() + value.slice(1) : value
}

function legendLabel(range: ActivityLevelRange, t: TFunction): string {
  if (range.kind === 'empty') {
    return t('home.activity.legendEmpty')
  }

  if (range.kind === 'min') {
    return t('home.activity.legendMax', { from: range.from })
  }

  return t('home.activity.legendRange', { from: range.from, to: range.to })
}

function cellLabel(day: HeatmapDay, locale: string, t: TFunction) {
  const date = dateFromKey(day.date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (day.total === 0) {
    return t('home.activity.tooltipEmpty', { date })
  }

  return t('home.activity.tooltip', {
    date,
    total: day.total,
    wins: day.wins,
    loses: day.loses,
  })
}

function cellShadow(mode: 'light' | 'dark'): string {
  return mode === 'dark' ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)' : 'inset 0 0 0 1px rgba(27, 31, 36, 0.06)'
}
