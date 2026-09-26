import { useSyncExternalStore } from 'react'
import { ACTIVITY_CHANGED_EVENT, ACTIVITY_STORAGE_KEY } from './constants'
import { emptyActivity, readActivity } from './storage'
import type { ActivityState } from './types'

let cachedRaw: string | null | undefined
let snapshot: ActivityState = emptyActivity()
const serverSnapshot = emptyActivity()

function getSnapshot(): ActivityState {
  const raw = readStorage(ACTIVITY_STORAGE_KEY)
  if (cachedRaw !== undefined && raw === cachedRaw) {
    return snapshot
  }

  cachedRaw = raw
  snapshot = readActivity()
  return snapshot
}

function getServerSnapshot(): ActivityState {
  return serverSnapshot
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(ACTIVITY_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(ACTIVITY_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useActivity(): ActivityState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
