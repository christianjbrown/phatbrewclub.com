import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { BeerCard, EventCard, OpenBadge, TapRows } from '@/components/Bits'
import { RichText } from '@/components/RichText'
import {
  getBeers, getEvents, getPage, getTapList, getVenues, mediaSize,
} from '@/lib/payload'
import type { Block } from '@/lib/types'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || undefined,
  }
}

const renderBlock = async (block: Block, key: string) => {
  switch (block.blockType) {
    case 'hero': {
      const img = mediaSize(block.image, 'hero')
      return (
        <div className="hero" key={key} style={{ minHeight: 380 }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-img" src={img} alt="" fetchPriority="high" decoding="async" />
          ) : null}
          <div className="wrap">
            {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
            <h1>{block.heading}</h1>
            {block.lede ? <p className="lede">{block.lede}</p> : null}
            {(block.actions ?? []).map((a, i) => (
              <a className={i === 0 ? 'btn' : 'btn btn-o'} href={a.url} key={a.url}>{a.label}</a>
            ))}
          </div>
        </div>
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
            <div style={{ maxWidth: 760 }}>
              {(block.questions ?? []).map((q) => (
                <details key={q.question} style={{ borderBottom: '1px solid #222', padding: '16px 0' }}>
                  <summary style={{ font: '700 18px Rubik', cursor: 'pointer' }}>{q.question}</summary>
                  <div style={{ marginTop: 12 }}><RichText value={q.answer} /></div>
                </details>
              ))}
            </div>
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
      <Header />
      <main id="main">
        {blocks}
      </main>
      <Footer venues={venues} />
    </>
  )
}
