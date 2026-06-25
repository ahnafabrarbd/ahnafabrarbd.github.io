# DESIGN.md — Rizvi Fashions design system (shipped identity)

Audience lens (§2): sourcing managers at international fast-fashion retailers. Expensive = restraint, precision, pacing. Every visual decision below is a named token; shipped CSS may not contain a raw value absent from the `tokens` block (enforced by `setup/token-lint.mjs`).

> Note: this project began as "rizvi-noir" (black ground, magenta accent, Clash/Switzer/Martian type) and was deliberately moved to the warm-editorial identity documented below. The prose here describes the **shipped** site. Token names are historical in one place — `--accent` was once `--pink`; see the rename note in the Tokens section.

## Concept — The Continuous Thread

One 1px line in the forest-green accent travels the experience: it runs the scroll-progress rail, stitches chapter seams, and runs out into a selvedge knot beside the footer wordmark. It is the single flourish; everything else is restrained.

## Palette (HARD: warm off-white / ink / grey + one forest-green accent)

- Ground `#F8F6F2` (warm off-white); `--ground-pure` `#FFFFFF` for the home hero and the frosted glass.
- Ink `#111111` (display + primary); body text `#2C2C28` (`--ink-body`); muted labels/annotations `#646B5E` (`--ink-muted`); faint decorative/borders `#9EA295` (`--ink-faint`, non-text — see the accessibility token note); hairlines `#E8E4DC`.
- Accent forest green `#1A3828` (`--accent`). Used for: the thread (rail, seams, selvedge knot), chapter numerals, the active wayfinding dot, keyline CTAs, focus ring, and partner-name hover. Never body prose, never as a large background field.

## Type system

Two families, three roles: DISPLAY — **Cormorant** (chapter/page titles, oversized uppercase, tracked, weight 700); BODY — **Montserrat** (16–18px, lh ~1.7); UTILITY — **Montserrat** for spec blocks, labels and nav meta, with true tabular numerals (`font-variant-numeric: tabular-nums`).

Cormorant is a high-contrast Didone-class serif: its thick/thin stroke modulation carries the editorial, "expensive" authority at hero scale, set against Montserrat's neutral geometric sans as the quiet body counter-voice. Both self-host as subset woff2 and are preloaded (`cormorant-normal`, `cormorant-italic`, `montserrat`); licences in CREDITS.md (Cormorant: OFL; Montserrat: OFL).

## Tokens

```tokens
--ink: #111111;
--ink-body: #2C2C28;
--ink-muted: #646B5E;
--ink-faint: #9EA295;
--ground: #F8F6F2;
--ground-pure: #FFFFFF;
--hairline: #E8E4DC;
--pink: #1A3828;
--glass: rgba(248, 246, 242, 0.72);
--scrim-img: rgba(17, 17, 17, 0.55);
--font-display: 'Cormorant', Georgia, serif;
--font-body: 'Montserrat', system-ui, sans-serif;
--font-utility: 'Montserrat', system-ui, sans-serif;
--fw-display: 700;
--fw-display-sub: 400;
--fw-body: 400;
--fw-body-strong: 500;
--fw-utility: 400;
--fw-utility-strong: 500;
--text-2xs: 0.65625rem;
--text-xs: 0.75rem;
--text-sm: 0.8125rem;
--text-base: 1.0625rem;
--text-md: 1.3125rem;
--text-lg: 1.75rem;
--text-xl: 2.375rem;
--text-2xl: 3.25rem;
--text-display: clamp(2.5rem, 7vw, 7rem);
--text-display-sub: clamp(1.75rem, 3.5vw, 3rem);
--leading-tight: 0.94;
--leading-snug: 1.15;
--leading-body: 1.7;
--tracking-display: 0.06em;
--tracking-caps: 0.16em;
--tracking-caps-wide: 0.24em;
--tracking-nav: 0.1em;
--tracking-num: -0.01em;
--space-1: 0.5rem;
--space-2: 1rem;
--space-3: 1.5rem;
--space-4: 2rem;
--space-5: 3rem;
--space-6: 4rem;
--space-7: 6rem;
--space-8: 9rem;
--gutter: 3rem;
--gutter-mobile: 1.25rem;
--measure-body: 62ch;
--measure-title: 16ch;
--rail-w: 1px;
--rail-offset: 3rem;
--deck-bar-w: 0.625rem;
--deck-head-h: 4.5rem;
--radius-0: 0;
--radius-frame: 2px;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
--ease-thread: cubic-bezier(0.6, 0.05, 0.2, 1);
--dur-fast: 200ms;
--dur-base: 450ms;
--dur-entrance: 900ms;
--dur-entrance-max: 1200ms;
--dur-preloader-max: 1800ms;
--z-base: 0;
--z-imagery: 10;
--z-thread: 20;
--z-topbar: 30;
--z-overlay: 40;
--z-preloader: 50;
--numeric: tabular-nums;
--bp-rail: 768px;
--bp-hscroll: 1025px;
--card-h: 26rem;
--seam-w: 120px;
--knot-len: 90;
```

Notes (G4 addition, ratified by the G4 critic): `--bp-rail: 768px` tokenises the rail/label breakpoint already named in the thread spec prose — media queries cannot consume `var()`, so the breakpoint value must be a token for token-lint to admit it. (G5 addition, pending critic ratification at G5 close): `--card-h: 26rem` — cutout card/panel height cap ≈ 416px, the token form of D-004's "resolution-honest sizes ≤420px" rule for product-rail and hero-weave panels. (G6 additions, same protocol): `--seam-w: 120px` — the thread-spec prose's "~120px" stitched seam segment, tokenised; `--knot-len: 90` — the selvedge-knot SVG path length for its stroke-draw (dasharray/dashoffset unit). Type scale is a 1.31 modular ratio off 17px body; radius-0 is the default everywhere (radius-frame only on portrait hover frames); `--numeric` is applied as `font-variant-numeric: tabular-nums` on every `--font-utility` element (the spec blocks demand true tabular figures); entrances run `--dur-entrance`→`--dur-entrance-max` `--ease-out`, transform/opacity only.

## Thread specification (HARD bounds: never enters top bar, never crosses text or imagery)

- **Form:** 1px `--pink` line, `--z-thread`, pointer-events none.
- **Preloader (first visit per session only):** SVG stroke draws the RIZVI wordmark ≤1.8s (`--dur-preloader-max`), then the stroke "releases" — translates to the right edge and becomes the rail. Session-cached via sessionStorage; reduced-motion ⇒ instant skip.
- **Rail (≥768px):** fixed right edge at `--rail-offset`; height = scroll progress (grows top→bottom, pink above `--hairline` track below). Section labels hang left of the rail in `--font-utility` `--text-2xs` caps, `--tracking-caps`; active = `--ink`, inactive = `--ink-muted`; all clickable (scrollspy). The rail occupies the gutter — content max-width keeps text/imagery clear of it (the no-crossing rule is layout-guaranteed, not clipped).
- **<768px:** bare 1px progress line, no labels; section index moves into the overlay menu.
- **Chapter seams:** at each chapter boundary a short stitched-line (dashed 1px segment, ~120px) draws across the seam as it enters the viewport — 450ms `--ease-thread`, once per visit.
- **Overlay menu:** thread runs along the overlay's left edge while open.
- **Footer:** rail runs out horizontally and terminates in a selvedge knot — a small SVG loop beside the logo, drawn on first footer reveal.

## Hero storyboard (Home, one orchestrated moment, never repeated)

1. **t=0** (post-preloader): ground `--ground-pure`. The thread enters from the wordmark's release point.
2. **Weave in (0–1.2s):** 5 cutout panels (garments on transparency, resolution-honest sizes ≤420px) drift in as warp/weft — vertical panels from top, horizontal from right, each tied to the thread line passing behind them (thread passes BEHIND imagery: z-imagery > z-thread within the hero only — satisfying "never crosses" visually).
3. **Settle (1.2–1.8s):** panels rest in a loose constellation right-of-centre; headline sets left: "CRAFTING A SUSTAINABLE LEGACY IN GLOBAL APPAREL" in display caps, body + Learn More beneath.
4. **First scroll:** constellation releases — panels drift apart with parallax clipped by overflow, headline holds; thread re-anchors to the rail. ScrollTrigger scrub, transform/opacity only.
5. **Reduced motion / revisit:** static composition, no weave; panels pre-settled.
Budget: ≤5 build attempts (§17 time-box), else simplify to static constellation + thread draw.

## Scroll grammar

Vertical full-viewport chapters; oversized left-anchored uppercase titles; chapter numeral chips (CSS counters in `--font-utility`, fused into keylines — pattern study: thenewindustrials). Smooth scroll via Lenis (flag-gated). Departures: Products = pinned horizontal gallery (mobile: native swipe + scroll-snap; reduced-motion: vertical list); Partners may run as a slow horizontal band; ≤1 full-bleed breather per long page, caption below. DOM stays in logical reading order under all pinning.

## Navigation

- Top bar: wordmark left (SVG, white), right: Overview · Capabilities · Products · Sustainability · Partners · Contact + "Menu" (word trigger). Plain white `--text-sm`, `--tracking-nav`, **zero hover effects** (HARD). Bar is ground-coloured, hairline bottom border, `--z-topbar`; thread never enters it.
- Overlay: full-screen `--ground-pure`; all ten pages in `--text-display-sub` display caps; current page's section index beneath in utility caps; thread along left edge; ESC + visible Close; focus-trapped, restored on close.
- Mobile: wordmark + Menu only.

## Page wireframes (chapter order; copy = copy-deck.md verbatim)

1. **Home:** hero weave → spec counters (4 cells) → sustainability: 6 cards as keyline list rows (title/line/Read More→anchor) → Mission / Vision / Manufacturing as alternating half-image chapters → environmental spec block (3 cells) → accreditations logo band (re-toned) → partners teaser band → contact strip.
2. **Overview:** Who We Are (2 text chapters, floor photo) → Technology / Scale / Range (keyline trio) → aerial breather → BGMEA strip (utility caps, hairline frame).
3. **Company Profile:** Mission → accreditations band → Vision → counters → Manufacturing → growth charts as inline SVG (white bars/pink goal line, decoded data) with captions. Anchors preserved.
4. **Management:** MD profile = text-led chapter (no portrait on live, HARD) with pull-quote rhythm → team grid: 2 keyline rows (BE people-page pattern), portraits small fixed-size, pink hover frame (`--radius-frame`).
5. **Partners (new):** logo wall, white/grey re-toned logos on keyline grid cells, pink frame on hover; intro line.
6. **Capabilities:** 8 chapters, left titles, right rail labels; spec blocks per section (real values from RECON); Finishing + Knitting = spec-only rows.
7. **Sustainability:** 6 anchored chapters, bullet lists set as keyline rows; welfare image in Health chapter (R-008 noted).
8. **Products:** pinned horizontal rail; category index one-third down (active white/others dimmed); cutouts float on `--ground-pure`; arrows + keyboard + drag; snap tuned; mobile native swipe per category.
9. **Career:** single chapter, copy-deck text, mailto link.
10. **Gallery:** editorial keyline grid by album captions; lightbox-free (caption below, full view via native click-through acceptable v1).
11. **Contact:** Write to Us headline → CF7 form (real output, restyled) → Key Contacts keyline rows → two office cards → footer.
12. **404/search:** minimal, thread present, utility-caps message.

## Cutout & imagery treatment

Cutouts: transparent WebP on `--ground-pure`, 1px alpha erode + 0.75px feather, despill; never painted-black fakes. Photography: graded toward the ground (slight desaturation, lifted blacks crushed to `#0A0A0A`), no text overlays ever, captions below in utility caps. Partner/accreditation logos: white/grey re-tone (tonal only, no redrawing).
