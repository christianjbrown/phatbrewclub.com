/**
 * Recent posts from the brewery's Instagram.
 *
 * Two possible sources, in order of preference.
 *
 * 1. INSTAGRAM_FEED_URL — the brewery's own site already publishes its feed.
 *    Square Online holds the access token server-side and proxies the result at
 *    an unauthenticated endpoint on phatbrewclub.com, which is how their own
 *    Instagram page renders without a token in the browser. Their data, their
 *    domain, no credential to obtain or rotate.
 *
 * 2. INSTAGRAM_TOKEN — the Graph API directly, for when the brewery issues a
 *    long-lived token of their own. This is the one that survives them leaving
 *    Square, so it is the better answer eventually.
 *
 * Neither set means the grid renders nothing, rather than a broken row.
 *
 * The caveat worth stating plainly: option 1 is an undocumented endpoint on
 * someone else's site, the same class of dependency as the me&u sync. It is
 * read-only, cached for an hour, and fails to an empty grid — but it should be
 * replaced by a real token before this is anything other than a demo, and the
 * feed carries `expired_token` for exactly the day their side stops working.
 */
export type InstagramPost = {
  id: string
  permalink: string
  thumbnail: string
  caption?: string
}

type ProxyAsset = {
  id: string
  link: string
  hidden?: boolean
  caption?: string
  images?: Record<string, { url?: string } | undefined>
}

type ProxyFeed = { username?: string; expired_token?: boolean; assets?: ProxyAsset[] }

type GraphPost = {
  id: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  caption?: string
}

const CACHE: RequestInit = { next: { revalidate: 3600, tags: ['instagram'] } }

const fromProxy = async (url: string, limit: number): Promise<InstagramPost[]> => {
  const res = await fetch(url, CACHE)
  if (!res.ok) return []
  const feed = (await res.json()) as ProxyFeed

  // Their token, not ours. When it lapses the endpoint keeps answering and the
  // assets go stale or empty, so this is the signal to stop trusting it.
  if (feed.expired_token) {
    console.warn('[instagram] upstream reports an expired token; rendering nothing')
    return []
  }

  return (feed.assets ?? [])
    .filter((a) => !a.hidden)
    .slice(0, limit)
    .map((a) => ({
      id: a.id,
      permalink: a.link,
      // All three "resolutions" come back as the same file, so there is nothing
      // to choose between them.
      thumbnail:
        a.images?.medium_resolution?.url ??
        a.images?.standard_resolution?.url ??
        a.images?.thumbnail?.url ??
        '',
      caption: a.caption,
    }))
    .filter((p) => p.thumbnail && p.permalink)
}

const fromGraph = async (token: string, limit: number): Promise<InstagramPost[]> => {
  const fields = 'id,permalink,media_type,media_url,thumbnail_url,caption'
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return []
  const json = (await res.json()) as { data?: GraphPost[] }
  return (json.data ?? [])
    .map((p) => ({
      id: p.id,
      permalink: p.permalink,
      // Videos expose a poster frame; images only have media_url.
      thumbnail: p.media_type === 'VIDEO' ? (p.thumbnail_url ?? '') : (p.media_url ?? ''),
      caption: p.caption,
    }))
    .filter((p) => p.thumbnail)
}

export const getInstagramPosts = async (limit = 8): Promise<InstagramPost[]> => {
  const proxy = process.env.INSTAGRAM_FEED_URL?.trim()
  const token = process.env.INSTAGRAM_TOKEN?.trim()

  try {
    if (proxy) return await fromProxy(proxy, limit)
    if (token) return await fromGraph(token, limit)
  } catch (err) {
    // A missing Instagram grid is not a reason to fail the page around it.
    console.warn(`[instagram] ${err instanceof Error ? err.message : String(err)}`)
  }
  return []
}
