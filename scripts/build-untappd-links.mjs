import { readFile, writeFile } from 'node:fs/promises'

/**
 * Maps CMS beers to their Untappd page. Links only — no descriptions, ratings
 * or any other content is taken from Untappd.
 */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const stripLeading = (s) => norm(s).replace(/^the/, '')

const run = async () => {
  const untappd = JSON.parse(await readFile('assets/untappd.json', 'utf8')).filter((u) => u.url)
  const cms = JSON.parse(await readFile('/tmp/cmsbeers.json', 'utf8')).docs

  const byExact = new Map(untappd.map((u) => [norm(u.name), u]))
  const byStripped = new Map(untappd.map((u) => [stripLeading(u.name), u]))

  const links = []
  const unmatched = []

  for (const beer of cms) {
    const k = norm(beer.name)
    const ks = stripLeading(beer.name)

    // Exact first, so "Phubba Bubba" never resolves to the Grape variant.
    let hit = byExact.get(k) ?? byStripped.get(ks)

    if (!hit) {
      // Then containment, preferring the closest candidate by length so a short
      // CMS name does not attach itself to a much longer special edition.
      const candidates = untappd
        .filter((u) => {
          const un = stripLeading(u.name)
          return un.length > 4 && (un.includes(ks) || ks.includes(un))
        })
        .sort((a, b) => Math.abs(stripLeading(a.name).length - ks.length) - Math.abs(stripLeading(b.name).length - ks.length))
      hit = candidates[0]
    }

    if (hit) links.push({ slug: beer.slug, name: beer.name, untappdName: hit.name, untappdUrl: hit.url })
    else unmatched.push(beer.name)
  }

  await writeFile('apps/cms/src/seed/untappd-links.json', JSON.stringify(links, null, 2))
  links.forEach((l) =>
    console.log(`  ${l.name.slice(0, 24).padEnd(26)} -> ${l.untappdName.slice(0, 26).padEnd(28)} ${l.untappdUrl.split('/').slice(-2).join('/')}`),
  )
  console.log(`\n  matched: ${links.length}   unmatched: ${unmatched.length}`)
  if (unmatched.length) console.log(`  no Untappd page: ${unmatched.join(', ')}`)
}
run()
