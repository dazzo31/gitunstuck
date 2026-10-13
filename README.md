# GitUnstuck

A static, local-first Git reference and troubleshooting guide for GitHub, GitLab, Bitbucket and generic Git.

Live stable site: https://dazzo31.github.io/gitunstuck/

The `v2.0` branch is development work. Its implementation plan, baseline audit and evidence ledger are committed alongside the source. It is not a completed production release.

## Learning and help

The development experience starts at Home with Learn Git and Get help. Navigation is Home, Learn, Help and Reference.

- 17 task-specific guides explain starting conditions, examples, expected results and failure paths.
- Eight help topics are readable without pasting real repository data. Status interpretation and guided recovery are optional, contextual tools.
- 24 command entries, seven comparisons and grouped search connect lessons, help, error explanations and reference topics.
- Five fixed history illustrations explain commits, branch refs and HEAD. They are not a Git simulator.
- Error matching covers 24 families and preserves ambiguity. Match wording does not establish the cause.
- Shell formatting appears in Reference; provider choice scopes error interpretation. No global beginner/developer mode is advertised.
- Inputs stay ephemeral; commands never run in the website. Print excludes diagnostic inputs/results, and essential examples remain available without JavaScript.

The previous feature roadmap is paused. See docs/V2_EXPERIENCE_REVIEW_AND_FIX_PLAN.md and docs/EXPERIENCE_ACCEPTANCE.md for the corrective work and actual validation status. A green functional test run does not imply visual or editorial acceptance.

## Command prerequisites

Examples target Git 2.28 or later (switch/restore require 2.23; init -b requires 2.28). Replace every placeholder with a verified repository value before execution; quote paths containing spaces. Inspect status/diffs and preserve wanted changes before mutation. Revert, merge, rebase and stash application can conflict. Reflog can locate retained commits; it does not guarantee recovery of discarded unstaged edits. Graph branch names are illustrative.

## Development and tests

Requires Node 24 and Git on PATH. The application has no runtime dependencies. Playwright and axe-core are pinned development dependencies with a committed lockfile.

From Bash or PowerShell:

```text
npm ci --ignore-scripts
npm test
npm run check
npm run build
```

Baseline tests intentionally reproduce defects against frozen original source fixtures. Foundation tests check corrected application behavior. Git fixtures run only in disposable temporary repositories and never touch the development checkout or live remotes.

CI browser checks run on isolated GitHub-hosted runners. Baseline and corrected behavior coverage includes desktop/mobile, dark/light and both explanation modes under the Pages `/gitunstuck/` subpath. Current behavior checks include clipboard text, filter composition, injection resistance, theme persistence, print and serious/critical automated accessibility violations. These checks do not replace human screen-reader or visual review. Browser setup on an ordinary local development machine: `npx playwright install chromium`; browser harness currently runs only in CI. The experience suite captures four viewport sizes in both themes and saves screenshots as CI artifacts. Review those separately from automated assertions.

## Hosting

GitHub Pages serves a static site. The updated deployment workflow requires the reusable quality checks to pass, runs only from main, and publishes `dist` rather than the full repository. Development branch checks do not deploy the site. See `docs/IMPLEMENTATION_STATUS.md` for actual phase status and outstanding work. No production deployment has been made from this work.

## License status

The original README stated MIT, but the baseline repository had no LICENSE file. A new license has not been added because the copyright/rights details have not been confirmed. Obtain owner confirmation before redistributing under a newly added license.
