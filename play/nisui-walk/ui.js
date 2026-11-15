/* 画面の操作と表示だけ。 */
(function () {
  'use strict';
  var C = window.TRI_DAY_ONE, E = window.TriDayOne, M = window.NisuiMove, H = window.NisuiHome, LS = window.localStorage;
  var $ = function (id) { return document.getElementById(id); };
  var world = window.NisuiWorld.create($('view'));
  var pos = { x: -6, z: 8.6 }, steps = [], old = [], home = false, target = null, face, keys = {}, nearId = null, last = performance.now(), s = E.get();
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function place(id) { return C.places.filter(function (p) { return p.id === id; })[0]; }
  function hud() {
    $('intro').hidden = !!s; $('hud').hidden = !s; if (!s) return;
    $('who').textContent = s.name + '・' + s.traitName;
    $('day').textContent = '二水 · ' + s.day + '日目';
    $('time').textContent = s.finished ? '今日は、ここまで' : 'あと ' + s.time + ' 回';
    $('home').hidden = !home || !!s.currentPlace || !$('room').hidden;
    var j = s.journal[0]; $('log').innerHTML = '<b>' + esc(j.title) + '</b> ' + esc(j.text);
    var can = nearId && !s.finished && s.visited.indexOf(nearId) < 0;
    $('talk').hidden = !can || !!s.currentPlace;
    if (can) $('talk').textContent = C.encounters[nearId].name + 'と話す';
    $('done').hidden = !(nearId && s.visited.indexOf(nearId) >= 0 && !s.currentPlace);
  }
  function dialog() {
    var d = $('dialog'); if (!s || !s.currentPlace) { d.hidden = true; return; }
    var id = s.currentPlace, e = C.encounters[id], p = place(id), mem = E.remember(s, id);
    d.innerHTML = '<p class="eyebrow">' + esc(p.district) + ' · ' + esc(p.name) + '</p><h2>' + esc(e.name) + '</h2>' + (mem ? '<p class="memory">' + esc(mem) + '</p>' : '<p>' + esc(p.intro) + '</p>') +
      '<div class="choices">' + e.options.map(function (o) { return '<button type="button" data-choice="' + o.id + '">' + esc(o.label) + '</button>'; }).join('') + '</div>';
    d.hidden = false;
    d.querySelectorAll('[data-choice]').forEach(function (b) { b.addEventListener('click', function () { s = E.choose(s, b.dataset.choice); d.hidden = true; hud(); }); });
  }
  $('start').addEventListener('click', function () { s = E.start(); hud(); });
  $('talk').addEventListener('click', function () { s = E.visit(s, nearId); dialog(); hud(); });
  function room() {
    var r = $('room'), list = H.today(s);
    r.innerHTML = '<p class="eyebrow">家 · ' + s.day + '日目の夜</p><h2>今日をふり返る</h2><ol class="today">' + list.map(function (j) { return '<li><b>' + esc(j.title) + '</b> ' + esc(j.text) + '</li>'; }).join('') + '</ol><p class="small">今日の足あと：' + steps.length + '歩ぶん</p>' +
      (s.finished ? '<button class="primary" id="sleep" type="button">眠る（次の日へ）</button>' : '<p class="small">まだ ' + s.time + ' 回、外で行動できる。</p><button class="primary" id="out" type="button">外へ出る</button>');
    r.hidden = false; hud();
    var sl = $('sleep'); if (sl) sl.addEventListener('click', function () { H.saveSteps(LS, s.day, steps); s = E.nextDay(s); old = H.loadSteps(LS, s.day); steps = []; r.hidden = true; hud(); });
    var o = $('out'); if (o) o.addEventListener('click', function () { r.hidden = true; hud(); });
  }
  $('home').addEventListener('click', room);
  $('view').addEventListener('pointerdown', function (ev) { if (!s || s.currentPlace || !$('room').hidden) return; var t = world.pick(ev.clientX, ev.clientY); if (t) target = t; });
  addEventListener('keydown', function (ev) { keys[ev.key.toLowerCase()] = true; });
  addEventListener('keyup', function (ev) { keys[ev.key.toLowerCase()] = false; });
  addEventListener('resize', world.resize);
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var kx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0), kz = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
    if (s && !s.currentPlace && (kx || kz)) { target = { x: pos.x + kx, z: pos.z + kz }; world.hideRing(); }
    if (target && !(s && s.currentPlace)) { var n = M.step(pos, target, dt); if (n.face !== undefined) face = n.face; pos = { x: n.x, z: n.z }; var l = steps[steps.length - 1]; if (!l || Math.hypot(l.x - pos.x, l.z - pos.z) > 0.6) { steps.push(pos); if (steps.length > 60) steps.shift(); } if (n.arrived) { target = null; world.hideRing(); } }
    var nn = M.near(pos), hh = H.atHome(pos); if (nn !== nearId || hh !== home) { nearId = nn; home = hh; hud(); }
    world.draw(pos, face, nearId, steps, old, home);
    requestAnimationFrame(loop);
  }
  /* 確認用：画面確認スクリプトが場所へ瞬間移動するときだけ使う。 */
  window.NisuiWalk = { go: function (id) { var p = id === 'home' ? { x: H.HOME.x, z: H.HOME.z } : M.SPOTS[id]; pos = { x: p.x, z: p.z + 0.5 }; target = null; } };
  if (s) old = H.loadSteps(LS, s.day);
  hud(); dialog(); requestAnimationFrame(loop);
})();
