#!/usr/bin/env python3
"""S12.2 bake-off: run the 23 fix/reject queue files through birefnet-general.

Raw matte only -- no alpha matting, no post-processing. Outputs:
  reference/cutouts-bakeoff/birefnet/<stem>.png          (RGBA cutout)
  reference/cutouts-bakeoff/birefnet/<stem>_onblack.jpg  (composite on #000)
"""
import os, sys, time, traceback
from PIL import Image
from rembg import new_session, remove

ROOT = "/Users/ahnafabrar/rizvi-redesign"
OUT = os.path.join(ROOT, "reference/cutouts-bakeoff/birefnet")
os.makedirs(OUT, exist_ok=True)

# stem -> source (verified by exact dimension match against reference/cutouts/png/<stem>.png)
QUEUE = [
    ("11_m",  "reference/drive/rizvi/STIL/11.jpeg"),
    ("17",    "reference/drive/rizvi/STIL/17.png"),
    ("001_m", "reference/drive/rizvi/STIL/001.jpeg"),
    ("002_m", "reference/drive/rizvi/STIL/002.jpeg"),
    ("004_m", "reference/drive/rizvi/STIL/004.jpeg"),
    ("005_m", "reference/drive/rizvi/STIL/005.jpeg"),
    ("006_m", "reference/drive/rizvi/STIL/006.jpeg"),
    ("007_m", "reference/drive/rizvi/STIL/007.jpeg"),
    ("009_m", "reference/drive/rizvi/STIL/009.jpeg"),
    ("01",    "reference/drive/rizvi/STIL/01.png"),
    ("03_m",  "reference/drive/rizvi/STIL/03.jpeg"),
    ("04",    "reference/drive/rizvi/STIL/04.png"),
    ("06",    "reference/drive/rizvi/STIL/06.png"),
    ("12",    "reference/drive/rizvi/STIL/12.png"),
    ("12_m",  "reference/drive/rizvi/STIL/12.jpeg"),
    ("14",    "reference/drive/rizvi/STIL/14.png"),
    ("15",    "reference/drive/rizvi/STIL/15.png"),
    ("15_m",  "reference/drive/rizvi/STIL/15.jpeg"),
    ("16",    "reference/drive/rizvi/STIL/16.png"),
    ("24",    "reference/drive/rizvi/STIL/24.png"),
    ("26",    "reference/drive/rizvi/STIL/26.png"),
    ("27",    "reference/drive/rizvi/STIL/27.png"),
    ("28",    "reference/drive/rizvi/STIL/28.png"),
]

def log(msg):
    print(msg, flush=True)

t0 = time.time()
log(f"[bakeoff] loading session birefnet-general ...")
session = new_session("birefnet-general")
log(f"[bakeoff] session ready in {time.time()-t0:.1f}s; {len(QUEUE)} files")

skipped = []
for i, (stem, rel) in enumerate(QUEUE, 1):
    src = os.path.join(ROOT, rel)
    dst_png = os.path.join(OUT, f"{stem}.png")
    dst_jpg = os.path.join(OUT, f"{stem}_onblack.jpg")
    if os.path.exists(dst_png) and os.path.exists(dst_jpg):
        log(f"[{i:02d}/23] {stem}: already done, skip")
        continue
    ok = False
    for attempt in (1, 2):
        try:
            t = time.time()
            img = Image.open(src).convert("RGB")
            cut = remove(img, session=session)  # raw matte, no post-processing
            cut.save(dst_png)
            black = Image.new("RGB", cut.size, (0, 0, 0))
            black.paste(cut, mask=cut.split()[3])
            black.save(dst_jpg, quality=92)
            log(f"[{i:02d}/23] {stem}: done in {time.time()-t:.1f}s ({rel})")
            ok = True
            break
        except Exception:
            log(f"[{i:02d}/23] {stem}: attempt {attempt} FAILED\n{traceback.format_exc()}")
    if not ok:
        skipped.append(stem)
        log(f"[{i:02d}/23] {stem}: SKIPPED after 2 failures")

log(f"[bakeoff] complete in {(time.time()-t0)/60:.1f} min; skipped={skipped or 'none'}")
