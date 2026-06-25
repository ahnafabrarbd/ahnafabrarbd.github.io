#!/usr/bin/env python3
"""retone-accreditations.py — accreditation-only driver extending retone-logos.py.

The partners pass is another agent's scope and retone-logos.py is under
concurrent edit, so this driver imports its tonal machinery (retone, on_ground,
contact_sheet — tonal adjustment ONLY, no redrawing) and runs JUST the
accreditation set. It never touches src/assets/logos/partners/ or
src/data/partners.json.

Identification provenance: every name below was read by vision from the mark
itself (curator pass, 2026-06-10) — no invented certifications. 14 source
files, 14 distinct marks (1.png is the round OEKO-TEX Standard 100 badge,
re-toned per the "every accreditation logo" order). NO BGMEA mark exists in
reference/site-assets/accreditation/.

Output:
  src/assets/logos/accreditations/<kebab>.png   (#D6D6D6 on transparent)
  setup/retone-preview/accreditations-*.png     (verification only)
  src/data/accreditations.json                  ({comment, logos:[{name,file,identified}]})
Logos in NEEDS_MANUAL fail the dark-ground legibility check: file=null,
excluded from shipped assets (preview copy retained).
"""

import importlib.util
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location(
    "retone_logos", os.path.join(ROOT, "setup", "retone-logos.py"))
rl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rl)

# source file -> (kebab, display name) — vision-verified, see docstring.
ACCREDITATIONS = {
    "1.png":                         ("oeko-tex-standard-100-badge",
                                      "OEKO-TEX Standard 100 (Confidence in Textiles badge)"),
    "image-removebg-preview-70.png": ("oeko-tex-standard-100", "OEKO-TEX Standard 100"),
    "23_Logo_RCS.png":               ("recycled-claim-standard", "Recycled Claim Standard (RCS)"),
    "4.png":                         ("sedex", "Sedex"),
    "5.png":                         ("wrap", "WRAP"),
    "666-e1595230122775.png":        ("gots", "Global Organic Textile Standard (GOTS)"),
    "BW-Bangladesh-Stacked-rgb.png": ("better-work-bangladesh", "Better Work Bangladesh"),
    "Figure-6-BSCI-Audit.jpg":       ("bsci", "BSCI"),
    "GRS.png":                       ("global-recycled-standard", "Global Recycled Standard (GRS)"),
    "amfori-1.png":                  ("amfori-bsci", "amfori BSCI"),
    "csm_STeP_21f9689b94.png":       ("oeko-tex-step", "OEKO-TEX STeP"),
    "images.png":                    ("higg-index", "Higg Index"),
    "logo_dark.png":                 ("rmg-sustainability-council", "RMG Sustainability Council (RSC)"),
    "ocs-logo.jpg":                  ("organic-content-standard", "Organic Content Standard (OCS)"),
}

# Re-toned outputs that do NOT read cleanly on #0A0A0A (visual verify pass).
NEEDS_MANUAL: set[str] = set()


def main() -> None:
    src_dir = os.path.join(ROOT, "reference", "site-assets", "accreditation")
    out_dir = os.path.join(ROOT, "src", "assets", "logos", "accreditations")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(rl.PREVIEW_DIR, exist_ok=True)

    entries, glyphs, manual = [], {}, []
    for src, (kebab, name) in sorted(ACCREDITATIONS.items(), key=lambda kv: kv[1][0]):
        glyph = rl.retone(os.path.join(src_dir, src))
        glyphs[kebab] = glyph
        rl.on_ground(glyph).save(
            os.path.join(rl.PREVIEW_DIR, f"accreditations-{kebab}.png"))
        if kebab in NEEDS_MANUAL:
            manual.append(kebab)
            stale = os.path.join(out_dir, f"{kebab}.png")
            if os.path.exists(stale):
                os.remove(stale)
            entries.append({"name": name, "file": None, "identified": True})
            continue
        glyph.save(os.path.join(out_dir, f"{kebab}.png"))
        entries.append({"name": name,
                        "file": f"assets/logos/accreditations/{kebab}.png",
                        "identified": True})
    rl.contact_sheet(glyphs,
                     os.path.join(rl.PREVIEW_DIR, "_sheet-accreditations.png"))

    aj_path = os.path.join(ROOT, "src", "data", "accreditations.json")
    accreds_json = {
        "comment": "Curator pass 2026-06-10 (setup/retone-accreditations.py, tonal "
                   "machinery from setup/retone-logos.py): all 14 accreditation marks "
                   "in reference/site-assets/accreditation/ identified by vision from "
                   "the mark itself — no invented certifications. Known-set cross-check: "
                   "amfori, Better Work Bangladesh, STeP, OCS, GRS, RCS, BSCI present; "
                   "NO BGMEA mark exists in the source folder — do not add one. "
                   "file paths are relative to src/; file=null means the #D6D6D6 "
                   "re-tone failed the dark-ground legibility check (needs-manual, "
                   "preview kept in setup/retone-preview/).",
        "logos": entries,
    }
    with open(aj_path, "w") as f:
        json.dump(accreds_json, f, indent=2)
        f.write("\n")

    shipped = sum(1 for e in entries if e["file"])
    unidentified = sum(1 for e in entries if not e["identified"])
    print(f"accreditations: {len(entries)} entries | identified "
          f"{len(entries) - unidentified} | unidentified {unidentified} | "
          f"needs-manual {len(manual)} {manual or ''} | shipped {shipped}")
    print(f"wrote {aj_path}")


if __name__ == "__main__":
    main()
