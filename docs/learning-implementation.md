# GitUnstuck learning improvement plan

Version 1.0 · 6 November 2026  
Purpose: implementation instructions for an LLM, with reviewable tasks and evidence requirements.  
Repository: https://github.com/dazzo31/gitunstuck  
Reviewed baseline: 7115b5d643bb1b6259aa13b2b615d07e1d8a0327, committed 3 November 2026.  
Scope of this document: a plan. Its preparation did not modify the repository or execute its tests.

## 1. Intended result

GitUnstuck should help someone inspect a repository, choose what to commit, work on a branch, exchange work, and recover from common mistakes. A learner should be able to explain the result of a command and perform a similar task without copying the example.

Keep the three existing destinations: Fix a problem, Learn Git, and Find a command. Give Learn Git a coherent course with practical exercises and a clear route back from reference material. Improve the appearance through readable typography, spacing, restrained colour, and useful diagrams.

Success is demonstrated by correct repository outcomes, usable navigation, readable interfaces, and observed learner performance. Text volume, feature counts, screenshots alone, and passing source-string assertions do not demonstrate teaching quality.

### Delivery boundaries

Included:

- Six core lessons and one optional setup lesson.
- One consistent plain-text practice project.
- A complete staging exercise delivered before the remaining lessons.
- Better before/after teaching in the existing visual tools.
- A compact remote example with two working copies and a shared repository.
- Navigation between lessons, reference entries, and recovery explanations.
- Responsive presentation, accessible controls, accurate terminology, and meaningful checks.
- Executable Git fixtures and browser journeys for the new learning behaviour.
- Honest documentation of tested environments and remaining gaps.

Excluded from this implementation:

- AI tutors, chat interfaces, generated answers, accounts, analytics, advertising, certificates, points, streaks, leaderboards, achievement badges, and completion scores.
- New frontend frameworks, runtime packages, remote fonts, icon libraries, or image dependencies.
- A browser terminal that interprets arbitrary commands, or a Git implementation in WebAssembly.
- A new landing-page campaign, giant hero area, decorative dashboard, invented usage statistics, or extensive logo redesign.
- A complete GitHub/GitLab/Bitbucket or CI/CD course. Existing reference material remains available.
- A general rewrite of the analyzer, recovery engine, build system, or entire repository.
- A general collection of advanced Git topics beyond the existing material.
- Collecting a learner's repository, terminal contents, credentials, or personal information.

The new course is bounded. New topics require a specific unmet learning need, a place in the sequence, and a corresponding exercise. Record future ideas separately; do not implement them during these tasks.

## 2. Verified starting point

These are observations from the reviewed revision, not promises about the execution checkout.

| Area | Observed baseline | Implication |
| --- | --- | --- |
| Main destinations | Fix, learn, and reference already exist | Improve their connections; preserve the navigation model |
| Learn Git | Four topic links, introductory explanations, one knowledge check | Add outcomes, practice, and lesson continuity |
| Four-zone widget | Selects predefined explanations and example statuses | Reuse it as an illustration with explicit state transitions |
| Commit graph | Selects predefined scenarios | Add before/after comparisons without claiming actual repository inspection |
| Metadata inspector | Labels include Actual .git/ Files and LIVE FILE SYSTEM STATE | Replace misleading claims with accurate example labels |
| Staging explanations | Detailed panel says staging copies content; quiz feedback says it moves changes | Correct the inconsistency everywhere it appears |
| Recipe links | A staging lesson link opens the reference destination | Provide an exact return route and preserve lesson context |
| Runtime | index.html, recovery.js, and local SVG assets | Preserve static use and no runtime dependencies |
| Build | Existing build-only minifiers; production embeds recovery.js | Update the current build when introducing learning.js |
| Tests | npm test runs analyzer and recovery tests | Add learning outcomes to the existing test entry point |
| Browser QA | Optional tests/test-browser.cjs; existing Playwright installation | Extend the existing approach without a new test framework |
| CI | Checked-in workflows run on Ubuntu | Do not claim a checked-in Windows CI job exists |
| Older plans | Some describe an earlier monolithic app with no build step | Treat them as historical proposals, not the current architecture |

No AGENTS.md or Copilot instruction file was present in the upstream tree inspected for this plan. At implementation time, read any applicable instructions in the actual checkout and its parent directories.

Current source entry points:

- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/index.html
- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/recovery.js
- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/CONTRIBUTING.md
- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/README.md
- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/scripts/build.mjs
- https://github.com/dazzo31/gitunstuck/blob/7115b5d643bb1b6259aa13b2b615d07e1d8a0327/tests/test-browser.cjs

If HEAD differs, inspect the relevant diff and update the observations and task mapping. Retain completed improvements; do not recreate them because this plan describes an older baseline.

## 3. Rules that prevent AI slop

These rules govern decisions and review. Passing a phrase blacklist is insufficient.

### 3.1 Every addition must earn its place

Before adding content or a control, state:

1. The specific learner difficulty.
2. The behaviour or explanation that addresses it.
3. How its value or correctness will be checked.

If these cannot be stated concretely, omit the addition. Reuse existing material when it already answers the need.

Examples:

| Proposed change | Decision |
| --- | --- |
| Show a file edited after staging | Include: explains why committed and working contents can differ |
| Add a decorative animated terminal | Exclude: no learning task depends on it |
| Add a return link from a recipe to the current exercise | Include: prevents loss of lesson context |
| Add a percentage labelled Git mastery | Exclude: reading and clicks do not establish mastery |
| Add a collapsed explanation of why an answer was wrong | Include when it addresses a named misconception |
| Repeat the same introductory paragraph in every panel | Remove duplication; use local context and a useful link |

### 3.2 Editorial rules

- Explain the Git term first. Use a short analogy only when it clarifies a specific point.
- Explain an analogy's limit where it could mislead. Staging does not remove a file from disk.
- Use consistent terms: working directory, index/staging area, commit, branch, HEAD, remote, remote-tracking branch.
- Remove marketing language, generic introductions, invented expertise, unsupported reassurance, and decorative jargon.
- Avoid descriptions such as cloud robots, magical safety, vault protection, messy merges, or guaranteed recovery.
- Each paragraph must explain a concept, action, consequence, diagnostic observation, or limitation.
- Avoid repetitive headings such as What this means followed by a restatement of the title.
- Use meaningful example commit messages; conventional-commit prefixes are optional and must not appear required by Git.
- Show limitations honestly: an example is an example; a self-check is not verified performance in a real repository.
- Do not invent review dates, test results, learner quotes, user counts, measured reading times, or accessibility certification.
- Keep explanations brief enough for the task. Do not pad lessons to reach a length or force every topic into the same number of paragraphs.
- Apply caution where a command needs it. Keep immediate prerequisites visible instead of repeating generic warnings throughout the page.

### 3.3 Interface rules

- A visual element must help identify location, action, state, comparison, or consequence.
- Keep decoration subordinate to reading and doing.
- Use the existing logo and local assets. Use exact SVG/code for diagrams.
- Keep a clear distinction between navigation links, action buttons, command blocks, output blocks, and disclosures.
- Every enabled control must do something observable. Explain or remove unavailable actions.
- Do not hide essential exercise steps or command consequences behind several disclosures.
- Do not add extra destinations, modes, settings, or permanent side panels without a demonstrated need.
- Keep reference and recovery details accurate and accessible while the learning interface becomes simpler.

### 3.4 Definition of an unacceptable change

Reject a task's implementation if it contains factual ambiguity, duplicated teaching without a distinct purpose, a control with no useful result, unsupported claims of verification, ornamental complexity, or a regression hidden by weakening tests.

Revise or remove the offending part. Do not describe a stylistic opinion as an automated proof that all AI slop has been eliminated.

## 4. Implementation contract for the LLM

### Work one bounded task at a time

1. Read this plan, applicable checkout instructions, the execution tracker, and the relevant source.
2. Choose the next unblocked task. State its ID and intended observable result.
3. Identify the files and behaviours in scope.
4. Implement the smallest complete change that satisfies that task.
5. Run checks appropriate to the change. Run relevant outcome tests when Git behaviour changes.
6. Inspect the diff and the resulting interface when presentation changes.
7. Record the evidence, remaining gaps, and next task.
8. Continue through authorized work without requesting routine phase-by-phase approval.

Do not stop after producing a scaffold or describing what could be implemented. Do not let unrelated cleanup consume the implementation.

### Task status vocabulary

Use OPEN, ACTIVE, PASS, BLOCKED, or HUMAN_PENDING.

- PASS requires the task's acceptance conditions and evidence.
- BLOCKED names a concrete missing capability or unresolved dependency.
- HUMAN_PENDING applies only to work requiring actual external learner or user evidence.
- An LLM role-playing a beginner cannot clear HUMAN_PENDING.
- Continue independent tasks when an environment or human-dependent check is unavailable.
- Do not mark a phase complete while one of its required tasks is BLOCKED or HUMAN_PENDING.
- Distinguish implementation complete, automated checks passed, human validation pending, and released.

### Minimal execution records

At implementation time, place this plan in docs/learning-implementation.md. Use one additional file, docs/learning-evidence.md, for:

| Task ID | Status | Implementation revision | Checks and result | Evidence location or gap | Next action |
| --- | --- | --- | --- | --- | --- |

Include short decision notes in that evidence file. Do not create a collection of overlapping governance documents, handoff templates, and status reports.

After each task, report:

~~~text
Task:
Changed:
Verified:
Still unverified:
Next:
~~~

A useful checkpoint contains changed files and exact test commands, not a transcript of internal reasoning.

### Scope and interruption rules

- Do not edit recovery.js unless a task requires a demonstrated defect correction or a narrow integration hook.
- Do not replace existing tests with weaker assertions to make changed markup pass.
- Do not silently change supported Git versions, privacy behaviour, deployment paths, or old deep links.
- Do not add packages to solve a styling or navigation problem.
- If a task needs broader changes, record the dependency, complete unaffected work, and raise only the concrete unresolved decision.
- Repository contribution procedures should be followed within the actual implementation request's authorization. This plan does not itself authorize posting issues, merging, or deploying.
- Commit, open a PR, merge, and deploy only within the authorization of the eventual execution request. Do not infer release authorization from the existence of Phase 9.
- If work is interrupted, update the tracker with the current revision, incomplete conditions, and the next bounded task. Resume from there.

## 5. Course and practice specification

### Core lesson sequence

| ID | Title | Observable outcome | Required independent task |
| --- | --- | --- | --- |
| setup | Set up a practice repository | Check Git availability, find the practice directory, and set author identity locally if needed | Confirm the directory and identity before starting |
| inspect | Read the repository's state | Explain tracked, untracked, staged, and unstaged observations | Identify which files and contents are eligible for the next commit |
| staging | Choose what goes into a commit | Predict the difference between HEAD, the index, and working files | Stage one change, edit again, and commit only the intended version |
| history | Record and inspect history | Create a focused commit and inspect its snapshot and message | Make a second focused change and verify exactly what was committed |
| branches | Work on a branch and merge | Explain which reference changes and resolve a deliberate simple conflict | Complete a similar branch change with a different line of text |
| remotes | Exchange work with another copy | Distinguish local, remote-tracking, and server branches | Fetch another person's commit, explain the observed references, and integrate appropriately |
| recovery | Choose a recovery action | Distinguish unstaging, discarding an uncommitted edit, and reverting a commit | Choose and justify an action for a fresh scenario |

Setup is optional. The other six are the core sequence. Preserve direct access for experienced users; do not force everyone through the course.

### Lesson structure

Each core lesson contains:

1. A concrete outcome and prerequisites.
2. A small worked example in the common practice project.
3. A prediction before the important transition.
4. Commands or explicit editor actions.
5. Expected observations, including empty output where relevant.
6. An explanation tied to those observations.
7. A similar independent task with a collapsed worked answer.
8. A link to the relevant reference or recovery entry and a next lesson link.

The independent task must change some detail from the worked example. Repeating the exact command immediately after seeing it is weak evidence of understanding.

Use the same plain-text project, such as notes.txt and checklist.txt, across lessons. Avoid language runtimes, package managers, web deployment, and a real hosting account in the core exercises.

Reuse the same project template and story, while giving each lesson a named fresh practice directory. The remotes lesson has its own shared repository and two copies. This keeps an unfinished edit from one exercise from silently changing a later exercise. Do not add a second continuation mode in this implementation.

Each lesson definition must declare its initial files, initial index/commit/reference state, prerequisites, and expected final state. Provide a short, tested setup route for direct entry. The expected result must say which changes intentionally remain uncommitted. Never repair an unexpected starting state by automatically resetting or deleting the learner's work; direct them to a fresh practice directory.

### Practice environment

- Put all exercises in an explicitly named new practice directory.
- Require the learner to confirm its location before repository-changing commands.
- Use repository-local author configuration; do not change global settings for the course.
- Explain that commits can record the configured author identity and may be published.
- Teach file edits as editor actions. Where shell commands are supplied, provide separately tested Bash and Windows PowerShell 5.1 instructions.
- Avoid Bash-only command chaining, quoting, redirection, or utilities in shared instructions.
- Keep Git command syntax within the existing Git 2.23+ support claim. In particular, do not introduce newer setup flags without checking compatibility.
- Make setup independent of the user's default branch, commit signing settings, hooks, pager, and previously configured remotes.
- Tests isolate configuration in temporary directories; learner instructions explain necessary local configuration without disabling their wider protections.
- Restarting the browser example changes only example state.
- Restarting a local exercise uses a fresh practice directory. Do not offer broad delete/reset commands as a convenience.
- Local remotes use a local bare repository and two working copies. Hosted-provider limitations are explained separately.
- No core exercise asks the user to paste their real terminal output into the site.

### Canonical staging experiment

Use the following repository states and verify them with real Git:

| Checkpoint | Action just taken | HEAD file contents | Index file contents | Working file contents |
| --- | --- | --- | --- | --- |
| initial | Commit Version 1 | Version 1 | Version 1 | Version 1 |
| edited-v2 | Edit to Version 2 | Version 1 | Version 1 | Version 2 |
| staged-v2 | Stage the file | Version 1 | Version 2 | Version 2 |
| edited-v3 | Edit to Version 3 | Version 1 | Version 2 | Version 3 |
| committed-v2 | Commit without staging again | Version 2 | Version 2 | Version 3 |

Important observations:

- After edited-v3, the same file has staged and unstaged differences.
- After committed-v2, the committed content is Version 2 and the working file is still Version 3.
- The staged diff is then empty while the working diff remains.
- git diff compares working content with the index by default.
- git diff --staged compares the index with HEAD.
- Untracked files do not appear as ordinary content changes in these diffs until relevant content is added to the index.

Follow this with an independent task using different text and a second file that must remain outside the commit.

## 6. Interface specification

This is a restrained refinement of the existing site. Avoid a fresh visual identity.

| Element | Required treatment | Acceptance check |
| --- | --- | --- |
| Global navigation | Keep the three named destinations prominent; keep Learn Git one action away from the default view | Labels remain visible and understandable on mobile |
| Learn introduction | One short description and a clear starting action; optional setup link | A first-time learner can identify where to begin |
| Desktop lesson layout | A compact lesson outline beside one readable main column | No competing dashboard panels or excessive card nesting |
| Mobile layout | Single column; lesson outline in an accessible disclosure when space is limited | Reading order matches task order; controls do not obscure content |
| Course position | Current lesson and next action, using names and sequence numbers | No mastery percentage or automatic claims of competence |
| Main column | Target approximately 65–75 characters per line for explanatory prose; allow code/table exceptions | Comfortable reading at desktop and narrow widths |
| Typography | System fonts; body text at least 16 CSS px at default zoom; comfortable line height around 1.5–1.65 | Text remains usable with zoom and user text-spacing overrides |
| Spacing | Small consistent spacing scale; clear separation between explanation, action, and observation | Alignment and grouping survive different text lengths |
| Colour | Retain existing brand colours with neutral surfaces; one principal action treatment | State is never expressed by colour alone |
| Surfaces | Use borders, spacing, and modest radius; avoid nested shadows, frosted glass, and decorative gradients | Commands and observations are visually distinct |
| Lesson controls | Previous, next, show answer, reset example; accurate names for each action | No decorative controls and no ambiguous Continue buttons |
| Commands | Copyable command-only blocks; text labels for Bash/PowerShell where relevant | Clipboard excludes prompt symbols, output, and explanatory prose |
| Output | Labelled expected or example output; preserve meaningful whitespace | Never presented as the learner's live terminal |
| Diffs | Show additions and removals with symbols plus colour; explain what is being compared | Works without colour perception |
| Diagrams | Readable labels and equivalent text; before/after changes identified | Keyboard and screen-reader users can obtain the same explanation |
| Feedback | State what the learner selected, the correct reasoning, and the next useful action | No empty praise or shaming language |
| Technical details | Disclose advanced internals below the core explanation | The lesson remains understandable without opening them |
| Support links | Keep available but visually secondary to lesson work | No competing primary call to action inside exercises |

Additional checks:

- Normal text contrast at least 4.5:1. Check both themes and relevant hover, focus, selected, and error states.
- Check meaningful graphical objects and component boundaries against applicable non-text contrast requirements.
- Aim for approximately 44 by 44 CSS px for primary touch controls. This is a design target; WCAG 2.2 AA's target-size criterion has a 24 by 24 CSS px minimum with exceptions.
- Use clear visible focus and ensure sticky headers do not hide focused controls or anchor headings.
- Check 320, 390, 768, and 1440 CSS px widths; check both themes at representative sizes.
- At 200% zoom and narrow reflow, the page must remain usable. Local horizontal scrolling may be necessary for code or a data table; the page itself should not scroll sideways.
- Respect reduced motion. No essential information may depend on animation, hover, or drag.
- Prefer native links, buttons, details/summary, and form controls. Add ARIA for a demonstrated semantic need.
- A lesson step advances only through an explicit learner action. Clicking a topic or reference link does not mark learning complete.
- Preserve the existing default destination unless a separately justified task changes it. Do not force an interstitial choice screen before urgent recovery help.

## 7. Architecture and file boundaries

Use the existing static architecture. A small shared learning module is justified so lesson data, example transitions, and executable checks can agree.

| File | Intended responsibility |
| --- | --- |
| index.html | Existing markup/styles/navigation; lesson renderer and accessible UI |
| learning.js, new | Canonical lesson IDs, examples, action definitions, and pure example-state transitions; importable in browser and Node |
| recovery.js | Existing canonical recovery recipes and analyzer; normally unchanged |
| tests/test-learning.js, new | Lesson-data validation and real Git exercise outcomes |
| tests/test-browser.cjs | Extended real user journeys, accessibility-related behaviour, and presentation checks |
| tests/test-recovery.js | Existing recovery outcomes; change only for a relevant regression |
| tests/test-analyzer.js | Existing parser/source assertions; adapt narrowly when necessary |
| scripts/build.mjs | Embed learning.js alongside recovery.js in the production artifact |
| package.json | Include learning outcomes in npm test; preserve locked build dependencies |
| README.md and CONTRIBUTING.md | Accurate usage, support, and teaching-content rules |
| docs/learning-implementation.md | This plan |
| docs/learning-evidence.md | Tracker, evidence, design decisions, and unresolved checks |
| .github/workflows/check.yml and deploy.yml | Existing checks; only necessary additions for the new suite |

Do not split every lesson into a new component or introduce a content framework.

Keep lesson data and state independent of the DOM. Use explicit known action IDs. A browser action updates an illustrated state; it never executes a command on the user's computer.

Represent executable Git actions with argument arrays and file-edit actions with exact fixture contents. The test harness must run controlled Git actions directly, without evaluating arbitrary lesson prose or shell command strings.

Where an exercise uses an existing recovery operation, reference the canonical recipe. Reuse compatible prerequisite/consequence content. A deliberately different teaching action may have its own definition; explain the distinction rather than pretending the commands are interchangeable.

Prevent HTML injection when rendering labels, messages, code, and unexpected route values. Follow existing escaping patterns.

Source checkout use must work with the new local module beside index.html. The production HTML must embed the same learning data and transitions that were tested. Document the extra source file honestly.

## 8. Phase map

| Phase | Focus | Depends on | Exit condition |
| --- | --- | --- | --- |
| 0 | Baseline and bounded scope | None | Current behaviour and checks are recorded |
| 1 | Teaching accuracy and terminology | 0 | Misleading and inconsistent explanations are corrected |
| 2 | Shared lesson model and routing | 1 | Minimal learning foundation works in source and built output |
| 3 | Complete staging lesson | 2 | One complete exercise is correct, usable, and executable |
| 4 | Clear, attractive learning interface | 3 | The staging lesson establishes the finished visual and navigation pattern |
| 5 | Remaining course lessons | 4 | Optional setup and six core lessons satisfy the common contract |
| 6 | Visual explanation improvements | 3–5 | State transitions, branch comparisons, and remote example agree with Git |
| 7 | Reference and recovery integration | 5–6 | Cross-destination journeys retain context and existing capabilities |
| 8 | Integrated quality verification | 7 | Required executable and browser checks pass; gaps are explicit |
| 9 | Learner evaluation and release readiness | 8 | Actual learner evidence is recorded and the change is reviewable |

Do not batch a full course rewrite before completing the staging lesson. Fix problems discovered in that first lesson before copying its pattern.

## 9. Detailed task list

### Phase 0 — Establish the baseline

#### P0.1 — Inspect the actual checkout

Change: read applicable instructions, git status, current HEAD, relevant source, scripts, and workflows. Compare against the reviewed revision if necessary.

Done when: the evidence file records the actual revision, existing user changes, applicable constraints, and which baseline observations still apply. Work occurs on an isolated branch/worktree when implementation is requested and needed.

Evidence: revision and concise file/behaviour map. Do not overwrite unrelated user work.

#### P0.2 — Record representative starting journeys

Change: inspect Fix, Learn, and Reference at desktop/mobile widths and in both themes. Follow staging to its reference card and back. Inspect the graph, metadata labels, keyboard navigation, and old deep links.

Done when: the evidence distinguishes observed problems from preferences. Retain a small representative set of before screenshots for comparison.

Evidence: URLs, viewport/theme labels, screenshots, and brief observations. Avoid collecting a screenshot for every card.

#### P0.3 — Run and classify existing checks

Change: run the existing test and build checks, and available browser QA, before implementation.

Done when: results are recorded as actual runs with environment details. Existing failures are separated from later regressions. Missing tooling is recorded precisely.

Evidence: exact commands, exit results, Git/Node/browser versions, and a short failure description where needed. Do not copy pass counts from README as current evidence.

#### P0.4 — Lock the scope and comparison criteria

Change: create the task tracker and record the course sequence, UI brief, file boundaries, known compatibility requirements, and old routes to preserve.

Done when: all 45 task IDs are tracked and the next task is clear. Unrelated proposals are outside the implementation.

Evidence: completed baseline section and tracker. Phase 0 is not an excuse to start a separate architecture project.

Phase gate: baseline recorded, regressions detectable, scope bounded.

### Phase 1 — Correct the teaching

#### P1.1 — Make staging explanations consistent

Change: audit primer text, quiz feedback, zone descriptions, command examples, and graph explanations for claims that staging moves files or that an editor save creates a commit.

Done when: each explanation distinguishes current working content, staged content, and committed content. A learner can edit after staging without contradicting the text.

Evidence: reviewed occurrences and the real-Git staging fixture planned for Phase 3. Avoid source-string tests for every sentence.

#### P1.2 — Label diagrams and metadata honestly

Change: replace live/actual inspection claims for predefined data. Remove universal 41-byte and fixed-hash-format claims, or clearly scope an example to its stated representation.

Done when: each illustration is identified as an example. HEAD, branch labels, displayed hashes, and explanatory text agree, including detached HEAD. The simple example is not presented as a complete account of every Git storage backend.

Evidence: scenario-by-scenario review against official Git documentation and rendered output.

#### P1.3 — Reduce competing terminology

Change: use the agreed Git terms and remove unnecessary metaphor changes. Separate introductory remotes content from pipelines. Remove language suggesting merging is inherently messy or rebasing is inherently preferable.

Done when: core explanations remain understandable without translating between several analogies. Existing advanced content stays reachable with accurate labels.

Evidence: concise terminology and content-movement notes. Do not rewrite unrelated pages just to impose a new voice.

#### P1.4 — Tie claims to useful sources

Change: map each lesson's important behavioural claims to the relevant official Git documentation. Identify environment-dependent output and illustrative values.

Done when: citations support the actual claim and sit where useful. Any reviewed date corresponds to work performed. Sources do not substitute for tested exercises.

Evidence: a compact source map in the evidence file and a content diff free of unsupported claims.

Phase gate: no known contradictions in the learning explanations being extended.

### Phase 2 — Add the minimum learning foundation

#### P2.1 — Define canonical lesson and example data

Change: introduce learning.js with stable lesson IDs, initial/final state manifests, prerequisites, ordered actions/checkpoints, observations, prediction feedback, independent tasks, solutions, and relevant reference IDs.

Done when: the module imports in Node without browser globals, contains no credentials or learner input, and exposes testable pure state transitions. Add schema checks only for meaningful requirements.

Evidence: import/data checks, including unknown IDs, duplicate IDs, missing outcomes, and missing references.

#### P2.2 — Implement a small routing contract

Change: support #learn as the course outline and #learn/LESSON/CHECKPOINT as a direct lesson location. Validate every ID. Keep existing hashes and reference-search URL state working.

Done when: reload, Back, Forward, copied lesson URLs, and unknown lesson/checkpoint values behave predictably. Old hashes resolve to the corresponding material without silently entering the wrong destination.

Evidence: route matrix and browser assertions. Use one navigation path instead of separate unrelated click handlers.

#### P2.3 — Render one minimal lesson shell

Change: render the current lesson, outcome, steps, prediction, observation, answer disclosure, previous/next links, and accessible state messages.

Done when: a placeholder-free staging draft can be read and navigated using keyboard alone. Explain that example controls change the browser illustration, not a real repository.

Evidence: a focused browser journey. Do not apply a full site redesign in this task.

#### P2.4 — Integrate the shared module with build and tests

Change: embed learning.js in production, add the learning suite to npm test, and compare rendered/source data with the canonical module.

Done when: source checkout and built output load successfully, with no missing module or duplicate execution. Build checks remain meaningful and require no new dependencies.

Evidence: npm test, npm run build:check, npm run build, and source/built parity results.

Phase gate: a working, testable learning foundation without a framework migration.

### Phase 3 — Deliver the complete staging lesson

#### P3.1 — Create a reproducible staging practice setup

Change: define the plain-text project, local identity setup, initial committed Version 1, and separate Bash/PowerShell setup instructions where needed.

Done when: setup works in a new practice directory and does not depend on a real hosting account or global author settings. Commands respect the Git 2.23+ support boundary.

Evidence: a real repository fixture plus actual shell validation or an explicit outstanding shell gap.

#### P3.2 — Implement all five staging checkpoints

Change: implement the canonical staging experiment from Section 5 with a side-by-side content comparison and relevant status/diff observations.

Done when: every checkpoint agrees with real Git's HEAD, index, working file, and staged/unstaged differences. Empty output is explained accurately.

Evidence: assertions on file contents, git show HEAD:path, index content, and diffs. Never infer correctness from command exit codes alone.

#### P3.3 — Add a meaningful prediction and feedback

Change: ask which contents will be committed after the second edit. Explain why each plausible incorrect answer is wrong.

Done when: feedback addresses the selected misconception, preserves the state being discussed, and is announced accessibly. Revealing an answer does not mark the lesson mastered.

Evidence: correct/incorrect/reveal/retry browser paths and an editorial review.

#### P3.4 — Add an independent transfer task

Change: use new text plus a second file that must stay outside the commit. Supply a collapsed answer and an explicit way to inspect the result.

Done when: the task requires applying the idea with changed details. Its expected result distinguishes the committed contents, remaining work, and excluded file.

Evidence: executable independent-task fixture and expected result. Do not auto-grade an actual repository the page cannot inspect.

#### P3.5 — Check the whole lesson before expanding

Change: run the source and built lesson end to end, including reset example, commands copied, reference entry, and return path where available.

Done when: no placeholders, contradictory observations, dead controls, or core steps hidden by layout remain. If reference return is unfinished, track that condition against P7.1 explicitly.

Evidence: focused desktop/mobile review and passing staging outcome tests.

Phase gate: one complete and accurate practical lesson establishes the teaching pattern.

### Phase 4 — Make the learning interface clear and attractive

#### P4.1 — Establish a restrained visual system

Change: consolidate the necessary learning-view typography, spacing, surfaces, and action styles around existing brand colours. Reuse existing tokens where suitable.

Done when: the staging lesson has clear hierarchy and comfortable reading in both themes. There are no decorative metric cards, excessive shadows, or nested card shells.

Evidence: representative before/after screenshots and measured contrast for the relevant text and controls.

#### P4.2 — Add the lesson outline and responsive reading layout

Change: use a compact desktop outline and readable main column; adapt to a single-column mobile view. Show lesson names and current location.

Done when: learners can find the next action without scanning unrelated topics. At 320 CSS px the page does not overflow horizontally; wide code/tables scroll locally when necessary.

Evidence: screenshots at 320, 390, 768, and 1440 widths, plus overflow checks.

#### P4.3 — Improve command, output, and diff presentation

Change: distinguish commands from observations; label shell-specific setup; make copy buttons copy only executable command text. Present the comparison behind each diff.

Done when: no prompt marker or output is copied accidentally. Important line breaks survive. Differences use symbols as well as colour. Clipboard failure has useful feedback.

Evidence: clipboard-content assertions, narrow-layout inspection, and rendered diffs matching fixtures.

#### P4.4 — Make movement through lessons predictable

Change: supply named previous/next links, checkpoint location, visible reset-example action, and a useful outline on small screens.

Done when: links navigate and buttons act; browser history and headings agree with the displayed lesson. Reset never implies deletion of local files.

Evidence: keyboard, Back/Forward, reload, and deep-link journeys. No learning-completion claim is triggered by navigation.

#### P4.5 — Refine interactions and accessible semantics

Change: use appropriate native controls, useful accessible names, visible focus, concise announcements, reduced-motion support, and adequate touch targets.

Done when: the lesson works without hover, dragging, animation, or colour perception. Sticky navigation does not conceal the focused item.

Evidence: keyboard-only review, focus inspection, reduced-motion checks, and screen-reader check where available.

#### P4.6 — Apply a deliberate visual review

Change: inspect the finished staging lesson in both themes and at desktop/mobile sizes. Check alignment, line length, heading order, disclosure density, and long labels.

Done when: the main explanation, action, observation, and next step are immediately distinguishable. Remove visual elements that compete with those tasks.

Evidence: a short list of observed issues and their corrections. Replace brittle old exact-colour/radius assertions only with checks that continue protecting intended behaviour and readability.

Phase gate: the staging lesson is the reference design for all later lessons.

### Phase 5 — Complete the course content

#### P5.1 — Add optional setup

Change: turn the tested P3.1 setup into the optional setup lesson, reusing its canonical actions. Explain Git availability, opening the right directory, local identity, editor use, and safe practice-directory setup. Provide concise troubleshooting for missing Git or author identity; do not maintain a second setup implementation.

Done when: someone can prepare the common project without starting inside another repository or changing global settings.

Evidence: tested setup in supported shells; a note of any environment not actually exercised.

#### P5.2 — Add Read the repository's state

Change: teach tracked/untracked files and staged/unstaged observations through the common project. Introduce status before commands that change state.

Done when: the worked example and independent task require interpreting observations. Explain that a clean status has limits, including ignored files and previously observed remote state.

Evidence: actual tracked/untracked/ignored/index fixture outcomes and checked feedback.

#### P5.3 — Add Record and inspect history

Change: teach a focused commit, a meaningful message, and inspecting actual committed contents. Explain that recording locally and publishing are separate actions.

Done when: the learner can verify which changes entered a commit and which remain outside it.

Evidence: real commit tree/content assertions and an independent two-file task. Avoid treating commit-message style conventions as Git requirements.

#### P5.4 — Add Work on a branch and merge

Change: use consistent commits and branch names to show branch creation, a clean merge, and a deliberate same-line conflict. Explain editing the intended resolution before continuing.

Done when: branch references and working-file contents agree with the explanation. A conflict is presented as a state to resolve; staging alone does not establish that the resolution is correct.

Evidence: real fast-forward/non-fast-forward/conflict cases with parent and file-content checks. Include a checked abort explanation using existing recovery guidance where applicable.

#### P5.5 — Add Exchange work with another copy

Change: use two working copies and one local bare remote. Demonstrate publishing, another person's commit, stale remote-tracking information, fetch, and an appropriate integration step.

Done when: the learner can distinguish the local branch, its remote-tracking reference, and the server branch. The core task works without login; provider-specific review requests are separate.

Evidence: assertions from all three repositories before/after each relevant operation, including a fetch that leaves current working content unchanged.

#### P5.6 — Add Choose a recovery action

Change: teach selecting among unstage, discard, and revert using isolated practice states and canonical recovery guidance. Keep prerequisites and consequences immediately available.

Done when: the independent scenario asks for a justified choice. Discard is explicitly identified as replacing working content; revert is explained as adding a commit rather than deleting history.

Evidence: actual index/file/history outcomes and links to the matching existing recipes. Do not introduce reset --hard or force-push as beginner shortcuts.

Phase gate: all six core lessons and optional setup satisfy the lesson contract and have executable outcomes.

### Phase 6 — Improve the visual explanations

#### P6.1 — Make the staging illustration follow real transitions

Change: connect the existing four-zone content to the staging experiment. Display relevant content differences and named checkpoints.

Done when: stepping backward or forward restores the correct illustration; the index and working file can show different versions simultaneously. It never implies files physically migrate between exclusive locations.

Evidence: pure transition tests, fixture comparisons, and keyboard-accessible operation.

#### P6.2 — Add before/after branch and merge views

Change: reuse existing graphs with explicit initial state, action, and resulting state. Keep HEAD, branch names, parent arrows, and narrative aligned.

Done when: learners can identify which pointers move and which commits are created. Existing rebase and detached examples remain reachable with accurate scope and prerequisites.

Evidence: compare graph states with real fixture relationships. Fix misleading branch isolation claims for uncommitted work and any detached graph/text mismatch.

#### P6.3 — Add a compact remote comparison

Change: show the two working copies and server in a compact layout. Distinguish observed remote-tracking information from the current server branch, using the remotes lesson's canonical example.

Done when: another person's push and the learner's fetch visibly change the appropriate references. The example remains readable on mobile and has a text equivalent.

Evidence: fixture-matched reference states and before/after checks. No animated network activity or fake live server status.

#### P6.4 — Finish the example metadata disclosure

Change: label the inspector as example Git metadata. Keep advanced details optional; align its values with the chosen graph/checkpoint.

Done when: shown hashes or abbreviations are valid for the stated example, and the explanation does not assert that every repository stores refs as individual fixed-length files. Do not imply it reads the user's .git directory.

Evidence: representation checks, scenario review, and accessibility inspection.

Phase gate: visual states, text, and executable repository states tell the same story.

### Phase 7 — Connect learning with help and reference

#### P7.1 — Implement exact lesson return paths

Change: lesson links to recipes retain a validated lesson/checkpoint return context. Use explicit allowlisted navigation state, such as learnReturn and learnStep query values, alongside existing reference hashes.

Done when: a learner can open a recipe, reload it, and return to the exact exercise checkpoint. Opening the reference directly shows a useful related-lesson link instead of an invented Back destination.

Evidence: browser journeys for return/reload/Back/Forward, invalid context values, and coexistence with reference search/filter URL state. No free-text input goes into the URL.

#### P7.2 — Add contextual teaching links to recovery

Change: provide one relevant learning link where a recovery diagnosis or recipe benefits from it. Examples include unstage to staging, detached HEAD to branches, and divergence to remotes.

Done when: the immediate recovery task remains prominent and operational prerequisites remain intact. Links have specific names explaining the concept available.

Evidence: a reviewed mapping and a browser sample of each distinct route type. Do not inject a repeated Learn Git banner into every result.

#### P7.3 — Preserve existing routes and behaviour

Change: maintain original anchor aliases and reference functionality while obsolete learning presentation is consolidated.

Done when: legacy analyzer, undo, detached, forge, and zone links still resolve; search/filter sharing and print/reference export remain usable. Pasted output privacy is unchanged.

Evidence: the route regression matrix, existing tests, and focused print/browser inspection.

Phase gate: new learning journeys integrate without damaging urgent help or existing links.

### Phase 8 — Verify the complete change

#### P8.1 — Execute the learning outcome matrix

Change: run fixtures for all required lessons and independent tasks through the shared definitions. Assert state, not just success messages.

Done when: the matrix in Section 10 passes, including both correct transitions and meaningful invalid or incomplete states.

Evidence: exact commands, environment, and results. Avoid tests that merely repeat the renderer's own calculations as their expected answer.

#### P8.2 — Check source and production journeys

Change: run browser journeys against source and the built artifact. Cover course entry, staging, branch comparison, remotes, feedback, clipboard, references, and legacy links.

Done when: displayed data agrees with canonical definitions; no console errors, broken modules, dead controls, or build-only regressions occur.

Evidence: separate source and built results. Match any production revision metadata to the actual tested revision.

#### P8.3 — Check responsiveness and accessibility

Change: perform the viewport/theme/zoom/keyboard/motion checks in Section 6. Include a second browser engine and a screen-reader pass where available.

Done when: required available-environment checks pass, with other checks explicitly identified. Do not claim full accessibility conformance from automated contrast sampling.

Evidence: a compact matrix of tested environment, task, result, and remaining gap. Inspect long output, expanded answers, and error states.

#### P8.4 — Perform the content and visual quality review

Change: review each paragraph/control against Section 3. Inspect the rendered interface as well as source.

Done when: all known misleading claims, redundant introductions, repeated warnings, inconsistent terms, irrelevant controls, and ornamental clutter are resolved.

Evidence: itemised corrections and a final unresolved-issue list. An LLM self-review is useful but cannot be presented as real beginner evaluation.

#### P8.5 — Run the full regression and build checks

Change: run the final required project commands after the integrated changes, then review the diff for accidental scope expansion.

Done when: relevant existing and new tests pass; build succeeds; no dependencies, privacy changes, or unrelated rewrites have slipped in.

Evidence: final revision, commands, exit results, and documented limitations. Repeat broader checks only when changes or unresolved failures justify them.

Phase gate: implementation and available automated/browser validation are complete; remaining external checks are explicit.

### Phase 9 — Evaluate with learners and prepare release

#### P9.1 — Observe actual beginners

Change: ask three to five willing beginners, when available, to attempt representative staging, branch, and remote tasks without being told the commands. Record anonymous task-level observations.

Done when: actual sessions identify where participants succeed, hesitate, misunderstand, or need help. Participant recruitment and observations must be real.

Evidence: task, result, assistance needed, misconception, and proposed fix. Mark HUMAN_PENDING if no participants are available. Continue all other release-preparation work.

#### P9.2 — Address findings and recheck transfer

Change: fix demonstrated problems within scope and use a similar task with different details to check the affected idea again.

Done when: each observed serious misconception has a correction and, where possible, a fresh observation. Do not infer general teaching effectiveness from one successful participant.

Evidence: finding-to-change mapping, relevant regression results, and honest remaining uncertainties.

#### P9.3 — Prepare accurate project documentation and review

Change: update README and CONTRIBUTING with the course, source files, supported environments, how to add a lesson, and evidence limits. Prepare a focused change description when a PR is authorized.

Done when: reviewers can understand the learner problem, resulting behaviour, verification, and outstanding checks without reading the conversation. Old proposal docs are clearly historical where they conflict with current architecture.

Evidence: final diff and reviewable branch/PR or patch as authorized. Documentation must not claim human validation that remains pending.

#### P9.4 — Release only when authorized, then verify

Change: when deployment is authorized, follow the existing release process and test the deployed learning route, staging exercise, recipe return, and legacy recovery link. Check deployed revision metadata.

Done when: the live artifact matches the intended revision and the sampled journeys work. Record actual results and any remaining human or compatibility limitations.

Evidence: deployment URL, revision, smoke-test results, and a concrete rollback revision/process. Without release authorization, leave the completed change reviewable and state that deployment is pending.

Phase gate: review-ready, implementation-validated, learner-validated, and released are reported as separate states.

## 10. Required verification matrix

| Behaviour | Required evidence |
| --- | --- |
| Initial commit | HEAD/index/working content agree |
| Stage then edit again | Index retains staged version; working file differs; both status categories are explainable |
| Commit after second edit | Commit contains the index version; later working edit remains |
| Selected-file commit | Unrelated file stays outside the commit |
| Diff interpretation | Working/index and index/HEAD comparisons show the expected content |
| Untracked file | Status detects it; ordinary diff does not misrepresent it as tracked content |
| Branch creation and switch | Correct reference/HEAD state; uncommitted work is not falsely described as isolated |
| Fast-forward merge | Expected reference advances; no fabricated merge commit |
| Diverged merge | Parent relationships and resulting file contents match the example |
| Conflict resolution | Deliberate conflict occurs; intended resolved content is committed |
| Detached HEAD example | HEAD/graph/reference descriptions agree |
| Two-copy remote workflow | Local, remote-tracking, and server branch tips are checked independently |
| Fetch | Appropriate observations update; current working content remains as expected |
| Unstage | Disk contents remain; intended index content changes |
| Discard in practice repo | Only the intended working edit is replaced; consequence is explicit |
| Revert | An inverse commit is added and original history remains reachable |
| Routes | Deep link/reload/Back/Forward/invalid-ID behaviour works |
| Context return | Exact lesson/checkpoint survives reference reload |
| Privacy | No learner/free-text terminal content is added to URLs, network requests, logs, or storage |
| Rendering | Source and built UI agree with canonical learning and recovery definitions |
| Copy | Clipboard contains the displayed command only; fallback feedback works |
| Accessible use | Keyboard/focus/announcements/motion/contrast/reflow checks have recorded results |
| Existing capability | Analyzer, recovery, reference search/filter, legacy links, and print remain usable |

Testing requirements:

- Reuse the existing temporary-repository approach and Node assertions.
- Keep fixture repositories and configuration disposable and isolated from personal/global state.
- Validate file and index contents and commit relationships rather than fixed commit IDs or version-dependent output prose.
- Normalise non-essential output differences; retain differences essential to the lesson.
- Treat captured displayed output as illustrative and explain variable paths, hashes, branch names, and messages.
- Do not execute arbitrary user-provided commands or parse lesson prose as executable code.
- Do not add snapshot tests for every paragraph, colour, or margin.
- Preserve existing recovery evidence and distinguish local Git results from hosted-provider behaviour.
- Test Bash and Windows PowerShell 5.1 setup instructions in their actual shells. A JavaScript fixture running Git does not prove shell quoting works.
- Verify the Git 2.23 claim in a suitable environment or record that compatibility check as outstanding. Running only a newer Git version is insufficient evidence for every older-version claim.

Existing commands, to be run separately as appropriate:

~~~text
npm ci
npm test
npm run build:check
npm run build
node tests/test-browser.cjs
~~~

Browser QA currently uses an existing Playwright installation. Set PLAYWRIGHT_MODULE and CHROMIUM_PATH only to actual installed paths when required. GITUNSTUCK_TEST_URL selects the target. Run against both source and the actual built artifact; do not invent npm scripts or claim browser tests are part of npm test unless you implement that change deliberately.

## 11. Completion and review gates

Implementation is complete only when:

- All required lesson content and independent tasks are present and correct.
- The staging experiment demonstrates the five specified states.
- Visualisations and example metadata agree with repository outcomes.
- The learning interface meets the clarity and responsive requirements.
- Reference and recovery links preserve context and old URLs still work.
- The source and production artifact use the same tested learning definitions.
- Existing recovery behaviour and input privacy remain intact.
- Relevant tests pass and unavailable environment checks are explicit.
- No placeholder content, fabricated evidence, unnecessary dependencies, or unexplained scope changes remain.

Human validation is complete only when actual learner evidence has been collected and reviewed. Deployment is complete only after an authorized release and live verification.

An unfinished human check must not erase completed engineering work or stop independent preparation. It must remain visible in the final status.

### Review questions

1. Can the learner explain which content the next commit will record?
2. Can they demonstrate that staging and saving in an editor are different?
3. Can they distinguish a local branch, a remote-tracking reference, and a branch on the server?
4. Does each command include enough context to avoid applying it to the wrong state?
5. Does each diagram show exactly the behaviour its text describes?
6. Can the learner find the next step and return from reference material?
7. Is any paragraph or visual element present mainly to make the site appear larger or more sophisticated?
8. Are claims of testing, accessibility, compatibility, or teaching effectiveness supported by actual evidence?

Any unanswered factual or navigation issue is a defect to address. Aesthetic preferences should be resolved consistently within the interface brief.

## 12. Kickoff instruction for the implementing LLM

Copy this instruction into the implementation session alongside this document:

~~~text
Implement the GitUnstuck learning improvement plan in the attached document.

Start with P0.1. Inspect the actual repository and applicable instructions.
Use the plan's task IDs, dependencies, file boundaries, and evidence rules.
Complete one bounded task at a time and continue through authorized work.
Deliver the complete staging lesson before expanding the other lessons.
Keep the existing recovery and command-reference capabilities working.

Use the existing static architecture and tests. Introduce only the small
shared learning module and checks specified by the plan. Do not add runtime
dependencies, an AI tutor, accounts, gamification, analytics, decorative
dashboards, or unrelated features.

For each task, implement the behaviour, verify the outcome, inspect the diff,
update docs/learning-evidence.md, and report:
Task / Changed / Verified / Still unverified / Next.

An addition must address a specific learner difficulty and have a meaningful
check. Remove filler, duplicated explanations, misleading simulation labels,
unsupported safety claims, and ornamental complexity.

Never fabricate tests, screenshots, learner research, compatibility evidence,
or review dates. Real beginner sessions require real people. Mark that work
HUMAN_PENDING if unavailable and continue independent engineering work.

Do not repeatedly ask for approval of routine implementation choices.
Do not merge or deploy unless the actual execution request authorizes it.
At completion, distinguish implementation, automated/browser validation,
human validation, and release status.
~~~

## 13. Source references

Git behaviour:

- Recording changes and the staged/unstaged distinction: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
- git add: https://git-scm.com/docs/git-add
- git diff: https://git-scm.com/docs/git-diff
- Git references and HEAD: https://git-scm.com/book/en/v2/Git-Internals-Git-References
- Remote-tracking branches and fetch: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches

Interface criteria:

- WCAG contrast explanation: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG target-size explanation and exceptions: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

Consult the relevant official command manual while implementing additional operations. Record the documentation actually checked and the repository outcomes actually executed. This source list is a starting map, not evidence that every eventual statement has been reviewed.

