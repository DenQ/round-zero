import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getPackKey } from '@entities/activity'
import { listSavedGames, removeSavedGame, requestResume, useSavedGames } from '@entities/saved-game'
import { getQuizPath } from '@shared/config/catalog'
import { packLabel } from '@shared/lib/packs'
import { SavedGameActions } from './SavedGameActions'

export function UnfinishedGames() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const saved = useSavedGames()
  const items = listSavedGames(saved)

  if (items.length === 0) {
    return null
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" component="h2">
        {t('home.unfinished.title')}
      </Typography>
      <Stack spacing={1}>
        {items.map(({ pack, game }) => (
          <SavedGameActions
            key={getPackKey(pack)}
            label={packLabel(pack, t)}
            step={game.step}
            total={game.questionIds.length}
            onContinue={() => {
              requestResume(pack)
              navigate(getQuizPath(pack.stack, pack.topic, pack.level))
            }}
            onDiscard={() => removeSavedGame(pack)}
          />
        ))}
      </Stack>
    </Stack>
  )
}
