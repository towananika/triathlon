/* 二水のスマホ画面確認：初回→3回選ぶ→次の日へ→前日の一言が出る。 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const opts = process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {};
  const browser = await chromium.launch(opts);
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/site-nav\.js/, (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.getByRole('button', { name: 'ランダムな人生を受け取る' }).click();
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-place]:not([disabled])').first().click();
      await page.locator('[data-choice="help"]').click();
    }
    await page.getByRole('button', { name: '次の日へ' }).click();
    await page.locator('[data-place="river"]').click();
    assert.match(await page.locator('.memory').textContent(), /昨日は助かった/);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(wide, false, '横にはみ出さない');
    await page.screenshot({ path: process.env.SHOT || path.join(require('node:os').tmpdir(), 'day-one-390.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('day-one screen: ok');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
