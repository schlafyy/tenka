// node test.js        checks the data and the rules, then lets a bot play a whole run to show the pacing
// node test.js quick  skips the bot
const assert = require('assert');
Object.assign(globalThis, require('./data/map.js'), require('./data/game-data.js'));
const G = require('./game.js');

// ---- data ----
const PIDS = Object.keys(GEO.provinces);
assert.strictEqual(PIDS.length, 68);
for (const p of PIDS) {
  assert(KOKU[p] > 0, 'koku for ' + p);
  for (const q of ADJ[p]) assert(ADJ[q].includes(p), `border ${p}-${q} one-way`);
}
for (const p of Object.keys(SPECIAL)) assert(GEO.provinces[p], 'unknown province ' + p);
for (const h of HOUSES) { assert(CLANS[h.clan] && CRESTS[h.clan], 'clan and crest ' + h.clan); assert(GEO.provinces[h.home]); assert(NAMES.lord[h.clan], 'names ' + h.clan); }
for (const w of WORKS) assert(w.year >= AGES[w.age].from && (!AGES[w.age + 1] || w.year < AGES[w.age + 1].from), 'trade in its age: ' + w.id);
for (const e of [...EVENTS, ...LATER_EVENTS]) assert(e.year && e.en && e.short && Array.isArray(e.sides), 'chapter ' + e.id);
assert.strictEqual(new Set([...EVENTS, ...LATER_EVENTS].map(e => e.id)).size, EVENTS.length + LATER_EVENTS.length, 'chapter ids unique');
assert.strictEqual(new Set(TREASURES.map(t => t.id)).size, TREASURES.length);
for (const c of Object.values(G.holdersAt(1600)).flat()) if (c) assert(CLANS[c], 'holder ' + c);

// ---- rules ----
assert(Math.abs(G.yearsPerHour(1500) * 24 * 3 - 136) < 1e-9, 'the Sengoku age takes three days at an even pace');
assert(G.target(1467) < G.target(1600) && G.target(1600) < G.target(2026));
assert.strictEqual(G.holdersAt(1467).owari, BASE_1467.owari);
assert.strictEqual(G.holdersAt(1900).owari, 'empire');
assert.strictEqual(G.holdersAt(1990).owari, 'nation');
assert.strictEqual(`${G.eraOf(1521).ja}${G.kanjiYear(G.eraOf(1521).n)}`, '大永元');
assert.strictEqual(G.eraOf(2026).en, 'Reiwa');
assert(!G.chaptersFor('takeda').some(e => e.sides.includes('takeda') && e.winner && e.winner !== 'takeda'), 'the Takeda never see their own fall');

let S = G.newRun(G.newMeta(), 'oda', 42);
assert.deepStrictEqual(S.reach, ['owari']);
assert(G.best(S) && G.best(S).id === 'paddies', 'the first thing to buy is a paddy');
assert(G.buy(S, 'paddies') && S.works.paddies === 2, 'a house starts with one paddy and buys another');
assert(!G.buy(S, 'mine'), 'the silver mine opens in 1526');
G.tick(S, 1);
assert(S.money > 0 && S.earned > 0);
assert.strictEqual(G.reachPoints(S), 1);
const before = G.income(S);
assert(G.reach(S, 'mikawa'), 'reach a neighbour');
assert(!G.reach(S, 'mutsu'), 'not a far province');
assert(G.income(S) > before, 'a province raises income');
assert.strictEqual(G.reachPoints(S), 0);
S.year = S.yearF = 1600; G.arrive(S);
assert(S.unread.length > 30, 'the chapters arrive with the years');
assert(S.heads.length >= 3, 'heads of the house come and go');
const inc = G.income(S);
assert(G.read(S, S.unread[0]) && G.income(S) > inc, 'a chapter read raises income');
const json = JSON.parse(JSON.stringify(S));
assert.strictEqual(G.income(json), G.income(S), 'a save round-trips');
S.year = S.yearF = 2026; G.arrive(S);
assert(S.done);
const T = G.nextRun(S, 'shimazu');
assert.strictEqual(T.meta.runs, 1);
assert.deepStrictEqual(T.reach, ['satsuma']);
assert.strictEqual(G.newRun(G.newMeta(), 'hosokawa', 1).meta.treasures.length, 1, 'the Hosokawa start with a treasure');
console.log('rules ok');

if (process.argv[2] === 'quick') process.exit(0);
const calibrate = process.argv[2] === 'calibrate';
// calibrate: play at an even pace and print the bot's income by year, to fit the TARGET curve in game.js
if (calibrate) G.paceOverride = 1;

// ---- pacing: a player who checks in a few times a day ----
// day 1 starts with half an hour of play; then short visits at 4, 8, 12 and 15 hours into each day, and the night away
function act(S) {
  G.buyAll(S);
  while (S.unread.length) G.read(S, S.unread[0]);
  while (G.reachPoints(S) > 0 && G.reachable(S).length) G.reach(S, G.bestReach(S));
}
function play(clan, meta, days = 30) {
  const S = G.newRun(meta, clan, 7);
  const ages = {}, daily = [], curve = [];
  let h = 0;
  const mark = () => { const y = Math.floor(S.year / 10) * 10; if (!curve.length || curve[curve.length - 1][0] < y) curve.push([y, +Math.log10(G.income(S)).toFixed(2)]); };
  const visit = minutes => { for (let s = 0; s < minutes * 60; s += 5) { G.tick(S, 5); act(S); mark(); } h += minutes / 60; };
  const gone = hours => { for (let left = hours; left > 0; left -= .25) { G.away(S, Math.min(.25, left) * 3600); mark(); } act(S); h += hours; };
  visit(30);
  ages[0] = 0;
  for (let d = 0; d < days && !S.done; d++) {
    for (const at of [4, 8, 12, 15, 24]) {
      gone(d * 24 + at - h);
      visit(3);
      const a = G.ageOf(S.year);
      if (ages[a] === undefined) ages[a] = h;
      if (S.done) break;
    }
    daily.push(S.year);
  }
  return { S, ages, daily, h, curve };
}
if (calibrate) {
  const { curve } = play('oda', G.newMeta(), 40);
  console.log('const TARGET = ' + JSON.stringify(curve) + ';');
  process.exit(0);
}
for (const run of [0, 1]) {
  const meta = G.newMeta(); meta.runs = run;
  const { S, ages, daily, h } = play('oda', meta);
  console.log(`run ${run + 1}: ${S.done ? 'present day after ' + (h / 24).toFixed(1) + ' days' : 'not done'}; ages begin on day ` +
    Object.entries(ages).map(([a, t]) => `${AGES[a].id} ${(t / 24).toFixed(1)}`).join(', '));
  console.log('  year at the end of each day:', daily.join(' '));
  console.log(`  provinces ${S.reach.length}, chapters read ${S.readIds.length}, heads ${S.heads.length + 1}, treasures ${S.meta.treasures.length}, levels`,
    WORKS.map(w => w.glyph + (S.works[w.id] || 0)).join(' '));
}
