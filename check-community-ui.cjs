// 設定資料は管理者だけのページなので、テストでは管理者として開く
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({reducedMotion:'reduce'}); await page.addInitScript(()=>{try{localStorage.setItem('tri-admin','x')}catch(e){}});let errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=process.env.PAGE_URL||pathToFileURL(path.join(__dirname,'guide.html')).href;
    await page.goto(url+'#simulation');
    await page.locator('[data-days="3650"]').click();
    assert.equal(await page.locator('#sim-day').innerText(),'3650');
    assert.equal(await page.locator('.sim-project[data-status="completed"]').count(),3);
    assert.equal(await page.locator('.sim-project[data-status="blocked"]').count(),2);
    assert.match(await page.locator('#sim-community-summary').innerText(),/完成 3/);
    await page.locator('#sim-comparison>summary').click();
    assert.match(await page.locator('#sim-comparison').innerText(),/54.3/);
    assert.match(await page.locator('#sim-comparison').innerText(),/91.6/);
    await page.locator('#simulation>details').filter({has:page.locator('#sim-conditions')}).locator('summary').click();
    assert.equal(await page.locator('input[data-city="G"][data-metric="comfort"]').inputValue(),'96');
    await page.reload();
    assert.equal(await page.locator('#sim-day').innerText(),'3650');
    assert.equal(await page.locator('.sim-project[data-status="completed"]').count(),3);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.locator('#sim-community').screenshot({path:path.join(__dirname,`community-${width}.png`)});
    }
    assert.deepEqual(errors,[]);
    console.log('Community UI passed: ten-year run, completed and blocked projects, comparison, updated conditions, save/reload and responsive layouts.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
