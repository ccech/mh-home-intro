// "How we support your organization" module (Figma 4012:1227, 1440×678) for the Float pages.
// The hero's photos live in one page-level layer; as you scroll, each one floats down out of the hero
// and settles into this section's row. Once settled, the row is interactive: the chosen photo grows
// and comes to full opacity, and the supporting copy fades back into place.
window.FloatSupport = (() => {
  const W = 1440, H = 678, PAD = 56;
  const PAD_TOP = 150;                           // breathing room above the module (design px)
  const GAP = .55;                               // extra space between hero and module, in viewport heights
  const ROW_CY = 98 + 205 / 2;                   // shared centre line of the row
  const COLS = [
    { cx: 328 + 72,   label: 'For Global Organizations' },
    { cx: 523 + 89.5, label: 'For<br>Employers' },
    { cx: 754 + 72,   label: 'For<br>Employees' },
    { cx: 967 + 72.5, label: 'For Benefit Consultants' },
  ];
  const SMALL = 144, BIG = 179;                  // unselected / selected widths
  const DIM = .46;

  const css = `
  .support { position: relative; background: var(--support-bg); }
  .support .s-stage { position: absolute; left: 50%; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; z-index: 3; pointer-events: none; }
  /* The text layer sits above the photos; only its own controls take clicks so the photos below stay clickable */
  .s-stage .s-label, .s-stage .s-btn { pointer-events: auto; }
  .s-label {
    position: absolute; top: 29px; width: 144px; margin-left: -72px; padding: 0; border: 0; background: none; cursor: pointer;
    font: 500 12.8px/1.2 'Montserrat', sans-serif; letter-spacing: 1.28px; text-transform: uppercase; color: var(--label); text-align: center;
  }
  .s-label:focus-visible { outline: 2px solid var(--accent); outline-offset: 6px; border-radius: 4px; }
  .s-rule { position: absolute; left: 53px; width: 1334px; height: 1px; background: var(--rule); transform-origin: 50% 50%; }
  .s-hl { position: absolute; left: 194px; top: 407px; width: 491px; margin: 0; text-align: right;
    font: 400 61px/1.2 'Lora', serif; letter-spacing: -1.22px; color: var(--ink); }
  .s-copy { position: absolute; left: 754px; top: 417px; width: 534px; margin: 0; font: 500 18.4px/1.5 'Montserrat', sans-serif; color: var(--ink); }
  .s-btn { position: absolute; left: 754px; top: 530px; padding: 16px 28px; border-radius: 999px; background: var(--accent); color: var(--on-accent);
    font: 600 16px/normal 'Montserrat', sans-serif; text-decoration: none; white-space: nowrap; }

  /* Reveal once the photos have landed */
  .s-rv { transition: opacity 1.2s ease var(--d, 0s), transform 1.5s cubic-bezier(.2,.7,.25,1) var(--d, 0s); }
  .support:not(.on) .s-rv { opacity: 0; transform: translateY(18px); }
  .support:not(.on) .s-rule { transform: scaleX(0); }
  .s-rule { transition: transform 1.8s cubic-bezier(.3,.7,.2,1) var(--d, 0s); }
  /* Supporting copy re-settles on each selection */
  .s-supp.out { opacity: 0 !important; transform: translateY(-8px) !important; transition-duration: .35s, .45s !important; transition-delay: 0s !important; }

  .photos.live .card { pointer-events: auto; cursor: pointer; }
  .photos { pointer-events: none; }
  .ctrl { transition: opacity .6s; }
  .ctrl.away { opacity: 0; pointer-events: none; }
  `;

  function create({ map, onChange }) {
    // map: card index → column index (or -1 for a photo that floats away)
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

    const sec = document.createElement('section');
    sec.className = 'support';
    sec.setAttribute('aria-label', 'How we support your organization');
    sec.innerHTML = `
      <div class="s-stage">
        ${COLS.map((c, i) => `<button class="s-label s-rv" style="left:${c.cx}px; --d:${(.15 + i * .08).toFixed(2)}s" data-col="${i}">${c.label}</button>`).join('')}
        <div class="s-rule" style="top:358px; --d:.1s"></div>
        <h2 class="s-hl s-rv" style="--d:.35s">How we support your organization</h2>
        <p class="s-copy s-rv s-supp" style="--d:.55s">One global mental health benefit connecting employees to coaching, therapy, and more, with clinical guidance to help them find support that fits their needs.</p>
        <a class="s-btn s-rv s-supp" href="#" style="--d:.7s">Learn more</a>
        <div class="s-rule" style="top:620px; --d:.25s"></div>
      </div>`;
    document.querySelector('.hero').after(sec);
    const stage = sec.querySelector('.s-stage');
    const labels = [...sec.querySelectorAll('.s-label')];
    const supp = [...sec.querySelectorAll('.s-supp')];

    let selected = 1;                            // Employers, as in the design
    const sel = COLS.map((_, i) => i === selected ? 1 : 0);
    const hov = COLS.map(() => 0);
    let hovered = -1, k = 1, s2y = 0, pEnd = 1, pFull = 1, p = 0, on = false;

    function select(i) {
      if (i === selected) return;
      selected = i;
      labels.forEach((b, j) => b.setAttribute('aria-pressed', j === i));
      // Supporting copy steps out quickly, then fades back up into place
      supp.forEach(el => el.classList.add('out'));
      setTimeout(() => supp.forEach(el => el.classList.remove('out')), 380);
      onChange?.(i);
    }
    labels.forEach((b, i) => {
      b.setAttribute('aria-pressed', i === selected);
      b.addEventListener('click', () => select(i));
      b.addEventListener('mouseenter', () => hovered = i);
      b.addEventListener('mouseleave', () => hovered = -1);
    });

    function bindCard(el, ci) {
      const col = map[ci];
      if (col < 0) return;
      el.addEventListener('click', () => { if (p > .95) select(col); });
      el.setAttribute('aria-hidden', 'true');      // the labels are the accessible controls
      el.addEventListener('mouseenter', () => hovered = col);
      el.addEventListener('mouseleave', () => hovered = -1);
    }

    // Layout in the photo layer's units (hero stage px). layerTop = page y of the hero stage's top edge.
    function layout(scale, layerTop) {
      k = scale;
      // Breathing room above the module: a longer scroll runway so the photos can drift down unhurried
      const gap = innerHeight * GAP;
      sec.style.height = `${gap + (PAD_TOP + H + PAD) * k}px`;
      stage.style.top = `${gap + PAD_TOP * k}px`;
      stage.style.transform = `scale(${k}) translateX(-50%)`;
      const top = sec.offsetTop + gap + PAD_TOP * k;
      s2y = (top - layerTop) / k;
      // Photos are fully landed when the section's top sits just below the top of the viewport
      // Land with the module centred on screen (never tighter than the top padding allows)
      pEnd = Math.max(1, top - Math.max(24, Math.min(PAD_TOP * k, (innerHeight - H * k) / 2)));
      // A cushion above the landing spot: photos are already settled there and small upward scrolls
      // move the page normally, so a nudge doesn't send you all the way back to the hero
      pFull = Math.max(1, pEnd - Math.min(180, innerHeight * .2));
    }

    const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const clamp01 = u => Math.max(0, Math.min(1, u));
    const lerp = (a, b, u) => a + (b - a) * u;

    // Called once per frame with the eased scroll position (px)
    // ---------- Scroll lock ----------
    // Between the hero and the module, a scroll gesture is captured and the hand-off plays as one
    // eased glide (down: hero → module, up: module → hero). Outside that zone the page scrolls normally.
    const store = {
      get() { try { return localStorage.getItem('hi-float-scroll'); } catch { return null; } },
      set(v) { try { localStorage.setItem('hi-float-scroll', v); } catch {} },
    };
    let mode = store.get() === 'free' ? 'free' : 'lock';
    let anim = null, quietUntil = 0;
    const GLIDE = 2600;
    const easeSine = u => (1 - Math.cos(Math.PI * u)) / 2;
    const inZone = () => scrollY < pEnd - 2;

    function glideTo(target) {
      const from = scrollY;
      if (Math.abs(target - from) < 2) return;
      anim = { from, target, start: performance.now(), dur: GLIDE * Math.min(1, .45 + .55 * Math.abs(target - from) / pEnd) };
    }
    function stepGlide(now) {
      if (!anim) return;
      const u = clamp01((now - anim.start) / anim.dur);
      scrollTo(0, lerp(anim.from, anim.target, easeSine(u)));
      if (u >= 1) { anim = null; quietUntil = now + 450; }   // swallow trackpad momentum after landing
    }
    // Decide what a gesture in direction dir (+1 down, -1 up) does; true = we handled it
    function gesture(dir) {
      if (mode !== 'lock') return false;
      // While gliding (and briefly after), soak up the rest of the gesture so momentum can't overshoot the module
      if (anim || performance.now() < quietUntil) return scrollY <= pEnd + 2;
      if (dir > 0 && inZone()) { glideTo(pEnd); return true; }
      if (dir < 0 && scrollY > 0 && scrollY <= pFull + 2) { glideTo(0); return true; }
      return false;
    }
    addEventListener('wheel', e => { if (Math.abs(e.deltaY) > 1 && gesture(Math.sign(e.deltaY))) e.preventDefault(); }, { passive: false });
    let touchY = null;
    addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => {
      if (touchY === null) return;
      const dy = touchY - e.touches[0].clientY;
      if (mode === 'lock' && (anim || scrollY < pFull - 2 || (dy > 0 && inZone()) || (dy < 0 && scrollY <= pFull + 2))) e.preventDefault();
      if (Math.abs(dy) > 24 && gesture(Math.sign(dy))) touchY = null;
    }, { passive: false });
    addEventListener('keydown', e => {
      const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, Home: -1 }[e.key];
      if (dir && gesture(dir)) e.preventDefault();
    });

    // Free / Lock switch, for comparing the two
    const sw = document.createElement('nav');
    sw.className = 'switcher switcher--mode';
    sw.setAttribute('aria-label', 'Scroll behaviour');
    sw.innerHTML = '<span class="switcher-label">Scroll</span>' +
      ['free', 'lock'].map(m => `<a href="#" data-m="${m}"${m === mode ? ' aria-current="page"' : ''}>${m[0].toUpperCase() + m.slice(1)}</a>`).join('');
    sw.addEventListener('click', e => {
      const m = e.target.dataset?.m;
      if (!m) return;
      e.preventDefault();
      mode = m; store.set(m); anim = null;
      sw.querySelectorAll('a').forEach(a => a.toggleAttribute('aria-current', a.dataset.m === m));
      sw.querySelector('[aria-current]')?.setAttribute('aria-current', 'page');
    });
    document.body.appendChild(sw);

    function update(scrollPx, forced) {
      stepGlide(performance.now());
      // Lock mode moves the page itself on an eased curve, so it reads the real position (no extra lag)
      p = forced ?? clamp01((mode === 'lock' ? scrollY : scrollPx) / pFull);
      for (let i = 0; i < COLS.length; i++) {
        sel[i] += ((i === selected ? 1 : 0) - sel[i]) * .075;
        hov[i] += ((i === hovered && i !== selected ? 1 : 0) - hov[i]) * .12;
      }
      if (!on && p > .82) { on = true; sec.classList.add('on'); }
      if (on && p < .3) { on = false; sec.classList.remove('on'); }
      document.querySelector('.photos')?.classList.toggle('live', p > .95);
      document.getElementById('ctrl')?.classList.toggle('away', p > .25);
      return p;
    }

    // Blend one card from its hero placement (r = {x,y,w} or null if it isn't on the page yet) to the row
    function blend(ci, r, opacity) {
      const col = map[ci];
      // Staggered left→right, so the photos arrive one after another rather than as a block.
      // Easing is half linear, half sine: no steep middle, so a photo never outpaces the scroll.
      const delay = col < 0 ? 0 : col * .06;
      const u = clamp01((p - delay) / (1 - .18));
      const e = lerp(u, (1 - Math.cos(Math.PI * u)) / 2, .5);
      if (col < 0) {
        // The photo with no place in the row lifts away and fades
        const base = r || { x: 0, y: 0, w: 0 };
        return { r: { x: base.x - 40 * e, y: base.y - 140 * e, w: base.w }, opacity: opacity * (1 - clamp01(u * 1.6)), e, z: 1 };
      }
      // Hover nudges an unselected photo up a few px as a hint that it's clickable
      const w = lerp(SMALL, BIG, ease(clamp01(sel[col]))) + 6 * hov[col];
      const cy = s2y + ROW_CY, AR = 441 / 310;
      const target = { x: COLS[col].cx - w / 2, y: cy - w * AR / 2, w };
      const from = r || { x: target.x, y: target.y - 90, w };
      const rowOpacity = lerp(DIM, 1, sel[col]) + (1 - DIM) * .45 * hov[col];
      // A soft sideways sway on the way down
      const sway = Math.sin(Math.PI * e) * 26 * (col % 2 ? 1 : -1);
      return {
        r: { x: lerp(from.x, target.x, e) + sway, y: lerp(from.y, target.y, e), w: lerp(from.w, target.w, e) },
        opacity: lerp(r ? opacity : 0, rowOpacity, e),
        e, z: col === selected && e > .5 ? 2 : 1,
      };
    }

    return { layout, update, blend, bindCard, get p() { return p; } };
  }

  return { create };
})();
