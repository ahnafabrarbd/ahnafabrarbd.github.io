#!/usr/bin/env python3
"""make-favicons.py — V7 §10 favicon set, drawn from the design system:
ground square + the pink thread running through as a selvedge loop.
Outputs: public/favicon.ico (32), public/icons/icon-192.png, icon-512.png.
(public/favicon.svg is hand-authored — same motif.) Palette: tokens only."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "public/icons"
ICONS.mkdir(parents=True, exist_ok=True)

GROUND = (10, 10, 10)      # --ground #0A0A0A
PINK = (172, 33, 113)      # --pink  #AC2171


def draw(size: int) -> Image.Image:
    im = Image.new("RGB", (size, size), GROUND)
    d = ImageDraw.Draw(im)
    w = max(1, size // 28)  # thread weight scales with size
    y = size * 0.62
    # the thread: enters left, loops, runs out right (selvedge knot motif)
    d.line([(0, y), (size * 0.42, y)], fill=PINK, width=w)
    d.arc(
        [size * 0.34, y - size * 0.18, size * 0.62, y + size * 0.10],
        start=110, end=420, fill=PINK, width=w,
    )
    d.line([(size * 0.56, y), (size, y)], fill=PINK, width=w)
    return im


draw(192).save(ICONS / "icon-192.png")
draw(512).save(ICONS / "icon-512.png")
draw(32).save(ROOT / "public/favicon.ico", sizes=[(32, 32)])
print("favicons written: favicon.ico, icons/icon-192.png, icons/icon-512.png")
