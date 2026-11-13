// The street in front of the shop, under its curtain: people of the age walk past in shadow-puppet silhouette (kage-e).
// The house's own people walk out too: a clerk setting off on a journey, a guest arriving. Walkers move by transform;
// their legs and sleeves swing in step with their pace, and wheels turn. Nothing moves with Reduce Motion.
(() => {
  const el = document.getElementById('street');
  if (!el) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lanes = el.querySelectorAll('.lane');
  const rnd = (a, b) => a + Math.random() * (b - a), pickOne = a => a[Math.floor(Math.random() * a.length)];

  // ---------- the people: 50 high, feet on y=50, facing right; the body's front is +x ----------
  const P = d => `<path d="${d}"/>`;
  const pivot = (cls, x, y, inner) => `<g class="${cls}" style="transform-origin:${x}px ${y}px">${inner}</g>`;
  const head = (x = 20, y = 9.6) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="3.9"/>`;
  // legs swing from the hip in opposite phase; a sandalled foot or a shoe points forward
  const shin = (x, hip) => P(`M${x - 2.1} ${hip}H${x + 2.1}L${x + 1.2} 48.2Q${x + 3.9} 48.3 ${x + 4} 50H${x - 1.5}L${x - 1.2} 48.2Z`);
  const trouser = (x, hip) => P(`M${x - 2.4} ${hip}H${x + 2.3}L${x + 1.8} 48.3Q${x + 4.6} 48.4 ${x + 4.8} 50H${x - 2}Z`);
  const legs = (x = 20, hip = 29, leg = shin) => pivot('la', x, hip, leg(x, hip)) + pivot('lb', x, hip, leg(x, hip));
  // a kimono sleeve, or a coat sleeve, swinging against the legs
  const sleeve = (x = 20, sh = 15) => pivot('aa', x, sh, P(`M${x - 2} ${sh - .6}Q${x + 2} ${sh - 1.4} ${x + 3.4} ${sh + .6}L${x + 4.4} ${sh + 9.6}Q${x + .6} ${sh + 12} ${x - 4.6} ${sh + 10.4}Q${x - 5.4} ${sh + 6} ${x - 4.2} ${sh + 3}Z`) + `<circle cx="${x + 2.4}" cy="${sh + 11.4}" r="1.3"/>`);
  const coatArm = (x = 20, sh = 15) => pivot('aa', x, sh, P(`M${x - 1.6} ${sh - .4}H${x + 1.8}L${x + 1.6} ${sh + 12}Q${x} ${sh + 14} ${x - 1.4} ${sh + 12}Z`));
  // bodies
  const kosode = (x = 20) => P(`M${x - 4} 13.8Q${x} 12.2 ${x + 4} 13.8L${x + 4.8} 21.5L${x + 5.8} 34Q${x} 35.4 ${x - 5.6} 34L${x - 5} 21.5Z`); // to the knee
  const longKimono = (x = 20) => P(`M${x - 3.3} 13.6Q${x} 12.3 ${x + 3.3} 13.6Q${x + 4.2} 27 ${x + 5.8} 47.8Q${x + .4} 48.9 ${x - 5.4} 47.8Q${x - 4.6} 27 ${x - 3.3} 13.6Z`);
  const obi = (x = 20) => P(`M${x - 3.6} 20.4H${x - 7}Q${x - 8.1} 23.8 ${x - 7} 27.4H${x - 3.9}Z`); // the drum knot at the back
  const coat = (x = 20) => P(`M${x - 3.7} 13.6Q${x} 12.4 ${x + 3.7} 13.6L${x + 4.2} 30.5Q${x} 31.6 ${x - 4.4} 30.5Z`);
  const tailcoat = (x = 20) => P(`M${x - 3.7} 13.6Q${x} 12.4 ${x + 3.7} 13.6L${x + 4} 27L${x + 1} 29.5L${x - 3.4} 36.5L${x - 4.6} 29Z`);
  // heads and hats
  const topknot = (x = 20) => P(`M${x - 1.6} 6.2Q${x} 4.2 ${x + 3.4} 5.1L${x + 3.2} 6.2Q${x + .6} 5.8 ${x - 1.6} 6.8Z`);
  const bun = (x = 20) => `<ellipse cx="${x - 1.4}" cy="5.4" rx="3.6" ry="2.3"/><ellipse cx="${x - 4.2}" cy="8.4" rx="1.8" ry="2.2"/>${P(`M${x + 1.6} 4.2l.5-.6.8 1.6-.6.4z`)}`;
  const kasa = (x = 20, s = 1) => P(`M${x - 11 * s} 10.4Q${x - 3} ${7.2 - s} ${x} ${3.6 - s}Q${x + 3} ${7.2 - s} ${x + 11 * s} 10.4Q${x} 11.8 ${x - 11 * s} 10.4Z`);
  const bowler = (x = 20) => P(`M${x - 3.6} 7.4Q${x - 3.4} 2.4 ${x} 2.4Q${x + 3.4} 2.4 ${x + 3.6} 7.4Z`) + P(`M${x - 6} 7.6Q${x} 6 ${x + 6} 7.6Q${x} 8.6 ${x - 6} 7.6Z`);
  const shortHair = (x = 20) => P(`M${x - 3.6} 9.6Q${x - 4} 5.4 ${x} 5.4Q${x + 3.8} 5.4 ${x + 3.4} 8.2Q${x} 6.8 ${x - 3.6} 9.6Z`);
  const wheel = (cx, cy, r, spokes = 6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
    pivot('spin', cx, cy, Array.from({ length: spokes / 2 }, (_, i) => { const a = i * Math.PI * 2 / spokes, dx = Math.cos(a) * r, dy = Math.sin(a) * r; return `<path d="M${cx - dx} ${cy - dy}L${cx + dx} ${cy + dy}" stroke="currentColor" stroke-width=".7"/>`; }).join(''));
  const pole = (a, b, y1, y2) => `<path d="M${a} ${y1}Q${(a + b) / 2} ${Math.min(y1, y2) - 1.6} ${b} ${y2}" fill="none" stroke="currentColor" stroke-width="1.3"/>`;
  const cycle = (wb = 0) => `${wheel(9, 42, 7.4, 8)}${wheel(37, 42, 7.4, 8)}<path d="M9 42L18 31H31L37 42M18 31L22.5 42L31 31M31 31L29.6 25.6H33M22.5 42H19M18 31.4L16.6 29" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>${P('M14.8 28.6h4.4l-.4 1.4h-3.8z')}${pivot('spin', 22.5, 42, '<path d="M19.5 42H25.5" stroke="currentColor" stroke-width="1.3"/>')}`;
  const rider = (x, top = 0) => `${head(x, 8.4 + top)}${P(`M${x - 3.4} ${13 + top}Q${x + 1} ${11.6 + top} ${x + 3.4} ${13.4 + top}L${x + 7.6} ${21 + top}L${x + 6.6} ${22.2 + top}L${x + 3.2} ${17.8 + top}L${x + 2.4} ${26 + top}H${x - 3.8}Z`)}${P(`M${x - 3.6} ${25 + top}H${x + 2}L${x + 4.5} 34.4L${x + 3.3} 42.6H${x + 5.8}L${x + 6.1} 44H${x + 1.4}L${x + 2.1} 35.4L${x - 1.6} 29Z`)}`;
  // [width, drawing, stride: how far one step carries the body, in px]
  const FIG = {
    farmer: [46, `${pole(1, 45, 15.6, 13.4)}<path d="M4 15.4v8M42 13.6v8" stroke="currentColor" stroke-width=".7"/>${P('M.4 23H7.6L6.6 29.4Q4 30.4 1.4 29.4Z')}${P('M38.4 21.6H45.6L44.6 28Q42 29 39.4 28Z')}${legs(23)}${kosode(23)}${head(23)}${kasa(23)}`, 15],
    traveler: [40, `${legs()}<ellipse cx="14.4" cy="19.6" rx="4.6" ry="5.4"/>${kosode()}${head()}${kasa()}${P('M25.6 13.2l1.2-.3 4.6 36.6-1.2.2z')}${sleeve(21, 15)}`, 15],
    monk: [40, `${legs(20, 39)}${longKimono()}${P('M15.6 14.4Q20 22 25 28.6L24 30Q18.6 24 15 15.6Z')}${head()}${kasa(20, 1.15)}${P('M27.2 6.6h1.2l.5 43.2h-1.2z')}<circle cx="27.8" cy="5.6" r="2.4" fill="none" stroke="currentColor" stroke-width=".9"/>`, 8],
    porter: [40, `${legs()}${P('M8.4 11.6H17.4V27.4H8.4Z')}<path d="M9 15.4H17M9 20.4H17" stroke="#f4f3f0" stroke-width=".6" opacity=".35"/>${kosode()}${head()}${kasa()}${sleeve()}`, 15],
    merchant: [40, `${legs(20, 39)}<ellipse cx="14" cy="18" rx="4.4" ry="4.8"/>${longKimono()}${head()}${topknot()}${sleeve()}`, 8],
    woman: [40, `${legs(20, 39)}${longKimono()}${obi()}${head()}${bun()}${sleeve(20.4, 15.4)}`, 8],
    fishmonger: [46, `${pole(1, 45, 15.6, 13.4)}<path d="M4 15.4v8.6M42 13.6v8.6" stroke="currentColor" stroke-width=".7"/>${P('M0 24H8.4V27.4H0Z')}${P('M37.6 22.2H46V25.6H37.6Z')}${legs(23)}${kosode(23)}${head(23)}${topknot(23)}`, 15],
    kago: [74, `${legs(10)}${kosode(10)}${head(10)}${kasa(10, .9)}${legs(64)}${kosode(64)}${head(64)}${kasa(64, .9)}${pole(2, 72, 15.2, 15.2)}${P('M26 17.4H48L50 20.4V37H24V20.4Z')}${P('M22 18.6Q37 12.6 52 18.6Q37 17.4 22 18.6Z')}<path d="M27.6 22H46.4V33H27.6Z" fill="#f4f3f0" opacity=".22"/>`, 15],
    gentleman: [40, `${legs(20, 30, trouser)}${tailcoat()}${head()}${bowler()}${coatArm()}${P('M28.4 27.4l1.2-.2 2.4 22.4-1.2.2z')}`, 15],
    lady: [42, `${legs(21, 40, trouser)}${P('M18.2 13.6Q21 12.4 23.8 13.6L23.6 24Q27.2 34 27.8 48Q21 49.4 14.2 48Q14.8 40 12.6 32.6Q11 28.4 15.4 25.6L18.4 24Z')}${head(21)}<ellipse cx="18.6" cy="6.6" rx="2.6" ry="2.2"/>${P('M11 6.6Q21-2 31 6.6Q21 5 11 6.6Z')}${P('M20.8 6.2h1v12.6h-1z')}${coatArm(21.6)}`, 10],
    rickshaw: [76, `${P('M7.6 31.6Q4.6 11.4 22 9.2L22.6 12.4Q10.8 14.6 12 31.6Z')}<g transform="translate(0 5)">${head(25)}${bowler(25)}</g>${P('M20.6 18.6H29.6L30.8 30H19.4Z')}${P('M12.4 29.4H36.4L38.2 35.4H14.2Z')}${P('M35.6 31.6L59.8 18.6L60.6 20L36.4 33Z')}${wheel(24, 39.4, 10.4, 10)}${legs(64)}${kosode(64)}${head(64)}${kasa(64, .9)}${sleeve(65, 15)}`, 15],
    bicycle: [46, `${cycle()}${rider(23)}`, 0],
    soba: [46, `${cycle()}${rider(23, 3)}${P('M29.6 16.6L33.4 8.8L34.6 9.4L30.8 17.2Z')}${P('M27.2 0H40V2.2H27.2ZM27.2 3H40V5.2H27.2ZM27.2 6H40V8.2H27.2Z')}`, 0],
    car: [52, `${P('M2.6 41.6Q2.6 33.4 10 31.6Q14.6 22.4 26.6 22.4Q37.6 22.4 42 31Q49.8 32 50 41.6Z')}<path d="M17.6 30.6Q20 26.2 25.6 26.2V30.6ZM27.4 26.2Q32.4 26.4 35 30.6H27.4Z" fill="#f4f3f0" opacity=".32"/><circle cx="13.4" cy="42.4" r="5.2"/><circle cx="39" cy="42.4" r="5.2"/>${pivot('spin', 13.4, 42.4, '<path d="M11.2 42.4H15.6" stroke="#f4f3f0" stroke-width=".9" opacity=".45"/>')}${pivot('spin', 39, 42.4, '<path d="M36.8 42.4H41.2" stroke="#f4f3f0" stroke-width=".9" opacity=".45"/>')}`, 0],
    child: [32, `<g transform="translate(16 50) scale(.7) translate(-20 -50)">${legs(20, 29)}${P('M8.6 13.6H16.4Q17.4 13.6 17.4 14.6V25.4Q17.4 26.4 16.4 26.4H8.6Q7.6 26.4 7.6 25.4V14.6Q7.6 13.6 8.6 13.6Z')}${P('M16.6 13.6Q20 12.4 23.4 13.6L24.2 30.4Q20 31.6 15.8 30.4Z')}${head()}${P('M15.6 8.4Q15.8 3.4 20 3.4Q24.4 3.4 24.6 8Q26.8 8.2 27.4 9.2Q21 8 15.6 8.4Z')}${coatArm()}</g>`, 10],
    salaryman: [40, `${legs(20, 30, trouser)}${coat()}${head()}${shortHair()}${pivot('aa', 20, 15, P('M18.4 14.6H21.8L21.6 26.6Q20 28.6 18.6 26.6Z') + P('M17.6 27.4H25.4V33.6H17.6Z'))}`, 15],
    phone: [40, `${legs(20, 30, trouser)}${coat()}${head(20.4, 10)}${shortHair(20.4)}${P('M19 14.6H22.4L27.4 19.4L25.8 21.6L22.8 18.8L22 26.6Q20.4 28.4 19 26.6Z')}${P('M25.8 15.2H28.4V20H25.8Z')}`, 13],
    kei: [52, `${P('M3 41.8V30.4Q3 24 9.4 24H33.6Q40.4 24 43.6 30.6L48.6 34.6Q49.6 35.6 49.6 37.4V41.8Z')}<path d="M10.4 26.4H22.4V31.6H8.4Q8.4 26.4 10.4 26.4ZM25 26.4H33Q37.6 26.4 39.6 31.6H25Z" fill="#f4f3f0" opacity=".32"/><circle cx="13.4" cy="42.4" r="5"/><circle cx="38.6" cy="42.4" r="5"/>${pivot('spin', 13.4, 42.4, '<path d="M11.2 42.4H15.6" stroke="#f4f3f0" stroke-width=".9" opacity=".45"/>')}${pivot('spin', 38.6, 42.4, '<path d="M36.4 42.4H40.8" stroke="#f4f3f0" stroke-width=".9" opacity=".45"/>')}`, 0],
    shopper: [40, `${legs(20, 34, trouser)}${P('M16.8 13.6Q20 12.4 23.2 13.6L24.6 26Q26.2 32 26.6 35Q20 36.4 13.6 35Q14.2 31 15.4 26Z')}${head()}${P('M16.4 13.2Q15 6.6 17.6 5Q20.4 3.6 23 5.6Q24.4 7.2 23.6 9Q20 6.6 17.6 8.4Q17.6 11 18.4 13.6Z')}${pivot('aa', 20, 15, P('M18.6 14.6H22L22.2 25.6Q20.4 27.2 18.8 25.6Z') + P('M17.6 25.6H25.6L26.4 33.4H16.8Z'))}`, 12],
  };
  // who walks the street in each age (the house's own clerk and guests change their clothes with the times)
  const CROWD = [['farmer', 'traveler', 'monk', 'porter', 'farmer'], ['merchant', 'woman', 'fishmonger', 'kago', 'traveler', 'merchant'],
    ['rickshaw', 'gentleman', 'lady', 'bicycle', 'merchant', 'woman'], ['car', 'soba', 'child', 'salaryman', 'bicycle', 'gentleman'],
    ['phone', 'kei', 'bicycle', 'shopper', 'child', 'salaryman']];
  const RIDES = new Set(['bicycle', 'soba', 'car', 'kei']);
  const own = (age, who) => who === 'clerk' ? (age < 2 ? 'merchant' : age < 4 ? 'salaryman' : 'phone') : (age < 2 ? 'traveler' : 'gentleman');

  // ---------- walking ----------
  let age = -1, width = 0;
  function figure(name, tag) {
    const [w, inner] = FIG[name];
    return `<s></s><em><svg width="${w}" height="50" viewBox="0 0 ${w} 50" fill="currentColor">${inner}</svg></em>${tag ? `<b class="tag">${tag}</b>` : ''}`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function walk(name, { tag, lane = Math.random() < .5 ? 0 : 1, dir = Math.random() < .5 ? 1 : -1 } = {}) {
    const W = el.clientWidth, ride = RIDES.has(name), speed = (ride ? rnd(55, 80) : rnd(24, 34)) * (lane ? 1 : .7);
    const w = document.createElement('i');
    w.className = 'walker' + (ride ? ' ride' : '') + (dir < 0 ? ' left' : '');
    // one step carries the body its stride, so the feet don't slide; the back lane is drawn at .66
    const stride = FIG[name][2] * (lane ? 1 : .66);
    if (stride) w.style.setProperty('--step', Math.min(.7, Math.max(.26, stride / speed)).toFixed(3) + 's');
    w.innerHTML = `<span>${figure(name, tag && esc(tag))}</span>`;
    lanes[lane].append(w);
    const from = dir > 0 ? -90 : W + 10, to = dir > 0 ? W + 10 : -90;
    w.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { duration: (W + 100) / speed * 1000, easing: 'linear' }).onfinish = () => w.remove();
  }
  // the crowd follows the age; with Reduce Motion a few people of the age stand still, placed for the street's width
  function draw() {
    const S = window.tenka && window.tenka.S;
    if (!S) return;
    const a = G.ageOf(S.year), W = el.clientWidth;
    if (a === age && W === width) return;
    age = a; width = W;
    if (reduced) { // standing still: a few people of the age
      lanes.forEach(l => (l.innerHTML = ''));
      CROWD[a].slice(0, 3).forEach((n, i) => { const w = document.createElement('i'); w.className = 'walker' + (RIDES.has(n) ? ' ride' : ''); w.style.transform = `translateX(${W * (.15 + i * .3)}px)`; w.innerHTML = `<span>${figure(n)}</span>`; lanes[i % 2].append(w); });
    }
  }
  const inView = () => { const r = el.getBoundingClientRect(); return !document.hidden && r.top < innerHeight && r.bottom > 0 && el.clientWidth > 0; };
  (function tick() {
    draw();
    if (!reduced && inView() && el.querySelectorAll('.walker').length < 5) walk(pickOne(CROWD[Math.max(0, age)]));
    setTimeout(tick, rnd(2200, 4800));
  })();
  addEventListener('resize', () => setTimeout(draw, 100));

  // the house's own people: ui.js calls these
  window.street = {
    event(who, tag) { if (reduced || age < 0) return; walk(own(age, who), { tag, lane: 1, dir: who === 'clerk' ? 1 : -1 }); },
    draw, walk, figure, FIG, CROWD, // for tools/shots and the checks
  };
})();
