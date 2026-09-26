import { getDayTotals, parsePackKey } from '@entities/activity'
import type { ActivityState, ISODate } from '@entities/activity'
import { RATING_VERSION } from './constants'
import { levelFromScore, levelValue } from './level'
import { playStreakBefore } from './streak'
import type { RatingSnapshot, RatingState } from './types'

export function buildRatingFromActivity(activity: ActivityState): RatingState {
  const dates = (Object.keys(activity.byDay) as ISODate[])
    .filter((date) => getDayTotals(activity.byDay[date]).total > 0)
    .sort()

  let score = 0
  const history: RatingSnapshot[] = []

  for (const date of dates) {
    const day = activity.byDay[date]
    const multiplier = playStreakBefore(date, activity.byDay)
    let delta = 0

    for (const [packKey, attempts] of Object.entries(day.packs)) {
      const pack = parsePackKey(packKey)
      if (!pack) {
        continue
      }

      delta += attempts.wins.length * levelValue(pack.level) * multiplier
    }

    score += delta
    history.push({
      at: endOfLocalDay(date),
      date,
      delta,
      score,
      level: levelFromScore(score).level,
    })
  }

  return { v: RATING_VERSION, score, history }
}

function endOfLocalDay(date: ISODate): number {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime()
}
