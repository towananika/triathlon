const assert=require('node:assert/strict');
const sim=require('./community-engine.js');
const base=sim.advance(sim.createState({improvements:false}),3650);
const improved=sim.advance(sim.createState(),3650);
assert.equal(improved.day,3650);
assert(improved.community.stats.completed>0);
assert(improved.community.projects.length<=30);
assert(improved.community.events.length<=120);
assert.deepEqual(improved,sim.advance(sim.createState(),3650));
assert.equal(base.people.find(p=>p.id==='E').satisfaction,55);
for(const city of ['R','G','B']) {
  assert(improved.community.cities[city].used<=3);
  assert(improved.community.cities[city].funds>=0);
}
for(const p of improved.people) assert(Object.values(p.skills).every(v=>v>=0&&v<=10));
for(const project of improved.community.projects.filter(p=>p.status==='completed')) {
  assert(project.members.length>=2);
  assert(project.finished>=project.created);
}
assert(sim.restore(improved));
const invalid=JSON.parse(JSON.stringify(improved));invalid.community.cities.G.used=99;
assert.equal(sim.restore(invalid),null);
const conflict=sim.advance(sim.createState(),90);
conflict.community.projects=[{id:99,city:'B',type:'challenge',proposer:'A',created:90,status:'proposed',progress:0,members:[],reason:'test'}];conflict.community.nextId=100;
sim.advance(conflict,8);assert.equal(conflict.community.projects[0].status,'blocked');assert.match(conflict.community.projects[0].reason,/不利益/);
const migrated=sim.restore(require('./residence-engine.js').advance(require('./residence-engine.js').createState(),30));
assert(migrated&&migrated.day===30&&migrated.community.enabled);
const noMoney=sim.createState();for(const city of ['R','G','B'])noMoney.community.cities[city].funds=0;
sim.advance(noMoney,180);assert.equal(noMoney.community.stats.completed,0);
const noLand=sim.createState();for(const city of ['R','G','B'])noLand.community.cities[city].used=3;
sim.advance(noLand,365);assert.equal(noLand.community.stats.completed,0);assert(noLand.community.stats.blocked>0);
console.log(JSON.stringify({baseline:base.people.map(p=>({id:p.id,city:p.city,score:p.satisfaction})),improved:improved.people.map(p=>({id:p.id,city:p.city,score:p.satisfaction})),stats:improved.community.stats,completed:improved.community.projects.filter(p=>p.status==='completed').map(p=>({city:p.city,type:p.type,members:p.members,finished:p.finished})),test:'community engine passed'},null,2));
