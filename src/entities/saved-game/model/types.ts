import type { PackKey } from '@entities/activity'

export type SavedAnswer = {
  questionId: number
  selectedIndex: number
}

export type SavedGame = {
  questionIds: number[]
  step: number
  selectedIndex: number | null
  answers: SavedAnswer[]
  updatedAt: number
}

export type SavedGamesState = {
  v: 1
  byPack: Partial<Record<PackKey, SavedGame>>
}
