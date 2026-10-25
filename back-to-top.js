(() => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'back-to-top'; button.hidden = true;
  function label() {
    const text = document.documentElement.lang === 'en' ? 'Back to top' : 'トップへ戻る';
    button.setAttribute('aria-label', text); button.title = text;
  }
  button.textContent = '↑'; label();
  document.body.append(button);
  const update = () => { button.hidden = window.scrollY < 240; };
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('pageshow', update);
  new MutationObserver(label).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  button.addEventListener('click', () => {
    window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    const target = document.querySelector('header a, .masthead a, h1');
    if (target) { if (!target.matches('a,button')) target.tabIndex = -1; target.focus({preventScroll:true}); }
  });
  update();
})();
