# GitMatrix — Modern Git Command Matrix & Architecture Guide

A responsive, developer-cockpit style Git reference and troubleshooting playbook updated for modern Git standards (Git 2.23+ `switch`/`restore`, default `main` branch, merge conflict resolution, interactive rebase, and worktrees).

---

## 🚀 Key Improvements Over Legacy Cheat Sheets

| Feature / Workflow | Modern Standard (Git 2.23+) | Legacy Convention | Benefit |
| :--- | :--- | :--- | :--- |
| **Switch Branches** | `git switch <branch>` | `git checkout <branch>` | Unambiguous branch navigation |
| **Create & Switch** | `git switch -c <branch>` | `git checkout -b <branch>` | Clear syntax (`-c` = `--create`) |
| **Discard Edits** | `git restore <file>` | `git checkout -- <file>` | Discards working tree edits safely |
| **Unstage Changes** | `git restore --staged <file>` | `git reset HEAD <file>` | Removes files from staging without losing work |
| **Default Branch** | `main` | `master` | Modern industry standard |
| **Safe Pulling** | `git pull --rebase` | `git pull` | Prevents messy recurring merge bubble commits |

---

## 🛠️ Features

- 🔍 **Instant Search & Filter:** Filter by keywords (`restore`, `conflict`, `rebase`) or category pills with keyboard shortcut (`/`).
- 🌓 **Dark / Light Mode:** Automatic system preference detection with persistent theme toggling.
- 📋 **1-Click Snippet Copying:** Copy commands directly to clipboard with instant feedback.
- 🖨️ **Print & Poster Ready:** Dedicated `@media print` CSS cleanly formats the matrix for A4/A3 wall posters or PDF export.
- ⚡ **Zero External Dependencies:** Built with pure vanilla HTML, CSS, and JavaScript. Runs offline and loads instantly.

---

## 🧭 Project Structure

```text
git-cheatsheet/
├── index.html                  # Interactive command center web app
├── .gitignore                  # Clean OS and editor exclusion patterns
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
└── README.md                   # Documentation & push guide
```

---

## 📦 How to Push to GitHub / Remote

To push this repository to GitHub or GitLab:

### 1. Create a Repository on GitHub
Create a new empty repository on [GitHub](https://github.com/new) (e.g. named `git-matrix` or `git-cheatsheet`). Do **not** initialize it with a README or license.

### 2. Connect Your Remote and Push
Run the following commands in this directory:

```bash
# Add your GitHub remote URL
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push the main branch with upstream tracking
git push -u origin main
```

### 3. Enable GitHub Pages (Optional Live URL)
1. Go to your repository on GitHub $\rightarrow$ **Settings** $\rightarrow$ **Pages**.
2. Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions** (or Deploy from a branch $\rightarrow$ `main` / `root`).
3. Your interactive Git Matrix will be live at `https://<your-username>.github.io/<your-repo-name>/`.

---

## 📄 License
MIT License. Free to use, share, and customize.
