import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Tell the website a publish happened.
 *
 * The website tags every CMS read and exposes /api/revalidate to clear those
 * tags. That endpoint has existed since the beginning and **nothing has ever
 * called it** — there was no hook on this side, so an edit took up to the full
 * 300-second cache window to appear, and the "changes are live immediately"
 * behaviour the endpoint was written for never actually happened.
 *
 * Failures are logged and swallowed. A stale page for five minutes is a much
 * smaller problem than a save that appears to fail because the website was
 * redeploying, and the cache window is the backstop either way.
 */
const ping = async (collection: string): Promise<void> => {
  const base = process.env.WEB_INTERNAL_URL ?? process.env.PAYLOAD_PUBLIC_SITE_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!base || !secret) return

  const url = `${base.replace(/\/$/, '')}/api/revalidate`
  const send = async (timeout: number): Promise<Response> =>
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ collection }),
      signal: AbortSignal.timeout(timeout),
    })

  /**
   * Two attempts, because the website scales to zero.
   *
   * A single 2-second budget looked like a kindness to whoever was waiting on
   * the save, and was actually a bug: a cold front end takes about 3.6 seconds
   * to answer, so the very first revalidation after any quiet period always
   * timed out — which is precisely when the cache most needed clearing. It
   * showed up in the hourly sync's logs as "operation was aborted due to
   * timeout", every time the site had been idle.
   *
   * The first attempt is short because a warm instance answers in under half a
   * second, and that is the common case. When it does time out, that request
   * has already started the container, so the second attempt lands on an
   * instance that is on its way up rather than paying the cold start again.
   * Worst case is a little over six seconds, and only when nobody has visited
   * the site recently.
   */
  try {
    const first = await send(2000)
    if (!first.ok) console.warn(`revalidate ${collection}: ${first.status}`)
    return
  } catch {
    // Fall through to the retry.
  }

  try {
    const second = await send(4000)
    if (!second.ok) console.warn(`revalidate ${collection}: ${second.status} on retry`)
  } catch (err) {
    console.warn(`revalidate ${collection}:`, err instanceof Error ? err.message : err)
  }
}

/** For a collection, where `tag` is the cache tag the website uses for it. */
export const revalidateCollection = (
  tag: string,
): { afterChange: CollectionAfterChangeHook[]; afterDelete: CollectionAfterDeleteHook[] } => ({
  afterChange: [
    async ({ doc }) => {
      await ping(tag)
      return doc
    },
  ],
  afterDelete: [
    async ({ doc }) => {
      await ping(tag)
      return doc
    },
  ],
})

/** For the settings global, which has no delete. */
export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  async ({ doc }) => {
    await ping(tag)
    return doc
  }

/**
 * Media is the gap in this scheme, on purpose.
 *
 * Replacing an image changes no document, so nothing else here fires and the
 * page still holds the old URL. Media therefore clears every tag rather than
 * one — it is rare, and a wrong image is more visible than a slow refresh.
 */
export const revalidateMedia: CollectionAfterChangeHook = async ({ doc }) => {
  await ping('all')
  return doc
}
