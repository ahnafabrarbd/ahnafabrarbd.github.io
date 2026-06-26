/**
 * trim-logos.mjs — normalise logo aspect ratios (partners + accreditations).
 *
 * The source logo PNGs were exported onto uniform canvases (~151×76 partners,
 * ~129×90 accreditations), so most marks carry large transparent borders. Inside
 * the fixed-height "ink imprint" / band boxes (object-fit: contain) that padding
 * makes a wide, short logo render tiny and visually squashed. Sharp's .trim()
 * removes the uniform border so each file's intrinsic dimensions equal the actual
 * mark — contain then sizes them honestly. This is a lossless crop (no recolour,
 * no redraw, no generation); re-run any time the source logos are replaced.
 *
 *   node setup/trim-logos.mjs
 */
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

const dirs = ['src/assets/logos/partners', 'src/assets/logos/accreditations'];

let changed = 0;
let total = 0;
for (const dir of dirs) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.png'));
  } catch {
    continue; // directory absent — skip
  }
  console.log(`\n${dir}/`);
  for (const f of files) {
    total++;
    const p = `${dir}/${f}`;
    const before = await sharp(p).metadata();
    // threshold 10: trim near-uniform edge pixels (anti-aliased transparency),
    // keep a 0px halo. resolveWithObject so we can report the new box.
    const out = await sharp(p).trim({ threshold: 10 }).png().toBuffer({ resolveWithObject: true });
    if (out.info.width === before.width && out.info.height === before.height) {
      console.log(`  ${f.padEnd(32)} ${before.width}x${before.height} (already tight)`);
      continue;
    }
    await sharp(out.data).toFile(p);
    changed++;
    console.log(`✓ ${f.padEnd(32)} ${before.width}x${before.height} -> ${out.info.width}x${out.info.height}`);
  }
}
console.log(`\ntrim-logos: ${changed}/${total} logo(s) tightened.`);
