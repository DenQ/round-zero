export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export const ACTIVITY_LEVELS = [0, 1, 2, 3, 4] as const

export type ActivityLevelRange =
  | { level: 0; kind: 'empty' }
  | { level: 1; kind: 'range'; from: 1; to: 20 }
  | { level: 2; kind: 'range'; from: 21; to: 40 }
  | { level: 3; kind: 'range'; from: 41; to: 60 }
  | { level: 4; kind: 'min'; from: 61 }

const LEVEL_RANGES: Record<ActivityLevel, ActivityLevelRange> = {
  0: { level: 0, kind: 'empty' },
  1: { level: 1, kind: 'range', from: 1, to: 20 },
  2: { level: 2, kind: 'range', from: 21, to: 40 },
  3: { level: 3, kind: 'range', from: 41, to: 60 },
  4: { level: 4, kind: 'min', from: 61 },
}

export function getActivityLevel(count: number): ActivityLevel {
  if (count <= 0) {
    return 0
  }
  if (count <= 20) {
    return 1
  }
  if (count <= 40) {
    return 2
  }
  if (count <= 60) {
    return 3
  }
  return 4
}

export function getActivityLevelRange(level: ActivityLevel): ActivityLevelRange {
  return LEVEL_RANGES[level]
}

const LIGHT_LEVELS = ['#e8eef5', '#c5ddf5', '#7eb6e8', '#3b82c4', '#1a4f8b'] as const
const DARK_LEVELS = ['#2d333b', '#122a4a', '#1d4e89', '#2b7bc1', '#5eb0f0'] as const

export function getActivityLevelColor(level: ActivityLevel, mode: 'light' | 'dark'): string {
  return mode === 'dark' ? DARK_LEVELS[level] : LIGHT_LEVELS[level]
}
