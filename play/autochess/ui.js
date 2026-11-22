/* 画面だけを扱う。計算は engine.js、数字は pieces.js。保存はこの端末だけ。 */
(function () {
  'use strict';
  var D = window.TRI_CHESS_DATA, E = window.TriChess, KEY = 'triathlon-autochess-v1', MAX = 5;
  var app = document.getElementById('app');
  var st = { placement: load(), sel: null, mode: 'setup', result: null, frame: 0, timer: null };

  function load() { try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st.placement)); } catch (_) {} }
  function piece(id) { return D.pieces.filter(function (p) { return p.id === id; })[0]; }
  function at(x, y) { return st.placement.filter(function (p) { return p.x === x && p.y === y; })[0]; }
  function placed(id) { return st.placement.filter(function (p) { return p.id === id; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function tapCell(x, y) {
    if (st.mode !== 'setup' || y < 4) return;
    var here = at(x, y);
    if (st.sel) {
      if (here && here.id === st.sel) { st.placement = st.placement.filter(function (p) { return p.id !== st.sel; }); st.sel = null; }
      else {
        var mine = placed(st.sel);
        if (!mine && !here && st.placement.length >= MAX) { render(); return; }
        if (here) { if (mine) { here.x = mine.x; here.y = mine.y; } else st.placement = st.placement.filter(function (p) { return p !== here; }); }
        if (mine) { mine.x = x; mine.y = y; } else st.placement.push({ id: st.sel, x: x, y: y });
        st.sel = null;
      }
      save();
    } else if (here) st.sel = here.id;
    render();
  }
  function tapChip(id) { if (st.mode !== 'setup') return; st.sel = st.sel === id ? null : id; render(); }

  function fight() {
    if (!st.placement.length) return;
    st.result = E.simulate(E.trialBattle(D, st.placement));
    st.mode = 'battle'; st.sel = null; st.frame = 0; render();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { finish(); return; }
    st.timer = setInterval(function () {
      st.frame += 1;
      if (st.frame >= st.result.frames.length - 1) finish(); else render();
    }, 55);
  }
  function finish() { clearInterval(st.timer); st.frame = st.result.frames.length - 1; st.mode = 'done'; render(); }
  function again() { st.mode = 'setup'; st.result = null; render(); }

  function unitHtml(u, info, hp, hit) {
    var cls = 'unit' + (info.side ? ' foe' : ' ' + info.color) + (hp <= 0 ? ' down' : '') + (hit ? ' hit' : '') + (st.sel && info.pid === st.sel ? ' sel' : '');
    return '<span class="' + cls + '" title="' + esc(info.name) + '">' + info.icon + '<span class="hpbar"><i style="width:' + Math.round(100 * Math.max(0, hp) / info.maxHp) + '%"></i></span></span>';
  }
  function boardHtml() {
    var cells = [], show = {}, hits = {};
    if (st.mode === 'setup') {
      st.placement.forEach(function (p) { var q = piece(p.id); show[p.x + ',' + p.y] = { info: { side: 0, color: q.color, name: q.name, icon: q.icon, maxHp: 1, pid: q.id }, hp: 1 }; });
    } else {
      var units = {}; st.result.units.forEach(function (u) { units[u.id] = u; });
      var ev = st.result.events[st.frame - 1] || [];
      ev.forEach(function (e) { if (e.type === 'hit') hits[e.to] = true; });
      st.result.frames[st.frame].forEach(function (f) {
        var u = units[f.id], q = u.side === 0 ? piece(u.id.slice(2)) : null;
        var k = f.x + ',' + f.y;
        if (f.hp <= 0 && show[k]) return;
        show[k] = { info: { side: u.side, color: q ? q.color : '', name: u.name, icon: u.icon, maxHp: u.maxHp }, hp: f.hp, id: f.id };
      });
    }
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
      var alt = (x + y) % 2 ? ' alt' : '', fog = st.mode === 'setup' && y < 4, own = st.mode === 'setup' && y >= 4;
      var s = show[x + ',' + y];
      var label = fog ? (x === 3 && y === 1 ? '見' : x === 4 && y === 1 ? 'え' : x === 3 && y === 2 ? 'な' : x === 4 && y === 2 ? 'い' : '') : '';
      cells.push('<button class="cell' + alt + (fog ? ' fog' : '') + (own ? ' own' : '') + (own && st.sel && !s ? ' target' : '') + '" data-x="' + x + '" data-y="' + y + '"' + (own ? '' : ' tabindex="-1"') + ' aria-label="' + (x + 1) + '列' + (y + 1) + '行">' + label + (s ? unitHtml(null, s.info, s.hp, s.id && hits[s.id]) : '') + '</button>');
    }
    return '<div class="board" role="grid">' + cells.join('') + '</div>';
  }
  function statsHtml(id) {
    var q = piece(id), s = E.statsOf(q, E.trialPoints(q, D.trialPoints), D.base);
    var list = [['HP', s.hp], [q.magic ? '魔力' : 'ATK', q.magic ? s.mag : s.atk], ['DEF', s.def], ['抵抗', s.res], ['攻撃速度', '+' + s.ats + '%'], ['移動', s.spd], ['射程', s.range], [q.heal ? '回復' : '', q.heal ? Math.floor(s.mag / 2) : '']];
    return '<p class="hint"><b>' + q.icon + ' ' + esc(q.name) + '</b>（' + esc(q.cls) + '・' + q.color + '）</p><div class="stats">' + list.filter(function (l) { return l[0]; }).map(function (l) { return '<div>' + l[0] + '<b>' + l[1] + '</b></div>'; }).join('') + '</div>';
  }
  function render() {
    var h = [];
    h.push('<section class="card"><p class="eyebrow">試作・1戦だけ</p><h1>' + esc(D.trial.name) + 'を取る</h1><p class="lead">9人から5人まで選んで、手前の4列に並べます。戦いは自動で、数値どおりに決まります。運はありません。</p></section>');
    if (st.mode === 'done') {
      var win = st.result.winner === 0, left = st.result.units.filter(function (u) { return u.side === 0 && u.hp > 0; }).length;
      h.push('<section class="card result ' + (win ? 'win' : 'lose') + '"><h2>' + (win ? '勝ち！' : '負け') + '</h2><p>' + (win ? esc(D.trial.name) + 'を影響下に置きました。' + st.result.seconds + '秒、' + left + '人が残りました。' : '敵の並びが分かりました。並べ方を変えれば、結果も変わります。') + '</p><div class="row"><button class="btn" data-act="again">並べ直してもう一度</button></div></section>');
    }
    h.push('<section class="card" style="padding:10px">' + boardHtml() + '<div class="mid" style="margin-top:8px"><span>奥：野生の敵 ' + D.trial.enemies.length + '体' + (st.mode === 'setup' ? '（配置は見えない）' : '') + '</span><span>手前：<b>' + st.placement.length + '/' + MAX + '</b>人</span></div></section>');
    if (st.mode === 'setup') {
      h.push('<section class="card"><h2>仲間</h2><div class="bench">' + D.pieces.map(function (q) {
        return '<button class="chip ' + q.color + (st.sel === q.id ? ' on' : '') + (placed(q.id) ? ' placed' : '') + '" data-id="' + q.id + '"><span class="ic">' + q.icon + '</span><b>' + esc(q.name) + '</b><small>' + esc(q.cls) + '</small></button>';
      }).join('') + '</div>' + (st.sel ? statsHtml(st.sel) : '<p class="hint" style="margin-top:8px">仲間を押してから、盤の手前のマスを押すと置けます。置いた駒を選んでもう一度押すと外せます。</p>') + '</section>');
      h.push('<div class="row"><button class="btn" data-act="fight"' + (st.placement.length ? '' : ' disabled') + '>戦う</button><button class="btn sub" data-act="clear"' + (st.placement.length ? '' : ' disabled') + '>全部外す</button></div>');
    } else if (st.mode === 'battle') {
      h.push('<div class="row"><button class="btn sub" style="flex:1" data-act="skip">結果まで飛ばす</button></div>');
    }
    app.innerHTML = h.join('');
  }
  app.addEventListener('click', function (e) {
    var c = e.target.closest('.cell'), chip = e.target.closest('.chip'), act = e.target.closest('[data-act]');
    if (c) tapCell(+c.dataset.x, +c.dataset.y);
    else if (chip) tapChip(chip.dataset.id);
    else if (act) {
      var a = act.dataset.act;
      if (a === 'fight') fight(); else if (a === 'skip') finish(); else if (a === 'again') again();
      else if (a === 'clear') { st.placement = []; st.sel = null; save(); render(); }
    }
  });
  render();
})();
