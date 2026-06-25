#!/usr/bin/env python3
"""finish-birefnet.py — Day-1 finishing recipe (DESIGN.md §Cutout & imagery)
applied to the 8 raw birefnet re-mattes that won their §12.2 comparison
(REVIEWS/G5-pages.md §Cutout QA): 1px alpha erode + 0.75px feather + despill.

Despill = composite RGB against black at low-alpha edges (multiply RGB by
alpha), which only darkens the feathered edge band — interiors (alpha 255)
are untouched, so dark garments like 04 keep their tonal detail. The site
ground is --ground-pure (#000), so edge fringe darkening toward black is the
correct decontamination. PNG masters; the build pipeline converts to WebP.

Outputs: reference/cutouts/finished-birefnet/<stem>.png
         reference/cutouts/finished-birefnet/<stem>_onblack.jpg (QA preview)
Never overwrites the raw mattes.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "reference/cutouts-bakeoff/birefnet"
OUT = ROOT / "reference/cutouts/finished-birefnet"
OUT.mkdir(parents=True, exist_ok=True)

STEMS = ["006_m", "007_m", "01", "03_m", "04", "12_m", "15_m", "27"]

for stem in STEMS:
    src = SRC / f"{stem}.png"
    if not src.exists():
        print(f"MISS {stem}: {src} not found")
        continue
    im = Image.open(src).convert("RGBA")
    r, g, b, a = im.split()
    # 1px alpha erode (MinFilter size 3 = 1px-radius erosion)
    a = a.filter(ImageFilter.MinFilter(3))
    # 0.75px feather on the alpha only
    a = a.filter(ImageFilter.GaussianBlur(radius=0.75))
    # despill: darken RGB toward black where alpha < 255 (edge band only)
    r, g, b = (ImageChops.multiply(ch, a) for ch in (r, g, b))
    finished = Image.merge("RGBA", (r, g, b, a))
    dst = OUT / f"{stem}.png"
    finished.save(dst)
    onblack = Image.new("RGB", im.size, (0, 0, 0))
    onblack.paste(finished, mask=finished.getchannel("A"))
    jpg = OUT / f"{stem}_onblack.jpg"
    onblack.save(jpg, quality=92)
    print(f"OK   {stem}: {im.size[0]}x{im.size[1]}  "
          f"png {dst.stat().st_size:,} B  preview {jpg.stat().st_size:,} B")

print("done — QA each preview at the original cutout-qa.json defect before staging")
