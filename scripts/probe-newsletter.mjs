import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1440,height:1400},
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' })
const p = await ctx.newPage()
const thirdParty = new Set()
p.on('request', r => {
  const u = r.url()
  if (!/phatbrewclub|editmysite|google|gstatic|instagram|cloudflarestream|datadog|sentry|tawk|youtube|facebook/.test(u)) thirdParty.add(new URL(u).host)
})
await p.goto('https://www.phatbrewclub.com/', { waitUntil:'domcontentloaded', timeout:60000 })
await p.waitForTimeout(4000)
await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,500);y+=500;if(y>=document.body.scrollHeight+800){clearInterval(t);r()}},100)})})
await p.waitForTimeout(2500)
const info = await p.evaluate(() => {
  const forms=[...document.querySelectorAll('form')].map(f=>({
    action: f.getAttribute('action'), method: f.getAttribute('method'),
    id: f.id, cls: (f.className||'').slice(0,60),
    fields: [...f.querySelectorAll('input,select')].map(i=>`${i.type}:${i.name||i.id||''}`).slice(0,6),
  }))
  const t=document.body.innerText
  return { forms, hasLoop: /stay in the loop/i.test(t),
           near: (t.match(/Stay in the Loop[\s\S]{0,200}/i)||[])[0] }
})
console.log('  forms on page:')
info.forms.forEach(f=>console.log('   ', JSON.stringify(f)))
console.log('  third-party hosts:', [...thirdParty].join(', ') || 'none')
console.log('  newsletter text:', (info.near||'').replace(/\n+/g,' | ').slice(0,160))
await b.close()
