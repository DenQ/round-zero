export const ROUND_SIZES = [5, 6, 7, 8, 9, 10, 20] as const
export const DEFAULT_ROUND_SIZE = 6

export type RoundSize = (typeof ROUND_SIZES)[number] | 'all'
