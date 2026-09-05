import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const PATHS = [
  '/', '/venues', '/venues/west-perth', '/venues/hillarys', '/beers',
  '/beers/west-is-best', '/whats-on', '/whats-on/quiz-night',
  '/about', '/contact', '/shop', '/functions/west-perth', '/functions/hillarys',
]

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  let total = 0
  for (const p of PATHS) {
    const page = await ctx.newPage()
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 })
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    total += r.violations.length
    if (r.violations.length) {
      console.log(`${p}: ${r.violations.length} violation type(s)`)
      r.violations.forEach((v) =>
        console.log(`   [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length})\n      ${v.nodes[0]?.html?.slice(0,110)}`))
    } else console.log(`${p}: clean`)
    await page.close()
  }
  await browser.close()
  console.log(`\n${PATHS.length} pages, ${total} violation types`)
  process.exit(total ? 1 : 0)
}
run()
