import type { PackRef } from '@shared/config/packs'
import { getPackCacheKey, getPackUrl } from '@shared/config/packs'

const packCache = new Map<string, unknown>()

export class PackLoadError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'PackLoadError'
    this.status = status
  }
}

type LoadPackOptions = {
  signal?: AbortSignal
}

export async function loadPack(
  ref: PackRef,
  options: LoadPackOptions = {},
): Promise<unknown> {
  const key = getPackCacheKey(ref)
  const cached = packCache.get(key)

  if (cached !== undefined) {
    return cached
  }

  const response = await fetch(getPackUrl(ref), { signal: options.signal })

  if (!response.ok) {
    throw new PackLoadError(`Failed to load pack (${response.status})`, response.status)
  }

  const data: unknown = await response.json()

  if (options.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  packCache.set(key, data)
  return data
}

export { packLabel, packLevelLabel, packTopicLabel } from './label'
