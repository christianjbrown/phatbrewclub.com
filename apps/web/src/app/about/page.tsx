import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { getVenues } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'About us',
  description: 'Phat Brew Club started with a group of mates from a footy club who took up homebrewing.',
}

const TIMELINE: [string, string][] = [
  ['2020', 'Won the Margaret River homebrew competition'],
  ['2022', 'Phat HQ opens in West Perth'],
  ['2025', 'Gold Plate, WA’s best brewery'],
  ['2026', 'The Trophy Room opens at Hillarys'],
]

export default async function AboutPage() {
  const venues = await getVenues()
  return (
    <>
      <Header current="/about" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>From a footy club to two breweries</h1>
            <p className="lede">
              A group of mates who met at their local footy club, started homebrewing together, and
              ended up canning it.
            </p>
            <div style={{ marginTop: 30, maxWidth: 640 }}>
              {TIMELINE.map(([year, what]) => (
                <div className="card" style={{ marginBottom: 12 }} key={year}>
                  <div className="pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                    <strong style={{ color: 'var(--orange)', fontSize: 22, minWidth: 64 }}>{year}</strong>
                    <span>{what}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
