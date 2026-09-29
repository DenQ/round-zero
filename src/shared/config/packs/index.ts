export const PACK_STACKS = ['js', 'ts', 'go', 'sql', 'nest', 'node', 'react'] as const
export type PackStack = (typeof PACK_STACKS)[number]

export const PACK_LEVELS = ['junior', 'middle', 'senior'] as const
export type PackLevel = (typeof PACK_LEVELS)[number]

export const PACK_LOCALES = ['ru', 'en'] as const
export type PackLocale = (typeof PACK_LOCALES)[number]

export type PackRef = {
  stack: PackStack
  topic: string
  level: PackLevel
  locale: PackLocale
}

const TOPIC_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isPackStack(value: string): value is PackStack {
  return (PACK_STACKS as readonly string[]).includes(value)
}

export function isPackLevel(value: string): value is PackLevel {
  return (PACK_LEVELS as readonly string[]).includes(value)
}

export function getPackLevelIndex(level: PackLevel): number {
  return PACK_LEVELS.indexOf(level)
}

export function isPackLocale(value: string): value is PackLocale {
  return (PACK_LOCALES as readonly string[]).includes(value)
}

export function isPackTopic(value: string): boolean {
  return TOPIC_SLUG.test(value)
}

export function parsePackStack(value: string | undefined): PackStack | null {
  return value && isPackStack(value) ? value : null
}

export function parsePackLevel(value: string | undefined): PackLevel | null {
  return value && isPackLevel(value) ? value : null
}

export function parsePackLocale(value: string | undefined): PackLocale | null {
  return value && isPackLocale(value) ? value : null
}

export function resolvePackLocale(language: string | undefined): PackLocale {
  return language?.startsWith('ru') ? 'ru' : 'en'
}

export function getPackCacheKey({ stack, topic, level, locale }: PackRef): string {
  return `${stack}/${topic}/${level}/${locale}`
}

export function getPackUrl({ stack, topic, level, locale }: PackRef): string {
  return `/packs/${stack}/${topic}/level-${level}-${locale}.json`
}
