#!/usr/bin/env node
/**
 * stage-remaining — G5 P1 closure: every image-map slot resolvable.
 * 1. Grades section/drive photos that slots reference but src/assets lacks
 *    (same recipe as grade-photos.py: sat ×0.88, black-point → ground 10).
 * 2. Repoints portrait slots to the byte-exact copies in assets/portraits/.
 * 3. Wires pending-cutout slots (hero-weave, overview.range, products.*) to
 *    the staged QA-passed cutouts, carrying the curator's subject lines as alt.
 *    07_m never ships (duplicate of 08_m, CUTOUTS_TODO resolution).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';

const MAP = 'src/data/image-map.json';
const map = JSON.parse(readFileSync(MAP, 'utf8'));
const staged = new Set(readdirSync('src/assets/cutouts').map((f) => f.replace('.png', '')));

// ---- 1. collect missing photo srcs (slots + gallery items)
const wanted = new Set();
for (const [page, slots] of Object.entries(map)) {
  if (page === '_meta') continue;
  for (const s of Object.values(slots)) {
    if (s.src && !s.src.startsWith('svg:')) wanted.add(s.src);
    for (const it of s.items ?? []) if (it.src) wanted.add(it.src);
  }
}
const missing = [...wanted].filter((src) => !existsSync('src/' + src.replace(/^\/?(src\/)?/, '')));

// find each missing file in the reference mirrors by basename
const SEARCH_DIRS = ['reference/site-assets/section', 'reference/site-assets/misc', 'reference/drive/rizvi/STIL', 'reference/drive/rizvi'];
const toGrade = [];
for (const src of missing) {
  if (src.includes('portraits') || src.includes('avatar') || src.includes('Rezwan')) continue; // portraits handled below
  const base = basename(src);
  const hit = SEARCH_DIRS.map((d) => `${d}/${base}`).find((p) => existsSync(p));
  if (hit) toGrade.push([hit, 'src/' + src.replace(/^\/?(src\/)?/, '')]);
  else console.log(`UNRESOLVED source for ${src} — flag for IMAGES_TODO`);
}

if (toGrade.length) {
  const py = `
import sys, json
from pathlib import Path
from PIL import Image, ImageEnhance
BP_TARGET = 10
def grade(src, dst):
    im = Image.open(src).convert('RGB')
    im = ImageEnhance.Color(im).enhance(0.88)
    px = sorted(im.convert('L').getdata())
    bp = px[max(0, int(len(px) * 0.004))]
    lo, hi = bp, 255
    lut = [min(255, max(BP_TARGET, round(BP_TARGET + (v - lo) * (255 - BP_TARGET) / max(1, hi - lo)))) if v >= lo else BP_TARGET for v in range(256)]
    im = im.point(lut * 3)
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, quality=90, optimize=True)
    print(f'graded {src} -> {dst} {im.size}')
for src, dst in json.loads(sys.argv[1]):
    grade(src, dst)
`;
  execFileSync('.venv/bin/python3', ['-c', py, JSON.stringify(toGrade)], { stdio: 'inherit' });
}

// ---- 2. portraits: byte-exact copies live in assets/portraits/
map.management['chairman-portrait'].src = 'assets/portraits/avatar-1577909_1280.webp';
map.management['director-portrait'].src = 'assets/portraits/Shaikh-Rezwan-Director-Sir.jpg';

// ---- 3. cutout slot wiring
const cut = (stem) => `assets/cutouts/${stem}.png`;
const available = (cands) =>
  cands
    .map((c) => (typeof c === 'string' ? { file: c, subject: '' } : c))
    .map((c) => ({ stem: c.file.replace(/\.(jpeg|jpg|png)$/i, ''), subject: c.subject ?? '', quality: c.quality ?? 0 }))
    .map((c) => (c.stem === '07_m' ? { ...c, stem: '08_m' } : c)) // duplicate repoint
    .filter((c) => staged.has(c.stem));

const hero = available(map.home['hero-weave'].candidates).slice(0, 5);
map.home['hero-weave'] = {
  status: 'final-seed',
  note: 'hero weave panels — QA-passed cutouts, decorative (empty alt by design); chosen ' + hero.map((h) => h.stem).join('/'),
  items: hero.map((h) => ({ src: cut(h.stem), alt: '' })),
};
const range = available(map.overview.range.candidates).slice(0, 3);
map.overview.range = {
  status: 'final-seed',
  note: 'overview range constellation',
  items: range.map((h) => ({ src: cut(h.stem), alt: h.subject })),
};
for (const catKey of ['mens', 'womens', 'kids', 'underwear', 'newborn']) {
  const slot = map.products[catKey];
  if (!slot?.candidates) continue;
  const items = available(slot.candidates).sort((a, b) => b.quality - a.quality);
  map.products[catKey] = {
    status: items.length ? 'final-seed' : 'todo-pipeline',
    note: `${slot.note} — ${items.length} QA-passed of ${slot.candidates.length} candidates (rest follow birefnet re-mattes)`,
    items: items.map((c) => ({ src: cut(c.stem), alt: c.subject })),
  };
}

writeFileSync(MAP, JSON.stringify(map, null, 1) + '\n');
console.log(`image-map updated: hero ${hero.length} panels, range ${range.length}, products wired; ${toGrade.length} photos graded`);
