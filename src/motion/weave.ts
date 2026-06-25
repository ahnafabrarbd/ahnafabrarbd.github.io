/**
 * weave.ts — the home hero weave (G6, flag `heroWeave`, home page only).
 * Storyboard (DESIGN.md §Hero storyboard): panels drift in as warp/weft
 * (0–1.2s), settle (→1.8s); on first scroll the constellation releases with
 * a scrubbed drift. Revisit (sessionStorage) and reduced-motion get the
 * settled static composition — the no-JS default markup IS that composition,
 * so the entrance only ever animates FROM offsets back to it.
 *
 * §6.3: transform/opacity only; ScrollTrigger handles passive/rAF batching.
 * §7: durations/easings from tokens. TBT guard: init deferred to idle.
 */
import { FLAGS } from '../config/flags';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const seen = sessionStorage.getItem('rf-weave') === '1';
// the weave constellation is a ≥768px layout; below that the panels stack and
// the entrance adds little — so gate it (and its GSAP load) to desktop, keeping
// mobile on the static settled composition (the no-JS default markup) and its
// home LCP light (no GSAP on the phone critical path).
const desktop = matchMedia('(min-width: 768px)').matches;

if (FLAGS.heroWeave && desktop && !reduced && !seen) {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);
  idle(async () => {
    const panels = [...document.querySelectorAll<HTMLElement>('.hero__panel')];
    if (!panels.length) return;
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const css = getComputedStyle(document.documentElement);
    const entrance = (parseFloat(css.getPropertyValue('--dur-entrance')) || 900) / 1000;
    const ease = css.getPropertyValue('--ease-out').trim() || 'power3.out';

    // weave in: vertical panels from above, horizontal from the right,
    // staggered across the storyboard's 0–1.2s window
    gsap.from(panels, {
      y: (i) => (i % 2 ? -120 : 60),
      x: (i) => (i % 2 ? 0 : 140),
      opacity: 0,
      duration: entrance,
      ease: `cubic-bezier(${ease.replace(/cubic-bezier\(|\)/g, '')})`,
      stagger: 0.12,
      clearProps: 'opacity',
    });

    // first-scroll release: panels drift apart, scrubbed, clipped by the hero.
    // Skip under hscroll — the hero is a pinned room that never scrolls
    // vertically, so this trigger's range is degenerate (the depth layer drifts
    // .hero__weave instead). The entrance above still plays for everyone.
    if (!document.documentElement.classList.contains('hscroll-on')) {
      gsap.to(panels, {
        y: (i) => (i % 2 ? -60 : 40) * 1.6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    sessionStorage.setItem('rf-weave', '1');
  });
}
