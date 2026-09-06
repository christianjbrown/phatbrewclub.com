import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { ogImage, pageMeta } from '@/lib/seo'
import { getFunctionPackages, getVenue, getVenues, mediaDims, mediaSize, mediaSrcSet, mediaUrl } from '@/lib/payload'
import { RichText } from '@/components/RichText'

export const generateMetadata = async ({ params }: { params: Promise<{ venue: string }> }): Promise<Metadata> => {
  const { venue } = await params
  const v = await getVenue(venue)
  if (!v) return {}
  return pageMeta({
    title: `Functions at ${v.shortName}`,
    description: `Private hire and function enquiries at ${v.name}.`,
    path: `/functions/${v.slug}`,
    image: ogImage(v.heroImage, v.name),
  })
}

/**
 * What this page may say is limited by what the brewery actually publishes.
 *
 * It previously listed named spaces with capacities and prices — "The Beer
 * Garden, up to 80 standing, from $XX pp" — none of which came from anywhere.
 * The placeholder was going out on a live page with the XX still in it. The
 * brewery's own functions pages carry one line, "Function details coming
 * soon!", and West Perth adds a PDF brochure.
 *
 * So: the brochure where there is one, an enquiry form, and nothing invented.
 * The form is a mechanism rather than a claim, which is why it stays.
 *
 * The Function spaces collection now feeds this page. It always could have —
 * it has name, capacity, seating, a price guide, a photograph and inclusions —
 * but nothing read it, so anything typed in there went nowhere. It stays empty
 * until the brewery fills it in, and an empty list renders nothing rather than
 * a placeholder, which is the same rule as before: their words or none.
 */
export default async function FunctionsPage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue: slug } = await params
  const venue = await getVenue(slug)
  if (!venue) notFound()
  const [venues, packages] = await Promise.all([getVenues(), getFunctionPackages(venue.id)])
  const hero = mediaSize(venue.heroImage, 'card')
  const heroDims = mediaDims(venue.heroImage, 'card')
  const pack = mediaUrl(venue.functionsPack)

  return (
    <>
      <Header current="/functions" />
      <main id="main">
        <section>
          <div className="wrap">
            <h1>Functions at {venue.shortName}</h1>
            <p className="lede">
              Birthdays, work do&apos;s, engagements and wakes, at {venue.name}.
            </p>
            <p>
              {venues.map((v) => (
                <Link className={`chip${v.slug === venue.slug ? ' on' : ''}`} href={`/functions/${v.slug}`} key={v.id}>
                  {v.shortName}
                </Link>
              ))}
            </p>

            <div className="grid g2" style={{ marginTop: 26 }}>
              <div>
                {hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero}
                    // 520px slot. Offering 'hero' made a 2x screen take 1600, three
                    // times the slot, for a photograph beside an enquiry form.
                    srcSet={mediaSrcSet(venue.heroImage, ['thumbnail', 'small', 'card'])}
                    sizes="(min-width: 900px) 520px, 100vw"
                    alt={venue.heroImage?.alt ?? venue.name}
                    loading="lazy"
                    width={heroDims?.width}
                    height={heroDims?.height}
                    style={{ width: '100%', height: 'auto', borderRadius: 14 }}
                  />
                ) : null}
                {pack ? (
                  <p style={{ marginTop: 18 }}>
                    <a className="btn" href={pack} target="_blank" rel="noopener noreferrer">
                      Download the functions pack
                    </a>
                  </p>
                ) : packages.length ? null : (
                  <p className="note" style={{ marginTop: 18 }}>
                    Function details for {venue.shortName} are coming soon. Send an enquiry and the
                    team will come back to you.
                  </p>
                )}
              </div>

              <div className="card">
                <div className="pad">
                  <h2 style={{ fontSize: 20 }}>Enquire</h2>
                  <form action="/api/enquiry" method="post">
                    <input type="hidden" name="topic" value="Function or private hire" />
                    <input type="hidden" name="venue" value={venue.shortName} />
                    <label htmlFor="d">Date and headcount</label>
                    <input id="d" name="details" required />
                    <label htmlFor="c">Contact details</label>
                    <input id="c" name="email" type="email" required />
                    <button className="btn" type="submit" style={{ border: 0, cursor: 'pointer' }}>
                      Send enquiry
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {packages.length ? (
              <div style={{ marginTop: 40 }}>
                <h2>Spaces at {venue.shortName}</h2>
                <div className="grid g2">
                  {packages.map((pkg) => {
                    const img = mediaSize(pkg.image, 'small')
                    const dims = mediaDims(pkg.image, 'small')
                    const brochure = mediaUrl(pkg.brochure)
                    /* Capacity, seating and the price guide are optional in the
                       CMS, so the line is built from whichever were filled in
                       rather than printed with gaps. */
                    const specs = [
                      pkg.capacity ? `Up to ${pkg.capacity}` : null,
                      pkg.seating,
                      pkg.priceGuide,
                    ].filter(Boolean)
                    return (
                      <div className="card" key={pkg.id}>
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            srcSet={mediaSrcSet(pkg.image, ['thumbnail', 'small', 'card'])}
                            sizes="(min-width: 900px) 520px, 100vw"
                            alt={pkg.image?.alt ?? pkg.name}
                            loading="lazy"
                            width={dims?.width}
                            height={dims?.height}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        ) : null}
                        <div className="pad">
                          <h3 style={{ margin: '0 0 8px' }}>{pkg.name}</h3>
                          {specs.length ? <p className="note">{specs.join(' · ')}</p> : null}
                          <RichText value={pkg.description} />
                          {pkg.inclusions?.length ? (
                            <ul>
                              {pkg.inclusions.map((i) => (
                                <li key={i.item}>{i.item}</li>
                              ))}
                            </ul>
                          ) : null}
                          {brochure ? (
                            <p>
                              <a href={brochure} target="_blank" rel="noopener noreferrer">
                                Download the {pkg.name} pack
                              </a>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
