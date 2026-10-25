// 管理者だけのページの入口。中身はFirestoreから読み、管理者でなければFirebaseのルールが渡さない。
// 画面の出しわけは見た目のためだけで、守りはルール側にある（AGENTS.md）。
// 使い方：<div id="gate"></div><div id="admin-body" hidden></div> を置き、window.triAdminReady = function (f, user) {...}
(function () {
  'use strict';
  var gate = document.getElementById('gate'), body = document.getElementById('admin-body'), done = false;
  function say(html) { gate.innerHTML = html; gate.hidden = false; body.hidden = true; }
  say('<p class="gate-msg">確認しています…</p>');
  function on(u) {
    if (!u) { done = false; say('<p class="gate-msg">このページは管理者だけが見られます。</p><a class="gate-btn" href="../login/">ログインする</a>'); return; }
    if (done) return;
    window.triDB().then(function (f) {
      return f.getDoc(f.doc(f.db, 'admin', 'check')).then(function () {
        done = true; gate.hidden = true; body.hidden = false;
        if (window.triAdminReady) window.triAdminReady(f, u);
      });
    }).catch(function (err) {
      var c = err && err.code || '';
      if (c === 'permission-denied') say('<p class="gate-msg">' + u.email + ' は管理者ではありません。</p><a class="gate-btn" href="../">ホームへ戻る</a>');
      else say('<p class="gate-msg">まだ準備中です（データベースの設定待ち：' + (c || 'エラー') + '）。</p>');
    });
  }
  document.addEventListener('tri-user', function (e) { on(e.detail); });
  if (window.TRI_USER !== undefined) on(window.TRI_USER);
})();
