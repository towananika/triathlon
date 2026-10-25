(function(){
  'use strict';
  const groups=[
    {id:'white',name:'ホワイト / White',season:3,people:[['女子','のんびりした交渉上手','急かさない笑顔で話を聞くが、大切な条件は忘れず押さえる。落ち着いて見えて、人とのやり取りを楽しむ。'],['男子','気さくで自然に人が集まる','褒め方が具体的で、人に囲まれるのが好き。ただ、ときどき誰にも会わない日を作る。']]},
    {id:'black',name:'ブラック / Black',season:3,people:[['女子','よく笑う現実派','欲しい物やお金の話を隠さない。取引は明快で、相手にも得がある形を探す。'],['男子','静かな段取り上手','目立たず準備を整える。感謝されると平静を装うが、少し声が明るくなる。']]},
    {id:'gray',name:'グレイ / Gray',season:3,people:[['女子','大胆な仲裁役','双方の話は聞くが、中立を装って逃げない。「私はこっちだと思う」と自分の意見を言える。'],['男子','気取らない職人気質','話しながら手を動かす。直した道具や、覚えていた好みから気遣いが伝わる。']]},
    {id:'empty',name:'エンプティ / Empty',season:4,people:[['女子','慎重なのに冒険好き','初めてのことには緊張する。それでも調べて一歩ずつ試す。踏み出す勇気が表情に見える。'],['男子','教わるのが上手','最初から何でもできるわけではないが、知らないことを恥じない。小さな上達を本気で喜べる。']]}
  ];
  function create(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  function season(number,title){
    const section=create('section',undefined,'card');section.id='season'+number;
    section.append(create('p','SEASON '+number+' / NEXT CHAPTERS','kicker'),create('h2',title),create('p','各区分に女子・男子を1人ずつ。おすすめの性格案を採用した人物原型。固有名・クラス・年齢・外見・所属・登場順は未確定。'));
    const list=create('div',undefined,'future-cast-grid');
    groups.filter(g=>g.season===number).forEach(group=>{
      const family=create('section',undefined,'future-cast-family');family.dataset.group=group.id;family.append(create('h3',group.name));
      group.people.forEach(person=>{const article=create('article',undefined,'future-character');article.dataset.gender=person[0];article.append(create('small',person[0]),create('h4',person[1]),create('p',person[2]));family.append(article);});
      list.append(family);
    });
    section.append(list,create('p','現代服・制服を好みで選び、髪色だけでなく表情・姿勢・人との距離感で描き分ける。男女は恋人の固定ペアではなく、それぞれ独立した人物。色から善悪や性格を自動的に決めない。','muted'));
    return section;
  }
  const third=season(3,'第3期、ホワイト・ブラック・グレイ。'),fourth=season(4,'第4期、エンプティ。');
  document.querySelector('#season2').after(third);third.after(fourth);
  document.querySelector('.season-jumps').insertAdjacentHTML('beforeend','<a href="#season3">第3期 / White・Black・Gray</a><a href="#season4">第4期 / Empty</a>');
  document.querySelector('#relationships').insertAdjacentHTML('afterend', `
    <section class="card" id="family-life"><p class="kicker">LIFE & GENERATIONS / DESIGN</p><h2>結婚・出産・育児も、それぞれの人生に。</h2><span class="proposal">採用した企画方針 / 家族システムは未実装</span><p>成人後、本人同士の希望と同意を前提に、関係・暮らし・家族の形を選ぶ。結婚すること、子どもを持つことを全員の成功条件にはしない。</p><div class="future-family-grid"><section><h3>結婚と共同生活</h3><p>互いの希望、住む場所、仕事や学び、一人の時間を話し合う。親密さの数値だけで自動的に結婚させない。結婚しない関係や単身生活も選べる。</p></section><section><h3>出産と育児</h3><p>子どもを望むか、育てる環境があるかを人生の選択として扱う。出産は生活イベントを中心にし、育児は特定の性別や一人だけに自動的に押しつけない。</p></section><section><h3>家族と社会</h3><p>住居、保育、学校、働き方、家事・育児の分担などが暮らしに影響する。困りごとから周囲に相談し、支援の仕組みを作る企画につなげる。</p></section></div><p><small>第1期の中学生設定は外見テスト。結婚・出産は成人期として分ける。成人になる年齢、妊娠・出産の期間、人口増加、養育・成長・世代交代の数値とルールは未設定。現在の6人の試作は成人の仮住民で、家族・出生・加齢は計算していません。</small></p></section>`);
  document.querySelector('#downloads h2').insertAdjacentHTML('afterend','<h3>第3〜4期と人生設計 v0.16</h3><p><a href="records/future_cast_and_family_v0_16.md" download>採用した8人の性格・結婚と育児の方針</a></p><p><a href="records/community_improvement_v0_16.md" download>共同改善のルールと10年比較</a></p>');
})();
