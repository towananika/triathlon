(function () {
  'use strict';
  var key = 'tri-living-plaza-v1';
  var options = [
    { id:'bench', name:'休めるベンチ', mark:'▰' },
    { id:'flowers', name:'季節の花', mark:'✿' },
    { id:'light', name:'夕方のあかり', mark:'✦' }
  ];
  var people = [
    { name:'アカリ', image:'fighter-20261031.png', lines:{ bench:'走ったあとは、ここでひと休みしよう。友達も呼んでいい？', flowers:'きれい！ この花、春になったらもっと増えるかな。', light:'帰り道が明るいと、少し遅くなっても安心だね。' }, idle:'今日は少し走ってから、広場を歩いてみよう。' },
    { name:'シオン', image:'knight-average-20261031.png', lines:{ bench:'待ち合わせにも使えそうですね。少し座ってみましょう。', flowers:'花があると、いつもの道が少し違って見えますね。', light:'この明かりなら、帰り道を落ち着いて歩けそうです。' }, idle:'広場から見える景色を、少し眺めていきましょう。' },
    { name:'ツバサ', image:'portraits-20261101/warrior.png', lines:{ bench:'ここなら、静かに考えごとができそう。', flowers:'この色、好きかも。明日も見に来ようかな。', light:'夜の広場も、やさしい雰囲気になったね。' }, idle:'今日はここで、少し休んでいこうかな。' }
  ];
  var state = { day:1, selected:null, history:[] };
  try {
    var saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && Number.isInteger(saved.day) && saved.day > 0 && (saved.selected === null || options.some(function(o){return o.id === saved.selected;})) && Array.isArray(saved.history)) state = { day:saved.day, selected:saved.selected, history:saved.history.filter(function(x){return x && typeof x.day === 'number' && typeof x.person === 'string' && typeof x.place === 'string';}).slice(-7) };
  } catch(e) {}
  var $ = function(id){return document.getElementById(id);};
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){$('storage-status').textContent='この端末に保存できませんでした。';}}
  var storageStatus=document.createElement('p');storageStatus.id='storage-status';storageStatus.className='foot';storageStatus.setAttribute('role','status');document.querySelector('.panel').appendChild(storageStatus);
  function render(){
    var person=people[(state.day-1)%people.length], selected=options.find(function(o){return o.id===state.selected;});
    $('day').textContent=state.day+'日目';$('speaker').textContent=person.name;$('portrait').src='https://towananika.github.io/triathlon/assets/characters/'+person.image;$('portrait').alt=person.name;$('message').textContent=selected?person.lines[selected.id]:person.idle;
    $('scene-label').textContent=selected?selected.name:'まだ、何も選んでいない';$('marker').hidden=!selected;$('marker').textContent=selected?selected.mark:'';
    var choices=$('choices');choices.replaceChildren();options.forEach(function(option){var button=document.createElement('button');button.type='button';button.textContent=option.name;button.setAttribute('aria-pressed',String(state.selected===option.id));button.addEventListener('click',function(){state.selected=option.id;save();render();});choices.appendChild(button);});
    var history=$('history');history.replaceChildren();if(!state.history.length){var empty=document.createElement('li');empty.textContent='これから、思い出が増えていきます。';history.appendChild(empty);}else{state.history.slice().reverse().forEach(function(item){var li=document.createElement('li'),title=document.createElement('b');title.textContent=item.day+'日目 '+item.person;li.append(title,document.createTextNode(' · '+item.place));history.appendChild(li);});}
  }
  $('next').addEventListener('click',function(){var person=people[(state.day-1)%people.length],selected=options.find(function(o){return o.id===state.selected;});state.history.push({day:state.day,person:person.name,place:selected?selected.name:'何も置かずに過ごした'});state.history=state.history.slice(-7);state.day++;save();render();});
  $('reset').addEventListener('click',function(){if(!confirm('広場の試作の記録を最初から始めますか？'))return;state={day:1,selected:null,history:[]};save();render();});
  render();
})();
