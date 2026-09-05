/**
 * Build the merch fixture for the shop page from the captured shop scrape.
 *
 * Two things this has to get right, both learned the hard way on the beer
 * galleries:
 *
 * 1. Square Online renders a "Similar Items" carousel inside every product
 *    page, so a naive scrape attributes other products' photography to the one
 *    being viewed. The frequency distribution is cleanly bimodal — 36 images
 *    appear on exactly one product, 11 appear on 6 to 14 — so an image that
 *    shows up more than once is furniture, not this product's photo.
 *
 * 2. Beer cubes already have their own pages under /beers. Only merch belongs
 *    here, or the shop duplicates the beer list at a different price.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs'
import { basename, extname, join } from 'path'

const ROOT = new URL('..', import.meta.url).pathname
const products = JSON.parse(readFileSync(join(ROOT, 'assets/products.json'), 'utf8'))
const ORIGINAL = join(ROOT, 'assets/original')
const IMG = join(ROOT, 'mocks/img')

const stem = (u) => basename(new URL(u).pathname).replace(/\.[^.]+$/, '').toLowerCase()
const ext = (u) => extname(new URL(u).pathname).toLowerCase() || '.jpg'

// The product's own primary photo, declared in its og:image. This is the
// authority, not the frequency heuristic below: the Orange Beanie's own
// photograph also appears in thirteen other products' carousels, so counting
// occurrences threw it away and left the beanie with no picture at all. Every
// product declares a distinct og:image, which the carousel never changes.
const OG = JSON.parse(readFileSync(join(ROOT, 'assets/product-og-images.json'), 'utf8'))

// What the brewery still lists. Their shop shows no sold-out badge — an item
// that has gone is simply removed — so absence from this capture is the only
// signal available that something is no longer sold. Three merch items in the
// older product scrape are no longer stocked, and listing them sends people to
// a checkout for something they cannot buy.
const CURRENT = new Set(
  JSON.parse(readFileSync(join(ROOT, 'assets/shop-current.json'), 'utf8')).titles.map((t) =>
    t.toLowerCase().trim(),
  ),
)

const seen = new Map()
for (const p of products) {
  for (const u of new Set(p.images ?? [])) seen.set(stem(u), (seen.get(stem(u)) ?? 0) + 1)
}
const isOwnPhoto = (u) => (seen.get(stem(u)) ?? 0) === 1

// Anything with an ABV, a cube, or a beer style in the name is a beer.
const BEERISH = /\bcube\b|\bipa\b|\blager\b|\bale\b|\bsour\b|\bstout\b|\bpils\b|%/i

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const out = []
const wanted = []
for (const p of products) {
  if (BEERISH.test(p.title)) continue
  const slug = slugify(p.title)
  // Primary first, then any additional shots unique to this product. Without
  // the primary, two items shipped with no photo at all.
  const primary = OG[p.url]
  const extras = (p.images ?? []).filter((u) => isOwnPhoto(u) && stem(u) !== (primary ? stem(primary) : null))
  const own = primary ? [primary, ...extras] : extras
  const images = []
  own.forEach((u, i) => {
    const target = `merch-${slug}-${i + 1}${ext(u)}`
    images.push(target)
    if (!existsSync(join(IMG, target))) wanted.push({ url: u, target })
  })
  out.push({
    slug,
    title: p.title,
    soldOut: !CURRENT.has(p.title.toLowerCase().trim()),
    // "A$40.00" -> 40. Stored as a number so the site formats it, rather than
    // baking one currency's punctuation into the content.
    price: p.price ? Number(String(p.price).replace(/[^0-9.]/g, '')) : null,
    description: (p.description ?? '').trim() || null,
    shopUrl: p.url,
    images,
  })
}

// Copy anything already downloaded; report the rest for the fetch step.
let copied = 0
const missing = []
for (const { url, target } of wanted) {
  const s = stem(url)
  const found = ['.jpg', '.jpeg', '.png', '.webp']
    .map((e) => join(ORIGINAL, s + e))
    .find((f) => existsSync(f))
  if (found) {
    copyFileSync(found, join(IMG, target))
    copied++
  } else {
    missing.push({ url, target })
  }
}

writeFileSync(join(ROOT, 'apps/cms/src/seed/merch.json'), JSON.stringify(out, null, 2) + '\n')
writeFileSync(
  join(ROOT, 'scripts/.merch-missing.json'),
  JSON.stringify(missing, null, 2) + '\n',
)
console.log(`merch items      ${out.length}`)
console.log(`with photos      ${out.filter((m) => m.images.length).length}`)
console.log(`images copied    ${copied}`)
console.log(`still to fetch   ${missing.length}`)
