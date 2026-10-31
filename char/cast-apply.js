// キャラの項目と、開発版での編集（localStorage）を重ねる処理。キャラ図鑑と開発版のキャラ編集で使う。
var CAST_EDIT_KEY = 'triathlon-cast-edits-v1';
var CAST_FIELDS = [
  ['name','名前','pick'],['cls','クラス','pick'],['sex','性別','pick'],
  ['me','一人称','text'],['say','口ぐせ','text'],['like','好き','text'],['dislike','苦手','text'],['wish','願い','text'],['weak','弱さ','text'],['rel','関係','text'],
  ['h','身長(cm)','look'],['b','体型','look'],['hair','髪','look'],['eye','目','look'],['skin','肌','look'],['wear','服','look'],['mark','目じるし','look']
];
function castGet(c, k, where){
  if (where === 'pick') return (SEED[c.id] || {})[k] || c[k] || '';
  if (where === 'text') return (TEXT[c.id] || {})[k] || '';
  return (LOOK[c.id] || {})[k] == null ? '' : LOOK[c.id][k];
}
function castEdits(){ try { return JSON.parse(localStorage.getItem(CAST_EDIT_KEY)) || {}; } catch (e) { return {}; } }
function castApply(ed){
  var n = 0;
  CHARS.forEach(function(c){
    var e = ed[c.id]; if (!e) return;
    CAST_FIELDS.forEach(function(f){
      if (!(f[0] in e)) return;
      var v = f[0] === 'h' ? +e[f[0]] : e[f[0]];
      if (f[2] === 'pick') { SEED[c.id] = SEED[c.id] || {}; SEED[c.id][f[0]] = v; if (f[0] !== 'name') c[f[0]] = v; }
      else if (f[2] === 'text') TEXT[c.id][f[0]] = v; else LOOK[c.id][f[0]] = v;
      n++;
    });
  });
  return n;
}
