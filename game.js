// The game itself: pure functions over one plain state object (saved as JSON). No page code here, so test.js can play it in Node.
// Loaded after data/map.js and data/game-data.js.
const G = (() => {
  const YEAR = 900, SEASON = YEAR / 4;     // seconds of play: a year is 15 minutes, a season under 4
  const TAX = .4;                          // the lord's share of the assessed yield
  const DEF = .025, CAP = .03;             // soldiers a province musters, and you can keep, per koku of yield
  const PRESSURE = 1.5, MARCH = 90;       // a soldier's cost grows with the provinces you hold (to this power); seconds to march on a 200,000-koku province
  const OVERREACH = .3;                    // extra men needed per unsettled province
  const SEASON_RICE = [.8, 1, 1.6, .6];    // spring, summer, autumn (the harvest), winter
  const PIDS = Object.keys(GEO.provinces);
  const ALL = PIDS.length;
  const SEA = new Set(SEA_LINKS);
  const isSea = (a, b) => SEA.has([a, b].sort().join('|'));
  const kokuOf = p => KOKU[p] * 1e4;

  // ---------- randomness: seeded and kept in the state, so a save replays the same ----------
  function rand(S) {
    let t = (S.seed = (S.seed + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const pick = (S, a) => a[Math.floor(rand(S) * a.length)];
  const between = (S, a, b) => a + Math.floor(rand(S) * (b - a + 1));

  // ---------- time ----------
  const yearOf = S => 1467 + Math.floor(S.t / YEAR);
  const seasonOf = S => Math.floor(S.t / SEASON) % 4;
  const seasonProgress = S => (S.t % SEASON) / SEASON;
  function eraOf(y) {
    let e = ERAS[0];
    for (const x of ERAS) if (x[0] <= y) e = x;
    return { en: e[1], ja: e[2], n: y - e[0] + 1 };
  }
  const KN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const kanjiYear = n => n === 1 ? '元' : (n >= 10 ? (n >= 20 ? KN[Math.floor(n / 10)] : '') + '十' : '') + KN[n % 10];

  // ---------- modifiers: the trait, reforms, house codes, the tea collection and passing effects, summed ----------
  const MAXED = ['loyaltyFloor'];
  function mods(S) {
    const m = {};
    const add = (src, k = 1) => { for (const [key, v] of Object.entries(src || {})) m[key] = MAXED.includes(key) ? Math.max(m[key] || 0, v) : (m[key] || 0) + v * k; };
    add(start(S.clan).mods);
    for (const p of POLICIES) if (S.policies[p.id]) add(p.mods, S.policies[p.id]);
    for (const c of CODES) if (S.meta.codes[c.id]) add(c.mods, S.meta.codes[c.id]);
    for (const id of S.meta.collection) add(MEIBUTSU.find(x => x.id === id)?.mods);
    for (const b of S.buffs) if (b.until > S.t) add(b.mods);
    return new Proxy(m, { get: (o, k) => o[k] || 0 });
  }
  const start = clan => STARTS.find(s => s.clan === clan);

  // ---------- who holds what ----------
  const holders = h => (h == null ? [] : Array.isArray(h) ? h.filter(Boolean) : [h]);
  const mine = (S, p) => S.owner[p] === S.clan;
  const owned = S => PIDS.filter(p => S.owner[p] === S.clan);
  function counts(S) {
    const n = {};
    for (const p of PIDS) { const h = S.owner[p], hs = holders(h); for (const c of hs) n[c] = (n[c] || 0) + (Array.isArray(h) ? .5 : 1); }
    return n;
  }
  const clanInfo = (S, c) => CLANS[c] || S.rebels[c] || { en: 'Local lords', ja: '国人', dye: null };
  const clanKoku = (S, c) => PIDS.reduce((s, p) => s + (holders(S.owner[p]).includes(c) ? kokuOf(p) / holders(S.owner[p]).length : 0), 0);
  // a rival's strength grows with its size and with the years: waiting makes every war harder
  function rivalFactor(S, c, n = counts(S)) {
    if (c == null) return .7;
    let f = .8 + .1 * Math.sqrt(n[c] || 1) + .0045 * (yearOf(S) - 1467);
    if (c === 'ikko') f += .25;
    for (const b of S.rivalBuffs) if (b.until > S.t && b.clans.includes(c)) f += b.amt;
    return Math.max(.3, f);
  }
  const pressure = (S, n = counts(S)) => (n[S.clan] || 1) ** PRESSURE;
  function defense(S, p, n = counts(S)) {
    const h = S.owner[p];
    const f = Array.isArray(h) ? Math.max(...h.map(c => rivalFactor(S, c, n))) * .8 : rivalFactor(S, h, n);
    return kokuOf(p) * DEF * f;
  }
  const borders = (S, p) => ADJ[p].filter(q => mine(S, q));
  const seaOnly = (S, p) => { const b = borders(S, p); return b.length > 0 && b.every(q => isSea(p, q)); };

  // ---------- income ----------
  function provinceRice(S, p, m = mods(S)) {
    const lvl = S.castle[p] || 0, gov = S.retainers.find(r => r.role?.gov === p);
    return kokuOf(p) * TAX * (1 + lvl * .12 * (1 + m.castle)) * (1 + (gov ? gov.rule * .04 : 0)) * (S.settle[p] ?? 1);
  }
  function income(S, m = mods(S)) { // per second
    const y = yearOf(S), mineP = owned(S);
    let rice = 0, coin = 0;
    for (const p of mineP) {
      const r = provinceRice(S, p, m);
      rice += r; coin += r * .01;
      const sp = SPECIAL[p];
      if (sp && y >= sp.from) coin += sp.kan * (sp.port ? 1 + m.portCoin : 1);
    }
    for (const c of Object.keys(S.allies)) coin += clanKoku(S, c) * TAX * .004; // tribute
    const fame = 3 * Math.sqrt(mineP.length) + (mine(S, 'yamashiro') ? 30 * (S.flags.capital ? 2 : 1) : 0);
    return {
      koku: rice * (1 + m.yield) * SEASON_RICE[seasonOf(S)] / YEAR,
      kokuAvg: rice * (1 + m.yield) / YEAR,
      kan: coin * (1 + m.coin) / YEAR,
      fame: fame * (1 + m.fame) / YEAR,
    };
  }
  function cap(S, m = mods(S)) {
    let c = 2000;
    for (const p of owned(S)) c += kokuOf(p) * CAP * (1 + (S.castle[p] || 0) * .2 * (1 + m.castle));
    return Math.floor(c * (1 + m.cap));
  }
  // supply lines: the larger the realm, the more rice it takes to raise and send each soldier
  const soldierCost = (S, m = mods(S)) => (50 + 30 * pressure(S)) * Math.max(.2, 1 + m.recruitCost);

  // ---------- war ----------
  const busyLeaders = S => new Set(S.campaigns.map(c => c.leader));
  function freeLeaders(S) {
    const busy = busyLeaders(S), out = [];
    if (!busy.has('lord')) out.push('lord');
    for (const r of S.retainers) if (!r.role && !busy.has(r.id)) out.push(r.id);
    return out;
  }
  const leaderWar = (S, l) => l === 'lord' ? S.lord.war : (S.retainers.find(r => r.id === l)?.war || 0);
  function targetable(S, p) {
    const h = S.owner[p];
    if (h === S.clan) return 'yours';
    if (!borders(S, p).length) return 'not on your border';
    if (holders(h).some(c => S.allies[c] != null)) return 'held by an ally';
    if (S.campaigns.some(c => c.p === p)) return 'already under attack';
    return null;
  }
  // overextension: land not yet settled ties down men, so every unsettled province makes the next war cost more
  const unsettled = S => Object.keys(S.settle).reduce((s, p) => s + (mine(S, p) ? 1 - S.settle[p] : 0), 0);
  const overreach = S => 1 + OVERREACH * unsettled(S);
  // years for a new province to settle: longer the larger the realm
  const settleYears = (S, m = mods(S)) => 2 * (1 + owned(S).length / 12) / (1 + m.unrest);
  function plan(S, p, troops, leader = 'lord', m = mods(S)) {
    const sea = seaOnly(S, p) && !m.seaFree;
    const need = Math.ceil(defense(S, p) * overreach(S) / (1 + m.power) * (sea ? 1.3 : 1) * (S.flags.okehazama ? .5 : 1));
    const war = leaderWar(S, leader);
    const t = troops || need;
    const dur = Math.max(45, MARCH * Math.sqrt(KOKU[p] / 20) * (1 + owned(S).length / 4)) * (sea ? 1.3 : 1) * Math.max(.5, Math.sqrt(need / Math.max(t, 1))) / (1 + m.speed + war * .05);
    const loss = Math.min(t, Math.ceil(need * Math.max(.08, .45 * (1 + m.loss - war * .03))));
    const why = targetable(S, p) || (t < need ? 'not enough men' : t > S.troops ? 'not enough men' : !freeLeaders(S).includes(leader) ? 'no leader free' : null);
    return { need, dur, loss, sea, why, snow: SNOW.includes(p) && !m.snowproof };
  }
  function march(S, p, troops, leader = 'lord') {
    const pl = plan(S, p, troops, leader);
    if (pl.why) return pl.why;
    S.troops -= troops;
    S.campaigns.push({ id: S.nextId++, p, troops, leader, need: pl.need, loss: pl.loss, dur: pl.dur, prog: 0 });
    if (S.flags.okehazama) delete S.flags.okehazama;
    return null;
  }
  function conquer(S, p, settle = .3) {
    const before = holders(S.owner[p]);
    S.owner[p] = S.clan;
    S.settle[p] = Math.min(S.settle[p] ?? settle, settle);
    S.stats.taken++;
    const n = counts(S);
    for (const c of before) if (!n[c]) { log(S, `The ${clanInfo(S, c).en} house is no more.`, 'fall'); delete S.allies[c]; }
    if (n[S.clan] === ALL && !S.unified) { S.unified = true; addFame(S, 1000, true); S.queue.push({ type: 'unified' }); }
  }
  function resolve(S, c) {
    S.campaigns = S.campaigns.filter(x => x !== c);
    const p = c.p, prov = GEO.provinces[p];
    if (mine(S, p) || holders(S.owner[p]).some(k => S.allies[k] != null)) { S.troops += c.troops; return; }
    conquer(S, p);
    S.troops += c.troops - c.loss;
    addFame(S, KOKU[p], true);
    const r = S.retainers.find(x => x.id === c.leader);
    if (r) r.loy = Math.min(100, r.loy + 4);
    log(S, `${prov.en} ${prov.ja} is yours.`, 'win', p);
    if (rand(S) < Math.min(.3, .05 * KOKU[p] / 30 * (1 + mods(S).find))) findMeibutsu(S, null, `in ${prov.en}`);
  }

  // ---------- rivals ----------
  function rivalsMove(S) {
    const n = counts(S), atk = new Set(S.campaigns.map(c => c.p));
    for (const c of Object.keys(n)) {
      if (c === S.clan || rand(S) > .05) continue;
      const own = PIDS.filter(p => holders(S.owner[p]).includes(c));
      const army = own.reduce((s, p) => s + kokuOf(p) * CAP, 0) * rivalFactor(S, c, n);
      const targets = [...new Set(own.flatMap(p => ADJ[p]))].filter(q => S.owner[q] !== S.clan && S.owner[q] !== c && !atk.has(q));
      // a split province it shares is the first thing a clan finishes taking
      const split = own.find(p => Array.isArray(S.owner[p]));
      const q = split || targets.sort((a, b) => defense(S, a, n) - defense(S, b, n))[Math.floor(rand(S) * Math.min(3, targets.length))];
      if (!q || army * .5 < defense(S, q, n)) continue;
      const lost = holders(S.owner[q]);
      S.owner[q] = c;
      const pr = GEO.provinces[q];
      if (ADJ[q].some(x => mine(S, x))) log(S, `The ${clanInfo(S, c).en} take ${pr.en} ${pr.ja}.`, 'rival', q);
      const n2 = counts(S);
      for (const l of lost) if (!n2[l] && l !== c) { log(S, `The ${clanInfo(S, l).en} house is no more.`, 'fall'); delete S.allies[l]; }
      Object.assign(n, n2);
    }
  }
  function rivalBuff(S, clans, amt, years) { S.rivalBuffs.push({ clans, amt, until: S.t + years * YEAR }); }
  function dissolve(S, clan) { for (const p of PIDS) if (S.owner[p] === clan) S.owner[p] = null; delete S.allies[clan]; }
  function greatBattle(S) { // Sekigahara: the strongest rival takes up to two provinces from the next
    const n = counts(S), big = Object.keys(n).filter(c => c !== S.clan && !c.startsWith('reb')).sort((a, b) => n[b] - n[a]);
    if (big.length < 2) return;
    const [a, b] = big;
    const lose = PIDS.filter(p => S.owner[p] === b).sort((x, y) => ADJ[y].filter(q => S.owner[q] === a).length - ADJ[x].filter(q => S.owner[q] === a).length).slice(0, 2);
    for (const p of lose) S.owner[p] = a;
    if (lose.length) log(S, `At Sekigahara the ${clanInfo(S, a).en} break the ${clanInfo(S, b).en}.`, 'rival');
  }

  // ---------- diplomacy ----------
  function allyCost(S, c) {
    const n = counts(S)[c] || 0, m = mods(S);
    return { kan: Math.ceil(800 * n ** 1.3 * Math.max(.2, 1 + m.allyCost)), fame: Math.ceil(25 * n) };
  }
  function ally(S, c) {
    const k = allyCost(S, c);
    if (S.allies[c] != null) return 'already allied';
    if (S.kan < k.kan || S.fame < k.fame) return 'not enough coin or fame';
    if (S.campaigns.some(x => holders(S.owner[x.p]).includes(c))) return 'you are at war with them';
    S.kan -= k.kan; S.fame -= k.fame; S.allies[c] = S.t;
    log(S, `A marriage seals an alliance with the ${clanInfo(S, c).en}.`, 'ally');
    return null;
  }
  function vassalCost(S, c) { return Math.ceil(clanKoku(S, c) / 1e4 * .6 + 20); }
  function canVassal(S, c) {
    if (S.allies[c] == null) return 'not allied';
    if (S.t - S.allies[c] < 3 * YEAR) return 'allied for under 3 years';
    if (clanKoku(S, S.clan) < 2 * clanKoku(S, c)) return 'they are not yet half your size';
    if (S.fame < vassalCost(S, c)) return 'not enough fame';
    return null;
  }
  function vassalize(S, c) {
    const why = canVassal(S, c);
    if (why) return why;
    S.fame -= vassalCost(S, c);
    delete S.allies[c];
    log(S, `The ${clanInfo(S, c).en} submit and become your vassals.`, 'ally');
    for (const p of PIDS) if (holders(S.owner[p]).includes(c)) conquer(S, p, .6);
    return null;
  }
  function breakAlliance(S, c) { delete S.allies[c]; S.fame *= .9; log(S, `You break with the ${clanInfo(S, c).en}.`); }

  // ---------- reforms and castles ----------
  function policyCost(S, p) {
    const lvl = S.policies[p.id] || 0, g = (p.grow || 1) ** lvl, m = mods(S), gun = p.id === 'guns' ? Math.max(.1, 1 + m.gunCost) : 1;
    return { koku: Math.ceil((p.koku || 0) * g), kan: Math.ceil((p.kan || 0) * g * gun) };
  }
  function policyLocked(S, p) {
    const n = p.need;
    if (!n) return null;
    const have = owned(S).length;
    if (n.flag && !S.flags[n.flag]) return lockText(n.flag);
    if (n.year && yearOf(S) < n.year) return `from ${n.year}`;
    if (n.policy && (S.policies[n.policy[0]] || 0) < n.policy[1]) return `needs ${POLICIES.find(x => x.id === n.policy[0]).en} level ${n.policy[1]}`;
    if (n.provinces && have < n.provinces && !(n.orFlag && S.flags[n.orFlag])) return `at ${n.provinces} provinces${n.orFlag ? ' (or ' + lockText(n.orFlag) + ')' : ''}`;
    return null;
  }
  const lockText = f => ({ guns: 'when guns reach Japan, 1543', nanban: 'if you welcome the Jesuits, 1549', nagashino: 'after Nagashino, 1575', azuchi: 'after Azuchi, 1576', kenchi: 'from 1582', katanagari: 'from 1588' })[f] || f;
  function buyPolicy(S, id) {
    const p = POLICIES.find(x => x.id === id), lvl = S.policies[id] || 0;
    if (lvl >= p.max) return 'done';
    const why = policyLocked(S, p);
    if (why) return why;
    const c = policyCost(S, p);
    if (S.koku < c.koku || S.kan < c.kan) return 'not enough';
    S.koku -= c.koku; S.kan -= c.kan; S.policies[id] = lvl + 1;
    return null;
  }
  const castleCost = (S, p) => Math.ceil(kokuOf(p) * TAX * (1 + (S.castle[p] || 0)) ** 1.6 * (S.flags.azuchi ? .7 : 1));
  function buildCastle(S, p) {
    if (!mine(S, p)) return 'not yours';
    if ((S.castle[p] || 0) >= 3) return 'done';
    const c = castleCost(S, p);
    if (S.koku < c) return 'not enough rice';
    S.koku -= c; S.castle[p] = (S.castle[p] || 0) + 1;
    return null;
  }

  // ---------- troops ----------
  function recruit(S, n) {
    const m = mods(S), cost = soldierCost(S, m), room = Math.max(0, cap(S, m) - S.troops);
    n = Math.floor(Math.min(n, room, S.koku / cost));
    if (n <= 0) return 0;
    S.koku -= n * cost; S.troops += n;
    return n;
  }

  // ---------- retainers ----------
  function makeRetainer(S) {
    const y = yearOf(S), born = y - between(S, 18, 34);
    const used = new Set(S.retainers.map(r => r.name));
    let name;
    do name = pick(S, NAMES.family) + ' ' + pick(S, NAMES.given); while (used.has(name));
    return { id: S.nextId++, name, war: between(S, 1, 10), rule: between(S, 1, 10), amb: between(S, 1, 5), loy: between(S, 55, 80), born, dies: born + between(S, 48, 72), role: null, gifts: 0, devoted: 0 };
  }
  const hireCost = (S, r) => Math.ceil(600 * 1.55 ** S.retainers.length * (.6 + (r.war + r.rule) / 20));
  function hire(S, i) {
    const r = S.pool[i];
    if (!r) return 'gone';
    if (S.kan < hireCost(S, r)) return 'not enough coin';
    S.kan -= hireCost(S, r); S.hired++;
    S.pool.splice(i, 1);
    S.retainers.push(r);
    return null;
  }
  function assign(S, id, role) { // role: null (free, can lead campaigns) or {gov: province}
    const r = S.retainers.find(x => x.id === id);
    if (!r) return;
    if (role?.gov) { if (!mine(S, role.gov)) return; for (const o of S.retainers) if (o.role?.gov === role.gov) o.role = null; }
    if (busyLeaders(S).has(id) && role) return 'leading a campaign';
    r.role = role;
  }
  const riceGiftCost = (S, r) => Math.ceil(Math.max(5000, income(S).kokuAvg * YEAR * .25) * 1.5 ** r.gifts);
  function giftRice(S, id) {
    const r = S.retainers.find(x => x.id === id), c = riceGiftCost(S, r);
    if (S.koku < c) return 'not enough rice';
    S.koku -= c; r.gifts++; r.loy = Math.min(100, r.loy + 15);
    return null;
  }
  function giftMeibutsu(S, id, item) {
    const r = S.retainers.find(x => x.id === id), i = S.held.indexOf(item);
    if (!r || i < 0) return 'not held';
    S.held.splice(i, 1);
    r.loy = 100; r.devoted = S.t + 15 * YEAR; r.gift = item;
    log(S, `${r.name} receives ${MEIBUTSU.find(x => x.id === item).en} and swears his life to you.`, 'tea');
    return null;
  }
  function allLoyalty(S, d) { for (const r of S.retainers) r.loy = Math.max(0, Math.min(100, r.loy + d)); }
  const teaCost = S => Math.ceil(Math.max(300, income(S).kan * YEAR * .3));
  function teaReady(S) {
    if (!S.held.length) return 'you need a tea utensil to show';
    if (S.t - S.teaAt < YEAR) return 'once a year';
    if (S.kan < teaCost(S)) return 'not enough coin';
    return null;
  }
  function tea(S) {
    const why = teaReady(S);
    if (why) return why;
    const m = mods(S);
    S.kan -= teaCost(S); S.teaAt = S.t;
    allLoyalty(S, Math.round(12 * (1 + m.tea)));
    addFame(S, 20 * (1 + m.tea), true);
    log(S, 'You hold a tea gathering. Your retainers leave honoured.', 'tea');
    return null;
  }
  function rebel(S, r) {
    const busy = S.campaigns.find(c => c.leader === r.id);
    S.retainers = S.retainers.filter(x => x !== r);
    const family = r.name.split(' ')[0];
    if (r.role?.gov && owned(S).length > 1) {
      const id = 'reb' + S.nextId++, p = r.role.gov;
      S.rebels[id] = { en: family, ja: '', dye: 'rikyu', motif: 'plain', rebel: true, title: `Rebels under ${r.name}` };
      S.owner[p] = id;
      S.queue.push({ type: 'gekokujo', name: r.name, p });
      log(S, `Gekokujō! ${r.name} seizes ${GEO.provinces[p].en} for himself.`, 'fall', p);
    } else if (busy) {
      S.campaigns = S.campaigns.filter(c => c !== busy);
      S.queue.push({ type: 'desert', name: r.name, p: busy.p, troops: busy.troops });
      log(S, `${r.name} turns his army around and deserts with ${fmt(busy.troops)} men.`, 'fall');
    } else log(S, `${r.name} has left your service.`, 'fall');
  }

  // ---------- tea utensils ----------
  function findMeibutsu(S, ids, where = '') {
    const y = yearOf(S);
    const pool = MEIBUTSU.filter(x => (ids ? ids.includes(x.id) : true) && !S.held.includes(x.id) && !S.given.includes(x.id) && (x.from || 0) <= y);
    if (!pool.length) return null;
    const w = x => ({ 1: 6, 2: 3, 3: 1 })[x.tier];
    let r = rand(S) * pool.reduce((s, x) => s + w(x), 0);
    const item = pool.find(x => (r -= w(x)) < 0) || pool[0];
    S.held.push(item.id);
    const fresh = !S.meta.collection.includes(item.id);
    if (fresh) S.meta.collection.push(item.id);
    S.queue.push({ type: 'meibutsu', id: item.id, fresh, where });
    log(S, `Found ${where}: ${item.en} ${item.ja}.`, 'tea');
    return item;
  }
  const sakaiOpen = S => mine(S, 'izumi') || holders(S.owner.izumi).some(c => S.allies[c] != null);
  function merchantRefresh(S) {
    if (!sakaiOpen(S)) { S.merchant = null; return; }
    const y = yearOf(S), pool = MEIBUTSU.filter(x => !S.held.includes(x.id) && !S.given.includes(x.id) && (x.from || 0) <= y);
    if (!pool.length) { S.merchant = null; return; }
    const item = pick(S, pool);
    S.merchant = { id: item.id, kan: Math.ceil(item.tier ** 2 * 2500 * (1 + (y - 1467) / 60)) };
  }
  function buyMerchant(S) {
    const o = S.merchant;
    if (!o) return 'no offer';
    if (S.kan < o.kan) return 'not enough coin';
    S.kan -= o.kan; S.merchant = null;
    S.held.push(o.id);
    const fresh = !S.meta.collection.includes(o.id);
    if (fresh) S.meta.collection.push(o.id);
    log(S, `Bought from a Sakai merchant: ${MEIBUTSU.find(x => x.id === o.id).en}.`, 'tea');
    return null;
  }

  // ---------- small helpers the events use ----------
  function addFame(S, x, scaled) { const v = scaled ? x * (1 + mods(S).fame) : x; S.fame = Math.max(0, S.fame + v); if (v > 0) S.fameTotal += v; }
  function buff(S, m, years, en) { S.buffs.push({ mods: m, until: S.t + years * YEAR, en }); }
  function log(S, text, kind = '', p = null) { S.log.push({ t: S.t, text, kind, p }); if (S.log.length > 80) S.log.shift(); }
  function fmt(n) {
    n = Math.floor(n);
    if (n < 1e4) return n.toLocaleString('en-US');
    for (const [v, s] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']]) if (n >= v) { const x = n / v; return (x < 100 ? x.toFixed(1) : Math.round(x)) + s; }
  }

  // ---------- the year turning: history, newcomers, births and deaths ----------
  function newYear(S, y) {
    for (const [ry, c, p] of RISERS) if (ry === y && c !== S.clan && !mine(S, p)) {
      const was = holders(S.owner[p]);
      S.owner[p] = c;
      const pr = GEO.provinces[p];
      log(S, `The ${clanInfo(S, c).en} rise in ${pr.en} ${pr.ja}.`, 'rival', p);
      const n = counts(S);
      for (const l of was) if (!n[l]) delete S.allies[l];
    }
    for (const e of EVENTS) if (e.year === y && !S.seen.includes(e.id)) {
      S.seen.push(e.id);
      if (e.fx) e.fx(S, api);
      S.queue.push({ type: 'event', id: e.id });
    }
    if (y >= S.lord.dies) succession(S);
    for (const r of [...S.retainers]) if (y >= r.dies) {
      S.retainers = S.retainers.filter(x => x !== r);
      if (r.gift) S.given.push(r.gift);
      log(S, `${r.name} dies, aged ${y - r.born}.`, 'fall');
    }
    S.pool = [makeRetainer(S), makeRetainer(S), makeRetainer(S)];
    merchantRefresh(S);
  }
  function succession(S) {
    const old = S.lord, names = NAMES.lord[S.clan] || ['Yoshi'];
    const name = clanInfo(S, S.clan).en + ' ' + names[(old.n + 1) % names.length];
    const y = yearOf(S), born = y - between(S, 17, 26);
    S.lord = { name, born, dies: born + between(S, 50, 72), n: old.n + 1, war: between(S, 3, 9) };
    allLoyalty(S, -10);
    S.queue.push({ type: 'succession', old: old.name, name, age: y - old.born });
    log(S, `${old.name} dies. ${name} leads the house.`, 'fall');
  }

  // ---------- a run ----------
  function newMeta() { return { renown: 0, renownTotal: 0, codes: {}, unlocked: STARTS.filter(s => !s.cost).map(s => s.clan), collection: [], runs: 0, best: 0 }; }
  function newRun(meta, clan) {
    const st = start(clan), owner = {};
    for (const p of PIDS) {
      const h = BASE_1467[p];
      owner[p] = Array.isArray(h) ? (h.includes(clan) ? h.find(c => c !== clan) ?? null : h) : h === clan ? null : h;
    }
    owner[st.home] = clan;
    const names = NAMES.lord[clan] || ['Yoshi'];
    const S = {
      v: 1, meta, clan, t: 0, seed: (Math.random() * 2 ** 31) | 0, owner, settle: {}, castle: {},
      koku: 60000, kan: 500, troops: 6000, fame: 0, fameTotal: 0, levy: .5,
      policies: {}, flags: {}, buffs: [], rivalBuffs: [], allies: {}, rebels: {},
      lord: { name: CLANS[clan].en + ' ' + names[0], born: 1445, dies: 1467 + 20 + Math.floor(Math.random() * 25), n: 0, war: 6 },
      retainers: [], pool: [], hired: 0, nextId: 1, campaigns: [],
      held: [], given: [], merchant: null, teaAt: -1e9,
      seen: [], queue: [], log: [], stats: { taken: 0 }, unified: false, auto: true, savedAt: Date.now(),
    };
    const stores = meta.codes.stores || 0;
    S.koku += stores * kokuOf(st.home) * TAX;
    S.troops += stores * 3000;
    const first = makeRetainer(S);
    first.loy = 75; first.amb = Math.min(first.amb, 3);
    S.retainers.push(first);
    newYear(S, 1467);
    return S;
  }
  function renown(S) {
    const k = owned(S).reduce((s, p) => s + KOKU[p], 0);
    return Math.floor((.6 * k ** .75 + S.fameTotal / 100) * (S.unified ? 2 : 1));
  }
  function retire(S, clan) {
    const meta = S.meta, r = renown(S);
    meta.renown += r; meta.renownTotal += r; meta.runs++;
    meta.best = Math.max(meta.best, owned(S).length);
    return newRun(meta, clan);
  }
  const codeCost = (meta, c) => Math.ceil(c.cost * 1.6 ** (meta.codes[c.id] || 0));
  function buyCode(meta, id) {
    const c = CODES.find(x => x.id === id), lvl = meta.codes[id] || 0;
    if (lvl >= c.max) return 'done';
    if (meta.renown < codeCost(meta, c)) return 'not enough renown';
    meta.renown -= codeCost(meta, c); meta.codes[id] = lvl + 1;
    return null;
  }
  function unlockClan(meta, clan) {
    const s = start(clan);
    if (meta.unlocked.includes(clan)) return null;
    if (meta.renown < s.cost) return 'not enough renown';
    meta.renown -= s.cost; meta.unlocked.push(clan);
    return null;
  }

  // ---------- the clock ----------
  function tick(S, dt) {
    const m = mods(S), y0 = yearOf(S), s0 = Math.floor(S.t / SEASON);
    const inc = income(S, m);
    // rice: the levy share raises troops until the limit, the rest goes to the granary
    const c = cap(S, m), cost = soldierCost(S, m), rice = inc.koku * dt;
    const toTroops = S.troops < c ? Math.min(rice * S.levy, (c - S.troops) * cost) : 0;
    S.troops += toTroops / cost; S.koku += rice - toTroops;
    S.kan += inc.kan * dt;
    addFame(S, inc.fame * dt);
    // new provinces settle
    for (const p of Object.keys(S.settle)) {
      S.settle[p] = Math.min(1, S.settle[p] + dt * .7 / (settleYears(S, m) * YEAR));
      if (S.settle[p] >= 1 || !mine(S, p)) delete S.settle[p];
    }
    // campaigns: summer marches fast, winter snow stops the north
    const season = seasonOf(S);
    for (const cp of [...S.campaigns]) {
      const snowed = season === 3 && SNOW.includes(cp.p) && !m.snowproof;
      if (!snowed) cp.prog += dt * (season === 1 ? 1.25 : 1);
      if (cp.prog >= cp.dur) resolve(S, cp);
    }
    // loyalty
    const floor = m.loyaltyFloor;
    for (const r of [...S.retainers]) {
      if (r.devoted > S.t) continue;
      const big = r.role?.gov && KOKU[r.role.gov] > 50 ? .3 : 0;
      const before = r.loy;
      r.loy = Math.max(floor, r.loy - dt / YEAR * (.2 + .3 * r.amb + big) * Math.max(.1, 1 + m.loyaltyDecay));
      if (before > 25 && r.loy <= 25) log(S, `${r.name} is heard muttering about his reward.`, 'warn');
      if (r.loy <= 0) rebel(S, r);
    }
    S.t += dt;
    if (Math.floor(S.t / SEASON) !== s0) rivalsMove(S);
    const y1 = yearOf(S);
    for (let y = y0 + 1; y <= y1; y++) newYear(S, y);
    if (S.meta.codes.strategist && S.auto) autoMarch(S, m);
  }
  // the strategist: the best-value target he can afford, with a quarter more men than needed
  function autoMarch(S, m) {
    const leaders = freeLeaders(S);
    if (!leaders.length) return;
    const n = counts(S);
    let best = null;
    for (const p of PIDS) {
      if (targetable(S, p)) continue;
      const pl = plan(S, p, 0, leaders[0], m);
      if (pl.need * 1.25 > S.troops || (pl.snow && seasonOf(S) === 3)) continue;
      const v = KOKU[p] / pl.need;
      if (!best || v > best.v) best = { p, v, need: pl.need };
    }
    if (best) march(S, best.p, Math.min(S.troops, Math.ceil(best.need * 1.25)), leaders[0]);
    void n;
  }
  // time away, in 10-second steps; returns what changed
  function away(S, seconds) {
    const m = mods(S);
    const capH = 12 * (1 + m.offlineCap) + m.offlineHours;
    const sim = Math.min(seconds * (1 + m.offlineRate), capH * 3600);
    const before = { koku: S.koku, kan: S.kan, troops: S.troops, fame: S.fame, prov: owned(S).length, year: yearOf(S), log: S.log.length && S.log[S.log.length - 1] };
    let left = sim;
    while (left > 0) { const dt = Math.min(10, left); tick(S, dt); left -= dt; }
    const i = S.log.indexOf(before.log);
    return { seconds, sim, capped: seconds * (1 + m.offlineRate) > capH * 3600, capH, koku: S.koku - before.koku, kan: S.kan - before.kan, troops: S.troops - before.troops, fame: S.fame - before.fame, prov: owned(S).length - before.prov, from: before.year, to: yearOf(S), news: S.log.slice(i + 1) };
  }

  const api = { YEAR, SEASON, ALL, PIDS, rand, yearOf, seasonOf, seasonProgress, eraOf, kanjiYear, mods, counts, owned, mine, holders, clanInfo, clanKoku, rivalFactor, defense,
    borders, seaOnly, income, provinceRice, cap, soldierCost, freeLeaders, targetable, plan, march, conquer, allyCost, ally, vassalCost, canVassal, vassalize,
    breakAlliance, policyCost, policyLocked, buyPolicy, castleCost, buildCastle, recruit, hireCost, hire, assign, riceGiftCost, giftRice, giftMeibutsu,
    allLoyalty, teaCost, teaReady, tea, findMeibutsu, sakaiOpen, buyMerchant, addFame, buff, rivalBuff, dissolve, greatBattle, log, fmt, newMeta, newRun,
    renown, retire, codeCost, buyCode, unlockClan, tick, away, kokuOf, start, pressure, unsettled, overreach, settleYears };
  return api;
})();
if (typeof module !== 'undefined') module.exports = G;
