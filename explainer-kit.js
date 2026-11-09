/* Praktikal Explainer Kit v0.2 (Lab Notebook style). Needs window.rough (roughjs 4.6.6).
   One explainer per document: Explainer.create({title, alt, intro, inline}, k => { ... }) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg', W = 1920, H = 1080;
  const C = {
    paper: '#FAF6EC', grid: '#8FBAD3', ink: '#34353A', soft: '#7B7C80',
    green: '#6AAD72', lime: '#77C043', magenta: '#C6187F', cyan: '#0FAEFD',
    yellow: '#F3E847', purple: '#845DEC', pink: '#F05FF7', red: '#F73926',
  };
  const STYLE = {
    line: 5, rough: 1.15, bow: 1.1, drawSpeed: 1500, fillSpeed: 9000,
    boilFps: 8, boilAmp: 3.2, moveFps: 12,
    fillAngle: -41, fillGap: 12, fillWeight: 7,
    label: 76, small: 60, title: 120, gap: .06,
  };
  const FONT = 'Caveat,"Segoe Print","Bradley Hand","Comic Sans MS",cursive';
  const FONT_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/caveat@5.2.8/files/caveat-';
  const FACES = {
    'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext': 'U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF',
    'cyrillic': 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
  };
  const L10N = {
    et: { next: 'Edasi', back: 'Tagasi', replay: 'Korda sammu', auto: 'Automaatne', restart: 'Algusest', start: 'Alusta', step: 'Samm' },
    en: { next: 'Next', back: 'Back', replay: 'Replay step', auto: 'Autoplay', restart: 'Start over', start: 'Start', step: 'Step' },
    de: { next: 'Weiter', back: 'Zurück', replay: 'Schritt wiederholen', auto: 'Automatisch', restart: 'Von vorn', start: 'Start', step: 'Schritt' },
    ru: { next: 'Далее', back: 'Назад', replay: 'Повторить шаг', auto: 'Авто', restart: 'Сначала', start: 'Начать', step: 'Шаг' },
    uk: { next: 'Далі', back: 'Назад', replay: 'Повторити крок', auto: 'Авто', restart: 'Спочатку', start: 'Почати', step: 'Крок' },
    tr: { next: 'İleri', back: 'Geri', replay: 'Adımı tekrarla', auto: 'Otomatik', restart: 'Baştan', start: 'Başla', step: 'Adım' },
  };
  const CSS = `
html{font-size:clamp(15px,2.2vmin,26px)}
html,body{height:100%;margin:0}
body{background:${C.paper};color:#414042;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
#xk{box-sizing:border-box;height:100%;display:flex;flex-direction:column;gap:.5rem;padding:clamp(8px,2vmin,32px)}
#xk-stage{flex:1 1 auto;min-height:9rem;position:relative;overflow:hidden;border:1px solid #d9d2bf;border-radius:.5rem}
#xk-stage svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
#xk-cap{margin:0;font-size:1.25rem;line-height:1.3;min-height:2.6em;display:flex;align-items:center;justify-content:center;text-align:center;text-wrap:balance}
#xk-bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center}
#xk-bar button,#xk-bar label{box-sizing:border-box;min-height:2.75rem;min-width:2.75rem;padding:0 .9rem;font:inherit;font-size:1rem;font-weight:600;color:#414042;background:#fafafa;border:1px solid #c2c2c2;border-radius:.5rem;display:inline-flex;align-items:center;justify-content:center;gap:.4rem;cursor:pointer}
#xk-bar button:disabled{opacity:.45;cursor:default}
#xk-bar button.primary{background:#008243;border-color:#008243;color:#fff;min-width:7rem}
#xk-bar button:focus-visible,#xk-bar label:focus-within{outline:3px solid #77c043;outline-offset:2px}
#xk-bar input{width:1.15rem;height:1.15rem;margin:0;accent-color:#008243}
#xk-step{min-width:5.5rem;text-align:center;font-size:1rem;font-variant-numeric:tabular-nums}
#xk.inline{height:auto}
#xk.inline #xk-stage{flex:none;aspect-ratio:16/9}
@media (max-aspect-ratio:1/1){#xk{justify-content:center}#xk-stage{flex:none;aspect-ratio:16/9;min-height:0}#xk-cap{min-height:3.9em}}
`;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const backOut = x => { const c = 2.2; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const onTwos = t => Math.floor(t * STYLE.moveFps + 1e-6) / STYLE.moveFps;
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const h = (n, a = {}, p, txt) => { const e = document.createElement(n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; if (p) p.appendChild(e); return e; };

  function create(opts, build) {
    opts = opts || {};
    const lang = (document.documentElement.lang || 'et').slice(0, 2).toLowerCase();
    const L = L10N[lang] || L10N.en;
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- page shell ---------- */
    let css = CSS;
    for (const f in FACES) css += `@font-face{font-family:Caveat;font-weight:700;font-style:normal;font-display:swap;src:url(${FONT_URL}${f}-700-normal.woff2) format("woff2");unicode-range:${FACES[f]}}\n`;
    h('style', {}, document.head, css);
    const main = h('main', { id: 'xk' }, document.body);
    if (opts.inline) main.className = 'inline';
    const stage = h('div', { id: 'xk-stage', role: 'img', 'aria-label': opts.alt || opts.title || '' }, main);
    const cap = h('p', { id: 'xk-cap', 'aria-live': 'polite' }, main);
    const bar = h('div', { id: 'xk-bar' }, main);
    const bBack = h('button', { type: 'button', 'aria-label': L.back, title: L.back }, bar, '←');
    const bReplay = h('button', { type: 'button', 'aria-label': L.replay, title: L.replay }, bar, '↻');
    const stepEl = h('span', { id: 'xk-step' }, bar);
    const bNext = h('button', { type: 'button', class: 'primary' }, bar, L.start);
    const autoLabel = h('label', {}, bar);
    const autoBox = h('input', { type: 'checkbox' }, autoLabel);
    autoLabel.appendChild(document.createTextNode(L.auto));
    if (reduced) autoLabel.hidden = true;
    const fail = msg => { cap.textContent = msg; cap.style.color = C.red; };
    if (!window.rough) { fail('Explainer kit: rough.js did not load.'); return; }

    /* ---------- stage ---------- */
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, stage);
    const defs = el('defs', {}, svg);
    defs.innerHTML = `
      <pattern id="xk-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${C.grid}" stroke-width="1.6" opacity=".38"/></pattern>
      <filter id="xk-boil" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
        <feTurbulence id="xk-boilT" type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="1" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="${STYLE.boilAmp}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>`;
    el('rect', { x: -2000, y: -2000, width: 6000, height: 5000, fill: 'url(#xk-grid)' }, svg);
    el('line', { x1: 120, y1: -2000, x2: 120, y2: 3000, stroke: C.magenta, 'stroke-width': 2.5, opacity: .3 }, svg);
    const world = el('g', {}, svg);
    const root = el('g', {}, world);
    const rc = rough.svg(svg);
    const boilT = defs.querySelector('#xk-boilT');
    let boilOn = !reduced && opts.boil !== false;
    if (boilOn) world.setAttribute('filter', 'url(#xk-boil)');

    /* ---------- timeline state ---------- */
    const anims = [], beats = [];
    let pageG = el('g', {}, root), cur = pageG;
    let seed = 7, uid = 0;
    let T0 = 0, prevEnd = 0, cursor = 0, beatEnd = 0, par = null, instant = false, inBeat = false;

    const start = o => { if (!inBeat) throw new Error('Draw inside beat(caption, () => { ... }).'); return o.t != null ? o.t : (par ? par.t : cursor); };
    const done = end => { beatEnd = Math.max(beatEnd, end); if (par) par.end = Math.max(par.end, end); else cursor = Math.max(cursor, end + (instant ? 0 : STYLE.gap)); return end; };

    function beat(caption, fn) {
      const b = { cap: caption, t0: prevEnd };
      cursor = 0; beatEnd = 0; par = null; inBeat = true;
      fn(); inBeat = false;
      b.t1 = T0 + Math.max(beatEnd, .3) + .25;
      T0 = prevEnd = b.t1; beats.push(b);
    }
    function page() {
      const g = pageG, t0 = T0;
      anims.push(now => { const q = clamp((now - t0) / .3); g.style.opacity = 1 - q; g.style.display = q >= 1 ? 'none' : ''; });
      pageG = el('g', {}, root); cur = pageG; T0 += .35;
    }
    function together(fn) { const p = { t: par ? par.t : cursor, end: 0 }; p.end = p.t; const prev = par; par = p; fn(); par = prev; done(p.end); }
    function seq(fn) {
      const prevPar = par, prevCur = cursor;
      if (par) cursor = par.t; par = null; fn(); const end = cursor; par = prevPar;
      if (par) { par.end = Math.max(par.end, end); cursor = prevCur; }
    }
    function wait(s) { cursor += s; beatEnd = Math.max(beatEnd, cursor); }
    function group(fn) { const g = el('g', {}, cur), prev = cur; cur = g; fn(g); cur = prev; return g; }

    /* ---------- drawing-on ---------- */
    function splitPaths(node, into) {
      const out = [];
      node.querySelectorAll('path').forEach(p => {
        if (p.getAttribute('stroke') === 'none') return;
        (p.getAttribute('d').match(/M[^M]+/g) || []).forEach(d => out.push(el('path', { d, fill: 'none', stroke: p.getAttribute('stroke'), 'stroke-width': p.getAttribute('stroke-width'), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, into)));
      });
      return out;
    }
    function drawOn(paths, t, d, speed, lo, hi) {
      const lens = paths.map(p => p.getTotalLength());
      const tot = lens.reduce((a, b) => a + b, 0) || 1;
      if (instant) d = 0; else if (d == null) d = clamp(tot / speed, lo, hi);
      let acc = 0;
      const segs = paths.map((p, i) => { const a = acc / tot; acc += lens[i]; const L = lens[i] + 2; p.style.strokeDasharray = L; return { p, L, a, b: acc / tot, q: -1 }; });
      const t0 = T0 + t;
      anims.push(now => {
        const g = d > 0 ? clamp((now - t0) / d) : (now >= t0 ? 1 : 0);
        for (const s of segs) {
          const q = clamp((g - s.a) / ((s.b - s.a) || 1));
          if (q === s.q) continue; s.q = q;
          s.p.style.visibility = q <= 0 ? 'hidden' : 'visible';
          s.p.style.strokeDashoffset = s.L * (1 - q);
        }
      });
      return t + d;
    }
    function ink(kind, args, o, t, into) {
      const node = rc[kind](...args, { roughness: o.rough ?? STYLE.rough, bowing: o.bow ?? STYLE.bow, stroke: o.color || C.ink, strokeWidth: o.w || STYLE.line, seed: seed++, disableMultiStroke: !!o.single, curveFitting: .97 });
      const g = el('g', {}, into || cur);
      if (o.alpha) { g.setAttribute('opacity', o.alpha); g.style.mixBlendMode = 'multiply'; }
      return { g, end: drawOn(splitPaths(node, g), t, o.d, STYLE.drawSpeed, .16, 1.1) };
    }
    function marker(kind, args, color, o, t, into) {
      const node = rc[kind](...args, { roughness: 1.4, stroke: 'none', fill: color, fillStyle: 'zigzag', hachureAngle: o.fillAngle ?? STYLE.fillAngle, hachureGap: o.fillGap || STYLE.fillGap, fillWeight: o.fillWeight || STYLE.fillWeight, seed: seed++ });
      const g = el('g', { opacity: o.fillAlpha ?? .78 }, into || cur); g.style.mixBlendMode = 'multiply';
      return { g, end: drawOn(splitPaths(node, g), t, o.fd, STYLE.fillSpeed, .3, .9) };
    }
    function shape(kind, args, o = {}) {
      const t = start(o), g = el('g', {}, cur), fg = el('g', {}, g), og = el('g', {}, g);
      let e = t;
      if (o.stroke !== false) e = ink(kind, args, o, t, og).end;
      if (o.fill) e = Math.max(e, marker(kind, args, o.fill, o, o.stroke === false ? t : Math.max(t, e - .12), fg).end);
      return { g, end: done(e) };
    }
    const line = (x1, y1, x2, y2, o) => shape('line', [x1, y1, x2, y2], o);
    const rect = (x, y, w, hh, o) => shape('rectangle', [x, y, w, hh], o);
    const circle = (x, y, dia, o) => shape('circle', [x, y, dia], o);
    const ellipse = (x, y, w, hh, o) => shape('ellipse', [x, y, w, hh], o);
    const polygon = (pts, o) => shape('polygon', [pts], o);
    const path = (d, o) => shape('path', [d], o);
    const curve = (pts, o) => shape('curve', [pts], o);
    function highlight(a, b, c, d, o) {
      if (a && a.bb) { o = b; const bb = a.bb, y = bb.y + bb.height * .6; d = y; c = bb.x + bb.width + 6; b = y; a = bb.x - 6; }
      o = o || {};
      const t = start(o);
      return { end: done(ink('line', [a, b, c, d], { color: o.color || C.yellow, w: o.w || 44, single: true, rough: .8, alpha: .75, d: o.d ?? .35 }, t).end) };
    }

    function arrowAt(x1, y1, x2, y2, o, t, into) {
      const bend = o.bend ?? .18, mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
      const g = el('g', {}, into || cur);
      const a = ink('path', [`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`], { ...o, rough: .9 }, t, g);
      const ang = Math.atan2(y2 - my, x2 - mx), hl = o.head || 28;
      for (const s of [-1, 1]) ink('line', [x2, y2, x2 - hl * Math.cos(ang + s * .5), y2 - hl * Math.sin(ang + s * .5)], { color: o.color, w: o.w, d: .1, rough: .6 }, a.end, g);
      return { g, end: a.end + (instant ? 0 : .1) };
    }
    function arrow(x1, y1, x2, y2, o = {}) { const r = arrowAt(x1, y1, x2, y2, o, start(o)); done(r.end); return r; }
    function arrowPath(d, o = {}) {
      const t = start(o), g = el('g', {}, cur);
      const probe = el('path', { d, fill: 'none' }, g), len = probe.getTotalLength();
      const p2 = probe.getPointAtLength(len), p1 = probe.getPointAtLength(Math.max(0, len - 12)); probe.remove();
      const a = ink('path', [d], { ...o, rough: o.rough ?? .7 }, t, g);
      const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x), hl = o.head || 28;
      for (const s of [-1, 1]) ink('line', [p2.x, p2.y, p2.x - hl * Math.cos(ang + s * .5), p2.y - hl * Math.sin(ang + s * .5)], { color: o.color, w: o.w, d: .1, rough: .6 }, a.end, g);
      return { g, end: done(a.end + (instant ? 0 : .1)) };
    }

    /* ---------- handwriting ---------- */
    function wipe(node, bb, t, d, pad = 16) {
      const id = 'xk-c' + (uid++);
      const r = el('rect', { x: bb.x - pad, y: bb.y - pad, width: 0, height: bb.height + pad * 2 }, el('clipPath', { id }, defs));
      node.setAttribute('clip-path', `url(#${id})`);
      const t0 = T0 + t, full = bb.width + pad * 2;
      anims.push(now => r.setAttribute('width', full * (d > 0 ? clamp((now - t0) / d) : (now >= t0 ? 1 : 0))));
    }
    function textAt(x, y, str, o, t) {
      str = String(str);
      const size = o.size || STYLE.label;
      const g = el('g', o.rot ? { transform: `rotate(${o.rot} ${x} ${y})` } : {}, cur);
      const clipG = el('g', {}, g);
      const a = { x, y, 'font-family': FONT, 'font-size': size, 'font-weight': 700, fill: o.color || C.ink, 'text-anchor': o.anchor || 'start' };
      if (o.halo !== false) Object.assign(a, { stroke: C.paper, 'stroke-width': size * .14, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      const tx = el('text', a, clipG);
      str.split('\n').forEach((ln, i) => { const ts = el('tspan', { x, dy: i ? size * 1.05 : 0 }, tx); ts.textContent = ln; });
      if (o.fit) { const w = tx.getBBox().width; if (w > o.fit) tx.setAttribute('font-size', size * o.fit / w); }
      const bb = tx.getBBox();
      const d = instant ? 0 : (o.d ?? clamp(str.length * .045, .2, 1.4));
      wipe(clipG, bb, t, d);
      return { g, bb, end: t + d, x1: bb.x, x2: bb.x + bb.width, y1: bb.y, y2: bb.y + bb.height, cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2 };
    }
    function text(x, y, str, o = {}) { const r = textAt(x, y, str, o, start(o)); done(r.end); return r; }
    /* label with an optional leader arrow: label(x, y, 'pilv', {to: [tx, ty]}) */
    function label(x, y, str, o = {}) {
      const r = textAt(x, y, str, o, start(o));
      if (o.to) {
        const [tx, ty] = o.to, b = r.bb, m = 16;
        const sx = clamp(tx, b.x - m, b.x + b.width + m), sy = clamp(ty, b.y - m + b.height * .15, b.y + b.height + m - b.height * .15);
        const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy);
        if (len > 40) r.end = arrowAt(sx, sy, tx - dx / len * 14, ty - dy / len * 14, { bend: o.bend ?? .12, w: 4, head: 22, color: o.lineColor }, r.end, r.g).end;
      }
      done(r.end); return r;
    }
    /* box with centred text: box(x, y, w, h, 'soojus', {fill: C.yellow}) */
    function box(x, y, w, hh, str, o = {}) {
      const t = start(o), prev = cur, g = el('g', {}, cur); cur = g;
      const fg = el('g', {}, g);
      let e = ink('rectangle', [x, y, w, hh], o, t).end;
      if (o.fill) e = Math.max(e, marker('rectangle', [x, y, w, hh], o.fill, o, Math.max(t, e - .12), fg).end);
      const size = o.size || STYLE.label, lines = String(str).split('\n').length;
      const r = textAt(x + w / 2, y + hh / 2 + size * .32 - (lines - 1) * size * .52, str, { ...o, anchor: 'middle', halo: false, fit: w - 40, d: undefined }, e - .1);
      cur = prev;
      return { g, end: done(r.end), cx: x + w / 2, cy: y + hh / 2, x, y, w, h: hh };
    }
    function cross(x, y, s = 70, o = {}) {
      const t = start(o), c = o.color || C.red;
      const a = ink('line', [x - s / 2, y - s / 2, x + s / 2, y + s / 2], { color: c, w: 9, d: .15 }, t);
      return { end: done(ink('line', [x + s / 2, y - s / 2, x - s / 2, y + s / 2], { color: c, w: 9, d: .15 }, a.end).end) };
    }
    function check(x, y, s = 70, o = {}) {
      const t = start(o);
      return { end: done(ink('linearPath', [[[x - s / 2, y], [x - s / 8, y + s / 2.4], [x + s / 2, y - s / 2]]], { color: o.color || C.green, w: 9, d: .3, rough: .7 }, t).end) };
    }

    /* ---------- graphs ---------- */
    /* axes(x, y, w, h, {x0,x1,y0,y1,xl,yl,xt:[..],yt:[..]}); (x, y) is the origin in stage units */
    function axes(x, y, w, hh, o = {}) {
      const t = start(o), { x0 = 0, x1 = 1, y0 = 0, y1 = 1 } = o;
      const X = v => x + (v - x0) / (x1 - x0) * w, Y = v => y - (v - y0) / (y1 - y0) * hh;
      const g = el('g', {}, cur), prev = cur; cur = g;
      let e = arrowAt(x, y, x + w + 60, y, { bend: 0 }, t).end;
      e = arrowAt(x, y, x, y - hh - 60, { bend: 0 }, t + .15).end;
      const ts = STYLE.small;
      (o.xt || []).forEach(v => { ink('line', [X(v), y - 12, X(v), y + 12], { d: .08, w: 4 }, e); textAt(X(v), y + ts + 14, v, { size: ts, anchor: 'middle', d: .15 }, e); });
      (o.yt || []).forEach(v => { ink('line', [x - 12, Y(v), x + 12, Y(v)], { d: .08, w: 4 }, e); textAt(x - 26, Y(v) + ts * .32, v, { size: ts, anchor: 'end', d: .15 }, e); });
      if (o.xt || o.yt) e += .2;
      if (o.xl) e = textAt(x + w + 60, y + (o.xt ? ts * 2 + 30 : ts + 20), o.xl, { size: ts, anchor: 'end' }, e).end;
      if (o.yl) e = textAt(x - 20, y - hh - 80, o.yl, { size: ts }, e).end;
      cur = prev; done(e);
      return {
        g, X, Y,
        plot(fn, po = {}) {
          const n = po.n || 48, pts = [];
          for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n; pts.push([X(v), Y(clamp(fn(v), y0, y1))]); }
          return shape('curve', [pts], { color: C.magenta, w: 7, rough: .5, d: 1.1, ...po });
        },
        point(vx, vy, po = {}) { return dot(X(vx), Y(vy), po); },
      };
    }
    function dot(x, y, o = {}) {
      const t = start(o), g = el('g', {}, cur);
      el('circle', { cx: x, cy: y, r: o.r || 14, fill: o.color || C.magenta, stroke: C.ink, 'stroke-width': 3 }, g);
      popAt(g, t, x, y, .3);
      return { g, end: done(t + (instant ? 0 : .3)) };
    }

    /* ---------- motion ---------- */
    function popAt(g, t, cx, cy, d) {
      const t0 = T0 + t;
      anims.push(now => {
        const q = d > 0 && !instant ? clamp((onTwos(now) - t0) / d) : (now >= t0 ? 1 : 0);
        g.style.visibility = now < t0 ? 'hidden' : 'visible';
        g.setAttribute('transform', `translate(${cx} ${cy}) scale(${q <= 0 ? 0.001 : backOut(q)}) translate(${-cx} ${-cy})`);
      });
    }
    /* stamp: a finished little drawing pops in whole: stamp(() => { circle(...); text(...) }) */
    function stamp(fn, o = {}) {
      const t = start(o), wasInstant = instant, savedCursor = cursor, savedPar = par;
      const inner = { t, end: t }; par = inner; instant = true;
      const g = group(fn);
      instant = wasInstant; par = savedPar; cursor = savedCursor;
      const bb = g.getBBox(), at = o.at || [bb.x + bb.width / 2, bb.y + bb.height / 2], d = o.d ?? .36;
      const wrap = el('g', {}, g.parentNode); wrap.appendChild(g);
      popAt(wrap, t, at[0], at[1], d);
      return { g: wrap, end: done(t + d) };
    }
    const node = x => x && x.g ? x.g : x;
    /* move(thing, {dx, dy, d}) slides a group or a returned shape, stepped on twos */
    function move(x, o = {}) {
      const g = node(x), t = start(o), d = o.d ?? .8, t0 = T0 + t, dx = o.dx || 0, dy = o.dy || 0;
      const wrap = el('g', {}, g.parentNode); wrap.appendChild(g);
      anims.push(now => { const q = ease(clamp((onTwos(now) - t0) / d)); wrap.setAttribute('transform', `translate(${dx * q} ${dy * q})`); });
      return { g: wrap, end: done(t + d) };
    }
    /* fade(thing, {to: 0}) fades out; {from: 0, to: 1} fades in; {to: .25} dims */
    function fade(x, o = {}) {
      const g = node(x), t = start(o), d = o.d ?? .35, t0 = T0 + t, to = o.to ?? 0;
      const wrap = el('g', {}, g.parentNode); wrap.appendChild(g);
      anims.push(now => { const q = clamp((now - t0) / d); if (q <= 0 && o.from == null) { wrap.removeAttribute('opacity'); return; } wrap.setAttribute('opacity', (o.from ?? 1) + (to - (o.from ?? 1)) * q); });
      return { g: wrap, end: done(t + d) };
    }
    /* animate(fn, {d}): fn(u) gets 0..1 progress; make it a pure function of u */
    function animate(fn, o = {}) {
      const t = start(o), d = o.d ?? 1, t0 = T0 + t;
      anims.push(now => fn(clamp((now - t0) / d)));
      return { end: done(t + d) };
    }

    /* ---------- playback ---------- */
    let i = -1, now = 0, playing = false, target = 0, raf = 0, last = 0, autoTimer = 0, ema = 16, frames = 0;
    function seek(t) {
      if (boilOn) boilT.setAttribute('seed', 1 + Math.floor(t * STYLE.boilFps) % 4 * 13);
      for (const a of anims) a(t);
    }
    function ui() {
      const n = beats.length;
      bNext.textContent = i < 0 ? L.start : (i >= n - 1 && !playing ? L.restart : L.next);
      bBack.disabled = bReplay.disabled = i < 0;
      stepEl.textContent = i < 0 ? '' : `${L.step} ${i + 1}/${n}`;
      const c = i < 0 ? (opts.intro || '') : beats[i].cap;
      if (cap.textContent !== c) cap.textContent = c;
    }
    function halt() { cancelAnimationFrame(raf); clearTimeout(autoTimer); playing = false; }
    function settle() {
      playing = false; ui();
      if (autoBox.checked && i < beats.length - 1) autoTimer = setTimeout(next, 1200 + beats[i].cap.split(/\s+/).length * 350);
    }
    function tick(ts) {
      const dt = Math.min(.1, (ts - last) / 1000); last = ts;
      now = Math.min(target, now + dt); seek(now);
      if (boilOn && ++frames > 20) { ema += (dt * 1000 - ema) * .1; if (ema > 34) { boilOn = false; world.removeAttribute('filter'); } }
      if (now >= target) settle(); else raf = requestAnimationFrame(tick);
    }
    function play(n, from) {
      halt(); i = n; target = beats[n].t1;
      if (reduced) { now = target; seek(now); settle(); return; }
      now = from; playing = true; last = performance.now(); seek(now); ui();
      raf = requestAnimationFrame(tick);
    }
    function show(n) { halt(); i = n; now = n < 0 ? 0 : beats[n].t1; seek(now); ui(); }
    function next() {
      if (playing) { halt(); now = target; seek(now); settle(); return; }
      if (i >= beats.length - 1) { show(-1); return; }
      play(i + 1, beats[i + 1].t0);
    }
    bNext.addEventListener('click', next);
    bBack.addEventListener('click', () => show(i - 1));
    bReplay.addEventListener('click', () => { if (i >= 0) play(i, beats[i].t0); });
    autoBox.addEventListener('change', () => { clearTimeout(autoTimer); if (autoBox.checked && !playing) next(); });

    const api = { beat, page, together, seq, wait, group, line, rect, circle, ellipse, polygon, path, curve, highlight, arrow, arrowPath, text, label, box, cross, check, axes, dot, stamp, move, fade, animate, C, STYLE, W, H };

    function buildAll() {
      try {
        /* cover: the title, fully drawn, fades as step 1 starts */
        const cover = el('g', {}, world);
        cur = cover; inBeat = true; instant = true;
        const tt = textAt(W / 2, H / 2 + 20, opts.title || '', { size: STYLE.title, anchor: 'middle', fit: 1600 }, 0);
        const y = tt.bb.y + tt.bb.height * .62;
        const hl = ink('line', [tt.bb.x - 10, y, tt.bb.x + tt.bb.width + 10, y], { color: C.yellow, w: 60, single: true, rough: .8, alpha: .75 }, 0, cover);
        cover.insertBefore(hl.g, cover.firstChild);
        instant = false; inBeat = false; cur = pageG;
        anims.push(t => { const q = clamp(t / .35); cover.style.opacity = 1 - q; cover.style.display = q >= 1 ? 'none' : ''; });
        T0 = .4;
        build(api);
        if (!beats.length) throw new Error('No beats. Add beat(caption, () => { ... }).');
      } catch (e) { fail('Explainer: ' + e.message); throw e; }
      show(-1);
      window.__xk = { beats, seek, show, next, play, state: () => ({ i, now, playing, boilOn }) };
    }
    const fontReady = document.fonts && document.fonts.load ? document.fonts.load('700 72px Caveat', 'aõж').catch(() => 0) : Promise.resolve();
    Promise.race([fontReady, new Promise(r => setTimeout(r, 2500))]).then(buildAll);
  }

  window.Explainer = { create, C, STYLE, version: '0.2.0' };
})();
