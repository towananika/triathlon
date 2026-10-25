(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ResidenceSim=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const metrics=[{id:'challenge',name:'挑戦',action:'新しい課題に取り組む'},{id:'connection',name:'交流',action:'人と会って過ごす'},{id:'quiet',name:'静けさ',action:'静かな場所で休む'},{id:'research',name:'研究',action:'好きなことを調べる'},{id:'comfort',name:'暮らし',action:'住まいと日課を整える'}];
  const defaults={R:{challenge:90,connection:60,quiet:45,research:65,comfort:75},G:{challenge:70,connection:85,quiet:80,research:70,comfort:90},B:{challenge:72,connection:65,quiet:90,research:95,comfort:80}};
  const definitions=[
    {id:'A',name:'仮住民A',wish:'挑戦しながら、暮らしも整えたい',weights:[50,10,5,15,20]},
    {id:'B',name:'仮住民B',wish:'人と出会い、居場所を作りたい',weights:[5,50,10,5,30]},
    {id:'C',name:'仮住民C',wish:'好きな研究に集中したい',weights:[5,5,15,65,10]},
    {id:'D',name:'仮住民D',wish:'静かな環境で、自分の時間を持ちたい',weights:[10,10,50,5,25]},
    {id:'E',name:'仮住民E',wish:'無理のない日常と、人とのつながりが欲しい',weights:[10,25,15,10,40]},
    {id:'F',name:'仮住民F',wish:'次々と新しい挑戦を試したい',weights:[70,5,5,15,5]}
  ];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clamp=value=>Math.max(0,Math.min(100,value));
  function validConditions(conditions){return conditions&&['R','G','B'].every(city=>conditions[city]&&metrics.every(m=>Number.isFinite(conditions[city][m.id])&&conditions[city][m.id]>=0&&conditions[city][m.id]<=100));}
  function createState(){return {version:1,day:0,conditions:clone(defaults),people:definitions.map(d=>({id:d.id,city:null,movedAt:0,energy:80,satisfaction:60,needs:Object.fromEntries(metrics.map(m=>[m.id,60])),action:'まだ入居していない',reason:'本人の希望で最初の地域を選びます。',history:[],scores:[]})),log:[]};}
  function rate(person,definition,conditions){
    const weights=definition.weights.slice();
    if(person.energy<45){weights[2]+=15;weights[4]+=10;}
    const total=weights.reduce((a,b)=>a+b,0);
    return ['R','G','B'].map(city=>({city,score:Math.round(metrics.reduce((sum,m,i)=>sum+conditions[city][m.id]*weights[i],0)/total*10)/10})).sort((a,b)=>b.score-a.score||a.city.localeCompare(b.city));
  }
  function record(state,person,text){
    const entry={day:state.day,id:person.id,text};person.history.unshift(entry);person.history.length=Math.min(person.history.length,60);
    state.log.unshift(entry);state.log.length=Math.min(state.log.length,240);
  }
  function step(state){
    if(!validConditions(state.conditions)) throw new Error('Invalid city conditions');
    if(state.day>=3650)return state;
    state.day++;
    state.people.forEach((person,index)=>{
      const definition=definitions[index];
      const scores=rate(person,definition,state.conditions);person.scores=scores;
      const current=scores.find(s=>s.city===person.city);
      if(!person.city){
        person.city=scores[0].city;person.movedAt=state.day;
        person.reason=definition.wish+'。仮の地域条件との一致度が最も高い'+person.city+'を選んだ。';
        record(state,person,person.city+'へ入居。'+person.reason);
      } else if(state.day%7===0){
        const cost=3+Math.min(2,(state.day-person.movedAt)/14);
        if(scores[0].city!==person.city && scores[0].score-current.score>cost && state.day-person.movedAt>=7){
          const old=person.city;person.city=scores[0].city;person.movedAt=state.day;
          person.reason=old+'より'+person.city+'の方が今の希望に合うと判断。'+(person.energy<45?'疲れがあり、静けさと暮らしの比重を増やした。':'本人の希望と地域条件を比べ直した。');
          record(state,person,old+'から'+person.city+'へ移住。'+person.reason);
        } else {
          person.reason='今週は'+person.city+'に残る。'+(scores[0].city===person.city?'今の希望に最も合っている。':'他地域の利点はあるが、移住の負担を超えるほどではない。');
          record(state,person,person.reason);
        }
      }
      const city=state.conditions[person.city];
      const choices=metrics.map((m,i)=>({metric:m,priority:definition.weights[i]*(100-person.needs[m.id])/100}));
      choices.sort((a,b)=>b.priority-a.priority||metrics.indexOf(a.metric)-metrics.indexOf(b.metric));
      const action=person.energy<30?metrics[2]:choices[0].metric;
      metrics.forEach((m,i)=>{person.needs[m.id]=clamp(person.needs[m.id]-3-definition.weights[i]/40+(city[m.id]-50)*.02+(m.id===action.id?12+city[m.id]*.03:0));});
      person.energy=clamp(person.energy+(action.id==='quiet'?18+city.quiet/10:action.id==='comfort'?10:action.id==='connection'?-4:-10));
      person.satisfaction=Math.round(metrics.reduce((sum,m,i)=>sum+person.needs[m.id]*definition.weights[i],0)/100);
      person.action=action.action+(person.energy<30?'（休息が必要）':'');
      if(state.day<=3||state.day%5===0)record(state,person,person.city+'で'+action.action+'。生活充足 '+person.satisfaction+'/100、余力 '+Math.round(person.energy)+'/100。');
    });
    return state;
  }
  function advance(state,days){
    if(!Number.isInteger(days)||days<0||days>3650)throw new Error('Invalid day count');
    for(let day=0;day<days;day++)step(state);
    return state;
  }
  function restore(raw){
    if(!raw||raw.version!==1||!Number.isInteger(raw.day)||raw.day<0||raw.day>3650||!validConditions(raw.conditions)||!Array.isArray(raw.people)||raw.people.length!==6||!Array.isArray(raw.log))return null;
    const validEntry=e=>e&&Number.isInteger(e.day)&&e.day>=0&&e.day<=raw.day&&definitions.some(d=>d.id===e.id)&&typeof e.text==='string'&&e.text.length<600;
    if(raw.log.length>240||!raw.log.every(validEntry))return null;
    for(let i=0;i<6;i++){
      const p=raw.people[i];
      if(!p||p.id!==definitions[i].id||!(p.city===null&&raw.day===0||['R','G','B'].includes(p.city))||!Number.isInteger(p.movedAt)||p.movedAt<0||p.movedAt>raw.day||![p.energy,p.satisfaction].every(v=>Number.isFinite(v)&&v>=0&&v<=100)||!p.needs||!metrics.every(m=>Number.isFinite(p.needs[m.id])&&p.needs[m.id]>=0&&p.needs[m.id]<=100)||typeof p.action!=='string'||p.action.length>120||typeof p.reason!=='string'||p.reason.length>600||!Array.isArray(p.history)||p.history.length>60||!p.history.every(validEntry)||!Array.isArray(p.scores)||p.scores.length>3||!p.scores.every(s=>s&&['R','G','B'].includes(s.city)&&Number.isFinite(s.score)&&s.score>=0&&s.score<=100))return null;
    }
    return clone(raw);
  }
  return {metrics,definitions,defaults:clone(defaults),createState,advance,restore};
});
