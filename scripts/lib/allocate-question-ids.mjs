import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const lastIdPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/packs/last-id.json')

export async function allocateQuestionIds(count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('count must be a positive integer')
  }

  const current = JSON.parse(await readFile(lastIdPath, 'utf8'))
  const lastId = current.lastId

  if (!Number.isInteger(lastId) || lastId < 0) {
    throw new Error('lastId is invalid')
  }

  const ids = Array.from({ length: count }, (_, index) => lastId + index + 1)
  await writeFile(lastIdPath, `${JSON.stringify({ lastId: lastId + count }, null, 2)}\n`, 'utf8')
  return ids
}
