# CUTOUTS_TODO — §12.3 QA failures (ship best available meanwhile)

47 inspected (critic workflow wf_737eaf0f-7b3, 200% edge crops): **24 ship / 21 fix / 2 reject**. Full forensics: reference/cutout-qa.json.

## Rejected (do not ship)

- `11_m.jpg` — background remnant: residual 'alvanon' source watermark (pink/orange text + logo) stamped across the model's collarbone and tee neckline — inside the subject, u
- `17.jpg` — ghost shadow / dress-form bleed across the ENTIRE frame: the form was darkened, not removed — neck post, metal hanger bracket, shoulders, arms, torso and legs a

## Fix queue (defect + named fix per critic)

- `001_m.jpg` — Fix: hair-edge decontamination / re-matte of the hair region plus a slight black-point crush; usable at thumbnail size as-is
- `002_m.jpg` — Fix: punch the two arm-torso gaps through to pure black (simple lasso re-matte); all outer silhouette edges are tight
- `004_m.jpg` — Fix: 3-6px alpha erosion + edge decontamination + black-point crush, then re-check hair detail; even after fix, cap usage at medium card size — do not use at hero scale
- `005_m.jpg` — Fix: punch out the shorts/forearm gap to pure black (single contained region); hair, face and feet edges are clean and tight
- `006_m.jpg` — Fix: re-cut both soles with a hard edge and delete the under-shoe shadow; rest of the silhouette is a clean thin contour
- `007_m.jpg` — Fix: re-matte the viewer-left hand from the source frame; usable at small scale as-is since the gouges read at >=2x
- `009_m.jpg` — Fix: punch out the two hair/neck gaps to pure black and trim the sole shadow; pigtail outer edges themselves are clean
- `01.jpg` — fix: re-key the surround to true #000 (levels choke on the matte) and patch out the between-legs fragment — asset is usable after that
- `03_m.jpg` — fix: choke the matte 1-2px and decontaminate edge color around the sneakers and hood — hoodie drawstrings, laces, hair, and under-foot area are otherwise clean (no ghost shadow)
- `04.jpg` — fix: choke/re-matte the halo and clone out the stamp; CAVEAT — black-on-black garment will have very low edge contrast after cleanup, restrict to small/medium tiles, never hero on pure #000
- `06.jpg` — fix: clone-stamp the alvanon mark off the form chest — edges otherwise clean and surround is true black
- `12.jpg` — Fix: tighter top crop just below the neck-pole finial removes the floating dark blade; matte edges themselves are clean and the ground is pure black.
- `12_m.jpg` — Fix: targeted re-matte / edge-hardening of the left shoe sole region only. Hood drawstrings are intact with both tips present, cuffs and hair are clean, ground is pure black.
- `14.jpg` — Fix: spot retouch (clone/heal) the Alvanon chest stamp off the form. The fragile structures survived the matte perfectly — both spaghetti straps continuous, scalloped lace hem fully intact; ground is 
- `15.jpg` — Fix: re-matte the top band to remove the yellow top remnant and fully erase the ankle stubs and ghost leg remnants below the hems; garment edges themselves are clean.
- `15_m.jpg` — Fix: targeted re-matte of the feet region (choke + decontaminate the white fringe around both sneakers); rest of the silhouette is shippable.
- `16.jpg` — Fix: erase the white ankle stub under the left hem (or restore the right ankle for symmetry with the set's retained-form convention); all other edges are clean.
- `24.jpg` — Fix: targeted heal/paint-out of the grey hook stub — it sits over pure black so it is a trivial clone-out. Sleeve feathering is acceptable on black; optionally tighten the sleeve matte in the same pas
- `26.jpg` — Fix: paint out the rod (it crosses only pure black, trivial heal) or crop the top ~90px above the neck cap. Rest of the cutout — arms, hands, legs, garment edges — is clean.
- `27.jpg` — Fix: re-matte the two knee zones from the source frame to restore the eaten fabric. Everything else is clean — pure black background, feet and pink cuffs intact, top crop fine.
- `28.jpg` — Fix: tighter top crop (~35-40px removes rod and clamp cleanly, chest logo unaffected) or paint out the hardware over black. Garment edges, waistband, fly detail and background are otherwise clean at 2

## Carried work (Session 2 first tasks)

- ~~birefnet pending~~ **§12.2 BAKE-OFF CLOSED 2026-06-10 (S3):** 23/23 re-matted (reference/cutouts-bakeoff/birefnet/), judged per-defect vs u2net (REVIEWS/G5-pages.md §Cutout QA): **8 fixes / 13 same / 2 worse**. Model record FINAL: flats=u2net · models=u2net · cloth_seg=REJECTED · **birefnet=per-file re-matte tool for the extremity/interior-gap class** (006_m, 007_m, 01, 03_m, 04, 12_m, 15_m, 27 — post-process erode/feather/despill + 200% re-QA, then ship via image-map). In-subject defects (alvanon stamps 06/11_m/14; dress-forms 12/16/17; hardware 24/26/28; halo-aura 004_m; interior slabs 002_m/005_m/009_m/15) are beyond ANY matting model → scripted clone-out pass or owner-supplied cleaner sources (G7 list).
- **Halo scripted pass 200% re-check (S3 critic): 001_m SHIP, 03_m SHIP — both staged.** 004_m / 04 / 15_m STILL-FIX (04 and 15_m have birefnet wins pending post-processing; 004_m stays medium-cap, aura persists in both models).
- Scriptable first pass for the halo class: stronger alpha erode (2-3px) + black-point crush on 001_m/004_m/03_m/04/15_m.
- Responsive WebP derivatives (1920/1280/768/480 + srcset) — generated at G4 when assets materialise into theme/assets/img/ (setup script to come).
- ~~Note 08_m/07_m duplicate-frame finding: verify _m-to-product pairing before publish; never use both side by side.~~ **RESOLVED 2026-06-10 (S2):** visual comparison confirms 07_m and 08_m are the SAME source frame (identical model/pose/floral jumpsuit, near-identical crop). **08_m ships** (passed QA); **07_m quarantined** — duplicate AND carries the viewer-left-hand gouge from the fix queue. Image-map slots referencing 07_m must repoint to 08_m at G5.
- **Halo-class scripted pass DONE 2026-06-10 (S2):** setup/fix-halos.py → reference/cutouts/fixed/ (001_m e3 / 004_m e4 / 03_m e2 / 04 e3 / 15_m e2, all + black-point crush@18, _onblack previews generated). PENDING: critic re-check at 200% before any enters G5; 004_m stays capped at medium card size regardless.