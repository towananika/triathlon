// マップ：1枚の地球を拡大していくと、国 → 州 → 町の点、と見えるものが増える。
// さがす・レイヤー・場所のカード・共有・保存は Googleマップのような使い方。
// 二水の町の地図は、1kmまで拡大できるようになったら入れ直す（記録は project-files の archive/nisui-city-v0.32）。
(function () {
  'use strict';
  var SIM = window.TRI_SIM;
  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---- 世界のデータ ----
  var PLACES = [
    { id: 'nisui', name: '二水', sub: '水和国の首都', ll: [126.98, 37.57], text: '二つの川が出会う町。川守隊が町を守り、路面電車が走ります。物語の舞台です。' },
    { id: 'meisan', name: '明山', sub: '文光国の首都', ll: [128.05, 38.62], text: '北の山の学園都市。学者たちが治め、灯石と光の研究をしています。' },
    { id: 'hakko', name: '白港', sub: '改神国の首都', ll: [130.4, 33.6], text: '海のむこうの、白い石の港。祈りの鐘の音で一日が動きます。' }
  ];
  var NATIONS = [{ name: '水和国', n: 'n1', c: [127.3, 36.4], col: '#2f7d4a' }, { name: '文光国', n: 'n2', c: [127.6, 39.8], col: '#4c56a8' }, { name: '改神国', n: 'n3', c: [131.2, 32.6], col: '#a86412' }];
  // 自然地理は現代の地名。国・都市の作品設定とは分離する。
  var NAMES = [['黄海', 124.2, 36.2, 'w', 3], ['対馬海峡', 129.0, 34.2, 'w', 6],
    ['北漢江', 127.55, 37.8, 'w', 18], ['南漢江', 127.75, 37.3, 'w', 18], ['漢江', 126.8, 37.62, 'w', 10], ['鴨緑江', 124.9, 40.2, 'w', 10],
    ['太白山脈', 128.95, 36.9, 'm', 6], ['白頭山', 128.08, 42.0, 'm', 6], ['済州島', 126.55, 33.38, 'i', 6]];
  var NAT = { n1: '水和国', n2: '文光国', n3: '改神国' };
  // 州：[名前, 国, 西,南,東,北, 中心の町, 人口(仮), 説明]（並びは world-sim.js と同じ）
  var PROV = [
    ['二水州', 'n1', 125.8, 37.0, 127.6, 38.3, '二水', '約120万', '水和国の首都がある州。二つの川の合流点に町が広がる。川守隊の本部もここ。'],
    ['平川州', 'n1', 127.6, 36.4, 129.7, 38.3, '平川', '約40万', '東の山と平らな川の谷。米と木材を二水へ運ぶ。'],
    ['玉石州', 'n1', 125.8, 34.2, 127.6, 37.0, '玉石', '約60万', '西の海辺と田んぼ。灯石のかけら（玉石）が浜で拾える。'],
    ['南田州', 'n1', 127.6, 34.6, 129.7, 36.4, '南田', '約50万', '南の港と田畑。改神国への船が出る。'],
    ['明山州', 'n2', 126.8, 38.3, 130.6, 39.6, '明山', '約70万', '文光国の首都。学者が治める学園都市で、灯石と光の研究の中心。'],
    ['北林州', 'n2', 126.8, 39.6, 129.9, 41.3, '北林', '約20万', '深い森と雪の州。森の民が多く、道は冬に閉ざされる。'],
    ['星原州', 'n2', 124.2, 38.3, 126.8, 41.0, '星原', '約30万', '広い草原。夜空がよく見え、星を読む学者の村がある。'],
    ['白港州', 'n3', 129.6, 33.0, 131.0, 34.6, '白港', '約90万', '改神国の首都。白い石の港で、祈りの鐘が朝夕に鳴る。'],
    ['花田州', 'n3', 131.0, 33.0, 132.4, 34.6, '花田', '約30万', '花と茶の段々畑。巡礼の人が通る道ぞいの州。'],
    ['火山州', 'n3', 130.2, 30.8, 132.2, 33.0, '火山', '約35万', '煙をあげる山のふもと。温泉と、黒い石の工房がある。']
  ];
  function poly(w, s, e, n) {
    var r = [], i;
    for (i = 0; i <= 8; i++) r.push([w + (e - w) * i / 8, s]);
    for (i = 0; i <= 8; i++) r.push([e, s + (n - s) * i / 8]);
    for (i = 8; i >= 0; i--) r.push([w + (e - w) * i / 8, n]);
    for (i = 8; i >= 0; i--) r.push([w, s + (n - s) * i / 8]);
    var f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [r] } };
    if (d3.geoArea(f) > 2 * Math.PI) r.reverse();
    return f;
  }
  PROV.forEach(function (p) { p.f = poly(p[2], p[3], p[4], p[5]); p.c = [(p[2] + p[4]) / 2, (p[3] + p[5]) / 2]; });

  // 二水の町の座標（360×290、60で1km）と経緯度の対応。町の真ん中 (180,145) が二水の点
  var C0 = [126.98, 37.57], KM = 60, COSL = Math.cos(C0[1] * Math.PI / 180);
  function c2ll(x, y) { return [C0[0] + (x - 180) / KM / (111.32 * COSL), C0[1] - (y - 145) / KM / 110.57]; }

  // ---- 画面とマップ ----
  var stage = $('stage'), svg = d3.select('#world'), W = 600, H = 600;
  var land = topojson.feature(window.triathlonLand, window.triathlonLand.objects.land);
  var proj = d3.geoOrthographic().clipAngle(90), path = d3.geoPath(proj);
  var rot = [-127.6, -36.5, 0], k = 2.4, base = 280;
  function fit() {
    var top = stage.getBoundingClientRect().top + window.scrollY, bot = document.querySelector('.tri-bottom'), bh = bot && getComputedStyle(bot).display !== 'none' ? bot.offsetHeight : 0;
    stage.style.height = Math.max(380, window.innerHeight - top - bh - 12) + 'px';
    W = stage.clientWidth; H = stage.clientHeight; base = Math.min(W, H) * .47;
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);
  }
  var defs = svg.append('defs');
  defs.append('clipPath').attr('id', 'landclip').append('path').attr('id', 'landclipP');
  // 地形のある範囲では、本物の海岸線（地形データ）を使い、粗い世界地図の陸はかくす
  var mk = defs.append('mask').attr('id', 'nobox'); mk.append('rect').attr('x', -1e4).attr('y', -1e4).attr('width', 3e4).attr('height', 3e4).attr('fill', '#fff'); mk.append('path').attr('id', 'boxP').attr('fill', '#000');
  var gOcean = svg.append('path').attr('class', 'ocean'), gGrat = svg.append('path').attr('class', 'grat'), gSea = svg.append('g').attr('class', 'ctl-sea'), gLand = svg.append('path').attr('class', 'land'), gSurf = svg.append('g').attr('class', 'surf');
  var gRel = svg.append('g').attr('class', 'relief'), gTile = svg.append('g').attr('class', 'tiles'), gProv = svg.append('g').attr('clip-path', 'url(#landclip)'), gCtl = svg.append('g').attr('class', 'ctl-land'), gRiv = svg.append('g').attr('class', 'riv'), gNet = svg.append('g').attr('class', 'net');
  var gCiv = svg.append('g'), gRim = svg.append('path').attr('class', 'rim'), gCol = svg.append('g'), gLab = svg.append('g'), gWx = svg.append('g').attr('class', 'wxl'), gPin = svg.append('g'), gScale = svg.append('g').attr('class', 'scale');
  var gHydro = svg.insert('g', '.net').attr('class', 'geography');
  var gGrid = svg.insert('g', '.net').attr('class', 'grid'), gTown = svg.insert('g', '.net').attr('class', 'towns');
  var geography = (window.TRI_GEOGRAPHY || {features:[]}).features;
  gHydro.selectAll('path').data(geography).enter().append('path')
    .attr('class', function (f) { return 'geo-' + f.properties.kind; })
    .style('fill', function (f) { return f.properties.kind === 'lake' ? '#aadaff' : 'none'; })
    .style('stroke', '#6aaecb').style('stroke-width', 1.1)
    .attr('tabindex', 0).attr('role', 'button').attr('aria-label', function (f) { return f.properties.name; })
    .on('click', function (e, f) { openGeography(f); })
    .on('keydown', function (e, f) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGeography(f); } });
  function openGeography(f) {
    showCard({id:'g-' + f.properties.id, title:f.properties.name,
      sub:f.properties.kind === 'lake' ? '自然湖・広域概略' : '河川・広域概略',
      text:'Natural Earthの自然地理データ。小さな支流や湖岸の細部、流量・水深は含みません。都市や復興の状態を表すものではありません。'});
  }
  function declutterLabels() {
    var boxes = [], count = 0;
    var nodes = gPin.selectAll('text').nodes().concat(gLab.selectAll('text').nodes(), gCiv.selectAll('text').nodes(), gCol.selectAll('text').nodes());
    nodes.forEach(function (node) {
      if (getComputedStyle(node).display === 'none' || getComputedStyle(node.parentNode).display === 'none') return;
      var b = node.getBoundingClientRect(), frame = stage.getBoundingClientRect();
      var overlaps = boxes.some(function (a) { return b.left < a.right + 10 && b.right + 10 > a.left && b.top < a.bottom + 6 && b.bottom + 6 > a.top; });
      var offscreen = b.width === 0 || b.left < frame.left + 8 || b.right > frame.right - 48 || b.top < frame.top + 62 || b.bottom > frame.bottom - 34;
      if (offscreen || (!LY.labels && (overlaps || count >= (W < 600 ? 7 : 14)))) node.style.display = 'none';
      else { boxes.push(b); count++; }
    });
  }

  // ---- 本物の地形（assets/data/relief.js）----
  var RCOL = { 1: '#dfe6c8', 200: '#e6dfbd', 500: '#d8c99f', 1000: '#c4ad83', 1500: '#ae9572', 2000: '#98806a', 3000: '#857065' };
  function dec(mp, sc) { sc = sc || 100; return mp.map(function (poly) { return poly.map(function (r) { var o = [], x = 0, y = 0; for (var i = 0; i < r.length; i += 2) { x += r[i]; y += r[i + 1]; o.push([x / sc, y / sc]); } return o; }); }); }
  // 地形は地域ごとのファイルに分けてある（assets/data/relief/）。はじめは一番低い段だけ読み、画面に見えている地域の分をあとから読む
  var RB = window.TRI_RELIEF_BASE, REG = RB ? RB.regions.concat([{ id: 99, bb: [110, 22, 145, 50] }]) : [], LOADED = {}, ASKED = {};
  var REL = RB ? [{ cl: 'rb', col: RCOL[RB.b0[0]], g: { type: 'MultiPolygon', coordinates: dec(RB.b0[1]) }, o: 0, r: -1 }] : [];
  var BOX = poly(110.02, 22.02, 144.98, 49.98);
  function relJoin() {
    REL.sort(function (a, b) { return a.o - b.o || a.r - b.r; });
    var j = gRel.selectAll('path').data(REL, function (d) { return d.o + ':' + d.r; });
    j.enter().append('path').attr('class', function (d) { return d.cl; }).style('fill', function (d) { return d.col || null; }).style('fill-opacity', function (d) { return d.op || null; });
    gRel.selectAll('path').order();
  }
  relJoin();
  window.TRI_RELIEF_ON = function (id) {
    var P = (window.TRI_RELIEF_PART || {})[id]; if (!P || LOADED[id]) return; LOADED[id] = 1;
    P.b.forEach(function (g) { REL.push({ cl: 'rb', col: RCOL[g[1]], g: { type: 'MultiPolygon', coordinates: dec(g[2]) }, o: g[0], r: id }); });
    P.d.forEach(function (g) { REL.push({ cl: 'rd', op: g[1] < .4 ? .1 : .2, g: { type: 'MultiPolygon', coordinates: dec(g[2]) }, o: 10 + g[0], r: id }); });
    relJoin(); if (typeof draw === 'function') draw();
  };
  function need(id) { if (ASKED[id]) return; ASKED[id] = 1; var sc = document.createElement('script'); sc.src = '../assets/data/relief/r' + id + '.js?v=0.52'; document.head.appendChild(sc); }
  // その地域が、いま画面に見えているか（四すみ・辺のまん中・中心のどれかが見えていれば見えている）
  function regionOn(g) {
    if (g.id === 99) return true;
    var b = g.bb, xs = [b[0], (b[0] + b[2]) / 2, b[2]], ys = [b[1], (b[1] + b[3]) / 2, b[3]], hit = false, mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    xs.forEach(function (x) { ys.forEach(function (y) { if (!visible([x, y])) return; var q = proj([x, y]); if (!q) return; hit = true; mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mxy = Math.max(mxy, q[1]); }); });
    return hit && mxx > 0 && mnx < W && mxy > 0 && mny < H || (hit && mnx <= 0 && mxx >= W) || (hit && mny <= 0 && mxy >= H);
  }

  // ---- 世界の表面の地形（assets/data/world/）：遠くでは世界全体の粗い形（w0）、近づくと見えているブロック（主な都市ごと、w1）だけ読む ----
  var SCOL = { '-200': '#c3e2fb', '-100': '#c3e2fb', '0': '#f2efe9', '100': '#eeebe2', '200': '#e9e5d9', '500': '#e3ddcc', '1000': '#dcd3be', '1500': '#d4c9b0', '2000': '#cbbfa4', '3000': '#c4b8a0', '4000': '#efefec', bg: '#aadaff', gf: '#c8e0b4', gg: '#e4eabf', gd: '#f2e2b8', gt: '#dde3d6', gi: '#fbfbfb', lk: '#aadaff', r0: '#9ccff5', 's0.14': '#5e5246', 's0.32': '#5e5246' };
  function wline(r, sc) { var o = [], x = 0, y = 0; for (var i = 0; i < r.length; i += 2) { x += r[i]; y += r[i + 1]; o.push([x / sc, y / sc]); } return o; }
  var SNUM = Object.keys(SCOL).filter(function (v) { return !isNaN(+v); }).map(Number).sort(function (a, b) { return a - b; }), SINT = d3.scaleLinear().domain(SNUM).range(SNUM.map(function (v) { return SCOL[v]; })); // 町の細かい段（10m・20m…）は、まわりの段の色のあいだ
  function scol(v) { return SCOL[v] || (isNaN(+v) ? null : SINT(+v)); }
  // 町のまわり（100m）：低い土地は緑、高いほど茶色。等高線つき
  var TCOL = d3.scaleLinear().domain([0, 20, 60, 100, 200, 400, 700, 1500]).range(['#e6efd9', '#dbe8cb', '#cfdfbb', '#c6d6ab', '#d1c798', '#c4ad86', '#b09879', '#d8d4cc']);
  function fillOf(x) { return x.lv === 3 && !isNaN(+x.v) && +x.v >= 0 ? TCOL(+x.v) : scol(x.v); }
  function wdec(arr, id, sc) { sc = sc || 100; return arr.map(function (x) { var rv = String(x[0]).charAt(0) === 'r'; return { k: id + ':' + x[0], v: String(x[0]), g: rv ? { type: 'MultiLineString', coordinates: x[1].map(function (r) { return wline(r, sc); }) } : { type: 'MultiPolygon', coordinates: dec(x[1], sc) } }; }); }
  var W0 = window.TRI_WORLD && TRI_WORLD.w0 ? wdec(TRI_WORLD.w0, 'w0') : [], WIDX = (window.TRI_WORLD_IDX || []).map(function (b) { b.lv = 1; return b; }).concat((window.TRI_WORLD_IDX2 || []).map(function (b) { b.lv = 2; return b; })).concat((window.TRI_WORLD_IDX3 || []).map(function (b) { b.lv = 3; return b; })), WB = {}, WASK = {};
  window.TRI_WORLD_ON = function (id) { var B = (window.TRI_WORLD_B || {})[id]; if (!B || WB[id]) return; var b = WIDX.filter(function (x) { return x.id === id; })[0]; WB[id] = [{ k: id + ':bg', v: 'bg', g: poly(b.bb[0], b.bb[1], b.bb[2], b.bb[3]) }].concat(wdec(B, id, b.sc)); WB[id].forEach(function (x) { x.lv = b.lv; }); if (typeof draw === 'function') draw(); };
  function wneed(id) { if (WASK[id]) return; WASK[id] = 1; var sc = document.createElement('script'); sc.src = '../assets/data/world/' + ({ n: 'w2/', t: 'w3/' }[id.charAt(0)] || 'w1/') + id + '.js?v=0.55'; document.head.appendChild(sc); }
  function drawSurface(pk) {
    if (!W0.length) return; gLand.style('display', 'none'); gSurf.attr('mask', REL.length && LY.relief ? 'url(#nobox)' : null); // 世界の地形がくわしくなったので、東アジアの四角は「地形」レイヤーのときだけ
    var d = W0.slice(); // 1km（二水）と100m（都会になれる町）のブロックは、近づいたときだけ読む
    var bl = [];
    if (pk > .15) WIDX.forEach(function (b) { if ((b.lv === 2 && pk < 1.2) || (b.lv === 3 && pk < 5)) return; if (!regionOn({ id: b.id, bb: b.bb })) return; wneed(b.id); if (WB[b.id]) bl = bl.concat(WB[b.id]); });
    var LV = ['bg', '-200', '0', '100', '200', '500', '1000', '1500', '2000', '3000', '4000', 'gf', 'gg', 'gd', 'gt', 'gi', 's0.14', 's0.32', 'lk', 'r0', 'r1', 'r2', 'r3']; var rk = function (v) { return v === 'bg' ? -1e9 : isNaN(+v) ? 1e5 + LV.indexOf(v) : +v; }; bl.sort(function (a, b) { return (a.lv - b.lv) || (rk(a.v) - rk(b.v)); }); d = d.concat(bl); // ブロックの海を先に、段の低い順に、影は最後に重ねる
    // 拡大の質：見えているブロックのとなりも、手が空いたときに先に読んでおく
    if (pk > .15 && !FAST) { clearTimeout(drawSurface.t); drawSurface.t = setTimeout(function () { WIDX.forEach(function (b) { if (!WB[b.id]) return; var p = b.id.split('_'); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { var id = (+p[0] + q[0]) + '_' + (+p[1] + q[1]); if (WIDX.some(function (x) { return x.id === id; })) wneed(id); }); }); }, 600); }
    var j = gSurf.selectAll('path').data(d, function (x) { return x.k; }); j.exit().remove();
    j.enter().append('path').attr('class', function (x) { var c = x.v.charAt(0); return c === 's' ? 'shade' : c === 'r' ? 'river ' + x.v : c === 'g' ? 'kind ' + x.v : x.v === 'lk' ? 'lake' : null; }).style('fill', fillOf).classed('b3', function (x) { return x.lv === 3 && !isNaN(+x.v) && +x.v > 0; }).classed('k3', function (x) { return x.lv === 3 && x.v.charAt(0) === 'g'; }).merge(j).each(function (x) { var sh = x.v.charAt(0) === 's'; this.style.display = sh && FAST ? 'none' : ''; if (!(sh && FAST)) this.setAttribute('d', path(x.g) || ''); }); // 動かしている間は影を休む
    gSurf.selectAll('path').order();
  }

  // ---- くわしい地形の画像（assets/terrain/z/x/y.jpg）：東アジアの3つの国のあたり、約0.5km単位 ----
  var TERR = { 6: [53, 55, 23, 26], 7: [107, 111, 47, 52], 8: [214, 223, 94, 104] };
  function tlon(x, z) { return x / Math.pow(2, z) * 360 - 180; }
  function tlat(y, z) { return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / Math.pow(2, z)))) * 180 / Math.PI; }
  var TB = [tlon(TERR[8][0], 8), tlat(TERR[8][3] + 1, 8), tlon(TERR[8][1] + 1, 8), tlat(TERR[8][2], 8)]; // 画像のある範囲 [西,南,東,北]
  function inTB(ll) { return ll && ll[0] > TB[0] && ll[0] < TB[2] && ll[1] > TB[1] && ll[1] < TB[3]; }
  function drawTiles(pk) {
    var lat = -rot[1], zr = Math.log(40075 * Math.cos(lat * Math.PI / 180) * pk / 256) / Math.LN2, list = [];
    var on = LY.relief && zr > 5.2;
    if (on) {
      var z = Math.max(6, Math.min(8, Math.ceil(zr - .2))), R = TERR[z];
      for (var x = R[0]; x <= R[1]; x++) for (var y = R[2]; y <= R[3]; y++) {
        var nw = [tlon(x, z), tlat(y, z)], ne = [tlon(x + 1, z), tlat(y, z)], sw = [tlon(x, z), tlat(y + 1, z)], se = [tlon(x + 1, z), tlat(y + 1, z)];
        if (![nw, ne, sw, se].every(visible)) continue;
        var a = proj(nw), b = proj(ne), c = proj(sw), d = proj(se), xs = [a[0], b[0], c[0], d[0]], ys = [a[1], b[1], c[1], d[1]];
        if (Math.max.apply(0, xs) < 0 || Math.min.apply(0, xs) > W || Math.max.apply(0, ys) < 0 || Math.min.apply(0, ys) > H) continue;
        list.push({ id: z + '/' + x + '/' + y, m: [(b[0] - a[0]) / 256, (b[1] - a[1]) / 256, (c[0] - a[0]) / 256, (c[1] - a[1]) / 256, a[0], a[1]] });
      }
    }
    var im = gTile.selectAll('image').data(list, function (d) { return d.id; });
    im.exit().remove();
    im.enter().append('image').attr('width', 257).attr('height', 257).attr('preserveAspectRatio', 'none').attr('href', function (d) { return '../assets/terrain/' + d.id + '.jpg'; })
      .merge(im).attr('transform', function (d) { return 'matrix(' + d.m.map(function (v) { return v.toFixed(4); }).join(',') + ')'; });
    // 画面がぜんぶ画像でおおわれたら、粗い地形は描かない（軽くする）
    var cover = list.length && [[0, 0], [W, 0], [0, H], [W, H]].every(function (q) { return inTB(proj.invert(q)); });
    return cover;
  }

  // ---- 交通網：州の中心の町をむすぶ道・鉄道・航路・港 ----
  function town(i) { var nm = PROV[i][6], pl = PLACES.filter(function (x) { return x.name === nm; })[0]; return pl ? pl.ll : PROV[i].c; }
  // 交通網はまだつくらない（2026-10-29 ひびき：つくるならとても少し、小町ほど）。町と町をむすぶ道すじは計算だけして、出さない
  var BUILT = {}, RAIL = [], PORTMAIN = [3, 5, 7]; // 開拓団が出る港（国ごと）
  // 道すじ（assets/data/routes.js）：本物の標高から計算した、坂・トンネル・橋の工事費を考えた道すじ。遠くでは粗い線（lo）、近くでは細かい線（hi）。なければ直線
  function rt(kind, key, pk) {
    var R = window.TRI_ROUTES && TRI_ROUTES.v === 2 && TRI_ROUTES[kind][key]; if (!R) return null;
    var A = pk > .7 ? R.hi : R.lo, segs = [], cur = null;
    for (var i = 0; i < A.length; i += 3) { var p = [A[i] / 1000, A[i + 1] / 1000], t = A[i + 2];
      if (!cur || (t !== cur.t && i > 0)) { cur = { t: t, c: cur ? [cur.c[cur.c.length - 1]] : [] }; segs.push(cur); }
      cur.c.push(p); }
    return { segs: segs.filter(function (q) { return q.c.length > 1; }), s: R.s };
  }
  var TNAME = { road: '🛣️ 道', rail: '🚃 鉄道', sea: '⛴️ 航路', col: '🚩 開拓の道' };
  function netData(pk) {
    var L = (SIM && SIM.LINK) || [], out = [];
    function add(kind, key, cl, a, b, name) {
      if (!BUILT[kind] || BUILT[kind].indexOf(key) < 0) return;
      var r = rt(kind, key, pk), info = { kind: kind, name: name, s: r && r.s };
      if (!r) { out.push({ cl: cl, c: [a, b], info: info }); return; }
      r.segs.forEach(function (q) { out.push({ cl: cl + (q.t === 1 ? ' tun' : q.t === 2 ? ' br' : ''), c: q.c, info: info }); });
    }
    function nm(i) { return PROV[i][6]; }
    L.forEach(function (l) { add(l[2] ? 'sea' : 'road', l[0] + '-' + l[1], l[2] ? 'sea' : 'road', town(l[0]), town(l[1]), nm(l[0]) + '〜' + nm(l[1])); });
    RAIL.forEach(function (l) { add('rail', l[0] + '-' + l[1], 'rail', town(l[0]), town(l[1]), nm(l[0]) + '〜' + nm(l[1])); });
    var S = simData(); if (S) S.col.forEach(function (c) { var X = SIM.SITES[c.site]; add('col', c.nat + '-' + c.site, 'colr n' + (c.nat + 1), town(PORTMAIN[c.nat]), [X[3], X[2]], nm(PORTMAIN[c.nat]) + '〜' + X[0]); });
    return out;
  }
  function openRoute(f) {
    var s = f.s, km = s ? s[0] : null, sp = { road: 60, rail: 120, sea: 30, col: 30 }[f.kind], h = km && km / sp;
    showCard({ id: 'r-' + f.kind + f.name, title: TNAME[f.kind] + '　' + f.name, sub: f.kind === 'rail' ? '電車' : f.kind === 'road' ? '車' : '船',
      stats: km ? ['長さ：約' + km + 'km', (f.kind === 'rail' ? '電車' : f.kind === 'road' ? '車' : '船') + 'で約' + (h < 1 ? Math.round(h * 60) + '分' : (Math.round(h * 2) / 2) + '時間')].concat(s.length > 1 && s[1] ? ['トンネル：' + s[1] + 'km'] : []) : [], text: '' });
  }
  function drawRiver(pk) {
    var RV = window.TRI_ROUTES && TRI_ROUTES.river || [], d = pk > .3 ? RV : [];
    var j = gRiv.selectAll('path').data(d); j.exit().remove();
    j.enter().append('path').merge(j).attr('d', function (r) { var A = pk > 2 ? r.hi : r.lo, c = []; for (var i = 0; i < A.length; i += 3) c.push([A[i] / 1000, A[i + 1] / 1000]); return path({ type: 'LineString', coordinates: c }); })
      .style('stroke-width', function (r) { return Math.max(1.2, r.w / 1000 * pk) + 'px'; });
  }
  // 1km が何px か
  function pxkm() { return proj.scale() / 6371; }
  var LY = { town: true, ruin: true, grid: false, prov: true, wx: false, mood: false, relief: false, net: true, use: false, ctl: false, hydro:true, labels:false }, selP = null, SIMD = null;
  function simData() {
    if (SIMD || !SIM) return SIMD;
    var d = SIM.today(), x = SIM.run(d, 1);
    var tot = x.state.prov.reduce(function (a, p) { return a + p.pop; }, 0), P = window.TRI_POP, k = P && P[312 + Math.floor(d / 365)] && tot ? P[312 + Math.floor(d / 365)] / tot : 1;
    SIMD = { d: d, pop: x.state.prov.map(function (p) { return Math.round(p.pop * k); }), wx: PROV.map(function (p, i) { return SIM.climate(i, d); }), mood: x.state.prov.map(function (p) { return p.mood; }), ferry: x.state.ferry, date: x.date.label, col: x.state.col, civ: x.state.civ };
    STATE = x.state;
    return SIMD;
  }
  function visible(ll) { return d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - .02; }

  function draw() {
    gPin.selectAll('text').style('display', null); gLab.selectAll('text').style('display', null);
    gCiv.selectAll('text').style('display', null); gCol.selectAll('text').style('display', null);
    proj.translate([W / 2, H / 2]).scale(base * k).rotate(rot);
    var pk = pxkm();
    gOcean.attr('d', path({ type: 'Sphere' })); gRim.attr('d', path({ type: 'Sphere' }));
    gGrat.attr('d', pk < 30 ? path(d3.geoGraticule10()) : null);
    gLand.attr('d', path(land)).attr('mask', REL.length ? 'url(#nobox)' : null); // 3つの国のあたりは、本物の地形からとった海岸線（いちばん低い段）を陸にする
    drawSurface(pk);
    d3.select('#boxP').attr('d', REL.length ? path(BOX) : null);
    d3.select('#landclipP').attr('d', REL.length ? path(REL[0].g) : path(land));
    var covered = drawTiles(pk);
    gRel.style('display', (!LY.relief && !W0.length) || (LY.relief && !covered) ? null : 'none').classed('plain', !LY.relief);
    if (!LY.relief) gRel.selectAll('path').each(function (d) { var on = d.r < 0; this.style.display = on ? '' : 'none'; if (on) this.setAttribute('d', path(d.g) || ''); }); // 地形なし：海岸線だけ
    if (LY.relief && !covered) {
      var on = {}; REG.forEach(function (g) { on[g.id] = regionOn(g); if (on[g.id] && !(g.id === 99 && FAST)) need(g.id); });
      gRel.selectAll('path').each(function (d) { var sh = d.cl !== 'rb', hide = (FAST && sh) || (d.r >= 0 && !on[d.r]); this.style.display = hide ? 'none' : ''; if (!hide) this.setAttribute('d', path(d.g) || ''); }); // 動かしている間は陰影を休む。見えない地域は計算しない
    }
    drawCtl();
    // 州
    var S = (LY.mood || LY.wx) && simData(), SU = LY.use && simData();
    var pv = gProv.selectAll('path').data(PROV);
    pv.enter().append('path').attr('class', function (d) { return 'prov ' + d[1]; }).on('click', function (e, d) { openProv(d); })
      .merge(pv).attr('d', function (d) { return path(d.f); }).classed('sel', function (d) { return d === selP; })
      .style('stroke-width', LY.prov && k >= 3.5 ? null : '0')
      .style('fill', function (d) { if (LY.use && SU) return useOf(PROV.indexOf(d))[2]; if (!LY.mood || !S) return null; var m = S.mood[PROV.indexOf(d)]; return d3.interpolateRdYlGn(Math.max(0, Math.min(1, (m - 35) / 45))); })
      .style('fill-opacity', LY.mood || LY.use ? .7 : LY.ctl ? .55 : LY.relief ? (pk > 1.5 ? .08 : .16) : (pk > 40 ? .12 : null));
    drawNet(pk);
    gHydro.style('display', LY.hydro ? null : 'none');
    gRiv.style('display', LY.hydro ? null : 'none');
    if (LY.hydro) gHydro.selectAll('path').attr('d', function (f) { return path(f); });
    // 国・州の名前（町が見えるほど近いと消す）
    var labs = [];
    if (k >= 2 && k < 3.5) NATIONS.forEach(function (n) { labs.push({ t: n.name, c: n.c, cl: 'nlab', col: n.col }); });
    else if (k >= (LY.labels ? 3.5 : 12) && pk < 40) PROV.forEach(function (p) { labs.push({ t: p[0], c: p.c, cl: 'plab', dy: PLACES.some(function (x) { return x.name === p[6]; }) ? 30 : 0 }); });
    NAMES.forEach(function (n) { if (k >= n[4] && pk < 40) labs.push({ t: n[0], c: [n[1], n[2]], cl: 'flab ' + n[3] }); }); // 海・川・山の名前
    if (LY.hydro && k >= 3 && pk < 2) geography.forEach(function (f) {
      labs.push({t:f.properties.name,c:d3.geoCentroid(f),cl:'flab w'});
    });
    var lb = gLab.selectAll('text').data(labs); lb.exit().remove();
    lb.enter().append('text').merge(lb).attr('class', function (d) { return d.cl; }).style('fill', function (d) { return d.col || null; }).text(function (d) { return d.t; })
      .each(function (d) { var q = proj(d.c), v = q && visible(d.c); d3.select(this).style('display', v ? null : 'none'); if (q) d3.select(this).attr('x', q[0]).attr('y', q[1] + (d.dy || 0)); });
    // 天気
    var wl = gWx.selectAll('text').data(LY.wx && S && pk < 40 ? PROV : []); wl.exit().remove();
    wl.enter().append('text').merge(wl).each(function (d) { var q = proj(d.c), w = S.wx[PROV.indexOf(d)]; d3.select(this).style('display', q && visible(d.c) ? null : 'none').attr('x', q ? q[0] : 0).attr('y', q ? q[1] - 10 : 0).text(SIM.WX[w.k][1] + ' ' + Math.round(w.t) + '℃'); });
    // 首都の点（町が見えたら消す）
    var pin = gPin.selectAll('g').data(PLACES);
    var en = pin.enter().append('g').attr('class', 'pin').attr('tabindex', 0).attr('role', 'button').attr('aria-label', function (d) { return d.name; })
      .on('click', function (e, d) { openPlace(d); }).on('keydown', function (e, d) { if (e.key === 'Enter') openPlace(d); });
    en.append('circle').attr('r', 7); en.append('text').attr('x', 11).attr('y', 6).text(function (d) { return d.name; });
    en.merge(pin).each(function (d) { var q = proj(d.ll), g = d3.select(this), hide = false; g.style('display', q && visible(d.ll) && !hide ? null : 'none'); if (q) g.attr('transform', 'translate(' + q[0] + ',' + q[1] + ')'); });
    drawTowns(pk);
    drawWorld(pk);
    declutterLabels();
    drawScale(pk);
  }

  // 546年の町（2026-10-30）：州の中心の町を人口の大きさの円で、昔の町の跡を小さな四角で、電気の網（灯石が使える範囲）を淡い円で
  function drawTowns(pk) {
    var S = simData(), pop = S && S.pop, T = [], G = [], R = [];
    if (pop) PROV.forEach(function (p, i) { var ll = town(i), km = .75 * Math.sqrt(pop[i]); T.push({ i: i, ll: ll, r: 3 + Math.sqrt(pop[i]) / 8 }); if (LY.grid) G.push({ i: i, g: d3.geoCircle().center(ll).radius(km / 111)() }); });
    var RU = window.TRI_RUINS || [];
    if (LY.ruin) for (var j = 0; j < RU.length; j += 3) { var ll = [RU[j] / 100, RU[j + 1] / 100]; if (!PROV.some(function (p, i) { return d3.geoDistance(ll, town(i)) * 6371 < 15; })) R.push({ ll: ll, p: RU[j + 2] }); }
    var gg = gGrid.selectAll('path').data(G); gg.exit().remove(); gg.enter().append('path').merge(gg).attr('d', function (d) { return path(d.g); });
    var rs = gTown.selectAll('rect.ruin').data(R); rs.exit().remove();
    rs.enter().append('rect').attr('class', 'ruin').attr('width', 7).attr('height', 7).on('click', function (e, d) { showCard({ id: 'ru' + d.ll.join(), title: '昔の町の跡', sub: '新暦より前の町', text: 'いまは草と森におおわれています。昔は約' + d.p + '万人が暮らしていたと言われます。', stats: [] }); })
      .merge(rs).each(function (d) { var q = proj(d.ll); d3.select(this).style('display', q && visible(d.ll) && pk < 40 ? null : 'none').attr('x', q ? q[0] - 3.5 : 0).attr('y', q ? q[1] - 3.5 : 0); });
    var ts = gTown.selectAll('circle.town').data(LY.town ? T : []); ts.exit().remove();
    ts.enter().append('circle').attr('class', 'town').on('click', function (e, d) { openProv(PROV[d.i]); })
      .merge(ts).each(function (d) { var q = proj(d.ll); d3.select(this).style('display', q && visible(d.ll) && pk < 40 ? null : 'none').attr('cx', q ? q[0] : 0).attr('cy', q ? q[1] : 0).attr('r', d.r); });
  }
  // 土地の使い道：その州でいちばん多い仕事（役所・学校などはのぞく）
  var USEC = { a: ['農業', '#8bc34a'], f: ['漁業', '#29b6f6'], fo: ['林業', '#2e7d32'], mi: ['採掘', '#8d6e63'], ma: ['工業', '#5c6bc0'], co: ['商業', '#ff8a65'], tr: ['運輸', '#ffca28'] };
  var STATE = null;
  function useOf(i) { var sh = STATE ? STATE.prov[i].share : SIM.PROV[i][6], b = 0; for (var j = 1; j < 7; j++) if (sh[j] > sh[b]) b = j; var key = SIM.SECT[b][0]; return [key, USEC[key][0], USEC[key][1], Math.round(sh[b] * 100)]; }
  function drawNet(pk) {
    drawRiver(pk);
    gNet.style('display', LY.net ? null : 'none'); if (!LY.net) return;
    // 地図アプリのように：道と鉄道は、ふちどり（cas）を下に、本体を上に重ねる
    var nd0 = netData(pk), nd = nd0.filter(function (d) { return /road|rail/.test(d.cl) && !/tun/.test(d.cl); }).map(function (d) { return { cl: d.cl + ' cas', c: d.c, info: d.info }; }).concat(nd0);
    var ln = gNet.selectAll('path.l').data(nd); ln.exit().remove();
    ln.enter().append('path').on('click', function (e, d) { openRoute(d.info); }).merge(ln).attr('class', function (d) { return 'l ' + d.cl; }).attr('d', function (d) { return path({ type: 'LineString', coordinates: d.c }); });
    var ports = PROV.map(function (p, i) { return i; }).filter(function (i) { return SIM && SIM.PROV[i][4] >= .8; });
    var pt = gNet.selectAll('text.port').data(ports); pt.exit().remove();
    pt.enter().append('text').attr('class', 'port').text('⚓').merge(pt).each(function (i) { var ll = town(i), q = proj(ll); d3.select(this).style('display', q && visible(ll) && k >= 3 ? null : 'none').attr('x', q ? q[0] - 22 : 0).attr('y', q ? q[1] + 5 : 0); });
  }
  // 実効支配：州と開拓地（陸）、そのまわりの海
  function drawCtl() {
    var S = LY.ctl && simData(), sea = [], lnd = [];
    if (S) {
      PROV.forEach(function (p, i) { var n = SIM.PROV[i][4]; if (n >= .4) sea.push({ n: +p[1].slice(1) - 1, g: d3.geoCircle().center(town(i)).radius(.5 + n * .8)() }); });
      S.col.forEach(function (c) { var X = SIM.SITES[c.site], ll = [X[3], X[2]], r = .25 + Math.sqrt(c.pop) / 500; lnd.push({ n: c.nat, g: d3.geoCircle().center(ll).radius(r)() }); sea.push({ n: c.nat, g: d3.geoCircle().center(ll).radius(r + .35)() }); });
    }
    var a = gSea.selectAll('path').data(sea); a.exit().remove(); a.enter().append('path').merge(a).attr('class', function (d) { return 'n' + (d.n + 1); }).attr('d', function (d) { return path(d.g); });
    var b = gCtl.selectAll('path').data(lnd); b.exit().remove(); b.enter().append('path').merge(b).attr('class', function (d) { return 'n' + (d.n + 1); }).attr('d', function (d) { return path(d.g); });
  }

  // ---- 開拓地と、出会った文明（世界シミュレーションから） ----
  var NCOL = ['#2f7d4a', '#4c56a8', '#a86412'];
  function drawWorld(pk) {
    var S = simData(), cols = S ? S.col : [], civs = S ? S.civ.filter(function (v) { return v.known; }) : [];
    var cv = gCiv.selectAll('g').data(civs); cv.exit().remove();
    var ce = cv.enter().append('g').attr('class', 'civ').on('click', function (e, v) { openId('v-' + S.civ.indexOf(v)); });
    ce.append('path'); ce.append('text');
    ce.merge(cv).each(function (v) {
      var C = SIM.CIVS[S.civ.indexOf(v)], ll = [C[2], C[1]], g = d3.select(this), q = proj(ll);
      g.select('path').attr('d', path(d3.geoCircle().center(ll).radius(Math.max(2, Math.sqrt(C[3]) / 7))())).style('fill', C[6]).style('stroke', C[6]);
      g.select('text').text(C[0]).style('fill', C[6]).style('display', q && visible(ll) ? null : 'none').attr('x', q ? q[0] : 0).attr('y', q ? q[1] : 0);
    });
    var cl = gCol.selectAll('g').data(cols); cl.exit().remove();
    var en = cl.enter().append('g').attr('class', 'col').attr('tabindex', 0).attr('role', 'button').on('click', function (e, c) { openId('x-' + c.site); });
    en.append('rect').attr('x', -5).attr('y', -5).attr('width', 10).attr('height', 10).attr('rx', 2); en.append('text').attr('x', 9).attr('y', 5);
    en.merge(cl).each(function (c) {
      var X = SIM.SITES[c.site], ll = [X[3], X[2]], q = proj(ll), g = d3.select(this);
      g.style('display', q && visible(ll) && k >= 1.6 ? null : 'none').attr('transform', q ? 'translate(' + q[0] + ',' + q[1] + ')' : null).attr('aria-label', X[0]);
      g.select('rect').style('fill', NCOL[c.nat]); g.select('text').text(X[0] + (k >= 3 ? '（' + c.stage + '）' : ''));
    });
  }

  // ---- 目安の距離 ----
  function drawScale(pk) {
    var kmpx = 1 / pk, L = 1, cands = [.05, .1, .2, .5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    cands.forEach(function (x) { if (x / kmpx <= 140) L = x; });
    var len = L / kmpx, y = H - 18;
    gScale.attr('transform', 'translate(' + (W - len - 64) + ',' + y + ')').html('<rect width="' + len + '" height="5" fill="#2a2622"/><rect x="' + len / 2 + '" width="' + len / 2 + '" height="5" fill="#fff" stroke="#2a2622" stroke-width=".8"/><text x="' + len + '" y="-4" text-anchor="end">' + (L < 1 ? L * 1000 + 'm' : (L >= 1000 ? L / 1000 + '千' : L) + 'km') + '</text>');
  }

  // ---- 動かす・拡大する ----
  var KMIN = .8, anim = null;
  function kmax() { return 200 * 6371 / base; } // 1km＝200px（100m＝20px）まで。100mの地形は都会になれる町のまわりだけ
  function degpx() { return 57.2958 / proj.scale(); }
  function clampRot() { rot[1] = Math.max(-85, Math.min(85, rot[1])); }
  function zoomAt(f, px, py) {
    var nk = Math.max(KMIN, Math.min(kmax(), k * f)); if (nk === k) return;
    var g = proj.invert([px, py]); k = nk; proj.scale(base * k);
    if (g) { var q = proj(g); if (q) { var dp = degpx(); rot[0] -= (q[0] - px) * dp; rot[1] += (q[1] - py) * dp; clampRot(); } }
    FAST = true; draw(); settle();
  }
  var drag0 = null, FAST = false, rq = null, slow = null;
  function soon() { if (!rq) rq = requestAnimationFrame(function () { rq = null; draw(); }); }
  function settle() { clearTimeout(slow); slow = setTimeout(function () { FAST = false; draw(); }, 160); }
  svg.call(d3.drag().clickDistance(4)
    .on('start', function (e) { if (anim) anim.stop(); drag0 = { x: e.x, y: e.y, r: rot.slice() }; })
    .on('end', function () { settle(); })
    .on('drag', function (e) { if (pinch) return; var dp = degpx(); rot = [drag0.r[0] + (e.x - drag0.x) * dp, drag0.r[1] - (e.y - drag0.y) * dp, 0]; clampRot(); FAST = true; soon(); }));
  svg.on('wheel', function (e) { e.preventDefault(); var r = stage.getBoundingClientRect(); zoomAt(Math.pow(1.0018, -e.deltaY), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  svg.on('dblclick.zoom', null);
  svg.on('dblclick', function (e) { var r = stage.getBoundingClientRect(); zoomAt(2, e.clientX - r.left, e.clientY - r.top); });
  var pinch = null, el = svg.node();
  el.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { var a = e.touches[0], b = e.touches[1]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } }, { passive: true });
  el.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && pinch) { var a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), r = stage.getBoundingClientRect(); zoomAt(d / pinch, (a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top); pinch = d; }
  }, { passive: true });
  el.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; });
  $('z-in').onclick = function () { zoomAt(2, W / 2, H / 2); };
  $('z-out').onclick = function () { zoomAt(.5, W / 2, H / 2); };
  // ll へ飛ぶ（拡大は対数でなめらかに）
  function flyTo(ll, tk, done) {
    if (anim) anim.stop();
    var r0 = rot.slice(), r1 = [-ll[0], -ll[1], 0], k0 = Math.log(k), k1 = Math.log(tk || k);
    anim = d3.timer(function (t) { var s = Math.min(1, t / 1100), e = d3.easeCubicInOut(s); rot = d3.interpolate(r0, r1)(e); k = Math.exp(k0 + (k1 - k0) * e); FAST = s < 1; draw(); if (s >= 1) { anim.stop(); anim = null; if (done) done(); } });
  }
  function kFor(kmWide) { return Math.min(kmax(), Math.min(W, H) / kmWide * 6371 / base); } // 画面の幅に kmWide km が入る拡大

  // ---- 場所のカード ----
  var card = $('card');
  function saved() { try { return JSON.parse(localStorage.getItem('tri-map-saved') || '[]'); } catch (e) { return []; } }
  function setSaved(a) { try { localStorage.setItem('tri-map-saved', JSON.stringify(a)); } catch (e) { } }
  function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; stage.appendChild(t); setTimeout(function () { t.remove(); }, 1800); }
  function showCard(o) {
    var sv = saved().indexOf(o.id) >= 0;
    card.hidden = false;
    card.innerHTML = '<button type="button" class="x" aria-label="閉じる">✕</button><h3>' + esc(o.title) + '</h3><div class="sub">' + esc(o.sub || '') + '</div>' +
      (o.stats ? '<div class="st">' + o.stats.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>' : '') + '<p>' + (o.html || esc(o.text || '')) + '</p>' +
      '<div class="acts">' + (o.zoom ? '<button type="button" class="pri" data-a="zoom">🔍 近くで見る</button>' : '') +
      '<button type="button" data-a="share">🔗 共有</button><button type="button" data-a="save">' + (sv ? '★ 保存ずみ' : '☆ 保存') + '</button></div>';
    card.querySelector('.x').onclick = function () { card.hidden = true; selP = null; draw(); };
    card.querySelector('.acts').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'zoom') o.zoom();
      if (a === 'share') { var u = location.origin + location.pathname + '#p=' + o.id; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('リンクをコピーしました'); }, function () { window.prompt('このリンクを共有できます', u); }); }
      if (a === 'save') { var s = saved(), i = s.indexOf(o.id); if (i >= 0) { s.splice(i, 1); b.textContent = '☆ 保存'; toast('保存をやめました'); } else { s.unshift(o.id); b.textContent = '★ 保存ずみ'; toast('保存しました（さがす欄に出ます）'); } setSaved(s.slice(0, 20)); }
    };
  }
  function openPlace(d) {
    showCard({ id: 'c-' + d.id, title: d.name, sub: d.sub, text: d.text, zoom: function () { flyTo(d.ll, d.id === 'nisui' ? kFor(7) : kFor(60)); } });
    flyTo(d.ll, Math.max(k, 6));
  }
  function openProv(p) {
    selP = p; var i = PROV.indexOf(p), S = simData(), st = ['中心の町：' + p[6], '人口：' + (S && S.pop ? '約' + S.pop[i].toLocaleString('ja-JP') + '万' : p[7] + '（仮）')];
    st.push('おもな仕事：' + useOf(i)[1] + '（' + useOf(i)[3] + '%）');
    if (S) { var w = S.wx[i]; st.push('今日：' + SIM.WX[w.k][1] + ' ' + SIM.WX[w.k][0] + ' ' + Math.round(w.t) + '℃'); }
    showCard({ id: 'p-' + i, title: p[0], sub: NAT[p[1]] + 'の州', stats: st, text: p[8], zoom: p[0] === '二水州' ? function () { flyTo(C0, kFor(7)); } : null });
    draw();
  }
  function openId(id) {
    var t = id.slice(0, 1), v = id.slice(2), i = +v;
    if (t === 'g') {
      var feature = geography.filter(function (f) { return f.properties.id === v; })[0];
      if (feature) { flyTo(d3.geoCentroid(feature), 6); openGeography(feature); }
      return;
    }
    if (t === 'c') { var d = PLACES.filter(function (q) { return q.id === v; })[0]; if (d) openPlace(d); return; }
    if (t === 'p') { var p = PROV[i]; if (!p) return; flyTo(p.c, Math.max(6, Math.min(k, 10))); openProv(p); }
    var S = simData();
    if (t === 'x' && S) {
      var c = S.col.filter(function (q) { return q.site === i; })[0], X = SIM.SITES[i]; if (!c) return;
      showCard({ id: id, title: '🚩 ' + X[0], sub: SIM.NATS[c.nat].name + 'の' + c.stage, stats: ['人口：約' + Math.round(c.pop).toLocaleString() + '人', 'ひらいた日：' + SIM.wdate(c.day).label], text: X[5] + '。' + SIM.NATS[c.nat].name + 'の開拓団がひらいた土地です。', zoom: function () { flyTo([X[3], X[2]], 12); } });
      flyTo([X[3], X[2]], Math.max(k, 5));
    }
    if (t === 'v' && S) {
      var v = S.civ[i], C = SIM.CIVS[i]; if (!v || !v.known) return;
      showCard({ id: id, title: '🌏 ' + C[0], sub: '出会った文明', stats: ['人口：約' + Math.round(v.pop) + '万', '出会った日：' + SIM.wdate(v.day).label, '最初に出会った国：' + SIM.NATS[v.by].name], text: C[5] });
      flyTo([C[2], C[1]], Math.max(k, 3));
    }
  }

  // ---- さがす ----
  var q = $('q'), res = $('gres'), qx = $('q-x'), IDX = null;
  function index() {
    if (IDX) return IDX; IDX = [];
    PLACES.forEach(function (d) { IDX.push({ id: 'c-' + d.id, i: '📍', t: d.name, s: d.sub }); });
    PROV.forEach(function (p, i) { IDX.push({ id: 'p-' + i, i: '🗺️', t: p[0], s: NAT[p[1]] + 'の州' }); });
    geography.forEach(function (f) { IDX.push({id:'g-' + f.properties.id,i:'',t:f.properties.name,s:f.properties.kind === 'lake' ? '自然湖' : '河川'}); });
    var S = simData();
    if (S) {
      S.col.forEach(function (c) { IDX.push({ id: 'x-' + c.site, i: '🚩', t: SIM.SITES[c.site][0], s: SIM.NATS[c.nat].name + 'の' + c.stage }); });
      S.civ.forEach(function (v, i) { if (v.known) IDX.push({ id: 'v-' + i, i: '🌏', t: v.name, s: '出会った文明' }); });
    }
    return IDX;
  }
  function find(id) { return index().filter(function (x) { return x.id === id; })[0]; }
  function list(items, head) { res.hidden = false; res.innerHTML = (head ? '<li class="hd">' + head + '</li>' : '') + (items.length ? items.map(function (x) { return '<li><button type="button" data-id="' + x.id + '"><i>' + x.i + '</i><span><b>' + esc(x.t) + '</b><small>' + esc(x.s) + '</small></span></button></li>'; }).join('') : '<li class="hd">見つかりませんでした</li>'); }
  function suggest() { var sv = saved().map(find).filter(Boolean); list(sv.length ? sv : index().slice(0, 3), sv.length ? '保存した場所' : 'よく見られる場所'); }
  q.addEventListener('focus', function () { if (!q.value) suggest(); });
  q.addEventListener('input', function () { qx.hidden = !q.value; var v = q.value.trim(); if (!v) return suggest(); list(index().filter(function (x) { return (x.t + x.s).indexOf(v) >= 0; }).slice(0, 12)); });
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = res.querySelector('button'); if (b) b.click(); } if (e.key === 'Escape') { res.hidden = true; q.blur(); } });
  qx.onclick = function () { q.value = ''; qx.hidden = true; res.hidden = true; };
  res.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; res.hidden = true; var x = find(b.dataset.id); q.value = x ? x.t : ''; qx.hidden = !q.value; q.blur(); openId(b.dataset.id); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.gbar')) res.hidden = true; if (!e.target.closest('.glayer')) $('lmenu').hidden = true; });

  // ---- レイヤー ----
  var lbtn = $('b-layer'), lm = $('lmenu');
  lbtn.onclick = function (e) { e.stopPropagation(); lm.hidden = !lm.hidden; lbtn.setAttribute('aria-expanded', String(!lm.hidden)); };
  lm.addEventListener('change', function (e) {
    var x = e.target;
    if (x.id === 'ly-prov') { LY.prov = x.checked; draw(); }
    if (/^ly-(relief|net|use|ctl|hydro|labels|town|ruin|grid)$/.test(x.id)) { LY[x.id.slice(3)] = x.checked; if (x.id === 'ly-use' && x.checked) { $('ly-mood').checked = LY.mood = false; } if (x.id === 'ly-mood' && x.checked) { $('ly-use').checked = LY.use = false; } draw(); }
    if (x.id === 'ly-mood' && x.checked) { $('ly-use').checked = LY.use = false; }
    if (x.id === 'ly-wx' || x.id === 'ly-mood') { LY[x.id === 'ly-wx' ? 'wx' : 'mood'] = x.checked; var S = simData(); if (x.checked && S) toast('世界シミュレーション：' + S.date); draw(); }
  });

  // ---- はじめ ----
  fit(); simData(); draw();
  window.addEventListener('resize', function () { fit(); draw(); });
  var h = location.hash.match(/^#p=([a-z])-([\w-]+)$/);
  if (h) setTimeout(function () { openId(h[1] + '-' + h[2]); }, 200);
  else if (location.hash === '#nisui') { rot = [-C0[0], -C0[1], 0]; k = kFor(7); draw(); }
  else if ((h = location.hash.match(/^#v=(-?[\d.]+),(-?[\d.]+),([\d.]+)$/))) { rot = [-h[1], -h[2], 0]; k = kFor(+h[3]); draw(); } // #v=経度,緯度,画面の幅km
})();
