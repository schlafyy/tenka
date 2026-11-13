// The page: the house banner, the trades, upgrades, managers, chronicle and house tabs, saving and the clock.
// All rules live in game.js (G). Bars move every frame on the compositor; numbers update a few times a second;
// the panel's markup is rebuilt only when what it shows changes.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = G.fmt, P = GEO.provinces, PIDS = G.PIDS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'tenka-save-3';
  const WORK = Object.fromEntries(WORKS.map(w => [w.id, w]));
  const CHAPTER = Object.fromEntries([...EVENTS, ...LATER_EVENTS].map(e => [e.id, e]));
  const PLACE = { ezo: ['Ezo', '蝦夷'], ryukyu: ['Ryukyu', '琉球'] };
  const MODES = [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'Max']];
  const CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 6.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

  let S = null;                // the game state
  let report = null;           // what happened while you were away, until dismissed or the next purchase
  let older = 25;              // chronicle entries shown
  let tab = 'shop', sub = 'trades', mode = 1;
  let choosing = false;        // a seal is coming down on a crossroads
  const panel = $('#panel'), view = $('#view');
  // the iOS app (Capacitor): the save is also kept in the app's own settings store, which iOS never clears to free space
  const native = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  const prefs = native ? (Capacitor.Plugins && Capacitor.Plugins.Preferences) || (Capacitor.registerPlugin && Capacitor.registerPlugin('Preferences')) : null;
  const standalone = native || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; // opened as an app
  // ask the browser to keep the save through storage clean-ups (granted to Home Screen apps; harmless where refused)
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  // ---------- saving ----------
  // a save from before the guests and the tea room gets their empty places
  function fresh(T) { T.trips = T.trips || []; T.meta.goods = T.meta.goods || []; T.choices = T.choices || {}; T.meta.paths = T.meta.paths || []; T.guests = T.guests || []; if (!('tea' in T)) T.tea = null; if (!('day' in T)) T.day = null; T.meta.bond = T.meta.bond || {}; return T; }
  function save() {
    if (!S) return;
    S.savedAt = Date.now();
    const s = JSON.stringify(S);
    try { localStorage.setItem(KEY, s); } catch { /* private mode: the game still runs */ }
    if (prefs) prefs.set({ key: KEY, value: s }).catch(() => { /* localStorage still has it */ });
  }
  function load() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; } }

  // ---------- dyes and crests (from the Sengoku map) ----------
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255];
    return '#' + c.map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k).toString(16).padStart(2, '0')).join('');
  };
  // how much of its square each crest's drawing fills (width, height), measured once in a browser;
  // the banner sizes the crest by it so both slits cut every crest the same way.
  // shortcut: a new house's crest falls back to .85, measure it when one is added
  const CREST_FILL = { oda: [1, .98], takeda: [.805, .61], mori: [.73, .77], shimazu: [.87, .87], tokugawa: [1, 1], date: [1, 1], uesugi: [.81, .81], hojo: [.825, .305], imagawa: [.81, .8], otomo: [.81, .825], chosokabe: [1, 1], maeda: [.81, .78], hosokawa: [.81, .81] };
  const crest = (clan, cls) => { const cr = CRESTS[clan]; return cr ? `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><image href="${cr.src}" width="40" height="40" filter="${resist(cr)}"/></svg>` : ''; };
  const resist = cr => `url(#resist${cr.invert === 'holes' ? '-holes' : cr.invert ? '-inv' : ''})`;
  // a crest on a disc of its clan's darkened dye, or the place's first character when there is no crest
  function disc(clan, place) {
    const cr = clan && CRESTS[clan];
    if (cr) return `<svg class="disc" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="${shade(DYES[CLANS[clan].dye] || '#8a907c', -.38)}"/><image href="${cr.src}" x="6" y="6" width="28" height="28" filter="${resist(cr)}"/></svg>`;
    const ja = place && (P[place] ? P[place].ja : PLACE[place] && PLACE[place][1]);
    return `<span class="disc kanji" aria-hidden="true">${ja ? ja[0] : '日'}</span>`;
  }
  const placeName = p => (P[p] ? `${esc(P[p].en)} <span lang="ja">${P[p].ja}</span>` : PLACE[p] ? `${PLACE[p][0]} <span lang="ja">${PLACE[p][1]}</span>` : '');
  const clanName = c => `${esc(CLANS[c].en)} <span lang="ja">${CLANS[c].ja}</span>`;
  // a clan's curtain colour: its dye, deepened until white lettering reads on it (4.5:1)
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255].reduce((s, v, i) => { v /= 255; return s + [.2126, .7152, .0722][i] * (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); }, 0); };
  const curtain = clan => { const d = DYES[CLANS[clan].dye] || '#8a907c'; let k = 0; while (1.05 / (lum(shade(d, k)) + .05) < 4.5 && k > -.6) k -= .05; return shade(d, k); };
  // the house's dye: the curtain and age band, and a lighter cut for the bars on the dark signboards
  function dyeTheHouse() {
    const col = curtain(S.house);
    document.body.style.setProperty('--dye', col);
    const n = parseInt(col.slice(1), 16), [r, g, b] = [n >> 16, n >> 8 & 255, n & 255], ochre = r > b * 1.6 && g > b * 1.3; // yellow-brown dyes read as gold when lightened
    document.body.style.setProperty('--dye-lit', ochre ? shade(col, -.15) : shade(col, .15));
  }

  // ---------- the house banner ----------
  const secs = sec => { if (sec < 1) return sec.toFixed(1) + ' s'; sec = Math.ceil(sec); if (sec < 60) return sec + ' s'; const m = Math.floor(sec / 60); if (m < 60) return m + ' min ' + String(sec % 60).padStart(2, '0'); const h = Math.floor(m / 60); return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); };
  const unit = () => (G.money(S) === 'yen' ? 'yen' : 'koku');
  function renderTop() {
    dyeTheHouse();
    const cr = crest(S.house, 'crest'), [fw, fh] = CREST_FILL[S.house] || [.85, .85];
    $('#house').style.setProperty('--c', Math.min(110 / fw, 100 / fh) + 'px'); // the drawing runs 14px into each side panel and clears the sleeve and hem
    $('#house').innerHTML = `<span class="pn l" aria-hidden="true">${cr}<b class="v" lang="ja" style="--n:${CLANS[S.house].ja.length}">${CLANS[S.house].ja}</b></span><span class="pn m" aria-hidden="true">${cr}</span><span class="pn r" aria-hidden="true">${cr}<b class="v" lang="ja"></b></span>`;
    $('#house').setAttribute('aria-label', `The curtain of the ${CLANS[S.house].en} house`);
    $('#ages').innerHTML = AGES.map(a => `<div class="age"><div class="band"><i></i></div><span class="k" lang="ja">${a.ja.split('・')[0]}</span></div>`).join('');
    ages = [...document.querySelectorAll('#ages .age')];
  }
  let ages = [], topYear = null;
  function paintTop() {
    if (topYear === S.year) return;
    topYear = S.year;
    const era = G.eraOf(S.year), now = G.ageOf(S.year);
    $('#year').textContent = S.year;
    const ey = `${era.ja}${G.kanjiYear(era.n)}年`, v = $('#house .pn.r .v');
    v.textContent = ey; v.style.setProperty('--n', ey.length);
    $('#era').textContent = `${era.en} ${era.n}`;
    AGES.forEach((a, i) => {
      const to = AGES[i + 1] ? AGES[i + 1].from : END_YEAR, k = Math.min(1, Math.max(0, (S.year - a.from) / (to - a.from)));
      ages[i].querySelector('i').style.transform = `scaleX(${k})`;
      ages[i].className = 'age' + (i === now ? ' now' : i < now ? ' past' : '');
    });
    const next = WORKS.find(w => S.year < w.year);
    document.querySelectorAll('#ages .tick').forEach(t => t.remove());
    if (next) {
      const a = G.ageOf(next.year), to = AGES[a + 1] ? AGES[a + 1].from : END_YEAR, tick = document.createElement('b');
      tick.className = 'tick';
      tick.style.left = ((next.year - AGES[a].from) / (to - AGES[a].from) * 100) + '%';
      ages[a].append(tick);
    }
    $('#next').innerHTML = `<span><b lang="ja">${AGES[now].ja.split('・')[0]}</b> ${esc(AGES[now].en)}</span>` +
      (S.done ? '<span>The present day</span>' : next ? `<span class="nb">Next: <b>${esc(next.en)} <span lang="ja">${next.glyph}</span></b> ${next.year}</span>` : '');
  }
  // the top bar's three chips: renown, the tea, the clerks; each one a tap from its room
  const chipWas = {};
  function chip(id, glyph, big, small, cls) {
    const h = `<b lang="ja" aria-hidden="true">${glyph}</b><span><strong>${big}</strong><small>${small}</small></span>`;
    if (chipWas[id] === h + cls) return;
    chipWas[id] = h + cls;
    const el = document.getElementById(id);
    el.innerHTML = h; el.className = 'chip' + (cls ? ' ' + cls : '');
  }
  function paintChips() {
    const gain = G.renownGain(S);
    chip('renown', '名', `Renown ${fmt(S.meta.renown)}`, gain ? `+${fmt(gain)} waiting` : `profit +${fmt(S.meta.renown * G.RENOWN * 100)}%`, gain >= Math.max(10, S.meta.renown) ? 'go' : '');
    if (!G.roomOpen(S, 'tea')) chip('teachip', '茶', 'Tea room', 'shut for now', 'off');
    else if (G.teaOn(S)) chip('teachip', '茶', `Tea ×${G.teaX(S)}`, `${secs(S.tea.until - S.t)} left`, '');
    else if (G.teaReadyIn(S) > 0) chip('teachip', '茶', 'Kettle on', `ready in ${secs(G.teaReadyIn(S))}`, '');
    else chip('teachip', '茶', 'Tea ready', 'serve a bowl', 'go');
    const home = G.tripsReady(S), n = G.clerks(S), free = n - S.trips.length;
    if (home.length) chip('clerkchip', '旅', 'Clerk home', `from ${esc(G.ROUTE[home[0].route].to)}`, 'go');
    else if (S.trips.length) chip('clerkchip', '旅', S.trips.length > 1 ? `${S.trips.length} clerks out` : 'Clerk out', `back in ${secs(Math.min(...S.trips.map(t => t.until - S.t)))}`, '');
    else chip('clerkchip', '旅', `${n} clerk${n > 1 ? 's' : ''} free`, 'send one out', free && G.routesOpen(S).length ? 'go' : '');
  }

  // ---------- the panel views ----------
  function renderTrades() {
    const next = WORKS.find(w => S.year < w.year);
    let h = '';
    if (report) {
      const r = report, bits = [];
      if (r.to > r.from) bits.push(`${r.from} → ${r.to}`);
      bits.push(r.money > 0 ? `+${fmt(r.money)} ${r.unit}` : 'nothing earned, since no trade has a manager yet');
      h += `<div class="away" role="status"><h2>While you were away, ${secs(r.seconds)}${r.capped ? ` (the first ${r.capH} hours count)` : ''}</h2>
        <p>${bits.join(' · ')}.${r.managed || r.money <= 0 ? '' : ' Trades without a manager wait for your tap.'}${r.chapters ? ` ${r.chapters} new chapter${r.chapters > 1 ? 's' : ''}.` : ''}</p>
        <button class="x" data-act="dismiss" aria-label="Dismiss"><svg viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11"/></svg></button></div>`;
    }
    if (S.done) h += `<div class="present"><h2>The present day</h2><p>The ${esc(CLANS[S.house].en)} have come from ${esc(P[G.house(S).home].en)} in 1467 to ${END_YEAR}. Begin again for renown, or keep growing.</p><button class="btn" data-act="tab" data-tab="house">See the house</button></div>`;
    const cross = G.crossings(S)[0];
    if (cross) h += crossCard(cross);
    if (!Object.keys(S.mgr).length && S.year < 1500) h += `<p class="tip">Tap a trade's square to run it. A full bar pays out. Managers run trades for you, even while you are away.</p>`;
    h += `<div class="modes" role="group" aria-label="How many to buy"><span aria-hidden="true">BUY</span>${MODES.map(([m, l]) => `<button data-act="mode" data-m="${m}" aria-pressed="${mode === m}">${l}</button>`).join('')}</div>`;
    for (const w of WORKS.filter(w => G.isOpen(S, w.id))) {
      const id = w.id, ms = G.nextMilestone(S, id);
      const meta = [S.mgr[id] ? `${CHECK}${esc(w.manager[0])}` : S.lv[id] ? 'Tap the square to run' : '', ms ? `${ms.what === 'speed' ? 'twice as fast' : 'profit ×3'} at ${ms.at}` : ''].filter(Boolean).join(' · ');
      h += `<div class="trade" data-id="${id}">
        <button class="tile" data-act="run" data-id="${id}" data-k="run-${id}" aria-label="Run the ${esc(w.en.toLowerCase())}"><span class="g" lang="ja">${w.glyph}</span><span class="lv num">${S.lv[id] || 0}</span></button>
        <div class="body"><h3>${esc(w.en)} <span lang="ja">${w.ja}</span></h3>
        <div class="prog" data-act="run" data-id="${id}"><i></i><span class="in num"><b class="pay"></b><span class="left"></span></span></div>
        <p class="meta">${meta}</p></div>
        <button class="buy" data-act="buy" data-id="${id}" data-k="buy-${id}"><span></span><b class="num"></b></button></div>`;
    }
    if (next) h += `<div class="trade shut"><div class="tile"><span class="g" lang="ja">${next.glyph}</span></div><div class="body"><h3>${esc(next.en)} <span lang="ja">${next.ja}</span></h3><p class="opens">Opens in ${next.year}, when the house has earned <span class="nb">${fmt(G.earnedFor(next.year))} ${unit()}</span>.</p></div></div>`;
    return h;
  }
  // a crossroads: folded, one card with the seal; open, the turning point and the two ways the house can take for this run
  let crossOpen = false;
  function crossCard(c) {
    return `<details class="cross" data-cross${crossOpen ? ' open' : ''}><summary><b lang="ja" aria-hidden="true">決</b><span><span class="kicker">Crossroads · ${c.year}</span>
      <h2>${esc(c.en)} <span lang="ja">${c.ja}</span></h2><small>Two ways for the house. Choose one.</small></span></summary>
      <p class="why">${esc(c.text)}</p>
      <div class="ways">${c.options.map(o => `<button class="way" data-act="choose" data-c="${c.id}" data-o="${o.id}" data-k="choose-${c.id}-${o.id}"><b>${esc(o.en)}</b>
        <span>${esc(o.text)}${S.meta.paths.includes(c.id + ':' + o.id) ? ' · taken before' : ' <i class="new">New path · +1% for good</i>'}</span></button>`).join('')}</div>
      <p class="note">The way holds for this run; a new beginning brings the choice again.</p></details>`;
  }
  const priceButton = (act, id, cost, label = '') => `<button class="btn${S.money >= cost ? ' go' : ''}" data-act="${act}" data-id="${id}" data-k="${act}-${id}" data-cost="${cost}"${S.money >= cost ? '' : ' disabled'}>${label}${fmt(cost)}</button>`;
  const SUBS = [['trades', 'Trades'], ['upgrades', 'Upgrades'], ['managers', 'Managers']];
  function renderShop() {
    return `<h2 class="sr">The shop</h2><div class="subs" role="group" aria-label="The shop">${SUBS.map(([k, l]) => `<button data-act="sub" data-sub="${k}" aria-pressed="${sub === k}">${l}<i class="dot" hidden></i></button>`).join('')}</div>` + SHOP[sub]();
  }
  // how a room works, folded behind a small ?; it stays open or shut as you left it
  const helpOpen = new Set();
  const help = (key, text) => `<details class="help" data-help="${key}"${helpOpen.has(key) ? ' open' : ''}><summary>How it works</summary><p>${text}</p></details>`;

  // ---------- the guests: real people of each age, each a hanging scroll ----------
  const scrollArt = g => `<div class="scroll" aria-hidden="true">${PORTRAITS[g.id] ? `<img src="${PORTRAITS[g.id].src}" alt="" loading="lazy" decoding="async">` : `<b lang="ja" style="--n:${g.ja.length}">${g.ja}</b>`}</div>`;
  const gift = g => g.does.work ? `${WORK[g.does.work].en} profit ×2${G.isOpen(S, g.does.work) ? '' : ` (opens in ${WORK[g.does.work].year})`}` : g.does.all ? 'All profit +10%' :
    g.does.room ? 'Opens the tea room' : g.does.tea ? 'Tea triples profit instead of doubling it' : g.does.chapter ? 'Chapters count double' : 'Provinces count double';
  const bondDots = b => `<span class="bond" role="img" aria-label="Bond ${b} of ${G.BOND_MAX}">${Array.from({ length: G.BOND_MAX }, (_, i) => `<i class="${i < b ? 'on' : ''}"></i>`).join('')}</span>`;
  // the alcove: the guest at the door (or the next to come, or the last to join) as a large scroll
  function alcove(g, state) {
    const b = G.bond(S, g.id);
    return `<section class="hero alcove${state === 'soon' ? ' quiet' : ''}" data-g="${g.id}"><i aria-hidden="true"></i><div class="wall">${scrollArt(g)}<div class="who-is">
      <span class="kicker">${state === 'waiting' ? 'Visiting now' : state === 'soon' ? `Comes in ${g.from}` : 'With the house'}</span>
      <h2>${esc(g.en)}</h2><p class="who"><span lang="ja">${g.ja}</span> · ${esc(g.role)}, ${g.life}</p>
      <p class="what">${esc(g.text)}</p><p class="gift">${gift(g)}</p>
      ${state === 'soon' ? '' : bondDots(b)}${state === 'waiting' ? priceButton('welcome', g.id, G.welcomeCost(S, g), 'Welcome · ') : ''}</div></div></section>`;
  }
  function renderGuests() {
    const waiting = G.visitors(S), stay = GUESTS.filter(g => S.guests.includes(g.id)), soon = G.nextGuest(S), met = Object.keys(S.meta.bond || {}).length;
    const top = waiting[0] ? [waiting[0], 'waiting'] : soon ? [soon, 'soon'] : stay.length ? [stay[stay.length - 1], 'in'] : null;
    let h = top ? alcove(...top) : '';
    if (waiting.length > 1) h += `<h3 class="sub">Also visiting</h3>` + waiting.slice(1).map(g => `<div class="visit" data-g="${g.id}">${scrollArt(g)}<div><h3>${esc(g.en)} <span lang="ja">${g.ja}</span></h3>${gift(g)}</div>${priceButton('welcome', g.id, G.welcomeCost(S, g), 'Welcome · ')}</div>`).join('');
    h += help('guests', 'Famous people of each age visit the house in their own years. Welcome one and they stay for this run. Each run you welcome them the bond grows, and so does their help.');
    // with the house, then the next to come as a shadow, then a couple still rolled up
    const later = GUESTS.filter(g => !S.guests.includes(g.id) && !waiting.includes(g) && g !== soon && g.from > S.year).slice(0, soon && top[1] !== 'soon' ? 1 : 2);
    h += `<h3 class="sub">With the house <span class="count">${met} of ${GUESTS.length} met</span></h3><div class="gallery">`;
    h += stay.slice().reverse().map(g => `<figure data-g="${g.id}">${scrollArt(g)}<figcaption>${esc(g.en)}<span>${gift(g)}</span></figcaption>${bondDots(G.bond(S, g.id))}</figure>`).join('');
    if (soon && top[1] !== 'soon') h += `<figure class="later shadow">${scrollArt(soon)}<figcaption>Comes in ${soon.from}<span>Next guest</span></figcaption></figure>`;
    h += later.map(g => `<figure class="later"><div class="rolled" aria-hidden="true"></div><figcaption><span lang="ja">${AGES[G.ageOf(g.from)].ja.split('・')[0]}</span><span>Later</span></figcaption></figure>`).join('');
    return h + '</div>';
  }

  // ---------- journeys: clerks on the roads, and the roads they can take ----------
  const hours = n => `${n} hour${n > 1 ? 's' : ''}`;
  // the road scroll: home on the right, the road winding left past each open road's station (further for longer roads),
  // clerks as dots of the house dye on their way out. Drawn once per rebuild; the dots move in numbers().
  const roadAt = t => [356 - t * 318, 150 - 72 * t + 20 * Math.sin(t * Math.PI * 2.4)];
  const STOP_T = { 1: .24, 2: .44, 4: .67, 8: .9 };
  const f1 = v => v.toFixed(1);
  const roadPath = (to, n = 40) => 'M' + Array.from({ length: n + 1 }, (_, i) => roadAt(to * i / n).map(f1).join(' ')).join('L');
  let stations = {};
  function roadMap() {
    const home = P[G.house(S).home], seen = {};
    stations = {};
    let marks = '';
    for (const r of G.routesOpen(S)) {
      const k = seen[r.hours] = (seen[r.hours] || 0) + 1, t = STOP_T[r.hours] || .5, [x, y] = roadAt(t), dy = k === 1 ? 0 : k === 2 ? -40 : 40;
      stations[r.id] = { t, x, y: y + dy };
      if (dy) marks += `<path d="M${f1(x)} ${f1(y)}V${f1(y + dy)}" stroke="#8f857b" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round" fill="none"/>`;
      marks += `<g transform="translate(${f1(x)} ${f1(y + dy)})"><rect x="-14" y="-14" width="28" height="28" rx="5" fill="#2c2019"/><text y="6" text-anchor="middle" font-size="16" font-weight="700" fill="#e2c27f" style="font-family:var(--mincho)">${r.glyph}</text><text y="${dy < 0 ? -19 : 27}" text-anchor="middle" font-size="10.5" font-weight="500" fill="#3d342c">${esc(r.to)}</text></g>`;
    }
    const [hx, hy] = roadAt(0);
    return `<svg viewBox="0 0 390 220" role="img" aria-label="The roads from ${esc(home.en)}: ${G.routesOpen(S).map(r => esc(r.to)).join(', ')}">
      <path d="M0 64Q40 26 80 52Q120 16 170 46Q210 20 250 44Q300 12 340 40Q370 24 390 38V0H0Z" fill="#ddd2bd" opacity=".7"/>
      <path d="M0 92Q50 58 96 86Q140 60 180 88Q236 62 280 84Q330 62 390 78V0H0Z" fill="#d5c9b2" opacity=".5"/>
      <rect x="-20" y="58" width="230" height="5" rx="2.5" fill="#f2ecdf" opacity=".9"/><rect x="190" y="70" width="230" height="5" rx="2.5" fill="#f2ecdf" opacity=".9"/>
      <path d="M-10 220V178Q30 162 54 188Q72 206 120 212Q170 218 210 220Z" fill="#d9dcd3"/><path d="M-10 184Q30 168 52 192" fill="none" stroke="#c4c9bd"/>
      <g fill="#cbbfa9"><path d="M262 128q10-16 20 0z"/><path d="M276 132q8-12 16 0z"/><path d="M128 150q9-14 18 0z"/><path d="M114 156q7-11 14 0z"/><path d="M300 100q9-14 18 0z"/></g>
      <path d="${roadPath(1, 60)}" fill="none" stroke="#8f857b" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>
      <g id="roadclerks"></g>${marks}
      <g transform="translate(${f1(hx)} ${f1(hy)})"><rect class="home" x="-15" y="-15" width="30" height="30" rx="5"/><text y="6" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" style="font-family:var(--mincho)">${home.ja[0]}</text><text y="29" text-anchor="middle" font-size="10.5" font-weight="500" fill="#3d342c">${esc(home.en)}</text></g></svg>`;
  }
  // every few frames on the journeys room: the clerks' dots and the note over the map
  let roadWas = '';
  function paintRoad() {
    const g = document.getElementById('roadclerks');
    if (!g) return;
    let s = '';
    for (const t of S.trips) {
      const st = stations[t.route]; if (!st) continue;
      const k = Math.min(1, Math.max(0, 1 - (t.until - S.t) / (G.ROUTE[t.route].hours * 3600))), at = st.t * Math.round(k * 400) / 400, [x, y] = k >= 1 ? [st.x, st.y] : roadAt(at);
      s += `<path class="trail" d="${roadPath(at, 24)}"/><circle class="clerk" cx="${f1(x)}" cy="${f1(y)}" r="6"/>`;
    }
    if (s !== roadWas) { roadWas = s; g.innerHTML = s; }
    const t = S.trips[0], free = G.clerks(S) - S.trips.length;
    const note = t ? (S.t >= t.until ? `Clerk home from ${G.ROUTE[t.route].to}` : `Clerk to ${G.ROUTE[t.route].to} · back in ${secs(t.until - S.t)}`) : `${free} clerk${free > 1 ? 's' : ''} free · send one below`;
    const n = document.getElementById('roadnote'); if (n && n.textContent !== note) n.textContent = note;
  }
  function renderTrips() {
    const n = G.clerks(S), free = n - S.trips.length, found = S.meta.goods, next = ROUTES.find(r => S.year < r.year), all = ROUTES.length * 3;
    let h = `<section class="hero roadmap">${roadMap()}<p class="hero-note" id="roadnote"></p></section>`;
    h += `<div class="found"><b lang="ja" aria-hidden="true">品</b><div><p><b>Famous goods found</b><span class="num">${found.length} of ${all}</span></p>
      <div class="meter"><i style="transform:scaleX(${found.length / all})"></i></div><small>+1% to everything for each, for good</small></div></div>`;
    h += help('trips', "Send a clerk along a trade road. They come home after some hours, even while you are away, with money and one of the road's famous goods. Every good the house has ever brought home adds 1% profit for good.");
    h += `<h3 class="sub">Roads <span lang="ja">街道</span><span class="count">${free} of ${n} clerk${n > 1 ? 's' : ''} free</span></h3>`;
    for (const r of G.routesOpen(S).slice().reverse()) {
      const t = S.trips.find(x => x.route === r.id), back = t && S.t >= t.until;
      h += `<div class="pass"${t ? ` data-trip="${r.id}"` : ''}><span class="tag" lang="ja" aria-hidden="true">${r.glyph}</span><div><h3>${esc(r.en)}</h3>
        ${!t ? `<p class="who">${hours(r.hours)} to ${esc(r.to)} · about +${fmt(G.tripPay(S, r))} ${unit()}</p>` : back ? `<p class="who out">Home from ${esc(r.to)}</p>` : `<p class="who out">On the road · back in <span class="left num"></span></p><div class="meter"><u></u></div>`}
        <p class="goods">${r.goods.map(([g, en, ja]) => found.includes(r.id + ':' + g) ? `<span class="got" lang="ja" title="${esc(en)}">${ja}</span>` : '<span>?</span>').join('')}</p></div>
        ${back ? `<button class="btn go" data-act="unload" data-id="${r.id}" data-k="unload-${r.id}">Unload</button>` : t ? '<button class="btn" disabled>Away</button>' : `<button class="btn${free ? ' go' : ''}" data-act="send" data-id="${r.id}" data-k="send-${r.id}"${free ? '' : ' disabled'}>Send</button>`}</div>`;
    }
    if (next) h += `<p class="note after">The next road opens in ${next.year}: ${esc(next.en)}.</p>`;
    if (n < 3) h += `<p class="note">${n === 1 ? 'A second clerk joins in 1603.' : 'A third clerk joins in 1868.'}</p>`;
    return h;
  }

  // ---------- the tea room ----------
  function renderTea() {
    const open = G.roomOpen(S, 'tea'), on = open && G.teaOn(S), wait = open && G.teaReadyIn(S) > 0, x = G.teaX(S);
    const why = x > 2 ? ` (${G.doing(S, 'tea').map(g => g.en).join(', ')} is staying)` : '';
    let h = `<section class="hero tatami"><svg class="bowl${on ? ' on' : ''}" viewBox="0 0 80 72" aria-hidden="true">
        <defs><linearGradient id="raku" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset=".55" stop-color="#1f1714"/><stop offset="1" stop-color="#120d0b"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="1.1"/></filter></defs>
        <g class="steam" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" filter="url(#soft)">
          <path d="M33 30c-5-6 5-9 0-15s4-9 1-13"/><path d="M46 30c5-6-5-10 1-16s-3-8 1-12"/></g>
        <path d="M8 34c1-2 9-3 32-3s30 1 32 3c-1 13-6 25-15 30-5 3-28 3-34 0C14 59 9 47 8 34z" fill="url(#raku)"/>
        <path d="M14 46c4 5 6 1 9 6M60 44c-3 6-6 2-8 8" stroke="#5c4433" stroke-width="2" fill="none" opacity=".7"/>
        <ellipse cx="40" cy="33.5" rx="30" ry="3.6" fill="#7d8c4c"/>
        <path d="M9 33c3-2 12-3 31-3s28 1 31 3" fill="none" stroke="#5a443a" stroke-width="1.6"/>
        <rect x="29" y="64" width="22" height="6" rx="2" fill="#120d0b"/></svg><div>
      <h2>Tea ceremony <span lang="ja">茶の湯</span></h2>
      ${!open ? `<p>The tea room is shut. Welcome Murata Jukō <span lang="ja">村田珠光</span>, the tea master, to open it.</p><button class="btn" data-act="tab" data-tab="guests">Go to the guests</button></div></section>` :
      `<p>${on ? `Tea is served: profit ×${x}${why}.` : wait ? 'The kettle is heating for the next bowl.' : `Serve tea and every trade earns ×${x} for 30 minutes${why}.`}</p>
      ${on ? `<p class="clock"><span id="teaclock" class="num"></span> left</p>` : wait ? `<p class="clock">Ready in <span id="teaclock" class="num"></span></p>` : `<button class="btn go" data-act="tea" data-k="tea">Serve tea</button>`}</div></section>`}`;
    if (!open) return h;
    const d = S.day;
    h += help('tea', 'Tea can be served every 4 hours. Three tasks a day, new each day; each pays a twentieth of what this run has earned.');
    h += `<h3 class="sub">Today's tasks <span lang="ja">今日の務め</span></h3>`;
    for (const id of d.tasks) {
      const t = TASKS.find(x => x.id === id), done = G.taskDone(S, id), got = d.got.includes(id);
      h += `<div class="task"><div><h3>${esc(t.en.replace('{n}', t.n))}</h3><p class="num" data-task="${id}"></p></div>
        ${got ? `<span class="hired">${CHECK} Done</span>` : `<button class="btn${done ? ' go' : ''}" data-act="claim" data-id="${id}" data-k="claim-${id}"${done ? '' : ' disabled'}>${done ? 'Claim' : 'Not yet'}</button>`}</div>`;
    }
    return h;
  }
  function renderUpgrades() {
    const all = G.upgrades(S), open = all.filter(u => u.open && !u.owned), owned = all.filter(u => u.owned).length;
    let h = help('upgrades', "Each one triples a trade's profit; the great works of each age (天) triple them all.") + `<p class="note after">${owned} of ${all.length} bought.</p>`;
    h += open.slice(0, 12).map(u => `<div class="item"><span class="tag" lang="ja" aria-hidden="true">${u.realm ? '天' : WORK[u.work].glyph}</span><h3>${esc(u.en)} <span lang="ja">${u.ja}</span></h3><p>${esc(u.text)}</p>
      ${priceButton('upg', u.id, u.cost)}</div>`).join('');
    if (!open.length) h += `<p class="note">New upgrades come with new trades and new ages.</p>`;
    return h;
  }
  function renderManagers() {
    let h = help('managers', `A manager runs a trade for you, without a tap, and keeps it running while you are away (up to ${G.AWAY_HOURS} hours).`);
    for (const w of WORKS.filter(w => G.isOpen(S, w.id))) {
      const c = G.managerCost(S, w.id);
      h += `<div class="item"><span class="tag" lang="ja" aria-hidden="true">${w.glyph}</span><h3>${esc(w.manager[0])} <span lang="ja">${w.manager[1]}</span></h3><p>Runs the ${esc(w.en.toLowerCase())}.</p>
        ${S.mgr[w.id] ? `<span class="hired">${CHECK} Hired</span>` : priceButton('hire', w.id, c)}</div>`;
    }
    return h;
  }
  function chapterHtml(e, unread) {
    const by = e.sides.find(c => CRESTS[c]) || (e.winner && CRESTS[e.winner] ? e.winner : null) || (() => { const h = G.holdersAt(e.year)[e.at]; const c = [].concat(h || [])[0]; return c && CRESTS[c] ? c : null; })();
    return `<li class="entry ${unread ? 'unread' : ''}" data-id="${e.id}">
      <div><div class="y num">${e.year}</div>${disc(by, e.at)}</div>
      <div><h3>${esc(e.en)} <span lang="ja" class="nb">${e.ja}</span></h3><p class="where">${placeName(e.at)}${by ? ` · ${clanName(by)}` : ''}</p>
      ${unread ? `<button class="btn go" data-act="read" data-id="${e.id}" data-k="r-${e.id}">Read · profit +${Math.round(G.CHAPTER * 100)}%</button>` : `<p class="story">${esc(e.short)}</p>`}</div></li>`;
  }
  function renderChron() {
    const u = S.unread.length;
    let h = `<section class="hero annals"><div class="title"><b lang="ja" aria-hidden="true">年代記</b><div><h2>Chronicle of the ${esc(CLANS[S.house].en)}</h2>
      <p>${S.readIds.length} chapter${S.readIds.length === 1 ? '' : 's'} read${u ? ` · ${u} new, profit +${Math.round(G.CHAPTER * 100)}% each` : ''}</p>
      ${u > 1 ? `<button class="btn go" data-act="readall">Read all ${u}</button>` : ''}</div></div></section>`;
    if (u) h += `<ol class="entries">${S.unread.map(id => chapterHtml(CHAPTER[id], true)).join('')}</ol>`;
    const items = [...S.readIds.map(id => ({ y: CHAPTER[id].year, e: CHAPTER[id] })), ...S.chron.map(c => ({ y: c.y, c }))].sort((a, b) => b.y - a.y || (a.e ? -1 : 1));
    h += `<ol class="entries">${items.slice(0, older).map(x => x.e ? chapterHtml(x.e, false) : `<li class="entry house"><div><div class="y num">${x.y}</div></div><div><h3>${esc(x.c.en)}</h3></div></li>`).join('')}</ol>`;
    if (items.length > older) h += `<button class="btn more" data-act="older">Show older</button>`;
    return h;
  }
  function renderHouse() {
    const h = G.house(S), m = S.meta, gain = G.renownGain(S);
    const found = TREASURES.filter(x => m.treasures.includes(x.id));
    let x = `<section class="hero register">${crest(S.house, 'crest') || disc(null, h.home)}<div>
      <h2>${esc(CLANS[S.house].en)} <span lang="ja">${CLANS[S.house].ja}</span></h2>
      <p>From ${placeName(h.home)} · ${esc(h.motto)} <span lang="ja">${h.mottoJa}</span>: ${esc(h.text.toLowerCase())}</p>
      <p>Head of the house: ${esc(G.headName(S))}, since ${S.head.from}</p>
      <span class="x num">Everything together: profit ×${fmt(G.profitAll(S))}</span></div></section>
      ${help('house', `Your house follows its own line of heads; the history around it is the real one. It reaches a new province every few years, always the richest next to its land; a treasure turns up for every few provinces. At each crossroads the house takes one way for the run, and every way ever taken adds 1% profit for good.`)}
      <div class="renown"><h3>Renown <span lang="ja">名声</span> <span class="fig num">${fmt(m.renown)}</span> <small>profit +${fmt(m.renown * G.RENOWN * 100)}%</small></h3>
      <p>Begin again in 1467 with any house: the fame this run has won turns into renown for good. The treasures stay; the trades, provinces and money start over.${m.runs ? '' : ' Chapters you have read stay read.'}</p>
      <button class="btn ${gain >= Math.max(10, m.renown) ? 'go' : ''}" data-act="again" ${gain > 0 ? '' : 'disabled'}>${gain > 0 ? `Begin again · +${fmt(gain)} renown` : 'No renown to win yet'}</button></div>
      <h3 class="sub">Provinces <span lang="ja">領国</span> <span class="fig num">${S.reach.length} of ${PIDS.length}, profit +${Math.round((S.reach.length - 1) * G.PROVINCE * 100)}%</span></h3>
      <div class="provs">${S.reach.map(p => `<span>${esc(P[p].en)} <span lang="ja">${P[p].ja}</span></span>`).join('')}</div>`;
    if (S.heads.length) x += `<h3 class="sub">Heads before</h3><ul class="heads">${S.heads.map(p => `<li><b>${esc(p.given)}</b> ${p.from}–${p.until}</li>`).join('')}</ul>`;
    const reached = CROSSROADS.filter(c => c.year <= Math.max(S.year, m.best));
    x += `<h3 class="sub">Crossroads <span lang="ja">岐路</span> <span class="fig num">${m.paths.length} of ${CROSSROADS.length * 2} ways taken, profit +${Math.round(m.paths.length * G.PATH * 100)}%</span></h3>
      ${reached.length ? `<ul class="paths">${reached.map(c => `<li><span class="num">${c.year}</span> <b>${esc(c.en)}</b> ${c.options.map(o => { const ever = m.paths.includes(c.id + ':' + o.id); return `<span class="${ever ? 'ever' : ''}${S.choices[c.id] === o.id ? ' now' : ''}">${ever ? CHECK : ''}${esc(o.en)}${S.choices[c.id] === o.id ? ' · this run' : ''}</span>`; }).join('')}</li>`).join('')}</ul>` : ''}
      ${CROSSROADS.length > reached.length ? `<p class="note after">${CROSSROADS.length - reached.length} more ahead.</p>` : ''}`;
    x += `<h3 class="sub">Treasures <span lang="ja">家宝</span> <span class="fig num">${found.length} of ${TREASURES.length}, profit +${Math.round(found.length * G.TREASURE * 100)}%</span></h3>
      ${found.length ? `<div class="treasures">${found.map(t => `<div class="tr"><b>${esc(t.en)}</b><span lang="ja">${t.ja}</span><br>${esc(t.kind)}</div>`).join('')}</div>` : ''}
      <p class="note after">${TREASURES.length - found.length} still to find.</p>
      <h3 class="sub">Your save</h3>
      ${standalone ? '' : `<p class="note">In a browser tab, the save can be cleared after a week without a visit (Safari does this). Add Tenka to your Home Screen to keep it: there it keeps its own save, so copy this one first and load it there.</p>`}
      <div class="tools"><button class="btn" data-act="copy">Copy save</button><button class="btn" data-act="paste">Load a save</button><button class="btn" data-act="restart">Start over</button></div>
      <p class="credits">Clan crests from Wikimedia Commons, each under its own licence. Province names and history from the Sengoku map project. Fonts: Shippori Mincho B1, Zen Kaku Gothic New and Yuji Syuku (SIL OFL). The history is written for the game from standard accounts and simplified; yields are approximate.</p>
      <details class="credits"><summary>Crest credits</summary>${Object.entries(CRESTS).map(([k, c]) => `${esc(CLANS[k] ? CLANS[k].en : k)}: ${esc(c.artist || 'unknown')}, ${esc(c.licence)}, <a href="${esc(c.page)}" rel="noopener">Wikimedia Commons</a>`).join('<br>')}</details>
      <details class="credits"><summary>Portrait credits</summary>${Object.entries(PORTRAITS).map(([id, p]) => `${esc(GUESTS.find(g => g.id === id).en)}: ${esc(p.author)}, ${esc(p.licence)}, <a href="${esc(p.page)}" rel="noopener">Wikimedia Commons</a>`).join('<br>')}</details>`;
    return x;
  }
  const SHOP = { trades: renderTrades, upgrades: renderUpgrades, managers: renderManagers };
  const VIEWS = { shop: renderShop, guests: renderGuests, trips: renderTrips, tea: renderTea, chron: renderChron, house: renderHouse };

  // ---------- keeping the screen current ----------
  // the trade rows' moving parts, found once after each rebuild
  let rows = [];
  function cacheRows() {
    rows = [...panel.querySelectorAll('.trade[data-id]')].map(row => {
      const id = row.dataset.id, buy = row.querySelector('.buy');
      return { id, row, tile: row.querySelector('.tile'), badge: row.querySelector('.lv'), prog: row.querySelector('.prog'), bar: row.querySelector('.prog i'),
        pay: row.querySelector('.pay'), left: row.querySelector('.left'), buy, n: buy.querySelector('span'), price: buy.querySelector('b'), last: {}, was: null };
    });
  }
  const set = (o, k, el, v, prop = 'textContent') => { if (o.last[k] !== v) { o.last[k] = v; el[prop] = v; } };
  // every frame: the bars, and a small pulse on a square when its cycle pays
  function bars() {
    for (const r of rows) {
      const c = G.cycle(S, r.id), p = S.prog[r.id], fast = S.mgr[r.id] && c < .25;
      if (!fast && r.was != null && (p == null || p < r.was) && c >= .3 && !reduced) {
        r.tile.animate([{ transform: 'scale(1.07)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
        // the payout's figure rises off the board
        const f = document.createElement('b');
        f.className = 'float num'; f.textContent = '+' + fmt(G.payout(S, r.id, G.profitAll(S)));
        r.row.append(f);
        f.animate([{ transform: 'translateY(4px)', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: 'translateY(-26px)', opacity: 0 }], { duration: 950, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => f.remove();
      }
      r.was = p;
      if (r.last.fastOn !== !!fast) { r.last.fastOn = !!fast; r.prog.classList.toggle('fast', !!fast); }
      if (!fast) r.bar.style.transform = `scaleX(${p == null ? 0 : Math.min(1, p / c)})`;
    }
  }
  // a few times a second: the numbers, the buy buttons, the dots on the tabs
  function numbers() {
    paintTop();
    $('#money').textContent = fmt(S.money);
    $('#unit').textContent = unit();
    $('#coin').textContent = unit() === 'yen' ? '円' : '石';
    paintChips();
    const inc = G.income(S);
    $('#rate').textContent = inc > 0 ? `+${fmt(inc)} a second` : 'tap a trade to earn';
    const all = G.profitAll(S);
    for (const r of rows) {
      const id = r.id, c = G.cycle(S, id), p = S.prog[id], fast = S.mgr[id] && c < .25, lv = S.lv[id] || 0;
      set(r, 'lv', r.badge, String(lv));
      if (r.last.idle !== (lv > 0 && !S.mgr[id] && p == null)) { r.last.idle = lv > 0 && !S.mgr[id] && p == null; r.tile.classList.toggle('idle', r.last.idle); }
      set(r, 'pay', r.pay, lv ? (fast ? `+${fmt(G.payout(S, id, all) / c)} a second` : `+${fmt(G.payout(S, id, all))}`) : 'not yet bought');
      set(r, 'left', r.left, lv && !fast ? secs(p == null ? c : Math.max(0, c - p)) : '');
      const o = G.offer(S, id, mode);
      set(r, 'n', r.n, lv ? `Buy ×${o.n}` : 'Open');
      set(r, 'price', r.price, fmt(o.price));
      if (r.last.ok !== o.ok) { r.last.ok = o.ok; r.buy.classList.toggle('ok', o.ok); r.buy.setAttribute('aria-disabled', !o.ok); }
    }
    if (tab !== 'shop' || sub !== 'trades') panel.querySelectorAll('[data-cost]').forEach(b => { const ok = S.money >= +b.dataset.cost; if (b.classList.contains('go') !== ok) { b.disabled = !ok; b.classList.toggle('go', ok); } });
    if (tab === 'trips') {
      paintRoad();
      panel.querySelectorAll('.pass[data-trip]').forEach(el => {
        const t = S.trips.find(x => x.route === el.dataset.trip); if (!t) return;
        const k = Math.min(1, Math.max(0, 1 - (t.until - S.t) / (G.ROUTE[t.route].hours * 3600))), u = el.querySelector('u'), l = el.querySelector('.left');
        if (u) u.style.transform = `scaleX(${k})`;
        if (l) l.textContent = secs(Math.max(0, t.until - S.t));
      });
    }
    if (tab === 'tea') {
      const c = $('#teaclock');
      if (c) c.textContent = secs(G.teaOn(S) ? S.tea.until - S.t : G.teaReadyIn(S));
      panel.querySelectorAll('[data-task]').forEach(p => { const t = TASKS.find(x => x.id === p.dataset.task); p.textContent = `${Math.min(t.n, S.day.c[t.id] || 0)} of ${t.n}`; });
    }
  }
  function dots() {
    const ups = G.upgrades(S).filter(u => u.open && !u.owned && u.cost <= S.money).length;
    const mgrs = WORKS.filter(w => G.isOpen(S, w.id) && !S.mgr[w.id] && G.managerCost(S, w.id) <= S.money).length;
    G.daily(S, new Date().toDateString());
    const tasks = S.day.tasks.filter(t => G.taskDone(S, t) && !S.day.got.includes(t)).length;
    const vis = G.visitors(S);
    // a dot only for something that can be done now: never on a shut room
    const ways = G.crossings(S);
    dot('shop', ups + mgrs + ways.length); dot('guests', vis.filter(g => G.welcomeCost(S, g) <= S.money).length);
    const home = G.tripsReady(S), idle = Math.min(G.clerks(S) - S.trips.length, G.routesOpen(S).filter(r => !S.trips.some(t => t.route === r.id)).length);
    dot('trips', home.length + idle);
    for (const t of home) if (!announced.has('t' + t.until)) { announced.add('t' + t.until); if (announced.ready && tab !== 'trips') toast(`A clerk is home from ${G.ROUTE[t.route].to}`); }
    dot('tea', G.roomOpen(S, 'tea') ? (!G.teaReadyIn(S) && !G.teaOn(S) ? 1 : 0) + tasks : 0); dot('chron', S.unread.length);
    for (const [k, n] of [['upgrades', ups], ['managers', mgrs]]) { const d = panel.querySelector(`.subs [data-sub="${k}"] .dot`); if (d && d.textContent !== (n ? String(n) : '')) { d.textContent = n ? String(n) : ''; d.hidden = !n; } }
    // a guest at the door and a clerk home show as paper tags on the street before the shop
    const door = vis.slice(0, 1).map(g => `<button data-act="tab" data-tab="guests">${esc(g.en.split(' ').pop())} is at the door</button>`).join('') +
      home.slice(0, 1).map(t => `<button data-act="tab" data-tab="trips">Clerk home from ${esc(G.ROUTE[t.route].to)}</button>`).join('');
    if (doorWas !== door) { doorWas = door; $('#door').innerHTML = door; }
    // a new visitor is news
    for (const g of vis) if (!announced.has(g.id)) { announced.add(g.id); if (announced.ready) toast(`A visitor: ${g.en} ${g.ja}`); }
    // a crossroads is news only away from the trades, where its notice already shows
    if (ways[0] && !announced.has(ways[0].id)) { announced.add(ways[0].id); if (announced.ready && !(tab === 'shop' && sub === 'trades')) toast(`A crossroads: ${ways[0].en}`); }
    announced.ready = true;
  }
  const announced = new Set();
  let doorWas = null;
  function dot(t, n) {
    const b = document.querySelector(`#tabs [data-tab="${t}"] .dot`), v = n ? String(n) : '';
    if (b.textContent !== v) { b.textContent = v; b.hidden = !v; b.parentNode.setAttribute('aria-label', b.parentNode.querySelector('.l').textContent + (v ? `, ${v} to do` : '')); }
  }

  // the panel's markup, rebuilt only when what it shows has changed
  let structKey = '', topKey = '';
  function render(force) {
    if (!S) return;
    const shop = { trades: () => [(G.crossings(S)[0] || {}).id, WORKS.filter(w => G.isOpen(S, w.id)).length, Object.keys(S.mgr).join(), WORKS.map(w => { const m = G.nextMilestone(S, w.id); return m && m.at; }).join(), S.done, !!report, mode],
      upgrades: () => [S.upg.length, G.upgrades(S).filter(u => u.open).length], managers: () => [Object.keys(S.mgr).length, WORKS.filter(w => G.isOpen(S, w.id)).length] };
    const bits = { shop: () => [sub, ...shop[sub]()],
      guests: () => [S.guests.join(), G.visitors(S).map(g => g.id).join(), (G.nextGuest(S) || {}).id, WORKS.filter(w => G.isOpen(S, w.id)).length],
      trips: () => [S.trips.map(t => t.route + (S.t >= t.until ? '!' : '')).join(), G.clerks(S), G.routesOpen(S).length, S.meta.goods.length],
      tea: () => { G.daily(S, new Date().toDateString()); return [G.roomOpen(S, 'tea'), G.teaOn(S), G.teaReadyIn(S) > 0, S.day.key, S.day.got.join(), S.day.tasks.filter(t => G.taskDone(S, t)).join()]; },
      chron: () => [S.unread.join(), S.readIds.length, S.chron.length, older],
      house: () => [S.meta.paths.length, Object.keys(S.choices).length, S.heads.length, S.reach.length, S.readIds.length, G.renownGain(S), S.meta.treasures.length] };
    const tk = S.house + '|' + S.head.given + '|' + S.reach.length;
    if (tk !== topKey) { topKey = tk; topYear = null; renderTop(); }
    const k = tab + '|' + S.house + '|' + bits[tab]().join('|');
    if (force || k !== structKey) {
      structKey = k;
      const f = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.k;
      view.innerHTML = VIEWS[tab]();
      cacheRows();
      if (f) { const t = panel.querySelector(`[data-k="${f}"]`); if (t) t.focus(); }
    }
    numbers();
  }
  function toast(t) { $('#toast').innerHTML = `<span>${esc(t)}</span>`; }

  function setTab(t) {
    const scrolled = (setTab.pos = setTab.pos || {});
    scrolled[tab] = panel.scrollTop;
    tab = t;
    $('#front').hidden = t !== 'shop'; // the shop front stands only on the shop
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false'));
    render(true);
    panel.scrollTop = scrolled[t] || 0;
    if (!reduced) { panel.classList.remove('fade'); void panel.offsetWidth; panel.classList.add('fade'); }
  }
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  // the curtain only sways to a touch; renown has its own plate
  $('#house').addEventListener('click', () => {
    if (!reduced) document.querySelectorAll('#house .pn').forEach((p, i) => p.animate([{ transform: 'none' }, { transform: 'rotate(1.4deg)' }, { transform: 'rotate(-.8deg)' }, { transform: 'rotate(.3deg)' }, { transform: 'none' }], { duration: 1100, delay: i * 70, easing: 'ease-out' }));
  });
  // the top bar's chips open their rooms; renown goes straight to its card in the house
  document.querySelectorAll('#hud [data-go]').forEach(b => b.addEventListener('click', () => {
    setTab(b.dataset.go);
    const r = b.id === 'renown' && panel.querySelector('.renown');
    if (r) panel.scrollTop += r.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12;
  }));
  // folded help and the crossroads card stay as they were left across rebuilds
  panel.addEventListener('toggle', e => {
    const d = e.target;
    if (d.dataset.help) d.open ? helpOpen.add(d.dataset.help) : helpOpen.delete(d.dataset.help);
    if ('cross' in d.dataset) crossOpen = d.open;
  }, true);

  panel.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act, id = a.dataset.id;
    if (act === 'run') { if (!S.lv[id] && G.offer(S, id, 1).ok) G.buy(S, id, 1); G.run(S, id); }
    if (act === 'buy') {
      const was = G.nextMilestone(S, id), n = G.buy(S, id, mode);
      if (n && was && (S.lv[id] || 0) >= was.at) toast(`${WORK[id].en}: ${was.what === 'speed' ? 'twice as fast' : 'profit ×3'}`);
      if (n && report) report = null;
    }
    if (act === 'mode') mode = a.dataset.m === 'max' ? 'max' : +a.dataset.m;
    if (act === 'sub') { sub = a.dataset.sub; render(true); panel.scrollTop = 0; return; }
    if (act === 'welcome' && G.welcome(S, id)) {
      const g = GUESTS.find(x => x.id === id);
      toast(`${g.en} joins the house`);
      if (window.street) street.event('guest', g.en);
      render(true); save();
      // the guest's scroll unrolls as they join
      const sc = panel.querySelector(`[data-g="${id}"] .scroll`);
      if (sc && !reduced) { sc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); sc.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }); }
      return;
    }
    if (act === 'choose') {
      if (choosing) return;
      const o = G.optionOf(a.dataset.c, a.dataset.o), go = () => { choosing = false; if (G.choose(S, a.dataset.c, a.dataset.o)) toast(o.done); render(); save(); };
      if (reduced) return go();
      choosing = true;
      const seal = document.createElement('b'); seal.className = 'seal'; seal.lang = 'ja'; seal.setAttribute('aria-hidden', 'true'); seal.textContent = '決';
      a.append(seal); a.classList.add('taken');
      seal.animate([{ transform: 'scale(1.8) rotate(-14deg)', opacity: 0 }, { transform: 'scale(.92) rotate(-8deg)', opacity: 1, offset: .55 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.6,1)', fill: 'forwards' });
      setTimeout(go, 750);
      return;
    }
    if (act === 'send' && G.sendTrip(S, id)) { toast(`A clerk sets out for ${G.ROUTE[id].to}`); if (window.street) street.event('clerk', `To ${G.ROUTE[id].to}`); }
    if (act === 'unload') {
      const u = G.unload(S, id);
      if (u) toast(`Home from ${G.ROUTE[id].to}: ${u.good.en} ${u.good.ja}${u.fresh ? ', new: +1% for good' : ''} · +${fmt(u.pay)} ${unit()}${u.treasure ? ` · and a treasure: ${u.treasure.en}` : ''}`);
    }
    if (act === 'tea' && G.serveTea(S)) toast(`Tea is served: profit ×${G.teaX(S)} for 30 minutes`);
    if (act === 'claim') { const pay = G.claimTask(S, id); if (pay) toast(`+${fmt(pay)} ${unit()}`); }
    if (act === 'hire' && G.hire(S, id)) { toast(`${WORK[id].manager[0]} hired`); report = null; }
    if (act === 'upg' && G.buyUpgrade(S, id)) toast('Profit ×3');
    if (act === 'dismiss') report = null;
    if (act === 'tab') return setTab(a.dataset.tab);
    if (act === 'read') { G.read(S, id); toast(`Profit +${Math.round(G.CHAPTER * 100)}%`); }
    if (act === 'readall') { const k = S.unread.length; while (S.unread.length) G.read(S, S.unread[0]); toast(`${k} chapters read`); }
    if (act === 'older') older += 50;
    if (act === 'again' && confirm(`Begin again in 1467? You gain ${fmt(G.renownGain(S))} renown for good; trades, provinces and money start over.`)) return showPick('again');
    if (act === 'copy') {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      try { await navigator.clipboard.writeText(code); toast('Save copied'); } catch { prompt('Copy your save:', code); }
    }
    if (act === 'paste') {
      const code = prompt('Paste a save:');
      if (!code) return;
      try { const T = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (T.v !== 3 || !HOUSES.some(h => h.clan === T.house) || !T.meta || !T.lv || !Array.isArray(T.reach) || !(T.money >= 0)) throw 0; S = fresh(T); topKey = ''; toast('Save loaded'); } catch { alert('That is not a save from this game.'); }
    }
    if (act === 'restart' && confirm('Start over with a new house in 1467? This run is lost; renown and treasures stay.')) return showPick('restart');
    render(); save();
  });

  // ---------- choosing a house ----------
  let pickClan = 'oda';
  function showPick(why) {
    const meta = S ? S.meta : null, box = $('#pick');
    const draw = () => {
      const h = HOUSES.find(x => x.clan === pickClan);
      box.innerHTML = `<div class="in"><h1>${why ? 'Begin again' : 'Tenka'} <span lang="ja">天下</span></h1>
        <p class="lede">${why === 'again' ? `Your renown carries over: profit +${fmt((meta.renown + G.renownGain(S)) * G.RENOWN * 100)}% from the first paddy. Choose the house to lead from 1467.` : 'Build a house\'s fortune from 1467 to the present day. Run its trades, hire managers, buy upgrades, and the years pass as the money comes in: the house spreads across Japan province by province, and the real history arrives chapter by chapter.'}</p>
        <div class="houses" role="group" aria-label="Houses">${HOUSES.map(x => `<button aria-pressed="${x.clan === pickClan}" data-clan="${x.clan}" style="--dye:${curtain(x.clan)}">${crest(x.clan, 'crest')}<b>${clanName(x.clan)}</b><small>${esc(P[x.home].en)} · ${esc(x.motto)}</small></button>`).join('')}</div>
        <div class="chosen"><div class="mini" style="--dye:${curtain(h.clan)}">${crest(h.clan, 'crest')}</div><h2>${clanName(h.clan)}</h2><p>From ${placeName(h.home)}. ${esc(h.motto)} <span lang="ja">${h.mottoJa}</span>: ${esc(h.text.toLowerCase())}</p>
        <div class="row"><button class="btn go" data-act="begin">Begin in 1467</button>${why ? '<button class="btn" data-act="cancel">Not yet</button>' : ''}</div></div></div>`;
    };
    draw();
    box.hidden = false; $('#app').inert = true;
    box.onclick = e => {
      const c = e.target.closest('[data-clan]');
      if (c) { pickClan = c.dataset.clan; draw(); box.querySelector(`[data-clan="${pickClan}"]`).focus(); return; }
      if (e.target.closest('[data-act="cancel"]')) { box.hidden = true; $('#app').inert = false; return; }
      if (e.target.closest('[data-act="begin"]')) {
        S = why === 'again' ? G.prestige(S, pickClan) : G.newRun(meta || G.newMeta(), pickClan);
        box.hidden = true; $('#app').inert = false;
        report = null; older = 25; topKey = '';
        sub = 'trades'; setTab('shop'); save();
      }
    };
  }

  // ---------- the clock: every frame while the page is open; the time away is counted on return ----------
  let last = Date.now(), lastSave = Date.now(), lastNumbers = 0, lastStruct = 0;
  function catchUp(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (dt > 90) { report = G.away(S, dt); report.unit = unit(); render(true); }
    else if (dt > 0) G.tick(S, dt);
  }
  function frame(t) {
    if (S && $('#pick').hidden) {
      catchUp(Date.now());
      bars();
      if (t - lastStruct > 250) { lastStruct = t; render(); dots(); }
      else if (t - lastNumbers > 120) { lastNumbers = t; numbers(); }
      if (Date.now() - lastSave > 5000) { save(); lastSave = Date.now(); }
    } else last = Date.now();
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('pagehide', save);
  addEventListener('storage', e => {
    if (e.key !== KEY || !e.newValue) return;
    try { const T = JSON.parse(e.newValue); if (T.v === 3 && T.house) { S = fresh(T); last = T.savedAt || Date.now(); topKey = ''; render(true); } } catch { /* not a save */ }
  });

  // ---------- the season over the shop front, by the real month ----------
  (() => {
    const m = new Date().getMonth(), season = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
    const leaf = ['#c8432b', '#d9692a', '#b8322a', '#e08a2c'];
    const d = document.createElement('div');
    d.className = 'drift ' + season; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const s = season === 'autumn' ? 11 + rnd(5) : season === 'winter' ? 5 + rnd(4) : 7 + rnd(3);
      return `<i style="--x:${4 + i * 14 + rnd(8)}%;--s:${s}px;--d:${9 + rnd(7)}s;--w:${-rnd(16)}s;--dx:${30 + rnd(50)}px;--r:${(rnd(2) ? 1 : -1) * (200 + rnd(300))}deg${season === 'autumn' ? `;color:${leaf[i % 4]}` : ''}">${season === 'autumn' ? '<svg><use href="#momiji"/></svg>' : ''}</i>`;
    }).join('');
    $('#front .scene').append(d);
    function rnd(n) { return Math.floor(Math.random() * n); }
  })();

  // ---------- start ----------
  function start(saved) {
    if (saved && saved.v === 3) {
      S = fresh(saved);
      if (S.savedAt) { last = S.savedAt; catchUp(Date.now()); }
      setTab('shop');
    } else {
      for (const k of ['tenka-save-1', 'tenka-save-2']) try { localStorage.removeItem(k); } catch { /* nothing to clear */ }
      showPick(null);
    }
  }
  // in the app, a save iOS cleared from the web view comes back from the settings store
  const saved = load();
  if (!saved && prefs) prefs.get({ key: KEY }).then(r => { try { start(r && r.value ? JSON.parse(r.value) : null); } catch { start(null); } }, () => start(null));
  else start(saved);
  requestAnimationFrame(frame);
  window.tenka = { get S() { return S; }, set S(v) { S = v; topKey = ''; report = null; render(true); }, G, render };
})();
