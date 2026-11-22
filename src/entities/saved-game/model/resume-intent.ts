import { getPackKey, parsePackKey } from '@entities/activity'
import type { ActivityPackRef } from '@entities/activity'
import { getQuizPath } from '@shared/config/catalog'

let bootResumePack = readBootResumePack()
let requestedResumePack: string | null = null

export function requestResume(pack: ActivityPackRef): void {
  requestedResumePack = getPackKey(pack)
}

export function shouldResumeOnMount(pack: ActivityPackRef): boolean {
  const key = getPackKey(pack)
  return bootResumePack === key || requestedResumePack === key
}

export function clearResumeIntentIfLeft(pathname: string): void {
  bootResumePack = keepIfSamePath(bootResumePack, pathname)
  requestedResumePack = keepIfSamePath(requestedResumePack, pathname)
}

function keepIfSamePath(key: string | null, pathname: string): string | null {
  if (!key) {
    return null
  }

  const pack = parsePackKey(key)
  if (!pack || getQuizPath(pack.stack, pack.topic, pack.level) !== pathname) {
    return null
  }

  return key
}

function readBootResumePack(): string | null {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return null
  }

  const [entry] = performance.getEntriesByType('navigation')
  if (!(entry instanceof PerformanceNavigationTiming) || entry.type !== 'reload') {
    return null
  }

  return packKeyFromPath(window.location.pathname)
}

function packKeyFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/quiz\/([^/]+)\/([^/]+)\/([^/]+)\/?$/)
  if (!match) {
    return null
  }

  const pack = parsePackKey(`${match[1]}/${match[2]}/${match[3]}`)
  return pack ? getPackKey(pack) : null
}
