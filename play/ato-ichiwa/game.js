'use strict';
const el=id=>document.getElementById(id), canvas=el('field'), c=canvas.getContext('2d');
const xs=[-330,-220,-110,0,110,220,330], keys=['A','J'];
let phase='title', seats=[], player=0, score=0, best=0, deadline=0, started=0, pos=-390, tilt=0, torque=0, fallDir=1, previous=performance.now(),note='';
const value=n=>n*(n+1)/2;
function refresh(){
 const n=seats.length, key=keys[player];
 el('turn').textContent=phase==='end'?'結果':phase==='title'?'遊び方':(player+1)+'P の番';
 el('score').textContent=score;
 el('msg').textContent=({title:'右へ歩くひよこを、板が傾きすぎない席に座らせよう。',ready:note||(n?'もう一羽？　それとも巣へ？':'最初の一羽を歩かせよう。'),walk:'空いている席が光ったら '+key+' で座る。端まで行くと逃げるよ。',fall:'おっとっと！　群れが草むらへ。',end:'時間です。おつかれさま！'})[phase];
 el('action').textContent=({title:'ふたりで始める',ready:key+'　'+(n?'もう一羽（成功で '+value(n+1)+' 点）':'歩き出す'),walk:key+'　座る',fall:'滑り落ちた！',end:'もう一回'})[phase];
 el('action').disabled=phase==='fall';el('bank').hidden=!(phase==='ready'&&n);el('bank').textContent='Space　巣に帰す ＋'+value(n)+' 点';
 el('result').hidden=phase!=='end';el('result').textContent='チーム得点 '+score+' 点　／　一度に帰せた最多 '+best+' 羽';
}
function cash(){let n=seats.length;score+=value(n);best=Math.max(best,n);seats=[];torque=0;return value(n)}
function start(){player=0;score=best=torque=tilt=0;seats=[];deadline=performance.now()+120000;phase='ready';note='';refresh()}
function expired(now){if(!['title','end'].includes(phase)&&now>=deadline){if(phase!=='fall')cash();phase='end';seats=[];torque=0;el('time').textContent='0:00';refresh();return true}return false}
function candidate(){let i=xs.findIndex(x=>Math.abs(x-pos)<=47);return i>=0&&!seats.includes(i)?i:-1}
function position(now){return -395+(now-started)/1000*(164+seats.length*14)}
function act(){
 let now=performance.now();if(expired(now))return;
 if(phase==='title'||phase==='end'){start();return}
 if(phase==='ready'){phase='walk';started=now;pos=-395;note='';refresh();return}
 if(phase!=='walk')return;pos=position(now);let i=candidate();if(i<0)return;
 seats.push(i);torque+=i-3;player=1-player;
 if(Math.abs(torque)>=5){fallDir=Math.sign(torque);phase='fall';started=now}
 else {phase='ready';note='';if(seats.length===7)note='満席！ 巣へ帰して ＋'+cash()+' 点'}
 refresh()
}
function bank(){if(expired(performance.now())||phase!=='ready'||!seats.length)return;let points=cash();note='巣へ到着！ ＋'+points+' 点。次の群れを始めよう。';refresh()}
el('action').onclick=act;el('bank').onclick=bank;
document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
 if(e.code==='Space'&&phase!=='title'&&phase!=='end'){e.preventDefault();bank();return}
 if(['ready','walk'].includes(phase)&&e.code==='Key'+keys[player]){e.preventDefault();act()}
});
