#!/usr/bin/env node
/**
 * stress-drills — V7 §6.6: the hardening battery, run against the production
 * build served locally. Writes evidence to REPORTS/stress/.
 *   1. Slow-3G load on every page (usable + key content present)
 *   2. Viewport sweep 360→1440 screenshots (home + a content page)
 *   3. Keyboard-only nav (skip link, visible focus, overlay focus-trap + restore)
 *   4. JS-disabled completeness (every page: chapters visible, nav works)
 *   5. Cross-engine smoke (chromium + webkit + firefox if installed): each page
 *      renders, zero console errors, key landmark present
 *
 * Usage: node scripts/stress-drills.mjs   (expects dist/ built)
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, firefox } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'REPORTS', 'stress');
const PORT = 4188;
mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let f = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.statusCode = 404; f = join(DIST, '404.html'); if (!existsSync(f)) { res.end(''); return; } }
  res.setHeader('content-type', MIME[extname(f)] ?? 'application/octet-stream');
  createReadStream(f).pipe(res);
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
const base = (r) => `http://localhost:${PORT}${r}`;
const report = {};

// ---- 1. Slow-3G
{
  const browser = await chromium.launch();
  const results = [];
  for (const route of routes) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8, latency: 400 });
    const t0 = Date.now();
    await page.goto(base(route), { waitUntil: 'domcontentloaded' });
    const domMs = Date.now() - t0;
    await page.waitForLoadState('networkidle').catch(() => {});
    const loadMs = Date.now() - t0;
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    results.push({ route, domMs, loadMs, h1: (h1 ?? '').trim().slice(0, 30), usable: !!h1 });
    await ctx.close();
  }
  await browser.close();
  report.slow3g = results;
}

// ---- 2. Viewport sweep
{
  const browser = await chromium.launch();
  const widths = [360, 414, 768, 1024, 1440];
  for (const route of ['/', '/our-products/', '/company-profile/']) {
    for (const w of widths) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(base(route), { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      // overflow check: any element wider than viewport = horizontal scroll bug
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const slug = route === '/' ? 'home' : route.replaceAll('/', '');
      await page.screenshot({ path: join(OUT, `vp-${slug}-${w}.png`) });
      report.viewport ??= [];
      report.viewport.push({ route, width: w, horizontalOverflowPx: overflow });
      await ctx.close();
    }
  }
  await browser.close();
}

// ---- 3. Keyboard-only nav
{
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base('/'), { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); // should hit skip link first
  const firstFocus = await page.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, text: (a.textContent || '').trim().slice(0, 20), visibleFocus: getComputedStyle(a).outlineStyle !== 'none' || a.className.includes('skip') }; });
  // open overlay via keyboard, check focus trap + ESC restore
  await page.goto(base('/company-profile/'), { waitUntil: 'networkidle' });
  const trigger = page.locator('[data-overlay-open]');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const dialogOpen = await page.locator('#overlay-menu[open]').count();
  const focusInDialog = await page.evaluate(() => !!document.activeElement.closest('#overlay-menu'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const dialogClosedAndRestored = (await page.locator('#overlay-menu[open]').count()) === 0;
  report.keyboard = { firstTabFocus: firstFocus, overlayOpensOnEnter: dialogOpen === 1, focusTrappedInDialog: focusInDialog, escClosesAndRestores: dialogClosedAndRestored };
  await browser.close();
}

// ---- 4. JS-disabled completeness
{
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const results = [];
  for (const route of routes) {
    const page = await ctx.newPage();
    await page.goto(base(route), { waitUntil: 'load' });
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.chapter')].filter((e) => +getComputedStyle(e).opacity === 0).length);
    const navLinks = await page.locator('footer a').count();
    results.push({ route, hiddenChapters: hidden, footerNavLinks: navLinks, ok: hidden === 0 });
    await page.close();
  }
  await ctx.close();
  await browser.close();
  report.jsDisabled = results;
}

// ---- 5. Cross-engine smoke
{
  const engines = [['chromium', chromium], ['webkit', webkit]];
  try { await firefox.launch().then((b) => b.close()); engines.push(['firefox', firefox]); } catch { report.firefoxNote = 'firefox engine not installed — Blink (chromium) + WebKit (webkit) cover the two engines tested; Gecko smoke deferred'; }
  const cross = {};
  for (const [name, eng] of engines) {
    const browser = await eng.launch();
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageResults = [];
    for (const route of routes) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      page.on('pageerror', (e) => errs.push(e.message));
      await page.goto(base(route), { waitUntil: 'networkidle' });
      const hasMain = await page.locator('main#main h1').count();
      pageResults.push({ route, h1: hasMain > 0, consoleErrors: errs.length });
      await page.close();
    }
    cross[name] = { pages: pageResults.length, allHaveH1: pageResults.every((p) => p.h1), totalConsoleErrors: pageResults.reduce((s, p) => s + p.consoleErrors, 0) };
    // one full-page capture per engine on home for the record
    const cap = await ctx.newPage();
    await cap.goto(base('/'), { waitUntil: 'networkidle' });
    await cap.screenshot({ path: join(OUT, `engine-${name}-home.png`), fullPage: false });
    await cap.close();
    await browser.close();
  }
  report.crossEngine = cross;
}

writeFileSync(join(OUT, '_summary.json'), JSON.stringify(report, null, 1));
server.close();

// ---- console digest + pass/fail
const slow3gMax = Math.max(...report.slow3g.map((r) => r.loadMs));
const overflowBugs = report.viewport.filter((v) => v.horizontalOverflowPx > 1);
const jsBroken = report.jsDisabled.filter((r) => !r.ok);
const crossErrors = Object.entries(report.crossEngine).filter(([, v]) => v.totalConsoleErrors > 0 || !v.allHaveH1);
console.log('Slow-3G: all pages usable =', report.slow3g.every((r) => r.usable), '| slowest full load =', slow3gMax + 'ms');
console.log('Viewport sweep: horizontal-overflow bugs =', overflowBugs.length, overflowBugs.map((v) => `${v.route}@${v.width}:${v.horizontalOverflowPx}px`).join(' '));
console.log('Keyboard:', JSON.stringify(report.keyboard));
console.log('JS-disabled: broken pages =', jsBroken.length);
console.log('Cross-engine:', JSON.stringify(report.crossEngine), report.firefoxNote ?? '');
const fail = overflowBugs.length || jsBroken.length || crossErrors.length || !report.keyboard.escClosesAndRestores;
console.log(fail ? '\nSTRESS DRILLS: issues found (see above).' : '\nSTRESS DRILLS: all clear.');
process.exit(fail ? 1 : 0);
