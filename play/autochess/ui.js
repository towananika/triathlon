/* 画面だけを扱う。計算は engine.js、数字は pieces.js。保存はこの端末だけ。 */
(function () {
  'use strict';
  var D = window.TRI_CHESS_DATA, E = window.TriChess, KEY = 'triathlon-autochess-v1', CAP = D.starCap;
  var URL_PLAY = 'https://towananika.github.io/triathlon/play/autochess/';
  var app = document.getElementById('app');
  var saved = load();
  // sel: {chip: 駒id, star} = 盤に置く駒を選択中 / {x, y} = 盤の駒を選択中 / {info: 駒id, star} = 数値だけ表示
  var st = { placement: saved.placement, cleared: saved.cleared, owned: saved.owned, seen: saved.seen, day: saved.day, region: 0, sel: null, mode: 'setup', result: null, frame: 0, timer: null, copied: false, gained: null };
  var note = '';
  st.region = Math.min(st.cleared.length, D.regions.length - 1);
  // 挑戦状：URLの ?vs= に相手の配置が入っている
  var vsCode = (location.search.match(/[?&]vs=([0-9]+)/) || [])[1] || '';
  st.vs = vsCode ? E.decodePlacement(D, vsCode) : null;
  if (st.vs && st.vs.length) st.region = -2; else st.vs = null;
  fitPlacement();

  function load() {
    var v = null; try { v = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
    if (Array.isArray(v)) v = { placement: v };
    v = v || {};
    var owned = {}; Object.keys(D.start).forEach(function (k) { owned[k] = D.start[k]; });
    if (v.owned && typeof v.owned === 'object') Object.keys(v.owned).forEach(function (k) { if (owned[k] !== undefined) owned[k] = Math.min(E.MAX_OWN, Math.max(0, v.owned[k] | 0)); });
    return { placement: Array.isArray(v.placement) ? v.placement : [], cleared: Array.isArray(v.cleared) ? v.cleared : [], owned: owned,
      seen: v.seen && typeof v.seen === 'object' ? v.seen : {}, day: v.day && typeof v.day === 'object' ? v.day : {} };
  }
  function save() { st.sent = false; try { localStorage.setItem(KEY, JSON.stringify({ placement: st.placement, cleared: st.cleared, owned: st.owned, seen: st.seen, day: st.day })); } catch (_) {} }
  // st.region：0〜4 = 地域、-1 = 今日の地域
  var dailyCache = null;
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function daily() { var k = todayKey(); if (!dailyCache || dailyCache.date !== k) dailyCache = E.dailyRegion(D, k); return dailyCache; }
  function dayLog() { var k = todayKey(); if (st.day.date !== k) st.day = { date: k, tries: 0, winTry: 0 }; return st.day; }
  function region() {
    if (st.region === -2) return { id: 'vs-' + vsCode, vs: true, name: '挑戦状', color: 'R', enemies: st.vs };
    return st.region === -1 ? daily() : D.regions[st.region];
  }
  function challengeUrl() { return URL_PLAY + '?vs=' + E.encodePlacement(D, st.placement); }
  function unlocked(i) { return i <= 0 || st.cleared.indexOf(D.regions[i - 1].id) >= 0; }
  function piece(id) { return D.pieces.filter(function (p) { return p.id === id; })[0]; }
  function at(x, y) { return st.placement.filter(function (p) { return p.x === x && p.y === y; })[0]; }
  function starOf(p) { return p.star || 1; }
  function usedCount(id, star) { return st.placement.filter(function (p) { return p.id === id && starOf(p) === star; }).length; }
  function left(id, star) { return E.starsOf(st.owned[id] || 0)[star] - usedCount(id, star); }
  function starsUsed() { return st.placement.reduce(function (a, p) { return a + starOf(p); }, 0); }
  function starMark(n) { return n > 1 ? '★' + n : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // 保存された配置が、持っている星・自陣・星の上限を超えないようにそろえる
  function fitPlacement() {
    var used = {}, cells = {}, stars = 0;
    st.placement = st.placement.filter(function (p) {
      var star = starOf(p), k = p.id + '*' + star;
      if (!piece(p.id) || p.y < 4 || p.y > 7 || p.x < 0 || p.x > 7 || cells[p.x + ',' + p.y] || stars + star > CAP) return false;
      used[k] = (used[k] || 0) + 1;
      if (used[k] > E.starsOf(st.owned[p.id] || 0)[star]) return false;
      cells[p.x + ',' + p.y] = true; stars += star; return true;
    });
  }
  function flash(t) { note = t; render(); setTimeout(function () { if (note === t) { note = ''; render(); } }, 2000); }

  // 駒を盤に置く・動かす・外す（タップとドラッグで共通）
  function placeFromBench(id, star, x, y) {
    var here = at(x, y), room = CAP - starsUsed() + (here ? starOf(here) : 0);
    if (left(id, star) <= 0) return;
    if (star > room) { flash('盤に置ける星は合計' + CAP + 'つまでです'); return; }
    if (here) st.placement = st.placement.filter(function (p) { return p !== here; });
    st.placement.push({ id: id, star: star, x: x, y: y }); save();
  }
  function moveOnBoard(fx, fy, x, y) {
    var from = at(fx, fy), here = at(x, y);
    if (!from || from === here) return;
    if (here) { here.x = fx; here.y = fy; }
    from.x = x; from.y = y; save();
  }
  function removeAt(x, y) { var here = at(x, y); st.placement = st.placement.filter(function (p) { return p !== here; }); save(); }
  function tapCell(x, y) {
    if (st.mode !== 'setup' || y < 4) return;
    var here = at(x, y), sel = st.sel;
    if (sel && sel.chip) { st.sel = null; placeFromBench(sel.chip, sel.star, x, y); }
    else if (sel && sel.x !== undefined) {
      st.sel = null;
      if (sel.x === x && sel.y === y) removeAt(x, y); else moveOnBoard(sel.x, sel.y, x, y);
    } else if (here) st.sel = { x: x, y: y };
    render();
  }
  function tapChip(id, star) {
    if (st.mode !== 'setup') return;
    if (st.sel && (st.sel.chip === id || st.sel.info === id) && st.sel.star === star) st.sel = null;
    else if (left(id, star) > 0) st.sel = { chip: id, star: star };
    else st.sel = { info: id, star: star };
    render();
  }

  var lastFight = null, firstHitLines = [];
  function compareFirstHits(regionId, units) {
    var current = units.filter(function (u) { return u.side === 0; }).map(function (u) {
      var actor = st.result.units.find(function (v) { return v.id === u.id; });
      return { piece: at(u.x, u.y), x: u.x, y: u.y, star: u.star, time: actor.firstHitSeconds };
    });
    firstHitLines = [];
    if (lastFight && lastFight.region === regionId) current.forEach(function (now) {
      function sameKind(other) { return other.piece.id === now.piece.id && other.star === now.star; }
      var old = lastFight.units.find(function (other) { return other.piece === now.piece && sameKind(other); });
      if (!old && current.filter(sameKind).length === 1) {
        var candidates = lastFight.units.filter(sameKind);
        if (candidates.length === 1) old = candidates[0];
      }
      if (!old || (old.x === now.x && old.y === now.y)) return;
      function stamp(time) { return time == null ? '攻撃なし' : time.toFixed(1) + '秒'; }
      var diff = Math.round((old.time - now.time) * 10);
      var change = old.time == null || now.time == null ? '' : diff === 0 ? '（同じ）' :
        '（' + (Math.abs(diff) / 10).toFixed(1) + '秒' + (diff > 0 ? '早い' : '遅い') + '）';
      var q = piece(now.piece.id);
      var label = q.icon + ' ' + q.name + (current.filter(sameKind).length > 1 ? '（' + (now.x + 1) + '列' + (now.y + 1) + '行）' : '');
      firstHitLines.push('<p>' + esc(label) + 'の初撃　前回 ' + stamp(old.time) + ' → 今回 ' + stamp(now.time) + change + '</p>');
    });
    lastFight = { region: regionId, units: current };
  }
  function fight() {
    if (!st.placement.length) return;
    var rg = region();
    var units = rg.vs ? E.pvpBattle(D, st.placement, st.vs, st.owned) : E.trialBattle(D, st.placement, rg, st.owned);
    st.result = E.simulate(units, rg.vs ? { timeout: -1 } : undefined);
    compareFirstHits(rg.id, units);
    if (region().daily && !dayLog().winTry) dayLog().tries += 1;
    st.seen[region().id] = true; save(); st.copied = false; st.gained = null;
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
    if (st.result.winner === 0 && !region().vs) {
      var firstDaily = region().daily && !dayLog().winTry;
      if (region().daily) { if (firstDaily) dayLog().winTry = dayLog().tries; }
      else if (st.cleared.indexOf(region().id) < 0) st.cleared.push(region().id);
      var id = region().reward;
      if (id && (!region().daily || firstDaily)) { // 勝つたびに駒が1つ増え、3つで自動で★2、★2が3つで★3。★3があればもう増えない
        if ((st.owned[id] || 0) >= E.MAX_OWN) st.gained = { id: id, max: true };
        else {
          var before = E.starsOf(st.owned[id] || 0);
          st.owned[id] = (st.owned[id] || 0) + 1;
          var after = E.starsOf(st.owned[id]);
          st.gained = { id: id, up: after[3] > before[3] ? 3 : after[2] > before[2] ? 2 : 0 };
          if (st.gained.up) { // 盤に置いてあった下の星の駒は、その場で上の星に変わる（星の上限に収まるときだけ）
            var low = st.placement.filter(function (p) { return p.id === id && starOf(p) === st.gained.up - 1; })[0];
            if (low) { st.placement = st.placement.filter(function (p) { return p.id !== id || starOf(p) !== st.gained.up - 1 || p === low; }); if (starsUsed() + 1 <= CAP) low.star = st.gained.up; }
          }
          fitPlacement();
        }
      }
      save();
    }
    render();
    var r = app.querySelector('.result'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'center' });
  }
  function again() { st.mode = 'setup'; st.result = null; render(); }
  function goRegion(i) { if (st.mode === 'battle' || !unlocked(i)) return; st.region = i; st.mode = 'setup'; st.result = null; st.sel = null; render(); }
  function survivors() { return st.result.units.filter(function (u) { return u.side === 0 && u.hp > 0; }).length; }
  function shareText() {
    var win = st.result.winner === 0;
    var team = st.result.units.filter(function (u) { return u.side === 0; }).map(function (u) { return u.icon + starMark(u.star || 1); }).join('');
    if (region().vs) {
      var mine = st.placement.map(function (p) { return piece(p.id).icon + starMark(starOf(p)); }).join('');
      return 'TRIATHLON 盤 挑戦状' + (st.result.winner === 0 ? 'に勝った！' : st.result.winner === 1 ? 'に負けた' : 'は引き分け') + '\n' + mine + '\n今度はこちらからの挑戦状：\n' + challengeUrl();
    }
    if (region().daily) {
      var dl = dayLog(), n = dl.winTry || dl.tries, tries = '';
      for (var i = 1; i <= n; i++) tries += (dl.winTry && i === dl.winTry) ? '🟩' : '🟥';
      return 'TRIATHLON 盤 今日の地域 ' + dl.date + '\n' + (dl.winTry ? dl.winTry + '回目で勝ち' : n + '回挑戦中') + ' ' + tries + '\n' + team + '\n' + URL_PLAY;
    }
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

  function sendChallenge() {
    var t = 'TRIATHLON 盤の挑戦状。この配置に勝てる？（中身は戦うまで見えません）\n' + challengeUrl();
    function done() { st.sent = true; render(); }
    if (navigator.share) { navigator.share({ text: t }).then(done, function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.prompt('コピーしてください', t); });
    else window.prompt('コピーしてください', t);
  }
  function unitHtml(info, hp, hit, selected) {
    var cls = 'unit' + (info.side ? ' foe' : ' ' + info.color) + (hp <= 0 ? ' down' : '') + (hit ? ' hit' : '') + (selected ? ' sel' : '');
    return '<span class="' + cls + '" title="' + esc(info.name) + '">' + info.icon + (info.star > 1 ? '<span class="star">' + starMark(info.star) + '</span>' : '') + '<span class="hpbar"><i style="width:' + Math.round(100 * Math.max(0, hp) / info.maxHp) + '%"></i></span></span>';
  }
  function boardHtml() {
    var cells = [], show = {}, hits = {};
    if (st.mode === 'setup') {
      st.placement.forEach(function (p) { var q = piece(p.id); show[p.x + ',' + p.y] = { info: { side: 0, color: q.color, name: q.name, icon: q.icon, maxHp: 1, star: starOf(p) }, hp: 1 }; });
    } else {
      var units = {}; st.result.units.forEach(function (u) { units[u.id] = u; });
      (st.result.events[st.frame - 1] || []).forEach(function (e) { if (e.type === 'hit') hits[e.to] = true; });
      st.result.frames[st.frame].forEach(function (f) {
        var u = units[f.id], q = u.side === 0 ? piece(u.id.slice(u.id.indexOf('-') + 1)) : null, k = f.x + ',' + f.y;
        if (f.hp <= 0 && show[k]) return;
        show[k] = { info: { side: u.side, color: q ? q.color : '', name: u.name, icon: u.icon, maxHp: u.maxHp, star: u.star || 1 }, hp: f.hp, id: f.id };
      });
    }
    var fogText = { '3,1': '見', '4,1': 'え', '3,2': 'な', '4,2': 'い' }, memo = {};
    if (st.mode === 'setup' && st.seen[region().id] && !region().vs) { // 一度戦った地域は、敵の配置を覚えている
      fogText = {};
      region().enemies.forEach(function (e) { memo[e.x + ',' + e.y] = D.wildTypes[e.type].icon; });
    }
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
      var alt = (x + y) % 2 ? ' alt' : '', fog = st.mode === 'setup' && y < 4, own = st.mode === 'setup' && y >= 4, s = show[x + ',' + y];
      var selected = st.sel && st.sel.x === x && st.sel.y === y, target = own && st.sel && (st.sel.chip || st.sel.x !== undefined) && !selected;
      cells.push('<button class="cell' + alt + (fog ? ' fog' : '') + (own ? ' own' : '') + (own && s ? ' has' : '') + (target ? ' target' : '') + '" data-x="' + x + '" data-y="' + y + '"' + (own ? '' : ' tabindex="-1"') + ' aria-label="' + (x + 1) + '列' + (y + 1) + '行">' + (fog ? (memo[x + ',' + y] ? '<span class="memo">' + memo[x + ',' + y] + '</span>' : (fogText[x + ',' + y] || '')) : '') + (s ? unitHtml(s.info, s.hp, s.id && hits[s.id], selected) : '') + '</button>');
    }
    return '<div class="board" role="grid">' + cells.join('') + '</div>';
  }
  function statsHtml(id, star) {
    var q = piece(id), s = E.statsOf(q, E.trialPoints(q, D.trialPoints), D.base, star);
    var list = [['HP', s.hp], [q.magic ? '魔力' : 'ATK', q.magic ? s.mag : s.atk], ['DEF', s.def], ['抵抗', s.res], ['攻撃速度', '+' + s.ats + '%'], ['移動', s.spd], ['射程', s.range]];
    if (q.heal) list.push(['回復', Math.floor(s.mag / 2)]);
    return '<p class="hint" style="margin-top:10px"><b>' + q.icon + ' ' + esc(q.name) + ' ★' + star + '</b>（' + esc(q.cls) + '・' + q.color + '）' + ((st.owned[id] || 0) >= E.MAX_OWN ? '★3（最大）' : '★2まであと' + (3 - (st.owned[id] || 0) % 3) + 'つ') + '</p><div class="stats">' + list.map(function (l) { return '<div>' + l[0] + '<b>' + l[1] + '</b></div>'; }).join('') + '</div>';
  }
  function bonusHtml() {
    var cb = D.colorBonus, c = E.bonusColors(D, st.mode === 'setup' ? st.placement : st.result.units.filter(function (u) { return u.side === 0; }).map(function (u) { return { id: u.id.slice(u.id.indexOf('-') + 1) }; }));
    return '<div class="bonus">' + ['R', 'G', 'B'].map(function (k) {
      var on = c[k] >= cb.need;
      return '<span class="bn ' + k + (on ? ' on' : '') + '" title="' + esc(cb[k].label) + '"><b>' + k + ' ' + Math.min(c[k], cb.need) + '/' + cb.need + '</b>' + (on ? ' ' + esc(cb[k].label) : '') + '</span>';
    }).join('') + '</div>';
  }
  function render() {
    var h = [], rg = region();
    h.push('<section class="card"><p class="eyebrow">' + (rg.vs ? '挑戦状が届きました・相手の配置は見えません' : rg.daily ? '今日の地域・' + rg.date + (dayLog().winTry ? '・' + dayLog().winTry + '回目で勝ち' : dayLog().tries ? '・' + dayLog().tries + '回挑戦' : '') : '試作・地域 ' + (st.region + 1) + '/' + D.regions.length) + '</p><h1>' + (rg.vs ? '挑戦状に勝つ' : esc(rg.name) + 'を取る') + '</h1><p class="lead">持っている駒を手前の4列にドラッグして並べます。盤に置ける星は合計' + CAP + 'つまで。同じ駒が3つそろうと自動で★2、★2が3つで★3（最大）になります。戦いは自動で、数値どおりに決まります。</p><div class="regions">' + (st.vs ? '<button class="rg vs' + (st.region === -2 ? ' on' : '') + '" data-region="-2"' + (st.mode !== 'battle' ? '' : ' disabled') + '>⚔️ 挑戦状</button>' : '') + '<button class="rg day' + (st.region === -1 ? ' on' : '') + '" data-region="-1"' + (st.mode !== 'battle' ? '' : ' disabled') + '>📅 今日' + (dayLog().winTry ? ' ✓' : '') + '</button>' + D.regions.map(function (r, i) {
      var c = st.cleared.indexOf(r.id) >= 0, u = unlocked(i);
      return '<button class="rg ' + r.color + (i === st.region ? ' on' : '') + '" data-region="' + i + '"' + (u && st.mode !== 'battle' ? '' : ' disabled') + '>' + (c ? '✓ ' : u ? '' : '🔒 ') + esc(r.name) + '</button>';
    }).join('') + '</div></section>');
    if (st.mode === 'done') {
      var win = st.result.winner === 0, hasNext = win && st.region >= 0 && st.region < D.regions.length - 1, gd = st.gained, g = gd && piece(gd.id), gm = '';
      if (g) gm = gd.max ? g.icon + ' ' + esc(g.name) + 'はもう★3なので、これ以上は増えません。' : g.icon + ' <b>' + esc(g.name) + '</b>が1つ増えました' + (gd.up ? '。3つそろって<b>★' + gd.up + '</b>になりました！' : '（★2まであと' + (3 - st.owned[g.id] % 3) + 'つ）');
      h.push('<section class="card result ' + (win ? 'win' : 'lose') + '"><h2>' + (win ? '勝ち！' : st.result.winner === -1 ? '引き分け' : '負け') + '</h2><p>' + (rg.vs ? (win ? '挑戦状の相手に勝ちました。' + st.result.seconds + '秒、' + survivors() + '人が残りました。' : st.result.winner === -1 ? '引き分けでした。並べ方を少し変えると決着がつきます。' : '相手の並びが見えました。並べ方を変えて、もう一度挑めます。') : win ? esc(rg.name) + 'を影響下に置きました。' + st.result.seconds + '秒、' + survivors() + '人が残りました。' : '敵の並びが分かりました。並べ方を変えれば、結果も変わります。') + '</p>' +
        firstHitLines.join('') +
        (gm ? '<p class="gain">' + gm + '</p>' : '') +
        '<div class="row">' + (hasNext ? '<button class="btn" data-act="next">次の地域へ</button>' : '') + '<button class="btn' + (hasNext ? ' sub' : '') + '" data-act="again">' + (win ? 'もう一度' : '並べ直してもう一度') + '</button></div><div class="row" style="margin-top:8px"><button class="btn sub" style="flex:1" data-act="share">' + (st.copied ? '共有しました ✓' : '結果を共有') + '</button></div>' +
        (win && st.cleared.length === D.regions.length ? '<p style="margin:10px 0 0">5つの地域をすべて影響下に置きました！</p>' : '') + '</section>');
    }
    h.push('<section class="card" style="padding:10px">' + boardHtml() + '<div class="mid" style="margin-top:8px"><span>' + (rg.vs ? '奥：相手の駒 ' : '奥：野生の敵 ') + rg.enemies.length + '体' + (st.mode === 'setup' ? (st.seen[rg.id] && !rg.vs ? '（配置を覚えている）' : '（配置は見えない）') : '') + '</span><span>星：<b>' + starsUsed() + '/' + CAP + '</b></span></div>' + bonusHtml() + '</section>');
    if (st.mode === 'setup') {
      var rw = rg.reward && !(rg.daily && dayLog().winTry) ? piece(rg.reward) : null, chips = [];
      D.pieces.forEach(function (q) {
        var have = E.starsOf(st.owned[q.id] || 0);
        [3, 2, 1].forEach(function (star) {
          if (!have[star]) return;
          var l = left(q.id, star), on = st.sel && (st.sel.chip === q.id || st.sel.info === q.id) && st.sel.star === star;
          chips.push('<button class="chip ' + q.color + (on ? ' on' : '') + (l <= 0 ? ' placed' : '') + '" data-id="' + q.id + '" data-star="' + star + '"><span class="ic">' + q.icon + '</span><b>' + esc(q.name) + '</b><small>' + (star > 1 ? '<span class="cnt">' + starMark(star) + '</span> ' : '') + '残り' + l + '</small></button>');
        });
      });
      h.push('<section class="card"><h2>持っている駒</h2>' + (rw ? '<p class="hint" style="margin:-2px 0 8px">' + (rg.daily ? '今日初めて勝つと ' : '勝つと ') + rw.icon + ' ' + esc(rw.name) + 'が1つ増えます（3つで★2）。</p>' : '') + (note ? '<p class="warn">' + esc(note) + '</p>' : '') + '<div class="bench">' + chips.join('') + '</div>' +
        (st.sel && (st.sel.chip || st.sel.info) ? statsHtml(st.sel.chip || st.sel.info, st.sel.star) : '<p class="hint" style="margin-top:8px">駒を盤の手前にドラッグして置きます（押してからマスを押しても置けます）。盤の駒はドラッグで移動、盤の外へドラッグすると外せます。</p>') + '</section>');
      h.push('<div class="row"><button class="btn" data-act="fight"' + (st.placement.length ? '' : ' disabled') + '>戦う</button><button class="btn sub" data-act="clear"' + (st.placement.length ? '' : ' disabled') + '>全部外す</button></div>');
      h.push('<div class="row" style="margin-top:8px"><button class="btn sub" style="flex:1" data-act="challenge"' + (st.placement.length ? '' : ' disabled') + '>' + (st.sent ? '挑戦状を送りました ✓' : 'この配置で挑戦状を作る') + '</button></div>');
    } else if (st.mode === 'battle') {
      h.push('<div class="row"><button class="btn sub" style="flex:1" data-act="skip">結果まで飛ばす</button></div>');
    }
    app.innerHTML = h.join('');
  }

  // ドラッグ：持っている駒 → 盤、盤 → 盤（移動・入れ替え）、盤 → 外（外す）
  var drag = null, eatClick = false;
  app.addEventListener('pointerdown', function (e) {
    if (st.mode !== 'setup' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    var chip = e.target.closest('.chip'), cell = e.target.closest('.cell.has');
    if (chip && left(chip.dataset.id, +chip.dataset.star) > 0) drag = { id: chip.dataset.id, star: +chip.dataset.star };
    else if (cell) { var p = at(+cell.dataset.x, +cell.dataset.y); if (p) drag = { id: p.id, star: starOf(p), fx: p.x, fy: p.y }; }
    if (drag) { drag.sx = e.clientX; drag.sy = e.clientY; drag.on = false; }
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.on && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 8) return;
    if (!drag.on) {
      drag.on = true; drag.ghost = document.createElement('div'); drag.ghost.className = 'ghost ' + piece(drag.id).color;
      drag.ghost.textContent = piece(drag.id).icon + starMark(drag.star); document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.transform = 'translate(' + (e.clientX - 26) + 'px,' + (e.clientY - 30) + 'px)';
    var over = document.elementFromPoint(e.clientX, e.clientY), c = over && over.closest('.cell.own');
    app.querySelectorAll('.cell.over').forEach(function (el) { if (el !== c) el.classList.remove('over'); });
    if (c) c.classList.add('over');
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', function (e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.on) return;
    d.ghost.remove(); eatClick = true; setTimeout(function () { eatClick = false; }, 0);
    var over = document.elementFromPoint(e.clientX, e.clientY), c = over && over.closest('.cell.own');
    st.sel = null;
    if (c) { var x = +c.dataset.x, y = +c.dataset.y; if (d.fx === undefined) placeFromBench(d.id, d.star, x, y); else moveOnBoard(d.fx, d.fy, x, y); }
    else if (d.fx !== undefined) removeAt(d.fx, d.fy);
    render();
  });
  document.addEventListener('pointercancel', function () { if (drag && drag.ghost) drag.ghost.remove(); drag = null; render(); });
  app.addEventListener('click', function (e) {
    if (eatClick) return;
    var c = e.target.closest('.cell'), chip = e.target.closest('.chip'), act = e.target.closest('[data-act]'), rg = e.target.closest('[data-region]');
    if (rg) goRegion(+rg.dataset.region);
    else if (c) tapCell(+c.dataset.x, +c.dataset.y);
    else if (chip) tapChip(chip.dataset.id, +chip.dataset.star);
    else if (act) {
      var a = act.dataset.act;
      if (a === 'fight') fight(); else if (a === 'skip') finish(); else if (a === 'again') again();
      else if (a === 'next') goRegion(st.region + 1); else if (a === 'share') share(); else if (a === 'challenge') sendChallenge();
      else if (a === 'clear') { st.placement = []; st.sel = null; save(); render(); }
    }
  });
  render();
})();
