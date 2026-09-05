import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readdir } from 'node:fs/promises';

const BASE = 'http://localhost:8770';
const run = async () => {
  const files = (await readdir('mocks')).filter(f => f.endsWith('.html')).sort();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let total = 0;
  const all = [];
  for (const f of files) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/${f}`, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    total += r.violations.length;
    if (r.violations.length) {
      all.push([f, r.violations]);
      console.log(`${f}: ${r.violations.length} violation type(s)`);
      r.violations.forEach(v => console.log(`   [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`));
    } else {
      console.log(`${f}: clean`);
    }
    await page.close();
  }
  await browser.close();
  console.log(`\n${files.length} pages, ${total} violation types total`);
};
run();
