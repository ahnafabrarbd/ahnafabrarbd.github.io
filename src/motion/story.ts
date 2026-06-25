/**
 * story.ts — Home "story stage" (v1.3, flag storyStage). The bespoke pinned
 * scrollytelling moment: Mission → Vision → Manufacturing pin as ONE full
 * viewport and crossfade in place as you scroll (the Breakthrough study, on the
 * page authored for it — three short scenes that actually FIT a pinned frame).
 *
 * Desktop + motion only. Mobile / reduced-motion / JS-off keep the three
 * stacked scenes (the page's default markup) — complete and readable. Opacity +
 * a settling zoom only; ScrollTrigger batches scroll; GSAP loads at idle. DOM
 * stays in reading order under the pin; deep-links / rail-links to a scene
 * scroll to that scene's point in the pinned range.
 */
import { FLAGS } from '../config/flags';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 768px)').matches;

if (FLAGS.storyStage && desktop && !reduced) {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);

  idle(async () => {
    const stage = document.querySelector<HTMLElement>('.story-stage');
    const scenes = stage ? [...stage.querySelectorAll<HTMLElement>('.story-scene')] : [];
    if (!stage || scenes.length < 2) return;

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    stage.classList.add('is-staged');

    const N = scenes.length;
    const gap = 1 / (N - 1); // scene centres at i/(N-1): 0, 0.5, 1 for three
    const media = scenes.map((s) => s.querySelector<HTMLElement>('.story-scene__media img'));

    // scroll-driven VERTICAL DISSOLVE (not a flat crossfade — stacked text would
    // ghost): each scene is full near its centre with a SHARP edge (full within
    // 60% of the gap, quick fade in the last 40%, so little time muddy), and it
    // TRAVELS upward through centre as it passes — outgoing scene sits high and
    // fading, incoming sits low and arriving, so their headings never overlap.
    // The media zoom settles to 1 as the scene becomes active. pointer-events
    // follow the dominant scene so hidden CTAs aren't focusable.
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const render = (p: number) => {
      scenes.forEach((s, i) => {
        const delta = p - i * gap;
        const d = Math.abs(delta);
        // LINEAR crossfade: peaks at the centre, 0 at the neighbours' centres —
        // never two scenes at full (max 50/50 at the brief midpoint). The
        // departing scene also lifts + recedes (smaller) and the arriving one
        // grows in from below, so at the midpoint their text is offset, not
        // stacked — a scroll-driven dissolve that reads cleanly in motion.
        const op = clamp01(1 - d / gap);
        gsap.set(s, { opacity: op, y: (delta / gap) * -80, pointerEvents: op > 0.5 ? 'auto' : 'none' });
        if (media[i]) gsap.set(media[i], { scale: 1 - Math.min(d, gap) * 0.06 });
      });
    };
    render(0);

    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=' + N * 85 + '%', // ~0.85 viewport of scroll per scene
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });

    // deep-link / in-page link to a scene → scroll to its point in the pin
    const goTo = (id: string) => {
      const i = scenes.findIndex((s) => s.id === id);
      if (i < 0) return;
      scrollTo({ top: st.start + i * gap * (st.end - st.start), behavior: 'smooth' });
    };
    for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      const id = a.getAttribute('href')!.slice(1);
      if (scenes.some((s) => s.id === id)) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          goTo(id);
        });
      }
    }
    const hash = location.hash.replace('#', '');
    if (hash && scenes.some((s) => s.id === hash)) requestAnimationFrame(() => goTo(hash));

    addEventListener('resize', () => ScrollTrigger.refresh());
  });
}
