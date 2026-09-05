import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'

const URLS = process.env.URLS_FILE
const ORIGIN = 'https://www.phatbrewclub.com'

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0
      const t = setInterval(() => {
        window.scrollBy(0, 350)
        y += 350
        if (y >= document.body.scrollHeight + 800) { clearInterval(t); resolve() }
      }, 110)
    })
  })
  await page.waitForTimeout(1200)
}

const run = async () => {
  const { readFile } = await import('node:fs/promises')
  const urls = (await readFile(URLS, 'utf8')).split('\n').map((s) => s.trim()).filter(Boolean)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  })

  const products = []
  for (const url of urls) {
    const page = await ctx.newPage()
    const seen = new Set()
    page.on('response', (r) => {
      const u = r.url()
      if (/\/uploads\//.test(u) && /\.(png|jpe?g|webp)/i.test(u) && !/logo|favicon|payment-methods/i.test(u)) seen.add(u.split('?')[0])
    })
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2500)
      await autoScroll(page)
      // Click through the gallery thumbnails so every shot loads, not just the first.
      const thumbs = page.locator('[class*="thumbnail"] img, [class*="gallery"] img, [data-hook*="thumbnail"]')
      const n = Math.min(await thumbs.count().catch(() => 0), 10)
      for (let i = 0; i < n; i++) {
        await thumbs.nth(i).click({ timeout: 2500 }).catch(() => {})
        await page.waitForTimeout(500)
      }

      const data = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body
        const txt = main.innerText || ''
        const grab = (label) => {
          const re = new RegExp(`${label}\\s*\\n+([\\s\\S]*?)(?:\\n\\n|$)`, 'i')
          const m = txt.match(re)
          return m ? m[1].trim() : null
        }
        const imgs = [...main.querySelectorAll('img')]
          .map((i) => i.currentSrc || i.src)
          .filter((u) => u && /\/uploads\//.test(u) && !/logo|favicon|payment-methods/i.test(u))
          .map((u) => u.split('?')[0])
        return {
          title: (main.querySelector('h1')?.textContent || document.title).trim(),
          price: (txt.match(/A\$[\d,.]+/) || [])[0] ?? null,
          description: grab('Description'),
          allergens: grab('Contains the following'),
          sku: (txt.match(/SKU[:\s]+([A-Za-z0-9-]+)/) || [])[1] ?? null,
          lowStock: /Low stock/i.test(txt),
          onSale: /\bSale\b/.test(txt),
          domImages: [...new Set(imgs)],
        }
      })

      products.push({
        url,
        slug: url.split('/').slice(-2)[0],
        id: url.split('/').pop(),
        ...data,
        images: [...new Set([...(data.domImages || []), ...seen])],
      })
      console.log(`  ${data.title?.slice(0, 40).padEnd(42)} ${String(data.price).padEnd(10)} imgs=${[...new Set([...(data.domImages||[]), ...seen])].length}`)
    } catch (e) {
      console.log(`  FAILED ${url}: ${e.message.split('\n')[0]}`)
    }
    await page.close()
  }
  await browser.close()

  await mkdir('assets', { recursive: true })
  await writeFile('assets/products.json', JSON.stringify(products, null, 2))
  const imgCount = new Set(products.flatMap((p) => p.images)).size
  console.log(`\n${products.length} products, ${imgCount} unique images -> assets/products.json`)
}
run()
