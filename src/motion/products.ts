/**
 * products.ts — the Products pinned horizontal gallery (v1.1, flag productsPin).
 * Desktop + motion only: pins the stage and scrubs the whole track left as the
 * user scrolls vertically (the DESIGN.md "pinned horizontal gallery"). The
 * Breakthrough-study scroll-driven moment, realised on the products page.
 *
 * Degrades to the page's DEFAULT vertical category list on mobile, under
 * reduced-motion, or with JS off — the markup is that list; this module only
 * UPGRADES it by adding `.is-pinned` and the ScrollTrigger scrub.
 *
 * Laws: transform/opacity only (translateX of the track); ScrollTrigger handles
 * passive/rAF scroll batching; init deferred to idle (TBT-safe); DOM stays in
 * logical reading order under the pin (RAILS §1.11).
 */
import { FLAGS } from '../config/flags';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 768px)').matches;

if (FLAGS.productsPin && desktop && !reduced) {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);

  idle(async () => {
    const pin = document.querySelector<HTMLElement>('.products-pin');
    const track = document.querySelector<HTMLElement>('.products-track');
    const panels = [...document.querySelectorAll<HTMLElement>('.cat-panel')];
    if (!pin || !track || !panels.length) return;

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    // engage the horizontal layout (row, 100svh) before measuring its width
    pin.classList.add('is-pinned');

    const links = new Map(
      panels.map((p) => [p.dataset.cat, document.querySelector<HTMLElement>(`[data-cat-link="${p.dataset.cat}"]`)]),
    );
    const setActive = (id?: string) => {
      for (const [cat, a] of links) a?.classList.toggle('is-active', cat === id);
    };

    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    setActive(panels[0].dataset.cat); // first category lit before the scrub starts

    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + distance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -distance() * self.progress });
        // active category = the panel whose centre is nearest the viewport centre
        const mid = innerWidth / 2;
        let best = panels[0];
        let bestDist = Infinity;
        for (const p of panels) {
          const r = p.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestDist) { bestDist = d; best = p; }
        }
        setActive(best.dataset.cat);
      },
    });

    // anchor handling: in pinned mode a #cat jump must move the WINDOW to the
    // scroll position that centres that category — native vertical jumps all
    // land on the pin start otherwise.
    const scrollToCat = (id: string) => {
      const panel = panels.find((p) => p.dataset.cat === id);
      if (!panel) return;
      const total = distance();
      if (total === 0) return;
      // fraction of the track this panel's centre sits at
      const frac = (panel.offsetLeft + panel.offsetWidth / 2 - innerWidth / 2) / total;
      const target = st.start + Math.min(1, Math.max(0, frac)) * (st.end - st.start);
      scrollTo({ top: target, behavior: 'smooth' });
    };

    for (const a of document.querySelectorAll<HTMLAnchorElement>('[data-cat-link]')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCat(a.dataset.catLink!);
      });
    }

    // arrived from another page via /our-products/#cat — settle to that category
    const hash = location.hash.replace('#', '');
    if (hash && panels.some((p) => p.dataset.cat === hash)) {
      requestAnimationFrame(() => scrollToCat(hash));
    }

    addEventListener('resize', () => ScrollTrigger.refresh());
  });
}
