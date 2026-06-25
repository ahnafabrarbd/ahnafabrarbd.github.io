#!/usr/bin/env python3
"""grade-photos.py — editorial photo grade toward the page ground (DESIGN.md §Cutout & imagery).

Grade (treatment "graded-v1"), applied to the D-008 editorial set + aerial:
  1. Slight desaturation: saturation x 0.88 (ImageEnhance.Color).
  2. Black-point crush to ground: measure the image's effective black point
     (0.4th-percentile luminance), then remap every channel with one LUT so
     that black point lands exactly at 10 (#0A0A0A) and the white point (255)
     stays anchored — lift-then-crush in either direction. Values below the
     black point clamp to 10. The deepest tones therefore sit ON the page
     ground (#0A0A0A): the photo melts into the page instead of floating as
     a grey-black box (black point > ground) or punching a darker hole in it
     (black point < ground).
  3. Very gentle contrast preserve: the remap is linear between the measured
     black point and 255 — highlights and midtone relationships are kept;
     no S-curve, no contrast multiplier.
  4. Save as quality-90 JPEG at ORIGINAL resolution (ICC profile carried over
     when present). Originals in reference/ are never touched.

Portraits are HARD-protected: byte-identical copies, zero processing.
Also emits src/data/photos.json and runs verification (dimensions + hashes).
"""

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "reference"
SRC = ROOT / "src"

GROUND = 10           # #0A0A0A page ground
BLACK_PERCENTILE = 0.004  # 0.4th percentile of luminance = effective black point
SATURATION = 0.88
JPEG_QUALITY = 90

# (source path, output path relative to src/, image-map slot)
EDITORIAL = [
    ("site-assets/section/company-profile.jpg",
     "assets/img/site/company-profile.jpg", "home.mission-teaser"),
    ("site-assets/section/overview.jpg",
     "assets/img/site/overview.jpg", "home.breather"),
    ("site-assets/section/15-1-min.jpg",
     "assets/img/site/15-1-min.jpg", "home.manufacturing-teaser"),
    ("site-assets/section/img_0976-e1599903136947-min-scaled.jpg",
     "assets/img/site/img_0976-scaled.jpg", "home.vision-teaser"),
    ("drive/rizvi/STIL/DJI_0580_dev.jpeg",
     "assets/img/drive/DJI_0580_dev.jpeg", "overview.breather-aerial"),
]

PORTRAITS = [
    ("site-assets/portrait/avatar-1577909_1280.webp",
     "assets/portraits/avatar-1577909_1280.webp", "management.chairman-portrait"),
    ("site-assets/portrait/Shaikh-Rezwan-Director-Sir.jpg",
     "assets/portraits/Shaikh-Rezwan-Director-Sir.jpg", "management.director-portrait"),
]


def black_point(im: Image.Image) -> int:
    """Effective black point: low-percentile luminance (robust to stray noise)."""
    hist = im.convert("L").histogram()
    total = sum(hist)
    target = total * BLACK_PERCENTILE
    acc = 0
    for level, count in enumerate(hist):
        acc += count
        if acc >= target:
            return level
    return 0


def grade(src: Path, dst: Path) -> dict:
    im = Image.open(src)
    icc = im.info.get("icc_profile")
    im = im.convert("RGB")

    # 1. slight desaturation
    im = ImageEnhance.Color(im).enhance(SATURATION)

    # 2+3. black-point remap: [bp..255] -> [GROUND..255] linear; below bp clamps to GROUND
    bp = black_point(im)
    if bp >= 255:
        bp = 254
    scale = (255 - GROUND) / (255 - bp)
    lut = [GROUND if v <= bp else min(255, round(GROUND + (v - bp) * scale))
           for v in range(256)]
    im = im.point(lut * 3)

    dst.parent.mkdir(parents=True, exist_ok=True)
    save_kw = {"quality": JPEG_QUALITY, "optimize": True}
    if icc:
        save_kw["icc_profile"] = icc
    im.save(dst, "JPEG", **save_kw)
    return {"black_point_in": bp, "size": im.size}


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main() -> None:
    records = []
    failures = 0

    print("== GRADE (graded-v1: sat x%.2f, black-point -> #0A0A0A, q%d) ==" %
          (SATURATION, JPEG_QUALITY))
    for rel_src, rel_out, slot in EDITORIAL:
        src, dst = REF / rel_src, SRC / rel_out
        info = grade(src, dst)
        w, h = info["size"]
        records.append({"file": rel_out, "width": w, "height": h,
                        "source": str(src.relative_to(ROOT)),
                        "treatment": "graded-v1", "slot": slot})
        print(f"  {rel_out}  {w}x{h}  bp_in={info['black_point_in']} -> {GROUND}  "
              f"({dst.stat().st_size:,} B)")

    print("== PORTRAITS (verbatim, zero processing) ==")
    for rel_src, rel_out, slot in PORTRAITS:
        src, dst = REF / rel_src, SRC / rel_out
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        with Image.open(dst) as im:
            w, h = im.size
        records.append({"file": rel_out, "width": w, "height": h,
                        "source": str(src.relative_to(ROOT)),
                        "treatment": "verbatim-portrait", "slot": slot})
        print(f"  {rel_out}  {w}x{h}  ({dst.stat().st_size:,} B)  source={src.name}")

    manifest = SRC / "data" / "photos.json"
    manifest.write_text(json.dumps(records, indent=2) + "\n")
    print(f"== WROTE {manifest.relative_to(ROOT)} ({len(records)} entries) ==")

    print("== VERIFY ==")
    for r in records:
        src, out = ROOT / r["source"], SRC / r["file"]
        with Image.open(src) as a, Image.open(out) as b:
            dims_ok = a.size == b.size == (r["width"], r["height"])
        status = "OK" if dims_ok else "FAIL"
        if not dims_ok:
            failures += 1
        print(f"  [dims {status}] {r['file']}: out {b.size} == src {a.size}")
        if r["treatment"] == "verbatim-portrait":
            hs, ho = sha256(src), sha256(out)
            ok = hs == ho
            if not ok:
                failures += 1
            print(f"  [hash {'OK' if ok else 'FAIL'}] {r['file']}\n"
                  f"    src sha256={hs}\n    out sha256={ho}")
        else:
            with Image.open(out) as b:
                out_bp = black_point(b)
            print(f"    graded effective black point={out_bp} (ground={GROUND}; "
                  f"sub-ground pixels are isolated JPEG ringing)")

    if failures:
        raise SystemExit(f"{failures} verification failure(s)")
    print("ALL VERIFICATIONS PASSED")


if __name__ == "__main__":
    main()
