import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { EventCard } from '@/components/Bits'
import { getEvents, getVenues } from '@/lib/payload'

export const metadata: Metadata = {
  title: "What's on",
  description: 'Events, weekly specials, quiz nights and live music at Phat Brew Club in West Perth and Hillarys.',
}

export default async function WhatsOnPage() {
  const [events, venues] = await Promise.all([getEvents(100), getVenues()])
  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now)
  const past = events.filter((e) => new Date(e.startsAt) < now).slice(-4)

  return (
    <>
      <Header current="/whats-on" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>What&apos;s on</h1>
            <p className="lede">Everything happening across both venues.</p>
            <div className="grid" style={{ gap: 14, marginTop: 24 }}>
              {upcoming.length
                ? upcoming.map((e) => <EventCard event={e} as="h2" key={e.id} />)
                : <p>Nothing listed right now. Check back soon.</p>}
            </div>
          </div>
        </section>
        {past.length ? (
          <section>
            <div className="wrap">
              <h2>Recently finished</h2>
              <div className="grid" style={{ gap: 14 }}>
                {past.map((e) => <EventCard event={e} as="h3" key={e.id} />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer venues={venues} />
    </>
  )
}
