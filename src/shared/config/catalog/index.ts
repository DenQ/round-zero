import type { PackLevel, PackStack } from '@shared/config/packs'
import { PACK_LEVELS } from '@shared/config/packs'

export type CatalogTopic = {
  slug: string
  labelKey: string
  levels: readonly PackLevel[]
}

export type CatalogStack = {
  slug: PackStack
  labelKey: string
  topics: readonly CatalogTopic[]
}

export const catalog = [
  {
    slug: 'js',
    labelKey: 'catalog.stacks.js',
    topics: [
      {
        slug: 'event-loop',
        labelKey: 'catalog.topics.eventLoop',
        levels: PACK_LEVELS,
      },
      {
        slug: 'context',
        labelKey: 'catalog.topics.context',
        levels: PACK_LEVELS,
      },
      {
        slug: 'prototypes',
        labelKey: 'catalog.topics.prototypes',
        levels: PACK_LEVELS,
      },
    ],
  },
  { slug: 'ts', labelKey: 'catalog.stacks.ts', topics: [] },
  { slug: 'go', labelKey: 'catalog.stacks.go', topics: [] },
  { slug: 'sql', labelKey: 'catalog.stacks.sql', topics: [] },
  { slug: 'nest', labelKey: 'catalog.stacks.nest', topics: [] },
  { slug: 'react', labelKey: 'catalog.stacks.react', topics: [] },
] as const satisfies readonly CatalogStack[]

export function getQuizPath(stack: PackStack, topic: string, level: PackLevel): string {
  return `/quiz/${stack}/${topic}/${level}`
}

export function findCatalogTopic(stack: PackStack, topicSlug: string): CatalogTopic | undefined {
  return catalog.find((item) => item.slug === stack)?.topics.find((topic) => topic.slug === topicSlug)
}
