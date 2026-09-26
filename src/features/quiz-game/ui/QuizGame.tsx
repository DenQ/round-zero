import { getPackKey, type ActivityPackRef } from '@entities/activity'
import type { Question } from '@entities/question'
import { removeSavedGame, useSavedGames } from '@entities/saved-game'
import { rehydrateSavedGame } from '../model/rehydrate'
import { useQuizGame } from '../model/useQuizGame'
import { PlayOffer } from './PlayOffer'
import { QuizRound } from './QuizRound'
import { RoundResult } from './RoundResult'

type QuizGameProps = {
  questions: Question[]
  pack: ActivityPackRef
}

export function QuizGame({ questions, pack }: QuizGameProps) {
  const game = useQuizGame(questions, pack)
  const saved = useSavedGames()
  const slot = saved.byPack[getPackKey(pack)]
  const unfinished = slot && rehydrateSavedGame(slot, questions) ? slot : null

  if (game.phase === 'playing' && game.question) {
    return (
      <QuizRound
        pack={pack}
        question={game.question}
        step={game.step}
        total={game.total}
        selectedIndex={game.selectedIndex}
        revealed={game.revealed}
        onSelect={game.select}
        onNext={game.next}
      />
    )
  }

  if (game.phase === 'result') {
    return <RoundResult pack={pack} score={game.score} total={game.total} onReplay={game.start} />
  }

  if (game.questionCount === 0) {
    return null
  }

  return (
    <PlayOffer
      questions={questions}
      pool={game.pool}
      roundSize={game.roundSize}
      resolvedRoundSize={game.resolvedRoundSize}
      onRoundSizeChange={game.setRoundSize}
      typeFilter={game.typeFilter}
      onToggleTypeFilter={game.toggleTypeFilter}
      onPlay={game.start}
      unfinished={unfinished ? { step: unfinished.step, total: unfinished.questionIds.length } : null}
      onResume={game.resume}
      onDiscard={() => removeSavedGame(pack)}
    />
  )
}
