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
  sheet.rel = 'stylesheet'; sheet.href = new URL('site-theme.css?v=1.01', root).href;
  document.head.appendChild(sheet);
  function read() {
    try { return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; }
    catch (_) { return 'light'; }
  }
  var button;
  function apply(value) {
    html.classList.remove('night');
    html.dataset.triMode = development ? 'development' : 'official';
    html.dataset.triTheme = development ? 'studio' : value;
    if (button) {
      var dark = value === 'dark';
      button.textContent = dark ? '\u2600' : '\u263e';
      button.setAttribute('aria-label', '公式版を' + (dark ? 'ライトモード' : 'ダークモード') + 'にする');
      button.title = dark ? 'ライトモード' : 'ダークモード';
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
