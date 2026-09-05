export type Media = {
  id: number | string
  alt: string
  url: string
  width?: number
  height?: number
  sizes?: Record<string, { url?: string; width?: number; height?: number }>
}

export type OpeningHour = {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  opens?: string | null
  closes?: string | null
  closed?: boolean | null
}

export type Venue = {
  id: number | string
  name: string
  shortName: string
  slug: string
  address: {
    street: string
    suburb: string
    state: string
    postcode: string
    latitude?: number | null
    longitude?: number | null
  }
  transportNote?: string | null
  phone?: string | null
  email?: string | null
  capacity?: number | null
  tapCount?: number | null
  amenities?: string[] | null
  bookingUrl?: string | null
  menuUrl?: string | null
  meanduSlug?: string | null
  heroImage?: Media | null
  openingHours?: OpeningHour[] | null
  hoursOverrides?: { date: string; label?: string | null; opens?: string | null; closes?: string | null; closed?: boolean | null }[] | null
}

export type Beer = {
  id: number | string
  name: string
  slug: string
  style: string
  abv: number
  ibu?: number | null
  category: 'core' | 'seasonal' | 'limited' | 'collab'
  description?: string | null
  canArtwork?: Media | null
  untappdUrl?: string | null
  availableAt?: Venue[] | null
  ingredients?: { producer: string; contribution?: string | null }[] | null
}

export type Tap = { tapNumber: number; beer: Beer; kegBlown?: boolean | null }

export type TapList = {
  id: number | string
  title?: string | null
  venue: Venue
  taps?: Tap[] | null
  source?: string | null
  syncedAt?: string | null
}

export type PhatEvent = {
  id: number | string
  title: string
  slug: string
  startsAt: string
  endsAt?: string | null
  recurrence: 'once' | 'weekly' | 'fortnightly' | 'monthly'
  category?: string | null
  venues: Venue[]
  heroImage?: Media | null
  isFree?: boolean | null
  price?: string | null
  bookingUrl?: string | null
}

export type Paginated<T> = { docs: T[]; totalDocs: number }
