// Casual players: fewer check-ins, short visits, some careless buying. Run: node tools/casual.js
// shortcut: borrows the bot's options() and act() from test.js by slicing its source; move them to a module if test.js changes shape
const path = require('path'), ROOT = path.join(__dirname, '..');
Object.assign(globalThis, require(path.join(ROOT, 'data/map.js')), require(path.join(ROOT, 'data/game-data.js')));
const G = require(path.join(ROOT, 'game.js'));
const src = require('fs').readFileSync(path.join(ROOT, 'test.js'), 'utf8');
eval(src.slice(src.indexOf('function options'), src.indexOf('function play')).replace('function act(S) {', 'function act(S, sloppy) {')
  .replace('const best = options(S).sort((a, b) => b.gain / b.cost - a.gain / a.cost)[0];', 'const best = sloppy ? options(S).filter(o => o.cost <= S.money).sort((a, b) => a.cost - b.cost)[0] : options(S).sort((a, b) => b.gain / b.cost - a.gain / a.cost)[0];') + ';globalThis.act = act; globalThis.options = options;');
function play({ times, minutes, sloppy, again }, maxDays = 60) {
  let S = G.newRun(G.newMeta(), 'oda', 7), h = 0; const firsts = {};
  const mark = () => { const a = G.ageOf(S.year); if (firsts[a] === undefined) firsts[a] = h; };
  const visit = m => {
    for (let s = 0; s < m * 60; s++) { for (const w of WORKS) G.run(S, w.id); G.tick(S, 1); if (s % 10 === 0) act(S, sloppy); mark(); h += 1 / 3600; if (S.done) return; }
    if (G.renownGain(S) >= again(S.meta.renown)) S = G.prestige(S);
  };
  const gone = hours => { G.away(S, hours * 3600); act(S, sloppy); mark(); h += hours; };
  visit(20); // a first sitting
  for (let d = 0; d < maxDays && !S.done; d++) for (const at of times) { const dt = d * 24 + at - h; if (dt > 0) gone(dt); visit(minutes); if (S.done) break; }
  return WORKS.map(w => w.glyph + (S.lv[w.id] || 0)).join(' ') + ' | ' + `${S.done ? (h / 24).toFixed(1) + ' days' : 'not done in ' + maxDays + ' days (' + S.year + ')'}, ${S.meta.runs} beginnings; ages on day ` + Object.entries(firsts).map(([a, t]) => `${AGES[a].id} ${(t / 24).toFixed(1)}`).join(', ');
}
const sensible = r => Math.max(30, r), late = r => Math.max(100, r * 2);
console.log('3 a day, 3 min, sensible :', play({ times: [8, 13, 21], minutes: 3, again: sensible }));
console.log('2 a day, 3 min, sensible :', play({ times: [8, 21], minutes: 3, again: sensible }));
console.log('3 a day, 3 min, sloppy   :', play({ times: [8, 13, 21], minutes: 3, sloppy: true, again: late }));
console.log('2 a day, 5 min, sloppy   :', play({ times: [8, 21], minutes: 5, sloppy: true, again: late }));
