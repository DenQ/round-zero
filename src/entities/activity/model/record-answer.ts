import { ACTIVITY_VERSION } from './constants'
import { toLocalDateKey } from './date'
import { getPackKey } from './pack-key'
import { readActivity, writeActivity } from './storage'
import type { ActivityState, PackAttempts, QuestionActivity, RecordAnswerInput } from './types'

export function recordAnswer({ questionId, correct, pack, at }: RecordAnswerInput): ActivityState {
  const current = readActivity()
  const moment = at ?? new Date()
  const date = toLocalDateKey(moment)
  const stamp = moment.toISOString()
  const meta = { stack: pack.stack, topic: pack.topic, level: pack.level }
  const packKey = getPackKey(meta)
  const day = current.byDay[date] ?? { packs: {} }
  const attempts = day.packs[packKey] ?? { wins: [], loses: [] }
  const question = current.byQuestion[questionId] ?? { wins: [], loses: [], log: [], meta }

  const next: ActivityState = {
    v: ACTIVITY_VERSION,
    byDay: {
      ...current.byDay,
      [date]: {
        packs: {
          ...day.packs,
          [packKey]: appendAttempt(attempts, questionId, correct),
        },
      },
    },
    byQuestion: {
      ...current.byQuestion,
      [questionId]: appendQuestionDate(question, date, stamp, correct, meta),
    },
  }

  writeActivity(next)
  return next
}

function appendAttempt(attempts: PackAttempts, questionId: number, correct: boolean): PackAttempts {
  if (correct) {
    return { wins: [...attempts.wins, questionId], loses: attempts.loses }
  }

  return { wins: attempts.wins, loses: [...attempts.loses, questionId] }
}

function appendQuestionDate(
  question: QuestionActivity,
  date: QuestionActivity['wins'][number],
  stamp: string,
  correct: boolean,
  pack: QuestionActivity['meta'],
): QuestionActivity {
  const log = [...question.log, { correct, at: stamp }]
  if (correct) {
    return { wins: [...question.wins, date], loses: question.loses, log, meta: pack }
  }

  return { wins: question.wins, loses: [...question.loses, date], log, meta: pack }
}
