import { useSyncExternalStore } from 'react'
import { CROOKED_QUESTIONS_CHANGED_EVENT, CROOKED_QUESTIONS_STORAGE_KEY } from './constants'
import { emptyCrookedQuestions, readCrookedQuestions } from './storage'
import type { CrookedQuestionsState } from './types'

let cachedRaw: string | null | undefined
let snapshot: CrookedQuestionsState = emptyCrookedQuestions()
const serverSnapshot = emptyCrookedQuestions()

function getSnapshot(): CrookedQuestionsState {
  const raw = readStorage(CROOKED_QUESTIONS_STORAGE_KEY)
  if (cachedRaw !== undefined && raw === cachedRaw) {
    return snapshot
  }

  cachedRaw = raw
  snapshot = readCrookedQuestions()
  return snapshot
}

function getServerSnapshot(): CrookedQuestionsState {
  return serverSnapshot
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CROOKED_QUESTIONS_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CROOKED_QUESTIONS_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useCrookedQuestions(): CrookedQuestionsState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
