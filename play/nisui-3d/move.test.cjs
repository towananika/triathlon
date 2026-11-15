/* 歩く計算のテスト。 */
const assert = require('node:assert/strict');
require('./move.js');
const M = globalThis.NisuiMove;
let p = { x: 0, z: 0 };
p = M.step(p, { x: 4, z: 0 }, 0.5);
assert.equal(p.x, 2); assert.equal(p.arrived, false);
p = M.step(p, { x: 4, z: 0 }, 1);
assert.equal(p.x, 4); assert.equal(p.arrived, true);
assert.equal(M.step({ x: 0, z: 0 }, { x: 99, z: 0 }, 100).x, M.LIMIT, '町の外へ出ない');
assert.equal(M.near(M.SPOTS.river), 'river');
assert.equal(M.near({ x: M.SPOTS.market.x + 1.5, z: M.SPOTS.market.z }), 'market');
assert.equal(M.near({ x: 0, z: 0 }), null, '遠いと話せない');
console.log('nisui-3d move: ok');
