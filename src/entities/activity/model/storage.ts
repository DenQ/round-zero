import { isPackLevel, isPackStack, isPackTopic } from '@shared/config/packs'
import { ACTIVITY_STORAGE_KEY, ACTIVITY_VERSION } from './constants'
import { isISODate } from './date'
import type { ActivityState, DayActivity, ISODate, PackAttempts, PackKey, QuestionActivity } from './types'

export function emptyActivity(): ActivityState {
  return { v: ACTIVITY_VERSION, byDay: {}, byQuestion: {} }
}

export function readActivity(): ActivityState {
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!stored) {
      return emptyActivity()
    }

    return parseActivity(JSON.parse(stored))
  } catch {
    return emptyActivity()
  }
}

export function writeActivity(state: ActivityState): void {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(state))
}

function parseActivity(value: unknown): ActivityState {
  if (!isRecord(value) || value.v !== ACTIVITY_VERSION) {
    return emptyActivity()
  }

  const byDay = parseByDay(value.byDay)
  const byQuestion = parseByQuestion(value.byQuestion)
  if (!byDay || !byQuestion) {
    return emptyActivity()
  }

  return { v: ACTIVITY_VERSION, byDay, byQuestion }
}

function parseByDay(value: unknown): ActivityState['byDay'] | null {
  if (!isRecord(value)) {
    return null
  }

  const byDay: ActivityState['byDay'] = {}

  for (const [key, day] of Object.entries(value)) {
    if (!isISODate(key)) {
      return null
    }

    const parsed = parseDay(day)
    if (!parsed) {
      return null
    }

    byDay[key] = parsed
  }

  return byDay
}

function parseDay(value: unknown): DayActivity | null {
  if (!isRecord(value) || !isRecord(value.packs)) {
    return null
  }

  const packs: DayActivity['packs'] = {}

  for (const [key, attempts] of Object.entries(value.packs)) {
    const parsed = parseAttempts(attempts)
    if (!parsed || !isPackKey(key)) {
      return null
    }

    packs[key] = parsed
  }

  return { packs }
}

function parseByQuestion(value: unknown): ActivityState['byQuestion'] | null {
  if (!isRecord(value)) {
    return null
  }

  const byQuestion: ActivityState['byQuestion'] = {}

  for (const [key, question] of Object.entries(value)) {
    const id = Number(key)
    if (!Number.isInteger(id) || id < 1) {
      return null
    }

    const parsed = parseQuestion(question)
    if (!parsed) {
      return null
    }

    byQuestion[id] = parsed
  }

  return byQuestion
}

function parseQuestion(value: unknown): QuestionActivity | null {
  if (!isRecord(value) || !isRecord(value.meta)) {
    return null
  }

  const { stack, topic, level } = value.meta
  if (typeof stack !== 'string' || !isPackStack(stack)) {
    return null
  }
  if (typeof topic !== 'string' || !isPackTopic(topic)) {
    return null
  }
  if (typeof level !== 'string' || !isPackLevel(level)) {
    return null
  }

  const wins = parseDateList(value.wins)
  const loses = parseDateList(value.loses)
  if (!wins || !loses) {
    return null
  }

  return { wins, loses, meta: { stack, topic, level } }
}

function parseAttempts(value: unknown): PackAttempts | null {
  if (!isRecord(value)) {
    return null
  }

  const wins = parseIdList(value.wins)
  const loses = parseIdList(value.loses)
  if (!wins || !loses) {
    return null
  }

  return { wins, loses }
}

function parseIdList(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.some((id) => typeof id !== 'number' || !Number.isInteger(id) || id < 1)) {
    return null
  }

  return value
}

function parseDateList(value: unknown): ISODate[] | null {
  if (!Array.isArray(value) || !value.every(isISODate)) {
    return null
  }

  return value
}

function isPackKey(value: string): value is PackKey {
  const parts = value.split('/')
  if (parts.length !== 3) {
    return false
  }

  const [stack, topic, level] = parts
  return Boolean(isPackStack(stack) && isPackTopic(topic) && isPackLevel(level))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
