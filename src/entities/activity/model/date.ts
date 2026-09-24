import type { ISODate } from './types'

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/

export function toLocalDateKey(date = new Date()): ISODate {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}` as ISODate
}

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !DATE_KEY.test(value)) {
    return false
  }

  const [, year, month, day] = value.match(DATE_KEY) ?? []
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  )
}

export function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
