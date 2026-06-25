#!/usr/bin/env node
/**
 * screenshot-sweep — V7 §12 G4 exit evidence: every page, mobile (390px) +
 * desktop (1440px), from the production build served locally.
 * Tries bundled chromium, falls back to system Chrome (channel:'chrome').
 *
 * Usage: node scripts/screenshot-sweep.mjs   (expects dist/ to exist)
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'REPORTS', 'screens');
const PORT = 4174;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml',
};
const server = createServer((req, res) => {
  let file = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.statusCode = 404; file = join(DIST, '404.html'); }
  if (!existsSync(file)) { res.end('404'); return; }
  res.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(PORT, ok));

function* pages(dir, base = '') {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* pages(p, `${base}/${e}`);
    else if (e === 'index.html') yield `${base}/` || '/';
  }
}
const routes = [...pages(DIST)].sort();

let browser;
try {
  browser = await chromium.launch();
} catch {
  console.log('bundled chromium unavailable — using system Chrome');
  browser = await chromium.launch({ channel: 'chrome' });
}
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];
const consoleErrors = [];

for (const vp of VIEWPORTS) {
  // reducedMotion: the designed static state — every chapter is visible at
  // opacity 1 (no scroll-reveal hiding), so stitched full-page captures show
  // WHOLE pages instead of black voids where un-entered chapters sit at
  // opacity:0. (Ship-panel "evidence voids" fix.)
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      consoleErrors.push(`${vp.name} ${page.url()} [${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`${vp.name} ${page.url()} [pageerror] ${err.message}`));
  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.replaceAll('/', '');
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' });
    // scroll-prime: fire every lazy load BEFORE the full-page capture —
    // un-primed fullPage shots render lazy images as empty frames (G5 lesson:
    // four phantom critic blockers came from un-scrolled evidence)
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => [...document.querySelectorAll('img')].every((i) => i.naturalWidth > 0 || i.loading !== 'lazy'), { timeout: 10000 }).catch(() => console.log(`warn: ${slug} has undecoded imgs at capture`));
    // for the stitched fullPage capture only: un-stick the top bar and hide the
    // FIXED thread elements. position:fixed elements smear across stitch tiles
    // (the mobile top progress line appeared to "cross" footer text — ship-panel
    // artifact). The rail is verified working separately (G6 audit); these are
    // page-content screenshots for design review, not motion evidence.
    await page.addStyleTag({ content: '.topbar{position:static !important}.thread-rail,.rail-index{display:none !important}' });
    await page.screenshot({ path: join(OUT, `${slug}--${vp.name}.png`), fullPage: true });
    console.log(`shot ${slug}--${vp.name}.png`);
  }
  await ctx.close();
}
await browser.close();
server.close();

if (consoleErrors.length) {
  console.error(`\n${consoleErrors.length} console error/warning(s) — V7 zero-console budget FAILS:`);
  for (const e of consoleErrors) console.error('  ' + e);
  process.exit(1);
}
console.log(`\nsweep complete: ${routes.length} pages × ${VIEWPORTS.length} viewports, zero console errors.`);
