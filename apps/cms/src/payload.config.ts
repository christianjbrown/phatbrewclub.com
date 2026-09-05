import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Beers } from './collections/Beers'
import { Events } from './collections/Events'
import { FunctionPackages } from './collections/FunctionPackages'
import { Media } from './collections/Media'
import { Menus } from './collections/Menus'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { TapLists } from './collections/TapLists'
import { Users } from './collections/Users'
import { Venues } from './collections/Venues'
import { Settings } from './globals/Settings'
import { commercePlugins } from './commerce'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— Phat Brew Club',
    },
  },
  collections: [Venues, Beers, TapLists, Events, Menus, FunctionPackages, Pages, Posts, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  sharp,
  cors: [process.env.PAYLOAD_PUBLIC_SITE_URL || 'http://localhost:3000'].filter(Boolean),
  csrf: [process.env.PAYLOAD_PUBLIC_SITE_URL || 'http://localhost:3000'].filter(Boolean),
  plugins: [
    // Empty unless COMMERCE_ENABLED=true. See src/commerce.ts.
    ...commercePlugins(),
    /**
     * Media goes to object storage rather than the container filesystem.
     * Locally that is MinIO; in production the same code path points at a
     * GCS bucket through its S3-compatible API, so nothing changes but env.
     */
    s3Storage({
      collections: {
        media: {
          /**
           * Serve media straight from object storage instead of proxying every
           * request through this app. Proxying meant each image travelled
           * browser -> ingress -> CMS -> MinIO and back, which was measurably
           * the largest-contentful-paint bottleneck. In production the same
           * setting points at the GCS bucket behind a CDN.
           *
           * The trade-off is that objects are public: fine for venue photos and
           * can artwork, and the bucket is already anonymous-read. Anything
           * genuinely private would need this left on.
           */
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const base = (process.env.MEDIA_PUBLIC_URL ?? '').replace(/\/$/, '')
            const bucket = process.env.S3_BUCKET ?? 'phatbrew-media'
            const key = [prefix, filename].filter(Boolean).join('/')
            return base ? `${base}/${bucket}/${key}` : `/${bucket}/${key}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'phatbrew-media',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
