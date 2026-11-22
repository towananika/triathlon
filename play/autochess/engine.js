/* 戦闘の計算だけを扱う。運の要素はなく、同じ入力なら必ず同じ結果になる。画面は ui.js。 */
(function (root) {
  'use strict';
  var W = 8, H = 8, TICK = 0.1, LIMIT = 600; // 0.1秒ごとに進め、最長60秒

  // R・G・B のポイントから戦闘用の数値を作る
  // 星：同じ駒3つで★2、★2が3つで★3。★3が最大で、★3を持つ駒はそれ以上増えない（持てるのは9つ分まで）。
  // HP・ATK・魔力が倍率で上がる
  var MAX_OWN = 9;
  var STAR_MULT = [1, 1, 1.8, 3.2];
  function starsOf(n) { n = Math.min(MAX_OWN, Math.max(0, n | 0)); return { 1: n % 3, 2: Math.floor((n % 9) / 3), 3: Math.floor(n / 9) }; }
  function statsOf(piece, points, base, star) {
    var R = points.R || 0, G = points.G || 0, B = points.B || 0, m = STAR_MULT[star || 1];
    return {
      hp: Math.floor((base.hp + R * piece.R[0]) * m), atk: Math.floor((base.atk + R * piece.R[1]) * m), def: base.def + R * piece.R[2],
      ats: G * piece.G[0], spd: base.spd + G * piece.G[1],
      mag: Math.floor(B * piece.B[0] * m), res: base.res + B * piece.B[1], range: piece.range
    };
  }
  function trialPoints(piece, rule) {
    var p = { R: rule.other, G: rule.other, B: rule.other }; p[piece.color] = rule.main; return p;
  }
  // ダメージは割合で減らす。端数は切り捨て、最低1
  function damage(power, guard) { return Math.max(1, Math.floor(power * 100 / (100 + guard))); }
  function attackEvery(ats) { return Math.max(2, Math.round(10 * 100 / (100 + ats))); }
  function moveEvery(spd) { return Math.max(2, Math.round(12 / (1 + spd * 0.25))); }
  function dist(a, b) { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); }

  function makeUnit(id, side, x, y, s, info) {
    return { id: id, side: side, x: x, y: y, name: info.name, icon: info.icon, magic: !!info.magic, heal: !!info.heal,
      hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def, mag: s.mag, res: s.res, range: s.range,
      atkEvery: attackEvery(s.ats), moveEvery: moveEvery(s.spd), atkWait: 0, moveWait: 0 };
  }

  // 一番近い敵。同じ距離なら、縦が近い → 左 → 番号の順で決める
  // 奥の陣営から見た左右（盤を180度回すと同じ判断になるように）
  function lx(u, o) { return u.side ? W - 1 - o.x : o.x; }
  function nearest(u, units) {
    var best = null;
    units.forEach(function (o) {
      if (o.side === u.side || o.hp <= 0) return;
      if (!best) { best = o; return; }
      var d = dist(u, o), bd = dist(u, best);
      if (d < bd || (d === bd && (Math.abs(o.y - u.y) < Math.abs(best.y - u.y) ||
        (Math.abs(o.y - u.y) === Math.abs(best.y - u.y) && (lx(u, o) < lx(u, best) || (o.x === best.x && o.id.slice(1) < best.id.slice(1))))))) best = o;
    });
    return best;
  }
  var STEPS = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  function stepCell(u, t, units) {
    var best = null, bd = dist(u, t);
    STEPS.forEach(function (s) {
      var x = u.x + (u.side ? -s[0] : s[0]), y = u.y + (u.side ? -s[1] : s[1]);
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      if (units.some(function (o) { return o.hp > 0 && o.x === x && o.y === y; })) return;
      var d = dist({ x: x, y: y }, t);
      if (d < bd) { bd = d; best = { x: x, y: y }; }
    });
    return best;
  }
  function snapshot(units) {
    return units.map(function (u) { return { id: u.id, x: u.x, y: u.y, hp: u.hp }; });
  }

  // units: makeUnit の配列。side 0 = 攻める側（手前）、1 = 守る側（奥）
  // opts.timeout：時間切れの勝者（地域戦は守る側=1、対戦は引き分け=-1）
  function simulate(units, opts) {
    units = units.map(function (u) { return Object.assign({}, u); }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    var frames = [snapshot(units)], events = [], tick = 0, winner = null;
    function alive(side) { return units.some(function (u) { return u.side === side && u.hp > 0; }); }
    while (tick < LIMIT) {
      tick += 1;
      var ev = [];
      // 1) 攻撃と回復は同時に決める（tickの初めの状態で判断し、まとめて反映）
      var hits = [], heals = [], movers = [];
      units.forEach(function (u) {
        if (u.hp <= 0) return;
        if (u.atkWait > 0) u.atkWait -= 1;
        if (u.moveWait > 0) u.moveWait -= 1;
        var t = nearest(u, units);
        if (!t) return;
        if (dist(u, t) <= u.range) {
          if (u.atkWait > 0) return;
          if (u.firstHitSeconds == null) u.firstHitSeconds = tick * TICK;
          hits.push({ u: u, t: t, dmg: u.magic ? damage(u.mag, t.res) : damage(u.atk, t.def) }); u.atkWait = u.atkEvery;
          if (u.heal) { // クレリック：攻撃のたびに、射程内でHPの割合が一番低い味方を魔力の半分だけ回復
            var ally = null;
            units.forEach(function (o) {
              if (o.side !== u.side || o.hp <= 0 || o.hp >= o.maxHp || dist(u, o) > u.range) return;
              if (!ally || o.hp / o.maxHp < ally.hp / ally.maxHp || (o.hp / o.maxHp === ally.hp / ally.maxHp && o.id.slice(1) < ally.id.slice(1))) ally = o;
            });
            if (ally) heals.push({ u: u, t: ally, amount: Math.max(1, Math.floor(u.mag / 2)) });
          }
        } else if (u.moveWait === 0) movers.push(u);
      });
      hits.forEach(function (h) { h.t.hp = Math.max(0, h.t.hp - h.dmg); ev.push({ type: 'hit', from: h.u.id, to: h.t.id, amount: h.dmg }); });
      heals.forEach(function (h) { if (h.t.hp <= 0) return; var n = Math.min(h.t.maxHp - h.t.hp, h.amount); h.t.hp += n; ev.push({ type: 'heal', from: h.u.id, to: h.t.id, amount: n }); });
      hits.forEach(function (h) { if (h.t.hp === 0 && !h.t.downed) { h.t.downed = true; ev.push({ type: 'down', id: h.t.id }); } });
      // 2) 移動も同時：行き先が重なったマスへは誰も動かない（盤を回しても同じ結果になる）
      var want = {};
      movers.forEach(function (u) {
        if (u.hp <= 0) return;
        var t = nearest(u, units), c = t && stepCell(u, t, units);
        if (c) (want[c.x + ',' + c.y] = want[c.x + ',' + c.y] || []).push({ u: u, c: c });
      });
      Object.keys(want).forEach(function (k) {
        if (want[k].length !== 1) return;
        var m = want[k][0]; m.u.x = m.c.x; m.u.y = m.c.y; m.u.moveWait = m.u.moveEvery;
      });
      frames.push(snapshot(units)); events.push(ev);
      var a = alive(0), d = alive(1);
      if (!a || !d) { winner = a ? 0 : d ? 1 : -1; break; }
    }
    if (winner === null) winner = opts && opts.timeout !== undefined ? opts.timeout : 1; // 時間切れは守る側の勝ち
    return { winner: winner, ticks: tick, seconds: Math.round(tick * TICK * 10) / 10, frames: frames, events: events, units: units };
  }

  // 色のボーナス：同じ色の駒が need 体以上いると、その色の駒が強くなる
  function colorCounts(data, units) {
    var c = { R: 0, G: 0, B: 0 };
    units.forEach(function (u) { if (c[u.color] !== undefined) c[u.color] += 1; });
    return c;
  }
  function applyBonus(s, b) {
    return { hp: Math.floor(s.hp * (100 + (b.hpPct || 0)) / 100), atk: s.atk, def: s.def + (b.def || 0), ats: s.ats + (b.ats || 0), spd: s.spd + (b.spd || 0),
      mag: Math.floor(s.mag * (100 + (b.magPct || 0)) / 100), res: s.res + (b.res || 0), range: s.range };
  }

  // 地域の1戦を組み立てる。region：地域の番号、または地域そのもの（今日の地域など）
  // placement: [{id, star, x, y}]（自陣は y=4〜7）。盤に置ける星の合計は data.starCap まで
  // owned（任意）：{駒id: 持っている数}。3つで★2に自動でまとまり、その星の数より多くは出せない
  function trialBattle(data, placement, region, owned) {
    region = typeof region === 'object' && region ? region : data.regions[region || 0];
    var units = [], used = {}, cells = {}, stars = 0, ok = [];
    placement.forEach(function (p, i) {
      var piece = data.pieces.filter(function (q) { return q.id === p.id; })[0], star = p.star || 1;
      if (!piece || star < 1 || star > 3 || p.y < 4 || p.y > 7 || p.x < 0 || p.x > 7 || cells[p.x + ',' + p.y]) return;
      if (stars + star > data.starCap) return;
      var k = p.id + '*' + star; used[k] = (used[k] || 0) + 1;
      if (owned && used[k] > starsOf(owned[p.id] || 0)[star]) return;
      cells[p.x + ',' + p.y] = true; stars += star;
      ok.push({ p: p, i: i, piece: piece, star: star, color: piece.color });
    });
    var counts = colorCounts(data, ok), cb = data.colorBonus || {};
    ok.forEach(function (o) {
      var s = statsOf(o.piece, trialPoints(o.piece, data.trialPoints), data.base, o.star);
      if (cb.need && counts[o.color] >= cb.need) s = applyBonus(s, cb[o.color]);
      var u = makeUnit('a' + o.i + '-' + o.piece.id, 0, o.p.x, o.p.y, s, o.piece);
      u.star = o.star; u.color = o.color; units.push(u);
    });
    region.enemies.forEach(function (e, i) {
      var w = data.wildTypes[e.type];
      units.push(makeUnit('d-' + i + '-' + e.type, 1, e.x, e.y, w, w));
    });
    return units;
  }
  function bonusColors(data, placement) {
    var c = { R: 0, G: 0, B: 0 };
    placement.forEach(function (p) { var q = data.pieces.filter(function (x) { return x.id === p.id; })[0]; if (q) c[q.color] += 1; });
    return c;
  }

  // 対戦：二人とも自分の手前（y=4〜7）に並べる。相手の配置は盤を180度回して奥に置く
  function buildSide(data, placement, side, owned) {
    var units = [], used = {}, cells = {}, stars = 0, ok = [];
    placement.forEach(function (p, i) {
      var piece = data.pieces.filter(function (q) { return q.id === p.id; })[0], star = p.star || 1;
      if (!piece || star < 1 || star > 3 || p.y < 4 || p.y > 7 || p.x < 0 || p.x > 7 || cells[p.x + ',' + p.y] || stars + star > data.starCap) return;
      var k = p.id + '*' + star; used[k] = (used[k] || 0) + 1;
      if (owned && used[k] > starsOf(owned[p.id] || 0)[star]) return;
      cells[p.x + ',' + p.y] = true; stars += star; ok.push({ p: p, i: i, piece: piece, star: star, color: piece.color });
    });
    var counts = colorCounts(data, ok), cb = data.colorBonus || {};
    ok.forEach(function (o) {
      var s = statsOf(o.piece, trialPoints(o.piece, data.trialPoints), data.base, o.star);
      if (cb.need && counts[o.color] >= cb.need) s = applyBonus(s, cb[o.color]);
      var x = side ? 7 - o.p.x : o.p.x, y = side ? 7 - o.p.y : o.p.y;
      var u = makeUnit((side ? 'b' : 'a') + o.i + '-' + o.piece.id, side, x, y, s, o.piece);
      u.star = o.star; u.color = o.color; units.push(u);
    });
    return units;
  }
  function pvpBattle(data, placeA, placeB, ownedA) { return buildSide(data, placeA, 0, ownedA).concat(buildSide(data, placeB, 1)); }
  // 挑戦状のURLに入れる配置の文字列：駒の番号・星・x・y を1体4桁で並べる
  function encodePlacement(data, placement) {
    return placement.map(function (p) {
      var i = data.pieces.map(function (q) { return q.id; }).indexOf(p.id);
      return i < 0 ? '' : '' + i + (p.star || 1) + p.x + p.y;
    }).join('');
  }
  function decodePlacement(data, code) {
    var out = [];
    String(code || '').replace(/[^0-9]/g, '').slice(0, 40).replace(/(\d)(\d)(\d)(\d)/g, function (_, i, star, x, y) {
      var q = data.pieces[+i];
      if (q && +star >= 1 && +star <= 3 && +x <= 7 && +y >= 4 && +y <= 7) out.push({ id: q.id, star: +star, x: +x, y: +y });
      return '';
    });
    return out;
  }

  // 今日の地域：日付から決まる敵の配置。全員が同じ問題に挑む。強すぎ・弱すぎる配置は作り直す
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function randomPlacement(data, r) {
    var ids = data.pieces.map(function (p) { return p.id; }), pl = [], used = {};
    for (var i = 0; i < data.starCap; i++) {
      var k = Math.floor(r() * ids.length), id = ids.splice(k, 1)[0], x, y;
      do { x = Math.floor(r() * 8); y = 4 + Math.floor(r() * 4); } while (used[x + ',' + y]);
      used[x + ',' + y] = true; pl.push({ id: id, x: x, y: y });
    }
    return pl;
  }
  function winRate(data, region, tries, r) {
    var w = 0;
    for (var i = 0; i < tries; i++) if (simulate(trialBattle(data, randomPlacement(data, r), region)).winner === 0) w += 1;
    return w / tries;
  }
  function dailyRegion(data, dateKey) {
    var types = Object.keys(data.wildTypes), colors = ['R', 'G', 'B'], base = hash('triathlon-ban-' + dateKey);
    for (var attempt = 0; attempt < 40; attempt++) {
      var r = rng(base + attempt * 7919), n = 5 + Math.floor(r() * 2), enemies = [], used = {};
      for (var i = 0; i < n; i++) {
        var x, y; do { x = Math.floor(r() * 8); y = Math.floor(r() * 4); } while (used[x + ',' + y]);
        used[x + ',' + y] = true; enemies.push({ type: types[Math.floor(r() * types.length)], x: x, y: y });
      }
      var region = { id: 'daily-' + dateKey, daily: true, date: dateKey, name: '今日の地域', color: colors[Math.floor(r() * 3)], reward: data.pieces[Math.floor(r() * data.pieces.length)].id, enemies: enemies };
      var wr = winRate(data, region, 80, rng(base ^ 0x9e3779b9));
      if (wr >= 0.1 && wr <= 0.45) { region.winRate = wr; return region; }
    }
    region.winRate = wr; return region;
  }

  var api = { pvpBattle: pvpBattle, encodePlacement: encodePlacement, decodePlacement: decodePlacement, W: W, H: H, MAX_OWN: MAX_OWN, starsOf: starsOf, bonusColors: bonusColors, dailyRegion: dailyRegion, winRate: winRate, rng: rng, statsOf: statsOf, trialPoints: trialPoints, damage: damage, attackEvery: attackEvery, moveEvery: moveEvery, simulate: simulate, trialBattle: trialBattle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TriChess = api;
})(typeof window !== 'undefined' ? window : globalThis);
