import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { catalog, getQuizPath } from '@shared/config/catalog'
import type { CatalogStack, CatalogTopic } from '@shared/config/catalog'
import type { PackLevel } from '@shared/config/packs'

function topicKey(stack: string, topic: string) {
  return `${stack}/${topic}`
}

type PackNavTreeProps = {
  dense?: boolean
  onNavigate?: () => void
}

export function PackNavTree({ dense = true, onNavigate }: PackNavTreeProps) {
  const { t } = useTranslation()
  const stacks = catalog.filter((stack) => stack.topics.length > 0)

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}

    for (const stack of catalog) {
      if (stack.topics.length === 0) {
        continue
      }

      next[stack.slug] = true

      for (const topic of stack.topics) {
        next[topicKey(stack.slug, topic.slug)] = true
      }
    }

    return next
  })

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <List component="nav" dense={dense} aria-label={t('catalog.nav')}>
      {stacks.map((stack) => (
        <StackBranch
          key={stack.slug}
          stack={stack}
          dense={dense}
          expanded={Boolean(open[stack.slug])}
          open={open}
          onToggle={toggle}
          onNavigate={onNavigate}
        />
      ))}
    </List>
  )
}

function StackBranch({
  stack,
  dense,
  expanded,
  open,
  onToggle,
  onNavigate,
}: {
  stack: CatalogStack
  dense: boolean
  expanded: boolean
  open: Record<string, boolean>
  onToggle: (key: string) => void
  onNavigate?: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <ListItemButton onClick={() => onToggle(stack.slug)}>
        <ListItemText primary={t(stack.labelKey)} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding dense={dense}>
          {stack.topics.map((topic) => (
            <TopicBranch
              key={topic.slug}
              stack={stack}
              topic={topic}
              dense={dense}
              expanded={Boolean(open[topicKey(stack.slug, topic.slug)])}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </>
  )
}

function TopicBranch({
  stack,
  topic,
  dense,
  expanded,
  onToggle,
  onNavigate,
}: {
  stack: CatalogStack
  topic: CatalogTopic
  dense: boolean
  expanded: boolean
  onToggle: (key: string) => void
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const key = topicKey(stack.slug, topic.slug)

  return (
    <>
      <ListItemButton sx={{ pl: 3 }} onClick={() => onToggle(key)}>
        <ListItemText primary={t(topic.labelKey)} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding dense={dense}>
          {topic.levels.map((level) => (
            <LevelLink
              key={level}
              stack={stack.slug}
              topic={topic.slug}
              level={level}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </>
  )
}

function LevelLink({
  stack,
  topic,
  level,
  onNavigate,
}: {
  stack: CatalogStack['slug']
  topic: string
  level: PackLevel
  onNavigate?: () => void
}) {
  const { t } = useTranslation()

  return (
    <ListItemButton
      component={NavLink}
      to={getQuizPath(stack, topic, level)}
      onClick={onNavigate}
      sx={{
        pl: 5,
        '&.active': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemText primary={t(`catalog.levels.${level}`)} />
    </ListItemButton>
  )
}
