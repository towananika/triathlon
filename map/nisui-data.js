// 二水市のデータと、町の絵（SVG）の組み立て。座標は 360×290、60 で 1km。
(function(){
var USE={edu:['学園','#6d7fd1'],home:['住まい','#e7c27a'],shop:['市場・お店','#e08a5f'],gov:['役所・守り','#8c6bb1'],work:['工房','#b5835a'],port:['港・渡し場','#4aa3b5'],green:['森・公園','#6fae7c'],build:['工事中','#a0a0a0']};
var D=[['岬口洞',96,150,'c1','green','灯台館がある合流点の岬。物語の中心。公園として残す'],['文山洞',150,62,'c1','edu','二水学園（中等部・高等部）と寮、図書館、演習場'],['森下洞',50,46,'c1','green','北の森のふもとの静かな住宅地。森は開発しない'],
['松原洞',266,50,'c2','home','九条家の屋敷など古い家が並ぶ高台'],['中路洞',236,104,'c2','shop','路面電車が走る通学の通り。商店も少し'],['川守洞',196,142,'c2','gov','川守隊の詰所と見張り台。町の役所もここ'],
['渡口洞',150,206,'c3','port','渡し場。船頭マツの渡し舟が出る'],['白石洞',100,200,'c3','build','大橋の南のたもと。いまは工事中'],['米市洞',214,238,'c3','shop','市場通り。焼きそばパンの店、裏路地の駄菓子屋'],['工房洞',300,196,'c3','work','灯石の道具を作る工房街。Towaのアトリエ'],['川尾洞',330,262,'c3','port','倉庫と船着き場。舟を待つ人の古い茶屋']];
var FAV=[['アカリ','akari',150,206],['シオン','shion',266,50],['ツバサ','tsubasa',236,104],['シズク','shizuku',50,46],['カイ','kai',150,62],['ミナト','minato',214,238],['リク','riku',150,62],['ルイ','rui',150,62],['セイラ','seira',330,262]];
var STOP=[['松原',266,50],['中路',236,104],['川守',196,142],['大橋北',190,158],['米市',214,238],['工房',300,196]];
var LM=[['灯台館',96,146,'🗼','合流点の岬に立つ古い灯台。灯りが消えて長い。9人が直すことになる、物語の中心。'],['二水学園',150,56,'🏫','中等部と高等部。丘の上の大きな校舎で、川守隊の見習いもここで学ぶ。'],['学園図書館',160,48,'📚','古い地図と川の記録がそろう。ルイは天窓の下の席が好き。'],['演習場',134,72,'🎯','見習いの訓練場。リクの好きな場所。'],['学生寮',168,70,'🛏️','遠くの洞から通う生徒の寮。カイは寮の屋上が好き。'],['北の森の入り口',40,36,'🌲','ここから先は開発しない約束の森。町でいちばん高い丘へ続く。'],['九条家の屋敷',272,38,'🏯','松原洞の高台にある古い屋敷。シオンの家。'],['中路の電車通り',236,98,'🚋','路面電車が走る通学の道。小さな店が並ぶ。ツバサは雨の日の停留所が好き。'],['川守隊の詰所',198,134,'🛡️','見張り台から二つの川を見張る。増水の合図はここから。'],['町の役所',210,128,'🏛️','二水の届け出と町の計画を決める所。大橋の工事もここが担当。'],['大橋（工事中）',186,166,'🌉','中洲区と南岸区をつなぐ新しい橋。できるまでは渡し舟が頼り。'],['渡し場',150,206,'⛴️','船頭マツの渡し舟が出る。アカリの毎朝の通学路。'],['米市の市場通り',214,238,'🧺','朝から人でいっぱいの市場。焼きそばパンの店がある。'],['駄菓子屋の路地',224,248,'🍬','市場の裏の細い路地。ミナトの好きな場所。'],['灯石工房街',300,190,'💡','灯石の道具を作る職人の町。灯台の部品もここで作る。'],['船着き場の茶屋',330,256,'🍵','舟を待つ人の古い茶屋。セイラのお気に入り。'],['倉庫街',344,272,'📦','川を下ってきた荷が集まる倉庫と船着き場。']];
var ROADS='<g id="roads" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#fff" stroke-width="4.2"><path d="M20 62L150 62L96 148"/><path d="M0 142Q60 152 96 150"/><path d="M60 214L150 206L214 238L300 196L345 262"/><path d="M266 50L236 104L196 142"/><path d="M150 62L176 92M196 96L236 104"/><path d="M300 196L330 150"/></g><g stroke="#b9ad97" stroke-width="2.2"><path d="M20 62L150 62L96 148"/><path d="M0 142Q60 152 96 150"/><path d="M60 214L150 206L214 238L300 196L345 262"/><path d="M266 50L236 104L196 142"/><path d="M150 62L176 92M196 96L236 104"/><path d="M300 196L330 150"/></g><path d="M176 92L196 96" stroke="#5a5048" stroke-width="4"/><path d="M318 152L330 128" stroke="#5a5048" stroke-width="4"/></g>';
var RIVERS='<path d="M360 120Q300 130 250 140Q190 150 120 160Q60 168 0 150V185Q60 195 120 182Q190 172 250 170Q310 165 360 160Z"/><path d="M210 0Q190 60 170 110Q150 150 120 165L140 176Q175 150 195 115Q220 60 240 0Z"/>';
var TRAM='M266 50L236 104L196 142L176 186L214 238L300 196',FERRY='M150 200Q120 178 100 156';
var KU=[['西岸区',40,112,'#2f7d4a','c1','学びと森の区。町のはじまりの場所。'],['中洲区',282,92,'#4c56a8','c2','屋敷町と電車通り、町を守る川守隊。'],['南岸区',20,278,'#a86412','c3','市場と渡し場でにぎわう、職人と港の区。']];
// 川と森の洞にはない、小さな碁盤の目の道
var RC=document.createElement('canvas').getContext('2d'),RV=[new Path2D('M360 120Q300 130 250 140Q190 150 120 160Q60 168 0 150V185Q60 195 120 182Q190 172 250 170Q310 165 360 160Z'),new Path2D('M210 0Q190 60 170 110Q150 150 120 165L140 176Q175 150 195 115Q220 60 240 0Z')];
function dry(x,y){return x>1&&x<359&&y>1&&y<289&&!RC.isPointInPath(RV[0],x,y)&&!RC.isPointInPath(RV[1],x,y);}
function streets(){var o='';D.forEach(function(p){if(p[4]==='green')return;var g=p[4]==='edu'?9:p[4]==='home'?7:5,R=22,a=(p[1]*7%10)/30;
 for(var i=-R;i<=R;i+=g)for(var j=-R;j<R;j+=g){[[i,j,i,j+g],[j,i,j+g,i]].forEach(function(q){var c=Math.cos(a),sn=Math.sin(a),x1=p[1]+q[0]*c-q[1]*sn,y1=p[2]+q[0]*sn+q[1]*c,x2=p[1]+q[2]*c-q[3]*sn,y2=p[2]+q[2]*sn+q[3]*c,mx=(x1+x2)/2-p[1],my=(y1+y2)/2-p[2];
  if(mx*mx+my*my>R*R||!dry(x1,y1)||!dry(x2,y2)||!dry((x1+x2)/2,(y1+y2)/2))return;o+='<path d="M'+x1.toFixed(1)+' '+y1.toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1)+'"/>';});}});return o;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// 拡大の度合いで見せる部品ごとに g を分ける（map.js が表示を切りかえる）
function svg(){var s='<clipPath id="cityclip"><rect width="360" height="290" rx="6"/></clipPath><g clip-path="url(#cityclip)">';
 s+='<rect id="cground" width="360" height="290" fill="#efe8d8"/><image id="cimg" width="360" height="290" preserveAspectRatio="none"/>';
 s+='<g id="planbase"><path d="M0 0H222L182 110L128 160L0 150Z" fill="#dcebe0"/><path d="M222 0H360V124L160 156L190 100Z" fill="#e3e4f3"/><path d="M0 160L360 136V290H0Z" fill="#f4e8d6"/>';
 D.forEach(function(p){s+='<circle cx="'+p[1]+'" cy="'+p[2]+'" r="24" fill="'+USE[p[4]][1]+'" opacity=".45"/>'});
 s+='</g><g id="rivers" fill="#8fcbd6">'+RIVERS+'</g>';
 s+='<g id="streets" fill="none" stroke="#fff" stroke-width=".9" opacity=".9">'+streets()+'</g>'+ROADS;
 s+='<path id="tram" d="'+TRAM+'" fill="none" stroke="#c0392b" stroke-width="2.2" stroke-dasharray="6 3"/>';
 s+='<path d="M196 150L176 180" stroke="#5a5048" stroke-width="5" stroke-linecap="round"/><path id="ferry" d="'+FERRY+'" fill="none" stroke="#2a6f7d" stroke-width="1.6" stroke-dasharray="2 3"/>';
 s+='<g id="spots"></g><g id="dhit">'+D.map(function(p,i){return '<circle data-i="'+i+'" cx="'+p[1]+'" cy="'+p[2]+'" r="22" fill="transparent"/>'}).join('')+'</g>';
 s+='<g id="tstops">'+STOP.map(function(t,i){return '<rect data-i="'+i+'" x="'+(t[1]-2.4)+'" y="'+(t[2]-2.4)+'" width="4.8" height="4.8" rx="1" fill="#fff" stroke="#c0392b" stroke-width="1.2"/>'}).join('')+'</g>';
 s+='<g id="route"></g><g id="moving"></g></g>';
 // 文字（画面の上で同じ大きさになるよう、map.js が大きさを決める）
 s+='<g id="rlabels" class="t-s">'+'<text x="318" y="152">東の川</text><text x="6" y="174">二水川</text><text x="214" y="22" transform="rotate(-70 214 22)">北の川</text></g>';
 s+='<g id="kulabels" class="t-l">'+KU.map(function(k){return '<text x="'+k[1]+'" y="'+k[2]+'" fill="'+k[3]+'">'+k[0]+'</text>'}).join('')+'</g>';
 s+='<g id="dlabels" class="t-m">'+D.map(function(p,i){return '<g data-i="'+i+'"><circle cx="'+p[1]+'" cy="'+p[2]+'" r="2.2" fill="#2a2622"/><text x="'+(p[1]+4)+'" y="'+(p[2]+2)+'">'+p[0]+'</text></g>'}).join('')+'</g>';
 var seen={};s+='<g id="stars">'+FAV.map(function(f){var key=f[2]+','+f[3],n=seen[key]=(seen[key]||0)+1;return '<text data-id="'+f[1]+'" x="'+(f[2]-8+(n-1)*7)+'" y="'+(f[3]-9)+'">★</text>'}).join('')+'</g>';
 s+='<g id="marks">'+LM.map(function(m,i){return '<g class="lm" data-i="'+i+'" tabindex="0" role="button" aria-label="'+esc(m[0])+'"><circle cx="'+m[1]+'" cy="'+m[2]+'" r="2.6" fill="#fff" stroke="#2a2622" stroke-width=".7"/><circle cx="'+m[1]+'" cy="'+m[2]+'" r="1.1" fill="#2a2622"/><text class="lm-n" x="'+(m[1]+3.6)+'" y="'+(m[2]+1.6)+'">'+m[3]+' '+esc(m[0])+'</text></g>'}).join('')+'</g>';
 return s;}
window.NISUI={USE:USE,D:D,FAV:FAV,STOP:STOP,LM:LM,KU:KU,TRAM:TRAM,FERRY:FERRY,svg:svg};
})();
