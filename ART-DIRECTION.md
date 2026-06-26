# Art Direction & Photography — Rizvi Fashions (PROPOSAL.md Phase 4)

> Plan/spec only. No images are generated (AI image generation is banned, V7 Law 2)
> and no source binaries are auto-graded blind — apply the grade below only with
> eyes on the result. Grounded in `src/data/image-map.json` statuses/notes.

## 1. The grade — one coherent look
Goal: every photograph reads as one body of work on the warm off-white ground,
never a stock-photo grab-bag. Apply in the Sharp pipeline (build-time, reversible).

- **Tone:** warm-neutral. Pull a touch of green/yellow out of the highlights so
  whites sit on `--ground #F8F6F2`, not pure white; keep shadows soft (no crushed
  blacks — the identity is light, not noir).
- **Contrast:** gentle S-curve; protect midtones (skin, fabric texture).
- **Saturation:** −8 to −12% globally so colour never competes with the single
  forest-green accent; let garment colour stay truthful (it's the product).
- **Consistency:** one LUT/recipe for all editorial photos; the same recipe at
  every size out of Sharp. Document the recipe in `setup/` when approved.
- **Treatment in layout:** full-bleed photos keep the `--scrim-img` gradient for
  text legibility; contained editorial photos keep the hairline frame + the quiet
  hover scale already shipped. No filters that read as "Instagram".

## 2. Inventory (from image-map.json)
**Editorial-grade, keep:** `home/mission-teaser` (1920×1280, D-008), `home/vision-teaser`
(2560×1232 showroom), `home/manufacturing-teaser` (1920×1100 floor), `overview/who-we-are`
(1920×1280), `overview/breather-aerial`, `company-profile/manufacturing`.

**Weak / low-res (re-shoot when possible):** `capabilities/sourcing` (480×320),
`capabilities/product-development` (525×350) — these render small by design, but a
proper frame would let them grow.

## 3. Prioritized shot list (commission these)
Ordered by buyer-proof value. Each is real photography to direct on-site — not
sourced or generated.

1. **Hero-grade "line at scale"** — a wide, clean frame of a full sewing line in
   operation (the 74-lines / 5,120-people story made visible). Enables the optional
   subordinate hero image (§3 of PROPOSAL.md) and the strongest breather.
2. **QA / inspection close-up** — hands + garment under inspection. Proves the
   quality-assurance claim a sourcing buyer cares about most.
3. **Finishing / packing for export** — cartons, labels, dispatch. Proves
   reliability and the "100% export-oriented" claim.
4. **Welfare / people frame** — REPLACES the flagged welfare image (see §4). A real,
   consent-cleared photo of the workforce / welfare facilities.
5. **Knitting & cutting floors** — to upgrade the small-render capability slots.
6. **Newborn / infant product** — fills `products/newborn` (todo-owner; no cutout
   currently depicts a newborn garment).
7. **Campus / building exterior** — strengthens the thin `gallery/campus` album.

## 4. Flags (owner action — do not invent)
- **R-008 — `sustainability/health-and-family-wellbeing` carries an AI-provenance
  flag** and needs owner sign-off or replacement with real photography (ties to
  shot #4). This is the highest-priority integrity item.
- `capabilities/sourcing-trims` — todo-owner, no Trims image ever existed; currently
  an honest text cell. Leave until a real photo exists.
- `management/md-portrait` — intentionally none (HARD: live site is text-only). Keep.
- Provide consent/release for any identifiable people in new photography.

## 5. Buyer-decision facts still needed (blocks deeper proof)
Lead time · MOQ · sampling turnaround time · current audit grade & date (the
Compliance Wall states each standard's scope but asserts no Rizvi grade until these
are supplied) · real environmental figures (the three home env stats remain
placeholders and were deliberately left untouched).
