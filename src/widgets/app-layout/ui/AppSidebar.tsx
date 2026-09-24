import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import type { Theme } from '@mui/material/styles'
import { DRAWER_WIDTH } from './AppHeader'
import { PackNavTree } from './PackNavTree'

type AppSidebarProps = {
  open: boolean
}

export function AppSidebar({ open }: AppSidebarProps) {
  const width = open ? DRAWER_WIDTH : 0

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width,
        flexShrink: 0,
        overflow: 'hidden',
        transition: (theme) => sidebarTransition(theme, open),
        '& .MuiDrawer-paper': {
          width,
          overflowX: 'hidden',
          borderRightWidth: open ? 1 : 0,
          transition: (theme) => sidebarTransition(theme, open),
        },
      }}
      slotProps={{
        paper: {
          inert: open ? undefined : true,
          'aria-hidden': open ? undefined : true,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', width: DRAWER_WIDTH }}>
        <PackNavTree />
      </Box>
    </Drawer>
  )
}

function sidebarTransition(theme: Theme, open: boolean) {
  return theme.transitions.create(['width', 'border-width'], {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  })
}
