/**
 * Illustration manifest — V7 §8.3, the swappable-element law.
 *
 * EVERY illustration/decorative graphic on the site is referenced through this
 * map. Replacing, removing, or adding one is a ONE-LINE edit here; pages never
 * import illustration files directly. Removing any entry must leave its page
 * intact (illustrations are elements, never load-bearing structure).
 *
 * Worked example (for HANDOFF.md): to swap the environmental "water" glyph,
 * drop a new SVG in src/illustrations/icons/ and change ONE line:
 *   'env-water': icon('drop'),      →      'env-water': icon('faucet'),
 *
 * Icon family: Phosphor (thin weight) — MIT, no attribution required
 * (verified at source 2026-06-10; CREDITS.md triage table). ONE family
 * site-wide per V7 §8.1. Glyphs inherit currentColor → token-driven.
 */

const icon = (name: string) => `/src/illustrations/icons/${name}.svg`;

export const ILLUSTRATIONS: Record<string, string> = {
  // Home — environmental responsibility spec block (3 cells)
  'env-recycle': icon('recycle'),
  'env-water': icon('drop'),
  'env-energy': icon('lightning'),
  // Contact — key contact rows / office cards
  'contact-phone': icon('phone'),
  'contact-email': icon('envelope'),
  'contact-office': icon('map-pin'),
};

export type IllustrationSlot = keyof typeof ILLUSTRATIONS;
