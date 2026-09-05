import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'

const GATEWAY = /ap1-guest-gateway\.meandu\.app\/graphql/
const PAGES = [
  'https://www.meandu.app/phatbrewclub/visual/beers-ciders',
  'https://www.meandu.app/phatbrewclub/visual/food',
]

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  })

  const ops = new Map()

  for (const url of PAGES) {
    const page = await ctx.newPage()

    page.on('request', (req) => {
      if (req.method() !== 'POST' || !GATEWAY.test(req.url())) return
      const body = req.postData()
      if (!body) return
      try {
        const parsed = JSON.parse(body)
        const list = Array.isArray(parsed) ? parsed : [parsed]
        for (const op of list) {
          const name = op.operationName || '(anonymous)'
          if (!ops.has(name)) {
            ops.set(name, { operationName: name, query: op.query, variables: op.variables })
          }
        }
      } catch { /* not JSON, ignore */ }
    })

    // GET-style persisted queries also carry the document in the query string
    page.on('request', (req) => {
      if (req.method() !== 'GET' || !GATEWAY.test(req.url())) return
      const u = new URL(req.url())
      const q = u.searchParams.get('query')
      const name = u.searchParams.get('operationName') || '(anonymous-get)'
      if (q && !ops.has(name)) {
        ops.set(name, { operationName: name, query: q, variables: JSON.parse(u.searchParams.get('variables') || '{}') })
      }
    })

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(6000)
    await page.evaluate(async () => {
      await new Promise((r) => { let y = 0; const t = setInterval(() => {
        window.scrollBy(0, 500); y += 500
        if (y >= document.body.scrollHeight + 1200) { clearInterval(t); r() }
      }, 120) })
    })
    await page.waitForTimeout(3000)
    // Open the first menu item, which is what triggers the item-detail query
    await page.locator('button, [role="button"], a').first().click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(2500)
    await page.close()
  }
  await browser.close()

  await mkdir('assets', { recursive: true })
  await writeFile('assets/meandu-operations.json', JSON.stringify([...ops.values()], null, 2))
  console.log(`captured ${ops.size} operations:\n`)
  for (const [name, op] of ops) {
    const fields = (op.query.match(/^\s*([a-zA-Z]+)\(/m) || [])[1] || ''
    console.log(`  ${name.padEnd(30)} vars=${JSON.stringify(op.variables ?? {}).slice(0, 60)}`)
  }
}
run()
