// Generated data only; upstream revision is pinned for reproducible updates.
const fs = require('node:fs');
const path = require('node:path');
const d3 = require('../vendor/d3-7.9.0.min.js');
const revision = 'ca96624a56bd078437bca8184e78163e5039ad19';
async function main() {
  const features = [];
  for (const [kind, layer] of [['river', 'rivers_lake_centerlines'], ['lake', 'lakes']]) {
    const url = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${revision}/geojson/ne_110m_${layer}.geojson`;
    const response = await fetch(url);
    if (!response.ok) throw Error(`Geography download failed: ${response.status}`);
    const data = await response.json();
    if (data.type !== 'FeatureCollection') throw Error('Unexpected upstream format');
    for (const item of data.features) {
      if (item.properties.featurecla !== (kind === 'river' ? 'River' : 'Lake')) continue;
      const geometry = item.geometry;
      if (kind === 'lake') {
        const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        for (const rings of polygons) {
          if (d3.geoArea({type:'Polygon', coordinates:rings}) > 2 * Math.PI) rings.forEach(ring => ring.reverse());
        }
      }
      features.push({type:'Feature', properties:{id:kind + '-' + item.properties.ne_id + '-' + features.length, kind,
        name:item.properties.name_ja || item.properties.name, rank:item.properties.scalerank}, geometry});
    }
  }
  const output = {type:'FeatureCollection', source:'Natural Earth 1:110m', revision, checkedAt:'2026-10-30', features};
  const body = '// Natural Earth public-domain physical data. See map/geography-sources.json.\nwindow.TRI_GEOGRAPHY=' + JSON.stringify(output) + ';\n';
  if (Buffer.byteLength(body) > 600000) throw Error('Geography exceeds lightweight asset budget');
  fs.writeFileSync(path.join(__dirname, '../assets/data/geography.js'), body);
  console.log(JSON.stringify({features:features.length,bytes:Buffer.byteLength(body),revision}));
}
main().catch(error => { console.error(error); process.exitCode=1; });
