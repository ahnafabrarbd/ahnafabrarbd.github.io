#!/usr/bin/env node
/**
 * link-check — RAILS §1.11 (V6 §18): zero internal 404s, zero dead anchors,
 * crawled from the built dist/. External links are listed, not fetched
 * (production hosts get nothing from the build machine).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
function* htmlFiles(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (e.endsWith('.html')) yield p;
  }
}

const ids = new Map(); // dist html path -> Set of element ids
const pages = [...htmlFiles(DIST)];
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  ids.set(p, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
}

const resolve = (path) => {
  const clean = path.replace(/\/+$/, '');
  const candidates = [join(DIST, clean, 'index.html'), join(DIST, clean), join(DIST, clean + '.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
};

let fail = 0, external = new Set(), checked = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    if (/^https?:\/\//.test(url)) { external.add(url); continue; }
    checked++;
    const [path, anchor] = url.split('#');
    if (path === '') {
      // same-page anchor
      if (anchor && !ids.get(p).has(anchor)) { console.error(`FAIL ${p}: dead same-page anchor #${anchor}`); fail++; }
      continue;
    }
    const target = resolve(path);
    if (!target) { console.error(`FAIL ${p}: broken link ${url}`); fail++; continue; }
    if (anchor && target.endsWith('.html') && !ids.get(target)?.has(anchor)) {
      console.error(`FAIL ${p}: dead anchor ${url}`);
      fail++;
    }
  }
}

console.log(`\nlink-check: ${checked} internal refs across ${pages.length} pages, ${fail} failures`);
console.log(`external (not fetched): ${[...external].join(' ') || 'none'}`);
process.exit(fail ? 1 : 0);
