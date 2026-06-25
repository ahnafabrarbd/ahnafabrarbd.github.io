/**
 * make-grain.mjs — author the hscroll film-grain tile (V7 Law 2: self-authored,
 * no third-party licence). Run once: `node scripts/make-grain.mjs`.
 * A 160px seamless RGBA tile of sparse near-black specks at LOW alpha on a fully
 * transparent ground, so under `mix-blend-mode: multiply` at opacity 0.5 it adds
 * only a faint tooth to the warm ground and never dims text. Deterministic LCG
 * → reproducible, tiny (<8KB), well inside the 900KB home budget.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const S = 160;
const buf = Buffer.alloc(S * S * 4);
let seed = 0x9e3779b9;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff);

for (let i = 0; i < S * S; i++) {
  const v = 36; // near-black speck
  const a = Math.floor(rnd() * 30); // 0..29 → mostly transparent, faint tooth
  buf[i * 4] = v;
  buf[i * 4 + 1] = v;
  buf[i * 4 + 2] = v;
  buf[i * 4 + 3] = a;
}

mkdirSync('public/textures', { recursive: true });
await sharp(buf, { raw: { width: S, height: S, channels: 4 } })
  .png({ compressionLevel: 9, palette: true, colours: 16 })
  .toFile('public/textures/grain.png');

console.log('wrote public/textures/grain.png (160x160 RGBA grain tile)');
