# INSPIRATION — pattern study (G3, 2026-06-10)

Studied visually/mechanically, for patterns only. **Nothing is copied: no code, markup, fonts, images, or text from any reference ships in this build.** All observations verified from fetched HTML/CSS via GET during runtime scouting (see `reference/design-research.json` for the full record, including vetted-and-rejected candidates: Ferrumpipe (dead domain), Tonello (Divi sliders, below the bar), Circulose (no notable mechanics), Anduril/Divergent (client-rendered, unverifiable), Kvadrat (news-feed homepage)).

## breakthroughenergy.org

1. Pinned chapter block: chapters stacked absolutely inside a full-height stage, crossfading in place while scroll progress drives a canvas animation; stage labels live in a dedicated ~20vw column flush to the viewport edge, right-aligned, uppercase, ~.12em tracking, opacity-toggled one at a time.
2. Progress rail: dots built from a border ring + separate fill div; the active dot "fills" via a `.current` class from scroll position — progress reads as ink filling, not a highlight swap.
3. People page: stacked rows on a 12-col grid with collapsed 1px keylines (`margin-bottom:-1px`), group label spanning ~2 cols, name cols 1–4, bio cols 5/-1, small fixed-size portraits; everything interpolates via `clamp()` between ~600–1700px.

**We will not take:** the cream philanthropic palette, centred hero, or playful illustration layer — chapter pacing, rails, and keyline grid only. (Note: BE's stage labels are on the RIGHT and its dot rail LEFT; our thread rail inverts this cleanly to right-edge labels per the brief.)

## stegra.com (green-steel manufacturer)

1. Scrollytelling hero: `calc(150vh × entries)` wrapper with sticky 100vh stage; media starts matted inside grid margins via clip-path inset derived from margin tokens and expands to full bleed on scroll.
2. Token discipline: every colour a named token; sections flip light/dark with one attribute; dividers always scheme-ink at 12% alpha; spacing on an 8px base; even the grid is a token.
3. One section grammar, parameterized: shared inline padding + vertical rhythm tokens, 1px top keyline + title/intro split, media/text order flipped purely by `order:-1` variant.

**We will not take:** the chummy recruiting voice or lilac accent — the grammar and token discipline transfer, the startup tone does not.

## thenewindustrials.com (Awwwards HM)

1. Chapter numbering as CSS counters in small bordered chips fused flush into block keylines — numbering lives in the grid armature, not headings.
2. Scroll-linked theme inversion via invisible 200svh trigger zones (`pointer-events:none`) crossing the viewport.
3. Keyline-parameterized grid: alignment variants set both content columns AND which 1px side rails draw — rules appear only where content edges land; cap-height trimming via custom properties.

**We will not take:** the single-essay magazine format or orange/acid accents — counter chips, keyline grid, and inversion mechanics only.

## syre.com (textile-to-textile recycling; exactly our buyer audience)

1. Persistent "stitch" armature: fixed full-viewport overlay of ~9 evenly spaced 1px dashed vertical rules at ~15% opacity with `mix-blend-mode:difference`, pointer-events off — a textile motif that stays legible over media, with all columns visibly snapping to it.
2. Sticky headline columns (`position:sticky; top:8rem`) for two-speed reading, degrading to static on mobile — no scroll-jacking.
3. Scroll-driven media reveal: 200vh wrapper, sticky stage, card scales from matted rounded frame to 100vw/vh with a 25vh trigger offset.

**We will not take:** the h1-duplicating marquee band or sage Webflow palette — repetition-as-energy fails the restraint bar; armature and sticky mechanics only.

## Standing references (from the brief, visual canon)

Saint Laurent / McQueen / Dries Van Noten (dark fashion authority) · Toteme / Jacquemus / Aman (print-grade grids, luxury of silence) · Off-White (grid discipline + one typographic quirk) · Devialet (spec data made desirable). These set taste; mechanics above set construction.
