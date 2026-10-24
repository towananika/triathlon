(function () {
  'use strict';
  document.querySelector('#panel-overview').insertAdjacentHTML('afterbegin', '<div class="intro-strip"><div><b>EARTH</b><p>同じ地理、違う文明</p></div><div><b>LIFE</b><p>関係と生き方を選ぶ</p></div><div><b>RGB</b><p>9つの学びを未来へ</p></div></div>');
  document.querySelector('#world').insertAdjacentHTML('afterend', `
    <section class="card" id="map"><p class="kicker">LOCAL CITY STUDY</p><h2>この土地に、どんな街を。</h2><span class="proposal">旧青波市の地域サンプル / 新世界への採用未定</span><p>以下は地球全体のマップではなく、以前検討した街の施設構成。学校・港・遺構の配置、地球上の位置と歴史は未確定。独自の都市計画を考えるための参考として残す。</p>
    <div class="world-layout"><div class="map-board" role="group" aria-label="旧都市案の施設関係の概念図。地球の実際の地形ではありません">
    <button type="button" data-place="school" aria-pressed="true"><small>01 / LEARN</small>学校・訓練場</button>
    <button type="button" data-place="hill" aria-pressed="false"><small>02 / EXPLORE</small>風見の丘</button>
    <button type="button" data-place="harbor" aria-pressed="false"><small>03 / CONNECT</small>港・海辺の交流施設</button>
    <button type="button" data-place="ruins" aria-pressed="false"><small>04 / DISCOVER</small>旧水路遺構</button></div>
    <div class="place-info" aria-live="polite"><p class="kicker" id="place-number"></p><h3 id="place-title"></h3><p id="place-description"></p><dl><dt>この場所でできること</dt><dd id="place-activity"></dd><dt>出会いと課題</dt><dd id="place-encounter"></dd></dl></div></div></section>
    <section class="card" id="monsters"><p class="kicker">CREATURES & ENCOUNTERS</p><h2>街の外には、小さな未知。</h2><span class="proposal">旧地域案のモンスター / 新世界への採用未定</span><p>すべての生き物が敵ではない。観察して、距離を取り、ときには力を合わせる。倒す以外の解決も用意する構想。以下の生物・遺構は現実の地球に存在するという意味ではなく、独自文明との接続も検討中。</p><div class="monster-list">
    <article><p class="kicker">01 / WATER</p><h3>しずくクラゲ</h3><p>旧水路の魔力だまりに集まる半透明の生物。ゆっくり移動し、近づくと水の輪を広げる。</p><p><b>学べること：</b>予兆を見て距離を取る。水路を整えて別の場所へ誘導する方法も。</p></article>
    <article><p class="kicker">02 / WIND</p><h3>風羽の小鳥</h3><p>丘の上昇気流を好む鳥。光る道具に興味を示し、巣へ持ち帰ってしまう。</p><p><b>学べること：</b>移動経路の観察と仲間への共有。物々交換で道具を取り戻す案。</p></article>
    <article><p class="kicker">03 / EARTH</p><h3>苔石の番人</h3><p>旧設備を守る小さな魔法構造体。決まった通路を巡り、侵入を感知すると道を塞ぐ。</p><p><b>学べること：</b>盾による防護、迂回、回路の修復。連携して通路を安全にする。</p></article></div><p><small>生態・報酬・戦闘ルール・数値は未確定。現在のページではプレイできません。</small></p></section>`);
  var places = {
    school: ['01 / LEARN', '学校・訓練場', '9つの進路が交わる、一日の始まりの場所。共通の基礎を学び、それぞれの得意を探す。', '基礎訓練、模擬実習、技能の習得、仲間との会話。', '先生と練習用の標的。最初は危険の少ない課題から。'],
    hill: ['02 / EXPLORE', '風見の丘', '海と街を見渡せる緑の丘。風の変化や生き物の足跡が、探索の手がかりになる。', '地形観察、採集、移動訓練。', '風羽の小鳥。持ち去られた道具を探す小さな依頼。'],
    harbor: ['03 / CONNECT', '港・海辺の交流施設', '人と物が行き交う港と、もう一度使える場所にしたい古い施設。物語と暮らしの拠点。', '住民の依頼、修理、夏祭りの準備、施設の改装。', '願いの異なる住民たち。誰のための場所にするかを考える。'],
    ruins: ['04 / DISCOVER', '旧水路遺構', '街の暮らしを支えた水路と古い魔法回路。過去の計画が、今の街とつながっている。', '水路の調査、回路の修復、仲間と行う探索実習。', 'しずくクラゲと苔石の番人。環境を整える解決方法も検討。']
  };
  function selectPlace(key) {
    var place = places[key];
    ['number', 'title', 'description', 'activity', 'encounter'].forEach(function (field, index) {
      document.getElementById('place-' + field).textContent = place[index];
    });
    document.querySelectorAll('[data-place]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.place === key)); });
  }
  document.querySelectorAll('[data-place]').forEach(function (button) { button.addEventListener('click', function () { selectPlace(button.dataset.place); }); });
  selectPlace('school');
  var classes = [
    ['R','Fighter','ファイター','身体を使い、瞬間を見極める。','中学生女子 / グローブ'],
    ['R','Knight','ナイト','守るために、一歩前へ。','中学生女子 / 練習盾'],
    ['R','Warrior','ウォーリア','積み重ねた技で、道を開く。','中学生女子 / 練習剣'],
    ['G','Ranger','レンジャー','静かに観察し、狙いを定める。','女子 / 落ち着いた雰囲気'],
    ['G','Assassin','アサシン','気配と隙間を読み取る。','男子 / 長身'],
    ['G','Scout','スカウト','まだ知らない道を見つける。','男子 / 可愛い系'],
    ['B','Elemental Mage','エレメンタルメージ','自然の力を、ひとつずつ学ぶ。','男子 / 茶髪・眼鏡なしのテスト'],
    ['B','Mage','メージ','そのひらめきが、常識を変える。','天才 / 青黒髪・眼鏡のテスト'],
    ['B','Cleric','クレリック','誰かの日常を、そっと支える。','癒し系 / 性別は未確定']
  ];
  document.querySelector('#characters h2').insertAdjacentHTML('beforebegin', '<p class="kicker">NINE PATHS, MANY LIVES</p>');
  document.querySelector('#characters h2').insertAdjacentHTML('afterend', '<div class="filters" role="group" aria-label="クラス系統で絞り込み"><button type="button" data-family="all" aria-pressed="true">ALL</button><button type="button" data-family="R" aria-pressed="false">R / 近接</button><button type="button" data-family="G" aria-pressed="false">G / 探索</button><button type="button" data-family="B" aria-pressed="false">B / 魔法</button></div><div class="class-grid">' + classes.map(function (c, i) {
    return '<article class="class-profile" data-group="'+c[0]+'"><span class="class-num">'+c[0]+' / 0'+(i+1)+'</span><h3>'+c[1]+'</h3><b>'+c[2]+'</b><p>'+c[3]+'</p><p>'+c[4]+'</p></article>';
  }).join('') + '</div><p><small>紹介コピーは演出案。全員中学生のテスト設定で、クラスと性格は固定しません。</small></p>');
  document.querySelectorAll('[data-family]').forEach(function (button) {
    button.addEventListener('click', function () {
      var family = button.dataset.family;
      document.querySelectorAll('[data-family]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      document.querySelectorAll('.class-profile').forEach(function (profile) { profile.hidden = family !== 'all' && profile.dataset.group !== family; });
    });
  });
  document.querySelector('#art h2').insertAdjacentHTML('afterend', '<img class="character-art" src="assets/character-study.png" width="1024" height="1536" loading="lazy" alt="中学生9人の衣装・作画比較シート。近接、探索、魔法の3系統。"><p class="art-note">以前の外見テスト。レンジャーの落ち着いた表情、EMとメージの外見交換は未反映。</p>');
  document.querySelector('#story-legacy').insertAdjacentHTML('beforeend', '<h3>夏へ向かう、3つの章</h3><span class="proposal">旧案の章構成 / 採用未定</span><ol class="chapter-list"><li><div><b>出会いと共同実習</b>違う得意を持つ9人。街の声を集め、交流施設の再生計画を立てる。</div></li><li><div><b>旧水路に残されたもの</b>動き始めた回路を調査。昔の計画と、今の住民の願いの違いを知る。</div></li><li><div><b>自分たちの夏祭り</b>何を残し、何を変えるか。選んだ改装や関係が、祭りとその後の日常に表れる。</div></li></ol>');
  document.querySelector('#world').insertAdjacentHTML('beforeend', '<p><a href="#society">社会の設計方針</a> / <a href="#map">地域サンプルを見る</a></p>');
  document.querySelector('#history h2').insertAdjacentHTML('afterend', '<p><strong>v0.11 · 2026-10-24</strong> 地球の地理・独自の文明史・改善された近未来を世界の土台に採用。関係と自分らしい生き方を中心テーマに反映。生存者の過去と社会制度の細部は未設定として区別し、旧青波市・2006年・学校実習案は履歴に移した。</p>');
  document.querySelector('#history h2').insertAdjacentHTML('afterend', '<p><strong>v0.10 · 2026-10-24</strong> 青・ターコイズを軸にゲーム紹介サイトへ刷新。クラス絞り込み、エリア紹介、モンスター・章構成の新構想を追加。従来の設定資料は保持。</p>');
})();
