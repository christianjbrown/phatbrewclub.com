import Link from 'next/link'
import { Footer, Header } from '@/components/Chrome'
import { BeerCard, EventCard, OpenBadge, TapRows } from '@/components/Bits'
import { JsonLd, organisationSchema, venueSchema } from '@/lib/jsonld'
import { getBeers, getEvents, getTapList, getVenues, mediaSize, mediaSrcSet } from '@/lib/payload'

export default async function Home() {
  const venues = await getVenues()
  const [beers, events] = await Promise.all([getBeers('core'), getEvents(20)])
  const wp = venues.find((v) => v.slug === 'west-perth')
  const tapList = wp ? await getTapList(wp.id) : null
  const hero = mediaSize(venues.find((v) => v.slug === 'hillarys')?.heroImage, 'hero')
  const upcoming = events.filter((e) => new Date(e.startsAt) >= new Date()).slice(0, 4)

  return (
    <>
      <Header />
      <main id="main">
        <JsonLd data={organisationSchema(venues)} />
        {venues.map((v) => <JsonLd key={v.id} data={venueSchema(v)} />)}

        <div className="hero">
          {hero ? (
            /* A real element rather than a CSS background: background images are
               discovered only after CSS resolves, which pushed LCP out by seconds. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="hero-img"
              src={hero}
              srcSet={mediaSrcSet(venues.find((v) => v.slug === 'hillarys')?.heroImage, ['card', 'hero'])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
          <div className="wrap">
            <p className="eyebrow">WEST PERTH · HILLARYS</p>
            <h1>
              Perth&apos;s home of<br />good beer and<br />
              <span style={{ color: 'var(--orange)' }}>good times.</span>
            </h1>
            <p className="lede">
              Two venues, twenty taps, brewed on site in West Perth. Gold Plate winner for WA&apos;s
              best brewery, 2025.
            </p>
            <a className="btn" href="#book">Book a table</a>
            <Link className="btn btn-o" href="/beers">See what&apos;s pouring</Link>
          </div>
        </div>

        <section>
          <div className="wrap">
            <h2>Two venues, one club</h2>
            <div className="grid g2">
              {venues.map((v) => {
                const img = mediaSize(v.heroImage, 'card')
                return (
                  <article className="card" key={v.id}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={v.heroImage?.alt ?? v.name} width={700} height={440} />
                    ) : null}
                    <div className="pad">
                      <h3><Link href={`/venues/${v.slug}`}>{v.name}</Link></h3>
                      <OpenBadge venue={v} />
                      <p style={{ margin: '14px 0 16px', fontSize: 16 }}>
                        {v.address.street}
                        <br />
                        <span style={{ color: '#8a8a8a' }}>{v.transportNote}</span>
                      </p>
                      <a className="btn" href={v.bookingUrl ?? '#book'}>Book {v.shortName}</a>
                      <Link className="btn btn-o" href={`/venues/${v.slug}`}>Hours and menu</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {tapList ? (
          <section>
            <div className="wrap">
              <h2>On tap right now</h2>
              <p>Updated from the venue, not typed out once a month.</p>
              <TapRows list={tapList} />
            </div>
          </section>
        ) : null}

        <section>
          <div className="wrap">
            <h2>What&apos;s on this week</h2>
            <div className="grid" style={{ gap: 14 }}>
              {upcoming.map((e) => <EventCard event={e} key={e.id} />)}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link className="btn btn-o" href="/whats-on">See everything that&apos;s on</Link>
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>The core range</h2>
            <div className="grid g4">
              {beers.slice(0, 4).map((b) => <BeerCard beer={b} key={b.id} />)}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link className="btn btn-o" href="/beers">All 18 beers</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
