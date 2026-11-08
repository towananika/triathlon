/* 地球型の世界地図：東西は循環、南北は極で止まる */
window.TRI_WORLD_MAP=(function(){
'use strict';
var W=48,H=24,seed=314159;
function n(x,y){var v=Math.sin((x*127.1+y*311.7+seed)*.017)*43758.5453;return v-Math.floor(v)}
function wrap(x){return ((x%W)+W)%W}
function land(x,y){
 var lat=Math.abs(y-(H-1)/2)/((H-1)/2),a=Math.sin(wrap(x)*.31+y*.54)*.23+Math.sin(wrap(x)*.11-y*.25)*.18+n(wrap(x),y)*.38-lat*.48;
 if(lat>.87)return 'ice';
 if(a<-.05)return 'sea';
 if(a<.12)return 'coast';
 if(lat<.25)return 'desert';
 if(n(wrap(x)+9,y+4)>.7)return 'hill';
 return 'land';
}
function area(x,y){var t=land(x,y);return {sea:'大洋',ice:'氷原',coast:'海岸',desert:'乾いた土地',hill:'山地',land:'平原'}[t]}
function move(p,dx,dy){return {x:wrap(p.x+dx),y:Math.max(0,Math.min(H-1,p.y+dy))}}
return {W:W,H:H,wrap:wrap,land:land,area:area,move:move};
})();