import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import knowledge from '../assets/js/knowledge.mjs';
import { matchesFilters } from '../assets/js/filter.mjs';
import { textElement } from '../assets/js/dom.mjs';
import { formatSnippet } from '../assets/js/shell-format.mjs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../assets/js/app.mjs', import.meta.url), 'utf8');
const knowledgeSource = readFileSync(new URL('../assets/js/knowledge.mjs', import.meta.url), 'utf8');
const section = (a, b) => a === 'const undoSolutions ='
  ? `const undoSolutions = ${JSON.stringify(knowledge.undoSolutions)};\n` + (b === 'function renderUndoSolution' ? '' : script.slice(script.indexOf('function renderUndoSolution'), script.indexOf(b)))
  : script.slice(script.indexOf(a), script.indexOf(b));
class Node {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; }
  set innerHTML(_) { throw new Error('Text renderer must not use innerHTML'); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener() {}
}
function flatten(node) { return [node, ...node.children.flatMap(flatten)]; }
for (const key of ['unstaged', 'staged', 'local-commit', 'pushed-commit', 'lost-reflog']) {
  test(`recovery ${key}: placeholders survive text-only rendering`, () => {
    const panel = new Node('div');
    const expected = vm.runInNewContext(section('const undoSolutions =', 'treeChoiceBtns.forEach') + `\nrenderUndoSolution('${key}'); undoSolutions['${key}'].code;`, {
      treeSolutionPanel: panel, document: { createElement: tag => new Node(tag) }, copySnippet() {}, textElement, formatSnippet, getShell: () => 'powershell'
    });
    assert.equal(flatten(panel).find(n => n.tag === 'code').textContent, expected);
    assert.ok(flatten(panel).some(n => n.className === 'callout warning'));
  });
}
test('hostile recipe text cannot become elements', () => {
  const panel = new Node('div'); const hostile = '<img src=x onerror=alert(1)>';
  vm.runInNewContext(section('const undoSolutions =', 'treeChoiceBtns.forEach') + `\nundoSolutions.unstaged.code = ${JSON.stringify(hostile)}; renderUndoSolution('unstaged');`, {
    treeSolutionPanel: panel, document: { createElement: tag => new Node(tag) }, copySnippet() {}, textElement, formatSnippet, getShell: () => 'powershell'
  });
  assert.equal(flatten(panel).find(n => n.tag === 'code').textContent, hostile);
  assert.ok(!flatten(panel).some(n => n.tag === 'img'));
});
test('current application compiles and retains all baseline card IDs', () => {
  assert.doesNotThrow(() => new vm.Script(script.replace(/^import .*;$/gm, '')));
  const baseline = readFileSync(new URL('fixtures/baseline-index.html', import.meta.url), 'utf8');
  for (const m of baseline.matchAll(/<article class="card[^>]*id="([^"]+)"/g)) assert.ok(html.includes(`id="${m[1]}"`));
});
for (const [category, risk, query, visible] of [
  ['all', 'all', 'push', true], ['cloud', 'data-loss-potential', 'push', true],
  ['essential', 'all', 'push', false], ['all', 'inspect', 'push', false],
  ['essential', 'inspect', 'push', false], ['cloud', 'data-loss-potential', 'unknown', false],
  ['all', 'inspect', '', false], ['cloud', 'data-loss-potential', '', true]
]) test(`filters compose: ${category}/${risk}/${query || 'empty'}`, () => {
  const card = {
    getAttribute: k => ({ 'data-category': 'cloud', 'data-effects': 'history-rewrite data-loss-potential remote-publish', 'data-keywords': 'push' })[k],
    querySelector: () => ({ textContent: 'Push' }), textContent: 'force push',
    classList: { contains: () => false }, style: {}
  };
  vm.runInNewContext(section('let activeFilter =', '// 4. View Switcher') + `\nactiveFilter=${JSON.stringify(category)}; activeRiskFilter=${JSON.stringify(risk)}; filterCards();`, {
    searchInput: { value: query }, htmlElem: { getAttribute: () => 'pro' },
    document: { body: { classList: { add() {}, remove() {} } } }, cards: [card],
    noResultsElem: { style: {} }, searchFeedbackElem: null, searchFeedbackTextElem: null, announceState() {}, matchesFilters
  });
  assert.equal(card.style.display, visible ? 'flex' : 'none');
});
test('recovery guidance distinguishes index, conflicts, retention and shared history', () => {
  const data = vm.runInNewContext(section('const undoSolutions =', 'function renderUndoSolution') + '\nundoSolutions;');
  assert.match(data.unstaged.effect, /index version/);
  assert.match(data['pushed-commit'].warning, /can conflict/);
  assert.match(data['pushed-commit'].warning, /revert --abort/);
  assert.ok(!data['pushed-commit'].code.includes('origin main'));
  assert.match(data['local-commit'].warning, /HEAD~1 requires a parent/);
  assert.match(data['lost-reflog'].warning, /discarded unstaged/);
  assert.ok(!knowledgeSource.includes('Safe (No Conflicts)'));
  assert.ok(!html.includes('with zero data loss'));
});
test('stash, branch and tag recipes have explicit prerequisites and substitution', () => {
  const stash = html.slice(html.indexOf('id="card-stash"'), html.indexOf('<!-- CARD 9'));
  assert.match(stash, /git switch &lt;original-branch&gt;/);
  assert.ok(stash.indexOf('original-branch') < stash.indexOf('git stash apply'));
  assert.match(stash, /applying it can conflict/);
  assert.match(html, /git tag --sort=version:refname -n 1/);
  assert.match(html, /git init -b &lt;initial-branch&gt;/);
  assert.ok(!html.includes('<code>bb</code> / Atlassian CLI'));
  assert.ok(!html.includes('git push origin main'));
});
test('workflow effects overlap and never classify mutation as inspect-only', () => {
  const allowed = ['inspect', 'local-change', 'history-rewrite', 'data-loss-potential', 'remote-publish'];
  const cards = [...html.matchAll(/<article class="card[^>]*id="([^"]+)"[^>]*data-effects="([^"]+)"/g)];
  assert.equal(cards.length, 17);
  for (const [, id, effects] of cards) {
    for (const flag of effects.split(' ')) assert.ok(allowed.includes(flag), id);
    assert.notEqual(effects, 'inspect', id);
  }
  assert.ok(cards.find(c => c[1] === 'card-force-lease')[2].includes('remote-publish'));
  assert.ok(!html.includes('Risk: Safe'));
});
