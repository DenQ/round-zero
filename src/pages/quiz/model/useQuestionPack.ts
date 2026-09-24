import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { validateQuestionPack } from '@entities/question'
import type { QuestionPack } from '@entities/question'
import {
  getPackCacheKey,
  isPackTopic,
  parsePackLevel,
  parsePackStack,
  resolvePackLocale,
} from '@shared/config/packs'
import type { PackLocale, PackRef } from '@shared/config/packs'
import { loadPack } from '@shared/lib/packs'

export type QuestionPackState =
  | { status: 'invalid' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; pack: QuestionPack }

type LoadState =
  | { status: 'loading'; key: string }
  | { status: 'error'; key: string }
  | { status: 'ready'; pack: QuestionPack; key: string }

export function useQuestionPack(): QuestionPackState {
  const { stack: stackParam, topic: topicParam, level: levelParam } = useParams()
  const { i18n } = useTranslation()
  const [state, setState] = useState<LoadState>({ status: 'loading', key: '' })

  const stack = parsePackStack(stackParam)
  const level = parsePackLevel(levelParam)
  const topic = topicParam && isPackTopic(topicParam) ? topicParam : null
  const locale = resolvePackLocale(i18n.resolvedLanguage)
  const ref = toPackRef(stack, topic, level, locale)

  useEffect(() => {
    if (!stack || !topic || level === null) {
      return
    }

    const request: PackRef = { stack, topic, level, locale }
    const requestKey = getPackCacheKey(request)
    const controller = new AbortController()

    void loadPack(request, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) {
          return
        }

        setState({
          status: 'ready',
          pack: validateQuestionPack(data, request),
          key: requestKey,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return
        }

        setState({ status: 'error', key: requestKey })
      })

    return () => {
      controller.abort()
    }
  }, [stack, topic, level, locale])

  if (!ref) {
    return { status: 'invalid' }
  }

  if (state.key !== getPackCacheKey(ref)) {
    return { status: 'loading' }
  }

  if (state.status === 'ready') {
    return { status: 'ready', pack: state.pack }
  }

  return { status: state.status }
}

function toPackRef(
  stack: PackRef['stack'] | null,
  topic: string | null,
  level: PackRef['level'] | null,
  locale: PackLocale,
): PackRef | null {
  if (!stack || !topic || level === null) {
    return null
  }

  return { stack, topic, level, locale }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
