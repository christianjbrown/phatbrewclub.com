import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { EventCard, HoursTable, OpenBadge, TapRows } from '@/components/Bits'
import { VenueMap } from '@/components/VenueMap'
import { JsonLd, faqSchema, tapMenuSchema, venueSchema } from '@/lib/jsonld'
import { getEvents, getMenus, getTapList, getVenue, getVenues, mediaSize, mediaSrcSet } from '@/lib/payload'

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

  const [venues, tapList, events, menus] = await Promise.all([
    getVenues(),
    getTapList(venue.id),
    getEvents(50),
    getMenus(venue.id),
  ])
  const hero = mediaSize(venue.heroImage, 'hero')
  const mine = events.filter(
    (e) => new Date(e.startsAt) >= new Date() && (e.venues ?? []).some((v) => v.slug === venue.slug),
  )

  return (
    <>
      <Header current="/venues" />
      <main id="main">
        <JsonLd data={venueSchema(venue)} />
        {tapList ? <JsonLd data={tapMenuSchema(venue, tapList)} /> : null}
        {venue.faqs?.length ? <JsonLd data={faqSchema(venue)} /> : null}

        <div className="hero" style={{ minHeight: 420 }}>
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="hero-img"
              src={hero}
              srcSet={mediaSrcSet(venue.heroImage, ['card', 'hero'])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
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
                {venue.hoursLabel ? (
                  <p className="eyebrow" style={{ marginBottom: 10 }}>{venue.hoursLabel.toUpperCase()} HOURS</p>
                ) : null}
                <HoursTable venue={venue} />
                {venue.publicHolidayNote ? (
                  <p style={{ marginTop: 14, fontSize: 15, color: '#9a9a9a', maxWidth: 380 }}>
                    {venue.publicHolidayNote}
                  </p>
                ) : null}
              </div>
              <div>
                <h2>Find us</h2>
                <p style={{ fontSize: 18 }}>
                  {venue.address.street}
                  <br />
                  {venue.address.suburb} {venue.address.state} {venue.address.postcode}
                </p>
                <p style={{ color: '#8a8a8a' }}>{venue.transportNote}</p>
                <VenueMap venue={venue} />
                <h3 style={{ marginTop: 26 }}>Good to know</h3>
                <p>{(venue.amenities ?? []).map((a) => <span className="chip" key={a}>{a}</span>)}</p>
              </div>
            </div>
          </div>
        </section>

        {tapList ? (
          <section>
            <div className="wrap">
              <h2>{venue.tapCount ?? 20} taps, poured today at {venue.shortName}</h2>
              <TapRows list={tapList} />
            </div>
          </section>
        ) : null}

        {menus.length ? (
          <section id="menus">
            <div className="wrap">
              {/* The menus were being synced from me&u into the CMS and then
                  rendered nowhere, so "Hours and menus" led to a page with no
                  menu on it. */}
              <h2>Menus</h2>
              {menus.map((m) => (
                <div key={m.id} style={{ marginBottom: 34 }}>
                  <h3>{m.name.replace(/^.*—\s*/, '')}</h3>
                  {(m.sections ?? []).map((sec) => (
                    <div key={sec.name} style={{ marginTop: 18 }}>
                      <p className="eyebrow" style={{ marginBottom: 8 }}>{sec.name}</p>
                      {(sec.items ?? []).map((it) => (
                        <div className="menu-row" key={`${sec.name}-${it.name}`}>
                          <span className="menu-name">{it.name}</span>
                          {it.description ? <span className="menu-desc">{it.description}</span> : null}
                          <span className="menu-price">{it.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              {menus[0]?.syncedAt ? (
                <p style={{ color: '#777', fontSize: 14 }}>
                  Synced from me&amp;u ·{' '}
                  {new Date(menus[0].syncedAt).toLocaleString('en-AU', {
                    timeZone: 'Australia/Perth', dateStyle: 'medium', timeStyle: 'short',
                  })}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {venue.faqs?.length ? (
          <section>
            <div className="wrap">
              <h2>Common questions</h2>
              <div style={{ maxWidth: 760 }}>
                {venue.faqs.map((f) => (
                  <details key={f.question} style={{ borderBottom: '1px solid #222', padding: '16px 0' }}>
                    <summary style={{ font: '700 18px Rubik', cursor: 'pointer' }}>{f.question}</summary>
                    <p style={{ margin: '12px 0 0' }}>{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {mine.length ? (
          <section>
            <div className="wrap">
              <h2>What&apos;s on at {venue.shortName}</h2>
              <div className="grid g3 fill">
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
