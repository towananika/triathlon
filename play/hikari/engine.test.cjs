/* 光さがしの約束：記録・まぜる・メーター・今週のためし。 */
const assert = require('node:assert/strict');
require('./engine.js');
const H = globalThis.TriHikari;

let s = H.empty();
s = H.record(s, '2026-11-16', 'sort', 3, true, 100);
s = H.record(s, '2026-11-16', 'move', 1, false, 110);
assert.equal(Object.keys(s.days['2026-11-16'].a).length, 2);
s = H.record(s, '2026-11-16', 'move', 0, false, 120);
assert.deepEqual(Object.keys(s.days['2026-11-16'].a), ['sort']);
assert.equal(H.record(s, '2026-11-16', 'nope', 3).days['2026-11-16'].t, 120, '知らない光は無視');

// まぜる：日ごとに新しいほう、両方の日が残る
const other = H.record(H.empty(), '2026-11-15', 'talk', 2, false, 50);
const older = H.record(H.empty(), '2026-11-16', 'idea', 3, false, 10);
const m = H.merge(H.merge(s, other), older);
assert.ok(m.days['2026-11-15'] && m.days['2026-11-16'].a.sort && !m.days['2026-11-16'].a.idea);
assert.deepEqual(H.merge(m, m), m);
assert.deepEqual(H.clean({ days: { 'x': { t: 1, a: {} }, '2026-01-01': { t: 1, a: { sort: { f: 9 } } } } }).days, { '2026-01-01': { t: 1, a: {} } });

// メーター：たのしい・軽い・うまくいった・続く
const mt = H.meters(s, '2026-11-16');
assert.equal(mt.sort.n, 1); assert.equal(mt.sort.fun, 1); assert.equal(mt.sort.good, 1); assert.equal(mt.sort.keep, 1 / 8);
assert.equal(mt.move.score, 0);
assert.equal(H.meters(s, '2027-01-30').sort.n, 0, '4週より前は数えない');

// 今週のためし：週の中で同じ、伸ばす＝いちばんの光、見つける＝まだの光
assert.equal(H.weekKey('2026-11-16'), '2026-11-16');
assert.equal(H.weekKey('2026-11-22'), '2026-11-16');
const t1 = H.weekTries(s, '2026-11-17'), t2 = H.weekTries(s, '2026-11-21');
assert.deepEqual(t1, t2);
assert.equal(t1.list[0].light, 'sort');
assert.notEqual(t1.list[1].light, 'sort');
assert.equal(H.meters(s, '2026-11-16')[t1.list[1].light].n, 0);
let s2 = H.toggleTry(s, '2026-11-18', 'find', 200);
assert.equal(H.weekTries(s2, '2026-11-18').list[1].done, true);
s2 = H.toggleTry(s2, '2026-11-18', 'find', 300);
assert.equal(H.weekTries(s2, '2026-11-18').list[1].done, false);
assert.ok(H.weekTries(H.empty(), '2026-11-16').list.every((x) => x.text));

assert.match(H.akari('sort', 3, true), /うまくいった/);
console.log('hikari engine ok');
