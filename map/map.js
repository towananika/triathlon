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
  var gCiv = svg.append('g'), gRim = svg.append('path').attr('class', 'rim'), gCol = svg.append('g'), gLab = svg.append('g'), gWx = svg.append('g').attr('class', 'wxl'), gPin = svg.append('g'), gScale = svg.append('g').attr('class', 'scale');

  // 1km が何px か
  function pxkm() { return proj.scale() / 6371; }
  var LY = { prov: true, wx: false, mood: false }, selP = null, SIMD = null;
  function simData() {
    if (SIMD || !SIM) return SIMD;
    var d = SIM.today(), x = SIM.run(d, 1);
    SIMD = { d: d, wx: PROV.map(function (p, i) { return SIM.climate(i, d); }), mood: x.state.prov.map(function (p) { return p.mood; }), ferry: x.state.ferry, date: x.date.label, col: x.state.col, civ: x.state.civ };
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
    en.merge(pin).each(function (d) { var q = proj(d.ll), g = d3.select(this), hide = false; g.style('display', q && visible(d.ll) && !hide ? null : 'none'); if (q) g.attr('transform', 'translate(' + q[0] + ',' + q[1] + ')'); });
    drawWorld(pk);
    drawScale(pk);
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
  function kmax() { return 20 * 6371 / base; } // いまは 1km＝20px まで（町の地図を入れたらもっと先へ）
  function degpx() { return 57.2958 / proj.scale(); }
  function clampRot() { rot[1] = Math.max(-85, Math.min(85, rot[1])); }
  function zoomAt(f, px, py) {
    var nk = Math.max(KMIN, Math.min(kmax(), k * f)); if (nk === k) return;
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
    selP = p; var i = PROV.indexOf(p), S = simData(), st = ['中心の町：' + p[6], '人口：' + p[7] + '（仮）'];
    if (S) { var w = S.wx[i]; st.push('今日：' + SIM.WX[w.k][1] + ' ' + SIM.WX[w.k][0] + ' ' + Math.round(w.t) + '℃'); }
    showCard({ id: 'p-' + i, title: p[0], sub: NAT[p[1]] + 'の州', stats: st, text: p[8], zoom: p[0] === '二水州' ? function () { flyTo(C0, kFor(7)); } : null });
    draw();
  }
  function openId(id) {
    var t = id.slice(0, 1), v = id.slice(2), i = +v;
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
    if (x.id === 'ly-wx' || x.id === 'ly-mood') { LY[x.id === 'ly-wx' ? 'wx' : 'mood'] = x.checked; var S = simData(); if (x.checked && S) toast('世界シミュレーション：' + S.date); draw(); }
  });

  // ---- はじめ ----
  fit(); simData(); draw();
  window.addEventListener('resize', function () { fit(); draw(); });
  var h = location.hash.match(/^#p=([a-z])-([\w-]+)$/);
  if (h) setTimeout(function () { openId(h[1] + '-' + h[2]); }, 200);
  else if (location.hash === '#nisui') { rot = [-C0[0], -C0[1], 0]; k = kFor(7); draw(); }
})();
