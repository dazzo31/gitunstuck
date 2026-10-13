# Task evidence ledger

Baseline: bf839df2fe30001824fa5068ce471046925a186f. Self-reviewed; no independent peer review is claimed.

## Phase 0 — PASS

GU-0001–0005: baseline source inventory, executable defect probes, disposable Git fixtures and eight browser observations. CI https://github.com/dazzo31/gitunstuck/actions/runs/38310170424: success, 15 source/Git tests plus 8 Chromium scenarios. Local baseline: 15/15, exit 0. Original source unchanged in baseline commit ff5b4fccf79a4164269d8e4fede249cb14df02cc.

## Phase 1 — PASS

Each task inspected relevant inline JS/data/HTML and tests before changes. Changes preserve all 17 card IDs, existing task anchors, graph scenarios, mode/theme/print controls and subpath-compatible asset links.

| Task | Changed files | Verification | Remaining limits |
| --- | --- | --- | --- |
| GU-0101 | index.html; tests/foundation.test.mjs | 22 tests passed, exit 0; text-only recovery nodes; five code values exact; hostile img text cannot become an element | CI browser placeholders and hostile text pass; clipboard tests added in Phase 2 |
| GU-0102 | index.html; tests/foundation.test.mjs | 30 tests passed, exit 0; eight AND-composed query/category/effect cases | CI composed-filter regression passes |
| GU-0103 | index.html; tests/foundation.test.mjs | 31 tests passed, exit 0; real restore/unstage/revert-conflict fixtures; corrected index/shared-history/retention cautions | No general recovery guarantee; partial-state engine planned |
| GU-0104 | index.html; tests/foundation.test.mjs | 32 tests passed, exit 0; stash original branch; explicit branch/remote placeholders; real-Git stash fixture; version-sort and Git prerequisites | Official host CLI checks remain Phase 8; examples require substitution |
| GU-0105 | README.md; index.html | 32 tests passed, exit 0; branding corrected; absent image metadata removed; existing favicon retained | Original MIT claim lacks LICENSE; no new license invented |
| GU-0106 | index.html; tests/foundation.test.mjs | Effect flags overlap; no mutation workflow advertises inspect-only; no unconditional Risk: Safe labels | Dynamic operation/state risk engine planned in Phase 6 |

Sources consulted: official git-restore, git-revert, git-stash, git-reset, git-reflog, git-switch and git-tag documentation at git-scm.com. Text inspected against real Git 2.51.1 locally and baseline Git 2.55.0 in CI. The web UI never executes Git.

Browser tests run in GitHub Actions, not through an unsupported local preview. Baseline tests are frozen against fixtures; current source must independently pass foundation regressions. No production deployment or main-branch change is included.

Phase 1 gate: CI run https://github.com/dazzo31/gitunstuck/actions/runs/38310871166 passed 33 source/Git checks and 16 browser matrix cases (8 baseline, 8 corrected). Final force-push wording uses explicit lease prerequisites, explains background-fetch caveat, and removes one-click copying; locally rechecked 33/33. No independent peer review or human screen-reader test claimed. License provenance is explicitly unresolved, rather than creating an unverified LICENSE.

## Phase 2 — gate pending CI

GU-0201: package.json declares Node 24, pinned Playwright 1.56.1 and axe-core 4.10.3; npm generated package-lock.json with integrity hashes. `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` exited 0. Bash/PowerShell setup documented.

GU-0202: foundation tests cover literal rendering, hostile values, filter AND composition, corrected recovery semantics and overlapping effects; 18 current-source tests plus 12 frozen baseline checks. Phase 3 will add schema validation tests when schemas exist.

GU-0203: browser harness serves only the public build at /gitunstuck/ and adds clipboard-argument verification through a browser API stub, theme persistence/reload, printable layout and axe serious/critical gates. Browser runtime remains CI-only; no local browser run claimed. OS clipboard and human screen-reader review remain unverified.

GU-0204: 15 isolated real-Git scenarios cover index/working tree, soft/mixed/hard reset, amend, revert success and conflict, detached rescue, reflog, merge/rebase/cherry-pick conflicts and abort, original-branch stash, divergent push using a disposable bare remote, and unborn HEAD. Git environment overrides and inherited Git variables are isolated; hooks disabled. Initial detached fixture expected the wrong non-quiet symbolic-ref exit status; corrected to --quiet. Final `npm test`: 45 passed, 0 failed, exit 0.

GU-0205: `npm run check` and `npm run build` exited 0. Checks inspect IDs, task targets, local assets, JSON-LD and executable inline JavaScript. Build explicitly excludes tests, planning docs and Git metadata. Automated axe reports all violations and fails serious/critical results; moderate/minor issues are recorded for Phase 4. This is basic validation, not full HTML standards or WCAG certification.

GU-0206: quality.yml runs on v2.0 pushes/PRs and supports workflow_call. deploy.yml requires the reusable quality job, restricts deployment to main, scopes write permissions to its deploy job, and uploads dist only. Actual main deployment is not authorized or performed. Final CI verification pending.

### GU-0205 accessibility investigation and revised bounded fix

CI 38311554873 failed the serious/critical gate on existing active-button contrast and non-focusable code scrollers. The first correction fixed dark desktop contexts. CI 38311871069 ran all eight contexts and narrowed remaining failures to light graph selection/command-chip contrast and mobile graph-wrapper focus. No later-phase feature was started. Revised fix: explicit light-chip foreground, uniform high-contrast graph selection, named keyboard-focusable graph region. Gates remain enabled; no violations are suppressed. CI rerun pending. Local 45/45, content/build checks exit 0. This records both failures rather than claiming earlier runs passed.

Phase 2 final gate: https://github.com/dazzo31/gitunstuck/actions/runs/38312113731 succeeded at 82f2a7bf1dd5e84c61bf2f05b1d58f0da484f079. 45 source/Git checks, 8 frozen baseline and 8 current-browser scenarios, content/public build and serious/critical axe checks all pass. Progression to Phase 3 is now permitted.

## Phase 3 — implementation verified locally; CI gate pending

GU-0301: docs/decisions/001-static-modules.md records native ES modules, relative Pages asset paths, zero runtime dependencies, hash routing target and explicit compatibility API.

GU-0302: CSS extracted to assets/css/site.css, existing controller to app.mjs, trusted content to knowledge.mjs, filtering to filter.mjs and text construction to dom.mjs. All 17 legacy card IDs and task targets remain. Existing static reference content stays available without JavaScript.

GU-0303: schema.mjs validates command/workflow, observation, risk and provider models. Rejects malformed metadata, duplicate IDs, missing command refs, unsafe source protocols, executable SVG and uncontrolled explanation markup. No schema dependency added. Observation distinguishes known/unknown/not-applicable/contradictory. Tests exercise real validator rejection paths.

GU-0304: 18 literal snippets and 17 workflow metadata entries are canonical definitions. Runtime uses canonical snippet text; parity tests compare all 18 snippets with no-JavaScript HTML fallback. Five recovery and five graph definitions extracted without text changes. No legacy anchor renamed.

GU-0305: controller uses closure state and explicit copy/UI compatibility adapters; pure matching and text DOM helpers are separate. User text cannot enter trusted SVG/inline markup. Sources are HTTPS-validated. No eval/dynamic user execution introduced.

GU-0306: architecture and contributor guidance document boundaries, content authoring, safety review and test/build process. No proposed parser, recovery engine or simulator is described as already implemented.

Local verification: `npm test` 60 passed, 0 failed, exit 0; `npm run check`, `npm run build`, `git diff --check` exit 0. CI/browser parity gate pending; do not advance until it succeeds.

Phase 3 gate PASS: https://github.com/dazzo31/gitunstuck/actions/runs/38313033874 at c085c59542b9b7e621e093169d336755ddd720a0 passed 60 tests, content/public build, 8 baseline and 8 current-browser cases with accessibility gate.

## Phase 4 — local checks pass; browser gate pending

GU-0401: task-first landing, eight common problem entry points, local-first explanation and five primary destinations; native controls retained.
GU-0402: native hash links and route resolver preserve Pages subpath and old card anchors; hashchange supports back/forward; mobile menu uses aria-expanded; route context/focus follows navigation. Unknown/malformed fragments fail safely. Existing sections moved into task views without changing their IDs.
GU-0403: both explanation modes retain all 17 workflows and safety cautions. Advanced category remains available; jumping to a workflow does not silently change the mode. Static and canonical content parity remains enforced.
GU-0404: all 17 workflows have Inspect/Decide/Act/Verify panels, persistent warning, back/restart and different-result diagnostic return. These are prerequisite-aware reference guides, not the state-driven engine planned in Phase 6. Action alternatives are not one-click copied as a compound script.
GU-0405: provider/shell preferences are allowlisted and stored locally under gitunstuck.*; no diagnostic text is stored. Reset restores known preferences. CMD comment lines use REM and inline comments are removed outside quotes; PowerShell 5.1 avoids executable && outside quotes. Required placeholders remain literal until the user substitutes them. Formatting tests preserve quoted hashes/operators.
GU-0406: semantic links/selects/buttons, route focus, named graph/code scroll regions, responsive menu, reduced-motion jump behavior and contrast rules retained. Browser suite exercises all five views, stepper failure return and all-mode parity with axe across desktop/mobile and themes. Human screen-reader review remains a limitation, not a claimed pass.

Local: `npm test` 69 passed, 0 failed; `npm run check`, `npm run build`, `git diff --check` exit 0. New browser route/accessibility gate pending; no Phase 5 features started.

Phase 4 gate PASS: https://github.com/dazzo31/gitunstuck/actions/runs/38314289366 at 0d322583dc9d816cb1c2e2673a071b47a0aa2426 succeeded. 69 tests, 8 baseline and 8 current-browser contexts; all five routes/stepper failure path and serious/critical accessibility checks pass. Follow-up source review fixed query visibility outside Reference and route/step focus, locally verified. Public build now removes stale files; dedicated test proves no development material leaks.

## Phase 5 — local checks pass; CI gate pending

GU-0501: status.mjs implements non-NUL porcelain v2 --branch and scoped status -sb grammar. Unsupported long status remains unknown and requests canonical diagnostics.
GU-0502: attached/detached/unborn HEAD, SHA-1/SHA-256 OIDs, upstream, ahead/behind, index/worktree, untracked, rename/copy, conflicts and submodule indications. Paths remain literal; they are never executed or interpolated into commands.
GU-0503: freshness, live remote state and ongoing-operation identity always stay unknown. Counts are reported observations, never proof of a clean complete repository.
GU-0504: missing facts/contradictions generate specific read-only status, branch, HEAD and graph diagnostics. Unknown/malformed input never yields a destructive guess.
GU-0505: client-local labeled paste UI, UTF-8 100 KiB limit, clear control, local path details and redaction guidance. No logging/storage/network upload; editing input invalidates the prior result.
GU-0506: 16 golden states plus eight malformed/uncertainty scenarios; actual Git fixture confirms unborn, staged/unstaged, rename and detached parsing. Tests run locally with Git 2.51.1; CI Git version is recorded in its logs.

Local `npm test`: 95 passed, 0 failed; content/public build checks exit 0. Browser suite checks hostile filename text, unknown freshness, no diagnostic persistence and clear behavior. Phase 5 CI gate pending.

Phase 5 gate PASS: https://github.com/dazzo31/gitunstuck/actions/runs/38315854612 at 8e5e06f2e9a9224d625f4034c6ab83b61ec91e25 succeeded. 95 tests, content/public build and all browser route/accessibility scenarios pass.

## Phase 6 — local checks pass; CI gate pending

GU-0601: recovery.mjs validates nine atomic command definitions and eight workflow definitions. Rules expose no mutations for unsupported, contradictory, unknown-line or submodule states. Parsed freshness/operation/ownership never becomes an inferred fact; applicable user confirmations are explicit testimony.
GU-0602: six-stage wizard (Inspect/Diagnose/Prepare/Act/Verify/Recover-Abort), back/restart/different-result controls, in-memory session and intent-only share link. Different-result clears stale diagnostic evidence and confirmations; changing evidence resets readiness.
GU-0603: unstage, selected discard, unshared amend, ordinary shared revert, divergent push investigation, identified merge, detached committed rescue and retained-commit reflog rescue. Unborn, shared rewrite, unknown operation and missing target/remote facts yield diagnostic blockers.
GU-0604: exact affected surfaces, overlapping effects, reasoning, uncertainty and acknowledgement gates. Loss acknowledgement required for discard; amend needs unshared confirmation and rewrite acknowledgement. Parameterized or destructive actions are not blindly copied. Mixed high-risk legacy reference recipes also lose one-click compound-script copying.
GU-0605: merge resolution stages first, then fresh no-conflict evidence permits merge --continue. Revert/merge abort are conditional failure guidance. Wrong operation (e.g. rebase) blocks merge continuation. No automatic force-push, unrelated-history override or unstaged reflog recovery promise.
GU-0606: eight real-Git engine journeys execute the model’s trusted command syntax in isolated repos with controlled fixture substitutions; actual index/tree/refs/parents asserted. An additional revert-conflict fixture blocks repeat and aborts correctly. Tests never execute user-pasted input or touch development history/live remotes.

Local `npm test`: 133 passed, 0 failed; content/public build/diff checks exit 0. CI browser checks exercise blocked Prepare, verified unstage, no blind placeholder copying, share-link privacy and different-result reset; gate pending. Core web code still does not execute Git or upload diagnostics.

Phase 6 gate PASS: https://github.com/dazzo31/gitunstuck/actions/runs/38317457103 at af4b7c0b45e0634c088fdbfee22b8f290e070bbf succeeded. All 133 source/Git tests, public build and browser route/accessibility scenarios passed. Phase 7 is next; v2.0 is not release complete.

## Phase 7 — error catalogue; CI gate pending

GU-0701: versioned 24-family catalogue with deterministic canonical/regex/alias/token ranking. Scores describe match strength, not calibrated cause probabilities. Host mismatch downgrades confidence; aliases and fuzzy tokens cannot choose repairs.
GU-0702/0703: all requested error categories, separate HTTPS/SSH/write-access and local/remote ref errors, explicit cause alternatives, read-only allowlisted diagnostics, questions, safe next decisions and applicable gated recovery links. Official Git and GitHub documentation URLs opened successfully on 2026-10-13; per-entry review dates retained. Authentication is not tested against real accounts.
GU-0704: ephemeral error input with UTF-8 limit/control-character boundaries, text-only rendering, clear/edit invalidation and none-match return to status. No uploads, persistence or user-text command interpolation. Ambiguous/weak matches expose no recovery choice link.
GU-0705: canonical fixtures for every family, ambiguous could-not-apply/policy cases, provider mismatch, authentication distinctions, hostile text and real-Git failures. Browser suite now checks ambiguity, injection, no storage, edit invalidation and none-match focus. CI remains the phase gate.

## Corrective learning/help pass

The 2026-10-13 experience review superseded feature expansion. See CONTENT_INVENTORY.md and EXPERIENCE_ACCEPTANCE.md for scope, observed failures, corrections, actual screenshot review, source/CI examples and publishing correction.

Final application source 9802e2f793d089870ba3a3db285676ae67064f08: CI 38370326359 passed 179 tests, content/build, eight baseline and eight current experience contexts with four sizes/two themes, 64 accessibility states and no-JavaScript fallback. 49 screenshots captured; representative images actually viewed. Independent HTTP response verified current Home/title/removed misleading labels. Main remains unmerged; GitHub’s separate auto-Pages flow publishes v2.0.

Human screen-reader review and user design acceptance are open. No later feature roadmap was resumed. Passing these automated checks is not a production-readiness declaration.
