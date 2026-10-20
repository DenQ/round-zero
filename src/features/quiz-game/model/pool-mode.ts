import {
  hasQuestionEverLost,
  isQuestionTouched,
  type ActivityState,
} from '@entities/activity'
import type { Question } from '@entities/question'

export type QuizPoolMode = 'all' | 'untouched' | 'everWrong'

export const QUIZ_POOL_MODES: readonly QuizPoolMode[] = ['all', 'untouched', 'everWrong']

type QuestionHistoryPredicate = (state: ActivityState, questionId: number) => boolean

const POOL_MODE_PREDICATES: Record<QuizPoolMode, QuestionHistoryPredicate | null> = {
  all: null,
  untouched: (state, questionId) => !isQuestionTouched(state, questionId),
  everWrong: hasQuestionEverLost,
}

export function isQuizPoolMode(value: unknown): value is QuizPoolMode {
  return typeof value === 'string' && QUIZ_POOL_MODES.includes(value as QuizPoolMode)
}

export function filterByPoolMode(
  questions: readonly Question[],
  mode: QuizPoolMode,
  state: ActivityState,
): Question[] {
  const predicate = POOL_MODE_PREDICATES[mode]
  if (!predicate) {
    return questions as Question[]
  }

  return questions.filter((question) => predicate(state, question.id))
}

export function countQuestionsByPoolMode(
  questions: readonly Question[],
  state: ActivityState,
): Record<QuizPoolMode, number> {
  return {
    all: questions.length,
    untouched: filterByPoolMode(questions, 'untouched', state).length,
    everWrong: filterByPoolMode(questions, 'everWrong', state).length,
  }
}
