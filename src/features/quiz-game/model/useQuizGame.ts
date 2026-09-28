import { useCallback, useState } from 'react'
import type { ActivityPackRef } from '@entities/activity'
import { recordAnswer } from '@entities/activity'
import { isQuestionCorrect, type Question, type QuestionType } from '@entities/question'
import { resolveRoundSize, type RoundSize } from './constants'
import { filterQuestions } from './filterQuestions'
import { pickQuestions } from './pickQuestions'
import { readRoundSize, writeRoundSize } from './round-size-storage'
import { readTypeFilter, writeTypeFilter } from './type-filter-storage'
import { toggleQuestionTypes } from './toggleQuestionTypes'

type GivenAnswer = {
  questionId: number
  selectedIndex: number
}

type PlayingState = {
  phase: 'playing' | 'result'
  round: Question[]
  step: number
  selectedIndex: number | null
  answers: GivenAnswer[]
}

type GameState = { phase: 'idle' } | PlayingState

const idleState: GameState = { phase: 'idle' }

export function useQuizGame(questions: Question[], pack: ActivityPackRef) {
  const [state, setState] = useState<GameState>(idleState)
  const [sourceQuestions, setSourceQuestions] = useState(questions)
  const [roundSize, setRoundSizeState] = useState<RoundSize>(readRoundSize)
  const [typeFilter, setTypeFilter] = useState<QuestionType[]>(readTypeFilter)
  const pool = filterQuestions(questions, typeFilter)
  const resolvedRoundSize = resolveRoundSize(roundSize, pool.length)

  const toggleTypeFilter = useCallback((clicked: QuestionType | 'all') => {
    setTypeFilter((current) => {
      const next = toggleQuestionTypes(current, clicked)
      writeTypeFilter(next)
      return next
    })
  }, [])

  if (sourceQuestions !== questions) {
    setSourceQuestions(questions)
    setState(idleState)
  }

  const setRoundSize = useCallback((size: RoundSize) => {
    writeRoundSize(size)
    setRoundSizeState(size)
  }, [])

  const start = useCallback(() => {
    if (pool.length === 0 || resolvedRoundSize < 1) {
      return
    }

    setState({
      phase: 'playing',
      round: pickQuestions(pool, resolvedRoundSize),
      step: 0,
      selectedIndex: null,
      answers: [],
    })
  }, [pool, resolvedRoundSize])

  const select = useCallback((optionIndex: number) => {
    setState((current) => {
      if (current.phase !== 'playing' || current.selectedIndex !== null) {
        return current
      }

      return { ...current, selectedIndex: optionIndex }
    })
  }, [])

  const next = useCallback(() => {
    if (state.phase !== 'playing' || state.selectedIndex === null) {
      return
    }

    const question = state.round[state.step]
    if (!question) {
      return
    }

    recordAnswer({
      questionId: question.id,
      correct: isQuestionCorrect(question, state.selectedIndex),
      pack,
    })

    const answers = [
      ...state.answers,
      { questionId: question.id, selectedIndex: state.selectedIndex },
    ]

    if (state.step + 1 >= state.round.length) {
      setState({
        ...state,
        phase: 'result',
        answers,
      })
      return
    }

    setState({
      ...state,
      step: state.step + 1,
      selectedIndex: null,
      answers,
    })
  }, [pack, state])

  if (state.phase === 'idle') {
    return {
      phase: 'idle' as const,
      questionCount: questions.length,
      pool,
      roundSize,
      resolvedRoundSize,
      setRoundSize,
      typeFilter,
      toggleTypeFilter,
      start,
    }
  }

  if (state.phase === 'result') {
    return {
      phase: 'result' as const,
      score: countScore(state.round, state.answers),
      total: state.round.length,
      start,
    }
  }

  const question = state.round[state.step] ?? null

  return {
    phase: 'playing' as const,
    question,
    step: state.step,
    total: state.round.length,
    selectedIndex: state.selectedIndex,
    revealed: state.selectedIndex !== null,
    select,
    next,
  }
}

function countScore(round: Question[], answers: GivenAnswer[]): number {
  return answers.reduce((score, answer) => {
    const question = round.find((item) => item.id === answer.questionId)
    if (!question || !isQuestionCorrect(question, answer.selectedIndex)) {
      return score
    }

    return score + 1
  }, 0)
}
