(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var home = new URL('../', script.src).href;
  if (!document.querySelector('script[src*="site-nav.js"]')) {
    var theme = document.createElement('script'); theme.src = new URL('site-theme.js?v=0.101-fix', home).href; document.head.appendChild(theme);
    var status = document.createElement('script'); status.src = new URL('login/admin-status.js?v=0.101-fix', home).href; document.head.appendChild(status);
    if (!document.querySelector('script[src*="login/auth.js"],script[src^="auth.js"]')) {
      var auth = document.createElement('script'); auth.type = 'module'; auth.src = new URL('login/auth.js?v=0.28', home).href; document.head.appendChild(auth);
    }
  }
  function mount() {
    if (document.querySelector('.tri-mode-switch')) return;
    if (document.getElementById('dev-return')) return;
    var nav = document.createElement('nav');
    nav.id = 'dev-return';
    nav.hidden = window.TRI_IS_ADMIN !== true;
    document.addEventListener('tri-admin-status', function (event) { nav.hidden = event.detail !== true; });
    nav.setAttribute('aria-label', '公式版へ切り替える');
    var link = document.createElement('a');
    link.href = home;
    link.textContent = '公式版';
    nav.appendChild(link);
    var style = document.createElement('style');
    style.textContent = '#dev-return{box-sizing:border-box;width:100%;padding:8px 16px;background:var(--tri-surface,#26262d);border-bottom:1px solid var(--tri-border,#484650);font:14px/1.5 system-ui,sans-serif}#dev-return a{display:inline-flex;align-items:center;min-height:44px;color:var(--tri-text,#e4e3ed);text-decoration:underline;text-underline-offset:3px}#dev-return a:focus-visible{outline:2px solid var(--tri-active,#d1bf91);outline-offset:3px}';
    document.head.appendChild(style);
    document.body.insertBefore(nav, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
