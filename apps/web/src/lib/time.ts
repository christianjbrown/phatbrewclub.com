import type { OpeningHour, Venue } from './types'

/**
 * Everything on this site is a Perth business, so every date is formatted in
 * Perth time regardless of where the visitor is. A customer in Sydney looking
 * at a Perth gig wants to know when to turn up in Perth.
 */
export const TZ = 'Australia/Perth'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export const DAY_LABEL: Record<OpeningHour['day'], string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
/** schema.org wants full English day names under this URI. */
export const SCHEMA_DAY: Record<OpeningHour['day'], string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: TZ, ...opts }).format(new Date(iso))

export const eventDay = (iso: string) => formatDate(iso, { day: 'numeric' })
export const eventMonth = (iso: string) => formatDate(iso, { month: 'short' }).toUpperCase()
export const eventWeekday = (iso: string) => formatDate(iso, { weekday: 'short' })
export const eventTime = (iso: string) =>
  formatDate(iso, { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(':00', '')
    .replace(/\s/g, '')
    .toLowerCase()

/** Perth has no DST, so the offset is a constant +08:00. */
export const toPerthIso = (iso: string): string => {
  const d = new Date(iso)
  const perth = new Date(d.getTime() + 8 * 3600 * 1000)
  return `${perth.toISOString().slice(0, 19)}+08:00`
}

/** What day is it, in Perth, right now. */
const perthNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    dayKey: DAY_KEYS[new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00`).getDay()]!,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    date: `${get('year')}-${get('month')}-${get('day')}`,
  }
}

const toMinutes = (hhmm?: string | null): number | null => {
  if (!hhmm) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

export type OpenState = { open: boolean; until?: string; opensAt?: string; note?: string }

/**
 * Whether a venue is open right now in Perth. Handles past-midnight closing
 * (an 11am–12am Friday is open at 11:30pm) and special-hours overrides, which
 * is the bit that stops "open now" lying on a public holiday.
 */
export const openState = (venue: Venue): OpenState => {
  const now = perthNow()

  const override = venue.hoursOverrides?.find((o) => o.date?.slice(0, 10) === now.date)
  const row = override ?? venue.openingHours?.find((h) => h.day === now.dayKey)
  if (!row) return { open: false }
  if (row.closed) return { open: false, note: 'label' in row ? (row.label ?? undefined) : undefined }

  const opens = toMinutes(row.opens)
  let closes = toMinutes(row.closes)
  if (opens === null || closes === null) return { open: false }
  if (closes <= opens) closes += 24 * 60

  const open = now.minutes >= opens && now.minutes < closes
  return open
    ? { open: true, until: formatHuman(row.closes!) }
    : { open: false, opensAt: formatHuman(row.opens!) }
}

export const formatHuman = (hhmm: string): string => {
  const mins = toMinutes(hhmm)
  if (mins === null) return hhmm
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const suffix = h24 < 12 ? 'am' : 'pm'
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}
