(() => {
  const script = document.currentScript;
  const configUrl = new URL('config.json',script.src);
  fetch(configUrl,{cache:'no-store'}).then(response => response.ok ? response.json() : null).then(config => {
    if (config?.enabled !== true) return;
    const origin = new URL(config.developmentOrigin);
    if (origin.protocol !== 'https:') return;
    const target = document.body.dataset.developmentTarget || '/dev/';
    if (!target.startsWith('/') || target.startsWith('//')) return;
    // Googleと同じ形のボタン。だれが入れるかは開発Site側（閲覧許可リスト）で決める
    const link = document.createElement('a'); link.className = 'gbtn gpt'; link.target = '_top';
    link.href = new URL(target,origin.origin).href;
    link.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12a4 4 0 0 1 8 0a4 4 0 0 1-8 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>ChatGPTでログイン';
    document.getElementById('login-entry').append(link);
  }).catch(() => {});
})();
