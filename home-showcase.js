(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var root = new URL('./', script.src);
  var sheet = document.createElement('link'); sheet.rel = 'stylesheet'; sheet.href = new URL('home-showcase.css?v=1.01', root).href; document.head.appendChild(sheet);
  function mount() {
    var main = document.querySelector('main'), hero = document.querySelector('.hero');
    if (!main || !hero) return;
    main.classList.add('official-home');
    var version = document.getElementById('ver'); if (version) version.textContent = 'v1.01';
    var footerText = document.querySelector('.tri-fbase>span:last-child');
    if (footerText) footerText.textContent = '物語と世界を少しずつ公開しています。ゲーム本体は企画・試作中です。 · v1.01';
    var badge = hero.querySelector('.badge'); if (badge) badge.textContent = '物語と世界を育てるゲーム · 開発中';
    var lead = hero.querySelector('.hero-lead'); if (lead) lead.textContent = '出会い、迷い、それぞれの明日へ。同じ町で生きる九人の物語。';
    var secondary = hero.querySelector('.cta a:nth-child(2)');
    if (secondary) { secondary.href = new URL('char/', root).href; secondary.textContent = '九人に会う'; }
    var read = hero.querySelector('#cta-read');
    if (read && window.TRI_STORIES && window.TRI_STORIES.length) {
      var first = window.TRI_STORIES[0]; read.href = new URL('stories/v.html?id=' + encodeURIComponent(first.id), root).href; read.textContent = '第1話から読む';
    }
    var nine = document.getElementById('nine'), episode = document.getElementById('ep');
    if (nine && episode) {
      var castSection = nine.closest('section');
      main.insertBefore(castSection, episode.closest('section'));
      document.getElementById('nine-h').textContent = 'また会いたくなる、九人。';
      var intros = window.TRI_INTRODUCTIONS || {};
      nine.querySelectorAll('a').forEach(function (link) {
        var id = new URL(link.href).searchParams.get('id'), intro = intros[id];
        if (!intro) return;
        var line = document.createElement('p'); line.className = 'character-voice'; line.textContent = intro.lead; link.appendChild(line);
      });
    }
    var status = document.createElement('section'); status.className = 'home-roadmap'; status.setAttribute('aria-labelledby', 'home-roadmap-title');
    status.innerHTML = '<div class="roadmap-inner"><div><p class="kick">DEVELOPMENT</p><h2 id="home-roadmap-title">この世界は、まだ育っている。</h2><p>世界観と物語を中心に、短い探索と自動戦闘を少しずつ。</p></div><div><span class="development-status">企画・試作中</span><p>今は、キャラの魅力と最初の探索体験を整えています。</p><a class="more" href="' + new URL('roadmap/', root).href + '">開発ロードマップを見る →</a></div></div>';
    var news = document.getElementById('news');
    if (news) main.insertBefore(status, news.closest('section')); else main.appendChild(status);
    var team = document.getElementById('team-h');
    if (team) { var section = team.closest('section'); var details = document.createElement('details'); details.className = 'home-credits'; var summary = document.createElement('summary'); summary.textContent = '制作について'; details.appendChild(summary); section.parentNode.insertBefore(details, section); details.appendChild(section); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
