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
  gallery?: Media[] | null
  allergens?: string[] | null
  price?: number | null
  packSize?: string | null
  shopUrl?: string | null
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

export type Block =
  | { blockType: 'hero'; eyebrow?: string | null; heading: string; lede?: string | null; image?: Media | null; actions?: { label: string; url: string }[] | null }
  | { blockType: 'richText'; heading?: string | null; body?: unknown }
  | { blockType: 'venueCards'; heading?: string | null; venues?: Venue[] | null }
  | { blockType: 'beerGrid'; heading?: string | null; filterBy?: string | null; limit?: number | null }
  | { blockType: 'eventList'; heading?: string | null; venue?: Venue | null; limit?: number | null }
  | { blockType: 'tapList'; heading?: string | null; venue?: Venue | null }
  | { blockType: 'faq'; heading?: string | null; questions?: { question: string; answer?: unknown }[] | null }
  | { blockType: 'awards'; heading?: string | null; entries?: { year: string; body: string; detail?: string | null }[] | null }
  | { blockType: 'gallery'; heading?: string | null; images?: Media[] | null }
  | { blockType: 'quote'; quote: string; attribution?: string | null }

export type Page = {
  id: number | string
  title: string
  slug: string
  layout?: Block[] | null
  seo?: { title?: string | null; description?: string | null } | null
}

export type Post = {
  id: number | string
  title: string
  slug: string
  publishedAt?: string | null
  excerpt?: string | null
  heroImage?: Media | null
  body?: unknown
}
