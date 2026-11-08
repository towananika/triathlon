/* 小地域の年代記：地形と資源から出来事を生む最小シミュレーション */
window.TRI_REGION=(function(){
'use strict';
var TILES=[
 {id:'forest',name:'深い森',icon:'🌲',type:'forest',note:'隠れやすく、木材と薬草が採れる'},
 {id:'river',name:'川辺',icon:'〰',type:'river',note:'水と魚。洪水の危険がある'},
 {id:'field',name:'ひらけた土地',icon:'🌾',type:'field',note:'畑に向くが、身を隠しにくい'},
 {id:'ruin',name:'古い廃墟',icon:'▦',type:'ruin',note:'古い知識が眠る。危険もある'},
 {id:'hill',name:'見晴らし丘',icon:'▲',type:'hill',note:'遠くを見渡せる。風が強い'}
];
var EVENTS={
forest:[
 ['薬草を見つけた。けが人が減り、森を守る約束ができた。',{food:1,trust:2}],
 ['森の奥で道に迷う者が出た。案内役が生まれた。',{trust:1}],
 ['木を切りすぎて、獣が村の近くへ現れるようになった。',{food:-1,trust:-1}]
],
river:[
 ['魚がよく獲れ、川辺に小さな市場が開かれた。',{food:3,trade:1}],
 ['大雨で川があふれた。水路を直すため、皆で働いた。',{food:-2,infra:2,trust:1}],
 ['渡し場を整え、遠い集まりとの行き来が始まった。',{trade:2,infra:1}]
],
field:[
 ['畑の土がよく、収穫を分け合う習慣が生まれた。',{food:4,trust:1}],
 ['乾いた風が続いた。水を求めて川辺へ出かけた。',{food:-2}],
 ['収穫祭が開かれ、歌と踊りが残った。',{trust:3}]
],
ruin:[
 ['廃墟で古い地図を見つけた。遠くへの道が語られ始めた。',{knowledge:3,trade:1}],
 ['崩れた壁の下から使える部品を拾った。',{knowledge:2,infra:1}],
 ['廃墟の中で事故が起きた。安全な入り方を決めた。',{trust:1,knowledge:1}]
],
hill:[
 ['丘の見張りが煙を見つけた。皆で備え、被害を防いだ。',{infra:1,trust:2}],
 ['高い場所から新しい道筋が見え、地図に加えられた。',{knowledge:2,trade:1}],
 ['強い風を利用する小さな風車を試した。',{food:1,knowledge:2}]
]};
var S,rs;
function rnd(){rs=(rs*1664525+1013904223)>>>0;return rs/4294967296}
function clamp(x){return Math.max(0,x)}
function init(seed){rs=(seed>>>0)||20261108;S={seed:rs,year:0,pop:24,food:28,trust:5,knowledge:0,infra:0,trade:0,home:'river',chron:['0年　24人が川辺に集まり、小さな火を囲んだ。']};return S}
function apply(e){Object.keys(e).forEach(function(k){S[k]=(S[k]||0)+e[k];if(k!=='trust')S[k]=clamp(S[k])})}
function advance(){
 S.year++;
 var nearby=TILES.filter(function(t){return t.id!==S.home}), place=(rnd()<.58?TILES.filter(function(t){return t.id===S.home}):nearby)[0];
 if(place!==TILES[0]&&rnd()>=.58)place=nearby[Math.floor(rnd()*nearby.length)];
 var pair=EVENTS[place.type][Math.floor(rnd()*EVENTS[place.type].length)];
 apply(pair[1]);
 var need=Math.ceil(S.pop*.58);S.food-=need;
 if(S.food<0){S.food=0;S.pop=Math.max(1,S.pop-1);S.chron.push(S.year+'年　食べ物が足りず、一人が別の土地を探しに去った。')}
 if(S.food>S.pop*2.5&&rnd()<.55){S.pop++;S.food-=2;S.chron.push(S.year+'年　新しい命が生まれた。集まりは'+S.pop+'人になった。')}
 S.chron.push(S.year+'年　'+place.name+'：'+pair[0]);
 if(S.knowledge>=6&&S.trade>=3&&!S.chron.some(function(x){return x.indexOf('交易路')>=0}))S.chron.push(S.year+'年　古い地図と渡し場をもとに、最初の交易路が決まった。');
 if(S.infra>=5&&!S.chron.some(function(x){return x.indexOf('集会所')>=0}))S.chron.push(S.year+'年　皆で手入れした道のそばに、小さな集会所が建った。');
 return S
}
function setHome(id){S.home=id;S.chron.push(S.year+'年　拠点を「'+TILES.filter(function(t){return t.id===id})[0].name+'」に移した。')}
return {tiles:TILES,init:init,advance:advance,setHome:setHome,get S(){return S}};
})();