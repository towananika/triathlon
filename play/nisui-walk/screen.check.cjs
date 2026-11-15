/* 二水2Dのスマホ画面確認：初回→近づく→3回話す→次の日へ→前日の一言。 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.getByRole('button', { name: 'ランダムな人生を受け取る' }).click();
    assert.equal(await page.locator('#talk').isVisible(), false, '遠いと話せない');
    await page.mouse.click(120, 200); await page.waitForTimeout(1200);
    await page.screenshot({ path: (process.env.SHOT || path.join(os.tmpdir(), 'nisui-walk-390.png')).replace('.png', '-town.png') });
    for (const id of ['river', 'market', 'library']) {
      await page.evaluate((x) => window.NisuiWalk.go(x), id);
      await page.locator('#talk').click();
      await page.locator('[data-choice="help"]').click();
    }
    await page.evaluate(() => window.NisuiWalk.go('home'));
    await page.getByRole('button', { name: '家に入る' }).click();
    assert.match(await page.locator('#room').textContent(), /今日をふり返る.*朝市/);
    await page.screenshot({ path: (process.env.SHOT || path.join(os.tmpdir(), 'nisui-walk-390.png')).replace('.png', '-home.png') });
    await page.getByRole('button', { name: '眠る（次の日へ）' }).click();
    assert.equal(await page.locator('#room').isVisible(), false);
    await page.evaluate(() => window.NisuiWalk.go('river'));
    await page.locator('#talk').click();
    assert.match(await page.locator('.memory').textContent(), /昨日は助かった/);
    const shot = process.env.SHOT || path.join(os.tmpdir(), 'nisui-walk-390.png');
    await page.screenshot({ path: shot });
    assert.deepEqual(errors, []);
    assert.match(await page.locator('#day').textContent(), /2日目/);
    console.log('nisui-walk screen: ok');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
