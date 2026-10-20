import { isQuizPoolMode, type QuizPoolMode } from './pool-mode'

export const POOL_MODE_STORAGE_KEY = 'quiz.poolMode.v1'

const defaultMode: QuizPoolMode = 'all'

export function readPoolMode(): QuizPoolMode {
  try {
    const stored = localStorage.getItem(POOL_MODE_STORAGE_KEY)
    if (!stored) {
      return defaultMode
    }

    const parsed: unknown = JSON.parse(stored)
    return isQuizPoolMode(parsed) ? parsed : defaultMode
  } catch {
    return defaultMode
  }
}

export function writePoolMode(mode: QuizPoolMode): void {
  localStorage.setItem(POOL_MODE_STORAGE_KEY, JSON.stringify(mode))
}
