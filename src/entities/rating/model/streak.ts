import { addLocalDays, getDayTotals, toLocalDateKey } from '@entities/activity'
import type { ActivityState, ISODate } from '@entities/activity'

export function playStreakBefore(date: ISODate, byDay: ActivityState['byDay']): number {
  let cursor = addLocalDays(dateFromKey(date), -1)
  let streak = 0

  while (getDayTotals(byDay[toLocalDateKey(cursor)]).total > 0) {
    streak += 1
    cursor = addLocalDays(cursor, -1)
  }

  return Math.max(streak, 1)
}

function dateFromKey(key: ISODate): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
