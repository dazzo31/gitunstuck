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
