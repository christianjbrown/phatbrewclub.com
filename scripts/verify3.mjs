import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1400},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
for (const path of ['/west-perth','/hillarys-boardwalk']) {
  const p = await ctx.newPage()
  await p.goto('https://www.phatbrewclub.com'+path,{waitUntil:'domcontentloaded',timeout:60000})
  await p.waitForTimeout(3000)
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,400);y+=400;if(y>=document.body.scrollHeight+800){clearInterval(t);r()}},90)})})
  await p.waitForTimeout(1500)
  const txt = await p.evaluate(()=>{
    const t=(document.querySelector('main')||document.body).innerText||''
    const i=t.search(/\bFAQ\b/)
    return i>=0 ? t.slice(i, i+1400) : 'NO FAQ'
  })
  console.log(`\n===== ${path} FAQ =====`)
  console.log(txt.split('\n').filter(Boolean).map(l=>'  '+l.trim()).join('\n'))
  await p.close()
}
await b.close()
