import type { CollectionConfig } from 'payload'
import { anyone, canManageOperational } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
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
    imageSizes: [
      // Portrait, because the can decals are 1200x1500 and a landscape crop
      // cuts the top and bottom off the artwork.
      { name: 'can', width: 440, height: 550, position: 'centre', formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'thumbnail', width: 400, height: 300, position: 'centre', formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'card', width: 800, height: 600, position: 'centre', formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1600, height: 900, position: 'centre', formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'square', width: 800, height: 800, position: 'centre', formatOptions: { format: 'webp', options: { quality: 80 } } },
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
