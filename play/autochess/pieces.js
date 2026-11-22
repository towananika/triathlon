/* 駒と野生の敵のデータ。数字はすべて仮（試作で調整する）。 */
(function (root) {
  'use strict';
  var data = {
    // R・G・B を1ポイント振ったときに上がる量：R=[HP,ATK,DEF] G=[攻撃速度%,移動] B=[魔力,抵抗]
    base: { hp: 60, atk: 4, def: 4, spd: 1, res: 4 },
    trialPoints: { main: 12, other: 4 },
    starCap: 5, // 盤に置ける星の合計
    // 同じ色の駒を need 体以上置くと、その色の駒だけ強くなる
    colorBonus: {
      need: 3,
      R: { label: 'HP+25%・DEF+10', hpPct: 25, def: 10 },
      G: { label: '攻撃速度+40%・移動+2', ats: 40, spd: 2 },
      B: { label: '魔力+30%・抵抗+10', magPct: 30, res: 10 }
    },
    pieces: [
      { id: 'akari', name: 'アカリ', cls: 'ファイター', color: 'R', icon: '👊', range: 1, R: [6, 3, 0], G: [3, 1], B: [0, 1] },
      { id: 'shion', name: 'シオン', cls: 'ナイト', color: 'R', icon: '🛡️', range: 1, R: [6, 1, 2], G: [1, 0], B: [0, 2] },
      { id: 'tsubasa', name: 'ツバサ', cls: 'ウォーリア', color: 'R', icon: '⚔️', range: 1, R: [9, 2, 1], G: [1, 1], B: [0, 1] },
      { id: 'shizuku', name: 'シズク', cls: 'レンジャー', color: 'G', icon: '🏹', range: 4, R: [3, 2, 0], G: [4, 1], B: [0, 1] },
      { id: 'kai', name: 'カイ', cls: 'アサシン', color: 'G', icon: '🗡️', range: 1, R: [3, 3, 0], G: [3, 3], B: [0, 0] },
      { id: 'minato', name: 'ミナト', cls: 'スカウト', color: 'G', icon: '🧭', range: 2, R: [4, 1, 1], G: [2, 4], B: [0, 1] },
      { id: 'riku', name: 'リク', cls: 'エレメンタルメージ', color: 'B', icon: '🔥', range: 3, magic: true, R: [3, 0, 0], G: [1, 0], B: [4, 1] },
      { id: 'rui', name: 'ルイ', cls: 'メージ', color: 'B', icon: '🔮', range: 4, magic: true, R: [2, 0, 0], G: [2, 0], B: [5, 0] },
      { id: 'seira', name: 'セイラ', cls: 'クレリック', color: 'B', icon: '✨', range: 3, magic: true, heal: true, R: [4, 0, 1], G: [1, 0], B: [2, 2] }
    ],
    // 野生の敵は数値を直接持つ
    wildTypes: {
      boar: { name: 'イノシシ', icon: '🐗', range: 1, hp: 330, atk: 14, def: 30, ats: 0, spd: 2, mag: 0, res: 10 },
      wolf: { name: 'オオカミ', icon: '🐺', range: 1, hp: 150, atk: 17, def: 8, ats: 30, spd: 8, mag: 0, res: 6 },
      snake: { name: 'ヘビ', icon: '🐍', range: 3, magic: true, hp: 110, atk: 0, def: 6, ats: 0, spd: 1, mag: 19, res: 12 },
      bear: { name: 'クマ', icon: '🐻', range: 1, hp: 340, atk: 17, def: 18, ats: 0, spd: 2, mag: 0, res: 12 },
      eagle: { name: 'ワシ', icon: '🦅', range: 2, hp: 90, atk: 12, def: 4, ats: 40, spd: 12, mag: 0, res: 4 },
      crab: { name: 'カニ', icon: '🦀', range: 1, hp: 260, atk: 24, def: 60, ats: 0, spd: 1, mag: 0, res: 0 }
    },
    // 最初に持っている駒（1人ずつ）。同じ駒を複数持てる
    start: { akari: 1, shion: 1, tsubasa: 1, shizuku: 1, kai: 1, minato: 1, riku: 1, rui: 1, seira: 1 },
    // 地域：順番に攻略する。勝つたびに reward の駒が1つ増える（3つで★2）。配置は戦いが始まるまで見えない
    regions: [
      { id: 'plain', reward: 'tsubasa', name: '平原の空き地', color: 'G', enemies: [
        { type: 'boar', x: 2, y: 3 }, { type: 'boar', x: 5, y: 3 }, { type: 'wolf', x: 0, y: 2 }, { type: 'wolf', x: 7, y: 2 }, { type: 'snake', x: 4, y: 0 } ] },
      { id: 'hill', reward: 'rui', name: '山のふもと', color: 'R', enemies: [
        { type: 'bear', x: 3, y: 3 }, { type: 'boar', x: 4, y: 3 }, { type: 'eagle', x: 0, y: 1 }, { type: 'eagle', x: 7, y: 1 }, { type: 'snake', x: 3, y: 0 } ] },
      { id: 'coast', reward: 'shion', name: '海辺の岩場', color: 'B', enemies: [
        { type: 'crab', x: 1, y: 3 }, { type: 'crab', x: 6, y: 3 }, { type: 'snake', x: 2, y: 0 }, { type: 'snake', x: 5, y: 0 }, { type: 'eagle', x: 4, y: 1 } ] },
      { id: 'dry', reward: 'seira', name: '乾いた谷', color: 'G', enemies: [
        { type: 'wolf', x: 0, y: 3 }, { type: 'wolf', x: 1, y: 3 }, { type: 'wolf', x: 6, y: 3 }, { type: 'wolf', x: 7, y: 3 }, { type: 'bear', x: 3, y: 1 }, { type: 'snake', x: 4, y: 0 } ] },
      { id: 'ice', reward: 'akari', name: '氷の峠', color: 'R', enemies: [
        { type: 'bear', x: 2, y: 3 }, { type: 'boar', x: 5, y: 3 }, { type: 'crab', x: 3, y: 2 }, { type: 'eagle', x: 0, y: 0 }, { type: 'snake', x: 4, y: 0 } ] }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.TRI_CHESS_DATA = data;
})(typeof window !== 'undefined' ? window : globalThis);
