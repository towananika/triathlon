/* 上から見た二水を2Dで描くだけ。歩く計算は move.js、記録は day-one/engine.js。 */
(function () {
  'use strict';
  var M = window.NisuiMove;
  var LOOK = { river: ['#2f6fb8', '≈'], market: ['#d9707a', '●'], library: ['#4fae84', '▤'] };
  var TREES = [[-8, 6], [8, 6], [-8, 1], [8, 2], [-3, 8.5], [4, 8.5], [-8.5, -8.5], [8.5, -8.5]];
  function create(canvas) {
    var g = canvas.getContext('2d'), W, H, S, OX, OY, ring = null, dpr = 1;
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      S = Math.min(W, H * 0.62) / 21; OX = W / 2; OY = H * 0.36;
    }
    function sx(x) { return OX + x * S; } function sy(z) { return OY + z * S; }
    function rect(x, z, w, d, c) { g.fillStyle = c; g.fillRect(sx(x - w / 2), sy(z - d / 2), w * S, d * S); }
    function dot(x, z, r, c, line) { g.beginPath(); g.arc(sx(x), sy(z), r * S, 0, Math.PI * 2); g.fillStyle = c; g.fill(); if (line) { g.lineWidth = 2; g.strokeStyle = line; g.stroke(); } }
    function draw(pos, face, near, steps) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = '#dbeeed'; g.fillRect(0, 0, W, H);
      rect(0, 0, 20, 20, '#a9c48f');
      rect(0, -6.5, 20, 2.4, '#7fb3d1');
      rect(0, -2, 14, 2.2, '#e6dcc6'); rect(-3, 1.5, 2.2, 6, '#e6dcc6'); rect(3, 1.5, 2.2, 6, '#e6dcc6'); rect(0, 6, 2.2, 5, '#e6dcc6');
      TREES.forEach(function (t) { dot(t[0], t[1], 0.8, '#6f9a5a'); });
      (steps || []).forEach(function (p, i, a) { g.globalAlpha = 0.15 + 0.35 * i / a.length; dot(p.x, p.z, 0.12, '#5b4a36'); }); g.globalAlpha = 1;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      Object.keys(M.SPOTS).forEach(function (id) {
        var s = M.SPOTS[id], c = LOOK[id];
        rect(s.x, s.z - 2.4, 3, 2.4, c[0]);
        g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(S * 1.1) + 'px system-ui'; g.fillText(c[1], sx(s.x), sy(s.z - 2.4));
        if (id === near) dot(s.x, s.z - 0.6, 0.75, 'rgba(244,199,101,.45)');
        dot(s.x, s.z - 0.6, 0.38, c[0], '#fff');
      });
      if (ring) { g.beginPath(); g.arc(sx(ring.x), sy(ring.z), 0.45 * S, 0, Math.PI * 2); g.lineWidth = 2; g.strokeStyle = '#007f87'; g.stroke(); }
      dot(pos.x, pos.z, 0.45, '#f4c765', '#163744');
      if (face !== undefined) { g.beginPath(); g.arc(sx(pos.x + Math.sin(face) * 0.3), sy(pos.z + Math.cos(face) * 0.3), 0.1 * S, 0, Math.PI * 2); g.fillStyle = '#163744'; g.fill(); }
    }
    function pick(cx, cy) {
      var b = canvas.getBoundingClientRect(), x = (cx - b.left - OX) / S, z = (cy - b.top - OY) / S;
      if (Math.abs(x) > 10 || Math.abs(z) > 10) return null; ring = { x: x, z: z }; return ring;
    }
    resize();
    return { resize: resize, draw: draw, pick: pick, hideRing: function () { ring = null; } };
  }
  window.NisuiWorld = { create: create };
})();
