import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1400},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
for (const path of ['/west-perth','/hillarys-boardwalk']) {
  const p = await ctx.newPage()
  await p.goto('https://www.phatbrewclub.com'+path,{waitUntil:'domcontentloaded',timeout:60000})
  await p.waitForTimeout(3000)
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+600){clearInterval(t);r()}},90)})})
  await p.waitForTimeout(1500)
  const txt = await p.evaluate(()=>{
    const t=(document.querySelector('main')||document.body).innerText||''
    const i=t.search(/Location\s*&\s*Hours/i)
    return i>=0 ? t.slice(i, i+420) : 'NOT FOUND'
  })
  console.log(`\n===== ${path} =====`)
  console.log(txt.split('\n').filter(Boolean).map(l=>'  '+l.trim()).join('\n'))
  await p.close()
}
// beers page: do the beers link anywhere?
const p2 = await ctx.newPage()
await p2.goto('https://www.phatbrewclub.com/beers',{waitUntil:'domcontentloaded',timeout:60000})
await p2.waitForTimeout(3500)
const links = await p2.evaluate(()=>[...(document.querySelector('main')||document.body).querySelectorAll('a')]
  .map(a=>({t:a.textContent.trim().slice(0,30),h:a.getAttribute('href')})).filter(x=>x.t))
console.log('\n===== /beers links =====')
links.slice(0,14).forEach(l=>console.log(`  ${l.t.padEnd(26)} -> ${l.h}`))
await b.close()
