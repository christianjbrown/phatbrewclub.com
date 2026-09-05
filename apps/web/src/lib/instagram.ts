/**
 * Recent posts from the brewery's Instagram.
 *
 * Instagram has no public read for a profile's media: the Graph API needs a
 * long-lived access token tied to their professional account. Without one this
 * returns nothing and the feed does not render, which is why the token is the
 * only switch.
 *
 * Cached for an hour. A brewery posts a few times a week, and hammering
 * someone's API once per page view to show eight squares is not a trade worth
 * making. A failure returns empty rather than throwing: a missing Instagram
 * grid is not a reason to fail the page around it.
 */
export type InstagramPost = {
  id: string
  permalink: string
  thumbnail: string
  caption?: string
}

type ApiPost = {
  id: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  caption?: string
}

export const getInstagramPosts = async (limit = 8): Promise<InstagramPost[]> => {
  const token = process.env.INSTAGRAM_TOKEN?.trim()
  if (!token) return []

  const fields = 'id,permalink,media_type,media_url,thumbnail_url,caption'
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600, tags: ['instagram'] } })
    if (!res.ok) return []
    const json = (await res.json()) as { data?: ApiPost[] }
    return (json.data ?? [])
      .map((p) => ({
        id: p.id,
        permalink: p.permalink,
        // Videos expose a poster frame; images only have media_url.
        thumbnail: p.media_type === 'VIDEO' ? (p.thumbnail_url ?? '') : (p.media_url ?? ''),
        caption: p.caption,
      }))
      .filter((p) => p.thumbnail)
  } catch {
    return []
  }
}
