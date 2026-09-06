import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Footer, Header } from '@/components/Chrome'
import { ogImage, pageMeta } from '@/lib/seo'
import { DietaryTags } from '@/components/DietaryTags'
import { MenuPhoto } from '@/components/MenuPhoto'
import {
  getMenus,
  getVenue,
  getVenues,
  mediaDims,
  mediaSize,
  mediaSrcSet,
  safeList,
} from '@/lib/cms'

/**
 * The menu on its own page, rather than a section near the bottom of the venue.
 *
 * "Menu" is one of the two things anyone arrives wanting — it is what the nav,
 * the footer and every search for the brewery point at — and burying it under
 * hours, taps and events made it the least reachable thing on the site. Its own
 * URL is also shareable, which a fragment on a long page is not.
 */
type Params = { params: Promise<{ slug: string }> }

export const generateStaticParams = async () =>
  (await safeList(getVenues)).map((v) => ({ slug: v.slug }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const venue = await getVenue(slug)
  if (!venue) return {}
  return pageMeta({
    title: `${venue.name} menu`,
    description: `Food and drinks at ${venue.name}, ${venue.address.suburb}.`,
    path: `/venues/${venue.slug}/menu`,
    image: ogImage(venue.heroImage, venue.name),
  })
}

export default async function VenueMenuPage({ params }: Params) {
  const { slug } = await params
  const venue = await getVenue(slug)
  if (!venue) notFound()

  const [venues, menus] = await Promise.all([getVenues(), getMenus(venue.id)])

  return (
    <>
      <Header current="/venues" />
      <main id="main">
        <section>
          <div className="wrap">
            <p className="eyebrow">
              <Link href={`/venues/${venue.slug}`}>{venue.name}</Link>
            </p>
            <h1>Menu</h1>

            {menus.length === 0 ? (
              <p className="note">
                The menu for this venue is not available right now. It is served in
                the venue, and <Link href={`/venues/${venue.slug}`}>the venue page</Link>{' '}
                has hours and booking.
              </p>
            ) : (
              menus.map((m) => (
                <div key={m.id} style={{ marginBottom: 40 }}>
                  <h2>{m.name.replace(/^.*—\s*/, '')}</h2>
                  {(m.sections ?? []).map((sec) => (
                    <div key={sec.name} style={{ marginTop: 22 }}>
                      <p className="eyebrow" style={{ marginBottom: 10 }}>{sec.name}</p>
                      {(sec.items ?? []).map((it) => {
                        const img = mediaSize(it.image, 'micro')
                        const dims = mediaDims(it.image, 'micro')
                        return (
                          <div className="menu-item" key={`${sec.name}-${it.name}`}>
                            {img ? (
                              <MenuPhoto
                                thumb={img}
                                srcSet={mediaSrcSet(it.image, ['micro', 'thumbnail'])}
                                full={mediaSize(it.image, 'card') ?? img}
                                alt={it.image?.alt ?? it.name ?? ''}
                                width={dims?.width}
                                height={dims?.height}
                              />
                            ) : null}
                            <div className="menu-text">
                              <div className="menu-row">
                                <span className="menu-name">{it.name}</span>
                                <span className="menu-price">{it.price}</span>
                              </div>
                              {it.description ? (
                                <p className="menu-desc">{it.description}</p>
                              ) : null}
                              <DietaryTags value={it.dietary} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))
            )}

            {venue.meanduSlug ? (
              <p style={{ marginTop: 26 }}>
                {/* Ordering happens on me&u, which is also where these prices
                    and photos come from. Linking per item is not possible: the
                    feed carries no per-item ordering URL, only the venue's. */}
                <a
                  className="btn"
                  href={`https://meandu.app/${venue.meanduSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Order on me&amp;u
                </a>
              </p>
            ) : null}

            {menus[0]?.syncedAt ? (
              <p style={{ color: '#777', fontSize: 14 }}>
                Synced from me&amp;u ·{' '}
                {new Date(menus[0].syncedAt).toLocaleString('en-AU', {
                  timeZone: 'Australia/Perth',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            ) : null}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
