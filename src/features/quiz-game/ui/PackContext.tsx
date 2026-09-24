import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import type { ActivityPackRef } from '@entities/activity'
import { packLevelLabel, packTopicLabel } from '@shared/lib/packs'

type PackContextProps = {
  pack: ActivityPackRef
}

export function PackContext({ pack }: PackContextProps) {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
      <Chip size="small" variant="outlined" label={packTopicLabel(pack, t)} />
      <Chip size="small" variant="outlined" label={packLevelLabel(pack, t)} />
    </Stack>
  )
}
