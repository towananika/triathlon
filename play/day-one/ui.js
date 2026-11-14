/* 画面だけを扱う。 */
(function () {
  'use strict';
  var C = window.TRI_DAY_ONE, E = window.TriDayOne, app = document.getElementById('app');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function getPlace(id) { return C.places.filter(function (p) { return p.id === id; })[0]; }
  function intro() {
    app.innerHTML = '<section class="intro card"><p class="eyebrow">FIRST PLAYABLE · v0.102</p><h1>ひとりの人生から、世界が始まる。</h1><p>あなたは二水に住む、まだ名前も知られていない一人です。町を歩き、人と会い、今日の記録を残します。</p><button class="primary" id="start" type="button">ランダムな人生を受け取る</button><p class="local-note">この試作の記録は、この端末にだけ保存されます。</p></section>';
    document.getElementById('start').addEventListener('click', function () { render(E.start()); });
  }
  function journal(s) { return '<section class="card journal"><h2>今日の記録</h2><ol>' + s.journal.slice(0, 4).map(function (j) { return '<li><b>' + esc(j.title) + '</b><span>' + esc(j.text) + '</span></li>'; }).join('') + '</ol></section>'; }
  function placeCard(s, p) {
    var done = s.visited.indexOf(p.id) >= 0, disabled = done || s.time === 0 ? ' disabled' : '';
    return '<button class="place" style="--place:' + p.color + '" data-place="' + p.id + '"' + disabled + '><span class="place-icon" aria-hidden="true">' + p.icon + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.district) + ' · ' + (done ? '今日は行った' : p.intro) + '</small></span><em>' + (done ? '✓' : '行く →') + '</em></button>';
  }
  function encounter(s) {
    var place = getPlace(s.currentPlace), e = C.encounters[place.id];
    return '<section class="card encounter"><p class="eyebrow">' + esc(place.district) + '</p><h2>' + esc(place.name) + '</h2><p>' + esc(place.intro) + '</p><div class="person"><span>●</span><div><b>' + esc(e.name) + '</b><small>あなたの前にいる人</small></div></div><p class="ask">今のあなたは、どうする？</p><div class="choices">' + e.options.map(function (o) { return '<button data-choice="' + o.id + '" type="button">' + esc(o.label) + '<span>→</span></button>'; }).join('') + '</div></section>';
  }
  function render(s) {
    if (!s) { intro(); return; }
    var hint = s.finished ? '今日は、ここまで。' : 'あと ' + s.time + ' 回、行動できる';
    app.innerHTML = '<header class="game-head"><a href="../../" class="back">← TRIATHLON</a><p>二水 · ' + s.day + '日目</p></header><section class="card identity"><div class="avatar" aria-hidden="true">' + esc(s.name.slice(0, 1)) + '</div><div><p class="eyebrow">あなたのキャラクター</p><h1>' + esc(s.name) + '</h1><p class="trait">' + esc(s.traitName) + '</p></div><blockquote>「' + esc(s.traitLine) + '」</blockquote></section><section class="status"><b>' + hint + '</b><span aria-label="残り行動数">' + [0, 1, 2].map(function (n) { return '<i class="' + (n < s.time ? 'on' : '') + '"></i>'; }).join('') + '</span></section>' + (s.currentPlace ? encounter(s) : '<section class="card map"><div class="section-title"><div><p class="eyebrow">NISUI · MORNING</p><h2>今日は、どこへ行く？</h2></div><p>一度に一つだけ</p></div><div class="places">' + C.places.map(function (p) { return placeCard(s, p); }).join('') + '</div></section>') + (s.finished ? '<section class="card finish"><h2>今日の一日が終わった。</h2><p>あなたが選んだことは、この町で出会った人と、あなた自身の記録に残ります。</p><button class="primary" id="next" type="button">次の日へ</button></section>' : '') + journal(s);
    app.querySelectorAll('[data-place]').forEach(function (b) { b.addEventListener('click', function () { render(E.visit(s, b.dataset.place)); }); });
    app.querySelectorAll('[data-choice]').forEach(function (b) { b.addEventListener('click', function () { render(E.choose(s, b.dataset.choice)); }); });
    var next = document.getElementById('next'); if (next) next.addEventListener('click', function () { render(E.nextDay(s)); });
  }
  render(E.get());
})();
