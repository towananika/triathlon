(function (root) {
  'use strict';
  function outcome(units, tick, limit) {
    var alive = [0, 1].map(function (side) {
      return units.some(function (u) { return u.side === side && u.lead && !u.down && u.hp > 0; });
    });
    if (!alive[0] && !alive[1]) return { winner: -1, reason: 'double-capture' };
    if (!alive[1]) return { winner: 0, reason: 'capture' };
    if (!alive[0]) return { winner: 1, reason: 'capture' };
    if (tick >= limit) return { winner: -1, reason: 'timeout' };
    return null;
  }
  root.TRI_SQUAD_RULES = { outcome: outcome };
})(typeof window !== 'undefined' ? window : globalThis);
