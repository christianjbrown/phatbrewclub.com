import Link from 'next/link'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { getPosts, getVenues, mediaSize } from '@/lib/payload'
import { formatDate } from '@/lib/time'

export const metadata: Metadata = {
  title: 'News',
  description: 'News and announcements from Phat Brew Club in West Perth and Hillarys.',
}

export default async function NewsPage() {
  const [posts, venues] = await Promise.all([getPosts(), getVenues()])
  return (
    <>
      <Header current="/news" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>News</h1>
            <p className="lede">New specials, new beers and what the brewery is up to.</p>
            <div className="grid g3" style={{ marginTop: 28 }}>
              {posts.map((p) => {
                const img = mediaSize(p.heroImage, 'card')
                return (
                  <article className="card" key={p.id}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.heroImage?.alt ?? ''} loading="lazy" width={700} height={440} />
                    ) : null}
                    <div className="pad">
                      {p.publishedAt ? (
                        <p className="eyebrow" style={{ marginBottom: 8 }}>
                          {formatDate(p.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      ) : null}
                      <h2 style={{ fontSize: 20, marginBottom: 8 }}>
                        <Link href={`/news/${p.slug}`}>{p.title}</Link>
                      </h2>
                      {p.excerpt ? <p style={{ margin: 0, fontSize: 15 }}>{p.excerpt}</p> : null}
                    </div>
                  </article>
                )
              })}
            </div>
            {!posts.length ? <p>Nothing posted yet.</p> : null}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
