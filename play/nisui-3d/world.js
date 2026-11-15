/* 3Dの町を描くだけ。歩く計算は move.js、記録は day-one/engine.js。 */
(function () {
  'use strict';
  var T = window.THREE, M = window.NisuiMove, C = window.TRI_DAY_ONE;
  function box(w, h, d, color, x, y, z) { var m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshLambertMaterial({ color: color })); m.position.set(x, y, z); return m; }
  function person(color) {
    var g = new T.Group();
    var body = new T.Mesh(new T.CylinderGeometry(0.3, 0.38, 0.9, 16), new T.MeshLambertMaterial({ color: color })); body.position.y = 0.45;
    var head = new T.Mesh(new T.SphereGeometry(0.28, 16, 12), new T.MeshLambertMaterial({ color: 0xf0d2b4 })); head.position.y = 1.15;
    g.add(body, head); return g;
  }
  function create(canvas) {
    var r = new T.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    var scene = new T.Scene(); scene.background = new T.Color(0xdbeeed); scene.fog = new T.Fog(0xdbeeed, 30, 60);
    var cam = new T.PerspectiveCamera(45, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xffffff, 0x6f8a6a, 0.75));
    var sun = new T.DirectionalLight(0xfff1d6, 0.6); sun.position.set(6, 12, 4); scene.add(sun);
    var ground = box(20, 0.2, 20, 0x9dbb84, 0, -0.1, 0); scene.add(ground);
    scene.add(box(20, 0.05, 2.4, 0x6aa6c8, 0, 0.01, -6.5));            // 川
    scene.add(box(2.2, 0.06, 5, 0xd9cbb0, 0, 0.02, 6));                // 中路
    scene.add(box(14, 0.06, 2.2, 0xd9cbb0, 0, 0.02, -2)); scene.add(box(2.2, 0.06, 6, 0xd9cbb0, -3, 0.02, 1.5)); scene.add(box(2.2, 0.06, 6, 0xd9cbb0, 3, 0.02, 1.5));
    var looks = { river: [0x2f6fb8, 0x3f6b8a], market: [0xd9707a, 0xb5543c], library: [0x4fae84, 0x5d7f4e] };
    var people = {};
    Object.keys(M.SPOTS).forEach(function (id) {
      var s = M.SPOTS[id], c = looks[id];
      scene.add(box(3, 2.2, 2.4, c[0], s.x, 1.1, s.z - 2.4));
      scene.add(box(3.4, 0.3, 2.8, c[1], s.x, 2.35, s.z - 2.4));
      var p = person(c[1]); p.position.set(s.x, 0, s.z - 0.6); scene.add(p); people[id] = p;
    });
    [[-8, 6], [8, 6], [-8, 1], [8, 2], [-3, 8], [4, 8]].forEach(function (t) {
      scene.add(box(0.3, 1, 0.3, 0x8a6a4a, t[0], 0.5, t[1]));
      var top = new T.Mesh(new T.SphereGeometry(0.9, 12, 10), new T.MeshLambertMaterial({ color: 0x6f9a5a })); top.position.set(t[0], 1.6, t[1]); scene.add(top);
    });
    var me = person(0xf4c765); scene.add(me);
    var ring = new T.Mesh(new T.RingGeometry(0.35, 0.5, 24), new T.MeshBasicMaterial({ color: 0x007f87 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false; scene.add(ring);
    var ray = new T.Raycaster(), v2 = new T.Vector2();
    function resize() { var w = canvas.clientWidth, h = canvas.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    function draw(pos, face, near) {
      me.position.set(pos.x, 0, pos.z); if (face !== undefined) me.rotation.y = face;
      var k = cam.aspect < 1 ? 1.9 : 1.2; cam.position.set(pos.x, 9 * k, pos.z + 7.5 * k); cam.lookAt(pos.x, 0, pos.z);
      Object.keys(people).forEach(function (id) { people[id].position.y = id === near ? 0.12 : 0; });
      r.render(scene, cam);
    }
    function pick(clientX, clientY) {
      var b = canvas.getBoundingClientRect(); v2.set((clientX - b.left) / b.width * 2 - 1, -((clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(v2, cam); var hit = ray.intersectObject(ground)[0]; if (!hit) return null;
      ring.position.x = hit.point.x; ring.position.z = hit.point.z; ring.visible = true; return { x: hit.point.x, z: hit.point.z };
    }
    function hideRing() { ring.visible = false; }
    resize();
    return { resize: resize, draw: draw, pick: pick, hideRing: hideRing };
  }
  window.NisuiWorld = { create: create, names: function (id) { return C.encounters[id].name; } };
})();
