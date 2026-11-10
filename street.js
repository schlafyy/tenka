// The street in front of the house, at the foot of every room: the town across the road in pale silhouette, and people
// of the age walking past in shadow-puppet silhouette (kage-e). The house's own people walk out too: a clerk setting off
// on a journey, a guest arriving. Everything moves by transform only; nothing moves with Reduce Motion.
(() => {
  const el = document.getElementById('street');
  if (!el) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const town = el.querySelector('.town'), lanes = el.querySelectorAll('.lane');
  const rnd = (a, b) => a + Math.random() * (b - a), pickOne = a => a[Math.floor(Math.random() * a.length)];

  // ---------- the people: [width, svg inner], 50 high, feet on y=50, facing right ----------
  const head = (x = 20, y = 10) => `<circle cx="${x}" cy="${y}" r="4"/>`;
  const kasa = (x = 20) => `<path d="M${x - 11} 9.5 L${x} 2.5 L${x + 11} 9.5 Q${x} 11.5 ${x - 11} 9.5Z"/>`;
  const knot = (x = 20) => `<path d="M${x - 2} 5.6h4.5v1.8h-4.5z"/>`;
  const shortKimono = (x = 20) => `<path d="M${x - 4.5} 14h9l2.5 17h-14z"/><path d="M${x - 4} 31h3v17h-3.4zM${x + 1} 31h3l1.2 17h-3.4z"/>`;
  const longKimono = (x = 20) => `<path d="M${x - 4.5} 14h9l3 34h-15z"/>`;
  const suit = (x = 20) => `<path d="M${x - 4.5} 14h9v17h-9z"/><path d="M${x - 4} 31h3.4v17h-3.6zM${x + .8} 31h3.4l.6 17h-3.6z"/>`;
  const bowler = (x = 20) => `<path d="M${x - 3.8} 7.4Q${x} 1 ${x + 3.8} 7.4z"/><rect x="${x - 6}" y="6.6" width="12" height="1.6" rx=".8"/>`;
  const wheel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.6"/>`;
  const FIG = {
    farmer: [44, `${head(22)}${kasa(22)}${shortKimono(22)}<path d="M2 15.5l40-3 .1 1.4-40 3z"/><path d="M4 16v7M40 13v7" stroke="currentColor" stroke-width=".8"/><path d="M0 23h8l-1.2 6h-5.6zM36 20h8l-1.2 6h-5.6z"/>`],
    traveler: [40, `${head()}${kasa()}${shortKimono()}<circle cx="13" cy="18" r="4.6"/><path d="M27 12l1.3-.2 3.6 37.8-1.3.2z"/>`],
    monk: [40, `${head()}${longKimono()}<path d="M27 6l1.3 0 .4 43h-1.3z"/><circle cx="27.6" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="1"/>`],
    porter: [40, `${head()}${kasa()}${shortKimono()}<rect x="9" y="12" width="9" height="13" rx="1.5"/>`],
    merchant: [40, `${head()}${knot()}${longKimono()}<rect x="9.5" y="13" width="9" height="10" rx="2.5"/>`],
    woman: [40, `${head()}<circle cx="17" cy="6.4" r="2.6"/>${longKimono()}<path d="M13.6 21h3v5h-3z"/><path d="M7 7.5Q20-4 33 7.5z"/><path d="M20 7l1.2 0 1 17h-1.2z"/>`],
    fishmonger: [44, `${head(22)}${knot(22)}${shortKimono(22)}<path d="M2 15.5l40-3 .1 1.4-40 3z"/><path d="M4 16v8M40 13v8" stroke="currentColor" stroke-width=".8"/><path d="M0 24h8v4h-8zM36 21h8v4h-8z"/>`],
    kago: [72, `${head(10)}${kasa(10)}${shortKimono(10)}${head(62)}${kasa(62)}${shortKimono(62)}<path d="M2 15h68v1.6H2z"/><path d="M25 16.6h22l3 4v17H22v-17z"/><path d="M23 18h26" stroke="#f4f3f0" stroke-width=".8" opacity=".5"/>`],
    gentleman: [40, `${head()}${bowler()}${suit()}<path d="M27 26l1.2-.3 3 22.6-1.2.2z"/>`],
    lady: [40, `${head()}<circle cx="17.4" cy="6.6" r="2.4"/><path d="M15.5 14h9l5 34h-19z"/><path d="M9 4Q20-3 31 4z"/><path d="M20 4h1.1v13H20z"/>`],
    rickshaw: [74, `${head(62)}${kasa(62)}${shortKimono(62)}<path d="M9 31Q6 11 23 9.5l.3 3Q12 14 13 31z"/>${head(26, 15)}${bowler(26)}<path d="M21.5 19h9l1 11h-11z"/><path d="M13 29h23l2 6H15z"/><path d="M36 31.5l22-12 .7 1.3-22 12z"/>${wheel(24, 39, 10)}<path d="M24 29v20M14 39h20" stroke="currentColor" stroke-width=".8"/>`],
    bicycle: [46, `${wheel(10, 42, 7.5)}${wheel(36, 42, 7.5)}<path d="M10 42l9-12h12l5 12M19 30l4 12h-4M31 30l-1-6h4" fill="none" stroke="currentColor" stroke-width="1.6"/>${head(24, 8)}<path d="M20.5 12.5h7l1.6 11h-9z"/><path d="M21 23l2 9 2.4-.6-1.6-8.4z"/>`],
    soba: [46, `${wheel(10, 42, 7.5)}${wheel(36, 42, 7.5)}<path d="M10 42l9-12h12l5 12M19 30l4 12h-4M31 30l-1-6h4" fill="none" stroke="currentColor" stroke-width="1.6"/>${head(24, 12)}<path d="M20.5 16.5h7l1.6 9h-9z"/><path d="M28 16l4-8 1.2.6-4 8z"/><path d="M27 0h12v2h-12zM27 3h12v2h-12zM27 6h12v2h-12z"/>`],
    car: [50, `<path d="M3 41Q4 31 14 29q4-7 14-7t14 7q6 1 6 12z"/><path d="M17 29q3-5 10-5t9 5z" fill="#f4f3f0" opacity=".35"/><circle cx="13" cy="42" r="5"/><circle cx="38" cy="42" r="5"/><circle cx="13" cy="42" r="1.8" fill="#f4f3f0" opacity=".4"/><circle cx="38" cy="42" r="1.8" fill="#f4f3f0" opacity=".4"/>`],
    child: [32, `<g transform="translate(16 50) scale(.72) translate(-20 -50)">${head()}<path d="M15.5 14h9l1 15h-11z"/><path d="M16.5 29h3v19h-3.2zM20.8 29h3l.4 19h-3.2z"/><rect x="9" y="13" width="8" height="11" rx="2"/><path d="M15 7.6Q20 2.6 25 7.6z"/></g>`],
    salaryman: [40, `${head()}<path d="M15.6 7.4Q20 3.6 24.4 7.4z"/>${suit()}<rect x="25" y="28" width="7" height="6" rx="1"/>`],
    phone: [40, `<circle cx="21" cy="10.4" r="4"/>${suit()}<path d="M24 16l4 4-1 1.3-4-3.6z"/><rect x="25.6" y="9.6" width="3" height="5" rx=".8"/>`],
    kei: [50, `<path d="M3 41V29q0-6 6-6h24q8 0 11 7l3 4v7z"/><path d="M11 25h11v6H9z M25 25h7q4 0 6 6H25z" fill="#f4f3f0" opacity=".35"/><circle cx="13" cy="42" r="5"/><circle cx="37" cy="42" r="5"/>`],
    shopper: [40, `${head()}<circle cx="17.4" cy="6.6" r="2.6"/><path d="M15.5 14h9l2 20h-13z"/><path d="M16.5 34h3v14h-3.2zM21 34h3l.4 14h-3.2z"/><path d="M25 23h7l1 8h-9z"/>`],
  };
  // who walks the street in each age (the house's own clerk and guests change their clothes with the times)
  const CROWD = [['farmer', 'traveler', 'monk', 'porter', 'farmer'], ['merchant', 'woman', 'fishmonger', 'kago', 'traveler', 'merchant'],
    ['rickshaw', 'gentleman', 'lady', 'bicycle', 'merchant', 'woman'], ['car', 'soba', 'child', 'salaryman', 'bicycle', 'gentleman'],
    ['phone', 'kei', 'bicycle', 'shopper', 'child', 'salaryman']];
  const RIDES = new Set(['rickshaw', 'bicycle', 'soba', 'car', 'kei', 'kago']);
  const own = (age, who) => who === 'clerk' ? (age < 2 ? 'merchant' : age < 4 ? 'salaryman' : 'phone') : (age < 2 ? 'traveler' : 'gentleman');

  // ---------- the town across the road, by age, in pale silhouette ----------
  function townSvg(age, W) {
    const H = 78, far = '#e7e1d7', near = '#ddd5c9', win = '#ece7df';
    let s = '', x = -10, r = 7;
    const rand = () => (r = (r * 9301 + 49297) % 233280) / 233280; // a fixed town for each width, not a new one each time
    s += `<path d="M0 ${H - 30}${Array.from({ length: Math.ceil(W / 60) + 1 }, (_, i) => ` Q${i * 60 + 30} ${H - 46 - rand() * 14} ${i * 60 + 60} ${H - 30}`).join('')} V${H} H0z" fill="${far}"/>`; // hills
    if (age === 3) s += `<path d="M${W * .72} ${H}l9-62h2l9 62zM${W * .72 + 4} 40h12M${W * .72 + 6} 26h8" fill="${far}" stroke="${far}" stroke-width="2"/>`; // a lattice tower
    while (x < W) {
      const w = 26 + rand() * 30;
      if (age === 0) { const h = 10 + rand() * 5; s += `<path d="M${x + 3} ${H}V${H - h}h${w - 6}V${H}z M${x - 3} ${H - h + 2}L${x + w * .3} ${H - h - 17}h${w * .4}L${x + w + 3} ${H - h + 2}z" fill="${near}"/>`; x += w + 6 + rand() * 30; continue; } // thatched farmhouses, steep and hipped
      if (age === 1) {
        const h = 16 + rand() * 8; s += `<path d="M${x} ${H}V${H - h}h${w}V${H}z M${x - 4} ${H - h + 1}l6-9h${w - 4}l6 9z" fill="${near}"/>`;
        if (rand() < .18) s += `<path d="M${x + w + 6} ${H}V${H - 58}h2V${H}zM${x + w + 14} ${H}V${H - 58}h2V${H}zM${x + w + 3} ${H - 58}l9-7 9 7z M${x + w + 6} ${H - 30}h10v2h-10z" fill="${near}"/>`; // a fire watchtower
        else if (rand() < .2) s += `<path d="M${x + w + 8} ${H}v-24" stroke="${near}" stroke-width="3"/><path d="M${x + w} ${H - 14}Q${x + w + 9} ${H - 36} ${x + w + 18} ${H - 14}M${x + w + 3} ${H - 10}Q${x + w + 9} ${H - 34} ${x + w + 15} ${H - 10}" fill="none" stroke="${near}" stroke-width="1.4"/>`; // a willow
        x += w + 2; continue;
      }
      if (age === 2) {
        const h = 22 + rand() * 12; s += `<path d="M${x} ${H}V${H - h}h${w}V${H}z M${x - 3} ${H - h}l${w / 2 + 3}-8 ${w / 2 + 3} 8z" fill="${near}"/>`;
        if (rand() < .16) s += `<path d="M${x + w + 2} ${H}V${H - 34}h26V${H}z M${x + w + 9} ${H - 34}v-16h12v16z M${x + w + 8} ${H - 50}l7-9 7 9z" fill="${near}"/><circle cx="${x + w + 15}" cy="${H - 43}" r="3.4" fill="${win}"/>`; // a clock tower
        x += w + 4; if (rand() < .3) { s += `<path d="M${x} ${H}V${H - 62}h1.6V${H}zM${x - 5} ${H - 58}h11.6v1.4H${x - 5}z" fill="${near}"/>`; x += 6; }
        continue;
      }
      // Shōwa and after: concrete and glass, rows of windows, utility poles
      const h = (age === 3 ? 26 : 30) + rand() * (age === 3 ? 22 : 44), floors = Math.floor(h / 8);
      s += `<rect x="${x}" y="${H - h}" width="${w}" height="${h}" fill="${near}"/>`;
      for (let f = 1; f < floors; f++) s += `<rect x="${x + 3}" y="${H - h + f * 8 - 3}" width="${w - 6}" height="2" fill="${win}"/>`;
      x += w + 3; if (rand() < .4) { s += `<path d="M${x + 2} ${H}V${H - 60}h1.8V${H}zM${x - 3} ${H - 56}h12v1.4H${x - 3}z" fill="${near}"/>`; x += 10; }
    }
    if (age >= 2) s += `<path d="M0 ${H - 54}Q${W / 4} ${H - 46} ${W / 2} ${H - 54}T${W} ${H - 54}" fill="none" stroke="${near}" stroke-width=".8"/>`; // wires
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
  }

  // ---------- walking ----------
  let age = -1, width = 0;
  function figure(name, tag) {
    const [w, inner] = FIG[name];
    return `<em><svg width="${w}" height="50" viewBox="0 0 ${w} 50" fill="currentColor">${inner}</svg></em>${tag ? `<b class="tag">${tag}</b>` : ''}`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function walk(name, { tag, lane = Math.random() < .5 ? 0 : 1, dir = Math.random() < .5 ? 1 : -1 } = {}) {
    const W = el.clientWidth, ride = RIDES.has(name), speed = (ride ? rnd(55, 80) : rnd(24, 36)) * (lane ? 1 : .7);
    const w = document.createElement('i');
    w.className = 'walker' + (ride ? ' ride' : '') + (dir < 0 ? ' left' : '');
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
    draw, walk, FIG, CROWD, // walk and the tables: for tools/shots and the checks
  };
})();
