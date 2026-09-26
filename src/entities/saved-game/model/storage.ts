import { getPackKey, parsePackKey } from '@entities/activity'
import type { ActivityPackRef } from '@entities/activity'
import { SAVED_GAMES_CHANGED_EVENT, SAVED_GAMES_STORAGE_KEY, SAVED_GAMES_VERSION } from './constants'
import type { SavedAnswer, SavedGame, SavedGamesState } from './types'

export function emptySavedGames(): SavedGamesState {
  return { v: SAVED_GAMES_VERSION, byPack: {} }
}

export function readSavedGames(): SavedGamesState {
  try {
    const stored = localStorage.getItem(SAVED_GAMES_STORAGE_KEY)
    if (!stored) {
      return emptySavedGames()
    }

    return parseSavedGames(JSON.parse(stored))
  } catch {
    return emptySavedGames()
  }
}

export function readSavedGame(pack: ActivityPackRef): SavedGame | null {
  return readSavedGames().byPack[getPackKey(pack)] ?? null
}

export function saveGame(pack: ActivityPackRef, game: SavedGame): void {
  const state = readSavedGames()
  writeSavedGames({
    v: SAVED_GAMES_VERSION,
    byPack: { ...state.byPack, [getPackKey(pack)]: game },
  })
}

export function removeSavedGame(pack: ActivityPackRef): void {
  const state = readSavedGames()
  const key = getPackKey(pack)
  if (!state.byPack[key]) {
    return
  }

  const byPack = { ...state.byPack }
  delete byPack[key]
  writeSavedGames({ v: SAVED_GAMES_VERSION, byPack })
}

function writeSavedGames(state: SavedGamesState): void {
  localStorage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(SAVED_GAMES_CHANGED_EVENT))
}

function parseSavedGames(value: unknown): SavedGamesState {
  if (!isRecord(value) || value.v !== SAVED_GAMES_VERSION || !isRecord(value.byPack)) {
    return emptySavedGames()
  }

  const byPack: SavedGamesState['byPack'] = {}

  for (const [key, game] of Object.entries(value.byPack)) {
    const pack = parsePackKey(key)
    const parsed = parseSavedGame(game)
    if (!pack || !parsed) {
      continue
    }

    byPack[getPackKey(pack)] = parsed
  }

  return { v: SAVED_GAMES_VERSION, byPack }
}

function parseSavedGame(value: unknown): SavedGame | null {
  if (!isRecord(value)) {
    return null
  }

  const questionIds = parseIdList(value.questionIds)
  const answers = parseAnswers(value.answers)
  if (!questionIds || questionIds.length === 0 || !answers) {
    return null
  }

  const { step, selectedIndex, updatedAt } = value
  if (typeof step !== 'number' || !Number.isInteger(step) || step < 0 || step >= questionIds.length) {
    return null
  }

  if (answers.length !== step) {
    return null
  }

  for (let index = 0; index < answers.length; index += 1) {
    if (answers[index]?.questionId !== questionIds[index]) {
      return null
    }
  }

  if (!isSelectedIndex(selectedIndex)) {
    return null
  }

  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) {
    return null
  }

  return { questionIds, step, selectedIndex, answers, updatedAt }
}

function parseAnswers(value: unknown): SavedAnswer[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const answers: SavedAnswer[] = []

  for (const item of value) {
    if (!isRecord(item) || !isQuestionId(item.questionId) || !isOptionIndex(item.selectedIndex)) {
      return null
    }

    answers.push({ questionId: item.questionId, selectedIndex: item.selectedIndex })
  }

  return answers
}

function parseIdList(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.some((id) => !isQuestionId(id))) {
    return null
  }

  return value
}

function isSelectedIndex(value: unknown): value is number | null {
  return value === null || isOptionIndex(value)
}

function isOptionIndex(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isQuestionId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
