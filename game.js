// The game itself: pure functions over one plain state object (saved as JSON). No page code here, so test.js can play it in Node.
// Loaded after data/map.js and data/game-data.js.
const G = (() => {
  // ---------- the dials (node test.js shows what they do to the pacing) ----------
  // the year, from what the house has earned in this run: [year, log10 of earnings]. Each trade's price follows from it.
  const YEARMAP = [[1467, 0], [1603, 13], [1868, 25], [1926, 31], [1989, 39], [2026, 45]];
  const OPEN_AT = 30;                 // a trade's first level costs a thirtieth of what the house had earned when it opened
  const TIME0 = .6, TIMEK = 2.3;      // seconds a trade's cycle takes: the first trade's, and times this for each later one
  const REV = .03, REVK = .60;         // a level's payout per cycle: its price times REV, times REVK for each later trade (low, since guests, tea, tasks and crossroads lift it)
  const GROW0 = 1.08, GROWK = .004;   // each level costs this much more than the last (later trades grow a little steeper)
  const SPEED_AT = [25, 50, 100, 200, 300, 400];               // levels that halve the cycle
  const PROFIT_AT = [500, 600, 700, 800, 900, 1000, 1200, 1500]; // levels that triple the profit
  const UPGRADE_AT = [1e5, 1e9, 1e14]; // a trade's three upgrades cost its first level times these; each triples its profit
  const REALM_AT = 1e4;               // a realm upgrade costs this times what the house had earned by its year; triples everything
  const MANAGER_AT = 250;             // a manager costs the trade's first level times this
  const PROVINCE = .04, CHAPTER = .02, TREASURE = .06, RENOWN = .01; // profit for each province, chapter read, treasure, renown
  const RENOWN_K = .05, RENOWN_POW = .2; // renown in all: RENOWN_K * (lifetime earnings) ^ RENOWN_POW
  const AGE_PROVINCES = [20, 14, 12, 12, 10]; // provinces to reach in each age (68 in all, with home)
  const AWAY_HOURS = 24;              // time away counts up to this long
  const GUEST_AT = .1, GUEST_MIN = 50; // welcoming a guest costs this share of what the house had earned by their year
  const BOND_MAX = 5;                 // a guest's bond grows by one each run they are welcomed, up to this
  const TEA_X = 2, TEA_LEN = 1800, TEA_EVERY = 4 * 3600; // tea: profit times this for TEA_LEN seconds, once every TEA_EVERY
  const TASK_PAY = .05;               // a finished task pays this share of what the run has earned (a gift, never a skip of years)
  const GUEST_WORK = 2, GUEST_ALL = .1, GUEST_BOND = .25; // a guest doubles their trade or adds a tenth to all; each bond adds a quarter of that
  const PATH = .01;                   // profit for good for each crossroads path ever taken

  const PIDS = Object.keys(GEO.provinces);
  const ALL_ERAS = [...ERAS, [1989, 'Heisei', '平成'], [2019, 'Reiwa', '令和']];
  if (!CLANS.nation) CLANS.nation = { en: 'Japan', ja: '日本', dye: 'rikyu', motif: 'plain', title: 'The postwar state', short: '' };

  // ---------- randomness: seeded and kept in the state, so a save replays the same ----------
  function rand(S) {
    let t = (S.seed = (S.seed + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const pick = (S, a) => a[Math.floor(rand(S) * a.length)];

  // ---------- time: the year follows the house's earnings ----------
  function logAt(y) { // log10 of what the house has earned by year y
    let i = 1;
    while (i < YEARMAP.length - 1 && YEARMAP[i][0] < y) i++;
    const [y0, l0] = YEARMAP[i - 1], [y1, l1] = YEARMAP[i];
    return l0 + (l1 - l0) * (y - y0) / (y1 - y0);
  }
  function yearFor(earned) {
    const L = Math.log10(earned + 1);
    for (let i = 1; i < YEARMAP.length; i++) {
      const [y0, l0] = YEARMAP[i - 1], [y1, l1] = YEARMAP[i];
      if (L < l1) return Math.floor(y0 + (y1 - y0) * (L - l0) / (l1 - l0));
    }
    return END_YEAR;
  }
  const earnedFor = y => Math.pow(10, logAt(y));
  const ageOf = y => { let a = 0; AGES.forEach((x, i) => { if (y >= x.from) a = i; }); return a; };
  function eraOf(y) {
    let e = ALL_ERAS[0];
    for (const x of ALL_ERAS) if (x[0] <= y) e = x;
    return { en: e[1], ja: e[2], n: y - e[0] + 1 };
  }
  const KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function kanjiYear(n) {
    if (n === 1) return '元';
    const t = Math.floor(n / 10), u = n % 10;
    return (t ? (t > 1 ? KANJI[t] : '') + '十' : '') + KANJI[u];
  }
  const money = S => AGES[ageOf(S.year)].money;

  // who holds each province in a year (the real history; the state after 1947)
  function holdersAt(y) {
    const h = { ...BASE_1467 };
    for (const [cy, p, c] of CHANGES) { if (cy > y) break; h[p] = c; }
    if (y >= 1947) for (const p of PIDS) h[p] = 'nation';
    return h;
  }

  // ---------- the trades ----------
  const T = Object.fromEntries(WORKS.map((w, j) => {
    const cost = j ? earnedFor(w.year) / OPEN_AT : 4;
    return [w.id, { j, w, cost, grow: GROW0 + GROWK * j, time: TIME0 * Math.pow(TIMEK, j), rev: cost * REV * Math.pow(REVK, j) }];
  }));
  const house = S => HOUSES.find(h => h.clan === S.house);
  const hm = S => new Proxy(house(S).mods, { get: (o, k) => (o[k] || 0) + chosen(S).reduce((s, c) => s + (c.mods[k] || 0), 0) });
  const isOpen = (S, id) => S.year >= T[id].w.year;
  const count = (a, n) => a.filter(x => n >= x).length;
  const has = (S, u) => S.upg.includes(u);

  // what multiplies every trade's profit
  function profitAll(S) {
    const m = hm(S);
    return (1 + m.profit) * (1 + PROVINCE * (S.reach.length - 1) * (1 + m.reach) * (doing(S, 'reach').length ? 2 : 1)) *
      (1 + CHAPTER * S.readIds.length * (doing(S, 'chapter').length ? 2 : 1) * (1 + m.chapter)) * (1 + PATH * (S.meta.paths || []).length) *
      (1 + TREASURE * S.meta.treasures.length) * (1 + RENOWN * S.meta.renown) * Math.pow(3, REALM_UPGRADES.filter(u => has(S, u.id)).length) *
      doing(S, 'all').reduce((x, g) => x * (1 + GUEST_ALL * lift(S, g)), 1) * (teaOn(S) ? teaX(S) : 1);
  }
  const cycle = (S, id) => T[id].time / Math.pow(2, count(SPEED_AT, S.lv[id] || 0)) / (1 + hm(S).speed);
  // one cycle's payout for the whole trade
  function payout(S, id, all = profitAll(S)) {
    const n = S.lv[id] || 0;
    const ups = [0, 1, 2].filter(k => has(S, id + ':' + k)).length;
    return T[id].rev * n * Math.pow(3, count(PROFIT_AT, n) + ups) * (1 + hm(S)[id]) * all * workBoost(S, id);
  }
  const rate = (S, id, all) => payout(S, id, all) / cycle(S, id);
  // per second, from the trades that run themselves (and all of them, if you keep tapping)
  function income(S, managedOnly = true) {
    const all = profitAll(S);
    return WORKS.reduce((s, w) => s + ((!managedOnly || S.mgr[w.id]) && S.lv[w.id] ? rate(S, w.id, all) : 0), 0);
  }

  // buying levels: n at once (Infinity: as many as the money allows)
  function priceOf(S, id, n) {
    const t = T[id], L = S.lv[id] || 0;
    return t.cost * Math.pow(t.grow, L) * (Math.pow(t.grow, n) - 1) / (t.grow - 1) * (1 + hm(S).cost);
  }
  function maxBuy(S, id) {
    const t = T[id], first = t.cost * Math.pow(t.grow, S.lv[id] || 0) * (1 + hm(S).cost);
    return Math.max(0, Math.floor(Math.log(1 + S.money * (t.grow - 1) / first) / Math.log(t.grow)));
  }
  // what the buy button offers in a mode (1, 10, 100, or 'max'), and whether the money is there
  function offer(S, id, mode) {
    const n = mode === 'max' ? Math.max(1, maxBuy(S, id)) : mode;
    const price = priceOf(S, id, n);
    return { n, price, ok: isOpen(S, id) && S.money >= price };
  }
  function buy(S, id, mode = 1) {
    const o = offer(S, id, mode);
    if (!o.ok) return 0;
    S.money -= o.price;
    const was = S.lv[id] || 0;
    S.lv[id] = was + o.n;
    if (!was) S.prog[id] = S.mgr[id] ? 0 : null;
    bump(S, 'levels', o.n);
    return o.n;
  }
  // the levels until the next speed or profit milestone
  function nextMilestone(S, id) {
    const n = S.lv[id] || 0, s = SPEED_AT.find(x => x > n), p = PROFIT_AT.find(x => x > n);
    if (s) return { at: s, what: 'speed' };
    if (p) return { at: p, what: 'profit' };
    return null;
  }
  // tap: start a cycle (a trade with a manager starts its own)
  function run(S, id) {
    if (!(S.lv[id] > 0) || S.mgr[id] || S.prog[id] != null) return false;
    S.prog[id] = 0;
    bump(S, 'taps');
    return true;
  }

  // managers
  const managerCost = (S, id) => T[id].cost * MANAGER_AT * (1 + hm(S).cost);
  function hire(S, id) {
    const c = managerCost(S, id);
    if (S.mgr[id] || !isOpen(S, id) || S.money < c) return false;
    S.money -= c;
    S.mgr[id] = true;
    if (S.lv[id] && S.prog[id] == null) S.prog[id] = 0;
    bump(S, 'improve');
    return true;
  }

  // upgrades: three for each trade, and one for each age that lifts every trade
  function upgrades(S) {
    const out = [];
    for (const w of WORKS) w.upgrades.forEach(([en, ja], k) => out.push({ id: w.id + ':' + k, en, ja, work: w.id, cost: T[w.id].cost * UPGRADE_AT[k], open: isOpen(S, w.id), text: `${w.en} profit ×3` }));
    for (const u of REALM_UPGRADES) out.push({ id: u.id, en: u.en, ja: u.ja, cost: earnedFor(u.year) * REALM_AT, open: S.year >= u.year, text: `Every trade's profit ×3. ${u.text}`, realm: true });
    return out.map(u => ({ ...u, cost: u.cost * (1 + hm(S).cost), owned: has(S, u.id) })).sort((a, b) => a.cost - b.cost);
  }
  function buyUpgrade(S, uid) {
    const u = upgrades(S).find(x => x.id === uid);
    if (!u || u.owned || !u.open || S.money < u.cost) return false;
    S.money -= u.cost;
    S.upg.push(uid);
    bump(S, 'improve');
    return true;
  }

  // ---------- guests: real people who visit in their own years; welcomed, they stay for the run ----------
  const doing = (S, k) => GUESTS.filter(g => g.does[k] !== undefined && S.guests.includes(g.id));
  const bond = (S, id) => (S.meta.bond || {})[id] || 0;
  // a guest's help grows with the bond: a backed trade x2 at first (x3 at full bond), all profit +10% (+20%)
  const lift = (S, g) => 1 + GUEST_BOND * (bond(S, g.id) - 1);
  const workBoost = (S, id) => doing(S, 'work').reduce((x, g) => g.does.work === id ? x * (1 + (GUEST_WORK - 1) * lift(S, g)) : x, 1);
  const visitors = S => GUESTS.filter(g => S.year >= g.from && !S.guests.includes(g.id));
  const nextGuest = S => GUESTS.find(g => S.year < g.from);
  const welcomeCost = (S, g) => Math.max(GUEST_MIN, earnedFor(g.from) * GUEST_AT) * (1 + hm(S).cost);
  function welcome(S, id) {
    const g = GUESTS.find(x => x.id === id);
    if (!g || S.year < g.from || S.guests.includes(id) || S.money < welcomeCost(S, g)) return false;
    S.money -= welcomeCost(S, g);
    S.guests.push(id);
    S.meta.bond = S.meta.bond || {};
    S.meta.bond[id] = Math.min(BOND_MAX, bond(S, id) + 1);
    note(S, { en: `${g.en} ${g.ja} joins the house.`, guest: id });
    bump(S, 'welcome');
    return true;
  }
  const roomOpen = (S, room) => doing(S, 'room').some(g => g.does.room === room);

  // ---------- the tea room: tea doubles profit for a while; three tasks a day ----------
  const teaX = S => doing(S, 'tea').length ? 3 : TEA_X;
  const teaOn = S => !!S.tea && S.t < S.tea.until;
  const teaReadyIn = S => Math.max(0, (S.tea ? S.tea.next : 0) - S.t);
  function serveTea(S) {
    if (!roomOpen(S, 'tea') || teaReadyIn(S) > 0) return false;
    S.tea = { until: S.t + TEA_LEN, next: S.t + TEA_EVERY };
    bump(S, 'tea');
    return true;
  }
  function bump(S, k, n = 1) { if (S.day) S.day.c[k] = (S.day.c[k] || 0) + n; }
  // today's three tasks, drawn when the day (a date the page passes in) changes
  function daily(S, key) {
    if (S.day && S.day.key === key) return S.day;
    const pool = TASKS.filter(t => !t.need || (t.need === 'tea' ? roomOpen(S, 'tea') : visitors(S).length > 0));
    const tasks = [];
    while (tasks.length < 3 && pool.length) tasks.push(pool.splice(Math.floor(rand(S) * pool.length), 1)[0].id);
    S.day = { key, tasks, c: {}, got: [] };
    return S.day;
  }
  const taskPay = S => Math.max(50, S.earned * TASK_PAY);
  const taskDone = (S, id) => !!S.day && (S.day.c[id] || 0) >= TASKS.find(t => t.id === id).n;
  function claimTask(S, id) {
    if (!S.day || !S.day.tasks.includes(id) || S.day.got.includes(id) || !taskDone(S, id)) return 0;
    const pay = taskPay(S);
    S.day.got.push(id);
    earn(S, pay);
    return pay;
  }

  // ---------- crossroads: a real turning point, and the way the house takes for this run ----------
  const CROSS = Object.fromEntries(CROSSROADS.map(c => [c.id, c]));
  const optionOf = (cid, oid) => CROSS[cid].options.find(o => o.id === oid);
  // the choices of this run still in force (one bought on borrowed money ends in its year)
  const chosen = S => Object.entries(S.choices || {}).map(([c, o]) => optionOf(c, o)).filter(o => !o.until || S.year < o.until);
  const crossings = S => CROSSROADS.filter(c => S.year >= c.year && !(c.id in (S.choices || {})));
  function choose(S, cid, oid) {
    if (!crossings(S).some(c => c.id === cid)) return false;
    const o = optionOf(cid, oid);
    if (!o) return false;
    S.choices[cid] = oid;
    const path = cid + ':' + oid;
    if (!S.meta.paths.includes(path)) S.meta.paths.push(path);
    note(S, { en: o.done, path });
    return true;
  }

  // ---------- provinces ----------
  const ageSpan = a => (AGES[a + 1] ? AGES[a + 1].from : END_YEAR) - AGES[a].from;
  const provincesPerYear = y => AGE_PROVINCES[ageOf(y)] / ageSpan(ageOf(y));
  const reachPoints = S => Math.floor(S.pts);
  function reachable(S) {
    const mine = new Set(S.reach), out = new Set();
    for (const p of S.reach) for (const q of ADJ[p]) if (!mine.has(q)) out.add(q);
    return [...out];
  }
  const provinceBonus = (S, p) => PROVINCE * (1 + hm(S).reach);
  function reach(S, p) {
    if (reachPoints(S) < 1 || !reachable(S).includes(p)) return false;
    S.reach.push(p);
    S.pts--;
    const g = GEO.provinces[p];
    note(S, { en: `The house reaches ${g.en} ${g.ja}.`, p });
    const every = Math.max(1, Math.round(4 / (1 + hm(S).find)));
    if (S.reach.length % every === 0) findTreasure(S);
    return true;
  }
  // the richest province within reach, for "let the house choose"
  const bestReach = S => reachable(S).sort((a, b) => (KOKU[b] + (SPECIAL[b] ? SPECIAL[b][0] : 0)) - (KOKU[a] + (SPECIAL[a] ? SPECIAL[a][0] : 0)))[0];

  function findTreasure(S) {
    const pool = TREASURES.filter(t => t.from <= S.year && !S.meta.treasures.includes(t.id));
    if (!pool.length) return null;
    const t = pick(S, pool);
    S.meta.treasures.push(t.id);
    note(S, { en: `Found: ${t.en} ${t.ja}, a ${t.kind}. It joins the house collection for good.`, treasure: t.id });
    return t;
  }

  // ---------- chapters: the history, arriving in its year ----------
  // events where this house is beaten in its own history are left out: the house you lead survives
  const chaptersFor = clan => [...EVENTS, ...LATER_EVENTS].filter(e => !(e.sides.includes(clan) && e.winner && e.winner !== clan)).sort((a, b) => a.year - b.year);
  function read(S, id) {
    const i = S.unread.indexOf(id);
    if (i < 0) return false;
    S.unread.splice(i, 1);
    S.readIds.push(id);
    if (!S.meta.seen.includes(id)) S.meta.seen.push(id);
    bump(S, 'read');
    return true;
  }

  // ---------- heads of the house ----------
  function newHead(S, y) {
    // never the name of the head before, or the two before that
    const pool = (y >= 1868 ? NAMES.modern : NAMES.lord[S.house]).filter(g => g !== S.head.given && !S.heads.slice(-2).some(h => h.given === g));
    return { given: pick(S, pool), from: y, until: y + 22 + Math.floor(rand(S) * 13) };
  }
  const headName = (S, h = S.head) => `${CLANS[S.house].en} ${h.given}`;
  function note(S, e) { S.chron.unshift({ y: S.year, ...e }); if (S.chron.length > 300) S.chron.length = 300; }

  // ---------- renown: the fame of every house so far, which a new beginning turns into profit ----------
  const renownTotal = S => Math.floor(RENOWN_K * Math.pow(S.meta.lifetime + S.earned, RENOWN_POW));
  const renownGain = S => Math.max(0, renownTotal(S) - S.meta.renown - S.meta.spent);

  // ---------- a run ----------
  function newMeta() { return { runs: 0, renown: 0, spent: 0, lifetime: 0, treasures: [], seen: [], best: 1467, bond: {}, paths: [] }; }
  function newRun(meta, clan, seed = Date.now() | 0) {
    const h = HOUSES.find(x => x.clan === clan);
    const S = { v: 3, seed, house: clan, t: 0, year: 1467, money: 0, earned: 0, lv: { paddies: 1 }, prog: { paddies: null }, mgr: {}, upg: [],
      reach: [h.home], pts: 1, unread: [], readIds: [], next: 0, chron: [], heads: [], head: null, done: false, guests: [], tea: null, day: null, choices: {}, meta };
    S.head = { given: NAMES.lord[clan][0], from: 1467, until: 1467 + 25 };
    note(S, { en: `${headName(S)} leads the house from ${GEO.provinces[h.home].en} ${GEO.provinces[h.home].ja}.`, head: true });
    if (h.mods.startTreasure && !meta.treasures.length) findTreasure(S);
    arrive(S);
    return S;
  }
  // begin again in 1467: the renown earned so far turns into profit for good; the treasures stay
  function prestige(S, clan = S.house) {
    const meta = S.meta, gain = renownGain(S);
    meta.renown += gain;
    meta.lifetime += S.earned;
    meta.runs++;
    meta.best = Math.max(meta.best, S.year);
    const R = newRun(meta, clan);
    R.day = S.day;
    return R;
  }

  // whatever the new year brings: chapters, a new head, the present
  function arrive(S) {
    const list = chaptersFor(S.house);
    // a chapter read in an earlier run counts as read straight away
    while (S.next < list.length && list[S.next].year <= S.year) { const id = list[S.next].id; (S.meta.seen.includes(id) ? S.readIds : S.unread).push(id); S.next++; }
    while (S.year >= S.head.until && S.year < END_YEAR) {
      S.heads.push(S.head);
      S.head = newHead(S, S.head.until);
      note(S, { en: `${headName(S)} becomes head of the house.`, head: true, y: S.head.from });
    }
    if (S.year >= END_YEAR && !S.done) { S.done = true; note(S, { en: 'The house reaches the present day.', end: true }); }
  }
  function earn(S, x) {
    S.money += x;
    S.earned += x;
    const y = Math.max(S.year, yearFor(S.earned));
    if (y === S.year) return;
    const was = ageOf(S.year), from = S.year;
    for (let yy = S.year; yy < y; yy++) S.pts += provincesPerYear(yy);
    S.year = y;
    for (const [c, oid] of Object.entries(S.choices || {})) { const o = optionOf(c, oid); if (o.until > from && o.until <= y) note(S, { en: o.after }); }
    if (ageOf(y) !== was) note(S, { en: `A new age: ${AGES[ageOf(y)].en} ${AGES[ageOf(y)].ja}.`, age: ageOf(y) });
    arrive(S);
    // the house reaches the richest province within reach by itself
    while (reachPoints(S) > 0 && reachable(S).length) reach(S, bestReach(S));
  }

  // the clock: trades with a manager cycle on their own; others finish the cycle you started, then wait for a tap
  function tick(S, dt) {
    S.t += dt;
    const all = profitAll(S);
    let got = 0;
    for (const w of WORKS) {
      const id = w.id;
      if (!(S.lv[id] > 0) || S.prog[id] == null) continue;
      const c = cycle(S, id);
      S.prog[id] += dt;
      if (S.prog[id] < c) continue;
      if (S.mgr[id]) { const k = Math.floor(S.prog[id] / c); got += k * payout(S, id, all); S.prog[id] -= k * c; }
      else { got += payout(S, id, all); S.prog[id] = null; }
    }
    if (got) earn(S, got);
  }
  // time away: the managed trades keep earning, up to a day
  function away(S, seconds) {
    const before = { money: S.money, year: S.year, unread: S.unread.length };
    const sim = Math.min(seconds, AWAY_HOURS * 3600) * (1 + hm(S).away);
    // in steps, so new years (and their bonuses) arrive along the way
    for (let left = sim, k = 0; left > 0 && k < 400; k++) { const dt = Math.min(left, Math.max(60, sim / 200)); tick(S, dt); left -= dt; }
    return { seconds, capped: seconds > AWAY_HOURS * 3600, capH: AWAY_HOURS, from: before.year, to: S.year, money: S.money - before.money,
      chapters: S.unread.length - before.unread, points: reachPoints(S), managed: WORKS.some(w => S.mgr[w.id] && S.lv[w.id]) };
  }

  const UNITS = ['', '', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion',
    'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion'];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 10) return (Math.floor(n * 10) / 10).toString();
    if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
    const k = Math.floor(Math.log10(n) / 3);
    if (k >= UNITS.length) return n.toExponential(2).replace('e+', 'e'); // past the named scales (a house that keeps growing after the present day)
    const v = n / Math.pow(10, k * 3);
    return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + '\u00a0' + UNITS[k]; // a number never wraps away from its scale word
  }

  return { PATH, chosen, crossings, choose, optionOf, TEA_LEN, TEA_EVERY, BOND_MAX, doing, bond, workBoost, visitors, nextGuest, welcomeCost, welcome, roomOpen, teaX, teaOn, teaReadyIn, serveTea,
    daily, taskPay, taskDone, claimTask,
    T, SPEED_AT, PROFIT_AT, PROVINCE, CHAPTER, TREASURE, RENOWN, AWAY_HOURS, PIDS, rand, yearFor, earnedFor, ageOf, eraOf, kanjiYear, money,
    holdersAt, house, isOpen, profitAll, cycle, payout, rate, income, priceOf, maxBuy, offer, buy, nextMilestone, run, managerCost, hire, upgrades,
    buyUpgrade, provincesPerYear, reachPoints, reachable, provinceBonus, reach, bestReach, findTreasure, chaptersFor, read, headName,
    renownTotal, renownGain, newMeta, newRun, prestige, arrive, earn, tick, away, fmt };
})();
if (typeof module !== 'undefined') module.exports = G;
