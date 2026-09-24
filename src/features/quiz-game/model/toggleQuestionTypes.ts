import { QUESTION_TYPES, type QuestionType } from '@entities/question'

export function areAllQuestionTypesSelected(selected: readonly QuestionType[]): boolean {
  return QUESTION_TYPES.every((type) => selected.includes(type))
}

export function toggleQuestionTypes(
  selected: readonly QuestionType[],
  clicked: QuestionType | 'all',
): QuestionType[] {
  if (clicked === 'all') {
    return areAllQuestionTypesSelected(selected) ? [] : [...QUESTION_TYPES]
  }

  if (selected.includes(clicked)) {
    return selected.filter((type) => type !== clicked)
  }

  return [...selected, clicked]
}
