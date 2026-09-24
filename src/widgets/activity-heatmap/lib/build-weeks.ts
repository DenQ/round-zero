import { addLocalDays, getDayTotals, startOfLocalDay, toLocalDateKey } from '@entities/activity'
import type { ActivityState, DayTotals, ISODate } from '@entities/activity'

export const WEEK_COUNT = 53

export type HeatmapDay = DayTotals & {
  date: ISODate
  inFuture: boolean
}

export function buildHeatmapWeeks(byDay: ActivityState['byDay'], today = new Date()): HeatmapDay[][] {
  const startToday = startOfLocalDay(today)
  const mondayOffset = (startToday.getDay() + 6) % 7
  const thisMonday = addLocalDays(startToday, -mondayOffset)
  const firstMonday = addLocalDays(thisMonday, -(WEEK_COUNT - 1) * 7)

  return Array.from({ length: WEEK_COUNT }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addLocalDays(firstMonday, week * 7 + day)
      const key = toLocalDateKey(date)
      return {
        date: key,
        inFuture: date.getTime() > startToday.getTime(),
        ...getDayTotals(byDay[key]),
      }
    }),
  )
}

export function dateFromKey(key: ISODate): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
