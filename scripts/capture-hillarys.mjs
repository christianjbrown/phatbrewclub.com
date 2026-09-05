import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1280,height:1400},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
const p = await ctx.newPage()
const cats = new Set()
p.on('request', r => {
  if (!/guest-gateway\.meandu\.app/.test(r.url())) return
  const raw = r.method()==='POST' ? r.postData() : null
  if (!raw) return
  try { for (const op of [].concat(JSON.parse(raw))) { const c=op?.variables?.categorySlug; if(c) cats.add(c) } } catch {}
})
await p.goto('https://www.meandu.app/phatbrewclub-hillarys/visual/food', { waitUntil:'domcontentloaded', timeout:90000 })
await p.waitForTimeout(7000)
const info = await p.evaluate(() => ({
  hrefs: [...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h&&h.includes('/phatbrewclub-hillarys')))].slice(0,20),
  tabs: [...document.querySelectorAll('[role="tab"], nav a, [class*="categor" i] a, [class*="tab" i]')].map(e=>e.textContent.trim()).filter(Boolean).slice(0,20),
}))
console.log('  categorySlugs seen:', [...cats].join(', ') || 'none')
console.log('  links            :', info.hrefs.join('\n                     ') || 'none')
console.log('  tab labels       :', [...new Set(info.tabs)].join(' | ').slice(0,240) || 'none')
await b.close()
