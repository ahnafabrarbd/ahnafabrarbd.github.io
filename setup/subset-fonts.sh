#!/bin/sh
# subset-fonts.sh — V7 §6.1/§6.2: self-hosted woff2, subset, ≤180KB total, ≤5 files.
# Sources: reference/fonts/ (licences verified at G3, CREDITS.md).
# Output: public/fonts/ — 4 files:
#   clash-display-var.woff2   (variable, wght axis — 600/700 used)
#   switzer-var.woff2         (variable, wght axis — 400/500 used)
#   martian-mono-400.woff2    (Std Regular)
#   martian-mono-500.woff2    (Std Medium)
# Glyph coverage: ASCII + Latin-1 supplement + typographic punctuation + arrow.
set -e
cd "$(dirname "$0")/.."
SUB=".venv/bin/pyftsubset"
UNI="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192"
FEAT="kern,liga,calt,tnum,case,cpsp"
mkdir -p public/fonts

$SUB "reference/fonts/clash-display/ClashDisplay_Complete/Fonts/TTF/ClashDisplay-Variable.ttf" \
  --unicodes="$UNI" --layout-features="$FEAT" --flavor=woff2 \
  --output-file=public/fonts/clash-display-var.woff2

$SUB "reference/fonts/switzer/Switzer_Complete/Fonts/TTF/Switzer-Variable.ttf" \
  --unicodes="$UNI" --layout-features="$FEAT" --flavor=woff2 \
  --output-file=public/fonts/switzer-var.woff2

$SUB "reference/fonts/martian-mono/MartianMono-StdRg.otf" \
  --unicodes="$UNI" --layout-features="$FEAT" --flavor=woff2 \
  --output-file=public/fonts/martian-mono-400.woff2

$SUB "reference/fonts/martian-mono/MartianMono-StdMd.otf" \
  --unicodes="$UNI" --layout-features="$FEAT" --flavor=woff2 \
  --output-file=public/fonts/martian-mono-500.woff2

echo "--- subset results:"
ls -la public/fonts/
echo "--- total:"
du -ck public/fonts/*.woff2 | tail -1
