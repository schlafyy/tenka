// The page: the cloth map, the panel, the modals, saving, and the clock. All rules live in game.js (G).
// The map drawing (dyes, stencils, kasuri, crests, the soak, zoom and pan) is taken from the Sengoku map project.
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
  const KEY = 'tenka-save-1';
  const SEASONS = [['Spring', '春'], ['Summer', '夏'], ['Autumn', '秋'], ['Winter', '冬']];

  let S = null;            // the game state
  let tab = 'realm', sel = null, ui = { showAllCastles: false, pickClan: null };

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
  const info = c => (S ? G.clanInfo(S, c) : CLANS[c]);
  const colorOf = c => DYES[info(c).dye] || '#e2d9c5';
  function dyeOf(c) { const k = info(c); dyePattern('dye-' + c, DYES[k.dye] || '#8a907c', k.motif); return `url(#dye-${c})`; }
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
  function swatch(c, cls = 'swatch') {
    if (!c) return `<svg class="${cls}" viewBox="0 0 22 22" aria-hidden="true"><rect width="22" height="22" fill="#e2d9c5"/><path d="M4 4h1.6v1.6H4zM13 9h1.6v1.6H13zM8 15h1.6v1.6H8z" fill="#b9ae97"/></svg>`;
    if (Array.isArray(c)) return swatch(c[0], cls);
    const k = info(c), m = MOTIF[k.motif], col = colorOf(c), cr = CRESTS[c];
    const motif = m ? `<pattern id="sw-${c}-${cls}" patternUnits="userSpaceOnUse" width="${m.w * 1.4}" height="${m.h * 1.4}"><path d="${m.d}" transform="scale(1.4)" fill="${m.fill ? shade(col, -.22) : 'none'}" stroke="${m.fill ? 'none' : shade(col, -.25)}" stroke-width=".6" opacity=".8"/></pattern>` : '';
    return `<svg class="${cls}" viewBox="0 0 22 22" aria-hidden="true"><defs>${motif}</defs><rect width="22" height="22" fill="${col}"/>${m ? `<rect width="22" height="22" fill="url(#sw-${c}-${cls})"/>` : ''}` +
      `${cr ? `<image href="${cr.src}" x="3" y="3" width="16" height="16" filter="${resist(cr)}"/>` : ''}</svg>`;
  }
  const clanName = c => {
    if (c == null) return 'Local lords <span lang="ja">国人</span>';
    if (Array.isArray(c)) return c.map(x => clanName(x)).join(' and ');
    const k = info(c);
    return `${esc(k.en)}${k.ja ? ` <span lang="ja">${k.ja}</span>` : ''}`;
  };
  const provName = p => `${esc(P[p].en)} <span lang="ja">${P[p].ja}</span>`;

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
  // snow: cream flecks over the northern provinces in winter
  {
    const pat = el('pattern', { id: 'snowfall', patternUnits: 'userSpaceOnUse', width: 9, height: 9 }, defs);
    el('rect', { width: 9, height: 9, fill: '#efe6d3', opacity: .22 }, pat);
    el('path', { d: 'M1.5 1.5h1.2v1.2H1.5zM6 4h1v1H6zM3.5 7h1.1v1.1H3.5z', fill: '#fffaf0', opacity: .9 }, pat);
  }
  const snowG = el('g', { id: 'snow', opacity: 0 }, svg);
  for (const p of SNOW) for (const id of shapeIds[p]) el('use', { href: '#' + id, fill: 'url(#snowfall)' }, snowG);
  const soak = el('g', { id: 'soak' }, svg);
  const lakes = el('g', { id: 'lakes' }, svg);
  for (const id of lakeIds) el('use', { href: '#' + id }, lakes);
  const crestsG = el('g', { id: 'crests' }, svg);
  const mineG = el('g', { id: 'mine' }, svg);
  const threadsG = el('g', { id: 'threads' }, svg);
  const labelsG = el('g', { id: 'labels' }, svg);
  {
    const wick = el('filter', { id: 'wick', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: .09, numOctaves: 3, seed: 9, result: 'n' }, wick);
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 11 }, wick);
  }
  const b0 = land.getBBox(), pad = 14;
  const HOME = { x: b0.x - pad, y: b0.y - pad, width: b0.width + pad * 2, height: b0.height + pad * 2 };
  svg.setAttribute('viewBox', `${HOME.x} ${HOME.y} ${HOME.width} ${HOME.height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const center = p => [P[p].cx, P[p].cy];

  // zoom and pan; a drag never counts as a tap
  const vb = { x: HOME.x, y: HOME.y, w: HOME.width, h: HOME.height };
  let zoom = 1;
  const MAX_ZOOM = 6;
  const toMap = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  function applyView() {
    vb.x = Math.min(Math.max(vb.x, HOME.x - vb.w * .25), HOME.x + HOME.width - vb.w * .75);
    vb.y = Math.min(Math.max(vb.y, HOME.y - vb.h * .25), HOME.y + HOME.height - vb.h * .75);
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    zoom = HOME.width / vb.w;
    $('#seigaiha').setAttribute('patternTransform', `scale(${1 / zoom})`);
    paintLabels();
  }
  function zoomAt(f, cx, cy) {
    const pt = toMap(cx, cy), w = Math.min(HOME.width, Math.max(HOME.width / MAX_ZOOM, vb.w / f)), k = w / vb.w;
    vb.x = pt.x - (pt.x - vb.x) * k; vb.y = pt.y - (pt.y - vb.y) * k; vb.w = w; vb.h *= k;
    applyView();
  }
  const zoomBy = f => { const r = svg.getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2); };
  const zoomHome = () => { Object.assign(vb, { x: HOME.x, y: HOME.y, w: HOME.width, h: HOME.height }); applyView(); };
  // open on your own corner of the realm: your land and its neighbours, as close as the screen needs (a phone needs it most)
  function focusRealm() {
    const ps = [...new Set(G.owned(S).flatMap(p => [p, ...ADJ[p]]))];
    const bs = ps.flatMap(p => [...provG[p].children].map(u => u.getBBox()));
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const r = svg.getBoundingClientRect(), aspect = r.width / Math.max(1, r.height);
    let w = Math.max(x1 - x0, (y1 - y0) * aspect) * 1.25;
    w = Math.min(HOME.width, Math.max(HOME.width / 3.2, w));
    if (w > HOME.width * .8) return zoomHome();
    Object.assign(vb, { w, h: w / aspect, x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - w / aspect / 2 });
    applyView();
  }
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * .0016), e.clientX, e.clientY); }, { passive: false });
  const pointers = new Map();
  let dragged = false, pinchFrom = 0;
  svg.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    dragged = false;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchFrom = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  svg.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    if (pointers.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchFrom) zoomAt(d / pinchFrom, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchFrom = d; dragged = true;
      return;
    }
    if (!dragged && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6) return;
    if (!dragged) { dragged = true; svg.setPointerCapture(e.pointerId); svg.classList.add('panning'); }
    const k = 1 / svg.getScreenCTM().a;
    vb.x -= (e.clientX - p.x) * k; vb.y -= (e.clientY - p.y) * k;
    p.x = e.clientX; p.y = e.clientY;
    applyView();
  });
  const release = e => { pointers.delete(e.pointerId); pinchFrom = 0; svg.classList.remove('panning'); };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
  svg.addEventListener('click', e => {
    if (dragged) return;
    const g = e.target.closest('.prov');
    select(g ? g.dataset.p : null);
  });
  document.querySelectorAll('#zoom button').forEach(b => b.addEventListener('click', () => ({ in: () => zoomBy(1.6), out: () => zoomBy(1 / 1.6), home: zoomHome })[b.dataset.zoom]()));

  // ---------- painting ----------
  const shown = {};
  function paintMap() {
    for (const p of PIDS) {
      const h = S.owner[p], f = fillOf(h);
      if (shown[p] !== f) { for (const u of provG[p].children) u.setAttribute('fill', f); shown[p] = f; }
    }
    // the stitched edge of your own land
    const mineNow = G.owned(S).join();
    if (mineG.dataset.k !== mineNow) {
      mineG.dataset.k = mineNow;
      mineG.replaceChildren();
      for (const p of G.owned(S)) for (const id of shapeIds[p]) el('use', { href: '#' + id }, mineG);
      paintCrests();
    }
    for (const [p, g] of Object.entries(provG)) g.classList.toggle('sel', p === sel);
  }
  // crests resist-dyed into each house's largest province: yours always, others once they hold two
  function paintCrests() {
    crestsG.replaceChildren();
    const n = G.counts(S);
    for (const c of Object.keys(n)) {
      const cr = CRESTS[c];
      if (!cr || (c !== S.clan && n[c] < 2)) continue;
      const own = PIDS.filter(p => S.owner[p] === c);
      if (!own.length) continue;
      const p = own.sort((a, b) => KOKU[b] - KOKU[a])[0], [x, y] = center(p), s = Math.min(26, 10 + Math.sqrt(KOKU[p]) * 1.4);
      el('image', { href: cr.src, x: x - s / 2, y: y - s / 2, width: s, height: s, class: 'crest', filter: resist(cr) }, crestsG);
    }
  }
  function paintLabels() {
    labelsG.replaceChildren();
    if (zoom < 1.9) return;
    const fs = 11 / zoom;
    for (const p of PIDS) {
      const t = el('text', { class: 'prov-label', x: P[p].cx, y: P[p].cy + fs * 1.6, 'font-size': fs, 'stroke-width': fs * .28, 'text-anchor': 'middle' }, labelsG);
      t.textContent = P[p].en;
    }
  }
  // a campaign: a red thread from your border, and your dye soaking across the province as the war goes on
  const fronts = new Map(); // campaign id -> {g, mask, circ, near, far, line}
  function frontFor(c) {
    if (fronts.has(c.id)) return fronts.get(c.id);
    const p = c.p, from = G.borders(S, p).sort((a, b) => Math.hypot(P[a].cx - P[p].cx, P[a].cy - P[p].cy) - Math.hypot(P[b].cx - P[p].cx, P[b].cy - P[p].cy))[0] || p;
    const src = center(from), dst = center(p);
    const id = 'front-' + c.id;
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 1200, height: 1200 }, defs);
    const grad = el('radialGradient', { id: id + 'g' }, defs);
    el('stop', { offset: '72%', 'stop-color': '#fff' }, grad);
    el('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }, grad);
    const circ = el('circle', { cx: src[0], cy: src[1], r: 0, fill: `url(#${id}g)`, filter: 'url(#wick)' }, mask);
    const g = el('g', { mask: `url(#${id})` }, soak);
    for (const s of shapeIds[p]) el('use', { href: '#' + s, fill: dyeOf(S.clan) }, g);
    const box = provG[p].getBBox();
    const far = Math.max(...[[box.x, box.y], [box.x + box.width, box.y], [box.x, box.y + box.height], [box.x + box.width, box.y + box.height]].map(([x, y]) => Math.hypot(x - src[0], y - src[1]))) * 1.3;
    const near = Math.max(0, Math.hypot(dst[0] - src[0], dst[1] - src[1]) - Math.max(box.width, box.height) * .7);
    const mx = (src[0] + dst[0]) / 2 + (dst[1] - src[1]) * .15, my = (src[1] + dst[1]) / 2 - (dst[0] - src[0]) * .15;
    const line = el('g', {}, threadsG);
    el('path', { class: 'thread', d: `M${src[0]} ${src[1]}Q${mx} ${my} ${dst[0]} ${dst[1]}` }, line);
    const k = 3.2;
    el('path', { class: 'thread-x', d: `M${dst[0] - k} ${dst[1] - k}L${dst[0] + k} ${dst[1] + k}M${dst[0] + k} ${dst[1] - k}L${dst[0] - k} ${dst[1] + k}` }, line);
    const f = { g, mask, grad, circ, near, far, line };
    fronts.set(c.id, f);
    return f;
  }
  function paintFronts() {
    const live = new Set(S.campaigns.map(c => c.id));
    for (const [id, f] of fronts) if (!live.has(id)) { f.g.remove(); f.mask.remove(); f.grad.remove(); f.line.remove(); fronts.delete(id); }
    for (const c of S.campaigns) {
      const f = frontFor(c), k = Math.min(1, c.prog / c.dur), e = 1 - (1 - k) ** 2;
      f.circ.setAttribute('r', f.near + (f.far - f.near) * e);
    }
    snowG.setAttribute('opacity', G.seasonOf(S) === 3 ? 1 : 0);
  }
  function resetMap() {
    for (const k of Object.keys(shown)) delete shown[k];
    for (const [id, f] of fronts) { f.g.remove(); f.mask.remove(); f.grad.remove(); f.line.remove(); fronts.delete(id); }
    mineG.dataset.k = '';
  }

  // ---------- header and resources ----------
  function paintTop() {
    const y = G.yearOf(S), era = G.eraOf(y), s = G.seasonOf(S);
    $('#year').textContent = y;
    $('#era').innerHTML = `${esc(era.en)} ${era.n} · <span lang="ja">${era.ja}${G.kanjiYear(era.n)}年</span>`;
    document.querySelectorAll('#seasons span').forEach((e, i) => { e.classList.toggle('now', i === s); e.style.setProperty('--p', i === s ? G.seasonProgress(S) : 0); });
    $('#seasons').title = SEASONS[s][0];
    const age = y - S.lord.born;
    const houseKey = S.clan + S.lord.name + age;
    if ($('#house').dataset.k !== houseKey) {
      $('#house').dataset.k = houseKey;
      $('#house').innerHTML = `${swatch(S.clan)}<span><b>${clanName(S.clan)}</b><small>${esc(S.lord.name)}, ${age}</small></span>`;
    }
    const m = G.mods(S), inc = G.income(S, m), cap = G.cap(S, m);
    $('#res').innerHTML = `
      <div><div class="k"><span lang="ja">米</span><span>Rice</span></div><div class="v">${fmt(S.koku)}</div><div class="r">+${fmt(inc.koku * G.YEAR)}/yr${s === 2 ? ' · harvest' : ''}</div></div>
      <div><div class="k"><span lang="ja">銭</span><span>Coin</span></div><div class="v">${fmt(S.kan)}</div><div class="r">+${fmt(inc.kan * G.YEAR)}/yr</div></div>
      <div><div class="k"><span lang="ja">兵</span><span>Troops</span></div><div class="v">${fmt(S.troops)}</div><div class="bar"><i style="width:${Math.min(100, S.troops / cap * 100)}%"></i></div></div>
      <div><div class="k"><span lang="ja">名</span><span>Fame</span></div><div class="v">${fmt(S.fame)}</div><div class="r">+${fmt(inc.fame * G.YEAR)}/yr</div></div>`;
    const warn = S.retainers.some(r => r.loy <= 25 && !(r.devoted > S.t));
    document.querySelector('#tabs [data-tab="retainers"]').innerHTML = `<span lang="ja">臣</span><span>Retainers</span>${warn ? '<i class="dot" aria-label="a retainer is uneasy"></i>' : ''}`;
  }

  // ---------- the panel ----------
  const time = sec => { sec = Math.max(0, Math.ceil(sec)); if (sec < 60) return sec + 's'; const m = Math.floor(sec / 60); if (m < 60) return m + 'm ' + String(sec % 60).padStart(2, '0') + 's'; const h = Math.floor(m / 60); return h + 'h ' + String(m % 60).padStart(2, '0') + 'm'; };
  const pips = (v, max = 10) => `<span class="pips" aria-label="${v} of ${max}">${'●'.repeat(Math.round(v / max * 5))}<i>${'●'.repeat(5 - Math.round(v / max * 5))}</i></span>`;
  const costHtml = c => [c.koku ? `<span class="cost${S.koku < c.koku ? ' short' : ''}">${fmt(c.koku)} rice</span>` : '', c.kan ? `<span class="cost${S.kan < c.kan ? ' short' : ''}">${fmt(c.kan)} coin</span>` : '', c.fame ? `<span class="cost${S.fame < c.fame ? ' short' : ''}">${fmt(c.fame)} fame</span>` : ''].filter(Boolean).join(' · ');
  const leaderName = l => l === 'lord' ? esc(S.lord.name) : esc(S.retainers.find(r => r.id === l)?.name || 'a captain');

  // the panel is rebuilt at most once a second (or at once after an action), never while a finger or button is down on it
  let renderedAt = 0, panelHold = false;
  $('#panel').addEventListener('pointerdown', () => { panelHold = true; });
  addEventListener('pointerup', () => setTimeout(() => { panelHold = false; }, 0));
  function render(force) {
    if (!force && (panelHold || performance.now() - renderedAt < 1000)) return;
    renderedAt = performance.now();
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const html = tab === 'realm' ? (sel ? provinceView(sel) : realmView()) : tab === 'reforms' ? reformsView() : tab === 'retainers' ? retainersView() : tab === 'tea' ? teaView() : houseView();
    const panel = $('#panel'), view = tab + ':' + (tab === 'realm' ? sel : '');
    if (panel.dataset.view !== view) { panel.dataset.view = view; panel.dataset.html = ''; panel.scrollTop = 0; }
    if (panel.dataset.html === html) return;
    if (panel.contains(document.activeElement) && document.activeElement.matches('input[type=range], select')) return; // don't pull a control out from under a finger
    const top = panel.scrollTop, focusKey = document.activeElement?.dataset?.key;
    panel.dataset.html = html;
    panel.innerHTML = html;
    panel.scrollTop = top;
    if (focusKey) panel.querySelector(`[data-key="${focusKey}"]`)?.focus();
  }

  function hintHtml() {
    const h = S.meta.hints || (S.meta.hints = {}), n = G.owned(S).length;
    const tips = [
      ['start', n === 1 && !S.campaigns.length, 'Rice comes in on its own, and part of it raises troops (the levy, below). <b>Tap a province on your border</b> to send an army. Undyed cotton is local lords: the easiest to take.'],
      ['settle', n >= 2 && !h.settle, 'New provinces are <b>unsettled</b> for a while: they yield less, and every unsettled province makes the next war need more men. Growing too fast costs you.'],
      ['supply', n >= 4, 'The larger your realm, the more rice each soldier costs (your supply lines). Spend rice on <b>reforms</b> too, and hire <b>retainers</b> to lead more campaigns at once.'],
      ['retire', n >= 8 && G.renown(S) >= 25, 'When the going slows, think about <b>retiring</b> (House tab): your heir starts again in 1467, and the renown you earned buys house codes that make every later run faster.'],
    ].find(([k, cond]) => cond && !h[k]);
    return tips ? `<div class="card hint"><p class="prose">${tips[2]}</p><div class="btns"><button class="btn" data-act="hint" data-id="${tips[0]}">Got it</button></div></div>` : '';
  }

  function realmView() {
    const m = G.mods(S), cap = G.cap(S, m), cost = G.soldierCost(S, m), inc = G.income(S, m), un = G.unsettled(S);
    const camps = S.campaigns.map(c => {
      const pr = P[c.p], left = (c.dur - c.prog) / (G.seasonOf(S) === 1 ? 1.25 : 1), snowed = G.seasonOf(S) === 3 && SNOW.includes(c.p) && !m.snowproof;
      return `<div><div class="row"><span>${provName(c.p)}</span><span class="small num">${snowed ? 'snowed in' : time(left)}</span></div>
        <div class="thread-bar war"><i style="width:${Math.min(100, c.prog / c.dur * 100)}%"></i></div>
        <p class="small">${fmt(c.troops)} men under ${leaderName(c.leader)}</p></div>`;
    }).join('');
    const buffs = S.buffs.filter(b => b.until > S.t && b.until - S.t < 5000 * G.YEAR);
    const news = S.log.slice(-10).reverse().map(l => `<li class="${l.kind}"><span class="y">${1467 + Math.floor(l.t / G.YEAR)}</span><span>${esc(l.text)}</span></li>`).join('');
    return `${hintHtml()}
      <div class="card"><h3>Campaigns <span lang="ja">合戦</span></h3>${camps || '<p class="sub">No armies in the field. Tap a province on your border to march on it.</p>'}
        ${S.meta.codes.strategist ? `<div class="row"><span class="sub">The strategist ${S.auto ? 'picks targets on his own' : 'waits for your orders'}</span><button class="btn" data-act="auto">${S.auto ? 'Hold him back' : 'Let him plan'}</button></div>` : ''}</div>
      <div class="card"><h3>The army <span lang="ja">軍勢</span></h3>
        <div class="stats"><div><b>${fmt(S.troops)}</b><span>of ${fmt(cap)} men</span></div><div><b>${fmt(cost)}</b><span>rice a soldier</span></div><div><b>${fmt(inc.koku * S.levy * G.YEAR / cost)}</b><span>raised a year</span></div></div>
        <label class="field">Levy: ${Math.round(S.levy * 100)}% of the rice raises troops
          <input type="range" min="0" max="100" step="5" value="${Math.round(S.levy * 100)}" data-act="levy" aria-label="Levy"></label>
        <div class="btns"><button class="btn" data-act="recruit" data-f=".25" ${S.koku < cost || S.troops >= cap ? 'disabled' : ''}>Raise with ¼ of the granary</button><button class="btn" data-act="recruit" data-f="1" ${S.koku < cost || S.troops >= cap ? 'disabled' : ''}>Raise all you can</button></div></div>
      ${un > .05 ? `<div class="card"><h3>Unsettled land <span lang="ja">一揆の恐れ</span></h3><p class="sub">New wars need <b>${Math.round((G.overreach(S) - 1) * 100)}%</b> more men until these settle (about ${G.settleYears(S, m).toFixed(1)} years each):</p>
        <p class="small">${Object.entries(S.settle).filter(([p]) => G.mine(S, p)).map(([p, v]) => `${esc(P[p].en)} ${Math.round(v * 100)}%`).join(' · ')}</p></div>` : ''}
      ${buffs.length ? `<div class="card"><h3>For now <span lang="ja">時勢</span></h3>${buffs.map(b => `<div class="row"><span class="sub">${esc(b.en)}</span><span class="small">${Math.ceil((b.until - S.t) / G.YEAR)} yr</span></div>`).join('')}</div>` : ''}
      <div class="card"><h3>News <span lang="ja">風聞</span></h3><ul class="log">${news || '<li>Quiet, for now.</li>'}</ul></div>`;
  }

  function provinceView(p) {
    const pr = P[p], h = S.owner[p], m = G.mods(S);
    const head = `<button class="back" data-act="unsel"><svg viewBox="0 0 8 10" aria-hidden="true"><path d="M8 0v10L0 5z"/></svg>The realm</button>
      <div class="card"><div class="row"><h3>${provName(p)}</h3><span class="sub num">${KOKU[p]}万石</span></div>
        <div class="chip sub">${swatch(h)}${h === S.clan ? 'Yours' : clanName(h)}</div>
        ${SPECIAL[p] ? `<p class="small">${esc(SPECIAL[p].en)} <span lang="ja">${SPECIAL[p].ja}</span>: ${G.yearOf(S) >= SPECIAL[p].from ? `${fmt(SPECIAL[p].kan * (SPECIAL[p].port ? 1 + m.portCoin : 1))} coin a year` : `opens in ${SPECIAL[p].from}`}${SPECIAL[p].port ? ' (a port)' : ''}</p>` : ''}
        ${SNOW.includes(p) ? '<p class="small">Snow country: no army moves here in winter.</p>' : ''}</div>`;
    const camp = S.campaigns.find(c => c.p === p);
    if (camp) return head + `<div class="card"><h3>Under attack</h3><div class="thread-bar war"><i style="width:${camp.prog / camp.dur * 100}%"></i></div><p class="sub">${fmt(camp.troops)} men under ${leaderName(camp.leader)} · ${time(camp.dur - camp.prog)} left</p></div>`;
    if (h === S.clan) {
      const lvl = S.castle[p] || 0, gov = S.retainers.find(r => r.role?.gov === p), cc = G.castleCost(S, p);
      const free = S.retainers.filter(r => !r.role || r.role.gov === p);
      return head + `<div class="card"><div class="stats"><div><b>${fmt(G.provinceRice(S, p, m) * (1 + m.yield))}</b><span>rice a year</span></div><div><b>${Math.round((S.settle[p] ?? 1) * 100)}%</b><span>settled</span></div><div><b>${['None', 'Fort', 'Castle', 'Great castle'][lvl]}</b><span>castle</span></div></div></div>
        <div class="card"><h3>Castle <span lang="ja">城</span></h3><p class="sub">Each level: rice +${Math.round(12 * (1 + m.castle))}% here, and room for ${Math.round(20 * (1 + m.castle))}% more of its men.</p>
          ${lvl < 3 ? `<div class="row"><span>${costHtml({ koku: cc })}</span><button class="btn go" data-act="castle" data-p="${p}" ${S.koku < cc ? 'disabled' : ''}>Build ${['a fort', 'a castle', 'a great castle'][lvl]}</button></div>` : '<p class="small">A great castle stands here.</p>'}</div>
        <div class="card"><h3>Governor <span lang="ja">城代</span></h3><p class="sub">A governor adds 4% rice for each point of rule.${KOKU[p] > 50 ? ' A province this rich tempts ambition.' : ''}</p>
          <label class="field">Who governs
            <select data-act="gov" data-p="${p}"><option value="">Nobody</option>${free.map(r => `<option value="${r.id}" ${gov?.id === r.id ? 'selected' : ''}>${esc(r.name)} · rule ${r.rule} · loyalty ${Math.round(r.loy)}</option>`).join('')}</select></label></div>`;
    }
    const why = G.targetable(S, p);
    const hs = G.holders(h), rivals = hs.map(c => {
      const n = G.counts(S)[c] || 0, ally = S.allies[c] != null, ac = G.allyCost(S, c), vw = G.canVassal(S, c);
      return `<div class="card"><div class="row"><span class="chip">${swatch(c)}<b>${clanName(c)}</b></span><span class="small">${n} province${n === 1 ? '' : 's'}</span></div>
        <p class="small">Strength ×${G.rivalFactor(S, c).toFixed(2)}${info(c).rebel ? ' · rebels' : ''}${ally ? ' · your ally' : ''}</p>
        ${ally ? `<div class="row"><span class="small">${vw ? 'To make them vassals: ' + vw : `Vassals for ${G.vassalCost(S, c)} fame`}</span><button class="btn go" data-act="vassal" data-c="${c}" ${vw ? 'disabled' : ''}>Make vassals</button></div>
          <button class="btn" data-act="unally" data-c="${c}">Break the alliance</button>`
        : `<div class="row"><span>${costHtml(ac)}</span><button class="btn" data-act="ally" data-c="${c}" ${S.kan < ac.kan || S.fame < ac.fame ? 'disabled' : ''}>Marriage alliance</button></div>
          <p class="small">Allies pay tribute in coin. After three years, if you're twice their size, they can be made vassals: all their land joins you without a war.</p>`}</div>`;
    }).join('');
    if (why) return head + `<div class="card"><p class="sub">You can't march here: ${esc(why)}.</p><p class="small">Defended by about ${fmt(G.defense(S, p))} men.</p></div>` + rivals;
    const leaders = G.freeLeaders(S);
    const leader = leaders.includes(ui.leader) ? ui.leader : leaders.slice().sort((a, b) => leaderWarOf(b) - leaderWarOf(a))[0];
    const base = G.plan(S, p, 0, leader || 'lord', m);
    const troops = Math.floor(Math.min(S.troops, Math.max(base.need, ui.troops?.p === p ? ui.troops.n : Math.ceil(base.need * 1.2))));
    const pl = G.plan(S, p, troops, leader || 'lord', m);
    const enough = S.troops >= base.need;
    return head + `<div class="card"><h3>March <span lang="ja">出陣</span></h3>
        <div class="stats"><div><b>${fmt(base.need)}</b><span>men needed</span></div><div><b>${enough ? time(pl.dur) : '—'}</b><span>to take it</span></div><div><b>${enough ? fmt(pl.loss) : '—'}</b><span>men lost</span></div></div>
        ${pl.sea ? '<p class="small">Only by sea from your land: 30% more men and time (a fleet would fix that).</p>' : ''}
        ${G.overreach(S) > 1.05 ? `<p class="small">Unsettled land adds ${Math.round((G.overreach(S) - 1) * 100)}% to the men needed.</p>` : ''}
        ${pl.snow && G.seasonOf(S) === 3 ? '<p class="small">It is winter: an army sent now waits for the thaw.</p>' : ''}
        ${leaders.length ? `<label class="field">Led by
          <select data-act="leader">${leaders.map(l => `<option value="${l}" ${l === leader ? 'selected' : ''}>${leaderName(l)} · war ${leaderWarOf(l)}</option>`).join('')}</select></label>` : '<p class="why">Every leader is already in the field. Hire a retainer, or free one from governing.</p>'}
        ${enough ? `<label class="field">Send ${fmt(troops)} men (more men, a faster war)
          <input type="range" min="${base.need}" max="${Math.floor(S.troops)}" step="${Math.max(1, Math.round((S.troops - base.need) / 40))}" value="${troops}" data-act="troops" data-p="${p}" aria-label="Men to send"></label>`
          : `<p class="why">You have ${fmt(S.troops)} men: ${fmt(base.need - S.troops)} short. Raise more on the Realm page, or wait for the levy.</p>`}
        <button class="btn war wide" data-act="march" data-p="${p}" data-n="${troops}" ${!enough || !leaders.length ? 'disabled' : ''}>March on ${esc(pr.en)}</button></div>` + rivals;
  }
  const leaderWarOf = l => l === 'lord' ? S.lord.war : (S.retainers.find(r => r.id === l)?.war || 0);

  function reformsView() {
    const items = POLICIES.map(p => {
      const lvl = S.policies[p.id] || 0, lock = G.policyLocked(S, p), c = G.policyCost(S, p), done = lvl >= p.max;
      return `<div class="card"${lock ? ' style="opacity:.62"' : ''}><div class="row"><h3>${esc(p.en)} <span lang="ja">${p.ja}</span></h3>${p.max > 1 ? `<span class="small">${lvl}/${p.max}</span>` : ''}</div>
        <p class="sub">${esc(p.text)}</p>
        ${done ? '<p class="small">Done.</p>' : lock ? `<p class="why">Opens ${esc(lock)}.</p>` : `<div class="row"><span>${costHtml(c)}</span><button class="btn go" data-act="policy" data-id="${p.id}" ${S.koku < c.koku || S.kan < c.kan ? 'disabled' : ''}>${lvl ? 'Improve' : 'Order it'}</button></div>`}</div>`;
    }).join('');
    const mine = G.owned(S).sort((a, b) => KOKU[b] - KOKU[a]), show = ui.showAllCastles ? mine : mine.slice(0, 6);
    const castles = show.map(p => {
      const lvl = S.castle[p] || 0, cc = G.castleCost(S, p);
      return `<div class="row"><span>${provName(p)} <span class="small">${['', 'fort', 'castle', 'great castle'][lvl]}</span></span>${lvl < 3 ? `<button class="btn" data-act="castle" data-p="${p}" ${S.koku < cc ? 'disabled' : ''}>${fmt(cc)} rice</button>` : '<span class="small">done</span>'}</div>`;
    }).join('');
    return `<h4>Reforms <span lang="ja">改革</span></h4>${items}
      <h4>Castles <span lang="ja">城普請</span></h4><div class="card">${castles}${mine.length > 6 ? `<button class="btn" data-act="allcastles">${ui.showAllCastles ? 'Fewer' : `All ${mine.length} provinces`}</button>` : ''}</div>`;
  }

  function retainersView() {
    const y = G.yearOf(S), busy = new Set(S.campaigns.map(c => c.leader));
    const card = r => {
      const dev = r.devoted > S.t, low = r.loy <= 25 && !dev;
      const role = busy.has(r.id) ? `Leading the war on ${esc(P[S.campaigns.find(c => c.leader === r.id).p].en)}` : r.role?.gov ? `Governor of ${esc(P[r.role.gov].en)}` : 'Free to lead a campaign';
      const gc = G.riceGiftCost(S, r);
      return `<div class="card${low ? ' warn' : ''}"><div class="row"><h3>${esc(r.name)}</h3><span class="small">${y - r.born}</span></div>
        <div class="stats"><div>${pips(r.war)}<span>war ${r.war}</span></div><div>${pips(r.rule)}<span>rule ${r.rule}</span></div><div>${pips(r.amb, 5)}<span>ambition ${r.amb}</span></div></div>
        <div><div class="row"><span class="small">Loyalty ${Math.round(r.loy)}${dev ? ' · sworn to you' : low ? ' · uneasy' : ''}</span></div><div class="thread-bar${low ? ' low' : ''}"><i style="width:${r.loy}%"></i></div></div>
        <p class="sub">${role}</p>
        ${low ? `<p class="small" style="color:#ffb29e">At zero he rebels: ${r.role?.gov ? `he will take ${esc(P[r.role.gov].en)} for himself` : busy.has(r.id) ? 'he will desert with his army' : 'he will leave'}.</p>` : ''}
        <div class="btns">${r.role?.gov ? `<button class="btn" data-act="free" data-id="${r.id}">Recall him</button>` : ''}
          <button class="btn" data-act="gift" data-id="${r.id}" ${S.koku < gc || dev ? 'disabled' : ''}>Gift rice <small>${fmt(gc)}</small></button>
          ${S.held.length && !dev ? `<button class="btn" data-act="giveTea" data-id="${r.id}">Give a tea utensil</button>` : ''}</div></div>`;
    };
    const pool = S.pool.map((r, i) => {
      const c = G.hireCost(S, r);
      return `<div class="card"><div class="row"><h3>${esc(r.name)}</h3><span class="small">${y - r.born}</span></div>
        <div class="stats"><div>${pips(r.war)}<span>war ${r.war}</span></div><div>${pips(r.rule)}<span>rule ${r.rule}</span></div><div>${pips(r.amb, 5)}<span>ambition ${r.amb}</span></div></div>
        <div class="row"><span>${costHtml({ kan: c })}</span><button class="btn go" data-act="hire" data-i="${i}" ${S.kan < c ? 'disabled' : ''}>Take him on</button></div></div>`;
    }).join('');
    return `<div class="card"><div class="row"><h3>${esc(S.lord.name)}</h3><span class="small">${y - S.lord.born}</span></div><p class="sub">The head of the house. Leads one campaign himself · war ${S.lord.war}.</p></div>
      <h4>Retainers <span lang="ja">家臣</span></h4>
      <p class="small">Each free retainer can lead a campaign; governors raise a province's rice. Loyalty slips with the years, faster for the ambitious. Gifts, victories and tea gatherings win it back.</p>
      ${S.retainers.map(card).join('') || '<p class="sub">Nobody serves you yet.</p>'}
      <h4>Seeking a lord <span lang="ja">浪人</span></h4><p class="small">New faces arrive each year.</p>${pool || '<p class="sub">Nobody this year.</p>'}`;
  }

  function teaView() {
    const why = G.teaReady(S), tc = G.teaCost(S);
    const item = (x, owned) => owned ? `<div class="item${x.tier === 3 ? ' tier3' : ''}"><span class="tier">${['', 'Fine', 'Famed', 'Legendary'][x.tier]} ${esc(x.kind)}</span><b>${esc(x.en)}</b><span class="ja">${x.ja}</span><p class="small">${modText(x.mods)}</p></div>` : `<div class="item unknown" title="Not yet found">?</div>`;
    const held = S.held.map(id => MEIBUTSU.find(x => x.id === id));
    const offer = S.merchant && MEIBUTSU.find(x => x.id === S.merchant.id);
    return `<div class="card"><h3>Tea gathering <span lang="ja">茶会</span></h3><p class="sub">Show a famous utensil to your retainers: all of them gain loyalty, and you gain fame. Once a year.</p>
        <div class="row"><span>${costHtml({ kan: tc })}</span><button class="btn go" data-act="tea" ${why ? 'disabled' : ''}>Hold one</button></div>${why ? `<p class="why">${esc(why)}</p>` : ''}</div>
      <div class="card"><h3>In your storehouse <span lang="ja">蔵</span></h3>${held.length ? `<div class="grid">${held.map(x => item(x, true)).join('')}</div><p class="small">Give one to a retainer (Retainers page) and he is sworn to you for 15 years. The gift stays in your collection.</p>` : '<p class="sub">Nothing yet. Famous utensils turn up in conquered provinces, and at Sakai.</p>'}</div>
      <div class="card"><h3>The Sakai merchants <span lang="ja">堺の商人</span></h3>${G.sakaiOpen(S) ? (offer ? `<p class="sub">This year they offer <b>${esc(offer.en)}</b> <span lang="ja">${offer.ja}</span>, a ${esc(offer.kind)}.</p><div class="row"><span>${costHtml({ kan: S.merchant.kan })}</span><button class="btn go" data-act="buyTea" ${S.kan < S.merchant.kan ? 'disabled' : ''}>Buy it</button></div>` : '<p class="sub">Nothing to sell this year.</p>') : '<p class="sub">Hold Izumi, where Sakai is, or ally with its lord, and the merchants will deal with you.</p>'}</div>
      <h4>The house collection <span lang="ja">名物</span></h4><p class="small">Every utensil ever found stays here, run after run, with its bonus always on. ${S.meta.collection.length} of ${MEIBUTSU.length}.</p>
      <div class="grid">${MEIBUTSU.map(x => item(x, S.meta.collection.includes(x.id))).join('')}</div>`;
  }
  const MOD_TEXT = { yield: 'rice', coin: 'coin', fame: 'fame', cap: 'troop limit', speed: 'campaign speed', power: 'fighting strength', loss: 'men lost', recruitCost: 'soldier cost', loyaltyDecay: 'loyalty lost', unrest: 'settling speed', tea: 'tea gatherings', find: 'finds' };
  const modText = m => Object.entries(m).map(([k, v]) => `${MOD_TEXT[k] || k} ${v > 0 ? '+' : '−'}${Math.round(Math.abs(v) * 100)}%`).join(', ');

  function houseView() {
    const meta = S.meta, n = G.counts(S), k = G.owned(S).reduce((s, p) => s + KOKU[p], 0), r = G.renown(S), st = G.start(S.clan);
    const rivals = Object.keys(n).filter(c => c !== S.clan).sort((a, b) => n[b] - n[a]).slice(0, 12).map(c => `<button class="row" data-act="clanP" data-c="${c}" style="width:100%;padding:5px 0;border-bottom:1px solid var(--line)"><span class="chip">${swatch(c)}${clanName(c)}${S.allies[c] != null ? ' <span class="small">ally</span>' : ''}</span><span class="small">${n[c]} · ×${G.rivalFactor(S, c).toFixed(2)}</span></button>`).join('');
    const codes = CODES.map(c => {
      const lvl = meta.codes[c.id] || 0, cost = G.codeCost(meta, c);
      return `<div class="row" style="align-items:flex-start"><span><b>${esc(c.en)}</b> <span lang="ja" class="small">${c.ja}</span><br><span class="small">${esc(c.text)}${c.max > 1 ? ` · ${lvl}/${c.max}` : lvl ? ' · yours' : ''}</span></span>${lvl < c.max ? `<button class="btn" data-act="code" data-id="${c.id}" ${meta.renown < cost ? 'disabled' : ''}>${cost} renown</button>` : ''}</div>`;
    }).join('');
    return `<div class="card"><div class="row"><span class="chip">${swatch(S.clan)}<h3>${clanName(S.clan)}</h3></span></div>
        <p class="sub"><b>${esc(st.trait)}</b> <span lang="ja">${st.traitJa}</span>: ${esc(st.text)}</p>
        <div class="stats"><div><b>${G.owned(S).length}/68</b><span>provinces</span></div><div><b>${Math.round(k)}万</b><span>koku</span></div><div><b>${fmt(S.fameTotal)}</b><span>fame earned</span></div></div></div>
      <div class="card"><h3>Retire <span lang="ja">隠居</span></h3>
        <p class="sub">Hand the house to an heir who starts again in 1467. You keep your renown, house codes and tea collection.${S.unified ? ' The realm is united: renown is doubled.' : ''}</p>
        <div class="row"><span>Renown if you retire now: <b class="big">${r}</b></span><button class="btn go" data-act="retire" ${r < 1 ? 'disabled' : ''}>Retire…</button></div>
        <p class="small">Renown grows with the rice you hold and the fame you earned this run.</p></div>
      <div class="card"><div class="row"><h3>House codes <span lang="ja">家訓</span></h3><span class="sub">${meta.renown} renown</span></div>${codes}</div>
      <div class="card"><h3>The great houses <span lang="ja">諸大名</span></h3><p class="small">Size · strength. Strength grows with land and with the years.</p>${rivals}</div>
      <div class="card"><h3>How to play <span lang="ja">心得</span></h3><div class="prose">
        <p><b>Rice</b> 米 comes in from your provinces all the time, most of it at the autumn harvest. The <b>levy</b> turns part of it into troops on its own; the rest fills the granary for reforms and castles.</p>
        <p><b>Tap a province</b> on your border to march on it. Each campaign needs a leader: you, or a free retainer. More men end a war faster. In winter the snow country is closed.</p>
        <p>New land is <b>unsettled</b> and makes every war cost more until it calms down. And the larger the realm, the more rice each soldier costs. Rivals grow stronger with the years, so don't wait forever.</p>
        <p><b>Retainers</b> govern and lead, but watch their loyalty: at zero a governor seizes his province (<i>gekokujō</i>). <b>Allies</b> pay tribute and can later be made vassals without a war.</p>
        <p>History runs underneath: guns arrive in 1543, the Jesuits in 1549, and each event opens new choices. Time keeps passing while you're away (up to ${12 * (1 + G.mods(S).offlineCap) + G.mods(S).offlineHours} hours).</p>
        <p>Unite all 68 provinces to become <b>Tenka-bito</b>, master of the realm. Or retire earlier, and come back stronger.</p></div></div>
      <div class="card"><h3>The game <span lang="ja">記録</span></h3>
        <p class="small">Runs retired: ${meta.runs} · best: ${meta.best} provinces · renown earned in all: ${meta.renownTotal}</p>
        <div class="btns"><button class="btn" data-act="export">Copy save</button><button class="btn" data-act="import">Load a save</button><button class="btn" data-act="wipe">Start over…</button></div>
        <details><summary>Credits</summary><p class="small">Province shapes: “Provinces of Japan with names.svg” by Ash_Crow, Wikimedia Commons, CC BY 2.5. Clan crests from Wikimedia Commons (each under its own licence: ${Object.values(CRESTS).map(c => `<a href="${c.page}" style="color:inherit">${esc(c.artist || c.file)}</a>`).slice(0, 6).join(', ')} and others). Fonts: Shippori Mincho B1 and Zen Kaku Gothic New, SIL Open Font License. Province yields follow the Keichō land survey, rounded; history written for this game, simplified.</p></details></div>`;
  }

  // ---------- modals ----------
  let modalOpen = false, pendingAway = null;
  function showModal(html, onClick) {
    modalOpen = true;
    const m = $('#modal');
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    m.onclick = e => { const b = e.target.closest('[data-m]'); if (b) onClick(b.dataset.m, b); };
    m.querySelector('button')?.focus();
  }
  function closeModal() { modalOpen = false; $('#modal').hidden = true; $('#modal').innerHTML = ''; nextModal(); }
  function nextModal() {
    if (modalOpen || !S) return;
    if (pendingAway) { const r = pendingAway; pendingAway = null; return showAway(r); }
    if (!S.queue.length) return;
    const q = S.queue.shift();
    if (q.type === 'event') {
      const e = EVENTS.find(x => x.id === q.id);
      showModal(`<p class="kicker">${e.year}</p><h2>${esc(e.en)}<span lang="ja">${e.ja}</span></h2><p class="text">${esc(e.text)}</p>
        ${e.choices ? e.choices.map((c, i) => `<button class="choice" data-m="${i}"><b>${esc(c.en)}</b><span>${esc(c.note)}</span></button>`).join('') : '<button class="btn go wide" data-m="ok">Go on</button>'}`, v => {
        if (e.choices) e.choices[+v].fx(S, G);
        save(); closeModal(); refresh();
      });
    } else {
      const html = {
        gekokujo: () => `<p class="kicker">Gekokujō <span lang="ja">下剋上</span></p><h2>${esc(q.name)} rebels</h2><p class="text">Your governor has turned on you and holds ${esc(P[q.p].en)} as his own. You'll have to take it back.</p>`,
        desert: () => `<p class="kicker">Betrayal</p><h2>${esc(q.name)} deserts</h2><p class="text">On the road to ${esc(P[q.p].en)} he turned his army around and went over to the enemy with ${fmt(q.troops)} men.</p>`,
        succession: () => `<p class="kicker">Succession <span lang="ja">家督相続</span></p><h2>${esc(q.old)} is dead</h2><p class="text">He died at ${q.age}. ${esc(q.name)} now leads the house. The retainers are wary of a new lord.</p>`,
        meibutsu: () => { const x = MEIBUTSU.find(y => y.id === q.id); return `<p class="kicker">A famous utensil <span lang="ja">名物</span></p><h2>${esc(x.en)}<span lang="ja">${x.ja}</span></h2><p class="text">${esc(x.text)}</p><p class="sub">${q.where ? `Found ${esc(q.where)}. ` : ''}${q.fresh ? `New to your collection: ${modText(x.mods)}, in this run and every one after.` : 'Already in your collection, but yours to give or show this run.'}</p>`; },
        unified: () => `<p class="kicker">${G.yearOf(S)}</p><h2>Tenka-bito<span lang="ja">天下人</span></h2><p class="text">All sixty-eight provinces answer to the ${esc(info(S.clan).en)}. The realm is one. Retire now and your renown is doubled; or stay, and rule.</p>`,
      }[q.type];
      if (!html) return nextModal();
      showModal(html() + '<button class="btn go wide" data-m="ok">Go on</button>', () => { closeModal(); refresh(); });
    }
  }
  function pickClan(meta, title, onPick) {
    const list = STARTS.map(s => {
      const open = meta.unlocked.includes(s.clan);
      return `<button data-m="${s.clan}" ${!open && meta.renown < s.cost ? 'disabled' : ''}>${swatch(s.clan)}<span><b>${esc(CLANS[s.clan].en)} <span lang="ja">${CLANS[s.clan].ja}</span></b><br><span class="small">${esc(P[s.home].en)}, ${KOKU[s.home]}万石 · ${esc(s.trait)}</span><br><span class="sub">${esc(s.text)}</span>${open ? '' : `<br><span class="cost">Unlock for ${s.cost} renown</span>`}</span></button>`;
    }).join('');
    showModal(`${title}<div class="clan-pick">${list}</div>`, c => {
      if (STARTS.some(x => x.clan === c) && !meta.unlocked.includes(c) && G.unlockClan(meta, c)) return;
      onPick(c);
    });
  }
  function welcome() {
    pickClan(G.newMeta(), `<p class="kicker">1467 · Ōnin 1</p><h2>Tenka<span lang="ja">天下</span></h2><p class="text">The Ōnin War has broken the shogun's peace. Choose a house, take its home province, and see how much of the realm it can win.</p>`, c => {
      S = G.newRun(G.newMeta(), c);
      resetMap(); save(); modalOpen = false; $('#modal').hidden = true; last = Date.now(); refresh(); focusRealm(); nextModal();
    });
  }
  function awayReport(r) { if (r.seconds >= 120) { pendingAway = r; nextModal(); } }
  function showAway(r) {
    const news = r.news.slice(-8).map(l => `<li class="${l.kind}"><span class="y">${1467 + Math.floor(l.t / G.YEAR)}</span><span>${esc(l.text)}</span></li>`).join('');
    showModal(`<p class="kicker">While you were away <span lang="ja">留守中</span></p><h2>${time(r.seconds)}</h2>
      <p class="sub">${r.from === r.to ? `Still ${r.to}.` : `${r.from} → ${r.to}.`}${r.capped ? ` Your steward kept count for only ${r.capH} hours.` : ''}</p>
      <div class="stats"><div><b>+${fmt(r.koku)}</b><span>rice</span></div><div><b>+${fmt(r.kan)}</b><span>coin</span></div><div><b>${r.troops >= 0 ? '+' : ''}${fmt(r.troops)}</b><span>troops</span></div><div><b>${r.prov >= 0 ? '+' : ''}${r.prov}</b><span>provinces</span></div></div>
      ${news ? `<ul class="log">${news}</ul>` : ''}<button class="btn go wide" data-m="ok">Back to it</button>`, () => { closeModal(); refresh(); });
  }

  // ---------- actions ----------
  function toast(text, kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.textContent = text;
    $('#toasts').append(t);
    setTimeout(() => t.remove(), 5200);
    while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
  }
  function select(p) {
    sel = p;
    if (p) { tab = 'realm'; ui.troops = null; document.body.classList.remove('folded'); }
    paintMap(); render();
  }
  const ACT = {
    unsel: () => select(null),
    hint: b => { S.meta.hints[b.dataset.id] = 1; },
    auto: () => { S.auto = !S.auto; },
    recruit: b => { const n = G.recruit(S, S.koku * +b.dataset.f / G.soldierCost(S)); if (n) toast(`${fmt(n)} men raised.`); },
    castle: b => { if (!G.buildCastle(S, b.dataset.p)) toast(`Work begins in ${P[b.dataset.p].en}.`); },
    march: b => {
      const p = b.dataset.p, leader = G.freeLeaders(S).includes(ui.leader) ? ui.leader : G.freeLeaders(S).sort((a, c) => leaderWarOf(c) - leaderWarOf(a))[0];
      const why = G.march(S, p, +b.dataset.n, leader);
      if (why) return toast(why, 'warn');
      toast(`The army marches on ${P[p].en}.`, 'win');
      sel = null; ui.troops = null;
    },
    ally: b => { const why = G.ally(S, b.dataset.c); toast(why || `Allied with the ${info(b.dataset.c).en}.`, why ? 'warn' : 'win'); },
    unally: b => G.breakAlliance(S, b.dataset.c),
    vassal: b => { const why = G.vassalize(S, b.dataset.c); if (why) toast(why, 'warn'); },
    policy: b => { if (!G.buyPolicy(S, b.dataset.id)) toast(`${POLICIES.find(x => x.id === b.dataset.id).en}: ordered.`); },
    allcastles: () => { ui.showAllCastles = !ui.showAllCastles; },
    free: b => G.assign(S, +b.dataset.id, null),
    gift: b => G.giftRice(S, +b.dataset.id),
    giveTea: b => {
      const r = S.retainers.find(x => x.id === +b.dataset.id);
      showModal(`<p class="kicker">A gift for ${esc(r.name)}</p><h2>Which utensil?</h2>${S.held.map(id => { const x = MEIBUTSU.find(y => y.id === id); return `<button class="choice" data-m="${id}"><b>${esc(x.en)} <span lang="ja">${x.ja}</span></b><span>${esc(x.kind)} · stays in your collection</span></button>`; }).join('')}<button class="btn wide" data-m="">Not now</button>`,
        id => { if (id) G.giftMeibutsu(S, r.id, id); closeModal(); refresh(); });
    },
    hire: b => { const r = S.pool[+b.dataset.i], why = G.hire(S, +b.dataset.i); if (!why) toast(`${r.name} enters your service.`, 'win'); },
    tea: () => { if (!G.tea(S)) toast('A tea gathering: your retainers leave honoured.', 'win'); },
    buyTea: () => G.buyMerchant(S),
    code: b => G.buyCode(S.meta, b.dataset.id),
    clanP: b => { const p = PIDS.filter(x => G.holders(S.owner[x]).includes(b.dataset.c)).sort((a, c) => KOKU[c] - KOKU[a])[0]; if (p) select(p); },
    retire: () => {
      // the picker spends from the renown you'd have after retiring; whatever it spends on unlocks comes off afterwards
      const r = G.renown(S), meta = S.meta, before = meta.renown + r, ghost = { ...meta, renown: before, unlocked: [...meta.unlocked] };
      pickClan(ghost, `<p class="kicker">Retire <span lang="ja">隠居</span></p><h2>+${r} renown</h2><p class="sub">Choose the house your heir will lead from 1467. Locked houses can be unlocked with renown.</p><button class="btn wide" data-m="cancel">Not yet</button>`, c => {
        if (c === 'cancel') return closeModal();
        meta.unlocked = ghost.unlocked;
        S = G.retire(S, c);
        S.meta.renown -= before - ghost.renown;
        resetMap(); sel = null; tab = 'realm'; save(); modalOpen = false; $('#modal').hidden = true; refresh(); focusRealm(); nextModal();
      });
    },
    export: async () => {
      const txt = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      try { await navigator.clipboard.writeText(txt); toast('Save copied to the clipboard.'); } catch { showModal(`<h2>Your save</h2><textarea readonly style="width:100%;height:140px;background:var(--kachi);color:var(--cream)">${txt}</textarea><button class="btn wide" data-m="ok">Done</button>`, closeModal); }
    },
    import: () => {
      showModal(`<h2>Load a save</h2><p class="sub">Paste a save copied from this game. It replaces the current one.</p><textarea id="imp" style="width:100%;height:140px;background:var(--kachi);color:var(--cream)"></textarea><div class="btns"><button class="btn go" data-m="load">Load</button><button class="btn" data-m="no">Cancel</button></div>`, v => {
        if (v === 'load') {
          try {
            const s = JSON.parse(decodeURIComponent(escape(atob($('#imp').value.trim()))));
            if (!s || s.v !== 1 || !s.owner || !s.meta) throw 0;
            S = s; resetMap(); save(); sel = null;
          } catch { toast('That save could not be read.', 'warn'); }
        }
        closeModal(); refresh();
      });
    },
    wipe: () => showModal('<h2>Start over?</h2><p class="sub">This erases everything: this run, your renown, house codes and the tea collection.</p><div class="btns"><button class="btn war" data-m="yes">Erase it all</button><button class="btn" data-m="no">Keep playing</button></div>', v => {
      if (v === 'yes') { try { localStorage.removeItem(KEY); } catch { /* ignore */ } S = null; resetMap(); modalOpen = false; $('#modal').hidden = true; welcome(); return; }
      closeModal();
    }),
  };
  $('#panel').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled || b.tagName === 'SELECT' || b.type === 'range') return;
    ACT[b.dataset.act]?.(b);
    save(); refresh(true);
  });
  $('#panel').addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.act === 'levy') { S.levy = +t.value / 100; t.parentElement.firstChild.textContent = `Levy: ${t.value}% of the rice raises troops`; }
    if (t.dataset.act === 'troops') { ui.troops = { p: t.dataset.p, n: +t.value }; t.parentElement.firstChild.textContent = `Send ${fmt(+t.value)} men (more men, a faster war)`; const btn = $('#panel [data-act="march"]'); if (btn) btn.dataset.n = t.value; }
  });
  $('#panel').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.act === 'gov') { const cur = S.retainers.find(r => r.role?.gov === t.dataset.p); if (cur) G.assign(S, cur.id, null); if (t.value) G.assign(S, +t.value, { gov: t.dataset.p }); }
    if (t.dataset.act === 'leader') ui.leader = t.value === 'lord' ? 'lord' : +t.value;
    t.blur(); save(); refresh();
  });
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tab;
    if (t === tab && b.closest('#tabs') && matchMedia('(max-width: 860px)').matches) document.body.classList.toggle('folded');
    else document.body.classList.remove('folded');
    tab = t; if (t !== 'realm') sel = null;
    paintMap(); refresh();
  }));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (modalOpen && !$('#modal [data-m="ok"]') && $('#modal [data-m="no"], #modal [data-m="cancel"], #modal [data-m=""]')) closeModal(); else if (sel) select(null); }
  });

  // ---------- the clock ----------
  function refresh(force = true) { if (!S) return; paintTop(); paintMap(); paintFronts(); render(force); }
  const toastKinds = ['win', 'fall', 'warn', 'tea', 'ally'];
  let last = Date.now(), saveAt = 0;
  function step() {
    if (!S) return;
    const now = Date.now(), dt = (now - last) / 1000;
    last = now;
    if (dt > 90) awayReport(G.away(S, dt)); // the tab or the phone slept
    else {
      const top = S.log[S.log.length - 1];
      G.tick(S, dt);
      for (const l of S.log.slice(S.log.indexOf(top) + 1)) if (toastKinds.includes(l.kind) || (l.kind === 'rival' && l.p && G.borders(S, l.p).length)) toast(l.text, l.kind);
    }
    refresh(false);
    nextModal();
    if (now - saveAt > 5000) { save(); saveAt = now; }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { step(); } });
  addEventListener('pagehide', save);

  // ---------- start ----------
  S = load();
  if (S && (S.v !== 1 || !S.owner)) S = null;
  if (!S) welcome();
  else {
    const away = (Date.now() - (S.savedAt || Date.now())) / 1000;
    if (away > 120) awayReport(G.away(S, away));
    refresh();
    focusRealm();
    nextModal();
  }
  setInterval(step, 250);
  // for tools/shots.py and the console: the live state and a way to repaint after changing it
  window.tenka = { get S() { return S; }, refresh, G };
  void reduced;
})();
