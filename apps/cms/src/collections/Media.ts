import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: canManageOperational, update: canManageOperational, delete: canManageOperational },
  upload: {
    // Sizes are generated once on upload and served from object storage,
    // so the front end never ships a 3 MB photo to fill a 400px box.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      // 1600 not 1920: Payload does not upscale, so a 1920 variant is silently
      // never generated for sources narrower than that, and callers fall back
      // to the full-size original without any warning.
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
      { name: 'square', width: 800, height: 800, position: 'centre' },
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
