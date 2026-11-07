/* 文明シミュの計算だけ（画面なし）。世界＝種＋行動の記録で決まる。2026-11-07 civ.html から分けた */
window.TRI_CIVSIM=(function(){
'use strict';
var FERT=window.TRI_FERT||{F:[],M:[]};
var FOCUS={mend:'水路や道を手入れする',farm:'畑をたがやす',explore:'遠くを見に行く',talk:'人と話す',learn:'学ぶ'};
var FS={mend:'R',farm:'R',explore:'G',talk:'G',learn:'B'};
var RULE={elder:'長子',merit:'実力',vote:'投票'};
var SY=['ア','イ','カ','キ','サ','シ','タ','ト','ナ','ハ','ヒ','マ','ミ','ユ','ラ','リ','ル','レ','ヨ','ワ','セ','ソ','ノ','コ'];
/* マルチの準備：世界＝種＋行動の記録（acts）で決まる。乱数の状態も S に入れ、同じ記録なら誰の端末でも同じ結果になる */
function r(){var s=S.rs=(S.rs+0x6D2B79F5)|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
var S,ME=(function(){try{var v=localStorage.getItem('tri-player');if(!v){v='p'+Math.random().toString(36).slice(2,8);localStorage.setItem('tri-player',v)}return v}catch(e){return 'p0'}})();
var TRAIT=['素直','頑固','せっかち','おだやか','好奇心が強い','人なつこい','用心深い','負けず嫌い'];
function nm(){return SY[Math.floor(r()*SY.length)]+SY[Math.floor(r()*SY.length)]+(r()<.5?SY[Math.floor(r()*SY.length)]:'')}
function birthAP(){var a={R:6,G:6,B:6,W:6};for(var i=0;i<21;i++)a['RGBW'[Math.floor(r()*4)]]++;return a}
function person(sex,ageY,g,parent){var p={id:S.next++,name:nm(),sex:sex,age:ageY*12,ap:birthAP(),peak:.6+r()*.4,shift:Math.floor(r()*5)-2,g:g,partner:null,alive:true,ctrl:'auto',focus:null,heard:0,kids:0,born:S.month,parent:parent||null,trait:TRAIT[Math.floor(r()*TRAIT.length)],owner:null};
 p.focus=bestFocus(p);S.ppl.push(p);return p}
function fert(p){if(p.peak<=0)return 0;var a=Math.max(0,Math.min(100,Math.floor(p.age/12)-p.shift));return ((p.sex==='F'?FERT.F[a]:FERT.M[a])||0)/100}
function stat(p,k){return Math.max(1,p.ap[k]*fert(p))}
function bestFocus(p){var a=p.ap;return a.R>=a.G&&a.R>=a.B?'farm':a.G>=a.B?(r()<.5?'explore':'talk'):'learn'}
function group(id){return S.grp.filter(function(g){return g.id===id})[0]}
function living(g){return S.ppl.filter(function(p){return p.alive&&(g==null||p.g===g)})}
function log(t){S.log.push((Math.floor(S.month/12)+1)+'年目：'+t);if(S.log.length>120)S.log.shift()}
function chron(t){S.chron.push((Math.floor(S.month/12)+1)+'年目　'+t);log(t)}
function stage(n){return n<20?'群れ':n<80?'村':n<300?'町':'国'}
function newGroup(name){var g={id:S.gnext++,name:name,food:40,land:1,tech:0,infra:.6,warn:0,trust:1,rule:['elder','merit','vote'][Math.floor(r()*3)],leader:null,rel:{},st:'群れ'};S.grp.push(g);return g}
function init(seed){S={seed:seed,rs:seed,month:0,next:1,gnext:1,ppl:[],grp:[],log:[],chron:[],acts:[],sel:null,peak:24};
 var g=newGroup('川辺の群れ');for(var i=0;i<24;i++)person(i%2?'F':'M',Math.floor(r()*35)+1,g.id);g.st=stage(24);
 chron('24人が川辺に集まった。決まりは「'+RULE[g.rule]+'」。');}
function aiFocus(p){var g=group(p.g),n=living(p.g).length;if(g.food<n*2)return 'farm';if(g.infra<.45)return 'mend';var low=Object.keys(g.rel).some(function(k){return g.rel[k]<-.3});if(low)return 'talk';return g.tech<n*.5?'learn':'explore'}
function pickLeader(g){var L=living(g.id).filter(function(p){return p.age>=18*12});if(!L.length){g.leader=null;return}
 var c;if(g.rule==='elder')c=L.sort(function(a,b){return b.age-a.age})[0];
 else if(g.rule==='merit')c=L.sort(function(a,b){return (stat(b,'R')+stat(b,'G')+stat(b,'B'))-(stat(a,'R')+stat(a,'G')+stat(a,'B'))})[0];
 else{var v={};L.forEach(function(p){var k=L[Math.floor(r()*L.length)];var best=k;for(var i=0;i<2;i++){var o=L[Math.floor(r()*L.length)];if(stat(o,'G')>stat(best,'G'))best=o}v[best.id]=(v[best.id]||0)+1});var id=Object.keys(v).sort(function(a,b){return v[b]-v[a]})[0];c=L.filter(function(p){return p.id==id})[0]}
 g.leader=c.id;log(g.name+'の長に'+c.name+'がなった（'+RULE[g.rule]+'）。')}
function month(){S.month++;
 if(S.month%120===0)S.ppl=S.ppl.filter(function(p){return p.alive});
 var pop=S.ppl.filter(function(p){return p.alive}).length;[50,100,200,500,1000].forEach(function(n){if(pop>=n&&S.peak<n){S.peak=n;chron('人口が'+n+'人をこえた。')}});
 /* 季節（春・夏・秋・冬）で畑の実りが変わる。年のはじめに、集まりごとにできごとが起きることがある */
 var mo=S.month%12,SEA=[.4,.4,1,1,1,1.2,1.2,1.2,1.4,1.4,1.4,.4][mo];
 if(mo===2)S.grp.forEach(function(g){var P=living(g.id);if(!P.length)return;g.ev=null;var x=r();
  if(x<.10){g.ev='豊作';chron(g.name+'は豊作の年になった。')}
  else if(x<.17){g.ev='大雨';g.infra=Math.max(0,g.infra-.15);chron(g.name+'に大雨。水路と道が傷んだ。')}
  else if(x<.24){g.ev='祭り';g.trust=Math.min(1,g.trust+.2);Object.keys(g.rel).forEach(function(k){g.rel[k]=Math.min(1,g.rel[k]+.15)});chron(g.name+'で祭りがあり、まわりの集まりも招かれた。')}
  else if(x<.28&&P.length>8){g.ev='病';for(var i=0;i<Math.ceil(P.length*.04);i++)die(P[Math.floor(r()*P.length)],'はやり病で亡くなった');chron(g.name+'で、はやり病が広がった。')}});
 S.grp.forEach(function(g){var P=living(g.id);if(!P.length)return;var prod=0,tl=0;
  P.forEach(function(p){
   if(p.ctrl==='ai')p.focus=aiFocus(p);else if(p.ctrl==='auto'&&r()<.05)p.focus=r()<.5?aiFocus(p):bestFocus(p);
   if(p.age>=36){var k=r()<.6?FS[p.focus]:'RGBW'[Math.floor(r()*4)];p.ap[k]+=5}else p.ap['RGBW'[Math.floor(r()*4)]]+=5;
   if(p.age>=12*12){if(p.focus==='farm')prod+=stat(p,'R')/15*g.land*SEA*(g.ev==='豊作'?1.5:1);else if(p.focus==='explore'){prod+=stat(p,'G')/40;if(r()<.0015)die(p,'遠出の先で戻らなかった')}else if(p.focus==='learn')tl+=stat(p,"B")/300000;else if(p.focus==='mend'){}else{prod+=.3;Object.keys(g.rel).forEach(function(k){g.rel[k]=Math.min(1,g.rel[k]+stat(p,'G')/4000)})}}
  });
  g.tech+=tl;
  /* 作ったもの（水路と道）は古びる。手入れの人手は、畑や学びと取り合いになる。古い見張りは誤報が増え、知らせが信じられなくなる */
  var menders=P.filter(function(p){return p.focus==='mend'&&p.age>=144}),mw=menders.reduce(function(a,p){return a+stat(p,'R')},0);
  var cap=Math.min(1,.6+g.tech*.01);g.infra=Math.max(0,Math.min(cap,g.infra-.004+mw/(P.length*60+40)));
  prod*=.7+g.infra*.6;
  if(g.infra<.35){g.warn++;var real=r()<.25;if(r()<.08){if(real&&r()<g.trust){/* 知らせを信じて止まれた */}else if(real){var v=P[Math.floor(r()*P.length)];die(v,'くずれた道で事故にあい、亡くなった');chron(g.name+'で、古びた道がくずれる事故が起きた。'+(g.trust<.5?'見張りの知らせは、また誤報だと思われていた。':''))}else g.trust=Math.max(.1,g.trust-.1)}}
  else g.trust=Math.min(1,g.trust+.01);
  g.food+=prod*(1+g.tech*.05)-P.length;g.land=Math.max(.4,Math.min(1.3,g.land-.0006*P.filter(function(p){return p.focus==='farm'}).length+.004+g.tech*.0003));
  if(g.food<0){var v=P[Math.floor(r()*P.length)];if(r()<.25)die(v,'食べ物が足りず、弱って亡くなった');g.food=0}
  g.food=Math.min(g.food,P.length*24);
 });
 S.ppl.forEach(function(p){if(!p.alive)return;p.age++;var y=p.age/12;
  if(r()<.00002*Math.exp(.085*y)/1+(y<1?.003:0))die(p,y<1?'赤ちゃんのうちに亡くなった':'年をとって亡くなった');
  if(!p.alive)return;
  if(y>=16&&p.partner==null&&r()<.02){var c=living(p.g).filter(function(q){return q.sex!==p.sex&&q.partner==null&&q.age>=16*12&&Math.abs(q.age-p.age)<15*12})[0];if(c){p.partner=c.id;c.partner=p.id;log(p.name+'と'+c.name+'がいっしょに暮らしはじめた。')}}
  if(p.sex==='F'&&p.partner!=null){var m=S.ppl.filter(function(q){return q.id===p.partner})[0];if(m&&m.alive&&r()<.022*fert(p)*Math.max(.2,fert(m))){var g=group(p.g);var k=person(r()<.5?'F':'M',0,p.g,p.id);p.kids++;if(r()<.08)log(p.name+'と'+m.name+'に'+k.name+'が生まれた。')}}
 });
 S.grp.slice().forEach(function(g){var P=living(g.id);if(!P.length)return;var st=stage(P.length);if(st!==g.st){g.st=st;chron(g.name+'が「'+st+'」になった（'+P.length+'人）。')}
  if(g.leader==null||!S.ppl.some(function(p){return p.id===g.leader&&p.alive&&p.g===g.id}))pickLeader(g);
  if(P.length>=60&&r()<.02){var n=newGroup(['北','南','東','西','丘','森','浜'][Math.floor(r()*7)]+'の'+(r()<.5?'村':'集まり'));g.rel[n.id]=.2;n.rel[g.id]=.2;S.grp.forEach(function(o){if(o!==g&&o!==n){n.rel[o.id]=0;o.rel[n.id]=0}});
   P.filter(function(p,i){return i%2}).forEach(function(p){p.g=n.id;p.partner=null});var half=Math.floor(g.food/2);g.food-=half;n.food=half;n.tech=g.tech*.8;chron(g.name+'から人が分かれ、'+n.name+'ができた。決まりは「'+RULE[n.rule]+'」。')}
 });
 /* 外交と争い：長の性格・関係・実績で自動。全滅しなくても士気で終わる */
 if(S.month%6===0)S.grp.forEach(function(g){Object.keys(g.rel).forEach(function(k){var o=group(+k);if(!o||!living(o.id).length||!living(g.id).length)return;
  var gl=S.ppl.filter(function(p){return p.id===g.leader})[0];var calm=gl?stat(gl,'G')/(stat(gl,'R')+stat(gl,'G')):.5;
  var hungry=g.food<living(g.id).length*2;if(hungry&&g.rel[k]<0&&r()>calm){var a=living(g.id),b=living(o.id),ma=1,mb=1,round=0;while(ma>.4&&mb>.4&&round<6){round++;ma-=r()*.3*(b.length/(a.length+b.length))*2;mb-=r()*.3*(a.length/(a.length+b.length))*2}
   var lose=ma<mb?a:b;if(r()<.6)die(lose[Math.floor(r()*lose.length)],'争いで亡くなった');var win=ma<mb?o:g,ls=ma<mb?g:o;var t=Math.floor(ls.food*.3);ls.food-=t;win.food+=t;g.rel[k]-=.3;o.rel[g.id]=g.rel[k];log(g.name+'と'+o.name+'が争った。士気がくずれた'+ls.name+'が引いた。')}
  else if(!hungry&&r()<calm*.3){g.rel[k]=Math.min(1,g.rel[k]+.1);o.rel[g.id]=g.rel[k];if(g.rel[k]>.6&&r()<.1)log(g.name+'と'+o.name+'が物を分け合った。')}
  else g.rel[k]-=.02*r()})})}
function die(p,why){if(!p.alive)return;p.alive=false;var q=S.ppl.filter(function(x){return x.id===p.partner})[0];if(q)q.partner=null;if(p.ctrl!=='auto'||r()<.15||p.age>=50*12)log(p.name+'（'+Math.floor(p.age/12)+'歳）が'+why+'。')}
/* 行動：ユーザーやAIがキャラに何かするときは必ずここを通す（あとでオンラインの記録に差し替える入口） */
function apply(a){var p=S.ppl.filter(function(x){return x.id===a.pid&&x.alive})[0];if(!p)return '';
 if(a.t!=='voice'&&p.owner&&p.owner!==a.by)return 'ほかのプレイヤーが動かしているキャラです。';
 if(a.t==='ctrl'){p.ctrl=a.v;p.owner=a.v==='user'?a.by:null;if(a.v==='ai')p.focus=aiFocus(p);return ''}
 if(a.t==='focus'){if(p.ctrl==='user')p.focus=a.v;return ''}
 if(a.t==='voice'){var k={'素直':.2,'頑固':-.2,'人なつこい':.1,'用心深い':-.05}[p.trait]||0;var ok=r()<.35+k+p.heard*.1+stat(p,'B')/200;p.heard=Math.min(4,p.heard+1);
  if(p.ctrl==='user'&&p.owner===a.by){p.focus=a.v;return 'あなたが動かしているので、そのとおりにした。'}
  if(ok){p.focus=a.v;return p.name+'は声を聞いて、'+FOCUS[a.v]+'ことにした。'}return p.name+'（'+p.trait+'）は少し考えたが、自分の判断で動くことにした。'}return ''}
function act(a){a.m=S.month;a.by=ME;var msg=apply(a);if(msg.indexOf('ほかのプレイヤー')<0)S.acts.push(a);return msg}
function replay(seed,acts,months){var keep=S;init(seed);var i=0;function due(){while(i<acts.length&&acts[i].m===S.month){apply(acts[i]);i++}}
 while(S.month<months){due();month()}due();var out=S;S=keep;return out}
function sig(X){return X.ppl.filter(function(p){return p.alive}).map(function(p){return p.id+':'+p.age+':'+p.g+':'+p.focus}).join(',')+'|'+X.grp.map(function(g){return g.id+':'+Math.round(g.food)}).join(',')}
function verify(){var X=replay(S.seed,S.acts,S.month);return sig(X)===sig(S)}

return {get S(){return S},set S(v){S=v},init:init,month:month,act:act,apply:apply,replay:replay,verify:verify,
 living:living,group:group,stage:stage,stat:stat,aiFocus:aiFocus,FOCUS:FOCUS,RULE:RULE,ME:ME};
})();
