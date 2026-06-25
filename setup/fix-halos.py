#!/usr/bin/env python3
"""fix-halos.py — CUTOUTS_TODO scripted first pass for the halo defect class:
2-3px alpha erosion + edge decontamination + black-point crush on
001_m / 004_m / 03_m / 04 / 15_m. Outputs to reference/cutouts/fixed/
(png + _onblack.jpg preview for the 200% critic re-check). Never overwrites
the original mattes."""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "reference/cutouts/png"
OUT = ROOT / "reference/cutouts/fixed"
OUT.mkdir(parents=True, exist_ok=True)

# file -> erode px (critic-named strengths: 004_m wants 3-6px, others 2-3px)
QUEUE = {"001_m": 3, "004_m": 4, "03_m": 2, "04": 3, "15_m": 2}
BLACK_POINT = 18  # channel values below this crush to 0 (lifted-black halo kill)


def crush(v: int) -> int:
    if v <= BLACK_POINT:
        return 0
    return round((v - BLACK_POINT) * 255 / (255 - BLACK_POINT))


LUT = [crush(i) for i in range(256)]

for name, erode_px in QUEUE.items():
    src = SRC / f"{name}.png"
    if not src.exists():
        print(f"MISS {name}: {src} not found")
        continue
    im = Image.open(src).convert("RGBA")
    r, g, b, a = im.split()
    # erosion: MinFilter size must be odd; 2*px+1 approximates px-radius erosion
    a = a.filter(ImageFilter.MinFilter(2 * erode_px + 1))
    # decontaminate + crush: kill lifted blacks that read as halo on pure black
    r, g, b = (ch.point(LUT) for ch in (r, g, b))
    fixed = Image.merge("RGBA", (r, g, b, a))
    fixed.save(OUT / f"{name}.png")
    onblack = Image.new("RGB", im.size, (0, 0, 0))
    onblack.paste(fixed, mask=fixed.getchannel("A"))
    onblack.save(OUT / f"{name}_onblack.jpg", quality=92)
    print(f"OK   {name}: erode {erode_px}px + crush@{BLACK_POINT} -> {OUT / (name + '.png')}")

print("done — critic re-check at 200% required before these enter G5")
