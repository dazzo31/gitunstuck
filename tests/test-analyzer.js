// tests/test-analyzer.js
// Automated regression test suite for GitUnstuck terminal diagnostic engine
const fs = require('fs');
const path = require('path');

// 1. Extract and load analyzer functions directly from index.html
const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const scriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not locate <script> tag in index.html');
  process.exit(1);
}

// Sandbox environment for evaluating script functions without DOM errors
const sandbox = {
  document: {
    documentElement: { setAttribute: () => {}, getAttribute: () => 'dark' },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} } }
  },
  window: {
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
    location: { hash: '' }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  setTimeout: () => {},
  navigator: {}
};

const fn = new Function('document', 'window', 'localStorage', 'setTimeout', 'navigator', `
  ${scriptMatch[1]}
  return { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs };
`);

const { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs } = fn(
  sandbox.document,
  sandbox.window,
  sandbox.localStorage,
  sandbox.setTimeout,
  sandbox.navigator
);

console.log('--- GitUnstuck v2.1 Diagnostic Engine Test Suite ---\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// Suite 1: Input Normalization Tests
console.log('Suite 1: Input Sanitization & Normalization');
const rawAnsi = '\x1b[31merror:\x1b[0m failed to push some refs\r\nTo github.com/user/repo\r\n';
const cleanText = normalizeTerminalInput(rawAnsi);
assert(!cleanText.includes('\x1b['), 'Strips ANSI terminal escape color codes');
assert(!cleanText.includes('\r\n'), 'Normalizes CRLF line endings to LF');
assert(cleanText.includes('error: failed to push some refs'), 'Preserves legitimate error text');

const hugeInput = 'a'.repeat(200000);
assert(normalizeTerminalInput(hugeInput).length <= 102400, 'Guards against ReDoS by capping input at 100 KiB');

// Suite 2: Multi-State Diagnostic Rule Engine Tests
console.log('\nSuite 2: Multi-State Diagnostic Rule Engine');

// Test: Detached HEAD
const detachedRes = analyzeGitOutput('HEAD detached at 7a2b3c4\nnothing to commit, working tree clean');
assert(detachedRes && detachedRes.title.includes('Detached HEAD'), 'Identifies detached HEAD state');
assert(detachedRes && detachedRes.workLostStatus === 'danger', 'Warns about orphan commit risk in detached HEAD');
assert(detachedRes && detachedRes.code.includes('git switch -c rescue-branch'), 'Recommends named rescue branch');

// Test: Merge Conflict
const conflictRes = analyzeGitOutput('both modified: src/app.js\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)');
assert(conflictRes && conflictRes.title.includes('Merge Conflict'), 'Identifies in-progress merge conflict');
assert(conflictRes && conflictRes.workLostStatus === 'safe', 'Reassures user that conflicting files exist on disk');
assert(conflictRes && conflictRes.code.includes('git merge --continue'), 'Recommends git merge --continue');

// Test: Rebase in Progress
const rebaseRes = analyzeGitOutput('rebase in progress; onto 1a2b3c\nYou are currently rebasing branch');
assert(rebaseRes && rebaseRes.title.includes('Interactive Rebase'), 'Identifies paused interactive rebase');
assert(rebaseRes && rebaseRes.code.includes('git rebase --continue'), 'Recommends git rebase --continue');

// Test: Secret Scan Push Rejection (GH013)
const secretRes = analyzeGitOutput('remote: error: GH013: Repository rule violations found for refs/heads/main.\nPush cannot contain secrets');
assert(secretRes && secretRes.title.includes('Secret / API Key'), 'Identifies GH013 Secret Scan rejection');
assert(secretRes && secretRes.code.includes('git reset --soft HEAD~1'), 'Recommends soft reset to sanitize secret without losing edits');

// Test: Protected Branch Rejection (GH006 / GitLab / Bitbucket)
const protectedRes = analyzeGitOutput('remote: error: GH006: Protected branch update failed for refs/heads/main.');
assert(protectedRes && protectedRes.title.includes('Protected Branch'), 'Identifies protected branch rejection');
assert(protectedRes && protectedRes.code.includes('git switch -c feature/my-fix'), 'Recommends branching commits instead of force-pushing');

// Test: Authentication Failure
const authRes = analyzeGitOutput('fatal: Authentication failed for https://github.com/user/repo.git');
assert(authRes && authRes.title.includes('Authentication'), 'Identifies authentication failure');
assert(authRes && authRes.code.includes('git credential reject'), 'Recommends resetting stale credential cache');

// Test: Diverged Branches
const divergedRes = analyzeGitOutput('Your branch and origin/main have diverged, and have 3 and 1 different commits');
assert(divergedRes && divergedRes.title.includes('Branch Divergence'), 'Identifies local and remote divergence');
assert(divergedRes && divergedRes.code.includes('git pull --rebase'), 'Recommends clean linear pull --rebase integration');

// Test: Untracked Sensitive Files
const sensitiveRes = analyzeGitOutput('Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t.env\n\tsrc/app.js');
assert(sensitiveRes && sensitiveRes.title.includes('Sensitive Credential File'), 'Identifies untracked .env file');
assert(sensitiveRes && sensitiveRes.code.includes('.gitignore'), 'Instructs appending sensitive file to .gitignore');

// Test: Not a Git Repo
const notRepoRes = analyzeGitOutput('fatal: not a git repository (or any of the parent directories): .git');
assert(notRepoRes && notRepoRes.title.includes('Not a Git Repository'), 'Identifies non-repository directory');
assert(notRepoRes && notRepoRes.code.includes('git init -b main'), 'Provides git init or folder navigation command');

// Test: Clean Working Tree
const cleanRes = analyzeGitOutput('nothing to commit, working tree clean');
assert(cleanRes && cleanRes.title.includes('Working Tree Clean'), 'Identifies clean working tree');
assert(cleanRes && cleanRes.code.includes('git reflog'), 'Provides reflog inspection for misplaced commits');

// Suite 3: Multi-Host Forge Scenarios Coverage
console.log('\nSuite 3: Multi-Host Forge Scenarios Coverage');
const forges = ['github', 'gitlab', 'bitbucket'];
const incidents = ['protected-branch', 'auth', 'secret', 'fork'];

forges.forEach(f => {
  assert(forgeScenarios[f], `Forge profile exists for [${f}]`);
  incidents.forEach(inc => {
    assert(
      forgeScenarios[f] && forgeScenarios[f][inc] && forgeScenarios[f][inc].code,
      `Forge [${f}] covers incident [${inc}] with verified command`
    );
  });
});

// Suite 4: Sample Output Fixtures
console.log('\nSuite 4: Built-In Sample Output Fixtures');
['detached', 'conflict', 'diverged', 'secret', 'clean'].forEach(k => {
  assert(sampleTerminalOutputs[k], `Sample output fixture exists for [${k}]`);
  const analyzed = analyzeGitOutput(sampleTerminalOutputs[k]);
  assert(analyzed && analyzed.confidence, `Sample output [${k}] successfully parses`);
});

console.log(`\n========================================`);
console.log(`Total Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}
