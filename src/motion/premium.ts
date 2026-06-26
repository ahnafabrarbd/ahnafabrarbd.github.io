/**
 * premium.ts — the bespoke interaction layer that lifts the site to a couture
 * feel: a custom trailing cursor, a magnetic pull on the key call-to-actions, the
 * hero scroll-cue fade, and removal of the entrance curtain.
 *
 * Loads on every page (Astro merges hoisted module scripts into one chunk) and
 * SELF-GATES each effect. The cursor + magnetics run on fine-pointer + motion
 * only; touch / reduced-motion keep the clean, disciplined base interactions —
 * nothing here is load-bearing. transform/opacity only, rAF-driven, passive
 * listeners, zero dependencies.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const docEl = document.documentElement;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---- 1. entrance curtain removal: once the wipe finishes, drop it from the DOM
   (it is off-screen by then; this just frees it). Skipped state never mounts. */
const pre = document.querySelector('.preloader');
if (pre && !docEl.classList.contains('preloaded')) {
  pre.addEventListener('animationend', (e) => {
    if ((e as AnimationEvent).animationName === 'preloader-wipe') pre.remove();
  });
}

/* ---- 2. bespoke cursor + magnetic CTAs (fine pointer + motion only) */
if (fine && !reduced) {
  // ---- the cursor: an ink dot tracks the pointer exactly; an accent ring trails
  // on a lerp and swells over interactive targets.
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);
  docEl.classList.add('has-cursor');

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;
  let scale = 1;
  let targetScale = 1;
  let primed = false;

  const interactive = 'a, button, [data-magnetic], input, textarea, select, summary, label, .rail-index__dot';
  const isInteractive = (t: EventTarget | null) => !!(t as HTMLElement)?.closest?.(interactive);

  addEventListener(
    'pointermove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!primed) {
        primed = true;
        rx = mx;
        ry = my;
        docEl.classList.add('cursor-ready');
      }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    },
    { passive: true },
  );
  addEventListener('pointerover', (e) => {
    if (isInteractive(e.target)) {
      targetScale = 1.7;
      ring.classList.add('is-hover');
    }
  });
  addEventListener('pointerout', (e) => {
    if (isInteractive(e.target)) {
      targetScale = 1;
      ring.classList.remove('is-hover');
    }
  });
  addEventListener('pointerdown', () => (targetScale = 0.85), { passive: true });
  addEventListener('pointerup', () => (targetScale = ring.classList.contains('is-hover') ? 1.7 : 1), { passive: true });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
    ring.style.opacity = '';
  });

  const frame = () => {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    scale = lerp(scale, targetScale, 0.2);
    ring.style.setProperty('--cursor-x', `${rx}px`);
    ring.style.setProperty('--cursor-y', `${ry}px`);
    ring.style.setProperty('--cursor-scale', String(scale));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ---- magnetic CTAs: the key buttons drift toward the cursor within their
  // bounds and spring back on exit. Keep it to button-like CTAs (text nav links
  // get the underline + ring-swell instead, which reads cleaner).
  const magnets = document.querySelectorAll<HTMLElement>(
    '.cta, .lshape__cta, .enquiry__submit, .topbar__menu',
  );
  for (const m of magnets) {
    m.dataset.magnetic = '';
    m.style.transition =
      'transform var(--dur-base) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)';
    m.addEventListener('pointermove', (e) => {
      const r = m.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      m.style.transform = `translate(${dx * 0.28}px, ${dy * 0.4}px)`;
    });
    m.addEventListener('pointerleave', () => {
      m.style.transition = 'transform var(--dur-slow) var(--ease-spring)';
      m.style.transform = '';
      // restore the snappier move transition after the spring-back settles
      setTimeout(() => {
        m.style.transition =
          'transform var(--dur-base) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)';
      }, 700);
    });
  }
}

/* ---- 3. hero scroll-cue: fade it out the moment the visitor starts scrolling */
const cue = document.querySelector('.scroll-cue');
if (cue) {
  const onScroll = () => {
    if (scrollY > 40) {
      cue.classList.add('is-gone');
      removeEventListener('scroll', onScroll);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
}
