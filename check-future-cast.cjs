const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=process.env.PAGE_URL||pathToFileURL(path.join(__dirname,'guide.html')).href;
    await page.goto(url+'#season3');await page.locator('#season3').waitFor({state:'visible'});
    assert.equal(await page.locator('#season3 .future-character').count(),6);
    assert.equal(await page.locator('#season4 .future-character').count(),2);
    assert.equal(await page.locator('.future-character[data-gender="女子"]').count(),4);
    assert.equal(await page.locator('.future-character[data-gender="男子"]').count(),4);
    assert.match(await page.locator('#season3').innerText(),/交渉上手/);
    assert.match(await page.locator('#season3').innerText(),/段取り上手/);
    await page.goto(url+'#season4');await page.locator('#season4').waitFor({state:'visible'});
    assert.match(await page.locator('#season4').innerText(),/慎重なのに冒険好き/);
    await page.goto(url+'#family-life');await page.locator('#family-life').waitFor({state:'visible'});
    assert.match(await page.locator('#family-life').innerText(),/成人後/);
    assert.match(await page.locator('#family-life').innerText(),/家族システムは未実装/);
    assert.match(await page.locator('#family-life').innerText(),/結婚しない/);
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      for(const id of ['season3','season4','family-life']){
        await page.goto(url+'#'+id);await page.locator('#'+id).waitFor({state:'visible'});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        await page.locator('#'+id).screenshot({path:path.join(__dirname,`${id}-${width}.png`)});
      }
    }
    assert.deepEqual(errors,[]);console.log('Future cast and family design passed: eight adopted profiles, gender counts, age/implementation status, deep links and responsive layouts.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
