/* 小地域の年代記：地図・人・三つの行動だけの最小シミュレーション */
window.TRI_REGION=(function(){
'use strict';
var TILES=[
 {id:'forest',name:'深い森',icon:'🌲',gain:'資材',note:'木材を得やすい'},
 {id:'river',name:'川辺',icon:'〰',gain:'食料',note:'水と魚を得やすい'},
 {id:'field',name:'ひらけた土地',icon:'🌾',gain:'食料',note:'畑に向く'},
 {id:'ruin',name:'古い廃墟',icon:'▦',gain:'資材',note:'使える資材が眠る'},
 {id:'hill',name:'見晴らし丘',icon:'▲',gain:'資材',note:'石を得やすい'}
];
var S,rs;
function rnd(){rs=(rs*1664525+1013904223)>>>0;return rs/4294967296}
function init(seed){rs=(seed>>>0)||20261108;S={year:0,pop:24,food:24,materials:4,safety:1,home:'river',chron:['0年　24人が川辺に集まった。']};return S}
function tile(){return TILES.filter(function(x){return x.id===S.home})[0]}
function setHome(id){S.home=id;S.chron.push(S.year+'年　拠点を「'+tile().name+'」に移した。')}
function work(kind){
 var t=tile();
 if(kind==='produce'){if(t.gain==='食料')S.food+=5;else S.materials+=4;S.chron.push(S.year+'年　'+t.name+'で'+t.gain+'を得た。');return}
 if(kind==='make'){if(S.materials<3){S.chron.push(S.year+'年　建てるための資材が足りない。');return}S.materials-=3;S.safety++;S.chron.push(S.year+'年　小さな建物を建て、地域が少し安全になった。');return}
 var enemy=18+Math.floor(rnd()*22),power=S.pop+S.safety*6;
 if(power>=enemy){S.safety++;S.chron.push(S.year+'年　脅威を退け、道を守った。')}else{S.food=Math.max(0,S.food-3);S.chron.push(S.year+'年　戦いを避け、食料を失って退いた。')}
}
function advance(){S.year++;S.food-=Math.ceil(S.pop*.55);if(S.food<0){S.food=0;S.pop=Math.max(1,S.pop-1);S.chron.push(S.year+'年　食料が足りず、一人が地域を去った。')}else if(S.food>S.pop*2&&rnd()<.45){S.pop++;S.food-=2;S.chron.push(S.year+'年　新しい命が生まれ、'+S.pop+'人になった。')}return S}
return {tiles:TILES,init:init,advance:advance,setHome:setHome,work:work,get S(){return S}};
})();