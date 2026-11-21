function oval(x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fillStyle=color;c.fill()}
function line(x,y,a,b,col,w){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.lineWidth=w;c.strokeStyle=col;c.stroke()}
function chick(x,y,size,step=0){
 c.save();c.translate(x,y);c.scale(size,size);c.lineCap='round';
 line(-7,-4,-10+step,1,'#91623c',3);line(6,-4,9-step,1,'#91623c',3);
 oval(0,-18,24,20,'#e8a738');oval(0,-20,23,20,'#ffda66');oval(9,-32,17,17,'#ffe077');
 oval(-8,-18,10,6,'#ecc34d');oval(16,-34,2.4,3,'#383e34');oval(15,-27,4,2,'#f3a170');
 c.fillStyle='#d98d39';c.beginPath();c.moveTo(24,-31);c.lineTo(34,-28);c.lineTo(24,-25);c.fill();c.restore()
}
function draw(now){
 const dt=Math.min((now-previous)/1000,.08);previous=now;
 if(!expired(now)&&!['title','end'].includes(phase)){
 const left=Math.ceil((deadline-now)/1000);el('time').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 if(phase==='walk'){pos=position(now);if(pos>395){phase='ready';player=1-player;note='一羽が通り過ぎたよ。板の群れはそのまま。';refresh()}}
 if(phase==='fall'&&now-started>=950){seats=[];torque=0;phase='ready';note='草むらから再出発。巣の得点はそのまま。';refresh()}
 }
 const demo=phase==='title';let target=demo?.10:phase==='fall'?fallDir*.40:torque*.046;
 tilt+=(target-tilt)*(1-Math.exp(-dt*9));
 c.clearRect(0,0,1000,395);oval(460,500,800,202,'#e9edd5');oval(760,520,680,200,'#d4dfb6');
 c.setLineDash([3,8]);line(55,221,945,221,'#96a58a',2);c.setLineDash([]);
 c.fillStyle='#ab815a';c.beginPath();c.moveTo(500,220);c.lineTo(464,312);c.lineTo(537,312);c.fill();
 c.save();c.translate(500,221);c.rotate(tilt);c.fillStyle='#9d6e48';c.fillRect(-405,-7,810,16);c.fillStyle='#e0b47b';c.fillRect(-405,-8,810,8);
 xs.forEach((x,i)=>{const lit=phase==='walk'&&candidate()===i;line(x-27,-9,x+27,-9,lit?'#13836c':'#ad865a',lit?6:3)});
 const slip=phase==='fall'?Math.pow(Math.min(1,(now-started)/830),2):0;
 for(const i of demo?[3,4,5]:seats)chick(xs[i]+fallDir*slip*450,-12+slip*95,.97);
 if(phase==='walk'||demo){const px=demo?-245:pos;chick(px,-15-Math.abs(Math.sin(now/105))*3,1,Math.sin(now/90)*5)}
 c.restore();oval(500,222,6,6,'#694e39');
 if(phase==='ready')chick(68,194,.82);
 oval(850,346,64,18,'#ba9262');oval(850,342,55,11,'#7e6044');for(let j=0;j<5;j++)line(800+j*19,347,819+j*19,352,'#dec093',3);
 c.font='bold 18px Meiryo,sans-serif';c.fillStyle='#3c5345';c.textAlign='left';c.fillText('板の上　'+(demo?3:seats.length)+' 羽',48,44);c.textAlign='right';c.fillText('巣',940,352);
 requestAnimationFrame(draw)
}
refresh();requestAnimationFrame(draw);
