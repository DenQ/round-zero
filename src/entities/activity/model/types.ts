import type { PackLevel, PackStack } from '@shared/config/packs'

export type ISODate = `${number}-${number}-${number}`

export type ActivityPackRef = {
  stack: PackStack
  topic: string
  level: PackLevel
}

export type PackKey = `${PackStack}/${string}/${PackLevel}`

export type PackAttempts = {
  wins: number[]
  loses: number[]
}

export type DayActivity = {
  packs: Record<PackKey, PackAttempts>
}

export type QuestionActivity = {
  wins: ISODate[]
  loses: ISODate[]
  meta: ActivityPackRef
}

export type ActivityState = {
  v: 1
  byDay: Record<ISODate, DayActivity>
  byQuestion: Record<number, QuestionActivity>
}

export type DayTotals = {
  wins: number
  loses: number
  total: number
}

export type RecordAnswerInput = {
  questionId: number
  correct: boolean
  pack: ActivityPackRef
  at?: Date
}
