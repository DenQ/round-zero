import type { PackRef } from '@shared/config/packs'
import { isPackLevel, isPackLocale, isPackStack, isPackTopic } from '@shared/config/packs'
import { OPTIONS_PER_QUESTION, QUESTIONS_PER_PACK } from './constants'
import type { Question, QuestionPack } from './types'

export class InvalidPackError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidPackError'
  }
}

export function validateQuestionPack(data: unknown, expected?: PackRef): QuestionPack {
  if (!isRecord(data)) {
    throw new InvalidPackError('Pack must be an object')
  }

  const stack = data.stack
  const topic = data.topic
  const level = data.level
  const locale = data.locale
  const questions = data.questions

  if (typeof stack !== 'string' || !isPackStack(stack)) {
    throw new InvalidPackError('Pack stack is invalid')
  }

  if (typeof topic !== 'string' || !isPackTopic(topic)) {
    throw new InvalidPackError('Pack topic is invalid')
  }

  if (typeof level !== 'string' || !isPackLevel(level)) {
    throw new InvalidPackError('Pack level is invalid')
  }

  if (typeof locale !== 'string' || !isPackLocale(locale)) {
    throw new InvalidPackError('Pack locale is invalid')
  }

  if (!Array.isArray(questions) || questions.length !== QUESTIONS_PER_PACK) {
    throw new InvalidPackError(`Pack must contain ${QUESTIONS_PER_PACK} questions`)
  }

  const seenIds = new Set<number>()
  const pack: QuestionPack = {
    stack,
    topic,
    level,
    locale,
    questions: questions.map((question) => {
      const validated = validateQuestion(question)
      if (seenIds.has(validated.id)) {
        throw new InvalidPackError(`Question id ${validated.id} is duplicated in the pack`)
      }
      seenIds.add(validated.id)
      return validated
    }),
  }

  if (expected) {
    if (
      pack.stack !== expected.stack ||
      pack.topic !== expected.topic ||
      pack.level !== expected.level ||
      pack.locale !== expected.locale
    ) {
      throw new InvalidPackError('Pack metadata does not match the requested pack')
    }
  }

  return pack
}

function validateQuestion(data: unknown): Question {
  if (!isRecord(data)) {
    throw new InvalidPackError('Question must be an object')
  }

  const { id, type, text, options, correctIndex, language } = data

  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
    throw new InvalidPackError('Question id must be a positive integer')
  }

  if (typeof type !== 'string' || type.length === 0) {
    throw new InvalidPackError(`Question ${id} type is required`)
  }

  if (typeof text !== 'string' || text.length === 0) {
    throw new InvalidPackError(`Question ${id} text is required`)
  }

  if (!Array.isArray(options) || options.length !== OPTIONS_PER_QUESTION) {
    throw new InvalidPackError(`Question ${id} must have ${OPTIONS_PER_QUESTION} options`)
  }

  if (options.some((option) => typeof option !== 'string' || option.length === 0)) {
    throw new InvalidPackError(`Question ${id} options must be non-empty strings`)
  }

  if (
    typeof correctIndex !== 'number' ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= OPTIONS_PER_QUESTION
  ) {
    throw new InvalidPackError(`Question ${id} correctIndex is invalid`)
  }

  if (language !== undefined && typeof language !== 'string') {
    throw new InvalidPackError(`Question ${id} language is invalid`)
  }

  return {
    id,
    type,
    ...(typeof language === 'string' ? { language } : {}),
    text,
    options: options.filter((option): option is string => typeof option === 'string'),
    correctIndex,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
