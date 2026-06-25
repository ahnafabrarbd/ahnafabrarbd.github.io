#!/usr/bin/env node
/**
 * postbuild — V7 §10: the launch runbook checks https://rizvifashions.com/sitemap_index.xml
 * (Yoast's old path). @astrojs/sitemap emits sitemap-index.xml; copy it so the
 * existing check still passes post-launch. robots.txt points at the canonical one.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const src = join(DIST, 'sitemap-index.xml');
if (!existsSync(src)) {
  console.error('postbuild: dist/sitemap-index.xml missing — sitemap integration broken?');
  process.exit(1);
}
copyFileSync(src, join(DIST, 'sitemap_index.xml'));
writeFileSync(
  join(DIST, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://rizvifashions.com/sitemap-index.xml\n',
);
console.log('postbuild: sitemap_index.xml copy + robots.txt written');
