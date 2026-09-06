import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Footer, Header } from '@/components/Chrome'
import { ogImage, pageMeta } from '@/lib/seo'
import { getVenue, getVenues, safeList } from '@/lib/payload'

/**
 * The booking form on our own page instead of a link off the site.
 *
 * Nowbookit serves its widget with `content-security-policy: frame-ancestors *`
 * and takes theme and colour parameters in the URL, so it is built to be
 * embedded. The brewery's own booking links already carry those colours; the
 * same URL is reused verbatim rather than rebuilt, so whatever they configure
 * on their side is what shows here.
 *
 * A booking is the one thing on this site somebody might do under time
 * pressure, and bouncing them to a different domain to do it is the easiest
 * conversion to lose. The direct link stays underneath for anyone whose browser
 * blocks third-party frames.
 */
type Params = { params: Promise<{ slug: string }> }

export const generateStaticParams = async () =>
  (await safeList(getVenues)).map((v) => ({ slug: v.slug }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const venue = await getVenue(slug)
  if (!venue) return {}
  return pageMeta({
    title: `Book a table at ${venue.shortName}`,
    description: `Reserve a table at ${venue.name}, ${venue.address.suburb}.`,
    path: `/venues/${venue.slug}/book`,
    image: ogImage(venue.heroImage, venue.name),
  })
}

export default async function BookPage({ params }: Params) {
  const { slug } = await params
  const venue = await getVenue(slug)
  if (!venue) notFound()

  const [venues] = await Promise.all([getVenues()])

  return (
    <>
      <Header current="/venues" />
      <main id="main">
        <section>
          <div className="wrap">
            <p className="eyebrow">
              <Link href={`/venues/${venue.slug}`}>{venue.name}</Link>
            </p>
            <h1>Book a table</h1>

            <p>
              {venues.map((v) => (
                <Link
                  className={`chip${v.slug === venue.slug ? ' on' : ''}`}
                  href={`/venues/${v.slug}/book`}
                  key={v.id}
                >
                  {v.shortName}
                </Link>
              ))}
            </p>

            {venue.bookingUrl ? (
              <>
                <div className="booking">
                  <iframe
                    src={venue.bookingUrl}
                    title={`Table booking for ${venue.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="note" style={{ marginTop: 14 }}>
                  Trouble with the form?{' '}
                  <a href={venue.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Open it in a new tab
                  </a>
                  .
                </p>
              </>
            ) : (
              <p className="note">
                Online booking is not set up for this venue. Walk-ins are welcome, and{' '}
                <Link href="/contact">contact</Link> has the details for larger groups.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
