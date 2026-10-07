import { readActivity, toLocalDateKey } from '@entities/activity'
import type { PackLevel } from '@shared/config/packs'
import { RATING_VERSION } from './constants'
import { levelFromScore, levelValue } from './level'
import { readRating, writeRating } from './storage'
import { playStreakBefore } from './streak'
import type { RatingState } from './types'

export type RecordRatingInput = {
  correct: boolean
  level: PackLevel
  at?: Date
}

export function recordRating({ correct, level, at = new Date() }: RecordRatingInput): RatingState {
  const activity = readActivity()
  const current = readRating()
  const date = toLocalDateKey(at)
  const multiplier = playStreakBefore(date, activity.byDay)
  const delta = correct ? levelValue(level) * multiplier : 0
  const score = current.score + delta
  const next: RatingState = {
    v: RATING_VERSION,
    score,
    history: [
      ...current.history,
      {
        at: at.getTime(),
        date,
        delta,
        score,
        level: levelFromScore(score).level,
      },
    ],
  }

  writeRating(next)
  return next
}
