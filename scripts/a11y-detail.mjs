import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const seen = new Map();
  for (const f of ['index.html','whats-on.html','venue-west-perth.html','beers.html']) {
    const page = await ctx.newPage();
    await page.goto(`http://localhost:8770/${f}`, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(['wcag2aa','wcag21aa']).analyze();
    r.violations.forEach(v => v.nodes.forEach(n => {
      const key = n.html.slice(0, 80);
      if (!seen.has(key)) seen.set(key, n.any?.[0]?.message || n.failureSummary);
    }));
    await page.close();
  }
  await browser.close();
  [...seen].forEach(([h, m]) => console.log('HTML: ' + h + '\n  -> ' + String(m).replace(/\n/g, ' ').slice(0, 170) + '\n'));
};
run();
