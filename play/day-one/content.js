/* 第一章「二水のはじまり」の固定コンテンツ。 */
(function () {
  'use strict';
  window.TRI_DAY_ONE = {
    names: ['アオ', 'ハル', 'ミナ', 'ユウ', 'カナ', 'ソラ', 'リツ', 'ナギ'],
    traits: [
      { id: 'curious', name: '気になると確かめる', line: '知らない道にも、少しだけ近づいてみたい。' },
      { id: 'kind', name: '人の様子によく気づく', line: '困っている人を、そのままにはできない。' },
      { id: 'steady', name: 'ゆっくりでも続ける', line: '急がなくても、今日できることをやりたい。' }
    ],
    places: [
      { id: 'river', icon: '≈', name: '二つの川の合流点', district: '中洲区', color: '#2f6fb8', intro: '朝の水面に、渡し船の影が揺れている。' },
      { id: 'market', icon: '●', name: '中路の朝市', district: '中洲区', color: '#d9707a', intro: '湯気と呼び声が、石畳に広がっている。' },
      { id: 'library', icon: '▤', name: '学園図書館', district: '西岸区', color: '#4fae84', intro: '開いた窓から、古い紙と雨の匂いがする。' }
    ],
    encounters: {
      river: { name: '船頭のトワ', options: [
        { id: 'listen', label: '川の話を聞く', effect: '話を聞いたことで、渡し場の混む時間を知った。', bond: 1 },
        { id: 'help', label: '荷物を運ぶ', effect: '短い手伝いでも、トワは何度も礼を言った。', bond: 2 },
        { id: 'rest', label: '水辺で休む', effect: '水の音を聞いているうちに、呼吸がゆっくりになった。', calm: 2 }
      ] },
      market: { name: 'パン屋のセナ', options: [
        { id: 'listen', label: '今日のおすすめを聞く', effect: 'セナは、焼きたてを半分にしてくれた。', bond: 1 },
        { id: 'help', label: '店先を整える', effect: '通りすがりの人が、明るく「ありがとう」と言った。', bond: 2 },
        { id: 'rest', label: 'あたたかい飲み物を飲む', effect: '手のひらが温まり、少しだけ元気が戻った。', calm: 2 }
      ] },
      library: { name: '記録係のミオ', options: [
        { id: 'listen', label: '町の記録を見る', effect: '昔の水路図に、見覚えのない印を見つけた。', bond: 1 },
        { id: 'help', label: '本を返すのを手伝う', effect: 'ミオは、次に読みたい本を覚えておくと言った。', bond: 2 },
        { id: 'rest', label: '窓辺で本を読む', effect: '短い物語を読み終えるころ、雨は小降りになった。', calm: 2 }
      ] }
    }
  };
})();
