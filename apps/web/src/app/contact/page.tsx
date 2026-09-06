import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { pageMeta } from '@/lib/seo'
import { VenueMap } from '@/components/VenueMap'
import { getVenues } from '@/lib/payload'

export const metadata: Metadata = pageMeta({
  title: 'Contact',
  description:
    'Contact Phat Brew Club: bookings, functions, wholesale and general enquiries.',
  path: '/contact',
})

export default async function ContactPage() {
  const venues = await getVenues()
  return (
    <>
      <Header current="/contact" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Get in touch</h1>
            <div className="grid g2">
              <div>
                <h2>Where to find us</h2>
                {venues.map((v) => (
                  <div className="card" style={{ marginBottom: 14 }} key={v.id}>
                    <div className="pad">
                      <h3>{v.shortName}</h3>
                      <p style={{ margin: '6px 0 0', fontSize: 15 }}>
                        {v.address.street}, {v.address.suburb} {v.address.state} {v.address.postcode}
                      </p>
                      {v.transportNote ? (
                        <p style={{ margin: '4px 0 0', fontSize: 15, color: '#8a8a8a' }}>{v.transportNote}</p>
                      ) : null}
                      <VenueMap venue={v} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h2>Or send a message</h2>
                <form action="/api/enquiry" method="post">
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" autoComplete="name" required />
                  <label htmlFor="email">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" required />
                  <label htmlFor="venue">Which venue</label>
                  <select id="venue" name="venue">
                    {venues.map((v) => <option key={v.id}>{v.shortName}</option>)}
                    <option>Either</option>
                  </select>
                  <label htmlFor="topic">What is it about</label>
                  <select id="topic" name="topic">
                    <option>Booking</option>
                    <option>Function or private hire</option>
                    <option>Wholesale</option>
                    <option>Something else</option>
                  </select>
                  <label htmlFor="message">Your message</label>
                  <textarea id="message" name="message" rows={4} required />
                  <button className="btn" type="submit" style={{ border: 0, cursor: 'pointer' }}>
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
