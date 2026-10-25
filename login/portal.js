(() => {
  const script = document.currentScript;
  const configUrl = new URL('config.json',script.src);
  fetch(configUrl,{cache:'no-store'}).then(response => response.ok ? response.json() : null).then(config => {
    if (config?.enabled !== true) return;
    const origin = new URL(config.developmentOrigin);
    if (origin.protocol !== 'https:') return;
    const target = document.body.dataset.developmentTarget || '/dev/';
    if (!target.startsWith('/') || target.startsWith('//')) return;
    document.getElementById('login-status').textContent = 'ChatGPTアカウントでログインします。開発版は閲覧を許可されたユーザーだけが利用できます。';
    const link = document.createElement('a'); link.className = 'login'; link.target = '_top';
    link.href = new URL(target,origin.origin).href; link.textContent = 'ChatGPTでログインして開発版へ';
    document.getElementById('login-entry').append(link);
  }).catch(() => {});
})();
