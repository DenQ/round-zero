import type { Question, QuestionType } from '@entities/question'
import { areAllQuestionTypesSelected } from './toggleQuestionTypes'

export function filterQuestions(questions: readonly Question[], selectedTypes: readonly QuestionType[]): Question[] {
  if (selectedTypes.length === 0) {
    return []
  }

  if (areAllQuestionTypesSelected(selectedTypes)) {
    return questions as Question[]
  }

  const allowed = new Set(selectedTypes)
  return questions.filter((question) => allowed.has(question.type))
}
