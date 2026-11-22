/* 画面だけを扱う。計算は engine.js、数字は pieces.js。保存はこの端末だけ。 */
(function () {
  'use strict';
  var D = window.TRI_CHESS_DATA, E = window.TriChess, KEY = 'triathlon-autochess-v1', MAX = 5;
  var URL_PLAY = 'https://towananika.github.io/triathlon/play/autochess/';
  var app = document.getElementById('app');
  var saved = load();
  // sel: {chip: 駒id} = 盤に置く駒を選択中 / {x, y} = 盤の駒を選択中
  var st = { placement: saved.placement, cleared: saved.cleared, owned: saved.owned, region: 0, sel: null, mode: 'setup', result: null, frame: 0, timer: null, copied: false, gained: null };
  st.region = Math.min(st.cleared.length, D.regions.length - 1);
  fitPlacement();

  function load() {
    var v = null; try { v = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
    if (Array.isArray(v)) v = { placement: v };
    v = v || {};
    var owned = {}; Object.keys(D.start).forEach(function (k) { owned[k] = D.start[k]; });
    if (v.owned && typeof v.owned === 'object') Object.keys(v.owned).forEach(function (k) { if (owned[k] !== undefined) owned[k] = Math.max(0, v.owned[k] | 0); });
    return { placement: Array.isArray(v.placement) ? v.placement : [], cleared: Array.isArray(v.cleared) ? v.cleared : [], owned: owned };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ placement: st.placement, cleared: st.cleared, owned: st.owned })); } catch (_) {} }
  function region() { return D.regions[st.region]; }
  function unlocked(i) { return i === 0 || st.cleared.indexOf(D.regions[i - 1].id) >= 0; }
  function piece(id) { return D.pieces.filter(function (p) { return p.id === id; })[0]; }
  function at(x, y) { return st.placement.filter(function (p) { return p.x === x && p.y === y; })[0]; }
  function usedCount(id) { return st.placement.filter(function (p) { return p.id === id; }).length; }
  function left(id) { return (st.owned[id] || 0) - usedCount(id); }
  // 保存された配置が、持っている数・自陣・5人を超えないようにそろえる
  function fitPlacement() {
    var used = {}, cells = {};
    st.placement = st.placement.filter(function (p) {
      if (!piece(p.id) || p.y < 4 || p.y > 7 || p.x < 0 || p.x > 7 || cells[p.x + ',' + p.y]) return false;
      used[p.id] = (used[p.id] || 0) + 1;
      if (used[p.id] > (st.owned[p.id] || 0)) return false;
      cells[p.x + ',' + p.y] = true; return true;
    }).slice(0, MAX);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function tapCell(x, y) {
    if (st.mode !== 'setup' || y < 4) return;
    var here = at(x, y), sel = st.sel;
    if (sel && sel.chip) {
      if (here) here.id = sel.chip; // 置いてある駒と入れ替える
      else if (st.placement.length < MAX) st.placement.push({ id: sel.chip, x: x, y: y });
      st.sel = null;
      save();
    } else if (sel && sel.x !== undefined) {
      var from = at(sel.x, sel.y);
      if (from && from === here) st.placement = st.placement.filter(function (p) { return p !== here; }); // もう一度押すと外す
      else if (from) { if (here) { here.x = from.x; here.y = from.y; } from.x = x; from.y = y; }
      st.sel = null; save();
    } else if (here) st.sel = { x: x, y: y };
    render();
  }
  function tapChip(id) {
    if (st.mode !== 'setup') return;
    if (st.sel && st.sel.chip === id) st.sel = null;
    else if (left(id) > 0) st.sel = { chip: id };
    else st.sel = { info: id }; // 全部置いてあるときは数値だけ見せる
    render();
  }

  function fight() {
    if (!st.placement.length) return;
    st.result = E.simulate(E.trialBattle(D, st.placement, st.region, st.owned)); st.copied = false; st.gained = null;
    st.mode = 'battle'; st.sel = null; st.frame = 0; render();
    var bd = app.querySelector('.board'); if (bd && bd.scrollIntoView) bd.scrollIntoView({ block: 'center' });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { finish(); return; }
    st.timer = setInterval(function () {
      st.frame += 1;
      if (st.frame >= st.result.frames.length - 1) finish(); else render();
    }, 55);
  }
  function finish() {
    clearInterval(st.timer); st.frame = st.result.frames.length - 1; st.mode = 'done';
    if (st.result.winner === 0 && st.cleared.indexOf(region().id) < 0) {
      st.cleared.push(region().id);
      if (region().reward) { st.owned[region().reward] = (st.owned[region().reward] || 0) + 1; st.gained = region().reward; }
      save();
    }
    render();
    var r = app.querySelector('.result'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'center' });
  }
  function again() { st.mode = 'setup'; st.result = null; render(); }
  function goRegion(i) { if (st.mode === 'battle' || !unlocked(i)) return; clearInterval(st.timer); st.region = i; st.mode = 'setup'; st.result = null; st.sel = null; render(); }
  function survivors() { return st.result.units.filter(function (u) { return u.side === 0 && u.hp > 0; }).length; }
  function shareText() {
    var win = st.result.winner === 0;
    var team = st.placement.slice(0, MAX).map(function (p) { return piece(p.id).icon; }).join('');
    var marks = D.regions.map(function (r) { return st.cleared.indexOf(r.id) >= 0 ? '🟩' : '⬜'; }).join('');
    return 'TRIATHLON 盤 ' + region().name + ' ' + (win ? '勝ち' : '負け') + '\n' + team + (win ? ' ' + survivors() + '人残り ' + st.result.seconds + '秒' : '') + '\n' + marks + '\n' + URL_PLAY;
  }
  function share() {
    var t = shareText();
    function done() { st.copied = true; render(); }
    if (navigator.share) { navigator.share({ text: t }).then(done, function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.prompt('コピーしてください', t); });
    else window.prompt('コピーしてください', t);
  }

  function unitHtml(info, hp, hit, selected) {
    var cls = 'unit' + (info.side ? ' foe' : ' ' + info.color) + (hp <= 0 ? ' down' : '') + (hit ? ' hit' : '') + (selected ? ' sel' : '');
    return '<span class="' + cls + '" title="' + esc(info.name) + '">' + info.icon + '<span class="hpbar"><i style="width:' + Math.round(100 * Math.max(0, hp) / info.maxHp) + '%"></i></span></span>';
  }
  function boardHtml() {
    var cells = [], show = {}, hits = {};
    if (st.mode === 'setup') {
      st.placement.forEach(function (p) { var q = piece(p.id); show[p.x + ',' + p.y] = { info: { side: 0, color: q.color, name: q.name, icon: q.icon, maxHp: 1 }, hp: 1 }; });
    } else {
      var units = {}; st.result.units.forEach(function (u) { units[u.id] = u; });
      (st.result.events[st.frame - 1] || []).forEach(function (e) { if (e.type === 'hit') hits[e.to] = true; });
      st.result.frames[st.frame].forEach(function (f) {
        var u = units[f.id], q = u.side === 0 ? piece(u.id.slice(u.id.indexOf('-') + 1)) : null, k = f.x + ',' + f.y;
        if (f.hp <= 0 && show[k]) return;
        show[k] = { info: { side: u.side, color: q ? q.color : '', name: u.name, icon: u.icon, maxHp: u.maxHp }, hp: f.hp, id: f.id };
      });
    }
    var fogText = { '3,1': '見', '4,1': 'え', '3,2': 'な', '4,2': 'い' };
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
      var alt = (x + y) % 2 ? ' alt' : '', fog = st.mode === 'setup' && y < 4, own = st.mode === 'setup' && y >= 4, s = show[x + ',' + y];
      var selected = st.sel && st.sel.x === x && st.sel.y === y, target = own && st.sel && (st.sel.chip || st.sel.x !== undefined) && !selected;
      cells.push('<button class="cell' + alt + (fog ? ' fog' : '') + (own ? ' own' : '') + (target ? ' target' : '') + '" data-x="' + x + '" data-y="' + y + '"' + (own ? '' : ' tabindex="-1"') + ' aria-label="' + (x + 1) + '列' + (y + 1) + '行">' + (fog ? (fogText[x + ',' + y] || '') : '') + (s ? unitHtml(s.info, s.hp, s.id && hits[s.id], selected) : '') + '</button>');
    }
    return '<div class="board" role="grid">' + cells.join('') + '</div>';
  }
  function statsHtml(id) {
    var q = piece(id), s = E.statsOf(q, E.trialPoints(q, D.trialPoints), D.base);
    var list = [['HP', s.hp], [q.magic ? '魔力' : 'ATK', q.magic ? s.mag : s.atk], ['DEF', s.def], ['抵抗', s.res], ['攻撃速度', '+' + s.ats + '%'], ['移動', s.spd], ['射程', s.range]];
    if (q.heal) list.push(['回復', Math.floor(s.mag / 2)]);
    return '<p class="hint" style="margin-top:10px"><b>' + q.icon + ' ' + esc(q.name) + '</b>（' + esc(q.cls) + '・' + q.color + '）持っている数 ' + (st.owned[id] || 0) + '</p><div class="stats">' + list.map(function (l) { return '<div>' + l[0] + '<b>' + l[1] + '</b></div>'; }).join('') + '</div>';
  }
  function render() {
    var h = [], rg = region();
    h.push('<section class="card"><p class="eyebrow">試作・地域 ' + (st.region + 1) + '/' + D.regions.length + '</p><h1>' + esc(rg.name) + 'を取る</h1><p class="lead">持っている駒から5人まで選んで、手前の4列に並べます。戦いは自動で、数値どおりに決まります。運はありません。</p><div class="regions">' + D.regions.map(function (r, i) {
      var c = st.cleared.indexOf(r.id) >= 0, u = unlocked(i);
      return '<button class="rg ' + r.color + (i === st.region ? ' on' : '') + '" data-region="' + i + '"' + (u && st.mode !== 'battle' ? '' : ' disabled') + '>' + (c ? '✓ ' : u ? '' : '🔒 ') + esc(r.name) + '</button>';
    }).join('') + '</div></section>');
    if (st.mode === 'done') {
      var win = st.result.winner === 0, hasNext = win && st.region < D.regions.length - 1, g = st.gained && piece(st.gained);
      h.push('<section class="card result ' + (win ? 'win' : 'lose') + '"><h2>' + (win ? '勝ち！' : '負け') + '</h2><p>' + (win ? esc(rg.name) + 'を影響下に置きました。' + st.result.seconds + '秒、' + survivors() + '人が残りました。' : '敵の並びが分かりました。並べ方を変えれば、結果も変わります。') + '</p>' +
        (g ? '<p class="gain">' + g.icon + ' <b>' + esc(g.name) + '</b>が仲間に加わりました（' + st.owned[g.id] + '人目）</p>' : '') +
        '<div class="row">' + (hasNext ? '<button class="btn" data-act="next">次の地域へ</button>' : '') + '<button class="btn' + (hasNext ? ' sub' : '') + '" data-act="again">' + (win ? 'もう一度' : '並べ直してもう一度') + '</button></div><div class="row" style="margin-top:8px"><button class="btn sub" style="flex:1" data-act="share">' + (st.copied ? '共有しました ✓' : '結果を共有') + '</button></div>' +
        (win && st.cleared.length === D.regions.length ? '<p style="margin:10px 0 0">5つの地域をすべて影響下に置きました！</p>' : '') + '</section>');
    }
    h.push('<section class="card" style="padding:10px">' + boardHtml() + '<div class="mid" style="margin-top:8px"><span>奥：野生の敵 ' + rg.enemies.length + '体' + (st.mode === 'setup' ? '（配置は見えない）' : '') + '</span><span>手前：<b>' + st.placement.length + '/' + MAX + '</b>人</span></div></section>');
    if (st.mode === 'setup') {
      var rw = rg.reward && st.cleared.indexOf(rg.id) < 0 ? piece(rg.reward) : null;
      h.push('<section class="card"><h2>持っている駒</h2>' + (rw ? '<p class="hint" style="margin:-2px 0 8px">初めて勝つと ' + rw.icon + ' ' + esc(rw.name) + 'がもう1人仲間になります。</p>' : '') + '<div class="bench">' + D.pieces.map(function (q) {
        var n = st.owned[q.id] || 0, l = left(q.id), on = st.sel && (st.sel.chip === q.id || st.sel.info === q.id);
        return '<button class="chip ' + q.color + (on ? ' on' : '') + (l <= 0 ? ' placed' : '') + '" data-id="' + q.id + '"><span class="ic">' + q.icon + '</span><b>' + esc(q.name) + '</b><small>' + (n > 1 ? '<span class="cnt">×' + n + '</span> ' : '') + '残り' + l + '</small></button>';
      }).join('') + '</div>' + (st.sel && (st.sel.chip || st.sel.info) ? statsHtml(st.sel.chip || st.sel.info) : '<p class="hint" style="margin-top:8px">駒を押してから、盤の手前のマスを押すと置けます。同じ駒を複数持っていれば、その数まで置けます。置いた駒を押すと移動、もう一度押すと外せます。</p>') + '</section>');
      h.push('<div class="row"><button class="btn" data-act="fight"' + (st.placement.length ? '' : ' disabled') + '>戦う</button><button class="btn sub" data-act="clear"' + (st.placement.length ? '' : ' disabled') + '>全部外す</button></div>');
    } else if (st.mode === 'battle') {
      h.push('<div class="row"><button class="btn sub" style="flex:1" data-act="skip">結果まで飛ばす</button></div>');
    }
    app.innerHTML = h.join('');
  }
  app.addEventListener('click', function (e) {
    var c = e.target.closest('.cell'), chip = e.target.closest('.chip'), act = e.target.closest('[data-act]'), rg = e.target.closest('[data-region]');
    if (rg) goRegion(+rg.dataset.region);
    else if (c) tapCell(+c.dataset.x, +c.dataset.y);
    else if (chip) tapChip(chip.dataset.id);
    else if (act) {
      var a = act.dataset.act;
      if (a === 'fight') fight(); else if (a === 'skip') finish(); else if (a === 'again') again();
      else if (a === 'next') goRegion(st.region + 1); else if (a === 'share') share();
      else if (a === 'clear') { st.placement = []; st.sel = null; save(); render(); }
    }
  });
  render();
})();
