import { getPackKey, parsePackKey } from '@entities/activity'
import type { ActivityPackRef } from '@entities/activity'
import type { SavedGame, SavedGamesState } from './types'

export type SavedGameEntry = {
  pack: ActivityPackRef
  game: SavedGame
}

export function listSavedGames(state: SavedGamesState): SavedGameEntry[] {
  return Object.entries(state.byPack)
    .flatMap(([key, game]) => {
      const pack = parsePackKey(key)
      if (!pack || !game) {
        return []
      }

      return [{ pack, game }]
    })
    .sort(
      (left, right) =>
        right.game.updatedAt - left.game.updatedAt ||
        getPackKey(left.pack).localeCompare(getPackKey(right.pack)),
    )
}
