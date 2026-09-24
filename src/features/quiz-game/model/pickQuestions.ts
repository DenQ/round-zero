export function pickQuestions<T>(items: readonly T[], count: number): T[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    const swap = copy[swapIndex]

    if (current === undefined || swap === undefined) {
      continue
    }

    copy[index] = swap
    copy[swapIndex] = current
  }

  return copy.slice(0, Math.min(count, copy.length))
}
