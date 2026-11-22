import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const defaultPacksDir = path.join(rootDir, 'public/packs')

const STACKS = ['js', 'ts', 'go', 'sql', 'nest', 'node', 'react']
const LEVELS = ['junior', 'middle', 'senior']
const LOCALES = ['ru', 'en']
const QUESTION_TYPES = ['code', 'text', 'boolean', 'recall']
const TOPIC_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const OPTIONS_PER_QUESTION = 4

export async function pushQuestion(input, packsDir = defaultPacksDir) {
  const draft = assertDraft(input)
  const files = LOCALES.map((locale) => ({
    locale,
    file: packPath(packsDir, draft.stack, draft.topic, draft.level, locale),
  }))

  await mkdir(path.dirname(files[0].file), { recursive: true })

  const packs = await Promise.all(files.map(async ({ locale, file }) => ({
    locale,
    file,
    pack: await readPack(file, { stack: draft.stack, topic: draft.topic, level: draft.level, locale }),
  })))

  assertLocalesInSync(packs)

  const id = (await readLastId(packsDir)) + 1
  if (packs.some(({ pack }) => pack.questions.some((question) => question.id === id))) {
    throw new Error(`Question id ${id} already exists in ${draft.stack}/${draft.topic}/${draft.level}`)
  }

  for (const { locale, file, pack } of packs) {
    pack.questions.push(toPublicQuestion(draft, id, locale))
    await writeJson(file, pack)
  }

  await writeJson(path.join(packsDir, 'last-id.json'), { lastId: id })
  return id
}

function assertDraft(input) {
  if (!isRecord(input)) {
    throw new Error('Question must be an object')
  }

  const { stack, topic, level, type } = input

  if (!STACKS.includes(stack)) {
    throw new Error(`Stack is invalid: ${stack}`)
  }

  if (typeof topic !== 'string' || !TOPIC_SLUG.test(topic)) {
    throw new Error(`Topic is invalid: ${topic}`)
  }

  if (!LEVELS.includes(level)) {
    throw new Error(`Level is invalid: ${level}`)
  }

  if (!QUESTION_TYPES.includes(type)) {
    throw new Error(`Question type is invalid: ${type}`)
  }

  if (type === 'code') {
    assertPlainText(input.text, 'text')
    const options = assertPlainOptions(input.options)
    return {
      stack,
      topic,
      level,
      type,
      language: assertPlainText(input.language, 'language'),
      text: input.text,
      options,
      correctIndex: assertCorrectIndex(input.correctIndex),
    }
  }

  if (type === 'text') {
    const options = assertLocalizedOptions(input.options)
    return {
      stack,
      topic,
      level,
      type,
      text: localized(input.text, 'text'),
      options,
      correctIndex: assertCorrectIndex(input.correctIndex),
    }
  }

  if (type === 'boolean') {
    if (typeof input.correct !== 'boolean') {
      throw new Error('correct must be a boolean')
    }

    return {
      stack,
      topic,
      level,
      type,
      text: localized(input.text, 'text'),
      correct: input.correct,
    }
  }

  return {
    stack,
    topic,
    level,
    type,
    text: localized(input.text, 'text'),
    answer: localized(input.answer, 'answer'),
  }
}

function assertPlainText(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`)
  }

  return value
}

function assertPlainOptions(options) {
  if (!Array.isArray(options) || options.length !== OPTIONS_PER_QUESTION) {
    throw new Error(`Question must have ${OPTIONS_PER_QUESTION} options`)
  }

  const values = options.map((option, index) => assertPlainText(option, `option ${index}`))
  if (new Set(values).size !== values.length) {
    throw new Error('Question has duplicate options')
  }

  return values
}

function assertLocalizedOptions(options) {
  if (!Array.isArray(options) || options.length !== OPTIONS_PER_QUESTION) {
    throw new Error(`Question must have ${OPTIONS_PER_QUESTION} options`)
  }

  const values = options.map((option, index) => localized(option, `option ${index}`))
  for (const locale of LOCALES) {
    const texts = values.map((option) => option[locale])
    if (new Set(texts).size !== texts.length) {
      throw new Error(`Question has duplicate ${locale} options`)
    }
  }

  return values
}

function assertCorrectIndex(correctIndex) {
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= OPTIONS_PER_QUESTION) {
    throw new Error('correctIndex is invalid')
  }

  return correctIndex
}

function localized(value, field) {
  if (!isRecord(value) || typeof value.ru !== 'string' || typeof value.en !== 'string' || value.ru.length === 0 || value.en.length === 0) {
    throw new Error(`${field} must have non-empty ru and en text`)
  }

  return { ru: value.ru, en: value.en }
}

function toPublicQuestion(draft, id, locale) {
  if (draft.type === 'code') {
    return {
      id,
      type: draft.type,
      language: draft.language,
      text: draft.text,
      options: draft.options,
      correctIndex: draft.correctIndex,
    }
  }

  if (draft.type === 'text') {
    return {
      id,
      type: draft.type,
      text: draft.text[locale],
      options: draft.options.map((option) => option[locale]),
      correctIndex: draft.correctIndex,
    }
  }

  if (draft.type === 'boolean') {
    return {
      id,
      type: draft.type,
      text: draft.text[locale],
      correct: draft.correct,
    }
  }

  return {
    id,
    type: draft.type,
    text: draft.text[locale],
    answer: draft.answer[locale],
  }
}

function packPath(packsDir, stack, topic, level, locale) {
  return path.join(packsDir, stack, topic, `level-${level}-${locale}.json`)
}

async function readPack(file, expected) {
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { ...expected, questions: [] }
    }

    throw error
  }

  const pack = JSON.parse(raw)
  if (!isRecord(pack) || !Array.isArray(pack.questions)) {
    throw new Error(`Pack ${file} is invalid`)
  }

  for (const key of ['stack', 'topic', 'level', 'locale']) {
    if (pack[key] !== expected[key]) {
      throw new Error(`Pack ${file} ${key} does not match`)
    }
  }

  return pack
}

function assertLocalesInSync(packs) {
  const [first, second] = packs
  const firstIds = first.pack.questions.map((question) => question.id)
  const secondIds = second.pack.questions.map((question) => question.id)

  if (firstIds.length !== secondIds.length || firstIds.some((id, index) => id !== secondIds[index])) {
    throw new Error(`${first.pack.stack}/${first.pack.topic}/${first.pack.level}: ru and en ids do not match`)
  }
}

async function readLastId(packsDir) {
  const current = JSON.parse(await readFile(path.join(packsDir, 'last-id.json'), 'utf8'))
  if (!isRecord(current) || !Number.isInteger(current.lastId) || current.lastId < 0) {
    throw new Error('lastId is invalid')
  }

  return current.lastId
}

async function writeJson(file, data) {
  const temporary = `${file}.${process.pid}.tmp`
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  await rename(temporary, file)
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
