(function () {
  'use strict';
  var key = 'triathlon-world-draft-v1';
  var people = [
    {id:'fighter',name:'Fighter',jp:'ファイター',group:'R',portrait:0,facts:'中学生女子のテスト設定。グローブを使う近接クラス。性格の細部は未確定。',role:'身体の使い方と距離感。武器中心のWarriorとは異なる近接判断。',want:'仲間と新しいことに挑戦できる場所を作りたい。',fear:'勢いで相手の気持ちを置き去りにしてしまうこと。',bond:'一緒に体験し、失敗も笑い合う。',life:'スポーツ指導・道具の手入れ',scene:'初めての共同作業で先走った後、相手のペースを聞き直す。'},
    {id:'knight',name:'Knight',jp:'ナイト',group:'R',portrait:1,facts:'中学生女子。裕福な家庭で育った、上品で育ちのよい雰囲気。',role:'防護と位置取り。仲間の安全を支え、前へ出る判断と退く判断を担う。',want:'家の期待だけではなく、自分で選んだことを大切にしたい。',fear:'助けてもらうことで、期待を裏切ってしまうこと。',bond:'丁寧な気遣いから始まり、少しずつ本音を預ける。',life:'行事の準備・衣服や道具の管理',scene:'準備を一人で抱え込まず、「ここは手伝ってもらえる？」と言ってみる。'},
    {id:'warrior',name:'Warrior',jp:'ウォーリア',group:'R',portrait:2,facts:'中学生女子のテスト設定。練習剣を使う近接クラス。',role:'武器操作と力の調整。Fighterの身体技術、Knightの防護と分ける。',want:'速さや順位ではなく、自分の積み重ねを形にしたい。',fear:'他人との比較ばかりで、自分の好きなことを見失うこと。',bond:'同じ作業を続ける時間から、言葉にしない信頼が育つ。',life:'木工・修繕の補助',scene:'壊れた椅子を直し、戦い以外でも自分の技が役立つと知る。'},
    {id:'ranger',name:'Ranger',jp:'レンジャー',group:'G',portrait:3,facts:'女子。静かで、芯がある。落ち着いた表情と確かな意思を感じさせる方向。',role:'射撃と精密行動。Scoutの広域の情報収集とは異なり、観察と確かな一手を重視。',want:'大切なものを、周囲の声に流されず選びたい。',fear:'自分の確信だけで、誰かの事情を見落としてしまうこと。',bond:'多くを話すより、小さな約束を守り続ける。',life:'生き物の観察・記録',scene:'多数決で決まりかけた計画に、静かに一つだけ問いを返す。'},
    {id:'assassin',name:'Assassin',jp:'アサシン',group:'G',portrait:4,facts:'男子・背が高い。性格と過去の詳細は未確定。',role:'隠密と局所的な接近。クラス名から性格や道徳観、殺人の経歴を決めない。',want:'一人でいられる自由を持ちながら、信頼できる関係も欲しい。',fear:'親しくなるほど、境界線を尊重されなくなること。',bond:'無理に聞き出さず、距離を尊重されると安心する。',life:'静かな調査・建物の点検',scene:'話したくない過去を問われ、相手が「今は話さなくていい」と応じる。'},
    {id:'scout',name:'Scout',jp:'スカウト',group:'G',portrait:5,facts:'男子・可愛い系。性格の詳細は未確定。',role:'地形把握・偵察・情報共有。Rangerの射撃と区別する。',want:'見つけたものを誰かと共有し、知らない世界を広げたい。',fear:'役に立たない日は、仲間でいられなくなると思うこと。',bond:'寄り道や発見を分け合う。何もしない時間も一緒に過ごせるようになる。',life:'案内・街の記録づくり',scene:'何も発見できなかった帰り道に、「一緒に歩けてよかった」と言われる。'},
    {id:'elemental',name:'Elemental Mage',jp:'エレメンタルメージ / BEM',group:'B',portrait:7,facts:'男子。新入生首席で、生意気な感じ。外見は茶髪・眼鏡なしのテスト。学校と評価制度は未設定。',role:'元素を扱う学び。回路を扱うMageとは、魔法への取り組み方を分ける。',want:'評価だけではなく、自分が面白いと思う問いを追いかけたい。',fear:'自信を見せるほど、わからないことを言い出しにくくなること。',bond:'少し強気な言葉で張り合いながら、互いの得意を認めていく。',life:'料理の実験・植物の世話',scene:'「それくらいできる」と言ってつまずき、謙虚なMageの助けを受け入れる。'},
    {id:'mage',name:'Mage',jp:'メージ / BM',group:'B',portrait:6,facts:'全国1位の天才でありながら、謙虚。性別は未指定。青黒髪・眼鏡の外見テスト。順位の分野は未設定。',role:'回路魔法の学び。全国1位という実績を、万能さや実戦最強と同一視しない。',want:'自分の得意で誰かの暮らしを助け、相手の得意も学びたい。',fear:'何でもできると思われ、わからないと言いにくくなること。',bond:'相手の話を聞き、知らないことには素直に教えを請う。',life:'生活道具の改良・共同研究',scene:'初めての料理で失敗し、仲間に教わりながら楽しむ。'},
    {id:'cleric',name:'Cleric',jp:'クレリック',group:'B',portrait:8,facts:'王道のクレリックらしい外見と性格、癒し系。性別は未指定。白系の聖職服・穏やかな表情は具体化の案。現在の三つ編み・女子の画像は旧外見テスト。',role:'支援と生活への応用。学科には医療以外の多様な学びも含む。所属する宗教・勢力は未設定。',want:'誰かを支えながら、自分の好きな時間も守りたい。',fear:'断ることで、優しくないと思われること。',bond:'助ける側だけでなく、頼る側にもなれる関係。',life:'医療の学び・音楽や料理',scene:'頼まれごとを断った日に、それでも変わらず接してくれる友人に会う。'}
  ];
  var regions = [
    {id:'east-asia',name:'東アジアの河川域',lon:126.98,lat:37.57},
    {id:'central-europe',name:'ヨーロッパ内陸域',lon:11.58,lat:48.14},
    {id:'west-asia',name:'西アジア内陸域',lon:32.86,lat:39.93},
    {id:'east-africa',name:'東アフリカ内陸域',lon:36.82,lat:-1.29},
    {id:'south-america',name:'南アメリカ東部',lon:-46.63,lat:-23.55}
  ];
  var priorities = {
    community:{name:'交流',text:'広場と共用施設を中心に、人が出会える動線を考える。静けさやプライバシーとの両立が課題。'},
    nature:{name:'自然',text:'まとまった緑地を残し、住む場所と自然の距離を考える。移動と生活サービスへのアクセスが課題。'},
    access:{name:'利便',text:'住宅・学び・仕事を近づけ、移動の負担を減らす。密度と余白の両立が課題。'}
  };
  var state={version:1,site:null,city:'',priority:'community',person:'fighter',notes:{}};
  var storageOK=true;
  try {
    var saved=JSON.parse(localStorage.getItem(key));
    if(saved && saved.version===1) {
      if(saved.site && Number.isFinite(saved.site.lon) && Math.abs(saved.site.lon)<=180 && Number.isFinite(saved.site.lat) && Math.abs(saved.site.lat)<=90) state.site={lon:saved.site.lon,lat:saved.site.lat};
      if(typeof saved.city==='string') state.city=saved.city.slice(0,32);
      if(Object.hasOwn(priorities,saved.priority)) state.priority=saved.priority;
      if(people.some(function(p){return p.id===saved.person;})) state.person=saved.person;
      if(saved.notes && !Array.isArray(saved.notes) && typeof saved.notes==='object') people.forEach(function(p){if(typeof saved.notes[p.id]==='string') state.notes[p.id]=saved.notes[p.id].slice(0,600);});
    }
  } catch(e) { /* Invalid saved drafts fall back to the current defaults. */ }

  document.querySelector('#world').insertAdjacentHTML('afterend', `
    <section class="card" id="atlas"><p class="kicker">EARTH / ANOTHER CIVILIZATION</p><h2>まだ名前のない、次の街。</h2><p>地球の地理は共通。ここから始まる文明史は、ひとつではない。</p>
    <div class="atlas-layout"><div class="earth-surface"><svg id="earth-map" viewBox="0 0 960 510" role="img" aria-labelledby="earth-title earth-description"><title id="earth-title">国境のない地球</title><desc id="earth-description">簡略化された実際の海岸線と、5つの都市候補地点。候補地の選択は隣の地域欄でも行えます。</desc></svg><p class="map-credit">Natural Earth / world-atlas · 海岸線の概略。国境・既存都市・標高・河川の詳細は未収録。</p></div>
    <div class="atlas-form"><span class="proposal">都市構想の下書き</span><label for="region-choice">参考地域</label><select id="region-choice"><option value="">候補地未選択</option><option value="custom" disabled>地図上の選択地点</option></select><p id="atlas-coordinates" class="coordinates" aria-live="polite">候補地未選択</p><label for="city-name">この街の名前</label><input id="city-name" maxlength="32" placeholder="未命名" autocomplete="off"><label for="city-priority">大切にするもの</label><select id="city-priority"><option value="community">交流</option><option value="nature">自然</option><option value="access">利便</option></select><h3 id="city-heading">まだ名前のない街</h3><p id="city-summary"></p><p class="draft-scope">都市生成・適地評価・文明シミュレーションは構想段階。</p></div></div>
    <div class="draft-actions"><button type="button" id="export-draft">下書きを書き出す</button><button type="button" id="clear-draft">保存した下書きを削除</button><span id="draft-status" role="status">このブラウザ内の下書き</span></div></section>`);
  document.querySelector('#characters').insertAdjacentHTML('beforebegin', `
    <section class="card" id="dossier"><p class="kicker">PEOPLE / BEYOND THE CLASS</p><h2>クラスだけでは、語れない。</h2><div class="person-picker" role="group" aria-label="人物の選択"></div><div class="dossier-layout"><figure class="person-figure"><div class="person-portrait" role="img"><span>VISUAL STUDY</span></div><figcaption>旧作画テスト。服装・表情は最新設定の完成画ではありません。EMとMageは外見の交換を反映。</figcaption></figure><div class="person-content"><p id="person-family" class="kicker"></p><h3 id="person-name"></h3><p id="person-jp"></p><h4>確認済みの設定</h4><p id="person-facts"></p><h4>クラスの役割（設計上の解釈）</h4><p id="person-role"></p><div class="person-proposals"><span class="proposal">以下は人物像を広げる提案 / 未確定</span><dl><dt>望むもの</dt><dd id="person-want"></dd><dt>苦手かもしれないこと</dt><dd id="person-fear"></dd><dt>親しくなるきっかけ</dt><dd id="person-bond"></dd><dt>暮らしでの得意</dt><dd id="person-life"></dd><dt>物語の一場面</dt><dd id="person-scene"></dd></dl></div><label for="person-note">この人物へのメモ</label><textarea id="person-note" rows="3" maxlength="600"></textarea><small>個人メモ / 公開設定や他の人の画面には反映されません</small></div></div></section>`);

  function save() {
    try {localStorage.setItem(key,JSON.stringify(state));storageOK=true;}
    catch(e) {storageOK=false;}
    document.querySelector('#draft-status').textContent=storageOK?'このブラウザに保存済み':'保存できません。この画面内のみの下書きです。';
  }
  var picker=document.querySelector('.person-picker');
  document.querySelector('#atlas').insertAdjacentHTML('afterend', `
    <section class="card" id="civilizations"><p class="kicker">RGB / CIVILIZATIONS & BELIEFS</p><h2>同じ地球に、違う社会の答え。</h2><p>Rは実力と成果、Gは協調と調和、Bは魔法と信仰。以下はゲーム世界の設定で、現実の政治制度や宗教への評価ではありません。勢力の領土・国境・国民とクラスの対応は未設定です。</p>
    <div class="civilization-grid"><article class="civilization-r"><span class="kicker">R / EMPIRE</span><h3>実力主義帝国</h3><p>独裁的な体制だが、地位は無条件に保証されない。実力が結果として表れず、名分を失えば外される。</p><dl><dt>暮らし</dt><dd>みんながよい暮らしをできるよう支援する。</dd><dt>外からの見え方</dt><dd>帝国という体制から、否定的なイメージを持たれることがある。</dd><dt>4つの構成国</dt><dd>帝国に属する4つの「王国」。2つが立憲君主制、2つが議会共和制。固有名・自治権・帝国との権限分担は未設定。「王国」という呼称と各制度の関係も今後整理する。</dd><dt>未設定</dt><dd>評価の期限、罷免の手続き、権力の継承。「内部の指示」という原文の具体的な意味も確認待ち。</dd></dl></article>
    <article class="civilization-g"><span class="kicker">G / REPUBLIC</span><h3>共和制・調和の社会</h3><p>みんなが仲良く暮らし、全体の調和を重視する。発展は遅い一方、協力して社会を支えられる。</p><dl><dt>大切にするもの</dt><dd>協調、調和、仲間と暮らすこと。</dd><dt>未設定</dt><dd>選挙・合意形成・少数意見の扱い。調和を重視しても、全員の性格や考えを同じにはしない。</dd></dl></article></div>
    <h3 class="b">B / 魔法と信仰の3勢力</h3><div class="belief-grid"><article><p class="kicker">LINE MAGIC</p><h3>神国</h3><p>ライン式魔法を使い、多様な宗教を受け入れる。</p><small>宗教間の制度、政治体制、学校との接続は未設定。</small></article><article><p class="kicker">CIRCLE MAGIC</p><h3>教皇国</h3><p>円式魔法を使い、伝統的な宗教を持つ。</p><small>教義・統治制度・他宗教との関係は未設定。伝統を持つことだけで排他的とは決めない。</small></article><article><p class="kicker">UNRESTRICTED MAGIC</p><h3>改神国</h3><p>魔法の制限を持たない組織。危険がある一方、開発や能力を最大限自由に発揮できることもある。</p><small>名称に「国」を含むが、国家としての形態・安全管理・組織の詳細は未設定。</small></article></div><p><small>従来の「線形魔法／回路魔法」と新しい「ライン式／円式」の厳密な対応、および学校・各人物の所属は、まだ確定していません。</small></p><a href="#education">各社会の学校制度へ</a></section>`);
  document.querySelector('#class').insertAdjacentHTML('beforebegin', `
    <section class="card" id="education"><p class="kicker">EDUCATION / DIFFERENT PATHS</p><h2>学ぶ場所にも、社会の考え方がある。</h2><div class="school-groups"><section><h3 class="r">R / 公平な機会と実力</h3><dl><dt>帝国学校</dt><dd>一般校。公平なチャンスを大事にし、エリート校は設けない。</dd><dt>士官学校</dt><dd>規律が厳しい。優秀な人はエリートコースに進む可能性が高いが、それも実力による。</dd></dl><p><small>学校自体の特権化と、実力による進路を区別する。入学条件・評価方法・卒業後の進路は未設定。</small></p></section><section><h3 class="g">G / 国立・市立・公立</h3><dl><dt>国立学校</dt><dd>優秀。</dd><dt>市立学校</dt><dd>特徴は未設定。</dd><dt>公立学校</dt><dd>特徴は未設定。</dd></dl><p><small>3区分の制度上の違い、入学条件、学費は未設定。「国立が優秀」から他の学校の低評価を推定しない。</small></p></section><section><h3 class="b">B / 神学・魔法・一般教育</h3><dl><dt>神学校</dt><dd>神学中心。</dd><dt>魔法学校</dt><dd>魔法中心。</dd><dt>海洋学校</dt><dd>一般校。</dd></dl><p><small>各勢力との対応、入学条件、既存の4学校原案との接続は未設定。海洋学校の名称から専門教育の内容を追加しない。</small></p></section></div></section>`);
  people.forEach(function(p){
    var button=document.createElement('button');button.type='button';button.dataset.person=p.id;button.textContent=p.name;button.setAttribute('aria-pressed','false');
    button.addEventListener('click',function(){state.person=p.id;renderPerson();save();});picker.append(button);
  });
  function renderPerson() {
    var p=people.find(function(p){return p.id===state.person;});
    document.querySelectorAll('[data-person]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.person===p.id));});
    document.querySelector('#person-family').textContent=p.group+' / CHARACTER STUDY';
    document.querySelector('#person-name').textContent=p.name;
    document.querySelector('#person-jp').textContent=p.jp;
    ['facts','role','want','fear','bond','life','scene'].forEach(function(field){document.querySelector('#person-'+field).textContent=p[field];});
    document.querySelector('#person-note').value=state.notes[p.id]||'';
    var portrait=document.querySelector('.person-portrait');
    var portraitIndex=p.id==='elemental'?6:p.id==='mage'?7:p.portrait;
    portrait.style.backgroundPosition=(portraitIndex%3)*50+'% '+Math.floor(portraitIndex/3)*50+'%';
    portrait.setAttribute('aria-label',p.jp+'の外見テスト。未確定の衣装・表情を含みます。');
    document.querySelector('.person-content').dataset.group=p.group;
  }
  document.querySelector('#person-note').addEventListener('input',function(e){state.notes[state.person]=e.target.value;save();});
  document.querySelector('#city-name').value=state.city;
  document.querySelector('#city-priority').value=state.priority;
  regions.forEach(function(region){var option=document.createElement('option');option.value=region.id;option.textContent=region.name;document.querySelector('#region-choice').append(option);});
  var projection,marker,land;
  function renderCity() {
    var site=state.site;
    document.querySelector('#city-heading').textContent=state.city||'まだ名前のない街';
    document.querySelector('#city-summary').textContent=priorities[state.priority].name+'を大切にする街。'+priorities[state.priority].text;
    document.querySelector('#atlas-coordinates').textContent=site?'緯度 '+site.lat.toFixed(2)+'° / 経度 '+site.lon.toFixed(2)+'°':'候補地未選択';
    var match=site&&regions.find(function(r){return Math.abs(r.lon-site.lon)<0.001&&Math.abs(r.lat-site.lat)<0.001;});
    document.querySelector('#region-choice').value=match?match.id:site?'custom':'';
    if(marker){marker.attr('display',site?null:'none');if(site){var point=projection([site.lon,site.lat]);marker.attr('cx',point[0]).attr('cy',point[1]);}}
    document.querySelectorAll('.earth-candidate').forEach(function(el){el.classList.toggle('selected',!!match&&el.dataset.region===match.id);});
  }
  document.querySelector('#region-choice').addEventListener('change',function(e){var region=regions.find(function(r){return r.id===e.target.value;});state.site=region?{lon:region.lon,lat:region.lat}:null;renderCity();save();});
  document.querySelector('#city-name').addEventListener('input',function(e){state.city=e.target.value;renderCity();save();});
  document.querySelector('#city-priority').addEventListener('change',function(e){state.priority=e.target.value;renderCity();save();});
  if(window.d3 && window.topojson && window.triathlonLand) {
    try {
      var svg=d3.select('#earth-map');
      land=topojson.feature(window.triathlonLand,window.triathlonLand.objects.land);
      projection=d3.geoNaturalEarth1().fitExtent([[16,16],[944,494]],{type:'Sphere'});
      var path=d3.geoPath(projection);
      svg.append('path').attr('d',path({type:'Sphere'})).attr('class','earth-ocean');
      svg.append('path').attr('d',path(d3.geoGraticule10())).attr('class','earth-grid');
      svg.append('path').datum(land).attr('d',path).attr('class','earth-land').on('click',function(event){
        var point=projection.invert(d3.pointer(event,svg.node()));
        if(point&&Number.isFinite(point[0])&&Number.isFinite(point[1])){state.site={lon:+point[0].toFixed(2),lat:+point[1].toFixed(2)};renderCity();save();}
      });
      regions.forEach(function(region){var point=projection([region.lon,region.lat]);svg.append('circle').attr('cx',point[0]).attr('cy',point[1]).attr('r',7).attr('class','earth-candidate').attr('data-region',region.id).on('click',function(){state.site={lon:region.lon,lat:region.lat};renderCity();save();}).append('title').text(region.name);});
      marker=svg.append('circle').attr('r',11).attr('class','earth-marker').attr('pointer-events','none');
    } catch(e) { document.querySelector('.map-credit').textContent='地図を表示できません。候補地域と都市構想は利用できます。'; }
  } else {document.querySelector('.map-credit').textContent='地図データを読み込めません。候補地域と都市構想は利用できます。';}
  document.querySelector('#export-draft').addEventListener('click',function(){
    var blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='triathlon-world-draft.json';document.body.append(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  });
  document.querySelector('#clear-draft').addEventListener('click',function(){
    if(!window.confirm('候補地・街の名前・方針・人物メモを、このブラウザから削除しますか？'))return;
    state={version:1,site:null,city:'',priority:'community',person:'fighter',notes:{}};
    document.querySelector('#city-name').value='';document.querySelector('#city-priority').value='community';renderCity();renderPerson();save();
  });
  renderCity();renderPerson();
  document.querySelector('.person-figure figcaption').textContent='v0.12 作画更新案。服装・表情・装飾は未確定。BMとClericの男子・女子という描写も外見テストです。';
  document.querySelector('#art h2').insertAdjacentHTML('afterend','<img class="character-art" src="assets/character-study-v12.png" width="1024" height="1536" loading="lazy" alt="v0.12の9人の作画更新案。上品なナイト、静かなレンジャー、茶髪のBEM、眼鏡のBM、白い聖職服のクレリック。"><p class="art-note">v0.12の更新案。外見の細部と未指定の性別はテストであり、人物設定の最終確定ではありません。以下に旧比較も残しています。</p>');
  document.querySelectorAll('.class-profile').forEach(function(profile,index){
    var button=document.createElement('button');button.type='button';button.className='profile-link';button.textContent='人物を見る';button.addEventListener('click',function(){state.person=people[index].id;renderPerson();save();location.hash='dossier';});profile.append(button);
  });
  document.querySelector('#theme').insertAdjacentHTML('beforeend','<div class="feature-links"><a href="#atlas"><span>WORLD ATLAS</span>地球から街を考える <b aria-hidden="true">→</b></a><a href="#dossier"><span>CHARACTER FILES</span>9人の内面を知る <b aria-hidden="true">→</b></a></div>');
  document.querySelector('#world').insertAdjacentHTML('beforeend','<p><a href="#atlas">地球と都市構想</a> / <a href="#civilizations">R・G・Bの社会と信仰</a></p>');
  document.querySelector('#downloads h2').insertAdjacentHTML('afterend','<h3>大型アップデート v0.12</h3><p>地球マップ・人物図鑑の更新と、R・G・Bの社会設定を記録。</p><p><a href="records/update_v0_12.md" download>v0.12 更新・追加設定をダウンロード</a></p>');
  document.querySelector('#history h2').insertAdjacentHTML('afterend','<p><strong>v0.12 · 2026-10-24</strong> 国境のない地球の海岸線マップ、候補地と街の方針の下書き、9人の人物図鑑・個人メモ・JSON書き出しを追加。人物の願い・不安・日常技能は未確定の提案として区別。</p>');
})();
