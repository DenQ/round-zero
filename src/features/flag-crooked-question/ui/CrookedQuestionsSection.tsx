import { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCrookedQuestions } from '@entities/crooked-question'
import { packLabel } from '@shared/lib/packs'
import { useTranslation } from 'react-i18next'

export function CrookedQuestionsSection() {
  const { t } = useTranslation()
  const { items } = useCrookedQuestions()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAll = async () => {
    const text = items.map((item) => String(item.id)).join('\n')
    const copiedText = await copyIds(text)
    if (!copiedText) {
      return
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" component="h2">
        {t('settings.crookedTitle')}
      </Typography>
      <Typography color="text.secondary">{t('settings.crookedDescription')}</Typography>
      <Button variant="outlined" onClick={() => setOpen(true)} sx={{ alignSelf: 'flex-start' }}>
        {t('settings.crookedShow')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('settings.crookedTitle')}</DialogTitle>
        <DialogContent>
          {items.length === 0 ? (
            <Typography color="text.secondary">{t('settings.crookedEmpty')}</Typography>
          ) : (
            <List disablePadding>
              {items.map((item) => (
                <ListItem key={item.id} disableGutters>
                  <ListItemText
                    primary={t('settings.crookedItem', { id: item.id })}
                    secondary={`${packLabel(item.pack, t)} · ${t(`quiz.game.types.${item.type}`)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('settings.cancel')}</Button>
          <Button
            startIcon={<ContentCopyIcon />}
            disabled={items.length === 0}
            onClick={() => {
              void copyAll()
            }}
          >
            {copied ? t('settings.crookedCopied') : t('settings.crookedCopy')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

async function copyIds(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
