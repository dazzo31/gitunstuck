# Changelog

All notable changes to GitUnstuck are recorded here.

## v2.2

### Dual experience modes: Guided Essentials and Developer Hub

- **Guided Essentials Mode:** Focused, approachable view emphasizing plain-English analogies, daily routines, and zero-jargon recovery steps. Complex mathematical graph theory is automatically hidden from the beginner primer.
- **Developer Hub Mode:** Expands the complete Git engineering reference, including interactive rebasing, branch divergence surgery, `git worktree` isolation, `git reflog` resurrection, and live `.git/` filesystem inspectors.
- **Dynamic Mode Theming:** Active mode shifts UI iconography, borders, and active tokens to organic emerald green (Guided Essentials) or energized amber orange (Developer Hub).

### Totakit thin vector icon system

- Integrated custom, lightweight 1.5px stroke vector SVG icons across all analogy cards, recipe controls, and forge selectors for consistent visual styling without external font or asset overhead.

### Official vector brand architecture

- Deployed responsive SVG wordmarks (`gitunstuck-wordmark-dark.svg` and `gitunstuck-wordmark-light.svg`), a single calligraphic G app icon, and multi-theme adaptive favicons with screen-reader accessibility.

### Funding and community support integrations

- Integrated native GitHub Sponsors (`.github/FUNDING.yml`), a dedicated header Buy Me a Coffee button, and footer learning-resource support cards.

### High-contrast light mode

- Modernized light-mode code blocks with dedicated soft-slate backgrounds (`--bg-code`) and high-contrast dark text, removing low-contrast artifacts in terminal text areas and `.git/` file inspectors.

### Interactive four-zone architecture and visual data flow

- Added an interactive simulation tracing file lifecycles across **Working Directory (Disk)** → **Staging Area (Index)** → **Local Repository (HEAD)** → **Remote Cloud (Forge)**.
- Added click-to-inspect cards, terminal output previews, copyable forward and rollback commands, and the complete two-way flow.

### Hardened 155-test diagnostic suite

- Expanded test automation to **155 passing unit assertions across 13 suites**, covering input normalization, token injection, multi-host forge rules, brand identity tokens, experience-mode toggles, and the four-zone data-flow engine.

## v2.1

### “Don’t Panic” emergency triage hero

- Added one-click shortcuts for six common emergencies: undo a mistake, rejected push, merge conflict, detached HEAD, failed authentication, and lost work or commits.
- Added a prominent safety recipe using `git branch backup-before-fix` so users can preserve the current state before attempting a rewrite.

### Live in-browser terminal analyzer

- Added entirely client-side analysis for output from `git status`, `git status -sb`, and raw terminal errors.
- Added ANSI escape removal and Windows CRLF normalization.
- Added a 12-state rule engine for detached HEAD, merge conflicts, paused rebases, branch divergence, untracked sensitive files, GH013 secret-scan blocks, protected-branch rejections, and authentication failures.
- Added “Is my work lost?” risk indicators to every diagnosis.
- Added built-in test samples for detached HEAD, merge conflicts, diverged branches, secret scanning, and clean status.

### Multi-host cloud forge overlays

- Added platform-specific troubleshooting for GitHub, GitLab, and Bitbucket.
- Added guidance for protected-branch rejections, authentication and credential caching, push-protection secret scanning, and fork synchronization.
- Included provider-specific details such as GitLab SSH over port 443 and Bitbucket Cloud App Password usernames.

### Interactive undo and recovery decision tree

Added guided recovery paths for:

- **Unstaged files:** `git restore <file>`
- **Staged files:** `git restore --staged <file>`
- **Local commits:** `git reset --soft HEAD~1`
- **Pushed commits:** `git revert <commit-id>`
- **Lost commits or deleted branches:** `git reflog -n 15` followed by `git switch -c rescue-branch`

### Visual timeline and branch map

- Added an interactive SVG visualization showing how commits, branch labels, HEAD, and merge operations relate.

### Progressive disclosure

- Added a beginner-friendly surface layer with real-world analogies and daily workflows.
- Added expandable technical material covering directed acyclic graphs, SHA-based object storage, and three-way merge theory.
