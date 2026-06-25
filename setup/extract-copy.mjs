#!/usr/bin/env node
/**
 * setup/extract-copy.mjs — deterministic copy-deck → JSON extractor (ESM, zero deps).
 *
 * Reads copy-deck.md (READ-ONLY approved copy; emitted VERBATIM — this script
 * never rewrites prose) and emits one JSON file per page into src/data/copy/.
 * Re-runnable: parses the deck's own heading structure; no body text lives here.
 *
 * Structural config below (anchors, structural block labels, recon numerics) is
 * scaffolding metadata, not copy:
 *   - ANCHORS         byte-exact live anchors (RECON.md §Anchors, HARD-preserved,
 *                     incl. the live "#underware" spelling) — verified against
 *                     RECON.md at runtime; mismatch aborts the run.
 *   - RECON_NUMBERS   numeric truth from RECON.md §Counters (data-to-value
 *                     extraction). Fills the deck's "[existing figure]" slots and
 *                     cross-checks explicit deck values (deck value always wins
 *                     in the JSON; mismatches are reported, never silently fixed).
 *                     Also verified against RECON.md's table at runtime.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DECK_PATH = join(ROOT, 'copy-deck.md');
const RECON_PATH = join(ROOT, 'RECON.md');
const OUT_DIR = join(ROOT, 'src', 'data', 'copy');

/* ── structural config (metadata, not copy) ─────────────────────────────── */

// Byte-exact live anchor ids per page (stored WITHOUT the # prefix).
const ANCHORS = {
  'company-profile': ['our-mission', 'our-vision', 'manufacturing'],
  sustainability: [
    'financial-stability',
    'health-and-family-wellbeing',
    'educational-and-professional-development',
    'safe-and-healthy-work-environment',
    'equality-and-acceptance',
    'best-practices',
  ],
  'our-capabilities': [
    'material-sourcing-management',
    'product-development',
    'sample',
    'cutting',
    'sewing',
    'finishing',
    'knitting',
    'printing',
  ],
  'our-products': ['men', 'women', 'kid', 'underware', 'new-born'],
};

// Heading-slug → live anchor, where the live id diverges from the deck heading.
const SLUG_TO_ANCHOR = {
  sampling: 'sample',
  'mens-wear': 'men',
  'womens-wear': 'women',
  'kids-wear': 'kid',
  underwear: 'underware',
  newborn: 'new-born',
};

// Deck block labels that are scaffolding (kept as "block"), not display headings.
const STRUCTURAL_BLOCKS = new Set([
  'Hero',
  'Capacity counters',
  'Mission teaser',
  'Vision teaser',
  'Manufacturing teaser',
  'Environmental section',
  'Partners teaser',
  'Three aligned blocks',
  'Office cards',
]);

// Numeric truth from RECON.md §Counters, keyed page::context::deck-label.
// (Deck is the copy authority for labels; RECON for numbers.)
const RECON_NUMBERS = {
  'home::Capacity counters::Cutting Capacity (Per Day)': '250,000',
  'home::Capacity counters::Shipment Capacity (Per Month)': '5.5',
  'home::Capacity counters::Sewing Capacity (Per Day)': '220,000',
  'home::Capacity counters::Finishing Capacity (Per Day)': '240,000',
  'home::Environmental section::Products manufactured using recycled fabrics': '100,000',
  'home::Environmental section::Water conserved through responsible production': '100,000',
  'home::Environmental section::Renewable energy generated annually': '100,000',
  'our-capabilities::Sampling::Samples Per Day': '400',
  'our-capabilities::Sampling::Sewing Machines': '88',
  'our-capabilities::Cutting::Cutting Capacity Per Day': '250,000',
  'our-capabilities::Cutting::Cutting Tables': '10',
  'our-capabilities::Sewing::Sewing Lines': '74',
  'our-capabilities::Sewing::Sewing Machines': '2,631',
  'our-capabilities::Sewing::Sewing Capacity Per Day': '220,000',
  'our-capabilities::Finishing::Finishing Capacity Per Day': '240,000',
  'our-capabilities::Knitting::Machines': '20',
  'our-capabilities::Knitting::Knitting Capacity Per Day (kg)': '8,000',
  'our-capabilities::Printing::Printing Capacity Per Day': '60,000',
};

const EXPECTED_FILES = [
  'home', 'overview', 'company-profile', 'management', 'our-capabilities',
  'our-products', 'sustainability', 'career', 'gallery', 'contact', 'footer',
];

const KV_RE =
  /^(Headline|Body|Button|Label|Heading|Sub-line|Privacy note|Sub-labels|Counters?|Intro line \(optional\)|Chart caption \d+|Name block|Optional album captions|Categories|Copyright line): (.+)$/;

/* ── helpers ────────────────────────────────────────────────────────────── */

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ALL_ANCHOR_IDS = Object.values(ANCHORS).flat();

const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

function parsePerson(text) {
  const i = text.indexOf(' — ');
  return i === -1
    ? { name: text, role: null }
    : { name: text.slice(0, i), role: text.slice(i + 3) };
}

function parseContactLine(line) {
  const segs = line.split(' · ');
  const out = {};
  let main = segs[0];
  const dm = main.match(/^([^—@]+?): (.+)$/);
  if (dm) {
    out.department = dm[1];
    main = dm[2];
  }
  const parts = main.split(' — ');
  out.name = parts[0];
  if (parts[1]) out.role = parts[1];
  const email = parts.slice(1).find((p) => p.includes('@'));
  if (email) out.email = email;
  for (const seg of segs.slice(1)) {
    const cm = seg.match(/^Cell: (.+)$/);
    if (cm) out.cell = cm[1];
    else (out.notes ??= []).push(seg);
  }
  return out;
}

function parseOfficeLine(line) {
  const i = line.indexOf(' — ');
  const [address, phones, email] = line.slice(i + 3).split(' · ');
  return { name: line.slice(0, i), address, phones: phones.split(', '), email };
}

/* ── stats ──────────────────────────────────────────────────────────────── */

const report = { ok: [], mismatch: [], tbd: [], filled: [] };
const normNum = (s) => s.replace(/[^0-9.]/g, '');

function statFromSegment(segment, ctxKey) {
  const i = segment.indexOf(' — ');
  const a = segment.slice(0, i);
  const b = segment.slice(i + 3);
  const valueFirst = /^\d/.test(a);
  const label = valueFirst ? b : a;
  const phrase = valueFirst ? a : b;
  const key = `${ctxKey}::${label}`;
  const stat = { label };
  if (phrase.includes('[existing figure]')) {
    const unit = phrase.replace('[existing figure]', '').trim();
    const v = RECON_NUMBERS[key];
    if (v === undefined) {
      stat.value = '[TBD]';
      report.tbd.push(key);
    } else {
      stat.value = v;
      stat.source = 'recon';
      report.filled.push(key);
    }
    if (unit) stat.unit = unit;
  } else {
    const m = phrase.match(/^([\d.,]+\+?)(?:\s+(.+))?$/);
    if (m) {
      stat.value = m[1];
      if (m[2]) stat.unit = m[2];
    } else {
      stat.value = phrase;
    }
    const expected = RECON_NUMBERS[key];
    if (expected !== undefined) {
      if (normNum(expected) === normNum(stat.value)) report.ok.push(key);
      else {
        stat.reconValue = expected; // deck value kept; discrepancy surfaced
        report.mismatch.push(`${key}: deck=${stat.value} recon=${expected}`);
      }
    }
  }
  return stat;
}

const statsFromLine = (line, ctxKey) =>
  line.split(' · ').map((seg) => statFromSegment(seg, ctxKey));

/* ── deck → page line groups ────────────────────────────────────────────── */

const deck = readFileSync(DECK_PATH, 'utf8').replace(/\r\n/g, '\n');
const pageBlocks = [];
{
  let cur = null;
  for (const raw of deck.split('\n')) {
    const m = raw.match(/^## (.+?)\s*$/);
    if (m) {
      cur = { deckSection: m[1], lines: [] };
      pageBlocks.push(cur);
    } else if (cur) {
      cur.lines.push(raw.replace(/\r$/, ''));
    }
  }
}

/* ── per-page line state machine ────────────────────────────────────────── */

function parsePage(key, deckSection, lines, shared) {
  const page = {
    slug: key === 'footer' ? null : key === 'home' ? '/' : `/${key}/`,
    deckSection,
    title: null,
    sections: [],
  };
  const anchors = ANCHORS[key] ?? [];
  const used = new Set();
  const assignAnchor = (text) => {
    if (!text) return null;
    let s = slugify(text);
    if (!anchors.includes(s)) s = SLUG_TO_ANCHOR[s];
    if (s && anchors.includes(s)) {
      used.add(s);
      return s;
    }
    return null;
  };

  let sec = null;
  let person = null;
  const open = (extra = {}) => {
    sec = { id: null, block: null, heading: null, label: null, note: null, body: [], items: [], stats: [], ...extra };
    page.sections.push(sec);
    return sec;
  };
  const ensure = () => sec ?? open();
  const ctxKey = () => `${key}::${sec?.block || sec?.heading || ''}`;
  const stripNote = (s) => {
    const t = s.trim();
    const m = t.match(/^\*\((.+)\)\*$/) || t.match(/^\((.+)\)$/) || t.match(/^—\s*(.+?)\.?$/);
    return m ? m[1] : t || null;
  };

  const handleKV = (kvKey, value) => {
    person = null;
    switch (true) {
      case kvKey === 'Headline': ensure().heading = value; break;
      case kvKey === 'Label': ensure().label = value; break;
      case kvKey === 'Body': ensure().body.push(value); break;
      case kvKey === 'Button': ensure().button = value; break;
      case kvKey === 'Heading': {
        const s = ensure();
        s.heading = value;
        s.id ??= assignAnchor(value);
        break;
      }
      case kvKey === 'Sub-line': ensure().subLine = value; break;
      case kvKey === 'Privacy note': ensure().privacyNote = value; break;
      case kvKey === 'Sub-labels': ensure().subLabels = value.split(' · '); break;
      case kvKey === 'Counters' || kvKey === 'Counter':
        ensure().stats.push(...statsFromLine(value, ctxKey()));
        break;
      case kvKey === 'Intro line (optional)': ensure().intro = value; break;
      case /^Chart caption \d+$/.test(kvKey):
        (ensure().chartCaptions ??= []).push(value);
        break;
      case kvKey === 'Name block': ensure().person = parsePerson(value); break;
      case kvKey === 'Optional album captions': {
        const s = ensure();
        s.note = kvKey;
        s.items.push(...value.split(' · '));
        break;
      }
      case kvKey === 'Categories':
        page.categories = value
          .split(' · ')
          .map((label) => ({ id: assignAnchor(label), label }));
        break;
      case kvKey === 'Copyright line': page.copyright = value; break;
    }
  };

  const handleMetaPair = (metaKey, rawValue) => {
    person = null;
    const noteMatch = rawValue.match(/^(.*?)\s*\*\((.+?)\)\*$/);
    const value = noteMatch ? noteMatch[1] : rawValue;
    const note = noteMatch ? noteMatch[2] : null;
    switch (metaKey) {
      case 'Page title':
      case 'Page headline':
        page.title = value;
        break;
      case 'Section':
        open({ heading: value, id: assignAnchor(value), note });
        break;
      case 'Heading':
        open({ heading: value, id: assignAnchor(value), note });
        break;
      case 'Label':
        open({ label: value, id: assignAnchor(value), note });
        break;
      case 'Headline': {
        const s = ensure();
        s.heading = value;
        s.id ??= assignAnchor(value);
        break;
      }
      case 'Hero heading':
        open({ heading: value, note });
        break;
      case 'Standalone strip':
        open({ block: 'Standalone strip', body: [value], note });
        break;
      default:
        handleKV(metaKey, rawValue);
    }
  };

  for (const line of lines) {
    if (/^\s*$/.test(line) || /^---+\s*$/.test(line)) continue;

    // Bold meta line(s): **Key:** value [· **Key:** value]
    if (/^\*\*[^*]+?:\*\*/.test(line)) {
      const parts = line.includes(' · **') ? line.split(' · ') : [line];
      for (const part of parts) {
        const m = part.match(/^\*\*(.+?):\*\*\s*(.*)$/);
        if (m) handleMetaPair(m[1], m[2]);
      }
      continue;
    }

    // Bold block header: **Name** [annotation]
    const bold = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    if (bold) {
      person = null;
      let name = bold[1];
      const noteParts = [];
      const di = name.indexOf(' — ');
      if (di !== -1) {
        noteParts.push(name.slice(di + 3));
        name = name.slice(0, di);
      }
      const external = stripNote(bold[2]);
      if (external) noteParts.push(external);
      const note = noteParts.join(' · ') || null;
      const structural = STRUCTURAL_BLOCKS.has(name);
      open(
        structural
          ? { block: name, note }
          : { heading: name, id: assignAnchor(name), note },
      );
      if (note && /card/i.test(note)) sec._mode = 'cards';
      else if (name === 'Capacity counters' || name === 'Environmental section' || (note && /stats only/i.test(note)))
        sec._mode = 'stats';
      else if (name === 'Key Contacts') sec._mode = 'contacts';
      else if (name === 'Office cards') sec._mode = 'offices';
      // Cross-page clone: Company Profile counters "as scripted on Home".
      if (name === 'Capacity counters' && note && /as scripted on Home/i.test(note)) {
        if (!shared.homeCapacityStats) fail(`"${deckSection}": Home capacity stats not parsed yet`);
        sec.stats = structuredClone(shared.homeCapacityStats);
      }
      continue;
    }

    // Plain KV line
    const kv = line.match(KV_RE);
    if (kv) {
      handleKV(kv[1], kv[2]);
      continue;
    }

    // List item
    if (line.startsWith('- ')) {
      person = null;
      ensure().items.push(line.slice(2));
      continue;
    }

    // Italic-titled inline item: *Title* — text
    const italDash = line.match(/^\*([^*]+)\*\s+—\s+(.*)$/);
    if (italDash) {
      person = null;
      ensure().items.push({ title: italDash[1], text: italDash[2] });
      continue;
    }

    // Full-italic person header: *Name — Role*
    const ital = line.match(/^\*([^*]+)\*$/);
    if (ital) {
      person = { ...parsePerson(ital[1]), body: [] };
      (ensure().people ??= []).push(person);
      continue;
    }

    // Mode-specific content lines
    if (sec?._mode === 'contacts') {
      (sec.people ??= []).push(parseContactLine(line));
      continue;
    }
    if (sec?._mode === 'offices') {
      (sec.offices ??= []).push(parseOfficeLine(line));
      continue;
    }
    if (sec?._mode === 'cards' && line.includes(' — ')) {
      const i = line.indexOf(' — ');
      const card = { title: line.slice(0, i), text: line.slice(i + 3) };
      const cardSlug = slugify(card.title);
      const target = ALL_ANCHOR_IDS.includes(cardSlug) ? cardSlug : SLUG_TO_ANCHOR[cardSlug];
      if (target && ALL_ANCHOR_IDS.includes(target)) card.anchor = target;
      if (/Read More/.test(sec.note ?? '')) card.button = 'Read More';
      sec.items.push(card);
      continue;
    }
    if (sec?._mode === 'stats' && line.includes(' — ')) {
      sec.stats.push(...statsFromLine(line, ctxKey()));
      continue;
    }

    // Plain paragraph
    if (person) person.body.push(line);
    else ensure().body.push(line);
  }

  if (used.size !== anchors.length) {
    fail(
      `${key}: anchors unassigned — expected [${anchors.join(', ')}], got [${[...used].join(', ')}]`,
    );
  }
  return page;
}

/* ── footer (link-list grammar) ─────────────────────────────────────────── */

function parseFooter(deckSection, lines, shared) {
  const page = { slug: null, deckSection, title: null, sections: [] };
  for (const line of lines) {
    if (/^\s*$/.test(line) || /^---+\s*$/.test(line)) continue;
    let m;
    if ((m = line.match(/^Copyright line: (.+)$/))) {
      page.copyright = m[1];
      continue;
    }
    const di = line.indexOf(' — ');
    const ci = line.indexOf(': ');
    if (di !== -1 && (ci === -1 || di < ci)) {
      // "Heading — note" (Contact Us block, blocks as on the Contact page)
      const sec = {
        id: null,
        heading: line.slice(0, di),
        note: line.slice(di + 3).replace(/\.$/, ''),
        body: [],
        items: [],
        stats: [],
      };
      if (/Contact page/i.test(sec.note)) {
        if (!shared.contactOffices) fail('footer: Contact offices not parsed yet');
        sec.offices = structuredClone(shared.contactOffices);
      }
      page.sections.push(sec);
    } else if (ci !== -1) {
      // "Heading: item · item · item"
      page.sections.push({
        id: null,
        heading: line.slice(0, ci),
        body: [],
        items: line.slice(ci + 2).split(' · '),
        stats: [],
      });
    }
  }
  return page;
}

/* ── runtime cross-checks against RECON.md ──────────────────────────────── */

function verifyAgainstRecon() {
  const recon = readFileSync(RECON_PATH, 'utf8');
  const section = (re) => {
    const m = recon.split(re)[1];
    return m ? m.split(/^## /m)[0] : '';
  };
  const anchorText = section(/^## Anchors.*$/m);
  const reconAnchors = new Set([...anchorText.matchAll(/#([a-z0-9-]+)/g)].map((x) => x[1]));
  const configured = new Set(ALL_ANCHOR_IDS);
  if (
    reconAnchors.size !== configured.size ||
    [...configured].some((a) => !reconAnchors.has(a))
  ) {
    fail(
      `anchor config drifted from RECON.md §Anchors — recon=[${[...reconAnchors].join(', ')}] config=[${[...configured].join(', ')}]`,
    );
  }
  const counterText = section(/^## Counters.*$/m);
  const reconValues = new Set([...counterText.matchAll(/\*\*([\d.,]+)\*\*/g)].map((x) => x[1]));
  for (const [k, v] of Object.entries(RECON_NUMBERS)) {
    if (!reconValues.has(v)) fail(`RECON_NUMBERS drifted: ${k}=${v} not found in RECON.md counters table`);
  }
  return configured.size;
}

/* ── emit ───────────────────────────────────────────────────────────────── */

function cleanSection(s) {
  const out = { id: s.id ?? null };
  if (s.block) out.block = s.block;
  out.heading = s.heading ?? null;
  if (s.label) out.label = s.label;
  if (s.note) out.note = s.note;
  for (const k of ['subLine', 'privacyNote', 'button', 'intro', 'subLabels', 'chartCaptions', 'person', 'people', 'offices']) {
    if (s[k] !== undefined) out[k] = s[k];
  }
  out.body = s.body;
  out.items = s.items;
  out.stats = s.stats;
  return out;
}

function main() {
  const anchorTotal = verifyAgainstRecon();
  mkdirSync(OUT_DIR, { recursive: true });

  const shared = {};
  const written = [];
  const emittedIds = [];

  for (const { deckSection, lines } of pageBlocks) {
    const nameMatch = deckSection.match(/^\d+\s*·\s*(.+)$/);
    const name = nameMatch ? nameMatch[1] : deckSection;
    const key = name.startsWith('Global Footer') ? 'footer' : slugify(name);
    if (!EXPECTED_FILES.includes(key)) fail(`unexpected deck section "${deckSection}" → key "${key}"`);

    const page =
      key === 'footer'
        ? parseFooter(deckSection, lines, shared)
        : parsePage(key, deckSection, lines, shared);
    page.title ??= key === 'footer' ? null : name;

    if (key === 'home') {
      shared.homeCapacityStats = page.sections.find((s) => s.block === 'Capacity counters')?.stats;
    }
    if (key === 'contact') {
      shared.contactOffices = page.sections.flatMap((s) => s.offices ?? []);
    }

    const out = { slug: page.slug, deckSection: page.deckSection, title: page.title, sections: page.sections.map(cleanSection) };
    if (page.categories) out.categories = page.categories;
    if (page.copyright) out.copyright = page.copyright;

    for (const s of out.sections) if (s.id) emittedIds.push(s.id);
    if (out.categories) for (const c of out.categories) if (c.id) emittedIds.push(c.id);

    const file = join(OUT_DIR, `${key}.json`);
    writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    written.push(`${key}.json`);
  }

  if (written.length !== EXPECTED_FILES.length) {
    fail(`expected ${EXPECTED_FILES.length} files, wrote ${written.length}: ${written.join(', ')}`);
  }
  if (emittedIds.length !== anchorTotal) {
    fail(`anchor ids emitted=${emittedIds.length}, expected ${anchorTotal}: ${emittedIds.join(', ')}`);
  }

  console.log(`OK  ${written.length} files → src/data/copy/ : ${written.join(', ')}`);
  console.log(`OK  anchor ids emitted: ${emittedIds.length}/${anchorTotal} (verified vs RECON.md §Anchors)`);
  console.log(`OK  counters filled from RECON: ${report.filled.length}; explicit deck values cross-checked OK: ${report.ok.length}`);
  if (report.mismatch.length) console.log(`!!  deck/RECON numeric mismatches (deck value kept):\n    ${report.mismatch.join('\n    ')}`);
  else console.log('OK  zero deck/RECON numeric mismatches');
  if (report.tbd.length) console.log(`!!  [TBD] counters (no RECON value):\n    ${report.tbd.join('\n    ')}`);
  else console.log('OK  zero [TBD] counters');
}

main();
