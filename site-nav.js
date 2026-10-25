// 全ページ共通の上部バーとメニュー。<script src="(相対パス)/site-nav.js"></script> を body の先頭に置く。
(function () {
  'use strict';
  var me = document.currentScript;
  if (!me) return;
  var root = me.src.replace(/site-nav\.js(\?.*)?$/, '');
  var ITEMS = [['news/', '📰', 'お知らせ・アップデート'], ['saga/', '📖', 'トライアスロン物語'], ['cast/', '👥', 'キャラ図鑑'], ['settings/', '📋', '設定リスト'],
    ['mall/', '🛍️', 'トライアスロンモール'], ['#simulation', '🏡', '暮らしの試作'], ['#downloads', '📁', '資料・記録'], ['', '🏠', 'トップ']];
  var admin = false; try { admin = !!localStorage.getItem('tri-admin'); } catch (e) {}
  ITEMS.push(admin ? ['dev/', '🛠️', '開発版'] : ['login/', '🔑', '管理者']);
  var path = location.pathname;
  var css = '.tri-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fff;border-bottom:1px solid #cbdedf;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;position:relative;z-index:60}' +
    '.tri-nav .tri-brand{color:#163744;text-decoration:none;font-weight:800;letter-spacing:.08em;font-size:18px;line-height:1.2;display:grid}' +
    '.tri-nav .tri-brand span{font-size:10px;font-weight:600;letter-spacing:.12em;color:#007f87}' +
    '.tri-menu{position:relative}.tri-menu summary{list-style:none;cursor:pointer;white-space:nowrap;padding:8px 12px;border:1px solid #cbdedf;border-radius:999px;font-size:13px;font-weight:700;color:#163744;background:#fff}' +
    '.tri-menu summary::-webkit-details-marker{display:none}.tri-menu[open] summary{border-color:#007f87;color:#007f87}' +
    '.tri-menu nav{position:absolute;right:0;top:calc(100% + 8px);display:flex;flex-direction:column;min-width:220px;padding:6px;background:#fff;border:1px solid #cbdedf;border-radius:12px;box-shadow:0 10px 30px rgba(22,55,68,.16)}' +
    '.tri-menu nav a{display:block;padding:12px;border-radius:8px;color:#163744;text-decoration:none;font-size:14px;font-weight:600;white-space:nowrap}' +
    '.tri-menu nav a:hover{background:#edf5f4;color:#007f87}.tri-menu nav a[aria-current="page"]{background:#e3f1f1;color:#007f87}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  var bar = document.createElement('div');
  bar.className = 'tri-nav';
  bar.innerHTML = '<a class="tri-brand" href="' + root + '">TRIATHLON<span>SAME EARTH. DIFFERENT FUTURE.</span></a>' +
    '<details class="tri-menu"><summary aria-label="メニュー">☰ メニュー</summary><nav aria-label="サイトのページ">' +
    ITEMS.map(function (it) {
      var href = root + it[0], cur = it[0] && it[0].charAt(0) !== '#' && path.indexOf(new URL(href).pathname) === 0;
      return '<a href="' + href + '"' + (cur ? ' aria-current="page"' : '') + '>' + it[1] + ' ' + it[2] + '</a>';
    }).join('') + '</nav></details>';
  document.body.insertBefore(bar, document.body.firstChild);
  document.addEventListener('click', function (e) {
    var m = bar.querySelector('.tri-menu');
    if (m.open && (!m.contains(e.target) || e.target.closest('nav a'))) m.open = false;
  });
})();
