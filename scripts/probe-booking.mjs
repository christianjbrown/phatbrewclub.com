import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1200},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
for (const [label, path] of [['West Perth','/west-perth'],['Hillarys','/hillarys-boardwalk']]) {
  const p = await ctx.newPage()
  await p.goto('https://www.phatbrewclub.com'+path,{waitUntil:'domcontentloaded',timeout:60000})
  await p.waitForTimeout(3500)
  const links = await p.evaluate(()=>[...document.querySelectorAll('a[href]')]
    .map(a=>a.getAttribute('href')).filter(h=>h && /nowbookit|booking/i.test(h)))
  console.log(`  ${label}: ${[...new Set(links)][0] || 'none found'}`)
  await p.close()
}
await b.close()
