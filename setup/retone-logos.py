#!/usr/bin/env python3
"""retone-logos.py — G5 curator: re-tone partner/accreditation logos for dark ground.

RAILS: tonal adjustment ONLY (per-pixel luminance/alpha -> single-tone opacity map).
No redrawing, no shape edits, no invented marks. Glyph tint = ink-body #D6D6D6 on
transparent ground; verified against ground #0A0A0A.

Method per source image:
  1. Transparent sources (real alpha): glyph mask = the mark's own alpha channel
     (preserves original anti-aliasing). If the mark is a mostly-solid filled field
     (silhouette would be a blob), apply a luminance knockout INSIDE the alpha:
     darker pixels -> opaque, lighter pixels -> transparent (a purely tonal map).
  2. Opaque sources (JPEG / flattened PNG): background colour = median of the
     2px border ring; glyph mask = colour distance from background, normalised.
     Near-background pixels (incl. near-white paper) fall to transparent; light
     text inside dark seals knocks out automatically. Still purely tonal.

Outputs:
  src/assets/logos/partners/<kebab>.png
  src/assets/logos/accreditations/<kebab>.png
  setup/retone-preview/  (same glyphs composited on #0A0A0A + contact sheets,
                          for visual verification only — not shipped)
Logos listed in NEEDS_MANUAL are excluded from the shipped folders (preview only).
Also rewrites src/data/partners.json and creates src/data/accreditations.json.
"""

import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TINT = (0xD6, 0xD6, 0xD6)          # ink-body
GROUND = (0x0A, 0x0A, 0x0A)        # site ground, preview only
PREVIEW_DIR = os.path.join(ROOT, "setup", "retone-preview")

# source file -> (output kebab name, display name) ----------------------------
# Names are ONLY what is visibly readable in each mark (curator vision pass,
# PROGRESS.md 2026-06-10). Duplicates of the same mark/brand are listed once;
# skipped variants noted at the bottom.
PARTNERS = {
    "194843-large_default-1-2.jpg":                       ("neo-tools", "NEO Tools"),
    "JackWillsLogo.svg.png":                              ("jack-wills", "Jack Wills"),
    "Pepco_logo_logotype-1.png":                          ("pepco", "Pepco"),
    "client8-e1595299490606.png":                         ("primark", "Primark"),
    "WhatsApp-Image-2025-02-02-at-3.17.24-PM-1.jpeg":     ("fm-london", "FM London"),
    "WhatsApp_Image_2025-02-02_at_2.28.07_PM-removebg-preview-1.png":
                                                          ("costco-wholesale", "Costco Wholesale"),
    "client-11-1-e1595229746789-1.png":                   ("lefties", "Lefties"),
    "client1.png":                                        ("aldi", "ALDI"),
    "client2-e1594871892550.png":                         ("fila", "FILA"),
    "client3-1.png":                                      ("lpp", "LPP"),
    "client4-e1595299173100.png":                         ("matalan", "Matalan"),
    "client5.png":                                        ("next", "Next"),
    "client6-1-e1595229652501.png":                       ("ovs", "OVS"),
    "download-2.png":                                     ("lidl", "Lidl"),
    "index.png":                                          ("sports-direct", "Sports Direct"),
    "lonsdale-lomdon.png":                                ("lonsdale-london", "Lonsdale London"),
    "puma-1.png":                                         ("puma", "Puma"),
    "rewe_logo-removebg-preview.png":                     ("rewe-group", "REWE Group"),
    "trade-mark-tex-bd.png":                              ("trademark-textiles", "Trademark Textiles"),
    "up-scanwear_apparel_logo.png":                       ("scanwear-apparel", "Scanwear Apparel"),
}
# Skipped partner sources (same mark already shipped):
#   trade-mark-tex-bd-1.png  — byte-identical to trade-mark-tex-bd.png
#   Primark_Logo_03.2024__1_-removebg-preview-1.png — same Primark wordmark,
#       smaller glyph (150x30) than client8 (151x40)

ACCREDITATIONS = {
    "image-removebg-preview-70.png":   ("oeko-tex-standard-100", "OEKO-TEX Standard 100"),
    "23_Logo_RCS.png":                 ("recycled-claim-standard", "Recycled Claim Standard (RCS)"),
    "4.png":                           ("sedex", "Sedex"),
    "5.png":                           ("wrap", "WRAP"),
    "666-e1595230122775.png":          ("gots", "Global Organic Textile Standard (GOTS)"),
    "BW-Bangladesh-Stacked-rgb.png":   ("better-work-bangladesh", "Better Work Bangladesh"),
    "Figure-6-BSCI-Audit.jpg":         ("bsci", "BSCI"),
    "GRS.png":                         ("global-recycled-standard", "Global Recycled Standard (GRS)"),
    "amfori-1.png":                    ("amfori-bsci", "amfori BSCI"),
    "csm_STeP_21f9689b94.png":         ("oeko-tex-step", "OEKO-TEX STeP"),
    "images.png":                      ("higg-index", "Higg Index"),
    "logo_dark.png":                   ("rmg-sustainability-council", "RMG Sustainability Council (RSC)"),
    "ocs-logo.jpg":                    ("organic-content-standard", "Organic Content Standard (OCS)"),
}
# Skipped accreditation sources (same certification already shipped):
#   1.png — OEKO-TEX Standard 100 round "Confidence in Textiles" badge; the
#       horizontal lockup (image-removebg-preview-70.png) is the shipped variant
#       (the round badge's 4px micro-text turns to mush at 129x90).

# Re-toned outputs that do NOT read cleanly on dark (visual verify pass).
# Kept out of shipped folders; preview copies remain in setup/retone-preview/.
NEEDS_MANUAL: set[str] = {
    "pepco",   # dark-red wordmark on yellow/blue field collapses to a solid
               # ellipse under the tonal map — word unreadable on dark ground
}


def luminance(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def derive_mask(im: Image.Image) -> np.ndarray:
    """Per-pixel glyph opacity in [0,1] — purely tonal, no shape edits."""
    rgba = np.asarray(im.convert("RGBA"), dtype=np.float64)
    rgb, alpha = rgba[..., :3], rgba[..., 3] / 255.0

    if (alpha < 0.5).mean() > 0.02:                      # transparent source
        mask = alpha.copy()
        solid = alpha > 0.8
        ys, xs = np.nonzero(alpha > 0.1)
        if len(ys):
            bbox_area = (np.ptp(ys) + 1) * (np.ptp(xs) + 1)
            coverage = solid.sum() / bbox_area
            if coverage > 0.5 and solid.any():           # filled field -> knockout
                lum = luminance(rgb)
                p5, p95 = np.percentile(lum[solid], [5, 95])
                if p95 - p5 > 40:                        # real internal contrast
                    kn = np.clip((p95 - lum) / (p95 - p5), 0.0, 1.0)
                    mask = alpha * kn
        return mask

    # opaque source: background = median border colour, mask = colour distance
    ring = np.ones(rgb.shape[:2], dtype=bool)
    ring[2:-2, 2:-2] = False
    bg = np.median(rgb[ring], axis=0)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=-1))
    sig = dist[dist > 40]
    dref = max(np.percentile(sig, 80) * 0.8, 60.0) if sig.size else 441.0
    return np.clip(dist / dref, 0.0, 1.0)


def retone(src_path: str) -> Image.Image:
    im = Image.open(src_path)
    mask = derive_mask(im)
    h, w = mask.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = TINT
    out[..., 3] = np.round(mask * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def on_ground(glyph: Image.Image, pad: int = 12) -> Image.Image:
    board = Image.new("RGBA", (glyph.width + 2 * pad, glyph.height + 2 * pad),
                      (*GROUND, 255))
    board.alpha_composite(glyph, (pad, pad))
    return board.convert("RGB")


def contact_sheet(glyphs: dict[str, Image.Image], path: str, cols: int = 5) -> None:
    cell_w = max(g.width for g in glyphs.values()) + 24
    cell_h = max(g.height for g in glyphs.values()) + 24
    rows = -(-len(glyphs) // cols)
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (*GROUND, 255))
    for i, (_, g) in enumerate(sorted(glyphs.items())):
        x = (i % cols) * cell_w + (cell_w - g.width) // 2
        y = (i // cols) * cell_h + (cell_h - g.height) // 2
        sheet.alpha_composite(g, (x, y))
    sheet.convert("RGB").save(path)


def run_set(label: str, src_dir: str, out_dir: str, mapping: dict) -> list[dict]:
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    entries, glyphs, shipped, manual = [], {}, 0, []
    for src, (kebab, name) in sorted(mapping.items(), key=lambda kv: kv[1][0]):
        glyph = retone(os.path.join(src_dir, src))
        glyphs[kebab] = glyph
        on_ground(glyph).save(os.path.join(PREVIEW_DIR, f"{label}-{kebab}.png"))
        if kebab in NEEDS_MANUAL:
            manual.append(kebab)
            entries.append({"name": name, "file": None, "identified": True})
            continue
        rel = f"assets/logos/{label}/{kebab}.png"   # relative to src/
        glyph.save(os.path.join(ROOT, "src", rel))
        shipped += 1
        entries.append({"name": name, "file": rel, "identified": True})
    contact_sheet(glyphs, os.path.join(PREVIEW_DIR, f"_sheet-{label}.png"))
    unidentified = sum(1 for e in entries if not e["identified"])
    print(f"{label}: {len(entries)} entries | identified {len(entries) - unidentified} "
          f"| unidentified {unidentified} | needs-manual {len(manual)} "
          f"{manual or ''} | shipped {shipped}")
    return entries


def main() -> None:
    ref = os.path.join(ROOT, "reference", "site-assets")
    partners = run_set("partners", os.path.join(ref, "partner"),
                       os.path.join(ROOT, "src", "assets", "logos", "partners"),
                       PARTNERS)

    pj_path = os.path.join(ROOT, "src", "data", "partners.json")
    with open(pj_path) as f:
        old = json.load(f)
    partners_json = {
        "comment": "G5 curator pass (setup/retone-logos.py): every live partner logo "
                   "identified by vision from the mark itself — no invented names. "
                   "22 source files -> 21 unique logos -> 20 unique brands (Primark "
                   "appears twice live; trade-mark-tex-bd-1.png is a byte-duplicate). "
                   "file=null means re-tone needs manual work; source kept out of "
                   "shipped assets. introSeed remains SEED copy (G5 owner item).",
        "introSeed": old["introSeed"],
        "totalLiveLogos": old["totalLiveLogos"],
        "partners": partners,
    }
    with open(pj_path, "w") as f:
        json.dump(partners_json, f, indent=2)
        f.write("\n")
    print(f"wrote {pj_path}")

    if "--with-accreditations" not in sys.argv:
        return  # accreditation pass is another agent's scope

    accreds = run_set("accreditations", os.path.join(ref, "accreditation"),
                      os.path.join(ROOT, "src", "assets", "logos", "accreditations"),
                      ACCREDITATIONS)
    aj_path = os.path.join(ROOT, "src", "data", "accreditations.json")
    accreds_json = {
        "comment": "G5 curator pass (setup/retone-logos.py): every live accreditation "
                   "logo identified by vision from the mark itself — no invented "
                   "certifications. 14 source files -> 13 unique certifications "
                   "(1.png is a second OEKO-TEX Standard 100 lockup, not shipped). "
                   "Known-set cross-check: amfori, Better Work Bangladesh, STeP, OCS, "
                   "GRS, RCS, BSCI all present; NO BGMEA logo exists in "
                   "reference/site-assets/accreditation/ — do not add one. "
                   "introSeed is SEED copy (copy-deck has no accreditation strip line).",
        "introSeed": "Audited and certified across the standards our partners require.",
        "accreditations": accreds,
        "totalLiveLogos": 14,
    }
    with open(aj_path, "w") as f:
        json.dump(accreds_json, f, indent=2)
        f.write("\n")
    print(f"wrote {aj_path}")


if __name__ == "__main__":
    main()
