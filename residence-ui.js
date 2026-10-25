(function(){
  'use strict';
  const engine=window.ResidenceSim,key='triathlon-residence-sim-v1';
  if(!engine)return;
  let state,timer=null,storageMessage='初回の30日サンプル';
  try{state=engine.restore(JSON.parse(localStorage.getItem(key)));}catch(e){}
  if(!state)state=engine.advance(engine.createState(),30);else storageMessage='保存した時間から再開';
  const section=document.createElement('section');section.id='simulation';section.className='card';
  section.innerHTML=`<p class="kicker">LIFE EXPERIMENT / RESIDENCE & TIME</p><h2>自分で選んで、住んでみる。</h2><p>6人の成人の仮住民。それぞれが大切にするものを持ち、R・G・Bの暮らしを選ぶ。</p><span class="proposal">ルール式の試作 / 生成AI・ゲーム本編ではありません</span><div class="sim-toolbar"><div class="sim-clock"><strong id="sim-day">30</strong><span>日目</span></div><div class="sim-steps"><button type="button" data-days="1">+1日</button><button type="button" data-days="7">+7日</button><button type="button" data-days="30">+30日</button></div><label class="sim-auto"><input type="checkbox" id="sim-auto"> 自動進行</label><button type="button" id="sim-reset">初日からやり直す</button></div><p id="sim-storage" role="status" class="sim-note"></p><div class="sim-regions" id="sim-regions" aria-label="地域ごとの居住人数"></div><div class="sim-residents" id="sim-residents"></div><details><summary>地域条件と判断の仕組み</summary><p class="sim-note">地域の数値は試作用の仮定。現実の都市の評価や幸福度ではなく、正式なゲーム設定の優劣でもありません。全員成人の仮住民で、既存キャラの経歴・所属は変えません。</p><div class="scroll"><table class="sim-conditions"><thead><tr><th>条件 / 0〜100</th><th>R</th><th>G</th><th>B</th></tr></thead><tbody id="sim-conditions"></tbody></table></div><p class="sim-note">入居先は本人の希望と地域条件の重み付き一致度で選択。行動は満たされていない希望を優先し、余力が低いと休息する。7日ごとに住み続けるか検討し、移住の負担を上回る利点がある場合に移る。疲れが強いと静けさと暮らしを重視する。上限3,650日。</p></details><details open><summary>暮らしの記録</summary><ol class="sim-log" id="sim-log"></ol></details><p class="sim-note">最初の表示は30日を実行した例。保存はこのブラウザ内のみ。下書きの街・人物メモとは別に保存されます。時間はページを閉じている間には進みません。</p>`;
  document.querySelector('#world').after(section);
  const node=id=>document.getElementById(id);
  function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  function save(){
    try{localStorage.setItem(key,JSON.stringify(state));storageMessage='このブラウザに保存済み';}
    catch(e){storageMessage='保存できません。この画面内のみの実行結果です。';}
  }
  function render(){
    node('sim-day').textContent=String(state.day);node('sim-storage').textContent=storageMessage;
    node('sim-regions').replaceChildren();node('sim-residents').replaceChildren();node('sim-log').replaceChildren();
    ['R','G','B'].forEach(city=>{
      const block=element('div',undefined,'sim-region');block.dataset.city=city;
      block.append(element('b',city),element('strong',state.people.filter(p=>p.city===city).length+'人'),element('small',city==='R'?'挑戦と上昇力':city==='G'?'調和と暮らし':'静けさと研究'));
      node('sim-regions').append(block);
    });
    state.people.forEach((person,index)=>{
      const definition=engine.definitions[index],article=element('article',undefined,'sim-person');article.dataset.resident=person.id;
      const heading=element('div',undefined,'sim-person-heading');heading.append(element('h3',definition.name),element('span',person.city?person.city+'に居住':'入居前','sim-city-tag'));
      article.append(heading,element('p',definition.wish,'sim-wish'),element('p','今日：'+person.action));
      const indicators=element('div',undefined,'sim-indicators');
      for(const pair of [['生活充足',person.satisfaction],['余力',person.energy]]){
        const label=element('label',pair[0]+' '+Math.round(pair[1])+'/100'),meter=element('meter');meter.min=0;meter.max=100;meter.value=pair[1];label.append(meter);indicators.append(label);
      }
      article.append(indicators,element('p',person.reason,'sim-reason'));
      const details=element('details');details.append(element('summary','希望と地域の比較'));
      const weights=element('p',engine.metrics.map((m,i)=>m.name+' '+definition.weights[i]).join(' / '),'sim-note');details.append(weights);
      details.append(element('p',person.scores.length?person.scores.map(s=>s.city+' '+s.score.toFixed(1)).join(' / '):'地域の検討前','sim-note'));
      const recent=element('ul');person.history.slice(0,4).forEach(e=>recent.append(element('li',e.day+'日目：'+e.text)));details.append(recent);article.append(details);node('sim-residents').append(article);
    });
    state.log.slice(0,36).forEach(entry=>node('sim-log').append(element('li',entry.day+'日目 / '+entry.id+'：'+entry.text)));
    document.querySelectorAll('[data-days]').forEach(button=>button.disabled=state.day>=3650);
    node('sim-auto').disabled=state.day>=3650;
    if(state.day>=3650)stop();
  }
  engine.metrics.forEach(metric=>{
    const row=element('tr');row.append(element('th',metric.name));
    ['R','G','B'].forEach(city=>{
      const cell=element('td'),input=element('input');input.type='number';input.min='0';input.max='100';input.step='1';input.value=state.conditions[city][metric.id];input.dataset.city=city;input.dataset.metric=metric.id;input.setAttribute('aria-label',city+'の'+metric.name);
      input.addEventListener('change',()=>{
        const value=input.valueAsNumber;
        if(!Number.isFinite(value)||!input.checkValidity()||value<0||value>100){input.value=state.conditions[city][metric.id];return;}
        state.conditions[city][metric.id]=value;save();render();
      });cell.append(input);row.append(cell);
    });node('sim-conditions').append(row);
  });
  function forward(days){engine.advance(state,days);save();render();}
  function stop(){if(timer!==null){clearInterval(timer);timer=null;}node('sim-auto').checked=false;}
  document.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>forward(Number(button.dataset.days))));
  node('sim-auto').addEventListener('change',()=>{if(node('sim-auto').checked){timer=setInterval(()=>forward(1),1200);}else stop();});
  node('sim-reset').addEventListener('click',()=>{
    if(!window.confirm('この試作の時間と暮らしの記録だけを初日に戻しますか？'))return;
    stop();state=engine.createState();document.querySelectorAll('.sim-conditions input').forEach(input=>input.value=state.conditions[input.dataset.city][input.dataset.metric]);save();render();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    window.addEventListener('hashchange',()=>{queueMicrotask(()=>{if(section.closest('[role="tabpanel"]').hidden)stop();});});
  window.addEventListener('pagehide',stop);
  document.querySelector('#theme').insertAdjacentHTML('beforeend','<div class="feature-links"><a href="#simulation"><span>LIFE EXPERIMENT</span>6人の暮らしを進める <b aria-hidden="true">→</b></a></div>');
  document.querySelector('#downloads h2').insertAdjacentHTML('afterend','<h3>暮らしと時間の試作 v0.15</h3><p><a href="records/residence_simulation_v0_15.md" download>試作のルール・仮定・30日結果をダウンロード</a></p>');
  document.querySelector('#history h2').insertAdjacentHTML('afterend','<p><strong>v0.15 · 2026-10-25</strong> 成人の仮住民6人が希望で地域と日々の行動を選ぶルール式試作。1日・7日・30日の進行、週ごとの移住検討、条件変更、記録、ブラウザ内保存を追加。生成AIやゲーム本編ではない。</p>');
  render();
})();
