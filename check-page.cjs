const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
    const ids = await page.locator('[id]').evaluateAll(items=>items.map(x=>x.id));
    assert.equal(new Set(ids).size,ids.length);
    assert.equal(await page.locator('.keyvisual').count(),1);
    assert.match(await page.title(),/TRIATHLON/);
    await page.locator('a[href="#map"]').first().click();
    await page.locator('#map').waitFor({state:'visible'});
    assert.equal(await page.locator('#map').isVisible(),true);
    await page.locator('[data-place="ruins"]').click();
    assert.match(await page.locator('#place-description').innerText(),/回路/);
    await page.locator('#tab-characters').click();
    await page.locator('[data-family="G"]').click();
    assert.equal(await page.locator('.class-profile:visible').count(),3);
    await page.locator('[data-family="all"]').click();
    assert.equal(await page.locator('.class-profile:visible').count(),9);
    for(const target of await page.locator('[role="tab"]').evaluateAll(items=>items.map(x=>x.getAttribute('aria-controls')))) assert(ids.includes(target));
    assert.equal(await page.locator('[role="tabpanel"]:visible').count(),1);
    for(const view of ['world','characters','systems','story','archive','overview']) {
      await page.locator('#tab-'+view).click();
      assert.equal(await page.locator('#panel-'+view).isVisible(),true);
      assert.equal(await page.locator('[role="tabpanel"]:visible').count(),1);
    }
    await page.locator('#tab-world').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-characters').getAttribute('aria-selected'),'true');
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href+'#g-skills');
    assert.equal(await page.locator('#panel-systems').isVisible(),true);
    assert.equal(await page.locator('#g-skills details').getAttribute('open'),'');
    for(const id of ['g-skills','b-schools','characters','art','story']) assert(await page.locator('#'+id).count());
    assert.match(await page.locator('#story').innerText(),/採用確認前/);
    assert.match(await page.locator('#characters').innerText(),/もっと落ち着いた/);
    assert.match(await page.locator('#b-schools').textContent(),/100p\^1〜4/);
    for(const width of [390,1280]) {
      await page.setViewportSize({width,height:900});
      await page.locator('#tab-overview').click();
      await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(__dirname,`page-${width}.png`)});
      await page.locator('#tab-systems').click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    await page.locator('#tab-characters').click();
    await page.locator('#characters').screenshot({path:path.join(__dirname,'characters.png')});
    console.log('Verified navigation targets, section status, character updates, school data and mobile/desktop layout.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
