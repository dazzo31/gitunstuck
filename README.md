# GitUnstuck • Visual Problem-Solving & Cloud Forge Recovery Guide

> **Live Application:** [dazzo31.github.io/gitunstuck](https://dazzo31.github.io/gitunstuck/)  
> **Guiding Principle:** *Don't Panic. Git almost never loses your committed work.*  
> **Sponsor:** [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ea4aaa?style=flat&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/dazzo31)

**GitUnstuck** is an empathetic, interactive problem-solving guide and diagnostic cheatsheet designed to help developers recover from Git mistakes, navigate cloud platform rejections across **GitHub**, **GitLab**, and **Bitbucket**, and master Git's mental model without cognitive overload.

---

## 🌟 What's New in v2.1

### 1. 🚨 "Don't Panic" Emergency Triage Hero
When something breaks, beginners often panic fearing total code loss. The top of GitUnstuck now features:
- **Instant Intent Chips:** One-click shortcuts for the top 6 panic scenarios (`Undo a mistake`, `Push was rejected`, `Merge conflict`, `Detached HEAD`, `Auth failed`, `Lost work / commit`).
- **The Golden Safety Bookmark:** A prominent 1-second safety recipe (`git branch backup-before-fix`) guaranteeing you can always return to your current state before attempting any rewrite.

### 2. 📟 Live In-Browser Terminal Analyzer
- **Privacy-First (100% Client-Side):** Paste output from `git status`, `git status -sb`, or raw terminal error messages. Input is never transmitted over the network or uploaded anywhere.
- **Input Sanitizer:** Automatically strips ANSI color escapes and normalizes Windows CRLF line endings.
- **12-State Rule Engine:** Automatically diagnoses Detached HEAD, Merge Conflicts, Paused Rebases, Branch Divergence, Untracked Sensitive Files (`.env`, `id_rsa`), GH013 Secret Scan blocks, Protected Branch rejections, and Authentication failures.
- **"Is My Work Lost?" Indicators:** Every diagnosis explicitly answers the #1 anxiety question upfront (`🟢 Work is Safe` vs `⚠️ Permanent Loss Risk`).
- **1-Click Test Samples:** Built-in sample buttons (`Detached HEAD`, `Merge Conflict`, `Diverged Branch`, `Secret Scan`, `Clean Status`) allow users to test the diagnostic engine instantly.

### 3. ☁️ Multi-Host Cloud Forge Overlays (GitHub • GitLab • Bitbucket)
Platform-specific troubleshooting tabs covering the real-world divergence points between cloud providers:
- **Protected Branch Rejections:** GH006 protected branch updates, GitLab protected branches, and Bitbucket branch permissions — with verified feature-branch + PR/MR creation workflows.
- **Authentication & Credential Caching:** GitHub Personal Access Tokens (and the fine-grained `workflow` scope caveat), GitLab PATs and firewall port 443 fallback (`altssh.gitlab.com:443`), and Bitbucket Cloud's critical requirement to use the **Atlassian Account Email** with App Passwords.
- **Push Protection Secret Scanning:** Handling GitHub GH013 and GitLab secret blocks via soft-resets and `.gitignore` sanitization.
- **Fork Synchronization:** Syncing upstream remotes via web shortcuts and terminal commands.

### 4. 🚑 Interactive Undo & Recovery Decision Tree
Select where your unwanted changes currently live:
- **Unstaged in File:** `git restore <file>` (Destructive risk warning)
- **Staged in Cart:** `git restore --staged <file>` (100% safe, preserves disk edits)
- **Committed Locally:** `git reset --soft HEAD~1` (Safe, rewinds checkpoint while keeping work in cart)
- **Pushed to Remote:** `git revert <commit-id>` (Team-safe inverse commit)
- **Lost Commit / Deleted Branch:** `git reflog -n 15` + `git switch -c rescue-branch` (Local ledger resurrection)

### 5. 🗺️ Visual Timeline & Branch Map
Interactive SVG visualization demonstrating how commits, branch labels, HEAD (your camera lens), and merge operations interact in real time.

### 6. 🎓 Progressive Disclosure Architecture
- **Surface Level:** Real-world analogies (Shopping Cart, Video Game Save Point, Breadcrumbs) and zero-jargon daily workflows.
- **Deep Level:** Formal Computer Science Directed Acyclic Graph ($G=(V, E)$), SHA cryptographic object stores, and LCA 3-way merge matrix theories neatly organized in accessible `<details><summary>` drawers.

---

## 🔗 Deep-Linking & Team Sharing

Every major resolution and workflow supports direct URL hash deep-linking for easy sharing in team chat:
- `#emergencyHero` — Jump to emergency triage hero
- `#troubleshootConsole` — Jump to the Undo Decision Tree
- `#terminalAnalyzer` — Jump to the live terminal paste analyzer
- `#card-forge-troubleshoot` — Jump to Cloud Forge Troubleshooter
- `#forge-github`, `#forge-gitlab`, `#forge-bitbucket` — Pre-select specific cloud hosts
- `#undo-unstaged`, `#undo-staged`, `#undo-local-commit`, `#undo-pushed-commit`, `#undo-lost-reflog` — Direct decision tree solutions
- `#card-init`, `#card-clone`, `#card-stage`, `#card-branch`, `#card-sync`, `#card-conflict`, `#card-rebase`, `#card-detached`, `#card-reflog` — Direct workflow cards

---

## 🧪 Automated Regression Testing

GitUnstuck includes an automated diagnostic test suite verifying input normalization, rule matching, and forge coverage:

```bash
# Run the automated test runner (51 passing unit tests)
node tests/test-analyzer.js
```

---

## 🛠️ Tech Stack & Philosophy

- **Zero Dependencies:** Pure vanilla HTML5, CSS3, and modern JavaScript.
- **Zero Build Step:** Deploys instantly to GitHub Pages directly from repository files.
- **Zero Data Transmission:** Complete privacy guarantee — user repository paths, branch names, and code snippets stay strictly inside the client's browser tab.
- **Accessible (WCAG AA):** High-contrast dark and light modes, full keyboard navigation (`/` and `Ctrl+K` search shortcuts), reduced-motion support, and screen reader announcements.

---

## 💖 Support GitUnstuck

GitUnstuck was built to make Git mental models intuitive and save developers from hours of panic and lost work. It is 100% free, private, client-side, and ad-free.

If this guide helped you master a workflow, rescued your branch, or saved your team time, consider sponsoring ongoing development:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor%20on%20GitHub-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/dazzo31)

---

## 📄 License

MIT License. Free for developers, students, and teams worldwide.
