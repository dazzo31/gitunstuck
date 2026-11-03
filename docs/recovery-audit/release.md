# Release evidence

Application commit: 3875716dcf090e07a878ad8a40b786ff0978550d on fix/recovery-evidence. A following documentation-only commit records this report.

## Completed

- npm test: 193 parser/data/source assertions and 29 executable recovery scenarios passed.
- Recovery fixtures asserted file contents, staged/unstaged/untracked preservation, commit reachability and bare-remote history. PowerShell and Git Bash executed the authored snapshot text.
- Production build passed; dist/index.html is approximately 292.2 KB uncompressed and 63.6 KB Brotli. The shared recovery module is inlined and revision metadata identifies the source commit.
- Desktop 1440x1000 and mobile 390x844 browser journeys passed against the minified artifact, including recipe-data equality, unknown/secret diagnosis, staging learning, command lookup, reload/Back, old links, copy, input escaping, skip-link/arrow/focus behavior, reduced-motion preference, sampled recovery contrast and zero document overflow.
- Screenshots for all three destinations were inspected locally in artifacts/. Machine-readable final results are in final-browser.json.
- Environment: Windows PowerShell, Git 2.56.0.windows.3, Node 26.12.1, existing Chromium/Playwright installation. Ubuntu CI on Node 22 also passed 193 assertions and 28 executable scenarios (Bash only; the extra local scenario tests PowerShell).

## Unverified or excluded

Provider policy engines, actual credential rotation, login services, web review requests, arbitrary history cleanup, interactive editor variations, other browsers and a full accessibility audit were not established locally. See support.md for per-recipe prerequisites and limitations.

## Publication and deployed verification

The user explicitly approved publishing to dazzo31/gitunstuck and deploying through GitHub Pages on 2026-11-03. The earlier automatic-approval rejection was resolved by that authorization; it remains historical context, not a current blocker.

- Review: https://github.com/dazzo31/gitunstuck/pull/1 (merged).
- Ubuntu CI: https://github.com/dazzo31/gitunstuck/actions/runs/41616725489 (success; 193 assertions and 28 Bash-compatible recovery scenarios).
- Application merge revision: c986394f7f9b93d7a8d6e0e07c3a44abf860bcd0.
- Pages deployment: https://github.com/dazzo31/gitunstuck/actions/runs/41616825875 (success). Its Build site step ran the recovery tests before producing the artifact.
- Live URL: https://dazzo31.github.io/gitunstuck/
- At 2026-11-03 10:10 UTC, the live page returned HTTP 200 and its gitunstuck-revision marker matched the application merge revision.
- The existing browser suite passed against the live HTTPS site at 1440x1000 and 390x844, covering recovery, learning, reference, search/reload/Back, old and copied links, command copying, keyboard/focus behavior, reduced motion, input escaping, recipe-data equality, sampled light/dark recovery-text contrast, and zero document overflow. Production screenshots were visually inspected. Machine-readable results are in deployed-browser.json.

Application code is unchanged by the following documentation-only publication of this evidence. The build revision marker advances with each documentation commit; the application verification above identifies the first verified release revision. Full accessibility certification, other browsers, real provider policy engines and real credential exposure/rotation remain outside these checks.
