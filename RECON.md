# RECON — G1 findings (2026-06-10, public crawl; .env absent → cPanel ladder skipped, D-003)

Machine-readable companion: `reference/recon-workflow.json` (per-page outlines, full image inventories, stack evidence). Raw HTML + headers: `reference/crawl/`.

## Server & stack

- **PHP 8.0.30** (`x-powered-by` response header) → **theme compatibility floor = PHP 8.0** (not the default 8.1 assumption).
- LiteSpeed, HTTP/2+h3, HSTS. WordPress with REST API exposed (`/wp-json/`).
- Theme: **JupiterX v2.0.4** + JupiterX Core v7.0 (Raven widgets). Page builder: **Elementor 3.13.2**.
- Plugins detected: Jet Blog 2.3.1, Jet Elements 2.6.9, Jet Popup 2.0.0, Jet Tabs 2.1.21, Menu Icons 0.13.5, ThePlus Elementor Addon 5.1.3, **MonsterInsights 8.16 → GA4 `G-J1B3RTG2HV`** (soft navigations MUST re-fire this pageview).
- **Yoast: NOT detected in production HTML** (no yoast-schema-graph, no og:/twitter: meta, no wpseo handles). The brief asserts wordpress-seo is installed — discrepancy logged (R-006). Theme behaviour unchanged: never emit own title/meta/schema; full Yoast compatibility.
- Contact form: **JupiterX Raven form widget** (form id 377792f6, post 1979) — dies with JupiterX ⇒ replacement form plugin must be chosen at G3 (criteria: free, widely used, shortcode/block-based). No reCAPTCHA configured. Two Google Maps embeds (Head Office, Factory; zoom 15).
- Fonts in production: Open Sans + Oxygen (Google Fonts CDN), FontAwesome 5.15.3 — all irrelevant to redesign (self-hosted new faces at G3).
- robots.txt: `Crawl-Delay: 20` (honoured during crawl).

## Page inventory (slugs HARD-preserved)

`/` · `/overview/` · `/company-profile/` · `/management/` · `/gallery/` · `/our-capabilities/` · `/our-products/` · `/sustainability/` · `/career/` · `/contact/` — all HTTP 200. Career page is literally "Under Construction…" today. Most pages have **no h1** (current SEO defect; theme ships exactly one h1/page).

## Anchors (HARD-preserve)

- company-profile: `#our-mission`, `#our-vision`, `#manufacturing`
- sustainability: `#financial-stability`, `#health-and-family-wellbeing`, `#educational-and-professional-development`, `#safe-and-healthy-work-environment`, `#equality-and-acceptance`, `#best-practices` (Home cards link to exactly these)
- our-capabilities (human-named, preserve too): `#material-sourcing-management`, `#product-development`, `#sample`, `#cutting`, `#sewing`, `#finishing`, `#knitting`, `#printing`
- our-products tabs: `#men`, `#women`, `#kid`, `#underware` (sic — preserve the live spelling for inbound links), `#new-born`

## Counters — ALL recovered from `data-to-value` attributes; ZERO [TBD]

| Page | Stat | Value |
|---|---|---|
| Home + Company Profile | Cutting Capacity (Per Day) | **250,000** pcs |
| Home + Company Profile | Shipment Capacity (Per Month) | **5.5** M pcs |
| Home + Company Profile | Sewing Capacity (Per Day) | **220,000** pcs |
| Home + Company Profile | Finishing Capacity (Per Day) | **240,000** pcs (matches deck) |
| Home environmental ×3 | recycled-fabric products / water L / kWh | **100,000** each (matches deck) |
| Capabilities · Sampling | Samples Per Day / Sewing Machines | **400** / **88** |
| Capabilities · Cutting | Capacity Per Day / Cutting Tables | **250,000** / **10** |
| Capabilities · Sewing | Lines / Machines / Capacity Per Day | **74** / **2,631** / **220,000** |
| Capabilities · Finishing | Capacity Per Day | **240,000** |
| Capabilities · Knitting | Machines / Capacity Per Day (kg) | **20** / **8,000** (matches deck) |
| Capabilities · Printing | Capacity Per Day | **60,000** |

(Live counter titles contain typos — "Cuttng", "Knittng", "Sample Per Day" — copy-deck labels supersede; values above are the extracted truths.)

## Growth charts (Company Profile) — data read from the original images

Rendered live as static PNGs (855×465): `Untitled-1.png` (Revenue), `Future-Goal-2.png` (Future Goal). Data fully legible → recreate as white/pink-on-black SVG (§14.3), no fallback needed.

- **Revenue (USD million):** 2013-14: 0.2 · 2014-15: 1.5 · 2015-16: 4.8 · 2016-17: 13.6 · 2017-18: 17.3 · 2018-19: 21.7 · 2019-20: 23.3 · 2020-21: 30.7 · 2021-22: 46.2 · 2022-23: 53.0 · 2023-24: 58.3
- **Future Goal (USD million):** 2024-25: 70 · 2025-26: 90 · 2026-27: 100

Reference copies: `reference/charts/revenue.png`, `reference/charts/future-goal.png`.

## Palette source

**Brand pink = `#AC2171`** — flat fill of the header wordmark (`logo-white.png`, 104,837 px at sat 0.81). Edge anti-aliasing variant `#B12F7A` recorded as alternative. `logo_dark.png` contains no meaningful pink (stray AA pixels only).

## Management portraits (HARD: keep exactly as live)

- MD **Md. Shakil Rizvi** — **no portrait on live site** (text-only profile section).
- **Rehana Rizvi** (Chairman) — generic avatar placeholder `2023/03/avatar-1577909_1280.webp` (stock avatar; keep as-is per rail).
- **Shaikh Rezwan** (Director) — real photo `2025/09/Shaikh-Rezwan-Director-Sir.jpg`.

## Logo bands

- **Accreditations (Home + Company Profile):** 15 logos incl. amfori, Better Work Bangladesh, STeP, OCS, GRS, RCS, BSCI (URLs in recon-workflow.json) — re-tone white/grey for dark ground at G2.
- **Partners (client wall):** 21 logos incl. Primark, Pepco, Puma, Jack Wills, Lonsdale, Rewe, Scanwear (URLs in recon-workflow.json) — seeds the new Partners page.
- Footer "important link": SRSL logo → Shakil Rizvi Stock Limited.

## Products page (cutout pipeline seed)

Raven tabs + WP gallery grid; **67 product images** (Men 12 · Women 19 · Kids 12 · Underwear 9 · Newborn 15), all 300px thumbnails with empty alt text. Full-size originals = same URL minus `-WxH-N` suffix (verify per file at G2). These are the white-box shots the cutout pipeline must process (supplemented/replaced by Drive STIL imagery).

## Gallery (live)

Raven Photo Album, 6 albums ("Gallery 1–6") recycling section images — content-thin; Drive STIL photography replaces this wholesale per copy-deck album captions.

## Drive intake status

54 listed / 51 fetched; 3 blocked by Google cooldown → `IMAGES_TODO.md` (DJI_0580.JPG recoverable from its DNG twin locally).
