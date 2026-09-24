import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packsDir = path.join(rootDir, 'public/packs')
const lastIdPath = path.join(packsDir, 'last-id.json')

const errors = []

const files = await collectPackFiles(packsDir)
const packs = await Promise.all(files.map(async (file) => ({ file, data: JSON.parse(await readFile(file, 'utf8')) })))
const byIdentity = new Map()
const owners = new Map()
let maxId = 0

for (const { file, data } of packs) {
  const identity = `${data.stack}/${data.topic}/${data.level}`
  const ids = data.questions.map((question) => question.id)
  maxId = ids.reduce((max, id) => Math.max(max, id), maxId)

  const locales = byIdentity.get(identity) ?? []
  locales.push({ locale: data.locale, ids, file })
  byIdentity.set(identity, locales)

  for (const id of ids) {
    const owner = owners.get(id)
    if (owner && owner !== identity) {
      errors.push(`id ${id} is used by both ${owner} and ${identity}`)
    }
    owners.set(id, identity)
  }
}

for (const [identity, locales] of byIdentity) {
  const [first, ...rest] = locales
  for (const locale of rest) {
    if (first.ids.length !== locale.ids.length || first.ids.some((id, index) => id !== locale.ids[index])) {
      errors.push(`${identity}: ${first.locale} and ${locale.locale} ids do not match`)
    }
  }
}

const lastId = JSON.parse(await readFile(lastIdPath, 'utf8')).lastId
if (!Number.isInteger(lastId) || lastId < maxId) {
  errors.push(`lastId ${lastId} must be >= max question id ${maxId}`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Checked ${files.length} packs, lastId=${lastId}, maxId=${maxId}`)
}

async function collectPackFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectPackFiles(fullPath)))
      continue
    }

    if (entry.name.endsWith('.json') && entry.name !== 'last-id.json') {
      files.push(fullPath)
    }
  }

  return files
}
