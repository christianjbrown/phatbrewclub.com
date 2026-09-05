import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

/** product slug -> beer slug already in the CMS */
const MAP = {
  'culture-of-good-times-cube-6-': 'culture-of-good-times',
  'west-is-best-lager-4-cube': 'west-is-best',
  'risky-business-7-cube': 'risky-business',
  'og-pale-cube-5-': 'og-pale-ale',
  'phubba-bubba-sour-5-5-cube': 'phubba-bubba',
  'xtra-phat-ale-5-cube': 'xtra-phat-ale',
  'phatatron-cube-7-': 'phatatron',
}

const run = async () => {
  const products = JSON.parse(await readFile('assets/products.json', 'utf8'))
  const out = []
  for (const p of products) {
    const beerSlug = MAP[p.slug]
    if (!beerSlug) continue
    const desc = (p.description || '').split('\n').map((l) => l.trim()).filter(Boolean)
    // The page scraper stops the description at the first blank line, so the
    // pack detail that follows it is not captured. Every cube is the same
    // format, stated in the product titles themselves.
    const packLine = /cube/i.test(p.slug) ? '16 x 375ml cans' : null
    out.push({
      beerSlug,
      productSlug: p.slug,
      price: p.price ? Number(p.price.replace(/[^0-9.]/g, '')) : null,
      packSize: packLine,
      allergens: p.allergens ? p.allergens.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) : [],
      description: desc[0] || null,
      shopUrl: p.url,
      images: p.images.map((_, i) => `beer-${beerSlug}-${i + 1}.jpg`),
    })
  }
  await mkdir('apps/cms/src/seed', { recursive: true })
  await writeFile('apps/cms/src/seed/beer-products.json', JSON.stringify(out, null, 2))
  out.forEach((b) => console.log(`  ${b.beerSlug.padEnd(24)} $${b.price}  ${String(b.packSize).slice(0,22).padEnd(24)} imgs=${b.images.length} allergens=${b.allergens.join(',') || '-'}`))
  console.log(`\n${out.length} beers enriched -> apps/cms/src/seed/beer-products.json`)
}
run()
