import type { ActivityPackRef } from '@entities/activity'
import type { QuestionType } from '@entities/question'

export type CrookedQuestion = {
  id: number
  type: QuestionType
  pack: ActivityPackRef
  flaggedAt: number
}

export type CrookedQuestionsState = {
  v: 1
  items: CrookedQuestion[]
}
