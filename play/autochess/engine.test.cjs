/* オートチェス試作の約束を確かめる。画面に依存しない。 node play/autochess/engine.test.cjs */
const assert = require('node:assert/strict');
const D = require('./pieces.js');
const E = require('./engine.js');

// 9人そろっている（R・G・B各3人）
assert.equal(D.pieces.length, 9);
['R', 'G', 'B'].forEach((c) => assert.equal(D.pieces.filter((p) => p.color === c).length, 3));

// ダメージは割合で減り、最低1
assert.equal(E.damage(100, 0), 100);
assert.equal(E.damage(100, 100), 50);
assert.equal(E.damage(100, 300), 25);
assert.equal(E.damage(1, 999), 1);

// 1ポイントで上がる量はキャラごとに違う
const akari = D.pieces.find((p) => p.id === 'akari');
const s = E.statsOf(akari, { R: 10, G: 0, B: 0 }, D.base);
assert.equal(s.hp, D.base.hp + 60);
assert.equal(s.atk, D.base.atk + 30);
assert.equal(s.def, D.base.def);

// 運がない：同じ配置なら何度やっても同じ結果
const good = [{ id: 'shion', x: 2, y: 4 }, { id: 'tsubasa', x: 5, y: 4 }, { id: 'akari', x: 3, y: 4 }, { id: 'rui', x: 3, y: 7 }, { id: 'seira', x: 4, y: 6 }];
const r1 = E.simulate(E.trialBattle(D, good));
const r2 = E.simulate(E.trialBattle(D, good));
assert.equal(JSON.stringify(r1.frames), JSON.stringify(r2.frames));
assert.equal(r1.winner, 0, '前衛を前、魔法を後ろに置けば勝てる');

// 配置で結果が変わる
const bad = [{ id: 'rui', x: 0, y: 4 }, { id: 'shizuku', x: 7, y: 4 }, { id: 'riku', x: 3, y: 4 }, { id: 'kai', x: 4, y: 7 }, { id: 'minato', x: 5, y: 7 }];
assert.equal(E.simulate(E.trialBattle(D, bad)).winner, 1, '打たれ弱い駒を前に並べると負ける');

// 出せるのは5人まで、自陣（y=4〜7）の外には置けない
const six = D.pieces.slice(0, 6).map((p, i) => ({ id: p.id, x: i, y: 7 }));
assert.equal(E.trialBattle(D, six).filter((u) => u.side === 0).length, 5);
assert.equal(E.trialBattle(D, [{ id: 'akari', x: 0, y: 3 }]).filter((u) => u.side === 0).length, 0);

// 同じマスに2体は立たない
r1.frames.forEach((f) => {
  const cells = f.filter((u) => u.hp > 0).map((u) => u.x + ',' + u.y);
  assert.equal(new Set(cells).size, cells.length);
});

// 駒がいなければ守る側の勝ち
assert.equal(E.simulate(E.trialBattle(D, [])).winner, 1);

console.log('autochess engine: ok');
