/* 駒と野生の敵のデータ。数字はすべて仮（試作で調整する）。 */
(function (root) {
  'use strict';
  var data = {
    // R・G・B を1ポイント振ったときに上がる量：R=[HP,ATK,DEF] G=[攻撃速度%,移動] B=[魔力,抵抗]
    base: { hp: 60, atk: 4, def: 4, spd: 1, res: 4 },
    trialPoints: { main: 12, other: 4 },
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
      snake: { name: 'ヘビ', icon: '🐍', range: 3, magic: true, hp: 110, atk: 0, def: 6, ats: 0, spd: 1, mag: 19, res: 12 }
    },
    // 最初の1戦：平原の空き地。配置は戦いが始まるまで見えない
    trial: {
      name: '平原の空き地', color: 'G',
      enemies: [
        { type: 'boar', x: 2, y: 3 }, { type: 'boar', x: 5, y: 3 },
        { type: 'wolf', x: 0, y: 2 }, { type: 'wolf', x: 7, y: 2 },
        { type: 'snake', x: 4, y: 0 }
      ]
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.TRI_CHESS_DATA = data;
})(typeof window !== 'undefined' ? window : globalThis);
