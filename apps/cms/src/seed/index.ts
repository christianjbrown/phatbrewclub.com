import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config.js'
import { BEERS, EVENTS, VENUES } from './data.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.resolve(dirname, '../../../../mocks/img')

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@phatbrewclub.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'phatbrew-local-dev'

const run = async () => {
  const payload = await getPayload({ config })

  // 1. Admin user (idempotent)
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Local admin', roles: ['admin'] },
    })
    console.log(`  user      ${ADMIN_EMAIL}`)
  } else {
    console.log(`  user      ${ADMIN_EMAIL} (exists)`)
  }

  // 2. Media — uploads go through the S3 adapter into MinIO
  const media = new Map<string, number | string>()
  const upload = async (file: string, alt: string) => {
    if (media.has(file)) return media.get(file)!
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
    })
    if (found.totalDocs > 0) {
      media.set(file, found.docs[0].id)
      return found.docs[0].id
    }
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.join(IMG, file),
    })
    media.set(file, doc.id)
    return doc.id
  }

  // 3. Venues
  const venueIds = new Map<string, number | string>()
  for (const v of VENUES) {
    const heroId = await upload(v.hero, `${v.name} venue photograph`)
    const data = {
      name: v.name,
      shortName: v.shortName,
      slug: v.slug,
      address: {
        street: v.street, suburb: v.suburb, state: 'WA',
        postcode: v.postcode, latitude: v.latitude, longitude: v.longitude,
      },
      transportNote: v.transportNote,
      capacity: v.capacity,
      tapCount: 20,
      amenities: v.amenities,
      meanduSlug: v.meanduSlug,
      heroImage: heroId,
      openingHours: v.hours.map(([day, opens, closes]) => ({ day, opens, closes, closed: false })),
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'venues', where: { slug: { equals: v.slug } }, limit: 1 })
    const doc = found.totalDocs
      ? await payload.update({ collection: 'venues', id: found.docs[0].id, data })
      : await payload.create({ collection: 'venues', data })
    venueIds.set(v.slug, doc.id)
    console.log(`  venue     ${v.name}`)
  }

  // 4. Beers
  const beerIds = new Map<string, number | string>()
  for (const [name, style, abv, ibu, category, decal, description] of BEERS) {
    const artId = await upload(decal, `${name} can artwork`)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const data = {
      name, slug, style, abv, ibu, category, description,
      canArtwork: artId,
      availableAt: [...venueIds.values()],
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'beers', where: { slug: { equals: slug } }, limit: 1 })
    const doc = found.totalDocs
      ? await payload.update({ collection: 'beers', id: found.docs[0].id, data })
      : await payload.create({ collection: 'beers', data })
    beerIds.set(name, doc.id)
  }
  console.log(`  beers     ${BEERS.length}`)

  // 5. Tap lists — first six beers per venue, with one keg blown at West Perth
  for (const [slug, venueId] of venueIds) {
    const taps = BEERS.slice(0, 6).map(([name], i) => ({
      tapNumber: i + 1,
      beer: beerIds.get(name)!,
      kegBlown: slug === 'west-perth' && i === 5,
    }))
    const found = await payload.find({ collection: 'tap-lists', where: { venue: { equals: venueId } }, limit: 1 })
    const data = { venue: venueId, taps, source: 'manual' as const }
    if (found.totalDocs) await payload.update({ collection: 'tap-lists', id: found.docs[0].id, data })
    else await payload.create({ collection: 'tap-lists', data })
    console.log(`  tap list  ${slug}`)
  }

  // 6. Events, dated relative to today so the seed never looks stale.
  //
  // Times in the seed data are Perth wall-clock times, because that is what the
  // venue means by "6:30pm". Perth is UTC+8 with no daylight saving, so the
  // instant is built explicitly rather than via setHours(), which would use
  // whatever timezone this script happens to run in.
  const PERTH_OFFSET_HOURS = 8
  const perthParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(new Date())
  const part = (t: string) => perthParts.find((p) => p.type === t)!.value
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayPerth = { y: Number(part('year')), m: Number(part('month')), d: Number(part('day')) }
  const todayDow = WEEKDAYS.indexOf(part('weekday'))

  for (const [title, weekday, hour, recurrence, slugs, category, isFree, price] of EVENTS) {
    const delta = (weekday - todayDow + 7) % 7 || 7
    const startsAt = new Date(
      Date.UTC(
        todayPerth.y,
        todayPerth.m - 1,
        todayPerth.d + delta,
        Math.floor(hour) - PERTH_OFFSET_HOURS,
        (hour % 1) * 60,
        0,
        0,
      ),
    )
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const data = {
      title, slug,
      startsAt: startsAt.toISOString(),
      recurrence, category, isFree, price,
      venues: slugs.map((s) => venueIds.get(s)!),
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'events', where: { slug: { equals: slug } }, limit: 1 })
    if (found.totalDocs) await payload.update({ collection: 'events', id: found.docs[0].id, data })
    else await payload.create({ collection: 'events', data })
  }
  console.log(`  events    ${EVENTS.length}`)

  // 7. Settings
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      bookingLabel: 'Book a table',
      mainNav: [
        { label: 'Venues', url: '/venues' },
        { label: 'Beers', url: '/beers' },
        { label: "What's on", url: '/whats-on' },
        { label: 'Functions', url: '/functions' },
        { label: 'Shop', url: '/shop' },
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' },
      ],
      defaultTitle: 'Phat Brew Club',
      defaultDescription:
        'Independent Perth brewery with two venues: Phat HQ in West Perth and The Trophy Room at Hillarys.',
    },
  })
  console.log('  settings  saved')

  console.log('\nSeed complete.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
