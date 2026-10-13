# GitUnstuck v2 — experience review and corrective plan

Date: 2026-10-13
Reviewed development revision: `7b875408f19d1749e9c0399a67591660f7d2276f`
Decision: pause the feature roadmap. Restore the learning and help purpose before adding provider adapters, a simulator, lessons or generators.

## Outcome and accountability

The development branch has functional safety machinery, but the visitor experience does not meet the product goal. The implementation privileged a diagnostic console, generic stepper scaffolding and test counts over teaching, useful help and consistent editorial structure. Existing and new components were moved into tabs without a complete information-architecture or content review. This produced repeated interfaces, inaccurate labels and contradictory explanations.

The intended product is **a welcoming resource for learning Git, finding practical help and looking up commands**. People must be able to read and learn without pasting terminal output, choosing a host or completing a questionnaire. Diagnostic evidence is useful when a specific repair depends on repository state; it should not dominate the first visit.

A passing CI run is evidence of tested behaviour. It is not evidence that the home page looks good, the resource teaches well, or every heading describes its body. Historical phase passes must not be presented as product acceptance.

## Review scope and limits

Reviewed the current HTML, styles, route/bootstrap code, knowledge definitions, recovery/error interfaces, README, test harness and content of all 17 topic cards, five graph scenarios and two recovery systems. Checked default route, section order, title/body relationships, source duplication, mode behaviour, workflow prerequisites, search scope, provider selection and print rules.

This is a source-based experience and editorial audit, supported by existing automated browser evidence. It is not a fresh visual inspection of rendered screenshots or a human screen-reader session. Specific conclusions about measured fold positions, pixel layout, browser-default textarea appearance and aesthetic quality require rendered verification during the corrective work. The structural causes below are directly visible in source. No production-site changes were made for this review.

## Findings

P0 means a central product promise is broken or content can mislead a user about their work. P1 means a substantial clarity, navigation or usability defect. P2 means maintenance or secondary experience quality.

| ID | Priority | Finding and evidence | Required correction |
| --- | --- | --- | --- |
| UX-01 | P0 | Empty hash defaults to Fix My Git in shell.mjs; Learn Git is the last primary navigation destination. | Add a real Home route; present learning and help prominently. A new visit must not assume a broken repository. |
| UX-02 | P0 | Hero, privacy panel, navigation, breadcrumb, host/shell preferences, shell note, error form and status form precede the common problem choices. index.html fixes the order explicitly. | Home contains a clear purpose, Learn/Get help choices and useful starting topics. Move diagnostic forms into chosen help paths. |
| UX-03 | P0 | Every one of the 17 workflow definitions has the same prerequisite and verification text. renderWorkflow starts every task with git status/branch/diff in the current directory. That is inappropriate for creating a first repository or cloning into a new directory. | Write distinct setup, actions, expected results and fallback for each supported task. No generic workflow can pass by merely displaying four steps. |
| UX-04 | P0 | Beginner primer says Git is an automatic ledger recording every saved change and describes commit snapshots as permanent. Graph introduction repeats that each save creates breadcrumbs. | Explicitly distinguish editing/saving from staging/committing. Explain retention honestly; avoid promises of automatic recording or guaranteed recovery. |
| UX-05 | P0 | “Branches: Isolated Sandboxes” and graph “Safe Sandbox”/“zero harm” contradict the card body explaining that branches share a working directory and changes can carry across switches. | Use “Create and switch branches.” Explain refs and shared working files; separate worktrees into their own topic. |
| UX-06 | P0 | Legacy recovery promises an “exact, safe recovery command” from selecting where changes live. The selected local-commit example offers reset and amend, but its effect describes only reset. | Retire the duplicate chooser or turn it into a plainly labelled comparison lesson. One problem/goal must have one consistent help entry and one matching effect description per action. |
| UX-07 | P1 | Search advertises tasks, errors and commands; filterCards searches only reference-card title, keywords and text. Typing redirects to Reference. Error catalogue uses a different input. | Index actual learning/help/reference records and group results, or label a scoped box accurately. No broad search promise before broad search works. |
| UX-08 | P1 | “Workflows” repeats a 17-link list and the older task-chip navigator; chips open reference card anchors instead of the new workflow guides. | One task index with canonical destinations; remove duplicate entry systems and unexpected destination changes. |
| UX-09 | P1 | Reference starts with a relocated recovery chooser and has no own visible section heading; 17 task recipes stand in for an actual command reference. | Add a clear Reference heading and command/topic index. Move help out of Reference; distinguish a command definition from a multi-command task. |
| UX-10 | P1 | “Playground” has five selectable static SVG illustrations. “Interactive Visual Map” promises movement in real time; “How Git & GitHub Actually Work” presents mostly local commit history. | Label current material “Visual guides” and “How commits and branches relate.” Use Playground only when a working simulation exists. |
| UX-11 | P1 | Global “Plain English” / “Developer Hub” changes mode attributes and visibility, not the wording of most content. Developer mode hides the introductory primer, while core card wording is the same. | Remove the global mode switch until two real presentations exist. Prefer one plain explanation plus optional technical detail, without hiding essential lessons. |
| UX-12 | P1 | Host selector changes a stored preference and shell note, but not most host-specific examples. Generic/GitLab/Bitbucket selection leaves many GitHub labels and recipes unchanged. | Hide/defer host control until it meaningfully changes content, or put verified host-specific controls only in relevant guides. |
| UX-13 | P1 | Recovery renders on startup with the first intent selected, risk/uncertainty prose and every missing prerequisite before someone chooses a problem. | Start help with a problem/goal list. No preselected repair, unsolicited blockers or readiness warnings before intent is selected. |
| UX-14 | P1 | A shared hero, global prerequisites and shell caveats accompany every route; short tasks inherit the same warnings as destructive repair. | Use concise site-wide orientation; place actual prerequisites at relevant actions. Keep loss/rewrite warnings clear where they apply. |
| UX-15 | P1 | New #errorInput has no matching textarea styles; #statusInput alone gets full-width/theme styles. .v2-error-match uses undefined --border-color while the stylesheet defines --border. | Shared input/panel tokens and component styles; verify both themes and narrow screens. No bespoke selector drift. |
| UX-16 | P1 | Initialization badge lists only local change although the example publishes remotely. Sync badge under-describes rewrite/publish effects. | Generate effects from canonical definitions; include all effects relevant to the selected action, and separate alternatives. |
| UX-17 | P1 | Remote card uses origin/main in effects/verification despite parameterized commands and selected Generic Git. Clone/initialization instructions retain GitHub-only wording. | Use host-neutral examples and verified placeholders; show illustrative names explicitly as examples. |
| UX-18 | P1 | CI/CD card says jobs test/build/deploy, but shown configs only run npm test. It says workflows are detected in the root despite the GitHub file living under .github/workflows. Examples omit dependency setup. | Scope the lesson to configured test jobs; document paths, prerequisites and triggers accurately. Rebuild CI templates separately after the core resource is corrected. |
| UX-19 | P1 | Reflog title says “Lost Work” and scenario starts with reset --hard; caveats appear later. This can imply recovery of discarded unstaged edits. | Lead with “Find a retained commit with reflog”; distinguish committed work from unstaged edits in the first paragraph. |
| UX-20 | P1 | Detached graph reassures “completely safe” and says “return to safety anytime,” using git switch main. | Describe attached/detached HEAD neutrally, preserve wanted commits/edits and use the intended verified branch. |
| UX-21 | P1 | Schema/source parity tests prove identical snippets, but duplicated unsafe prose can still agree. Browser suite checks visibility, copy, routes and axe; it does not inspect whether a heading's promise is fulfilled. | Add content inventory and editorial acceptance alongside meaningful task outcome tests. Visual approval is a separate gate. |
| UX-22 | P2 | Print forces all views visible, including paste forms and recovery input/results, while utility advertises a reference poster/PDF. | Offer explicit print scope: current lesson or reference. Exclude diagnostic inputs/results by default; verify pagination and accidental private-output printing. |
| UX-23 | P2 | Without JavaScript, default Fix forms remain visible but inert; hidden Learn/Reference views rely on reparenting modules. | Provide a useful static introduction, visible essential reference and a clear script-unavailable message. Hide inactive tools. |
| UX-24 | P1 | Several “Verify result” sections do not verify their named outcome: stage/commit demands a clean tree even when unrelated edits may remain; stash checks only stash list; tags uses describe to infer an active release rather than checking the intended tag object/remote. | Give operation-specific assertions about the intended files/refs/result; distinguish expected partial work from failure. |
| UX-25 | P1 | Release example assumes origin, offers publishing all tags as an adjacent alternative, and labels annotations as permanent; bisect promises diagnosis “in minutes”; cherry-pick guidance mentions continuation without the resolve/stage prerequisites. | Audit claims, examples and verification together. Separate publication alternatives, require verified targets, and remove unsupported timing/safety guarantees. |
| UX-26 | P2 | README and architecture describe a foundation and omit newer diagnostic modules; implementation tracker remains CI-centric and stale relative to accepted phases. | Update documentation to reflect current capabilities and the experience audit; mark feature roadmap paused and UX acceptance outstanding. |

## Desired first visit

Title: **Learn Git. Find your next step.**

Introduction: **Understand the essentials, follow practical guides, and get help when something goes wrong.**

Two main choices:

- **Learn Git** — Start with files, staging and commits, then branches and working with a remote.
- **Get help** — Choose a problem, understand what caused it, and follow the relevant checks.

A quieter third entry: **Command reference** — Look up syntax, effects and examples.

Follow with a compact “Start here” list: Git basics; save your first commit; clone a project; create a branch. Include a small “Common problems” list linking to unstage, merge conflict and rejected push help. Advanced recovery is discoverable in Help, not the introductory centrepiece.

The home page should explain the learning/help purpose in its first heading and make both actions visible in a 390 × 844 viewport without scrolling. This is a target to verify with screenshots, not a measurement of the current page. No terminal paste boxes, confirmation checklists, risk taxonomy or development-phase banner appears on Home.

Navigation: **Home · Learn · Help · Reference**. Practical workflows live as guides within Learn and are cross-linked from Help/Reference. Visual explanations live within relevant lessons. A dedicated Practice destination can be added after actual exercises exist. Do not retain empty or overstated destinations merely because the earlier plan named them.

## Content structure and title corrections

| Current title/label | Proposed title/label | Content promise |
| --- | --- | --- |
| Understand the state. Choose the next step. | Learn Git. Find your next step. | Equal learning/help entry, clear starting points |
| Fix My Git / What went wrong? | Get help with Git | Choose a problem; diagnostic tools offered when useful |
| Choose a recovery intent | What do you want to do? | Goal-specific plain-language choices after entering Help |
| Plain English / Developer Hub | Plain explanation + optional “Technical details” | Same essential help, with deliberate additional depth |
| Branches: Isolated Sandboxes | Create and switch branches | Refs, HEAD and shared worktree behaviour |
| Undoing Mistakes Safely | Choose how to undo a change | Separate unstaging, discarding, amending and reverting |
| Undo & Recovery Decision Tree | Compare ways to undo a change, or remove duplicate | Educational comparison, not guaranteed diagnosis |
| Playground | Visual guides, within Learn | Clearly labelled illustrations until simulation is ready |
| How Git & GitHub Actually Work | How commits and branches relate | Local Git history; hosting taught separately |
| Reflog Recovery (Lost Work) | Find a retained commit with reflog | Retained committed work and recovery limits |
| Working with Remotes (GitHub, GitLab, Bitbucket) | Fetch, integrate and publish changes | Distinct operations; optional host-specific collaboration links |
| Pipelines & Automated CI/CD | Run tests with a configured CI pipeline | What the shown example actually configures |
| Search tasks, errors, commands... | Search Git help and lessons | Only after unified results are implemented; otherwise accurately scoped |
| Print reference poster or export PDF | Print this guide / Print reference | Actual defined output scope |

Every existing topic must be audited; the table is not permission to solve a mismatch by changing only its title. Rewrite body/examples or reduce the promise together.

Each learning guide follows: goal; prerequisites; plain explanation; small worked example; expected result; try/verify; optional technical detail; related help/reference. Show Git terms alongside accessible explanations rather than replacing everything with metaphors. The staging area contains file snapshots, not simply a list of chosen files. A commit records staged contents, not every current edit.

Each help guide follows: symptom/goal; possible causes; short explanation; relevant read-only checks; decision; action with actual prerequisites; expected result; what to do if the result differs. Basic explanation remains readable without diagnostic input. Evidence and acknowledgement gates remain for personalized mutation guidance and dangerous copying.

Each reference entry follows: command and intent; syntax; parameters; affected surfaces; example; prerequisites; expected result; version/shell notes; official documentation; related guide/help. Commands and tasks are separate content types.

## All 17 topics: explicit editorial disposition

| Topic | Destination | Correction to verify |
| --- | --- | --- |
| Initialize | Learn: start a project | New-directory setup; no prerequisite requiring an existing repo; publishing is a separate step |
| Clone | Learn: join a project | Verified URL and destination; no pre-clone git status requirement |
| Stage/commit | Learn: save a change | Index snapshots; inspect staged diff; example path clearly explained |
| Branch | Learn: branch basics | No isolation guarantee; switching and worktree effects explained |
| Undo | Help plus comparison lesson | Four different goals/actions; no compound alternatives as one script |
| Remote sync | Learn: work with remotes | Fetch versus integration versus push; no universal rebase choice |
| CI/CD | Later learning/host appendix | Configured test jobs only; validated dependencies, paths and trigger caveats |
| Stash | Help/Learn: temporarily set work aside | What is included; apply/pop difference; conflicts; original branch context |
| Merge conflict | Help plus lesson | Identify merge versus rebase/cherry-pick; inspect intended file outcome; continue/abort distinct |
| Interactive rebase | Advanced lesson | Private/shared ownership; replay and changed identities; conflict/abort; avoid “polish” hiding effects |
| Detached HEAD | Help plus concept lesson | Read-only inspection normal; committed rescue versus uncommitted edits |
| Worktree | Advanced lesson | Separate working folders, same repository/ref constraints; contrast with branch |
| Reflog | Advanced help | Retained commits, expiry and availability; no unstaged recovery promise |
| Bisect/blame | Advanced debugging lesson | Distinct tools and outcomes; bisect setup/test/reset; blame is attribution, not proof of fault |
| Tags | Learn/Reference | Tag versus branch; local creation versus publishing; SemVer is a project convention |
| Force with lease | Advanced reference/help | Explicit expected remote OID; coordination and loss risk; never a default rejected-push fix |
| Cherry-pick | Advanced lesson | Applies changes into a new commit; conflicts; source identity differs; compare merge |

All five visual scenarios also require a prose audit: commits are explicit, branch labels are refs, merge may fast-forward or conflict, rebase creates new identities, and detached HEAD does not imply damage. Never reassure safety without naming the state and conditions.

## Visual direction

Build a calm reading resource with a restrained Git orange accent, consistent type hierarchy, whitespace and short introductions. Preserve recognisable GitUnstuck branding. Choose a tested light/dark design; colours alone are not the fix.

- Home: brief heading/introduction, two primary entry cards, small reference link and starting topics. Minimal chrome.
- Guide: readable content column, local contents navigation on desktop and compact contents disclosure on mobile; commands appear beside the explanation they support.
- Help: problem list first; selected guide next; optional error/status tools within that context. Avoid two large unrelated forms at the top.
- Header: brand, four destinations, theme, clearly scoped search. No first-visit mode toggle, host/shell/reset cluster or development status.
- Preferences: shell near code examples; provider only where collaboration is provider-specific. Keep a consistent selected value when relevant.
- Warnings: brief and action-specific. Highlight irreversible loss and history rewrite; put secondary detail behind a clearly labelled disclosure. Preserve safety, reduce repetition.
- Components: shared typography, button/input styles, panel spacing, border tokens and focus treatment; do not maintain separate unstyled paste fields.

## Replacement execution plan

This corrective sequence takes precedence over the previous next-task queue. Do not start the simulator or template generator while core content/navigation remains inconsistent.

### R1 — inventory and editorial contracts

1. Create a content inventory for Home, every navigation destination, all 17 topics, eight recovery journeys, 24 error families and five visuals.
2. Record title, intended audience/goal, body promise, prerequisites, expected result, canonical links and source for each.
3. Mark inaccurate/unsubstantiated promises and duplicate material. Fix the high-risk teaching claims first in the planned rewrite.
4. Define canonical learning/help/reference records so selectors, titles, prose, effect badges and related links cannot drift independently.

Exit: all current material has a disposition and a reviewed promise; no “complete, verified workflow” label for generic scaffolding. Review all 24 diagnoses for whether their cause alternatives and provider labels are accurate; match scores stay internal or plainly explained.

### R2 — first-visit structure and visual prototype

1. Implement Home and the four-destination structure using current useful content; preserve legacy anchors with explicit redirects/mapping.
2. Remove diagnostics/preferences from Home and stop auto-selecting a recovery action.
3. Build Home plus one real lesson (“Save your first commit”) and one real help guide (“Unstage a file”) as the reference design.
4. Capture desktop/mobile, light/dark screenshots and inspect spacing, hierarchy, above-fold choices and every control state.
5. Present this concrete prototype for design review before migrating all content.

Exit: the resource's purpose and both main actions are immediately understandable; the sample lesson/help title and body agree. No claim of visual approval based on axe or screenshot existence alone.

### R3 — topic-specific learning and help

1. Rewrite initialize, clone, stage/commit, branch and remote guides with correct starting state and expected results.
2. Replace the generic four-step rendering with actual per-task sections; a linear stepper is used only if the task benefits from it.
3. Consolidate legacy undo chooser/new recovery wizard into one discoverable help system with one action-specific effect description.
4. Audit/rewrite the other 12 topics and five graph explanations using the inventory.
5. Keep the status parser and recovery engine as optional tools inside selected help, retaining uncertainty/injection and destructive-action restrictions.
6. Offer help for unknown/unsupported states and use “No close match” rather than confidence theatre or intimidating internal taxonomy.

Exit: each guide has meaningful, task-specific prerequisites and outcome checks. Initializing/cloning do not require an existing repository; every help title matches the selected goal. Learning does not require pasting real repository data.

### R4 — reference, search and contextual controls

1. Build a visible command index and stable command pages separate from task guides.
2. Index learning/help/reference; group results and include common intent aliases. Maintain existing category/effect filter conjunction for scoped reference searches.
3. Link workflows/errors to canonical entries rather than copies of explanation text.
4. Add shell formatting and host-specific content only where those choices change meaningful output. Clearly scope placeholder substitution.
5. Replace global mode with optional technical depth, or implement and test real alternate wording before retaining a mode claim.
6. Define useful no-JavaScript and print outputs; exclude diagnostic input/output from default print.

Exit: advertised search scope equals indexed scope; navigation labels describe content; preferences have visible verified effects; deep links/back-forward remain usable.

### R5 — product acceptance and release evidence

1. Run existing unit, schema, real-Git, injection, clipboard and route tests; adapt old tests to the new information architecture, preserving semantic safety assertions.
2. Add concrete user journeys: new visitor starts learning; novice creates first commit; newcomer clones; user unstages; user reads merge help; rejected push remains cautious; experienced user finds command; provider-specific help uses accurate host terminology.
3. Capture 1440 × 900, 768 × 1024, 390 × 844 and 320 × 568 screenshots, light/dark, Home and all primary destinations, plus selected help/lesson/control states. Check horizontal overflow, focus, wrapping and forms.
4. Check title/body alignment using reviewed content contracts and manual editorial reading, not only string-matching assertions.
5. Perform keyboard and screen-reader checks; explicitly report human checks that could not be performed. Separate automated accessibility results from human acceptance.
6. Update README, architecture, capabilities/limits and roadmap to the actual experience. Keep main/deployment separate from design review.

Exit: no open P0/P1 experience/content defect from this audit; tests pass; screenshots actually reviewed; user can review the concrete Home/lesson/help experience. Do not declare production-ready from CI alone.

### R6 — reconsider later features

After the corrected experience is accepted, reconsider provider adapters, simulator, conflict practice and CI generator according to whether they improve learning/help. The simulator and generator are not prerequisites for a useful core release. The CLI/VS Code companion remains separately deferred. Do not resume the old phase sequence automatically after cosmetic changes.

## Preserve the valuable engineering

Retain text-only rendering and explicit trusted content boundaries; conjunction of search/category/effect filters; bounded ephemeral inputs; no pasted-data logging/storage/network upload; uncertainty and operation identity checks; isolated real-Git fixtures; separate test/build/deploy; Pages subpath support; mutation warning/copy restrictions; no shell execution in the website.

Refactor or remove duplicated UI and generic prose. Retaining a testable backend model does not require retaining the interface that made it hard to understand.

## Acceptance checklist

- A first-time visitor sees learning and help as the purpose and can choose either without a form or preference.
- No default repair is selected before the visitor chooses a problem.
- Every title/subtitle/action label agrees with the actual content and behaviour.
- Readable learning and help are available without live repository evidence.
- Each workflow has correct starting-state requirements, examples and outcome checks.
- Git does not appear to record every file save; branches are not described as isolated folders; reflog does not imply guaranteed recovery.
- Search results cover precisely what the search advertises.
- Provider/shell/depth controls accurately describe and change their scoped content.
- Duplicate help/topic routes lead to one canonical destination.
- Both themes, narrow layouts, focus and form styles are visually inspected.
- Print excludes private diagnostic state by default; static fallback is useful.
- CI results, editorial review and visual/human acceptance are reported separately.

## Immediate next action

Build and review the Home + first-commit lesson + unstage-help prototype from R2 after completing R1's content contracts. Do not mass-rewrite the interface or add the remaining feature phases before this small coherent experience is reviewable.
