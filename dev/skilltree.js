// 仮名世界のスキルツリー（データ）。2026-10-25 ひびきの原案（ideas/skilltree_rgb.md）。
// 1つの技＝{id, en, ja, st:上がるステータス, req:[前提の技のid], note}。st が空なら「未定」。
// st に / がある技は、2つのステータスが半分ずつ上がる。stg: 1 ＝ ステータスは Claude の案（要確認）。
// w ＝ RAN（射程）がどの武器のタイプの射程か。RAN は武器のタイプごとに分かれる（剣・投てき・銃・魔法…）。
// req2 ＝ Lv2 以上に上げるとき、同じ段（Lv−1）まで必要な技。
// guess: 1 ＝ 前提は原案に書かれておらず、Claude が推定したもの（要確認）。
// グループは {g:名前, items:[技 または グループ]}。見た目のツリーは、このデータから後で作る。
window.TRI_TREE = {
 R: {name: 'レッド', groups: [
  {g: 'General', items: [
   {id: 'PT',  en: 'Physical Training',     ja: '基礎体力訓練',   st: 'HP'},
   {id: 'UBT', en: 'Upper Body Training',   ja: '上半身強化訓練', st: 'ATK', req: ['PT']},
   {id: 'LBT', en: 'Lower Body Training',   ja: '下半身強化訓練', st: 'DEF', req: ['PT']}]},
  {g: 'Option', items: [
   {id: 'OS',  en: 'Offensive Strategy',    ja: '攻撃戦術',     st: 'ATK', req: ['UBT']},
   {id: 'DS',  en: 'Defensive Strategy',    ja: '防御戦術',     st: 'DEF', req: ['LBT']},
   {id: 'IE',  en: 'Intelligence Education',ja: '知識教育',     st: 'MAG'},
   {id: 'MCT', en: 'Mind Control Training', ja: '精神統制訓練', st: 'RES'}]},
  {g: 'Fighter', items: [
   {id: 'BU', en: 'Battle Understanding', ja: '戦闘理解', st: 'ATK', req: ['OS']},
   {id: 'DU', en: 'Dodge Understanding',  ja: '回避理解', st: 'SPD', req: ['DS']}]},
  {g: 'Warrior', items: [
   {id: 'ST', en: 'Sword Theory',   ja: '剣術理論', st: 'RAN', w: '剣', req: ['MCT']},
   {id: 'SP', en: 'Sword Practice', ja: '剣術実習', st: 'ATS', req: ['MCT', 'ST'], note: '技：straight、slice'}]},
  {g: 'Knight', items: [
   {id: 'MS', en: 'Movement Strategy', ja: '移動戦術',   st: 'SPD', req: ['MCT']},
   {id: 'WH', en: 'Weapon Handling',   ja: '武器術', st: 'ATS', req: ['MCT', 'MS']}]}]},
 G: {name: 'グリーン', groups: [
  {g: 'General', items: [
   {id: 'G.PT', en: 'Physical Training', ja: '基礎体力訓練', st: 'HP'},
   {id: 'G.SHOOT', en: 'Throwing / Shooting', ja: '投てき・射撃', st: 'RAN', w: '投てき', req: ['G.PT']}]},
  {g: 'Option', items: [
   {id: 'G.UBT', en: 'Upper Body Training', ja: '上半身強化訓練', st: 'ATK', req: ['G.PT']},
   {id: 'G.LBT', en: 'Lower Body Training', ja: '下半身強化訓練', st: 'DEF', req: ['G.PT']},
   {id: 'IT',    en: 'Intelligence Training', ja: '知識訓練', st: 'MAG', note: 'RのIEと同じかは未定'},
   {id: 'G.MCT', en: 'Mind Control Training', ja: '精神統制訓練', st: 'RES'}]},
  {g: 'Ranger', items: [
   {id: 'RIF', en: 'Rifle', ja: 'ライフル', st: 'RAN', w: '銃', stg: 1, req: ['G.SHOOT', 'G.UBT'], req2: ['IT', 'G.MCT'], note: 'Lv2〜4 は IT・MCT も同じ段まで必要'},
   {id: 'HRF', en: 'Heavy Rifle', ja: '重ライフル', st: 'ATK', stg: 1, req: ['RIF'], req2: ['IT', 'G.MCT', 'WH'], note: 'Lv2〜4 は IT・MCT・WH も同じ段まで必要'}]},
  {g: 'Assassin', items: [
   {id: 'ASN', en: 'Assassination', ja: '暗殺術', st: 'ATS', req: ['G.SHOOT', 'G.UBT'], req2: ['IT', 'G.MCT', 'BU'], note: 'Lv2〜4 は IT・MCT・BU（ファイターの技）も必要'}]},
  {g: 'Scout', items: [
   {id: 'MVS', en: 'Movement Strategy', ja: '移動戦術', st: 'SPD', req: ['G.PT'], req2: ['G.PT'], note: 'Lv2〜4 は PT も同じ段まで必要'}]}]},
 B: {name: 'ブルー', groups: [
  {g: 'General', items: [
   {id: 'PHY', en: 'Physics', ja: '物理学', st: 'HP'},
   {id: 'ACA', en: 'Academics', ja: '学術', st: 'MAG'},
   {id: 'PSY', en: 'Psycologics', ja: '心理学', st: 'RES'}]},
  {g: 'Elementary Academy（線形魔法）', items: [
   {g: 'Class 10', items: [
    {id: 'EM.WA', en: 'EM: Water', ja: '元素魔法：水', st: 'HP', req: ['PSY']},
    {id: 'EM.EA', en: 'EM: Earth', ja: '元素魔法：土', st: 'DEF', req: ['EM.WA']}]},
   {g: 'Class 9', items: [
    {id: 'MI', en: 'Mana Inspiration', ja: 'マナ感知', st: 'MP'},
    {id: 'EMM.WAEA', en: 'EMM: Water & Earth', ja: '混合魔法：水と土', st: 'HP/DEF', stg: 1, req: ['EM.WA', 'EM.EA'], guess: 1}]},
   {g: 'Class 8', items: [
    {id: 'AMI', en: 'Advanced Mana Inspiration', ja: '上級マナ感知', st: 'MP', req: ['MI'], guess: 1},
    {id: 'EM.WI', en: 'EM: Wind', ja: '元素魔法：風', st: 'SPD', req: ['MI']},
    {id: 'EMM.WIWA', en: 'EMM: Wind & Water', ja: '混合魔法：風と水', st: 'SPD/HP', stg: 1, req: ['EM.WI', 'EM.WA'], guess: 1, note: '高圧・押す・水分'},
    {id: 'EMM.WIEA', en: 'EMM: Wind & Earth', ja: '混合魔法：風と土', st: 'SPD/DEF', stg: 1, req: ['EM.WI', 'EM.EA'], guess: 1, note: 'counter'}]},
   {g: 'Class 7', items: [
    {id: 'EM.FI', en: 'EM: Fire', ja: '元素魔法：火', st: 'MAG', req: ['AMI']},
    {id: 'EMM.FIWA', en: 'EMM: Fire & Water', ja: '混合魔法：火と水', st: 'MAG/HP', stg: 1, req: ['EM.FI', 'EM.WA'], guess: 1, note: 'counter'},
    {id: 'EMM.FIEA', en: 'EMM: Fire & Earth', ja: '混合魔法：火と土', st: 'MAG/DEF', stg: 1, req: ['EM.FI', 'EM.EA'], guess: 1, note: 'dry（乾燥）'},
    {id: 'EMM.FIWI', en: 'EMM: Fire & Wind', ja: '混合魔法：火と風', st: 'MAG/SPD', stg: 1, req: ['EM.FI', 'EM.WI'], guess: 1, note: '低圧・引く'}]},
   {g: 'Class 6 Elemental Sublet', items: [
    {id: 'SHOT', en: 'EMM: F&E + Wi&Wa', ja: '射出（押す）', st: 'MAG/SPD', stg: 1, req: ['EMM.FIEA', 'EMM.WIWA'], guess: 1, note: 'shot'},
    {id: 'SHOTP', en: 'EMM: F&E + F&Wi', ja: '射出（引く）', st: 'MAG/SPD', stg: 1, req: ['EMM.FIEA', 'EMM.FIWI'], guess: 1, note: 'shot（pull）'}]},
   {g: 'Class 5 Elemental Mage（AEM 7種）', items: [
    {id: 'AEM.ICE', en: 'AEM: Water（Ice）', ja: '上級元素魔法：氷', st: 'HP', stg: 1},
    {id: 'AEM.HEAL', en: 'AEM: Earth（Heal）', ja: '上級元素魔法：癒し', st: 'DEF', stg: 1},
    {id: 'AEM.POI', en: 'AEM: Earth（Poison）', ja: '上級元素魔法：毒', st: 'DEF', stg: 1, req: ['AEM.HEAL']},
    {id: 'AEM.WIND', en: 'AEM: Wind', ja: '上級元素魔法：風', st: 'SPD', stg: 1},
    {id: 'AEM.FLA', en: 'AEM: Fire（Flame）', ja: '上級元素魔法：炎', st: 'MAG', stg: 1},
    {id: 'AEM.THU', en: 'AEM: Fire（Thunder）', ja: '上級元素魔法：雷', st: 'MAG', stg: 1},
    {id: 'AEM.LIG', en: 'AEM: Fire（Light）', ja: '上級元素魔法：光', st: 'MAG', stg: 1, req: ['AEM.THU']}]},
   {g: 'Class 4〜1st', items: [
    {id: 'C4', en: 'Class 4', ja: '4級', st: 'MP', stg: 1, note: 'AEM 7種から2種'},
    {id: 'C3', en: '3rd Class', ja: '3級', st: 'MP', stg: 1, req: ['C4'], guess: 1, note: 'AEM 7種から4種'},
    {id: 'C2', en: '2nd Class', ja: '2級', st: 'MP', stg: 1, req: ['C3'], guess: 1, note: 'AEM 全7種'},
    {id: 'C1', en: '1st Class', ja: '1級', st: 'MP', stg: 1, req: ['C2'], guess: 1, note: 'AEM 全7種（2級との差は未定）'}]}]},
  {g: 'Mage Academy（回路魔法）', items: [
   {id: 'ESC', en: 'Elemental Scholar Class', ja: '元素学者クラス', st: 'MAG', stg: 1, note: 'unqualified（意味は未定）'},
   {id: 'EMC', en: 'Elemental Mage Class', ja: '元素魔導士クラス', st: 'MP', stg: 1, note: 'Elemental Academy の Class 5〜1st が前提。マナ5,000以上＋消費マナ1,000以上の技'},
   {id: 'MGC', en: 'Mage Class（A〜E）', ja: '魔導士クラス（A〜E）', st: 'MP', stg: 1, req: ['EMC'], guess: 1, note: 'マナ10,000以上＋消費マナ2,000以上の技'},
   {id: 'ARC', en: 'Arch Mage Class（F〜I）', ja: '大魔導士クラス（F〜I）', st: 'MP', stg: 1, req: ['MGC'], guess: 1, note: 'マナ15,000以上＋消費マナ3,000以上の技'}]},
  {g: 'Cleris Missionary School', items: [
   {id: 'CLR', en: 'Grade 1〜13', ja: '1〜13学年', st: 'RES', stg: 1, note: 'ワンタップで詠唱。伸びやすいが伸びしろは低め。学部：Engineering／Education／Humanities／Medicine／Liberal Arts／Social Sciences／Natural Sciences'}]},
  {g: 'Nacsha Missionary School（全解放）', items: [
   {id: 'NAC', en: 'すべての技を解放できる', st: '', note: 'ランダムな skill-tech、1ボタン詠唱、10,000回で100%、魔法回路1〜4：100p^1〜4'}]}]}
};
