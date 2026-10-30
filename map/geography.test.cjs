const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const d3 = require('../vendor/d3-7.9.0.min.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/data/geography.js'),'utf8'),context);
const data = context.window.TRI_GEOGRAPHY;
test('physical data is small, attributed and contains only rivers and natural lakes',()=>{
  assert.equal(data.features.length,37);
  assert.ok(fs.statSync(require.resolve('../assets/data/geography.js')).size<60000);
  assert.equal(new Set(data.features.map(f=>f.properties.id)).size,37);
  for(const feature of data.features) {
    assert.ok(['river','lake'].includes(feature.properties.kind));
    assert.ok(feature.properties.name);
    if(feature.properties.kind==='lake') assert.ok(d3.geoArea(feature)<2*Math.PI);
  }
});
test('coordinates remain within Earth bounds',()=>{
  function visit(value) {
    if(typeof value[0]==='number') {assert.ok(Math.abs(value[0])<=180);assert.ok(Math.abs(value[1])<=90);}
    else value.forEach(visit);
  }
  data.features.forEach(f=>visit(f.geometry.coordinates));
});
