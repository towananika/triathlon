(function () {
  'use strict';
  var api = window.TRI_WORLD_NEWS, sim = window.TRI_SIM;
  var day = sim ? Math.max(0, sim.today()) : 0, entries = api.build(sim, day), kind = 'all';
  var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  var reader = document.getElementById('world-reader'), search = document.getElementById('world-search');
  function esc(value) { return String(value || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  api.characters.forEach(function (name) { var option = document.createElement('option'); option.value = name; option.textContent = name; reader.appendChild(option); });
  document.getElementById('world-date').textContent = sim ? sim.wdate(day).label : '物語の記録';
  function render() {
    var query = search.value.trim().toLocaleLowerCase();
    var news = api.read(entries, { character: reader.value, asOf: day });
    document.getElementById('world-reader-status').textContent = reader.value ? reader.value + 'が読める公開ニュース。運営のお知らせ・未来予測は含みません。' : 'ユーザーとキャラが共有する公開ニュース';
    document.getElementById('world-list').innerHTML = news.map(function (n, i) { return { article: n, number: news.length - i }; }).filter(function (x) {
      var n = x.article;
      return (kind === 'all' || kind === n.kind) && (!query || [n.title, n.body, n.person, n.place].join(' ').toLocaleLowerCase().indexOf(query) >= 0);
    }).map(function (x) {
      var n = x.article, label = n.kind === 'voice' ? 'キャラの声' : '文明・暮らし';
      return '<li class="world-item"><article><p class="meta"><span class="number">No. ' + x.number + '</span><span class="cat c-info">' + label + '</span><span>' + esc(sim ? sim.wdate(n.day).label : '') + '</span><span>' + esc(n.place) + '</span></p><h3>' + esc(n.title) + '</h3>' + (n.body ? (n.kind === 'voice' ? '<blockquote>' + esc(n.body) + '</blockquote>' : '<p>' + esc(n.body) + '</p>') : '') + '<p class="source">' + esc(n.source) + ' / ' + esc(n.record) + '</p></article></li>';
    }).join('') || '<li class="world-empty">該当するニュースはありません。</li>';
  }
  function select(tab, focus) {
    tabs.forEach(function (item) { var active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !active; });
    if (focus) tab.focus();
    history.replaceState(null, '', location.pathname + location.search + (tab.id === 'tab-world' ? '#world' : '#notices'));
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
    });
  });
  document.querySelector('[aria-label="ニュースの種類"]').addEventListener('click', function (event) { var button = event.target.closest('[data-world-filter]'); if (!button) return; kind = button.dataset.worldFilter; document.querySelectorAll('[data-world-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); }); render(); });
  search.addEventListener('input', render); reader.addEventListener('change', render);
  window.addEventListener('hashchange', function () { select(document.getElementById(location.hash === '#world' ? 'tab-world' : 'tab-notices'), false); });
  select(document.getElementById(location.hash === '#world' ? 'tab-world' : 'tab-notices'), false); render();
})();
