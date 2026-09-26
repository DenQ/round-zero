import type { PackLevel } from '@shared/config/packs'
import { FIRST_LEVEL_SPAN } from './constants'
import type { RatingLevel } from './types'

const LEVEL_VALUE: Record<PackLevel, number> = {
  junior: 1,
  middle: 2,
  senior: 3,
}

export function levelValue(level: PackLevel): number {
  return LEVEL_VALUE[level]
}

export function levelFromScore(score: number): RatingLevel {
  let level = 0
  let floor = 0
  let span = FIRST_LEVEL_SPAN

  while (score >= floor + span) {
    floor += span
    span *= 2
    level += 1
  }

  return {
    level,
    intoLevel: score - floor,
    needForNext: span,
  }
}
