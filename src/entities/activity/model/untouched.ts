import { readActivity } from './storage'
import type { ActivityState } from './types'

export function isQuestionTouched(state: ActivityState, questionId: number): boolean {
  const question = state.byQuestion[questionId]
  return Boolean(question && (question.wins.length > 0 || question.loses.length > 0))
}

export function countUntouchedQuestions(
  questionIds: readonly number[],
  state: ActivityState = readActivity(),
): number {
  return questionIds.reduce((count, id) => count + (isQuestionTouched(state, id) ? 0 : 1), 0)
}
