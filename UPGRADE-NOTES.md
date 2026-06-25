# Dependency Upgrade — June 2026

Branch: `dependency-upgrade` (off the live branch). Rollback point: `pre-dependency-upgrade-backup`.

## What was upgraded

| Package | From | To | Type |
|---|---|---|---|
| astro | 5.18.2 | **7.0.2** | major ×2 (5→6→7) |
| sharp | 0.34.5 | 0.35.2 | minor |
| lenis | 1.3.23 | 1.3.24 | patch |
| playwright (dev) | 1.57.0 | 1.61.1 | minor |

Already at latest, untouched: `@astrojs/sitemap` 3.7.3, `gsap` 3.15.0, `ogl` 1.0.11, `lighthouse` 13.4.0.

## What broke

**Nothing.** Astro 5→6 and 6→7 both built with zero code changes. This project uses content
collections (`getEntry`/`getCollection`/`defineCollection`), `astro:assets` (`<Image>`/`getImage`),
and `@astrojs/sitemap` — all of which are stable across 5→7. No config syntax, integration option,
content-collection, image-handling, TypeScript, or import changes were required.

The upgrade was done in stages, building after each:
1. minor/patch (sharp, lenis, playwright) — build clean
2. astro 5 → 6 — build clean
3. astro 6 → 7 — build clean

Each stage is its own commit so any stage can be rolled back independently.

## Security

- **Before:** 19 vulnerabilities (1 high, 17 moderate, 1 low).
- **After:** 17 moderate — **all transitive under `lighthouse`** (a dev-only perf tool, never shipped).
- **Production audit (`npm audit --omit=dev`): 0 vulnerabilities.** The high + low (an esbuild
  dev-server advisory) cleared by moving to Astro 7. The remaining lighthouse ones would only clear
  by downgrading lighthouse to a breaking dev build — not worth it for a local tool that never reaches users.

## Verified

- `npm run build` — clean, 12 pages.
- `npm run dev` — boots clean, HTTP 200, no errors.
- Home, Products, Capabilities, Partners, Overview, Contact — all render, correct headings, **zero console errors**.
- `npm run lint:tokens` — clean.

## Notes for next time

- Astro 7's `astro dev` now runs as a background daemon (`astro dev stop|status|logs`) — cosmetic, no action needed.
- The GitHub Pages deploy workflow pins Node 20; GitHub's runner now forces Node 24 for the deploy
  action (a harmless deprecation warning). Bump `node-version` in `.github/workflows/deploy.yml` to 24
  whenever convenient.
