import type { CollectionAfterChangeHook } from 'payload'

/**
 * Give uploaded objects a long Cache-Control.
 *
 * Google Cloud Storage stamps `public, max-age=3600` on anything uploaded
 * without an explicit value, and the storage adapter exposes no way to set one.
 * An hour is close to useless here: the derivatives are immutable — the
 * filename carries the dimensions, and Payload gives a replacement a new name
 * rather than overwriting — so every visitor was re-downloading every image on
 * the page once an hour.
 *
 * Patching metadata after the fact rather than at upload is not elegant, but it
 * is the only seam the adapter leaves. Failure is logged and swallowed: a short
 * cache is a performance problem, not a reason to fail the upload and lose the
 * file the user just chose.
 */
const ONE_YEAR = 'public, max-age=31536000, immutable'

export const setCacheControl: CollectionAfterChangeHook = async ({ doc, req }) => {
  const bucketName = process.env.GCS_BUCKET
  if (!bucketName) return doc

  const names = [
    doc.filename,
    ...Object.values((doc.sizes ?? {}) as Record<string, { filename?: string | null }>)
      .map((s) => s?.filename)
      .filter(Boolean),
  ].filter((n): n is string => typeof n === 'string' && n.length > 0)
  if (names.length === 0) return doc

  try {
    const { Storage } = await import('@google-cloud/storage')
    const bucket = new Storage({ projectId: process.env.GCS_PROJECT_ID }).bucket(bucketName)
    await Promise.all(
      names.map(async (name) => {
        const file = bucket.file(name)
        const [exists] = await file.exists()
        if (exists) await file.setMetadata({ cacheControl: ONE_YEAR })
      }),
    )
  } catch (err) {
    req.payload.logger.warn(
      `cache-control not set for ${doc.filename}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  return doc
}
