// The game itself: pure functions over one plain state object (saved as JSON). No page code here, so test.js can play it in Node.
// Loaded after data/map.js and data/game-data.js.
const G = (() => {
  // ---------- the dials (node test.js shows what they do to the pacing) ----------
  const GROW = 1.12;            // each level of a trade costs this much more than the last
  const MILESTONE = 25;         // every 25 levels a trade's income doubles
  const COST0 = 10, COSTK = 60; // the first trade's first level costs COST0; each later trade COSTK times the one before
  const PAY0 = 5, PAYK = 1.5;   // seconds a trade's first level takes to pay for itself; each later trade PAYK times longer
  const CHAPTER = .04;          // income for each chapter read
  const PROVINCE = 300;         // a province of this many man-koku doubles income
  const TREASURE = .06;         // income for each treasure in the collection
  const HERITAGE = 2;           // income times this for every house that reached the present before
  const AGE_PROVINCES = [20, 14, 12, 12, 10]; // new provinces to reach in each age (68 in all, with home)
  const AWAY_HOURS = 12;        // time away counts up to this long
  // the years pass with real time: days each age takes at an even pace (about two weeks in all)
  const AGE_DAYS = [3, 3, 2.5, 3, 2.5];
  // the pace: years go faster when income is ahead of the times, and slower behind, within these bounds
  const PACE_MIN = .3, PACE_MAX = 3, PACE_POW = .5;
  // an even pace's income, year by year: [year, log10 income a second] (fitted by node test.js calibrate)
  const TARGET = [[1467,0.6],[1480,3.6],[1500,4.3],[1520,4.9],[1540,6.4],[1560,7.3],[1580,8.4],[1600,9.2],[1620,11.1],[1640,11.3],[1660,12.3],[1680,12.3],[1700,13.3],[1720,13.7],[1740,15.2],[1760,15.7],[1780,15.8],[1800,16.2],[1820,16.2],[1840,16.3],[1860,16.4],[1880,18.8],[1900,19.9],[1920,21.1],[1940,22.7],[1960,23.7],[1980,25.6],[2000,28.2],[2020,30.5],[2026,30.8]];

  const PIDS = Object.keys(GEO.provinces);
  const SEA = new Set(SEA_LINKS);
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

  // ---------- time ----------
  const yearsPerHour = y => { const a = ageOf(y), to = AGES[a + 1] ? AGES[a + 1].from : END_YEAR; return (to - AGES[a].from) / (AGE_DAYS[a] * 24); };
  function target(y) {
    let i = 1;
    while (i < TARGET.length - 1 && TARGET[i][0] < y) i++;
    const [y0, l0] = TARGET[i - 1], [y1, l1] = TARGET[i];
    return Math.pow(10, l0 + (l1 - l0) * Math.min(1, Math.max(0, (y - y0) / (y1 - y0))));
  }
  // how fast the years pass now, times the even pace
  const pace = S => api.paceOverride || Math.min(PACE_MAX, Math.max(PACE_MIN, Math.pow(income(S) / target(S.yearF), PACE_POW)));
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

  // ---------- the house ----------
  const house = S => HOUSES.find(h => h.clan === S.house);
  // every bonus in force, added up: the house's own, and the head of the house's
  function mods(S) {
    const m = {};
    for (const src of [house(S).mods, TRAITS[S.head.trait].mods]) for (const [k, v] of Object.entries(src)) m[k] = (m[k] || 0) + v;
    return new Proxy(m, { get: (o, k) => o[k] || 0 });
  }

  // a province's worth: its yield, plus a mine, port or city
  function provinceBonus(S, p, m = mods(S)) {
    const sp = SPECIAL[p] ? SPECIAL[p][0] * (1 + m.special) : 0;
    return (KOKU[p] + sp) / PROVINCE * (1 + m.reach);
  }
  // everything that multiplies income
  function multiplier(S) {
    const m = mods(S);
    let x = (1 + m.income) * (1 + CHAPTER * S.chapterGift) * (1 + TREASURE * S.meta.treasures.length) * Math.pow(HERITAGE, S.meta.runs);
    for (const p of S.reach) x *= 1 + provinceBonus(S, p, m);
    return x;
  }
  const W = Object.fromEntries(WORKS.map((w, j) => [w.id, { cost: COST0 * Math.pow(COSTK, j), pay: COST0 * Math.pow(COSTK, j) / (PAY0 * Math.pow(PAYK, j)) }]));
  const levelIncome = (id, n) => n * Math.pow(2, Math.floor(n / MILESTONE)) * W[id].pay;
  function workIncome(S, id, m = mods(S)) { return levelIncome(id, S.works[id] || 0) * (1 + m[id]); }
  function income(S) {
    const m = mods(S);
    let base = 0;
    for (const w of WORKS) base += workIncome(S, w.id, m);
    return base * multiplier(S);
  }
  const isOpen = (S, id) => S.year >= WORKS.find(w => w.id === id).year;
  function cost(S, id, n = S.works[id] || 0) { return W[id].cost * Math.pow(GROW, n) * (1 + mods(S).cost); }
  // what one more level adds to income
  function gain(S, id) {
    const n = S.works[id] || 0;
    return (levelIncome(id, n + 1) - levelIncome(id, n)) * (1 + mods(S)[id]) * multiplier(S);
  }
  // the best thing to buy next: of the open trades, the most income for the money
  function best(S) {
    let b = null;
    for (const w of WORKS) {
      if (!isOpen(S, w.id)) continue;
      const c = cost(S, w.id), g = gain(S, w.id), v = g / c;
      if (!b || v > b.v) b = { id: w.id, cost: c, gain: g, v };
    }
    return b;
  }
  function buy(S, id) {
    if (!isOpen(S, id)) return false;
    const c = cost(S, id);
    if (S.money < c) return false;
    S.money -= c;
    S.works[id] = (S.works[id] || 0) + 1;
    return true;
  }
  // keep buying the best thing while the money stays above keep; returns how many levels were bought
  function buyAll(S, keep = 0) {
    let n = 0;
    for (let b = best(S); b && S.money - b.cost >= keep && n < 5000; b = best(S)) { buy(S, b.id); n++; }
    return n;
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
  function reach(S, p) {
    if (reachPoints(S) < 1 || !reachable(S).includes(p)) return false;
    S.from = { p, at: S.reach.filter(q => ADJ[q].includes(p)) };
    S.reach.push(p);
    S.pts--;
    const g = GEO.provinces[p];
    note(S, { en: `The house reaches ${g.en} ${g.ja}.`, p });
    const every = Math.max(1, Math.round(4 / (1 + mods(S).find)));
    if (S.reach.length % every === 0) findTreasure(S);
    return true;
  }
  // the province that adds most, for "let the house choose"
  const bestReach = S => reachable(S).sort((a, b) => provinceBonus(S, b) - provinceBonus(S, a))[0];

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
  const chapterList = S => chaptersFor(S.house);
  const chapterGiftOf = S => 1 + mods(S).chapter;
  function read(S, id) {
    const i = S.unread.indexOf(id);
    if (i < 0) return false;
    S.unread.splice(i, 1);
    S.chapterGift += chapterGiftOf(S);
    S.readIds.push(id);
    return true;
  }

  // ---------- heads of the house ----------
  function newHead(S, y) {
    // never the name of the head before, or the two before that
    const pool = (y >= 1868 ? NAMES.modern : NAMES.lord[S.house]).filter(g => g !== S.head.given && !S.heads.slice(-2).some(h => h.given === g));
    const given = pick(S, pool);
    const trait = pick(S, Object.keys(TRAITS));
    const reign = 22 + Math.floor(rand(S) * 13) + (house(S).mods.reign || 0);
    return { given, trait, from: y, until: y + reign };
  }
  const headName = (S, h = S.head) => `${CLANS[S.house].en} ${h.given}`;

  function note(S, e) { S.chron.unshift({ y: S.year, ...e }); if (S.chron.length > 300) S.chron.length = 300; }

  // ---------- a run ----------
  function newMeta() { return { runs: 0, treasures: [], houses: [] }; }
  function newRun(meta, clan, seed = Date.now() | 0) {
    const h = HOUSES.find(x => x.clan === clan);
    const S = { v: 2, seed, house: clan, t: 0, year: 1467, yearF: 1467, money: COST0 * 2, earned: 0, works: { paddies: 1 }, reach: [h.home], pts: 1, from: null,
      unread: [], readIds: [], chapterGift: 0, next: 0, chron: [], heads: [], head: null, done: false, meta };
    S.head = { given: NAMES.lord[clan][0], trait: 'diligent', from: 1467, until: 1467 + 25 + (h.mods.reign || 0) };
    note(S, { en: `${headName(S)} leads the house from ${GEO.provinces[h.home].en} ${GEO.provinces[h.home].ja}.`, head: true });
    if (h.mods.startTreasure) findTreasure(S);
    arrive(S);
    return S;
  }

  // whatever the new year brings: chapters, a new head, the present
  function arrive(S) {
    const list = chapterList(S);
    while (S.next < list.length && list[S.next].year <= S.year) { S.unread.push(list[S.next].id); S.next++; }
    while (S.year >= S.head.until && S.year < END_YEAR) {
      S.heads.push(S.head);
      S.head = newHead(S, S.head.until);
      note(S, { en: `${headName(S)} becomes head of the house. ${TRAITS[S.head.trait].en}: ${TRAITS[S.head.trait].text.toLowerCase()}`, head: true, y: S.head.from });
    }
    if (S.year >= END_YEAR && !S.done) { S.done = true; note(S, { en: 'The house reaches the present day.', end: true }); }
  }

  function tick(S, dt) {
    const inc = income(S) * dt;
    S.money += inc;
    S.earned += inc;
    S.t += dt;
    S.yearF = Math.min(END_YEAR, S.yearF + dt / 3600 * yearsPerHour(S.yearF) * pace(S));
    const y = Math.floor(S.yearF);
    if (y !== S.year) {
      const was = ageOf(S.year);
      S.pts += (y - S.year) * provincesPerYear(S.year) * (1 + mods(S).reachRate);
      S.year = y;
      if (ageOf(y) !== was) note(S, { en: `A new age: ${AGES[ageOf(y)].en} ${AGES[ageOf(y)].ja}.`, age: ageOf(y) });
      arrive(S);
    }
  }

  // time away: the money comes in, and the steward invests half of it in the best trades as it does
  function away(S, seconds) {
    const m = mods(S), capH = AWAY_HOURS;
    const sim = Math.min(seconds, capH * 3600) * (1 + m.away);
    const levels = () => Object.values(S.works).reduce((a, b) => a + b, 0);
    const before = { money: S.money, year: S.year, levels: levels(), unread: S.unread.length, chron: S.chron[0] };
    let left = sim;
    while (left > 0) {
      const dt = Math.min(left, 60), was = S.money;
      tick(S, dt);
      buyAll(S, was + (S.money - was) / 2);
      left -= dt;
    }
    const i = S.chron.indexOf(before.chron);
    return { seconds, sim, capped: seconds > capH * 3600, capH, from: before.year, to: S.year, money: S.money - before.money,
      levels: levels() - before.levels, chapters: S.unread.length - before.unread, points: reachPoints(S), news: S.chron.slice(0, Math.max(0, i)) };
  }

  // after the present: a new house begins in 1467, with the collection and double the income for each house that made it
  function nextRun(S, clan) {
    const meta = S.meta;
    if (S.done) { meta.runs++; if (!meta.houses.includes(S.house)) meta.houses.push(S.house); }
    return newRun(meta, clan);
  }

  const UNITS = ['', '', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion'];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 10) return (Math.floor(n * 10) / 10).toString();
    if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
    const k = Math.min(UNITS.length - 1, Math.floor(Math.log10(n) / 3)), v = n / Math.pow(10, k * 3);
    return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + ' ' + UNITS[k];
  }

  const api = { GROW, MILESTONE, provincesPerYear, AWAY_HOURS, CHAPTER, TREASURE, PIDS, paceOverride: null, rand, yearsPerHour, target, pace, ageOf, eraOf, kanjiYear, money, holdersAt,
    house, mods, provinceBonus, multiplier, income, workIncome, isOpen, cost, gain, best, buy, buyAll, reachPoints, reachable, reach, bestReach,
    findTreasure, chaptersFor, chapterList, chapterGiftOf, read, headName, newMeta, newRun, arrive, tick, away, nextRun, fmt };
  return api;
})();
if (typeof module !== 'undefined') module.exports = G;
