const fs=require('node:fs');
const path=require('node:path');
const sim=require('./community-engine.js');
function run(improvements){
  const state=sim.createState({improvements}),sum=Object.fromEntries(sim.definitions.map(p=>[p.id,0]));
  const years=[];
  for(let day=1;day<=3650;day++){
    sim.advance(state,1);
    if(day>3285)state.people.forEach(p=>sum[p.id]+=p.satisfaction);
    if(day%365===0)years.push({year:day/365,population:Object.fromEntries(['R','G','B'].map(city=>[city,state.people.filter(p=>p.city===city).length])),completed:state.community.stats.completed});
  }
  return {people:state.people.map(p=>({id:p.id,city:p.city,lastDay:p.satisfaction,lastYearMean:Math.round(sum[p.id]/365*10)/10})),years,stats:state.community.stats,projects:state.community.projects.filter(p=>p.status==='completed'||p.status==='blocked').map(p=>({city:p.city,name:sim.projectTypes[p.type].name,status:p.status,created:p.created,finished:p.finished||null,members:p.members,reason:p.reason,effect:p.effect||null}))};
}
const report={version:1,days:3650,yearDays:365,basis:'標準の地域条件。成人の仮住民6人。共同活動と学びの有無を比較したルール式試算。',baseline:run(false),improved:run(true)};
fs.writeFileSync(path.join(__dirname,'records/community_comparison_v0_16.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'assets/data/community-comparison-v16.js'),'window.TriathlonCommunityReport='+JSON.stringify(report)+';\n');
console.log(JSON.stringify(report,null,2));
