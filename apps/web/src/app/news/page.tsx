import Link from 'next/link'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { getPosts, getVenues, mediaDims, mediaSize, mediaSrcSet } from '@/lib/payload'
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
                const dims = mediaDims(p.heroImage, 'card')
                return (
                  <Link className="card card-link" href={`/news/${p.slug}`} key={p.id}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        srcSet={mediaSrcSet(p.heroImage, ['thumbnail', 'card'])}
                        sizes="(min-width: 900px) 360px, 90vw"
                        alt={p.heroImage?.alt ?? ''}
                        loading="lazy"
                        width={dims?.width}
                        height={dims?.height}
                      />
                    ) : null}
                    <div className="pad">
                      {p.publishedAt ? (
                        <p className="eyebrow" style={{ marginBottom: 8 }}>
                          {formatDate(p.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      ) : null}
                      <h3 style={{ fontSize: 20, marginBottom: 8 }}>{p.title}</h3>
                      {p.excerpt ? <p style={{ margin: 0, fontSize: 15 }}>{p.excerpt}</p> : null}
                    </div>
                  </Link>
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
