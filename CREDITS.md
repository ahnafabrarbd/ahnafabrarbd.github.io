# CREDITS — every shipped library, font, asset, vendored module (+ licence, verified at source)

> Rule (§7): licence read from the actual LICENSE file/page before anything ships; unclear ⇒ reimplement or swap. Quotes below were verified 2026-06-10 (full record: `reference/design-research.json`).

## Typefaces

**Shipped (the only fonts in `dist/`):**

| Family | Foundry / Source | Licence |
|---|---|---|
| **Cormorant** (display) | Catharsis Fonts / Google Fonts — github.com/CatharsisFonts/Cormorant | SIL OFL 1.1 |
| **Montserrat** (body + utility) | Julieta Ulanovsky / Google Fonts — github.com/JulietaUla/Montserrat | SIL OFL 1.1 |

Self-hosted woff2 subsets (`cormorant-normal`, `cormorant-italic`, `montserrat`), preloaded. The earlier "rizvi-noir" bake-off candidates below are **historical and no longer ship** (the Clash/Switzer/Martian font files were removed); kept for the audit trail.

| Family (historical, not shipped) | Foundry / Source | Licence | Verification |
|---|---|---|---|
| Outward (Block) | Velvetyne Type Foundry (Raoul Audouin) — velvetyne.fr/fonts/outward, github.com/raoulaudouin/Outward | SIL OFL 1.1 | Stated on foundry page; GitHub licence detection OFL-1.1. OFL: "used, studied, modified and redistributed freely as long as they are not sold by themselves." |
| Apfel Grotezk (Satt, Fett) | Collletttivo — collletttivo.it, github.com/collletttivo/apfel-grotezk | SIL OFL 1.1 | LICENSE.txt in repo. |
| Mazius Display | Collletttivo — github.com/collletttivo/mazius-display | SIL OFL 1.1 | LICENSE.txt read raw: "This Font Software is licensed under the SIL Open Font License, Version 1.1". (Scouted; not in final three.) |
| Clash Display | Indian Type Foundry via Fontshare — fontshare.com/fonts/clash-display | ITF Free Font License v1.0 | Grant quoted from fontshare.com/licenses/itf-ffl: "non-exclusive, non-assignable, non-transferrable, terminable license to access, download and use the Font Software for your personal or commercial use for an unlimited period of time for free of charge … in any media (including Print, Web, Mobile, Digital, Apps, ePub, Broadcasting and OEM)". Fontshare download UI: "Download Fonts to use them locally or self-host them." Caveat honoured: self-host the downloaded kit only; no re-serving from public CDNs, no modification, no redistribution of files. |
| Cabinet Grotesk | ITF via Fontshare | ITF FFL v1.0 | Same verification. (Scouted; not in final three.) |
| Switzer | ITF via Fontshare | ITF FFL v1.0 | Same verification. |
| General Sans | ITF via Fontshare | ITF FFL v1.0 | Same verification. |
| Public Sans | USWDS — github.com/uswds/public-sans | SIL OFL 1.1 | README: "Public Sans is licensed under the SIL Open Font License, Version 1.1". True tabular figures documented. |
| Necto Mono | Collletttivo — github.com/collletttivo/necto-mono | SIL OFL 1.1 | LICENSE.txt in repo. Tabular by construction (monospace). |
| Martian Mono | Evil Martians — github.com/evilmartians/mono | SIL OFL 1.1 | Repo licence OFL-1.1. Tabular by construction. |
| JetBrains Mono | JetBrains — github.com/JetBrains/JetBrainsMono | SIL OFL 1.1 | README: "available under the OFL-1.1 License and can be used free of charge, for both commercial and non-commercial purposes. You do not need to give credit to JetBrains." |
| Archivo | Omnibus-Type via Google Fonts | SIL OFL | google/fonts METADATA.pb: license "OFL". (Scouted; not in final three.) |

## Illustration & icon triage (V7 §8.1 — every licence verified at the official source, 2026-06-10)

| Set | URL | Licence (verified) | Commercial | Attribution | Recolour/modify | Redistribution terms | Verdict |
|---|---|---|---|---|---|---|---|
| **Phosphor Icons** | github.com/phosphor-icons/core | MIT (LICENSE file) | ✓ | not required (licence text preserved in repo) | ✓ | ✓ incl. sell/sublicense | **ADOPTED — the one site-wide icon family (thin weight). D-016** |
| Lucide | github.com/lucide-icons/lucide | ISC (+MIT Feather-derived icons) | ✓ | notice must accompany copies | ✓ | ✓ | rejected (design fit: 2px default stroke vs our 1px hairline language; dual-licence lineage adds bookkeeping) |
| Tabler Icons | github.com/tabler/tabler-icons | MIT | ✓ | not required | ✓ | ✓ | rejected (design fit: rounded 2px strokes off-voice) |
| unDraw | undraw.co/license | unDraw licence (custom) | ✓ | not required | ✓ | ✗ no packs/competing-service compilation; AI/ML use barred | rejected (brand fit) — Flickity-class note: custom licence terms logged verbatim above |
| Open Peeps | openpeeps.com | CC0 | ✓ | not required | ✓ | ✓ | rejected (brand fit) |
| Open Doodles | opendoodles.com | CC0 | ✓ | not required | ✓ | ✓ | rejected (brand fit) |
| Humaaans | humaaans.com | CC0 | ✓ | not required | ✓ | ✓ | rejected (brand fit) |
| Lukasz Adam free sets | lukaszadam.com/illustrations | CC0 (site states "CC0 (MIT)") | ✓ | not required | ✓ | ✓ | rejected (brand fit) |

Brand-fit rejection rationale (D-016): the visual system is severe editorial-industrial (photography, cutouts, keylines); character/scene illustration sets would read as decoration-slop against §4. The §8 swappable-element law is satisfied via `src/illustrations/manifest.ts` (icons + decorative SVGs as one-line-swappable slots).

## JS libraries (added at G4/G6 — licence confirmed at install time and logged here)

| Library | Intended use | Licence status |
|---|---|---|
| GSAP + ScrollTrigger | motion layer (G6 — home hero weave only) | **VERIFIED at gsap.com/licensing 2026-06-10 (G6, before first import):** Standard "No Charge" GSAP License, a Webflow product — "Can I really use GSAP in commercial projects without paying anything? Yes, really!"; all plugins incl. ScrollTrigger/SplitText included; grant = "non-exclusive, worldwide license to use, reproduce, display, and implement GSAP Products"; sole restriction = no-code animation-builder tools competing with Webflow (inapplicable: this is a static brand site). |
| Lenis | smooth scroll | NOT installed — flag-gated G6 decision (D-015.4) |
| Astro + @astrojs/sitemap | framework | MIT (LICENSE in repo) |
| sharp | image pipeline (build-time) | Apache-2.0 |
| Playwright (dev-only) | QA screenshots/tracing | Apache-2.0 (dev dependency, not shipped) |
| @phosphor-icons/core (dev-only) | icon SVG source — 6 thin glyphs copied to src/illustrations/icons/ | MIT (verified at source; see triage table) |
| lighthouse (dev-only) | perf-gate | Apache-2.0 |

## Tooling (dev-only, not shipped)

- rembg (MIT) + onnxruntime (MIT) — cutout pipeline; models u2net/birefnet/cloth-seg fetched to ~/.u2net (dev machine only).
- gdown (MIT), Pillow (MIT-CMU) — asset intake.

## Imagery

- Owner assets: Drive folder `rizvi/STIL` (51 files) + live-site uploads (146 files) — owner-supplied; AI-provenance/third-party-IP flags recorded in RISKS R-008 for owner sign-off.
- No stock, no CC0 fillers shipped to date.

## Delivery confirmation (G8, 2026-06-11)

Everything that ships in `dist/` / `rizvi-site.zip` is accounted for above with a verified licence:
- **Fonts (self-hosted woff2 subsets):** Cormorant (display) + Montserrat (body/utility), both SIL OFL 1.1. 3 files (cormorant-normal, cormorant-italic, montserrat).
- **Motion:** GSAP + ScrollTrigger 3.15.0 (Webflow Standard "No-Charge" License — free commercial, verified at gsap.com/licensing) — loaded only on the home page, idle-deferred.
- **Icons:** 6 Phosphor glyphs (MIT) vendored into `src/illustrations/icons/` — the `@phosphor-icons/core` package was removed after vendoring (provenance retained here).
- **Imagery:** owner-supplied only (no third-party stock). AI-watermark / third-party-IP files flagged in RISKS R-008 are quarantined pending owner sign-off — they do not ship without it.
- **No adapted/vendored third-party code** beyond the above. The site loads nothing from any external origin at runtime.
