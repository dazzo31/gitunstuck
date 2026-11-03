# Local release evidence

Application commit: 3875716dcf090e07a878ad8a40b786ff0978550d on fix/recovery-evidence. A following documentation-only commit records this report.

## Completed

- npm test: 193 parser/data/source assertions and 29 executable recovery scenarios passed.
- Recovery fixtures asserted file contents, staged/unstaged/untracked preservation, commit reachability and bare-remote history. PowerShell and Git Bash executed the authored snapshot text.
- Production build passed; dist/index.html is approximately 292.2 KB uncompressed and 63.6 KB Brotli. The shared recovery module is inlined and revision metadata identifies the source commit.
- Desktop 1440x1000 and mobile 390x844 browser journeys passed against the minified artifact, including recipe-data equality, unknown/secret diagnosis, staging learning, command lookup, reload/Back, old links, copy, input escaping, skip-link/arrow/focus behavior, reduced-motion preference, sampled recovery contrast and zero document overflow.
- Screenshots for all three destinations were inspected locally in artifacts/. Machine-readable final results are in final-browser.json.
- Environment: Windows PowerShell, Git 2.56.0.windows.3, Node 26.12.1, existing Chromium/Playwright installation. Node 22 is configured in CI; CI has not run on this branch yet.

## Unverified or excluded

Provider policy engines, actual credential rotation, login services, web review requests, arbitrary history cleanup, interactive editor variations, other browsers and a full accessibility audit were not established locally. See support.md for per-recipe prerequisites and limitations.

## Publication state

Automatic approval review rejected git push -u origin fix/recovery-evidence because it would export repository contents to GitHub without explicit authorization for that export. The preceding dry-run changed no remote refs. No remote branch, pull request, CI run or production deployment was created. No alternative publication path was attempted after the rejection.

User approval is required to publish the reviewed changes to dazzo31/gitunstuck and release via its existing GitHub Pages workflow. Production and deployed desktop/mobile journeys remain a release gate; local artifact checks are not described as production verification.
