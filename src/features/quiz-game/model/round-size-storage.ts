import { DEFAULT_ROUND_SIZE, type RoundSize } from './constants'

export const ROUND_SIZE_STORAGE_KEY = 'quiz.roundSize.v1'

export function readRoundSize(): RoundSize {
  try {
    const stored = localStorage.getItem(ROUND_SIZE_STORAGE_KEY)
    if (stored === 'all') {
      return 'all'
    }

    if (stored === null) {
      return DEFAULT_ROUND_SIZE
    }

    const parsed = Number(stored)
    if (!Number.isInteger(parsed) || parsed < 1) {
      return DEFAULT_ROUND_SIZE
    }

    return parsed
  } catch {
    return DEFAULT_ROUND_SIZE
  }
}

export function writeRoundSize(size: RoundSize): void {
  localStorage.setItem(ROUND_SIZE_STORAGE_KEY, String(size))
}
