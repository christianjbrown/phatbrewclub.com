import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { pageMeta } from '@/lib/seo'
import { BeerCard } from '@/components/Bits'
import { getBeers, getVenues } from '@/lib/payload'

export const generateMetadata = (): Promise<Metadata> =>
  pageMeta({
    title: 'Our beers',
    description:
      'The full Phat Brew Club range: core beers, seasonals, limited releases and collaborations, with style and ABV.',
    path: '/beers',
  })

const GROUPS: [string, string][] = [
  ['core', 'Core range'],
  ['seasonal', 'Seasonal'],
  ['limited', 'Limited releases'],
  ['collab', 'Collaborations'],
]

export default async function BeersPage() {
  const [beers, venues] = await Promise.all([getBeers(), getVenues()])
  return (
    <>
      <Header current="/beers" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>The Phat range</h1>
            <p className="lede">
              Brewed on site in West Perth. {beers.length} beers across the core range, seasonals,
              limited drops and collabs.
            </p>
          </div>
        </section>
        {GROUPS.map(([key, label]) => {
          const group = beers.filter((b) => b.category === key)
          if (!group.length) return null
          return (
            <section key={key}>
              <div className="wrap">
                <h2>{label}</h2>
                <div className="grid g4 fill">
                  {group.map((b) => <BeerCard beer={b} key={b.id} />)}
                </div>
              </div>
            </section>
          )
        })}
      </main>
      <Footer venues={venues} />
    </>
  )
}
