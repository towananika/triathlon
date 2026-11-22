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

// 盤に置ける星の合計は5まで、自陣（y=4〜7）の外には置けない
const six = D.pieces.slice(0, 6).map((p, i) => ({ id: p.id, x: i, y: 7 }));
assert.equal(E.trialBattle(D, six).filter((u) => u.side === 0).length, 5);
const starred = [{ id: 'shion', star: 2, x: 0, y: 4 }, { id: 'akari', star: 2, x: 1, y: 4 }, { id: 'rui', x: 2, y: 4 }, { id: 'kai', x: 3, y: 4 }];
assert.equal(E.trialBattle(D, starred).filter((u) => u.side === 0).length, 3, '★2+★2+★1で5つ。4体目は入らない');

// 3つで★2、9つで★3に自動でまとまる
assert.deepEqual(E.starsOf(1), { 1: 1, 2: 0, 3: 0 });
assert.deepEqual(E.starsOf(3), { 1: 0, 2: 1, 3: 0 });
assert.deepEqual(E.starsOf(5), { 1: 2, 2: 1, 3: 0 });
assert.deepEqual(E.starsOf(9), { 1: 0, 2: 0, 3: 1 });
assert.deepEqual(E.starsOf(12), { 1: 0, 2: 0, 3: 1 }, '★3が最大。それ以上は増えない');
const s1 = E.statsOf(akari, { R: 10 }, D.base, 1), s2 = E.statsOf(akari, { R: 10 }, D.base, 2);
assert.ok(s2.hp > s1.hp && s2.atk > s1.atk, '★2は強い');
// 持っている星の数までしか出せない
assert.equal(E.trialBattle(D, [{ id: 'shion', star: 2, x: 0, y: 4 }], 0, { shion: 2 }).filter((u) => u.side === 0).length, 0);
assert.equal(E.trialBattle(D, [{ id: 'shion', star: 2, x: 0, y: 4 }], 0, { shion: 3 }).filter((u) => u.side === 0).length, 1);
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

// 持っている数まで、同じ駒を複数出せる（★1が2つまで）
const twoShion = [{ id: 'shion', x: 0, y: 4 }, { id: 'shion', x: 1, y: 4 }, { id: 'shion', x: 2, y: 4 }];
assert.equal(E.trialBattle(D, twoShion, 0, { shion: 2 }).filter((u) => u.side === 0).length, 2);
assert.equal(E.trialBattle(D, twoShion, 0, { shion: 3 }).filter((u) => u.side === 0).length, 0, '3つ持つと★2にまとまるので★1は残らない');
const ids = E.trialBattle(D, twoShion, 0, { shion: 5 }).map((u) => u.id);
assert.equal(new Set(ids).size, ids.length, '同じ駒でも別の個体として戦う');
// 同じマスには1体だけ
assert.equal(E.trialBattle(D, [{ id: 'akari', x: 0, y: 4 }, { id: 'kai', x: 0, y: 4 }]).filter((u) => u.side === 0).length, 1);
// 最初は9人1人ずつ。地域ごとに初勝利でもらえる駒が決まっている
assert.equal(Object.values(D.start).reduce((a, b) => a + b), 9);
D.regions.forEach((r) => assert.ok(D.pieces.some((p) => p.id === r.reward), r.name));

// 色のボーナス：同じ色が3体そろうと、その色の駒だけ強くなる
const rrr = [{ id: 'akari', x: 0, y: 4 }, { id: 'shion', x: 1, y: 4 }, { id: 'tsubasa', x: 2, y: 4 }];
const rr = rrr.slice(0, 2);
const hp3 = E.trialBattle(D, rrr).find((u) => u.id.endsWith('akari')).hp;
const hp2 = E.trialBattle(D, rr).find((u) => u.id.endsWith('akari')).hp;
assert.ok(hp3 > hp2, 'R3体でHPが上がる');
assert.deepEqual(E.bonusColors(D, rrr), { R: 3, G: 0, B: 0 });

// 今日の地域：同じ日付なら全員同じ配置。勝てる見込みが10〜45%の配置を選ぶ
const d1 = E.dailyRegion(D, '2026-11-22'), d2 = E.dailyRegion(D, '2026-11-22'), d3 = E.dailyRegion(D, '2026-11-23');
assert.equal(JSON.stringify(d1), JSON.stringify(d2));
assert.notEqual(JSON.stringify(d1.enemies), JSON.stringify(d3.enemies));
assert.ok(d1.winRate >= 0.1 && d1.winRate <= 0.45);
assert.ok(d1.enemies.every((e) => e.y >= 0 && e.y <= 3 && D.wildTypes[e.type]));
assert.ok(E.trialBattle(D, good, d1).length > 5, '地域そのものを渡しても戦える');

// 対戦：相手の配置は180度回して奥に置く。どちらの端末で計算しても同じ結果
const pa = good, pb = bad;
const v1 = E.simulate(E.pvpBattle(D, pa, pb)), v2 = E.simulate(E.pvpBattle(D, pa, pb));
assert.equal(JSON.stringify(v1.frames), JSON.stringify(v2.frames));
assert.ok(E.pvpBattle(D, pa, pb).filter((u) => u.side === 1).every((u) => u.y <= 3));
assert.equal(E.pvpBattle(D, pa, pb).find((u) => u.id === 'b0-rui').x, 7);
// 同じ配置どうしなら引き分け（先手・後手の差がない）
assert.equal(E.simulate(E.pvpBattle(D, good, good), { timeout: -1 }).winner, -1);
assert.equal(E.simulate(E.pvpBattle(D, bad, bad), { timeout: -1 }).winner, -1);
// 入れ替えても勝者が入れ替わるだけ
assert.equal(E.simulate(E.pvpBattle(D, good, bad), { timeout: -1 }).winner, 0);
assert.equal(E.simulate(E.pvpBattle(D, bad, good), { timeout: -1 }).winner, 1);

// 挑戦状：配置をURL用の数字にして、元に戻せる
const code = E.encodePlacement(D, [{ id: 'shion', star: 2, x: 2, y: 4 }, { id: 'rui', x: 3, y: 7 }]);
assert.equal(code, '12247137');
assert.deepEqual(E.decodePlacement(D, code), [{ id: 'shion', star: 2, x: 2, y: 4 }, { id: 'rui', star: 1, x: 3, y: 7 }]);
assert.deepEqual(E.decodePlacement(D, '9999<script>'), []);

// 駒がいなければ守る側の勝ち
assert.equal(E.simulate(E.trialBattle(D, [])).winner, 1);

console.log('autochess engine: ok');
