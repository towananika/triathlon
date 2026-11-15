/* 家：今日の記録を集めることと、足あとの保存だけ（画面に依存しない）。 */
(function (root) {
  'use strict';
  var KEY = 'triathlon-nisui-walk-steps-v1', HOME = { x: -6, z: 8 };
  function today(s) {
    var out = [];
    for (var i = 0; i < s.journal.length; i++) { var j = s.journal[i]; out.push(j); if (/日目の朝$|^二水に着いた$/.test(j.title)) break; }
    return out.reverse();
  }
  function atHome(pos) { return Math.hypot(pos.x - HOME.x, pos.z - HOME.z) <= 1.8; }
  function loadSteps(store, day) {
    try { var v = JSON.parse(store.getItem(KEY) || 'null'); return v && v.day === day - 1 ? v.steps : []; } catch (_) { return []; }
  }
  function saveSteps(store, day, steps) {
    try { store.setItem(KEY, JSON.stringify({ day: day, steps: steps.map(function (p) { return { x: +p.x.toFixed(2), z: +p.z.toFixed(2) }; }) })); } catch (_) {}
  }
  root.NisuiHome = { HOME: HOME, today: today, atHome: atHome, loadSteps: loadSteps, saveSteps: saveSteps };
})(typeof window !== 'undefined' ? window : globalThis);
