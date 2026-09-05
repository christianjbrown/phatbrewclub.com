import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer, Header } from '@/components/Chrome'
import { getVenues, search } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the beers, events, news and pages on the Phat Brew Club site.',
  // A results page is not something a search engine should index.
  robots: { index: false, follow: true },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const [venues, hits] = await Promise.all([getVenues(), search(q)])
  const term = q.trim()

  return (
    <>
      <Header />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Search</h1>

            {/* A GET form, so a result is a URL somebody can share or bookmark
                and the back button behaves. No JavaScript required. */}
            <form className="search-form" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="q">Search the site</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Beers, events, news…"
                autoComplete="off"
              />
              <button className="btn" type="submit">Search</button>
            </form>

            {term.length === 0 ? (
              <p className="note">Type a beer, an event or anything else you are after.</p>
            ) : term.length < 2 ? (
              <p className="note">Try at least two characters.</p>
            ) : hits.length === 0 ? (
              <p className="note">
                Nothing matched “{term}”. The <Link href="/beers">beers</Link> and{' '}
                <Link href="/whats-on">what&apos;s on</Link> pages are a good place to start.
              </p>
            ) : (
              <>
                <p className="note">
                  {hits.length} result{hits.length === 1 ? '' : 's'} for “{term}”
                </p>
                <ul className="results">
                  {hits.map((h) => (
                    <li key={`${h.kind}-${h.href}-${h.title}`}>
                      <Link href={h.href}>
                        <span className="chip">{h.kind}</span>
                        <strong>{h.title}</strong>
                        {h.detail ? <span className="results-detail">{h.detail}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
