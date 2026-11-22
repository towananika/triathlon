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

// 5つの地域があり、どれも並べ方しだいで勝てる（勝てる配置の例）
assert.equal(D.regions.length, 5);
const wins = [
  good,
  [{ id: 'akari', x: 4, y: 4 }, { id: 'riku', x: 2, y: 5 }, { id: 'shion', x: 0, y: 7 }, { id: 'seira', x: 7, y: 7 }, { id: 'tsubasa', x: 1, y: 6 }],
  [{ id: 'akari', x: 2, y: 6 }, { id: 'riku', x: 4, y: 5 }, { id: 'seira', x: 3, y: 7 }, { id: 'shion', x: 7, y: 5 }, { id: 'rui', x: 1, y: 5 }],
  [{ id: 'akari', x: 3, y: 5 }, { id: 'seira', x: 5, y: 5 }, { id: 'tsubasa', x: 3, y: 4 }, { id: 'riku', x: 7, y: 6 }, { id: 'rui', x: 6, y: 7 }],
  [{ id: 'kai', x: 7, y: 6 }, { id: 'tsubasa', x: 0, y: 5 }, { id: 'rui', x: 6, y: 6 }, { id: 'seira', x: 2, y: 6 }, { id: 'akari', x: 4, y: 6 }]
];
wins.forEach((p, i) => assert.equal(E.simulate(E.trialBattle(D, p, i)).winner, 0, D.regions[i].name));

// 持っている数まで、同じ駒を複数出せる
const twoShion = [{ id: 'shion', x: 0, y: 4 }, { id: 'shion', x: 1, y: 4 }, { id: 'shion', x: 2, y: 4 }];
assert.equal(E.trialBattle(D, twoShion, 0, { shion: 2 }).filter((u) => u.side === 0).length, 2);
assert.equal(E.trialBattle(D, twoShion, 0, { shion: 3 }).filter((u) => u.side === 0).length, 3);
const ids = E.trialBattle(D, twoShion, 0, { shion: 3 }).map((u) => u.id);
assert.equal(new Set(ids).size, ids.length, '同じ駒でも別の個体として戦う');
// 同じマスには1体だけ
assert.equal(E.trialBattle(D, [{ id: 'akari', x: 0, y: 4 }, { id: 'kai', x: 0, y: 4 }]).filter((u) => u.side === 0).length, 1);
// 最初は9人1人ずつ。地域ごとに初勝利でもらえる駒が決まっている
assert.equal(Object.values(D.start).reduce((a, b) => a + b), 9);
D.regions.forEach((r) => assert.ok(D.pieces.some((p) => p.id === r.reward), r.name));

// 駒がいなければ守る側の勝ち
assert.equal(E.simulate(E.trialBattle(D, [])).winner, 1);

console.log('autochess engine: ok');
