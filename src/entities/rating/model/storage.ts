import { readActivity } from '@entities/activity'
import type { ISODate } from '@entities/activity'
import { buildRatingFromActivity } from './backfill'
import { RATING_CHANGED_EVENT, RATING_STORAGE_KEY, RATING_VERSION } from './constants'
import type { RatingSnapshot, RatingState } from './types'

export function emptyRating(): RatingState {
  return { v: RATING_VERSION, score: 0, history: [] }
}

export function readRating(): RatingState {
  try {
    const stored = localStorage.getItem(RATING_STORAGE_KEY)
    if (!stored) {
      return emptyRating()
    }

    return parseRating(JSON.parse(stored))
  } catch {
    return emptyRating()
  }
}

export function writeRating(state: RatingState): void {
  localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(RATING_CHANGED_EVENT))
}

export function clearRating(): void {
  localStorage.removeItem(RATING_STORAGE_KEY)
  window.dispatchEvent(new Event(RATING_CHANGED_EVENT))
}

export function ensureRatingBackfill(activity = readActivity()): RatingState {
  if (hasRatingKey()) {
    return readRating()
  }

  const built = buildRatingFromActivity(activity)
  if (built.history.length === 0) {
    return emptyRating()
  }

  writeRating(built)
  return built
}

function parseRating(value: unknown): RatingState {
  if (!isRecord(value) || value.v !== RATING_VERSION || !isScore(value.score) || !Array.isArray(value.history)) {
    return emptyRating()
  }

  const history: RatingSnapshot[] = []
  for (const item of value.history) {
    const snapshot = parseSnapshot(item)
    if (!snapshot) {
      return emptyRating()
    }

    history.push(snapshot)
  }

  return { v: RATING_VERSION, score: value.score, history }
}

function parseSnapshot(value: unknown): RatingSnapshot | null {
  if (!isRecord(value) || !isScore(value.at) || !isScore(value.delta) || !isScore(value.score)) {
    return null
  }

  if (!isISODate(value.date) || typeof value.level !== 'number' || !Number.isInteger(value.level) || value.level < 0) {
    return null
  }

  return {
    at: value.at,
    date: value.date,
    delta: value.delta,
    score: value.score,
    level: value.level,
  }
}

function hasRatingKey(): boolean {
  try {
    return localStorage.getItem(RATING_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isISODate(value: unknown): value is ISODate {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
