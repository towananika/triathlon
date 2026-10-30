const {chromium} = require('playwright');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    for(const width of [390,1280]) {
      await page.setViewportSize({width,height:900});
      for(const [region,view] of [['korea','127,37,2500'],['malawi','34,-12,2500'],['plata','-58,-30,3000']]) {
        await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href+'#v='+view);
        await page.reload();
        await page.waitForTimeout(2200);
        if(await page.locator('.geography path').count()!==37) throw Error('Missing physical features');
        await page.locator('#b-layer').click();
        if(await page.locator('.net path.l').count()!==0) throw Error('Unexpected new transportation');
        if(await page.locator('.geography').evaluate(e=>getComputedStyle(e).display)==='none') throw Error('Missing geography');
        await page.locator('#ly-hydro').uncheck();
        if(await page.locator('.geography').evaluate(e=>getComputedStyle(e).display)!=='none') throw Error('Hydro toggle failed');
        await page.locator('#ly-hydro').check();
        await page.locator('#b-layer').click();
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
        await page.screenshot({path:path.join(require('node:os').tmpdir(),`tri-geography-${region}-${width}.png`)});
      }
      await page.locator('#q').fill('バイカル');
      await page.locator('#gres button').first().click();
      await page.waitForTimeout(1400);
      if(!(await page.locator('#card').innerText()).includes('バイカル')) throw Error('Geography search failed');
      for(const id of ['R','G','B']) {
        await page.locator('[data-region="'+id+'"]').click();
        await page.waitForTimeout(1400);
        if(await page.locator('#card').isVisible()) throw Error('Stale place card');
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Region navigation overflow');
      }
      await page.screenshot({path:path.join(require('node:os').tmpdir(),`tri-regions-${width}.png`)});
    }
    if(errors.length) throw Error(errors.join('\n'));
    console.log('PASS: 6 region/viewport views, hydro toggle, no new transport, search, no JS errors or overflow');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
