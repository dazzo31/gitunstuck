# Recovery implementation tracker

Baseline: main at `ac3901f369ed162f7793ccdef3846fb1adb88481`; initial worktree clean. The user's seven phases are the acceptance gates. No framework, provider, learning topic or runtime dependency was added.

| Task | Status | Changed files | Verification evidence | Remaining limitations |
| --- | --- | --- | --- | --- |
| P1 baseline | Complete | docs/recovery-audit/baseline* | Original 155 assertions and build check passed; inspected desktop/mobile Chromium screenshots; inventoried original cards, undo paths, provider cases, analyzer branches, snapshots and diagrams | Original local a11y script failed because of undeclared dependencies; baseline screenshots alone do not establish accessibility |
| P2.1 secret guidance | Complete | recovery.js, index.html, tests/test-recovery.js | Executed latest-file and latest-source cleanup; inspected every reachable commit for synthetic credentials; pushed to a bare remote; earlier-history case remains leaked and is not claimed cleaned | Old local objects remain; rotation and real provider scanning are not simulated |
| P2.2 protected branches | Complete | recovery.js, index.html, tests/test-recovery.js | Review branches published from main/master/custom branches with a custom remote; staged, unstaged, untracked contents and original branch commits retained | Real host policy and web review requests are external |
| P2.3 uncertainty | Complete | recovery.js, index.html, tests/test-analyzer.js | GH013-only, generic hooks, incomplete conflicts and overlapping states request inspection; diagnosis never promises preservation; untracked filenames are observations only | Text cannot establish live repository state; English output only |
| P2.4 remaining recipes | Complete | recovery.js, index.html | Shared recipes state prerequisites, consequences, verification and failures; removed chained continue/abort, guessed reflog offsets, unconditional pull/rebase, credential-cache deletion and destructive branch cleanup | Complex unsupported states are routed to official documentation |
| P3 executable tests | Complete | tests/test-recovery.js, tests/test-analyzer.js, package.json, .github/workflows/deploy.yml | 29 Windows scenarios passed, including actual PowerShell and Git Bash execution; Ubuntu Node 22 CI passed 193 assertions and 28 Bash-compatible scenarios. Real merge-status testing corrected operation detection. CI now gates Pages builds on npm test | Bare Git cannot simulate hosting policies; rebase-plan fixture keeps its default todo list |
| P4 destinations/navigation | Complete | index.html, tests/test-browser.cjs | Desktop/mobile journeys passed: staging lesson, command search/reload/Back, legacy undo/card/forge/zone/analyzer URLs and copied provider/incident links | Historical mode/query parameters remain compatibility paths |
| P5 content | Complete | index.html, recovery.js | All shared recovery panels render the six required sections; reviewed titles, corrected zone effects and analogies, removed blanket preservation/retention claims | Diagrams illustrate examples rather than a live repository |
| P6 presentation/shared data | Complete | index.html, recovery.js, scripts/build.mjs, tests/test-browser.cjs | Inspected all three destinations at desktop/mobile widths; no document overflow; actual copy, skip-link, arrow keys and focus checks pass; sampled recovery-text contrast passes both themes; reduced motion exercised; rendered commands equal shared data | Chromium only; sampled contrast is not full accessibility certification. Browser cache changed externally, so final checks use another already installed Chromium |
| P7 evidence/release | Complete | README.md, CONTRIBUTING.md, CHANGELOG.md, .github/PULL_REQUEST_TEMPLATE.md, scripts/build.mjs, docs/recovery-audit/release.md, docs/recovery-audit/deployed-browser.json | User authorized publication; PR #1 merged; Ubuntu checks and Pages deployment succeeded. Live HTTP 200 revision matched c986394; production desktop/mobile journeys and screenshots verified | Provider policy engines, other browsers and full accessibility certification remain outside verification; see release.md |

## Evidence interpretation

Link presentation follow-up: shared link colour, underline, hover and focus styling added; shared recipes own their single "Official documentation" footer, with fallback footers limited to standalone cards. 193 parser assertions and source/minified desktop/mobile browser journeys passed, including link colour, documentation-link contrast and single-footer checks.

Parser/data/source assertions verify recognition and markup properties. Disposable repositories verify file contents, the index, commit reachability and resulting remote history. Browser checks verify interaction and sampled presentation. Provider policies, login services, real credential exposure and rotation are not established by any local test.

The original inventory deliberately records defective commands as baseline evidence. It is not endorsed recovery guidance. Current recipes are in recovery.js, shared by the UI, executable tests and production build.

Link appearance correction: reproduced the unwanted blue outline on focused destination panels. Focus indicators now apply to interactive controls; route targets have no outline. Lesson links use green navigation rows with arrows, documentation links use compact outlined controls, and inline references use green dotted underlines. Source and minified desktop/mobile checks pass for these treatments, single references, contrast, keyboard controls and absence of panel outlines. Removed duplicate initial routing to avoid repeated focus changes.

## Focused consistency pass

All six requested corrections are implemented and verified locally; release uses the existing Pages workflow. No framework, provider, learning topic or visual redesign was added.

| Task | Status | Changed files | Verification evidence | Limits |
| --- | --- | --- | --- | --- |
| C1 risk labels | Complete locally | index.html | Static umbrella risk badges removed; consequence filters derive from recipe keys. Browser selects secret guidance, checks credential-exposure text and confirms no safe badge | Pasted output does not establish live repository safety |
| C2 learning model | Complete locally | index.html | Timeline and its commit examples explicitly distinguish creating a commit from editor saves; desktop/mobile learning journey passes | Diagrams remain illustrative |
| C3 destination alignment | Complete locally | index.html, recovery.js, tests/test-recovery.js | Remote lesson leads to Update a branch from its remote. Separate divergence explanation remains available. Executed equal/ahead/behind/diverged histories with custom branch and remote; fast-forward rejection preserves work and history | Real host permissions and policies are external |
| C4 repetition | Complete locally | index.html, tests/test-browser.cjs | Reference cards have one title, one common execution paragraph, visible prerequisites/consequences and closed step disclosures. Browser verifies no legacy checklist/footer injection and one shared secret documentation link | Distinct recipes can still cite different relevant documents |
| C5 useful inspection | Complete locally | recovery.js, tests/test-recovery.js | Initial commit review prints actual staged lines before a separate commit step. Secret inspection executes fetch and full outgoing patches; earlier-secret fixture confirms the credential appears in that inspection while HEAD/index/files remain unchanged | Secret-bearing output must remain local; merges and uncertain ancestry still require separate cleanup |
| C6 plain wording | Complete locally | index.html | Replaced highway/Rosetta/lifecycle labels and removed redundant analyzer jump button; browser and source checks pass | Existing deep-link IDs retained |

Validation: 194 parser/data/source assertions, 33 Windows executable recovery scenarios, and source/minified desktop/mobile Chromium journeys pass. Screenshots inspected for all three destinations. Provider engines and complete accessibility certification remain outside these checks.
