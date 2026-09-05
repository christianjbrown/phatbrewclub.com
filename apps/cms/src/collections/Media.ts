import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'
import { setCacheControl } from '../hooks/cacheControl'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  hooks: { afterChange: [setCacheControl] },
  access: { read: anyone, create: canManageOperational, update: canManageOperational, delete: canManageOperational },
  upload: {
    // Sizes are generated once on upload and served from object storage,
    // so the front end never ships a 3 MB photo to fill a 400px box.
    // WebP for every derivative. The can artwork arrives as PNG with an alpha
    // channel, where a 312x520 image was costing 202KB — larger than the
    // photographs beside it. WebP takes that to a fraction with no visible
    // difference at these sizes.
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
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
      { name: 'thumbnail', width: 400, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'can', width: 440, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    adminThumbnail: 'thumbnail',
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
