# GitUnstuck

A static, local-first Git reference and troubleshooting guide for GitHub, GitLab, Bitbucket and generic Git.

Live stable site: https://dazzo31.github.io/gitunstuck/

The `v2.0` branch is development work. Its implementation plan, baseline audit and evidence ledger are committed alongside the source. It is not a completed production release.

## Current capabilities

- Task links, beginner/developer explanations and 17 command/workflow cards.
- Search combined with category and effect filters.
- Recovery recipes and five illustrated commit-graph scenarios.
- Three provider CI starter examples, theme preferences, keyboard search, clipboard and print.
- Client-side explanations only: the website does not execute Git commands.

## Command prerequisites

Examples target Git 2.28 or later (switch/restore require 2.23; init -b requires 2.28). Replace every placeholder with a verified repository value before execution; quote paths containing spaces. Inspect status/diffs and preserve wanted changes before mutation. Revert, merge, rebase and stash application can conflict. Reflog can locate retained commits; it does not guarantee recovery of discarded unstaged edits. Graph branch names are illustrative.

## Development and tests

Requires Node 24 and Git on PATH. No application dependency or build step is required for the existing static site.

From Bash or PowerShell:

```text
node --test tests/baseline.test.mjs tests/baseline-git.test.mjs tests/foundation.test.mjs
```

Baseline tests intentionally reproduce defects against frozen original source fixtures. Foundation tests check corrected application behavior. Git fixtures run only in disposable temporary repositories and never touch the development checkout or live remotes.

CI browser checks run on isolated GitHub-hosted runners. Baseline coverage includes desktop/mobile, dark/light and both explanation modes under the Pages `/gitunstuck/` subpath. These checks do not replace human screen-reader or visual review.

## Hosting

GitHub Pages serves a static site; the stable deploy workflow is currently on main. Development branch checks do not deploy the site. Before integrating development changes, publish only a dedicated public build directory after successful quality checks. See `docs/IMPLEMENTATION_STATUS.md` for the actual phase status and outstanding work.

## License status

The original README stated MIT, but the baseline repository had no LICENSE file. A new license has not been added because the copyright/rights details have not been confirmed. Obtain owner confirmation before redistributing under a newly added license.
