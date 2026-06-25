# Rizvi Fashions — Corporate Profile (redesign)

A high-end, editorial corporate-profile website for **Rizvi Fashions Limited**, a B2B garment
manufacturer. Built as a fast, static **Astro 5** site with a desktop horizontal "corridor"
scroll experience (GSAP + Lenis), an off-white / forest-green two-colour scheme, and a
Cormorant + Montserrat type system.

**Live site:** https://ahnafabrarbd.github.io/

> Heads-up for tinkering: the immersive horizontal-scroll "corridor", the dot scroll
> indicator, and the word-by-word title reveals are **desktop-only** (viewport ≥ 1025px,
> and only when the OS isn't set to *reduce motion*). On mobile / reduced-motion the same
> pages render as a clean vertical document — that's by design, not a bug.

## Run it locally

Requires **Node 20+**.

```bash
npm install
npm run dev       # dev server at http://localhost:4321
```

Other scripts:

```bash
npm run build     # production build into dist/ (+ sitemap/robots postbuild)
npm run preview   # serve the production build locally
npm run lint:tokens   # design-token guard: every colour/size must be a declared token
```

## How it's put together

- **`src/pages/`** — one Astro page per route (overview, capabilities, products, partners, …).
- **`src/components/`** — building blocks (Header, PhotoChapter, SpecBlock, OverlayMenu, …).
- **`src/styles/`** — `tokens.css` (the design system) + `base.css` (everything else).
  All colours/sizes are **tokens**; `npm run lint:tokens` fails the build on a raw hex/px
  that isn't declared in `DESIGN.md`.
- **`src/motion/`** — the motion layer. `pinscroll.ts` is the horizontal corridor engine
  (pin + scrub + Lenis smooth-scroll + the dots bar + the title reveals). `core.ts` is the
  small always-on layer (rail fill, count-ups, reveals).
- **`src/data/` & `src/content/`** — copy and the image-slot map (`image-map.json`).
- **`src/assets/`** — imagery, run through Astro's sharp pipeline at build time.

### A few load-bearing rules

- **Two-colour scheme:** warm off-white ground `#F8F6F2` + forest green `#1A3828`
  (the `--pink` token name is legacy — its value is the green). Keep new elements on it.
- **Tokens, not magic numbers:** to add a value, add the identical line to **both**
  `DESIGN.md`'s `tokens` block and `src/styles/tokens.css`, or `lint:tokens` will fail.
- **Motion is transform/opacity only** and respects `prefers-reduced-motion`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages.

## Stack

Astro 5 · GSAP · Lenis · sharp · vanilla CSS (no Tailwind/React) · zero client JS on content
pages except the motion layer.
