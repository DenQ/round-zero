import { useSyncExternalStore } from 'react'
import { RATING_CHANGED_EVENT, RATING_STORAGE_KEY } from './constants'
import { emptyRating, ensureRatingBackfill, readRating } from './storage'
import type { RatingState } from './types'

ensureRatingBackfill()

let cachedRaw: string | null | undefined
let snapshot: RatingState = emptyRating()
const serverSnapshot = emptyRating()

function getSnapshot(): RatingState {
  const raw = readStorage(RATING_STORAGE_KEY)
  if (cachedRaw !== undefined && raw === cachedRaw) {
    return snapshot
  }

  cachedRaw = raw
  snapshot = readRating()
  return snapshot
}

function getServerSnapshot(): RatingState {
  return serverSnapshot
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(RATING_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(RATING_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useRating(): RatingState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
