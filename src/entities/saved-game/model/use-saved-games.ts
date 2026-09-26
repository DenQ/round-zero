import { useSyncExternalStore } from 'react'
import { SAVED_GAMES_CHANGED_EVENT, SAVED_GAMES_STORAGE_KEY } from './constants'
import { emptySavedGames, readSavedGames } from './storage'
import type { SavedGamesState } from './types'

let cachedRaw: string | null | undefined
let snapshot: SavedGamesState = emptySavedGames()
const serverSnapshot = emptySavedGames()

function getSnapshot(): SavedGamesState {
  const raw = readStorage(SAVED_GAMES_STORAGE_KEY)
  if (cachedRaw !== undefined && raw === cachedRaw) {
    return snapshot
  }

  cachedRaw = raw
  snapshot = readSavedGames()
  return snapshot
}

function getServerSnapshot(): SavedGamesState {
  return serverSnapshot
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(SAVED_GAMES_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(SAVED_GAMES_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useSavedGames(): SavedGamesState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
