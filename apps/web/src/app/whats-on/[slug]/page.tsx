import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { JsonLd, eventSchema } from '@/lib/jsonld'
import { getEvent, getEvents, getVenues, mediaDims, mediaSize, mediaSrcSet } from '@/lib/payload'
import { eventTime, eventWeekday, formatDate } from '@/lib/time'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const e = await getEvent(slug)
  if (!e) return {}
  return {
    title: e.title,
    description: `${e.title} at Phat Brew Club, ${formatDate(e.startsAt, { dateStyle: 'full' })}.`,
  }
}

const RECUR: Record<string, string> = {
  once: 'ONE-OFF', weekly: 'EVERY WEEK', fortnightly: 'EVERY FORTNIGHT', monthly: 'EVERY MONTH',
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()
  const venues = await getVenues()
  const poster = mediaSize(event.heroImage, 'card')
  const posterDims = mediaDims(event.heroImage, 'card')

  return (
    <>
      <Header current="/whats-on" />
      <main id="main">
        <JsonLd data={eventSchema(event)} />
        {/* The poster is a designed graphic with its own text and layout. It
            was being used as a hero background, cropped wide and dimmed behind
            a gradient, which threw away the thing the brewery actually made.
            Shown properly here, beside the details rather than behind them. */}
        <section>
          <div className="wrap">
            <div className={poster ? 'event-detail' : undefined}>
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="poster"
                  src={poster}
                  srcSet={mediaSrcSet(event.heroImage, ['thumbnail', 'small', 'card'])}
                  sizes="(min-width: 900px) 380px, 90vw"
                  alt={event.heroImage?.alt ?? `${event.title} poster`}
                  width={posterDims?.width}
                  height={posterDims?.height}
                />
              ) : null}
              <div>
                <p className="eyebrow">{RECUR[event.recurrence]}</p>
                <h1>{event.title}</h1>
                <div className="spec" style={{ maxWidth: 620 }}>
                  <div><b>{eventTime(event.startsAt)}</b><span>STARTS</span></div>
                  <div><b>{eventWeekday(event.startsAt)}</b><span>{event.recurrence === 'once' ? 'DATE' : 'WEEKLY'}</span></div>
                  <div><b>{event.isFree ? 'Free' : event.price}</b><span>ENTRY</span></div>
                  <div>
                    <b>{(event.venues ?? []).length > 1 ? 'Both' : event.venues?.[0]?.shortName}</b>
                    <span>VENUE</span>
                  </div>
                </div>
                <p className="lede" style={{ marginTop: 24 }}>
                  {formatDate(event.startsAt, { dateStyle: 'full' })} at{' '}
                  {(event.venues ?? []).map((v) => v.name).join(' and ')}.
                </p>
                {/* An event rarely has its own booking link; fall back to the venue's,
                    so every event has a working way to book rather than a dead
                    anchor. */}
                <a
                  className="btn"
                  href={
                    event.bookingUrl ||
                    (event.venues ?? []).map((v) => v.bookingUrl).find(Boolean) ||
                    '/contact'
                  }
                >
                  Book a table
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
