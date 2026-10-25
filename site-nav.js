// 全ページ共通の上部バー・下のメニュー・サイトの字。<script src="(相対パス)/site-nav.js"></script> を body の先頭に置く。
// よくあるゲーム公式サイトの形：左にロゴ、まん中にメニュー、右に「ログイン」と「プレイ」。スマホは右上の ☰ と、指の届く下のタブ。
// 下のタブはホーム・お知らせ・プレイ（まん中）・物語・キャラ。そのほかは ☰ にまとめる。ページの下には共通のフッターを出す。
// サイトの字（見出しとロゴ）は FONT_* を変えるだけで全ページが変わる。
(function () {
  'use strict';
  var me = document.currentScript;
  if (!me) return;
  var root = me.src.replace(/site-nav\.js(\?.*)?$/, '');
  var FONT_CSS = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Noto+Sans+JP:wght@700;800&display=swap';
  var FONT_LOGO = '"Montserrat",system-ui,sans-serif', FONT_HEAD = '"Noto Sans JP","Noto Sans SC","Noto Sans TC","Noto Sans KR","Noto Sans",system-ui,sans-serif';
  var MAIN = [['', '🏠', 'ホーム'], ['news/', '📰', 'お知らせ'], ['saga/', '📖', '物語'], ['cast/', '👥', 'キャラ'], ['mall/', '🛍️', 'モール']];
  var TABS = [['', '🏠', 'ホーム'], ['news/', '📰', 'お知らせ'], ['play/', '▶', 'プレイ'], ['saga/', '📖', '物語'], ['cast/', '👥', 'キャラ']];
  // 公開しているのは今の期だけ（「期」という言葉も出さない）。1〜4期と設定資料は管理者だけに見せる
  var admin = false;
  if (admin) document.documentElement.classList.add('tri-admin');
  var MORE = admin ? [['dev/', '🛠️', '開発版'], ['guide.html', '📘', '設定資料（世界ガイド）'], ['settings/', '📋', '設定リスト'], ['guide.html#simulation', '🏡', '暮らしの試作'], ['news/rules.html', '📏', 'アップデートの基準']]
    : [['play/', '▶', 'ゲームをはじめる'], ['mall/', '🛍️', 'トライアスロンモール'], ['news/rules.html', '📏', 'アップデートの基準']];
  var path = location.pathname.replace(/index\.html$/, ''), rootPath = new URL(root).pathname;
  function cur(p) {
    if (p.indexOf('#') >= 0) return false;
    var full = new URL(root + p).pathname;
    return p === '' ? path === rootPath : path.indexOf(full) === 0 && !(p === 'news/' && /rules\.html$/.test(path));
  }
  function link(it, cls) { return '<a class="' + cls + '" href="' + root + it[0] + '"' + (cur(it[0]) ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + it[1] + '</span>' + it[2] + '</a>'; }
  var fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = FONT_CSS; document.head.appendChild(fl);
  var css = 'html:not(.tri-admin) .dev-only{display:none!important}html.tri-admin .pub-only{display:none!important}:root{--tri-logo:' + FONT_LOGO + ';--tri-head:' + FONT_HEAD + '}' +
    'h1,h2{font-family:var(--tri-head);letter-spacing:.03em}.kick{font-family:var(--tri-logo);font-weight:500;letter-spacing:.28em;text-transform:uppercase}' +
    '.tri-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:60px;padding:8px 16px;background:#fff;border-bottom:1px solid #cbdedf;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;position:sticky;top:0;z-index:60}' +
    '.tri-brand{color:#163744;text-decoration:none;font-family:var(--tri-logo);font-weight:700;letter-spacing:.22em;font-size:19px;line-height:1;padding:8px 0}' +
    '.tri-dev{margin-right:auto;background:#2b2f36;color:#ffd76a;font-size:12px;font-weight:800;letter-spacing:.1em;border-radius:6px;padding:4px 10px;text-decoration:none;white-space:nowrap}' +
    '.tri-top{display:none;gap:4px}.tri-top a{display:flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border-radius:10px;color:#163744;text-decoration:none;font-size:15px;font-weight:700}' +
    '.tri-top a:hover{background:#edf5f4}.tri-top a[aria-current="page"]{color:#007f87;box-shadow:inset 0 -3px 0 #007f87;border-radius:0}' +
    '.tri-menu{position:relative;background:none!important;padding:0!important;border:0!important;border-radius:0!important;margin:0!important}.tri-nav,.tri-bottom{box-sizing:border-box}.tri-nav *,.tri-bottom *{box-sizing:border-box}.tri-menu summary{list-style:none;cursor:pointer;display:grid;place-items:center;width:44px;height:44px;border:1px solid #cbdedf;border-radius:10px;font-size:20px;color:#163744;background:#fff}' +
    '.tri-act{display:flex;align-items:center;gap:8px;margin-left:auto}.tri-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:800;text-decoration:none;white-space:nowrap;border:1px solid #007f87;color:#007f87;background:#fff}.tri-btn.in{gap:6px;padding:0 12px 0 4px;max-width:150px}.tri-btn.in img{width:30px;height:30px;border-radius:50%}.tri-btn.in span{overflow:hidden;text-overflow:ellipsis}.tri-btn.play{background:#ffd76a;border-color:#ffd76a;color:#163744}.tri-btn:hover{filter:brightness(.97)}' +
    '.tri-foot{text-align:left;margin:0;max-width:none;background:#123640;color:#cfe2e4;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;font-size:14px;padding:36px 5% 28px}.tri-foot a{color:#fff;text-decoration:none}.tri-foot a:hover{text-decoration:underline}.tri-fcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;max-width:1000px;margin:0 auto}.tri-fcols b{display:block;color:#fff;font-size:13px;letter-spacing:.08em;margin-bottom:8px}.tri-fcols a{display:block;padding:5px 0}.tri-fbase{max-width:1000px;margin:24px auto 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.18);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-size:12px}.tri-fbase .logo{font-family:var(--tri-logo);font-weight:700;letter-spacing:.22em;color:#fff;font-size:15px}' +
    '.tri-menu summary::-webkit-details-marker{display:none}.tri-menu[open] summary{border-color:#007f87;color:#007f87}' +
    '.tri-more{position:absolute;right:0;top:calc(100% + 8px);display:flex;flex-direction:column;min-width:240px;padding:6px;background:#fff;border:1px solid #cbdedf;border-radius:14px;box-shadow:0 10px 30px rgba(22,55,68,.16)}' +
    '.tri-more a{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 14px;border-radius:10px;color:#163744;text-decoration:none;font-size:15px;font-weight:600;white-space:nowrap}' +
    '.tri-more a:hover{background:#edf5f4}.tri-more a[aria-current="page"]{background:#e3f1f1;color:#007f87}' +
    '.tri-bottom{position:fixed;left:0;right:0;bottom:0;z-index:60;display:grid;grid-template-columns:repeat(5,1fr);background:rgba(255,255,255,.97);border-top:1px solid #cbdedf;padding-bottom:env(safe-area-inset-bottom);font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;box-shadow:0 -4px 16px rgba(22,55,68,.06)}' +
    '.tri-bottom a{display:grid;justify-items:center;align-content:center;gap:2px;min-height:60px;color:#4f6b75;text-decoration:none;font-size:11px;font-weight:700}' +
    '.tri-bottom a span{font-size:22px;line-height:1}.tri-bottom a.tab-play span{display:grid;place-items:center;width:40px;height:40px;margin-top:-14px;border-radius:50%;background:#ffd76a;color:#163744;font-size:16px;box-shadow:0 3px 10px rgba(22,55,68,.2)}.tri-bottom a[aria-current="page"]{color:#007f87;box-shadow:inset 0 3px 0 #007f87}' +
    '.tri-nav a:focus-visible,.tri-nav summary:focus-visible,.tri-bottom a:focus-visible{outline:3px solid #c27600;outline-offset:2px}' +
    '@media(max-width:899px){body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}}' +
    '@media(max-width:899px){.tri-btn.play{display:none}}@media(max-width:379px){.tri-btn{padding:0 12px}.tri-nav{gap:8px;padding:8px 12px}.tri-brand{font-size:16px;letter-spacing:.12em}.tri-dev{font-size:11px;padding:3px 7px}.tri-menu summary{padding:0 12px}}' +
    '@media(min-width:900px){.tri-top{display:flex}.tri-bottom{display:none}.tri-nav{padding:8px 5%}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  var bar = document.createElement('div');
  bar.className = 'tri-nav';
  bar.innerHTML = '<a class="tri-brand" href="' + root + '" aria-label="TRIATHLON ホーム">TRIATHLON</a>' + (admin ? '<a class="tri-dev" href="' + root + 'dev/">開発版</a>' : '') +
    '<div class="tri-top" role="navigation" aria-label="おもなページ">' + MAIN.map(function (it) { return link(it, ''); }).join('') + '</div>' +
    '<div class="tri-act"><a class="tri-btn play" href="' + root + 'play/">▶ プレイ</a>' +
    '<details class="tri-menu"><summary aria-label="メニュー">☰</summary><div class="tri-more" role="navigation" aria-label="そのほかのページ">' + MORE.map(function (it) { return link(it, ''); }).join('') + '</div></details></div>';
  var bottom = document.createElement('div');
  bottom.className = 'tri-bottom';
  bottom.setAttribute('role', 'navigation');
  bottom.setAttribute('aria-label', 'おもなページ（下）');
  bottom.innerHTML = TABS.map(function (it) { return link(it, it[0] === 'play/' ? 'tab-play' : ''); }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
  // 共通のフッター（ゲーム画面には出さない）
  function addFoot() {
    if (/\/play\/$/.test(path)) return;
    var ver = document.getElementById('ver'), old = document.querySelector('.foot');
    var foot = document.createElement('footer');
    foot.className = 'tri-foot';
    function fl(t, a) { return '<div><b>' + t + '</b>' + a.map(function (it) { return '<a href="' + root + it[0] + '">' + it[1] + '</a>'; }).join('') + '</div>'; }
    foot.innerHTML = '<div class="tri-fcols">' + fl('ゲーム', [['play/', 'ゲームをはじめる'], ['mall/', 'トライアスロンモール']]) + fl('作品', [['saga/', 'トライアスロン物語'], ['cast/', 'キャラクター']]) +
      fl('サポート', [['news/', 'お知らせ'], ['news/rules.html', 'アップデートの基準'], ['login/', 'ログイン']]) + '</div>' +
      '<div class="tri-fbase"><span class="logo">TRIATHLON</span><span>開発中のサイトです。画像は検討中のイメージで、ゲーム画面ではありません。' + (ver ? ' · ' + ver.textContent : '') + '</span></div>';
    if (old) old.replaceWith(foot); else document.body.insertBefore(foot, bottom.parentNode ? bottom : null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFoot); else addFoot();
  document.body.appendChild(bottom);
  // ログイン（Google）。右上のボタンは、ログイン中なら顔写真と名前に変わる
  var entry = document.createElement('a'); entry.className = 'tri-login tri-btn'; entry.href = root + 'login/'; entry.textContent = 'ログイン';
  bar.querySelector('.tri-act').insertBefore(entry, bar.querySelector('.tri-act').firstChild);
  function showUser(u) {
    entry.textContent = '';
    if (!u) { entry.textContent = 'ログイン'; entry.classList.remove('in'); return; }
    entry.classList.add('in');
    if (u.photo) { var im = document.createElement('img'); im.src = u.photo; im.alt = ''; im.referrerPolicy = 'no-referrer'; entry.appendChild(im); }
    var nm = document.createElement('span'); nm.textContent = u.name.split(' ')[0]; entry.appendChild(nm);
    entry.setAttribute('aria-label', u.name + '（ログイン中）');
  }
  document.addEventListener('tri-user', function (e) { showUser(e.detail); });
  if (!document.querySelector('script[src*="login/auth.js"],script[src^="auth.js"]')) { var au = document.createElement('script'); au.type = 'module'; au.src = root + 'login/auth.js?v=0.27.4'; document.head.appendChild(au); }
  var topStyle = document.createElement('link'); topStyle.rel = 'stylesheet'; topStyle.href = root + 'back-to-top.css'; document.head.appendChild(topStyle);
  var topScript = document.createElement('script'); topScript.src = root + 'back-to-top.js'; document.body.appendChild(topScript);
  document.addEventListener('click', function (e) {
    var m = bar.querySelector('.tri-menu');
    if (m.open && (!m.contains(e.target) || e.target.closest('.tri-more a'))) m.open = false;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') bar.querySelector('.tri-menu').open = false; });
})();
