// キャラ図鑑：決めシートで決まった26人を、外見・人となり・絵の指示文つきで表示する（静的版）
var COLOR = {R:'R',G:'G',B:'B',C:'C',M:'M',Y:'Y',W:'W',K:'K',G2:'G2',E:'E'};
var CNAME = {R:'R・近接',G:'G・探索',B:'B・魔法',C:'シアン',M:'マゼンタ',Y:'イエロー',W:'ホワイト',K:'ブラック',G2:'グレイ',E:'エンプティ'};
var picks = SEED, tab = 0;
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function lum(hex){ var n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }
function pick(c, k){ return (picks[c.id] || {})[k]; }
function card(c){
  var L = LOOK[c.id], T = TEXT[c.id], name = pick(c, 'name') || '？', cls = pick(c, 'cls') || c.cls, sex = pick(c, 'sex') || c.sex;
  var traits = c.fixed.concat(['trait','item','look'].map(function(k){ return pick(c, k); }).filter(Boolean));
  var pic = c.img != null ? '<img alt="' + esc(name) + 'の作画案" src="' + IMG[c.img] + '" loading="lazy">' : '<span style="background:' + L.hc + ';color:' + (lum(L.hc) > .6 ? '#1c2230' : '#fff') + '">' + esc(name.slice(0, 1)) + '</span>';
  function dot(col, t){ return '<span class="dot"><i style="background:' + col + '"></i>' + esc(t) + '</span>'; }
  function row(k, v){ return '<div><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>'; }
  return '<article class="card" style="--c:var(--' + COLOR[c.c] + ')"><div class="top"><div class="pic">' + pic + '</div><div class="who"><div class="meta">' + CNAME[c.c] + ' · 第' + c.s + '期</div>' +
    '<h3>' + esc(name) + '<small>' + esc(cls) + '・' + esc(sex) + '</small></h3><p class="say">「' + esc(T.say) + '」<small>一人称：' + esc(T.me) + '</small></p>' +
    '<div class="fixed">' + traits.map(function(x){ return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div></div>' +
    '<div class="lk"><div class="ht"><b>' + L.h + '<small>cm</small></b><i><u style="width:' + Math.round((L.h - 140) / 50 * 100) + '%"></u></i><span>' + esc(L.b) + '</span></div>' +
    '<div class="dots">' + dot(L.hc, '髪：' + L.hair) + dot(L.ec, '目：' + L.eye) + dot(L.sc, '肌：' + L.skin) + '</div><div class="wear">👕 ' + esc(L.wear) + '　⭐ ' + esc(L.mark) + '</div></div>' +
    '<dl class="tx">' + row('好き', T.like) + row('苦手', T.dislike) + row('願い', T.wish) + row('弱さ', T.weak) + row('関係', T.rel) + '</dl>' +
    '<button class="cp" data-pr="' + c.id + '">📋 絵を描くための指示文をコピー</button></article>';
}
function promptText(id){
  var c = CHARS.filter(function(x){ return x.id === id; })[0], L = LOOK[id], g = picks.global || {};
  var age = /高校/.test(g.age1 || '') ? '高校生' : '中学生';
  var traits = c.fixed.concat(pick(c, 'trait') ? [pick(c, 'trait')] : []).join('、');
  return '2Dアニメ調のキャラクター立ち絵。全身・正面・無地の淡い背景。' + age + 'の' + (pick(c, 'sex') || c.sex) + '「' + pick(c, 'name') + '」、クラスは' + (pick(c, 'cls') || c.cls) + '。身長' + L.h + 'cm、体型は' + L.b + '。髪：' + L.hair + '。目：' + L.eye + '。肌：' + L.skin + '。服：' + L.wear + '。トレードマーク：' + L.mark + '。' + (traits ? '雰囲気：' + traits + '。' : '') + '第1期の9人と同じ画風・同じ等身で、ほかのキャラと見分けがつく顔立ちに。';
}
function heights(){
  var list = CHARS.filter(function(c){ return !tab || c.s === tab; }).sort(function(a, b){ return LOOK[b.id].h - LOOK[a.id].h; });
  return '<section class="gl"><h2>背の高さくらべ</h2><div class="hc">' + list.map(function(c){
    return '<div><span>' + esc(pick(c, 'name')) + '</span><i><u style="width:' + Math.round((LOOK[c.id].h - 140) / 50 * 100) + '%;background:var(--' + COLOR[c.c] + ')"></u></i><b>' + LOOK[c.id].h + '</b></div>'; }).join('') + '</div></section>';
}
function render(){
  document.querySelectorAll('.tabs button').forEach(function(b){ b.setAttribute('aria-pressed', +b.dataset.t === tab); });
  var S = ['','第1期 · R / G / B','第2期 · シアン / マゼンタ / イエロー','第3期 · ホワイト / ブラック / グレイ','第4期 · エンプティ'], h = heights();
  for (var s = 1; s <= 4; s++){ if (tab && tab !== s) continue; h += '<h2>' + S[s] + '</h2><div class="grid">' + CHARS.filter(function(c){ return c.s === s; }).map(card).join('') + '</div>'; }
  $('list').innerHTML = h;
}
function copy(t, b){
  function ok(){ var o = b.textContent; b.textContent = '✅ コピーしました'; setTimeout(function(){ b.textContent = o; }, 1500); }
  function fb(){ var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch(e){} a.remove(); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
}
document.addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  if (b.dataset.pr){ copy(promptText(b.dataset.pr), b); return; }
  if (b.dataset.t != null){ tab = +b.dataset.t; render(); window.scrollTo(0, 0); }
});
render();
