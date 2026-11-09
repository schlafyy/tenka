// The page: the cloth map, the present, the chronicle, the house, saving and the clock. All rules live in game.js (G).
// The map drawing (dyes, stencils, kasuri, crests, the soak) is taken from the Sengoku map project.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = s => document.querySelector(s);
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.append(e);
    return e;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = G.fmt, P = GEO.provinces, PIDS = G.PIDS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'tenka-save-2';
  const WORK = Object.fromEntries(WORKS.map(w => [w.id, w]));
  const CHAPTER = Object.fromEntries([...EVENTS, ...LATER_EVENTS].map(e => [e.id, e]));
  const PLACE = { ezo: ['Ezo', '蝦夷'], ryukyu: ['Ryukyu', '琉球'] };

  let S = null;                // the game state
  let report = null;           // what happened while you were away, until dismissed
  let chosen = null;           // the province picked on the open map
  let older = 25;              // chronicle entries shown

  // ---------- saving ----------
  function save() { if (!S) return; S.savedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: the game still runs */ } }
  function load() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; } }

  // ---------- dyes and stencils (from the Sengoku map) ----------
  const svg = $('#map'), defs = el('defs', {}, svg);
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255];
    return '#' + c.map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k).toString(16).padStart(2, '0')).join('');
  };
  const MOTIF = {
    plain: null,
    dots: { w: 7, h: 7, d: 'M1.75 1.75m-.75 0a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0M5.25 5.25m-.75 0a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0', fill: true },
    kikko: { w: 9, h: 5.196, d: 'M0 2.598L1.5 0H4.5L6 2.598L4.5 5.196H1.5ZM6 2.598H9', fill: false },
    hishi: { w: 7, h: 7, d: 'M3.5 0L7 3.5L3.5 7L0 3.5Z', fill: false },
    uroko: { w: 8, h: 7, d: 'M0 7L4 0L8 7Z', fill: true },
  };
  const made = new Set();
  function dyePattern(id, color, motif) {
    if (made.has(id)) return;
    made.add(id);
    const m = MOTIF[motif];
    const pat = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: m ? m.w : 8, height: m ? m.h : 8 }, defs);
    el('rect', { width: '100%', height: '100%', fill: color }, pat);
    if (m) el('path', { d: m.d, fill: m.fill ? shade(color, -.22) : 'none', stroke: m.fill ? 'none' : shade(color, -.25), 'stroke-width': .6, opacity: .75 }, pat);
  }
  function dyeOf(c) { const k = CLANS[c]; dyePattern('dye-' + c, DYES[k.dye] || '#8a907c', k.motif); return `url(#dye-${c})`; }
  {
    const pat = el('pattern', { id: 'dye-none', patternUnits: 'userSpaceOnUse', width: 6, height: 6 }, defs);
    el('rect', { width: 6, height: 6, fill: '#e2d9c5' }, pat);
    el('path', { d: 'M1 1h.8v.8H1zM4 3.5h.8v.8H4z', fill: '#b9ae97', opacity: .8 }, pat);
  }
  const splitIds = new Map();
  function fillOf(h) {
    if (h == null) return 'url(#dye-none)';
    if (!Array.isArray(h)) return dyeOf(h);
    const key = h.map(x => x || 'none').join('-');
    if (!splitIds.has(key)) {
      const [a, b] = h.map(x => (x ? dyeOf(x) : 'url(#dye-none)'));
      const id = 'split-' + key, W = 14, pat = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: W, height: W, patternTransform: 'rotate(38)' }, defs);
      el('rect', { width: W, height: W, fill: a }, pat);
      const L = [0, 1.6, .5, 2.1, .9, 1.8, .2, 1.3], R = [1.1, 0, 1.9, .6, 1.5, .3, 2, .8], GAP = [-1, 3, -1, -1, 2, -1, 4, -1], step = W / 8;
      let d = '', f = '';
      for (let i = 0; i < 8; i++) {
        const y0 = i * step, y1 = y0 + step + .03, l = 5.5 + L[i], r = 12 + R[i], g = GAP[i];
        d += g < 0 ? `M${l} ${y0}H${r}V${y1}H${l}Z` : `M${l} ${y0}H${l + g}V${y1}H${l}ZM${l + g + 1.2} ${y0}H${r}V${y1}H${l + g + 1.2}Z`;
        f += `M${l - 1.1} ${y0 + step * .3}H${l}V${y0 + step * .7}H${l - 1.1}ZM${r} ${y0 + step * .2}H${r + 1.2}V${y0 + step * .6}H${r}Z`;
      }
      el('path', { d: f, fill: b, opacity: .55 }, pat);
      el('path', { d, fill: b }, pat);
      el('rect', { width: W, height: W, fill: '#e2d9c5', opacity: .16 }, pat);
      splitIds.set(key, `url(#${id})`);
    }
    return splitIds.get(key);
  }
  {
    const f = el('filter', { id: 'resist', x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }, defs);
    el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 .937  0 0 0 0 .902  0 0 0 0 .827  -.33 -.33 -.33 1 0' }, f);
    const g = el('filter', { id: 'resist-inv', x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }, defs);
    el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 .937  0 0 0 0 .902  0 0 0 0 .827  0 2.2 0 0 -.45' }, g);
    const h = el('filter', { id: 'resist-holes', x: .025, y: .025, width: .95, height: .95, 'color-interpolation-filters': 'sRGB' }, defs);
    el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 .937  0 0 0 0 .902  0 0 0 0 .827  0 0 0 -1 1' }, h);
  }
  const resist = cr => `url(#resist${cr.invert === 'holes' ? '-holes' : cr.invert ? '-inv' : ''})`;

  // a crest on a cream disc, or the place's first character when there is no crest
  function disc(clan, place) {
    const cr = clan && CRESTS[clan];
    if (cr) return `<svg class="disc" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="${shade(DYES[CLANS[clan].dye] || '#8a907c', -.38)}"/><image href="${cr.src}" x="6" y="6" width="28" height="28" filter="${resist(cr)}"/></svg>`;
    const ja = place && (P[place] ? P[place].ja : PLACE[place] && PLACE[place][1]);
    return `<span class="disc kanji" aria-hidden="true">${ja ? ja[0] : '日'}</span>`;
  }
  const placeName = p => (P[p] ? `${esc(P[p].en)} <span lang="ja">${P[p].ja}</span>` : PLACE[p] ? `${PLACE[p][0]} <span lang="ja">${PLACE[p][1]}</span>` : '');
  const clanName = c => `${esc(CLANS[c].en)} <span lang="ja">${CLANS[c].ja}</span>`;

  // ---------- the map ----------
  const shapeIds = {};
  let n = 0;
  const addShape = s => { const id = 's' + n++; el('path', { id, d: s.d, transform: `matrix(${s.m.join(' ')})`, 'vector-effect': 'non-scaling-stroke' }, defs); return id; };
  for (const p of PIDS) shapeIds[p] = P[p].shapes.map(addShape);
  const ezoIds = GEO.ezo.map(addShape), lakeIds = GEO.lakes.map(addShape);
  const glow = el('filter', { id: 'glow', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: .035, numOctaves: 2, seed: 4, result: 'n' }, glow);
  el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 16, result: 'd' }, glow);
  el('feGaussianBlur', { in: 'd', stdDeviation: 6 }, glow);
  {
    const R = 14, pat = el('pattern', { id: 'seigaiha', patternUnits: 'userSpaceOnUse', width: R * 2, height: R }, defs);
    for (const [x, y] of [[0, -R / 2], [R * 2, -R / 2], [R, 0], [0, R / 2], [R * 2, R / 2], [R, R], [0, R * 1.5], [R * 2, R * 1.5]])
      for (const k of [1, .75, .5, .25]) el('circle', { cx: x, cy: y, r: R * k - .4, fill: k === 1 ? '#000' : 'none', stroke: '#fff', 'stroke-width': .7 }, pat);
    const mask = el('mask', { id: 'waves', maskUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 5000, height: 5000 }, defs);
    el('rect', { x: -2000, y: -2000, width: 5000, height: 5000, fill: 'url(#seigaiha)' }, mask);
    el('rect', { id: 'sea-waves', x: -2000, y: -2000, width: 5000, height: 5000, fill: '#efe6d3', mask: 'url(#waves)' }, svg);
  }
  const coast = el('g', { id: 'coast', filter: 'url(#glow)', opacity: .9 }, svg);
  for (const id of [...PIDS.flatMap(p => shapeIds[p]), ...ezoIds]) el('use', { href: '#' + id, fill: 'none', stroke: '#3a4f95', 'stroke-width': 10 }, coast);
  const ezo = el('g', { id: 'ezo' }, svg);
  for (const id of ezoIds) el('use', { href: '#' + id }, ezo);
  const land = el('g', { id: 'land' }, svg), provG = {};
  for (const p of PIDS) {
    const g = el('g', { class: 'prov', 'data-p': p }, land);
    for (const id of shapeIds[p]) el('use', { href: '#' + id }, g);
    provG[p] = g;
  }
  { // mottled dye, multiplied in
    const cv = document.createElement('canvas'), N = 256;
    cv.width = cv.height = N;
    const cx = cv.getContext('2d'), img = cx.createImageData(N, N);
    const octave = cells => {
      const g = Array.from({ length: cells * cells }, Math.random), at = (i, j) => g[(j % cells) * cells + (i % cells)];
      return (x, y) => {
        const fx = x / N * cells, fy = y / N * cells, i = Math.floor(fx), j = Math.floor(fy);
        const u = (fx - i) ** 2 * (3 - 2 * (fx - i)), v = (fy - j) ** 2 * (3 - 2 * (fy - j));
        return (at(i, j) * (1 - u) + at(i + 1, j) * u) * (1 - v) + (at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u) * v;
      };
    };
    const o = [octave(4), octave(9), octave(23), octave(64)], w = [.45, .3, .17, .08];
    for (let i = 0; i < N * N; i++) { const x = i % N, y = i / N | 0, v = 178 + 77 * o.reduce((s, f, k) => s + f(x, y) * w[k], 0); img.data.set([v, v, v, 255], i * 4); }
    cx.putImageData(img, 0, 0);
    const pat = el('pattern', { id: 'mottle-pat', patternUnits: 'userSpaceOnUse', width: 230, height: 230 }, defs);
    el('image', { href: cv.toDataURL(), width: 230, height: 230 }, pat);
    const clip = el('clipPath', { id: 'landclip' }, defs);
    for (const p of PIDS) for (const id of shapeIds[p]) el('use', { href: '#' + id }, clip);
    el('rect', { id: 'mottle', x: -100, y: -100, width: 1000, height: 1000, fill: 'url(#mottle-pat)', 'clip-path': 'url(#landclip)' }, svg);
  }
  const soak = el('g', { id: 'soak' }, svg);
  const lakes = el('g', { id: 'lakes' }, svg);
  for (const id of lakeIds) el('use', { href: '#' + id }, lakes);
  const crestsG = el('g', { id: 'crests' }, svg);
  const mineG = el('g', { id: 'mine' }, svg);
  const canG = el('g', { id: 'can' }, svg);
  const labelsG = el('g', { id: 'labels' }, svg);
  {
    const wick = el('filter', { id: 'wick', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: .09, numOctaves: 3, seed: 9, result: 'n' }, wick);
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 11 }, wick);
  }
  const b0 = land.getBBox(), pad = 14;
  const HOME = { x: b0.x - pad, y: b0.y - pad, width: b0.width + pad * 2, height: b0.height + pad * 2 };
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("viewBox", `${HOME.x} ${HOME.y} ${HOME.width} ${HOME.height}`);
  const center = p => [P[p].cx, P[p].cy];

  // the view: your land and what it can reach, as close as the frame allows; on the open map you can pan and pinch
  const vb = { x: HOME.x, y: HOME.y, w: HOME.width, h: HOME.height };
  let zoom = 1;
  const isOpen = () => document.body.classList.contains('open');
  function applyView() {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    zoom = HOME.width / vb.w;
    $('#seigaiha').setAttribute('patternTransform', `scale(${1 / zoom})`);
    paintLabels();
  }
  function focus() {
    if (!S) return;
    const ps = isOpen() && G.reachPoints(S) > 0 ? [...S.reach.slice(-6), ...G.reachable(S)] : [...new Set(S.reach.flatMap(p => [p, ...ADJ[p]]))];
    const bs = ps.flatMap(p => [...provG[p].children].map(u => u.getBBox()));
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const r = svg.getBoundingClientRect(), aspect = r.width / Math.max(1, r.height);
    let w = Math.max(x1 - x0, (y1 - y0) * aspect) * 1.2;
    w = Math.min(HOME.width * 1.1, Math.max(HOME.width / 4, w));
    Object.assign(vb, { w, h: w / aspect, x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - w / aspect / 2 });
    applyView();
  }
  const toMap = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  function zoomAt(f, cx, cy) {
    const pt = toMap(cx, cy), w = Math.min(HOME.width * 1.1, Math.max(HOME.width / 7, vb.w / f)), k = w / vb.w;
    vb.x = pt.x - (pt.x - vb.x) * k; vb.y = pt.y - (pt.y - vb.y) * k; vb.w = w; vb.h *= k;
    applyView();
  }
  svg.addEventListener('wheel', e => { if (!isOpen()) return; e.preventDefault(); zoomAt(Math.exp(-e.deltaY * .0016), e.clientX, e.clientY); }, { passive: false });
  const pointers = new Map();
  let dragged = false, pinchFrom = 0;
  svg.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    dragged = false;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchFrom = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  svg.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p || !isOpen()) return;
    if (pointers.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchFrom) zoomAt(d / pinchFrom, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchFrom = d; dragged = true;
      return;
    }
    if (!dragged && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6) return;
    if (!dragged) { dragged = true; svg.setPointerCapture(e.pointerId); }
    const k = 1 / svg.getScreenCTM().a;
    vb.x -= (e.clientX - p.x) * k; vb.y -= (e.clientY - p.y) * k;
    p.x = e.clientX; p.y = e.clientY;
    applyView();
  });
  const release = e => { pointers.delete(e.pointerId); pinchFrom = 0; };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
  svg.addEventListener('click', e => {
    if (dragged) return;
    if (!isOpen()) return openMap();
    const g = e.target.closest('.prov');
    const p = g && g.dataset.p;
    chosen = p && G.reachable(S).includes(p) && G.reachPoints(S) > 0 ? p : null;
    paintCan();
    renderChoose();
  });

  // ---------- painting the cloth ----------
  const shown = {};
  let mapYear = null, mapKey = '';
  function holders() {
    const h = G.holdersAt(S.year), mine = new Set(S.reach);
    for (const p of PIDS) {
      if (mine.has(p)) h[p] = S.house;
      // the house's own lands in history are yours to reach: until then they are undyed
      else if (h[p] === S.house) h[p] = null;
      else if (Array.isArray(h[p])) h[p] = h[p].map(c => (c === S.house ? null : c));
    }
    return h;
  }
  function paintMap(force) {
    const key = S.year + '|' + S.reach.join() + '|' + S.house;
    if (!force && key === mapKey) return;
    mapKey = key;
    const h = holders();
    for (const p of PIDS) {
      if (soaking.has(p)) continue;
      const f = fillOf(h[p]);
      if (shown[p] !== f) { for (const u of provG[p].children) u.setAttribute('fill', f); shown[p] = f; }
    }
    mineG.replaceChildren();
    for (const p of S.reach) for (const id of shapeIds[p]) el('use', { href: '#' + id }, mineG);
    paintCrests(h);
    paintCan();
  }
  // crests resist-dyed into each house's largest province: yours always, others once they hold two
  let crestSpots = [];
  function paintCrests(h) {
    crestsG.replaceChildren();
    crestSpots = [];
    const by = {};
    for (const p of PIDS) for (const c of [].concat(h[p] || [])) (by[c] = by[c] || []).push(p);
    for (const [c, ps] of Object.entries(by)) {
      const cr = CRESTS[c];
      if (!cr || (c !== S.house && ps.length < 2)) continue;
      const p = ps.sort((a, b) => KOKU[b] - KOKU[a])[0], [x, y] = center(p), s = Math.min(26, 10 + Math.sqrt(KOKU[p]) * 1.4);
      el('image', { href: cr.src, x: x - s / 2, y: y - s / 2, width: s, height: s, class: 'crest', filter: resist(cr) }, crestsG);
      crestSpots.push([x, y, s / 2]);
    }
    paintLabels();
  }
  // the provinces the house can reach, breathing, while it has a province to place
  function paintCan() {
    canG.replaceChildren();
    if (!S || G.reachPoints(S) < 1) return;
    for (const p of G.reachable(S)) for (const id of shapeIds[p]) el('use', { href: '#' + id, class: p === chosen ? 'sel' : '' }, canG);
  }
  function paintLabels() {
    labelsG.replaceChildren();
    const ctm = svg.getScreenCTM(), px = ctm ? ctm.a : 1; // screen pixels per map unit
    if (px < 1.7) return;
    const fs = 11.5 / px, boxes = crestSpots.map(([x, y, r]) => [x - r, y - r, x + r, y + r]);
    const hit = b => boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
    for (const p of [...PIDS].sort((a, b) => KOKU[b] - KOKU[a])) {
      const w = P[p].en.length * fs * .58, x = P[p].cx, y = P[p].cy + fs * 1.6, b = [x - w / 2, y - fs, x + w / 2, y + fs * .3];
      if (b[0] < vb.x || b[2] > vb.x + vb.w || b[1] < vb.y || b[3] > vb.y + vb.h || hit(b)) continue;
      boxes.push(b);
      const t = el('text', { class: 'prov-label', x, y, 'font-size': fs, 'stroke-width': fs * .28, 'text-anchor': 'middle' }, labelsG);
      t.textContent = P[p].en;
    }
  }
  // the signature: the house's dye soaks across a newly reached province from the side it came from
  const soaking = new Set();
  function soakInto(p) {
    const from = S.reach.filter(q => q !== p && ADJ[q].includes(p)).sort((a, b) => Math.hypot(P[a].cx - P[p].cx, P[a].cy - P[p].cy) - Math.hypot(P[b].cx - P[p].cx, P[b].cy - P[p].cy))[0] || p;
    const src = center(from), box = provG[p].getBBox();
    const far = Math.max(...[[box.x, box.y], [box.x + box.width, box.y], [box.x, box.y + box.height], [box.x + box.width, box.y + box.height]].map(([x, y]) => Math.hypot(x - src[0], y - src[1]))) * 1.3;
    const near = Math.max(0, Math.hypot(P[p].cx - src[0], P[p].cy - src[1]) - Math.max(box.width, box.height) * .7);
    const id = 'soak-' + p;
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 1200, height: 1200 }, defs);
    const grad = el('radialGradient', { id: id + 'g' }, defs);
    el('stop', { offset: '72%', 'stop-color': '#fff' }, grad);
    el('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }, grad);
    const circ = el('circle', { cx: src[0], cy: src[1], r: near, fill: `url(#${id}g)`, filter: 'url(#wick)' }, mask);
    const g = el('g', { mask: `url(#${id})` }, soak);
    for (const s of shapeIds[p]) el('use', { href: '#' + s, fill: dyeOf(S.house) }, g);
    soaking.add(p);
    const t0 = performance.now(), dur = reduced ? 1 : 1900;
    const step = now => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - (1 - k) ** 3;
      circ.setAttribute('r', near + (far - near) * e);
      if (k < 1) return requestAnimationFrame(step);
      soaking.delete(p);
      paintMap(true);
      g.remove(); mask.remove(); grad.remove();
    };
    requestAnimationFrame(step);
  }

  // ---------- opening the map to choose a province ----------
  function openMap() {
    document.body.classList.add('open');
    chosen = null;
    renderChoose();
    setTimeout(() => { focus(); paintCan(); }, reduced ? 0 : 620);
  }
  function closeMap() {
    document.body.classList.remove('open');
    chosen = null;
    paintCan();
    setTimeout(focus, reduced ? 0 : 620);
  }
  $('#mapclose').addEventListener('click', closeMap);
  $('#reachpill').addEventListener('click', openMap);
  $('#house').addEventListener('click', () => $('#housepage').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
  function renderChoose() {
    const box = $('#choose');
    if (!isOpen()) return;
    const pts = G.reachPoints(S);
    if (!pts) {
      box.innerHTML = `<h2>The house's land</h2><p>${S.reach.length} provinces. In these years a new one can be reached about every ${Math.round(1 / G.provincesPerYear(S.year))} years.</p>
        <div class="btns"><button class="btn" data-act="close">Close the map</button></div>`;
      return;
    }
    if (!chosen) {
      box.innerHTML = `<h2>Where does the house reach next?</h2><p>Tap a dashed province. ${pts > 1 ? `You can choose ${pts}.` : ''}</p>
        <div class="btns"><button class="btn go" data-act="auto">Let the house choose</button><button class="btn" data-act="close">Later</button></div>`;
      return;
    }
    const sp = SPECIAL[chosen], gain = G.provinceBonus(S, chosen);
    box.innerHTML = `<h2>${esc(P[chosen].en)}<span lang="ja">${P[chosen].ja}</span></h2>
      <p>${fmt(KOKU[chosen] * 1e4)} koku of rice${sp ? `, and ${esc(sp[1])} <span lang="ja">${sp[2]}</span>` : ''}. Income ×${(1 + gain).toFixed(2)}.</p>
      <div class="btns"><button class="btn go" data-act="reach">Reach ${esc(P[chosen].en)}</button><button class="btn" data-act="close">Later</button></div>`;
  }
  function doReach(p) {
    if (!G.reach(S, p)) return;
    chosen = null;
    soakInto(p);
    paintMap(true);
    render();
    save();
    if (G.reachPoints(S) < 1) setTimeout(closeMap, reduced ? 0 : 1500);
    else renderChoose();
  }
  $('#choose').addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'close') closeMap();
    if (a.dataset.act === 'reach' && chosen) doReach(chosen);
    if (a.dataset.act === 'auto') doReach(G.bestReach(S));
  });

  // ---------- the present ----------
  const hm = sec => { sec = Math.max(0, Math.ceil(sec)); if (sec < 60) return sec + ' s'; const m = Math.round(sec / 60); if (m < 60) return m + ' min'; const h = Math.floor(m / 60); return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); };
  const levels = () => Object.values(S.works).reduce((a, b) => a + b, 0);
  const money = () => (G.money(S) === 'yen' ? 'yen' : 'koku');
  function paceLine() {
    const p = G.pace(S), every = 3600 / (G.yearsPerHour(S.yearF) * p);
    const how = p >= 1.2 ? 'the house is ahead of its time' : p <= .8 ? 'the house is behind the times, so they pass slowly' : 'the house keeps pace with the times';
    return `A year every ${hm(every)}: ${how}.`;
  }
  function renderNow() {
    const age = G.ageOf(S.year), b = G.best(S), w = b && WORK[b.id];
    const open = WORKS.filter(x => x.age === age), earlier = WORKS.filter(x => x.age < age && S.works[x.id]);
    const afford = b ? Math.floor(Math.log(1 + (S.money / b.cost) * (G.GROW - 1)) / Math.log(G.GROW)) : 0;
    let h = `<div class="when"><div id="year" class="num">${S.year}</div><div class="era" id="era"></div></div>
      <p class="wealth num"><span id="money"></span> ${money()} <span class="rate">· <span id="rate"></span> a second</span></p>
      <p class="pace" id="pace"></p>`;
    if (report) {
      const r = report, bits = [];
      if (r.to > r.from) bits.push(`${r.from} → ${r.to}`);
      bits.push(`+${fmt(r.money)} ${r.unit}`);
      if (r.levels) bits.push(`your steward added ${r.levels} level${r.levels > 1 ? 's' : ''} to the trades`);
      h += `<div class="away" role="status"><h2>While you were away, ${hm(r.seconds)}${r.capped ? ` (the first ${r.capH} hours count)` : ''}</h2>
        <p>${bits.join(' · ')}.${r.chapters ? ` ${r.chapters} new chapter${r.chapters > 1 ? 's' : ''} to read.` : ''}${r.points ? ' A province to reach.' : ''}</p>
        <button class="x" data-act="dismiss" aria-label="Dismiss"><svg viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11"/></svg></button></div>`;
    }
    if (S.done) {
      h += `<div class="present"><h2>The present day</h2><p>The ${esc(CLANS[S.house].en)} have come from ${esc(P[G.house(S).home].en)} in ${1467} to ${END_YEAR}. Begin a new house in 1467: it keeps the treasure collection, and its income is doubled for every house that made it here.</p>
        <button class="btn go" data-act="newhouse">Begin a new house</button></div>`;
    }
    if (w) {
      h += `<button class="next" data-k="next" data-act="buy" data-id="${w.id}" id="nextcard">
        <span class="g" lang="ja" aria-hidden="true">${w.glyph}</span>
        <span class="t"><b>${esc(w.verb)}</b><span class="nb" title="${esc(w.en)}">Level ${S.works[w.id] || 0} → ${(S.works[w.id] || 0) + 1}</span><span class="nb">+${fmt(b.gain)} a second${((S.works[w.id] || 0) + 1) % G.MILESTONE === 0 ? ', income doubles' : ''}</span></span>
        <span class="c num"><span id="nextcost">${fmt(b.cost)}</span><small id="nextwhen"></small></span></button>
        <button class="all" data-act="all" data-k="all" ${afford >= 2 ? '' : 'hidden'}>Spend it all on the best trades</button>`;
    }
    if (levels() < 6 && S.year < 1475) h += `<p class="hint">Tap the card to grow your first trade. <b>The house earns while you are away</b>, and the years pass faster as it grows.</p>`;
    h += `<div class="trades">`;
    for (const x of open) {
      if (b && x.id === b.id) continue;
      const lv = S.works[x.id] || 0;
      if (!G.isOpen(S, x.id)) h += `<button class="trade shut" disabled><span class="g" lang="ja">${x.glyph}</span><span class="n">${esc(x.en)} <small>opens in ${x.year}</small></span><span class="c"></span></button>`;
      else h += `<button class="trade" data-act="buy" data-id="${x.id}" data-k="t-${x.id}"><span class="g" lang="ja">${x.glyph}</span><span class="n">${esc(x.en)} <small>level ${lv}</small></span><span class="c num" data-cost="${x.id}">${fmt(G.cost(S, x.id))}</span></button>`;
    }
    h += `</div>`;
    if (earlier.length) {
      const inc = earlier.reduce((s, x) => s + G.workIncome(S, x.id), 0) * G.multiplier(S);
      h += `<details class="earlier"><summary><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5L6.5 5L3 8.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Trades of earlier ages, ${fmt(inc)} a second</summary><div class="trades">` +
        earlier.map(x => `<button class="trade" data-act="buy" data-id="${x.id}" data-k="t-${x.id}"><span class="g" lang="ja">${x.glyph}</span><span class="n">${esc(x.en)} <small>level ${S.works[x.id]}</small></span><span class="c num" data-cost="${x.id}">${fmt(G.cost(S, x.id))}</span></button>`).join('') +
        `</div></details>`;
    }
    const wasOpen = $('#now details.earlier[open]');
    $('#now').innerHTML = h;
    if (wasOpen) $('#now details.earlier').open = true;
  }
  // the numbers that change every moment, without rebuilding the buttons under your finger
  function live() {
    const era = G.eraOf(S.year), age = AGES[G.ageOf(S.year)], inc = G.income(S);
    $('#era').innerHTML = `<b lang="ja">${era.ja}${G.kanjiYear(era.n)}年</b><span>${esc(era.en)} ${era.n} · ${esc(age.en)}</span>`;
    $('#money').textContent = fmt(S.money);
    $('#rate').textContent = '+' + fmt(inc);
    $('#pace').textContent = paceLine();
    const card = $('#nextcard');
    if (card) {
      const b = G.best(S), short = b.cost - S.money;
      card.classList.toggle('wait', short > 0);
      card.setAttribute('aria-disabled', short > 0);
      $('#nextwhen').textContent = short > 0 ? 'in ' + hm(short / Math.max(inc, 1e-9)) : '';
      const afford = Math.floor(Math.log(1 + (S.money / b.cost) * (G.GROW - 1)) / Math.log(G.GROW));
      $('#now .all').hidden = afford < 2;
    }
    document.querySelectorAll('#now [data-cost]').forEach(e => e.parentElement.classList.toggle('can', G.cost(S, e.dataset.cost) <= S.money));
    const pts = G.reachPoints(S), pill = $('#reachpill');
    pill.hidden = !pts || S.done && !G.reachable(S).length || !G.reachable(S).length;
    const label = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke-dasharray="2.6 2"/><path d="M8 5v6M5 8h6"/></svg>${pts > 1 ? `Reach ${pts} new provinces` : 'Reach a new province'}`;
    if (pill.dataset.k !== label) { pill.dataset.k = label; pill.innerHTML = label; }
  }
  $('#now').addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'buy') {
      if (!G.buy(S, a.dataset.id)) return;
      if (a.id === 'nextcard' && !reduced) { a.classList.remove('stamp'); void a.offsetWidth; a.classList.add('stamp'); }
      report = null;
      render(); save();
      if (a.id === 'nextcard') { const c = $('#nextcard'); if (c && !reduced) c.classList.add('stamp'); }
    }
    if (act === 'all') { const n = G.buyAll(S); report = null; render(); save(); toast(`${n} levels added`); }
    if (act === 'dismiss') { report = null; render(); }
    if (act === 'newhouse') showPick(true);
  });

  // ---------- the chronicle ----------
  function chapterHtml(e, unread) {
    const by = e.sides.find(c => CRESTS[c]) || (e.winner && CRESTS[e.winner] ? e.winner : null) || (() => { const h = G.holdersAt(e.year)[e.at]; const c = [].concat(h || [])[0]; return c && CRESTS[c] ? c : null; })();
    return `<li class="entry ${unread ? 'unread' : ''}" data-id="${e.id}">
      <div><div class="y num">${e.year}</div>${disc(by, e.at)}</div>
      <div><h3>${esc(e.en)} <span lang="ja" class="nb">${e.ja}</span></h3><p class="where">${placeName(e.at)}${by ? ` · ${clanName(by)}` : ''}</p>
      ${unread ? `<button class="btn" data-act="read" data-id="${e.id}" data-k="r-${e.id}">Read · income +${Math.round(G.CHAPTER * G.chapterGiftOf(S) * 100)}%</button>` : `<p class="story">${esc(e.short)}</p>`}</div></li>`;
  }
  function renderChron() {
    let h = `<h2>Chronicle <span lang="ja">年代記</span></h2>`;
    if (S.unread.length) {
      const list = S.unread.map(id => CHAPTER[id]);
      h += `<ol class="entries">${list.map(e => chapterHtml(e, true)).join('')}</ol>`;
      if (list.length > 1) h += `<button class="btn more" data-act="readall">Read all ${list.length}</button>`;
    }
    const items = [...S.readIds.map(id => ({ y: CHAPTER[id].year, e: CHAPTER[id] })), ...S.chron.map(c => ({ y: c.y, c }))]
      .sort((a, b) => b.y - a.y || (a.e ? -1 : 1));
    const shown = items.slice(0, older);
    h += `<ol class="entries">${shown.map(x => x.e ? chapterHtml(x.e, false) :
      `<li class="entry house"><div><div class="y num">${x.y}</div></div><div><h3>${esc(x.c.en)}</h3></div></li>`).join('')}</ol>`;
    if (items.length > older) h += `<button class="btn more" data-act="older">Show older</button>`;
    $('#chron').innerHTML = h;
  }
  $('#chron').addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'read') {
      const id = a.dataset.id;
      G.read(S, id); render(); save();
      toast(`Income +${Math.round(G.CHAPTER * G.chapterGiftOf(S) * 100)}%`);
      const li = $(`#chron .entry[data-id="${id}"]`);
      if (li) { li.classList.add('fresh'); }
    }
    if (a.dataset.act === 'readall') { const k = S.unread.length; while (S.unread.length) G.read(S, S.unread[0]); render(); save(); toast(`${k} chapters read`); }
    if (a.dataset.act === 'older') { older += 50; renderChron(); }
  });

  // ---------- the house ----------
  function renderHouse() {
    const h = G.house(S), t = TRAITS[S.head.trait];
    const found = TREASURES.filter(x => S.meta.treasures.includes(x.id));
    let x = `<h2>The house <span lang="ja">家</span></h2>
      <div class="facts"><p><b>${clanName(S.house)}</b>, from ${placeName(h.home)}. ${esc(h.motto)} <span lang="ja">${h.mottoJa}</span>: ${esc(h.text.toLowerCase())}</p>
      <p>Head of the house: <b>${esc(G.headName(S))}</b>, since ${S.head.from}. ${esc(t.en)} <span lang="ja">${t.ja}</span>: ${esc(t.text.toLowerCase())}</p>
      <p>${S.reach.length} of ${PIDS.length} provinces · ${S.readIds.length} chapters read · ${S.meta.runs ? `${S.meta.runs} house${S.meta.runs > 1 ? 's' : ''} reached the present before: income ×${2 ** S.meta.runs}` : 'the first house to set out'}</p></div>`;
    if (S.heads.length) x += `<h3 class="sub">Heads before</h3><p class="note">Your house follows its own line of heads; the history around it is the real one.</p><ul class="heads">${S.heads.map(p => `<li><b>${esc(p.given)}</b> ${p.from}–${p.until}</li>`).join('')}</ul>`;
    x += `<h3 class="sub">Treasures <span lang="ja">家宝</span> · ${found.length} of ${TREASURES.length}, income +${Math.round(found.length * G.TREASURE * 100)}%</h3>
      <p class="facts" style="margin:-2px 0 10px"><span style="color:var(--muted)">One turns up for every few provinces reached. They stay with the house for good.</span></p>
      ${found.length ? `<div class="treasures">${found.map(t => `<div class="tr"><b>${esc(t.en)}</b><span lang="ja">${t.ja}</span><br>${esc(t.kind)}</div>`).join('')}</div>` : ''}
      <p class="note after">${TREASURES.length - found.length} still to find.</p>
      <h3 class="sub">Your save</h3>
      <div class="tools"><button class="btn" data-act="copy">Copy save</button><button class="btn" data-act="paste">Load a save</button><button class="btn" data-act="restart">Start over</button></div>
      <p class="credits">Province shapes: “Provinces of Japan with names.svg” by Ash_Crow, Wikimedia Commons, CC BY 2.5. Clan crests from Wikimedia Commons, each under its own licence. Fonts: Shippori Mincho B1 and Zen Kaku Gothic New (SIL OFL). The history is written for the game from standard accounts and simplified; yields are approximate.</p>`;
    $('#housepage').innerHTML = x;
  }
  $('#housepage').addEventListener('click', async e => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'copy') {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      try { await navigator.clipboard.writeText(code); toast('Save copied'); } catch { prompt('Copy your save:', code); }
    }
    if (a.dataset.act === 'paste') {
      const code = prompt('Paste a save:');
      if (!code) return;
      try { const T = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (T.v !== 2 || !T.house) throw 0; S = T; mapKey = ''; render(); focus(); save(); toast('Save loaded'); } catch { alert('That is not a save from this game.'); }
    }
    if (a.dataset.act === 'restart' && confirm('Start over with a new house in 1467? This run is lost; the treasure collection stays.')) showPick(false);
  });

  // ---------- choosing a house ----------
  let pickClan = 'oda';
  function showPick(fromPresent) {
    const meta = S ? S.meta : null;
    const box = $('#pick');
    const draw = () => {
      const h = HOUSES.find(x => x.clan === pickClan);
      box.innerHTML = `<div class="in"><h1>${meta && meta.runs + (fromPresent ? 1 : 0) ? 'A new house' : 'Tenka'} <span lang="ja">天下</span></h1>
        <p class="lede">Lead one house from the Ōnin War of 1467 to the present day. Grow its trades, and the years pass; the house reaches across Japan province by province, and the real history arrives chapter by chapter. Nothing is lost while you are away.</p>
        <div class="houses" role="group" aria-label="Houses">${HOUSES.map(x => `<button aria-pressed="${x.clan === pickClan}" data-clan="${x.clan}">${disc(x.clan)}<b>${clanName(x.clan)}</b><small>${esc(P[x.home].en)} · ${esc(x.motto)}</small></button>`).join('')}</div>
        <div class="chosen"><h2>${clanName(h.clan)}</h2><p>From ${placeName(h.home)}. ${esc(h.motto)} <span lang="ja">${h.mottoJa}</span>: ${esc(h.text.toLowerCase())}</p>
        <button class="btn go" data-act="begin">Begin in 1467</button></div></div>`;
    };
    draw();
    box.hidden = false;
    box.onclick = e => {
      const c = e.target.closest('[data-clan]');
      if (c) { pickClan = c.dataset.clan; draw(); box.querySelector(`[data-clan="${pickClan}"]`).focus(); return; }
      if (e.target.closest('[data-act="begin"]')) {
        S = meta ? (fromPresent ? G.nextRun(S, pickClan) : G.newRun(meta, pickClan)) : G.newRun(G.newMeta(), pickClan);
        box.hidden = true;
        report = null; older = 25; mapKey = '';
        for (const k of Object.keys(shown)) delete shown[k];
        render(); focus(); save();
        window.scrollTo(0, 0);
      }
    };
  }

  // ---------- render ----------
  let structKey = '';
  function render() {
    if (!S) return;
    const k = [S.year, S.unread.join(), S.readIds.length, S.chron.length, S.reach.length, G.reachPoints(S), levels(), S.done, !!report, older, G.best(S) && G.best(S).id].join('|');
    if (k !== structKey) {
      structKey = k;
      const f = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.k;
      renderNow(); renderChron(); renderHouse();
      $('#house').innerHTML = `${disc(S.house)}<span><b>${clanName(S.house)}</b><small>${esc(G.headName(S))} · ${S.reach.length} province${S.reach.length > 1 ? 's' : ''}</small></span>`;
      if (f) { const t = document.querySelector(`[data-k="${f}"]`); if (t) t.focus(); }
      if (isOpen()) renderChoose();
    }
    paintMap();
    live();
  }
  function toast(t) { const box = $('#toast'); box.innerHTML = `<span>${esc(t)}</span>`; }

  // ---------- the clock ----------
  let last = Date.now(), lastSave = Date.now();
  function catchUp(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (dt > 90) { report = G.away(S, dt); report.unit = money(); }
    else if (dt > 0) G.tick(S, dt);
  }
  function step() {
    if (!S) return;
    catchUp(Date.now());
    render();
    if (Date.now() - lastSave > 5000) { save(); lastSave = Date.now(); }
  }
  setInterval(step, 250);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else step(); });
  addEventListener('pagehide', save);
  addEventListener('resize', () => { if (S && !isOpen()) focus(); });

  // ---------- start ----------
  const saved = load();
  if (saved && saved.v === 2) {
    S = saved;
    if (S.savedAt) { last = S.savedAt; catchUp(Date.now()); }
    render(); focus();
  } else {
    try { localStorage.removeItem('tenka-save-1'); } catch { /* nothing to clear */ }
    showPick(false);
  }
  window.tenka = { get S() { return S; }, set S(v) { S = v; mapKey = ''; render(); focus(); }, G, render };
})();
