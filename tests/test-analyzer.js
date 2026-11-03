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

const fn = new Function('document', 'window', 'localStorage', 'setTimeout', 'navigator', 'GitRecovery', `
  ${scriptMatch[1]}
  return { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs, extractGitContext, sanitizeGitToken, stripBashComments, convertModernToLegacy, fourZoneData };
`);

const { normalizeTerminalInput, analyzeGitOutput, forgeScenarios, sampleTerminalOutputs, extractGitContext, sanitizeGitToken, stripBashComments, convertModernToLegacy, fourZoneData } = fn(
  sandbox.document,
  sandbox.window,
  sandbox.localStorage,
  sandbox.setTimeout,
  sandbox.navigator,
  require('../recovery.js')
);

console.log('--- GitUnstuck v2.2 Diagnostic Engine Test Suite ---\n');

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

const { recipes } = require('../recovery.js');
const cases = [
  ['HEAD detached at 7a2b3c4', 'detached'],
  ['You are still merging.\nUnmerged paths:\nboth modified: file with spaces.js', 'merge'],
  ['rebase in progress; onto 1a2b3c\nUnmerged paths:\nboth modified: file with spaces.js', 'rebase'],
  ['GH013: Repository rule violations found\nPush cannot contain secrets', 'secret'],
  ['remote: error: GH006: Protected branch update failed', 'protected'],
  ['fatal: Authentication failed', 'auth'],
  ["Your branch and 'team/custom' have diverged", 'diverged'],
  ['GH013: Repository rule violations found', 'inspect'],
  ['pre-receive hook declined', 'inspect'],
  ['Unmerged paths:\nboth modified: file.js', 'inspect'],
  ['rebase in progress\nYou are still merging.', 'inspect'],
  ['You are currently cherry-picking commit abc1234.\nUnmerged paths:', 'inspect'],
  ['HEAD detached at abc1234\nYou are currently bisecting, started from main', 'inspect'],
  ['Untracked files:\n  .env', 'sensitive'],
  ['Authentication failed\nPush cannot contain secrets', 'inspect'],
  ['On branch main', 'inspect'],
  ['unrecognized output', 'inspect']
];
for (const [input, key] of cases) {
  const res = analyzeGitOutput(input);
  assert(res.recipeKey === key, `Selects ${key} for ${JSON.stringify(input)}`);
  assert(res.workLostStatus === 'unknown', 'Diagnosis never establishes a blanket work-preservation verdict');
}
assert(analyzeGitOutput('unknown').title === 'Not enough information.', 'Unknown input requests more evidence');
assert(analyzeGitOutput('nothing to commit, working tree clean').title === 'Working tree reported clean', 'Clean output is a narrow observation');
assert(!analyzeGitOutput('GH006').code.includes('reset --hard'), 'Protected branch workflow does not reset files');
assert(!analyzeGitOutput('Push cannot contain secrets').code.includes('reset --soft'), 'Secret diagnostic inspects history before selecting cleanup');
for (const [key, r] of Object.entries(recipes)) {
  assert(['title','risk','means','checks','steps','effect','verify','failure','source'].every(k => r[k]), `Recipe ${key} states prerequisites, consequences and verification`);
}

// Suite 3: Multi-Host Forge Scenarios Coverage
console.log('\nSuite 3: Multi-Host Forge Scenarios Coverage');
const forges = ['github', 'gitlab', 'bitbucket'];
const incidents = ['protected-branch', 'auth', 'secret', 'fork'];

forges.forEach(f => {
  assert(forgeScenarios[f], `Forge profile exists for [${f}]`);
  incidents.forEach(inc => {
    assert(
      forgeScenarios[f] && forgeScenarios[f][inc] && forgeScenarios[f][inc].code,
      `Forge [${f}] covers incident [${inc}] with authored command data`
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
  conflictAnalysis && conflictAnalysis.recipeKey === 'inspect',
  'Generic conflict output asks which operation is active'
);
assert(
  conflictAnalysis && sampleStatus.includes(conflictAnalysis.triggerLine),
  'Evidence is an actual input line'
);

const divergedStatus = `On branch feat/auth-login
Your branch and 'origin/feat/auth-login' have diverged,
and have 2 and 1 different commits each, respectively.
nothing to commit, working tree clean`;

const divergedAnalysis = analyzeGitOutput(divergedStatus);
assert(
  divergedAnalysis && divergedAnalysis.code.includes('UPSTREAM_REF'),
  'Divergence requires a checked upstream instead of guessing a pull'
);
assert(
  divergedAnalysis && divergedStatus.includes(divergedAnalysis.triggerLine),
  'Divergence evidence is an actual input line'
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
assert(recipes.snapshot.steps.some(step => step.code.includes('git stash apply --index')), 'Snapshot explicitly attempts index restoration and retains the stash');
assert(indexHtml.includes('[data-theme="light"] .git-file-content'), 'Light mode high-contrast rule exists for Under the Hood file content');
assert(indexHtml.includes('[data-theme="light"] .snippet-block') && indexHtml.includes('[data-theme="light"] pre.code-content'), 'Light mode code boxes use soft light backgrounds with high-contrast text');
assert(/--bg-code:\s*#f8fafc;/.test(indexHtml), 'Light mode defines light --bg-code token');
assert(/\.forge-host-btn,\s*\.pipeline-tab-btn/.test(indexHtml), 'Forge host selector and CI/CD pipeline buttons are standardized');
assert(indexHtml.includes("statusInputText.addEventListener('input'"), 'Auto-clear diagnosis on new terminal input is wired');

// Suite 9: Destination markup. Browser behavior is verified separately.
console.log('\nSuite 9: Destination markup (source checks only)');
for (const destination of ['fix','learn','reference']) {
  assert(indexHtml.includes(`data-destination-panel="${destination}"`), `${destination} destination exists`);
  assert(indexHtml.includes(`data-destination="${destination}" href="#${destination}"`), `${destination} navigation link exists`);
}
assert(indexHtml.includes('id="analogy-staging"'), 'Existing staging lesson ID retained');
assert(indexHtml.includes("window.addEventListener('popstate', handleHashRoute)"), 'History restoration handler is registered');

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
assert(appIconSvg.includes('class="app-glyph"') && appIconSvg.includes('prefers-color-scheme'), 'App Icon SVG contains single calligraphic G glyph with responsive light/dark color scheme');
assert(indexHtml.includes('--brand-git: #55b786;') && indexHtml.includes('--brand-unstuck: #dc5c3f;'), 'CSS variables --brand-git and --brand-unstuck defined in dark theme');
assert(indexHtml.includes('--brand-git: #34765a;') && indexHtml.includes('--brand-unstuck: #b44a23;'), 'CSS variables --brand-git and --brand-unstuck defined in light theme');
assert(!indexHtml.includes('class="brand-logo"'), 'Main page header removes app icon squircle to streamline wordmark');
assert(indexHtml.includes('class="brand-wordmark-svg"') && indexHtml.includes('class="brand-word-git"') && indexHtml.includes('class="brand-word-unstuck"'), 'Header title renders dual-color Wordmark vector');
assert(indexHtml.includes('<span class="sr-only">GitUnstuck</span>'), 'Wordmark preserves screen reader accessibility with sr-only text');
assert(fs.existsSync(path.join(__dirname, '../gitunstuck-wordmark-dark.svg')), 'Standalone gitunstuck-wordmark-dark.svg deployed in repo root');
assert(fs.existsSync(path.join(__dirname, '../gitunstuck-wordmark-light.svg')), 'Standalone gitunstuck-wordmark-light.svg deployed in repo root');
assert(fs.existsSync(path.join(__dirname, '../gitunstuck-favicon-dark.svg')), 'Standalone gitunstuck-favicon-dark.svg deployed in repo root');
assert(fs.existsSync(path.join(__dirname, '../gitunstuck-favicon-light.svg')), 'Standalone gitunstuck-favicon-light.svg deployed in repo root');

// Suite 12: GitHub Sponsors & Buy Me a Coffee Funding System
console.log('\nSuite 12: GitHub Sponsors & Buy Me a Coffee Funding System');
assert(indexHtml.includes('https://github.com/sponsors/dazzo31'), 'Footer links to GitHub Sponsors URL');
assert(indexHtml.includes('https://buymeacoffee.com/dazzo31'), 'Header pill and footer link to Buy Me a Coffee URL');
assert(indexHtml.includes('class="sponsor-pill-btn"') && indexHtml.includes('target="_blank"') && indexHtml.includes('Buy me a coffee'), 'Header controls group contains accessible sponsor pill button with Buy me a coffee wording');
assert(indexHtml.includes('id="sponsorCard"') && indexHtml.includes('class="footer-sponsor-card"'), 'Footer contains dedicated sponsor card');
assert(indexHtml.includes('Open Learning Resource &amp; Time Saver'), 'Sponsor messaging emphasizes learning resource and time saver angle');
assert(indexHtml.includes('class="btn-sponsor"') && indexHtml.includes('Sponsor on GitHub'), 'Footer card includes Sponsor on GitHub button');
assert(indexHtml.includes('btn-coffee') && indexHtml.includes('Buy Me a Coffee'), 'Footer card includes Buy Me a Coffee button');
assert(fs.existsSync(path.join(__dirname, '../.github/FUNDING.yml')), '.github/FUNDING.yml file exists for native GitHub Sponsor button');
const fundingYml = fs.readFileSync(path.join(__dirname, '../.github/FUNDING.yml'), 'utf-8');
assert(fundingYml.includes('github: dazzo31'), 'FUNDING.yml configures github user dazzo31');
assert(fundingYml.includes('buy_me_a_coffee: dazzo31'), 'FUNDING.yml configures buy_me_a_coffee user dazzo31');
const readmeMd = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf-8');
assert(readmeMd.includes('https://github.com/sponsors/dazzo31'), 'README.md contains GitHub Sponsors badges and link');
assert(readmeMd.includes('https://buymeacoffee.com/dazzo31'), 'README.md contains Buy Me a Coffee badges and link');
assert(fs.existsSync(path.join(__dirname, '../LICENSE')), 'MIT LICENSE file deployed in repo root');

// Suite 13: Interactive 4-Zone Architecture & Visual Data Flow Widget
console.log('\nSuite 13: Interactive 4-Zone Architecture & Visual Data Flow Widget');
assert(indexHtml.includes('id="fourZoneModel"'), 'fourZoneModel section element exists in DOM');
assert(indexHtml.includes('class="four-zone-section"'), 'fourZoneModel section has four-zone-section class');
assert(indexHtml.includes('data-zone="working"'), 'Interactive zone card exists for [working]');
assert(indexHtml.includes('data-zone="staging"'), 'Interactive zone card exists for [staging]');
assert(indexHtml.includes('data-zone="local"'), 'Interactive zone card exists for [local]');
assert(indexHtml.includes('data-zone="remote"'), 'Interactive zone card exists for [remote]');
assert(indexHtml.includes('class="four-zone-flow-bar"'), 'four-zone-flow-bar simulation toolbar exists');
assert(indexHtml.includes('data-step="working"') && indexHtml.includes('data-step="staging"') && indexHtml.includes('data-step="local"') && indexHtml.includes('data-step="remote"') && indexHtml.includes('data-step="reverse"'), 'All 5 simulation step buttons exist');
assert(indexHtml.includes('id="zoneDetailPanel"'), 'zoneDetailPanel inspector element exists');
assert(indexHtml.includes('data-target="fourZoneModel"'), 'Reference includes a link to the existing zone lesson');
assert(indexHtml.includes("hash.startsWith('#zone-')"), 'Hash router handles direct #zone- deep linking');
assert(typeof fourZoneData === 'object' && fourZoneData !== null, 'fourZoneData data dictionary is defined');
assert(fourZoneData.working && fourZoneData.working.relatedCardId === 'card-stage', 'Working zone links to staging guidance');
assert(recipes.discard.effect.includes('index'), 'Discard recipe describes the index as its source');
assert(fourZoneData.staging && fourZoneData.staging.forwardCmd.includes('git commit'), 'Staging zone illustrates a commit');
assert(recipes.unstage.steps[0].code.includes('git restore --staged'), 'Unstage recipe uses restore --staged');
assert(fourZoneData.staging && fourZoneData.staging.isWorkLostStatus === 'unknown', 'Zone does not promise preservation based only on location');
assert(fourZoneData.local && fourZoneData.local.relatedCardId === 'card-sync', 'Local zone links to remote inspection');
assert(recipes.rewind.checks.includes('unpublished'), 'Rewind requires an unpublished commit');
assert(recipes.revert.failure.includes('Merge commits'), 'Revert excludes unsupported merge commits');
assert(fourZoneData.reverse && fourZoneData.reverse.statusSnippet.includes('Working ──[ git add ]──> Staging'), 'Two-way highway defines complete forward and rollback ASCII lifecycle');

console.log(`\nTotal Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}

