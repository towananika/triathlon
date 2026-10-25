// マップ：1枚の地球を拡大していくと、国 → 州 → 二水の町 → 道や名所 → 動く車や舟、と見えるものが増える。
// さがす・レイヤー・場所のカード・行き方・共有・保存は Googleマップのような使い方。
(function () {
  'use strict';
  var N = window.NISUI, SIM = window.TRI_SIM;
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
  var gOcean = svg.append('path').attr('class', 'ocean'), gGrat = svg.append('path').attr('class', 'grat'), gLand = svg.append('path').attr('class', 'land');
  var gProv = svg.append('g').attr('clip-path', 'url(#landclip)');
  var gCity = svg.append('g').attr('id', 'city').html(N.svg());
  var gRim = svg.append('path').attr('class', 'rim'), gLab = svg.append('g'), gWx = svg.append('g').attr('class', 'wxl'), gPin = svg.append('g'), gScale = svg.append('g').attr('class', 'scale');
  var cityEl = gCity.node();

  // 1km が何px か
  function pxkm() { return proj.scale() / 6371; }
  var LY = { base: 'plan', prov: true, wx: false, mood: false, move: true }, selP = null, SIMD = null;
  function simData() {
    if (SIMD || !SIM) return SIMD;
    var d = SIM.today(), x = SIM.run(d, 1);
    SIMD = { d: d, wx: PROV.map(function (p, i) { return SIM.climate(i, d); }), mood: x.state.prov.map(function (p) { return p.mood; }), ferry: x.state.ferry, date: x.date.label };
    return SIMD;
  }
  function visible(ll) { return d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - .02; }

  function draw() {
    proj.translate([W / 2, H / 2]).scale(base * k).rotate(rot);
    var pk = pxkm();
    gOcean.attr('d', path({ type: 'Sphere' })); gRim.attr('d', path({ type: 'Sphere' }));
    gGrat.attr('d', pk < 30 ? path(d3.geoGraticule10()) : null);
    gLand.attr('d', path(land)); d3.select('#landclipP').attr('d', path(land));
    // 州
    var S = (LY.mood || LY.wx) && simData();
    var pv = gProv.selectAll('path').data(PROV);
    pv.enter().append('path').attr('class', function (d) { return 'prov ' + d[1]; }).on('click', function (e, d) { openProv(d); })
      .merge(pv).attr('d', function (d) { return path(d.f); }).classed('sel', function (d) { return d === selP; })
      .style('stroke-width', LY.prov && k >= 3.5 ? null : '0')
      .style('fill', function (d) { if (!LY.mood || !S) return null; var m = S.mood[PROV.indexOf(d)]; return d3.interpolateRdYlGn(Math.max(0, Math.min(1, (m - 35) / 45))); })
      .style('fill-opacity', LY.mood ? .7 : (pk > 40 ? .12 : null));
    // 国・州の名前（町が見えるほど近いと消す）
    var labs = [];
    if (k >= 2 && k < 3.5) NATIONS.forEach(function (n) { labs.push({ t: n.name, c: n.c, cl: 'nlab', col: n.col }); });
    else if (k >= 3.5 && pk < 40) PROV.forEach(function (p) { labs.push({ t: p[0], c: p.c, cl: 'plab', dy: PLACES.some(function (x) { return x.name === p[6]; }) ? 30 : 0 }); });
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
    en.merge(pin).each(function (d) { var q = proj(d.ll), g = d3.select(this), hide = d.id === 'nisui' && pk > 6; g.style('display', q && visible(d.ll) && !hide ? null : 'none'); if (q) g.attr('transform', 'translate(' + q[0] + ',' + q[1] + ')'); });
    drawCity(pk);
    drawScale(pk);
  }

  // ---- 二水の町：地球の上の正しい場所に、拡大に合わせて重ねる ----
  var LOD = [['streets', 35], ['dlabels', 22], ['kulabels', 10], ['rlabels', 14], ['stars', 40], ['marks', 40], ['tstops', 55], ['moving', 55], ['spots', 30]];
  function drawCity(pk) {
    var vis = pk > 5 && visible(C0);
    cityEl.style.display = vis ? '' : 'none';
    if (!vis) return;
    var a = proj(c2ll(0, 0)), b = proj(c2ll(360, 0)), c = proj(c2ll(0, 290));
    if (!a || !b || !c) { cityEl.style.display = 'none'; return; }
    gCity.attr('transform', 'matrix(' + [(b[0] - a[0]) / 360, (b[1] - a[1]) / 360, (c[0] - a[0]) / 290, (c[1] - a[1]) / 290, a[0], a[1]].join(',') + ')');
    cityEl.style.opacity = Math.min(1, (pk - 5) / 6);
    var u = KM / pk; // 1px が町の何単位か
    cityEl.style.setProperty('--u', u);
    var sc = Math.min(1, u * 2.5); // 印や車は、ある大きさより大きくしない
    cityEl.style.setProperty('--s', sc); cityEl.style.setProperty('--rs', Math.sqrt(sc));
    LOD.forEach(function (l) { var e = $(l[0]); if (e) e.style.display = pk >= l[1] ? '' : 'none'; });
    if (LY.base !== 'plan' || !LY.move) $('moving').style.display = LY.move && pk >= 55 ? '' : 'none';
    if (LY.base !== 'terrain') $('spots').style.display = 'none';
    cityEl.classList.toggle('names', pk >= 90);
  }
  function setBase(m) {
    LY.base = m;
    var img = $('cimg'), raster = m === 'plan' ? 'terrain' : m;
    img.setAttribute('href', window.NISUI_RASTER ? NISUI_RASTER(raster) : '');
    img.style.opacity = m === 'plan' ? .5 : 1;
    $('planbase').style.display = m === 'plan' ? '' : 'none';
    $('rivers').style.display = m === 'plan' ? '' : 'none';
    $('streets').style.opacity = m === 'plan' ? .9 : .35;
    if (m === 'terrain' && window.NISUI_SPOTS) $('spots').innerHTML = NISUI_SPOTS().map(function (s) { return '<g class="t-s"><path d="M' + s[0] + ' ' + (s[1] - 2.2) + 'l2.2 3.6h-4.4z" fill="#5a3d1e"/><text x="' + (s[0] + 3) + '" y="' + (s[1] + 1.4) + '">' + s[2] + 'm</text></g>'; }).join('');
    draw();
  }

  // ---- 目安の距離 ----
  function drawScale(pk) {
    var kmpx = 1 / pk, L = 1, cands = [.05, .1, .2, .5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    cands.forEach(function (x) { if (x / kmpx <= 140) L = x; });
    var len = L / kmpx, y = H - 18;
    gScale.attr('transform', 'translate(' + (W - len - 64) + ',' + y + ')').html('<rect width="' + len + '" height="5" fill="#2a2622"/><rect x="' + len / 2 + '" width="' + len / 2 + '" height="5" fill="#fff" stroke="#2a2622" stroke-width=".8"/><text x="' + len + '" y="-4" text-anchor="end">' + (L < 1 ? L * 1000 + 'm' : (L >= 1000 ? L / 1000 + '千' : L) + 'km') + '</text>');
  }

  // ---- 動かす・拡大する ----
  var KMIN = .8, KMAX = 60000, anim = null;
  function degpx() { return 57.2958 / proj.scale(); }
  function clampRot() { rot[1] = Math.max(-85, Math.min(85, rot[1])); }
  function zoomAt(f, px, py) {
    var nk = Math.max(KMIN, Math.min(KMAX, k * f)); if (nk === k) return;
    var g = proj.invert([px, py]); k = nk; proj.scale(base * k);
    if (g) { var q = proj(g); if (q) { var dp = degpx(); rot[0] -= (q[0] - px) * dp; rot[1] += (q[1] - py) * dp; clampRot(); } }
    draw();
  }
  var drag0 = null;
  svg.call(d3.drag().clickDistance(4)
    .on('start', function (e) { if (anim) anim.stop(); drag0 = { x: e.x, y: e.y, r: rot.slice() }; })
    .on('drag', function (e) { if (pinch) return; var dp = degpx(); rot = [drag0.r[0] + (e.x - drag0.x) * dp, drag0.r[1] - (e.y - drag0.y) * dp, 0]; clampRot(); draw(); }));
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
    anim = d3.timer(function (t) { var s = Math.min(1, t / 1100), e = d3.easeCubicInOut(s); rot = d3.interpolate(r0, r1)(e); k = Math.exp(k0 + (k1 - k0) * e); draw(); if (s >= 1) { anim.stop(); anim = null; if (done) done(); } });
  }
  function kFor(kmWide) { return Math.min(W, H) / kmWide * 6371 / base; } // 画面の幅に kmWide km が入る拡大

  // ---- 町の中を押したとき ----
  cityEl.addEventListener('click', function (e) {
    var t = e.target, g;
    if ((g = t.closest('.lm'))) return openId('l-' + g.getAttribute('data-i'), true);
    if ((g = t.closest('#stars text'))) return openId('f-' + g.getAttribute('data-id'), true);
    if ((g = t.closest('#tstops rect'))) return openId('s-' + g.getAttribute('data-i'), true);
    if ((g = t.closest('#dlabels g')) || (g = t.closest('#dhit circle'))) return openId('d-' + g.getAttribute('data-i'), true);
  });
  cityEl.addEventListener('keydown', function (e) { var g = e.target.closest('.lm'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openId('l-' + g.getAttribute('data-i'), true); } });

  // ---- 動く車・路面電車・舟・飛行機（町が大きく見えるときだけ動かす） ----
  (function () {
    var mv = $('moving'), V = [];
    function route(d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); mv.appendChild(p); return p; }
    function el(h) { var g = document.createElementNS(NS, 'g'); g.innerHTML = h; mv.appendChild(g); return g; }
    var COL = ['#e74c3c', '#f1c40f', '#3498db', '#ecf0f1', '#2ecc71', '#34495e', '#e67e22'];
    ['M20 62L150 62L96 148', 'M60 214L150 206L214 238L300 196L345 262', 'M266 50L236 104L196 142', 'M0 142Q60 152 96 150', 'M300 196L330 150', 'M150 62L176 92L196 96L236 104'].forEach(function (d, i) {
      var p = route(d);
      for (var j = 0; j < 3; j++) V.push({ p: p, sp: 9 + ((i + j) % 3) * 2, o: (i * 37 + j * 61) % 100 / 100, pp: 1, off: j % 2 ? 1.3 : -1.3, g: el('<rect x="-2" y="-1.1" width="4" height="2.2" rx=".6" fill="' + COL[(i * 3 + j) % 7] + '" stroke="#2a2622" stroke-width=".3"/>') });
    });
    var tp = route(N.TRAM);
    [0, .5].forEach(function (o) { V.push({ p: tp, sp: 6, o: o, pp: 1, off: 0, g: el('<rect x="-4.5" y="-1.6" width="9" height="3.2" rx="1" fill="#c0392b" stroke="#fff" stroke-width=".5"/><rect x="-3.5" y="-.8" width="7" height="1.2" fill="#fde9c8"/>') }); });
    V.push({ p: route(N.FERRY), sp: 2.5, o: 0, pp: 1, off: 0, ferry: 1, g: el('<path d="M-3.5 -1.3H3.5L2.4 1.3H-2.4Z" fill="#8b5a2b" stroke="#fff" stroke-width=".3"/><circle cx="0" cy="-1.8" r=".8" fill="#2a2622"/>') });
    var r1 = route('M360 140Q300 148 250 155Q190 162 120 171Q60 180 0 167'), r2 = route('M225 0Q205 60 183 112Q162 150 130 170');
    [[r1, 3.5, .1], [r1, 3, .6], [r2, 2.8, .3]].forEach(function (b) { V.push({ p: b[0], sp: b[1], o: b[2], pp: 1, off: 0, g: el('<path d="M-9 -1.6L-4 0L-9 1.6" fill="none" stroke="#fff" stroke-width=".5" opacity=".7"/><path d="M-4 -1.8H3L5 0L3 1.8H-4Z" fill="#f4f1e8" stroke="#3a4b5a" stroke-width=".4"/><rect x="-2.5" y="-1" width="3" height="2" fill="#7a8b99"/>') }); });
    var PL = 'M6 0L-4 -1L-6 -6H-8L-6 -1H-9L-10 -3H-11L-10 0L-11 3H-10L-9 1H-6L-8 6H-6L-4 1Z';
    [['M-30 300L390 -20', 40, 0], ['M390 230L-30 40', 34, .5]].forEach(function (a) { V.push({ p: route(a[0]), sp: a[1], o: a[2], pp: 0, off: 0, air: 1, g: el('<g opacity=".25" transform="translate(6,8)"><path d="' + PL + '" fill="#000"/></g><path d="' + PL + '" fill="#fff" stroke="#3a4b5a" stroke-width=".5"/>') }); });
    V.forEach(function (v) { v.L = v.p.getTotalLength(); });
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, T = 0, t0 = null;
    function frame(ts) {
      requestAnimationFrame(frame);
      if (document.hidden || mv.style.display === 'none' || cityEl.style.display === 'none' || reduce || !LY.move) { t0 = null; return; }
      if (t0 == null) t0 = ts; T += Math.min(.1, (ts - t0) / 1000); t0 = ts;
      var S = SIMD;
      V.forEach(function (v) {
        if (v.ferry && S && S.ferry === false) { v.g.setAttribute('visibility', 'hidden'); return; }
        var cyc = v.air ? v.L + 600 : v.L, per = cyc * (v.pp ? 2 : 1), dist = (v.o * per + T * v.sp) % per, back = v.pp && dist > v.L, s = back ? 2 * v.L - dist : dist;
        if (v.air && s > v.L) { v.g.setAttribute('visibility', 'hidden'); return; }
        v.g.removeAttribute('visibility'); s = Math.max(0, Math.min(v.L, s));
        var a = v.p.getPointAtLength(s), b = v.p.getPointAtLength(Math.min(v.L, s + .5)), c = v.p.getPointAtLength(Math.max(0, s - .5)), ang = Math.atan2(b.y - c.y, b.x - c.x) + (back ? Math.PI : 0);
        v.g.setAttribute('transform', 'translate(' + (a.x - Math.sin(ang) * v.off).toFixed(2) + ',' + (a.y + Math.cos(ang) * v.off).toFixed(2) + ') rotate(' + (ang * 180 / Math.PI).toFixed(1) + ')');
      });
    }
    requestAnimationFrame(frame);
  })();

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
      '<div class="acts">' + (o.zoom ? '<button type="button" class="pri" data-a="zoom">🔍 近くで見る</button>' : '') + (o.city ? '<button type="button" class="pri" data-a="route">🧭 行き方</button>' : '') +
      '<button type="button" data-a="share">🔗 共有</button><button type="button" data-a="save">' + (sv ? '★ 保存ずみ' : '☆ 保存') + '</button></div><div class="rt"></div>';
    card.querySelector('.x').onclick = function () { card.hidden = true; selP = null; clearRoute(); draw(); };
    card.querySelector('.acts').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
      if (a === 'zoom') o.zoom();
      if (a === 'share') { var u = location.origin + location.pathname + '#p=' + o.id; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('リンクをコピーしました'); }, function () { window.prompt('このリンクを共有できます', u); }); }
      if (a === 'save') { var s = saved(), i = s.indexOf(o.id); if (i >= 0) { s.splice(i, 1); b.textContent = '☆ 保存'; toast('保存をやめました'); } else { s.unshift(o.id); b.textContent = '★ 保存ずみ'; toast('保存しました（さがす欄に出ます）'); } setSaved(s.slice(0, 20)); }
      if (a === 'route') routeUI(card.querySelector('.rt'), o);
    };
  }
  function openPlace(d) {
    showCard({ id: 'c-' + d.id, title: d.name, sub: d.sub, text: d.text, zoom: function () { flyTo(d.ll, d.id === 'nisui' ? kFor(7) : kFor(60)); } });
    flyTo(d.ll, Math.max(k, 6));
  }
  function openProv(p) {
    selP = p; var i = PROV.indexOf(p), S = simData(), st = ['中心の町：' + p[6], '人口：' + p[7] + '（仮）'];
    if (S) { var w = S.wx[i]; st.push('今日：' + SIM.WX[w.k][1] + ' ' + SIM.WX[w.k][0] + ' ' + Math.round(w.t) + '℃'); }
    showCard({ id: 'p-' + i, title: p[0], sub: NAT[p[1]] + 'の州', stats: st, text: p[8], zoom: p[0] === '二水州' ? function () { flyTo(C0, kFor(7)); } : null });
    draw();
  }
  var KUN = { c1: '西岸区', c2: '中洲区', c3: '南岸区' };
  function openId(id, here) {
    var t = id.slice(0, 1), v = id.slice(2), i = +v, x, y, o;
    if (t === 'c') { var d = PLACES.filter(function (q) { return q.id === v; })[0]; if (d) openPlace(d); return; }
    if (t === 'p') { var p = PROV[i]; if (!p) return; flyTo(p.c, Math.max(6, Math.min(k, 10))); openProv(p); return; }
    if (t === 'd') { var g = N.D[i]; if (!g) return; x = g[1]; y = g[2]; o = { title: g[0], sub: '二水市・' + KUN[g[3]] + '・' + N.USE[g[4]][0], text: g[5] }; }
    if (t === 'l') { var m = N.LM[i]; if (!m) return; x = m[1]; y = m[2]; o = { title: m[3] + ' ' + m[0], sub: '二水市の名所', text: m[4] }; }
    if (t === 'f') { var f = N.FAV.filter(function (q) { return q[1] === v; })[0]; if (!f) return; x = f[2]; y = f[3]; o = { title: '★ ' + f[0] + 'の好きな場所', sub: 'キャラ', html: '<a href="../places/#' + f[1] + '">写真と、' + esc(f[0]) + 'の言葉を見る →</a>' }; }
    if (t === 's') { var s = N.STOP[i]; if (!s) return; x = s[1]; y = s[2]; o = { title: '🚋 ' + s[0] + '停留所', sub: '路面電車', text: '松原から工房まで、町を横切る一両の電車の停留所。' }; }
    if (!o) return;
    o.id = id; o.city = [x, y]; o.zoom = function () { flyTo(c2ll(x, y), kFor(1.2)); };
    showCard(o);
    if (!here) flyTo(c2ll(x, y), Math.max(k, kFor(2.5)));
  }

  // ---- 行き方（二水市の中）：歩き・渡し舟・路面電車 ----
  var CROSS = { c1c2: [[[176, 92], [196, 96], '北の橋']], c2c3: [[[196, 142], [176, 186], '電車の橋'], [[330, 128], [318, 152], '東の橋']], c1c3: [[[100, 156], [150, 200], '渡し舟']] };
  function ku(x, y) { var b = null, bd = 1e9; N.D.forEach(function (d) { var e = (d[1] - x) * (d[1] - x) + (d[2] - y) * (d[2] - y); if (e < bd) { bd = e; b = d; } }); return b[3]; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function plan(A, B) {
    var ka = ku(A[0], A[1]), kb = ku(B[0], B[1]), pts = [A], boatSeg = [], steps = [], S = simData(), ferry = !S || S.ferry !== false;
    function cross(k1, k2) {
      var key = [k1, k2].sort().join(''), opts = CROSS[key]; if (!opts) return;
      if (key === 'c1c3' && !ferry) { steps.push('今日は川の水が多く、渡し舟はお休み'); cross(k1, 'c2'); cross('c2', k2); return; }
      var last = pts[pts.length - 1], best = opts.slice().sort(function (o1, o2) { return dist(last, o1[0]) + dist(o1[1], B) - dist(last, o2[0]) - dist(o2[1], B); })[0];
      var o = ku(best[0][0], best[0][1]) === k1 ? [best[0], best[1]] : [best[1], best[0]];
      pts.push(o[0], o[1]); if (best[2] === '渡し舟') boatSeg.push(pts.length - 1); steps.push(best[2] + 'で川をわたる');
    }
    if (ka !== kb) cross(ka, kb); pts.push(B);
    var walk = 0, boat = 0;
    for (var i = 1; i < pts.length; i++) { var seg = dist(pts[i - 1], pts[i]) / KM; if (boatSeg.indexOf(i) >= 0) boat += seg; else walk += seg * 1.25; } // 町の道は直線の1.25倍
    function near(P) { var b = null, bd = 1e9; N.STOP.forEach(function (s) { var e = dist(P, [s[1], s[2]]); if (e < bd) { bd = e; b = s; } }); return [b, bd]; }
    var na = near(A), nb = near(B), tram = null;
    if (na[1] < 45 && nb[1] < 45 && na[0] !== nb[0]) { var tk = dist([na[0][1], na[0][2]], [nb[0][1], nb[0][2]]) * 1.2 / KM; tram = { from: na[0][0], to: nb[0][0], min: Math.round((na[1] + nb[1]) * 1.25 / KM / 4.5 * 60 + 4 + tk / 15 * 60) }; }
    return { pts: pts, steps: steps, km: +(walk + boat).toFixed(1), min: Math.round(walk / 4.5 * 60 + (boat ? boat / 6 * 60 + 5 : 0)), tram: tram, boat: boat > 0 };
  }
  function clearRoute() { $('route').innerHTML = ''; }
  function routeUI(box, o) {
    var opts = N.LM.map(function (m, i) { return '<option value="l' + i + '">' + m[3] + ' ' + esc(m[0]) + '</option>'; }).concat(N.D.map(function (d, i) { return '<option value="d' + i + '">🏘️ ' + d[0] + '</option>'; })).join('');
    box.innerHTML = '<div class="route">出発：<select aria-label="出発する場所">' + opts + '</select><div class="out"></div></div>';
    var sel = box.querySelector('select'); sel.value = 'l11';
    function calc() {
      var v = sel.value, P = v[0] === 'l' ? N.LM[+v.slice(1)] : N.D[+v.slice(1)], A = [P[1], P[2]], r = plan(A, o.city);
      box.querySelector('.out').innerHTML = '<ul><li>🚶 歩き' + (r.boat ? 'と渡し舟' : '') + '：約' + r.min + '分（' + r.km + 'km）' + (r.steps.length ? '<br><small>' + r.steps.join('、') + '</small>' : '') + '</li>' + (r.tram ? '<li>🚋 路面電車：約' + r.tram.min + '分（' + r.tram.from + ' → ' + r.tram.to + '）</li>' : '') + '</ul>';
      $('route').innerHTML = '<polyline points="' + r.pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="#1a73e8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 4"/><circle cx="' + A[0] + '" cy="' + A[1] + '" r="3" fill="#fff" stroke="#1a73e8" stroke-width="1.6"/><circle cx="' + o.city[0] + '" cy="' + o.city[1] + '" r="3.6" fill="#ea4335" stroke="#fff" stroke-width="1"/>';
      var xs = r.pts.map(function (p) { return p[0]; }), ys = r.pts.map(function (p) { return p[1]; });
      var cx = (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, cy = (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2, span = Math.max(Math.max.apply(0, xs) - Math.min.apply(0, xs), Math.max.apply(0, ys) - Math.min.apply(0, ys)) / KM;
      flyTo(c2ll(cx, cy), kFor(Math.max(1, span * 1.6)));
    }
    sel.onchange = calc; calc();
  }

  // ---- さがす ----
  var q = $('q'), res = $('gres'), qx = $('q-x'), IDX = null;
  function index() {
    if (IDX) return IDX; IDX = [];
    PLACES.forEach(function (d) { IDX.push({ id: 'c-' + d.id, i: '📍', t: d.name, s: d.sub }); });
    PROV.forEach(function (p, i) { IDX.push({ id: 'p-' + i, i: '🗺️', t: p[0], s: NAT[p[1]] + 'の州' }); });
    N.D.forEach(function (d, i) { IDX.push({ id: 'd-' + i, i: '🏘️', t: d[0], s: '二水市・' + KUN[d[3]] }); });
    N.LM.forEach(function (m, i) { IDX.push({ id: 'l-' + i, i: m[3], t: m[0], s: '二水市の名所' }); });
    N.FAV.forEach(function (f) { IDX.push({ id: 'f-' + f[1], i: '★', t: f[0] + 'の好きな場所', s: 'キャラ' }); });
    N.STOP.forEach(function (s, i) { IDX.push({ id: 's-' + i, i: '🚋', t: s[0] + '停留所', s: '路面電車' }); });
    return IDX;
  }
  function find(id) { return index().filter(function (x) { return x.id === id; })[0]; }
  function list(items, head) { res.hidden = false; res.innerHTML = (head ? '<li class="hd">' + head + '</li>' : '') + (items.length ? items.map(function (x) { return '<li><button type="button" data-id="' + x.id + '"><i>' + x.i + '</i><span><b>' + esc(x.t) + '</b><small>' + esc(x.s) + '</small></span></button></li>'; }).join('') : '<li class="hd">見つかりませんでした</li>'); }
  function suggest() { var sv = saved().map(find).filter(Boolean); list(sv.length ? sv : index().slice(0, 3).concat(index().filter(function (x) { return x.id === 'l-0'; })), sv.length ? '保存した場所' : 'よく見られる場所'); }
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
    if (x.name === 'base') setBase(x.value);
    if (x.id === 'ly-prov') { LY.prov = x.checked; draw(); }
    if (x.id === 'ly-move') { LY.move = x.checked; draw(); }
    if (x.id === 'ly-wx' || x.id === 'ly-mood') { LY[x.id === 'ly-wx' ? 'wx' : 'mood'] = x.checked; var S = simData(); if (x.checked && S) toast('世界シミュレーション：' + S.date); draw(); }
  });
  $('legend').innerHTML = Object.keys(N.USE).map(function (u) { return '<span><i style="background:' + N.USE[u][1] + '"></i>' + N.USE[u][0] + '</span>'; }).join('') + '<span><i style="background:repeating-linear-gradient(90deg,#c0392b 0 5px,transparent 5px 8px);height:3px"></i>路面電車</span><span>★ 好きな場所</span><span>◎ 名所</span>';

  // ---- はじめ ----
  fit(); setBase('plan'); simData();
  window.addEventListener('resize', function () { fit(); draw(); });
  var h = location.hash.match(/^#p=([a-z])-([\w-]+)$/);
  if (h) setTimeout(function () { openId(h[1] + '-' + h[2]); }, 200);
  else if (location.hash === '#nisui') { rot = [-C0[0], -C0[1], 0]; k = kFor(7); draw(); }
})();
