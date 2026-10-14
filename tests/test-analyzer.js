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
  return { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs, extractGitContext, sanitizeGitToken, stripBashComments, convertModernToLegacy };
`);

const { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs, extractGitContext, sanitizeGitToken, stripBashComments, convertModernToLegacy } = fn(
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

// Suite 5: Context-Aware Token Extraction & Trigger Detection
console.log('\nSuite 5: Context-Aware Token Extraction & Trigger Detection');

// Test: Shell Metacharacter Sanitization
const dirtyToken = 'feat/branch; rm -rf / && $(whoami) | `evil`';
const cleanToken = sanitizeGitToken(dirtyToken);
assert(!/[;&|`$(){}]/.test(cleanToken), 'Sanitizes shell injection metacharacters');
assert(cleanToken === 'feat/branchrm-rf/whoamievil', 'Strips dangerous characters cleanly');

// Test: Token Extraction from Status
const sampleStatus = `On branch feat/auth-login
Your branch and 'origin/feat/auth-login' have diverged,
and have 2 and 1 different commits each, respectively.
Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   src/auth.js
	both modified:   config/keys.json
modified:   README.md
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.env
`;

const ctx = extractGitContext(sampleStatus);
assert(ctx.branch === 'feat/auth-login', 'Extracts active branch name from status');
assert(ctx.conflictedFiles.includes('src/auth.js'), 'Extracts conflicted files list');
assert(ctx.conflictedFiles.includes('config/keys.json'), 'Extracts all multiple conflicted files');
assert(ctx.modifiedFiles.includes('README.md'), 'Extracts modified files');
assert(ctx.sensitiveFiles.includes('.env'), 'Extracts sensitive untracked files');

// Test: Detached HEAD token extraction
const detachedStatus = 'HEAD detached at e5f6a7b\nnothing to commit, working tree clean';
const detachedCtx = extractGitContext(detachedStatus);
assert(detachedCtx.detachedSha === 'e5f6a7b', 'Extracts detached HEAD commit hash');

// Test: Dynamic Command Replacement & Trigger Line Detection
const conflictAnalysis = analyzeGitOutput(sampleStatus);
assert(
  conflictAnalysis && conflictAnalysis.code.includes('git add src/auth.js'),
  'Dynamically injects extracted conflicted file name into recovery command'
);
assert(
  conflictAnalysis && conflictAnalysis.triggerLine.includes('Unmerged paths'),
  'Captures exact conflict trigger line from terminal input'
);

const divergedStatus = `On branch feat/auth-login
Your branch and 'origin/feat/auth-login' have diverged,
and have 2 and 1 different commits each, respectively.
nothing to commit, working tree clean`;

const divergedAnalysis = analyzeGitOutput(divergedStatus);
assert(
  divergedAnalysis && divergedAnalysis.code.includes('git pull --rebase origin feat/auth-login'),
  'Dynamically injects extracted branch name into recovery command'
);
assert(
  divergedAnalysis && divergedAnalysis.triggerLine.includes('have diverged'),
  'Captures exact divergence trigger line from terminal input'
);

const authError = 'fatal: Authentication failed for \'https://github.com/org/repo.git\'';
const authAnalysis = analyzeGitOutput(authError);
assert(
  authAnalysis && authAnalysis.triggerLine === authError,
  'Captures exact authentication failure trigger line'
);

// Suite 6: Comment Stripping & Syntax Version Conversion (Phase 4)
console.log('\nSuite 6: Comment Stripping & Syntax Version Conversion');
const commentedSnippet = `# 1. Create and switch to branch:
git switch -c feature/test

# 2. Add files and commit:
git add .
git commit -m "test commit"`;

const { clean: cleanSnippet, hadComments: hadCommentsTrue } = stripBashComments(commentedSnippet);
assert(hadCommentsTrue === true, 'Reports hadComments=true when # comments exist');
assert(!cleanSnippet.includes('# 1.'), 'Strips first comment line');
assert(!cleanSnippet.includes('# 2.'), 'Strips second comment line');
assert(cleanSnippet.includes('git switch -c feature/test'), 'Preserves first executable command');
assert(cleanSnippet.includes('git commit -m "test commit"'), 'Preserves second executable command');

const cleanInputSnippet = 'git status\ngit diff';
const { clean: cleanResult, hadComments: hadCommentsFalse } = stripBashComments(cleanInputSnippet);
assert(hadCommentsFalse === false, 'Reports hadComments=false when no comments exist');
assert(cleanResult === cleanInputSnippet, 'Preserves clean snippet untouched');

const modernText = 'git switch -c feat\ngit switch --detach 1234567\ngit switch main\ngit restore --staged app.js\ngit restore app.js';
const legacyText = convertModernToLegacy(modernText);
assert(legacyText.includes('git checkout -b feat'), 'Converts git switch -c to git checkout -b');
assert(legacyText.includes('git checkout --detach 1234567'), 'Converts git switch --detach to git checkout --detach');
assert(legacyText.includes('git checkout main'), 'Converts git switch main to git checkout main');
assert(legacyText.includes('git reset HEAD app.js'), 'Converts git restore --staged to git reset HEAD');
assert(legacyText.includes('git checkout -- app.js'), 'Converts git restore to git checkout --');

// Suite 7: Mathematical Notation & CS Deep Dive Sanitization (Phase 5)
console.log('\nSuite 7: Mathematical Notation & CS Deep Dive Sanitization');
const rawLatexRegex = /\$(?:G|V|E|B_1|B_2|A|\\Delta_1|\\Delta_2|\\log_2|\text\{)[^$]*\$/;
assert(!rawLatexRegex.test(indexHtml), 'Zero unrendered math LaTeX notation exists in index.html');
assert(indexHtml.includes('<var>G</var> = (<var>V</var>, <var>E</var>)'), 'Semantic DAG math equation rendered in HTML');
assert(indexHtml.includes('<code>Δ<sub>1</sub> = diff(<var>A</var>, <var>B</var><sub>1</sub>)</code>'), 'Semantic 3-way merge diff equation rendered in HTML');
assert(indexHtml.includes('id="gitInternalsInspector"'), 'Live .git/ files inspector markup exists in DOM');

// Suite 8: Deep-Linking & Accessibility Integrity (Phases 1-6)
console.log('\nSuite 8: Deep-Linking & Accessibility Integrity');
const recipeCardIds = [
  'card-init', 'card-clone', 'card-stage', 'card-branch', 'card-undo',
  'card-sync', 'card-forge-troubleshoot', 'card-pipeline', 'card-stash',
  'card-conflict', 'card-rebase', 'card-detached', 'card-worktree',
  'card-reflog', 'card-bisect', 'card-tag', 'card-force-lease', 'card-cherry-pick'
];

let allCardsPresent = true;
let allCardLinksPresent = true;
recipeCardIds.forEach(id => {
  if (!indexHtml.includes(`id="${id}"`)) allCardsPresent = false;
  if (!indexHtml.includes(`copyCardLink('${id}', this)`)) allCardLinksPresent = false;
});
assert(allCardsPresent, 'All 18 recipe cards have deterministic IDs');
assert(allCardLinksPresent, 'All 18 recipe cards have direct link copy buttons');
assert(indexHtml.includes('copyDecisionLink('), 'Decision tree solutions include direct link copy button');
assert(indexHtml.includes('id="heroJumpToAnalyzer"'), 'Hero section includes quick-jump to terminal analyzer');
assert(indexHtml.includes('git stash push -u -m "safety-backup" && git stash apply'), 'Golden Safety Rule includes full snapshot with stash apply');
assert(indexHtml.includes('[data-theme="light"] .git-file-content'), 'Light mode high-contrast rule exists for Under the Hood file content');
assert(/\.forge-host-btn,\s*\.pipeline-tab-btn/.test(indexHtml), 'Forge host selector and CI/CD pipeline buttons are standardized');
assert(indexHtml.includes("statusInputText.addEventListener('input'"), 'Auto-clear diagnosis on new terminal input is wired');

// Suite 9: Experience Mode Personas, Interlinking & Adaptive Annotations (v2.1 UX Upgrade)
console.log('\nSuite 9: Experience Mode Personas, Interlinking & Adaptive Annotations');
assert(indexHtml.includes('Guided Essentials') && indexHtml.includes('data-mode="beginner"'), 'Header mode switcher includes Guided Essentials button');
assert(indexHtml.includes('Developer Hub') && indexHtml.includes('data-mode="pro"'), 'Header mode switcher includes Developer Hub button');
assert(indexHtml.includes('id="analogy-repo"') && indexHtml.includes("jumpToTarget('card-init')"), 'Analogy card for Repository links to card-init');
assert(indexHtml.includes('id="analogy-commit"') && indexHtml.includes("jumpToTarget('card-stage')"), 'Analogy card for Commit links to card-stage');
assert(indexHtml.includes('id="analogy-staging"') && indexHtml.includes("jumpToTarget('card-undo')"), 'Analogy card for Staging links to card-undo');
assert(indexHtml.includes('id="analogy-remote"') && indexHtml.includes("jumpToTarget('card-sync')"), 'Analogy card for Remote links to card-sync');
assert(indexHtml.includes('[data-view="pro"] #beginnerPrimer'), 'CSS rule exists to target beginnerPrimer in pro view');
assert(!indexHtml.includes('class="primer-cs-bridge"'), 'Math theory bridge removed from 60-second beginner primer');
assert(/class="card[^"]*\bpro-only\b[^"]*"[^>]*id="card-rebase"|id="card-rebase"[^>]*class="card[^"]*\bpro-only\b[^"]*"/.test(indexHtml), 'Interactive rebase card is marked pro-only');
assert(indexHtml.includes('[data-view="beginner"] .pro-only:not(.emergency-revealed)'), 'Emergency reveal CSS rule preserves beginner view');
assert(indexHtml.includes('class="plain-english-note"'), 'Adaptive plain-english notes exist in markup');
assert(indexHtml.includes('[data-view="pro"] .plain-english-note'), 'Plain-english notes are cleanly hidden in pro view');
assert(indexHtml.includes('Guided Concept'), 'Card annotation pills use inclusive Guided Concept label');

// Suite 10: Totakit-Inspired Thin Iconography System (1.5px stroke, geometric vector line style)
console.log('\nSuite 10: Totakit Thin Vector Icon System');
assert(indexHtml.includes('.tota-icon'), 'CSS rules for Totakit thin iconography system exist');
assert(indexHtml.includes('stroke-width: 1.5;'), 'Totakit icons enforce uniform 1.5px stroke width');
assert(indexHtml.includes('class="tota-icon tota-icon-xl"'), 'Analogy cards render large Totakit vector SVGs');
assert(indexHtml.includes('class="tota-icon tota-icon-sm"'), 'Card controls and forge selector render compact Totakit SVGs');
assert(indexHtml.includes('--mode-color: var(--accent-green)'), 'Dynamic CSS variable --mode-color mapped to green for Guided Essentials');
assert(indexHtml.includes('--mode-color: var(--git-orange)'), 'Dynamic CSS variable --mode-color mapped to orange for Developer Hub');
assert(indexHtml.includes('.task-chip .tota-icon') && indexHtml.includes('color: var(--mode-color)'), 'UI iconography matches dynamic toggle mode color');

// Suite 11: Brand Identity & Vector Asset Architecture
console.log('\nSuite 11: Brand Identity & Vector Asset Architecture');
const faviconSvg = fs.readFileSync(path.join(__dirname, '../favicon.svg'), 'utf-8');
const appIconSvg = fs.readFileSync(path.join(__dirname, '../app-icon.svg'), 'utf-8');
assert(faviconSvg.includes('class="fav-glyph"') && faviconSvg.includes('prefers-color-scheme'), 'Favicon SVG contains vector glyph with responsive light/dark color scheme');
assert(appIconSvg.includes('class="app-g"') && appIconSvg.includes('class="app-k"'), 'App Icon SVG contains intertwined monogram with dual brand colors');
assert(indexHtml.includes('--brand-git: #10b981;') && indexHtml.includes('--brand-unstuck: #f05032;'), 'CSS variables --brand-git and --brand-unstuck defined in dark theme');
assert(indexHtml.includes('--brand-git: #047857;') && indexHtml.includes('--brand-unstuck: #c2410c;'), 'CSS variables --brand-git and --brand-unstuck defined in light theme');
assert(indexHtml.includes('class="brand-app-icon"') && indexHtml.includes('var(--brand-git)') && indexHtml.includes('var(--brand-unstuck)'), 'Header brand logo renders dual-color App Icon vector');
assert(indexHtml.includes('class="brand-wordmark-svg"') && indexHtml.includes('class="brand-word-git"') && indexHtml.includes('class="brand-word-unstuck"'), 'Header title renders dual-color Wordmark vector');
assert(indexHtml.includes('<span class="sr-only">GitUnstuck</span>'), 'Wordmark preserves screen reader accessibility with sr-only text');

console.log(`\nTotal Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}

