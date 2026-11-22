/* 戦闘の計算だけを扱う。運の要素はなく、同じ入力なら必ず同じ結果になる。画面は ui.js。 */
(function (root) {
  'use strict';
  var W = 8, H = 8, TICK = 0.1, LIMIT = 600; // 0.1秒ごとに進め、最長60秒

  // R・G・B のポイントから戦闘用の数値を作る
  function statsOf(piece, points, base) {
    var R = points.R || 0, G = points.G || 0, B = points.B || 0;
    return {
      hp: base.hp + R * piece.R[0], atk: base.atk + R * piece.R[1], def: base.def + R * piece.R[2],
      ats: G * piece.G[0], spd: base.spd + G * piece.G[1],
      mag: B * piece.B[0], res: base.res + B * piece.B[1], range: piece.range
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
  function nearest(u, units) {
    var best = null;
    units.forEach(function (o) {
      if (o.side === u.side || o.hp <= 0) return;
      if (!best) { best = o; return; }
      var d = dist(u, o), bd = dist(u, best);
      if (d < bd || (d === bd && (Math.abs(o.y - u.y) < Math.abs(best.y - u.y) ||
        (Math.abs(o.y - u.y) === Math.abs(best.y - u.y) && (o.x < best.x || (o.x === best.x && o.id < best.id)))))) best = o;
    });
    return best;
  }
  var STEPS = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  function stepToward(u, t, units) {
    var best = null, bd = dist(u, t);
    STEPS.forEach(function (s) {
      var x = u.x + s[0], y = u.y + s[1];
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      if (units.some(function (o) { return o.hp > 0 && o.x === x && o.y === y; })) return;
      var d = dist({ x: x, y: y }, t);
      if (d < bd) { bd = d; best = { x: x, y: y }; }
    });
    if (best) { u.x = best.x; u.y = best.y; return true; }
    return false;
  }
  function snapshot(units) {
    return units.map(function (u) { return { id: u.id, x: u.x, y: u.y, hp: u.hp }; });
  }

  // units: makeUnit の配列。side 0 = 攻める側（手前）、1 = 守る側（奥）
  function simulate(units) {
    units = units.map(function (u) { return Object.assign({}, u); }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    var frames = [snapshot(units)], events = [], tick = 0, winner = null;
    function alive(side) { return units.some(function (u) { return u.side === side && u.hp > 0; }); }
    while (tick < LIMIT) {
      tick += 1;
      var ev = [];
      units.forEach(function (u) {
        if (u.hp <= 0) return;
        if (u.atkWait > 0) u.atkWait -= 1;
        if (u.moveWait > 0) u.moveWait -= 1;
        var t = nearest(u, units);
        if (!t) return;
        if (dist(u, t) <= u.range) {
          if (u.atkWait > 0) return;
          var dmg = u.magic ? damage(u.mag, t.res) : damage(u.atk, t.def);
          t.hp = Math.max(0, t.hp - dmg); u.atkWait = u.atkEvery;
          ev.push({ type: 'hit', from: u.id, to: t.id, amount: dmg });
          if (t.hp === 0) ev.push({ type: 'down', id: t.id });
          if (u.heal) { // クレリック：攻撃のたびに、射程内でHPの割合が一番低い味方を魔力の半分だけ回復
            var ally = null;
            units.forEach(function (o) {
              if (o.side !== u.side || o.hp <= 0 || o.hp >= o.maxHp || dist(u, o) > u.range) return;
              if (!ally || o.hp / o.maxHp < ally.hp / ally.maxHp) ally = o;
            });
            if (ally) { var h = Math.min(ally.maxHp - ally.hp, Math.max(1, Math.floor(u.mag / 2))); ally.hp += h; ev.push({ type: 'heal', from: u.id, to: ally.id, amount: h }); }
          }
        } else if (u.moveWait === 0) {
          if (stepToward(u, t, units)) u.moveWait = u.moveEvery;
        }
      });
      frames.push(snapshot(units)); events.push(ev);
      var a = alive(0), d = alive(1);
      if (!a || !d) { winner = a ? 0 : d ? 1 : -1; break; }
    }
    if (winner === null) winner = 1; // 時間切れは守る側の勝ち
    return { winner: winner, ticks: tick, seconds: Math.round(tick * TICK * 10) / 10, frames: frames, events: events, units: units };
  }

  // 最初の1戦を組み立てる。placement: [{id, x, y}]（自陣は y=4〜7）
  function trialBattle(data, placement) {
    var units = [];
    placement.slice(0, 5).forEach(function (p) {
      var piece = data.pieces.filter(function (q) { return q.id === p.id; })[0];
      if (!piece || p.y < 4 || p.y > 7 || p.x < 0 || p.x > 7) return;
      units.push(makeUnit('a-' + piece.id, 0, p.x, p.y, statsOf(piece, trialPoints(piece, data.trialPoints), data.base), piece));
    });
    data.trial.enemies.forEach(function (e, i) {
      var w = data.wildTypes[e.type];
      units.push(makeUnit('d-' + i + '-' + e.type, 1, e.x, e.y, w, w));
    });
    return units;
  }

  var api = { W: W, H: H, statsOf: statsOf, trialPoints: trialPoints, damage: damage, attackEvery: attackEvery, moveEvery: moveEvery, simulate: simulate, trialBattle: trialBattle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TriChess = api;
})(typeof window !== 'undefined' ? window : globalThis);
