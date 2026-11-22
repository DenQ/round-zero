import { isPackLevel, isPackStack, isPackTopic } from '@shared/config/packs'
import { QUESTION_TYPES, type QuestionType } from '@entities/question'
import {
  CROOKED_QUESTIONS_CHANGED_EVENT,
  CROOKED_QUESTIONS_STORAGE_KEY,
  CROOKED_QUESTIONS_VERSION,
} from './constants'
import type { CrookedQuestion, CrookedQuestionsState } from './types'

export function emptyCrookedQuestions(): CrookedQuestionsState {
  return { v: CROOKED_QUESTIONS_VERSION, items: [] }
}

export function readCrookedQuestions(): CrookedQuestionsState {
  try {
    const stored = localStorage.getItem(CROOKED_QUESTIONS_STORAGE_KEY)
    if (!stored) {
      return emptyCrookedQuestions()
    }

    return parseCrookedQuestions(JSON.parse(stored))
  } catch {
    return emptyCrookedQuestions()
  }
}

export function isCrookedQuestion(id: number): boolean {
  return readCrookedQuestions().items.some((item) => item.id === id)
}

export function flagCrookedQuestion(item: Omit<CrookedQuestion, 'flaggedAt'>): void {
  const state = readCrookedQuestions()
  if (state.items.some((existing) => existing.id === item.id)) {
    return
  }

  writeCrookedQuestions({
    v: CROOKED_QUESTIONS_VERSION,
    items: [...state.items, { ...item, flaggedAt: Date.now() }],
  })
}

export function unflagCrookedQuestion(id: number): void {
  const state = readCrookedQuestions()
  const items = state.items.filter((item) => item.id !== id)
  if (items.length === state.items.length) {
    return
  }

  writeCrookedQuestions({ v: CROOKED_QUESTIONS_VERSION, items })
}

export function toggleCrookedQuestion(item: Omit<CrookedQuestion, 'flaggedAt'>): void {
  if (isCrookedQuestion(item.id)) {
    unflagCrookedQuestion(item.id)
    return
  }

  flagCrookedQuestion(item)
}

function writeCrookedQuestions(state: CrookedQuestionsState): void {
  localStorage.setItem(CROOKED_QUESTIONS_STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(CROOKED_QUESTIONS_CHANGED_EVENT))
}

function parseCrookedQuestions(value: unknown): CrookedQuestionsState {
  if (!isRecord(value) || value.v !== CROOKED_QUESTIONS_VERSION || !Array.isArray(value.items)) {
    return emptyCrookedQuestions()
  }

  const seen = new Set<number>()
  const items: CrookedQuestion[] = []

  for (const item of value.items) {
    const parsed = parseItem(item)
    if (!parsed || seen.has(parsed.id)) {
      continue
    }

    seen.add(parsed.id)
    items.push(parsed)
  }

  return { v: CROOKED_QUESTIONS_VERSION, items }
}

function parseItem(value: unknown): CrookedQuestion | null {
  if (!isRecord(value) || !isQuestionId(value.id) || !isQuestionType(value.type)) {
    return null
  }

  if (!isRecord(value.pack) || typeof value.flaggedAt !== 'number' || !Number.isFinite(value.flaggedAt)) {
    return null
  }

  const { stack, topic, level } = value.pack
  if (typeof stack !== 'string' || typeof topic !== 'string' || typeof level !== 'string') {
    return null
  }

  if (!isPackStack(stack) || !isPackTopic(topic) || !isPackLevel(level)) {
    return null
  }

  return {
    id: value.id,
    type: value.type,
    pack: { stack, topic, level },
    flaggedAt: value.flaggedAt,
  }
}

function isQuestionId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

function isQuestionType(value: unknown): value is QuestionType {
  return typeof value === 'string' && (QUESTION_TYPES as readonly string[]).includes(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
