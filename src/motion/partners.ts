/**
 * partners.ts — immersive vertical reveal for the Partners ladder (owner: the
 * partner section should "scroll with a lot of immersion and a lot of resistivity").
 *
 * The Partners page opts OUT of the horizontal corridor (Base `lshape`), so it
 * gets its own lightweight motion instead of the pinscroll engine:
 *   1. a WEIGHTY Lenis smooth-scroll — the same physical, unhurried glide as the
 *      corridor (low lerp + reduced wheel sensitivity) = the "resistivity"; and
 *   2. a scroll-coupled STAGGERED REVEAL — the cover, each brand rung and the
 *      closing panel rise out of their resting offset as they enter view. Rungs
 *      enter one after another as you descend, so the ladder builds deliberately.
 *
 * Self-gating: Astro merges hoisted module scripts into ONE chunk loaded on every
 * page, so this module BAILS immediately unless the Partners markup ([data-lshape])
 * is present. Mobile / reduced-motion / no-JS keep the native static stack — the
 * markup IS the fallback; the hidden initial state is gated on `.js` (added by
 * core.ts) so a no-JS page never hides anything.
 *
 * Laws honoured: transform/opacity only; IO over scroll listeners; reduced-motion
 * is a designed alternative (everything shown, no Lenis), not a broken page.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.querySelector<HTMLElement>('[data-lshape]');

if (root && !reduced) {
  // ---- 1. Staggered reveal. Each target carries `.lshape-rise` (hidden initial
  // state, gated on `.js` in base.css); IO adds `.is-risen` as it enters view.
  const targets = [
    ...root.querySelectorAll<HTMLElement>('.lshape__cover, .lshape__rung, .lshape__end'),
  ];
  for (const el of targets) el.classList.add('lshape-rise');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-risen');
        io.unobserve(e.target);
      }
    },
    // fire a touch before the row reaches the fold so the rise reads as you arrive
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  for (const el of targets) io.observe(el);

  // ---- 2. Weighty smooth-scroll (the resistivity). Desktop floor only — keep
  // mobile native + light. Plain rAF drive (no GSAP on this page). Matches the
  // corridor's hand-feel: lerp 0.07, reduced wheel sensitivity.
  if (matchMedia('(min-width: 1025px)').matches) {
    import('lenis')
      .then(({ default: Lenis }) => {
        const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.8 });
        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      })
      .catch(() => {
        /* no smooth-scroll → native vertical scroll still works */
      });
  }
}
