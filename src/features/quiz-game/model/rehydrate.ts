import type { SavedAnswer, SavedGame } from '@entities/saved-game'
import type { Question } from '@entities/question'

export type ResumedRound = {
  round: Question[]
  step: number
  selectedIndex: number | null
  answers: SavedAnswer[]
}

export function rehydrateSavedGame(saved: SavedGame, questions: readonly Question[]): ResumedRound | null {
  const byId = new Map(questions.map((question) => [question.id, question]))
  const round: Question[] = []

  for (const id of saved.questionIds) {
    const question = byId.get(id)
    if (!question) {
      return null
    }

    round.push(question)
  }

  const current = round[saved.step]
  if (!current || (saved.selectedIndex !== null && !isSelectable(current, saved.selectedIndex))) {
    return null
  }

  for (let index = 0; index < saved.answers.length; index += 1) {
    const question = round[index]
    const answer = saved.answers[index]
    if (!question || !answer || !isSelectable(question, answer.selectedIndex)) {
      return null
    }
  }

  return {
    round,
    step: saved.step,
    selectedIndex: saved.selectedIndex,
    answers: saved.answers,
  }
}

function isSelectable(question: Question, index: number): boolean {
  if (!Number.isInteger(index) || index < 0) {
    return false
  }

  if (question.type === 'boolean' || question.type === 'recall') {
    return index < 2
  }

  return index < question.options.length
}
