/**
 * lshape.ts — the Partners "⌐|_" scroll (flag hscroll; page opts in via Base's
 * `lshape` prop, which also keeps the horizontal corridor OFF here).
 *
 * One pinned ScrollTrigger drives an L-path: phase 1 the vertical column
 * (.lshape__vert — cover + brand ladder) scrolls UP; phase 2 it holds and the
 * closing panel (.lshape__end, placed one viewport to the right of the column's
 * last screen) slides in from the right — a smooth down→horizontal turn.
 * Lenis lerps the scroll so the whole turn glides (the same physics as the
 * corridor). Desktop ≥1025px + motion only; mobile / reduced-motion keep the
 * natural vertical stack (the markup IS that fallback — this only UPGRADES it).
 */
import { FLAGS } from '../config/flags';

const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mqFloor = matchMedia('(min-width: 1025px)');

if (FLAGS.hscroll && mqFloor.matches && !mqMotion.matches) {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 600 }) : setTimeout(cb, 200);

  idle(() => {
    boot().catch(() => {});
  });

  async function boot() {
    const root = document.querySelector<HTMLElement>('.lshape');
    const inner = root?.querySelector<HTMLElement>('.lshape__inner');
    const vert = root?.querySelector<HTMLElement>('.lshape__vert');
    const end = root?.querySelector<HTMLElement>('.lshape__end');
    if (!root || !inner || !vert || !end) return;

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    const { default: Lenis } = await import('lenis');
    gsap.registerPlugin(ScrollTrigger);

    // re-assert the gate after the idle + imports (viewport may have changed)
    if (!mqFloor.matches || mqMotion.matches) return;

    const lenis = new Lenis({ lerp: 0.1 });
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    root.classList.add('is-lshape');

    const setX = gsap.quickSetter(inner, 'x', 'px');
    const setY = gsap.quickSetter(inner, 'y', 'px');

    let vDist = 0; // vertical scroll distance through the column
    const measure = () => {
      vDist = Math.max(0, vert.offsetHeight - innerHeight);
      // park the closing panel one viewport to the RIGHT of the column's final
      // screen, so the L-turn brings it to the origin (0,0).
      end.style.left = innerWidth + 'px';
      end.style.top = vDist + 'px';
    };
    const distance = () => vDist + innerWidth; // vertical leg + horizontal leg

    const render = (progress: number) => {
      const s = progress * distance();
      if (s <= vDist) {
        setX(0);
        setY(-s);
      } else {
        setX(-(s - vDist));
        setY(-vDist);
      }
    };

    measure();
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => '+=' + distance(),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onRefresh: measure,
      onUpdate: (self) => render(self.progress),
    });

    ScrollTrigger.refresh();
    measure();
    render(0);

    let rt: number | undefined;
    const onResize = () => {
      if (!mqFloor.matches) {
        teardown();
        return;
      }
      clearTimeout(rt);
      rt = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    addEventListener('resize', onResize);
    const onMotionChange = () => {
      if (mqMotion.matches) teardown();
    };
    mqMotion.addEventListener('change', onMotionChange);

    function teardown() {
      st.kill();
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      removeEventListener('resize', onResize);
      mqMotion.removeEventListener('change', onMotionChange);
      gsap.set(inner!, { clearProps: 'transform' });
      end!.style.left = '';
      end!.style.top = '';
      root!.classList.remove('is-lshape');
    }
  }
}
