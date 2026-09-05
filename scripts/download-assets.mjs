import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OUT = 'assets/original';

const slug = (name) => {
  const ext = path.extname(name).toLowerCase().replace('.jpeg', '.jpg');
  const base = path
    .basename(name, path.extname(name))
    .replace(/_\d{9,}$/, '')
    .replace(/_\d{9,}_\d{9,}$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return `${base}${ext}`;
};

const run = async () => {
  const manifest = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  const targets = manifest.filter((a) => a.firstParty);
  await mkdir(OUT, { recursive: true });

  const results = [];
  let ok = 0;
  let failed = 0;

  for (const asset of targets) {
    const filename = slug(asset.filename);
    const dest = path.join(OUT, filename);
    try {
      const res = await fetch(asset.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140.0 Safari/537.36',
          Referer: 'https://www.phatbrewclub.com/',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      results.push({
        file: filename,
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex').slice(0, 16),
        sourceUrl: asset.url,
        usedOn: asset.pages,
      });
      ok++;
      console.log(`  ${filename.padEnd(56)} ${(buf.length / 1024).toFixed(0).padStart(6)} KB`);
    } catch (e) {
      failed++;
      console.log(`  ${filename.padEnd(56)} FAILED ${e.message}`);
    }
  }

  await writeFile('assets/downloaded.json', JSON.stringify(results, null, 2));
  const total = results.reduce((s, r) => s + r.bytes, 0);
  console.log(`\n${ok} downloaded, ${failed} failed, ${(total / 1048576).toFixed(1)} MB`);
};

run();
