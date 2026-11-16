/* 光さがし：記録・まぜる・メーター・今週のためし。画面に依存しない（engine.test.cjs で確かめる）。 */
(function (root) {
  'use strict';
  var LIGHTS = [
    { id: 'move', c: 'R', name: '動く', tries: ['知らない道を10分歩く', '階段を選んで上る', 'ストレッチを5分'] },
    { id: 'make', c: 'R', name: '手で作る', tries: ['料理を1品作る', '紙で小さな物を折る', '植物の世話をする'] },
    { id: 'care', c: 'R', name: '守る・支える', tries: ['部屋の1か所を整える', 'だれかの用事を1つ手伝う', '明日の準備を先にする'] },
    { id: 'talk', c: 'G', name: '話す', tries: ['今日のことを1人に話す', '久しぶりの人に一言送る', 'お店の人に一言かける'] },
    { id: 'teach', c: 'G', name: '教える', tries: ['学んだことを3行で教える', '知っているコツを1つ書く', '聞かれたことに丁寧に答える'] },
    { id: 'out', c: 'G', name: '外へ出る', tries: ['行ったことのない店へ', '一駅ぶん歩いてみる', '近くの催しをのぞく'] },
    { id: 'learn', c: 'B', name: '調べる', tries: ['気になることを10分調べる', '知らない言葉を1つ調べる', '動画を1本見て要点を書く'] },
    { id: 'sort', c: 'B', name: '整理する', tries: ['ファイルを1つ片づける', '予定を1枚にまとめる', '持ち物を1か所見直す'] },
    { id: 'idea', c: 'B', name: '考えて作る', tries: ['アイデアを1枚に描く', '小さな計画を1つ立てる', '短い文を1つ書く'] }
  ];
  var REST = ['10分の散歩', 'いつもより30分早く寝る', '朝ごはんを1品', '画面を見ない時間を15分', '寝る前によかったこと3つ'];
  var FACES = { 3: 'たのしい', 2: 'ふつう', 1: 'つかれた' };
  var DAY = /^\d{4}-\d{2}-\d{2}$/;
  var byId = {}; LIGHTS.forEach(function (l) { byId[l.id] = l; });

  function empty() { return { v: 1, days: {}, tries: {} }; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(key, n) { var p = key.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return dayKey(d); }
  function weekKey(key) { var p = key.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); var back = (d.getDay() + 6) % 7; return addDays(key, -back); }
  function clean(s) {
    var out = empty();
    if (!s || typeof s !== 'object') return out;
    Object.keys(s.days || {}).forEach(function (k) {
      var d = s.days[k]; if (!DAY.test(k) || !d || typeof d.t !== 'number') return;
      var a = {}; Object.keys(d.a || {}).forEach(function (id) { var r = d.a[id]; if (byId[id] && r && FACES[r.f]) a[id] = { f: r.f, s: !!r.s }; });
      out.days[k] = { t: d.t, a: a };
    });
    Object.keys(s.tries || {}).forEach(function (k) {
      var w = s.tries[k]; if (!DAY.test(k) || !w || typeof w.t !== 'number') return;
      out.tries[k] = { t: w.t, done: (Array.isArray(w.done) ? w.done : []).filter(function (x) { return ['grow', 'find', 'rest'].indexOf(x) >= 0; }) };
    });
    return out;
  }
  // 日ごと・週ごとに、新しいほうが勝つ（端末をまたいでも両方の日が残る）
  function merge(a, b) {
    a = clean(a); b = clean(b);
    var out = empty();
    ['days', 'tries'].forEach(function (part) {
      Object.keys(a[part]).concat(Object.keys(b[part])).forEach(function (k) {
        var x = a[part][k], y = b[part][k];
        out[part][k] = !x ? y : !y ? x : (y.t > x.t ? y : x);
      });
    });
    return out;
  }
  // face: 1〜3。0 なら外す
  function record(s, key, id, face, star, now) {
    s = clean(s); if (!byId[id]) return s;
    var d = s.days[key] || { t: 0, a: {} };
    var a = Object.assign({}, d.a);
    if (face) a[id] = { f: face, s: !!star }; else delete a[id];
    s.days[key] = { t: now || Date.now(), a: a };
    return s;
  }
  // 直近 n 日の光ごとの4つのメーター（0〜1）
  function meters(s, today, n) {
    s = clean(s); n = n || 28;
    var res = {}; LIGHTS.forEach(function (l) { res[l.id] = { n: 0, fun: 0, easy: 0, good: 0, keep: 0, score: 0 }; });
    for (var i = 0; i < n; i++) {
      var d = s.days[addDays(today, -i)]; if (!d) continue;
      Object.keys(d.a).forEach(function (id) {
        var r = d.a[id], m = res[id]; m.n++;
        if (r.f === 3) m.fun++; if (r.f !== 1) m.easy++; if (r.s) m.good++;
      });
    }
    LIGHTS.forEach(function (l) {
      var m = res[l.id]; if (!m.n) return;
      m.fun /= m.n; m.easy /= m.n; m.good /= m.n; m.keep = Math.min(1, m.n / 8);
      m.score = (m.fun + m.easy + m.good + m.keep) / 4;
    });
    return res;
  }
  function ranked(s, today) {
    var m = meters(s, today);
    return LIGHTS.map(function (l) { return { id: l.id, name: l.name, c: l.c, m: m[l.id] }; })
      .sort(function (x, y) { return y.m.score - x.m.score || y.m.n - x.m.n; });
  }
  function hash(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  // 今週のためし：伸ばす1つ・見つける1つ・整える1つ（週の中では変わらない）
  function weekTries(s, today) {
    var w = weekKey(today), h = hash(w), r = ranked(s, w);
    var grow = r[0].m.n ? byId[r[0].id] : byId[LIGHTS[h % LIGHTS.length].id];
    var unseen = r.filter(function (x) { return !x.m.n && x.id !== grow.id; });
    var pool = unseen.length ? unseen : r.slice().reverse().filter(function (x) { return x.id !== grow.id; }).slice(0, 3);
    var find = byId[pool[h % pool.length].id];
    var t = clean(s).tries[w], done = t ? t.done : [];
    return {
      week: w,
      list: [
        { kind: 'grow', label: '伸ばす', light: grow.id, text: grow.tries[h % 3], done: done.indexOf('grow') >= 0 },
        { kind: 'find', label: '見つける', light: find.id, text: find.tries[(h >> 3) % 3], done: done.indexOf('find') >= 0 },
        { kind: 'rest', label: '整える', light: null, text: REST[h % REST.length], done: done.indexOf('rest') >= 0 }
      ]
    };
  }
  function toggleTry(s, today, kind, now) {
    s = clean(s); var w = weekKey(today);
    var done = (s.tries[w] ? s.tries[w].done : []).slice(), i = done.indexOf(kind);
    if (i >= 0) done.splice(i, 1); else done.push(kind);
    s.tries[w] = { t: now || Date.now(), done: done };
    return s;
  }
  function akari(id, face, star) {
    var l = byId[id]; if (!l) return '';
    if (star) return '「' + l.name + '」、うまくいったんだね。覚えておくよ。';
    if (face === 3) return l.name + 'のとき、いい顔してたね。';
    if (face === 1) return 'おつかれさま。' + l.name + 'は、少し休んでからでいいよ。';
    return l.name + '、今日もやったんだね。';
  }
  function daysRecorded(s) { return Object.keys(clean(s).days).filter(function (k) { return Object.keys(s.days[k].a || {}).length; }).length; }

  root.TriHikari = { LIGHTS: LIGHTS, FACES: FACES, empty: empty, dayKey: dayKey, addDays: addDays, weekKey: weekKey, clean: clean, merge: merge, record: record, meters: meters, ranked: ranked, weekTries: weekTries, toggleTry: toggleTry, akari: akari, daysRecorded: daysRecorded };
})(typeof window !== 'undefined' ? window : globalThis);
