import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
test('public build removes stale files and excludes development material', () => {
  mkdirSync('dist', { recursive: true }); writeFileSync('dist/stale-client.js', 'outdated');
  const result = spawnSync(process.execPath, ['scripts/build.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync('dist/index.html') && existsSync('dist/assets/js/shell.mjs'));
  assert.ok(!existsSync('dist/stale-client.js'));
  for (const path of ['tests', 'docs', 'package-lock.json', 'GITUNSTUCK_PHASED_IMPLEMENTATION_PLAN.md']) assert.ok(!existsSync(`dist/${path}`), path);
});
