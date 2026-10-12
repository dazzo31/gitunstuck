import { validateCommand, validateRisk, validateWorkflow } from './schema.mjs';
const definition = (id, syntax, verb, effects, explanation) => validateCommand({
  id, syntax, minimumGit: '2.28', requiredParameters: [...syntax.matchAll(/<([^>]+)>/g)].map(m => m[1]), effects,
  shellNotes: 'Replace verified placeholders; quote paths for the selected shell. Never run every alternative as one script.',
  preflight: ['Fresh complete status, identified operation, preserved wanted work and verified targets.'], verification: ['Inspect git status and relevant refs/tree; test intended result.'],
  sources: [`https://git-scm.com/docs/git-${verb}`], reviewed: '2026-10-12', explanation
});
export const recoveryCommands = {
  unstage: definition('unstage-file', 'git restore --staged -- <filename>', 'restore', ['local-change'], 'Restores index from HEAD; working file remains unchanged. Requires an existing commit.'),
  discard: definition('discard-file', 'git restore -- <filename>', 'restore', ['local-change', 'data-loss-potential'], 'Overwrites working file from index. Git cannot guarantee recovery of discarded unstaged edits.'),
  amend: definition('amend-local', 'git commit --amend', 'commit', ['local-change', 'history-rewrite'], 'Replaces the latest commit; includes all staged changes and opens the commit-message editor.'),
  revert: definition('revert-shared', 'git revert <commit-id>', 'revert', ['local-change'], 'Records an inverse commit. Ordinary single-parent target must be inspected; conflicts are possible.'),
  integrate: definition('merge-upstream', 'git merge <verified-upstream-ref>', 'merge', ['local-change'], 'Integrates inspected upstream history without replaying existing local commits; can conflict.'),
  stageResolved: definition('stage-resolved', 'git add -- <resolved-file>', 'add', ['local-change'], 'Stages the reviewed resolution; inspect all unmerged paths before continuing.'),
  mergeContinue: definition('merge-continue', 'git merge --continue', 'merge', ['local-change'], 'Completes the identified merge after all conflicts are resolved/staged.'),
  detached: definition('rescue-detached', 'git branch <unused-rescue-name> <verified-head-commit-id>', 'branch', ['local-change'], 'Creates a ref to committed work without switching or changing working files.'),
  reflog: definition('rescue-retained', 'git branch <unused-rescue-name> <retained-commit-id>', 'branch', ['local-change'], 'Creates a ref only if the inspected commit still exists locally; it cannot recover arbitrary discarded unstaged edits.')
};
const flow = (id, title, commandKeys, diagnostics, fallback) => ({
  id, title, category: 'undo', commands: commandKeys.map(key => recoveryCommands[key].id),
  effects: [...new Set(commandKeys.flatMap(key => recoveryCommands[key].effects))],
  prerequisites: ['No inferred freshness, operation identity, ownership or target. User confirmations are testimony, not host verification.'],
  verification: ['Re-run fresh status; inspect expected index/tree/refs; test the result.'], commandKeys, diagnostics, fallback
});
export const recoveryFlows = [
  flow('unstage', 'Unstage files without discarding edits', ['unstage'], ['git diff --staged', 'git diff'], 'If HEAD is unborn, do not run this HEAD-based recipe. Inspect status and consult unborn-index guidance; do not add force flags.'),
  flow('discard', 'Discard selected unstaged edits', ['discard'], ['git diff', 'git diff --staged'], 'If the result differs, stop. Reflog does not guarantee recovery of discarded unstaged edits. Restore a separate backup if available.'),
  flow('amend', 'Amend an unshared local commit', ['amend'], ['git log -1', 'git diff --staged'], 'If commit/editor/hooks fail, inspect status and staged content before retrying. Do not bypass hooks or rewrite shared commits.'),
  flow('revert', 'Revert an ordinary shared commit', ['revert'], ['git log -n 5 --oneline', 'git show --no-patch --pretty=raw <commit-id>'], 'If revert is in progress, inspect status, resolve/stage then git revert --continue, or git revert --abort. Merge commits require a deliberate mainline choice.'),
  flow('divergence', 'Investigate a rejected divergent push', ['integrate'], ['git branch -vv', 'git remote -v', 'git log --oneline --graph --decorate --all -n 20'], 'Fetch your verified remote separately and inspect the new tracking state. If merge starts and conflicts, inspect status before continuing/aborting. Never blindly force-push or add --allow-unrelated-histories.'),
  flow('merge', 'Resolve or finish an identified merge', ['stageResolved', 'mergeContinue'], ['git status', 'git diff --name-only --diff-filter=U', 'git diff'], 'For an identified merge you may request git merge --abort; preserving pre-existing uncommitted work is not guaranteed. If status identifies rebase/cherry-pick/revert instead, use that operation’s own continuation/abort guidance.'),
  flow('detached', 'Rescue committed detached-HEAD work', ['detached'], ['git log -1', 'git branch --list'], 'Choose an unused rescue name. Do not force-update an existing branch. This creates a ref to committed work; preserve uncommitted edits separately.'),
  flow('reflog', 'Rescue retained committed work from reflog', ['reflog'], ['git reflog -n 20', 'git show <retained-commit-id>', 'git branch --list'], 'If the object is unavailable, stop; do not promise recovery. Reflog expiry/pruning varies. Choose an unused rescue name and inspect the actual recovered tree.')
];
const ids = new Set(Object.values(recoveryCommands).map(command => command.id));
recoveryFlows.forEach(value => validateWorkflow(value, ids));
export function buildRecoveryPlan(intent, state, context = {}) {
  const selected = recoveryFlows.find(value => value.id === intent);
  if (!selected) return { supported: false, ready: false, blockers: ['Choose a supported recovery intent.'], diagnostics: ['git status --porcelain=v2 --branch'] };
  const blockers = []; const require = (condition, message) => { if (!condition) blockers.push(message); };
  require(state && state.format !== 'unsupported', 'Paste supported status output first.');
  require(state?.certainty !== 'contradictory', 'Contradictory evidence requires fresh diagnostics.');
  require(state && state.unknownLineCount === 0, 'Unsupported records make the state incomplete.');
  require(!state?.submodules?.length, 'Submodule changes require a separate inspection; this flow does not model them.');
  require(context.freshComplete === true, 'Confirm you just gathered complete status from the intended repository. Freshness is not established by the parser.');
  require(context.versionChecked === true, 'Confirm Git 2.28+ and the command prerequisites were checked.');
  require(context.workPreserved === true, 'Preserve wanted tracked, untracked and ignored work before mutation.');
  require(context.targetVerified === true, 'Inspect and verify the intended file/commit/ref and unused rescue name where applicable.');
  const expectedOperation = intent === 'merge' ? 'merge' : 'none';
  require(context.operation === expectedOperation, intent === 'merge' ? 'Full status must identify a merge; conflict markers alone do not establish the operation.' : 'Inspect full status and confirm no ongoing merge/rebase/cherry-pick/revert operation.');
  if (state) {
    if (intent !== 'merge') require(state.conflicts === 0, 'Unresolved conflicts block this operation.');
    if (['unstage', 'discard', 'amend', 'revert', 'divergence', 'merge'].includes(intent)) require(state.hasCommit === true, 'An existing HEAD commit must be reported; do not assume it on unborn/incomplete input.');
    if (intent === 'unstage') require(state.staged > 0, 'No staged change is reported; gather fresh evidence.');
    if (intent === 'discard') { require(state.unstaged > 0, 'No unstaged change is reported.'); require(context.lossAcknowledged === true, 'Explicitly acknowledge selected unstaged edits may be irrecoverably lost.'); }
    if (intent === 'amend') { require(context.sharing === 'unshared', 'Confirm affected commits are unshared; status cannot establish this.'); require(context.historyRewriteAcknowledged === true, 'Acknowledge that amend rewrites the latest commit and includes all staged content.'); }
    if (['revert', 'divergence'].includes(intent)) require(state.staged === 0 && state.unstaged === 0 && state.untracked === 0, 'A clean reported workspace is required; preserve hidden/ignored work separately.');
    if (intent === 'revert') require(context.ordinaryCommit === true, 'Inspect the target’s parent information; this flow covers ordinary single-parent commits only.');
    if (intent === 'divergence') { require(state.ahead > 0 && state.behind > 0 && state.upstream !== null, 'Need an observed upstream and both ahead/behind counts for this divergence flow.'); require(context.upstreamReviewed === true, 'Fetch the verified remote and inspect the latest upstream graph before choosing integration.'); }
    if (intent === 'merge' && state.conflicts > 0) require(context.resolutionReviewed === true, 'Review resolved file contents before staging; continuation stays blocked until fresh status reports no unmerged paths.');
    if (intent === 'detached') require(state.branchKind === 'detached' && state.hasCommit === true, 'Detached HEAD with a reported retained commit is required.');
    if (intent === 'reflog') require(context.retainedCommit === true, 'Inspect an existing retained commit; discarded unstaged edits are not reflog commit recovery.');
  }
  const commandKeys = intent === 'merge' ? [state?.conflicts > 0 ? 'stageResolved' : 'mergeContinue'] : selected.commandKeys;
  const actions = blockers.length ? [] : commandKeys.map(key => recoveryCommands[key]);
  const surfaces = { unstage: ['index'], discard: ['working tree'], amend: ['local commit/history', 'staged snapshot'], revert: ['local commit/history', 'index', 'working tree'], divergence: ['local commit/history', 'index', 'working tree'], merge: ['index', 'working tree', 'local history if continuing'], detached: ['local branch refs'], reflog: ['local branch refs'] };
  const risk = validateRisk({
    effects: selected.effects, affectedSurfaces: surfaces[intent],
    uncertainties: ['Current remote state remains unknown.', 'Operation identity, freshness and target checks rely on your confirmations.'],
    explanation: selected.commandKeys.map(key => recoveryCommands[key].explanation).join(' '), requiresAcknowledgement: selected.effects.includes('data-loss-potential') || selected.effects.includes('history-rewrite')
  });
  return {
    supported: true, id: selected.id, title: selected.title, ready: blockers.length === 0, blockers, actions, risk,
    diagnostics: [...new Set([...(state?.followUps || ['git status --porcelain=v2 --branch']), ...selected.diagnostics])],
    fallback: selected.fallback, verification: selected.verification,
    stages: ['Inspect', 'Diagnose', 'Prepare', 'Act', 'Verify', 'Recover / Abort']
  };
}
