(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var home = new URL('../', script.src).href;
  function mount() {
    if (document.getElementById('dev-return')) return;
    var nav = document.createElement('nav');
    nav.id = 'dev-return';
    nav.setAttribute('aria-label', '公式サイトへ戻る');
    var link = document.createElement('a');
    link.href = home;
    link.textContent = '\u2190 \u516c\u5f0f\u30b5\u30a4\u30c8\u3078\u623b\u308b';
    nav.appendChild(link);
    var style = document.createElement('style');
    style.textContent = '#dev-return{box-sizing:border-box;width:100%;padding:8px 16px;background:#f5f9f8;border-bottom:1px solid #cbdedf;font:14px/1.5 system-ui,sans-serif}#dev-return a{display:inline-flex;align-items:center;min-height:44px;color:#163744;text-decoration:underline;text-underline-offset:3px}#dev-return a:focus-visible{outline:2px solid #007f87;outline-offset:3px}';
    document.head.appendChild(style);
    document.body.insertBefore(nav, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
