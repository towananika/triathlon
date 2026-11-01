const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const root = process.cwd();
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = path.resolve(root, decodeURIComponent(url.pathname).replace(/^\/triathlon\//, ''));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
}
async function decoded(page, selector) {
  await page.locator(selector).evaluateAll(async images => {
    await Promise.all(images.map(async img => {
      img.loading = 'eager';
      await img.decode();
      if (!img.naturalWidth || !img.naturalHeight) throw Error('Blank image: ' + img.src);
    }));
  });
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/triathlon/';
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of process.argv.includes('--smoke') ? [] : [320, 390, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      await page.goto(base + 'char/');
      assert.equal(await page.locator('.cast-item').count(), 9);
      await decoded(page, '.portrait img');
      await noOverflow(page);
      const names = await page.locator('.cast-item h2').allTextContents();
      assert.equal(new Set(names).size, 9);
      const links = await page.locator('.cast-item').evaluateAll(items => items.map(a => a.href));
      for (const color of ['R', 'G', 'B']) {
        await page.locator('[data-color="' + color + '"]').click();
        assert.equal(await page.locator('.cast-item').count(), 3);
        assert.equal(await page.locator('#count').innerText(), '3人');
        assert.equal(await page.locator('.cast-item.' + color).count(), 3);
      }
      await page.locator('[data-color="all"]').click();
      if (width === 390 || width === 1280) await page.screenshot({ path: path.join(os.tmpdir(), 'character-gallery-' + width + '.png'), fullPage: true });
      for (let i = 0; i < links.length; i++) {
        await page.goto(links[i]);
        assert.equal(await page.locator('h1').innerText(), names[i]);
        await decoded(page, '.profile-art img');
        await noOverflow(page);
        assert.match(await page.locator('.profile-copy').innerText(), /好きな時間/);
        assert.equal(await page.locator('.profile-nav a').count(), 3);
        assert.equal(await page.locator('.more-profile').getAttribute('open'), null);
        await page.locator('.more-profile summary').click();
        assert.match(await page.locator('.more-profile').innerText(), /身長感/);
        assert(!/170cm|178cm|184cm/.test(await page.locator('main').innerText()));
        if ((width === 390 || width === 1280) && i === 5) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: path.join(os.tmpdir(), 'character-profile-' + width + '.png') });
        }
      }
      await page.locator('.profile-nav a').last().click();
      assert.equal(await page.locator('h1').innerText(), names[0]);
      await page.goto(base + 'char/c.html?id=not-a-character');
      assert.match(await page.locator('h1').innerText(), /見つかりません/);
      assert.equal(await page.locator('.profile-art').count(), 0);
      assert.deepEqual(errors, []);
      console.log('PASS ' + width + 'px: 9 profiles/images, filters, navigation, details, invalid ID, no errors/overflow');
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => window.TRI_NEWS[0].ver), 'v1.00');
    assert.equal(await page.evaluate(() => Object.keys(window.TRI_INTRODUCTIONS).length), 9);
    await noOverflow(page);
    await page.goto(base + 'news/', { waitUntil: 'domcontentloaded' });
    assert.match(await page.locator('main').innerText(), /9人のキャラクター紹介を刷新/);
    await page.goto(base + 'news/v.html?id=v1.00', { waitUntil: 'domcontentloaded' });
    assert.match(await page.locator('main').innerText(), /9人のキャラクター紹介を刷新/);
    assert.deepEqual(errors, []);
    await page.close();
    console.log('PASS homepage and release notice: version, portrait data, no script errors');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
