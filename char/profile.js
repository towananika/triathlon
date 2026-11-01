(function () {
  'use strict';
  var main = document.getElementById('main');
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function name(c) { return (SEED[c.id] || {}).name || '？'; }
  function link(c) { return 'c.html?id=' + encodeURIComponent(c.id); }
  function fact(k, v) { return v ? '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>' : ''; }
  var list = CHARS.filter(function (c) { return c.s === 1; });
  var id = new URLSearchParams(location.search).get('id');
  var index = id ? list.findIndex(function (c) { return c.id === id; }) : 0;
  if (index < 0) {
    document.title = 'キャラクターが見つかりません | TRIATHLON';
    main.innerHTML = '<h1>キャラクターが見つかりません</h1><a class="back-link" href="./">キャラクター一覧へ戻る</a>';
    return;
  }
  var c = list[index], n = name(c), intro = window.TRI_INTRODUCTIONS[c.id];
  var text = TEXT[c.id] || {}, persona = (window.TRI_PERSONA || {})[n];
  document.title = n + ' | TRIATHLON';
  document.querySelector('meta[name="description"]').content = intro.about;
  var friends = list.filter(function (other) { return other.id !== c.id && (text.rel || '').indexOf(name(other)) >= 0; });
  var place = (window.TRI_PLACES || []).find(function (p) { return p.who === n; });
  var stories = (window.TRI_STORIES || []).filter(function (s) {
    return s.who === n || (s.secs || []).some(function (section) { return (section.p || []).join('').indexOf(n) >= 0; });
  });
  var h = '<a class="back-link" href="./">← キャラクター一覧</a><header class="profile-heading"><p class="class-name">' + esc(c.cls) + '</p><h1>' + esc(n) + '</h1></header>';
  h += '<div class="profile-layout"><figure class="profile-art"><div class="portrait"><img src="' + esc(intro.image) + '" alt="' + esc(n) + 'の全身イメージ" width="1024" height="1536" decoding="async" fetchpriority="high"></div><figcaption>現在のキャラクターイメージ</figcaption></figure><div class="profile-copy">';
  h += '<p class="lead">' + esc(intro.lead) + '</p><p class="profile-about">' + esc(intro.about) + '</p>';
  if (persona) h += '<div class="traits">' + persona.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
  h += '<section class="profile-section"><h2>この人が望むこと</h2><p>' + esc(text.wish) + '</p><p>「' + esc(text.say) + '」</p></section>';
  h += '<section class="profile-section"><h2>好きな時間</h2><p>' + esc(intro.moment) + '</p><dl class="fact-list">' + fact('好き', text.like) + fact('苦手', text.dislike) + '</dl>';
  if (place) h += '<a class="back-link" href="../places/#' + esc(place.id) + '">' + esc(place.place) + 'へ →</a>';
  h += '</section>';
  h += '<section class="profile-section"><h2>仲間とのつながり</h2><p>' + esc(text.rel) + '</p><div class="friend-links">' + friends.map(function (other) { return '<a href="' + link(other) + '">' + esc(name(other)) + ' →</a>'; }).join('') + '</div></section>';
  h += '<section class="profile-section"><h2>登場する物語</h2>';
  h += stories.length ? '<ul class="story-links">' + stories.map(function (s) { return '<li><a href="../stories/v.html?id=' + encodeURIComponent(s.id) + '"><small>第' + esc(s.no) + '話 · ' + esc(s.who) + '</small><b>' + esc(s.title) + ' →</b></a></li>'; }).join('') + '</ul>' : '<p class="empty">この人の物語は、これから。</p>';
  h += '</section><details class="more-profile profile-section"><summary>プロフィールをもう少し</summary><dl class="fact-list">' + fact('一人称', text.me) + fact('身長感', intro.height) + fact('弱いところ', text.weak) + (persona ? fact('話し方', persona.speech) + fact('ほっとする', persona.calm) : '') + '</dl></details>';
  h += '<div class="friend-links profile-section"><a href="../album/?who=' + encodeURIComponent(n) + '">思い出のアルバム →</a><a href="../watch/">今日を見守る →</a></div></div></div>';
  var previous = list[(index + list.length - 1) % list.length], next = list[(index + 1) % list.length];
  h += '<nav class="profile-nav" aria-label="キャラクターを移動"><a href="' + link(previous) + '">← ' + esc(name(previous)) + '</a><a href="./">9人の一覧</a><a href="' + link(next) + '">' + esc(name(next)) + ' →</a></nav>';
  main.className = 'profile-main ' + c.c;
  main.innerHTML = h;
})();
