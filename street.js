// The street in front of the house, at the foot of every room: the town across the road painted in pale ink, with mist
// bands as on a folding screen, and people of the age walking past in shadow-puppet silhouette (kage-e). The house's own
// people walk out too: a clerk setting off on a journey, a guest arriving. Walkers move by transform; their legs and
// sleeves swing in step with their pace, and wheels turn. Nothing moves with Reduce Motion.
(() => {
  const el = document.getElementById('street');
  if (!el) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const town = el.querySelector('.town'), lanes = el.querySelectorAll('.lane');
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

  // ---------- the town across the road, by age, in pale ink ----------
  const TONE = { far: '#e9e4dc', hill: '#e0d9cd', wall: '#e8e2d8', roof: '#cdc2b1', line: '#d6cdbf', dark: '#c2b6a3', mist: '#f2efea' };
  function townSvg(age, W) {
    const H = 100, base = H, { far, hill, wall, roof, line, dark, mist } = TONE;
    let r = 7;
    const rand = () => (r = (r * 9301 + 49297) % 233280) / 233280; // a fixed town for each width, not a new one each time
    // a smooth ridge through random peaks
    const ridge = (y, amp, step, fill) => {
      const pts = Array.from({ length: Math.ceil(W / step) + 2 }, (_, i) => [i * step - step / 2, y - rand() * amp]);
      let d = `M${pts[0][0]} ${base}L${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length - 1; i++) d += `Q${pts[i][0]} ${pts[i][1]} ${(pts[i][0] + pts[i + 1][0]) / 2} ${(pts[i][1] + pts[i + 1][1]) / 2}`;
      return `<path d="${d}L${W + step} ${base}Z" fill="${fill}"/>`;
    };
    // a tiled roof whose eaves sweep up at the ends: over a wall from x to x+w, eaves at y, ridge rh above
    const jroof = (x, w, y, rh, o = 3, fill = roof) => `<path d="M${x - o} ${y - 1}Q${x + w * .16} ${y - rh * .22} ${x + w * .24} ${y - rh}H${x + w * .76}Q${x + w * .84} ${y - rh * .22} ${x + w + o} ${y - 1}L${x + w + o - 1.4} ${y + 1.2}Q${x + w / 2} ${y + 2} ${x - o + 1.4} ${y + 1.2}Z" fill="${fill}"/>`;
    const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
    const slats = (x, y, w, h, gap = 2.4) => { let s = ''; for (let i = x + 1.4; i < x + w - 1; i += gap) s += rect(i, y, .7, h, line); return s; };
    const pine = (x, y, s = 1) => `<path d="M${x} ${y}Q${x + 2 * s} ${y - 10 * s} ${x - 2 * s} ${y - 20 * s}" fill="none" stroke="${dark}" stroke-width="${1.6 * s}"/>` +
      [[-1, -21, 9], [5, -14, 7], [-6, -10, 6]].map(([dx, dy, rx]) => `<ellipse cx="${x + dx * s}" cy="${y + dy * s}" rx="${rx * s}" ry="${2.8 * s}" fill="${dark}"/>`).join('');
    const willow = (x, y) => `<path d="M${x} ${y}V${y - 22}" stroke="${dark}" stroke-width="2"/>` + [-8, -4, 0, 4, 8].map(dx => `<path d="M${x} ${y - 22}Q${x + dx} ${y - 24} ${x + dx * 1.3} ${y - 6}" fill="none" stroke="${dark}" stroke-width=".8"/>`).join('');
    const mistBand = (x, y, w, h = 6) => `<g fill="${mist}" opacity=".85"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect x="${x + w * .18}" y="${y - h * .6}" width="${w * .5}" height="${h}" rx="${h / 2}"/></g>`;
    let s = ridge(56, 18, 90, far) + ridge(70, 12, 64, hill);
    // the landmark of the age, on the hills
    const lx = Math.round(W * .76);
    if (age === 0) { // a five-storey pagoda
      let y = 72; s += rect(lx - 6, y - 3, 12, 3, dark);
      for (let i = 0; i < 5; i++) { const w = 15 - i * 1.7; s += rect(lx - w / 2 + 2, y - 7, w - 4, 7, wall) + jroof(lx - w / 2, w, y - 6.4, 3, 3.4, dark); y -= 8; }
      s += `<path d="M${lx} ${y - 1}V${y - 15}" stroke="${dark}" stroke-width="1"/>` + [3, 6, 9].map(d => rect(lx - 1.6, y - 1 - d, 3.2, .8, dark)).join('');
    } else if (age === 1) { // a castle keep on its stone base
      s += `<path d="M${lx - 17} 74Q${lx - 13} 68 ${lx - 13} 62H${lx + 13}Q${lx + 13} 68 ${lx + 17} 74Z" fill="${dark}"/>`;
      let y = 62;
      [[22, 9], [17, 8], [12, 8]].forEach(([w, h]) => { s += rect(lx - w / 2, y - h, w, h, wall) + jroof(lx - w / 2, w, y - h + .6, 3.2, 3.6, dark); y -= h; });
      s += `<path d="M${lx - 5} ${y + 9}L${lx} ${y + 3.6}L${lx + 5} ${y + 9}Z" fill="${dark}"/>` + jroof(lx - 4, 8, y + 1, 4, 3, dark);
    } else if (age === 2) { // a brick clock tower
      s += rect(lx - 16, 54, 32, 20, line) + `<path d="M${lx - 18} 54H${lx + 18}L${lx} 47Z" fill="${dark}"/>` + rect(lx - 5, 30, 10, 24, line) + `<path d="M${lx - 7} 30H${lx + 7}L${lx} 18Z" fill="${dark}"/><circle cx="${lx}" cy="37" r="3.2" fill="${wall}"/>`;
      for (let i = 0; i < 4; i++) s += `<path d="M${lx - 13 + i * 7.4} 72v-8a2 2 0 0 1 4 0v8z" fill="${wall}"/>`;
    } else if (age === 3) { // a lattice broadcast tower
      s += `<path d="M${lx - 14} 76Q${lx - 4} 52 ${lx - 1.4} 14H${lx + 1.4}Q${lx + 4} 52 ${lx + 14} 76H${lx + 9}Q${lx + 3} 62 ${lx} 60Q${lx - 3} 62 ${lx - 9} 76Z" fill="${dark}"/>` + rect(lx - 6, 46, 12, 3, dark) + rect(lx - 3.6, 32, 7.2, 2.4, dark) + `<path d="M${lx} 14V4" stroke="${dark}" stroke-width=".8"/>`;
      for (let y = 20; y < 70; y += 6) s += `<path d="M${lx - 1.2 - (y - 14) * .16} ${y}L${lx + 1.2 + (y + 6 - 14) * .16} ${y + 6}M${lx + 1.2 + (y - 14) * .16} ${y}L${lx - 1.2 - (y + 6 - 14) * .16} ${y + 6}" stroke="${mist}" stroke-width=".5" opacity=".7"/>`;
    } else { // towers of glass, the tallest a slim spire
      [[-30, 26, 44], [-12, 14, 58], [6, 20, 48], [24, 16, 36]].forEach(([dx, w, h]) => { s += rect(lx + dx, 76 - h, w, h, '#ddd5c8'); for (let y = 76 - h + 4; y < 74; y += 4) s += rect(lx + dx + 2, y, w - 4, 1, mist); });
      s += `<path d="M${lx + 46} 76L${lx + 48.6} 6L${lx + 51.2} 76Z" fill="${dark}"/>` + rect(lx + 46.4, 30, 4.4, 2.6, dark) + rect(lx + 46.9, 20, 3.4, 2, dark);
    }
    s += mistBand(-20, 49, W * .5, 5) + mistBand(W * .46, 55, W * .62, 5); // across the hills, above the roofs
    // the row of houses across the road
    let x = -8;
    const poles = [];
    while (x < W + 10) {
      const w = 26 + rand() * 26;
      if (age === 0) { // thatched farmhouses among pines and paddies
        const h = 9 + rand() * 4, rh = 16 + rand() * 6, y = base - h;
        s += rect(x, y, w, h, wall) + rect(x + w * .4, y + 3, w * .2, h - 3, line);
        s += `<path d="M${x - 3} ${y + 1}Q${x + w * .08} ${y - rh * .5} ${x + w * .28} ${y - rh}Q${x + w * .5} ${y - rh - 2.4} ${x + w * .72} ${y - rh}Q${x + w * .92} ${y - rh * .5} ${x + w + 3} ${y + 1}Z" fill="${roof}"/>` + rect(x + w * .26, y - rh + 1.4, w * .48, 2, dark);
        x += w + 4;
        if (rand() < .5) { s += pine(x + 8, base, .8 + rand() * .3); x += 18; }
        x += rand() * 26; continue;
      }
      if (age === 1 || (age === 2 && rand() < .55)) { // Edo townhouses: lattice below, slatted windows above, a pent roof between
        if (rand() < .16) { // a white storehouse
          const h = 24 + rand() * 4, y = base - h;
          s += rect(x, y, w * .7, h, '#eee9e1') + rect(x, base - 6, w * .7, 6, line) + rect(x + w * .3, y + 5, 4, 4, dark) + jroof(x, w * .7, y, 5, 2.6, dark);
          x += w * .7 + 3; continue;
        }
        const h = 20 + rand() * 7, y = base - h;
        s += rect(x, y, w, h, wall) + slats(x, base - h * .5 + 2, w, h * .5 - 2) + rect(x + 3, y + 3, w - 6, 3.4, line) + jroof(x, w, base - h * .5, 2.4, 1.8) + jroof(x, w, y, 6.4);
        if (age === 1 && rand() < .3) s += `<rect x="${x + w * .5 - 3}" y="${base - h * .5 + 2}" width="6" height="7" fill="${dark}" opacity=".7"/>`; // a shop curtain
        x += w + 1.4;
        if (age === 1 && rand() < .12) { s += willow(x + 9, base); x += 20; }
        else if (age === 1 && rand() < .1) { s += `<path d="M${x + 4} ${base}V${base - 52}M${x + 14} ${base}V${base - 52}M${x + 4} ${base - 24}H${x + 14}M${x + 4} ${base - 38}H${x + 14}" stroke="${dark}" stroke-width="1.4"/><path d="M${x} ${base - 50}L${x + 9} ${base - 58}L${x + 18} ${base - 50}Z" fill="${dark}"/>`; x += 22; } // a fire watchtower
        continue;
      }
      if (age === 2) { // Meiji brick and stucco: a cornice, arched windows
        const h = 26 + rand() * 10, y = base - h;
        s += rect(x, y, w, h, wall) + rect(x - 1.4, y, w + 2.8, 2.4, dark);
        for (let i = x + 4; i < x + w - 6; i += 8) s += `<path d="M${i} ${y + 15}v-6a2.2 2.2 0 0 1 4.4 0v6z M${i} ${base - 4}v-6a2.2 2.2 0 0 1 4.4 0v6z" fill="${line}"/>`;
        x += w + 3;
        if (rand() < .4) { s += `<path d="M${x + 2} ${base}V${base - 30}" stroke="${dark}" stroke-width="1"/>` + rect(x, base - 34, 4, 4, dark); x += 8; } // a gas lamp
        if (rand() < .5) poles.push(x + 1);
        continue;
      }
      // Shōwa and after: concrete and glass with a few wooden houses left, and utility poles on the corners
      if (age === 3 && rand() < .35) { const h = 18 + rand() * 4, y = base - h; s += rect(x, y, w, h, wall) + rect(x + 3, y + 5, w - 6, 3, line) + jroof(x, w, y, 6); x += w + 3; poles.push(x + 1); continue; }
      const h = (age === 3 ? 28 : 34) + rand() * (age === 3 ? 18 : 34), y = base - h;
      s += rect(x, y, w, h, wall);
      if (age === 3) for (let f = y + 5; f < base - 4; f += 7) s += rect(x + 3, f, w - 6, 2.4, line);
      else for (let f = y + 4; f < base - 4; f += 5) for (let c = x + 3; c < x + w - 4; c += 5) s += rect(c, f, 3, 2.6, line);
      if (rand() < .3) s += rect(x + w - 6, y + 4, 4, Math.min(22, h - 8), dark); // a hanging sign
      x += w + 3;
      if (rand() < .55) { poles.push(x + 1); x += 6; }
    }
    s += poles.map(p => `<path d="M${p} ${base}V${base - 48}M${p - 5} ${base - 45}H${p + 5}" stroke="${dark}" stroke-width="1.3"/>`).join('');
    for (let i = 1; i < poles.length; i++) s += `<path d="M${poles[i - 1]} ${base - 45}Q${(poles[i - 1] + poles[i]) / 2} ${base - 39} ${poles[i]} ${base - 45}" fill="none" stroke="${dark}" stroke-width=".6"/>`; // the wires sag between poles
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
  }

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
  // the street is drawn for the age and the width it has, and redrawn only when either changes
  function draw() {
    const S = window.tenka && window.tenka.S;
    if (!S) return;
    const a = G.ageOf(S.year), W = el.clientWidth;
    if (a === age && W === width) return;
    age = a; width = W;
    town.innerHTML = townSvg(a, W);
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
    draw, walk, figure, townSvg, FIG, CROWD, // for tools/shots and the checks
  };
})();
