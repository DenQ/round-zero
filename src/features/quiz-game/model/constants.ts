export const MIN_ROUND_SIZE = 1
export const DEFAULT_ROUND_SIZE = 6

export type RoundSize = number | 'all'

export function resolveRoundSize(stored: RoundSize, poolLength: number): number {
  if (poolLength < 1) {
    return 0
  }

  if (stored === 'all') {
    return poolLength
  }

  return Math.min(Math.max(Math.round(stored), MIN_ROUND_SIZE), poolLength)
}
