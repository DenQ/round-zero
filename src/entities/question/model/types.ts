import type { PackRef } from '@shared/config/packs'

export const QUESTION_TYPES = ['code', 'text', 'boolean', 'recall'] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

type QuestionBase = {
  id: number
  text: string
}

export type CodeQuestion = QuestionBase & {
  type: 'code'
  language?: string
  options: string[]
  correctIndex: number
}

export type TextQuestion = QuestionBase & {
  type: 'text'
  options: string[]
  correctIndex: number
}

export type ChoiceQuestion = CodeQuestion | TextQuestion

export type BooleanQuestion = QuestionBase & {
  type: 'boolean'
  correct: boolean
}

export type RecallQuestion = QuestionBase & {
  type: 'recall'
  answer: string
}

export type Question = ChoiceQuestion | BooleanQuestion | RecallQuestion

export type QuestionPack = PackRef & {
  questions: Question[]
}
