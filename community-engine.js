(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./residence-engine.js'));
  else root.CommunitySim=factory(root.ResidenceSim);
})(typeof window!=='undefined'?window:globalThis,function(base){
  'use strict';
  const types={
    challenge:{name:'挑戦・練習スペース',target:'challenge',cost:4,work:10,impact:{challenge:6,quiet:-2}},
    connection:{name:'交流の共有スペース',target:'connection',cost:4,work:10,impact:{connection:6,quiet:-1}},
    quiet:{name:'静かな庭',target:'quiet',cost:4,work:10,impact:{quiet:6,challenge:-1}},
    research:{name:'共同の学習室',target:'research',cost:4,work:10,impact:{research:6,connection:-1}},
    comfort:{name:'共同生活の支援拠点',target:'comfort',cost:4,work:10,impact:{comfort:6,quiet:-1}}
  };
  const clamp=n=>Math.max(0,Math.min(100,n));
  const validId=id=>base.definitions.some(d=>d.id===id);
  function addFields(state,enabled=true){
    state.community={version:1,enabled,cities:Object.fromEntries(['R','G','B'].map(city=>[city,{funds:12,used:0}])),projects:[],events:[],nextId:1,stats:{completed:0,blocked:0}};
    state.people.forEach(p=>{p.skills=Object.fromEntries(base.metrics.map(m=>[m.id,0]));p.practice=Object.fromEntries(base.metrics.map(m=>[m.id,0]));});
    return state;
  }
  function createState(options={}){return addFields(base.createState(),options.improvements!==false);}
  function event(state,text,city,id){
    state.community.events.unshift({day:state.day,text,city,id:id||''});state.community.events.length=Math.min(120,state.community.events.length);
  }
  function effects(state,city,type){
    return Object.fromEntries(base.metrics.map(m=>[m.id,clamp(state.conditions[city][m.id]+(type.impact[m.id]||0))-state.conditions[city][m.id]]));
  }
  function benefit(person,effect){
    const weights=base.definitions.find(d=>d.id===person.id).weights;
    return Math.round(base.metrics.reduce((sum,m,i)=>sum+effect[m.id]*weights[i]/100,0)*10000)/10000;
  }
  function block(state,project,message){
    project.status='blocked';project.reason=message;state.community.stats.blocked++;event(state,types[project.type].name+'は見送り。'+message,project.city,project.proposer);
  }
  function review(state,project){
    const community=state.community,type=types[project.type],city=community.cities[project.city];
    if(city.used>=3){block(state,project,'仮の敷地枠が不足している。別の方法や本人の学びを検討する。');return;}
    const effect=effects(state,project.city,type),residents=state.people.filter(p=>p.city===project.city);
    if(effect[type.target]<=0){block(state,project,'この条件はすでに上限。施設を増やしても改善しない。');return;}
    const opponents=residents.filter(p=>benefit(p,effect)<0);
    if(opponents.length){block(state,project,opponents.map(p=>'仮住民'+p.id).join('・')+'の望む暮らしへの不利益があり、合意できない。');return;}
    const members=residents.filter(p=>p.energy>=40&&p.satisfaction>=35&&benefit(p,effect)>=.1);
    project.members=members.map(p=>p.id);
    if(members.length<2){project.reason='賛同して作業できる人が2人に満たない。参加を強制しない。';return;}
    if(project.status==='proposed'){
      if(city.funds<type.cost){project.reason='共同資源が足りない。次の補充を待つ。';return;}
      city.funds-=type.cost;project.status='working';event(state,type.name+'を共同で試す。参加：'+project.members.join('・'),project.city,project.proposer);
    }
    project.reason='本人が選んだ参加者で、負担を分けて作業する。';
    members.forEach(p=>{
      project.progress++;p.energy=clamp(p.energy-5);p.needs.connection=clamp(p.needs.connection+1);p.action='仲間と'+type.name+'を整える';
    });
    if(project.progress>=type.work){
      Object.entries(effect).forEach(([metric,value])=>{state.conditions[project.city][metric]+=value;});
      city.used++;project.status='completed';project.finished=state.day;project.effect=effect;community.stats.completed++;
      event(state,type.name+'が完成。良い面だけでなく、条件の変化を記録した。',project.city,project.proposer);
    }
  }
  function propose(state,person){
    if(person.satisfaction>=72)return;
    const definition=base.definitions.find(d=>d.id===person.id),community=state.community;
    const candidates=base.metrics.map((metric,index)=>({id:metric.id,priority:definition.weights[index]*(100-person.needs[metric.id])})).sort((a,b)=>b.priority-a.priority);
    const chosen=candidates.find(candidate=>state.conditions[person.city][candidate.id]<100&&!community.projects.some(p=>p.city===person.city&&p.type===candidate.id&&(p.status!=='blocked'||state.day-p.created<365)));
    if(!chosen)return;
    const project={id:community.nextId++,city:person.city,type:chosen.id,proposer:person.id,created:state.day,status:'proposed',progress:0,members:[],reason:'困りごとを共有し、協力できる人を探している。'};
    community.projects.push(project);event(state,person.id+'が'+types[chosen.id].name+'を提案。望む暮らしとの差を小さくしたい。',person.city,person.id);
    if(community.projects.length>30){const old=community.projects.findIndex(p=>p.status==='blocked');if(old>=0)community.projects.splice(old,1);}
  }
  function step(state){
    if(state.day>=3650)return state;
    base.advance(state,1);
    if(!state.community.enabled)return state;
    const community=state.community;
    if(state.day%365===0)['R','G','B'].forEach(city=>{community.cities[city].funds=Math.min(24,community.cities[city].funds+2);});
    if(state.day>60)state.people.forEach(person=>{
      const action=base.metrics.find(m=>person.action.startsWith(m.action));
      if(action){
        person.practice[action.id]++;
        if(person.practice[action.id]>=20&&person.skills[action.id]<10){
          person.practice[action.id]=0;person.skills[action.id]++;
          event(state,person.id+'は自分の'+action.name+'の工夫を身につけた。',person.city,person.id);
        }
        person.needs[action.id]=clamp(person.needs[action.id]+person.skills[action.id]*.2);
      }
    });
    if(state.day>=90&&state.day%30===0)state.people.forEach(p=>propose(state,p));
    if(state.day>=90&&state.day%7===0)community.projects.filter(p=>p.status==='proposed'||p.status==='working').forEach(p=>review(state,p));
    state.people.forEach((person,index)=>{person.satisfaction=Math.round(base.metrics.reduce((sum,m,i)=>sum+person.needs[m.id]*base.definitions[index].weights[i]/100,0));});
    return state;
  }
  function advance(state,days){
    if(!Number.isInteger(days)||days<0||days>3650)throw new Error('Invalid day count');
    for(let i=0;i<days&&state.day<3650;i++)step(state);
    return state;
  }
  function restore(raw){
    const state=base.restore(raw);if(!state)return null;
    if(!state.community)return addFields(state);
    const c=state.community;
    const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
    if(c.version!==1||typeof c.enabled!=='boolean'||!integer(c.nextId,1,100000)||!c.cities||!['R','G','B'].every(city=>c.cities[city]&&Number.isFinite(c.cities[city].funds)&&c.cities[city].funds>=0&&c.cities[city].funds<=24&&integer(c.cities[city].used,0,3))||!c.stats||!integer(c.stats.completed,0,9)||!integer(c.stats.blocked,0,100000)||!Array.isArray(c.projects)||c.projects.length>30||!Array.isArray(c.events)||c.events.length>120)return null;
    for(const p of state.people)if(!p.skills||!p.practice||!base.metrics.every(m=>integer(p.skills[m.id],0,10)&&integer(p.practice[m.id],0,3650)))return null;
    const ids=new Set();
    for(const p of c.projects){
      if(!p||!integer(p.id,1,c.nextId-1)||ids.has(p.id)||!['R','G','B'].includes(p.city)||!Object.hasOwn(types,p.type)||!validId(p.proposer)||!integer(p.created,0,state.day)||!['proposed','working','completed','blocked'].includes(p.status)||!integer(p.progress,0,20)||!Array.isArray(p.members)||p.members.length>6||new Set(p.members).size!==p.members.length||!p.members.every(validId)||typeof p.reason!=='string'||p.reason.length>400)return null;
      if(p.status==='completed'&&(!integer(p.finished,p.created,state.day)||!p.effect||!base.metrics.every(m=>Number.isFinite(p.effect[m.id])&&Math.abs(p.effect[m.id])<=6)))return null;
      ids.add(p.id);
    }
    for(const e of c.events)if(!e||!integer(e.day,0,state.day)||!['R','G','B'].includes(e.city)||!(e.id===''||validId(e.id))||typeof e.text!=='string'||e.text.length>500)return null;
    return state;
  }
  return {...base,createState,advance,restore,projectTypes:types};
});
