import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config.js'
import { BEERS, EVENTS, VENUES } from './data.js'
import { richText } from './lexical.js'
import { AWARDS, POSTS } from './content.js'
import BEER_PRODUCTS from './beer-products.json' with { type: 'json' }
import NEWS from './news.json' with { type: 'json' }
import UNTAPPD_LINKS from './untappd-links.json' with { type: 'json' }

const dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.resolve(dirname, '../../../../mocks/img')

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@phatbrewclub.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'phatbrew-local-dev'

/**
 * These defaults are fine on a laptop and dangerous anywhere else.
 *
 * The first production seed created admin@phatbrewclub.local with the password
 * below on an internet-facing admin panel, because neither variable was set on
 * the Cloud Run job. Refuse to do that again: outside local development the
 * credentials must be supplied explicitly.
 */
const usingDefaults = !process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD
const isLocal =
  (process.env.DATABASE_URL ?? '').includes('localhost') &&
  !(process.env.DATABASE_URL ?? '').includes('/cloudsql/')

if (usingDefaults && !isLocal) {
  console.error(
    'Refusing to seed a default admin outside local development. ' +
      'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, or create the user by hand.',
  )
  process.exit(1)
}

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

  /**
   * Regenerate stale derivatives.
   *
   * Media is looked up by filename and reused, which makes the seed idempotent
   * but also means a change to the image pipeline never reaches files that are
   * already uploaded. When the derivatives moved to WebP, production carried on
   * serving the PNGs generated under the old config: eighteen 400x300 thumbs
   * for 3.2MB on /beers alone.
   *
   * Deleting through Payload rather than truncating the table is what removes
   * the objects from storage and nulls the references. Everything below
   * re-attaches media by filename, so the relationships come back.
   *
   * Only stale documents are deleted, which matters because the job has a 900s
   * timeout and two retries: a blanket purge that ran out of time would purge
   * again on the retry and never converge. Regenerated files are already WebP,
   * so a resumed run skips them and finishes the remainder.
   */
  if (process.env.SEED_PURGE_MEDIA === 'true') {
    const all = await payload.find({ collection: 'media', limit: 0, pagination: false })
    const isStale = (doc: { mimeType?: string | null; sizes?: Record<string, { url?: string | null }> }) => {
      // PDFs have no derivatives to regenerate.
      if (!doc.mimeType?.startsWith('image/')) return false
      const generated = Object.values(doc.sizes ?? {}).filter((v) => v?.url)
      // Nothing generated at all, or generated in the old format.
      if (generated.length === 0) return true
      return generated.some((v) => !v.url!.endsWith('.webp'))
    }
    let purged = 0
    for (const doc of all.docs) {
      if (!isStale(doc as never)) continue
      await payload.delete({ collection: 'media', id: doc.id })
      purged++
    }
    console.log(`  purged    ${purged} stale of ${all.docs.length} media documents`)
  }

  // 2. Media — uploads go through the S3 adapter into MinIO
  const media = new Map<string, number | string>()
  const upload = async (file: string, alt: string) => {
    if (media.has(file)) return media.get(file)!
    // Artwork lives outside the container image when this runs as a k8s Job.
    // Records are still worth creating without it, so a missing file is not fatal.
    if (!existsSync(path.join(IMG, file))) {
      console.log(`  media     ${file} not present, creating record without artwork`)
      return undefined
    }
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
      bookingUrl: v.bookingUrl,
      hoursLabel: v.hoursLabel,
      publicHolidayNote: v.publicHolidayNote,
      faqs: (v.faqs ?? []).map(([question, answer]) => ({ question, answer })),
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

  // 4b. Enrich beers with the data that only existed on the shop's product
  //     pages: real tasting descriptions, allergen declarations, cube prices
  //     and the product photography.
  let enriched = 0
  for (const bp of BEER_PRODUCTS as {
    beerSlug: string; price: number | null; packSize: string | null
    allergens: string[]; description: string | null; shopUrl: string; images: string[]
  }[]) {
    const found = await payload.find({ collection: 'beers', where: { slug: { equals: bp.beerSlug } }, limit: 1 })
    if (!found.totalDocs) continue
    const gallery = (
      await Promise.all(bp.images.map((f, i) => upload(f, `${bp.beerSlug} product photograph ${i + 1}`)))
    ).filter(Boolean)
    await payload.update({
      collection: 'beers',
      id: found.docs[0].id,
      data: {
        ...(bp.description ? { description: bp.description } : {}),
        ...(bp.price ? { price: bp.price } : {}),
        ...(bp.packSize ? { packSize: bp.packSize } : {}),
        ...(bp.allergens.length ? { allergens: bp.allergens } : {}),
        shopUrl: bp.shopUrl,
        gallery,
      } as never,
    })
    enriched++
  }
  console.log(`  enriched  ${enriched} beers with product data`)

  // 4c. Link each beer to its Untappd page where one exists. Links only —
  //     no descriptions, ratings or other content is taken from Untappd.
  //     Eleven of the eighteen have no Untappd page and simply get no link.
  let linked = 0
  for (const link of UNTAPPD_LINKS as { slug: string; untappdUrl: string }[]) {
    const found = await payload.find({ collection: 'beers', where: { slug: { equals: link.slug } }, limit: 1 })
    if (!found.totalDocs) continue
    await payload.update({
      collection: 'beers',
      id: found.docs[0]!.id,
      data: { untappdUrl: link.untappdUrl } as never,
    })
    linked++
  }
  console.log(`  untappd   ${linked} beers linked`)

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

  for (const [title, weekday, hour, recurrence, slugs, category, isFree, price, description] of EVENTS) {
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
    // Two venues run a steak night on different days, so the slug has to carry
    // the venue or the second one silently overwrites the first.
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const slug = slugs.length === 1 ? `${base}-${slugs[0]}` : base
    // Give the recurring specials and quiz the brewery's own promo graphics.
    const artFor = /quiz/i.test(title)
      ? 'news-quiz-night.jpg'
      : slugs.includes('hillarys') && !slugs.includes('west-perth')
        ? 'news-hillarys-specials.jpg'
        : 'news-west-perth-specials.jpg'
    const heroImage = await upload(artFor, `${title} at Phat Brew Club`)

    const data = {
      title, slug,
      startsAt: startsAt.toISOString(),
      recurrence, category, isFree, price,
      ...(heroImage ? { heroImage } : {}),
      body: description ? richText(description) : undefined,
      venues: slugs.map((s) => venueIds.get(s)!),
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'events', where: { slug: { equals: slug } }, limit: 1 })
    if (found.totalDocs) await payload.update({ collection: 'events', id: found.docs[0].id, data })
    else await payload.create({ collection: 'events', data })
  }
  /**
   * Reconcile: remove seeded events that are no longer in the fixture set.
   *
   * Without this, changing a slug scheme orphans the old records and the site
   * shows both — which is exactly what happened when event slugs gained a venue
   * suffix and "Mondo's Steak Night" appeared twice.
   *
   * This deletes any event not in the fixture list, so it is a FIXTURE LOADER
   * for local and preview environments only. Never point it at an environment
   * where staff have created real events.
   */
  const expected = new Set(
    EVENTS.map(([title, , , , slugs]) => {
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      return slugs.length === 1 ? `${base}-${slugs[0]}` : base
    }),
  )
  const allEvents = await payload.find({ collection: 'events', limit: 200, depth: 0 })
  let pruned = 0
  for (const doc of allEvents.docs) {
    const slug = (doc as { slug?: string }).slug
    if (slug && !expected.has(slug)) {
      await payload.delete({ collection: 'events', id: doc.id })
      pruned++
    }
  }
  console.log(`  events    ${EVENTS.length}${pruned ? ` (${pruned} stale removed)` : ''}`)

  // 7a. News posts, using the brewery's own copy extracted from their events
  //     page rather than anything written here.
  for (const post of NEWS as { title: string; slug: string; image: string; excerpt: string; paragraphs: string[] }[]) {
    const heroImage = await upload(post.image, `${post.title} promotional graphic`)
    const data = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: new Date().toISOString(),
      body: richText(...post.paragraphs),
      ...(heroImage ? { heroImage } : {}),
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1 })
    if (found.totalDocs) await payload.update({ collection: 'posts', id: found.docs[0]!.id, data: data as never })
    else await payload.create({ collection: 'posts', data: data as never })
  }
  // Drop posts that are no longer in the fixture set, so replacing the written
  // copy with the brewery's own does not leave both versions live.
  const expectedPosts = new Set((NEWS as { slug: string }[]).map((p) => p.slug))
  const allPosts = await payload.find({ collection: 'posts', limit: 200, depth: 0 })
  let prunedPosts = 0
  for (const doc of allPosts.docs) {
    const slug = (doc as { slug?: string }).slug
    if (slug && !expectedPosts.has(slug)) {
      await payload.delete({ collection: 'posts', id: doc.id })
      prunedPosts++
    }
  }
  console.log(`  posts     ${(NEWS as unknown[]).length}${prunedPosts ? ` (${prunedPosts} stale removed)` : ''}`)

  // 7b. About page, built from blocks so the brewery can add the next award
  //     themselves rather than asking for a deploy.
  const aboutImgs = await Promise.all([
    upload('about-img-7952-1647848790.jpg', 'The Phat Brew Club crew in the early days'),
    upload('about-phat-porter-cans-1647849068.jpg', 'Cans of Phat Porter, the beer that started it'),
    upload('about-2025-10-24-09-54-18.jpg', 'The Phat Brew Club team'),
    upload('about-2025-10-24-09-55-13.jpg', 'Behind the bar at Phat Brew Club'),
  ])

  const aboutData = {
    title: 'About us',
    slug: 'about',
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'WHO ARE THIS PHAT BREW CLUB BUNCH?',
        heading: 'It started with a football club and a homebrew kit',
        lede: 'A group of mates who met at their local footy club, started brewing together on weekends, and ended up with two venues and a trophy cabinet.',
        image: aboutImgs[0],
      },
      {
        blockType: 'richText',
        heading: 'The Phat Brew Club crew',
        body: richText(
          'When mates get together to brew a beer it rarely starts with commercial ambitions. It is usually just an excuse to catch up. Every so often it turns into something considerably bigger.',
          'Phat Brew Club came out of a group who met through their local football club and got into homebrewing together. Regular brew days and a shared obsession with good beer led to the decision to start canning and kegging what they were making, so everyone else could drink it too.',
          'The turning point was 2020, when the group won the Margaret River Brewhouse Backyard Brewing competition with a Coffee Cream Porter. That led to Phat Porter being brewed commercially, and the club has not really slowed down since.',
        ),
      },
      {
        blockType: 'quote',
        quote: 'The win gave us the confidence that our beers were good enough to be brewed at a commercial scale.',
        attribution: 'Phat Brew Club',
      },
      { blockType: 'gallery', heading: 'The crew', images: aboutImgs.filter(Boolean).slice(1) },
      {
        blockType: 'awards',
        heading: 'Awards',
        entries: AWARDS.map(([year, body, detail]) => ({ year, body, detail })),
      },
    ],
    seo: {
      title: 'About Phat Brew Club',
      description:
        'Phat Brew Club started with a group of mates from a football club and a homebrew kit. Two Perth venues, and a trophy cabinet that keeps growing.',
    },
    _status: 'published' as const,
  }
  const foundAbout = await payload.find({ collection: 'pages', where: { slug: { equals: 'about' } }, limit: 1 })
  if (foundAbout.totalDocs) await payload.update({ collection: 'pages', id: foundAbout.docs[0].id, data: aboutData as never })
  else await payload.create({ collection: 'pages', data: aboutData as never })
  console.log('  page      about')

  // 7. Pages. The homebrew comp is a block-built page rather than a hard-coded
  //    route, so the brewery can update it — and retire it — without a deploy.
  const compBlocks = [
    {
      blockType: 'hero',
      eyebrow: '2026 · ENTRIES CLOSED',
      heading: 'The Great Aussie Homebrew Comp',
      lede:
        'Entries closed on 10 May and the awards night was 23 May. The 2027 competition opens in April.',
      actions: [{ label: 'Tell me when 2027 opens', url: '/contact' }],
    },
    {
      blockType: 'richText',
      heading: 'Turn your homebrew into something real',
      body: richText(
        'Most competitions give you a score. This one gives you a pathway: every entry is judged by working commercial brewers, and the winning beer gets brewed and poured across Perth and the South West.',
        { h: 'How it runs', tag: 'h3' },
        'Register your beer online, drop it off at any of the three breweries during the drop-off window, and let the judges do the rest. Entry is free.',
        { h: 'The 2026 dates', tag: 'h3' },
        'Entries opened 6 April and closed 10 May. Drop-off was 12 May at all three breweries. Judging took place on Saturday 16 May at Phat Brew Club, with the awards night at 6pm on Saturday 23 May.',
      ),
    },
    {
      blockType: 'faq',
      heading: 'Questions',
      questions: [
        { question: 'Who can enter?', answer: richText('Any homebrewer. You do not need to have entered a competition before, and there is no membership requirement.') },
        { question: 'Does it cost anything?', answer: richText('No. Entry is free.') },
        { question: 'How many beers can I submit?', answer: richText('Check the entry form when registrations reopen in April, as the limit can change year to year.') },
        { question: 'What happens if I win?', answer: richText('The winning beer is brewed commercially and poured across Perth and the South West, with the brewer credited.') },
        { question: 'When do entries open for 2027?', answer: richText('April 2027. Get in touch and we will let you know the moment the form goes live.') },
      ],
    },
  ]

  const compData = {
    title: 'The Great Aussie Homebrew Comp',
    slug: 'homebrew-comp',
    layout: compBlocks,
    seo: {
      title: 'The Great Aussie Homebrew Comp',
      description:
        'Phat Brew Club\'s homebrew competition. Judged by commercial brewers, with the winning beer brewed and poured across WA.',
    },
    _status: 'published' as const,
  }
  const foundPage = await payload.find({ collection: 'pages', where: { slug: { equals: 'homebrew-comp' } }, limit: 1 })
  if (foundPage.totalDocs) {
    await payload.update({ collection: 'pages', id: foundPage.docs[0].id, data: compData as never })
  } else {
    await payload.create({ collection: 'pages', data: compData as never })
  }
  console.log('  page      homebrew-comp')

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
