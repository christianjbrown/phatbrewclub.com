import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { getVenue, getVenues, mediaUrl } from '@/lib/payload'

export const generateStaticParams = async () =>
  (await getVenues()).map((v) => ({ venue: v.slug }))

export const generateMetadata = async ({ params }: { params: Promise<{ venue: string }> }): Promise<Metadata> => {
  const { venue } = await params
  const v = await getVenue(venue)
  if (!v) return {}
  return { title: `Functions at ${v.shortName}`, description: `Private hire and function packages at ${v.name}.` }
}

const SPACES: [string, string, string][] = [
  ['The Beer Garden', 'Up to 80 standing', 'From $XX pp'],
  ['The Mezzanine', 'Up to 40 seated', 'From $XX pp'],
  ['Whole venue', 'Exclusive hire', 'On enquiry'],
]

export default async function FunctionsPage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue: slug } = await params
  const venue = await getVenue(slug)
  if (!venue) notFound()
  const venues = await getVenues()
  const hero = mediaUrl(venue.heroImage)

  return (
    <>
      <Header current="/functions" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Have it at Phat</h1>
            <p className="lede">
              Birthdays, work do&apos;s, engagements and wakes. Spaces at both venues, from a corner
              of the beer garden to the whole clubroom.
            </p>
            <p>
              {venues.map((v) => (
                <Link className={`chip${v.slug === venue.slug ? ' on' : ''}`} href={`/functions/${v.slug}`} key={v.id}>
                  {v.shortName}
                </Link>
              ))}
            </p>
            <div className="grid g3" style={{ marginTop: 20 }}>
              {SPACES.map(([name, cap, price]) => (
                <article className="card" key={name}>
                  {hero ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={hero} alt={`${name} at ${venue.name}`} loading="lazy" width={500} height={320} />
                  ) : null}
                  <div className="pad">
                    <h3>{name}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: 15 }}>{cap}</p>
                    <strong style={{ color: 'var(--orange)' }}>{price}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section>
          <div className="wrap">
            <div className="grid g2">
              <div>
                <h2>What&apos;s included</h2>
                <p>
                  Dedicated function staff, set menus and grazing tables, drinks packages across all{' '}
                  {venue.tapCount ?? 20} taps, AV and screens, and no room hire midweek.
                </p>
              </div>
              <div className="card">
                <div className="pad">
                  <h3>Enquire</h3>
                  <form action="/api/enquiry" method="post">
                    <input type="hidden" name="topic" value="Function or private hire" />
                    <input type="hidden" name="venue" value={venue.shortName} />
                    <label htmlFor="d">Date and headcount</label>
                    <input id="d" name="details" required />
                    <label htmlFor="c">Contact details</label>
                    <input id="c" name="email" type="email" required />
                    <button className="btn" type="submit" style={{ border: 0, cursor: 'pointer' }}>
                      Send enquiry
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
