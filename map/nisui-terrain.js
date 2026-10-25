// 二水市の地形図と「空からの写真」の絵を作る（キャンバスで描いて画像にする）。
// 高さは仮の設定（丘・森・平地）＋なめらかなゆらぎ。同じ絵になるよう乱数は固定。
(function(){
var cv=document.createElement('canvas');cv.width=720;cv.height=580;
var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,K=W/360;
var RIV=[new Path2D('M360 120Q300 130 250 140Q190 150 120 160Q60 168 0 150V185Q60 195 120 182Q190 172 250 170Q310 165 360 160Z'),new Path2D('M210 0Q190 60 170 110Q150 150 120 165L140 176Q175 150 195 115Q220 60 240 0Z')];
function wet(x,y){return ctx.isPointInPath(RIV[0],x,y)||ctx.isPointInPath(RIV[1],x,y);}
function rnd(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
var G=[];var r0=rnd(2026);for(var i=0;i<64*64;i++)G.push(r0());
function vn(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;function g(a,b){return G[((a&63)*64+(b&63))]}var u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return g(xi,yi)*(1-u)*(1-v)+g(xi+1,yi)*u*(1-v)+g(xi,yi+1)*(1-u)*v+g(xi+1,yi+1)*u*v;}
function fbm(x,y){return vn(x/40,y/40)*.55+vn(x/18,y/18)*.3+vn(x/7,y/7)*.15;}
var HILL=[[150,55,55,45],[40,18,75,80],[275,38,55,42],[348,18,50,62],[96,146,16,10],[40,272,55,14],[330,282,40,12]];
function hgt(x,y){var h=6+Math.max(0,(150-y))*.05;HILL.forEach(function(c){var dx=x-c[0],dy=y-c[1];h+=c[3]*Math.exp(-(dx*dx+dy*dy)/(c[2]*c[2]));});return h+fbm(x,y)*10-3;}
// 高さと水は、地形か空からを初めて開いたときに一度だけ計算（0.5単位ごと）
var HM,WM,D,ready=false;
function prep(){if(ready)return;ready=true;HM=new Float32Array(W*H);WM=new Uint8Array(W*H);
for(var py=0;py<H;py++)for(var px=0;px<W;px++){var x=px/K,y=py/K,k=py*W+px;WM[k]=wet(x,y)?1:0;HM[k]=WM[k]?0:Math.max(1,hgt(x,y));}
// 川の近くは低く
D=new Float32Array(W*H);for(var k=0;k<W*H;k++)D[k]=WM[k]?0:1e9;
for(var pass=0;pass<2;pass++){for(var py=0;py<H;py++)for(var px=0;px<W;px++){var k=py*W+px;if(px>0)D[k]=Math.min(D[k],D[k-1]+1);if(py>0)D[k]=Math.min(D[k],D[k-W]+1);}
for(var py=H-1;py>=0;py--)for(var px=W-1;px>=0;px--){var k=py*W+px;if(px<W-1)D[k]=Math.min(D[k],D[k+1]+1);if(py<H-1)D[k]=Math.min(D[k],D[k+W]+1);}}
for(var k=0;k<W*H;k++)if(!WM[k])HM[k]=Math.max(1,HM[k]*Math.min(1,.35+D[k]/60));
}
var STOPS=[[0,[205,226,196]],[15,[222,232,190]],[30,[236,226,178]],[50,[222,196,146]],[70,[196,160,112]],[95,[168,132,96]]];
function tint(h){for(var i=1;i<STOPS.length;i++)if(h<=STOPS[i][0]){var a=STOPS[i-1],b=STOPS[i],t=(h-a[0])/(b[0]-a[0]);return[0,1,2].map(function(j){return a[1][j]+(b[1][j]-a[1][j])*t});}return STOPS[STOPS.length-1][1];}
function terrain(){var im=ctx.createImageData(W,H),d=im.data;
 for(var py=0;py<H;py++)for(var px=0;px<W;px++){var k=py*W+px,o=k*4,c;
  if(WM[k]){var dd=Math.min(1,D[k]);c=[143,196,214];}
  else{var h=HM[k],hx=HM[k+(px<W-1?1:0)]-HM[k-(px>0?1:0)],hy=HM[k+(py<H-1?W:0)]-HM[k-(py>0?W:0)];var sh=1+(-hx-hy)*.09;sh=Math.max(.72,Math.min(1.18,sh));c=tint(h).map(function(v){return v*sh});
   var band=Math.floor(h/10),r=px<W-1?Math.floor(HM[k+1]/10):band,b=py<H-1?Math.floor(HM[k+W]/10):band;if((r!==band&&!WM[k+1])||(b!==band&&!WM[k+W]))c=c.map(function(v){return v*.72});}
  d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;}
 ctx.putImageData(im,0,0);}
// 空から：地面・森・水・屋根
function wm(x,y){return WM[Math.floor(y*K)*W+Math.floor(x*K)];}
var USEC={edu:[2,9,6,.7],home:[1,4,3,1],shop:[1,3,3,1.4],gov:[1,6,4,.8],work:[1,6,4,1.2],port:[1,7,4,.9],green:[0,0,0,0],build:[1,5,4,.5]};
var DONG=[[96,150,'green'],[150,62,'edu'],[50,46,'green'],[266,50,'home'],[236,104,'shop'],[196,142,'gov'],[150,206,'port'],[100,200,'build'],[214,238,'shop'],[300,196,'work'],[330,262,'port']];
function aerial(){var im=ctx.createImageData(W,H),d=im.data;
 for(var py=0;py<H;py++)for(var px=0;px<W;px++){var k=py*W+px,o=k*4,x=px/K,y=py/K,n=fbm(x*3,y*3),c;
  if(WM[k]){var dep=Math.min(1,D[k]/1);c=[48+n*20,104+n*18,118+n*16];}
  else{var h=HM[k],forest=h>48||(fbm(x+99,y)>.62&&y<120);
   c=forest?[46+n*30,78+n*34,48+n*20]:(y>165?[150+n*40,146+n*34,116+n*26]:[118+n*40,140+n*36,92+n*20]);
   if(D[k]<3&&!forest)c=[196,186,160];}
  d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;}
 ctx.putImageData(im,0,0);
 var r=rnd(77);
 ctx.save();ctx.scale(K,K);
 DONG.forEach(function(g){var u=USEC[g[2]];if(!u[3])return;var n=Math.round(70*u[3]);
  for(var i=0;i<n;i++){var a=r()*Math.PI*2,rr=Math.sqrt(r())*30,x=g[0]+Math.cos(a)*rr,y=g[1]+Math.sin(a)*rr,w=u[1]*(0.6+r()*.8),hh=u[2]*(0.6+r()*.8);
   if(x<2||y<2||x+w>358||y+hh>288||wm(x,y)||wm(x+w,y+hh)||wm(x+w,y)||wm(x,y+hh))continue;
   var tone=r();ctx.fillStyle=tone<.35?'#b5654a':tone<.6?'#8a8f96':tone<.8?'#d8d2c4':'#6e7d8c';ctx.fillRect(x,y,w,hh);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(x+w*.5,y,w*.5,hh);}});
 // 灯台館
 ctx.fillStyle='#f3efe6';ctx.beginPath();ctx.arc(96,148,2.6,0,7);ctx.fill();
 ctx.restore();
 var gr=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.85);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}
var cache={};
// mode：'terrain'（高さの色と等高線）か 'aerial'（空から）
window.NISUI_RASTER=function(mode){if(cache[mode])return cache[mode];prep();if(mode==='terrain')terrain();else aerial();return cache[mode]=cv.toDataURL('image/jpeg',.85);};
// 丘のてっぺんの高さ：[x, y, m]
window.NISUI_SPOTS=function(){prep();return HILL.map(function(c){var x=Math.max(8,Math.min(352,c[0])),y=Math.max(10,Math.min(284,c[1]));return [x,y,Math.round(HM[Math.floor(y*K)*W+Math.floor(x*K)])];});};
})();
