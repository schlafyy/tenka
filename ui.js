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
  let tab = 'trades', mode = 1;
  const panel = $('#panel');

  // ---------- saving ----------
  function save() { if (!S) return; S.savedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: the game still runs */ } }
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
    $('#house').innerHTML = `<span class="pn l" aria-hidden="true">${cr}<b class="v" lang="ja" style="--n:${CLANS[S.house].ja.length}">${CLANS[S.house].ja}</b></span><span class="pn m" aria-hidden="true">${cr}</span><span class="pn r" aria-hidden="true">${cr}<b class="v" lang="ja"></b></span><span class="sr">The ${esc(CLANS[S.house].en)} house, led by ${esc(G.headName(S))}: open the house</span>`;
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
    $('#era').textContent = `${era.en} ${era.n} · ${G.headName(S)}`;
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
    $('#next').innerHTML = S.done ? 'The present day.' : `${esc(AGES[now].en)}${next ? ` · next: <span class="nb">${esc(next.en)} <span lang="ja">${next.glyph}</span> in ${next.year}</span>` : ''}`;
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
    h += `<div class="bar-row"><div class="modes" role="group" aria-label="How many to buy">${MODES.map(([m, l]) => `<button data-act="mode" data-mode="${m}" aria-pressed="${mode === m}">${l}</button>`).join('')}</div></div>`;
    if (!Object.keys(S.mgr).length && S.year < 1500) h += `<p class="tip">Tap a trade's square to run it. A full bar pays out. Managers run trades for you, even while you are away.</p>`;
    for (const w of WORKS.filter(w => G.isOpen(S, w.id))) {
      const id = w.id, ms = G.nextMilestone(S, id);
      h += `<div class="trade" data-id="${id}">
        <button class="tile" data-act="run" data-id="${id}" data-k="run-${id}" aria-label="Run the ${esc(w.en.toLowerCase())}"><span class="g" lang="ja">${w.glyph}</span><span class="lv num">${S.lv[id] || 0}</span></button>
        <h3>${esc(w.en)} <span lang="ja">${w.ja}</span></h3>
        <div class="prog" data-act="run" data-id="${id}"><i></i></div>
        <p class="meta"><span>${S.mgr[id] ? `${CHECK} ${esc(w.manager[0])}` : S.lv[id] ? 'tap the square to run' : ''}</span><span class="num"><b class="pay"></b> <span class="left"></span></span></p>
        <div class="buyrow"><button class="buy" data-act="buy" data-id="${id}" data-k="buy-${id}"><span></span><b class="num"></b></button>
        ${ms ? `<small class="ms">${ms.what === 'speed' ? 'twice as fast' : 'profit ×3'} at level ${ms.at}</small>` : ''}</div></div>`;
    }
    if (next) h += `<div class="trade shut"><div class="tile"><span class="g" lang="ja">${next.glyph}</span></div><h3>${esc(next.en)} <span lang="ja">${next.ja}</span></h3><p class="opens">Opens in ${next.year}, when the house has earned <span class="nb">${fmt(G.earnedFor(next.year))} ${unit()}</span>.</p></div>`;
    return h;
  }
  const priceButton = (act, id, cost) => `<button class="btn${S.money >= cost ? ' go' : ''}" data-act="${act}" data-id="${id}" data-k="${act}-${id}" data-cost="${cost}"${S.money >= cost ? '' : ' disabled'}>${fmt(cost)}</button>`;
  function renderUpgrades() {
    const all = G.upgrades(S), open = all.filter(u => u.open && !u.owned), owned = all.filter(u => u.owned).length;
    let h = `<h2 class="head">Upgrades <span lang="ja">改良</span></h2><p class="note">${owned} of ${all.length} bought. Each one triples a trade's profit; the great works of each age triple them all.</p>`;
    h += open.slice(0, 12).map(u => `<div class="item"><span class="tag" lang="ja" aria-hidden="true">${u.realm ? '天' : WORK[u.work].glyph}</span><h3>${esc(u.en)} <span lang="ja">${u.ja}</span></h3><p>${esc(u.text)}</p>
      ${priceButton('upg', u.id, u.cost)}</div>`).join('');
    if (!open.length) h += `<p class="note">New upgrades come with new trades and new ages.</p>`;
    return h;
  }
  function renderManagers() {
    let h = `<h2 class="head">Managers <span lang="ja">支配人</span></h2><p class="note">A manager runs a trade for you, without a tap, and keeps it running while you are away (up to ${G.AWAY_HOURS} hours).</p>`;
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
    let h = `<h2 class="head">Chronicle <span lang="ja">年代記</span></h2>`;
    if (S.unread.length) {
      h += `<ol class="entries">${S.unread.map(id => chapterHtml(CHAPTER[id], true)).join('')}</ol>`;
      if (S.unread.length > 1) h += `<button class="btn more" data-act="readall">Read all ${S.unread.length}</button>`;
    }
    const items = [...S.readIds.map(id => ({ y: CHAPTER[id].year, e: CHAPTER[id] })), ...S.chron.map(c => ({ y: c.y, c }))].sort((a, b) => b.y - a.y || (a.e ? -1 : 1));
    h += `<ol class="entries">${items.slice(0, older).map(x => x.e ? chapterHtml(x.e, false) : `<li class="entry house"><div><div class="y num">${x.y}</div></div><div><h3>${esc(x.c.en)}</h3></div></li>`).join('')}</ol>`;
    if (items.length > older) h += `<button class="btn more" data-act="older">Show older</button>`;
    return h;
  }
  function renderHouse() {
    const h = G.house(S), m = S.meta, gain = G.renownGain(S);
    const found = TREASURES.filter(x => m.treasures.includes(x.id));
    let x = `<h2 class="head">The house <span lang="ja">家</span></h2>
      <div class="facts"><p><b>${clanName(S.house)}</b>, from ${placeName(h.home)}. ${esc(h.motto)} <span lang="ja">${h.mottoJa}</span>: ${esc(h.text.toLowerCase())}</p>
      <p>Head of the house: <b>${esc(G.headName(S))}</b>, since ${S.head.from}. Your house follows its own line of heads; the history around it is the real one.</p>
      <p>${S.readIds.length} chapters read · everything together: profit ×${fmt(G.profitAll(S))}</p></div>
      <div class="renown"><h3>Renown <span lang="ja">名声</span> <span class="fig num">${fmt(m.renown)}</span> <small>profit +${fmt(m.renown * G.RENOWN * 100)}%</small></h3>
      <p>Begin again in 1467 with any house: the fame this run has won turns into renown for good. The treasures stay; the trades, provinces and money start over.${m.runs ? '' : ' Chapters you have read stay read.'}</p>
      <button class="btn ${gain >= Math.max(10, m.renown) ? 'go' : ''}" data-act="again" ${gain > 0 ? '' : 'disabled'}>${gain > 0 ? `Begin again · +${fmt(gain)} renown` : 'No renown to win yet'}</button></div>
      <h3 class="sub">Provinces <span lang="ja">領国</span> <span class="fig num">${S.reach.length} of ${PIDS.length}, profit +${Math.round((S.reach.length - 1) * G.PROVINCE * 100)}%</span></h3>
      <p class="note">The house reaches a new province every few years, always the richest next to its land.</p>
      <div class="provs">${S.reach.map(p => `<span>${esc(P[p].en)} <span lang="ja">${P[p].ja}</span></span>`).join('')}</div>`;
    if (S.heads.length) x += `<h3 class="sub">Heads before</h3><ul class="heads">${S.heads.map(p => `<li><b>${esc(p.given)}</b> ${p.from}–${p.until}</li>`).join('')}</ul>`;
    x += `<h3 class="sub">Treasures <span lang="ja">家宝</span> <span class="fig num">${found.length} of ${TREASURES.length}, profit +${Math.round(found.length * G.TREASURE * 100)}%</span></h3>
      <p class="note">One turns up for every few provinces reached. They stay with the house for good.</p>
      ${found.length ? `<div class="treasures">${found.map(t => `<div class="tr"><b>${esc(t.en)}</b><span lang="ja">${t.ja}</span><br>${esc(t.kind)}</div>`).join('')}</div>` : ''}
      <p class="note after">${TREASURES.length - found.length} still to find.</p>
      <h3 class="sub">Your save</h3>
      <div class="tools"><button class="btn" data-act="copy">Copy save</button><button class="btn" data-act="paste">Load a save</button><button class="btn" data-act="restart">Start over</button></div>
      <p class="credits">Clan crests from Wikimedia Commons, each under its own licence. Province names and history from the Sengoku map project. Fonts: Shippori Mincho B1, Zen Kaku Gothic New and Yuji Syuku (SIL OFL). The history is written for the game from standard accounts and simplified; yields are approximate.</p>`;
    return x;
  }
  const VIEWS = { trades: renderTrades, upgrades: renderUpgrades, managers: renderManagers, chron: renderChron, house: renderHouse };

  // ---------- keeping the screen current ----------
  // the trade rows' moving parts, found once after each rebuild
  let rows = [];
  function cacheRows() {
    rows = [...panel.querySelectorAll('.trade[data-id]')].map(row => {
      const id = row.dataset.id, buy = row.querySelector('.buy');
      return { id, tile: row.querySelector('.tile'), badge: row.querySelector('.lv'), prog: row.querySelector('.prog'), bar: row.querySelector('.prog i'),
        pay: row.querySelector('.pay'), left: row.querySelector('.left'), buy, n: buy.querySelector('span'), price: buy.querySelector('b'), last: {}, was: null };
    });
  }
  const set = (o, k, el, v, prop = 'textContent') => { if (o.last[k] !== v) { o.last[k] = v; el[prop] = v; } };
  // every frame: the bars, and a small pulse on a square when its cycle pays
  function bars() {
    for (const r of rows) {
      const c = G.cycle(S, r.id), p = S.prog[r.id], fast = S.mgr[r.id] && c < .25;
      if (!fast && r.was != null && (p == null || p < r.was) && c >= .3 && !reduced) r.tile.animate([{ transform: 'scale(1.07)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
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
    if (tab !== 'trades') panel.querySelectorAll('[data-cost]').forEach(b => { const ok = S.money >= +b.dataset.cost; if (b.classList.contains('go') !== ok) { b.disabled = !ok; b.classList.toggle('go', ok); } });
  }
  function dots() {
    const ups = G.upgrades(S).filter(u => u.open && !u.owned && u.cost <= S.money).length;
    const mgrs = WORKS.filter(w => G.isOpen(S, w.id) && !S.mgr[w.id] && G.managerCost(S, w.id) <= S.money).length;
    dot('upgrades', ups); dot('managers', mgrs); dot('chron', S.unread.length); dot('house', G.renownGain(S) >= Math.max(10, S.meta.renown) ? '!' : 0);
  }
  function dot(t, n) {
    const b = document.querySelector(`#tabs [data-tab="${t}"] .dot`), v = n ? String(n) : '';
    if (b.textContent !== v) { b.textContent = v; b.hidden = !v; }
  }

  // the panel's markup, rebuilt only when what it shows has changed
  let structKey = '', topKey = '';
  function render(force) {
    if (!S) return;
    const bits = { trades: () => [WORKS.filter(w => G.isOpen(S, w.id)).length, Object.keys(S.mgr).join(), WORKS.map(w => { const m = G.nextMilestone(S, w.id); return m && m.at; }).join(), S.done, !!report, mode],
      upgrades: () => [S.upg.length, G.upgrades(S).filter(u => u.open).length], managers: () => [Object.keys(S.mgr).length, WORKS.filter(w => G.isOpen(S, w.id)).length], chron: () => [S.unread.join(), S.readIds.length, S.chron.length, older],
      house: () => [S.heads.length, S.reach.length, S.readIds.length, G.renownGain(S), S.meta.treasures.length] };
    const tk = S.house + '|' + S.head.given + '|' + S.reach.length;
    if (tk !== topKey) { topKey = tk; topYear = null; renderTop(); }
    const k = tab + '|' + S.house + '|' + bits[tab]().join('|');
    if (force || k !== structKey) {
      structKey = k;
      const f = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.k;
      panel.innerHTML = VIEWS[tab]();
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
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false'));
    render(true);
    panel.scrollTop = scrolled[t] || 0;
    if (!reduced) { panel.classList.remove('fade'); void panel.offsetWidth; panel.classList.add('fade'); }
  }
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('#house').addEventListener('click', () => {
    if (!reduced) document.querySelectorAll('#house .pn').forEach((p, i) => p.animate([{ transform: 'none' }, { transform: 'rotate(1.4deg)' }, { transform: 'rotate(-.8deg)' }, { transform: 'rotate(.3deg)' }, { transform: 'none' }], { duration: 1100, delay: i * 70, easing: 'ease-out' }));
    setTab('house');
  });

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
    if (act === 'mode') { mode = a.dataset.mode === 'max' ? 'max' : +a.dataset.mode; panel.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-pressed', b === a)); }
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
      try { const T = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (T.v !== 3 || !T.house) throw 0; S = T; topKey = ''; toast('Save loaded'); } catch { alert('That is not a save from this game.'); }
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
    box.hidden = false;
    box.onclick = e => {
      const c = e.target.closest('[data-clan]');
      if (c) { pickClan = c.dataset.clan; draw(); box.querySelector(`[data-clan="${pickClan}"]`).focus(); return; }
      if (e.target.closest('[data-act="cancel"]')) { box.hidden = true; return; }
      if (e.target.closest('[data-act="begin"]')) {
        S = why === 'again' ? G.prestige(S, pickClan) : G.newRun(meta || G.newMeta(), pickClan);
        box.hidden = true;
        report = null; older = 25; topKey = '';
        setTab('trades'); save();
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

  // ---------- start ----------
  const saved = load();
  if (saved && saved.v === 3) {
    S = saved;
    if (S.savedAt) { last = S.savedAt; catchUp(Date.now()); }
    setTab('trades');
  } else {
    for (const k of ['tenka-save-1', 'tenka-save-2']) try { localStorage.removeItem(k); } catch { /* nothing to clear */ }
    showPick(null);
  }
  requestAnimationFrame(frame);
  window.tenka = { get S() { return S; }, set S(v) { S = v; topKey = ''; report = null; render(true); }, G, render };
})();
