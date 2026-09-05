import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { JsonLd, eventSchema } from '@/lib/jsonld'
import { getEvent, getEvents, getVenues, mediaUrl } from '@/lib/payload'
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
  const hero = mediaUrl(event.heroImage)

  return (
    <>
      <Header current="/whats-on" />
      <main id="main">
        <JsonLd data={eventSchema(event)} />
        {hero ? (
          <div className="hero" style={{ minHeight: 340, backgroundImage: `url(${hero})` }}>
            <div className="wrap">
              <p className="eyebrow">{RECUR[event.recurrence]}</p>
              <h1>{event.title}</h1>
            </div>
          </div>
        ) : null}
        <section>
          <div className="wrap">
            {!hero ? (
              <>
                <p className="eyebrow">{RECUR[event.recurrence]}</p>
                <h1>{event.title}</h1>
              </>
            ) : null}
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
            <a className="btn" href={event.bookingUrl ?? '#book'}>Book a table</a>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
