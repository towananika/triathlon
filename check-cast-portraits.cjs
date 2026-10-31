const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = __dirname;
function readData(source, url) {
  const context = { URL, document: { currentScript: { src: url } } };
  vm.runInNewContext(source, context);
  return context;
}
const previous = readData(execFileSync('git', ['show', 'HEAD:char/cast-data.js'], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }), 'https://towananika.github.io/triathlon/char/cast-data.js');
const current = readData(fs.readFileSync(path.join(root, 'char/cast-data.js'), 'utf8'), 'https://towananika.github.io/triathlon/char/cast-data.js?v=0.69.1');
for (const field of ['CHARS', 'SEED', 'TEXT', 'GLOBAL']) assert.equal(JSON.stringify(current[field]), JSON.stringify(previous[field]), field + ' must not change');
assert.equal(current.LOOK['s1-knight'].h, 155);
previous.LOOK['s1-knight'].h = 155;
assert.equal(JSON.stringify(current.LOOK), JSON.stringify(previous.LOOK), 'Only Knight height may change');
assert.equal(current.IMG.length, previous.IMG.length);
assert.equal(current.IMG[0], 'https://towananika.github.io/triathlon/assets/characters/fighter-20261031.png');
assert.equal(current.IMG[1], 'https://towananika.github.io/triathlon/assets/characters/knight-average-20261031.png');
for (let index = 2; index < current.IMG.length; index++) assert.equal(current.IMG[index], previous.IMG[index]);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/triathlon/')) { res.writeHead(404).end(); return; }
  const rel = decodeURIComponent(url.pathname.slice('/triathlon/'.length));
  const file = path.resolve(root, rel.endsWith('/') || !rel ? rel + 'index.html' : rel);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + (path.extname(file) === '.png' ? '' : '; charset=utf-8'));
    res.end(body);
  });
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/triathlon/';
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      await page.route('https://**/*', route => route.abort());
      for (const [id, filename, name] of [['s1-fighter', 'fighter-20261031.png', 'アカリ'], ['s1-knight', 'knight-average-20261031.png', 'シオン']]) {
        await page.goto(base + 'char/c.html?id=' + id);
        await page.locator('h1').filter({ hasText: name }).waitFor();
        const pic = page.locator('.face img').first();
        await pic.evaluate(img => img.decode());
        assert((await pic.getAttribute('src')).endsWith(filename));
        assert(await pic.evaluate(img => img.naturalWidth > 0 && img.naturalHeight > 0));
        if (id === 's1-knight') assert((await page.locator('main').innerText()).includes('155cm'));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: path.join(process.env.TEMP, id + '-' + width + '.png') });
      }
      await page.goto(base + 'char/');
      for (const id of ['s1-fighter', 's1-knight']) {
        const image = page.locator('[data-id="' + id + '"] img');
        await image.evaluate(img => img.decode());
        assert((await image.getAttribute('src')).includes('/assets/characters/'));
      }
      assert.equal(await page.locator('.tile').count(), 9);
      await page.screenshot({ path: path.join(process.env.TEMP, 'cast-new-' + width + '.png') });
      await page.goto(base);
      for (const id of ['fighter', 'knight-average']) {
        const image = page.locator('img[src$="' + id + '-20261031.png"]').first();
        await image.evaluate(img => img.decode());
      }
      await page.close();
      console.log(width + 'px: profiles, cast list, homepage images PASS');
    }
    console.log('Portraits and Knight 155cm verified; other settings preserved PASS');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
