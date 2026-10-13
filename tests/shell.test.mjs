import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRoute, viewNames } from '../assets/js/routing.mjs';
import { formatSnippet } from '../assets/js/shell-format.mjs';
for (const view of viewNames) test(`hash route ${view} is Pages-portable`, () => {
  assert.equal(parseRoute(`#${view}`).view, view);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes(`href="#${view}"`) && html.includes(`id="view-${view}"`));
});
test('legacy links and malformed fragments are preserved or fail safely', () => {
  assert.equal(parseRoute('#card-detached').legacy, 'card-detached');
  assert.equal(parseRoute('#fix/staged').item, 'staged');
  assert.equal(parseRoute('#%').view, 'home'); assert.equal(parseRoute('#%').malformed, true);
});
test('CMD comments convert without altering quoted message hashes', () => {
  assert.equal(formatSnippet('# inspect\ngit status # observe\ngit commit -m "Fix #123"', 'cmd'), 'REM inspect\ngit status\ngit commit -m "Fix #123"');
});
test('PowerShell 5.1 alternatives avoid && but preserve quoted message', () => {
  const result = formatSnippet('git switch topic && git status\ngit commit -m "a && b"', 'powershell');
  assert.ok(result.includes('preceding command succeeds')); assert.ok(!result.includes('topic &&'));
  assert.ok(result.includes('"a && b"'));
});
test('Bash literal command text is unchanged', () => {
  const source = '# inspect\ngit status && git diff'; assert.equal(formatSnippet(source, 'bash'), source);
});
