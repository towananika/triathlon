// 仮名世界のスキルツリー（データ）。2026-10-25 ひびきの原案（ideas/skilltree_rgb.md）。
// 1つの技＝{id, en, ja, st:上がるステータス, req:[前提の技のid], note}。st が空なら「未定」。
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
   {id: 'ST', en: 'Sword Theory',   ja: '剣術理論', st: 'RAN', req: ['MCT']},
   {id: 'SP', en: 'Sword Practice', ja: '剣術実習', st: 'ATS', req: ['MCT', 'ST'], note: '技：straight、slice'}]},
  {g: 'Knight', items: [
   {id: 'MS', en: 'Movement Strategy', ja: '移動戦術',   st: 'SPD', req: ['MCT']},
   {id: 'WH', en: 'Weapon Handling',   ja: '武器操作術', st: 'ATS', req: ['MCT', 'MS']}]}]},
 G: {name: 'グリーン', groups: [
  {g: 'General', items: [
   {id: 'G.PT', en: 'Physical Training', st: 'HP'},
   {id: 'G.SHOOT', en: 'Throwing / Shooting', st: 'RAN', req: ['G.PT']}]},
  {g: 'Option', items: [
   {id: 'G.UBT', en: 'Upper Body Training', st: 'ATK', req: ['G.PT']},
   {id: 'G.LBT', en: 'Lower Body Training', st: 'DEF', req: ['G.PT']},
   {id: 'IT',    en: 'Intelligence Training', st: 'MAG', note: 'RのIEと同じかは未定'},
   {id: 'G.MCT', en: 'Mind Control Training', st: 'RES'}]},
  {g: 'Ranger', items: [
   {id: 'RIF1', en: 'Rifle 1', st: '', req: ['G.SHOOT', 'G.UBT']},
   {id: 'RIF2', en: 'Rifle 2〜4', st: '', req: ['IT', 'G.MCT'], note: '前提も 1〜3 段'},
   {id: 'HRF1', en: 'Heavy Rifle 1', st: '', req: ['RIF2']},
   {id: 'HRF2', en: 'Heavy Rifle 2〜4', st: '', req: ['IT', 'G.MCT', 'WH'], note: '前提も 1〜3 段'}]},
  {g: 'Assassin', items: [
   {id: 'ASN1', en: 'Assassination 1', st: 'ATS', req: ['G.SHOOT', 'G.UBT'], note: '原案は Throwing＋UBT'},
   {id: 'ASN2', en: 'Assassination 2〜4', st: '', req: ['IT', 'G.MCT', 'BU'], note: 'BU は Fighter の技'}]},
  {g: 'Scout', items: [
   {id: 'MVS1', en: 'Movement Strategy 1', st: 'SPD', req: ['G.PT']},
   {id: 'MVS2', en: 'Movement Strategy 2〜4', st: '', req: ['G.PT'], note: 'PT 2〜4 が前提'}]}]},
 B: {name: 'ブルー', groups: [
  {g: 'General', items: [
   {id: 'PHY', en: 'Physics', st: 'HP'},
   {id: 'ACA', en: 'Academics', st: 'MAG'},
   {id: 'PSY', en: 'Psycologics', st: 'RES'}]},
  {g: 'Elementary Academy（線形魔法）', items: [
   {g: 'Class 10', items: [
    {id: 'EM.WA', en: 'EM: Water', st: 'HP', req: ['PSY']},
    {id: 'EM.EA', en: 'EM: Earth', st: 'DEF', req: ['EM.WA']}]},
   {g: 'Class 9', items: [
    {id: 'MI', en: 'Mana Inspiration', st: 'MP'},
    {id: 'EMM.WAEA', en: 'EMM: Water & Earth', st: '', req: ['EM.WA', 'EM.EA'], guess: 1}]},
   {g: 'Class 8', items: [
    {id: 'AMI', en: 'Advanced Mana Inspiration', st: 'MP', req: ['MI'], guess: 1},
    {id: 'EM.WI', en: 'EM: Wind', st: 'SPD', req: ['MI']},
    {id: 'EMM.WIWA', en: 'EMM: Wind & Water', st: '', req: ['EM.WI', 'EM.WA'], guess: 1, note: '高圧・押す・水分'},
    {id: 'EMM.WIEA', en: 'EMM: Wind & Earth', st: '', req: ['EM.WI', 'EM.EA'], guess: 1, note: 'counter'}]},
   {g: 'Class 7', items: [
    {id: 'EM.FI', en: 'EM: Fire', st: 'MAG', req: ['AMI']},
    {id: 'EMM.FIWA', en: 'EMM: Fire & Water', st: '', req: ['EM.FI', 'EM.WA'], guess: 1, note: 'counter'},
    {id: 'EMM.FIEA', en: 'EMM: Fire & Earth', st: '', req: ['EM.FI', 'EM.EA'], guess: 1, note: 'dry（乾燥）'},
    {id: 'EMM.FIWI', en: 'EMM: Fire & Wind', st: '', req: ['EM.FI', 'EM.WI'], guess: 1, note: '低圧・引く'}]},
   {g: 'Class 6 Elemental Sublet', items: [
    {id: 'SHOT', en: 'EMM: F&E + Wi&Wa', st: '', req: ['EMM.FIEA', 'EMM.WIWA'], guess: 1, note: 'shot'},
    {id: 'SHOTP', en: 'EMM: F&E + F&Wi', st: '', req: ['EMM.FIEA', 'EMM.FIWI'], guess: 1, note: 'shot（pull）'}]},
   {g: 'Class 5 Elemental Mage（AEM 7種）', items: [
    {id: 'AEM.ICE', en: 'AEM: Water（Ice）', st: ''},
    {id: 'AEM.HEAL', en: 'AEM: Earth（Heal）', st: ''},
    {id: 'AEM.POI', en: 'AEM: Earth（Poison）', st: '', req: ['AEM.HEAL']},
    {id: 'AEM.WIND', en: 'AEM: Wind', st: ''},
    {id: 'AEM.FLA', en: 'AEM: Fire（Flame）', st: ''},
    {id: 'AEM.THU', en: 'AEM: Fire（Thunder）', st: ''},
    {id: 'AEM.LIG', en: 'AEM: Fire（Light）', st: '', req: ['AEM.THU']}]},
   {g: 'Class 4〜1st', items: [
    {id: 'C4', en: 'Class 4', st: '', note: 'AEM 7種から2種'},
    {id: 'C3', en: '3rd Class', st: '', req: ['C4'], guess: 1, note: 'AEM 7種から4種'},
    {id: 'C2', en: '2nd Class', st: '', req: ['C3'], guess: 1, note: 'AEM 全7種'},
    {id: 'C1', en: '1st Class', st: '', req: ['C2'], guess: 1, note: 'AEM 全7種（2級との差は未定）'}]}]},
  {g: 'Mage Academy（回路魔法）', items: [
   {id: 'ESC', en: 'Elemental Scholar Class', st: '', note: 'unqualified（意味は未定）'},
   {id: 'EMC', en: 'Elemental Mage Class', st: '', note: 'Elemental Academy の Class 5〜1st が前提。マナ5,000以上＋消費マナ1,000以上の技'},
   {id: 'MGC', en: 'Mage Class（A〜E）', st: '', req: ['EMC'], guess: 1, note: 'マナ10,000以上＋消費マナ2,000以上の技'},
   {id: 'ARC', en: 'Arch Mage Class（F〜I）', st: '', req: ['MGC'], guess: 1, note: 'マナ15,000以上＋消費マナ3,000以上の技'}]},
  {g: 'Cleris Missionary School', items: [
   {id: 'CLR', en: 'Grade 1〜13', st: '', note: 'ワンタップで詠唱。伸びやすいが伸びしろは低め。学部：Engineering／Education／Humanities／Medicine／Liberal Arts／Social Sciences／Natural Sciences'}]},
  {g: 'Nacsha Missionary School（Full Open）', items: [
   {id: 'NAC', en: 'すべての技を解放できる', st: '', note: 'ランダムな skill-tech、1ボタン詠唱、10,000回で100%、魔法回路1〜4：100p^1〜4'}]}]}
};
