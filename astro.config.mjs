// V7 §3/§6: static output, site set for canonical URLs + sitemap, sharp images,
// prefetch for instant-nav feel. Slugs end in "/" on the live site — trailingSlash
// 'always' + directory format preserves them byte-exact (RAILS §4).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // live origin for canonical URLs + sitemap (GitHub Pages user site, served at
  // root so no `base` is needed). Flip back to https://rizvifashions.com if the
  // project later moves to its own domain.
  site: 'https://ahnafabrarbd.github.io',
  output: 'static',
  trailingSlash: 'always',
  // inline ALL stylesheets: removes the render-blocking external-CSS round
  // trip from the critical chain (G5 refactor: text-LCP pages sat at 2.3-2.7s
  // simulated with the shared CSS chunk external; HTML stays ≤35KB gz)
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap()],
  // prefetch OFF (G5 refactor): the 2KB head module script sits in the
  // pessimistic first-paint graph and held image-LCP pages over the §6.1
  // budget. V7 §6.2 calls prefetch a nicety; Law 1 says speed wins — cut
  // logged in DECISIONS.md, revisit at G6 inside the JS budget.
  prefetch: false,
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
