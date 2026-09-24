import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { PackNavTree } from './PackNavTree'

type MobileNavSheetProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export function MobileNavSheet({ open, onOpen, onClose }: MobileNavSheetProps) {
  const { t } = useTranslation()

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            maxHeight: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pb: 'env(safe-area-inset-bottom)',
          },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 1.25,
          pb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 999,
            bgcolor: 'action.disabled',
          }}
        />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, pb: 0.5 }}>
        <Typography variant="subtitle1" component="p" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {t('catalog.nav')}
        </Typography>
        <IconButton aria-label={t('nav.close')} edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Box sx={{ overflow: 'auto' }}>
        <PackNavTree dense={false} onNavigate={onClose} />
      </Box>
    </SwipeableDrawer>
  )
}
