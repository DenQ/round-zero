import { isPackLevel, isPackStack, isPackTopic } from '@shared/config/packs'
import type { ActivityPackRef, PackKey } from './types'

export function getPackKey({ stack, topic, level }: ActivityPackRef): PackKey {
  return `${stack}/${topic}/${level}`
}

export function parsePackKey(value: string): ActivityPackRef | null {
  const parts = value.split('/')
  if (parts.length !== 3) {
    return null
  }

  const [stack, topic, level] = parts
  if (!isPackStack(stack) || !isPackTopic(topic) || !isPackLevel(level)) {
    return null
  }

  return { stack, topic, level }
}
