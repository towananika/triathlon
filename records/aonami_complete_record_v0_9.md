# 青波市 — 統合開発記録 v0.9

更新日：2026-10-24

この資料はtriathlonページの全セクションを保存したテキスト版です。確定・仮案・過去の案を区別してください。

> 過去の保存版です。世界設定は [最新世界設定 v0.11](world_foundation_v0_11.md) を優先してください。青波市・2006年ごろの舞台は旧案となり、現在は「地球の地理・独自の文明史・改善された近未来」を土台としています。以下は当時の検討内容を保持しています。

公開ページ: https://towananika.github.io/triathlon/



## ゲーム構想
無料で遊べるブラウザ向け、スマートフォンにも対応する軽量な2.5Dアイソメトリック・ライフシミュレーター。

### BUILD MODE
道路、家、部屋、壁、家具、学校、病院、公園、カフェ、職場、訓練施設などをモジュール式で配置・拡張・改装。

### LIFE MODE
NPCの自律生活、日課、訓練、仕事、技能習得、交友、恋愛、結婚、家族、子ども、加齢、世代交代、師弟関係。

### 制作方針
最初は少人数NPCと家・訓練場・広場から始める。セーブはローカル保存を想定。マルチプレイや高度なAIは将来拡張。実装済みを意味するものではない。
キャラクターのデータは共通に保ち、ゲーム内2.5D、カラーアニメ、白黒漫画、Live2D、3D映像は別の表現として制作する。

## 世界観
架空の日本風海辺都市「青波市」。日常生活と物語を中心に、住民がそれぞれの人生を歩む。時代の始まりは2006年ごろ（仮）。
物語タイトル候補『あの夏、君と走った。』は未確定。第1期の主要人物は9人。背景住民・脇役の人数には制限を設けない。
**シーズンの色テーマ（構想）**：Season 1 RGB ／ Season 2 CMYK ／ Season 3 白・黒・灰 ／ Season 4 無色・透明・未知。

## 魔法のある日常

**採用した方向：**魔法は普通にあり、得意なことや学び方は人それぞれ。

学校で魔法の基礎を学び、料理・修理・医療・音楽など、戦闘以外の暮らしにも使う。元素を扱う人も、道具や回路を通して扱う人もいる。普段着を基本に、道具や小さな装飾で学び方の違いを見せる。

海風のある街で学校・仕事・訓練の合間に友達と過ごす。小さな成長や失敗、誰かとの時間が街の記憶になる。強さだけで人物の価値を決めない。

### 近接3人の街での役割（具体例案）

クラス | 学ぶこと | 日常の活躍例 | 

Fighter | 身体の使い方・距離感・とっさの判断 | スポーツ、救助の補助、身軽さを生かす仕事 | 

Knight | 防護・位置取り・周囲との連携 | 行事の安全係、人を誘導する訓練 | 

Warrior | 武器や道具の扱い・力の調整 | 訓練試合、障害物を取り除く共同作業 | 

同じ学校で異なる訓練を選ぶ。共通の制服・訓練着にグローブ・盾・練習剣などで違いを出す。クラスは性格を固定しない。実習や学校制度の細部は未確定。

## 主要人物9人 — 最新テスト設定

**全員を中学生にそろえるテスト。**近接3人とレンジャーは女子、アサシン・スカウト・EMは男子。メージとクレリックの性別は未指定で、画像では仮に男子・女子を使用。正式な名前・学年は未確定。

クラス | 指定・方向 | 外見テスト案 | 

Fighter | 中学生女子 | 短い黒髪、赤い髪留め。活発な表情、共通訓練着とグローブ。細部は仮。 | 

Knight | 中学生女子 | 黒髪の低いポニーテール、穏やかな目元。訓練着と練習盾。細部は仮。 | 

Warrior | 中学生女子 | 茶髪のポニーテール。素直で繊細な表情、訓練着と練習剣。細部は仮。 | 

Ranger | 女子。最新指定：もっと落ち着いた感じ | 穏やかな目元、控えめな笑顔、静かに周囲を観察する立ち姿へ。敬礼ポーズをやめる。髪型・緑系の実習服は仮。 | 

Assassin | 男子・背が高い | 長身で細身、黒髪、静かな雰囲気。緑のカーディガン・制服パンツは仮。 | 

Scout | 男子・可愛い系 | 柔らかな茶髪と親しみやすい顔。淡い緑の上着・地図・小さな鞄は仮。 | 

Elemental Mage（EM） | 男子・「雄才」（原文。「秀才・学習型」という解釈は未確認） | 最新指定で、以前のメージの外見に交換：茶髪・眼鏡なし。 | 

Mage | 天才。性別は未指定 | 最新指定で、以前のEMの外見に交換：黒〜青黒髪・眼鏡。画像の男子という表現はテスト案。 | 

Cleric | 癒し系。性別は未指定 | 優しい表情。画像の茶髪の三つ編み・女子・医療部風衣装はテスト案。 | 

EMとメージは外見案を交換し、メージが天才という設定は維持。髪型・衣装・性格・名前まで確定したわけではない。クラスは性格を固定しない。

### 以前の人物配置（履歴・最新テストには未適用）
ハル→Knight、レン→Fighter、ソウタ→Warrior、ユナ→Ranger、アオイ→Assassin、ミナ→Scout、新規A→Elemental Mage、ルイ→Mage、新規B→Cleric。ハル17歳男性・レン17歳男性・ソウタ18歳男性という旧仮案は、最新の中学生キャラ設定とは分ける。
旧案の長所・課題：ハル＝観察・責任感／自己決定、レン＝身体能力・競争心／冷静な判断、ソウタ＝粘り強さ／自信、ユナ＝行動力・環境適応／計画性、アオイ＝集中・感受性／信頼、ミナ＝情報収集・交流／判断、新規A＝自然への関心／制御、ルイ＝学習・分析／柔軟性、新規B＝共感・支援／自己ケア。新キャラへの対応は未確定。

## 作画・衣装の検討履歴

自然な顔立ち、髪や布の質感、きれいで読みやすい漫画の描き込みを求める。人物の同一性をカラーアニメ・白黒漫画・ゲーム内表現で保つ。クラス色は髪色や善悪を強制しない。

- **最初の比較：**01青春アニメ・02漫画セル画・03ちびキャラを好み、メインは02と決定。
- **幅広い12方向の比較：**01少女漫画・03日常アニメ・06水彩・07色鉛筆・10ちびキャラを好む。これらを混ぜた案も制作。
- **その後の希望：**もっと現実感と、洗練されたAI画像のような美しさ、漫画としての仕上がりが必要。
- **新しい6方向の比較：**01繊細な半写実漫画・02アニメゲーム立ち絵・04Webtoon・05ファッション漫画調を候補に選択。
- **衣装：**以前の服が垢抜けないという感想。色数・丈・シルエット・靴まで整えた制服、ブレザー、訓練着、探索向け街着を比較。最終衣装は未決定。
- **最新テスト：**同じ学校の中学生9人の方向を評価。レンジャーの落ち着きと、EM／メージの外見交換を次の修正点に指定。

比較番号は画像シリーズごとのもの。同じ番号でも別シリーズでは意味が異なる。02を基準として選んだ後も探索を続けており、頭身・色指定・全衣装が最終確定したわけではない。
今後の検討候補：9人の顔アップ、通常・笑顔・困った顔の表情、普段着と訓練着、ゲーム内の縮小表示での識別性。

## RGB・9クラス

系統 | クラス | 方向性（解釈） | 
R / RED | ナイト / Knight / ファイター / Fighter / ウォーリア / Warrior | 防護・戦闘・武器技術 | 
G / GREEN | レンジャー / Ranger / アサシン / Assassin / スカウト / Scout | 探索・機動・精密行動 | 
B / BLUE | エレメンタルメージ / Elemental Mage / メージ / Mage / クレリック / Cleric | 元素・魔法・支援 | 

9つのクラス名はユーザー提示の設定。各クラスの方向性の説明は設計上の解釈。

## クラス習得・転職・複数クラス・承継
**採用方針：C. 素質＋努力の複合型。**生得的な適性は成長速度に影響するが、クラスや人生の上限を固定しない。

- General・Optionの基礎を学び、専門スキルの条件を満たしてクラスに進む。
- 転職しても習得済みスキルは原則保持する。
- 複数クラスを習得できる。同時装備できる専門スキル枠は検討中。
- 親からは素質・財産・文化を、親や師匠からは教育を通じて知識や技術を承継できる。
- 子どもは親のコピーにならず、別クラスも自由に目指せる。
専門クラス解放の細部、スキル枠、数値式、能力上限は未確定。以前の成長計算例はバランス検討用で正式仕様ではない。

### スキルシステム（日英）
General → Option → 専門スキル。習得条件は「Req.」で管理する。

分類 | 英語 | 日本語 | 能力 | Req. | 

General | Physical Training (PT) | 基礎体力訓練 | HP | — | 

General | Upper Body Training (UBT) | 上半身強化訓練 | ATK | PT | 

General | Lower Body Training (LBT) | 下半身強化訓練 | DEF | PT | 

Option | Offensive Strategy (OS) | 攻撃戦術 | ATK | UBT | 

Option | Defensive Strategy (DS) | 防御戦術 | DEF | LBT | 

Option | Intelligence Education (IE) | 知識教育 | MAG | — | 

Option | Mind Control Training (MCT) | 精神統制訓練 | RES | — | 

Fighter | Battle Understanding (BU) | 戦闘理解 | ATK | OS | 

Fighter | Dodge Understanding (DU) | 回避理解 | SPD | DS | 

Warrior | Sword Theory (ST) | 剣術理論 | RAN | MCT | 

Warrior | Sword Practice (SP) | 剣術実習 | ATS | MCT + ST | 

Knight | Movement Strategy (MS) | 移動戦術 | SPD | MCT | 

Knight | Weapon Handling (WH) | 武器操作術 | ATS | MCT + MS | 

剣術実習の技候補：straight（直線斬り／突き、要確認）、slice（斬撃）。RANとATSの正確な意味は未確定。

### 以前のG・B簡略スキル案（未承認・現行原案ではない）

クラス | スキル案 | 能力 | Req. | 

Ranger | 射撃理論 / Ranged Combat Theory | RAN | IE | 
Ranger | 精密射撃 / Precision Shooting | ATS | 射撃理論 | 

Assassin | 隠密行動 / Stealth Movement | SPD | MCT | 
Assassin | 急所分析 / Weak Point Analysis | ATK | 隠密行動 | 

Scout | 地形観察 / Terrain Observation | RAN | IE | 
Scout | 索敵行動 / Reconnaissance | SPD | 地形観察 | 

Elemental Mage | 元素理解 / Elemental Understanding | MAG | IE | 
Elemental Mage | 元素制御 / Elemental Control | ATS | 元素理解 + MCT | 

Mage | 魔法理論 / Magic Theory | MAG | IE | 
Mage | 魔力操作 / Mana Control | ATS | 魔法理論 + MCT | 

Cleric | 治癒理論 / Healing Theory | MAG | IE | 
Cleric | 回復術 / Restoration | RES | 治癒理論 + MCT | 

### G系統 — ユーザー提示の原案

General：Physical Training（PT / HP）。Throwing / Shooting（RAN）— Req. PT。

Options：Upper Body Training（UBT / ATK）— Req. PT。Lower Body Training（LBT / DEF）— Req. PT。Intelligence Training（IT / MAG）、Mind Control Training（MCT / RES）。後者2つの前提は未指定。

クラス | スキル | 能力 | Req.（原案の表記） | 

Ranger | Rifle 1 | 未指定 | Shooting＋UBT | 

Ranger | Rifle 2〜4 | 未指定 | IT 1〜3＋MCT 1〜3 | 

Ranger | Heavy Rifle 1 | 未指定 | Rifle 2 | 

Ranger | Heavy Rifle 2〜4 | 未指定 | IT 1〜3＋MCT 1〜3＋WH 1〜3 | 

Assassin | Assassination 1 | ATS | Throwing＋UBT | 

Assassin | Assassination 2〜4 | 未指定 | IT 1〜3＋MCT 1〜3＋BU 1〜3（Fighter） | 

Scout | Movement Strategy 1 | SPD | PT | 

Scout | Movement Strategy 2〜4 | 未指定 | PT 2〜4 | 

2・3・4と前提1・2・3の個別対応、前の段階の技能が必要かどうかは未確認。Throwing／Shootingの分岐、RのIEとGのITの関係も未確定。

### B系統 — 4つの学校

**ユーザー提示の原案。**学校ごとに学び方・操作・成長の仕方が異なる。

General：Physics（HP）、Academics（MAG）、Psycologics（RES・原文表記）。Optionは未記載。用語の正式な綴り・定義は未確定。

### Elementary Academy — 線形魔法

級 | 技能・条件 | 

Class 10 | EM: Water（HP）— Req. Psycologics / EM: Earth（DEF）— Req. EM: Water | 

Class 9 | Mana Inspiration（MI / MP） / Elemental Mix Magic（EMM）：Water & Earth | 

Class 8 | Advanced Mana Inspiration（AMI / MP） / EM: Wind（SPD）— Req. MI / EMM: Wind & Water＝高圧・押す・水分 / EMM: Wind & Earth＝counter（定義未確定） | 

Class 7 | EM: Fire（MAG）— Req. AMI / EMM: Fire & Water＝counter（定義未確定） / EMM: Fire & Earth＝dry（乾燥） / EMM: Fire & Wind＝低圧・引く | 

Class 6 — Elemental Sublet | EMM: F&E＋Wi&Wa＝shot / EMM: F&E＋F&Wi＝shot(pull) / Sublet・shotの正式な名称と働きは未確定 | 

Class 5 — Elemental Mage | 上位属性魔法（AEM）7種：Water（Ice）、Earth（Heal）、Earth（Poison）、Wind、Fire（Flame）、Fire（Thunder）、Fire（Light）。 / Poison — Req. AEM: Earth。Light — Req. AEM: Thunder。Windの効果は未記載。 | 

Class 4 | 7種のAEMから2種 | 

3rd Class | 7種のAEMから4種 | 

2nd Class | 全7種のAEM | 

1st Class | 全7種のAEM。2級との差は未記載。 | 

略記：F＝Fire、E＝Earth、Wi＝Wind、Wa＝Water。EMはこの技能表ではElemental Magic、人物・クラスの会話ではElemental Mageを指す。原文のliniear-magicの正式名称は未確定。

### Mage Academy — 回路魔法

区分 | 原案の条件 | 

Elemental Scholar Class | unqualified（意味未確定） | 

Elemental Mage Class | Req. Elemental Mage（Class 5〜1st Class）。マナ5,000以上＋消費マナ1,000以上のスキルを持つ。 | 

Mage Class | A〜E Class。マナ10,000以上＋消費マナ2,000以上のスキルを持つ。 | 

Arch Mage Class | F〜I Class。マナ15,000以上＋消費マナ3,000以上のスキルを持つ。 | 

### Cleris Missionary School
1〜13段階（Grade）。シンプルなプレイ、成長しやすいが潜在力は低め、ワンタップで詠唱する設計。

- Engineering（工学）
- Education（教育）
- Humanities（人文）— Literature Club
- Medicine（医療）— Medic Club
- Liberal Arts — Art Club、Music Club、Atheletic Club（原文表記）
- Social Sciences（社会科学）— Volunteer Club
- Natural Sciences（自然科学）— Culinary Club

### Nacsha Missionary School — Full Open

- すべてのスキルを解放可能。
- ランダムなskill-techが生成される。
- 1ボタンで詠唱。タップ・長押しで変化する。
- 10,000回の詠唱で技能を習熟し、100%の性能を持てる原案。
- 魔法回路1〜4：100p^1〜4（数式・単位の意味は未確定）。

学校間の転籍、入学条件、段階の呼称や数値は今後の設計対象。現実の物理現象や学校制度を説明するものではなく、ゲーム内設定。

## 第1期ストーリー案

**提案段階・採用確認前。**タイトル『あの夏、君と走った。』も仮。

2006年、海辺の青波市。違う訓練コースを選んだ中学生9人が学校の共同実習に集まる。課題は、海辺の古い交流施設を夏祭りまでにもう一度使える場所にすること。

誰のための場所にするか、予算を何に使うか、昔から使っていた住民の希望をどう受け止めるか。得意な技能があっても答えはすぐには出ない。

- 近接3人：作業と安全を支えるが、力だけでは解決できない対立に出会う。
- Ranger・Assassin・Scout：街を調べ、人の話を集め、情報を伝える難しさを知る。
- EM・Mage・Cleric：設備や魔法に取り組み、努力と才能、助けることと無理をすることの違いに向き合う。

中盤、施設に残る古い魔法回路が動き始める。以前ここを作った子どもたちの、完成しなかった計画が見つかる。9人は、そのまま完成させるか、自分たちの場所へ作り変えるかを選ぶ。

夏祭りの後も暮らしは続く。施設はゲーム内の拠点となり、次の学年、仕事、次の世代へ受け継がれる。帰り道の寄り道、訓練後の会話、初めて名前で呼び合う瞬間などを見せ場にする案。

## 更新履歴・検討事項
**v0.8 · 2026-10-24** ゲーム概要・世界観・キャラクター・育成と学校・物語・資料の6区分へ整理。スキル表を系統ごとに開閉する構成に変更。設定内容は維持。
**v0.7 · 2026-10-24** G原案、Bの4学校、魔法のある日常、全員中学生のテスト、レンジャーの雰囲気変更、EM／メージの外見交換、作画・衣装の履歴と未承認ストーリー案を追記。
**v0.1** RのGeneral・Option・Fighter・Warrior・Knightスキルを記録。
**v0.2** G/Bの専門スキル案を追加（日英）。
**v0.3** 素質＋努力のクラス制度、転職、複数クラス、属性承継の方針。
**v0.4** 9人の初期クラス方向、生活と訓練の連動。
**v0.5** ハル・レン・ソウタの外見原型案。
**v0.6** triathlonリポジトリに統合記録ページを新設。

### 未確定事項

- RAN / ATSの正式定義
- Gの前提レベル対応とIE／ITの関係、BのOption・用語・未記載効果・2級と1級の違い
- 9人の正式な名前・学年・人物設定、メージとクレリックの性別、「雄才」の意図、テスト設定の正式採用と最終作画・衣装
- 第1期ストーリー案の採否、魔法の制約、実習の危険度
- 魔法が普通にある方向を踏まえた、各クラスの資格制度や学校間の移動
- ゲーム内実装と数値バランス
このページは会話で確認できる記録をまとめたものです。過去の未確認情報は断定せず、随時追記します。



## 保存について
このファイルはページ上の記録をまとめたスナップショットです。ページとファイルは今後個別に更新される可能性があります。
