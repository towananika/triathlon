/* 光さがしの画面。計算は engine.js。 */
(function () {
  'use strict';
  var H = window.TriHikari, KEY = 'tri-hikari-v1', SYNC = 'https://hibiki-sync.jaykim-can.workers.dev/hikari/';
  var COL = { R: 'var(--r)', G: 'var(--g)', B: 'var(--b)' };
  var app = document.getElementById('app');
  var state = load(), open = null, line = '', syncNote = 'この端末に保存しています', wipeAsk = false, timer = null;

  function load() { try { return H.clean(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) { return H.empty(); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function today() { return H.dayKey(new Date()); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function call(path, body) {
    if (!window.TRI_USER || !window.triToken) return Promise.reject(new Error('login'));
    return window.triToken().then(function (tk) {
      return fetch(SYNC + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk }, body: JSON.stringify(body || {}) });
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function sync() {
    if (!window.TRI_USER) return;
    call('sync', { state: state }).then(function (out) {
      state = H.merge(state, out.state); save(); syncNote = 'ログイン中・記録は本人の箱にたまっています'; draw();
    }).catch(function () { syncNote = 'ログイン中・いまはこの端末に保存しています（あとで送ります）'; draw(); });
  }
  function later() { clearTimeout(timer); timer = setTimeout(sync, 1200); }
  function change(next) { state = next; save(); draw(); later(); }

  function map(rank) {
    var cx = 150, cy = 120, R = 95, pts = [], dots = '', labels = '';
    var order = H.LIGHTS.map(function (l) { return rank.filter(function (x) { return x.id === l.id; })[0]; });
    order.forEach(function (x, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 9, v = 0.12 + 0.88 * x.m.score;
      var px = cx + Math.cos(a) * R * v, py = cy + Math.sin(a) * R * v;
      pts.push(px.toFixed(1) + ',' + py.toFixed(1));
      dots += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + (x.m.n ? 5 : 3) + '" fill="' + COL[x.c] + '"/>';
      var lx = cx + Math.cos(a) * (R + 20), ly = cy + Math.sin(a) * (R + 16) + 4;
      labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '">' + esc(x.name) + '</text>';
    });
    var ring = function (k) { return H.LIGHTS.map(function (_, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 9; return (cx + Math.cos(a) * R * k).toFixed(1) + ',' + (cy + Math.sin(a) * R * k).toFixed(1); }).join(' '); };
    return '<svg viewBox="0 0 300 245" role="img" aria-label="光の地図（直近4週）"><g fill="none" stroke="rgba(243,239,228,.18)"><polygon points="' + ring(1) + '"/><polygon points="' + ring(.55) + '"/></g>' +
      '<polygon points="' + pts.join(' ') + '" fill="rgba(243,239,228,.13)" stroke="#f3efe4" stroke-width="1.5"/>' + dots +
      '<g font-size="11" fill="#f3efe4" text-anchor="middle">' + labels + '</g></svg>';
  }

  function draw() {
    var t = today(), day = (state.days[t] || { a: {} }).a, rank = H.ranked(state, t), tries = H.weekTries(state, t), any = rank[0].m.n > 0;
    var h = '<section class="hero"><h1>光さがし</h1><p>今日やったことを押すだけ。たまると、自分の光が見えてくる。</p>' + map(rank) +
      '<p class="cap">' + (any ? 'あなたの光の地図（直近4週・記録した日 ' + H.daysRecorded(state) + '日）' : 'まだ光っていません。下から1つ押してみよう') + '</p></section>';
    var u = window.TRI_USER;
    h += '<div class="acct"><span><span class="dot' + (u ? ' on' : '') + '"></span>' + esc(u ? syncNote : 'ログインすると、記録が端末をまたいでたまります') + '</span>' +
      (u ? '' : '<button type="button" id="login">ログイン</button>') + '</div>';

    h += '<section><h2>今日やったこと</h2><div class="grid">' + H.LIGHTS.map(function (l) {
      var r = day[l.id];
      return '<button type="button" class="light ' + l.c + (r ? ' on' : '') + '" data-l="' + l.id + '">' + (r && r.s ? '<span class="star">★</span>' : '') + esc(l.name) + '<small>' + (r ? H.FACES[r.f] : '') + '</small></button>';
    }).join('') + '</div></section>';

    if (open) {
      var r = day[open] || {}, l = H.LIGHTS.filter(function (x) { return x.id === open; })[0];
      h += '<section class="pick"><b>' + esc(l.name) + '：どうだった？</b><div class="faces">' + [3, 2, 1].map(function (f) {
        return '<button type="button" data-f="' + f + '"' + (r.f === f ? ' class="on"' : '') + '>' + H.FACES[f] + '</button>';
      }).join('') + '</div><div class="row"><button type="button" class="starbtn' + (r.s ? ' on' : '') + '" data-star>★ うまくいった</button>' +
        (r.f ? '<button type="button" class="starbtn" data-del>外す</button>' : '') + '</div></section>';
    }
    if (line) h += '<p class="bubble"><b>アカリ</b>　' + esc(line) + '</p>';

    h += '<section><h2>今週のためし</h2><p class="sub">5〜10分でできること。やらなくても、何も減りません。</p><div class="tries" style="margin-top:8px">' + tries.list.map(function (x) {
      var c = x.kind === 'grow' ? 'var(--r)' : x.kind === 'find' ? 'var(--w)' : 'var(--g)';
      return '<button type="button" class="try' + (x.done ? ' done' : '') + '" data-t="' + x.kind + '"><span class="k" style="color:' + c + '">' + x.label + '</span><span>' + esc(x.text) + '</span><span class="ck">' + (x.done ? '✓' : '') + '</span></button>';
    }).join('') + '</div></section>';

    h += '<section><h2>いまの記録で光っている所</h2>';
    if (!any) h += '<p class="sub">記録がたまると、ここに上位3つが出ます。</p>';
    else {
      h += '<div class="top">' + rank.filter(function (x) { return x.m.n; }).slice(0, 3).map(function (x) {
        return '<div><b style="color:' + COL[x.c] + '">' + esc(x.name) + '</b>　<span class="sub">' + x.m.n + '回</span>' +
          [['たのしい', x.m.fun, 'var(--r)'], ['軽い', x.m.easy, 'var(--g)'], ['うまくいった', x.m.good, 'var(--b)'], ['続く', x.m.keep, 'var(--w)']].map(function (m) {
            return '<div class="mrow"><span>' + m[0] + '</span><div class="bar"><i style="width:' + Math.round(m[1] * 100) + '%;background:' + m[2] + '"></i></div><span class="sub">' + Math.round(m[1] * 100) + '</span></div>';
          }).join('') + '</div>';
      }).join('') + '</div><p class="sub" style="margin-top:8px">一度の記録で決めつけません。4週ためると、形が見えてきます。</p>';
    }
    h += '</section>';
    h += '<section><p class="sub">記録はあなただけが見られます。運営も中身は見ません。</p>' +
      (wipeAsk ? '<div class="row" style="margin-top:8px"><button type="button" class="btn" data-wipe-yes>すべて消す</button><button type="button" class="btn" data-wipe-no>やめる</button></div>'
        : '<button type="button" class="wipe" data-wipe>記録をすべて消す</button>') + '</section>';
    app.innerHTML = h;
  }

  app.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = today(), day = (state.days[t] || { a: {} }).a;
    if (b.id === 'login') { window.triLogin && window.triLogin('google'); return; }
    if (b.dataset.l) { open = open === b.dataset.l ? null : b.dataset.l; line = ''; draw(); return; }
    if (b.dataset.f && open) { var f = +b.dataset.f, s = day[open] && day[open].s; line = H.akari(open, f, false); change(H.record(state, t, open, f, s)); return; }
    if (b.hasAttribute('data-star') && open) { var cur = day[open] || { f: 2 }, ns = !cur.s; line = ns ? H.akari(open, cur.f, true) : ''; change(H.record(state, t, open, cur.f, ns)); return; }
    if (b.hasAttribute('data-del') && open) { line = ''; var id = open; open = null; change(H.record(state, t, id, 0)); return; }
    if (b.dataset.t) { change(H.toggleTry(state, t, b.dataset.t)); return; }
    if (b.hasAttribute('data-wipe')) { wipeAsk = true; draw(); return; }
    if (b.hasAttribute('data-wipe-no')) { wipeAsk = false; draw(); return; }
    if (b.hasAttribute('data-wipe-yes')) {
      wipeAsk = false; state = H.empty(); open = null; line = ''; save(); draw();
      if (window.TRI_USER) call('wipe').then(function () { syncNote = '記録を消しました'; draw(); }).catch(function () {});
    }
  });
  document.addEventListener('tri-user', function () { draw(); sync(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(); });
  draw();
})();
