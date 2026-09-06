import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { gcsStorage } from '@payloadcms/storage-gcs'
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
import { Merch } from './collections/Merch'
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
  /**
   * The admin panel is the whole of this service, so it lives at the root.
   *
   * This subdomain serves nothing else — the only thing that used to be at /
   * was a redirect to /admin, which is a round trip to reach the one page
   * anybody comes here for. Payload's formatAdminURL treats '/' as a special
   * case and drops it from generated links, so every internal admin URL still
   * comes out right.
   *
   * The App Router folder has to move with it: the import map is resolved from
   * app/(payload)<adminRoute>, so the route group itself is now where
   * app/(payload)/admin used to be. Old /admin links are redirected in
   * next.config.ts rather than left to 404.
   */
  routes: { admin: '/' },
  collections: [Venues, Beers, TapLists, Events, Menus, FunctionPackages, Pages, Posts, Merch, Media, Users],
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
     * Media goes to object storage rather than the container filesystem, which
     * is ephemeral on Cloud Run.
     *
     * Production uses GCS, authenticating as the Cloud Run service account
     * through ADC, so there are no long-lived keys anywhere. Locally the same
     * uploads go to MinIO through the S3 adapter. Both emit direct object URLs
     * rather than proxying every image through this app, which was measurably
     * the largest-contentful-paint bottleneck when it did.
     */
    ...(process.env.GCS_BUCKET
      ? [
          gcsStorage({
            collections: {
              media: {
                disablePayloadAccessControl: true,
              },
            },
            bucket: process.env.GCS_BUCKET,
            options: {
              projectId: process.env.GCS_PROJECT_ID,
            },
          }),
        ]
      : [
          s3Storage({
            collections: {
              media: {
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
        ]),
  ],
})
