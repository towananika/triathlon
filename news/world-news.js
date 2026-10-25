(function (root) {
  'use strict';
  var CHARACTERS = ['アカリ', 'シオン', 'ツバサ', 'シズク', 'カイ', 'ミナト', 'リク', 'ルイ', 'セイラ'];
  function article(id, day, kind, title, body, extra) {
    return Object.assign({ id: id, day: day, kind: kind, title: title, body: body, public: true }, extra);
  }
  function build(sim, day) {
    if (!Number.isInteger(day) || day < 0) throw new RangeError('Invalid world day');
    var entries = [article('akari-ep01', 0, 'voice', 'アカリ、川守隊への思い', '「入る。一番強い人が入るとこでしょ、あそこ」', {
      person: 'アカリ', place: '渡口洞', source: '第1話「一発いこ」・渡し舟の朝', href: '../stories/v.html?id=1', record: '物語から'
    })];
    if (!sim) return entries;
    var run = sim.run(day, Math.min(day + 1, 30));
    var first = run.hist[0], last = run.hist[run.hist.length - 1];
    var population = run.state.prov.reduce(function (n, p) { return n + p.pop; }, 0);
    entries.push(article('world-summary-' + day, day, 'change', '3か国の暮らしの現在地',
      '10州の人口は合計約' + Math.round(population).toLocaleString('ja-JP') + '万人。開拓地は' + run.state.col.length + 'か所、知られるようになった文明は' + run.state.civ.filter(function (c) { return c.known; }).length + 'つです。',
      { place: '世界', source: '世界シミュレーション・当日集計', record: 'ルール式の計算結果' }));
    if (first && last && first.d < last.d) {
      var before = first.prov.reduce(function (n, p) { return n + p.pop; }, 0);
      var after = last.prov.reduce(function (n, p) { return n + p.pop; }, 0);
      var delta = Math.round((after - before) * 10000);
      entries.push(article('population-' + day, day, 'change', '人口の変化',
        sim.wdate(first.d).label + 'から' + sim.wdate(last.d).label + 'までに、10州の人口は約' + Math.abs(delta).toLocaleString('ja-JP') + '人' + (delta < 0 ? '減りました。' : delta > 0 ? '増えました。' : 'で、変化はありませんでした。'),
        { place: '世界', source: '世界シミュレーション・直近30日以内の比較', record: 'ルール式の計算結果' }));
    }
    run.log.forEach(function (log) {
      log.ev.forEach(function (event, index) {
        if (!/^(exp|civ|prov|town|weather|development)$/.test(event.k)) return;
        entries.push(article('event-' + log.d + '-' + index, log.d, 'change', event.t, '', {
          place: event.where || '世界', source: '世界シミュレーション・日次記録', record: 'ルール式の計算結果'
        }));
      });
    });
    return entries.sort(function (a, b) { return b.day - a.day; });
  }
  function read(entries, options) {
    options = options || {};
    if (!Number.isInteger(options.asOf) || options.asOf < 0) throw new RangeError('asOf is required');
    if (options.character && CHARACTERS.indexOf(options.character) < 0) throw new RangeError('Unknown character');
    return entries.filter(function (item) {
      return item.public === true && Number.isInteger(item.day) && item.day <= options.asOf && /^(voice|change)$/.test(item.kind);
    }).map(function (item) {
      // Only allow published news fields through; never pass administrative data or hidden state.
      var out = {};
      ['id', 'day', 'kind', 'title', 'body', 'person', 'place', 'source', 'record'].forEach(function (key) { if (item[key] !== undefined) out[key] = item[key]; });
      return out;
    });
  }
  root.TRI_WORLD_NEWS = { characters: CHARACTERS.slice(), build: build, read: read };
  if (typeof module === 'object' && module.exports) module.exports = root.TRI_WORLD_NEWS;
})(typeof window !== 'undefined' ? window : globalThis);
