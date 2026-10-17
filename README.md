# GitUnstuck

## Fix Git problems without guessing

GitUnstuck turns confusing Git output into clear, risk-aware recovery steps. Paste a status or error, choose what went wrong, and get commands you can understand before you run them.

[![Open GitUnstuck](https://img.shields.io/badge/Open_GitUnstuck-Fix_my_Git_problem-16a34a?style=for-the-badge)](https://dazzo31.github.io/gitunstuck/)
[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-GitHub_Sponsors-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/dazzo31)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-dazzo31-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/dazzo31)

**No installation. No account. No terminal data leaves your browser.**

---

## Get unstuck fast

GitUnstuck helps answer the questions that matter when a repository goes wrong:

- **Is my work safe?** Every diagnosis shows the risk before suggesting a command.
- **What happened?** Plain-English explanations replace cryptic Git terminology.
- **What should I run?** Copyable steps take you forward, back out safely, or create a rescue point.
- **Does my hosting provider change the fix?** Dedicated guidance covers GitHub, GitLab, and Bitbucket.

[**Launch GitUnstuck →**](https://dazzo31.github.io/gitunstuck/)

## Features

### Diagnose terminal output in your browser

Paste output from `git status`, `git status -sb`, or a Git error. The analyzer recognizes common failure states, strips terminal formatting, handles Windows line endings, and immediately explains what it found.

It can identify:

- Detached HEAD and branch divergence
- Merge conflicts and paused rebases
- Authentication and protected-branch failures
- GitHub GH013 and other secret-scan blocks
- Untracked sensitive files such as `.env` and `id_rsa`
- Clean repositories where no recovery is needed

Everything runs locally in the current browser tab. Repository paths, branch names, errors, and pasted text are never uploaded.

### Recover with a guided decision tree

Tell GitUnstuck where the unwanted change lives and receive the appropriate recovery path:

| Situation | Guided approach |
| --- | --- |
| Changed but not staged | Restore or preserve the file with a clear data-loss warning |
| Staged by mistake | Unstage it while keeping the edits |
| Committed locally | Rewind the commit while preserving the work |
| Already pushed | Create a team-safe revert |
| Commit or branch appears lost | Recover it from the reflog |
| Unsure what to do | Create a backup branch before changing history |

### Solve cloud-hosting problems

Switch between **GitHub**, **GitLab**, and **Bitbucket** for provider-specific fixes covering:

- Rejected pushes and protected branches
- Tokens, app passwords, and cached credentials
- Secret-scanning and push-protection blocks
- Fork synchronization and upstream remotes
- Feature-branch and pull/merge-request workflows

### See how Git actually works

Interactive diagrams turn Git’s internal model into something you can inspect:

- Follow a file through the **working directory**, **staging area**, **local repository**, and **remote forge**
- Explore commits, branches, HEAD, and merges on a visual timeline
- Inspect command effects before choosing a recovery step
- Open deeper explanations of object storage, commit graphs, and three-way merges when you want the theory

### Choose the level of detail you need

- **Guided Essentials** uses plain language, practical analogies, and focused daily workflows.
- **Developer Hub** opens the complete engineering reference for rebase, reflog, worktree, bisect, tags, cherry-pick, force-with-lease, branch surgery, and `.git/` internals.

Both modes include dark and light themes, keyboard navigation, reduced-motion support, and screen-reader announcements.

## Common problems

Jump directly to the right tool:

- [Undo a Git mistake](https://dazzo31.github.io/gitunstuck/#troubleshootConsole)
- [Analyze terminal output](https://dazzo31.github.io/gitunstuck/#terminalAnalyzer)
- [Recover a lost commit with reflog](https://dazzo31.github.io/gitunstuck/#undo-lost-reflog)
- [Fix GitHub problems](https://dazzo31.github.io/gitunstuck/#forge-github)
- [Fix GitLab problems](https://dazzo31.github.io/gitunstuck/#forge-gitlab)
- [Fix Bitbucket problems](https://dazzo31.github.io/gitunstuck/#forge-bitbucket)
- [Understand merge conflicts](https://dazzo31.github.io/gitunstuck/#card-conflict)
- [Understand detached HEAD](https://dazzo31.github.io/gitunstuck/#card-detached)

These links can be shared in team chat, documentation, and support replies.

## Built for privacy and speed

GitUnstuck is a dependency-free, client-side application built with vanilla HTML, CSS, and JavaScript. It has no build step and sends no pasted terminal content to a server. The interface is designed for WCAG AA contrast and supports keyboard and screen-reader use.

## Run locally

Clone the repository and open `index.html` in a modern browser. No package installation or build command is required.

Run the automated regression suite with:

```bash
node tests/test-analyzer.js
```

The suite contains 155 assertions across 13 test groups covering diagnostics, normalization, forge guidance, navigation, accessibility, branding, experience modes, and the visual data-flow tools.

See [CHANGELOG.md](CHANGELOG.md) for release history and detailed change notes.

## Support GitUnstuck

GitUnstuck is free, private, client-side, and ad-free. If it rescued a branch, clarified a workflow, or saved your team time, you can support its continued development:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor_on_GitHub-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/dazzo31)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/dazzo31)

## License

MIT License. Free for developers, students, and teams worldwide.
