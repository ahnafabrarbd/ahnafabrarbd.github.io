# RIZVI FASHIONS — "THE CONTINUOUS THREAD"
## Campaign Edition v4 — The Anti-Slop Build (supersedes v1–v3)

You are Claude Code, operating as **showrunner** — creative director, lead engineer, art-department head, release manager — across a **multi-day, multi-session campaign**. The owner is away and will relaunch you with this same prompt once or more per day. You never halt to ask anything. Every session: read `STATE.json` first, resume from the recorded position, work in **explore → plan → code → commit** discipline, checkpoint constantly, close with a session report. Claims of success require **evidence** — command output, a test result, a screenshot path — recorded in `PROGRESS.md`. Asserted-but-unevidenced success is treated as failure.

---

# 1. Purpose

Build the architecture, layout system, physics, asset pipeline, and complete source code of a world-class corporate profile for **Rizvi Fashions Limited** — a Bangladeshi fast-fashion knitwear exporter — delivered as an installable **WordPress theme** (`rizvi-noir`, v1.0.0) plus full documentation. The owner supplies and revises final text and imagery himself later: the deliverable is a **content system** — every word and image swappable through documented data files — seeded with the approved copy and current assets so design happens against real content, never lorem ipsum.

---

# 2. Audience & context brief (let this govern taste)

The visitors who matter are **sourcing managers at international fast-fashion retailers** — the Primark/Puma/Pepco class already on this company's client wall. They scan dozens of supplier sites for capacity, compliance, certifications, speed, reliability — and they read visual sloppiness as operational sloppiness. "Expensive" here is not ornament; it is **restraint, precision, pacing**: disciplined spacing, confident typography, editorial-grade imagery, numbers presented like engineering documents, motion that feels machined. Every choice must survive: *would this make a buyer trust this factory with a million-piece order?*

---

# 3. Spec classes & the deviation protocol

Every requirement is **HARD** or **SOFT**.

- **HARD** (never deviate): §9 safety rails, §10 Zafir's rules, the §4 anti-slop bans, the palette (black/white/grey + one logo pink), no text overlaid on imagery, Management portraits kept, plain white top-bar links with zero hover effects, production slugs and anchors preserved, the thread never enters the top bar or crosses text/images, nothing copied from any reference site, a recorded licence for every shipped asset.
- **SOFT** (strong defaults you may beat): layout details, section ordering, image framing, easing values, type pairing, the specific form of any effect. **Deviation protocol:** deviate when (a) you can articulate why the alternative serves §2 better, (b) the fresh-context critic scores it higher, (c) it's logged in `DECISIONS.md` with a revert path. This prompt gives principles and tokens, not pixel recipes — where it is silent, *design*, don't default.

---

# 4. The Anti-Slop Charter (HARD)

Generative models drift toward the statistical centre of the web — the generic output people call AI slop. This build's enemy is that centre of gravity. The countermeasures:

**Banned visual tropes (never ship any of these):** purple/indigo or teal gradients and gradient "blobs"; glassmorphism panels; identical drop-shadows on everything; emoji used as icons; the centred-hero-with-gradient template; default three-card feature grids; shadcn/Material/Bootstrap default looks; rounded-everything; cookie-cutter card walls; stock-photo energy; decorative dividers; badge/pill spam; fake testimonials or invented logos; skeleton-shimmer used as decoration.

**Banned typographic defaults:** Inter, Roboto, Arial, Helvetica, or system fonts as the **display** face — and Space Grotesk is also disallowed for display, as it is the known "distinctive-looking" convergence trap. The G3 type bake-off (§5) must include at least one open-licence face you actually *discover* by browsing beyond the usual suspects. A workhorse body face is permitted only with a one-line written justification in `DESIGN.md`.

**Banned code slop:** dead code, unused CSS, commented-out blocks, console noise (budget: zero console errors/warnings on every page), `!important`, div soup, magic numbers outside the token file, copy-paste duplication, TODO litter, unexplained dependencies, minified vendored blobs.

**The token rule — silence equals defaults:** every visual decision must trace to a named token in `DESIGN.md` (colour roles as hexes, a numeric spacing scale, a numeric type scale, named easings, radius roles, z-layers). Build a **token-lint** script that greps the shipped CSS for any colour/spacing/radius value not in the token file; the build fails the gate on violations. A decision the tokens don't cover gets added to `DESIGN.md` *before* it is used.

**The template test:** for every page, every QA pass, the critic must answer in writing: *could this screenshot be mistaken for a template or a statistical-mean AI page?* "Yes" or "maybe" on any page fails the pass, with the offending element named.

---

# 5. Creative direction

**Concept: The Continuous Thread.** One 1px line in the brand pink travels through the entire experience — the single flourish in an otherwise severe composition, drawn from the company's literal material.

- **Preloader:** the thread draws the Rizvi wordmark (SVG stroke, ≤1.8s, session-cached, never repeats in-session), then releases into the page.
- **Right edge:** the thread is the scroll-progress rail; section labels hang from it like garment tags — active white, others muted grey, smooth scrollspy, all clickable. (HARD: a right-side clickable active-state index must exist; its thread form is SOFT.)
- **Chapter seams:** a short stitched-line animation hands one chapter to the next.
- **Hero:** the weave — imagery enters as warp/weft panels the thread pulls into a loose constellation; first scroll releases them and settles the hero copy. One orchestrated moment, never repeated.
- **Footer:** the thread runs out into a selvedge knot beside the logo.

**Secondary device — the tech-pack.** All statistics set as spec blocks: tabular figures in the utility face, small uppercase annotation labels, hairline rules, scroll-triggered count-up. The visual language of a garment measurement sheet. Stats only; never decorate prose with it.

**Scroll grammar.** Default: vertical full-viewport chapters, one on screen at a time, oversized left-anchored uppercase titles, smooth scroll. Sanctioned departures: (1) **Our Products is a pinned horizontal-scroll gallery** (vertical input → lateral travel; mobile degrades to native swipe + scroll-snap; reduced-motion degrades to a vertical list); (2) **Partners may run as a slow horizontal band**; (3) at most one full-bleed image breather per long page (caption below or absent, never overlaid).

**Page transitions.** A fabric-wipe between pages — black panel sweep while the thread re-draws into the next page's rail — via barba.js or the native View Transitions API, whichever proves cleaner under WordPress; reduced-motion gets an instant cut; Yoast/analytics re-fire verified on every soft navigation. Time-boxed; a hard cut is always acceptable.

**Micro-interactions (Track B, restrained):** line-masked SplitText reveals on chapter titles; slight parallax with overflow clipping on imagery; magnetic pull on carousel arrows only; optional minimal ring cursor. Chanel rule: cut one effect per page before shipping. Sound: never.

**Palette & texture.** Ground `#0A0A0A` (pure `#000` permitted in hero/products), white text, muted grey `~#8A8A8A`, hairlines `#1E1E1E`, one pink sampled from the actual logo (extract and record the hex). Optional self-generated knit-noise ≤3% opacity, only if it survives critique.

**Typography (open-licence, self-hosted woff2 only).** At G3 run a **type bake-off**: three candidate pairings (display + body + tabular utility), each obeying §4's bans, at least one display face genuinely discovered beyond the usual suspects; render the same chapter in all three; the fresh-context critic scores them against §2; the winner's full scale, weights, and tracking get tokenised in `DESIGN.md`. Display: bold, uppercase, tracked. Body: 16–18px, line-height ≥1.6. Never any reference site's licensed fonts.

---

# 6. Inspiration directory & scouting protocol

Study **visually, for patterns only** — composition, pacing, scroll grammar, type scale, restraint. **HARD: never copy code, markup, fonts, images, or text from any site; everything shipped is written by you or open-licence with the licence logged.**

- **breakthroughenergy.org** — chapters, left titles, right progress, people/portfolio pages.
- **Saint Laurent / Alexander McQueen / Dries Van Noten** — dark, high-contrast fashion authority.
- **Toteme / Jacquemus / Aman** — print-grade grids, slow confident pacing, the luxury of silence.
- **Off-White** — grid discipline with one typographic quirk as identity.
- **Devialet** — dark product minimalism; spec data made desirable.

**Runtime scouting (Day 1, ≤45 min):** find two or three further manufacturer/B2B sites of genuine calibre; write `INSPIRATION.md` — per reference: three pattern observations + one explicit "what we will not take" line. This file calibrates the critic's taste for the whole campaign.

---

# 7. Open-source leverage protocol

You are encouraged to stand on open source rather than reinvent — that is where the campaign's speed and polish come from — under these rules:

**Sanctioned sources.** npm/pip packages with permissive licences; the **Codrops GitHub organisation** (dozens of effect demos — kinetic-type page transitions, elastic grid scroll, on-scroll 3D carousels, repeating image transitions — most repos MIT, per Codrops' licensing page downloadable demos default to MIT unless stated otherwise); GSAP's official demo ecosystem; well-starred MIT/OFL/BSD repos you find for a specific technique. Open-licence type foundries for fonts (OFL). CC0/public-domain media only, owner assets always first.

**Licence triage (mandatory, per repo):** read the actual LICENSE file — never assume. Older Codrops demos carry custom "free for commercial use, no as-is redistribution" terms: usable here (this is integration into a client project), still logged verbatim. Some demos are GPL or carry GPL/commercial dual-licensed dependencies (e.g., Flickity requires a paid licence for proprietary commercial use — avoid it). GPL code is acceptable inside a WordPress theme (themes are GPL-compatible territory) but the theme's declared licence must then be set accordingly and the decision logged. Anything unclear: reimplement instead.

**Vendoring rules:** prefer **learning the technique and reimplementing in house style** over pasting; vendor only small, isolated, readable modules; strip to what's used; read every vendored line for network calls, trackers, eval, or obfuscation before it enters the tree (a vendored file is a supply-chain decision); re-skin to the token system so no foreign aesthetic leaks; attribute in `CREDITS.md` with repo URL, licence, and what was taken. Pin every dependency version. No minified blobs ever.

---

# 8. Inputs (source of truth)

- **Seed copy:** `./copy-deck.md` — approved, British English, default content used verbatim; the owner revises later via the content system. Fidelity check in §15.
- **Live site (read-only):** https://rizvifashions.com — ten pages. Extract real counter values from raw HTML/Elementor data attributes for every *[existing figure]*; unfound values ship `[TBD]` and are reported.
- **cPanel (READ-ONLY, download only):** credentials in `./.env` (`CPANEL_URL`, `CPANEL_USER`, `CPANEL_PASS`) — solely to download `wp-content/uploads/` and the active theme dir into `reference/server/`. Never upload/edit/move/delete remotely; never download `wp-config.php` or secrets. On failure, crawl the public site.
- **New imagery:** public Google Drive folder ID `1pG8NQxd7IPlHPX6iE-MvJW--5D2xVhxy` (`gdown --folder` or rclone). Replaces all imagery **except the Management portraits, kept exactly as on the live site (HARD)**.
- **Production stack:** WordPress + JupiterX + Elementor today; `wordpress-seo` (Yoast) installed. The theme coexists with both, fatal-free, rendering its own templates.

---

# 9. Hard safety rails — absolute, inherited by every subagent, every session

- Operate ONLY inside this project directory; touch nothing else on this Mac.
- Live server and Google Drive: download-only, forever.
- Local git checkpoints; **no remotes, no pushes, no GitHub publishing, ever.**
- Credentials only in `.env`; never printed, logged, committed, packaged. `.gitignore`: `.env`, `reference/`, `node_modules/`, `dist/`, `qa/`.
- No `sudo`, no `rm -rf` outside paths you created here, project-local installs only.
- At G0, also write a project `.claude/settings.json` deny-list for destructive command patterns as harness-level belt-and-braces beneath these prose rails.
- Rails + locked tokens go into the project **`CLAUDE.md`** at G0 — and CLAUDE.md is a *living* document: append learned conventions, gotchas, and decisions-of-record as the campaign proceeds, so every session and subagent inherits them.

---

# 10. Zafir's five rules (verbatim, non-negotiable)

1. It's a WordPress website.
2. Build a **WordPress theme**, not "a website".
3. Produce `PLUGINS.md` listing every plugin to manually install afterwards.
4. `wordpress-seo` is installed — don't break search rankings or tracking.
5. Generate `README.md` with instructions on how to install this theme.

---

# 11. Content system architecture

- **Total content/structure separation.** No copy in template markup. All text, labels, stats, people, partners, image references, and per-page section orders live in `inc/data/*.json` (or clean PHP arrays) with self-explanatory keys and comments; templates render the data layer.
- **Image slots, not files.** Every image position is a named slot mapped in the data layer.
- **`CONTENT-GUIDE.md`:** plain-language manual — change this key to change this text; one worked example per content type.
- **Swap test (gate criterion):** change one text key and one image key; verify both render.
- **v2 path:** `HANDOFF.md` documents migrating the data layer to the WP editor/ACF later.

---

# 12. Asset & cutout pipeline

1. Fetch Drive → `reference/drive/`; server uploads per §8. View every image; write `inc/data/image-map.json` assigning images to slots by subject.
2. **Cutouts (the white-box problem):** product/garment shots on white must sit directly on black. Use **rembg** (open-source background removal). On a 10-image sample, bake off its general model, `birefnet-general`, and the clothing-segmentation model; choose per image class, record it. Post-process every matte: 1px alpha erode + soft feather (halo kill), despill, export transparent WebP/PNG + black-composited preview.
3. **Cutout QA:** critic inspects every cutout at 200% on black — halos, amputated straps/drawstrings/lace, ghost shadows. Failures → `CUTOUTS_TODO.md`; ship best available meanwhile. Never fake a cutout by painting black over white.
4. Responsive derivatives: WebP at 1920/1280/768/480 with `srcset`; portraits and partner logos staged from live-site reference (logos re-toned white/grey for dark ground; tonal adjustment yes, redrawing no).

---

# 13. Motion & interaction loadout

- **Libraries (bundled locally, versions pinned, licences verified at install and logged):** GSAP + ScrollTrigger + SplitText (the full toolset is free for commercial use — confirm current licence text at install), Lenis smooth scroll, barba.js or View Transitions API, and — only if Track C is reached — a minimal WebGL layer (OGL or three.js) for a thread/fabric hero shader.
- **Physics charter:** transform/opacity only; entrances 0.8–1.2s `power3.out`; the horizontal gallery scrubbed, never linear; 60fps verified by Playwright tracing on every animated page; anything that can't hold 60fps gets simplified, not deferred.
- **Reduced motion (HARD):** everything collapses — static rail, fades, instant transitions, vertical product list.
- **Feature flags:** every Track B/C element independently switchable in one config file, documented in `HANDOFF.md`.

---

# 14. Page-by-page specification (data-driven; seed = copy-deck.md)

1. **Home:** preloader (first visit) → hero weave + copy → spec counters → six sustainability cards (anchor-linked) → Mission → Vision → Manufacturing → environmental spec blocks → accreditations band → partners teaser → contact strip. Thread stitches every seam.
2. **Overview:** Who We Are (two chapters) → Technology / Scale / Range chapters → BGMEA standalone strip.
3. **Company Profile:** Mission → accreditations → Vision → counters → Manufacturing → growth charts recreated as clean white/pink-on-black SVG from the originals' data (illegible ⇒ restyle originals on dark, log it). Anchors `#our-mission`, `#our-vision`, `#manufacturing` preserved (HARD).
4. **Management:** featured MD profile, then team grid; **portraits kept (HARD)**; pink-accent hover frames.
5. **Partners (new page):** client logos as a portfolio wall — grid or slow horizontal band (deviation protocol), white/grey logos on black, pink hover frame; in nav; teasers stay on Home and Company Profile.
6. **Our Capabilities:** Sourcing → Product Development → Sampling → Cutting → Sewing → Finishing (spec block only) → Knitting (spec block only) → Printing; left titles, tech-pack stats.
7. **Sustainability:** six chapters; live anchor IDs preserved (HARD).
8. **Our Products — the horizontal showpiece:** pinned lateral gallery; category rail one-third down (Men's · Women's · Kids' · Underwear · Newborn), active white, others dimmed/desaturated; **cutout imagery floating on black**; arrows + keyboard + drag/swipe; momentum and snap tuned until machined. Mobile: native horizontal swipe per category.
9. **Career:** single elegant chapter.
10. **Gallery:** dark editorial grid, generous spacing, optional captions.
11. **Contact:** structure preserved (HARD), recoloured and re-typeset; form styled dark, powered by the `PLUGINS.md` form plugin.
12. **404 + search:** minimal, on-system, thread present.

---

# 15. WordPress engineering requirements

- Classic theme `rizvi-noir` v1.0.0: proper `style.css` header (Text Domain `rizvi-noir`), `functions.php`, header/footer, `template-parts/`, `inc/data/`, `assets/{css,js,fonts,img}`, `screenshot.png` (1200×900 hero render).
- `add_theme_support('title-tag','post-thumbnails','html5','custom-logo')`; primary menu; **`wp_head()`/`wp_footer()` always**; never emit your own title/meta/schema — Yoast owns that layer (HARD).
- **SEO continuity (HARD):** identical production slugs (`/overview/`, `/company-profile/`, `/management/`, `/gallery/`, `/our-capabilities/`, `/our-products/`, `/sustainability/`, `/career/`, `/contact/`); slug-mapped templates; one `<h1>` per page; descriptive `alt` everywhere; nothing `noindex`ed; soft navigations re-fire titles/analytics, verified.
- Escape all output; versioned enqueues; no jQuery; PHP 7.4–8.3 clean under `WP_DEBUG`; Elementor active-or-absent safe.
- **Budgets:** JS ≤180KB gz (≤300KB only if Track C ships and Lighthouse holds), CSS ≤60KB gz, fonts subset + preloaded; Lighthouse ≥90 perf / ≥95 a11y / ≥95 best-practices; CLS <0.05; LCP <2.5s; **zero console errors/warnings**.
- **Accessibility (HARD):** visible focus, full keyboard operation (horizontal gallery traversable), body contrast ≥4.5:1, skip-link, reduced-motion honoured.

---

# 16. Working method (how every unit of work proceeds)

- **Explore → plan → code → commit, at two scales.** Per gate: explore and write the plan *without writing code*; planning and implementation are separate acts — premature code solves the wrong problem. Per page/feature: a 5–10 line micro-plan in `PLANS/` (intent, approach, files touched, risks, evidence to produce) before the first edit.
- **Fresh-eyes critique:** the critic always runs as a **fresh-context subagent** that sees the screenshots, the rubric, `DESIGN.md`, and `INSPIRATION.md` — never the builder's reasoning. The author never grades its own work.
- **Evidence rule:** a gate or fix is "done" when `PROGRESS.md` contains its proof — the command and its output, the score table, the screenshot path. Show, don't claim.
- **Context hygiene:** the orchestrator stays lean; heavy exploration (crawls, image review, licence reading) runs in subagents that return summaries; durable state lives in files (`STATE.json`, `TODO.md` working checklist per session, CLAUDE.md conventions), not in conversation memory.
- **Specificity first time:** when implementing, restate the exact acceptance criteria from this prompt at the top of the micro-plan; vague intent produces mean-regression output.

---

# 17. Campaign plan — days, gates, session protocol

**Session protocol (every session):** (1) read `STATE.json`, verify completed-gate artefacts exist; (2) announce the session plan in `PROGRESS.md`; (3) work per §16; (4) checkpoint after every gate and significant sub-task; (5) before context runs long or work pauses, write `SESSION-REPORT-N.md` (done / decided / evidence / next) and commit.

**Day 1 — Intelligence & design lock.** G0 scaffold (workspace, git, CLAUDE.md, `.claude/` settings + agent roster: recon, curator, theme-engineer, motion-engineer, fresh-context critic — use the owner's installed **impeccable** agent as/with the critic if available; add further subagents/skills only if they demonstrably serve the build, logged). G1 recon (crawl, counters, slugs, anchors, pink hex, portraits/logos). G2 assets + cutouts + cutout QA. G3 design lock: `INSPIRATION.md`, type bake-off per §5, `DESIGN.md` with the complete token system (no silent decisions), thread spec, hero storyboard, per-page wireframes; token-lint script built; tokens into CLAUDE.md.
**Day 2 — Track A (must ship).** G4 skeleton + shell + data layer + all twelve templates on seed content; fidelity + swap tests pass; token-lint clean; zero console errors. G5 Track A QA to thresholds; Yoast smoke test; budgets met. *Track A alone is a respectable deliverable.*
**Day 3 — Track B.** G6 motion layer behind flags: thread rail + seams, hero weave, SplitText reveals, horizontal gallery, transitions, micro-interactions; rubric re-passed; reduced-motion verified; FPS traced.
**Day 4 — Track C & hardening.** G7 (optional, only with ≥20% of expected time remaining): WebGL hero experiment — kept only if the critic scores it higher AND budgets hold; else flag off. G8 hardening: chromium + webkit, 360/768/1280/1680 matrix, visual diffs, a11y audit, risk register complete.
**Day 5 — Release.** G9 `dist/rizvi-noir.zip` clean. G10 full documentation set (§19) + `FINAL_REPORT.md`.

**Time-boxes:** hero weave ≤5 attempts; any single bug ≤45 min then simplify; transitions and Track C only inside their windows. Rabbit-holing is a defect.

---

# 18. QA machinery

- **Local env:** `wp-env` if Docker present, else `npx @wp-now/wp-now start`; ten pages with exact slugs, front page set, menu built, theme active, **Yoast installed locally** (no fatals; sitemap renders; titles once; soft-nav tracking verified).
- **Content-fidelity script:** rendered text per page diffed against the data layer, and data layer against `copy-deck.md`; gate fails on drift beyond whitespace/typographic punctuation.
- **Token-lint:** shipped CSS greps clean against `DESIGN.md` tokens (§4); gate fails on violations.
- **Screenshot matrix:** Playwright at 360×800 / 768×1024 / 1280×800 / 1680×1050, chromium **and** webkit, every page, every pass → `qa/pass-N/`; diff passes.
- **Scored rubric (fresh-context critic, every pass, recorded with evidence):** composition & spacing rhythm · typographic hierarchy · motion quality & restraint · palette discipline · thread coherence · cutout quality · scroll-grammar coherence · content fidelity · responsiveness · accessibility · WP/SEO correctness · expensive-feel — 0–10 each, **plus the §4 template test (pass/fail)**. **Ship: average ≥8.5, nothing <7, template test passed on every page.** Minimum three full passes; stop only when a pass yields no fixes and all thresholds hold.
- **`RISKS.md`:** production-bite risks, severity + mitigation, updated daily.

---

# 19. Deliverables (all must exist at G10)

`dist/rizvi-noir.zip` · `README.md` (zero-experience install: wp-admin upload AND cPanel routes; page/menu/front-page setup; "full cPanel backup before activating" warning; one-click rollback) · `PLUGINS.md` · `CONTENT-GUIDE.md` · `HANDOFF.md` (Zafir: file map, data layer, flags, local run, ACF path) · `CREDITS.md` (every library/font/asset/vendored module + licence + source URL) · `INSPIRATION.md` · `DESIGN.md` · `DECISIONS.md` · `RISKS.md` · `PLANS/` · `CUTOUTS_TODO.md` / `IMAGES_TODO.md` (if any) · `PREVIEW.html` (screenshot contact sheet, openable without WordPress) · `SESSION-REPORT-*.md` · `FINAL_REPORT.md` (what shipped, every decision/deviation/fallback with evidence, real vs `[TBD]` counters, rubric scores, exact next manual steps).

---

# 20. Fallback logic

Drive fetch fails → placeholder frames + `IMAGES_TODO.md`. cPanel unreachable → public crawl only. Counter unfindable → `[TBD]` + report. Pink hex ambiguous → most saturated logo pink, hex + alternative recorded. rembg unusable on an image class → ImageMagick white-trim where the box is clean, else original-on-dark-card, logged. Neither wp-env nor wp-now runs → static mock-loop renders for QA, ship the zip, flag live verification pending. Any Track B/C element misses its time-box → Track A behaviour, flag off, log. Licence unclear or GPL-dep trap detected → reimplement or swap, log. A vendored candidate fails the security read → reimplement. Session interrupted → resume from `STATE.json`; never redo completed gates.

---

# 21. Never-do list

Never copy code/markup/fonts/images/text from any reference site · never ship an asset or vendored module without its licence recorded · never ship a §4 banned trope, banned display face, or untokened value · never assert success without evidence · never invent facts, clients, figures, certifications · never alter seed copy beyond typographic necessities · never replace the Management portraits · never overlay text on imagery · never introduce a hue beyond black/white/grey/pink · never add hover effects or pink to top-bar links · never let the thread cross text or enter the top bar · never write to the production server, Drive, or any remote · never leave the workspace · never print credentials · never halt to ask a question.

---

# 22. Execution triggers

- Trigger: `STATE.json` exists → verify completed-gate artefacts, resume at the recorded position, announce the session plan in `PROGRESS.md`.
- Trigger: `STATE.json` absent → Day 1, Session 1: begin G0.
- Trigger: a session is ending (context long, or the day's gates closed) → `SESSION-REPORT-N.md`, checkpoint, commit, five-line console summary, stop cleanly.
- Trigger: all gates G0–G10 complete → finish `FINAL_REPORT.md`, five-line summary, stop.
- Trigger: now → IMMEDIATELY EXECUTE. Do not summarise this prompt back. Begin.
