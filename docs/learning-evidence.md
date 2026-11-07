# Learning implementation evidence

Goal: implement docs/learning-implementation.md. Started 6 November 2026.

## Baseline and scope

- Revision: 7115b5d643bb1b6259aa13b2b615d07e1d8a0327; branch feat/learning-course. Matches the reviewed baseline.
- Existing user work: untracked docs/GITUNSTUCK_LEARNING_IMPLEMENTATION_PLAN.md; preserved verbatim. Canonical execution copy: docs/learning-implementation.md.
- No applicable AGENTS.md found in checkout or parent directories. CONTRIBUTING.md applies: static architecture, no new dependencies, privacy, accessible controls, checked destructive guidance. User authorization covers local implementation; no issue posting, commits, PR, merge or deployment performed.
- Source map: index.html contains destinations, CSS, router, lessons, graphs and metadata; recovery.js is shared recovery data/logic; scripts/build.mjs embeds recovery.js; tests/test-analyzer.js and tests/test-recovery.js are npm test; tests/test-browser.cjs is optional Playwright QA. Both workflows run Ubuntu with Node 22.
- Existing observations remain: four lesson links, predefined zones/graphs, misleading metadata labels and universal 41-byte claim, quiz says staging moves edits. Source can open directly; production embeds shared code.
- Boundaries: six core lessons (inspect, staging, history, branches, remotes, recovery), optional setup, shared plain-text practice project, complete staging first. Keep recovery.js untouched unless narrow integration or demonstrated correction requires it. Preserve Git 2.23+ syntax, privacy, runtime dependencies and existing build architecture.
- Preserve #terminalAnalyzer, #troubleshootConsole, #undo-lost-reflog, #card-detached, #forge-PROVIDER/INCIDENT, #zone-staging, analogy anchors, search/filter and print. New validated route: #learn/LESSON/CHECKPOINT.
- Available environment: Windows PowerShell, Node v26.12.1, Git 2.56.0.windows.4. Git 2.23, actual beginner sessions, screen reader and second browser remain unverified.

## Task tracker

| Task ID | Status | Implementation revision | Checks and result | Evidence location or gap | Next action |
| --- | --- | --- | --- | --- | --- |
| P0.1 | PASS | 7115b5d + working tree | Checkout, instructions, source/build/tests/workflows inspected | Inspect the actual checkout | P0.2 |
| P0.2 | PASS | 7115b5d + working tree | Chromium baseline screenshots and representative journeys | Record representative starting journeys | See task evidence below |
| P0.3 | PASS | 7115b5d + working tree | npm test, build:check, browser: exit 0 | Run and classify existing checks | See task evidence below |
| P0.4 | PASS | 7115b5d + working tree | 45 task IDs and scope/route matrix recorded | Lock the scope and comparison criteria | See task evidence below |
| P1.1 | PASS | 7115b5d + working tree | 194 assertions; rendered staging and editorial review | Make staging explanations consistent | See task evidence below |
| P1.2 | PASS | 7115b5d + working tree | Five graph representation checks; detached image reviewed | Label diagrams and metadata honestly | See task evidence below |
| P1.3 | PASS | 7115b5d + working tree | Content diff and preserved advanced routes reviewed | Reduce competing terminology | See task evidence below |
| P1.4 | PASS | 7115b5d + working tree | Official claim/source map; staging local citations | Tie claims to useful sources | See task evidence below |
| P2.1 | PASS | 7115b5d + working tree | Node import/schema/routes/transitions; canonical fixture | Define canonical lesson and example data | See task evidence below |
| P2.2 | PASS | 7115b5d + working tree | Deep link, reload, Back/Forward and invalid routes in Chromium | Implement a small routing contract | See task evidence below |
| P2.3 | PASS | 7115b5d + working tree | Staging renderer/prediction/reset/browser journey | Render one minimal lesson shell | See task evidence below |
| P2.4 | PASS | 7115b5d + working tree | npm test, build and source/built parity pass | Integrate the shared module with build and tests | See task evidence below |
| P3.1 | PASS | 7115b5d + working tree | Published setup executed in PowerShell 5.1 and Git Bash | Create a reproducible staging practice setup | See task evidence below |
| P3.2 | PASS | 7115b5d + working tree | Five actual HEAD/index/disk/status/diff checkpoints | Implement all five staging checkpoints | See task evidence below |
| P3.3 | PASS | 7115b5d + working tree | All choices, reveal, retry and retained route checked | Add a meaningful prediction and feedback | See task evidence below |
| P3.4 | PASS | 7115b5d + working tree | Actual selected version/file commit; excluded checklist asserted | Add an independent transfer task | See task evidence below |
| P3.5 | PASS | 7115b5d + working tree | Source/built end-to-end; desktop/mobile screenshots | Check the whole lesson before expanding | See task evidence below |
| P4.1 | PASS | 7115b5d + working tree | Both themes reviewed; text contrast min 5.24 light/7.39 dark | Establish a restrained visual system | See P4 evidence below |
| P4.2 | PASS | 7115b5d + working tree | 320/390/768/1440 reflow, outline and expanded answers pass | Add the lesson outline and responsive reading layout | See P4 evidence below |
| P4.3 | PASS | 7115b5d + working tree | Real-Git diff excerpts, exact copy, failure/focus fallback pass | Improve command, output, and diff presentation | See P4 evidence below |
| P4.4 | PASS | 7115b5d + working tree | Keyboard next, named links, reset, reload/Back/Forward pass | Make movement through lessons predictable | See P4 evidence below |
| P4.5 | PASS | 7115b5d + working tree | Keyboard/focus/header/motion/44px controls; screen reader unavailable | Refine interactions and accessible semantics | See P4 evidence below |
| P4.6 | PASS | 7115b5d + working tree | Four representative theme/size images visually reviewed | Apply a deliberate visual review | See P4 evidence below |
| P5.1 | PASS | 7115b5d + working tree | Real Git, PowerShell 5.1/Git Bash setup and browser journey pass | Optional setup reuses practiceSetup; details below | P5.2 |
| P5.2 | PASS | 7115b5d + working tree | Actual tracked/untracked/ignored/index outcomes and browser journey pass | Independent mixed state and wrong restaging checked | P5.3 |
| P5.3 | PASS | 7115b5d + working tree | Full snapshots, focused paths, messages/parents and independent outcome pass | Source/built browser plus real Git | P5.4 |
| P5.4 | PASS | 7115b5d + working tree | Ten real Git checkpoints, exact refs/parents, abort and dirty-switch checks pass | Source/built browser, visual review and full npm suite pass | P5.5 |
| P5.5 | PASS | 7115b5d + working tree | Three-repository states, fetch invariance, independent task and divergence guard pass | Source/built browser and both actual shell setups pass | P5.6 |
| P5.6 | PASS | 7115b5d + working tree | Seven real Git checkpoints, transfer, canonical consequences and both shells pass | Source/built course browser and recovery visual checks | P6.1 |
| P6.1 | PASS | 7115b5d + working tree | Five canonical staging snapshots in existing zones; next/previous/reset and keyboard pass | Make the staging illustration follow real transitions | See P6 evidence below |
| P6.2 | PASS | 7115b5d + working tree | Before/after DAG nodes, parent arrows and refs match actual Git fixtures | Add before/after branch and merge views | See P6 evidence below |
| P6.3 | PASS | 7115b5d + working tree | Two-copy/server text comparison follows actual publication/fetch states | Add a compact remote comparison | See P6 evidence below |
| P6.4 | PASS | 7115b5d + working tree | Optional metadata disclosure; all scenario ID formats and detached agreement pass | Finish the example metadata disclosure | See P6 evidence below |
| P7.1 | PASS | 7115b5d + working tree | Validated return survives reload/search/Back/Forward | Final P7/P8 evidence below | P7.2 |
| P7.2 | PASS | 7115b5d + working tree | Relevant unstage/detached/sync teaching links exercised | Canonical recovery definitions unchanged | P7.3 |
| P7.3 | PASS | 7115b5d + working tree | Legacy routes, analyzer, filters, copy and print pass | Source and built final browser runs | P8 |
| P8.1 | PASS | 7115b5d + working tree | Section 10 outcome matrix passes | Final verification matrix below | P8.2 |
| P8.2 | PASS | 7115b5d + working tree | Source and built journeys exit 0; fingerprint checked | browser-source-final.json / browser-built-final.json | P8.3 |
| P8.3 | PASS | 7115b5d + working tree | Available viewport/theme/keyboard/motion/contrast checks pass | Explicit unavailable-environment gaps below | P8.4 |
| P8.4 | PASS | 7115b5d + working tree | Content corrections and final images reviewed | Itemised quality audit below; no known implementation defect | P8.5 |
| P8.5 | PASS | 7115b5d + working tree | npm ci/test, build:check/build and diff check exit 0 | Final terminal results below; no dependency/privacy scope expansion | Review-ready engineering |
| P9.1 | HUMAN_PENDING | 7115b5d + working tree | No actual participants available | Need 3–5 willing beginners; no fabricated sessions | Observe staging/branch/remote transfer |
| P9.2 | HUMAN_PENDING | 7115b5d + working tree | Depends on actual P9.1 observations | No demonstrated learner findings to address yet | Map findings to fixes and fresh tasks |
| P9.3 | PASS | 7115b5d + working tree | README/CONTRIBUTING updated; historical notices added | Reviewable local patch; description below | User review |
| P9.4 | OPEN | 7115b5d + working tree | No release authorization; no deployment attempted | Local production artifact tested, live verification pending | Authorized release and live smoke test |

## Executed checks

- npm run build:check: exit 0; baseline artifact minifies successfully.
- npm test: exit 0; 194 analyzer assertions and 33 recovery scenarios passed, including actual Bash and Windows PowerShell quoted-command scenarios.
- node tests/test-browser.cjs: initial module-resolution failure resolved using the existing installed module/browser paths; see Phase 0 and later source/built evidence.

## Decisions and gaps

- Browser baseline must precede UI edits; retain screenshots under ignored artifacts/.
- All real learner evidence remains HUMAN_PENDING when Phase 9 is reached; do not substitute simulated beginners. Deployment requires separate authorization.

## Phase 0 evidence

- P0.2: node artifacts/capture-learning-baseline.cjs exited 0. Chromium 151.0.7922.34. Screenshots artifacts/before-{desktop,mobile}-{light,dark}-{fix,learn,reference}.png and before-{desktop,mobile}-graph.png. Inspected mobile light Learn and desktop graph images: readable existing cards, repeated introductory hierarchy; graph anchor heading partly under sticky header; metadata falsely labelled live/actual. These are observations, not a claim that the full interface was reviewed.
- Staging recipe route #analogy-staging → #card-stage; browser Back restores #analogy-staging at desktop/mobile. No explicit exact-checkpoint return exists. Recorded in artifacts/learning-baseline.json.
- P0.3: node tests/test-browser.cjs exited 0 with PLAYWRIGHT_MODULE=D:/GitHub/terraformunstuck/node_modules/playwright/node_modules/playwright-core and CHROMIUM_PATH=C:/Users/dazzo/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe. Desktop 1440×1000/mobile 390×844: no page errors, overflow or sampled recovery contrast failures; keyboard focus and legacy routes passed. artifacts/browser-results.json. No new dependency. Windows PowerShell version 5.1.26100.9711. npm ci not rerun because installed locked build tools successfully executed; clean-install verification remains for final checks.
- P0.4: all 45 IDs tracked above; scope and route criteria recorded in baseline. Next bounded task P1.1.

## P1.1 staging accuracy

Learner difficulty: saving, staging and committing are confused, and a cart can imply files move away from disk. Changed primer, zone description and quiz feedback to describe copying current content to the index, later independent working edits, and committing the index. Existing graph subtitle and fourZoneData already distinguish saving/staging/committing and remain in place. Real-Git five-checkpoint assertions were added and passed in P3.2; no sentence-matching test added.

## Phase 1 checkpoint

- Task: P1.1. Changed: index.html primer/zone/quiz distinguish working content, staged content and commits. Verified: node tests/test-analyzer.js (194/194), browser render and editorial audit. Still unverified: five-checkpoint Git fixture planned for P3.2. Next: P1.2.
- Task: P1.2. Changed: example metadata labels, storage explanation, valid 40-hex illustrative SHA-1 values, detached HEAD arrow directly to c2, main retained at c3, branch note matches graph main at c3. Verified: node artifacts/check-teaching.cjs (exit 0, five scenarios; initially caught 41-character IDs, corrected); visually inspected artifacts/after-teaching-detached.png. Still unverified: fixture graph relationships reserved for P6; invented IDs are not actual Git objects. Next: P1.3.
- Task: P1.3. Changed: remotes introduction explains another repository and fetch/push, keeps pipelines in reference; zone labels use Git terms; removes vault/cart/camera shifts and rebase superiority wording in core explanations. Verified: diff review, preserved advanced cards/routes. Existing browser suite passed after teaching changes. Still unverified: remaining graph prose will be consolidated with real before/after scenarios in P6. Next: P1.4.
- Checks: node tests/test-browser.cjs initially failed existing focus-outline assertion at line 73; unchanged rerun passed both viewports with solid focus outlines and no page errors. Recorded as intermittent, not suppressed or weakened. npm run build:check after final terminology changes: exit 0. git diff --check: exit 0. No recovery.js changes or new dependencies.

## Official documentation checked on 6 November 2026

| Claim | Official source | Implementation/evidence |
| --- | --- | --- |
| add records current content for next commit; later edits need staging again | https://git-scm.com/docs/git-add | P1.1; P3 fixture pending |
| diff compares working/index; --staged compares index/HEAD | https://git-scm.com/docs/git-diff | Existing guidance; P3 fixture pending |
| HEAD may be symbolic or detached | https://git-scm.com/docs/git-symbolic-ref | P1.2 detached illustration |
| References and storage representations | https://git-scm.com/docs/gitrepository-layout and https://git-scm.com/docs/git-update-ref | P1.2 local citation; packed refs/backend caveat |
| Merge preserves parent relationships; rebase replays commits | https://git-scm.com/docs/git-merge and https://git-scm.com/docs/git-rebase | P1.3 removes preference claim; P6 fixtures pending |

Next bounded task: P1.4 complete the lesson claim/source map and useful local citations, then P2.1 shared canonical lesson model. Goal remains active.

## P1.4 claim/source map

| Lesson | Behavioural claims and official documentation |
| --- | --- |
| Setup | Local configuration and identity: git-config (to be checked while completing P5.1); do not present modern test runs as Git 2.23 proof |
| Inspect | Tracked/index/working and untracked observations: https://git-scm.com/docs/git-status; comparisons: https://git-scm.com/docs/git-diff |
| Staging | Current content is added to index: https://git-scm.com/docs/git-add; index is committed: https://git-scm.com/docs/git-commit |
| History | Recorded snapshot and commit metadata: https://git-scm.com/docs/git-commit |
| Branches | References/HEAD: git-symbolic-ref and gitrepository-layout; merge parents: https://git-scm.com/docs/git-merge |
| Remotes | Fetch and remote-tracking observations: https://git-scm.com/docs/git-fetch |
| Recovery | Working/index restoration: https://git-scm.com/docs/git-restore; inverse commit: https://git-scm.com/docs/git-revert |

The status/commit/fetch/restore/revert manuals were opened in this continuation. The new lesson links to add/diff/commit/status locally. Other lessons must include their relevant citations as added in P5. Displayed status is labelled illustrative; path/hash/summary variability explained. These sources do not replace executable evidence.

## P2: shared learning foundation

- Task P2.1: learning.js is a browser/Node module with no DOM, credentials, command execution or learner input. Canonical staging actions use explicit Git argv and exact editor writes; states declare HEAD/index/working/branch/status, initial/final state, prerequisites, feedback, transfer answer and reference. node tests/test-learning.js verifies unknown IDs, duplicate lessons, missing outcome/reference, invalid routes and pure transition isolation. Other lessons deliberately wait for the finished staging pattern.
- Task P2.2: index.html handles #learn and validated #learn/LESSON/CHECKPOINT in the existing router. Invalid IDs offer the outline without echoing input. Native links and history share that path. Browser checks cover deep entry, reload, Back/Forward, extra path segments and encoded invalid input. Existing reference search/filter and legacy journeys retained.
- Task P2.3: renderer supplies outcome, prerequisites, exact setup, editor/command/observation distinctions, index/HEAD/working comparison, prediction, transfer disclosure and named movement. Native controls; role=status for feedback; no completion score. CSS is a minimal reading layout; refinement remains P4.
- Task P2.4: build embeds the same learning.js alongside recovery.js; npm test includes tests/test-learning.js. npm test exit 0: 194 analyzer assertions, 33 recovery scenarios, learning data and Git fixtures. npm run build exit 0. Extended node tests/test-browser.cjs passed source and dist at 1440/390 with canonical data parity and no page errors. Build:check passed before shared module; rerun scheduled after this integrated milestone.
- Routing correction: removed two competing startup timers. Render the initial undo solution at end of synchronous setup, then apply the saved route once. The 120ms route timer could steal focus from a keyboard interaction; simply removing it exposed the earlier 0ms default-render overwrite of a recovery deep link. Both ordering problems corrected, existing checks retained. A fake-DOM analyzer run initially found an unguarded learning container listener; guarded it consistently with optional existing DOM elements.

## P3: complete staging lesson

- P3.1: exact published Bash and PowerShell 5.1 setup ran in real shells from isolated temporary parents. Explicit main branch, local example identity, editor-created plain text, no real remote/account. Fixtures isolate global config. P5.1 subsequently isolated inherited signing/hooks/pager settings locally in each fresh practice repository, with an explicit explanation; wider settings remain unchanged. Git 2.23 runtime compatibility remains unverified.
- P3.2: node tests/test-learning.js executes canonical actions and checks actual HEAD/index/file contents, porcelain columns, parent relation, diffs and precise tracked paths for all five checkpoints. Final Version 3 remains uncommitted.
- P3.3: browser journey exercises v1/v2/v3 reasoning, reveal/retry, accessible status and unchanged checkpoint. No inferred mastery.
- P3.4: executable independent task commits Tuesday while Wednesday stays on disk; checklist remains untracked, absent from commit/index and ordinary diff. Worked answer preserves action order and includes verification commands.
- P3.5: source/built browser journeys traverse checkpoints, copy exact commands, reset illustration, reveal transfer and reach reference. Baseline regression paths preserved. Exact explicit lesson/checkpoint return from a reloaded reference remains P7.1; browser Back works, so this unfinished integration is not hidden.
- Visual evidence: node artifacts/check-learning-layout.cjs exit 0; artifacts/staging-{320,390,768,1440}-{light,dark}.png and staging-layout.json. No page horizontal overflow at eight combinations. Inspected 390 light and 1440 dark full-page screenshots: readable comparison and controls, a stale introductory sentence above the lesson and redundant edit instruction to refine in P4. Full-page sticky header capture crosses the desktop image; inspect viewport captures for focused-element occlusion in P4.

Next task P4.1: refine staging hierarchy/styles and verify contrast, then finish the P4 layout/interaction checks before adding other lessons. Remaining full-course work, actual learner validation and deployment are not complete.

Staging milestone final verification: extended browser suite (including reference reload and browser Back) exited 0 for both source and built artifact. Separate results retained at artifacts/browser-source-staging.json and artifacts/browser-built-staging.json. npm run build:check and git diff --check exited 0. Next remains P4.1; goal active.

## P4: staging visual and interaction pattern

Task P4.1 / Changed: existing theme tokens, restrained spacing, 780px reading column, legible code, strong labelled controls; no new assets/packages. Verified: rendered light/dark lesson screenshots; sampled text minimum 5.24:1 light and 7.39:1 dark; primary control borders and keyboard outlines at least 3:1. Hover/focus/error states checked in both themes. Still unverified: full accessibility conformance is not established by this sample. Next: P4.2.

Task P4.2 / Changed: desktop checkpoint outline and single-column narrow layout, local scroll for wide comparisons, clearer course introduction and supplemental concept links. Verified: 320/390/768/1440 widths, both themes, long commands and expanded transfer answer, no page overflow. artifacts/learning-presentation.json and staging-layout.json; screenshots staging-WIDTH-THEME.png. Still unverified: second browser engine not installed (only Chromium present). Next: P4.3.

Task P4.3 / Changed: exact labelled diff excerpts show HEAD → index and index → working content; use -/+ symbols, explain omitted Git headers. Commands copy separately from output. Copy failure announces manual selection/copy and restores focus; temporary fallback textarea is removed even on exceptions. Verified: node tests/test-learning.js compares every displayed excerpt or empty comparison with real Git; browser checks exact copied content, multiline preservation and forced clipboard/fallback failure. Still unverified: OS clipboard integration beyond the controlled browser API. Next: P4.4.

Task P4.4 / Changed: retained named previous/next checkpoint links, position, current-step semantics and explicit browser restart. Verified: keyboard-only next, all route/history/reload/reset cases, no completion claims. Next: P4.5.

Task P4.5 / Changed: 44px primary targets, native fieldset/legend/buttons/details, status feedback, focus offsets. Verified: Tab/Enter navigates prediction and next checkpoint at all widths; visible outlines, reduced motion, heading/control visibility below actual header bounds. Found 768px sticky header taller than old 110px offset and corrected offset below 900px. CSS zoom 200% on desktop passes; 320px unzoomed reflow passes. Initial test applied CSS zoom2 to an already 320px viewport (effective 160px) and overflowed; corrected the matrix to distinguish required narrow reflow from desktop enlargement, without claiming that 160px is supported. Still unverified: actual browser-UI zoom and real screen-reader session; CSS zoom is only a reflow probe. Next: P4.6.

Task P4.6 / Changed: removed stale introduction on lesson routes, replaced repeated edit prose with a file-content label, separated output/diff excerpts, restrained reading width. Verified: visually inspected 390 light/dark and 1440 light/dark viewport images. Existing design, logo and local fonts retained. No brittle existing assertions were weakened. Still unverified: real beginner evaluation remains P9.1. Next: P5.1 optional setup, reusing canonical setup actions.

Checks at P4: node tests/test-learning.js and node tests/test-analyzer.js exit 0; extended node tests/test-browser.cjs exit 0, including eight viewport/theme contrast cases, control state contrast, keyboard, forced copy failure and desktop CSS enlargement. Full source/built regression will be repeated after integrated course changes. P4 available-environment gate passed with the named external/environment gaps.

P5.1 / Changed: optional setup lesson reuses practiceSetup and the same Git actions as staging. All direct-entry setups now check Git availability, parent outside an existing repository, printed location and local identity before committing. Expected non-repository preflight error is explained separately. Missing Git/identity guidance and official init/config/rev-parse citations added. Verified: node tests/test-learning.js checks fresh/initialized preflight, local identity, no global identity write, exact snapshot and read-only independent task; both published setup variants execute in actual PowerShell 5.1 and Git Bash. Source browser suite passes optional entry, snapshot, answer and next lesson plus all P4 checks. Still unverified: older Git runtime and external accessibility checks as previously recorded. Next: P5.2.

P5.2 / Changed: fresh gitunstuck-inspect setup with tracked notes/.gitignore, ignored scratch.txt and later untracked checklist. Predict selected path, interpret both porcelain columns, ordinary diff limits, and clean-status/remote-state limits. Independent task leaves staged/unstaged notes plus untracked checklist and ignored scratch. Verified: node tests/test-learning.js checks every file/index/commit/status, ignored marker, no remote, unchanged HEAD, untracked omissions and wrong restaging outcome. Source Chromium journey and canonical data parity pass; prediction feedback checks added for all choices. Shared setup renderer now lists every exact setup file. Official gitignore manual checked. Next: P5.3.

## P5.3 and integrated course checkpoint

Task: P5.3. Changed: history lesson in gitunstuck-history, with two tracked plain-text files, one focused time commit, complete-snapshot prediction and an independent checklist commit leaving a later time edit unstaged. Unchanged tracked checklist content remains in the commit; commit message conventions are not Git requirements. Official show/log manuals checked and cited.

Verified: node tests/test-learning.js asserts actual complete commit trees, file/index/disk contents, changed paths, parent identities, messages, empty staged diff, remaining working diff and no publishing remote. The independent changed path is checklist.txt while notes.txt remains a later working edit. All four published setup variants executed in actual Windows PowerShell 5.1 and Git Bash. Schema checks now reject unknown sources, missing independent outcomes and duplicate checkpoints.

Setup isolation refinement: practiceSetup omits imported template hooks via a per-init option and sets signing=false, the fresh repository’s hooks path and a plain pager locally. A fixture supplies failing inherited/template hooks, unavailable signing/pager programs and a different default branch; the authored setup still creates the correct main snapshot and leaves the inherited config byte-for-byte unchanged. This supersedes the initial P3 stop-on-inherited-protection limitation. These settings are explicitly scoped to fresh disposable practice directories.

Renderer preserves action order, including alternating editor and Git actions. Shared setup lists every declared file. Scrolling comparisons have a named region and a small-screen keyboard/sideways-scroll hint. The 320px inspector comparison is checked for local keyboard scrolling; the page itself stays within the viewport. Copy fallback removes its temporary textarea and returns focus even on exceptions.

Visual inspection: artifacts/inspect-320-checkpoint.png and history-1440-checkpoint.png reviewed after disabling screenshot transition capture. Readable action/output/observation distinctions and locally scrollable long comparison confirmed. Initial quick screenshots caught theme transition mid-frame and screenshot auto-scroll under the header; recaptured with reduced motion and explicit checkpoint heading scroll. No synthetic screenshot was presented as learner evidence.

Integrated checks: npm test exit 0 (194 analyzer assertions, 33 recovery scenarios, all current learning fixtures); npm run build and npm run build:check exit 0; git diff --check exit 0. Extended source and built Chromium runs cover all four current lessons, feedback choices, disclosures, routes, copy, legacy capabilities and P4 presentation matrix. Separate browser-source-p5-partial.json/browser-built-p5-partial.json under artifacts/ retain target-specific results.

Still unverified: Git 2.23 runtime, actual browser-menu zoom, second engine, screen reader and real beginner sessions. Explicit reference return remains P7.1. Next bounded task: P5.4 branches/merges/conflict, followed by remotes and recovery. P5 and the overall goal remain incomplete and active. No commit, PR, merge or deployment performed.

P5.4 / Changed: ten-checkpoint branch lesson, fast-forward, non-overlapping diverged merge, deliberate same-line conflict, explicit base/ours/theirs index state, chosen resolution and independent library branch. Symbolic b0-b8 labels distinguish commit identities from object IDs. Alternative abort keeps stop/check/consequence/source next to its command and reuses the canonical merge recovery limitation. The teaching commit -m completes the pending merge with an explicit message; the difference from recovery merge --continue is explained. No recovery.js change. Verified: node tests/test-learning.js passes all file/index/status/ref states, all nine commit parent/message relationships, no invented fast-forward commit, unresolved commit refusal, correct resolution, staging-marker limitation, clean-start abort, dirty carry and refused overwrite. Both actual shells execute branch setup. Source browser tests pass every checkpoint, refs, conflict display, feedback, abort copy, reload/reset and transfer. Visually inspected branches-320-checkpoint.png and branches-1440-checkpoint.png: local table scrolling retains three versions without page overflow; compact ref labels remain readable. Official merge/switch/ls-files manuals checked. Still unverified: older Git and external accessibility gaps; built parity will run with the integrated next lesson. Next: P5.5.

P5.5 / Changed: a fresh gitunstuck-remotes workspace contains learner, partner and shared.git. Canonical setup publishes the initial snapshot and clones a partner copy, with local example identities. All later commands use explicit git -C context and editor labels name the target copy. Five checkpoints distinguish partner commit, publication, stale learner origin/main, fetch and checked fast-forward. A compact text comparison shows both copies and the bare example server; the note comparison explicitly names learner/notes.txt. No hosted login is needed. Provider-specific limits remain explicit.

Verified: node tests/test-learning.js checks branch tips, remote-tracking tips, index/file contents and status in both copies, plus independent bare-server refs/committed content after every worked checkpoint and independent publication/fetch/integration. Both fetches leave actual learner HEAD, index, working content and status unchanged. The independent fast-forward ends with three real commits, with expected parent relationships and no invented merge. An additional divergent state makes --ff-only refuse while preserving learner state and server tip. The actual published workspace setup runs in Windows PowerShell 5.1 and Git Bash. Only controlled typed action arrays run; repository targets are checked to remain under the disposable workspace.

Browser and visual evidence: extended node tests/test-browser.cjs passed source and dist for every new branch and remote checkpoint, reference labels, conflict base/ours/theirs, prediction choices, abort copy, git -C fetch copy, transfer answers, reload/reset, old help/reference journeys and the eight P4 viewport/theme combinations. Target-specific results are artifacts/browser-source-branches-remotes.json and browser-built-branches-remotes.json. Visually inspected branches-320-checkpoint.png, branches-1440-checkpoint.png, remotes-320-checkpoint.png and remotes-1440-checkpoint.png. Mobile comparisons stack or scroll locally; no page overflow. Official fetch/push/clone/remote manuals checked and cited.

Integrated milestone: npm test exited 0 (194 existing analyzer assertions, 33 existing recovery scenarios, all current learning fixtures and twelve shell setup runs); npm run build:check, npm run build and git diff --check exited 0. recovery.js and package dependencies remain unchanged. The earlier P5.4 built-parity follow-up is now satisfied. Still unverified: Git 2.23 runtime, second browser engine, real screen-reader/browser-menu zoom checks and real beginners, as recorded above. Exact reference return remains P7.1. Next bounded task P5.6: choose among unstage, discard and revert using isolated practice states and canonical recovery prerequisites/consequences. The complete course, later visual/navigation integration, final audit and release are not yet complete. Goal stays active; no project commit, PR, merge or deployment performed.

P5.6 / Changed: recovery lesson distinguishes unstaging from discarding one working file and reverting a checked commit. Canonical recovery.js checks, risks, effects and sources appear before the operation; fixture-specific stop conditions remain visible. Checklist comparison demonstrates discard uses the index, which differs from HEAD, while preserving the wanted notes edit. The clean revert case targets the inspected non-merge parent and uses --no-edit only to accept the default message. A new mixed-state transfer asks for a justified choice and preserves current disk content. Verified: node tests/test-learning.js passes seven actual file/index/status/history checkpoints, unchanged wanted notes, staged-index discard source, four-commit retained history, parent relationships, and an incorrect discard choice in a disposable fixture. Published setup executes in both actual shells. Source/built browser suites pass every recovery checkpoint, all choices, canonical consequence text, prerequisite ordering, selected-file copy and answer. Course sequence now contains optional setup plus all six required lessons. Inspected recovery-1440-checkpoint.png; 320/1440 overflow checks pass. Official restore/revert manuals checked. Evidence files browser-source-course.json and browser-built-course.json retain targets. Next P6.1. Phase 5 engineering gate passes; compatibility, external accessibility and actual learner evidence limits remain explicit.

## P6 visual explanations

Task P6.1 / Changed: existing four-zone widget now uses the canonical five-checkpoint staging experiment. Working/index/HEAD notes show separate contents simultaneously; the remote is explicitly unused. Named native checkpoint selector, previous/next/restart, exact practice link, statuses and relevant operation details agree. Operation-type tabs no longer claim to advance a simulated file journey. Verified: browser compares every rendered snapshot/status context with shared definitions, goes backward/forward/reset and operates the select by keyboard; the definitions already passed real Git fixtures. staging-widget-390.png/staging-widget-1440.png retained; desktop visually inspected. Corrected scroll offsets so focused example controls and old visual anchors clear the sticky header. Still unverified: external accessibility gaps below. Next P6.2.

Task P6.2 / Changed: branch checkpoints render initial or before/after SVG graphs using the existing graph styles. HEAD, every reference, visible reachable commits and child-to-parent arrows come from canonical data; no future resolution commit appears while paused. Current tips start in view; wide histories scroll locally, with a native text-parent disclosure. Existing standalone rebase/detached diagrams remain reachable, with a direct course comparison link. Removed an unsupported never-lose-your-spot reassurance and a universal branch-workflow instruction. Verified: graph nodes/edges and parent order are compared with actual Git object relationships at every branch checkpoint; browser checks rendered edges, reachable node count, current tip visibility and arrow direction. Reviewed branch-comparison-1440-light.png and branch-comparison-390-dark.png. At all eight viewport/theme combinations sampled graph text minimum is 17.06:1 light/18.30:1 dark; meaningful marks minimum 5.48:1 light/6.43:1 dark. No certification inferred. Next P6.3.

Task P6.3 / Changed: retained the canonical compact remote comparison delivered in P5.5 rather than creating a duplicate. It shows local main, each copy’s observed origin/main and shared main separately, stacks on small screens and has direct text equivalents. Verified: every worked checkpoint and independent publication/fetch/integration matches three actual repositories; browser checks each displayed reference, stale observation, fetched observation and unchanged learner file versions. The display explicitly says illustration, not live connection. No network animation or hosted-state claim. Next P6.4.

Task P6.4 / Changed: existing metadata inspector is now optional native details/summary. Invented SHA-1 values are scoped to the standalone diagram, separately from course labels; packed/other storage and hash-format caveats remain. HEAD terminology now scopes the loose-reference example. Improved old node/edge contrast using existing theme tokens. Verified: browser opens disclosure by keyboard, visits all five standalone scenarios, checks 40-hex values/symbolic HEAD shape, and confirms detached HEAD/c2 diagram has three commits with main retained at c3. Existing source assertions retained. Next P7.1.

Integrated checks: npm test exited 0 with 194 analyzer assertions, 33 recovery scenarios, all seven lesson fixtures, graph/Git parent checks and fourteen actual shell setup runs. npm run build:check, npm run build and git diff --check exited 0. Extended source/built Chromium journeys passed; separate results artifacts/browser-source-visuals.json and browser-built-visuals.json. Each includes both existing desktop/mobile journeys and the eight presentation combinations. Source/built canonical lesson equality is asserted. No runtime dependency or recovery.js modification.

Still unverified: Git 2.23 runtime, second browser engine, real screen-reader session, actual browser-menu zoom and actual beginner transfer. CSS zoom/reflow and native keyboard tests are narrower evidence. Next bounded task P7.1 exact validated lesson/checkpoint return paths through reference reload and history. Remaining P7/P8/P9 work is not complete; goal stays active.

P6 final route regression: a final keyboard run exposed duplicate popstate/hashchange notifications recreating the same lesson and clearing feedback. The router now skips a URL already rendered, while imperative pushState and reference-filter replaceState invalidate that cache. A deterministic duplicate-event test preserves feedback; normal Back/Forward and reference-search journeys remain asserted. The earlier failing final browser run exited 1; after this correction source and built runs both exited 0. No test expectation was weakened. Analyzer assertions were rerun after the route change (194/194). Final available checks and remaining task scope are recorded above.

## Final P7/P8/P9 audit — 7 November 2026

P7.1 / Changed: lesson reference links carry an allowlisted lesson/checkpoint pair; reference offers an explicit exact return. Search/filter updates preserve validated context. Direct reference visits offer a relevant practice link without inventing a previous lesson. Unknown, duplicated or malformed context is rejected; arbitrary query fields are excluded. Verified: pure URL tests and source/built Chromium journeys include reload, search, return, Back/Forward and a same-document sentinel. A test initially captured search before its debounce completed; it now waits for the expected URL before checking history. Still unverified: none for the implemented local routing contract. Next: P7.2.

P7.2 / Changed: recovery recipes offer relevant practice links after their existing source, using shared mappings. Verified: unstage, detached and sync teaching destinations; canonical recovery data unchanged. P7.3 / Changed: ancestor disclosures open for old deep links; concept illustrations are optional below the course outline. Printing opens visible-destination disclosures and restores their prior state afterward. Verified: legacy hashes, analyzer, reference search/filter, clipboard, recipe sources and printed steps on source/built. Final disclosure testing initially toggled an already-open wrapper closed after a same-document deep link; the test now checks state before opening it. No production assertion was removed or weakened.

### Section 10 verification matrix

| Required behaviour | Actual evidence and result |
| --- | --- |
| Initial commit; stage/edit; commit staged version | Real staging HEAD/index/disk contents at all five checkpoints; working Version 3 survives committing Version 2: PASS |
| Selected-file commit; diff; untracked | Independent staging/history tasks inspect committed paths, excluded checklist, both diff directions and untracked status/diff distinction: PASS |
| Branch create/switch; fast-forward; diverged merge | Actual symbolic HEAD, refs and parent lists at all ten checkpoints; dirty changes carry where allowed and overwrite refusal preserves content; FF creates no commit: PASS |
| Conflict and detached HEAD | Deliberate conflict/unmerged index, resolved content and parents, abort and marker-staging negative case; detached standalone HEAD/ref/node agreement: PASS |
| Two-copy remote; fetch | Learner, partner and bare-server refs checked separately; stale observation demonstrated; fetch leaves learner HEAD/index/disk unchanged; divergence refuses FF: PASS |
| Unstage; discard; revert | Actual disk/index preservation, index-sourced replacement of only unwanted edit, inverse commit with original ancestors and wanted content retained: PASS |
| Routes and context return | Deep/reload/Back/Forward/unknown routes, duplicate browser events, exact reference return, malformed context and search preservation: PASS |
| Privacy | Terminal sentinel absent from URLs, observed requests, console and local/session storage; no new persistence or transmission: PASS |
| Rendering and copy | Source/built canonical data equality; exact clipboard command, rejection fallback/manual-copy announcement, cleanup and retained focus: PASS |
| Accessible use | Available environment matrix below: PASS within tested scope |
| Existing capability | 194 analyzer assertions, 33 recovery scenarios; browser analyzer, recovery, filters, legacy hashes and reference print: PASS |

### Available browser and visual checks

Windows, Chromium 151.0.7922.34, existing Playwright installation; source and built file URLs. Desktop 1440×1000 and mobile 390×844 exercise all lessons and existing destinations. Presentation matrix covers 320/390/768/1440 CSS px in light/dark themes, staging comparisons and branch graphs. No page overflow, page exceptions or console errors. Sampled lesson text minimum contrast 5.24 light / 7.39 dark; graph text 17.06 / 18.30 and meaningful marks 5.48 / 6.43. Keyboard navigation, visible focus, feedback announcements, 44px primary controls, reduced motion, clipboard errors, expanded transfer answers and desktop CSS zoom 2 passed. These checks do not establish full accessibility conformance.

Inspected final staging feedback at 390 dark, branch comparison at 1440 light and reference print preview, alongside the earlier theme/size/widget/remote/recovery images. Parent arrows and reference labels agree with fixtures; long comparisons scroll locally. The course outline leads directly to exercises; older explanations sit in an optional native disclosure. Final print preview includes recipe commands that were previously hidden in closed details; PDF saved locally. Source/built results are separately retained at ignored artifacts/browser-source-final.json and artifacts/browser-built-final.json; screenshots and reference-print.pdf are also local artifacts, not committed evidence bundles.

P8.4 quality corrections: staged copies versus moving files; editor save versus commit; clearly invented metadata; exact branch starting commit; branch creation separated from later commits; fast-forward separated from new merge commits; identical overlapping edits need not conflict; detached HEAD descriptions preserve needed work rather than promise safety; repeated lesson introductions hidden; advanced illustration controls disclosed on request. No known unresolved factual, navigation or visual defect identified by this review. This is implementation/self-review, not beginner evaluation.

Unavailable checks remain explicit: actual Git 2.23 runtime, second browser engine, real screen reader and actual browser-menu zoom. Git 2.23-compatible command syntax is not a verified old-runtime claim. Native keyboard/CSS zoom checks are narrower evidence. Actual beginner effectiveness remains HUMAN_PENDING.

### Build identity and review preparation

Base HEAD is still 7115b5d643bb1b6259aa13b2b615d07e1d8a0327 on feat/learning-course; changes are uncommitted. Final tested build records dirty working tree and source SHA-256 dc861e22fc5ff33fdd53469fe10778fa0b67ac75a93b6a3d53fb63c743aa12bc. The built browser test independently recomputes it from exact source/build inputs. Documentation/test-only edits do not change that fingerprint. npm ci completed successfully using the existing lockfile; npm run build:check and npm run build exited 0. Artifact is 378.5 KB minified / 82.5 KB Brotli. No runtime dependency, lockfile, recovery.js or workflow change. Final test terminal result is recorded below when available.

P9.3 review description: GitUnstuck previously offered concept illustrations without a complete practice sequence. The change adds optional setup and six linked lessons with executable practice states, predictions, independent tasks and reference returns. A learner can stage Version 2, edit Version 3, predict the next commit, and verify that Version 2 was committed while Version 3 remains on disk. Branch and remote diagrams now follow checked repository states. Shared definitions drive the source, self-contained build and real-Git outcome tests. README and CONTRIBUTING explain usage, authoring, environment scope and evidence limits; older proposal documents are labelled historical. Local branch/patch is reviewable; no PR was requested or opened.

P9.1/P9.2 remain HUMAN_PENDING: recruit 3–5 willing beginners for staging/branch/remote tasks, record anonymous task outcomes and assistance/misconceptions, then fix demonstrated issues and observe changed transfer tasks. No participants or observations have been invented. P9.4 remains OPEN pending release authorization: no commit, push, merge or deployment performed. A future authorized release must verify deployed revision/fingerprint, staging, recipe return and legacy recovery, and record its actual rollback revision/process. Phase 9 is not complete.

Final terminal results: npm test exited 0 after the integrated source changes: 194/194 analyzer assertions, 33/33 recovery scenarios, all seven lesson fixtures and independent outcomes, exact graph/remote relationships, negative states, inherited-config isolation and fourteen published setup executions (seven lessons × PowerShell 5.1/Git Bash). Source and built browser suites both exited 0. npm ci, build:check, build and final git diff --check exited 0; line-ending notices only. The canonical plan compares equal to the original supplied plan. All 45 task IDs are accounted for: 42 PASS, two HUMAN_PENDING, one OPEN for unauthorized release. Implementation and available validation are complete; human validation and release are separate pending states. No known remaining engineering task within the authorized objective.

## Ready-to-run beginner sessions

Prepared after implementation; no session has occurred. P9.1 and P9.2 remain HUMAN_PENDING. Use 3–5 willing Git beginners, anonymous IDs B1–B5, the same tested source or built artifact, and fresh lesson practice directories. Do not use participants' own projects. Record browser/OS/Git versions and which artifact they used. Explain that the interface is being evaluated; the participant can stop at any time. Do not record names, credentials or unrelated terminal content.

Let each participant work through the relevant lesson, then attempt its independent task with the worked answer closed. Ask them to predict the result aloud before changing repository state. They may consult the lesson or reference; record that use. Do not supply command names. If they request help, first ask what they expect to change; record any further hint or demonstrated command and whether it enabled completion.

| Task | Participant prompt | Facilitator checks after the attempt |
| --- | --- | --- |
| Staging | Save a Tuesday meeting note, select it for the next commit, then save a Wednesday revision. Add a new checklist. Record only the selected Tuesday note. Predict what will remain afterward. | Committed note is Tuesday; disk note is Wednesday; checklist is untracked and absent from the commit. Ask why saving Wednesday did not replace the selected version. |
| Branches | From the lesson's clean resolved state, create a branch for changing the meeting location to the library. Record the change there, return to main, and integrate it by fast-forward. Predict the branch tips and number of new commits. | Both tips reach the location commit; integration adds no extra commit; file content is correct. Ask whether creating a branch alone isolates uncommitted edits. |
| Remotes | In the partner copy, record and publish a Thursday meeting change. Predict all three relevant branch observations in the learner copy and shared repository. Retrieve the update, inspect the learner file before integration, then integrate appropriately. | Server and partner advance first; learner origin/main remains stale until fetch; learner main/file remain unchanged by fetch; integration updates them. Ask which operation first changed the learner file. |

These prompts match the existing tested independent tasks. Facilitator expectations are not participant instructions; avoid revealing them before the attempt. Use actual file/index/ref observations to distinguish a correct explanation from an accidentally successful command sequence. Stop on an unexpected repository state and preserve the anonymous finding rather than improvising destructive recovery.

For each participant/task, fill this record only after an actual observation:

| Participant/task | Prediction and explanation | Actual repository outcome | Lesson/reference/answer consulted | Assistance supplied | Hesitation or misconception | Proposed correction and fresh-task result |
| --- | --- | --- | --- | --- | --- | --- |
| Not yet observed | — | — | — | — | — | — |

Report independent completion, assisted completion or incomplete separately. No timing, success rate or quote exists until observed. For P9.2, map each serious observed problem to a specific correction and regression check; then use a fresh task with changed note/location details to check the affected concept. Record the real result and any assistance. A participant repeating the original worked answer does not establish transfer. Keep learner findings separate from the existing automated passes and do not change task status merely because this protocol is ready.

## Draft PR preparation

The user subsequently authorized opening a draft PR, including the necessary feature-branch commit and push. Earlier statements that no commit/PR was authorized describe the implementation checkpoint at that time. Remote main still matches baseline 7115b5d643bb1b6259aa13b2b615d07e1d8a0327. Publish the reviewed implementation and canonical plan/evidence on feat/learning-course; leave the original user-supplied untracked plan untouched. Real learner checks remain HUMAN_PENDING and release remains unauthorized. The PR description carries final commit identity and validation scope; the local dirty-build fingerprint above remains historical test evidence, not a claim about a deployed revision.

The first staged diff check, which includes newly tracked files, flagged the supplied plan's Markdown hard-break whitespace and extra final blank line. The canonical execution copy now removes that whitespace for publication; its wording is unchanged. The original supplied file remains untouched and untracked. Earlier exact-equality/diff-check statements describe the implementation checkpoint before publication normalization. No runtime input changed during PR preparation.
