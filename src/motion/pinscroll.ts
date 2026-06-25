/**
 * pinscroll.ts — site-wide horizontal scroll with tactile depth (flag `hscroll`).
 *
 * The Sylver model: the user scrolls VERTICALLY (wheel/trackpad/keys); a single
 * GSAP ScrollTrigger pins an INJECTED inner viewport (never `main`, which is a
 * flex:1 child of the body flex-column — pinning it would drop a pin-spacer into
 * the column and disturb the sticky Header) and scrubs an injected track LEFT.
 * Each top-level `main > *` block becomes a 100vw room; the `.products-track`
 * category list and `.story-stage__track` scene track are HOISTED so each inner
 * panel is its own room (fixes the byte-exact #underware deep-link and gives
 * content-light pages real horizontal feel). The Footer is NOT moved (keeps
 * `contentinfo` a top-level landmark) — it is the vertical coda after the pin.
 *
 * Depth (restrained, "expensive not gimmicky"): a bg/fg parallax DIFFERENTIAL
 * (foreground leads, background counter-drifts) plus a small rotateY + scale
 * depth-of-field + edge scrim. All magnitudes are JS scalars written into CSS
 * custom properties (token-lint never scans JS); CSS maps them to transforms via
 * calc() against tokens. Panel centres come from a CACHED layout (offsetLeft) +
 * the known track x — ZERO per-frame getBoundingClientRect, no reflow thrash.
 *
 * Content safety: any room taller than the viewport is flagged `.is-tall` and
 * scrolls INTERNALLY (the wheel is consumed vertically until it bottoms/tops,
 * then resumes the horizontal scrub) so copy is never clipped. Accessibility:
 * panels translate (transform only) — never display:none/inert — so Tab order =
 * DOM order = visual order; a focusin handler scrolls an off-screen focused
 * panel into view; Left/Right page rooms, Home/End jump to the ends.
 *
 * Desktop (>=1025px, Sylver floor) + motion only. The engaging class `.hscroll-on`
 * is set PRE-PAINT by an is:inline head script; a `:has()` holding-clamp keeps the
 * pre-built vertical document to one screen so the structural upgrade at idle
 * causes no visible shift (CLS-safe). Mobile / reduced-motion / no-JS keep the
 * native vertical document — the markup IS the fallback; this only UPGRADES it.
 *
 * Laws: transform/opacity only; ScrollTrigger batches scroll; GSAP at idle
 * (TBT-safe); invalidateOnRefresh + resize/refresh; the boot is try/caught so a
 * failure leaves the markup fallback and emits no console error (zero-error gate).
 */
import { FLAGS } from '../config/flags';

const docEl = document.documentElement;
const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mqFloor = matchMedia('(min-width: 1025px)');

if (
  FLAGS.hscroll &&
  !FLAGS.snapDeck &&
  mqFloor.matches &&
  !mqMotion.matches &&
  // the pre-paint head gate (`{FLAGS.hscroll && !lshape}` in Base) is the SOLE
  // arbiter of "this is a corridor page": it adds `.hscroll-on` ONLY on the
  // horizontal pages, never on Partners (lshape / plain-vertical). Astro merges
  // hoisted module scripts into one always-loaded chunk, so THIS engine module
  // executes on Partners too — trust the pre-paint class and BAIL when it is
  // absent, rather than re-adding it (which wrongly engaged the corridor there).
  docEl.classList.contains('hscroll-on')
) {

  // shorter idle deadline so the :has() holding-clamp (doc held to one screen
  // until the engine builds) releases sooner — minimises the un-scrollable window
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window
      ? requestIdleCallback(cb, { timeout: 600 })
      : setTimeout(cb, 200);

  idle(() => {
    boot().catch(() => teardownClassOnly());
  });

  // last-ditch: if boot throws, drop the engaging class so the vertical document
  // stands and no console error reaches the zero-tolerance gate.
  function teardownClassOnly() {
    docEl.classList.remove('hscroll-on');
  }

  async function boot() {
    const main = document.querySelector<HTMLElement>('#main.wrap.chapters');
    if (!main) {
      teardownClassOnly();
      return;
    }

    const priorRestore = history.scrollRestoration; // restored on teardown
    history.scrollRestoration = 'manual'; // suppress native jump into clipped region

    // ---- 1. Resolve the rooms. Each top-level `main > *` is a room, EXCEPT
    // `.products-pin` (hoist its `.cat-panel`s) and `.story-stage` (hoist its
    // `.story-scene`s) so deep anchors (#underware, story ids) own a room.
    const blocks: HTMLElement[] = [];
    for (const child of [...main.children] as HTMLElement[]) {
      if (child.tagName === 'SCRIPT') continue;
      // the home HERO stays a VERTICAL front screen ABOVE the corridor (owner):
      // you scroll DOWN through it first, then the pinned viewport (built after it)
      // takes over and scrolls HORIZONTALLY. Leaving it out of the track keeps it
      // in place as the first child; the viewport is appended after it.
      if (child.classList.contains('hero')) continue;
      const inner = child.querySelector<HTMLElement>('.products-track, .story-stage__track');
      if (inner) {
        const cells = [...inner.children].filter((c): c is HTMLElement => c instanceof HTMLElement);
        if (cells.length) {
          blocks.push(...cells);
          continue;
        }
      }
      blocks.push(child);
    }
    // the Footer becomes the FINAL room (owner: terminal panel, Sylver-faithful)
    // rather than a vertical coda. It now nests inside <main>, so keep its
    // landmark with an explicit role="contentinfo" (restored on teardown).
    // the Footer stays a VERTICAL coda BELOW the corridor (owner): after the
    // horizontal rooms end and the pin releases, you scroll DOWN to reach it. It
    // is NOT moved into the track — it remains the body's top-level <footer>
    // landmark after <main>, so every page ends on a normal vertical footer.
    const footer = document.querySelector<HTMLElement>('body > footer.footer');

    if (blocks.length < 2) {
      teardownClassOnly(); // single-room page: stay vertical
      if (footer) footer.removeAttribute('role');
      return;
    }

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    // RE-ASSERT the gate after the idle delay + the two dynamic imports: the user
    // may have crossed below the 1025px floor or enabled reduced-motion during
    // that window. Abort BEFORE any DOM restructuring so a sub-floor / reduced
    // viewport keeps the native vertical document (a HARD V7 constraint).
    if (!mqFloor.matches || mqMotion.matches) {
      teardownClassOnly();
      if (footer) footer.removeAttribute('role');
      return;
    }

    // ---- SMOOTH SCROLL — the Studio RHE physics (the curvature & "motion
    // tactility" the owner asked for). Lenis lerps the SCROLL POSITION itself
    // (~0.1 of the remaining distance per frame, ≈ RHE's 0.115), so the wheel
    // nudges a target the page glides toward rather than a 1:1 jump. GSAP's
    // ticker drives Lenis; ScrollTrigger reads the lerped position; the pin and
    // the per-frame depth all inherit the smoothing → one continuous, weighted
    // motion. Desktop-engine only, so mobile stays native + light.
    const { default: Lenis } = await import('lenis');
    // lower lerp = weightier, more physical glide (owner: "more tactility")
    // Aston-faithful smooth-scroll physics (the last /site-teardown reference): a
    // weighty lerp glide with reduced wheel sensitivity so the scroll feels
    // unhurried and intentional — the intra-room slowness comes from SCROLL_FACTOR
    // + the bezier reveal; this sets the overall hand-feel.
    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85 });
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ---- 2. Build the pinned viewport + track INSIDE main (clean block context
    // for the pin-spacer; never touches the body flex-column or sticky Header).
    const viewport = document.createElement('div');
    viewport.className = 'hscroll__viewport';
    const track = document.createElement('div');
    track.className = 'hscroll__track';
    viewport.appendChild(track);

    // remember each block's origin so teardown restores exact reading order
    const origin = new Map<HTMLElement, { parent: Node; next: Node | null }>();
    const panels: HTMLElement[] = [];
    for (const b of blocks) {
      origin.set(b, { parent: b.parentNode!, next: b.nextSibling });
      const cell = document.createElement('section');
      cell.className = 'hpanel';
      // mirror the block's id onto the panel for centring, but KEEP it on the
      // block too (descendant deep-links resolve via the live id in the DOM)
      if (b.id) cell.dataset.anchor = b.id;
      cell.appendChild(b);
      track.appendChild(cell);
      panels.push(cell);
    }
    main.appendChild(viewport); // the `:has(.hscroll__viewport)` clamp now releases

    // the first room of a content page is a blank-canvas COVER — just the section
    // title (a bare h1 or a .page-head), set large and low on the clean ground.
    // The home hero is not a title block, so it keeps its own composition.
    const firstBlock = panels[0]?.firstElementChild as HTMLElement | null;
    if (firstBlock && firstBlock.matches('h1, .page-head')) panels[0].classList.add('is-cover');

    // ---- TEXT REVEAL (the Aston move, resistive): each room's primary heading is
    // split into WORDS, each word wrapped in its own clip mask. As the room nears
    // centre the words rise out of their masks one after another — a staggered,
    // SCROLL-COUPLED build (driven by the same scrubbed --reveal the depth uses),
    // so the title "takes time to appear" and feels resistive, not a quick pop.
    // CSS does the per-word timing from --i (word index) / --n (word count); we
    // only split + label here. Transform/opacity only, no SplitText dependency.
    for (const p of panels) {
      const h = p.querySelector<HTMLElement>('h1, h2, h3');
      if (!h || h.querySelector('.hrise')) continue;
      // only split headings that are a SINGLE text node — rebuilding from
      // textContent would silently flatten inline markup (<em>, <a>, <br>, hidden
      // spans) and break the accessible name. Headings with element children keep
      // their markup and simply skip the rise.
      if (h.childNodes.length !== 1 || h.firstChild?.nodeType !== 3) continue;
      const parts = (h.textContent ?? '').split(/(\s+)/); // keep the whitespace runs
      const wordCount = parts.filter((w) => w.trim().length).length;
      if (!wordCount) continue;
      h.textContent = '';
      h.classList.add('has-rise');
      h.style.setProperty('--n', String(wordCount));
      let wi = 0;
      for (const part of parts) {
        if (!part.trim().length) {
          h.appendChild(document.createTextNode(part)); // preserve the spaces
          continue;
        }
        const mask = document.createElement('span');
        mask.className = 'hrise';
        const word = document.createElement('span');
        word.className = 'hrise-w';
        word.style.setProperty('--i', String(wi));
        word.textContent = part;
        mask.appendChild(word);
        h.appendChild(mask);
        wi++;
      }
    }

    // ---- 3. Depth setters — plain setProperty closures (reliable across GSAP
    // versions for CSS custom properties; a handful of panels/frame, trivial cost)
    const setX = gsap.quickSetter(track, 'x', 'px'); // standard transform fast-path
    const cssVar = (el: HTMLElement, name: string) => (v: number) =>
      el.style.setProperty(name, String(v));
    const bgNodes: (HTMLElement | null)[] = []; // for zero-residue teardown
    const depth = panels.map((p) => {
      const fg = p.firstElementChild as HTMLElement | null; // the block content layer
      // NB: NOT .cat-panel__rail — it is a horizontal scroll container; writing a
      // transform onto it enlarges product imagery and its focus ring (review).
      const bg = p.querySelector<HTMLElement>(
        '.hero__weave, .photo-chapter__media, .story-scene__media',
      );
      bgNodes.push(bg);
      return {
        setFg: fg ? cssVar(fg, '--depth-fg') : null,
        setBg: bg ? cssVar(bg, '--depth-bg') : null,
        setReveal: cssVar(p, '--reveal'), // 0 (clipped) at edge → 1 (open) at centre
      };
    });

    // ---- 4. MOTION — continuous strip (owner: "smooth, not a carousel"): subtle
    // parallax drift + a scroll-driven IMAGE REVEAL (the Halston tactile feel —
    // the photo clip-opens as the room reaches centre; CSS maps --reveal). The
    // pin is stretched (SCROLL_FACTOR) so MORE scrolling is needed per sub-section.
    const SCROLL_FACTOR = 2.7; // lots of room to breathe: ~2.7× scroll distance per room (less sensitive, more tactile)
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic glide for paging
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // ---- 5. Cached geometry (recomputed only on refresh) --------------------
    let centres: number[] = [];
    const remeasure = () => {
      centres = panels.map((p) => p.offsetLeft + p.offsetWidth / 2);
    };
    // tall rooms scroll internally so copy is never clipped. A tall room becomes
    // a FOCUSABLE native scroll container (tabindex 0 + label) so keyboard/AT
    // users can reach its below-the-fold content (WCAG 2.1.1); onKey routes the
    // vertical keys into it. Both attributes are removed when the room shrinks.
    const markTall = () => {
      for (const p of panels) {
        // PROSE-heavy rooms that overflow flow into TWO columns so they FIT the
        // room (a corridor-native editorial spread) instead of nesting a scroll.
        // Measure raw height first (no columns), then column only if it would be
        // tall AND is pure prose (a .chapter with no stats/media/lists); re-measure
        // so .is-tall (overflow + tabindex safety) reflects the columned layout.
        p.classList.remove('is-cols');
        const tallRaw = p.scrollHeight > p.clientHeight + 1;
        const block = p.firstElementChild as HTMLElement | null;
        const prose =
          !!block && block.matches('.chapter') && !block.querySelector('.stats, .photo-chapter, img, figure, ul, ol');
        p.classList.toggle('is-cols', tallRaw && prose);
        const tall = p.scrollHeight > p.clientHeight + 1;
        p.classList.toggle('is-tall', tall);
        if (tall && !p.hasAttribute('tabindex')) {
          p.tabIndex = 0;
          p.setAttribute('aria-label', 'Scrollable section — arrow keys read its content');
        } else if (!tall && p.hasAttribute('tabindex')) {
          p.removeAttribute('tabindex');
          p.removeAttribute('aria-label');
        }
      }
    };

    // ---- 6. Bottom SECTION BAR — the Aston scroll-indicator idiom rehoused on the
    // frosted bottom bar: a running index counter (NN / NN, tracked caps) and a row
    // of DOTS, one per room that has a heading, the active dot filled forest-green.
    // Quiet, precise, corporate — the section NAMES live in each dot's aria-label/
    // title (hover tooltip + screen-reader), never as on-screen clutter. Built from
    // EVERY room so it is complete on every corridor page (core.ts's section[id]
    // list misses hoisted rooms / id-less chapters).
    const bar = document.createElement('nav');
    bar.className = 'rail-index';
    bar.setAttribute('aria-label', 'Sections');
    const counter = document.createElement('span');
    counter.className = 'rail-index__count';
    counter.setAttribute('aria-hidden', 'true'); // decorative readout; dots carry the a11y
    const barList = document.createElement('ul');
    barList.className = 'rail-index__dots';
    const pad = (n: number) => String(n).padStart(2, '0');
    const dotPanels: number[] = []; // panel indices that earned a dot (in dot order)
    const barLinks: (HTMLElement | null)[] = panels.map((panel, i) => {
      const label = panel.querySelector('h1, h2, h3')?.textContent?.trim();
      if (!label) return null;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'rail-index__dot';
      const name = label.length > 40 ? label.slice(0, 40).trimEnd() + '…' : label;
      a.setAttribute('aria-label', name);
      a.title = name;
      a.href = panel.dataset.anchor ? '#' + panel.dataset.anchor : '#';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToIndex(i);
      });
      li.appendChild(a);
      barList.appendChild(li);
      dotPanels.push(i);
      return a;
    });
    const totalDots = dotPanels.length;
    bar.appendChild(counter);
    bar.appendChild(barList);
    document.body.appendChild(bar);
    // core.ts also builds a vertical text section-rail ("Page sections") for the
    // NON-corridor document; under the corridor its `!hscroll-on` guard can lose a
    // script-timing race (the pre-paint class vs. its module run) and leave that
    // rail in the page, overlapping content. The dots bar IS the corridor's
    // wayfinding, so remove any OTHER rail-index — keep only ours.
    document.querySelectorAll('nav.rail-index').forEach((n) => {
      if (n !== bar) n.remove();
    });

    // map EVERY room index → the dot to light. A headingless room (no dot of its
    // own) lights its parent section's dot — the last dotted room at or before it,
    // falling back to the first dot for any leading headingless rooms — so the
    // counter and active dot are always populated (never the blank initial state).
    const dotForPanel: number[] = [];
    {
      let last = -1;
      for (let i = 0; i < panels.length; i++) {
        if (barLinks[i]) last = i;
        dotForPanel[i] = last;
      }
      const firstDot = dotPanels[0] ?? -1;
      for (let i = 0; i < panels.length; i++) if (dotForPanel[i] === -1) dotForPanel[i] = firstDot;
    }
    if (totalDots) counter.textContent = pad(1) + ' / ' + pad(totalDots); // never blank

    let activeIndex = 0; // nearest-centre room index (drives keyboard paging)
    let activeBar = -1;
    const setActive = (raw: number) => {
      const i = dotForPanel[raw]; // resolve to the dot that owns this room
      if (i < 0 || i === activeBar) return;
      barLinks[activeBar]?.classList.remove('is-active');
      barLinks[activeBar]?.removeAttribute('aria-current');
      const a = barLinks[i];
      if (!a) return;
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'true');
      a.scrollIntoView({ inline: 'center', block: 'nearest' }); // keep active in view
      const ord = dotPanels.indexOf(i); // ordinal among the dotted rooms
      if (ord >= 0) counter.textContent = pad(ord + 1) + ' / ' + pad(totalDots);
      activeBar = i;
    };

    // ---- 7. Progress fill (engine owns it; core.ts is guarded off when on) ---
    const fill = document.querySelector<HTMLElement>('.thread-rail__fill');
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);

    const prevOff = new Array(panels.length).fill(NaN); // skip no-op setter writes
    const render = (progress: number, trackX: number) => {
      const mid = innerWidth / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < panels.length; i++) {
        // pure arithmetic — cached centre + known track x, zero DOM reads
        const c = centres[i] + trackX;
        const dc = Math.abs(c - mid);
        if (dc < bestD) {
          bestD = dc;
          best = i;
        }
        const off = clamp((c - mid) / innerWidth, -1.2, 1.2); // -1..1 across a room
        if (off === prevOff[i]) continue; // clamped/settled room → depth unchanged
        prevOff[i] = off;
        const d = depth[i];
        d.setFg?.(off); // foreground leads
        d.setBg?.(-off); // background counter-drifts (subtle parallax)
        // REVEAL is ASYMMETRIC (owner: titles & images must NOT animate out). A room
        // opens as it approaches centre from the RIGHT (ahead) and is FULLY revealed
        // once it reaches centre OR has passed to the left — so nothing fades/closes
        // on the way out, and the opening cover (already at/left of centre) reads
        // crisp from first paint. Only rooms still ahead are partially revealed.
        // The intra-room reveal is BEZIER-eased (easeInOutCubic): slow at the start
        // and end of the room's travel so content unfurls deliberately, with room to
        // breathe (owner: intra-section = very slow/heavy/intentional). Inter-room
        // paging stays plain/smooth (the scrollToIndex glide is unchanged).
        const rawReveal = clamp(1 - Math.max(0, off), 0, 1);
        const easedReveal =
          rawReveal < 0.5 ? 4 * rawReveal ** 3 : 1 - Math.pow(-2 * rawReveal + 2, 3) / 2;
        d.setReveal(easedReveal);
      }
      activeIndex = best;
      setActive(best);
      if (fill) fill.style.setProperty('--progress', String(progress));
    };

    const st = ScrollTrigger.create({
      trigger: viewport,
      start: 'top top',
      end: () => '+=' + distance() * SCROLL_FACTOR, // weightier: more scroll per room
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true, // follow the Lenis-smoothed scroll directly — Lenis is the
                   // single lerp source, so no second scrub lag stacks on it
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        remeasure();
        markTall();
      },
      onRefresh: () => remeasure(),
      onUpdate: (self) => {
        const x = -distance() * self.progress;
        setX(x);
        render(self.progress, x);
      },
    });

    // ---- 8. Tall rooms: Lenis drives the corridor UNIFORMLY on wheel (no traps),
    // so below-the-fold content in a tall room is reached via the KEYBOARD (onKey
    // routes the vertical keys into the room's overflow-y scroll) or its scrollbar.
    // (A wheel-into-room affordance under Lenis is a deferred refinement.)

    // ---- 9. Hash deep-links (panel id OR descendant id) → scroll to room centre
    const panelFor = (id: string): HTMLElement | null => {
      const direct = panels.find((p) => p.dataset.anchor === id);
      if (direct) return direct;
      const el = document.getElementById(id);
      return (el?.closest('.hpanel') as HTMLElement) ?? null;
    };
    // scroll the WINDOW to centre a room BY INDEX, using the cached centres[]
    // (measured at refresh, in the SAME space onUpdate maps from). A LIVE
    // offsetLeft read is unreliable while the viewport is pinned/fixed, so we
    // never read it here — that bug stranded keyboard/focus paging at frac 0.
    // behavior 'auto' (NOT 'smooth') is deliberate: the scrub:1 lerps the track
    // over ~1s, so an instant scrollY set yields ONE smooth corridor glide. A
    // native smooth scroll would double-ease against the scrub (html scroll-
    // behavior:smooth is also neutralised under .hscroll-on in base.css).
    // programmatic scrolls go THROUGH Lenis so they share its lerp and don't
    // fight its rAF loop. immediate=true jumps (focus rescue / arrival); else glide.
    const scrollToIndex = (i: number, immediate = false) => {
      if (i < 0 || i >= panels.length) return false;
      const total = distance();
      const top =
        total <= 0
          ? (st.start as number)
          : (st.start as number) +
            clamp((centres[i] - innerWidth / 2) / total, 0, 1) * ((st.end as number) - (st.start as number));
      // bezier-eased glide between sub-sections (owner); immediate = instant jump
      lenis.scrollTo(top, immediate ? { immediate: true } : { duration: 1.1, easing: ease });
      return true;
    };
    const scrollToPanel = (panel: HTMLElement, immediate = false) =>
      scrollToIndex(panels.indexOf(panel), immediate);
    const scrollToId = (id: string, immediate = false) =>
      scrollToIndex(panels.indexOf(panelFor(id) as HTMLElement), immediate);

    // capture-phase: same-page hashes scroll to a room; cross-page links navigate
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return; // let it navigate
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && scrollToId(id)) {
        e.preventDefault();
        history.replaceState(null, '', url.hash);
        document.getElementById(id)?.focus?.({ preventScroll: true });
      }
    };
    document.addEventListener('click', onClick, true);

    // ---- 10. Focus safety: a focused element in an off-screen room scrolls in
    const onFocusIn = (e: FocusEvent) => {
      const panel = (e.target as HTMLElement)?.closest?.('.hpanel') as HTMLElement | null;
      if (!panel) return;
      // defer past the browser's native focus scroll-into-view (which lands wrong
      // for an element inside the fixed-pinned viewport) so OUR centring wins
      requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        if (r.left < -1 || r.right > innerWidth + 1) scrollToPanel(panel, true);
      });
    };
    main.addEventListener('focusin', onFocusIn);

    // ---- 11. Keyboard paging (vertical keys already move scrollY → ScrollTrigger)
    const onKey = (e: KeyboardEvent) => {
      // the modal overlay menu isolates the corridor — never page it underneath
      if (document.querySelector('dialog[open]')) return;
      const t = e.target as HTMLElement;
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' || t?.isContentEditable) return;
      // a tall (internally-scrolling) room owns the VERTICAL keys until it tops/
      // bottoms out, so non-pointer users can read its below-the-fold content
      const cur = panels[activeIndex];
      if (cur?.classList.contains('is-tall')) {
        const big = e.key === 'PageDown' || e.key === 'PageUp' || e.key === ' ';
        const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
        const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
        const atTop = cur.scrollTop <= 0;
        const atBottom = cur.scrollTop + cur.clientHeight >= cur.scrollHeight - 1;
        if ((down && !atBottom) || (up && !atTop)) {
          e.preventDefault();
          cur.scrollTop += (down ? 1 : -1) * cur.clientHeight * (big ? 0.9 : 0.18);
          return;
        }
      }
      const go = (i: number) => scrollToIndex(clamp(i, 0, panels.length - 1));
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(activeIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        lenis.scrollTo(st.start as number);
      } else if (e.key === 'End') {
        e.preventDefault();
        lenis.scrollTo(st.end as number);
      }
    };
    addEventListener('keydown', onKey);

    // ---- 12. Settle. Resolve any arrival hash AFTER refresh, in a double rAF.
    ScrollTrigger.refresh();
    remeasure();
    markTall();
    // prime --reveal + the bottom bar from the initial position BEFORE first paint:
    // rooms ahead start sealed (reveal 0) rather than the CSS fallback (shown), and
    // the cover + counter are correct from frame one (no flash of open far rooms).
    render(st.progress, -distance() * st.progress);
    // late content growth (webfont swap, lazy images) can push a room past 100svh
    // with no resize/refresh — re-mark so it gets internal scroll, never clipped
    const onLateLoad = () => markTall();
    document.fonts?.ready.then(markTall);
    main.addEventListener('load', onLateLoad, true);
    const arrive = decodeURIComponent(location.hash.slice(1));
    if (arrive && panelFor(arrive)) {
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(arrive, true)));
    }

    // ---- 13. Resize / breakpoint / reduced-motion lifecycle -----------------
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

    // ---- 14. Clean teardown → restore the vertical document, zero residue ----
    function teardown() {
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy(); // hands scrolling back to the browser for the vertical doc
      st.kill();
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
      mqMotion.removeEventListener('change', onMotionChange);
      document.removeEventListener('click', onClick, true);
      main!.removeEventListener('focusin', onFocusIn);
      main!.removeEventListener('load', onLateLoad, true);
      for (const bg of bgNodes) bg?.style.removeProperty('--depth-bg'); // bg lives inside the block
      // unwrap each block back to its exact original position & order
      for (let i = panels.length - 1; i >= 0; i--) {
        const cell = panels[i];
        const block = cell.firstElementChild as HTMLElement | null;
        const o = block && origin.get(block);
        if (block && o) o.parent.insertBefore(block, o.next);
        block?.removeAttribute('style');
      }
      viewport.remove();
      footer?.removeAttribute('role'); // back to the implicit top-level contentinfo
      fill?.style.removeProperty('--progress');
      history.scrollRestoration = priorRestore; // restore native scroll restoration
      docEl.classList.remove('hscroll-on');
      bar.remove();
    }
  }
}
