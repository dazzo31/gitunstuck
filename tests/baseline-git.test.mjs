import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function repo(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'gitunstuck-baseline-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env,
      GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(cwd, 'no-global-config'),
      GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true' } });
    if (r.error) throw r.error;
    return r;
  };
  const ok = (...args) => { const r = git(...args); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  ok('init', '-b', 'baseline'); ok('config', 'user.name', 'Baseline Test');
  ok('config', 'user.email', 'baseline@example.invalid');
  const file = join(cwd, 'file.txt');
  const commit = text => { writeFileSync(file, text); ok('add', '--', 'file.txt'); ok('commit', '-m', text.trim()); return ok('rev-parse', 'HEAD'); };
  return { cwd, git, ok, file, commit };
}
test('real Git: restore copies the INDEX; unstage preserves working file', t => {
  const r = repo(t); r.commit('committed\n');
  writeFileSync(r.file, 'staged\n'); r.ok('add', '--', 'file.txt');
  writeFileSync(r.file, 'unstaged\n'); r.ok('restore', '--', 'file.txt');
  assert.equal(readFileSync(r.file, 'utf8'), 'staged\n');
  r.ok('restore', '--staged', '--', 'file.txt');
  assert.equal(readFileSync(r.file, 'utf8'), 'staged\n');
  assert.equal(r.ok('show', ':file.txt'), 'committed');
});
test('real Git: revert can conflict after overlapping intervening changes', t => {
  const r = repo(t); r.commit('original\n'); const target = r.commit('change\n'); r.commit('intervening\n');
  const result = r.git('revert', '--no-edit', target);
  assert.notEqual(result.status, 0);
  assert.match(r.ok('status', '--porcelain'), /UU file.txt/);
  assert.equal(r.ok('rev-parse', 'REVERT_HEAD'), target);
  r.ok('revert', '--abort');
  assert.equal(readFileSync(r.file, 'utf8'), 'intervening\n');
});
test('real Git: stash is restored on the original branch explicitly', t => {
  const r = repo(t); r.commit('original\n'); r.ok('branch', 'hotfix');
  writeFileSync(r.file, 'work in progress\n'); r.ok('stash', 'push', '-u', '-m', 'baseline');
  r.ok('switch', 'hotfix'); assert.equal(readFileSync(r.file, 'utf8'), 'original\n');
  r.ok('switch', 'baseline'); r.ok('stash', 'apply');
  assert.equal(r.ok('branch', '--show-current'), 'baseline');
  assert.equal(readFileSync(r.file, 'utf8'), 'work in progress\n');
  assert.equal(r.ok('stash', 'list').split('\n').length, 1);
});
