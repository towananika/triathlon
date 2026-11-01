(function () {
  'use strict';
  var base = document.currentScript.src;
  var data = {
    's1-fighter': { image: '../assets/characters/fighter-20261031.png', lead: '考えるより先に、一歩。', about: '体を動かすのが好きな、まっすぐな女の子。負ければ悔しい。それでも、もう一度挑んでみる。', moment: '朝練を終えたあとの、焼きそばパン。', height: '同年代女子の平均くらい' },
    's1-knight': { image: '../assets/characters/knight-average-20261031.png', lead: '家の名ではなく、自分の名で。', about: '礼儀と公正を大切にする、育ちのよい女の子。きちんとした姿の奥に、まだ知らない遊びへの好奇心を隠している。', moment: '紅茶をいれて、古い騎士物語を開く。', height: '同年代女子の平均くらい' },
    's1-warrior': { image: '../assets/characters/portraits-20261101/warrior.png', lead: '小さな声でも、自分のことばで。', about: '周りの気持ちによく気づく、ひかえめな女の子。迷いながらも、大切な場面では自分の思いを伝えようとする。', moment: '雨の音を聞きながら、日記をつける。', height: '同年代女子の平均くらい' },
    's1-ranger': { image: '../assets/characters/portraits-20261101/ranger.png', lead: '静かな目で、まだ知らない道へ。', about: '落ち着いていて、ことばは少なめ。森や鳥の声が好き。自分の静けさを保ちながら、仲間との時間も大切にしている。', moment: '人の少ない朝の森で、鳥の声を聞く。', height: '同年代女子より少し高め' },
    's1-assassin': { image: '../assets/characters/portraits-20261101/assassin.png', lead: 'ことばより先に、手を貸す。', about: '目立つことが苦手な、無口な男の子。弱いものは見捨てない。そっけない返事の向こうに、誰かと過ごしたい気持ちがある。', moment: '夜の屋上。静かな場所で、ひと息つく。', height: '同年代男子よりはっきり高め' },
    's1-scout': { image: '../assets/characters/portraits-20261101/scout.png', lead: 'ねえ、こっちにも道があるよ。', about: '知らない路地を見つけると、じっとしていられない。人なつこくて、冒険もお菓子も仲間と分け合いたい男の子。', moment: '知らない道を見つけて、友達を振り返る。', height: '同年代男子より小柄' },
    's1-em': { image: '../assets/characters/portraits-20261101/em.png', lead: '首席の俺に、任せとけって。', about: '新入生首席の、自信家で負けず嫌いな男の子。勝負が大好き。ルイに勝つために、今日も挑み続ける。', moment: '難しい勝負に挑んで、認めてもらえた日。', height: '同年代男子より少し高め' },
    's1-mage': { image: '../assets/characters/portraits-20261101/mage.png', lead: '知るほどに、知らないことが増える。', about: '全国1位の実力を持ちながら、特別扱いは望まない。知らないことを知るのが好きで、誰とでも同じ目線で話す男の子。', moment: '図書館で本を読む時間と、屋上で星を見る時間。', height: '同年代男子の平均くらい' },
    's1-cleric': { image: '../assets/characters/portraits-20261101/cleric.png', lead: '帰ってこられる場所を、ここに。', about: '誰の話もゆっくり聞く、おだやかな女の子。人の世話は得意だけれど、自分のことはつい後回し。', moment: 'お茶を待つ三分と、刺繍のひと針。', height: '同年代女子の平均くらい' }
  };
  Object.keys(data).forEach(function (id) {
    data[id].image = new URL(data[id].image, base).href;
    var c = CHARS.filter(function (x) { return x.id === id; })[0];
    if (c && c.img != null) IMG[c.img] = data[id].image;
  });
  window.TRI_INTRODUCTIONS = data;
})();
