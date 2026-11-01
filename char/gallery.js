(function () {
  'use strict';
  var all = CHARS.filter(function (c) { return c.s === 1; });
  var active = 'all';
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render() {
    var list = all.filter(function (c) { return active === 'all' || c.c === active; });
    document.getElementById('list').innerHTML = list.map(function (c) {
      var name = SEED[c.id].name, intro = window.TRI_INTRODUCTIONS[c.id];
      var persona = (window.TRI_PERSONA || {})[name];
      return '<a class="cast-item ' + c.c + '" href="c.html?id=' + encodeURIComponent(c.id) + '">' +
        '<div class="portrait"><img src="' + esc(intro.image) + '" alt="' + esc(name) + 'の全身イメージ" width="1024" height="1536" loading="lazy" decoding="async"></div>' +
        '<div class="item-copy"><p class="class-name">' + esc(c.cls) + '</p><h2>' + esc(name) + '</h2><p class="intro-line">' + esc(intro.lead) + '</p>' +
        '<p class="item-traits">' + esc(persona ? persona.tags.slice(0, 2).join(' · ') : '') + '</p></div></a>';
    }).join('');
    document.getElementById('count').textContent = list.length + '人';
    document.querySelectorAll('[data-color]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.color === active)); });
  }
  document.querySelectorAll('[data-color]').forEach(function (b) { b.addEventListener('click', function () { active = b.dataset.color; render(); }); });
  render();
})();
