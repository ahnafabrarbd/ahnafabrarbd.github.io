# DESIGN.md — Rizvi Fashions design system (shipped identity)

Audience lens (§2): sourcing managers at international fast-fashion retailers. Expensive = restraint, precision, pacing. Every visual decision below is a named token; shipped CSS may not contain a raw value absent from the `tokens` block (enforced by `setup/token-lint.mjs`).

> Note: this project began as "rizvi-noir" (black ground, magenta accent, Clash/Switzer/Martian type) and was deliberately moved to the warm-editorial identity documented below. The prose here describes the **shipped** site. The accent token was renamed from the legacy `--pink` to `--accent` (its value is the forest green `#1A3828`).

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
--accent: #1A3828;
--glass: rgba(248, 246, 242, 0.72);
--scrim-img: rgba(17, 17, 17, 0.55);
--shadow-soft: rgba(17, 17, 17, 0.06);
--shadow-raise: 0 0.5rem 1.5rem rgba(17, 17, 17, 0.08);
--shadow-lift: 0 1.25rem 3rem rgba(17, 17, 17, 0.12);
--accent-tint: rgba(26, 56, 40, 0.06);
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
--ease-expressive: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--dur-fast: 200ms;
--dur-base: 450ms;
--dur-slow: 700ms;
--dur-entrance: 900ms;
--dur-entrance-max: 1200ms;
--dur-lux: 1500ms;
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
--cursor-ring: 2.5rem;
```

Notes (G4 addition, ratified by the G4 critic): `--bp-rail: 768px` tokenises the rail/label breakpoint already named in the thread spec prose — media queries cannot consume `var()`, so the breakpoint value must be a token for token-lint to admit it. (G5 addition, pending critic ratification at G5 close): `--card-h: 26rem` — cutout card/panel height cap ≈ 416px, the token form of D-004's "resolution-honest sizes ≤420px" rule for product-rail and hero-weave panels. (G6 additions, same protocol): `--seam-w: 120px` — the thread-spec prose's "~120px" stitched seam segment, tokenised; `--knot-len: 90` — the selvedge-knot SVG path length for its stroke-draw (dasharray/dashoffset unit). Type scale is a 1.31 modular ratio off 17px body; radius-0 is the default everywhere (radius-frame only on portrait hover frames); `--numeric` is applied as `font-variant-numeric: tabular-nums` on every `--font-utility` element (the spec blocks demand true tabular figures); entrances run `--dur-entrance`→`--dur-entrance-max` `--ease-out`, transform/opacity only.

## Thread & wayfinding (as shipped)

- **Form:** 1px `--accent` (forest-green) line, `--z-thread`, pointer-events none.
- **Progress rail:** a thin scroll-progress hairline — a top bar under the horizontal corridor, the right-gutter rail (≥768px) on plain-vertical pages. Fill is the accent over a `--hairline` track.
- **Corridor wayfinding:** the frosted bottom bar — a running `NN / NN` index + a row of dots, one per room, the active dot filled `--accent`. It replaces the old right-rail section labels under the corridor.
- **Footer:** a small selvedge-knot SVG loop sits beside the footer wordmark.
- *(The original session preloader and the dashed chapter-seam stitches are not shipped in the current build.)*

## Home hero (as shipped)

A clean, centred thesis on the pure ground (`--ground-pure`): the headline "CRAFTING A SUSTAINABLE LEGACY IN GLOBAL APPAREL" in display caps, body, and a Learn More CTA — **no background graphic** (the earlier image "weave" and a trialled WebGL line-field were both removed). On desktop the hero is a **vertical front screen**: you scroll DOWN through it, then the horizontal corridor takes over; the footer is a vertical coda at the end. Mobile / reduced-motion: the same centred hero, static.

## Scroll grammar (as shipped)

Desktop (≥1025px, motion on): a single horizontal **corridor** — the page pins and the track translates LEFT, each block a "room", over a Lenis smooth-scroll (weighty lerp + reduced wheel sensitivity = unhurried, tactile). Depth is restrained: subtle bg/fg parallax + a bezier-eased per-room reveal (clip-opening images, rising heading words) that never animates back out. The home hero (front) and the footer (coda) are vertical; the corridor runs between. Products keeps its pinned horizontal category rail; Partners is a plain vertical ladder. Mobile / reduced-motion / no-JS: the markup is a clean vertical document (the fallback). DOM stays in logical reading order throughout.

## Navigation (as shipped)

- Top bar: wordmark left — **Cormorant italic text** ("RIZVI FASHIONS", not an SVG), right: Overview · Capabilities · Products · Sustainability · Partners · Contact + "Menu". Links are `--ink-muted` → `--ink` on hover, `--text-sm`, `--tracking-nav`, with a subtle lift; the active page is `--accent`. The bar is **frosted glass** (translucent + backdrop-blur + soft shadow), hairline bottom border, `--z-topbar`.
- Overlay: full-screen `--ground-pure` menu; pages in display caps; ESC + visible Close; focus-trapped, restored on close.
- Mobile: wordmark + Menu only.

## Page wireframes (chapter intent; copy = copy-deck.md verbatim)

> These describe each page's content/chapter order. The shipped *layout* renders them through the corridor model above; exact per-page layout tuning is Phase 2.

1. **Home:** hero → spec counters → sustainability keyline rows → Mission / Vision / Manufacturing scenes → environmental spec block → accreditations logo band → partners teaser (rolling marquee) → contact + footer coda.
2. **Overview:** Who We Are → Technology / Scale / Range trio → aerial breather → BGMEA strip.
3. **Company Profile:** Mission → accreditations band → Vision → counters → Manufacturing → growth charts (inline SVG, accent goal line) with captions. Anchors preserved.
4. **Management:** MD profile = text-led chapter (no portrait on live, HARD) → team grid, portraits with an `--accent` hover frame (`--radius-frame`).
5. **Partners:** a vertical ladder of the 20 named brands with a black logo-imprint beside each name.
6. **Capabilities:** 8 process chapters, spec blocks per section (real values), each paired with a factory photo.
7. **Sustainability:** anchored chapters as keyline rows; welfare image in the Health chapter (R-008 noted).
8. **Products:** category rail; on-model garment imagery per category; arrows + keyboard.
9. **Career:** single chapter, copy-deck text, mailto link.
10. **Gallery:** editorial keyline grid by album captions.
11. **Contact:** Write to Us headline → static Web3Forms enquiry form → Key Contacts rows → two office cards → footer.
12. **404:** minimal, utility-caps message.

## Cutout & imagery treatment

Imagery sits on the warm ground; partner/accreditation logos render as a uniform **ink imprint** (CSS filter, tonal only — no redrawing). Photography is used as full-bleed section media and as contained editorial images. **Text-on-image is used** for continuity (headline/copy over photo with a legibility scrim) — the original "no text overlays ever" / "crush blacks to `#0A0A0A`" rules belonged to the retired noir design and no longer apply.
