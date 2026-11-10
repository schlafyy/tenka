// node test.js        checks the data and the rules, then lets a bot play to show the pacing
// node test.js quick  skips the bot
const assert = require('assert');
Object.assign(globalThis, require('./data/map.js'), require('./data/game-data.js'));
const G = require('./game.js');

// ---- data ----
const PIDS = Object.keys(GEO.provinces);
assert.strictEqual(PIDS.length, 68);
for (const p of PIDS) { assert(KOKU[p] > 0, 'koku for ' + p); for (const q of ADJ[p]) assert(ADJ[q].includes(p), `border ${p}-${q} one-way`); }
for (const p of Object.keys(SPECIAL)) assert(GEO.provinces[p], 'unknown province ' + p);
for (const h of HOUSES) { assert(CLANS[h.clan] && CRESTS[h.clan], 'clan and crest ' + h.clan); assert(GEO.provinces[h.home]); assert(NAMES.lord[h.clan], 'names ' + h.clan); }
assert.strictEqual(G.fmt(1e60), "1.00e60"); // numbers past the named scales stay short
for (const w of WORKS) {
  assert(w.year >= AGES[w.age].from && (!AGES[w.age + 1] || w.year < AGES[w.age + 1].from), 'trade in its age: ' + w.id);
  assert(w.manager && w.upgrades.length === 3, 'manager and upgrades: ' + w.id);
}
for (let j = 1; j < WORKS.length; j++) assert(G.T[WORKS[j].id].cost > G.T[WORKS[j - 1].id].cost, 'each trade dearer than the last');
for (const e of [...EVENTS, ...LATER_EVENTS]) assert(e.year && e.en && e.short && Array.isArray(e.sides), 'chapter ' + e.id);
assert.strictEqual(new Set([...EVENTS, ...LATER_EVENTS].map(e => e.id)).size, EVENTS.length + LATER_EVENTS.length, 'chapter ids unique');
assert.strictEqual(new Set(TREASURES.map(t => t.id)).size, TREASURES.length);

// ---- rules ----
assert.strictEqual(G.yearFor(0), 1467);
assert.strictEqual(G.yearFor(1e100), END_YEAR);
for (const y of [1500, 1603, 1700, 1900, 2000]) assert(Math.abs(G.yearFor(G.earnedFor(y) * 1.0001) - y) <= 1, 'earnedFor inverts yearFor at ' + y);
assert.strictEqual(G.holdersAt(1900).owari, 'empire');
assert.strictEqual(G.holdersAt(1990).owari, 'nation');
assert.strictEqual(`${G.eraOf(1521).ja}${G.kanjiYear(G.eraOf(1521).n)}`, '大永元');
assert(!G.chaptersFor('takeda').some(e => e.sides.includes('takeda') && e.winner && e.winner !== 'takeda'), 'the Takeda never see their own fall');

let S = G.newRun(G.newMeta(), 'takeda', 42);
assert.strictEqual(S.lv.paddies, 1);
assert(G.run(S, 'paddies'), 'tap to start the paddies');
assert(!G.run(S, 'paddies'), 'not twice while running');
G.tick(S, G.cycle(S, 'paddies') + .01);
assert(S.money > 0 && S.prog.paddies == null, 'a cycle pays out, then waits for a tap');
S.money = 1e6;
assert.strictEqual(G.buy(S, 'paddies', 10), 10);
assert.strictEqual(S.lv.paddies, 11);
const n = G.maxBuy(S, 'paddies');
assert(G.priceOf(S, 'paddies', n) <= S.money && G.priceOf(S, 'paddies', n + 1) > S.money, 'max buys exactly what the money allows');
assert(!G.buy(S, 'mine', 1), 'the silver mine opens in 1526');
assert(G.hire(S, 'paddies') && S.prog.paddies === 0, 'a manager starts the paddies');
G.tick(S, 100);
assert(S.prog.paddies != null && S.prog.paddies < G.cycle(S, 'paddies'), 'a managed trade keeps cycling');
S.lv.paddies = 24; const slow = G.cycle(S, 'paddies'); S.lv.paddies = 25;
assert.strictEqual(G.cycle(S, 'paddies'), slow / 2, 'level 25 halves the cycle');
const r0 = G.rate(S, 'paddies');
S.money = 1e30;
assert(G.buyUpgrade(S, 'paddies:0') && Math.abs(G.rate(S, 'paddies') / r0 - 3) < 1e-9, 'an upgrade triples the profit');
assert(S.reach.length > 1 && G.reachPoints(S) === 0, 'the house reaches provinces by itself as the years pass');
assert(S.reach.every(p => p === 'kai' || S.reach.some(q => ADJ[q].includes(p))), 'each one next to land it already had');
S.pts = 1; assert(!G.reach(S, 'tsushima') || ADJ.tsushima.some(q => S.reach.includes(q)), 'not a far province');
S.year = 1600; G.arrive(S);
assert(S.unread.length > 30, 'the chapters arrive with the years');
while (S.unread.length) G.read(S, S.unread[0]);
assert(S.heads.length >= 3, 'heads of the house come and go');
const json = JSON.parse(JSON.stringify(S));
assert.strictEqual(G.income(json), G.income(S), 'a save round-trips');
S.earned = 1e20;
const gain = G.renownGain(S);
assert(gain > 0);
const T2 = G.prestige(S, 'shimazu');
assert.strictEqual(T2.meta.renown, gain);
assert.strictEqual(T2.year, 1467);
assert.deepStrictEqual(T2.reach, ['satsuma']);
assert.strictEqual(G.renownGain(T2), 0, 'renown is not paid twice');
T2.year = 1600; G.arrive(T2);
assert(T2.readIds.length > 30 && T2.unread.every(id => !T2.meta.seen.includes(id)), 'chapters read before count as read; only new ones wait');

const away = G.newRun(G.newMeta(), 'oda', 1);
away.lv.paddies = 10; away.money = 1e4; G.hire(away, 'paddies');
const rep = G.away(away, 3600);
assert(rep.money > 0 && rep.managed, 'managers earn while you are away');
// crossroads: one way per turning point for the run; every way taken counts for good
for (const c of CROSSROADS) { assert(c.options.length === 2 && AGES.some(a => a.from <= c.year), 'crossroads ' + c.id); for (const o of c.options) for (const k of Object.keys(o.mods)) assert(['profit', 'cost', 'speed', 'reach', 'away', 'find', 'chapter'].includes(k) || G.T[k], 'mod ' + k); }
const X = G.newRun(G.newMeta(), 'takeda', 2);
X.lv.mine = 10; G.earn(X, G.earnedFor(1560));
assert.deepStrictEqual(G.crossings(X).map(c => c.id), ['nanban'], 'a crossroads waits from its year');
const mineWas = G.payout(X, 'mine');
assert(!G.choose(X, 'rakuichi', 'free') && !G.choose(X, 'nanban', 'nope'), 'only a reached crossroads, only its own ways');
assert(G.choose(X, 'nanban', 'ships') && !G.choose(X, 'nanban', 'home'), 'one way per run');
assert(Math.abs(G.payout(X, 'mine') / mineWas - 2 * (1 + G.PATH) / (1 + 0)) < 1e-9, 'the way taken doubles its trade, and the path adds 1%');
const X2 = G.prestige(X);
assert(!Object.keys(X2.choices).length && X2.meta.paths.length === 1, 'a new beginning brings the choice again; the path stays');
const B = G.newRun(G.newMeta(), 'oda', 3); B.lv.paddies = 1; G.earn(B, G.earnedFor(1988));
for (const c of G.crossings(B)) G.choose(B, c.id, c.options[0].id);
const boom = G.profitAll(B); G.earn(B, G.earnedFor(1992) - B.earned);
assert(G.profitAll(B) < boom && B.chron.some(e => /bubble bursts/.test(e.en)), 'the bubble bursts in 1991');
const U = G.newRun(G.newMeta(), 'uesugi', 4);
U.readIds = ['a', 'b', 'c', 'd', 'e'];
assert(Math.abs(G.profitAll(U) - (1 + G.CHAPTER * 5 * 1.5)) < 1e-9, 'the Uesugi read chapters for 50% more');
console.log('rules ok');

if (process.argv[2] === 'quick') process.exit(0);

// ---- pacing: a bot that checks in a few times a day ----
// the best thing to buy: the most income per koku (a manager counts as tripling what its trade earns, since nobody taps while you are away)
function options(S) {
  const out = [], all = G.profitAll(S);
  for (const w of WORKS) {
    if (S.year < w.year) continue;
    const id = w.id, now = S.lv[id] ? G.rate(S, id, all) : 0;
    const n = G.maxBuy(S, id) >= 10 ? 10 : 1;
    S.lv[id] = (S.lv[id] || 0) + n; const then = G.rate(S, id, all); S.lv[id] -= n;
    out.push({ kind: 'lv', id, n, cost: G.priceOf(S, id, n), gain: then - now });
    if (!S.mgr[id] && S.lv[id]) out.push({ kind: 'mgr', id, cost: G.managerCost(S, id), gain: now * 3 });
  }
  const inc = G.income(S, false);
  for (const u of G.upgrades(S)) if (u.open && !u.owned) out.push({ kind: 'upg', id: u.id, cost: u.cost, gain: u.realm ? inc * 2 : (S.lv[u.work] ? G.rate(S, u.work, all) * 2 : 0) });
  // a guest: what their help is worth now (the tea room and the like are worth a little of everything)
  for (const g of G.visitors(S)) out.push({ kind: 'guest', id: g.id, cost: G.welcomeCost(S, g),
    gain: g.does.work ? (S.lv[g.does.work] ? G.rate(S, g.does.work, all) * 2 : 1e-9) : g.does.all ? inc * .1 : Math.max(inc * .2, 1) });
  return out.filter(o => o.gain > 0);
}
function act(S) {
  for (let k = 0; k < 400; k++) {
    const best = options(S).sort((a, b) => b.gain / b.cost - a.gain / a.cost)[0];
    if (!best || best.cost > S.money) break;
    if (best.kind === 'lv') G.buy(S, best.id, best.n);
    if (best.kind === 'mgr') G.hire(S, best.id);
    if (best.kind === 'upg') G.buyUpgrade(S, best.id);
    if (best.kind === 'guest') G.welcome(S, best.id);
  }
  for (const c of G.crossings(S)) G.choose(S, c.id, c.options[S.meta.runs % 2].id); // the bot tries the other way on each new beginning
  G.serveTea(S);
  G.daily(S, 'day' + Math.floor(S.t / 86400));
  for (const t of S.day.tasks) G.claimTask(S, t);
  while (S.unread.length) G.read(S, S.unread[0]);
  while (G.reachPoints(S) > 0 && G.reachable(S).length) G.reach(S, G.bestReach(S));
}
function play(days) {
  let S = G.newRun(G.newMeta(), 'oda', 7), h = 0;
  const firsts = {}, daily = [];
  const mark = () => { const a = G.ageOf(S.year); if (firsts[a] === undefined) firsts[a] = h; };
  const visit = minutes => {
    for (let s = 0; s < minutes * 60; s++) { for (const w of WORKS) G.run(S, w.id); G.tick(S, 1); if (s % 5 === 0) act(S); mark(); h += 1 / 3600; if (S.done) return; }
    if (G.renownGain(S) >= Math.max(30, S.meta.renown)) S = G.prestige(S);
  };
  const gone = hours => { G.away(S, hours * 3600); act(S); mark(); h += hours; };
  visit(30);
  if (!days) return { S, firsts, daily, h };
  for (let d = 0; d < days && !S.done; d++) {
    for (const at of [4, 8, 12, 15, 24]) { gone(d * 24 + at - h); visit(3); if (S.done) break; }
    daily.push(`${S.year}${S.meta.runs ? '/' + S.meta.runs : ''}`);
  }
  return { S, firsts, daily, h };
}
const first = play(0);
console.log(`first half hour: ${first.S.year}, ${G.fmt(first.S.money)} koku, managers ${Object.keys(first.S.mgr).length}, levels`, WORKS.filter(w => first.S.lv[w.id]).map(w => w.glyph + first.S.lv[w.id]).join(' '));
const { S: end, firsts, daily, h } = play(30);
console.log(`${end.done ? 'the present day after ' + (h / 24).toFixed(1) + ' days' : 'not there after 30 days'}, ${end.meta.runs} new beginnings, renown ${G.fmt(end.meta.renown)}`);
console.log('  ages first reached on day', Object.entries(firsts).map(([a, t]) => `${AGES[a].id} ${(t / 24).toFixed(1)}`).join(', '));
console.log('  year/beginnings at the end of each day:', daily.join(' '));
