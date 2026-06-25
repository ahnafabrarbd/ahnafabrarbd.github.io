# Copy mapping — deck section → JSON → page slug (V7 §10 evidence)

Generated source of truth: `copy-deck.md` (verbatim, read-only) parsed by `setup/extract-copy.mjs` (deterministic, re-runnable; `node setup/extract-copy.mjs`). Anchor ids and counter numerics are cross-checked against `RECON.md` at every run — drift aborts extraction.

| Deck section | JSON file | Page slug | Notable slots |
|---|---|---|---|
| 1 · Home | `home.json` | `/` | Hero (heading/body/button) · 4 capacity counter stats (3 filled from RECON `source:"recon"`, Finishing explicit) · 6 sustainability cards as items with `anchor` → live sustainability ids + per-card "Read More" · Mission/Vision/Manufacturing teasers (label/heading/body/button) · Environmental section 3 stats · Accreditations heading-only · Partners teaser heading |
| 2 · Overview | `overview.json` | `/overview/` | "Who We Are" section (2 paragraphs) · Three aligned blocks as items (Technology/Scale/Range title+text) · BGMEA standalone strip |
| 3 · Company Profile | `company-profile.json` | `/company-profile/` | Anchors `our-mission`, `our-vision`, `manufacturing` (3, byte-exact) · capacity counters cloned from Home per deck "as scripted on Home" · Manufacturing body · Our Business Growth (intro + 2 `chartCaptions`) · Accreditations + Our Partners heading-only |
| 4 · Management | `management.json` | `/management/` | Title = page headline · MD profile section (3 paragraphs + `person` name block Md. Shakil Rizvi — Managing Director) · Management Team `people` ×2 (Rehana Rizvi — Chairman, Shaikh Rezwan — Director, each with bio paragraph) |
| 5 · Our Capabilities | `our-capabilities.json` | `/our-capabilities/` | 8 anchors incl. live `sample` for the "Sampling" heading · `subLabels` on Material Sourcing (Fabric/Trims/Label/Accessories) · 11 stats (Sampling 2, Cutting 2, Sewing 3, Finishing 1, Knitting 2, Printing 1); `[existing figure]` slots filled from RECON (`source:"recon"`) |
| 6 · Our Products | `our-products.json` | `/our-products/` | Intro line · top-level `categories` ×5 with byte-exact live tab ids: `men`, `women`, `kid`, `underware` (sic, live spelling), `new-born` |
| 7 · Sustainability | `sustainability.json` | `/sustainability/` | 6 anchors byte-exact (`financial-stability` … `best-practices`) · each section body paragraph + verbatim bullet `items` (4/3/2/3/0/7) |
| 8 · Career | `career.json` | `/career/` | Single body paragraph (info@rizvifashions.com expression-of-interest line) |
| 9 · Gallery | `gallery.json` | `/gallery/` | 4 optional album captions as items (The Campus / Production Floors / Cutting & Sewing / Finishing & Despatch) |
| 10 · Contact | `contact.json` | `/contact/` | "Write to Us" hero (`subLine`, `privacyNote`, button "Send Message") · Key Contacts `people` ×3 (name/role/email; Mizanur Rahman with `department` + `cell`) · Office cards `offices` ×2 (Head Office, Factory Office: address/phones/email) |
| Global Footer (all pages) | `footer.json` | — (global, `slug: null`) | Contact Us offices cloned from Contact per deck note · link lists: About Company ×6, Our Capabilities ×8, Our Products ×5 · Important Links (SRSL) · top-level `copyright` |

## Conventions

- `id` = byte-exact live anchor (no `#` prefix), `null` where the live site has none. 22 total across files = RECON §Anchors exactly.
- `stats[]` = `{label, value, unit?, source?}`; labels verbatim from the deck (deck supersedes live typos), values: deck where explicit, RECON `data-to-value` truth where the deck says *[existing figure]* (marked `source: "recon"`). Zero deck/RECON mismatches, zero `[TBD]`.
- `block` = deck scaffolding label (Hero, Capacity counters, teasers…) kept for traceability; `note` = deck annotation (e.g. "heading only; logo band"). Neither is display copy.
- `/partners/` is a new page with no deck section — n/a here (logo wall seeded from RECON, copy TBD at G5).
