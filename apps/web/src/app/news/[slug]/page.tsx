import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Footer, Header } from '@/components/Chrome'
import { RichText } from '@/components/RichText'
import { getPost, getVenues, mediaDims, mediaSize, mediaSrcSet } from '@/lib/payload'
import { formatDate } from '@/lib/time'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const venues = await getVenues()
  const img = mediaSize(post.heroImage, 'hero')
  const dims = mediaDims(post.heroImage, 'hero')

  return (
    <>
      <Header current="/news" />
      <main id="main">
        <section>
          <div className="wrap" style={{ maxWidth: 800 }}>
            {post.publishedAt ? (
              <p className="eyebrow">
                {formatDate(post.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : null}
            <h1>{post.title}</h1>
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                srcSet={mediaSrcSet(post.heroImage, ['card', 'hero'])}
                sizes="(min-width: 900px) 860px, 100vw"
                alt={post.heroImage?.alt ?? ''}
                width={dims?.width}
                height={dims?.height}
                style={{ borderRadius: 14, margin: '20px 0', width: '100%', height: 'auto' }}
              />
            ) : null}
            <RichText value={post.body} />
          </div>
        </section>
      </main>
      <Footer venues={venues} />
    </>
  )
}
