import { ACTIVITY_CHANGED_EVENT, ACTIVITY_STORAGE_KEY } from './constants'
import { isISODate } from './date'
import { getPackKey, parsePackKey } from './pack-key'
import type { DayTotals, ISODate, PackAttempts, PackKey } from './types'

export type RebuildActivityDaysResult = {
  written: boolean
  reason?: string
  daysBefore: ISODate[]
  daysAfter: ISODate[]
  addedDays: ISODate[]
  totalsAfter: Record<ISODate, DayTotals>
}

export function rebuildActivityByDay(): RebuildActivityDaysResult {
  const stored = readStoredActivity()
  if (!stored.ok) {
    return emptyResult(stored.reason)
  }

  const byQuestion = JSON.stringify(stored.raw.byQuestion)
  const daysBefore = sortedDayKeys(stored.raw.byDay)
  const byDay = addQuestionHistory(stored.raw.byDay, stored.raw.byQuestion)
  const daysAfter = sortedDayKeys(byDay)
  const addedDays = daysAfter.filter((date) => stored.raw.byDay[date] === undefined)
  const totalsAfter = totalsByDay(byDay)

  if (JSON.stringify(byDay) === JSON.stringify(stored.raw.byDay)) {
    return { written: false, reason: 'already in sync', daysBefore, daysAfter, addedDays, totalsAfter }
  }

  stored.raw.byDay = byDay
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(stored.raw))
  if (JSON.stringify(stored.raw.byQuestion) !== byQuestion) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, stored.text)
    return emptyResult('refused to save because byQuestion would change')
  }

  window.dispatchEvent(new Event(ACTIVITY_CHANGED_EVENT))
  return { written: true, daysBefore, daysAfter, addedDays, totalsAfter }
}

export function installActivityRecovery(): void {
  window.rebuildActivityByDay = rebuildActivityByDay
}

declare global {
  interface Window {
    rebuildActivityByDay: typeof rebuildActivityByDay
  }
}

function addQuestionHistory(
  byDay: Record<string, unknown>,
  byQuestion: Record<string, unknown>,
): Record<string, unknown> {
  const next = cloneRecord(byDay)

  for (const [idText, question] of Object.entries(byQuestion)) {
    const questionId = Number(idText)
    if (!Number.isInteger(questionId) || questionId < 1 || !isRecord(question)) {
      continue
    }

    const packKey = packKeyOf(question)
    if (!packKey) {
      continue
    }

    const needed = neededCounts(question)
    for (const [date, counts] of needed) {
      const attempts = ensureAttempts(next, date, packKey)
      pushMissing(attempts.wins, questionId, counts.wins)
      pushMissing(attempts.loses, questionId, counts.loses)
    }
  }

  return next
}

function neededCounts(question: Record<string, unknown>): Map<ISODate, { wins: number; loses: number }> {
  const wins = countDateList(question.wins)
  const loses = countDateList(question.loses)
  const fromLog = countLog(question.log)
  const dates = new Set<ISODate>([...wins.keys(), ...loses.keys(), ...fromLog.keys()])
  const needed = new Map<ISODate, { wins: number; loses: number }>()

  for (const date of dates) {
    const logged = fromLog.get(date) ?? { wins: 0, loses: 0 }
    needed.set(date, {
      wins: Math.max(wins.get(date) ?? 0, logged.wins),
      loses: Math.max(loses.get(date) ?? 0, logged.loses),
    })
  }

  return needed
}

function countDateList(value: unknown): Map<ISODate, number> {
  const counts = new Map<ISODate, number>()
  if (!Array.isArray(value)) {
    return counts
  }

  for (const item of value) {
    if (!isISODate(item)) {
      continue
    }
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  return counts
}

function countLog(value: unknown): Map<ISODate, { wins: number; loses: number }> {
  const counts = new Map<ISODate, { wins: number; loses: number }>()
  if (!Array.isArray(value)) {
    return counts
  }

  for (const item of value) {
    if (!isRecord(item) || typeof item.at !== 'string' || typeof item.correct !== 'boolean') {
      continue
    }

    const date = dateKeyFromStamp(item.at)
    if (!date) {
      continue
    }

    const current = counts.get(date) ?? { wins: 0, loses: 0 }
    if (item.correct) {
      current.wins += 1
    } else {
      current.loses += 1
    }
    counts.set(date, current)
  }

  return counts
}

function dateKeyFromStamp(value: string): ISODate | null {
  const date = value.slice(0, 10)
  return isISODate(date) ? date : null
}

function pushMissing(ids: number[], questionId: number, needed: number): void {
  const have = ids.filter((id) => id === questionId).length
  for (let index = have; index < needed; index += 1) {
    ids.push(questionId)
  }
}

function ensureAttempts(byDay: Record<string, unknown>, date: ISODate, packKey: PackKey): PackAttempts {
  if (!isRecord(byDay[date])) {
    byDay[date] = { packs: {} }
  }

  const day = byDay[date] as Record<string, unknown>
  if (!isRecord(day.packs)) {
    day.packs = {}
  }

  const packs = day.packs as Record<string, unknown>
  if (!isRecord(packs[packKey])) {
    packs[packKey] = { wins: [], loses: [] }
  }

  const attempts = packs[packKey] as Record<string, unknown>
  if (!Array.isArray(attempts.wins)) {
    attempts.wins = []
  }
  if (!Array.isArray(attempts.loses)) {
    attempts.loses = []
  }

  return attempts as PackAttempts
}

function packKeyOf(question: Record<string, unknown>): PackKey | null {
  if (!isRecord(question.meta)) {
    return null
  }

  const { stack, topic, level } = question.meta
  if (typeof stack !== 'string' || typeof topic !== 'string' || typeof level !== 'string') {
    return null
  }

  const meta = parsePackKey(`${stack}/${topic}/${level}`)
  return meta ? getPackKey(meta) : null
}

function readStoredActivity():
  | { ok: true; text: string; raw: { byDay: Record<string, unknown>; byQuestion: Record<string, unknown> } }
  | { ok: false; reason: string } {
  try {
    const text = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!text) {
      return { ok: false, reason: 'no activity in localStorage' }
    }

    const parsed: unknown = JSON.parse(text)
    if (!isRecord(parsed) || !isRecord(parsed.byQuestion)) {
      return { ok: false, reason: 'activity JSON has no byQuestion, storage left unchanged' }
    }

    if (parsed.byDay !== undefined && !isRecord(parsed.byDay)) {
      return { ok: false, reason: 'activity byDay has an unexpected shape, storage left unchanged' }
    }

    if (!isRecord(parsed.byDay)) {
      parsed.byDay = {}
    }

    return {
      ok: true,
      text,
      raw: parsed as { byDay: Record<string, unknown>; byQuestion: Record<string, unknown> },
    }
  } catch {
    return { ok: false, reason: 'activity JSON is invalid, storage left unchanged' }
  }
}

function totalsByDay(byDay: Record<string, unknown>): Record<ISODate, DayTotals> {
  const totals = {} as Record<ISODate, DayTotals>
  for (const date of sortedDayKeys(byDay)) {
    totals[date] = countDay(byDay[date])
  }
  return totals
}

function countDay(day: unknown): DayTotals {
  if (!isRecord(day) || !isRecord(day.packs)) {
    return { wins: 0, loses: 0, total: 0 }
  }

  let wins = 0
  let loses = 0
  for (const attempts of Object.values(day.packs)) {
    if (!isRecord(attempts)) {
      continue
    }
    wins += Array.isArray(attempts.wins) ? attempts.wins.length : 0
    loses += Array.isArray(attempts.loses) ? attempts.loses.length : 0
  }

  return { wins, loses, total: wins + loses }
}

function sortedDayKeys(byDay: Record<string, unknown>): ISODate[] {
  return Object.keys(byDay).filter(isISODate).sort()
}

function cloneRecord(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

function emptyResult(reason: string): RebuildActivityDaysResult {
  return { written: false, reason, daysBefore: [], daysAfter: [], addedDays: [], totalsAfter: {} }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
