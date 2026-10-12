# Task evidence ledger

Baseline: bf839df2fe30001824fa5068ce471046925a186f. Self-reviewed; no independent peer review is claimed.

## Phase 0 — PASS

GU-0001–0005: baseline source inventory, executable defect probes, disposable Git fixtures and eight browser observations. CI https://github.com/dazzo31/gitunstuck/actions/runs/38310170424: success, 15 source/Git tests plus 8 Chromium scenarios. Local baseline: 15/15, exit 0. Original source unchanged in baseline commit ff5b4fccf79a4164269d8e4fede249cb14df02cc.

## Phase 1 — implementation verified locally; browser gate pending

Each task inspected relevant inline JS/data/HTML and tests before changes. Changes preserve all 17 card IDs, existing task anchors, graph scenarios, mode/theme/print controls and subpath-compatible asset links.

| Task | Changed files | Verification | Remaining limits |
| --- | --- | --- | --- |
| GU-0101 | index.html; tests/foundation.test.mjs | 22 tests passed, exit 0; text-only recovery nodes; five code values exact; hostile img text cannot become an element | Browser/clipboard gate pending |
| GU-0102 | index.html; tests/foundation.test.mjs | 30 tests passed, exit 0; eight AND-composed query/category/effect cases | Browser gate pending |
| GU-0103 | index.html; tests/foundation.test.mjs | 31 tests passed, exit 0; real restore/unstage/revert-conflict fixtures; corrected index/shared-history/retention cautions | No general recovery guarantee; partial-state engine planned |
| GU-0104 | index.html; tests/foundation.test.mjs | 32 tests passed, exit 0; stash original branch; explicit branch/remote placeholders; real-Git stash fixture; version-sort and Git prerequisites | Official host CLI checks remain Phase 8; examples require substitution |
| GU-0105 | README.md; index.html | 32 tests passed, exit 0; branding corrected; absent image metadata removed; existing favicon retained | Original MIT claim lacks LICENSE; no new license invented |
| GU-0106 | index.html; tests/foundation.test.mjs | Effect flags overlap; no mutation workflow advertises inspect-only; no unconditional Risk: Safe labels | Dynamic operation/state risk engine planned in Phase 6 |

Sources consulted: official git-restore, git-revert, git-stash, git-reset, git-reflog, git-switch and git-tag documentation at git-scm.com. Text inspected against real Git 2.51.1 locally and baseline Git 2.55.0 in CI. The web UI never executes Git.

Browser tests run in GitHub Actions, not through an unsupported local preview. Baseline tests are frozen against fixtures; current source must independently pass foundation regressions. No production deployment or main-branch change is included.
