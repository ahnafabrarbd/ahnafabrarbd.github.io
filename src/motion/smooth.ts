/**
 * smooth.ts — immersive, weighty smooth-scroll for the PLAIN-VERTICAL (`lshape`)
 * pages (Management, Partners). Lenis lerps the SCROLL POSITION itself, so the
 * wheel nudges a target the page glides toward rather than a 1:1 jump — the same
 * unhurried hand-feel as the corridor, minus the horizontal pin. A low lerp =
 * heavier, more physical glide (owner: "more tactility / immersive friction").
 *
 * Desktop (>=1025px) + motion only — the import is gated in Base, and re-checked
 * here so a reduced-motion / sub-floor viewport keeps the native scroll. Self-
 * driven rAF loop (no GSAP dependency). Boot is try/caught so a failure leaves
 * the native vertical document and emits no console error.
 */
const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mqFloor = matchMedia('(min-width: 1025px)');

if (mqFloor.matches && !mqMotion.matches) {
  import('lenis')
    .then(({ default: Lenis }) => {
      // EXACTLY the corridor's physics (pinscroll.ts) so the vertical scroll
      // feel matches the horizontal scroll across the whole site (owner).
      const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.6, touchMultiplier: 0.9 });
      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      // hand scrolling back to the browser if the user crosses below the floor
      // or enables reduced-motion mid-session.
      const stop = () => {
        if (!mqFloor.matches || mqMotion.matches) lenis.destroy();
      };
      mqFloor.addEventListener('change', stop);
      mqMotion.addEventListener('change', stop);
    })
    .catch(() => {
      /* native scroll stands; zero-error gate preserved */
    });
}
