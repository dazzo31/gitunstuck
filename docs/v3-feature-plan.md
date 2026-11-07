# GitUnstuck v3 — Feature Plan

Historical proposal. Its architecture/status statements describe an earlier checkout. Use README.md, CONTRIBUTING.md and learning-implementation.md for the current learning work; this file is retained for context.

> Branch: `v3` (off `main` @ `v2.2.1` / `0cda374`)
> Source of inspiration: Terraform Unstuck's recipe safety model (`docs/SAFETY_MODEL.md`, per-recipe "When to stop", source citations with review dates, and read-only "Check first" separation).
> Status: Phase 1 in progress.

## Why these features

GitUnstuck teaches commands that can destroy work (`git restore`, `git reset --hard`,
force-push, history rewrite). It already has risk badges, "Verify result", warning
callouts, the undo decision tree, and "Is my work lost?" verdicts. What it lacks —
and what Terraform Unstuck does well — is a uniform **safety gate** and **verifiable
authority** on every recipe.

## Feature gap (verified against code)

| # | Feature | Present in Terraform Unstuck | Present in GitUnstuck |
|---|---|---|---|
| 1 | Per-recipe "When to stop" condition | ✅ | ❌ |
| 2 | Authoritative source links + review dates | ✅ | ❌ |
| 3 | Read-only "Check first" checklist, separate from resolution | ✅ | ❌ (partly, via "Golden Safety Rule") |
| 4 | Self-check exercises ("Put this lesson to work") | ✅ | ❌ |

GitUnstuck already has (do not re-add): risk badges, per-card "Verify result",
warning callouts, undo decision tree, terminal analyzer + "Is my work lost?",
4-zone/graph simulators, `.git/` internals inspector.

---

## Phase 1 — Safety gates ("When to stop")

**Goal:** every recipe card and every analyzer diagnosis gains an explicit
"When to stop" condition, mirroring Terraform Unstuck's `stop` field.

### Tasks
1. Add a `stop` field to the recipe/card data model and to analyzer result objects.
2. Author stop-conditions for all ~19 cards, destructive ones first:
   `card-undo`, `card-force-lease`, `card-rebase`, `card-detached`,
   `card-forge-troubleshoot`, then the remainder.
3. Render a consistent "When to stop" callout (reuse the existing `callout warning`
   style) adjacent to "Verify result".
4. Add `stop` to analyzer outputs (detached HEAD, merge conflict, secret scan, etc.).
5. Verify: `node tests/test-analyzer.js` stays green (155 assertions).

### Acceptance
- Every destructive card shows a stop-condition before its command block.
- The analyzer shows a stop-condition on every diagnosis.
- No new dependencies; prose/data-only.

---

## Phase 2 — Source citations + review dates

**Goal:** verifiable authority matching Terraform's "Source reviewed …" convention.

### Tasks
1. Add `source` (URL) + `reviewed` (date) fields to card/recipe/analyzer data.
2. Map host-specific claims to official docs (GitHub protected branches / secret
   scanning, GitLab protected branches, Bitbucket app passwords, git-scm for
   restore/reflog).
3. Render a "Source · Reviewed {date}" footer on cards and analyzer results.

### Acceptance
- Every host-specific claim links to an official doc.
- Review dates stated honestly (reviewed 2026-11-01).

---

## Phase 3 — Read-only "Check first" separation

**Goal:** force read-only diagnosis before any mutating command.

### Tasks
1. Add `checks` (read-only list) distinct from `code`/resolution on each card,
   starting with destructive + forge cards.
2. Render a "Check first" ordered list above the command snippet.

### Acceptance
- Destructive cards show checks before commands.

---

## Phase 4 — Self-check exercises (optional)

**Goal:** knowledge-check on the mental-model lessons.

### Tasks
1. Add an `exercise` object (question + options + answer) to mental-model lessons.
2. Render a "Check your understanding" block in primer/lesson sections.

### Acceptance
- Manual browser QA.

---

## Constraints

- GitUnstuck is a monolithic `index.html` (~5,600 lines), zero build step, zero
  dependencies. All phases add data + rendering, no new deps.
- Prose-only edits must preserve the Humanizer remediation already applied
  (no em-dashes, no "not X but Y", no "verified" inflation).
- Keep the test suite green after each phase.
