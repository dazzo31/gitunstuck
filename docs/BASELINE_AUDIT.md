# GitUnstuck 2.0 — Baseline audit

Date: 12 October 2026. No application source has been changed. This is a Phase 0 investigation, not a completed v2.0 release.

## Repository and deployment

- Repository: https://github.com/dazzo31/gitunstuck
- Initial default branch: `main`; initial worktree: clean.
- Baseline HEAD: `bf839df2fe30001824fa5068ce471046925a186f`.
- Local implementation branch: `v2.0`, created from baseline at the user's request. Remote branch creation awaits GitHub account connection.
- Git: 2.51.1; Node: 24.19.0.
- Tracked baseline: `index.html`, `favicon.svg`, `README.md`, `.gitignore`, `.github/workflows/deploy.yml`.
- No AGENTS.md, package manifest, build system, test suite or lockfile in the baseline checkout.
- Pages workflow uploads the entire repository root on pushes to main or manual dispatch; no quality-check dependency. Before adding planning/tests to main, publish a dedicated public directory to avoid shipping internal development material.
- Live URL https://dazzo31.github.io/gitunstuck/ returned HTTP 200 using `curl -IL --max-time 20`; content type text/html. This confirms the public subpath responds, not browser behavior or exact byte parity with HEAD.

## Feature inventory

Source inspection and executable JavaScript probes confirm:

| Feature | Baseline | Verification limit |
| --- | --- | --- |
| Reference cards | 17, unique static IDs | No rendered visual inspection |
| Task-first chips | 12 links; all targets resolve | Click/scroll/focus not browser-tested |
| Modes | beginner/pro controls, advanced content hidden in beginner | Visibility/CSS not browser-tested |
| Search | token matching, category and risk controls, zero-results region | Runtime logic probed with isolated mocks |
| Recovery | 5 definitions and template renderer | Raw rendered template probed; actual DOM/clipboard not tested |
| Graph | 5 SVG scenarios and explanations | Definitions evaluated; layout not tested |
| CI starters | GitHub/GitLab/Bitbucket | Data evaluated; configs not provider-linted |
| Theme | guarded preference storage, system preference, toggle | Source inspection only |
| Keyboard | slash/Ctrl+K search hooks | Source inspection only |
| Copy | Clipboard API plus fallback and feedback | Source inspection only |
| Print | A4 print rules and card layout | Source inspection only |
| Accessibility | skip link, semantic buttons, live announcer, reduced motion | No WCAG conformance claim |
| Mobile | flex/grid/container sizing | No mobile browser observations |

## Prioritized defect register

All findings are tied to this baseline; review claims are not treated as proof.

| ID | Priority | Verdict | Evidence and impact | Task |
| --- | --- | --- | --- | --- |
| D01 | P0 | CONFIRMED | `renderUndoSolution`, index.html:2229–2254, inserts `data.code` through innerHTML. `<filename>` becomes markup rather than literal command text. Baseline probe captures raw markup; browser clipboard effect remains untested. | GU-0101 |
| D02 | P0 | CONFIRMED | `filterCards`, index.html:2572–2573, nonempty search explicitly bypasses category AND risk. Actual function evaluated with a destructive/cloud card still shows it under safe/essential filters. | GU-0102 |
| D03 | P0 | CONFIRMED | `undoSolutions` shared revert says No Conflicts and without causing merge conflicts (2210, 2215). Disposable real Git fixture produces UU conflict and REVERT_HEAD; abort restores previous tree. | GU-0103 |
| D04 | P0 | CONFIRMED | Undo card says restore copies committed version (1500). Real Git fixture stages A, edits to B, then restore yields A from index. | GU-0103 |
| D05 | P0 | CONFIRMED | Stash recipe switches to hotfix then pops without returning (1679–1682). Disposable fixture explicitly returns to original branch before apply and preserves stash for inspection. | GU-0104 |
| D06 | P0 | CONFIRMED | Shared recovery hardcodes origin/main; host matrix presents named default branches (1598). Repository-specific values must be evidence/placeholders. | GU-0104/GU-0804 |
| D07 | P1 | CONFIRMED | README uses GitSimple branding and guarantees automatic deployment; metadata refers to absent og-preview.png. README claims MIT but no tracked LICENSE; rights must be confirmed before adding one. | GU-0105 |
| D08 | P1 | CONFIRMED | Version-sort comment followed by git tag -l -n 1 (1983–1984); no version sort option. | GU-0104 |
| D09 | P0 | CONFIRMED | Safe/read-only filter mixes init, clone, stage/commit, branch, worktree, bisect and tag workflows with inspection. Effects require operation-specific modeling. | GU-0106 |
| D10 | P1 | CONFIRMED | Reflog text implies guaranteed 30–90 day recovery and zero data loss (1891–1911). Retention is configuration-dependent; arbitrary discarded unstaged edits are not commit recovery. | GU-0103 |
| D11 | P1 | UNVERIFIED CLAIM | Host matrix labels bb / Atlassian CLI official (1596); official provider capability verification has not run. Do not retain as established capability. | GU-0803 |
| D12 | P0 | CONFIRMED | Pages deploy has no checks; uploads entire repository root. | GU-0206 |
| D13 | P1 | CONFIRMED | CI starters omit dependency installation; node:latest used for GitLab/Bitbucket. They require explicit runtime/prerequisites and validation. | GU-1201–1204 |

## Reproducible evidence

Run from checkout on Node 24 with Git on PATH:

```text
node --test tests/baseline.test.mjs tests/baseline-git.test.mjs
```

Final result: **15 tests passed; 0 failed; 0 skipped; exit 0**. Twelve tests inventory/reproduce the original application baseline, using source inspection and isolated VM evaluations. Three execute actual Git only in unique disposable temporary repositories with local configuration. No example mutates the development repository, accesses real remotes or requires secrets. Temporary repositories are removed after each test.

Initial test-harness run: 10 pass, 2 fail caused by counting IDs inside SVG scenario strings and a missing mock style field. Corrected harness, then 12/12 passed. Adding real-Git fixtures produced 15/15. These baseline tests intentionally assert the presence of existing defects and must be replaced with corrected-behavior regression expectations during Phase 1; they are not a publish gate.

Official references consulted for semantics: https://git-scm.com/docs/git-restore, https://git-scm.com/docs/git-revert, https://git-scm.com/docs/git-stash. Current restore docs identify index as the default worktree source. Runtime behavior independently checked with Git 2.51.1. Other commands/provider capability verification remains outstanding.

## Phase 0 gate: BLOCKED

GU-0001, GU-0002, GU-0003 and GU-0005 have evidence. GU-0004 is incomplete: desktop/mobile, light/dark and beginner/developer browser observations have not run. Static inventory and VM mocks do not establish real layout, focus, clipboard or accessibility behavior.

The supplied plan requires this gate before Phase 1. The active Sites skill instructs: “If `$control-browser` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” The environment has no control-browser skill/tool. Playwright is present as a runtime dependency, but using it as an alternative would conflict with that instruction without a user override. No preview server or substitute browser was started.

Next task: complete GU-0004 through supported browser tooling, or obtain an explicit user instruction permitting an alternative verification method. Then record the Phase 0 gate result and begin GU-0101. Later phases remain NOT_STARTED; optional companion remains unapproved. No code, commits, pushes, tags or deployment have been made.


## Resolved baseline gate — 12 October 2026

Remote branch `v2.0` now exists. Baseline commit `ff5b4fccf79a4164269d8e4fede249cb14df02cc` adds investigation files and CI only, with no application changes. GitHub Actions run https://github.com/dazzo31/gitunstuck/actions/runs/38310170424 completed successfully: 15 source/Git checks and 8 browser matrix cases. CI uses Playwright 1.56.1 and Chromium 141 on an isolated GitHub-hosted runner; no unsupported local preview was started.

Widths 1440/390, both themes, both modes: all document widths equal viewport widths. Beginner mode shows 10 cards; developer mode 17. Recovery, merge graph, GitLab starter and slash focus work with no page errors. Browser confirms recovery placeholders are lost. Observations are automated, not human visual/screen-reader validation. GU-0004 and Phase 0 gate now PASS.

Original source snapshots are retained under tests/fixtures; baseline tests use those snapshots after application fixes. Corrected behavior requires separate regression tests.
