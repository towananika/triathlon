/* 状態と判定だけを扱う。画面は ui.js に分ける。 */
(function () {
  'use strict';
  var KEY = 'triathlon-day-one-v1', C = window.TRI_DAY_ONE;
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return null; } }
  function start() {
    var t = pick(C.traits);
    return save({ version: 1, day: 1, time: 3, name: pick(C.names), trait: t.id, traitName: t.name, traitLine: t.line, bonds: {}, visited: [], journal: [{ title: '二水に着いた', text: '今日から、この町で暮らしはじめる。' }], finished: false });
  }
  function visit(s, id) {
    if (!s || s.finished || s.time < 1 || s.visited.indexOf(id) >= 0) return s;
    s.currentPlace = id; return save(s);
  }
  function choose(s, id) {
    if (!s || !s.currentPlace || s.finished || s.time < 1) return s;
    var place = C.places.filter(function (p) { return p.id === s.currentPlace; })[0], e = C.encounters[s.currentPlace], o = e.options.filter(function (x) { return x.id === id; })[0];
    if (!place || !o) return s;
    s.time -= 1; s.visited.push(place.id);
    if (o.bond) s.bonds[e.name] = (s.bonds[e.name] || 0) + o.bond;
    var extra = s.trait === 'kind' && id === 'help' ? '　その気づかいは、相手の印象に残った。' : s.trait === 'curious' && id === 'listen' ? '　あとでもう一度確かめたいと思った。' : s.trait === 'steady' && id === 'rest' ? '　無理をしないことも大事だと感じた。' : '';
    s.journal.unshift({ title: place.name + 'で', text: o.effect + extra });
    s.currentPlace = null; if (s.time === 0) s.finished = true; return save(s);
  }
  function nextDay(s) {
    if (!s || !s.finished) return s;
    s.day += 1; s.time = 3; s.visited = []; s.finished = false; s.journal.unshift({ title: s.day + '日目の朝', text: '町は昨日と同じようで、少しだけ違って見える。' }); return save(s);
  }
  window.TriDayOne = { get: load, start: start, visit: visit, choose: choose, nextDay: nextDay, reset: function () { localStorage.removeItem(KEY); } };
})();
