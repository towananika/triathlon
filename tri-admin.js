// 管理者ログイン（シンプル版）。合言葉を SHA-256 にした「印」を HASH と比べるだけで、どこにも送らない。
// 公開リポジトリなので、開発版の中身を本当に隠すものではない。入口を分けるためのもの。
// 開発版のページは <head> でこのファイルを読み、<html data-admin-only> にすると、ログインしていない人には入口だけを見せる。
(function () {
  'use strict';
  var HASH = '';   // 管理者の合言葉の印。空のあいだは、最初にログインした端末で仮に入れる
  var K = 'tri-admin';
  var root = (document.currentScript && document.currentScript.src || location.href).replace(/tri-admin\.js(\?.*)?$/, '');
  function stored() { try { return localStorage.getItem(K) || ''; } catch (e) { return ''; } }
  function on() { var s = stored(); return !!s && (!HASH || s === HASH); }
  function hash(p) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode('triathlon-admin:' + p)).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  window.TriAdmin = {
    on: on,
    ready: function () { return !!HASH; },
    mark: stored,
    login: function (p) {
      return hash(p).then(function (h) {
        if (HASH && h !== HASH) return { ok: false };
        try { localStorage.setItem(K, h); } catch (e) { return { ok: false }; }
        return { ok: true, temp: !HASH, mark: h };
      });
    },
    logout: function () { try { localStorage.removeItem(K); } catch (e) {} }
  };
  if (document.documentElement.hasAttribute('data-admin-only') && !on()) {
    var st = document.createElement('style');
    st.textContent = 'body>*{display:none!important}body>#tri-gate{display:grid!important}' +
      '#tri-gate{min-height:100vh;place-items:center;padding:24px 16px;text-align:center;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif;color:#4f6b75;background:#f6fafa}' +
      '#tri-gate b{display:block;font-size:22px;color:#163744;margin-bottom:6px}#tri-gate a{display:inline-block;margin-top:18px;padding:12px 28px;border-radius:99px;background:#007f87;color:#fff;text-decoration:none;font-weight:700}';
    document.head.appendChild(st);
    document.addEventListener('DOMContentLoaded', function () {
      var g = document.createElement('div'); g.id = 'tri-gate';
      g.innerHTML = '<div><b>開発版</b>管理者だけが見られるページです<br><a href="' + root + 'login/">管理者ログイン</a></div>';
      document.body.appendChild(g);
    });
  }
})();
