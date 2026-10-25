const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=process.env.PAGE_URL||pathToFileURL(path.join(__dirname,'index.html')).href;
    await page.goto(url+'#simulation');
    await page.locator('#simulation').waitFor({state:'visible'});
    await page.evaluate(()=>localStorage.setItem('triathlon-world-draft-v1','{"sentinel":true}'));
    assert.equal(await page.locator('#sim-day').innerText(),'30');
    assert.equal(await page.locator('.sim-person').count(),6);
    await page.locator('[data-days="7"]').click();
    assert.equal(await page.locator('#sim-day').innerText(),'37');
    await page.reload();
    assert.equal(await page.locator('#sim-day').innerText(),'37');
    await page.locator('#sim-auto').check();
    await page.waitForFunction(()=>Number(document.querySelector('#sim-day').textContent)>37);
    await page.locator('#tab-overview').click();
    await page.waitForFunction(()=>!document.querySelector('#sim-auto').checked);
    const paused=await page.locator('#sim-day').innerText();
    await page.waitForTimeout(1500);assert.equal(await page.locator('#sim-day').innerText(),paused);
    await page.goto(url+'#simulation');
    await page.locator('#simulation>details').filter({has:page.locator('#sim-conditions')}).locator('summary').click();
    await page.locator('input[data-city="R"][data-metric="challenge"]').fill('0');
    await page.locator('input[data-city="R"][data-metric="challenge"]').dispatchEvent('change');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('triathlon-residence-sim-v1')).conditions.R.challenge),0);
    page.once('dialog',d=>d.dismiss());await page.locator('#sim-reset').click();
    assert.notEqual(await page.locator('#sim-day').innerText(),'0');
    page.once('dialog',d=>d.accept());await page.locator('#sim-reset').click();
    assert.equal(await page.locator('#sim-day').innerText(),'0');
    assert.equal(await page.evaluate(()=>localStorage.getItem('triathlon-world-draft-v1')),'{"sentinel":true}');
    await page.locator('[data-days="30"]').click();
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.locator('#simulation').screenshot({path:path.join(__dirname,`residence-${width}.png`)});
    }
    await page.evaluate(()=>localStorage.setItem('triathlon-residence-sim-v1','{broken'));
    await page.reload();assert.equal(await page.locator('#sim-day').innerText(),'30');
    await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
    await page.locator('[data-days="1"]').click();
    assert.match(await page.locator('#sim-storage').innerText(),/保存できません/);
    assert.deepEqual(errors,[]);
    console.log('Residence UI passed: 30-day example, time controls, save/reload, auto pause, conditions, reset, corrupted save and responsive layouts.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
