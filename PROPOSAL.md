# Proposal — Deepening the Proof, Within the Warm-Editorial Identity

> Status (local only, no push):
> - **Phase 1** — hero proof figures: **DONE**. Env stats: **BLOCKED** on owner figures.
> - **Phase 2** — Compliance Wall: **DONE** (home + company-profile).
> - **Phase 3** — Capability matrix: **DONE** (/our-capabilities/). Product matrix:
>   **PARTIAL** — the 5-category range is already served by the existing `.cat-index`;
>   a deeper product matrix (styles per category, fabric/GSM, MOQ) is **BLOCKED** on
>   owner data and will not be fabricated.
> - **Phase 4** — art direction / motion restraint / Thread: queued.
> - Design audited with /ui-ux-pro-max (contrast, focus, responsive, a11y) — passing;
>   one mobile layout fix applied.

## Thesis
The site already *looks* expensive; the job is to make it *prove* expensive to a sourcing
manager with 90 seconds and a shortlist. Every change reuses the existing identity, tokens,
motion stack, and content system. Real data we already own gets surfaced; missing data is
flagged for the owner, never invented.

`DECISIONS.md` / `RAILS.md` carry two kinds of rules. The *aesthetic* noir-era rails (dark
ground, Clash/Switzer, "never overlay text on imagery") are superseded by the shipped
warm-editorial identity in `DESIGN.md`. The *engineering* decisions are still binding — and
one (D-018 / D-020, "Law 1") governs the hero (LCP-defining element stays text).

## Diagnosis — proof gaps (file-grounded)
1. **Hero is a thesis with no figures** — real scale (250,000 pcs/day, 5.5M pcs/month, 74 lines,
   410,177 sq ft, 5,120 staff) sits one screen below the fold (`home.json` Capacity counters).
2. **Three identical placeholder env stats** (`home.json`: 100,000+ / 100,000 L+ / 100,000 kWh)
   under a heading literally titled "…Measured" — the biggest credibility liability.
3. **Certifications are logos-only** — 14 real marks (`accreditations.json`) with no "what it
   certifies / what risk it removes."
4. **Capability proof is real but scattered** across 8 chapters (`our-capabilities.json`:
   Sewing 74 lines / 2,631 machines / 220k day; Cutting 250k / 10 tables; Knitting 8,000 kg;
   Printing 60k; Sampling 400/day). No single scannable view.
5. **Product range isn't a matrix** (`our-products.json`: 5 categories).
6. **Strongest single proof is buried** — revenue $0.2M → $58.3M (`charts.json`) lives only on
   `/company-profile/`.
7. **Buyer-decision facts mostly absent** — sampling 400/day exists; lead time, MOQ, sampling
   turnaround time, current audit status are NOT in the data (gaps).
8. **First-proof slightly delayed by entrance ceremony** (curtain + hero word-rise).

## Guardrails (unchanged identity)
No new typeface / accent / large accent fields / new concept. Performance is law (D-018, LCP
text-first, Lighthouse 100×4, `budgets.json`). No invented data. Copy through fidelity-gated
decks. HARD anchors preserved (RAILS §4). Token-lint clean. Reduced-motion fallbacks. No banned
tropes (RAILS §88 — ledgers, not card grids / badge spam).

## The hero tension (resolved)
Brief asks for imagery; D-018/D-020 reject an image-LCP hero. Resolution: keep the Cormorant
thesis as the text LCP, add 2–3 real hard figures (zero perf cost, no new assets); any
photograph is a lazily-loaded, subordinate, perf-gated split panel — falls back to text-only if
it costs the budget.

## Phased plan
- **Phase 0 — owner inputs:** real env figures; lead time / MOQ / sampling turnaround / audit
  status; photography shot-list approval; client-name permission (stay within `partners.json`).
- **Phase 1 — credibility repairs:** (a) hero proof figures [DONE]; (b) env-stats honesty
  [BLOCKED on real figures]; (c) surface the growth curve on home [queued].
- **Phase 2 — Compliance Wall:** each accreditation + what it certifies + risk removed, via a
  new copy deck, rendered as an editorial keyline ledger.
- **Phase 3 — Capability & Product proof matrix:** assembled from existing data; anchors kept.
- **Phase 4 — Art direction, motion restraint, Thread:** one Sharp grade across existing
  editorial assets + a prioritized missing-shot list; trim entrance ceremony before first
  proof; let the Thread be marginally more felt at 2–3 moments.

## Content gaps (will NOT invent)
Real env figures · lead time / MOQ / sampling turnaround / audit status · owner-verified
certification-meaning copy · missing hero-grade & QA/welfare photography · partner-name scope.

## Gates per phase
`token-lint` · `perf-gate` (Lighthouse 100×4 + `budgets.json`) · `fidelity-check` · `screens`.
