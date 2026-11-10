// Timeline engine for the intro videos.
// Every motion is a paused Web Animation (or a hook), so build.mjs can seek to any
// exact time and screenshot it: frame-accurate, no dropped frames.
//
// Markup:
//   <section class="scene" data-id="intro" data-chapter="01 / System">  one per script.json scene
//   data-cue="2"        element appears when narration chunk 2 of its scene starts
//   data-in="0.4"       extra delay in seconds (after the cue, or after the scene start)
//   data-fx="up"        up | down | left | right | zoom | pop | fade | blur | wipe | draw
//   data-dur="0.8"      length of the entrance
//   data-out="3.5"      fade the element out again (seconds after scene start,
//                       or after narration chunk N when data-outcue="N" is set)
//   data-kb="in|out|left|right"  slow camera move across the whole scene
//   data-count="120"    number counts up from 0 during the entrance
//   window.__on(id, (localT, sceneDur, cues) => …)   custom per-frame drawing
// Open a scenes.html straight in Chrome to preview it (rough timings, real-time).
(function () {
  const hooks = [];
  const anims = [];
  window.__on = (id, fn) => hooks.push({ id, fn });

  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const FX = {
    up: ['translateY(48px)', 'translateY(0)'],
    down: ['translateY(-48px)', 'translateY(0)'],
    left: ['translateX(-80px)', 'translateX(0)'],
    right: ['translateX(80px)', 'translateX(0)'],
    zoom: ['scale(.86)', 'scale(1)'],
    pop: ['scale(.4)', 'scale(1)'],
  };
  const KB = {
    in: ['scale(1)', 'scale(1.07)'],
    out: ['scale(1.08)', 'scale(1)'],
    left: ['translateX(30px) scale(1.04)', 'translateX(-30px) scale(1.04)'],
    right: ['translateX(-30px) scale(1.04)', 'translateX(30px) scale(1.04)'],
  };
  const clamp = (x) => Math.min(1, Math.max(0, x));

  function build(TL) {
    const T = TL.total;
    const ms = (s) => s * 1000;
    // Keyframes over the whole timeline, so overlapping fades never fight each other.
    const track = (el, prop, points, extra = {}) => {
      const frames = points.map(([t, v]) => ({ offset: clamp(t / T), [prop]: v }));
      if (frames[0].offset > 0) frames.unshift({ offset: 0, [prop]: points[0][1] });
      if (frames.at(-1).offset < 1) frames.push({ offset: 1, [prop]: points.at(-1)[1] });
      for (let i = 1; i < frames.length; i++) frames[i].offset = Math.max(frames[i].offset, frames[i - 1].offset);
      anims.push(el.animate(frames, { duration: ms(T), fill: 'both', ...extra }));
    };

    const scenes = [...document.querySelectorAll('.scene')];
    scenes.forEach((sc, i) => {
      const s = TL.scenes[sc.dataset.id];
      if (!s) throw new Error(`scene ${sc.dataset.id} missing from script.json`);
      sc.__t = s;
      const inA = i === 0 ? 0 : s.start - 0.35, inB = i === 0 ? 0.7 : s.start + 0.35;
      const last = i === scenes.length - 1;
      const outA = last ? T - 0.9 : s.end - 0.35, outB = last ? T : s.end + 0.35;
      track(sc, 'opacity', [[inA, 0], [inB, 1], [outA, 1], [outB, 0]]);
      track(sc, 'visibility', [[inA - 0.01, 'hidden'], [inA, 'visible'], [outB, 'visible'], [outB + 0.01, 'hidden']]);

      sc.querySelectorAll('[data-kb]').forEach((el) => {
        const [a, b] = KB[el.dataset.kb] || KB.in;
        anims.push(el.animate([{ transform: a }, { transform: b }], {
          duration: ms(s.end - s.start + 0.7), delay: ms(inA), fill: 'both', composite: 'add',
        }));
      });

      sc.querySelectorAll('[data-in],[data-cue]').forEach((el) => {
        const cue = el.dataset.cue != null ? (s.cues[+el.dataset.cue] ?? 0) : 0;
        const t0 = s.start + cue + parseFloat(el.dataset.in || 0);
        const d = parseFloat(el.dataset.dur || 0.8);
        const fx = el.dataset.fx || 'up';
        const pts = [[t0, 0], [t0 + d * 0.7, 1]];
        if (el.dataset.out || el.dataset.outcue) {
          const o = s.start + (el.dataset.outcue != null ? s.cues[+el.dataset.outcue] : 0) + parseFloat(el.dataset.out || 0);
          pts.push([o, 1], [o + 0.5, 0]);
        }
        if (fx !== 'draw') track(el, 'opacity', pts, { easing: 'linear' });
        const opts = { duration: ms(d), delay: ms(t0), fill: 'both', easing: fx === 'pop' ? 'cubic-bezier(.3,1.6,.5,1)' : EASE };
        if (FX[fx]) anims.push(el.animate([{ transform: FX[fx][0] }, { transform: FX[fx][1] }], { ...opts, composite: 'add' }));
        if (fx === 'blur') anims.push(el.animate([{ filter: 'blur(18px)' }, { filter: 'blur(0)' }], opts));
        if (fx === 'wipe') anims.push(el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], opts));
        if (fx === 'draw') {
          const len = el.getTotalLength ? el.getTotalLength() : 1000;
          el.style.strokeDasharray = len;
          anims.push(el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], opts));
        }
        if (el.dataset.count) {
          const target = +el.dataset.count, suffix = el.dataset.suffix || '';
          hooks.push({ id: null, fn: (t) => {
            const p = clamp((t - t0) / d);
            el.textContent = Math.round(target * (1 - (1 - p) ** 3)) + suffix;
          } });
        }
      });
    });

    // Chapter label + progress line shared by all scenes.
    const chapter = document.querySelector('.chapter');
    const bar = document.querySelector('.progress i');
    hooks.push({ id: null, fn: (t) => {
      const cur = scenes.find((sc) => t < sc.__t.end + 0.35) || scenes.at(-1);
      if (chapter && chapter.textContent !== (cur.dataset.chapter || '')) chapter.textContent = cur.dataset.chapter || '';
      if (bar) bar.style.transform = `scaleX(${clamp(t / T)})`;
    } });

    anims.forEach((a) => a.pause());
    window.__seek = (t) => {
      for (const a of anims) a.currentTime = ms(t);
      for (const h of hooks) {
        if (!h.id) { h.fn(t); continue; }
        const s = TL.scenes[h.id];
        h.fn(t - s.start, s.end - s.start, s.cues);
      }
    };
    window.__seek(0);
  }
  window.__build = build;

  // Preview in a normal browser: 7 s per scene, cues every 2.2 s, plays in real time.
  window.addEventListener('load', () => {
    if (window.__RENDER) return;
    const scenes = [...document.querySelectorAll('.scene')];
    const TL = { scenes: {}, total: scenes.length * 7 };
    scenes.forEach((sc, i) => (TL.scenes[sc.dataset.id] = { start: i * 7, end: i * 7 + 7, cues: [0, 2.2, 4.4, 6.6] }));
    build(TL);
    const t0 = performance.now();
    const loop = () => { window.__seek(((performance.now() - t0) / 1000) % TL.total); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
})();
