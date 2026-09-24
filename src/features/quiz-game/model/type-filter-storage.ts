import { QUESTION_TYPES, type QuestionType } from '@entities/question'

export const TYPE_FILTER_STORAGE_KEY = 'quiz.typeFilter.v1'

export function readTypeFilter(): QuestionType[] {
  try {
    const stored = localStorage.getItem(TYPE_FILTER_STORAGE_KEY)
    if (!stored) {
      return [...QUESTION_TYPES]
    }

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return [...QUESTION_TYPES]
    }

    if (parsed.length === 0) {
      return []
    }

    const types = QUESTION_TYPES.filter((type) => parsed.includes(type))
    return types.length > 0 ? types : [...QUESTION_TYPES]
  } catch {
    return [...QUESTION_TYPES]
  }
}

export function writeTypeFilter(types: readonly QuestionType[]): void {
  localStorage.setItem(TYPE_FILTER_STORAGE_KEY, JSON.stringify(types))
}
