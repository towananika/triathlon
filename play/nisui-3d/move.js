/* 歩く計算だけ（画面に依存しない）。 */
(function (root) {
  'use strict';
  var SPEED = 4, TALK = 2, LIMIT = 9;
  var SPOTS = { river: { x: -5, z: -3 }, market: { x: 0, z: 4 }, library: { x: 5, z: -3 } };
  function clamp(v) { return Math.max(-LIMIT, Math.min(LIMIT, v)); }
  function step(pos, target, dt) {
    var dx = target.x - pos.x, dz = target.z - pos.z, d = Math.hypot(dx, dz), m = SPEED * dt;
    if (d <= m || d === 0) return { x: clamp(target.x), z: clamp(target.z), arrived: true };
    return { x: clamp(pos.x + dx / d * m), z: clamp(pos.z + dz / d * m), arrived: false, face: Math.atan2(dx, dz) };
  }
  function near(pos) {
    var best = null, bd = TALK;
    Object.keys(SPOTS).forEach(function (id) { var s = SPOTS[id], d = Math.hypot(s.x - pos.x, s.z - pos.z); if (d <= bd) { bd = d; best = id; } });
    return best;
  }
  root.NisuiMove = { SPOTS: SPOTS, TALK: TALK, LIMIT: LIMIT, step: step, near: near };
})(typeof window !== 'undefined' ? window : globalThis);
