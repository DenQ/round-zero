import type { ISODate } from '@entities/activity'

export type RatingSnapshot = {
  at: number
  date: ISODate
  delta: number
  score: number
  level: number
}

export type RatingState = {
  v: 1
  score: number
  history: RatingSnapshot[]
}

export type RatingLevel = {
  level: number
  intoLevel: number
  needForNext: number
}
