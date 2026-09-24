import type { DayActivity, DayTotals } from './types'

export function getDayTotals(day: DayActivity | undefined): DayTotals {
  if (!day) {
    return { wins: 0, loses: 0, total: 0 }
  }

  let wins = 0
  let loses = 0

  for (const pack of Object.values(day.packs)) {
    wins += pack.wins.length
    loses += pack.loses.length
  }

  return { wins, loses, total: wins + loses }
}
