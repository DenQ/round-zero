import type { Question } from './types'

export const BOOLEAN_TRUE_INDEX = 0
export const BOOLEAN_FALSE_INDEX = 1
export const RECALL_KNOW_INDEX = 0
export const RECALL_DONT_KNOW_INDEX = 1

export function getQuestionCorrectIndex(question: Question): number {
  switch (question.type) {
    case 'code':
    case 'text':
      return question.correctIndex
    case 'boolean':
      return question.correct ? BOOLEAN_TRUE_INDEX : BOOLEAN_FALSE_INDEX
    case 'recall':
      return RECALL_KNOW_INDEX
  }
}

export function isQuestionCorrect(question: Question, selectedIndex: number): boolean {
  return selectedIndex === getQuestionCorrectIndex(question)
}
