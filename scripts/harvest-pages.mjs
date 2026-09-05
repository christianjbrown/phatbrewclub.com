import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'

const PAGES = [
  ['about', 'https://www.phatbrewclub.com/about'],
  ['news', 'https://www.phatbrewclub.com/events'],
  ['west-perth', 'https://www.phatbrewclub.com/west-perth'],
  ['hillarys', 'https://www.phatbrewclub.com/hillarys-boardwalk'],
]

const run = async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1200 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
  const out = {}
  for (const [key, url] of PAGES) {
    const p = await ctx.newPage()
    const net = new Set()
    p.on('response', (r) => {
      const u = r.url()
      if (/\/uploads\//.test(u) && /\.(png|jpe?g|webp|pdf)/i.test(u) && !/logo|favicon|payment-methods|icon_|splash_/i.test(u)) {
        net.add(u.split('?')[0])
      }
    })
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(2500)
    await p.evaluate(async () => {
      await new Promise((r) => { let y=0; const t=setInterval(()=>{window.scrollBy(0,320); y+=320;
        if (y>=document.body.scrollHeight+900){clearInterval(t);r()}},110) })
    })
    await p.waitForTimeout(1800)
    const data = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body
      return {
        title: document.title,
        headings: [...main.querySelectorAll('h1,h2,h3,h4')].map((h) => `${h.tagName}: ${h.textContent.trim()}`),
        text: (main.innerText || '').trim(),
        images: [...main.querySelectorAll('img')].map((i) => (i.currentSrc||i.src||'').split('?')[0])
          .filter((u) => u && /\/uploads\//.test(u) && !/logo|favicon|payment/i.test(u)),
        links: [...main.querySelectorAll('a[href]')].map((a) => ({ t: a.textContent.trim().slice(0,60), h: a.href }))
          .filter((l) => l.t),
      }
    })
    out[key] = { url, ...data, images: [...new Set([...data.images, ...net])] }
    console.log(`  ${key.padEnd(12)} ${out[key].images.length} images, ${data.text.length} chars, ${data.headings.length} headings`)
    await p.close()
  }
  await b.close()
  await writeFile('assets/pages.json', JSON.stringify(out, null, 2))
  console.log('\n-> assets/pages.json')
}
run()
