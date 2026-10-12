import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStatus } from '../assets/js/status.mjs';
import { recoveryFlows, recoveryCommands, buildRecoveryPlan } from '../assets/js/recovery.mjs';
const H = 'a'.repeat(40);
const base = () => parseStatus(`# branch.oid ${H}\n# branch.head topic`);
const confirmed = { freshComplete: true, versionChecked: true, workPreserved: true, targetVerified: true, operation: 'none', sharing: 'unshared', historyRewriteAcknowledged: true, ordinaryCommit: true, upstreamReviewed: true, retainedCommit: true, lossAcknowledged: true, resolutionReviewed: true };
const cases = [
  ['unstage', { staged: 1 }, {}, 'unstage-file'], ['discard', { unstaged: 1 }, {}, 'discard-file'],
  ['amend', { staged: 1 }, {}, 'amend-local'], ['revert', {}, {}, 'revert-shared'],
  ['divergence', { upstream: 'team/topic', ahead: 1, behind: 1 }, {}, 'merge-upstream'],
  ['merge', { conflicts: 1 }, { operation: 'merge' }, 'stage-resolved'],
  ['detached', { branchKind: 'detached', branch: null }, {}, 'rescue-detached'], ['reflog', {}, {}, 'rescue-retained']
];
for (const [intent, statePatch, contextPatch, action] of cases) {
  test(`recovery ${intent}: only verified prerequisites expose intended action`, () => {
    const plan = buildRecoveryPlan(intent, Object.assign(base(), statePatch), { ...confirmed, ...contextPatch });
    assert.equal(plan.ready, true); assert.equal(plan.actions[0].id, action);
    assert.equal(plan.stages.length, 6); assert.ok(plan.fallback.length > 0 && plan.risk.uncertainties.length > 0);
  });
  test(`recovery ${intent}: missing/contradictory/unsupported evidence never exposes mutation`, () => {
    for (const state of [null, parseStatus('On branch unknown'), { ...base(), certainty: 'contradictory' }, { ...base(), unknownLineCount: 1 }, { ...base(), submodules: [{ path: 'module' }] }]) {
      const plan = buildRecoveryPlan(intent, state, { ...confirmed, ...contextPatch });
      assert.equal(plan.ready, false); assert.deepEqual(plan.actions, []); assert.ok(plan.diagnostics.length > 0);
    }
  });
}
for (const field of ['freshComplete', 'versionChecked', 'workPreserved', 'targetVerified']) test(`manual ${field} is required; parser cannot invent it`, () => {
  const plan = buildRecoveryPlan('unstage', { ...base(), staged: 1 }, { ...confirmed, [field]: false });
  assert.equal(plan.ready, false); assert.deepEqual(plan.actions, []);
});
test('unstage fails safely for unborn HEAD and empty index', () => {
  for (const state of [{ ...base(), hasCommit: false, staged: 1 }, base()]) assert.equal(buildRecoveryPlan('unstage', state, confirmed).ready, false);
});
test('discard acknowledgement cannot be replaced by generic confirmations', () => {
  const plan = buildRecoveryPlan('discard', { ...base(), unstaged: 1 }, { ...confirmed, lossAcknowledged: false });
  assert.equal(plan.ready, false); assert.equal(plan.risk.requiresAcknowledgement, true);
});
test('shared or unacknowledged amend is blocked', () => {
  assert.equal(buildRecoveryPlan('amend', base(), { ...confirmed, sharing: 'shared' }).ready, false);
  assert.equal(buildRecoveryPlan('amend', base(), { ...confirmed, historyRewriteAcknowledged: false }).ready, false);
});
test('merge-commit revert requires separate guidance', () => {
  assert.equal(buildRecoveryPlan('revert', base(), { ...confirmed, ordinaryCommit: false }).ready, false);
});
test('divergent push never guesses a remote or recommends a force push', () => {
  const plan = buildRecoveryPlan('divergence', { ...base(), upstream: null, ahead: 1, behind: 1 }, confirmed);
  assert.equal(plan.ready, false); assert.deepEqual(plan.actions, []);
  for (const command of Object.values(recoveryCommands)) assert.ok(!command.syntax.includes('--force'));
});
test('merge identity and fresh resolved-state transition are mandatory', () => {
  assert.equal(buildRecoveryPlan('merge', { ...base(), conflicts: 1 }, { ...confirmed, operation: 'rebase' }).ready, false);
  const before = buildRecoveryPlan('merge', { ...base(), conflicts: 1 }, { ...confirmed, operation: 'merge' });
  assert.equal(before.actions[0].id, 'stage-resolved');
  const after = buildRecoveryPlan('merge', { ...base(), staged: 1 }, { ...confirmed, operation: 'merge' });
  assert.equal(after.actions[0].id, 'merge-continue');
});
test('rescue flows require committed/retained work instead of promising unstaged recovery', () => {
  assert.equal(buildRecoveryPlan('detached', base(), confirmed).ready, false);
  assert.equal(buildRecoveryPlan('reflog', base(), { ...confirmed, retainedCommit: false }).ready, false);
});
test('unknown intent has a diagnostic path and no action', () => {
  const plan = buildRecoveryPlan('__proto__', base(), confirmed); assert.equal(plan.supported, false); assert.equal(plan.ready, false); assert.ok(plan.diagnostics.length);
});
test('all eight flows have typed canonical command references and recovery paths', () => {
  assert.equal(recoveryFlows.length, 8); assert.equal(Object.keys(recoveryCommands).length, 9);
  assert.ok(recoveryFlows.every(flow => flow.commands.length && flow.fallback));
});
