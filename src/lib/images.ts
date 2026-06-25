/**
 * Image-slot resolution — RAILS §1.11 "Image slots, not files": pages name a
 * slot from src/data/image-map.json; this helper turns the slot's src path into
 * an Astro ImageMetadata for the sharp pipeline (derivatives + dimensions).
 */
import type { ImageMetadata } from 'astro';
import imageMap from '../data/image-map.json';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/**/*.{jpg,jpeg,png,webp}',
);

export interface ImageSlot {
  src?: string;
  status?: string;
  alt?: string;
  origin?: string;
  note?: string;
}

export function slot(page: string, name: string): ImageSlot {
  const pageMap = (imageMap as Record<string, Record<string, ImageSlot>>)[page];
  const s = pageMap?.[name];
  if (!s) throw new Error(`image-map: no slot ${page}.${name}`);
  return s;
}

export async function resolveImage(srcPath: string): Promise<ImageMetadata> {
  const key = '../' + srcPath.replace(/^\/?(src\/)?/, '');
  const mod = modules[key];
  if (!mod) throw new Error(`image not in src/assets: ${srcPath} (key ${key})`);
  return (await mod()).default;
}

/** Convenience: resolve a slot straight to metadata + alt (build-fails on a dead slot). */
export async function slotImage(page: string, name: string) {
  const s = slot(page, name);
  if (!s.src) throw new Error(`image-map slot ${page}.${name} has no src (status: ${s.status})`);
  return { image: await resolveImage(s.src), alt: s.alt ?? '', note: s.note };
}
