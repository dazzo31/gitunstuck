// CI-only browser baseline. This does not launch an unsupported local preview.
if (!process.env.CI) throw new Error('Run baseline browser checks in GitHub Actions.');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const { readFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const axe = require('axe-core');

(async () => {
  const root = resolve(__dirname, '..');
  const server = createServer((req, res) => {
    const paths = { '/gitunstuck/': [process.env.BASELINE_FIXTURE ? 'tests/fixtures/baseline-index.html' : 'dist/index.html', 'text/html'], '/gitunstuck/favicon.svg': ['dist/favicon.svg', 'image/svg+xml'] };
    const pathname = new URL(req.url, 'http://localhost').pathname;
    let asset = paths[pathname];
    if (!asset && /^\/gitunstuck\/assets\/[a-zA-Z0-9_./-]+\.(css|js|mjs|json)$/.test(pathname) && !pathname.includes('..')) {
      asset = ['dist/' + pathname.slice('/gitunstuck/'.length), pathname.endsWith('.css') ? 'text/css' : pathname.endsWith('.json') ? 'application/json' : 'text/javascript'];
    }
    if (!asset) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', asset[1]); res.end(readFileSync(resolve(root, asset[0])));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch();
    let passed = 0; const accessibilityFailures = [];
    for (const width of [1440, 390]) for (const theme of ['dark', 'light']) for (const mode of ['beginner', 'pro']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copiedSnippet = text; } } });
      });
      const page = await context.newPage(); const errors = [];
      const navigate = async route => {
        const link = page.locator(`#v2NavLinks a[href="#${route}"]`);
        if (!(await link.isVisible())) await page.locator('#mobileNavToggle').click();
        await link.click(); await page.locator(`#view-${route}`).waitFor({ state: 'visible' });
      };
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/gitunstuck/`);
      await page.locator(`[data-mode="${mode}"]`).click();
      assert.equal(await page.locator('html').getAttribute('data-view'), mode);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      if (!process.env.BASELINE_FIXTURE) await navigate('reference');
      await page.locator('[data-location="unstaged"]').click();
      const restore = await page.locator('#treeSolutionPanel code').textContent();
      assert.ok(restore.includes('git restore '));
      if (process.env.BASELINE_FIXTURE) assert.ok(!restore.includes('<filename>'), 'Original placeholder defect reproduced');
      else {
        assert.ok(restore.includes('<filename>'), 'Corrected placeholder rendered literally');
        await navigate('reference');
        await page.locator('[data-mode="pro"]').click();
        await page.locator('[data-risk-filter="inspect"]').click();
        await page.locator('#searchInput').fill('force');
        assert.equal(await page.locator('.card:visible').count(), 0, 'Search cannot override effect');
        await page.locator('[data-risk-filter="all"]').click();
        await page.locator('[data-filter="essential"]').click();
        assert.equal(await page.locator('.card:visible').count(), 0, 'Search cannot override category');
        await page.locator('#resetFiltersBtn').click();
        await page.locator(`[data-mode="${mode}"]`).click();
        assert.equal(await page.locator('.card:visible').count(), 17, 'Both modes expose the same workflows');
        await navigate('reference');
        await page.evaluate(() => { window.GitUnstuckKnowledge.undoSolutions.unstaged.code = '<img src=x onerror=alert(1)>'; window.GitUnstuck.renderUndoSolution('unstaged'); });
        assert.equal(await page.locator('#treeSolutionPanel img').count(), 0);
        assert.equal(await page.locator('#treeSolutionPanel code').textContent(), '<img src=x onerror=alert(1)>');
        await page.locator('[data-location="staged"]').click();
        const expectedCopy = await page.locator('#treeSolutionPanel code').textContent();
        await page.locator('#treeSolutionPanel .copy-btn').click();
        assert.equal(await page.evaluate(() => window.copiedSnippet), expectedCopy.trim());
        await page.locator('#themeToggle').click();
        await page.reload();
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme === 'dark' ? 'light' : 'dark');
        await page.locator('#themeToggle').click();
        await page.locator(`[data-mode="${mode}"]`).click();
        await page.addScriptTag({ content: axe.source });
        for (const route of ['fix', 'workflows', 'reference', 'playground', 'learn']) {
          await navigate(route);
          if (route === 'fix') {
            await page.locator('#errorInput').fill('error: could not apply abc1234... change <img onerror=alert(1)>');
            await page.locator('#diagnoseError').click();
            assert.match(await page.locator('#errorResults').textContent(), /Diagnosis: ambiguous/);
            assert.equal(await page.locator('#errorResults img').count(), 0);
            assert.equal(await page.locator('#errorResults a[href^="#fix/"]').count(), 0);
            assert.equal(await page.evaluate(() => Object.values(localStorage).some(value => value.includes('could not apply'))), false);
            await page.locator('#errorInput').fill('fatal: not a git repository');
            assert.equal(await page.locator('#errorResults').isVisible(), false);
            await page.locator('#diagnoseError').click();
            assert.match(await page.locator('#errorResults').textContent(), /Do not run git init/);
            await page.locator('#clearError').click();
            assert.equal(await page.locator('#errorInput').inputValue(), '');
            await page.locator('#errorInput').fill('fatal: not a git repository');
            await page.locator('#diagnoseError').click();
            await page.locator('#errorResults').getByRole('button', { name: 'None of these match', exact: true }).click();
            assert.equal(await page.locator('#statusInput').evaluate(e => e === document.activeElement), true);
            await page.locator('#clearError').click();
            const H = 'a'.repeat(40);
            await page.locator('#statusInput').fill('# branch.oid ' + H + '\n# branch.head topic\n? <img src=x onerror=alert(1)>');
            await page.locator('#interpretStatus').click();
            await page.locator('#statusResults').waitFor({ state: 'visible' });
            assert.match(await page.locator('#statusResults').textContent(), /Freshness.*unknown/s);
            assert.equal(await page.locator('#statusResults img').count(), 0);
            assert.equal(await page.evaluate(() => window.GitUnstuck.getDiagnosticState().untracked), 1);
            assert.equal(await page.evaluate(() => Object.values(localStorage).some(value => value.includes('onerror'))), false);
            await page.locator('#clearStatus').click();
            assert.equal(await page.locator('#statusInput').inputValue(), '');
            assert.equal(await page.evaluate(() => window.GitUnstuck.getDiagnosticState()), null);
            await page.locator('#statusInput').fill('# branch.oid ' + H + '\n# branch.head topic\n1 M. N... 100644 100644 100644 ' + H + ' ' + H + ' file.txt');
            await page.locator('#interpretStatus').click();
            await page.locator('#recoveryIntent').selectOption('unstage');
            const recovery = page.locator('#recoveryPlan');
            for (let n = 0; n < 2; n++) await recovery.getByRole('button', { name: 'Next', exact: true }).click();
            assert.equal(await recovery.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
            for (const id of ['recoveryFresh', 'recoveryVersion', 'recoveryPreserved', 'recoveryTarget']) await page.locator('#' + id).check();
            await page.locator('#recoveryOperation').selectOption('none');
            await recovery.getByRole('button', { name: 'Next', exact: true }).click();
            assert.match(await recovery.textContent(), /git restore --staged -- <filename>/);
            assert.equal(await recovery.locator('.copy-btn').count(), 0, 'Parameterized mutation is not blindly copied');
            await recovery.getByRole('button', { name: 'Copy flow link', exact: true }).click();
            const flowLink = await page.evaluate(() => window.copiedSnippet);
            assert.ok(flowLink.endsWith('#fix/unstage') && !flowLink.includes(H) && !flowLink.includes('file.txt'));
            await recovery.getByRole('button', { name: 'I got a different result', exact: true }).click();
            assert.equal(await page.evaluate(() => window.GitUnstuck.getDiagnosticState()), null);
            assert.match(await recovery.textContent(), /Step 1 of 6/);
          }
          if (route === 'workflows') {
            await page.locator('#workflowChoices a[href="#workflows/card-branch"]').click();
            await page.locator('#workflowStepper').waitFor({ state: 'visible' });
            for (let n = 0; n < 3; n++) await page.locator('#workflowStepper').getByRole('button', { name: 'Next', exact: true }).click();
            assert.match(await page.locator('#workflowStepper').textContent(), /Step 4 of 4/);
            await page.locator('#workflowStepper').getByRole('button', { name: 'I got a different result', exact: true }).click();
            assert.match(await page.locator('#workflowStepper').textContent(), /Step 1 of 4/);
          }
          const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
          console.log('ACCESSIBILITY_OBSERVATION', JSON.stringify({ width, theme, mode, route, violations }));
          accessibilityFailures.push(...violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => ({ width, theme, mode, route, ...v })));
        }
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.topbar').evaluate(e => getComputedStyle(e).display), 'none');
        await page.emulateMedia({ media: 'screen' });
      }
      if (!process.env.BASELINE_FIXTURE) await navigate('playground');
      await page.locator('.graph-tab-btn[data-scenario="merge"]').click();
      assert.equal(await page.locator('#graphSvgContainer svg').count(), 1);
      if (!process.env.BASELINE_FIXTURE) await navigate('reference');
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
    assert.deepEqual(accessibilityFailures, [], 'Serious/critical accessibility gate across all eight contexts');
    console.log(`${process.env.BASELINE_FIXTURE ? 'BASELINE' : 'FOUNDATION'}_BROWSER: ${passed} passed, 0 failed; Chromium desktop/mobile x light/dark x beginner/pro.`);
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
