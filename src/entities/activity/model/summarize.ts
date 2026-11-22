import { readActivity } from './storage'
import type { ActivityState } from './types'
import { hasQuestionEverLost, isQuestionTouched } from './untouched'

export type PackActivitySummary = {
  total: number
  touched: number
  untouched: number
  everWrong: number
  coveragePercent: number
}

export function summarizePackActivity(
  questionIds: readonly number[],
  state: ActivityState = readActivity(),
): PackActivitySummary {
  let touched = 0
  let everWrong = 0

  for (const id of questionIds) {
    if (isQuestionTouched(state, id)) {
      touched += 1
    }
    if (hasQuestionEverLost(state, id)) {
      everWrong += 1
    }
  }

  const total = questionIds.length

  return {
    total,
    touched,
    untouched: total - touched,
    everWrong,
    coveragePercent: total === 0 ? 0 : Math.round((touched / total) * 100),
  }
}
