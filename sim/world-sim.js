// 二水の世界シミュレーション。現実の1日＝世界の1日。
// 世界は新暦312年4月1日（9人の入学式）にはじまった。2026-10-25（日本時間）に10年進め、この日が新暦322年4月1日。乱数は日付から決めるので、同じ日ならだれが開いても同じ世界になる。
// 中身：州ごとの気候（気温・雨・雪・台風）→ 8つの産業の生産 → 食べ物・材料・製品の在庫と値段 → 州どうしの取引
// → 仕事の移り変わり・失業 → 暮らしの満足 → 人口（生まれる・亡くなる・引っこす）。二水の洞のにぎわいと、9人の一日もここから。
// ユーザーの町は、あとで towns として足せるようにしてある（いまは空）。
// 3つの国は開拓団を出して新しい土地をひらき（SITES）、その先で知らなかった文明（CIVS）に出会う。
(function (root) {
  'use strict';
  var DEV = root.TRI_DEVELOPMENT || (typeof module === 'object' && module.exports ? require('./development.js') : null);
  var EPOCH = Date.UTC(2026, 9, 24, 15); // 日本時間 2026-10-25 0:00
  var DAY = 864e5, TAU = Math.PI * 2;
  var MON = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3], MLEN = [30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28, 31];
  var WK = ['日', '月', '火', '水', '木', '金', '土'];

  function rng(seed) { var a = seed | 0; return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function gauss(r) { return (r() + r() + r() - 1.5) * 1.4; }

  function wdate(d) {
    var y = 312 + Math.floor(d / 365), n = ((d % 365) + 365) % 365, i = 0;
    while (n >= MLEN[i]) { n -= MLEN[i]; i++; }
    var real = new Date(EPOCH + d * DAY + 9 * 36e5), y2 = MON[i] <= 3 ? y + 1 : y;
    return { y: y2, school: y, m: MON[i], d: n + 1, doy: (((d % 365) + 365) % 365 + 90) % 365, wd: real.getUTCDay(), label: '新暦' + y2 + '年' + MON[i] + '月' + (n + 1) + '日（' + WK[real.getUTCDay()] + '）' };
  }
  var SHIFT = 12410; // 2026-10-25 に10年先へ、2026-10-26 にさらに24年先へ（新暦346年：3つの国が未来のしくみを60%とり入れた年）
  function today(now) { return Math.floor(((now || Date.now()) - EPOCH) / DAY) + SHIFT; }

  // 産業：[キー, 名前, 作るもの, 1人1日あたり, 色]
  var SECT = [['a', '農業', 'food', 11.5, '#7cb342'], ['f', '漁業', 'food', 9.5, '#26a6c9'], ['fo', '林業', 'mat', 7, '#2e7d32'], ['mi', '採掘（灯石・石）', 'mat', 9, '#8d6e63'],
    ['ma', '製造', 'goods', 7.6, '#5c6bc0'], ['co', '商業', 'serv', 1, '#ef8a5a'], ['tr', '運輸', 'serv', 1, '#f2b134'], ['pu', '公共（役所・学校・川守隊）', 'serv', 1, '#9e9e9e']];
  // 州：[名前, 国, 人口(万), 緯度, 海の近さ0〜1, 高さ補正℃, 産業の割合 a f fo mi ma co tr pu]
  var PROV = [
    ['二水州', '水和国', 120, 37.6, .4, 0, [.04, .01, .01, .01, .22, .30, .14, .27]],
    ['平川州', '水和国', 40, 37.4, .2, -1.5, [.38, 0, .18, .03, .12, .12, .07, .10]],
    ['玉石州', '水和国', 60, 35.6, .8, 0, [.30, .10, .03, .15, .12, .12, .08, .10]],
    ['南田州', '水和国', 50, 35.5, .9, 0, [.30, .15, .03, .02, .12, .13, .15, .10]],
    ['明山州', '文光国', 70, 38.9, .5, -1, [.06, .02, .03, .04, .20, .25, .10, .30]],
    ['北林州', '文光国', 20, 40.4, .2, -3, [.15, 0, .40, .10, .10, .10, .05, .10]],
    ['星原州', '文光国', 30, 39.6, .3, -1, [.45, 0, .05, .05, .10, .15, .08, .12]],
    ['白港州', '改神国', 90, 33.8, 1, 2.5, [.05, .08, .01, .01, .22, .28, .18, .17]],
    ['花田州', '改神国', 30, 33.8, .8, 2, [.45, .05, .05, .02, .10, .15, .08, .10]],
    ['火山州', '改神国', 35, 31.9, .9, 2.5, [.20, .06, .04, .25, .20, .10, .05, .10]]
  ];
  // つながり：[州, 州, 海路か]
  var LINK = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [0, 4, 0], [4, 5], [4, 6], [5, 6], [3, 7, 1], [7, 8], [7, 9], [8, 9], [2, 7, 1]];
  var DONG = [
    ['岬口洞', '西岸区', '公園', 800, 1], ['文山洞', '西岸区', '学園', 5200, 0], ['森下洞', '西岸区', '森', 1900, 0],
    ['松原洞', '中洲区', '住まい', 3400, 0], ['中路洞', '中洲区', 'お店', 6100, 0], ['川守洞', '中洲区', '役所', 2800, 1],
    ['渡口洞', '南岸区', '渡し場', 4300, 1], ['白石洞', '南岸区', '工事中', 900, 1], ['米市洞', '南岸区', '市場', 7400, 0],
    ['工房洞', '南岸区', '工房', 5600, 0], ['川尾洞', '南岸区', '港', 3200, 1]
  ];
  var CH = [
    ['アカリ', '渡口洞', '渡し場の桟橋', '渡口洞', '演習場で走りこみ'], ['シオン', '松原洞', '屋敷の書庫の窓辺', '松原洞', '書庫で本を読む'],
    ['ツバサ', '渡口洞', '雨の日の停留所', '中路洞', 'アカリのあとを追いかける'], ['シズク', '森下洞', '北の森の入り口', '森下洞', '森で鳥を見る'],
    ['カイ', '文山洞', '寮の屋上', '文山洞', '灯台館の窓をこっそり直す'], ['ミナト', '米市洞', '市場の裏路地', '米市洞', '近道をさがして迷う'],
    ['リク', '中路洞', '学園の演習場', '文山洞', '魔法の練習'], ['ルイ', '川守洞', '図書館の天窓の下', '文山洞', '図書館で調べもの'],
    ['セイラ', '川尾洞', '船着き場の古い茶屋', '川尾洞', '茶屋でお茶をいれる']
  ];
  // 国：政治のしくみ、政党や代表、方針（税・予算の分け方：産業・暮らし・軍）
  var NATS = [
    { cur: '文', fx: 1, name: '水和国', sys: '議会（4年ごとの選挙）', head: '首相', parties: [['ひらく会', '大橋や港を作って町を広げる', .12, [.45, .35, .20]], ['守る会', '川辺と暮らしを守り、ゆっくり変える', .10, [.25, .50, .25]]], prov: [0, 1, 2, 3], army: '川守隊（町の守りと救助）' },
    { cur: '玉', fx: .8, name: '文光国', sys: '学者の評議会（1年ごとに議長が交代）', head: '議長', parties: [['評議会', '学問と灯石の研究を国の柱にする', .14, [.40, .40, .20]]], prov: [4, 5, 6], army: '山岳警備隊' },
    { cur: '金', fx: 1.5, name: '改神国', sys: '神殿と祭司長（任期なし）', head: '祭司長', parties: [['神殿', '祈りと港の商いで国をまとめる', .13, [.30, .40, .30]]], prov: [7, 8, 9], army: '白港の海軍' }
  ];
  // 開拓の候補地：[名前, 国, 緯度, 経度, 海をこえるか, 土地のようす]（国ごとに上から順に開く）
  var SITES = [
    ['風島', 0, 33.4, 126.6, 1, '南の海に浮かぶ、風の強い火山の島'], ['北原', 1, 41.8, 125.9, 0, '北林の先の、白樺と草の原'], ['雲島', 2, 34.4, 129.3, 1, '白港と東の陸のあいだの、霧の島'],
    ['石原', 0, 40.1, 123.6, 1, '西の海をわたった先の、石の多い半島'], ['白河', 1, 43.6, 128.4, 0, '北の大河のほとり。冬はこおる'], ['長浜', 2, 35.4, 133.0, 1, '東の大きな陸の、長い砂浜'],
    ['西岸', 0, 36.6, 120.6, 1, '西の大陸の、山がちな岬'], ['遠浜', 2, 36.6, 136.6, 1, '東の陸の奥、雪の多い浜'], ['黒森', 1, 45.8, 131.0, 0, '黒い針葉樹の森が続く土地']
  ];
  // まだだれも知らない文明：[名前, 中心の緯度, 経度, 人口(万), 近い候補地, 説明, 色]
  var CIVS = [
    ['大河の民', 34.8, 115.5, 900, [3, 6], '西の大陸の大きな川ぞいの古い国。町全体で子どもを育てるしくみがあり、子どもの声が絶えない。', '#b5651d'],
    ['白樺の民', 46.5, 127.5, 40, [1, 4, 8], '北の森と草原の人びと。家をひとりで持たず、季節ごとに住まいを分け合いながら暮らす。', '#5b8c5a'],
    ['東雲国', 35.6, 137.6, 300, [5, 7], '東の山と海の国。鉄と機械の技で、人が働く時間を週30時間まで減らした。', '#c0392b'],
    ['珊瑚の民', 26.4, 127.9, 15, [0, 2], '南の島々を舟でつなぐ海の人びと。だれもひとりにしない「舟の組」で暮らす。', '#1e8bc3']
  ];
  // 出会った文明は、3つの国（現代）より進んだ社会（2026-10-26 ひびき：現代40%、進んだ社会60%）。[段階, 分野, しくみ]
  var CIV_ADV = [[4, '子育て', '「町の子は町の子」。親が働くあいだ、近所の家とまなびやが順番に子を見る。子を持たない人も、週に半日は子どもと過ごす。'],
    [3, '住まい', '家は「買う」でも「借りる」でもなく「使う」。町の家をみんなで持ち、暮らしに合わせて広さを替える。家賃は収入の2割まで。'],
    [4, '働く時間', '機械にできる仕事は機械に。働く時間の短さを、国のほこりにしている。'],
    [3, 'ひとりぼっち', '「舟の組」。家族でなくても5〜8人で組をつくり、毎晩いっしょに食べる。']];
  var STAGE = [[0, '開拓地'], [1000, '村'], [5000, '町'], [20000, '市']];
  function stageOf(n) { var t = STAGE[0][1]; STAGE.forEach(function (x) { if (n >= x[0]) t = x[1]; }); return t; }
  var CHAIRS = ['明山リン', '星原ソウ', '北林カナ', '明山ハク', '星原ユイ'];
  var CAL = [[4, 1, '二水学園の入学式'], [5, 15, '新緑の遠足'], [4, 5, '花の渡し（川べりの花見）'], [6, 5, '初夏の灯石祭り'], [6, 20, '夏の力だめし'], [7, 25, '灯籠祭りの準備がはじまる'], [8, 15, '灯籠祭り'], [9, 20, '体育祭・三種リレー'],
    [10, 18, '学園対抗戦'], [11, 15, '文化祭'], [12, 10, '冬の川守訓練'], [1, 7, '新年の灯流し'], [12, 22, '冬至の灯石鍋'], [2, 20, '冬のふりかえりの日'], [3, 10, '卒業式']];

  // ---- 気候 ----
  // 年の平均気温は緯度と海の近さで、季節の差は内陸ほど大きい。雨は7月の梅雨がいちばん多い。台風は8〜9月の海沿い。
  function climate(pi, d) {
    var P = PROV[pi], w = wdate(d), r = rng(d * 7919 + pi * 131 + 13);
    var mean = 30 - .47 * P[3] + P[5] + P[4] * 2, amp = 15 - P[4] * 5;
    var t = mean - amp * Math.cos(TAU * (w.doy - 15) / 365) + gauss(r) * 2.2;
    var wet = .16 + .34 * Math.exp(-Math.pow((w.doy - 195) / 28, 2)) + .08 * P[4];
    var x = r(), k, typh = (w.m === 8 || w.m === 9) && P[4] > .6 && r() < .025;
    if (typh) k = 'typhoon';
    else if (x < wet * .18 && w.m >= 6 && w.m <= 9) k = 'storm';
    else if (x < wet) k = t < 1 ? 'snow' : 'rain';
    else if (x < wet + .22) k = 'cloud';
    else k = 'sun';
    var mm = k === 'typhoon' ? 120 + r() * 120 : k === 'storm' ? 60 + r() * 80 : k === 'rain' ? 4 + r() * 25 : k === 'snow' ? 2 + r() * 10 : 0;
    return { t: +t.toFixed(1), k: k, mm: Math.round(mm) };
  }
  var WX = { sun: ['晴れ', '☀️'], cloud: ['くもり', '☁️'], rain: ['雨', '🌧️'], snow: ['雪', '❄️'], storm: ['大雨', '⛈️'], typhoon: ['台風', '🌀'] };

  function schoolDay(w) {
    if (w.wd === 0 || w.wd === 6) return false;
    if ((w.m === 7 && w.d >= 25) || w.m === 8) return false;
    if ((w.m === 12 && w.d >= 25) || (w.m === 1 && w.d < 7)) return false;
    if (w.m === 3 && w.d > 20) return false;
    return true;
  }
  // 農業の季節：植える春、育つ夏、とり入れの秋、休む冬
  var AGRI = { 4: .8, 5: .8, 6: 1, 7: 1, 8: 1, 9: 2.5, 10: 2.5, 11: .6, 12: .1, 1: .1, 2: .1, 3: .4 };
  var NEED = { food: 1, goods: .6 }, PRICE0 = { food: 1, mat: 1.2, goods: 2 };

  function natOf(pi) { return pi < 4 ? 0 : pi < 7 ? 1 : 2; }
  function init() {
    var s = { prov: [], dong: [], towns: [], flood: 0, nat: NATS.map(function (N, i) {
      return { name: N.name, party: 0, chair: 0, approval: 55, soldiers: [1.4, .8, 1.1][i], equip: [50, 45, 60][i], budget: 0, unrest: 0, fx: N.fx, debt: 0, cpi: 100, cpiHist: [], trade: 0, tradeY: 0, gdpY: 0 };
    }), rel: [[0, 20, 10], [20, 0, -10], [10, -10, 0]], treaty: {}, col: [], last: [-60, -60, -60],
      civ: CIVS.map(function (c) { return { name: c[0], known: false, day: null, by: null, pop: c[3], rel: [0, 0, 0], trade: false }; }) };
    PROV.forEach(function (P) {
      var o = { name: P[0], nat: P[1], pop: P[2], unemp: .04, share: P[6].slice(), stock: { food: P[2] * 120, mat: P[2] * 20, goods: P[2] * 30 }, price: { food: 1, mat: 1.2, goods: 2 },
        out: {}, income: 0, mood: 60, short: 0, wx: null, base: P[6].slice() };
      s.prov.push(o);
    });
    s.dong = DONG.map(function (g) { return { name: g[0], ku: g[1], use: g[2], pop: g[3], busy: 50, shops: Math.round(g[3] / 300), river: g[4] }; });
    // 新暦312年の出発点（2026-10-26 ひびき「速すぎる」）：新暦200年ごろから早送りで進んできた社会。電気や水道はもう多くの家にあり、ゆっくり現代（320年）に届く
    var START = {institutions: .82, research: .72, power: .78, water: .78, health: .70, education: .82, communications: .65};
    s.development = DEV ? NATS.map(function (n) { return DEV.create(n.name, START); }) : [];
    return s;
  }

  function step(s, d) {
    var w = wdate(d), r = rng(d * 104729 + 7), ev = [];
    var cal = CAL.filter(function (c) { return c[0] === w.m && c[1] === w.d; })[0];
    if (cal) ev.push({ k: 'school', t: cal[2], where: '文山洞' });

    // 1. 気候と生産
    s.prov.forEach(function (p, i) {
      var wx = p.wx = climate(i, d), workers = p.pop * .48 * (1 - p.unemp), out = { food: 0, mat: 0, goods: 0, serv: 0 }, val = 0;
      var agri = AGRI[w.m] * (wx.k === 'typhoon' ? .2 : wx.k === 'storm' ? .6 : 1) * (wx.t > 33 ? .8 : 1) * (wx.t < -10 ? .5 : 1);
      SECT.forEach(function (S, j) {
        var pol = NATS[natOf(i)].parties[s.nat[natOf(i)].party], boost = 1 + pol[3][0] * .1;
        var n = workers * p.share[j], prod = boost * S[3] * Math.pow((p.base[j] + .01) / (p.share[j] + .01), .3); // 人が多すぎると1人あたりは減る
        if (S[0] === 'a') prod *= agri;
        if (S[0] === 'f') prod *= wx.k === 'typhoon' || wx.k === 'storm' ? 0 : (w.m >= 12 || w.m <= 2 ? .6 : 1);
        if (S[0] === 'fo') prod *= wx.k === 'snow' ? .4 : 1;
        if (S[0] === 'ma') prod *= Math.min(1, p.stock.mat / Math.max(1, workers * p.share[j] * prod * .5) );
        var q = n * prod; out[S[2]] += q;
        p.wage = p.wage || []; var py = S[3] * Math.pow((p.base[j] + .01) / (p.share[j] + .01), .3) * (S[0] === 'a' ? .91 : 1); // 給料の目安（農業は1年をならす）
        p.wage[j] = S[2] === 'serv' ? 10 * (1 + (p.mood - 60) / 200) : py * p.price[S[2]] - (S[0] === 'ma' ? py * .5 * p.price.mat : 0);
      });
      p.stock.mat -= out.goods * .5;
      p.stock.food += out.food; p.stock.mat += out.mat; p.stock.goods += out.goods;
      // 暮らしで使う分
      var needF = p.pop * NEED.food, needG = p.pop * NEED.goods;
      var eatF = Math.min(p.stock.food, needF), useG = Math.min(p.stock.goods, needG);
      p.stock.food -= eatF; p.stock.goods -= useG; p.stock.mat = Math.max(0, p.stock.mat);
      p.short = p.short * .9 + (1 - eatF / needF) * .1;
      p.out = out;
      val = out.food * p.price.food + out.mat * p.price.mat + out.goods * p.price.goods + out.serv * 1.6;
      p.income = p.income ? p.income * .97 + (val / p.pop) * .03 : val / p.pop;
    });
    // 2. 値段：在庫が目標より少ないと上がる
    s.prov.forEach(function (p) {
      ['food', 'mat', 'goods'].forEach(function (g) {
        var target = p.pop * (g === 'food' ? 90 : g === 'mat' ? 15 : 25);
        var want = PRICE0[g] * clamp(Math.pow(target / Math.max(1, p.stock[g]), .5), .4, 4);
        p.price[g] = +(p.price[g] * .9 + want * .1).toFixed(3);
      });
    });
    // 3. 取引：安い州から高い州へ、運輸の人数と道（海は嵐で止まる）に応じて
    LINK.forEach(function (L) {
      var A = s.prov[L[0]], B = s.prov[L[1]], sea = L[2] === 1;
      if (sea && (/storm|typhoon/.test(A.wx.k) || /storm|typhoon/.test(B.wx.k))) { if (r() < .3) ev.push({ k: 'prov', t: A.name + 'と' + B.name + 'のあいだの船が嵐で止まった', where: A.name }); return; }
      var na = natOf(L[0]), nb = natOf(L[1]), rl = na === nb ? 100 : s.rel[na][nb];
      if (rl < -40) return; // 関係が悪いと取引は止まる
      var cap = (1 + rl / 200) * (s.treaty[Math.min(na, nb) + '-' + Math.max(na, nb)] ? 1.4 : 1) * (A.pop * A.share[6] + B.pop * B.share[6]) * .48 * (sea ? 16 : 24) * (A.wx.k === 'snow' || B.wx.k === 'snow' ? .5 : 1);
      ['food', 'mat', 'goods'].forEach(function (g) {
        var from = A.price[g] < B.price[g] ? A : B, to = from === A ? B : A, gap = (to.price[g] - from.price[g]) / (to.price[g] + from.price[g]);
        if (gap < .03) return;
        var q = Math.min(cap * gap, from.stock[g] * .08); from.stock[g] -= q; to.stock[g] += q * .97;
        if (na !== nb) { var v = q * from.price[g], fi = from === A ? na : nb, ti = from === A ? nb : na; s.nat[fi].trade += v; s.nat[ti].trade -= v; }
      });
    });
    // 4. 仕事の移り変わり（週に一度）：給料のよい産業へ少しずつ。売れ残りが多いと失業がふえる
    if (w.wd === 1) s.prov.forEach(function (p) {
      var avg = p.wage.reduce(function (a, v, j) { return a + v * p.share[j]; }, 0);
      p.share = p.share.map(function (sh, j) { return clamp(sh * (1 + clamp((p.wage[j] - avg) / avg, -.2, .2) * .02), p.base[j] * .5, p.base[j] * 1.8 + .01); });
      var sum = p.share.reduce(function (a, v) { return a + v; }, 0); p.share = p.share.map(function (v) { return v / sum; });
      var glut = p.stock.goods / (p.pop * 25);
      var winter = w.m === 12 || w.m <= 2 ? p.share[0] * .15 : 0;
      p.unemp = clamp(p.unemp * .8 + (.035 + clamp(glut - 1, -.5, 2) * .03 + winter + p.short * .1) * .2, .015, .25);
    });
    // 5. 満足と人口
    var avgMood = 0;
    s.prov.forEach(function (p) {
      var wx = p.wx, comfort = wx.k === 'sun' ? 3 : wx.k === 'typhoon' ? -15 : wx.k === 'storm' ? -8 : (wx.t > 32 || wx.t < -12) ? -4 : 0;
      var pol2 = NATS[natOf(s.prov.indexOf(p))].parties[s.nat[natOf(s.prov.indexOf(p))].party];
      var target = 66 + pol2[3][1] * 12 - pol2[2] * 30 - s.nat[natOf(s.prov.indexOf(p))].unrest * .2 - p.short * 120 - (p.price.food - 1) * 15 - (p.unemp - .04) * 250 + (p.income - 4) * 1.5 + comfort + (cal && cal[2] === '灯籠祭り' && p.name === '二水州' ? 10 : 0);
      p.mood = clamp(p.mood * .95 + target * .05, 0, 100); avgMood += p.mood / s.prov.length;
      p.pop *= 1 + (.010 - .009 - p.short * .02) / 365;
    });
    if (w.d === 1) s.prov.forEach(function (p) { p.pop *= 1 + (p.mood - avgMood) * .00015 + .0005 + (society(w.y).tfr - 2.1) * .0006 + (p.mood - 55) * .00003 - (p.price.food > 1.5 ? .001 : 0); }); // 月ごと：生まれる・亡くなる（満足と食べ物で年0〜1%ほど）、引っこす

    // 6. 政治・軍事・外交
    s.nat.forEach(function (n, i) {
      var N = NATS[i], pol = N.parties[n.party], ps = N.prov.map(function (k) { return s.prov[k]; });
      var pop = ps.reduce(function (a, p) { return a + p.pop; }, 0), mood = ps.reduce(function (a, p) { return a + p.mood * p.pop; }, 0) / pop;
      var inc = ps.reduce(function (a, p) { return a + p.income * p.pop; }, 0);
      n.pop = pop; n.mood = mood; n.gdp = inc;
      n.budget = inc * pol[2]; // 1日の税収
      // 国の借金：ひらく会は工事のために借りる。利子は2%
      var big = n.debt > n.gdpY * .3; n.austere = big; // 借金が1年の生産の3割をこえたら、出費をおさえる
      var spend = n.budget * (i === 0 && n.party === 0 && !big ? 1.12 : big ? .96 : 1.0) + n.debt * .02 / 365;
      n.debt = Math.max(0, n.debt + spend - n.budget);
      n.gdpY = n.gdpY * (364 / 365) + inc;
      // 物価（食べ物6割・製品4割）
      var fp = ps.reduce(function (a, p) { return a + p.price.food * p.pop; }, 0) / pop, gp = ps.reduce(function (a, p) { return a + p.price.goods * p.pop; }, 0) / pop;
      n.cpi = (fp * .6 + gp / 2 * .4) * 100;
      n.cpiHist.push(n.cpi); if (n.cpiHist.length > 365) n.cpiHist.shift();
      n.infl = n.cpiHist.length > 30 ? (n.cpi / n.cpiHist[0] - 1) * 100 : 0;
      // 為替：貿易で稼ぐ国の通貨は強く、物価が上がる国の通貨は弱く
      n.tradeY = n.tradeY * .995 + n.trade; n.trade = 0;
      n.fx = clamp(n.fx * (1 + clamp(n.tradeY / Math.max(1, inc * 300), -.0005, .0005) - clamp((n.infl || 0) / 365 / 100, -.0003, .0003)) + (N.fx - n.fx) * .002, N.fx * .5, N.fx * 2);
      n.approval = clamp(n.approval * .98 + (mood - 5 - (n.austere ? 6 : 0)) * .02 + (r() - .5), 5, 95);
      n.unrest = clamp(n.unrest * .97 + (n.approval < 35 ? 2 : 0), 0, 100);
      var threat = s.nat.reduce(function (a, o, j) { return j === i ? a : a + Math.max(0, -s.rel[i][j]) / 100 * o.soldiers; }, 0);
      var want = pop * (.04 + pol[3][2] * .05) * (1 + threat * .15) / 10;
      n.soldiers = +(n.soldiers + (want - n.soldiers) * .002).toFixed(3);
      n.equip = clamp(n.equip + (35 + pol[3][2] * 100 + threat * 20 - (n.austere ? 10 : 0) - n.equip) * .003, 0, 100); // 予算の軍の分と、まわりの脅威で装備がそろう
      n.power = Math.round(n.soldiers * 10 * (.5 + n.equip / 100));
      if (n.unrest > 40 && r() < .05) ev.push({ k: 'pol', t: N.name + 'で、暮らしへの不満を訴える集まりがあった', where: N.name });
    });
    // 選挙（水和国：4年ごと、10月1日）と議長交代（文光国：4月1日）
    if (w.m === 10 && w.d === 1 && (w.school - 313) % 4 === 0) {
      var n0 = s.nat[0]; n0.terms = (n0.terms || 0) + 1;
      var keep = n0.approval + (r() - .5) * 24 - n0.terms * 5 > 45, old = NATS[0].parties[n0.party][0];
      if (!keep) { n0.party = 1 - n0.party; n0.terms = 0; }
      n0.approval = keep ? n0.approval : 60;
      ev.push({ k: 'pol', t: '水和国の選挙：' + NATS[0].parties[n0.party][0] + (keep ? 'が勝ち、今の方針が続く' : 'が勝ち、' + old + 'から政権が交代した'), where: '水和国' });
    }
    if (w.m === 4 && w.d === 1 && d > 0) { s.nat[1].chair = (s.nat[1].chair + 1) % CHAIRS.length; ev.push({ k: 'pol', t: '文光国の評議会で、新しい議長に' + CHAIRS[s.nat[1].chair] + 'が選ばれた', where: '文光国' }); }
    // 改神国：祭司長は任期なし。年をとると代わる（およそ12年に1度）
    if (w.m === 1 && w.d === 7 && r() < .08) { var n2 = s.nat[2]; n2.chair = (n2.chair || 0) + 1; n2.approval = clamp(n2.approval + 8, 5, 95); ev.push({ k: 'pol', t: '改神国で祭司長が代わり、' + n2.chair + '代目の祭司長が鐘を鳴らした', where: '改神国' }); }
    // 外交：取引が多いと仲よく、相手の軍が増えると警戒。小さな事件や話し合いも
    [[0, 1, '国境の山道'], [0, 2, '南の海の漁場'], [1, 2, '北の海']].forEach(function (pr) {
      var a = pr[0], b = pr[1], A = s.nat[a], B = s.nat[b], rel = s.rel[a][b];
      var drift = (15 - rel) * .003 - (A.power + B.power) * .0005 + (A.mood + B.mood - 120) * .002;
      if (r() < .006) { var hit = 4 + Math.round(r() * 10); drift -= hit; ev.push({ k: 'dip', t: pr[2] + 'で、' + A.name + 'と' + B.name + 'のもめごと（関係 −' + hit + '）', where: A.name }); }
      if (rel < 20 && r() < .012) { drift += 8; ev.push({ k: 'dip', t: A.name + 'と' + B.name + 'が話し合いの場をもった（関係 +8）', where: A.name }); }
      var key = a + '-' + b;
      if (rel > 30 && !s.treaty[key] && r() < .01) { s.treaty[key] = d; ev.push({ k: 'dip', t: A.name + 'と' + B.name + 'が通商条約を結んだ。行き来がふえる', where: A.name }); }
      if (rel < 0 && s.treaty[key]) { delete s.treaty[key]; ev.push({ k: 'dip', t: A.name + 'と' + B.name + 'の通商条約が止まった', where: A.name }); }
      if (rel < -40 && r() < .02) ev.push({ k: 'mil', t: pr[2] + 'で両国の兵が向かい合い、緊張が続いている', where: A.name });
      s.rel[a][b] = s.rel[b][a] = clamp(rel + drift, -100, 100);
    });

    // 6.5 開拓と、知らなかった文明との出会い
    s.nat.forEach(function (n, i) {
      var next = SITES.filter(function (x, k) { return x[1] === i && !s.col.some(function (c) { return c.site === k; }); })[0];
      if (!next || d - s.last[i] < 90 || n.approval < 30) return;
      if (r() < .007 * (n.approval / 55) * (next[4] && /storm|typhoon/.test(s.prov[NATS[i].prov[0]].wx.k) ? 0 : 1)) {
        var k = SITES.indexOf(next), size = Math.round(150 + r() * 350);
        s.col.push({ site: k, nat: i, pop: size, day: d, stage: '開拓地' }); s.last[i] = d;
        ev.push({ k: 'exp', t: n.name + 'の開拓団（' + size + '人）が' + (next[4] ? '海をわたって' : '') + next[0] + 'に着き、開拓地をひらいた。' + next[5], where: next[0] });
      }
    });
    s.col.forEach(function (c) {
      var S = SITES[c.site], cw = climate(NATS[c.nat].prov[0], d), cap = S[4] ? 15000 : 30000, g = (.003 + (s.nat[c.nat].mood - 60) * .0001) * (1 - c.pop / cap) + (r() - .5) * .002; // 土地の広さで、育つ上限がある
      if (/storm|typhoon/.test(cw.k)) g -= .004;
      if (cw.t < -12) g -= .002;
      c.pop = Math.max(50, c.pop * (1 + g) + (r() < .03 ? Math.round(20 + r() * 80) : 0)); // ときどき本国から移り住む人
      var st = stageOf(c.pop);
      if (st !== c.stage) { c.stage = st; ev.push({ k: 'exp', t: S[0] + 'の開拓地が大きくなり、' + st + 'になった（約' + Math.round(c.pop).toLocaleString() + '人）', where: S[0] }); }
      if (r() < .004) ev.push({ k: 'exp', t: S[0] + 'で' + pick(r, ['はじめての畑のとり入れ', '小さな港ができた', '学校がひらいた', '本国との定期船が出はじめた', '井戸が掘られた', '道が本国までつながった']), where: S[0] });
    });
    s.civ.forEach(function (v, j) {
      var C = CIVS[j];
      v.pop *= 1 + .00004 + (r() - .5) * .0002; // 知らないあいだも、それぞれに栄えている
      if (!v.known) {
        var near = s.col.filter(function (c) { return C[4].indexOf(c.site) >= 0; })[0];
        if ((near && r() < .02 * (d - near.day > 20 ? 1 : 0)) || r() < .0003) {
          var by = near ? near.nat : Math.floor(r() * 3);
          v.known = true; v.day = d; v.by = by;
          v.rel = [0, 1, 2].map(function (k) { return k === by ? Math.round(-10 + r() * 40) : Math.round(-5 + r() * 20); });
          ev.push({ k: 'civ', t: (near ? SITES[near.site][0] + 'の開拓団' : NATS[by].name + 'の船') + 'が、知らなかった人びと「' + C[0] + '」に出会った。' + C[5], where: near ? SITES[near.site][0] : NATS[by].name });
        }
        return;
      }
      [0, 1, 2].forEach(function (k) {
        var rel = v.rel[k], dr = (10 - rel) * .002 + (r() - .5) * .6;
        if (r() < .004) { dr -= 6; ev.push({ k: 'dip', t: C[0] + 'と' + NATS[k].name + 'のあいだで、ことばの行き違いからもめごと', where: C[0] }); }
        if (r() < .006) { dr += 5; ev.push({ k: 'dip', t: NATS[k].name + 'が' + C[0] + 'に使いを送り、贈りものをかわした', where: C[0] }); }
        v.rel[k] = clamp(rel + dr, -100, 100);
      });
      var best = Math.max.apply(0, v.rel);
      if (!v.trade && best > 30) { v.trade = true; ev.push({ k: 'dip', t: C[0] + 'との行き来がはじまり、めずらしい品が市場にならびはじめた', where: C[0] }); }
    });

    // 7. できごと（州）
    s.prov.forEach(function (p, i) {
      if (p.wx.k === 'typhoon') ev.push({ k: 'weather', t: p.name + 'に台風が来た（雨' + p.wx.mm + 'mm）', where: p.name });
      if (w.m === 10 && w.d === 15) ev.push({ k: 'prov', t: p.name + 'のとり入れ：' + (p.out.food > p.pop * 2.2 ? '豊作' : p.out.food > p.pop * 1.2 ? 'ふつうの年' : '不作'), where: p.name });
      if (p.price.food > 1.6 && r() < .05) ev.push({ k: 'prov', t: p.name + 'で食べ物の値段が上がっている', where: p.name });
      if (p.unemp > .08 && r() < .04) ev.push({ k: 'prov', t: p.name + 'で仕事をさがす人がふえている', where: p.name });
      if (p.name === '玉石州' && r() < .02) ev.push({ k: 'prov', t: '玉石州の浜で、大きな灯石のかけらが見つかった', where: p.name });
      if (p.name === '北林州' && p.wx.k === 'snow' && p.wx.mm > 8) ev.push({ k: 'prov', t: '大雪で北林州の道が閉ざされた', where: p.name });
    });
    // 8. 二水の町
    var nw = s.prov[0].wx;
    s.flood = clamp(s.flood * .7 + (nw.k === 'typhoon' ? 80 : nw.k === 'storm' ? 55 : nw.k === 'rain' ? nw.mm * .6 : 0), 0, 100);
    s.ferry = s.flood < 45;
    if (!s.ferry) ev.push({ k: 'weather', t: '川の水が多く、渡し舟はお休み', where: '渡口洞' });
    if (s.flood > 60) ev.push({ k: 'weather', t: '川守隊が見張り台に立ち、川べりの家に声をかけている', where: '川守洞' });
    var econ = s.prov[0].mood / 60;
    s.dong.forEach(function (g) {
      var base = g.use === 'お店' || g.use === '市場' ? 60 : g.use === '学園' ? (schoolDay(w) ? 70 : 25) : g.use === '工房' ? 55 * Math.min(1.3, s.prov[0].price.goods / 2) : 40;
      if (/rain|storm|typhoon|snow/.test(nw.k)) base -= 15;
      if (w.wd === 0 || w.wd === 6) base += g.use === '市場' || g.use === 'お店' || g.use === '公園' ? 15 : 0;
      if (cal && cal[2] === '灯籠祭り') base += 40;
      if (g.name === '渡口洞' && !s.ferry) base -= 20;
      g.busy = clamp(Math.round(g.busy * .6 + base * econ * .4 + (r() - .5) * 10), 0, 100);
      if (r() < .0025 * econ * g.shops / 10 && g.use !== '公園' && g.use !== '森') { g.shops++; ev.push({ k: 'town', t: g.name + 'に新しい店がひらいた（' + pick(r, ['焼きそばパン', '古本', '灯石ランプ', '甘味', '舟の道具', 'お茶']) + 'の店）', where: g.name }); }
      if (r() < .0015 * (2 - econ) * g.shops / 10 && g.shops > 2) { g.shops--; ev.push({ k: 'town', t: g.name + 'の古い店がひとつ閉じた', where: g.name }); }
      if (g.river && s.flood > 75 && r() < .5) ev.push({ k: 'weather', t: g.name + 'の川べりが水につかった', where: g.name });
    });
    if (w.wd === 6 && !/storm|typhoon/.test(nw.k)) ev.push({ k: 'town', t: '米市の市場で週末の大売り出し（食べ物の値段 ' + Math.round(s.prov[0].price.food * 100) + '）', where: '米市洞' });
    if (r() < .07) ev.push({ k: 'town', t: pick(r, ['工房街で新しい灯石ランプができた', '中路の電車通りで迷子の猫が保護された', '森下洞で鹿の親子が見られた', '川尾の倉庫に、川上から荷がたくさん届いた', '大橋の工事が少し進んだ', '灯台館の近くで、夜に小さな光が見えたといううわさ']), where: '' });
    if (DEV) s.development.forEach(function (c, i) {
      ev = ev.concat(DEV.step(c, NATS[i].prov.map(function (index) { return s.prov[index]; }), s.nat[i], d));
    });
    return ev;
  }

  function people(d, s, slot) {
    var w = wdate(d), wx = climate(0, d), r = rng(d * 31337 + 3), sch = schoolDay(w), cal = CAL.filter(function (c) { return c[0] === w.m && c[1] === w.d; })[0];
    var p1 = w.school === 312 && w.m >= 5 && w.m <= 8, bad = /storm|typhoon/.test(wx.k);
    if (w.school >= 315) return adults(d, s, slot, w, wx, r, cal, bad);
    return CH.map(function (c) {
      var at, what;
      if (cal && cal[2] === '灯籠祭り' && slot !== 'morning') { at = '岬口洞'; what = '灯籠祭りで、灯籠を川に流す'; }
      else if (slot === 'night') { at = c[1]; what = pick(r, ['家で夕ごはん', 'ねる前に少し本を読む', '明日の準備', 'もう寝ている']); }
      else if (sch && slot === 'morning') { at = c[1]; what = c[0] === 'アカリ' || c[0] === 'ツバサ' ? (s.ferry ? 'マツじいさんの渡し舟で学園へ' : '舟がお休みなので、遠回りして歩いて学園へ') : '学園へ向かう'; }
      else if (sch && slot === 'day') { at = '文山洞'; what = cal ? cal[2] : pick(r, ['教室で先生の話を聞く', '昼休みに焼きそばパン', '実習の時間']); }
      else if (bad) { at = c[1]; what = WX[wx.k][0] + 'なので家にいる'; }
      else if (sch && slot === 'after' && p1 && r() < .55) { at = '岬口洞'; what = '班のみんなと灯台館の片づけ'; }
      else if (slot === 'after' || (!sch && slot === 'day')) { if (r() < .5) { at = c[3]; what = c[2] + 'にいる'; } else { at = c[3]; what = c[4]; } }
      else { at = c[1]; what = '家でゆっくり'; }
      if (c[0] === 'ツバサ' && wx.k === 'rain' && slot === 'after') { at = '中路洞'; what = '雨の日の停留所で、電車を一本見送る'; }
      return { name: c[0], at: at, what: what };
    });
  }
  // 卒業したあとの9人（新暦315年4月〜）。[名前, 家の洞, 仕事, 仕事場の洞, 仕事中のようす, 休みの日]
  var ADULT = [
    ['アカリ', '渡口洞', '川守隊の隊員', '川守洞', ['川べりの見回り', '新人の訓練を見る', '舟で川の流れを調べる'], '演習場で走りこみ'],
    ['シオン', '松原洞', '九条家の当主', '松原洞', ['屋敷で町の人の相談を聞く', '書庫で古い記録を読む', '役所で会議'], '書庫の窓辺で本を読む'],
    ['ツバサ', '渡口洞', '渡し舟の船頭（マツじいさんのあとつぎ）', '渡口洞', ['渡し舟で人を運ぶ', '舟の手入れ', '茶屋で次の客を待つ'], 'アカリと川べりを歩く'],
    ['シズク', '森下洞', '北の森の森番', '森下洞', ['森の見回り', '鳥の数を数える', '倒れた木を片づける'], '森で鳥を見る'],
    ['カイ', '岬口洞', '灯台館の技師', '岬口洞', ['灯台の灯りの手入れ', '灯石ランプを直す', '窓ガラスを入れかえる'], '灯台の上で海を見る'],
    ['ミナト', '米市洞', '開拓地への運び屋', '川尾洞', ['風島への荷を積む', '倉庫で荷を数える', '市場で品を仕入れる'], '近道をさがして町を歩く'],
    ['リク', '文山洞', '二水学園の魔法の先生', '文山洞', ['教室で先生の話を聞く', '生徒の練習を見る', '職員室で生徒のノートを読む'], '演習場でひとりで練習'],
    ['ルイ', '文山洞', '学園図書館の司書', '文山洞', ['本の貸し出し', '古い本の修理', '天窓の下で調べもの'], '図書館で調べもの'],
    ['セイラ', '川尾洞', '船着き場の茶屋の主人', '川尾洞', ['茶屋でお茶をいれる', '新しい茶葉をためす', '常連さんの話を聞く'], '茶屋の裏で花の手入れ']
  ];
  function adults(d, s, slot, w, wx, r, cal, bad) {
    var off = w.wd === 0 || w.wd === 6;
    return ADULT.map(function (a) {
      var at = a[1], what;
      if (cal && cal[2] === '灯籠祭り' && slot !== 'morning') { at = '岬口洞'; what = '灯籠祭りで、9人そろって灯籠を流す'; }
      else if (slot === 'night') what = pick(r, ['家で夕ごはん', 'ねる前に少し本を読む', '明日の準備', 'もう寝ている', '昔の仲間と手紙のやりとり']);
      else if (a[0] === 'ツバサ' && !s.ferry && slot !== 'night') { at = '渡口洞'; what = '川の水が多いので、渡し舟はお休み'; }
      else if (a[0] === 'アカリ' && s.flood > 50) { at = '川守洞'; what = '大雨で川の見張り台に立っている'; }
      else if (bad && a[0] !== 'カイ') what = WX[wx.k][0] + 'なので家にいる';
      else if (off) { at = slot === 'morning' ? a[1] : a[3]; what = slot === 'morning' ? '休みの日の朝。ゆっくり起きる' : a[5]; }
      else if (slot === 'morning') what = a[2] + 'の仕事へ向かう';
      else { at = a[3]; what = pick(r, a[4]); }
      return { name: a[0], at: at, what: what, job: a[2] };
    });
  }
  function slotOf(now) { var h = new Date((now || Date.now()) + 9 * 36e5).getUTCHours(); return h < 6 || h >= 20 ? 'night' : h < 9 ? 'morning' : h < 15 ? 'day' : 'after'; }

  function snap(s) {
    return { prov: s.prov.map(function (p) { return { pop: +p.pop.toFixed(2), unemp: +(p.unemp * 100).toFixed(1), food: Math.round(p.price.food * 100), goods: Math.round(p.price.goods / 2 * 100), income: +p.income.toFixed(2), mood: Math.round(p.mood), t: p.wx.t, k: p.wx.k, mm: p.wx.mm }; }),
      dong: s.dong.map(function (g) { return g.busy; }), flood: Math.round(s.flood),
      nat: s.nat.map(function (n) { return { approval: Math.round(n.approval), power: n.power, soldiers: n.soldiers, mood: Math.round(n.mood), cpi: Math.round(n.cpi), infl: +(n.infl || 0).toFixed(1), fx: +n.fx.toFixed(3), debt: Math.round(n.debt), gdpY: Math.round(n.gdpY), tradeY: Math.round(n.tradeY) }; }), rel: [Math.round(s.rel[0][1]), Math.round(s.rel[0][2]), Math.round(s.rel[1][2])] };
  }
  // d 日目まで計算して、その日の様子と、さかのぼった記録（keep 日分）を返す
  function run(d, keep) {
    keep = keep || 30;
    var s = init(), hist = [], log = [], i0 = 0, CP = root.TRI_SIM_CP;
    // 途中から計算する：checkpoint.js に、ある日の世界をそのまま保存してある（毎回0日目から計算すると重いため）
    if (CP && CP.d < d - keep + 1) { s = JSON.parse(JSON.stringify(CP.s)); i0 = CP.d + 1; }
    for (var i = i0; i <= Math.max(0, d); i++) {
      var ev = step(s, i);
      if (i > d - keep) { hist.push(Object.assign({ d: i }, snap(s))); log.push({ d: i, date: wdate(i).label, ev: ev }); }
    }
    return { day: d, date: wdate(d), state: s, hist: hist, log: log };
  }

  function untilModern(target, maxDays) {
    if (!DEV) throw new Error('Development module unavailable');
    if (!Number.isInteger(target) || target < 1 || target > NATS.length) throw new RangeError('Invalid target');
    if (!Number.isInteger(maxDays) || maxDays < 0 || maxDays > 36500) throw new RangeError('Invalid horizon');
    var s = init(), milestones = [], d;
    for (d = 0; d <= maxDays; d++) {
      step(s, d).forEach(function (event) { if (event.k === 'development') milestones.push({ day: d, date: wdate(d).label, text: event.t }); });
      if (s.development.filter(function (c) { return c.modernDay !== null; }).length >= target) break;
    }
    var reached = d <= maxDays, end = Math.min(d, maxDays);
    return { day: end, date: wdate(end), state: s, reached: reached, target: target, milestones: milestones };
  }
  function livingCosts(s, name, profile) {
    var character = CH.filter(function (c) { return c[0] === name; })[0];
    if (!character || !DEV) throw new RangeError('Unknown character or development module unavailable');
    return Object.assign({ name: name, place: character[1], basis: '二水州の地域物価。職業・支援・住居・交通は別設定が必要' }, DEV.costOfLiving(s.prov[0], profile));
  }
  // 社会の5段階（studio/text/world/society_stages_v1.md）。年ごとの4つの数字から、町がどの段階にいるかを決める
  var SOC_K = [[200, 5.2, 3, 12, 62], [260, 4.2, 5, 15, 58], [300, 2.8, 8, 18, 46], [312, 2.2, 14, 24, 50], [328, 1.05, 34, 40, 56], [346, 1.36, 27, 30, 44], [365, 1.6, 22, 25, 38], [395, 1.7, 20, 23, 35]];
  var STAGES = ['問題の前', '生まれはじめ', 'そのまま', '解決に向かう', '解決された'];
  function socRaw(y) {
    var K = SOC_K, i = 0; if (y <= K[0][0]) return K[0].slice(1); if (y >= K[K.length - 1][0]) return K[K.length - 1].slice(1);
    while (K[i + 1][0] < y) i++;
    var a = K[i], b = K[i + 1], t = (y - a[0]) / (b[0] - a[0]);
    return [1, 2, 3, 4].map(function (j) { return a[j] + (b[j] - a[j]) * t; });
  }
  // 未来のしくみをとり入れた割合（312年に4つの文明と出会ってから、行き来で広まる）。[分野, 広まる中心の年]
  var ADOPT = [['働く時間', 330], ['住まい', 340], ['ひとりぼっち', 345], ['子育て', 352]];
  function adoption(y) { var a = ADOPT.map(function (x) { return [x[0], Math.round(100 / (1 + Math.exp(-(y - x[1]) / 6)))]; }); return { items: a, total: Math.round(a.reduce(function (n, x) { return n + x[1]; }, 0) / a.length) }; }
  function society(y) {
    var v = socRaw(y), r = rng(y * 7919 + 11), n = function (x, k) { return x * (1 + (r() - .5) * k); };
    var o = { y: y, tfr: +n(v[0], .04).toFixed(2), alone: Math.round(n(v[1], .06)), rent: Math.round(n(v[2], .05)), hours: Math.round(n(v[3], .03)) };
    var falling = v[0] < socRaw(y - 5)[0];
    o.stage = v[0] >= 2.4 ? 0 : falling && v[0] > 1.3 ? 1 : falling || (v[0] < 1.3 && v[2] >= 35) ? 2 : v[0] < 1.45 ? 3 : 4;
    o.name = STAGES[o.stage];
    return o;
  }
  root.TRI_SIM = { adoption: adoption, CIV_ADV: CIV_ADV, society: society, STAGES: STAGES, LINK: LINK, SITES: SITES, CIVS: CIVS, NATS: NATS, CHAIRS: CHAIRS, EPOCH: EPOCH, today: today, wdate: wdate, climate: climate, WX: WX, run: run, people: people, slotOf: slotOf, PROV: PROV, SECT: SECT, DONG: DONG, CH: CH, untilModern: untilModern, livingCosts: livingCosts };
  if (typeof module === 'object' && module.exports) module.exports = root.TRI_SIM;
})(typeof window !== 'undefined' ? window : globalThis);
