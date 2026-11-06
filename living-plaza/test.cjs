const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:true });
  try {
    for (const width of [390,1200]) {
      const page = await browser.newPage({ viewport:{width,height:850} });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      assert.equal(await page.locator('#day').innerText(),'1日目・朝');
      assert.equal(await page.locator('.scene img').evaluate(img => img.complete && img.naturalWidth > 0),true);
      await page.getByRole('button',{name:'休めるベンチ'}).click();
      assert.match(await page.locator('#message').innerText(),/ひと休み/);
      await page.getByRole('button',{name:'時間を進める'}).click();
      assert.equal(await page.locator('#day').innerText(),'1日目・昼');
      assert.equal(await page.locator('#speaker').innerText(),'シオン');
      await page.waitForFunction(() => document.querySelector('#portrait').complete && document.querySelector('#portrait').naturalWidth > 0);
      assert.match(await page.locator('#history').innerText(),/アカリ/);
      await page.reload();
      assert.equal(await page.locator('#day').innerText(),'1日目・昼');
      assert.match(await page.locator('#history').innerText(),/ベンチ/);
      await page.getByRole('button',{name:'時間を進める'}).click();
      assert.equal(await page.locator('#day').innerText(),'1日目・夕方');
      await page.getByRole('button',{name:'翌朝へ'}).click();
      assert.equal(await page.locator('#day').innerText(),'2日目・朝');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
      assert.deepEqual(errors,[]);
      await page.screenshot({path:path.join(process.env.TEMP || '.',`tri-plaza-${width}.png`)});
      await page.close();
      console.log(`plaza ${width}px: ok`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
