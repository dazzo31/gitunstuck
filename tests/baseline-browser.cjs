// CI-only browser baseline. This does not launch an unsupported local preview.
if (!process.env.CI) throw new Error('Run baseline browser checks in GitHub Actions.');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const { readFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const root = resolve(__dirname, '..');
  const server = createServer((req, res) => {
    const paths = { '/gitunstuck/': ['index.html', 'text/html'], '/gitunstuck/favicon.svg': ['favicon.svg', 'image/svg+xml'] };
    const asset = paths[new URL(req.url, 'http://localhost').pathname];
    if (!asset) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', asset[1]); res.end(readFileSync(resolve(root, asset[0])));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch();
    let passed = 0;
    for (const width of [1440, 390]) for (const theme of ['dark', 'light']) for (const mode of ['beginner', 'pro']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/gitunstuck/`);
      await page.locator(`[data-mode="${mode}"]`).click();
      assert.equal(await page.locator('html').getAttribute('data-view'), mode);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      await page.locator('[data-location="unstaged"]').click();
      const restore = await page.locator('#treeSolutionPanel code').textContent();
      assert.ok(restore.includes('git restore '));
      assert.ok(!restore.includes('<filename>'), 'Original placeholder defect reproduced');
      await page.locator('.graph-tab-btn[data-scenario="merge"]').click();
      assert.equal(await page.locator('#graphSvgContainer svg').count(), 1);
      await page.locator('.pipeline-tab-btn[data-provider="gitlab"]').click();
      assert.match(await page.locator('#pipelineSnippetCode').textContent(), /stages:/);
      await page.keyboard.press('Escape'); await page.keyboard.press('/');
      assert.equal(await page.locator('#searchInput').evaluate(e => e === document.activeElement), true);
      assert.deepEqual(errors, []);
      const observation = await page.evaluate(() => ({
        viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
        visibleCards: [...document.querySelectorAll('.card')].filter(e => getComputedStyle(e).display !== 'none').length,
        theme: document.documentElement.dataset.theme, mode: document.documentElement.dataset.view
      }));
      console.log('BASELINE_OBSERVATION', JSON.stringify(observation)); passed++;
      await context.close();
    }
    console.log(`BASELINE_BROWSER: ${passed} passed, 0 failed; Chromium desktop/mobile x light/dark x beginner/pro.`);
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
