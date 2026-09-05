import type { Beer, PhatEvent, TapList, Venue } from './types'
import { SCHEMA_DAY, toPerthIso } from './time'
import { mediaUrl } from './payload'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * The current site emits no structured data at all, which for a two-venue
 * hospitality business is the biggest single search miss. Every template
 * emits the right type here, generated from the same fields the page renders,
 * so the two cannot drift apart.
 */
export const venueSchema = (v: Venue) => ({
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  '@id': `${SITE}/venues/${v.slug}#venue`,
  name: v.name,
  url: `${SITE}/venues/${v.slug}`,
  ...(v.phone ? { telephone: v.phone } : {}),
  ...(v.email ? { email: v.email } : {}),
  ...(mediaUrl(v.heroImage) ? { image: mediaUrl(v.heroImage) } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: v.address.street,
    addressLocality: v.address.suburb,
    addressRegion: v.address.state,
    postalCode: v.address.postcode,
    addressCountry: 'AU',
  },
  ...(v.address.latitude && v.address.longitude
    ? { geo: { '@type': 'GeoCoordinates', latitude: v.address.latitude, longitude: v.address.longitude } }
    : {}),
  servesCuisine: 'Pub food',
  ...(v.capacity ? { maximumAttendeeCapacity: v.capacity } : {}),
  openingHoursSpecification: (v.openingHours ?? [])
    .filter((h) => !h.closed && h.opens && h.closes)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_DAY[h.day]}`,
      opens: h.opens,
      closes: h.closes,
    })),
  ...(v.bookingUrl
    ? {
        potentialAction: {
          '@type': 'ReserveAction',
          target: { '@type': 'EntryPoint', urlTemplate: v.bookingUrl },
        },
      }
    : {}),
})

export const beerSchema = (b: Beer) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE}/beers/${b.slug}#beer`,
  name: b.name,
  url: `${SITE}/beers/${b.slug}`,
  category: b.style,
  ...(b.description ? { description: b.description } : {}),
  ...(mediaUrl(b.canArtwork) ? { image: mediaUrl(b.canArtwork) } : {}),
  brand: { '@type': 'Brand', name: 'Phat Brew Club' },
  additionalProperty: [
    { '@type': 'PropertyValue', name: 'ABV', value: `${b.abv}%` },
    ...(b.ibu ? [{ '@type': 'PropertyValue', name: 'IBU', value: String(b.ibu) }] : []),
    { '@type': 'PropertyValue', name: 'Style', value: b.style },
  ],
})

export const eventSchema = (e: PhatEvent) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': `${SITE}/whats-on/${e.slug}#event`,
  name: e.title,
  url: `${SITE}/whats-on/${e.slug}`,
  // Explicit +08:00 rather than a bare UTC stamp, or Google shows the wrong time.
  startDate: toPerthIso(e.startsAt),
  ...(e.endsAt ? { endDate: toPerthIso(e.endsAt) } : {}),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  ...(mediaUrl(e.heroImage) ? { image: mediaUrl(e.heroImage) } : {}),
  location: (e.venues ?? []).map((v) => ({
    '@type': 'BarOrPub',
    name: v.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: v.address?.street,
      addressLocality: v.address?.suburb,
      addressRegion: v.address?.state,
      postalCode: v.address?.postcode,
      addressCountry: 'AU',
    },
  })),
  organizer: { '@type': 'Organization', name: 'Phat Brew Club', url: SITE },
  offers: {
    '@type': 'Offer',
    price: e.isFree ? '0' : (e.price ?? '').replace(/[^0-9.]/g, '') || '0',
    priceCurrency: 'AUD',
    availability: 'https://schema.org/InStock',
    url: e.bookingUrl ?? `${SITE}/whats-on/${e.slug}`,
  },
})

export const tapMenuSchema = (venue: Venue, list: TapList) => ({
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: `${venue.shortName} tap list`,
  hasMenuSection: {
    '@type': 'MenuSection',
    name: 'On tap',
    // Guest taps belong in the menu too; they just have no Beer record to
    // describe them, so fall back to whatever the tap itself carries.
    hasMenuItem: (list.taps ?? [])
      .filter((t) => !t.kegBlown && (t.beer || t.guestName))
      .map((t) => {
        const name = t.beer?.name ?? t.guestName ?? 'Guest tap'
        const description = t.beer
          ? `${t.beer.style}, ${t.beer.abv}% ABV`
          : [t.guestStyle, t.price].filter(Boolean).join(', ')
        return {
          '@type': 'MenuItem',
          name,
          ...(description ? { description } : {}),
          ...(t.price ? { offers: { '@type': 'Offer', price: t.price.replace(/[^0-9.]/g, ''), priceCurrency: 'AUD' } } : {}),
        }
      }),
  },
})

/** Venue FAQs, marked up so they can appear as rich results in search. */
export const faqSchema = (v: Venue) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (v.faqs ?? []).map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
})

export const organisationSchema = (venues: Venue[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}#org`,
  name: 'Phat Brew Club',
  url: SITE,
  description: 'Independent craft brewery in Western Australia with two venues.',
  location: venues.map((v) => ({ '@id': `${SITE}/venues/${v.slug}#venue` })),
})

export const JsonLd = ({ data }: { data: unknown }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)
