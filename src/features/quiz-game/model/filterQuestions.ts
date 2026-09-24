import { QUESTION_TYPES, type Question, type QuestionType } from '@entities/question'
import { areAllQuestionTypesSelected } from './toggleQuestionTypes'

export function countQuestionsByType(questions: readonly Question[]): Record<QuestionType, number> {
  const counts = Object.fromEntries(QUESTION_TYPES.map((type) => [type, 0])) as Record<QuestionType, number>

  for (const question of questions) {
    counts[question.type] += 1
  }

  return counts
}

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
