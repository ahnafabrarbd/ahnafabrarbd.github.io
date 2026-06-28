# HANDOFF — developer guide (for Zafir)

The Rizvi Fashions site is a **from-scratch Astro static site** (no WordPress, no
CMS, no server runtime). It builds to a folder of plain files you upload to
`public_html`. Hand-written CSS on a design-token system; near-zero JavaScript.

## Run it

```bash
npm install          # once
npm run dev          # local dev server (hot reload)
npm run build        # production build → dist/  (runs astro build + postbuild)
npm run preview      # serve the production build locally, exactly as it ships
```

Quality gates (all must pass before shipping a change):

```bash
npm run lint:tokens  # every colour/size/space/easing must be a DESIGN.md token;
                     # also fails on !important, layout-animation, undefined tokens
npm run perf-gate    # builds, serves dist/, runs Lighthouse on EVERY page;
                     # fails any page below 95/95/95/95 or over the byte budgets
npm run screens      # screenshots every page (mobile + desktop) → REPORTS/screens/
node scripts/stress-drills.mjs   # Slow-3G, viewport sweep, keyboard, cross-engine
```

Node 20+; the only production dependencies are `astro`, `@astrojs/sitemap`,
`sharp`, `gsap`. Versions are pinned exact — keep them that way.

## Project map

```
src/
  pages/            one .astro file per URL (file-based routing → the slug)
  layouts/Base.astro   the global shell: <head> meta, header, footer, thread rail
  components/        PhotoChapter, SpecBlock, LogoBand, GrowthChart, ProductRail,
                     Breather, PullQuote, Icon, Header, Footer, OverlayMenu, ThreadRail
  styles/            tokens.css (the design system) · base.css · showpiece.css
  motion/            core.ts (rail, reveals, count-up, knot) · weave.ts (home hero)
  config/flags.ts    every effect is a one-line on/off switch (see below)
  illustrations/     manifest.ts + icons/*.svg  (swappable, see below)
  data/              copy/*.json (page text) · image-map.json (image slots) ·
                     partners.json · accreditations.json · charts.json
  lib/images.ts      resolves an image-map slot to a built, responsive image
setup/               extract-copy.mjs (deck → JSON), token-lint, perf-gate helpers
public/              .htaccess, fonts/, favicons, contact.php — copied as-is to dist/
copy-deck.md         the approved copy (READ-ONLY source of truth)
DESIGN.md            the design system — the ground truth token-lint enforces
RAILS.md             the hard rails (palette, slugs, anchors, no-copying…)
DECISIONS.md         every decision with its reasoning and how to reverse it
```

## Feature flags — `src/config/flags.ts`

Flip any to `false`, rebuild, and that effect simply stops shipping:

| Flag | Effect |
|---|---|
| `snapDeck` | **the site is a vertical snap deck** — every section is a full-screen panel, scroll snaps to the next (native CSS scroll-snap, 0KB, works with JS off); a bold pink bar tracks position. Set false to return to document scroll |
| `threadRail` | the pink scroll-progress bar (bold + full-height in deck mode); the section-label index is hidden in deck mode |
| `seamStitches` | the dashed thread stitch drawn at each chapter boundary |
| `reveals` | chapters rise + fade as they enter view |
| `countUp` | spec numbers count up on first view (final value always in the HTML) |
| `knotDraw` | the footer selvedge-knot draws itself on reveal |
| `railKeys` | arrow-key scrolling inside the product galleries |
| `heroWeave` | the home cutout-panel weave entrance (GSAP, home page only) |
| `unbrokenThread` | **the showpiece** — the thread stays continuous across page navigation (cross-document View Transitions; 0KB) |
| `productsPin` | Products page = pinned horizontal scroll gallery on desktop (GSAP); vertical category list is the mobile / reduced-motion / no-JS fallback |
| `pinAllPages` | site-wide cinematic scroll — every chapter fades + lifts coupled to scroll (GSAP, desktop only); the document scroll + lighter reveals are the mobile / reduced-motion / no-JS fallback |
| `storyStage` | Home Mission/Vision/Manufacturing pin as one frame and crossfade on scroll (GSAP, desktop only); three stacked scenes are the mobile / reduced-motion / no-JS fallback |
| `preloader` | OFF — the loading-screen idea was rejected on speed grounds (D-020) |

Every effect also has a **reduced-motion** version that runs automatically for
visitors who prefer less animation, and the whole site works with **JavaScript
off** (the animations just don't run; nothing breaks).

## How copy flows (never hand-type page text)

`copy-deck.md` is the approved copy. `setup/extract-copy.mjs` parses it into
`src/data/copy/*.json`; pages read those via Astro content collections. To change
wording: edit `copy-deck.md`, run `node setup/extract-copy.mjs`, rebuild. The text
is checked letter-for-letter against the deck by `setup/fidelity-check.mjs`.

## How images work — slots, not files

Every image position is a **named slot** in `src/data/image-map.json`
(`page → slot → { src, alt }`). To swap an image, change the `src` of its slot to
another file under `src/assets/` and rebuild — the page picks it up, generates
responsive sizes, and never ships a broken link (a dead slot fails the build).

## Illustrations — one-line swap (worked example)

Every icon/illustration is referenced through `src/illustrations/manifest.ts`.
To swap the environmental "water" glyph from the droplet to, say, a faucet:

1. Drop the new SVG in `src/illustrations/icons/` (e.g. `faucet.svg`).
2. Change **one line** in `manifest.ts`:

   ```diff
   - 'env-water': icon('drop'),
   + 'env-water': icon('faucet'),
   ```

3. Rebuild. Done — the new glyph appears everywhere that slot is used. (Icons
   inherit the page colour via `currentColor`, so they stay on-palette
   automatically.) Removing a slot leaves the page intact — illustrations are
   decorative, never structural.

## The contact form, and how to swap it

`public/contact.php` is a small self-hosted handler (honeypot + time-trap + rate
limit, emails `info@rizvifashions.com`). If you ever want a no-server option:
sign up for **Web3Forms** (free), get an access key, and change the contact form
in `src/pages/contact.astro`:

```diff
- <form method="POST" action="/contact.php">
+ <form method="POST" action="https://api.web3forms.com/submit">
+   <input type="hidden" name="access_key" value="YOUR-KEY-HERE" />
```

Keep the honeypot field and the `mailto:` fallback either way.

## The `.htaccess`

`public/.htaccess` ships to `dist/`. The only thing to keep in sync: Astro emits
fingerprinted files under `/_astro/` — those cache for a year; HTML is always
short-cached so content edits show immediately. Every block is `<IfModule>`-guarded
and additive — it won't fight your host's existing config.

## If the owner wants Google Analytics later

The site ships with **zero analytics** by design (the owner's call). To add GA4:
put the standard gtag snippet in `Base.astro`'s `<head>`, add `https://www.google-analytics.com`
and `https://www.googletagmanager.com` to the `.htaccess` Content-Security-Policy
`script-src`/`connect-src`, and rebuild. That's the whole change.

## v2 roadmap (ideas, not commitments)

- Real art-directed factory photography (the current imagery is resolution-honest
  but the owner's stock is low-res — see IMAGES_TODO.md).
- The hero "wordmark-draw" beat: `src/illustrations/wordmark.svg` is a traced
  vector of the logo (path length ~6743px) ready to animate the thread drawing the
  wordmark inside the hero at load.
- Replace the ~11 product cutouts that have in-photo defects (visible mannequins,
  maker's stamps, hanging hardware) with cleaner source shots from the owner
  (see CUTOUTS_TODO.md).
- A real Partners-page intro line and the "All Partners" labels (currently seed
  copy — owner to approve).
