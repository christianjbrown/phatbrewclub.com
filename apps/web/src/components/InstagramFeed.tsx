import { getInstagramPosts } from '@/lib/instagram'

/**
 * The brewery's Instagram grid, mirroring what their current site shows.
 *
 * Their site does this through Square Online's built-in integration, which
 * fetches the feed server-side from a connected account. There is no keyless
 * equivalent: Instagram's API needs an access token tied to their professional
 * account, so this renders nothing until INSTAGRAM_TOKEN is set. Empty rather
 * than a broken grid, on the same principle as the newsletter form.
 *
 * Images are served from Instagram's CDN rather than resized by us. That is the
 * one place on the site not going through our own pipeline; if it matters once
 * this is live, the fix is to sync posts into Media the way the me&u menu
 * photos are, and serve our own derivatives.
 */
export const InstagramFeed = async ({ handle }: { handle?: string | null }) => {
  const posts = await getInstagramPosts(8)
  if (posts.length === 0) return null

  return (
    <section>
      <div className="wrap">
        <h2>From the gram</h2>
        <ul className="ig-grid">
          {posts.map((p) => (
            <li key={p.id}>
              <a href={p.permalink} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumbnail}
                  alt={p.caption ? p.caption.slice(0, 120) : 'Phat Brew Club on Instagram'}
                  loading="lazy"
                  width={320}
                  height={320}
                />
              </a>
            </li>
          ))}
        </ul>
        {handle ? (
          <p style={{ marginTop: 16 }}>
            <a className="btn btn-o" href={handle} target="_blank" rel="noopener noreferrer">
              See more on Instagram
            </a>
          </p>
        ) : null}
      </div>
    </section>
  )
}
