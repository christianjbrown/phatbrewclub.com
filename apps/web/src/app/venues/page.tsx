import Link from 'next/link'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { OpenBadge } from '@/components/Bits'
import { JsonLd, venueSchema } from '@/lib/jsonld'
import { getVenues, mediaUrl } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Our venues',
  description: 'Phat Brew Club has two venues: Phat HQ in West Perth and The Trophy Room at Hillarys Boat Harbour.',
}

export default async function VenuesPage() {
  const venues = await getVenues()
  return (
    <>
      <Header current="/venues" />
      <main id="main">
        {venues.map((v) => <JsonLd key={v.id} data={venueSchema(v)} />)}
        <section>
          <div className="wrap">
            <h1>Two venues, one club</h1>
            <p className="lede">Both brewing, both pouring, both open seven days.</p>
            {venues.map((v) => {
              const img = mediaUrl(v.heroImage)
              return (
                <article className="card" style={{ marginBottom: 22 }} key={v.id}>
                  <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 0 }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={v.heroImage?.alt ?? v.name} style={{ height: '100%', minHeight: 280 }} />
                    ) : <div />}
                    <div className="pad" style={{ padding: 28 }}>
                      <h2 style={{ marginBottom: 12 }}>{v.name}</h2>
                      <OpenBadge venue={v} />
                      <p style={{ margin: '16px 0 8px', fontSize: 17 }}>
                        {v.address.street}, {v.address.suburb} {v.address.state} {v.address.postcode}
                      </p>
                      <p style={{ color: '#8a8a8a', marginBottom: 16 }}>{v.transportNote}</p>
                      <p style={{ marginBottom: 18 }}>
                        {(v.amenities ?? []).map((a) => <span className="chip" key={a}>{a}</span>)}
                      </p>
                      <a className="btn" href={v.bookingUrl ?? '#book'}>Book {v.shortName}</a>
                      <Link className="btn btn-o" href={`/venues/${v.slug}`}>Hours and menu</Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
