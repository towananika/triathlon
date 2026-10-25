// キャラ図鑑（シンプル版）：期ごとの一覧から、押すと詳しく見られる
var CNAME = {R:'R・近接',G:'G・探索',B:'B・魔法',C:'シアン',M:'マゼンタ',Y:'イエロー',W:'ホワイト',K:'ブラック',G2:'グレイ',E:'エンプティ'};
var SNAME = ['', '第1期', '第2期', '第3期', '第4期'], tab = 1;
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function lum(hex){ var n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }
function nm(c){ return (SEED[c.id] || {}).name || '？'; }
function face(c, big){
  var L = LOOK[c.id];
  return c.img != null ? '<img alt="" src="' + IMG[c.img] + '" loading="lazy">' : '<span class="ini' + (big ? ' big' : '') + '" style="background:' + L.hc + ';color:' + (lum(L.hc) > .6 ? '#1c2230' : '#fff') + '">' + esc(nm(c).slice(0, 1)) + '</span>';
}
function render(){
  document.querySelectorAll('.tabs button').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.dataset.t === tab)); });
  $('list').innerHTML = CHARS.filter(function(c){ return c.s === tab; }).map(function(c){
    return '<button class="tile" type="button" data-id="' + c.id + '" style="--c:var(--' + c.c + ')"><span class="face">' + face(c) + '</span><b>' + esc(nm(c)) + '</b><small>' + esc(c.cls) + '</small></button>';
  }).join('');
}
function open(id){
  var c = CHARS.filter(function(x){ return x.id === id; })[0], L = LOOK[id], T = TEXT[id];
  function row(k, v){ return v ? '<div><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>' : ''; }
  $('sheet-in').innerHTML = '<button class="x" type="button" data-close aria-label="閉じる">✕</button><div class="hd" style="--c:var(--' + c.c + ')"><span class="face">' + face(c, true) + '</span><div><p class="meta">' + (admin ? SNAME[c.s] + ' · ' : '') + CNAME[c.c] + '</p><h2>' + esc(nm(c)) + '</h2><p class="cls">' + esc(c.cls) + '・' + esc(c.sex) + '</p></div></div>' +
    '<p class="say">「' + esc(T.say) + '」</p>' +
    '<dl>' + row('外見', L.h + 'cm・' + L.b + '。髪は' + L.hair + '、目は' + L.eye) + row('服', L.wear) + row('好き', T.like) + row('苦手', T.dislike) + row('願い', T.wish) + row('関係', T.rel) + '</dl>';
  $('sheet').hidden = false; $('sheet-in').querySelector('.x').focus();
}
document.addEventListener('click', function(e){
  var b = e.target.closest('button');
  if (e.target.id === 'sheet' || (b && b.hasAttribute('data-close'))) { $('sheet').hidden = true; return; }
  if (!b) return;
  if (b.dataset.id) { open(b.dataset.id); return; }
  if (b.dataset.t != null && admin) { tab = +b.dataset.t; render(); }
});
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') $('sheet').hidden = true; });
var admin = !!window.TRI_DEV;
// 公開は今の期だけ。期の名前も出さない
if (!admin) tab = 1;
if (admin && castApply(castEdits())) $('preview').hidden = false;
render();
