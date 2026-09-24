import type { PackRef } from '@shared/config/packs'

export type QuestionType = 'text' | 'code' | (string & {})

export type Question = {
  id: number
  type: QuestionType
  language?: string
  text: string
  options: string[]
  correctIndex: number
}

export type QuestionPack = PackRef & {
  questions: Question[]
}
