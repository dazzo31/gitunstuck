import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseStatus } from '../assets/js/status.mjs';
import { buildRecoveryPlan } from '../assets/js/recovery.mjs';

function repo(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'gitunstuck-baseline-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => {
    const inherited = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...inherited,
      GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(cwd, 'no-global-config'),
      GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true' } });
    if (r.error) throw r.error;
    return r;
  };
  const ok = (...args) => { const r = git(...args); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  ok('init', '-b', 'baseline'); ok('config', 'user.name', 'Baseline Test');
  ok('config', 'user.email', 'baseline@example.invalid');
  ok('config', 'core.hooksPath', join(cwd, 'no-hooks'));
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
for (const mode of ['soft', 'mixed', 'hard']) test(`real Git: reset --${mode} has distinct ref/index/tree effects`, t => {
  const r = repo(t); const base = r.commit('base\n'); r.commit('tip\n');
  writeFileSync(r.file, 'index\n'); r.ok('add', '--', 'file.txt'); writeFileSync(r.file, 'working\n');
  r.ok('reset', `--${mode}`, base);
  assert.equal(r.ok('rev-parse', 'HEAD'), base);
  assert.equal(r.ok('show', ':file.txt'), mode === 'soft' ? 'index' : 'base');
  assert.equal(readFileSync(r.file, 'utf8'), mode === 'hard' ? 'base\n' : 'working\n');
});
test('real Git: amend changes commit identity and keeps intended tree', t => {
  const r = repo(t); const old = r.commit('base\n'); writeFileSync(r.file, 'amended\n'); r.ok('add', '--', 'file.txt');
  r.ok('commit', '--amend', '-m', 'amended');
  assert.notEqual(r.ok('rev-parse', 'HEAD'), old);
  assert.equal(r.ok('show', 'HEAD:file.txt'), 'amended');
});
test('real Git: successful revert records an inverse without rewriting parents', t => {
  const r = repo(t); const base = r.commit('base\n'); const target = r.commit('tip\n');
  r.ok('revert', '--no-edit', target);
  assert.equal(r.ok('rev-parse', 'HEAD^'), target);
  assert.equal(r.ok('show', 'HEAD:file.txt'), r.ok('show', `${base}:file.txt`));
});
test('real Git: detached committed work can be rescued without switching', t => {
  const r = repo(t); const base = r.commit('base\n'); r.ok('switch', '--detach', base); const saved = r.commit('detached\n');
  r.ok('branch', 'rescue', saved); assert.equal(r.ok('rev-parse', 'rescue'), saved);
  assert.equal(r.git('symbolic-ref', '--quiet', '--short', 'HEAD').status, 1);
});
test('real Git: reflog identifies retained committed work after moving a ref', t => {
  const r = repo(t); const base = r.commit('base\n'); const saved = r.commit('saved\n');
  r.ok('reset', '--soft', base); assert.ok(r.ok('reflog', '--format=%H').includes(saved));
  r.ok('branch', 'rescue', saved); assert.equal(r.ok('show', 'rescue:file.txt'), 'saved');
});
for (const operation of ['merge', 'rebase', 'cherry-pick']) test(`real Git: ${operation} conflict has its own continuation and abort state`, t => {
  const r = repo(t); r.commit('base\n'); r.ok('switch', '-c', 'topic'); const topic = r.commit('topic\n');
  r.ok('switch', 'baseline'); const before = r.commit('target\n');
  const result = operation === 'merge' ? r.git('merge', 'topic') : operation === 'rebase' ? r.git('rebase', 'topic') : r.git('cherry-pick', topic);
  assert.notEqual(result.status, 0); assert.match(r.ok('status', '--porcelain'), /UU file.txt/);
  r.ok(operation, '--abort'); assert.equal(r.ok('rev-parse', 'HEAD'), before);
  assert.equal(readFileSync(r.file, 'utf8'), 'target\n');
});
test('real Git: divergent push rejected using disposable bare remote', t => {
  const r = repo(t); r.commit('base\n'); const remote = join(r.cwd, 'remote.git'); r.ok('init', '--bare', remote);
  r.ok('remote', 'add', 'sandbox', remote); r.ok('push', '-u', 'sandbox', 'baseline');
  const shared = r.ok('rev-parse', 'HEAD'); r.ok('switch', '-c', 'other'); r.commit('remote\n');
  r.ok('push', 'sandbox', 'HEAD:baseline'); r.ok('switch', 'baseline'); r.commit('local\n');
  assert.notEqual(r.git('push', 'sandbox', 'baseline').status, 0);
  r.ok('fetch', 'sandbox'); assert.equal(r.ok('rev-list', '--left-right', '--count', 'HEAD...sandbox/baseline'), '1\t1');
  assert.equal(r.ok('merge-base', 'HEAD', 'sandbox/baseline'), shared);
});
test('real Git: unborn HEAD cannot be assumed to support restore --staged', t => {
  const r = repo(t); writeFileSync(r.file, 'new\n'); r.ok('add', '--', 'file.txt');
  assert.notEqual(r.git('restore', '--staged', '--', 'file.txt').status, 0);
  assert.match(r.ok('status', '--porcelain=v2', '--branch'), /# branch.oid \(initial\)/);
});
test('status parser agrees with real Git for unborn, mixed, rename and detached states', t => {
  const r = repo(t); let parsed = parseStatus(r.ok('status', '--porcelain=v2', '--branch'));
  assert.equal(parsed.branchKind, 'unborn'); assert.equal(parsed.hasCommit, false);
  r.commit('base\n'); writeFileSync(r.file, 'staged\n'); r.ok('add', '--', 'file.txt'); writeFileSync(r.file, 'working\n');
  parsed = parseStatus(r.ok('status', '--porcelain=v2', '--branch'));
  assert.equal(parsed.staged, 1); assert.equal(parsed.unstaged, 1); assert.equal(parsed.unknownLineCount, 0);
  r.ok('restore', '--', 'file.txt'); r.ok('commit', '-m', 'staged'); r.ok('mv', 'file.txt', 'new name.txt');
  parsed = parseStatus(r.ok('status', '--porcelain=v2', '--branch'));
  assert.equal(parsed.changes[0].kind, 'rename-or-copy'); assert.equal(parsed.changes[0].originalPath, 'file.txt');
  assert.equal(parsed.unknownLineCount, 0); r.ok('commit', '-m', 'rename'); r.ok('switch', '--detach', 'HEAD');
  parsed = parseStatus(r.ok('status', '--porcelain=v2', '--branch'));
  assert.equal(parsed.branchKind, 'detached'); assert.equal(parsed.hasCommit, true);
});
const confirmations = { freshComplete: true, versionChecked: true, workPreserved: true, targetVerified: true, operation: 'none', sharing: 'unshared', historyRewriteAcknowledged: true, ordinaryCommit: true, upstreamReviewed: true, retainedCommit: true, lossAcknowledged: true, resolutionReviewed: true };
function enginePlan(r, intent, extra = {}) {
  const state = parseStatus(r.ok('status', '--porcelain=v2', '--branch'));
  const plan = buildRecoveryPlan(intent, state, { ...confirmations, ...extra });
  assert.equal(plan.ready, true, plan.blockers.join('; ')); return plan;
}
function args(plan, replacements = {}) { return plan.actions[0].syntax.split(' ').slice(1).map(value => replacements[value] || value); }
test('engine journey: unstage preserves the working file', t => {
  const r = repo(t); r.commit('base\n'); writeFileSync(r.file, 'working\n'); r.ok('add', '--', 'file.txt');
  r.ok(...args(enginePlan(r, 'unstage'), { '<filename>': 'file.txt' }));
  assert.equal(r.ok('show', ':file.txt'), 'base'); assert.equal(readFileSync(r.file, 'utf8'), 'working\n');
});
test('engine journey: discard returns working file to index, not HEAD', t => {
  const r = repo(t); r.commit('base\n'); writeFileSync(r.file, 'index\n'); r.ok('add', '--', 'file.txt'); writeFileSync(r.file, 'unstaged\n');
  r.ok(...args(enginePlan(r, 'discard'), { '<filename>': 'file.txt' }));
  assert.equal(readFileSync(r.file, 'utf8'), 'index\n'); assert.equal(r.ok('show', 'HEAD:file.txt'), 'base');
});
test('engine journey: amend updates an unshared commit tree', t => {
  const r = repo(t); const before = r.commit('base\n'); writeFileSync(r.file, 'amended\n'); r.ok('add', '--', 'file.txt');
  r.ok(...args(enginePlan(r, 'amend')));
  assert.notEqual(r.ok('rev-parse', 'HEAD'), before); assert.equal(r.ok('show', 'HEAD:file.txt'), 'amended'); assert.equal(r.ok('rev-list', '--count', 'HEAD'), '1');
});
test('engine journey: ordinary shared-commit revert preserves history', t => {
  const r = repo(t); r.commit('base\n'); const target = r.commit('bad\n');
  r.ok(...args(enginePlan(r, 'revert'), { '<commit-id>': target }));
  assert.equal(r.ok('rev-parse', 'HEAD^'), target); assert.equal(readFileSync(r.file, 'utf8'), 'base\n');
});
test('engine journey: divergence integrates inspected local bare upstream', t => {
  const r = repo(t); r.commit('base\n'); writeFileSync(join(r.cwd, '.git/info/exclude'), 'remote.git/\n');
  const remote = join(r.cwd, 'remote.git'); r.ok('init', '--bare', remote); r.ok('remote', 'add', 'sandbox', remote); r.ok('push', '-u', 'sandbox', 'baseline');
  r.ok('switch', '-c', 'other'); writeFileSync(join(r.cwd, 'remote.txt'), 'remote\n'); r.ok('add', '--', 'remote.txt'); r.ok('commit', '-m', 'remote'); r.ok('push', 'sandbox', 'HEAD:baseline');
  r.ok('switch', 'baseline'); r.commit('local\n'); r.ok('fetch', 'sandbox');
  r.ok(...args(enginePlan(r, 'divergence'), { '<verified-upstream-ref>': 'sandbox/baseline' }));
  assert.equal(readFileSync(r.file, 'utf8'), 'local\n'); assert.equal(readFileSync(join(r.cwd, 'remote.txt'), 'utf8'), 'remote\n');
  assert.equal(r.ok('rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length, 3);
});
test('engine journey: identified merge stages review then continues with fresh state', t => {
  const r = repo(t); r.commit('base\n'); r.ok('switch', '-c', 'topic'); r.commit('topic\n'); r.ok('switch', 'baseline'); r.commit('target\n'); assert.notEqual(r.git('merge', 'topic').status, 0);
  writeFileSync(r.file, 'reviewed result\n'); const before = enginePlan(r, 'merge', { operation: 'merge' }); assert.equal(before.actions[0].id, 'stage-resolved');
  r.ok(...args(before, { '<resolved-file>': 'file.txt' })); const after = enginePlan(r, 'merge', { operation: 'merge' }); assert.equal(after.actions[0].id, 'merge-continue'); r.ok(...args(after));
  assert.equal(readFileSync(r.file, 'utf8'), 'reviewed result\n'); assert.equal(r.ok('rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length, 3);
});
test('engine journey: detached rescue creates ref without switching files', t => {
  const r = repo(t); const base = r.commit('base\n'); r.ok('switch', '--detach', base); const target = r.commit('detached\n');
  r.ok(...args(enginePlan(r, 'detached'), { '<unused-rescue-name>': 'engine-rescue', '<verified-head-commit-id>': target }));
  assert.equal(r.ok('rev-parse', 'engine-rescue'), target); assert.equal(r.git('symbolic-ref', '--quiet', 'HEAD').status, 1); assert.equal(readFileSync(r.file, 'utf8'), 'detached\n');
});
test('engine journey: reflog rescue retains committed tree without altering work', t => {
  const r = repo(t); const base = r.commit('base\n'); const target = r.commit('saved\n'); r.ok('reset', '--soft', base);
  r.ok(...args(enginePlan(r, 'reflog'), { '<unused-rescue-name>': 'engine-rescue', '<retained-commit-id>': target }));
  assert.equal(r.ok('show', 'engine-rescue:file.txt'), 'saved'); assert.equal(readFileSync(r.file, 'utf8'), 'saved\n'); assert.equal(r.ok('rev-parse', 'HEAD'), base);
});
test('engine failure path: revert conflict blocks repeat and abort restores state', t => {
  const r = repo(t); r.commit('base\n'); const target = r.commit('bad\n'); const before = r.commit('intervening\n');
  const plan = enginePlan(r, 'revert'); assert.notEqual(r.git(...args(plan, { '<commit-id>': target })).status, 0);
  const blocked = buildRecoveryPlan('revert', parseStatus(r.ok('status', '--porcelain=v2', '--branch')), { ...confirmations, operation: 'revert' });
  assert.equal(blocked.ready, false); assert.deepEqual(blocked.actions, []); assert.ok(plan.fallback.includes('git revert --abort'));
  r.ok('revert', '--abort'); assert.equal(r.ok('rev-parse', 'HEAD'), before); assert.equal(readFileSync(r.file, 'utf8'), 'intervening\n');
});
