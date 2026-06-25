#!/usr/bin/env node
/**
 * perf-gate — V7 §6.5: builds, serves dist/ locally (gzip, production-faithful),
 * runs Lighthouse (mobile emulation, default throttling) on EVERY page found in
 * dist/, fails any page over budgets.json, writes JSON reports to REPORTS/perf/.
 *
 * Usage: node scripts/perf-gate.mjs [--no-build]
 */
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'REPORTS', 'perf');
const PORT = 4173;
const budgets = JSON.parse(readFileSync(join(ROOT, 'budgets.json'), 'utf8'));

// ---- 1. build
if (!process.argv.includes('--no-build')) {
  console.log('perf-gate: astro build…');
  execSync('npx astro build', { cwd: ROOT, stdio: 'inherit' });
}
if (!existsSync(DIST)) {
  console.error('perf-gate: dist/ missing');
  process.exit(1);
}

// ---- 2. discover pages (every index.html + 404)
function* pages(dir, base = '') {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* pages(p, `${base}/${e}`);
    else if (e === 'index.html') yield `${base}/` || '/';
  }
}
const routes = [...pages(DIST)].sort();
console.log(`perf-gate: ${routes.length} pages discovered:`, routes.join(' '));

// ---- 3. gzip static server (production-faithful transfer sizes)
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon',
};
const GZIP_TYPES = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt']);
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(DIST, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    file = join(DIST, '404.html');
    res.statusCode = 404;
    if (!existsSync(file)) { res.end('404'); return; }
  }
  const ext = extname(file);
  res.setHeader('content-type', MIME[ext] ?? 'application/octet-stream');
  if (GZIP_TYPES.has(ext) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
    res.setHeader('content-encoding', 'gzip');
    createReadStream(file).pipe(createGzip({ level: 6 })).pipe(res);
  } else {
    createReadStream(file).pipe(res);
  }
});
await new Promise((ok) => server.listen(PORT, ok));

// ---- 4. lighthouse every page
mkdirSync(OUT, { recursive: true });
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
const failures = [];
const summary = [];

for (const route of routes) {
  const url = `http://localhost:${PORT}${route}`;
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625 },
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const slug = route === '/' ? 'home' : route.replaceAll('/', '').toLowerCase() || 'home';
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(lhr, null, 1));

  const pageFail = [];
  // scores
  for (const [cat, min] of Object.entries(budgets.scores)) {
    const got = Math.round((lhr.categories[cat]?.score ?? 0) * 100);
    if (got < min) pageFail.push(`${cat} ${got}<${min}`);
  }
  // metrics
  for (const [audit, max] of Object.entries(budgets.metricsMs)) {
    const got = lhr.audits[audit]?.numericValue;
    if (got != null && got > max) pageFail.push(`${audit} ${Math.round(got)}ms>${max}ms`);
  }
  const cls = lhr.audits['cumulative-layout-shift']?.numericValue ?? 0;
  if (cls > budgets.cumulativeLayoutShift) pageFail.push(`CLS ${cls}>${budgets.cumulativeLayoutShift}`);
  // transfer weights by resource type
  const items = lhr.audits['resource-summary']?.details?.items ?? [];
  const kb = Object.fromEntries(items.map((i) => [i.resourceType, Math.round(i.transferSize / 1024)]));
  for (const type of ['script', 'stylesheet', 'document', 'font']) {
    const max = budgets.transferKB[type];
    if ((kb[type] ?? 0) > max) pageFail.push(`${type} ${kb[type]}KB>${max}KB`);
  }
  const totalMax = route === '/' ? budgets.transferKB.totalHome : budgets.transferKB.totalOther;
  if ((kb.total ?? 0) > totalMax) pageFail.push(`total ${kb.total}KB>${totalMax}KB`);
  // console errors
  const errs = (lhr.audits['errors-in-console']?.details?.items ?? []).length;
  if (errs > budgets.consoleErrorsMax) pageFail.push(`console errors ${errs}`);

  const scores = ['performance', 'accessibility', 'best-practices', 'seo']
    .map((c) => Math.round((lhr.categories[c]?.score ?? 0) * 100)).join('/');
  summary.push({ route, scores, kb, fail: pageFail });
  console.log(`${pageFail.length ? 'FAIL' : ' ok '} ${route.padEnd(22)} ${scores}  js:${kb.script ?? 0} css:${kb.stylesheet ?? 0} html:${kb.document ?? 0} font:${kb.font ?? 0} total:${kb.total ?? 0}KB ${pageFail.join('; ')}`);
  if (pageFail.length) failures.push({ route, pageFail });
}

await chrome.kill();
server.close();
writeFileSync(join(OUT, '_summary.json'), JSON.stringify({ date: new Date().toISOString(), summary }, null, 1));

if (failures.length) {
  console.error(`\nperf-gate: ${failures.length}/${routes.length} pages over budget. Gate FAILS.`);
  process.exit(1);
}
console.log(`\nperf-gate: all ${routes.length} pages within V7 §6.1 budgets.`);
