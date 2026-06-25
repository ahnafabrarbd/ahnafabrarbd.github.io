#!/usr/bin/env python3
"""Builds inc/data/image-map.json — the single source of truth mapping every
image slot in the rizvi-noir theme to its current asset.

Inputs: reference/drive-review.json (vision audit of owner Drive imagery),
        curated editorial picks from live-site reference (D-004/D-008).
Statuses: final-seed     = ships as the seed asset for this slot
          pending-cutout = ships after the cutout pipeline processes it
          todo-owner     = slot exists, no worthy asset yet (owner to supply)

Slot keys are stable API: templates reference slots, never file paths.
Re-run any time; output is deterministic.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVE = 'assets/img/drive'      # theme-relative target dirs (materialised at G4)
SITE = 'assets/img/site'
CUT = 'assets/img/cutouts'

def slot(src, status, alt, note='', origin='live-site'):
    return {'src': src, 'status': status, 'alt': alt, 'origin': origin, 'note': note}

reviews = json.load(open(f'{ROOT}/reference/drive-review.json'))
by_file = {r['file'].split('/')[-1]: r for r in reviews}

# Cutout candidates per product category, ordered by review quality
cats = {'products-mens': [], 'products-womens': [], 'products-kids': [],
        'products-underwear': [], 'products-newborn': []}
for r in sorted(reviews, key=lambda x: -x['quality']):
    if not r['whiteBox']:
        continue
    f = r['file'].split('/')[-1]
    for s in r['suggestedSlots']:
        if s in cats:
            cats[s].append({'file': f, 'subject': r['subject'], 'quality': r['quality']})

m = {
  '_meta': {
    'doc': 'slot -> asset map; change src to swap an image, see CONTENT-GUIDE.md',
    'generated_by': 'setup/build-image-map.py',
  },
  'home': {
    'hero-weave': {
      'status': 'pending-cutout',
      'note': 'hero weave panels - best cutouts chosen after cutout QA',
      'candidates': [c['file'] for c in
                     (cats['products-womens'][:2] + cats['products-mens'][:2] +
                      cats['products-kids'][:1] + cats['products-underwear'][:1])],
    },
    'mission-teaser': slot(f'{SITE}/company-profile.jpg', 'final-seed',
        'Sewing line at the Rizvi Fashions factory: a machinist works a flatlock seam',
        '1920x1280, editorial-grade (D-008)'),
    'vision-teaser': slot(f'{SITE}/img_0976-scaled.jpg', 'final-seed',
        'Product development showroom with garment ranges on display walls',
        '2560x1232 showroom panorama'),
    'manufacturing-teaser': slot(f'{SITE}/15-1-min.jpg', 'final-seed',
        'A production aisle between sewing lines on the factory floor',
        '1920x1100 deep-perspective floor shot'),
    'breather': slot(f'{SITE}/overview.jpg', 'final-seed',
        'The folding and packing area of the factory at full operation',
        'single full-bleed breather, caption below per no-text-on-imagery rail'),
  },
  'overview': {
    'who-we-are': slot(f'{SITE}/overview.jpg', 'final-seed',
        'The folding and packing area of the factory at full operation', '1920x1280'),
    'technology': slot(f'{SITE}/img_0976-scaled.jpg', 'final-seed',
        'Product development showroom used for CAD-CAM led development',
        'reused from home vision-teaser - acceptable cross-page reuse, logged'),
    'scale': slot(f'{SITE}/15-1-min.jpg', 'final-seed',
        'Rows of sewing stations stretching the length of a production floor', ''),
    'range': {'status': 'pending-cutout',
              'note': 'small cutout constellation of garment types',
              'candidates': [cats[c][0]['file'] for c in cats if cats[c]]},
    'breather-aerial': slot(f'{DRIVE}/DJI_0580_dev.jpeg', 'final-seed',
        'Aerial view of the Rizvi Fashions campus rising above the tree canopy',
        'grade toward dark ground; sole breather on this page', 'drive'),
  },
  'company-profile': {
    'manufacturing': slot(f'{SITE}/sewing.jpg', 'final-seed',
        'Machinists at work on an active sewing line', '958x676'),
    'chart-revenue': {'status': 'final-seed', 'src': 'svg:inline',
        'note': 'rebuilt as white/pink-on-black SVG from decoded data (RECON.md); not a bitmap slot'},
    'chart-future-goal': {'status': 'final-seed', 'src': 'svg:inline',
        'note': 'rebuilt as SVG from decoded data'},
  },
  'management': {
    'md-portrait': {'status': 'final-seed', 'src': None,
        'note': 'HARD: live site has no MD portrait - text-led profile preserved'},
    'chairman-portrait': slot(f'{SITE}/avatar-1577909_1280.webp', 'final-seed',
        'Rehana Rizvi, Chairman', 'HARD: kept exactly as live (stock avatar)'),
    'director-portrait': slot(f'{SITE}/Shaikh-Rezwan-Director-Sir.jpg', 'final-seed',
        'Shaikh Rezwan, Director', 'HARD: kept exactly as live'),
  },
  'capabilities': {
    'sourcing': slot(f'{SITE}/threads_large.webp', 'final-seed',
        'Spools of dyed thread in the material store', '480x320 - small render only'),
    'sourcing-fabric': slot(f'{SITE}/fabric.jpg', 'final-seed', 'Folded knit fabric stock'),
    'sourcing-label': slot(f'{SITE}/garment-labelling.jpeg', 'final-seed', 'Woven garment labels'),
    'sourcing-accessories': slot(f'{SITE}/images.jpg', 'final-seed', 'Garment trims and accessories'),
    'sourcing-trims': {'status': 'todo-owner', 'src': None,
        'note': 'live site never had a Trims image; owner to supply'},
    'product-development': slot(f'{SITE}/product-development.jpg', 'final-seed',
        'Pattern development work in the sample room', '525x350 - small render only'),
    'sampling': slot(f'{SITE}/sample.jpg', 'final-seed', 'Sample garments under review'),
    'cutting': slot(f'{SITE}/cutting1.jpg', 'final-seed', 'The cutting floor with fabric laid for cutting', '958x676'),
    'sewing': slot(f'{SITE}/sewing.jpg', 'final-seed', 'An active sewing line', '958x676'),
    'finishing': slot(f'{SITE}/finishing.jpg', 'final-seed', 'Finishing and pressing stations'),
    'knitting': slot(f'{SITE}/knitting.jpg', 'final-seed', 'Circular knitting machines'),
    'printing': slot(f'{SITE}/printing.png', 'final-seed', 'Screen printing tables'),
  },
  'products': {cat.replace('products-', ''): {
      'status': 'pending-cutout',
      'note': 'cutout rail - transparent WebP on black after pipeline',
      'candidates': items,
  } for cat, items in cats.items()},
  'sustainability': {
    'health-and-family-wellbeing': slot(f'{DRIVE}/000000.jpeg', 'final-seed',
        'A worker carries her child past the breast-feeding corner at the factory',
        'AI-provenance flag R-008 - owner sign-off before production', 'drive'),
  },
  'gallery': {
    'campus': {'status': 'final-seed', 'items': [
        {'src': f'{DRIVE}/DJI_0580_dev.jpeg', 'alt': 'Aerial view of the factory campus'}],
        'note': 'thin album - owner photography requested (IMAGES_TODO)'},
    'production-floors': {'status': 'final-seed', 'items': [
        {'src': f'{SITE}/overview.jpg', 'alt': 'Folding and packing area'},
        {'src': f'{SITE}/15-1-min.jpg', 'alt': 'A production aisle between sewing lines'}]},
    'cutting-sewing': {'status': 'final-seed', 'items': [
        {'src': f'{SITE}/cutting1.jpg', 'alt': 'The cutting floor'},
        {'src': f'{SITE}/sewing.jpg', 'alt': 'An active sewing line'},
        {'src': f'{SITE}/company-profile.jpg', 'alt': 'A machinist works a flatlock seam'}]},
    'finishing-despatch': {'status': 'final-seed', 'items': [
        {'src': f'{SITE}/finishing.jpg', 'alt': 'Finishing and pressing stations'},
        {'src': f'{SITE}/knitting.jpg', 'alt': 'Circular knitting machines'}]},
  },
  'partners': {'logo-wall': {'status': 'final-seed',
      'note': 're-toned white/grey for dark ground at derivative stage; list in inc/data/partners.json'}},
  'accreditations': {'logo-band': {'status': 'final-seed',
      'note': 're-toned white/grey; list in inc/data/accreditations.json'}},
  'contact': {},
}

out = f'{ROOT}/theme/rizvi-noir/inc/data/image-map.json'
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(m, open(out, 'w'), indent=2)
n = sum(len(v) for k, v in m.items() if not k.startswith('_'))
print(f'wrote {out} ({n} slots)')
