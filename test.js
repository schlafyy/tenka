// node test.js        checks the data and the rules, then lets a bot play to show the pacing
// node test.js quick  skips the long simulation
const assert = require('assert');
Object.assign(globalThis, require('./data/map.js'), require('./data/game-data.js'));
const G = require('./game.js');

// ---- data ----
const PIDS = Object.keys(GEO.provinces);
assert.strictEqual(PIDS.length, 68);
for (const p of PIDS) {
  assert(KOKU[p] > 0, 'koku for ' + p);
  for (const q of ADJ[p]) assert(ADJ[q].includes(p), `border ${p}-${q} one-way`);
  assert(ADJ[p].length, p + ' has no neighbours');
}
for (const p of Object.keys(KOKU)) assert(GEO.provinces[p], 'unknown province ' + p);
for (const p of [...Object.keys(SPECIAL), ...SNOW]) assert(GEO.provinces[p], 'unknown province ' + p);
for (const s of STARTS) { assert(CLANS[s.clan], 'clan ' + s.clan); assert(GEO.provinces[s.home]); assert(NAMES.lord[s.clan], 'lord names ' + s.clan); }
for (const [y, c, p] of RISERS) { assert(CLANS[c], 'riser clan ' + c); assert(GEO.provinces[p], 'riser province ' + p); assert(y >= 1467); }
for (const c of Object.values(BASE_1467).flat()) if (c) assert(CLANS[c], 'base clan ' + c);
let last = 0;
for (const e of EVENTS) { assert(e.year >= last, 'events in order: ' + e.id); last = e.year; assert(e.fx || e.choices, e.id); }
assert.strictEqual(new Set(MEIBUTSU.map(x => x.id)).size, MEIBUTSU.length);
const total = Object.values(KOKU).reduce((s, x) => s + x, 0);
assert(total > 1700 && total < 2000, 'realm total ' + total);

// ---- rules ----
const meta = G.newMeta();
let S = G.newRun(meta, 'oda');
assert(G.mine(S, 'owari') && G.owned(S).length === 1);
assert.strictEqual(S.owner.totomi, 'shiba', 'Shiba keep their other lands');
assert(G.targetable(S, 'mino') === null && G.targetable(S, 'kai') === 'not on your border');
const pl = G.plan(S, 'mikawa', 0);
assert(pl.need > 0 && pl.dur >= 30);
S.troops = pl.need;
assert.strictEqual(G.march(S, 'mikawa', pl.need), null);
assert.strictEqual(G.freeLeaders(S).includes('lord'), false);
for (let i = 0; i < 2000 && S.campaigns.length; i++) G.tick(S, 1);
assert(G.mine(S, 'mikawa'), 'campaign takes Mikawa');
assert(S.settle.mikawa < 1, 'a new province starts unsettled');
// a governor who reaches zero loyalty takes his province
const r = S.retainers[0];
G.assign(S, r.id, { gov: 'mikawa' });
r.loy = 1e-6; r.devoted = 0;
G.tick(S, 1);
assert(!G.mine(S, 'mikawa') && S.owner.mikawa.startsWith('reb'), 'gekokujō');
// saves survive JSON
const S2 = JSON.parse(JSON.stringify(S));
G.tick(S2, 5);
// retiring keeps the meta and starts fresh
S.fameTotal = 5000;
const n = G.renown(S);
const S3 = G.retire(S, 'takeda');
assert.strictEqual(S3.meta.renown, n);
assert(G.mine(S3, 'kai') && S3.t === 0);
// sea: Sado can only be reached across the water
let T = G.newRun(G.newMeta(), 'oda');
T.owner.echigo = 'oda';
assert(G.seaOnly(T, 'sado') && !G.seaOnly(T, 'shinano'));
console.log('checks pass; realm', Math.round(total), 'man-koku,', SEA_LINKS.length, 'sea links');

if (process.argv[2] === 'quick') process.exit(0);

// ---- a bot plays: active for the first two hours, then checks in every 30 minutes ----
function bot(S) {
  while (S.queue.length) { const q = S.queue.shift(); if (q.type === 'event') { const e = EVENTS.find(x => x.id === q.id); if (e.choices) e.choices[0].fx(S, G); } }
  for (const p of [...POLICIES].sort((a, b) => (G.policyCost(S, a).koku + G.policyCost(S, a).kan * 50) - (G.policyCost(S, b).koku + G.policyCost(S, b).kan * 50))) G.buyPolicy(S, p.id);
  if (S.pool.length && S.retainers.length < 2 + G.owned(S).length / 4) G.hire(S, 0);
  const big = G.owned(S).sort((a, b) => KOKU[b] - KOKU[a]);
  S.retainers.forEach((r, i) => { if (i % 2 === 1 && !r.role && big[i]) G.assign(S, r.id, { gov: big[i] }); if (r.loy < 35) G.giftRice(S, r.id); });
  G.tea(S);
  for (const p of big.slice(0, 6)) if (S.koku > G.castleCost(S, p) * 3) G.buildCastle(S, p);
  G.recruit(S, (S.koku * .5) / G.soldierCost(S));
  for (const l of G.freeLeaders(S)) {
    let best = null;
    for (const p of PIDS) {
      if (G.targetable(S, p)) continue;
      const x = G.plan(S, p, 0, l);
      if (x.need * 1.2 <= S.troops && (!best || KOKU[p] / x.need > best.v)) best = { p, v: KOKU[p] / x.need, need: x.need };
    }
    if (best) G.march(S, best.p, Math.ceil(best.need * 1.2), l);
  }
}
function run(meta, clan, hours) {
  const S = G.newRun(meta, clan), marks = [.25, .5, 1, 2, 4, 8, 12, 24, 36, 48, 72, 96].filter(h => h <= hours), out = [];
  let t = 0, rebels = 0;
  const reach = [3, 5, 10, 20, 34, 50, 68], hit = [];
  while (t < hours * 3600) {
    const step = t < 7200 ? 60 : 1800;
    bot(S);
    const before = S.log.length;
    G.away(S, step);
    rebels += S.log.slice(-Math.max(0, S.log.length - before + 1)).filter(l => l.text.startsWith('Gekokujō')).length;
    t += step;
    if (marks.length && t >= marks[0] * 3600) { const h = marks.shift(); if (h === 96) out.push('not yours: ' + PIDS.filter(p => !G.mine(S, p)).map(p => p + '=' + JSON.stringify(S.owner[p])).join(' ')); out.push(`${h}h: ${G.owned(S).length} prov, ${G.yearOf(S)}, renown ${G.renown(S)}, troops ${G.fmt(S.troops)}/${G.fmt(G.cap(S))}, rice ${G.fmt(G.income(S).kokuAvg * G.YEAR)}/yr, soldier ${Math.round(G.soldierCost(S))}, unsettled ${G.unsettled(S).toFixed(1)}, ret ${S.retainers.length}`); }
    while (reach.length && G.owned(S).length >= reach[0]) hit.push(`${reach.shift()}@${(t / 3600).toFixed(1)}h`);
    if (S.unified) { out.push(`UNIFIED at ${(t / 3600).toFixed(1)}h (${G.yearOf(S)})`); break; }
  }
  out.push('reached: ' + hit.join(' '));
  return { S, out, rebels };
}
// every clan you can play gets going
for (const s of STARTS) {
  const meta = G.newMeta(); meta.unlocked = STARTS.map(x => x.clan);
  const { out } = run(meta, s.clan, 24);
  console.log(s.clan.padEnd(10), out[out.length - 1]);
}
let m = G.newMeta();
for (let k = 1; k <= 4; k++) {
  const { S, out, rebels } = run(m, 'oda', 120);
  console.log(`\nrun ${k} (oda, codes ${JSON.stringify(m.codes)}), rebellions ${rebels}`);
  console.log(out.join('\n'));
  // retire and spend renown the simple way: farming, then haste, then the strategist
  const N = G.retire(S, 'oda');
  m = N.meta;
  // spend renown: the strategist first, then always the cheapest code
  G.buyCode(m, 'strategist');
  for (;;) { const c = CODES.filter(c => (m.codes[c.id] || 0) < c.max && !['steward', 'envoy', 'eye'].includes(c.id)).sort((a, b) => G.codeCost(m, a) - G.codeCost(m, b))[0]; if (!c || G.buyCode(m, c.id)) break; }
  console.log('renown left', m.renown, 'collection', m.collection.length);
}
