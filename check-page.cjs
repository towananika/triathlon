const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    const url = process.env.PAGE_URL || pathToFileURL(path.join(__dirname,'index.html')).href;
    await page.goto(url);
    const ids = await page.locator('[id]').evaluateAll(items=>items.map(x=>x.id));
    assert.equal(new Set(ids).size,ids.length);
    assert.equal(await page.locator('.keyvisual').count(),1);
    assert.match(await page.title(),/TRIATHLON/);
    assert.match(await page.locator('#theme').textContent(),/どう親しくなり/);
    assert.match(await page.locator('#world').textContent(),/独自の文明史/);
    assert.match(await page.locator('#world').textContent(),/ソウル/);
    assert.match(await page.locator('#world').textContent(),/生き残った者たち/);
    assert.match(await page.locator('#characters').textContent(),/BEM.*新入生首席/);
    assert.match(await page.locator('#characters').textContent(),/BM.*全国1位/);
    assert.match(await page.locator('#relationships').textContent(),/同意/);
    assert.match(await page.locator('#relationships').textContent(),/成人期/);
    assert.equal(await page.locator('#story-legacy').getAttribute('open'),null);
    assert.equal(await page.locator('a[download][href*="world_foundation_v0_11"]').count(),1);
    await page.locator('.explore').click();
    await page.locator('#world').waitFor({state:'visible'});
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
    await page.goto(url+'#g-skills');
    assert.equal(await page.locator('#panel-systems').isVisible(),true);
    assert.equal(await page.locator('#g-skills details').getAttribute('open'),'');
    for(const id of ['g-skills','b-schools','characters','art','story']) assert(await page.locator('#'+id).count());
    assert.match(await page.locator('#story').textContent(),/採用確認前/);
    assert.match(await page.locator('#characters').innerText(),/もっと落ち着いた/);
    assert.match(await page.locator('#b-schools').textContent(),/100p\^1〜4/);
    for(const width of [320,390,1280]) {
      await page.setViewportSize({width,height:900});
      await page.locator('#tab-overview').click();
      await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(__dirname,`page-${width}.png`)});
      await page.locator('#tab-systems').click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      for(const view of ['world','story']) {
        await page.locator('#tab-'+view).click();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        await page.screenshot({path:path.join(__dirname,`${view}-${width}.png`)});
      }
    }
    await page.locator('#tab-characters').click();
    await page.locator('.character-art').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.character-art').naturalWidth>0);
    await page.locator('#characters').screenshot({path:path.join(__dirname,'characters.png')});
    await page.goto(url+'#relationships');
    await page.locator('#relationships').waitFor({state:'visible'});
    await page.goto(url+'#society');
    await page.locator('#society').waitFor({state:'visible'});
    assert.deepEqual(errors,[]);
    console.log('Verified navigation targets, section status, character updates, school data and mobile/desktop layout.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
