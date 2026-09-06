import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { ogImage, pageMeta } from '@/lib/seo'
import { BeerCard, EventCard, OpenBadge, TapRows } from '@/components/Bits'
import { RichText } from '@/components/RichText'
import {
  getBeers, getEvents, getPage, getTapList, getVenues, mediaDims, mediaSize, mediaSrcSet,
} from '@/lib/cms'
import type { Block } from '@/lib/types'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  // A CMS page's own SEO image if set, else the first image in its layout —
  // usually the hero block, which is the picture the page leads with.
  // The first image in the page's layout — usually the hero block, which is
  // the picture the page leads with.
  const firstImage =
    (page.layout ?? []).map((b) => ('image' in b ? b.image : null)).find(Boolean) ?? null
  return pageMeta({
    title: page.seo?.title || page.title,
    description: page.seo?.description || undefined,
    path: `/${page.slug}`,
    image: ogImage(firstImage, page.title),
  })
}

const renderBlock = async (block: Block, key: string) => {
  switch (block.blockType) {
    case 'hero': {
      const img = mediaSize(block.image, 'hero')
      // Shown as a real image beside the copy rather than dimmed behind it.
      // The About page photograph is the crew who started the brewery; it is
      // the point of the page, not wallpaper for the headline.
      return (
        <section key={key}>
          <div className="wrap">
            <div className={img ? 'page-hero' : undefined}>
              <div>
                {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
                <h1>{block.heading}</h1>
                {block.lede ? <p className="lede">{block.lede}</p> : null}
                {(block.actions ?? []).map((a, i) => (
                  <a className={i === 0 ? 'btn' : 'btn btn-o'} href={a.url} key={a.url}>{a.label}</a>
                ))}
              </div>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="page-hero-img"
                  src={img}
                  srcSet={mediaSrcSet(block.image, ['small', 'card', 'hero'])}
                  sizes="(min-width: 900px) 52vw, 92vw"
                  alt={block.image?.alt ?? ''}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : null}
            </div>
          </div>
        </section>
      )
    }
    case 'richText':
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <RichText value={block.body} />
          </div>
        </section>
      )
    case 'venueCards': {
      const venues = block.venues ?? []
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <div className="grid g2">
              {venues.map((v) => (
                <article className="card" key={v.id}>
                  <div className="pad">
                    <h3>{v.name}</h3>
                    <OpenBadge venue={v} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )
    }
    case 'beerGrid': {
      const beers = await getBeers(block.filterBy && block.filterBy !== 'all' ? block.filterBy : undefined)
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <div className="grid g4">
              {beers.slice(0, block.limit ?? 12).map((b) => <BeerCard beer={b} key={b.id} />)}
            </div>
          </div>
        </section>
      )
    }
    case 'eventList': {
      const events = await getEvents(50)
      const now = new Date()
      const filtered = events
        .filter((e) => new Date(e.startsAt) >= now)
        .filter((e) => !block.venue || (e.venues ?? []).some((v) => v.id === block.venue?.id))
        .slice(0, block.limit ?? 4)
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <div className="grid" style={{ gap: 14 }}>
              {filtered.map((e) => <EventCard event={e} key={e.id} />)}
            </div>
          </div>
        </section>
      )
    }
    case 'tapList': {
      if (!block.venue) return null
      const list = await getTapList(block.venue.id)
      if (!list) return null
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <TapRows list={list} />
          </div>
        </section>
      )
    }
    case 'faq':
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            {/* Shown open, not folded away. An accordion earns its keep when
                there are twenty long answers and somebody is hunting for one;
                with five one-line answers it just makes people click five
                times to read half a screen of text. */}
            <dl className="faq">
              {(block.questions ?? []).map((q) => (
                <div key={q.question}>
                  <dt>{q.question}</dt>
                  <dd><RichText value={q.answer} /></dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )
    case 'awards':
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <div style={{ maxWidth: 860 }}>
              {(block.entries ?? []).map((a, i) => (
                <div className="award" key={`${a.year}-${i}`}>
                  <strong>{a.year}</strong>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{a.body}</p>
                    {a.detail ? <p style={{ margin: '2px 0 0', fontSize: 15 }}>{a.detail}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'gallery':
      return (
        <section key={key}>
          <div className="wrap">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <div className="grid g3">
              {(block.images ?? []).map((img) => {
                const src = mediaSize(img, 'card')
                const d = mediaDims(img, 'card')
                if (!src) return null
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={src}
                    srcSet={mediaSrcSet(img, ['thumbnail', 'small', 'card'])}
                    sizes="(min-width: 900px) 360px, 90vw"
                    alt={img.alt ?? ''}
                    loading="lazy"
                    width={d?.width}
                    height={d?.height}
                    style={{ borderRadius: 14, width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )
    case 'quote':
      return (
        <section key={key}>
          <div className="wrap">
            <blockquote className="pull">
              <p>{block.quote}</p>
              {block.attribution ? <cite>{block.attribution}</cite> : null}
            </blockquote>
          </div>
        </section>
      )
    default:
      return null
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()
  const venues = await getVenues()
  const blocks = await Promise.all((page.layout ?? []).map((b, i) => renderBlock(b, `b${i}`)))

  return (
    <>
      <Header current={`/${slug}`} />
      <main id="main">
        {blocks}
      </main>
      <Footer venues={venues} />
    </>
  )
}
