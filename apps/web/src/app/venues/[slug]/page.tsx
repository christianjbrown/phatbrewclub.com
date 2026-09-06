import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { AmenityIcon } from '@/components/AmenityIcon'
import { EventCard, HoursTable, OpenBadge, TapRows } from '@/components/Bits'
import { VenueMap } from '@/components/VenueMap'
import { JsonLd, faqSchema, tapMenuSchema, venueSchema } from '@/lib/jsonld'
import { ogImage, pageMeta } from '@/lib/seo'
import { getEvents, getMenus, getTapList, getVenue, getVenues, mediaSize, mediaSrcSet } from '@/lib/cms'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const v = await getVenue(slug)
  if (!v) return {}
  return pageMeta({
    title: v.name,
    description: `${v.name}, ${v.address.street}, ${v.address.suburb}. Opening hours, tap list, menus and bookings.`,
    path: `/venues/${v.slug}`,
    image: ogImage(v.heroImage, v.name),
  })
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
              srcSet={mediaSrcSet(venue.heroImage, ['small', 'card', 'hero'])}
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
                {venue.intro ? <p className="lede">{venue.intro}</p> : null}
                <p>{(venue.amenities ?? []).map((a) => (
                  <span className="chip" key={a}><AmenityIcon label={a} />{a}</span>
                ))}</p>
              </div>
            </div>
          </div>
        </section>

        {/* The count is what is actually listed, not what the venue can pour.
            This claimed 20 taps at Hillarys while showing six, because the
            twenty is the bar's capacity and the six were seed data. */}
        <section>
          <div className="wrap">
            {tapList && (tapList.taps ?? []).length > 0 ? (
              <>
                <h2>
                  {(tapList.taps ?? []).length} on tap at {venue.shortName}
                </h2>
                <TapRows list={tapList} />
              </>
            ) : (
              <>
                <h2>What&apos;s pouring at {venue.shortName}</h2>
                <p>
                  {venue.shortName} pours up to {venue.tapCount ?? 20} taps, but does not publish a
                  live list. The current lineup is on the me&amp;u menu, which is also how you order
                  at the table.
                </p>
                {venue.meanduSlug ? (
                  <p>
                    <a
                      className="btn"
                      href={`https://meandu.app/${venue.meanduSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      See what&apos;s on tap
                    </a>
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>

        {menus.length ? (
          <section id="menus">
            <div className="wrap">
              {/* The menu lives on its own page. It is one of the two things
                  people arrive for, and it was the least reachable thing on the
                  site as a section below hours, taps and events. */}
              <h2>Menus</h2>
              <p className="lede" style={{ marginBottom: 18 }}>
                {menus
                  .map((m) => m.name.replace(/^.*—\s*/, ''))
                  .join(' and ')}
                , served at {venue.shortName}.
              </p>
              <Link className="btn" href={`/venues/${venue.slug}/menu`}>
                See the menu
              </Link>
              {venue.instagram ? (
                <a
                  className="btn btn-o"
                  href={venue.instagram}
                  target="_blank"
                  rel="noopener noreferrer me"
                >
                  {venue.shortName} on Instagram
                </a>
              ) : null}
              {venue.meanduSlug ? (
                <a
                  className="btn btn-o"
                  href={`https://meandu.app/${venue.meanduSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Order on me&amp;u
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        {venue.faqs?.length ? (
          <section>
            <div className="wrap">
              <h2>Common questions</h2>
              {/* Shown, not folded. Four one-line answers behind four clicks
                  is not progressive disclosure. */}
              <dl className="faq">
                {venue.faqs.map((f) => (
                  <div key={f.question}>
                    <dt>{f.question}</dt>
                    <dd>{f.answer}</dd>
                  </div>
                ))}
              </dl>
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
