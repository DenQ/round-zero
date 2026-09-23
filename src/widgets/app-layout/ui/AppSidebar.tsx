import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { DRAWER_WIDTH } from './AppHeader'

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', icon: HomeOutlinedIcon, end: true },
  { to: '/about', labelKey: 'nav.about', icon: InfoOutlinedIcon, end: false },
] as const

export function AppSidebar() {
  const { t } = useTranslation()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
            <ListItem key={to} disablePadding>
              <ListItemButton
                component={NavLink}
                to={to}
                end={end}
                sx={{
                  '&.active': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={t(labelKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
