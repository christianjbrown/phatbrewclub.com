import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { EventCard, HoursTable, OpenBadge, TapRows } from '@/components/Bits'
import { JsonLd, tapMenuSchema, venueSchema } from '@/lib/jsonld'
import { getEvents, getTapList, getVenue, getVenues, mediaUrl } from '@/lib/payload'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const v = await getVenue(slug)
  if (!v) return {}
  return {
    title: v.name,
    description: `${v.name}, ${v.address.street}, ${v.address.suburb}. Opening hours, tap list, menus and bookings.`,
  }
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const venue = await getVenue(slug)
  if (!venue) notFound()

  const [venues, tapList, events] = await Promise.all([getVenues(), getTapList(venue.id), getEvents(50)])
  const hero = mediaUrl(venue.heroImage)
  const mine = events.filter(
    (e) => new Date(e.startsAt) >= new Date() && (e.venues ?? []).some((v) => v.slug === venue.slug),
  )

  return (
    <>
      <Header current="/venues" />
      <main id="main">
        <JsonLd data={venueSchema(venue)} />
        {tapList ? <JsonLd data={tapMenuSchema(venue, tapList)} /> : null}

        <div className="hero" style={{ minHeight: 420, ...(hero ? { backgroundImage: `url(${hero})` } : {}) }}>
          <div className="wrap">
            <p className="eyebrow">{venue.shortName.toUpperCase()}</p>
            <h1>{venue.name}</h1>
            <OpenBadge venue={venue} />
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid g2">
              <div>
                <h2>Opening hours</h2>
                <HoursTable venue={venue} />
              </div>
              <div>
                <h2>Find us</h2>
                <p style={{ fontSize: 18 }}>
                  {venue.address.street}
                  <br />
                  {venue.address.suburb} {venue.address.state} {venue.address.postcode}
                </p>
                <p style={{ color: '#8a8a8a' }}>{venue.transportNote}</p>
                {venue.phone ? (
                  <p><a className="btn btn-o" href={`tel:${venue.phone.replace(/\s/g, '')}`}>Call {venue.shortName}</a></p>
                ) : null}
                <h3 style={{ marginTop: 26 }}>Good to know</h3>
                <p>{(venue.amenities ?? []).map((a) => <span className="chip" key={a}>{a}</span>)}</p>
              </div>
            </div>
          </div>
        </section>

        {tapList ? (
          <section>
            <div className="wrap">
              <h2>{venue.tapCount ?? 20} taps, poured today</h2>
              <TapRows list={tapList} />
            </div>
          </section>
        ) : null}

        {mine.length ? (
          <section>
            <div className="wrap">
              <h2>What&apos;s on at {venue.shortName}</h2>
              <div className="grid" style={{ gap: 14 }}>
                {mine.map((e) => <EventCard event={e} key={e.id} />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer venues={venues} />
    </>
  )
}
