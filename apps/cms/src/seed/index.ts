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
import MERCH from './merch.json' with { type: 'json' }

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
   * SEED_PURGE_MEDIA=true deletes only what looks stale, which matters because
   * the job has a 900s timeout and two retries: a blanket purge that ran out of
   * time would purge again on the retry and never converge.
   *
   * SEED_PURGE_MEDIA=all deletes everything, for changes to the shape of a
   * derivative rather than its format, which "stale" cannot detect. That does
   * carry the retry risk above, so it is opt-in and run deliberately.
   */
  const purgeMode = process.env.SEED_PURGE_MEDIA
  if (purgeMode === 'true' || purgeMode === 'all') {
    const all = await payload.find({ collection: 'media', limit: 0, pagination: false })
    type Doc = {
      mimeType?: string | null
      sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null }>
    }
    const isStale = (doc: Doc) => {
      // PDFs have no derivatives to regenerate.
      if (!doc.mimeType?.startsWith('image/')) return false
      const generated = Object.values(doc.sizes ?? {}).filter((v) => v?.url)
      // Nothing generated at all, or generated in the old format.
      if (generated.length === 0) return true
      return generated.some((v) => !v.url!.endsWith('.webp'))
    }
    let purged = 0
    for (const doc of all.docs) {
      // 'all' regenerates everything. Needed when the change is to the shape of
      // a derivative rather than its format — sizes that used to crop to
      // 800x600 are already WebP, so nothing about them looks stale.
      if (purgeMode !== 'all' && !isStale(doc as Doc)) continue
      await payload.delete({ collection: 'media', id: doc.id })
      purged++
    }
    console.log(`  purged    ${purged} of ${all.docs.length} media documents (mode: ${purgeMode})`)
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
    /**
     * Match on the name without its extension.
     *
     * Uploads are converted to WebP, so `og-pale-ale.jpg` on disk is stored as
     * `og-pale-ale.webp`. Comparing the full filename therefore never matched
     * anything after the first run: the seed decided the image was new, tried
     * to create it again, and Payload rejected the duplicate filename. `like`
     * is a contains match, so the stem is re-checked exactly here — otherwise
     * `beer-og-pale-ale-1` would also match `beer-og-pale-ale-10`.
     */
    const stem = file.replace(/\.[^.]+$/, '')
    const found = await payload.find({
      collection: 'media',
      where: { filename: { like: stem } },
      limit: 50,
    })
    const match = found.docs.find((d) => (d.filename ?? '').replace(/\.[^.]+$/, '') === stem)
    if (match) {
      media.set(file, match.id)
      return match.id
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
    // Only West Perth publishes one; Hillarys' functions page has no download.
    const packId =
      v.slug === 'west-perth'
        ? await upload('functions-west-perth-pack.pdf', 'West Perth functions and events pack')
        : undefined
    const data = {
      name: v.name,
      shortName: v.shortName,
      slug: v.slug,
      address: {
        street: v.street, suburb: v.suburb, state: 'WA',
        postcode: v.postcode, latitude: v.latitude, longitude: v.longitude,
      },
      transportNote: v.transportNote,
      mapsQuery: v.mapsQuery,
      capacity: v.capacity,
      tapCount: 20,
      amenities: v.amenities,
      meanduSlug: v.meanduSlug,
      bookingUrl: v.bookingUrl,
      hoursLabel: v.hoursLabel,
      publicHolidayNote: v.publicHolidayNote,
      faqs: (v.faqs ?? []).map(([question, answer]) => ({ question, answer })),
      heroImage: heroId,
      ...(packId ? { functionsPack: packId } : {}),
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

  /**
   * Reconcile, for the same reason the events below do: renaming a beer changes
   * its slug, so the old record survives and the site lists the beer twice.
   * Three names were corrected off the can artwork — Brightside to Mr
   * Brightside, Passion to Phat Passion, Three Cheers to 3 Cheers — and each
   * would otherwise have left its wrong-ABV twin behind.
   *
   * Like the events reconcile, this makes the seed a FIXTURE LOADER. Never
   * point it at an environment where staff have added beers of their own.
   */
  const fixtureSlugs = new Set(
    BEERS.map(([n]) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')),
  )
  const { docs: allBeerDocs } = await payload.find({ collection: 'beers', limit: 500, depth: 0 })
  let removedBeers = 0
  for (const doc of allBeerDocs as unknown as { id: number | string; slug: string }[]) {
    if (fixtureSlugs.has(doc.slug)) continue
    await payload.delete({ collection: 'beers', id: doc.id })
    removedBeers++
  }
  console.log(`  beers     ${BEERS.length}${removedBeers ? `, removed ${removedBeers} renamed` : ''}`)

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
        // Their shop copy ends with a parenthetical ABV, and we render ABV as
        // its own field, so the two would sit side by side — and disagree where
        // the shop listing is stale. OG Pale's copy says "(5% ABV)" while the
        // 2025 can and Mane Liquor both say 5.5%. Drop the suffix, keep the
        // sentence.
        ...(bp.description
          ? { description: bp.description.replace(/\s*\(\s*\d+(?:\.\d+)?\s*%\s*ABV\s*\)\s*$/i, '').trim() }
          : {}),
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

  // 4d. Merch. Beer cubes are deliberately excluded — they already have a page
  //     each under /beers, and listing them here too would give one product two
  //     homes. Photography is filtered upstream in build-merch-data.mjs, which
  //     drops the "Similar Items" carousel the shop renders on every product.
  let merchCount = 0
  for (const m of MERCH as {
    slug: string; title: string; price: number | null
    description: string | null; shopUrl: string; images: string[]
  }[]) {
    const images = (
      await Promise.all(m.images.map((f, i) => upload(f, `${m.title} product photograph ${i + 1}`)))
    ).filter(Boolean)
    const data = {
      title: m.title,
      slug: m.slug,
      ...(m.price ? { price: m.price } : {}),
      ...(m.description ? { description: m.description } : {}),
      shopUrl: m.shopUrl,
      images,
      _status: 'published' as const,
    }
    const found = await payload.find({ collection: 'merch', where: { slug: { equals: m.slug } }, limit: 1 })
    if (found.totalDocs)
      await payload.update({ collection: 'merch', id: found.docs[0].id, data: data as never })
    else await payload.create({ collection: 'merch', data: data as never })
    merchCount++
  }
  console.log(`  merch     ${merchCount} items`)

  /**
   * No seeded tap lists.
   *
   * This used to write "the first six beers per venue", which put six beers on
   * the Hillarys page as though they were pouring — a claim with no source
   * behind it. Tap lists come from the me&u sync or not at all. me&u publishes
   * a beers-and-ciders menu for West Perth and not for Hillarys, so West Perth
   * gets a live list and Hillarys honestly gets none.
   */

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

  for (const [title, weekday, hour, recurrence, slugs, category, isFree, price, description, priceNote] of EVENTS) {
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
    // Two different quiz posters exist: news-quiz-night is West Perth's themed
    // quiz calendar, news-quiz-night-hillarys is Hillarys' weekly poster.
    const artFor = /quiz/i.test(title)
      ? slugs.includes('hillarys') && !slugs.includes('west-perth')
        ? 'news-quiz-night-hillarys.jpg'
        : 'news-quiz-night.jpg'
      : slugs.includes('hillarys') && !slugs.includes('west-perth')
        ? 'news-hillarys-specials.jpg'
        : 'news-west-perth-specials.jpg'
    const heroImage = await upload(artFor, `${title} at Phat Brew Club`)

    const data = {
      title, slug,
      startsAt: startsAt.toISOString(),
      recurrence, category, isFree, price,
      ...(priceNote ? { priceNote } : {}),
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
  //    When 2027 is announced it should be a new page in the CMS, not a code
  //    change; nothing here invents a 2027 date, because none has been
  //    published.
  const compBanner = await upload(
    'homebrew-2026-banner.png',
    'The Great Aussie Home Brew Comp 2026 banner, with the Golden Gnome award',
  )
  const compGnome = await upload(
    'homebrew-2026-gnome.jpg',
    'The Golden Gnome award for the 2026 Great Aussie Home Brew Comp',
  )

  const compBlocks = [
    {
      blockType: 'hero',
      eyebrow: '2026 · INAUGURAL · ENTRIES CLOSED',
      heading: 'The Great Aussie Home Brew Comp',
      lede:
        'Brew it. Back it. Pour it. The inaugural West Aussie home brew competition, judged by working commercial brewers, with the Grand Champion brewed and poured across Perth and the South West.',
      ...(compBanner ? { image: compBanner } : {}),
      actions: [{ label: 'Talk to us about next year', url: '/contact' }],
    },
    {
      blockType: 'richText',
      heading: 'Why enter',
      body: richText(
        'Most competitions give you a score. This one gives you a pathway. Every entry is judged by experienced commercial brewers across Phat Brew Club, Margaret River Beer Co. and Campus Brewing, with detailed, constructive feedback. Then the best beers go further.',
        { h: 'What you get', tag: 'h3' },
        'Professional judging from working brewers, detailed feedback on every entry, a commercial brewing opportunity for the Grand Champion, a showcase across Perth and South West venues, and sponsor-backed prizes. Entry is free.',
        { h: 'Categories and awards', tag: 'h3' },
        'The Grand Champion is brewed commercially and released in cans and kegs, featured across WA venues. Category winners are picked for Best Lager, Best IPA, Best Sour and Best Other, alongside regional winners for North, South and South West.',
        { h: 'How the 2026 comp ran', tag: 'h3' },
        'Entries opened on 6 April and closed on 10 May. Drop-off was 12 May at all three breweries, judging was Saturday 16 May at Phat Brew Club, and the awards night was 6pm on Saturday 23 May.',
        { h: 'Powered by WA brewers and suppliers', tag: 'h3' },
        'Phat Brew Club, Margaret River Beer Co. and Campus Brewing, supported by Bintani, Lallemand, HPA and Yakima Chief Hops. Brewers and suppliers working together to give home brewers a route from garage to glass.',
      ),
    },
    ...(compGnome
      ? [{
          blockType: 'gallery',
          heading: 'The Golden Gnome',
          images: [compGnome, ...(compBanner ? [compBanner] : [])],
        }]
      : []),
    {
      blockType: 'faq',
      heading: 'Questions',
      questions: [
        { question: 'Who can enter?', answer: richText('Any home brewer. You do not need to have entered a competition before, and there is no membership requirement.') },
        { question: 'Does it cost anything?', answer: richText('No. Entry is free.') },
        { question: 'Who judges it?', answer: richText('Working commercial brewers from Phat Brew Club, Margaret River Beer Co. and Campus Brewing. Every entry gets written feedback.') },
        { question: 'What happens if I win?', answer: richText('The Grand Champion beer is brewed commercially and released in cans and kegs across Perth and the South West, with the brewer credited.') },
        { question: 'Is there another one coming?', answer: richText('The 2026 competition was the inaugural one. Nothing has been announced for next year yet — get in touch and we will let you know when it is.') },
      ],
    },
  ]

  const compData = {
    title: 'The Great Aussie Home Brew Comp',
    slug: 'homebrew-comp',
    layout: compBlocks,
    seo: {
      title: 'The Great Aussie Home Brew Comp',
      description:
        "Phat Brew Club's home brew competition, judged by commercial brewers, with the winning beer brewed and poured across WA.",
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
      // The four the brewery actually uses. Instagram and Facebook came from
      // the sameAs block; TikTok is only in the rendered footer, so it needed
      // the page running to find. No Untappd: it has beer pages there but no
      // brewery page, and a guessed URL is worse than none.
      instagram: 'https://www.instagram.com/phatbrewclub',
      facebook: 'https://www.facebook.com/phatbrewclub',
      tiktok: 'https://www.tiktok.com/@phatbrewclubbrewery',
      youtube: 'https://www.youtube.com/@PhatBrewClub',
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
