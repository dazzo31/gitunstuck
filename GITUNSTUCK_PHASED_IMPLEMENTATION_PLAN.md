# GitUnstuck 2.0 — Phased Implementation Plan for an AI Coding Agent

**Repository:** https://github.com/dazzo31/gitunstuck  
**Live site:** https://dazzo31.github.io/gitunstuck/  
**Plan version:** 1.0 — 12 October 2026  
**Mission:** Transform the existing static Git reference into a trustworthy, accessible, deterministic, state-aware Git troubleshooting and interactive learning platform for GitHub, GitLab, Bitbucket and generic Git.

> **Execution instruction:** Work through the phases in dependency order. Do not skip tests or treat proposed architecture as existing implementation. Before modifying code, inspect the actual current checkout. Everything marked as a finding or design below is a hypothesis until confirmed against the checked-out revision.

---

## A. Non-negotiable operating contract

1. **Inspect before editing.** Record branch, HEAD SHA, dirty worktree, file structure, existing scripts, tests, deployment and working site behaviour. Preserve uncommitted user changes. Never silently reset, clean, rebase or force-push.
2. **One bounded task at a time.** Select the next unblocked task ID; state its objective, exact files expected to change, test plan and done criteria. Finish and verify that task before selecting another. Do not opportunistically implement unrelated features.
3. **Treat Git commands as safety-critical content.** Validate against official Git documentation and real Git execution in disposable test repositories. A syntactically valid command is not automatically safe; state matters. Never claim that `git revert` is conflict-free or that reflog can restore arbitrary uncommitted edits.
4. **Never execute pasted user commands.** The public website only parses and explains input. Git execution belongs solely in explicit, isolated integration tests or a future companion with independent consent controls. Integration tests may modify *only disposable repositories*, with local bare remotes for remote scenarios.
5. **Local-first privacy.** Parse status/error text client-side by default. Do not send pasted output, paths, names, tokens or remote URLs to analytics, hosted AI, telemetry or logs. Redact diagnostics in bug reports; never render user-supplied text through `innerHTML`.
6. **Preserve functionality during refactoring.** Keep the existing Pages deployment working, retain beginner/developer modes, theme, keyboard search, print presentation, recovery tree, command reference, visual graph, and multi-host material until equivalent or better replacements are verified.
7. **No invented external integrations.** Do not assume a default branch called `main`; do not invent Bitbucket CLI syntax, provider capabilities, API support, OAuth permissions or production-ready configuration templates. Verify on official current documentation; mark unsupported cases explicitly.
8. **Avoid unwarranted framework migrations.** Prefer lightweight modular HTML/CSS/JS, a minimal test toolchain, accessible native controls and static hosting. Introduce a framework/backend only through a written decision record demonstrating a real need.
9. **No silent deployment.** Committing, opening PRs, pushing and publishing require the operator's existing permissions and explicit instruction. Local implementation is not permission to mutate remote production. Protect the GitHub Pages publishing job behind checks.
10. **No unverifiable claims.** Every completed task must include changed files, executed tests, pass/fail counts, relevant output and remaining risks. Never report a test as passed when it did not run. If blocked, say exactly why.
11. **Be autonomous within scope, not directionless.** Do not repeatedly ask for already-known requirements. Make conservative, documented choices for minor decisions. Escalate genuine security, data-loss, repository-ownership, destructive-operation, major dependency or architectural decisions.
12. **Bound retries.** After two failed implementation attempts, stop editing, report the failure with evidence, isolate the cause, and revise the plan before retrying. Do not loop indefinitely or conceal failures.

### Recommended team roles (optional, if multiple models are available)

- **Orchestrator/Architect (e.g. Gemini/Antigravity):** owns phase boundaries, risk assessment, task selection, final validation and the progress ledger.
- **Implementer (e.g. DeepSeek through Ollama):** implements one scoped task and its tests.
- **Independent reviewer (e.g. GitHub Copilot CLI):** challenges safety assumptions, checks regression risk and reviews diff + test evidence, especially at phase gates.
- When delegating, show the *actual submitted prompt*, the agent's *user-visible response or summary*, and the orchestrator's independent verification. Never request or claim access to private reasoning traces. A single-model agent must perform the same checklist without faking reviews.

---

## B. Definitions, architecture, and success criteria

### Product pillars

1. **Fix My Git:** identify the problem, collect the minimum evidence, guide to a safe and verified outcome.
2. **Workflows:** task-first guided flows with diagnostic preflight, action, verification and alternate paths.
3. **Reference:** complete, searchable, technically correct command and error entries.
4. **Playground:** deterministic simulations of Git history and file states; no real repository access.
5. **Learn Git:** structured lessons, worked exercises and conflict-resolution challenges.

### Minimum cross-cutting data model (refine in Phase 3)

- `CommandDefinition`: stable ID, syntax, supported Git versions, shell notes, required parameters, affected scopes, possible hazards, documentation citations, validated examples.
- `WorkflowDefinition`: stable ID, symptoms/goals, prerequisites, diagnostic steps, decisions, actions, verification, fallback/abort paths, risk explanation, applicable hosts and shells.
- `DiagnosticObservation`: structured evidence plus confidence and provenance; distinguish **known**, **unknown**, **not applicable** and **contradictory**.
- `RepositoryState`: tracked branch / detached/unborn state, upstream, ahead/behind, index and working-tree changes, conflicts and ongoing operation, with partial-state support.
- `PlatformAdapter`: host-specific terminology, authentication guidance, review workflows, protections, CI templates and verified CLI support.
- `RiskAssessment`: affected surfaces (working tree, index, local history, refs, remote/shared history, disclosure), reversibility caveats, data-loss risk and required user confirmation.

**Architecture rule:** UI components display typed/validated definitions; they must not be the authoritative source of Git semantics. A risk result depends on the *proposed operation + observed repository state + user's intended outcome*, not solely on a static red/yellow/green tag.

### Overall definition of done

A release is done only when: (a) required tasks and tests pass, (b) existing flows remain functional, (c) new behaviour has appropriate keyboard and screen-reader coverage, (d) safety explanations have been checked against current Git docs and representative real Git repos, (e) content is truthful under incomplete evidence, (f) the product works when hosted at the GitHub Pages repository subpath, and (g) documentation, progress log and changelog are accurate.

---

## C. Mandatory execution protocol for every task

1. **Select** one unblocked task from `docs/IMPLEMENTATION_STATUS.md` (create in Phase 0). Record its ID and current phase.
2. **Inspect** the relevant source and tests, including call sites and dependent behaviours. Re-check earlier findings if the code changed.
3. **Plan briefly**: goal, files affected, invariants to preserve, focused tests to add first, risks and rollback.
4. **Implement minimal change** and create regression tests. Prefer small atomic diffs.
5. **Verify** focused tests, related regression suites, accessibility or browser checks where relevant, and production build/deployment smoke tests.
6. **Review** diff for scope creep, unsafe commands, XSS, broken links and unused code. Re-run tests after fixes.
7. **Record evidence** in the tracker: commands + exit status, case counts, new/modified files, decisions, follow-ups and honest PASS/FAIL/BLOCKED.
8. **Gate**: advance only when every exit criterion is met; otherwise stay in the phase or explicitly mark it blocked. Never call partial work complete.

### Standard progress reply format after each task

```
TASK: GU-### — <name>
PHASE: <number>  STATUS: PASS | FAIL | BLOCKED
BASELINE: <git SHA>  WORKTREE: <clean/dirty and reason>
CHANGED: <files and behavioural impact>
TESTS: <commands, counts, exit codes; distinguish not-run>
SAFETY/REGRESSION: <what was checked, what remains uncertain>
EVIDENCE: <links or file paths/line references>
NEXT: <one next unblocked task>
```

### Persistent tracker requirements

Create `docs/IMPLEMENTATION_STATUS.md` with a task register (ID, priority, dependencies, owner, status, evidence, blockers), current phase, verified baseline SHA, change log, decision log and known risks. Use statuses `NOT_STARTED`, `IN_PROGRESS`, `PASS`, `FAIL`, `BLOCKED`, `DEFERRED`. Update it **after** verification, not before. Store decisions in `docs/decisions/` only when an architecture/technology choice needs explanation. The tracked status is evidence, not a replacement for test output.

---

## D. Delivery milestones and dependency order

| Milestone | Phases | Outcome | Gate |
| --- | --- | --- | --- |
| **M1: Trusted foundation** | 0–3 | Accurate, tested and maintainable existing site | Baseline UX passes; destructive guidance audited; CI green |
| **M2: Troubleshooting product** | 4–7 | Usable navigation, local parser, recovery engine and error diagnostics | Scenario coverage + browser journey + unknown-state tests pass |
| **M3: Multi-host reference** | 8–9 | Verified host adapters and modern reference library | Core task parity on GitHub/GitLab/Bitbucket without invented CLI support |
| **M4: Interactive learning** | 10–11 | Validated graph simulator and conflict training | Simulation conformance + exercise accessibility tests |
| **M5: Optional expansion** | 12–13 | Template generator, optionally a local companion | Explicit operator approval; separate security review |
| **M6: Release hardening** | 14 | Deployable, documented quality-gated product | Full release matrix and manual smoke tests pass |

**Sequence:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 14. Phase 13 is optional, starts only after Phase 7 and its own approval gate. Some content tasks in Phases 8–9 may proceed in parallel once Phase 3 schemas are stable, but never at the expense of phase-gate verification.

---

## Phase 0 — Establish evidence and protect the baseline

**Goal:** Understand what currently exists, distinguish genuine bugs from stale review claims, and define a reproducible baseline.

- [ ] **GU-0001** Read README, `index.html`, `.github/workflows/*`, assets, deployment settings and any tests/scripts. Record current SHA, branch, working-tree state and Git version.
- [ ] **GU-0002** Inventory existing features: task links, mode switch, search/filter, recovery tree, graph demos, copy-to-clipboard, print, theme, and GitHub/GitLab/Bitbucket material.
- [ ] **GU-0003** Reproduce and record suspected issues with evidence: `<filename>` placeholders rendered via HTML; search query overriding risk/category filters; published-revert safety claims; stash sequence; hardcoded `main`; README GitSimple branding; assumptions about Git version and hosted CLIs.
- [ ] **GU-0004** Establish a user journey baseline and document screenshots or structured test observations for desktop/mobile, light/dark, beginner/developer modes.
- [ ] **GU-0005** Create `docs/IMPLEMENTATION_STATUS.md`, `docs/BASELINE_AUDIT.md`, a prioritized defect list and the first passing smoke checks; confirm GitHub Pages serves from `/gitunstuck/`.

**Exit:** Each suspected issue is marked CONFIRMED/NOT_REPRODUCED/CHANGED with file/function or URL evidence; baseline suite can run repeatedly; no destructive repo operations used. **Do not** refactor during Phase 0.

## Phase 1 — Fix correctness, security and safety defects (P0)

**Goal:** Remove misleading guidance and rendering/filtering defects before adding features.

- [ ] **GU-0101 — Safe rendering:** Replace dynamic interpolation of command text and pasted content into `innerHTML` with text nodes/`textContent` or safe DOM construction. Preserve intended trusted markup only through controlled templates. Verify rendered and copied literal `<filename>`/`<commit-id>`; include hostile text/XSS cases.
- [ ] **GU-0102 — Filter composition:** Combine search query AND category AND risk; avoid silently exposing commands filtered out by risk. Explicitly document any 'search all' override. Verify mode changes and zero-results state.
- [ ] **GU-0103 — Undo/recovery audit:** Correct working-tree versus index behaviour for `git restore`; `git revert` can conflict; `reflog` does not restore arbitrary discarded uncommitted edits; `reset --soft` changes history and is not universally safe. Explain pushed/shared history caveats.
- [ ] **GU-0104 — Workflow audit:** Correct stash return-to-original-branch step, reset/rebase/merge continuation guidance, tag sort wording, Git minimum versions, branch placeholders and platform assumptions. Remove assertions that any named branch is universally the default.
- [ ] **GU-0105 — Trust and hygiene:** Repair README branding, repo-specific links, missing assets, stale examples, version statements and licensing claims; add a real `LICENSE` file only after confirming intended rights/license.
- [ ] **GU-0106 — Risk semantics:** Define `inspect`, `local-change`, `history-rewrite`, `data-loss-potential`, `remote-publish` as effects/flags, not a simple mutually exclusive ranking. Keep accessible, explicit cautions and confirmation guidance.

**Focused tests:** command placeholders preserved in DOM and clipboard; search filters combine; dangerous commands have preflight + verification text; representative restored/reverted states reproduce in sandbox; no XSS from sample terminal text.

**Exit:** All P0 issues resolved or specifically blocked with documented reason; no command marked unconditionally safe if context can make it destructive. Ensure regressions pass before architectural migration.

## Phase 2 — Testing infrastructure and publish gates (P0)

**Goal:** Make Git correctness and browser behaviour independently verifiable.

- [ ] **GU-0201** Add minimum supported runtime/test tools and a lockfile if dependencies are introduced; document setup on Windows (PowerShell) and at least one CI runner OS.
- [ ] **GU-0202** Add unit tests for filter logic, renderer escaping, data validation, placeholders and risk rules.
- [ ] **GU-0203** Add browser tests for homepage journeys, query + risk filters, copied snippets, keyboard shortcuts, links, modes, mobile responsive layout and dark/light theme.
- [ ] **GU-0204** Add real-Git integration harness that creates disposable repositories and disposable local bare remotes; assert real exit codes, index/tree, commit/ref states and conflicts. Test `restore`, `reset`, `revert`, merge, rebase, stash, reflog and divergent pushes.
- [ ] **GU-0205** Add content validation, basic accessibility checks, HTML/JS syntax checks and a reproducible local smoke test for Pages subpath deployment.
- [ ] **GU-0206** Update GitHub Actions so quality gates run on PRs and deployment requires successful checks; scope workflow permissions minimally; preserve existing deployment behaviour.

**Exit:** Tests run locally and in CI, fail for intentional fixture regressions, and block publishing on failures. No test command is fake or silently skipped. Test harness cannot touch user repos or live remotes.

## Phase 3 — Modularise with behavioural parity (P1)

**Goal:** Separate knowledge, state, UI and host adapters without creating a giant rewrite.

- [ ] **GU-0301** Record architecture decision: static Pages, no backend required for core app, routing strategy compatible with `/gitunstuck/`, module/build approach and minimum supported browsers.
- [ ] **GU-0302** Extract CSS, application bootstrap, UI components, filtering/search and recovery data from monolithic HTML incrementally.
- [ ] **GU-0303** Create JSON/JS/typed schema for `CommandDefinition`, `WorkflowDefinition`, `DiagnosticObservation`, `RiskAssessment`, `PlatformAdapter`; choose a schema-validator with justified footprint.
- [ ] **GU-0304** Move command and workflow content in small batches, diff old/new rendered text and verify ID + URL stability. Put validation in CI and cross-link related workflows.
- [ ] **GU-0305** Establish safe rendering helpers, trusted-content boundaries, parser error boundaries and no global implicit state. Avoid dynamic evaluation and executing arbitrary user inputs.
- [ ] **GU-0306** Add documentation: architecture, content authoring, safety-review checklist, how to run/tests and migration decisions.

**Exit:** No loss of current features, URLs/anchors, keyboard operation or theme; baseline regression suite still green. All published recipes have unique IDs and validated schemas.

## Phase 4 — Task-first UX and accessibility (P1)

**Goal:** Make first use about the user's intent: **Fix My Git**, **Workflows**, **Reference**, **Playground**, **Learn Git**.

- [ ] **GU-0401** Rework landing page around problem search, common problems and clear entry points. Keep most-used workflows one or two interactions away.
- [ ] **GU-0402** Introduce responsive shell/nav: mobile menu, breadcrumbs, persistent task context and direct links to routes. Preserve browser back/forward; static-host-compatible routing.
- [ ] **GU-0403** Keep beginner and developer modes as **explanation depth**, not inconsistent datasets. Do not hide safety warnings in advanced views.
- [ ] **GU-0404** Create stepper/diagnostic panels with distinct observation, action, expected outcome, danger and alternative sections.
- [ ] **GU-0405** Add shell selector (PowerShell/Bash/CMD) and provider selector (GitHub/GitLab/Bitbucket/generic). Store **preferences only** locally with clear reset; avoid shell-unverified snippets.
- [ ] **GU-0406** Accessibility audit: native semantic controls, labels, focus/keyboard order, accessible SVG explanations, reduced motion, color-independent danger labels, WCAG 2.2 AA target.

**Exit:** Desktop and mobile test journeys work; no inaccessible custom click targets; old site capabilities retained or intentionally superseded with parity evidence.

## Phase 5 — Deterministic repository state interpreter (P1)

**Goal:** Convert pasted status output into explainable structured observations without command execution.

- [ ] **GU-0501** Support `git status --porcelain=v2 --branch` as canonical machine input and a clearly scoped human-friendly `git status -sb` subset. Define parsing grammar and fixture corpus.
- [ ] **GU-0502** Parse branch/upstream, detached/unborn HEAD, ahead/behind, index and worktree changes, untracked, rename, conflicts and supported submodule indications. Handle unknown and malformed lines conservatively.
- [ ] **GU-0503** Distinguish **freshness unknown** and **remote state unknown**; status is not a live host query. Never assert branch protection, whether commits were shared, or complete operation state from a single pasted status.
- [ ] **GU-0504** When status is insufficient, issue specific read-only diagnostics (e.g. `git branch -vv`, `git log --graph`, `git diff`, inspect in-progress operation). Collect only necessary output.
- [ ] **GU-0505** Build client-side paste UI with sanitization, redaction hints, size limits, empty-state and clear/reset. Never upload or execute inputs.
- [ ] **GU-0506** Add golden fixtures across supported Git versions and formats; test status permutations and recovery from malformed input.

**Exit:** Parser passes golden tests, does not hallucinate facts on partial input, and provides at least 12 representative repository states with expected explanations. Every state yields a diagnosis, a read-only follow-up, or an explicit unknown—not a guessed destructive command.

## Phase 6 — Guided recovery and safety decision engine (P1)

**Goal:** Provide Inspect → Diagnose → Prepare → Act → Verify → Recover/Abort workflows.

- [ ] **GU-0601** Define an auditable rules engine that maps observations + user intent + prerequisites to possible workflow steps. Rules return reasons and uncertainties, not only command strings.
- [ ] **GU-0602** Implement wizard navigation: back, restart, share non-sensitive flow link, 'I got a different result', progress indicator and local session state. Never include pasted output in shared URL.
- [ ] **GU-0603** Implement at least eight tested end-to-end journeys: unstage, discard work with warning, amend local commit, revert shared commit, rejected push (divergence), merge in progress, detached-HEAD rescue and reflog-based **committed** work recovery.
- [ ] **GU-0604** Add context-aware risk panel: affected surfaces, possible loss, collaborative effects, preflight, expected state, failure/abort path. Ask for explicit user acknowledgement before exposing one-click copy for particularly destructive sequences where useful.
- [ ] **GU-0605** Implement state-specific result interpretation, including conflicts, unsupported scenarios and contradictions. If facts are insufficient, request diagnostic evidence rather than guessing.
- [ ] **GU-0606** Test complete flows in disposable Git repos; include paths in which the first action fails and the user must branch to alternative instructions.

**Exit:** No dead-end flow without a safe next diagnostic step. All action flows show prerequisites + verification and have real-Git tested semantics. Neither web UI nor pasted text executes Git.

## Phase 7 — Git error troubleshooting catalogue (P1)

**Goal:** Route natural-language and pasted errors to validated diagnoses without conflating multiple causes.

- [ ] **GU-0701** Build versioned error-pattern definitions and a deterministic ranker with exact-text, canonical error, synonyms, platform context and confidence scores.
- [ ] **GU-0702** Cover initially at least 20 common errors, including: rejected/non-fast-forward push; authentication and permission failures; missing Git repo; unfinished merge/rebase; untracked-file overwrite; unrelated histories; invalid refspec; detached HEAD; bad revision; lock file; missing upstream; divergent pull; cherry-pick conflict; local changes blocking switch; push protection; tag already exists; credential helper errors; remote not found.
- [ ] **GU-0703** For each error include probable causes, diagnostics, differentiating questions, recovery routes, supported hosts and last-reviewed documentation links.
- [ ] **GU-0704** Implement search ranking, ambiguity handling, safe error display and 'none of these match' pathway. Include fuzzy query terms without turning weak matches into high-confidence repair commands.
- [ ] **GU-0705** Add fixtures with similar errors but different causes; show the correct branch of diagnostic logic.

**Exit:** At least 20 documented/verified patterns; no generic dangerous 'fix' for ambiguous errors; all catalogue links resolve.

## Phase 8 — GitHub, GitLab, Bitbucket and generic Git (P1)

**Goal:** Make Git operations host-neutral and collaboration workflows provider-specific.

- [ ] **GU-0801** Define adapter capability manifest and validation: PR/MR terminology, CLI availability, authentication, branch rules, review, pipelines, releases, SaaS vs self-managed constraints.
- [ ] **GU-0802** Support provider selection and per-provider workflow views for clone, auth prerequisites, branch/push, review, policy-related rejection, CI investigation and release guidance.
- [ ] **GU-0803** Verify actual installed/documented official CLIs (`gh`, `glab`) and Bitbucket's supported web/API/tool options before showing executable examples. Treat any claimed `bb` command as unverified until proven.
- [ ] **GU-0804** Eliminate universal assumptions about `origin`, branch name, remote URL syntax or default integration strategy. Use actual input or prominent placeholders with substitution guidance.
- [ ] **GU-0805** Add side-by-side host Rosetta Stone driven by the same adapter manifest; prevent documentation drift from examples in other views.
- [ ] **GU-0806** Verify representative host-specific steps against official current docs, with unit/schema/browser tests; external API tests are optional and must not require secrets in public CI.

**Exit:** Shared Git flows have equivalent semantics across hosts; host-only steps are accurately labelled and linked; unknown capabilities are not invented. UI changes when provider changes and copy text follows the selection.

## Phase 9 — Search and command reference as structured knowledge (P2)

**Goal:** Make the reference useful without needing expert vocabulary.

- [ ] **GU-0901** Create stable reference pages for each command with syntax, parameters, Git-version notes, effects, preflight, examples, verification, related errors/workflows and authoritative sources.
- [ ] **GU-0902** Add intent aliases: `undo git add` → unstage; `push rejected` → investigate divergence; `lost branch` → rescue; preserve filters under query.
- [ ] **GU-0903** Add side-by-side comparisons: fetch/pull, merge/rebase, reset/revert, restore/checkout, stash pop/apply, switch/worktree, cherry-pick/merge.
- [ ] **GU-0904** Add safe code examples by shell, placeholder interpolation rules, deep links, copy feedback and copy restrictions for dangerous flows.
- [ ] **GU-0905** Add print and no-JavaScript graceful fallback for essential reference content where feasible.

**Exit:** Search and navigation tests pass across aliases, filters, views and providers; zero unescaped placeholders; every workflow points to the same canonical command definitions.

## Phase 10 — Interactive Git simulator (P2)

**Goal:** Upgrade static graph scenarios into a local deterministic virtual repository.

- [ ] **GU-1001** Define simulator state: commits, parents, refs, HEAD, index, worktree, remote-tracking state, active operation, event history. Support test fixtures and resetting to initial state.
- [ ] **GU-1002** Implement limited operations incrementally: commit, branch, switch, merge, revert, cherry-pick, soft/mixed/hard reset, rebase and conflict states. Do **not** imply it is a full Git implementation.
- [ ] **GU-1003** Render commit graph from state and animate transitions optionally; accessible textual representation is mandatory. Distinguish merge commits and rebased new IDs.
- [ ] **GU-1004** Add step-through, undo **simulation**, reset, timeline and command explanations. Undo simulation must never be confused with executable Git recovery.
- [ ] **GU-1005** For every supported operation add real-Git conformance fixtures and regression tests (especially ancestor/parent/ref effects, conflicts, staged vs unstaged changes).

**Exit:** Simulator works entirely offline/client-side, never executes shell commands, and agrees with its documented real-Git test scenarios. Unsupported commands return honest explanations.

## Phase 11 — Conflict trainer and progressive lessons (P2)

**Goal:** Turn the simulator into usable practice.

- [ ] **GU-1101** Implement conflict scenarios: same-line edit, modify/delete, rebase conflict, cherry-pick conflict. Explain conflict markers, result selection and correct continue/abort actions.
- [ ] **GU-1102** Explicitly teach differences between merge, rebase and cherry-pick, including 'ours/theirs' context caveats.
- [ ] **GU-1103** Create Beginner → Intermediate → Advanced tracks with short goals, practice tasks, hints, correct-answer reasoning, retry and completion criteria.
- [ ] **GU-1104** Store only optional, non-sensitive progress locally with reset/export, and never gate essential recovery help behind lessons.
- [ ] **GU-1105** Test exercises via keyboard and screen reader; challenge completion must be based on correct simulated repository state, not just button clicking.

**Exit:** At least four conflict exercises and three short learning tracks have verified outcome checks and accessible alternatives.

## Phase 12 — CI/CD example and generator improvements (P2, optional after M3)

**Goal:** Offer accurate provider/language templates without publishing unsafe defaults.

- [ ] **GU-1201** Inventory supported providers and project types; choose narrow initial presets (e.g. PowerShell, Node, Python) with verified versions and clear prerequisites.
- [ ] **GU-1202** Generate config for the selected provider, language, commands and pipeline intent. Validate schema/YAML and escaping. Clearly mark placeholders, required permissions and secrets.
- [ ] **GU-1203** Explain runner assumptions, caching, PR/MR triggers, branch policy, secrets and failure diagnosis; never insert unverified auto-deploy steps.
- [ ] **GU-1204** Test outputs using available provider linting and local validators where possible; document validation gaps honestly.

**Exit:** Templates are syntax-validated, provider-appropriate, and do not embed tokens or imply automatic deployment.

## Phase 13 — Optional read-only CLI / VS Code companion (P3, separate approval)

**DO NOT BEGIN without explicit approval after the web engine is validated.**

- [ ] **GU-1301** Threat-model installation, path handling, workspace trust, subprocess invocation, repository access and telemetry; choose minimal permissions.
- [ ] **GU-1302** Make default operation strictly read-only and inspect Git state using known safe command arguments; no arbitrary text-to-shell execution.
- [ ] **GU-1303** Send only user-approved, appropriately redacted local state to the diagnostic engine; link to web workflows without leaking private data in URLs.
- [ ] **GU-1304** Require separate clear user confirmation for any mutating action in any future version; include preview and cancellation.
- [ ] **GU-1305** Test Windows PowerShell and supported POSIX platforms; publish security limitations.

**Exit:** Companion passes separate privacy/security review. If unapproved, mark `DEFERRED` and proceed to Phase 14.

## Phase 14 — Release validation and maintenance (all milestones)

**Goal:** Close the loop with reliable deployments and maintainable content.

- [ ] **GU-1401** Execute full test matrix: unit, integration with disposable repos, browser, responsive, accessibility, content validation, security, GitHub Pages subpath and offline/basic failure states.
- [ ] **GU-1402** Manually verify eight user journeys end-to-end on desktop and mobile, including failures/uncertain diagnostics, all hosts, light/dark and beginner/developer modes.
- [ ] **GU-1403** Audit for unbounded storage, data leakage, user-text injection, script/URL injection, stale Git CLI assumptions, broken anchors and command-copy surprises.
- [ ] **GU-1404** Update README, contribution guide, architecture, known limitations, test instructions, screenshots, feature matrix, change log and compatibility matrix.
- [ ] **GU-1405** Produce final release evidence: baseline vs current SHA, diff summary, release notes, tests with exact outcomes, open risks, deferred work and rollback method.
- [ ] **GU-1406** Stop before push/merge/deploy unless authorized. After authorized deployment, independently verify the published site and compare with the expected build.

**Exit:** No P0 failures; required CI green; public examples and recovery warnings audited; deployment status verified; tracked deferred items explicit. No premature 'production-ready' claim.

---

## E. Required Git scenario fixtures

Build these as isolated, repeatable arrangements rather than editing real user repositories:

| Fixture | Setup | Required assertion |
| --- | --- | --- |
| Staged vs unstaged | Stage version A; modify to B | `git restore` affects worktree to A, not automatically HEAD |
| Unstage | Stage a file | `git restore --staged` changes index, preserves working file |
| Hard reset | Create uncommitted tracked change | Warning that the change can be discarded, no guaranteed reflog recovery |
| Local amend | Commit then amend before share | New commit identity and preserved intended tree |
| Revert succeeds | Revert ordinary commit | New inverse commit; history not rewritten |
| Revert conflicts | Intervening changes overlap | Conflicts possible, must not be advertised as conflict-free |
| Diverged branch | Local bare upstream + distinct local/remote commits | Ahead/behind interpretation correct; no blind force-push |
| Detached HEAD | Commit while detached | Rescue branch can preserve reachable commit |
| Reflog recovery | Lose ref to **committed** work | Rescue branch resolves while object retained |
| In-progress merge | Create conflicting edits and merge | Guidance distinguishes conflict resolution and abort |
| Rebase in progress | Replay conflicting commits | Guidance distinguishes rebase continuation/abort |
| Stash across branch | Stash on feature, switch hotfix, return | Restore stash on intended branch; note potential conflicts |
| Unborn / no upstream | New empty repo / local branch | Parser does not hallucinate upstream or branch history |
| Malformed status | Partial, contradictory, hostile input | No script execution, safe display, explicit uncertainty |

Test cases should assert actual repository state, not only that commands exit successfully. Never run any destructive example against the development checkout.

---

## F. Per-milestone acceptance tests

**M1 (Phases 0–3):** Existing feature parity; all known P0 command/risk defects addressed; Git harness and browser smoke tests running in CI; validated command/workflow schemas; published build remains viable on Pages subpath.

**M2 (Phases 4–7):** Five clear navigation destinations; usable on mobile; status parser with at least 12 golden states; at least eight guided recovery journeys; at least 20 structured error patterns; all uncertain cases yield an explicit next diagnostic instead of an unsafe guess.

**M3 (Phases 8–9):** Generic Git commands are host-neutral; GitHub/GitLab/Bitbucket differences are verified and reflected throughout UI; no fabricated platform CLI; aliases/filter interactions tested; canonical command pages and comparison pages link correctly.

**M4 (Phases 10–11):** Simulated Git operations yield valid history/reference changes in declared scope; conforming real-Git fixtures; accessible graph fallback; conflict trainer verifies outcomes; beginner/intermediate/advanced lessons usable without accounts.

**M5 (Phases 12–13):** Only if approved. CI generator validates outputs and documents limitations. Optional companion is separately threat-modelled and read-only by default.

**M6 (Phase 14):** No P0 regressions; all required quality checks pass; documentation current; release report identifies every deferred risk and actual deployment state.

---

## G. Anti-drift and change-control rules

- **Phase lock:** Do not start features from a later phase because they look appealing while P0 correctness, tests or current gate remain unresolved.
- **Scope budget:** A task may make only necessary supporting changes. Any discovery requiring unrelated work becomes a new item with its own priority/dependency and stays out of the current diff unless it blocks safety.
- **Evidence over assertion:** Quote concrete file references and observed command/test results, not generic 'fully implemented', '100% safe' or invented counts.
- **Architecture is a target, not a claim:** Schemas and modules described here are to be implemented, not assumed to exist.
- **Reviewer independence:** A reviewer must inspect actual patch and tests, not merely endorse the implementer's summary. If no peer model is available, perform a written self-review and label it accordingly.
- **Documentation drift:** A change to Git semantics must update all affected workflows, safety flags, simulator lessons and validation fixtures through shared canonical definitions.
- **Security invariant:** No user-pasted Git text is ever run as a shell command, used as HTML, or leaked to a network service without a distinct opt-in design.
- **Failure discipline:** Mark `BLOCKED` with evidence when tools/network/docs unavailable. Continue only tasks whose prerequisites remain satisfied, never fake external verification.
- **Review before release:** No automatic branch reset, force push, mass dependency migration, external write actions, or production publish.

### Definition of a strong final report

1. Completed phases/tasks and explicitly deferred items.
2. Verified baseline and final Git SHAs, and list of modified files.
3. Automated commands actually run; counts and failures.
4. Representative end-to-end user journeys and exact results.
5. Security, privacy, accessibility and command-safety findings.
6. Deployment status (not deployed / authorized and deployed / verified live) and rollback procedure.
7. Remaining risks and next recommended bounded task.

---

## H. Agent kickoff command (copy into your coding LLM)

> You are implementing **GitUnstuck 2.0** in `https://github.com/dazzo31/gitunstuck`. Read `GITUNSTUCK_PHASED_IMPLEMENTATION_PLAN.md` in full and follow its operating contract and phase gates. Start with **Phase 0 only**. Inspect the actual repository checkout, preserve all user changes, create a verified baseline audit and `docs/IMPLEMENTATION_STATUS.md`, and report each GU-000x task with test evidence. Do not move to Phase 1 until Phase 0 exit criteria pass. Then proceed in task/dependency order, one bounded task at a time, with regression tests and honest status updates. Keep the site functional on GitHub Pages, do not invent host-specific CLI syntax, and never run example Git commands against the user's real checkout. Do not push, publish, reset or force-change history without explicit authorization. If multiple models are used, distinguish actual reviewer output from private reasoning and independently verify every claimed result.

**First deliverable:** `docs/BASELINE_AUDIT.md`, `docs/IMPLEMENTATION_STATUS.md`, the task/feature inventory, reproducible baseline tests and a Phase 0 gate verdict. **First action:** inspect `git status --short`, current `HEAD`, repository layout, README, HTML/JS and deployment workflow; do not modify application code until the audit is complete.
