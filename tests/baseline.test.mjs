import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

// These checks document the ORIGINAL baseline; they are not release regression tests.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function slice(from, to) { return script.slice(script.indexOf(from), script.indexOf(to)); }
test('application JavaScript compiles without executing the page', () => {
  assert.doesNotThrow(() => new vm.Script(script));
});
test('17 command card IDs are unique and all task links resolve', () => {
  const ids = [...html.slice(0, html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal([...html.matchAll(/<article class="card\b/g)].length, 17);
  for (const m of html.matchAll(/data-target="([^"]+)"/g)) assert.ok(ids.includes(m[1]), m[1]);
});
test('baseline exposes both explanation modes, theme and print hooks', () => {
  for (const s of ['data-mode="beginner"', 'data-mode="pro"', 'id="themeToggle"', '@media print', 'prefers-reduced-motion']) assert.ok(html.includes(s), s);
});
test('baseline has five recovery choices, five graph scenarios, three CI providers', () => {
  const recovery = vm.runInNewContext(slice('const undoSolutions =', 'function renderUndoSolution') + '\nundoSolutions;');
  const graph = vm.runInNewContext(slice('const graphScenarios =', 'function renderGraphScenario') + '\ngraphScenarios;');
  const ci = vm.runInNewContext(slice('const pipelineConfigs =', 'const pipelineTabBtns') + '\npipelineConfigs;');
  assert.equal(Object.keys(recovery).length, 5);
  assert.equal(Object.keys(graph).length, 5);
  assert.deepEqual(Object.keys(ci), ['github', 'gitlab', 'bitbucket']);
});
test('CONFIRMED: recovery renderer inserts a literal placeholder as HTML markup', () => {
  const panel = {};
  vm.runInNewContext(slice('const undoSolutions =', 'treeChoiceBtns.forEach') + "\nrenderUndoSolution('unstaged');", { treeSolutionPanel: panel });
  assert.ok(panel.innerHTML.includes('git restore <filename>'));
  assert.ok(!panel.innerHTML.includes('git restore &lt;filename&gt;'));
});
test('CONFIRMED: nonempty search bypasses category AND risk filters', () => {
  const card = {
    getAttribute: k => ({ 'data-category': 'cloud', 'data-risk': 'destructive', 'data-keywords': 'push' })[k],
    querySelector: () => ({ textContent: 'Push' }), textContent: 'force push',
    classList: { contains: () => false }, style: {}
  };
  vm.runInNewContext(slice('let activeFilter =', '// 4. View Switcher') + "\nactiveFilter='essential'; activeRiskFilter='safe'; filterCards();", {
    searchInput: { value: 'push' }, htmlElem: { getAttribute: () => 'pro' },
    document: { body: { classList: { add() {}, remove() {} } } }, cards: [card],
    noResultsElem: { style: {} }, searchFeedbackElem: null, searchFeedbackTextElem: null, announceState() {}
  });
  assert.equal(card.style.display, 'flex');
});
test('CONFIRMED: shared-commit recovery promises no conflicts and fixed origin/main', () => {
  const data = vm.runInNewContext(slice('const undoSolutions =', 'function renderUndoSolution') + '\nundoSolutions;');
  assert.match(data['pushed-commit'].riskBadge, /No Conflicts/);
  assert.match(data['pushed-commit'].warning, /without causing merge conflicts/);
  assert.match(data['pushed-commit'].code, /git push origin main/);
});
test('CONFIRMED: stash recipe applies after hotfix without switching back', () => {
  const card = html.slice(html.indexOf('id="card-stash"'), html.indexOf('<!-- CARD 9'));
  assert.match(card, /git switch hotfix/);
  assert.match(card, /git stash pop/);
  assert.equal([...card.matchAll(/git switch /g)].length, 1);
});
test('CONFIRMED: restore explanation incorrectly says committed version', () => {
  assert.ok(html.includes('<code>restore</code> copies the committed version over disk.'));
});
test('CONFIRMED: README branding and asset metadata are stale', () => {
  assert.match(readme, /^# GitSimple/);
  assert.match(html, /og-preview\.png/);
  assert.throws(() => readFileSync(new URL('../og-preview.png', import.meta.url)));
});
test('CONFIRMED: version-sort wording does not match tag command', () => {
  assert.match(html, /List all tags sorted by version:\ngit tag -l -n 1/);
});
test('CONFIRMED: deployment has no test gate and ships repository root', () => {
  assert.ok(!workflow.includes('npm test'));
  assert.ok(!workflow.includes('needs:'));
  assert.match(workflow, /path: '\.'/);
});
