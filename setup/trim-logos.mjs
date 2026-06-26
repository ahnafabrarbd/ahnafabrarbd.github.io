/**
 * trim-logos.mjs — normalise partner-logo aspect ratios.
 *
 * The source partner PNGs were exported onto a uniform ~151×76 canvas, so most
 * marks carry large transparent borders. Inside the fixed-height "ink imprint"
 * box on /partners/ (object-fit: contain) that padding makes a wide, short logo
 * render tiny and visually squashed. Sharp's .trim() removes the uniform border
 * so each file's intrinsic dimensions equal the actual mark — contain then sizes
 * them honestly. This is a lossless crop (no recolour, no redraw, no generation);
 * re-run it any time the source logos are replaced.
 *
 *   node setup/trim-logos.mjs
 */
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

const dir = 'src/assets/logos/partners';
const files = (await readdir(dir)).filter((f) => f.endsWith('.png'));

let changed = 0;
for (const f of files) {
  const p = `${dir}/${f}`;
  const before = await sharp(p).metadata();
  // threshold 10: trim near-uniform edge pixels (anti-aliased transparency),
  // keep a 0px halo. resolveWithObject so we can report the new box.
  const out = await sharp(p).trim({ threshold: 10 }).png().toBuffer({ resolveWithObject: true });
  if (out.info.width === before.width && out.info.height === before.height) {
    console.log(`  ${f.padEnd(24)} ${before.width}x${before.height} (already tight)`);
    continue;
  }
  await sharp(out.data).toFile(p);
  changed++;
  console.log(`✓ ${f.padEnd(24)} ${before.width}x${before.height} -> ${out.info.width}x${out.info.height}`);
}
console.log(`\ntrim-logos: ${changed}/${files.length} logo(s) tightened.`);
