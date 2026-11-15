/* 家のテスト：今日の記録だけ集める／家の近さ／前の日の足あとだけ読む。 */
const assert = require('node:assert/strict');
require('./home.js');
const H = globalThis.NisuiHome;
const s = { journal: [{ title: '中路の朝市で', text: 'b' }, { title: '2日目の朝', text: 'a' }, { title: '学園図書館で', text: 'old' }, { title: '二水に着いた', text: '' }] };
assert.deepEqual(H.today(s).map((j) => j.title), ['2日目の朝', '中路の朝市で']);
assert.equal(H.today({ journal: [{ title: '二水に着いた', text: '' }] }).length, 1);
assert.equal(H.atHome(H.HOME), true);
assert.equal(H.atHome({ x: 0, z: 0 }), false);
const mem = {}; const store = { getItem: (k) => mem[k] || null, setItem: (k, v) => { mem[k] = v; } };
H.saveSteps(store, 1, [{ x: 1.234, z: 2 }]);
assert.deepEqual(H.loadSteps(store, 2), [{ x: 1.23, z: 2 }], '次の日に前の日の足あと');
assert.deepEqual(H.loadSteps(store, 3), [], '2日前は出さない');
assert.deepEqual(H.loadSteps({ getItem: () => '{bad' }, 2), [], '壊れた保存でも動く');
console.log('nisui-walk home: ok');
