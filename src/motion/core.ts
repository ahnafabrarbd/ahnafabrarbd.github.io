/**
 * core.ts — the site-wide motion layer (G6), vanilla and tiny (~3KB gz).
 * Ships on every page because the RAILS §1.9 HARD rule demands a clickable
 * active-state section index at ≥768px — the one sanctioned breach of the
 * content-pages-0KB target (micro-plan: PLANS/G6.md B3).
 *
 * Laws honoured here:
 * - §6.3: transform/opacity only; scroll work passive + rAF-batched; IO over listeners.
 * - §6.4: reduced-motion = designed alternative (static rail fill, instant
 *   reveals, final values, drawn knot) — not a broken page.
 * - §7: durations/easings come from DESIGN.md tokens via CSS custom properties.
 * - Flags: every effect is one line in src/config/flags.ts.
 */
import { FLAGS } from '../config/flags';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const docEl = document.documentElement;

/* ---- token access: easings/durations are tokens, never literals (anti-slop) */
const token = (name: string) => getComputedStyle(docEl).getPropertyValue(name).trim();
const durMs = (name: string) => parseFloat(token(name)) || 900;

/** evaluate the token's cubic-bezier at t∈[0,1] (for rAF count-up) */
function bezierFromToken(name: string): (t: number) => number {
  const m = token(name).match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return (t) => t;
  const [x1, y1, x2, y2] = m[1].split(',').map(Number);
  // De Casteljau sampling — adequate for a 900ms numeral count
  return (t: number) => {
    let lo = 0, hi = 1, x = t;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      const u = 1 - mid;
      const bx = 3 * u * u * mid * x1 + 3 * u * mid * mid * x2 + mid ** 3;
      if (bx < x) lo = mid; else hi = mid;
    }
    const s = (lo + hi) / 2, v = 1 - s;
    return 3 * v * v * s * y1 + 3 * v * s * s * y2 + s ** 3;
  };
}

/* ---- B3: thread rail — progress fill + section labels + scrollspy (≥768px) */
function threadRail() {
  const rail = document.querySelector<HTMLElement>('.thread-rail');
  if (!rail) return;
  const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')].filter(
    (s) => s.querySelector('h1, h2'),
  );

  // pink progress fill: JS sets --progress (0..1); CSS maps it to scaleX
  // (mobile top line) or scaleY (desktop rail) per breakpoint — transform-only
  const fill = document.createElement('div');
  fill.className = 'thread-rail__fill';
  rail.appendChild(fill);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = docEl.scrollHeight - innerHeight;
      fill.style.setProperty('--progress', String(max > 0 ? scrollY / max : 0));
      ticking = false;
    });
  };
  // hscroll engine owns --progress under the pin (it writes st.progress into the
  // same fill); only wire the document-scroll writer when it is NOT in control.
  if (!docEl.classList.contains('hscroll-on')) {
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // under the corridor the ENGINE builds the bottom section bar from its actual
  // rooms (complete — incl. hoisted/id-less sub-chapters); core only builds this
  // rail for the non-corridor (mobile / reduced / no-JS) document.
  if (sections.length && !docEl.classList.contains('hscroll-on')) {
    // labels hang left of the rail; clickable; scrollspy active state
    const nav = document.createElement('nav');
    nav.className = 'rail-index';
    nav.setAttribute('aria-label', 'Page sections');
    const list = document.createElement('ul');
    for (const s of sections) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${s.id}`;
      a.className = 'u-caps';
      a.textContent = s.querySelector('h1, h2')?.textContent?.trim().slice(0, 28) ?? s.id;
      li.appendChild(a);
      list.appendChild(li);
    }
    nav.appendChild(list);
    document.body.appendChild(nav);

    // scrollspy: vertical IntersectionObserver collapses under the horizontal pin
    // (all rooms share one Y band), so when hscroll is on the engine is the sole
    // active-state writer reusing these same `.rail-index a` links. The nav DOM
    // above is built for everyone (the engine and the <768 overlay clone use it).
    if (!docEl.classList.contains('hscroll-on')) {
      const links = new Map(sections.map((s, i) => [s, list.children[i].firstElementChild!]));
      const spy = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              list.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
              links.get(e.target as HTMLElement)?.classList.add('is-active');
            }
          }
        },
        { rootMargin: '-40% 0px -50% 0px' },
      );
      sections.forEach((s) => spy.observe(s));
    }

    // RAILS §1.9: the section index lives in the overlay menu on <768px (where
    // the desktop rail is hidden). Mount it in the menu's DEDICATED container —
    // never the page-nav cascade — so the desktop menu stays clean.
    const overlayMount = document.querySelector('#overlay-menu [data-overlay-sections]');
    if (overlayMount && sections.length > 1) {
      const sub = list.cloneNode(true) as HTMLElement;
      sub.className = 'overlay__index u-caps';
      overlayMount.appendChild(sub);
    }
  }
}

/* ---- B4/B5: seam stitches + chapter reveals (IO toggles classes; CSS animates) */
function revealsAndStitches() {
  const chapters = [...document.querySelectorAll<HTMLElement>('.chapter')];
  if (!chapters.length) return;
  if (FLAGS.seamStitches) {
    for (const c of chapters) {
      const seam = document.createElement('span');
      seam.className = 'seam';
      seam.setAttribute('aria-hidden', 'true');
      c.prepend(seam);
    }
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  chapters.forEach((c) => io.observe(c));
}

/* ---- B6: spec count-up — markup carries the verbatim final value; we only
        animate TOWARD it, and always end by restoring the exact string */
function countUp() {
  const cells = [...document.querySelectorAll<HTMLElement>('.stats dd')];
  const ease = bezierFromToken('--ease-out');
  const dur = durMs('--dur-entrance');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const dd = e.target as HTMLElement;
        const valueNode = [...dd.childNodes].find((n) => n.nodeType === 3 && n.textContent?.trim());
        if (!valueNode) continue;
        const final = valueNode.textContent!;
        const numeric = parseFloat(final.replace(/,/g, ''));
        if (!isFinite(numeric)) continue;
        const decimals = (final.split('.')[1] ?? '').length;
        const grouped = final.includes(',');
        const t0 = performance.now();
        const frame = (now: number) => {
          const t = Math.min(1, (now - t0) / dur);
          const v = numeric * ease(t);
          valueNode.textContent = grouped
            ? Math.round(v).toLocaleString('en-US')
            : v.toFixed(decimals);
          if (t < 1) requestAnimationFrame(frame);
          else valueNode.textContent = final; // byte-exact landing (fidelity law)
        };
        requestAnimationFrame(frame);
      }
    },
    { threshold: 0.6 },
  );
  cells.forEach((c) => io.observe(c));
}

/* ---- B7: footer knot draw on first reveal */
function knotDraw() {
  const knot = document.querySelector<SVGPathElement>('.footer__knot path');
  if (!knot) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        knot.closest('svg')?.classList.add('is-drawing');
        io.disconnect();
      }
    },
    { threshold: 0.9 },
  );
  io.observe(knot.closest('svg')!);
}

/* ---- B9: products rail arrow keys */
function railKeys() {
  for (const rail of document.querySelectorAll<HTMLElement>('.rail')) {
    rail.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const step = rail.clientWidth * 0.6 * (e.key === 'ArrowRight' ? 1 : -1);
      rail.scrollBy({ left: step, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
}

/* ---- boot: reveals/stitches/count-up are motion (skip when reduced — the
        designed alternative is the complete static page); the rail's fill,
        index and keyboard support are FUNCTION and run for everyone */
docEl.classList.add('js');
if (FLAGS.threadRail) threadRail();
if (FLAGS.railKeys) railKeys();
if (!reduced) {
  if (FLAGS.reveals || FLAGS.seamStitches) revealsAndStitches();
  if (FLAGS.countUp) countUp();
  if (FLAGS.knotDraw) knotDraw();
} else {
  // reduced-motion designed state: everything visible, knot pre-drawn
  document.querySelector('.footer__knot')?.classList.add('is-drawing');
}
