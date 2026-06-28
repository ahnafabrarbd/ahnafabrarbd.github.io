#!/usr/bin/env node
/**
 * token-lint — V7 §6.5: "silence equals defaults" enforcement, Astro edition.
 *
 * Ground truth: the single ```tokens fenced block in DESIGN.md.
 * Scans src/ for:
 *   .css          — full value scan
 *   .astro        — <style> blocks (value scan) + template (svg fill/stroke,
 *                   inline style=, perf-lint patterns)
 *   .svg          — fill/stroke/stop-color attributes
 * A raw value passes only if it appears verbatim in the token block or on the
 * structural allowlist. var(--x) always passes.
 *
 * Perf-lint (V7 §6.5, build-failing):
 *   - !important anywhere
 *   - layout properties inside transition/animation/@keyframes
 *   - <img without explicit width= and height= (Astro <Image> exempt — it emits them)
 *   - setInterval/setTimeout animation loops
 *   - define:vars (Astro XSS advisory GHSA-j687-52p2-xcff — unused by design)
 *
 * Usage: node setup/token-lint.mjs [srcDir]   (default: src/)
 * Exit 0 clean; exit 1 with a violation report.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'src');

// ---- 1. ground truth from DESIGN.md
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8');
const blocks = [...design.matchAll(/```tokens\n([\s\S]*?)```/g)];
if (blocks.length !== 1) {
  console.error(`token-lint: expected exactly one \`\`\`tokens block in DESIGN.md, found ${blocks.length}`);
  process.exit(1);
}
const tokenValues = new Set();
const tokenNames = new Set();
for (const line of blocks[0][1].split('\n')) {
  const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
  if (!m) continue;
  tokenNames.add(m[1]);
  const v = m[2].trim().toLowerCase();
  tokenValues.add(v);
  for (const part of v.split(/\s+/)) tokenValues.add(part);
}

// ---- 2. structural allowlist (not design decisions)
const ALLOW = new Set([
  '0', '0px', '0rem', '1px', '-1px', '100%', '50%', 'auto', 'none', 'inherit',
  'initial', 'unset', 'currentcolor', 'transparent', '1', '1em', '100vh', '100vw',
  '100svh', '100dvh', '100lvh',
]);

// ---- 3. file walk
function* files(dir) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (['.css', '.astro', '.svg'].includes(extname(e))) yield p;
  }
}

const VALUE_PATTERNS = [
  [/#[0-9a-fA-F]{3,8}\b/g, 'hex colour'],
  [/\b(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)/g, 'colour function'],
  [/\bcubic-bezier\([^)]*\)/g, 'easing'],
  [/(?<![\w-])-?\d*\.?\d+(?:px|rem|em|ms)\b/g, 'length/duration'],
];
const LAYOUT_PROPS = /\b(?:width|height|top|left|right|bottom|margin|padding|inset)\b/;
// runtime-state custom properties: JS-driven 0..1 scalars for transform-only
// animation (G6 motion layer). Not design tokens — no value to declare.
const RUNTIME_PROPS = new Set([
  '--progress',
  // hscroll parallax scalars: JS-written per frame (pinscroll.ts), referenced in
  // base.css via var(--x, fallback). No design value — like --progress.
  '--depth-bg', '--depth-fg', '--reveal',
  // heading word-rise scalars: --i (word index) / --n (word count) are JS-written
  // per word; --start / --local are component-scoped calc()s derived from them.
  // Plumbing for the scroll-coupled text reveal, not design tokens.
  '--i', '--n', '--start', '--local',
  // product-gallery image index (our-products.astro): per-<li> stagger delay for
  // the scroll-in accumulation. Same family as --i/--n — a runtime index, not a
  // design token.
  '--j',
  // bespoke-cursor follow scalars: premium.ts writes the lerped ring position
  // (--cursor-x/--cursor-y) and hover scale (--cursor-scale) per frame. Runtime
  // plumbing for transform-only cursor motion, not design tokens.
  '--cursor-x', '--cursor-y', '--cursor-scale',
]);
// every var(--x) reference and every --x: definition collected across the tree.
// after scanning, each reference must resolve to a real DEFINITION that ships
// (not merely a name in DESIGN.md) — that gap shipped --seam-w/--knot-len/
// --card-h referenced-but-undefined for two gates (G6 audit).
const referenced = new Map();
const defined = new Set();

let violations = 0, fileCount = 0;
const report = (file, line, msg) => {
  console.error(`${msg.padEnd(28)} ${file}:${line}`);
  violations++;
};

function scanCssText(file, css, lineOffset = 0) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); // keep line numbers
  // collect var(--x) REFERENCES before squashing them — every referenced token
  // must be defined somewhere, or the property silently drops at runtime
  // (G6 audit caught --seam-w/--knot-len/--card-h referenced but never defined).
  css.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (!referenced.has(m[1])) referenced.set(m[1], `${file}:${lineOffset + i + 1}`);
    }
  });
  css = css.replace(/var\(--[\w-]+(?:,[^)]+)?\)/g, 'var()');
  const lines = css.split('\n');
  let inKeyframes = false;
  lines.forEach((line, i) => {
    const n = lineOffset + i + 1;
    if (/@keyframes/.test(line)) inKeyframes = true;
    if (inKeyframes && /^\}/.test(line)) inKeyframes = false;
    if (/!important/.test(line)) report(file, n, 'PERF-LINT !important');
    if (/^\s*(?:transition|animation)[^:]*:/.test(line) && LAYOUT_PROPS.test(line))
      report(file, n, 'PERF-LINT layout animation');
    if (inKeyframes && LAYOUT_PROPS.test(line) && /:/.test(line))
      report(file, n, 'PERF-LINT layout keyframe');
    const def = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);?/);
    if (def) {
      defined.add(def[1]); // record the definition for the reference check
      // runtime-state custom properties (JS-driven scalars, not design values):
      // unitless 0..1 plumbing for transform-only animation — allowlisted by name.
      if (RUNTIME_PROPS.has(def[1])) return;
      if (!tokenNames.has(def[1])) report(file, n, `UNDECLARED TOKEN ${def[1]}`);
      else if (!tokenValues.has(def[2].trim().toLowerCase()))
        report(file, n, `TOKEN VALUE DRIFT "${def[2].trim()}"`);
      return;
    }
    for (const [re, kind] of VALUE_PATTERNS) {
      for (const m of line.matchAll(re)) {
        const raw = m[0].toLowerCase();
        if (ALLOW.has(raw) || tokenValues.has(raw)) continue;
        report(file, n, `UNTOKENED ${kind.toUpperCase()} ${m[0]}`);
      }
    }
  });
}

function scanMarkup(file, src) {
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    const n = i + 1;
    for (const attr of line.matchAll(/\b(?:fill|stroke|stop-color)="([^"]+)"/g)) {
      const v = attr[1].trim().toLowerCase();
      if (v.startsWith('var(') || ALLOW.has(v) || tokenValues.has(v)) continue;
      report(file, n, `UNTOKENED SVG COLOUR ${attr[1]}`);
    }
    for (const sty of line.matchAll(/\bstyle="([^"]+)"/g)) {
      report(file, n, `INLINE STYLE "${sty[1].slice(0, 40)}"`);
    }
    if (/<img\b(?![^>]*\bwidth=)/.test(line) || /<img\b(?![^>]*\bheight=)/.test(line))
      report(file, n, 'PERF-LINT <img> w/o dimensions');
    if (/\bset(?:Interval|Timeout)\s*\(/.test(line)) report(file, n, 'PERF-LINT timer animation');
    if (/define:vars/.test(line)) report(file, n, 'BANNED define:vars (GHSA-j687)');
  });
}

for (const file of files(SRC_DIR)) {
  fileCount++;
  const src = readFileSync(file, 'utf8');
  const ext = extname(file);
  if (ext === '.css') {
    scanCssText(file, src);
  } else if (ext === '.svg') {
    scanMarkup(file, src);
  } else {
    // .astro: style blocks as CSS, the rest as markup
    let markup = src;
    // skip SELF-CLOSING <style .../> (e.g. set:html injected CSS, scanned as its
    // own .css file): otherwise the regex treats it as an opener and slurps all
    // following markup up to the next </style> as phantom CSS (false positives).
    for (const m of src.matchAll(/<style(?![^>]*\/>)[^>]*>([\s\S]*?)<\/style>/g)) {
      const before = src.slice(0, m.index).split('\n').length - 1;
      scanCssText(file, m[1], before);
      markup = markup.replace(m[1], m[1].replace(/[^\n]/g, ' '));
    }
    scanMarkup(file, markup);
  }
}

// referenced-but-undefined: a var(--x) with no shipping definition resolves to
// nothing and silently drops the property at runtime. Checked against what is
// actually DEFINED in the CSS tree, not what DESIGN.md merely names.
for (const [name, where] of referenced) {
  if (!defined.has(name) && !RUNTIME_PROPS.has(name)) {
    console.error(`UNDEFINED TOKEN REF  ${where}  var(${name}) — no :root definition ships`);
    violations++;
  }
}

if (violations) {
  console.error(`\ntoken-lint: ${violations} violation(s) across ${fileCount} file(s). Gate FAILS.`);
  process.exit(1);
}
console.log(`token-lint: clean (${fileCount} file(s) scanned, ${tokenNames.size} tokens).`);
