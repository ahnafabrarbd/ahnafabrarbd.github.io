/**
 * Feature flags — V7 §7 / RAILS §2 row 13 (the V4 Track-B philosophy):
 * every enhanced effect is a ONE-LINE switch off. Build-time constants:
 * flip a flag, rebuild, the effect's markup/script simply doesn't ship.
 * Documented for Zafir in HANDOFF.md.
 */
export const FLAGS = {
  /** right-edge thread rail: scroll progress + section labels + scrollspy (≥768px) */
  threadRail: true,
  /** dashed seam stitch drawing across chapter boundaries */
  seamStitches: true,
  /** chapter scroll-reveals (rise + fade on entry) */
  reveals: true,
  /** spec-block numerals count up on first view (final value always in markup) */
  countUp: true,
  /** footer selvedge knot draws on first reveal */
  knotDraw: true,
  /** products rail arrow-key support */
  railKeys: true,
  /** home hero weave entrance + scroll release (GSAP, home only) */
  heroWeave: true,
  /** thread-draw preloader — REFUSED by the G7 panel (D-020); instant-skip default */
  preloader: false,
  /** G7 showpiece (D-019): the thread persists across navigation as one
   *  continuous element (cross-document View Transitions, 0KB CSS) */
  unbrokenThread: true,
  /** v1.5 (owner) SUPERSEDES the vertical deck: the whole site is a horizontal
   *  scroll — the user scrolls vertically and the track translates LEFT, each
   *  block a "room", driven by GSAP pin+scrub over a Lenis smooth-scroll. The
   *  depth is restrained: a subtle bg/fg parallax drift + a bezier-eased per-room
   *  clip/word REVEAL — no rotateY, no scale depth-of-field, no scrim, no grain
   *  (richer depth is a deferred Phase-3 intent). The home hero is a vertical
   *  front screen and the footer a vertical coda; the corridor is between them.
   *  Desktop ≥1025px + motion only; mobile / reduced-motion keep native vertical
   *  scroll (the markup is the fallback). src/motion/pinscroll.ts. */
  hscroll: true,
  /** v1.4 vertical snap deck — RETIRED by hscroll above; OFF so the two scroll
   *  models can never co-run (the engine also asserts !snapDeck). */
  snapDeck: false,
  productsPin: false,
  pinAllPages: false,
  storyStage: false,
} as const;

export type FlagName = keyof typeof FLAGS;
