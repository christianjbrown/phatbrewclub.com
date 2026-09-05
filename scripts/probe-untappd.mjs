import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1200},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
const p = await ctx.newPage()
const res = await p.goto('https://untappd.com/PhatBrewClub/beer', { waitUntil:'domcontentloaded', timeout:60000 })
console.log('  status:', res?.status())
await p.waitForTimeout(4000)
const info = await p.evaluate(() => ({
  title: document.title,
  beerItems: document.querySelectorAll('.beer-item').length,
  names: [...document.querySelectorAll('.beer-item .name a, .beer-item .name')].map(e=>e.textContent.trim()).slice(0,8),
  hasDesc: document.querySelectorAll('.beer-item .desc, .beer-item .beer-description').length,
  bodyStart: (document.body.innerText||'').slice(0,300),
}))
console.log('  title      :', info.title)
console.log('  beer items :', info.beerItems)
console.log('  with desc  :', info.hasDesc)
console.log('  names      :', info.names.join(' | ').slice(0,200))
console.log('  body       :', info.bodyStart.replace(/\n+/g,' | ').slice(0,220))
await b.close()
