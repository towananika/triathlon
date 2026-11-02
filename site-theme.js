(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var root = new URL('./', script.src);
  var relative = location.pathname.slice(root.pathname.length).replace(/index\.html$/, '');
  var development = relative.indexOf('dev/') === 0 || (relative === 'play/' && new URLSearchParams(location.search).has('dev'));
  var key = 'tri-official-theme-v1';
  var html = document.documentElement;
  var sheet = document.createElement('link');
  sheet.rel = 'stylesheet'; sheet.href = new URL('site-theme.css?v=0.101-fix', root).href;
  document.head.appendChild(sheet);
  function read() {
    try { return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; }
    catch (_) { return 'light'; }
  }
  var button;
  // Lucide sun/moon icons; see licenses/lucide.txt.
  var icons = {
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'
  };
  function apply(value) {
    html.classList.remove('night');
    html.dataset.triMode = development ? 'development' : 'official';
    html.dataset.triTheme = development ? 'studio' : value;
    if (button) {
      var dark = value === 'dark';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + icons[dark ? 'sun' : 'moon'] + '</svg>';
      button.setAttribute('aria-label', '公式版を' + (dark ? 'ライトモード' : 'ダークモード') + 'にする');
      button.title = dark ? 'ライトモード' : 'ダークモード';
      button.dataset.tooltip = button.title;
      button.setAttribute('aria-pressed', String(dark));
    }
  }
  apply(read());
  function mount() {
    if (development) return;
    var actions = document.querySelector('.tri-act');
    if (!actions) return;
    button = document.createElement('button'); button.type = 'button'; button.className = 'tri-theme-toggle';
    actions.insertBefore(button, actions.firstChild); apply(read());
    button.addEventListener('click', function () {
      var value = html.dataset.triTheme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, value); } catch (_) {}
      apply(value);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('storage', function (e) { if (e.key === key || e.key === null) apply(read()); });
})();
