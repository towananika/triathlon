(function(root){
  'use strict';
  var LABELS={power:'電力',water:'上下水道',health:'医療',education:'教育',communications:'通信'};
  function clamp(v){return Math.max(0,Math.min(1,v));}
  function create(name){return {name:name,stableMonths:0,institutions:.2,research:0,services:{power:0,water:0,health:0,education:0,communications:0},formedDay:null,modernDay:null,spent:0,blocked:'調査・資源の確認',milestones:[]};}
  function stage(c){return c.modernDay!==null?'現代基盤':c.formedDay!==null?'文明成立':'基盤整備';}
  function step(c,provinces,nation,day){
    if(day%30!==0)return [];
    var pop=provinces.reduce(function(n,p){return n+p.pop;},0),events=[];
    var food=provinces.reduce(function(n,p){return n+(1-p.short)*p.pop;},0)/Math.max(1,pop);
    var stable=food>=.98 && provinces.every(function(p){return p.stock.food>=p.pop*7;});
    c.stableMonths=stable?c.stableMonths+1:0;
    // Fictional development units. Reserve household supplies before investing surplus.
    var available=provinces.reduce(function(n,p){return n+Math.min(Math.max(0,p.stock.mat-p.pop*2),Math.max(0,p.stock.goods-p.pop*20));},0);
    var budget=Math.max(0,nation.budget)*30*.02;
    var invest=stable?Math.min(available,budget,pop*.08):0;
    c.blocked=!stable?'食料の安定供給が不足':invest<=0?'建設資材・製品または予算が不足':'';
    if(invest>0){
      var remaining=invest;
      provinces.forEach(function(p){var amount=Math.min(remaining,Math.max(0,p.stock.mat-p.pop*2),Math.max(0,p.stock.goods-p.pop*20));p.stock.mat-=amount;p.stock.goods-=amount;remaining-=amount;});
      var effort=(invest-remaining)/Math.max(1,pop*.08);
      c.spent+=invest-remaining;
      c.institutions=clamp(c.institutions+.006*effort);
      c.services.education=clamp(c.services.education+.006*effort);
      c.research=clamp(c.research+.004*effort*(.25+.75*c.services.education));
      Object.keys(LABELS).forEach(function(key){
        if(key==='education')return;
        var gate=key==='communications'?.45:key==='health'?.25:.1;
        if(c.research<gate)return;
        if((key==='health'||key==='communications')&&c.services.power<.3)return;
        c.services[key]=clamp(c.services[key]+.005*effort);
      });
    }
    if(!stable)Object.keys(c.services).forEach(function(key){c.services[key]=clamp(c.services[key]-.002);});
    function mark(type,text){c.milestones.push({day:day,type:type});events.push({k:'development',t:c.name+'：'+text,where:c.name});}
    if(c.formedDay===null && c.stableMonths>=12 && c.institutions>=.35 && c.services.education>=.1){c.formedDay=day;mark('formed','安定した食料供給・共同制度・教育の基礎が成立（モデル上の文明成立）');}
    var modern=c.formedDay!==null && c.stableMonths>=12 && c.institutions>=.8 && c.research>=.8 && Object.keys(c.services).every(function(key){return c.services[key]>=.8;});
    if(c.modernDay===null && modern){c.modernDay=day;mark('modern','電力・上下水道・医療・教育・通信が基準に到達（モデル上の現代基盤）');}
    return events;
  }
  function costOfLiving(p,profile){
    profile=profile||{};
    ['income','support'].forEach(function(key){if(profile[key]!=null&&(!Number.isFinite(profile[key])||profile[key]<0))throw new RangeError('Invalid '+key);});
    var housing=profile.housing||'unknown';
    if(['unknown','rent','family','dorm','owned'].indexOf(housing)<0)throw new RangeError('Invalid housing');
    var reference=120,food=30*p.price.food;
    var housingRate={unknown:null,rent:.3,family:.1,dorm:.15,owned:.12}[housing];
    var rent=housingRate===null?null:reference*housingRate*(.6+.4*p.price.goods/2);
    var expenses={food:food,housing:rent,utilities:reference*.08*p.price.goods/2,transport:null,health:reference*.04*p.price.goods/2,communications:reference*.03*p.price.goods/2};
    // A route and fare must be supplied; no invented commute or free transportation.
    if(profile.transport!=null){if(!Number.isFinite(profile.transport)||profile.transport<0)throw new RangeError('Invalid transport');expenses.transport=profile.transport;}
    var knownTotal=Object.keys(expenses).reduce(function(n,k){return n+(expenses[k]===null?0:expenses[k]);},0);
    var complete=Object.keys(expenses).every(function(k){return expenses[k]!==null;});
    var income=profile.income==null?null:profile.income+(profile.support||0);
    return {unit:'仮のモデル単位／月・実通貨ではない',housing:housing,expenses:expenses,knownTotal:knownTotal,total:complete?knownTotal:null,income:income,balance:complete&&income!==null?income-knownTotal:null,unresolved:Object.keys(expenses).filter(function(k){return expenses[k]===null;})};
  }
  root.TRI_DEVELOPMENT={labels:LABELS,create:create,step:step,stage:stage,costOfLiving:costOfLiving};
  if(typeof module==='object'&&module.exports)module.exports=root.TRI_DEVELOPMENT;
})(typeof window!=='undefined'?window:globalThis);
