import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'

/**
 * Beer descriptions on a brewery's own Untappd listing are submitted by the
 * brewery, so this is the client's own product copy, same provenance as their
 * Square product pages. Extracted as data for their own site rebuild.
 */
const run = async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1400 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
  const p = await ctx.newPage()
  await p.goto('https://untappd.com/PhatBrewClub/beer', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3500)

  // Load the full list if it is paginated behind a "show more" control
  for (let i = 0; i < 8; i++) {
    const more = p.locator('a.more_list, .more-list, a:has-text("Show More")').first()
    if (!(await more.count().catch(() => 0))) break
    await more.click({ timeout: 3000 }).catch(() => {})
    await p.waitForTimeout(1800)
  }

  const beers = await p.evaluate(() =>
    [...document.querySelectorAll('.beer-item')].map((el) => {
      const t = (sel) => el.querySelector(sel)?.textContent?.trim() ?? ''
      const link = el.querySelector('.name a')?.getAttribute('href') ?? ''
      return {
        name: t('.name a') || t('.name'),
        url: link ? new URL(link, 'https://untappd.com').href : null,
        style: t('.style'),
        abv: t('.abv'),
        ibu: t('.ibu'),
        description: t('.desc .beer-descrption-read-less') || t('.desc') || t('.beer-description'),
      }
    }),
  )
  await b.close()

  // de-duplicate; the markup repeats each beer
  const seen = new Map()
  for (const x of beers) {
    if (!x.name) continue
    const clean = x.description
      .replace(/\s*Show Less\s*$/i, '')
      .replace(/^\s*Show More\s*/i, '')
      .trim()
    if (!seen.has(x.name) || clean.length > (seen.get(x.name).description ?? '').length) {
      seen.set(x.name, { ...x, description: clean })
    }
  }
  const out = [...seen.values()]
  await writeFile('assets/untappd.json', JSON.stringify(out, null, 2))
  out.forEach((x) =>
    console.log(`  ${x.name.slice(0, 30).padEnd(32)} ${x.style.slice(0, 24).padEnd(26)} ${x.abv.padEnd(10)} desc=${x.description.length}`),
  )
  console.log(`\n${out.length} beers -> assets/untappd.json`)
}
run()
