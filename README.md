# GitUnstuck

[Open GitUnstuck](https://dazzo31.github.io/gitunstuck/)

GitUnstuck is a browser guide with three destinations:

- **Fix a problem:** paste Git output or choose a specific recovery path. Read the prerequisites, run one step at a time, and verify the result.
- **Learn Git:** follow the existing lessons on repositories, staging, commits, branches and remotes.
- **Find a command:** search the command reference for syntax, effects and examples.

Pasted terminal content is processed in the current tab. The app does not upload or save that content. Theme and display preferences use local storage. No account or runtime package installation is required.

## What the analyzer can establish

The analyzer handles English Git output and recognizes explicit protected-branch, secret-scanning, authentication, detached HEAD, merge, rebase and divergence evidence. Potentially sensitive untracked filenames are labeled as filename observations, not proof of a secret. Its diagnosis and the consequences of the proposed commands are separate. It cannot inspect your repository, establish backups, verify credential exposure, or know whether output is current.

Unknown, incomplete, generic hook and ambiguous output produces **“Not enough information.”** GH013 alone is a repository-rule code; it does not establish a secret. A clean status is reported as a limited observation, including its ignored-file and remote-state limits.

Secret cleanup is limited to two manually selected paths: an accidentally tracked file, or a credential inside legitimate source, confined to the latest unpublished non-merge commit. Both require a clean initial index/working tree and inspection of all outgoing ancestry. Earlier, shared or uncertain history is routed to official cleanup instructions. Removing a secret from the new tip does not erase old local objects or reflogs. Rotate credentials when exposure occurred or cannot be excluded.

Protected-branch guidance creates and publishes a new review branch. It does not reset the original branch or uncommitted files. Branch and remote names must be checked locally; the recipes do not assume `main` or `origin`.

## Run and check locally

Open `index.html` alongside `recovery.js` and the SVG assets in a modern browser. Source checkout use needs no build. Commands in the guide use Git 2.23+ syntax and ordinary double-quoted paths. Replace uppercase placeholders before running a command; paths containing shell expansion characters or quotes need shell-specific quoting. Do not paste credentials into the guide.

With Node.js 22 or later and Git installed:

```text
npm test
```

This runs parser/source checks and disposable-repository integration tests. On the implementation machine, 194 parser/data/source assertions and 33 recovery scenarios passed. The Ubuntu CI suite exercises Bash; Windows additionally runs the PowerShell scenario. Source-string assertions only establish markup/data properties; the integration tests establish repository outcomes.

The recovery tests use temporary repositories and local bare remotes. They inspect actual file contents, index snapshots, untracked files, commit reachability and remote history. Coverage includes full staged-diff review, fetched outgoing-secret history, everyday remote updates in equal/ahead/behind/diverged states, latest and earlier secrets, dirty protected-branch recovery, main/master/custom branches, custom remotes, paths with spaces, existing backup names, real merge and rebase conflicts, reflog, snapshots, discard, unstage, rewind, revert, clone, commit, worktree, tags, cherry-pick, lease rejection and deterministic bisect. The snapshot commands were also executed in actual Windows PowerShell and Git Bash.

For the minified, self-contained GitHub Pages artifact:

```text
npm ci
npm run build:check
npm run build
```

Build-only minifiers are locked in `package-lock.json`; they are not browser dependencies. The build embeds the same `recovery.js` consumed by the interface and tests into `dist/index.html`. The Pages workflow runs `npm test` before building and deploying.

## Browser verification

Optional browser QA uses an existing Playwright installation and Chromium; it adds no project dependency. Set `PLAYWRIGHT_MODULE` to its installed module path and, if needed, `CHROMIUM_PATH` to the browser executable, then run:

```text
node tests/test-browser.cjs
```

Set `GITUNSTUCK_TEST_URL` to test an HTTP deployment or the built `dist/index.html` file URL. Results and screenshots are written to ignored `artifacts/`.

Desktop (1440×1000) and mobile (390×844) Chromium checks cover recovery, staging lessons, command search, reload/Back, retained deep links, copy output, keyboard entry/arrow navigation, focus visibility, reduced motion, sampled recovery-text contrast in both themes, and horizontal overflow. Screenshots were visually inspected. The same journeys passed against the deployed HTTPS site; see [release evidence](docs/recovery-audit/release.md). This is not a complete accessibility certification or cross-browser test.

## Limits and evidence

Local bare remotes do not reproduce GitHub/GitLab/Bitbucket rule engines, secret scanners, login services, token permissions, credential rotation or web review requests. Provider behavior is documented separately from local Git outcomes. The interactive-rebase integration case keeps the default todo list; arbitrary human edits and editor integrations are not covered.

Ignored files, submodule work and external files require separate preservation. A branch only references commits; a stash is not an external backup. Reflog availability is local and configurable. Revert retains the original history and cannot remove a secret from it. Every recovery path requires the user to confirm its prerequisites.

See the [task tracker](docs/recovery-task-tracker.md), [original baseline inventory](docs/recovery-audit/baseline.md), and [support boundaries](docs/recovery-audit/support.md). The baseline records original defective advice for auditing; it is not current recovery guidance.

Reference cards keep prerequisites and consequences visible while steps and verification expand on request. Common execution instructions appear once above the reference; shared secret-cleanup variants use their parent documentation link. Everyday remote updates use a checked fast-forward workflow, with separate divergence guidance.

Existing links such as `#terminalAnalyzer`, `#troubleshootConsole`, `#undo-lost-reflog`, `#card-detached`, `#forge-github` and `#zone-staging` remain supported. Provider/incident links use forms such as `#forge-gitlab/secret`; reference search terms and filters can be shared in the URL. Terminal input is never included in those links.

## Support and license

[GitHub Sponsors](https://github.com/sponsors/dazzo31) · [Buy Me a Coffee](https://buymeacoffee.com/dazzo31)

[MIT](LICENSE).
