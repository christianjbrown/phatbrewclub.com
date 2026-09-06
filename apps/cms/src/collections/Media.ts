import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'
import { setCacheControl } from '../hooks/cacheControl'
import { revalidateMedia } from '../hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  hooks: { afterChange: [setCacheControl, revalidateMedia] },
  access: { read: anyone, create: canManageOperational, update: canManageOperational, delete: canManageOperational },
  upload: {
    /**
     * The master is stored exactly as uploaded. Only derivatives are converted.
     *
     * A top-level formatOptions here re-encoded the upload itself to WebP: the
     * pink beanie master was a 2048x2048 WebP re-encode of a JPEG. Resolution
     * survived, but every future derivative was then being generated from a
     * lossy intermediate, and regenerating at a higher quality could never
     * recover what the first re-encode threw away.
     *
     * Masters are never served — every surface asks for a derivative — so the
     * only cost of keeping them untouched is storage, which is pennies.
     */
    /**
     * Width only, so every derivative is a pure resize.
     *
     * These used to give a width AND a height with position 'centre', which
     * makes sharp crop to fit. That quietly destroyed content: the event and
     * news artwork is portrait — the Hillarys quiz poster is 989x1400 — and
     * squaring it into 800x600 threw away the half of the poster carrying the
     * day, the time and the host. A thumbnail may be smaller than the original;
     * it may not say less than the original.
     *
     * Keeping the source ratio also means every candidate in a srcset now
     * matches, so mediaSrcSet no longer has to discard mismatched sizes.
     */
    imageSizes: [
      // A ladder, not a set of named crops. Since the sizes stopped cropping,
      // "can" at 440 was doing nothing that 400 did not, so it is gone.
      //
      // The bottom rung matters: with 400 as the smallest, the menu thumbnails
      // shipped 400px into a 112px slot — about thirteen times the pixels the
      // slot can show, and 1.2MB across one page. 240 covers a 112px slot at
      // 2x; 600 covers the 300px shop cards, which were taking 800.
      { name: 'micro', width: 240, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'thumbnail', width: 400, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'small', width: 600, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    /**
     * Point the admin at the stored file, not at Payload's own file route.
     *
     * `disablePayloadAccessControl` makes the storage plugin hand out direct
     * bucket URLs, which is what keeps public images on GCS with a year-long
     * cache. The side effect is that /api/media/file/:name is left on Payload's
     * default handler, which looks for the file on local disk — and in a
     * container there is no local disk, so every thumbnail in the admin was a
     * 500 and the media library rendered empty boxes.
     *
     * Naming a size here ("thumbnail") makes the admin build that route URL.
     * Returning the size's own URL sends it to the bucket instead.
     */
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as Record<string, { url?: string }> | undefined
      return sizes?.thumbnail?.url ?? sizes?.micro?.url ?? (doc?.url as string) ?? null
    },
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for someone who cannot see it. Required — the old site had images with no description at all.',
      },
    },
    { name: 'credit', type: 'text' },
  ],
}
