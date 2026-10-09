import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ActivityPackRef } from '@entities/activity'
import { getPackKey, recordAnswer } from '@entities/activity'
import { ensureRatingBackfill, recordRating } from '@entities/rating'
import { isQuestionCorrect, type Question, type QuestionType } from '@entities/question'
import {
  readSavedGame,
  removeSavedGame,
  saveGame,
  shouldResumeOnMount,
  type SavedAnswer,
  type SavedGame,
} from '@entities/saved-game'
import { resolveRoundSize, type RoundSize } from './constants'
import { filterQuestions } from './filterQuestions'
import { pickQuestions } from './pickQuestions'
import { rehydrateSavedGame } from './rehydrate'
import { readRoundSize, writeRoundSize } from './round-size-storage'
import { readTypeFilter, writeTypeFilter } from './type-filter-storage'
import { toggleQuestionTypes } from './toggleQuestionTypes'

type PlayingState = {
  phase: 'playing' | 'result'
  round: Question[]
  step: number
  selectedIndex: number | null
  answers: SavedAnswer[]
}

type GameState = { phase: 'idle' } | PlayingState

const idleState: GameState = { phase: 'idle' }

export function useQuizGame(questions: Question[], pack: ActivityPackRef) {
  const [state, setState] = useState<GameState>(() => createInitialState(questions, pack))
  const [sourceQuestions, setSourceQuestions] = useState(questions)
  const [roundSize, setRoundSizeState] = useState<RoundSize>(readRoundSize)
  const [typeFilter, setTypeFilter] = useState<QuestionType[]>(readTypeFilter)
  const stateRef = useRef(state)
  const pool = filterQuestions(questions, typeFilter)
  const resolvedRoundSize = resolveRoundSize(roundSize, pool.length)
  const packKey = getPackKey(pack)

  if (sourceQuestions !== questions) {
    setSourceQuestions(questions)
    setState(idleState)
  }

  useLayoutEffect(() => {
    stateRef.current = state
  })

  const toggleTypeFilter = useCallback((clicked: QuestionType | 'all') => {
    setTypeFilter((current) => {
      const next = toggleQuestionTypes(current, clicked)
      writeTypeFilter(next)
      return next
    })
  }, [])

  const setRoundSize = useCallback((size: RoundSize) => {
    writeRoundSize(size)
    setRoundSizeState(size)
  }, [])

  const commit = useCallback(
    (next: GameState) => {
      stateRef.current = next
      setState(next)
      if (next.phase === 'playing') {
        saveGame(pack, toSavedGame(next))
        return
      }

      if (next.phase === 'result') {
        removeSavedGame(pack)
      }
    },
    [pack],
  )

  const start = useCallback(() => {
    if (pool.length === 0 || resolvedRoundSize < 1) {
      return
    }

    commit({
      phase: 'playing',
      round: pickQuestions(pool, resolvedRoundSize),
      step: 0,
      selectedIndex: null,
      answers: [],
    })
  }, [commit, pool, resolvedRoundSize])

  const resume = useCallback(() => {
    const saved = readSavedGame(pack)
    if (!saved) {
      return
    }

    const resumed = rehydrateSavedGame(saved, questions)
    if (!resumed) {
      removeSavedGame(pack)
      return
    }

    const next: GameState = { phase: 'playing', ...resumed }
    stateRef.current = next
    setState(next)
  }, [pack, questions])

  const select = useCallback(
    (optionIndex: number) => {
      const current = stateRef.current
      if (current.phase !== 'playing' || current.selectedIndex !== null) {
        return
      }

      commit({ ...current, selectedIndex: optionIndex })
    },
    [commit],
  )

  const next = useCallback(() => {
    const current = stateRef.current
    if (current.phase !== 'playing' || current.selectedIndex === null) {
      return
    }

    const question = current.round[current.step]
    if (!question) {
      return
    }

    const correct = isQuestionCorrect(question, current.selectedIndex)
    ensureRatingBackfill()
    recordAnswer({
      questionId: question.id,
      correct,
      pack,
    })
    recordRating({ correct, level: pack.level })

    const answers = [
      ...current.answers,
      { questionId: question.id, selectedIndex: current.selectedIndex },
    ]

    if (current.step + 1 >= current.round.length) {
      commit({
        ...current,
        phase: 'result',
        answers,
      })
      return
    }

    commit({
      ...current,
      step: current.step + 1,
      selectedIndex: null,
      answers,
    })
  }, [commit, pack])

  useEffect(() => {
    const saved = readSavedGame(pack)
    if (saved && !rehydrateSavedGame(saved, questions)) {
      removeSavedGame(pack)
    }
  }, [pack, packKey, questions])

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
      resume,
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
  const tally = countRound(state.round, state.answers, state.step, state.selectedIndex)

  return {
    phase: 'playing' as const,
    question,
    step: state.step,
    total: state.round.length,
    selectedIndex: state.selectedIndex,
    revealed: state.selectedIndex !== null,
    correctCount: tally.correct,
    incorrectCount: tally.incorrect,
    select,
    next,
  }
}

function createInitialState(questions: Question[], pack: ActivityPackRef): GameState {
  if (!shouldResumeOnMount(pack)) {
    return idleState
  }

  const saved = readSavedGame(pack)
  if (!saved) {
    return idleState
  }

  const resumed = rehydrateSavedGame(saved, questions)
  if (!resumed) {
    return idleState
  }

  return { phase: 'playing', ...resumed }
}

function toSavedGame(state: PlayingState): SavedGame {
  return {
    questionIds: state.round.map((question) => question.id),
    step: state.step,
    selectedIndex: state.selectedIndex,
    answers: state.answers,
    updatedAt: Date.now(),
  }
}

function countRound(
  round: Question[],
  answers: SavedAnswer[],
  step: number,
  selectedIndex: number | null,
): { correct: number; incorrect: number } {
  const graded = [...answers]
  const question = round[step]
  if (question && selectedIndex !== null) {
    graded.push({ questionId: question.id, selectedIndex })
  }

  const correct = countScore(round, graded)
  return { correct, incorrect: graded.length - correct }
}

function countScore(round: Question[], answers: SavedAnswer[]): number {
  return answers.reduce((score, answer) => {
    const question = round.find((item) => item.id === answer.questionId)
    if (!question || !isQuestionCorrect(question, answer.selectedIndex)) {
      return score
    }

    return score + 1
  }, 0)
}
