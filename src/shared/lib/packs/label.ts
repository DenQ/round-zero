import { findCatalogTopic } from '@shared/config/catalog'
import type { PackLevel, PackStack } from '@shared/config/packs'
import type { TFunction } from 'i18next'

type PackIdentity = {
  stack: PackStack
  topic: string
  level: PackLevel
}

export function packTopicLabel(pack: Pick<PackIdentity, 'stack' | 'topic'>, t: TFunction): string {
  const topic = findCatalogTopic(pack.stack, pack.topic)
  return topic ? t(topic.labelKey) : pack.topic
}

export function packLevelLabel(pack: Pick<PackIdentity, 'level'>, t: TFunction): string {
  return t(`catalog.levels.${pack.level}`)
}

export function packLabel(pack: PackIdentity, t: TFunction): string {
  return [t(`catalog.stacks.${pack.stack}`), packTopicLabel(pack, t), packLevelLabel(pack, t)].join(' · ')
}
