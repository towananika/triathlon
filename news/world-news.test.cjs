const assert = require('node:assert/strict');
const api = require('./world-news.js');
const sim = require('../sim/world-sim.js');
const entries = api.build(sim, 0);
assert(entries.some(n => n.kind === 'voice' && n.person === 'アカリ'));
assert(entries.some(n => n.id === 'world-summary-0'));
const injected = entries.concat([
  { id: 'future', public: true, day: 10, kind: 'change', body: 'future' },
  { id: 'admin', public: true, day: 0, kind: 'update', body: 'admin' },
  { id: 'private', public: false, day: 0, kind: 'voice', body: 'private' },
  { id: 'valid', public: true, day: 0, kind: 'change', body: 'public', secret: 'hidden' }
]);
const visible = api.read(injected, { character: 'アカリ', asOf: 0 });
assert(!visible.some(n => ['future', 'admin', 'private'].includes(n.id)));
assert(!('secret' in visible.find(n => n.id === 'valid')));
assert.deepEqual(visible, api.read(injected, { asOf: 0 }));
assert.throws(() => api.read(entries, {}), RangeError);
assert.throws(() => api.read(entries, { asOf: 0, character: 'unknown' }), RangeError);
const later = api.build(sim, 35);
assert(later.some(n => n.id === 'population-35'));
assert(api.read(later, { asOf: 35 }).every(n => n.day <= 35));
console.log('World news: public scope, character access, time boundary, summaries OK');
