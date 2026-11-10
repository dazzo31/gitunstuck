# GitUnstuck

[Open GitUnstuck](https://dazzo31.github.io/gitunstuck/)

GitUnstuck is a browser guide with three destinations:

- **Fix a problem:** paste Git output or choose a specific recovery path. Read the prerequisites, run one step at a time, and verify the result.
- **Learn Git:** optional setup followed by six practical lessons: inspect, staging, history, branches/merges, remotes, and recovery. Each uses a fresh plain-text practice project, a prediction, observations, and an independent task.
- **Find a command:** search the command reference for syntax, effects and examples.

Pasted terminal content is processed in the current tab. The app does not upload or save that content. Theme and display preferences use local storage. No account or runtime package installation is required.

## Development status

The baseline course was published at revision `5678788` by the [successful Pages run](https://github.com/dazzo31/gitunstuck/actions/runs/42379373047). Live staging, feedback, remotes, exact reference return after reload and an existing recovery link were checked on 9 November 2026.

The clarity follow-up was published at application revision `6913e3b` by the [successful Pages run](https://github.com/dazzo31/gitunstuck/actions/runs/42774274126). Live desktop/mobile checks passed on 10 November 2026 for the numbered index, three-stage preparation, both shell-command copies, checkpoint focus, prediction feedback, reference reload/return, remotes and an existing recovery link. Subsequent documentation-only commits can advance the site's revision marker; tested application and publication evidence are recorded in [learning evidence](docs/learning-evidence.md).

Follow-up checks: **15 PASS**, **1 BLOCKED** for native browser-menu zoom and screen-reader observation, and **2 HUMAN_PENDING** for actual beginner sessions and follow-up transfer checks. See [learning evidence](docs/learning-evidence.md) for the task tracker, tested artifacts and limitations. [Earlier release evidence](docs/recovery-audit/release.md) concerns the preceding recovery release.

## Follow the learning course

To work through a lesson:

1. Open **Learn Git**. Optional setup sits above the six numbered core lessons; **Start here** opens the inspection lesson. Every lesson remains directly accessible.
2. Expand **Prepare this practice folder**. Choose **Bash / Git Bash** or **Windows PowerShell 5.1** to see the matching directory commands. Follow the three stages: choose a fresh folder, prepare Git locally, and create the starting snapshot. Each lesson uses its own practice directory.
3. Use the checkpoint outline or the specific previous/next links. Predict the result, run commands in your terminal, and compare the actual observation. On later checkpoints, **About this lesson** holds the background and preparation remains available in a closed disclosure.
4. Follow a lesson's reference link when needed, then use its **Return to…** link to resume the exact checkpoint, including after a reference reload. Attempt the independent task before opening its worked answer.

The shell choice lasts only within the current tab and resets on reload. Browser navigation, predictions and restart controls affect the illustration; they do not execute Git or change your practice files.

## What the analyzer can establish

The analyzer handles English Git output and recognizes explicit protected-branch, secret-scanning, authentication, detached HEAD, merge, rebase and divergence evidence. Potentially sensitive untracked filenames are labeled as filename observations, not proof of a secret. Its diagnosis and the consequences of the proposed commands are separate. It cannot inspect your repository, establish backups, verify credential exposure, or know whether output is current.

Unknown, incomplete, generic hook and ambiguous output produces **“Not enough information.”** GH013 alone is a repository-rule code; it does not establish a secret. A clean status is reported as a limited observation, including its ignored-file and remote-state limits.

Secret cleanup is limited to two manually selected paths: an accidentally tracked file, or a credential inside legitimate source, confined to the latest unpublished non-merge commit. Both require a clean initial index/working tree and inspection of all outgoing ancestry. Earlier, shared or uncertain history is routed to official cleanup instructions. Removing a secret from the new tip does not erase old local objects or reflogs. Rotate credentials when exposure occurred or cannot be excluded.

Protected-branch guidance creates and publishes a new review branch. It does not reset the original branch or uncommitted files. Branch and remote names must be checked locally; the recipes do not assume `main` or `origin`.

## Run and check locally

Open `index.html` alongside `recovery.js`, `learning.js` and the SVG assets in a modern browser. Source checkout use needs no build. `#learn` opens the outline; `#learn/staging/edited-v3` opens a specific checkpoint. Lesson reference links retain their validated checkpoint through reload and search. Browser controls change illustrations only; the page cannot inspect or grade a real repository.

Commands use Git 2.23+ syntax. Current learning fixtures ran on Git 2.56.0.windows.4; actual Git 2.23 runtime compatibility remains unverified. Bash and Windows PowerShell 5.1 setup blocks were executed in their actual shells. Use a fresh named directory for each lesson; practice identity, hook, signing and pager settings stay local. Replace uppercase reference placeholders with checked values; paths containing shell expansion characters or quotes need shell-specific quoting. Do not paste credentials into the guide.

With Node.js 22 or later and Git installed:

```text
npm test
```

This runs parser/source checks, recovery integration tests, and the learning data/real-Git suite. Current Windows runs passed 194 analyzer assertions, 33 recovery scenarios and all seven lesson setups/worked examples/independent tasks. Learning setup was executed in Git Bash and Windows PowerShell 5.1. Checked-in CI workflows run Ubuntu with Node 22; there is no checked-in Windows job. Local validation used Node 26.12.1. Source-string assertions establish markup properties; Git fixtures establish repository outcomes.

The recovery tests use temporary repositories and local bare remotes. They inspect actual file contents, index snapshots, untracked files, commit reachability and remote history. Coverage includes full staged-diff review, fetched outgoing-secret history, everyday remote updates in equal/ahead/behind/diverged states, latest and earlier secrets, dirty protected-branch recovery, main/master/custom branches, custom remotes, paths with spaces, existing backup names, real merge and rebase conflicts, reflog, snapshots, discard, unstage, rewind, revert, clone, commit, worktree, tags, cherry-pick, lease rejection and deterministic bisect. The snapshot commands were also executed in actual Windows PowerShell and Git Bash.

For the minified, self-contained GitHub Pages artifact:

```text
npm ci
npm run build:check
npm run build
```

Build-only minifiers are locked in `package-lock.json`; they are not browser dependencies. The build embeds the same `recovery.js` and `learning.js` consumed by the interface and tests into `dist/index.html`. Metadata records base Git HEAD, clean/dirty working-tree state, and a SHA-256 of source/build inputs so an uncommitted artifact is not mistaken for a clean revision. The Pages workflow runs `npm test` before building and deploying.

## Browser verification

Optional browser QA uses an existing Playwright installation and Chromium; it adds no project dependency. Set `PLAYWRIGHT_MODULE` to its installed module path and, if needed, `CHROMIUM_PATH` to the browser executable, then run:

```text
node tests/test-browser.cjs
```

Set `GITUNSTUCK_TEST_URL` to test an HTTP deployment or the built `dist/index.html` file URL. Results and screenshots are written to ignored `artifacts/`.

Current source and built Chromium journeys cover all lessons, reference return/reload/Back/Forward, recovery, legacy routes, clipboard success/failure, input privacy and reference printing. Presentation checks use 320, 390, 768 and 1440 CSS-pixel widths in both themes, keyboard focus, reduced motion, sampled text/graph contrast and desktop CSS zoom at 200%. The clarity follow-up also ran focused source/built journeys in installed Firefox 159.0.1 through an isolated headless profile: ordered entry, shell choice, keyboard input, focus, feedback, reference reload/return and reflow. Screenshots were inspected. Actual browser-menu zoom and a real screen-reader pass remain unverified. No accessibility certification or beginner teaching-effectiveness claim is made.

## Limits and evidence

Local bare remotes do not reproduce GitHub/GitLab/Bitbucket rule engines, secret scanners, login services, token permissions, credential rotation or web review requests. Provider behavior is documented separately from local Git outcomes. The interactive-rebase integration case keeps the default todo list; arbitrary human edits and editor integrations are not covered.

Ignored files, submodule work and external files require separate preservation. A branch only references commits; a stash is not an external backup. Reflog availability is local and configurable. Revert retains the original history and cannot remove a secret from it. Every recovery path requires the user to confirm its prerequisites.

See the [task tracker](docs/recovery-task-tracker.md), [original baseline inventory](docs/recovery-audit/baseline.md), and [support boundaries](docs/recovery-audit/support.md). The baseline records original defective advice for auditing; it is not current recovery guidance.

Reference cards keep prerequisites and consequences visible while steps and verification expand on request. Common execution instructions appear once above the reference; shared secret-cleanup variants use their parent documentation link. Everyday remote updates use a checked fast-forward workflow, with separate divergence guidance.

Existing links such as `#terminalAnalyzer`, `#troubleshootConsole`, `#undo-lost-reflog`, `#card-detached`, `#forge-github` and `#zone-staging` remain supported. Provider/incident links use forms such as `#forge-gitlab/secret`; reference search terms and filters can be shared in the URL. Terminal input is never included in those links.

## Support and license

[GitHub Sponsors](https://github.com/sponsors/dazzo31) · [Buy Me a Coffee](https://buymeacoffee.com/dazzo31)

[MIT](LICENSE).
