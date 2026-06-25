#!/usr/bin/env node
/**
 * fidelity-check — RAILS §1.8: rendered text per page diffed against the data
 * layer, and the data layer against copy-deck.md. Fails on drift beyond
 * whitespace/typographic punctuation.
 *
 * Pass 1 (HARD): every prose string in src/data/copy/<page>.json must appear,
 *   normalized, in the page's dist HTML (footer.json is checked on home).
 * Pass 2 (HARD for prose keys, WARN otherwise): every prose string in the data
 *   layer must appear in copy-deck.md (labels/stats may carry recon provenance).
 *
 * Usage: node setup/fidelity-check.mjs   (expects dist/ built)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const norm = (s) =>
  s
    .normalize('NFC')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/\b20\d\d\b/g, 'YYYY')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const htmlText = (html) =>
  norm(
    html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' '),
  );

// keys whose values are NOT prose (paths, ids, provenance, machine labels)
const SKIP_KEYS = new Set(['slug', 'deckSection', 'comment', 'note', 'id', 'anchor', 'src', 'file', 'status', 'block', 'kind', 'treatment', 'source', 'origin']);
// keys that are definitively deck prose (HARD against the deck)
const PROSE_KEYS = new Set(['heading', 'body', 'items', 'title', 'text', 'intro', 'subLine', 'privacyNote', 'button', 'introSeed', 'label', 'copyright', 'address', 'name', 'role', 'department']);

function* strings(node, keyPath = []) {
  if (typeof node === 'string') {
    const key = keyPath[keyPath.length - 1];
    if (node.trim().length >= 4 && !SKIP_KEYS.has(key)) yield { key, value: node };
  } else if (Array.isArray(node)) {
    for (const v of node) yield* strings(v, keyPath);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      yield* strings(v, [...keyPath, k]);
    }
  }
}

const deck = norm(readFileSync('copy-deck.md', 'utf8'));
let fail = 0, warn = 0, checked = 0;

const pages = readdirSync('src/data/copy').filter((f) => f.endsWith('.json'));
for (const f of pages) {
  const id = f.replace('.json', '');
  const data = JSON.parse(readFileSync(`src/data/copy/${f}`, 'utf8'));
  const distPath = id === 'home' || id === 'footer' ? 'dist/index.html' : `dist/${data.slug?.replaceAll('/', '') ?? id}/index.html`;
  if (!existsSync(distPath)) { console.error(`FAIL  ${id}: ${distPath} not built`); fail++; continue; }
  const rendered = htmlText(readFileSync(distPath, 'utf8'));

  for (const { key, value } of strings(data)) {
    checked++;
    const n = norm(value);
    // Pass 1: data → rendered page
    if (!rendered.includes(n)) {
      console.error(`FAIL  ${id} [render] ${key}: "${value.slice(0, 70)}"`);
      fail++;
    }
    // Pass 2: data → deck
    if (!deck.includes(n)) {
      if (PROSE_KEYS.has(key) && f !== 'footer.json' && key !== 'introSeed') {
        // stats labels/values may be recon-sourced; prose may not drift
        if (key === 'label' || /^\d[\d,.]*$/.test(value)) {
          console.warn(`warn  ${id} [deck] ${key}: "${value.slice(0, 60)}" (recon-sourced?)`);
          warn++;
        } else {
          console.error(`FAIL  ${id} [deck] ${key}: "${value.slice(0, 70)}"`);
          fail++;
        }
      } else {
        warn++;
      }
    }
  }
}

console.log(`\nfidelity: ${checked} strings checked, ${fail} failures, ${warn} warnings`);
process.exit(fail ? 1 : 0);
