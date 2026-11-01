const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { chromium } = require('playwright');

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dev/squad-rules.js', 'utf8'), context);
const outcome = context.TRI_SQUAD_RULES.outcome;
const units = () => [0, 1].map(side => ({ side, lead: true, hp: 10, down: false }));
let u = units();
assert.equal(outcome(u, 599, 600), null);
assert.equal(outcome(u, 600, 600).reason, 'timeout');
u[1].hp = 0;
assert.equal(outcome(u, 600, 600).winner, 0);
u[0].down = true;
assert.equal(outcome(u, 1, 600).reason, 'double-capture');
u = units(); u[0].hp = 0;
assert.equal(outcome(u, 1, 600).winner, 1);

const root = process.cwd();
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.join(root, url.pathname.replace(/^\/triathlon\//, ''));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
  let body = fs.readFileSync(file);
  // Expose the existing engine only in this local test response, never in the shipped page.
  if (file.endsWith(path.join('dev', 'squad.html'))) {
    body = body.toString().replace('sim=setup();sim.seen=0;draw(sim);sim=null;ordBtns();',
      'window.__squadTest={setup:setup,step:step,make:make,classes:CL};sim=setup();sim.seen=0;draw(sim);sim=null;ordBtns();');
  }
  res.end(body);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/triathlon/';
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
      await page.goto(base + 'dev/skillwin.html');
      await page.locator('#lang button[data-l="ja"]').click();
      await page.locator('.nd').filter({ hasText: 'HP' }).first().locator('button[data-a="1"]').click();
      assert.match(await page.locator('.sum').innerText(), /HP \+1/);
      await page.locator('.fight').click();
      assert.equal(await page.locator('#A').evaluate(el => el.f.s.HP), 11);
      await page.goto(base + 'dev/squad.html');
      assert.equal(await page.locator('#fast').isVisible(), false);
      assert.equal(await page.locator('#tA select').count(), 5);
      const report = await page.evaluate(() => {
        const test = window.__squadTest;
        const fighter = test.classes.findIndex(c => c.name === 'Fighter');
        const hp = test.make(fighter, true).s.HP;
        const endings = [];
        for (let i = 0; i < 30; i++) {
          const s = test.setup();
          for (let n = 0; n < 601 && s.end === null; n++) test.step(s);
          if (s.end === null || s.t > 600) throw Error('Battle failed to finish');
          endings.push(s.reason);
        }
        const timeout = test.setup();
        timeout.t = 599;
        timeout.U.forEach(u => { u.f.pow = 0; u.f.gap = Infinity; });
        test.step(timeout);
        const captured = test.setup();
        captured.U.find(u => u.side === 1 && u.lead).hp = 0;
        test.step(captured);
        return { hp, endings, timeout: timeout.end, timeoutReason: timeout.reason, captured: captured.end };
      });
      assert.equal(report.hp, 11);
      assert.equal(report.timeout, -1);
      assert.equal(report.timeoutReason, 'timeout');
      assert.equal(report.captured, 0);
      await page.locator('#go').click();
      await page.locator('#skip').click();
      assert(await page.locator('#over').isVisible());
      await page.locator('#again').click();
      assert.equal(await page.locator('#over').isVisible(), false);
      await page.locator('#skip').click();
      await page.locator('#advanced summary').click();
      await page.locator('#many').click();
      assert.match(await page.locator('#res').textContent(), /100回/);
      await page.locator('#advanced summary').click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'simple-squad-' + width + '.png'), fullPage: true });
      assert.deepEqual(errors, []);
      console.log('PASS ' + width + 'px: skill +1, capture/draw, 30 bounded battles, start/skip/retry, 100-run test, no overflow');
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
