# Baseline recovery inventory

Reviewed main at `ac3901f369ed162f7793ccdef3846fb1adb88481`. This captures the original behavior, including defects; it is not endorsed guidance.

Coverage for every entry: existing suite uses parser/object/source-string assertions only. No recipe was executed by the original suite.

## undo/unstaged

- Trigger: You edited a tracked file on disk, but have NOT added it to staging. You want to wipe those edits and return to the last commit.
- Preconditions: Selected manually; publication state, parent commit and clean index are not enforced.
- Preservation/consequences (original claims): ⚠️ Yes, if you run git restore on uncommitted files. Any edits on your disk that were never staged or committed will be permanently overwritten. Permanently overwrites your working file on disk with the version recorded in HEAD/index.
- Assumptions: Git 2.23+; unquoted placeholders; origin/main and reflog offsets in some paths.
- Verification (original): Run git status. The file will no longer be listed under "Changes not staged for commit".
- Coverage: no executable recovery test.

```text
# Discard unstaged edits in a specific file:
git restore <filename>

# Or discard all unstaged edits in current directory:
git restore .
```

## undo/staged

- Trigger: You ran git add, but you are not ready to commit this file yet. You want to preserve your code edits in the file.
- Preconditions: Selected manually; publication state, parent commit and clean index are not enforced.
- Preservation/consequences (original claims): 🟢 No! git restore --staged only removes files from the staging index (cart). Your file edits on disk remain 100% intact and untouched. Removes the file snapshot from the staging index. Your working code edits on disk remain 100% untouched.
- Assumptions: Git 2.23+; unquoted placeholders; origin/main and reflog offsets in some paths.
- Verification (original): Run git status. The file moves from green (Changes to be committed) to red (Changes not staged).
- Coverage: no executable recovery test.

```text
# Unstage a specific file:
git restore --staged <filename>

# Or unstage everything:
git restore --staged .
```

## undo/local-commit

- Trigger: You committed too early or forgot a file, but you have NOT pushed to GitHub yet.
- Preconditions: Selected manually; publication state, parent commit and clean index are not enforced.
- Preservation/consequences (original claims): 🟢 No! git reset --soft moves your local branch bookmark backwards but keeps all of your code changes staged and ready in the cart. Moves HEAD back one commit while keeping your staged code ready to edit and re-commit.
- Assumptions: Git 2.23+; unquoted placeholders; origin/main and reflog offsets in some paths.
- Verification (original): Run git status and git log -1 to inspect the adjusted commit history.
- Coverage: no executable recovery test.

```text
# Option A: Rewind 1 commit and keep changes staged in cart:
git reset --soft HEAD~1

# Option B: Add a forgotten file to the previous commit:
git add <forgotten-file>
git commit --amend --no-edit
```

## undo/pushed-commit

- Trigger: The faulty commit has already been pushed to GitHub. Rewriting history with reset would break teammates' branches.
- Preconditions: Selected manually; publication state, parent commit and clean index are not enforced.
- Preservation/consequences (original claims): 🟢 No! git revert creates a brand-new opposite commit without erasing or rewriting any history. Both the mistake and the fix are preserved. Creates a NEW commit that applies the exact opposite changes. History remains forward-moving and clean.
- Assumptions: Git 2.23+; unquoted placeholders; origin/main and reflog offsets in some paths.
- Verification (original): Run git log -1 to see the new revert commit, then push to upstream.
- Coverage: no executable recovery test.

```text
# 1. Find the commit hash to undo:
git log -n 5 --oneline

# 2. Create a safe inverse commit:
git revert <commit-id>

# 3. Push the revert to GitHub:
git push origin main
```

## undo/lost-reflog

- Trigger: You accidentally ran reset --hard, deleted a branch with unmerged work, or lost a detached commit.
- Preconditions: Selected manually; publication state, parent commit and clean index are not enforced.
- Preservation/consequences (original claims): 🟢 No! Git never immediately erases orphaned commits. They remain safely stored in your local reflog ledger for 30 to 90 days. Recovers unreachable commits before Git's automatic garbage collection prunes them (retained locally for 30-90 days).
- Assumptions: Git 2.23+; unquoted placeholders; origin/main and reflog offsets in some paths.
- Verification (original): Run git log -1 rescue-branch to verify your recovered work is intact.
- Coverage: no executable recovery test.

```text
# 1. View your chronological local action ledger:
git reflog -n 15

# 2. Locate the commit hash before the mistake (e.g. HEAD@{2})
# 3. Create a rescue branch attached to that commit:
git switch -c rescue-branch HEAD@{2}
```

## github/protected-branch

- Trigger: GitHub: Protected Branch Update Failed (GH006 / Rule Violation)
- Preconditions: GitHub branch protection rules prevent direct pushes to main/master without an approved Pull Request.
- Preservation/consequences (original claims): Moves your committed changes safely onto a branch and prepares a Pull Request for team review. <strong>GitHub Rule:</strong> Never force-push (<code>--force</code>) to a protected branch. The proper team path is always branch → Pull Request → merge.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Run git status on both branches to verify main is clean and feature/my-fix is published.
- Coverage: no executable recovery test.

```text
# 1. Package your commits into a new feature branch:
git switch -c feature/my-fix

# 2. Push the new branch to GitHub:
git push -u origin feature/my-fix

# 3. Open Pull Request on GitHub:
# Use the URL printed in terminal, or run GitHub CLI:
gh pr create --fill

# 4. Safely sync your local main back to remote clean state:
git switch main
git fetch origin
git reset --hard origin/main
```

## github/auth

- Trigger: GitHub: Personal Access Tokens (PAT), SSH & Credential Caching
- Preconditions: GitHub removed account password authentication in 2021. Pushing requires a Personal Access Token or SSH key.
- Preservation/consequences (original claims): Resets invalid cached passwords in Windows Credential Manager / macOS Keychain and verifies access. <strong>Fine-Grained PAT Caveat:</strong> Fine-grained tokens cannot push changes to <code>.github/workflows/*.yml</code> files. If editing workflows, use a Classic PAT with the <code>workflow</code> scope.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): If SSH is working, GitHub prints: "Hi username! You've successfully authenticated, but GitHub does not provide shell access."
- Coverage: no executable recovery test.

```text
# Option A: Authenticate cleanly via GitHub CLI (recommended):
gh auth login

# Option B: Clear cached stale credentials in Git Credential Manager:
git credential reject
# (Enter: protocol=https, host=github.com, then press enter on empty line)

# Option C: Test your SSH key connection:
ssh -T git@github.com
```

## github/secret

- Trigger: GitHub: Push Protection Blocked Secret (GH013)
- Preconditions: GitHub Secret Scanning detected a private key, API token, or credential embedded inside your commit history.
- Preservation/consequences (original claims): Strips the secret from Git commit objects before they ever touch GitHub servers. <strong>False Positive?</strong> If the secret is a dummy test token, GitHub prints an unblock URL in the terminal output. Visit that URL in your browser to grant a one-time push bypass.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Push succeeds without GH013 pre-receive hook rejection.
- Coverage: no executable recovery test.

```text
# 1. Rewind the commit while keeping file edits on disk:
git reset --soft HEAD~1

# 2. Move sensitive secrets into a .env file and add to .gitignore:
echo ".env" >> .gitignore

# 3. Re-commit clean files and push:
git add .gitignore <cleaned-files>
git commit -m "fix: remove sensitive secret"
git push origin <branch>
```

## github/fork

- Trigger: GitHub: Sync Fork with Upstream Original Project
- Preconditions: Your fork is behind the original repository and you need to incorporate incoming upstream changes.
- Preservation/consequences (original claims): Brings your fork up to date with the parent repository without creating merge divergence. <strong>Web Shortcut:</strong> You can also click the "Sync fork" button on your GitHub repository page, then run <code>git pull</code> locally.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Run git log -1 to verify your local main matches upstream/main.
- Coverage: no executable recovery test.

```text
# 1. Check your remotes (make sure upstream exists):
git remote -v

# 2. Add the original repository as "upstream" if missing:
git remote add upstream https://github.com/original-owner/repo.git

# 3. Fetch latest upstream commits and merge linearly:
git fetch upstream
git switch main
git merge upstream/main

# 4. Push updated main to your personal fork:
git push origin main
```

## gitlab/protected-branch

- Trigger: GitLab: You are not allowed to push code to protected branches
- Preconditions: GitLab project settings restrict direct pushes to protected branches (usually main or develop).
- Preservation/consequences (original claims): Publishes your work to GitLab and auto-generates a Merge Request in one command. <strong>GitLab Push Options:</strong> The <code>-o merge_request.create</code> flag is a native GitLab feature that creates the MR directly from your terminal!
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Check GitLab project web UI or follow the MR URL printed in terminal.
- Coverage: no executable recovery test.

```text
# 1. Create a feature branch with your commits:
git switch -c feature/my-fix

# 2. Push with GitLab push option to automatically open a Merge Request:
git push -u -o merge_request.create origin feature/my-fix

# 3. Re-align local main with remote:
git switch main
git fetch origin
git reset --hard origin/main
```

## gitlab/auth

- Trigger: GitLab: Personal Access Tokens & SSH Alternative Port 443
- Preconditions: Authenticating with GitLab over HTTPS requires a PAT with proper scopes, or SSH key.
- Preservation/consequences (original claims): Bypasses firewall restrictions and establishes authenticated SSH or token sessions. <strong>Token Scope:</strong> When creating a GitLab PAT, make sure to check <code>write_repository</code>. Deploy tokens without write scope will fail silently with 403 Forbidden.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): GitLab returns: "Welcome to GitLab, @username!"
- Coverage: no executable recovery test.

```text
# Option A: Authenticate using official GitLab CLI:
glab auth login

# Option B: Verify SSH key connection over default port 22:
ssh -T git@gitlab.com

# Option C: If corporate firewall blocks port 22, use alternative port 443:
ssh -T -p 443 git@altssh.gitlab.com
```

## gitlab/secret

- Trigger: GitLab: Push Rules Secret Detection Blocked
- Preconditions: GitLab Push Rules blocked your commit because it contains forbidden filenames or potential credentials.
- Preservation/consequences (original claims): Removes the forbidden credentials from Git index and history. <strong>Enterprise GitLab:</strong> Self-hosted GitLab instances often enforce custom pre-receive regex checks for author email or issue reference IDs.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Push completes successfully without pre-receive rejection.
- Coverage: no executable recovery test.

```text
# 1. Soft-reset to preserve code edits:
git reset --soft HEAD~1

# 2. Remove the secret and add config to .gitignore:
git rm --cached <sensitive-file>
git commit -m "fix: sanitize configuration"
git push origin <branch>
```

## gitlab/fork

- Trigger: GitLab: Sync Fork with Upstream Project
- Preconditions: Keep your GitLab subgroup or user fork synchronized with the upstream group project.
- Preservation/consequences (original claims): Incorporates upstream MRs and commits into your local and remote fork repository. <strong>GitLab Mirroring:</strong> GitLab Premium/Ultimate supports automated pull mirroring in Settings → Repository → Mirroring.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): GitLab project overview shows "This branch is up to date with upstream/main".
- Coverage: no executable recovery test.

```text
# 1. Add upstream group remote:
git remote add upstream https://gitlab.com/upstream-group/repo.git

# 2. Fetch and merge:
git fetch upstream
git switch main
git merge upstream/main

# 3. Publish to your fork:
git push origin main
```

## bitbucket/protected-branch

- Trigger: Bitbucket: Branch cannot be updated directly (Branch Permissions)
- Preconditions: Bitbucket repository branch permissions restrict direct commits to main.
- Preservation/consequences (original claims): Stores your commits safely on a named branch and prepares a peer review Pull Request. <strong>Jira Integration:</strong> Include your Jira issue key in the branch name (e.g. <code>feature/PROJ-123-login</code>) to automatically link PR status into Jira!
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Run git status. Local main is clean and up to date with origin/main.
- Coverage: no executable recovery test.

```text
# 1. Branch your work into a feature branch:
git switch -c feature/my-fix

# 2. Push to Bitbucket:
git push -u origin feature/my-fix

# 3. Open Pull Request:
# Navigate to your Bitbucket repository -> "Pull requests" -> "Create pull request"

# 4. Clean local main:
git switch main
git fetch origin
git reset --hard origin/main
```

## bitbucket/auth

- Trigger: Bitbucket: App Passwords & Atlassian Account Email Gotcha
- Preconditions: Bitbucket Cloud deprecated account passwords for Git operations. You must use an App Password.
- Preservation/consequences (original claims): Authenticates with Bitbucket Cloud using modern token credentials. <strong>#1 Bitbucket Failure Mode:</strong> When prompted for username, entering your Bitbucket display handle fails! You MUST enter your full Atlassian account email address.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Bitbucket responds to SSH: "authenticated via ssh key. You can use git to connect to Bitbucket."
- Coverage: no executable recovery test.

```text
# 1. Generate an App Password in Bitbucket Personal Settings with "Repositories: Write"
# 2. When Git prompts for username and password:
#    Username: YOUR ATLASSIAN ACCOUNT EMAIL (e.g. name@example.com)
#    Password: YOUR 20-CHARACTER APP PASSWORD

# Or test SSH key connection:
ssh -T git@bitbucket.org
```

## bitbucket/secret

- Trigger: Bitbucket: Commit Checker Hook Rejection
- Preconditions: A Bitbucket repository hook rejected the commit due to file size, sensitive files, or commit message policy.
- Preservation/consequences (original claims): Adjusts the commit snapshot or message to comply with Bitbucket hooks. <strong>Bitbucket Server vs Cloud:</strong> Bitbucket Server / Data Center often requires a valid Jira issue key prefix (e.g. <code>PROJ-123:</code>) in every commit message.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Push completes with hook approval.
- Coverage: no executable recovery test.

```text
# 1. Rewind the commit:
git reset --soft HEAD~1

# 2. Remove sensitive file or adjust commit message:
git commit -m "PROJ-123: valid commit message according to project policy"
git push origin <branch>
```

## bitbucket/fork

- Trigger: Bitbucket: Sync Fork with Original Upstream
- Preconditions: Synchronize a personal or workspace fork with the main repository.
- Preservation/consequences (original claims): Keeps your fork aligned with the central team repository. <strong>Bitbucket Cloud:</strong> Bitbucket offers a "Sync" banner at the top of the repository page if your fork has fallen behind.
- Assumptions: Selected host; most paths assume origin/main, some require gh/glab/SSH; alternatives copied as a single sequence.
- Verification (original): Run git log -1 to verify your branch head matches upstream/main.
- Coverage: no executable recovery test.

```text
# 1. Add upstream repository:
git remote add upstream https://bitbucket.org/parent-workspace/repo.git

# 2. Fetch and merge updates:
git fetch upstream
git switch main
git merge upstream/main

# 3. Push to your fork:
git push origin main
```

## card-init

- Trigger: Card selected by search/task/deep link.
- Preconditions: You started a new project folder on your machine and want to begin tracking it with Git and connect it to GitHub. Initialization Sequence Copy Customize: repo URL:
- Preservation/consequences (original claims): Creates a hidden .git database in your folder, snapshots your initial files, and links your local main branch to GitHub.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git remote -v and git status to confirm clean tree and upstream tracking.
- Coverage: no executable recovery test.

```text
# 1. Initialize local repository with default branch 'main'
git init -b main

# 2. Stage all initial files and make the first milestone
git add .
git commit -m "feat: initial project setup"

# 3. Link to your empty GitHub repository and push
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

## card-clone

- Trigger: Card selected by search/task/deep link.
- Preconditions: You want to download a team repository or open-source project from GitHub onto your computer and start working. Clone &amp; Inspect Copy Customize: repo URL:
- Preservation/consequences (original claims): Downloads the full historical object graph, sets up origin remote tracking branches, and checks out the default branch.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git branch -vv to see the active checked-out branch.
- Coverage: no executable recovery test.

```text
# 1. Download complete repository history into a new folder:
git clone https://github.com/username/repo.git

# 2. Enter directory and inspect status:
cd repo
git status

# 3. List all local and remote branches:
git branch -a
```

## card-stage

- Trigger: Card selected by search/task/deep link.
- Preconditions: You edited several files and want to seal a clean milestone snapshot containing only the changes intended for this commit. Status, Add &amp; Diff Copy Customize: file: message:
- Preservation/consequences (original claims): Places file snapshots into the staging index, then seals them into an immutable cryptographic commit object.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git status to confirm clean tree and git log -1 to inspect the new commit. Caution on git add . : Stages all non-ignored files under the current folder. Prefer naming files or using git add -p to stage hunk-by-hunk.
- Coverage: no executable recovery test.

```text
# 1. Review status of modified files:
git status

# 2. Stage specific intended files:
git add src/app.js

# 3. Review the exact staged snapshot:
git diff --staged

# 4. Commit with a clear note:
git commit -m "feat: add user authentication"
```

## card-branch

- Trigger: Card selected by search/task/deep link.
- Preconditions: Starting a new feature, bugfix, or experiment without risking the working production code on main . Branch Navigation Modern (switch) Legacy (checkout) Copy Customize: branch:
- Preservation/consequences (original claims): Creates a lightweight 41-byte pointer to your current commit and moves HEAD to track it.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git branch --show-current to verify your active branch. Task Modern Standard (Git 2.23+) Legacy Overloaded Switch branch git switch &lt;name&gt; Clean git checkout &lt;name&gt; Create &amp; switch git switch -c &lt;name&gt; Clear git checkout -b &lt;name&gt;
- Coverage: no executable recovery test.

```text
# 1. Create and switch to a new branch:
git switch -c feature/redesign

# 2. Work safely, edit files, and commit:
git add src/redesign.css
git commit -m "style: apply new color palette"

# 3. Return to main branch when ready:
git switch main
```

## card-undo

- Trigger: Card selected by search/task/deep link.
- Preconditions: You made accidental edits or staged files too early and need to back out without losing unintended work. Restore Commands Modern (restore) Legacy (checkout/reset) Copy Customize: file: commit:
- Preservation/consequences (original claims): restore --staged removes files from index without touching files on disk. restore copies the committed version over disk.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git status to confirm file state. Go Back Further &amp; Quick Amend Copy # Restore one file to how it looked at an older commit: git restore --source &lt;commit-hash&gt; -- path/to/file # Legacy form: git checkout &lt;commit-hash&gt; -- path/to/file # Add a forgotten file to the last commit without editing the message: git add &lt;forgotten-file&gt; git commit --amend --no-edit
- Coverage: no executable recovery test.

```text
# 1. Unstage a file (SAFE: keeps your local edits in file):
git restore --staged src/app.js

# 2. Discard uncommitted edits (PERMANENT: overwrites file):
git restore src/app.js

# 3. Undo a pushed commit safely with an inverse commit:
git revert a1b2c3d

# Restore one file to how it looked at an older commit:
git restore --source &lt;commit-hash&gt; -- path/to/file
# Legacy form:
git checkout &lt;commit-hash&gt; -- path/to/file

# Add a forgotten file to the last commit without editing the message:
git add &lt;forgotten-file&gt;
git commit --amend --no-edit
```

## card-sync

- Trigger: Card selected by search/task/deep link.
- Preconditions: Sharing your commits with teammates on GitHub, GitLab, or Bitbucket, or downloading their latest updates before merging. Fetch, Rebase &amp; Remote URLs Copy Customize: branch:
- Preservation/consequences (original claims): fetch updates remote-tracking references (`origin/main`). pull --rebase replays your local commits on top of incoming work.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git status to confirm your branch is up to date with origin/main .
- Coverage: no executable recovery test.

```text
# 1. Download remote changes WITHOUT altering working files:
git fetch origin

# 2. Pull & integrate linearly into your branch:
git pull --rebase origin main

# 3. Upload your commits to remote:
git push origin feature/my-branch

# Remote URL conventions across hosts:
git remote add origin https://github.com/user/repo.git     # GitHub
git remote add origin https://gitlab.com/user/repo.git     # GitLab
git remote add origin https://bitbucket.org/user/repo.git  # Bitbucket
```

## card-forge-troubleshoot

- Trigger: Card selected by search/task/deep link.
- Preconditions: See original card text in baseline-inventory.json; many checks are incomplete.
- Preservation/consequences (original claims): Not specified in static markup.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Not specified in static markup.
- Coverage: no executable recovery test.

```text

```

## card-pipeline

- Trigger: Card selected by search/task/deep link.
- Preconditions: Understanding how pushing code triggers cloud robots that test code, build assets, and deploy applications automatically across GitHub, GitLab, or Bitbucket. GitHub Actions GitLab CI/CD Bitbucket Pipelines GitHub Actions (.github/workflows/ci.yml) Copy # .github/workflows/ci.yml name: CI on: [push, pull_request] jobs: test: runs-on: ubuntu-latest steps: - uses: actions/checkout@v4 - name: Run Tests run: npm test
- Preservation/consequences (original claims): Without an explicit workflow file, cloud hosts act solely as code storage. Pushing only triggers automated jobs if a configuration file is detected in the repository root.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Check the "Actions" (GitHub), "Pipelines" (GitLab), or "Pipelines" (Bitbucket) tab in your web browser to view live job logs.
- Coverage: no executable recovery test.

```text
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: npm test
```

## card-stash

- Trigger: Card selected by search/task/deep link.
- Preconditions: You are halfway through coding when an urgent bugfix is requested. Shelve your uncommitted edits so your workspace is clean, then restore them later. Stash Lifecycle Copy
- Preservation/consequences (original claims): Saves modified and untracked files into the stash stack and reverts your working tree to HEAD .
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git stash list to inspect saved stashes.
- Coverage: no executable recovery test.

```text
# 1. Stash changes (use -u to include newly created files):
git stash push -u -m "WIP: navigation refactor"

# 2. Your workspace is now clean. Switch branches or patch...
git switch hotfix

# 3. Return to branch and pop your shelved work:
git stash pop

# Pull while you have local changes (stash, pull, pop in one step):
git pull --autostash

# Turn a stash into its own branch when it no longer applies cleanly:
git stash branch rescue-wip stash@{0}

# Recover a stash you dropped or cleared (before git gc prunes it):
git fsck --no-reflog | grep "dangling commit"
git stash apply &lt;commit-id&gt;
```

## card-conflict

- Trigger: Card selected by search/task/deep link.
- Preconditions: Git halts a merge or rebase because two branches altered identical lines and requires you to pick the right code. Realistic Conflict Markers Copy &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD const apiEndpoint = "https://api.v2.internal"; ======= const apiEndpoint = "https://api.v3.production"; &gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/endpoint-upgrade Resolution Steps Copy
- Preservation/consequences (original claims): Staging the cleaned file signals Git that the conflict is resolved. Finalizing creates the merge commit.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git status to confirm all merge conflicts are cleared.
- Coverage: no executable recovery test.

```text
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
const apiEndpoint = "https://api.v2.internal";
=======
const apiEndpoint = "https://api.v3.production";
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/endpoint-upgrade

# 1. Edit file: delete the 3 marker lines and keep the right code
# 2. Mark conflict resolved:
git add src/config.js

# 3. Finalize merge (or abort if you need to rethink):
git merge --continue   # Or 'git merge --abort'
```

## card-rebase

- Trigger: Card selected by search/task/deep link.
- Preconditions: Squashing WIP micro-commits into clean milestones before opening a Pull Request for your team. Rebase Session Copy # Rebase the last 3 local commits: git rebase -i HEAD~3 # In editor: # pick = keep commit # squash = combine into previous commit &amp; merge message # fixup = combine into previous commit &amp; discard message git rebase --continue git rebase --abort # Safe escape hatch
- Preservation/consequences (original claims): Reconstructs a linear commit sequence with updated parent hashes.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git log --oneline -n 5 to inspect the newly squashed history.
- Coverage: no executable recovery test.

```text
# Rebase the last 3 local commits:
git rebase -i HEAD~3

# In editor:
# pick   = keep commit
# squash = combine into previous commit &amp; merge message
# fixup  = combine into previous commit &amp; discard message

git rebase --continue
git rebase --abort   # Safe escape hatch
```

## card-detached

- Trigger: Card selected by search/task/deep link.
- Preconditions: You checked out a raw commit hash instead of a branch name, and need to safely save any test commits you made.
- Preservation/consequences (original claims): Creating a branch attaches a named pointer to your current detached commit so garbage collection will not prune it.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git branch --show-current to verify you are back on a named branch.
- Coverage: no executable recovery test.

```text
# 1. Check if detached:
git status  # Shows: "HEAD detached at a1b2c3d"

# Exit A: Discard experiments and return to safety:
git switch main

# Exit B: Preserve commits made while detached:
git switch -c recovery-branch
```

## card-worktree

- Trigger: Card selected by search/task/deep link.
- Preconditions: Checking out two different branches simultaneously into separate directories on your computer without re-cloning. Worktree Management Copy
- Preservation/consequences (original claims): Links multiple working directories to the same underlying .git repository database.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git worktree list to verify registered directory paths.
- Coverage: no executable recovery test.

```text
# 1. Check out hotfix branch into sibling folder:
git worktree add ../project-hotfix hotfix-branch

# 2. List all active directory locations:
git worktree list

# 3. Clean up folder when finished:
git worktree remove ../project-hotfix
```

## card-reflog

- Trigger: Card selected by search/task/deep link.
- Preconditions: You accidentally ran git reset --hard , deleted a branch with unmerged work, or lost a commit and thought it was gone forever. Reflog Rescue Recipe Copy
- Preservation/consequences (original claims): Git stores all HEAD reference movements locally for 30-90 days before garbage collection. Creating a branch resurrects the orphaned commit into active history.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git log -1 rescue-branch to confirm your lost code is restored.
- Coverage: no executable recovery test.

```text
# 1. View chronological action ledger:
git reflog -n 15

# 2. Locate the commit hash before the mistake (e.g. HEAD@{2})
# 3. Create a rescue branch attached to that commit:
git switch -c rescue-branch HEAD@{2}
```

## card-bisect

- Trigger: Card selected by search/task/deep link.
- Preconditions: A bug appeared and you need to pinpoint the exact commit out of hundreds that introduced the regression, or see who authored specific lines. Bisect Binary Search Copy
- Preservation/consequences (original claims): Performs a binary search across commit history in logarithmic steps (log 2 N ), isolating the faulty commit in minutes.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Git outputs: [hash] is the first bad commit with author and commit message.
- Coverage: no executable recovery test.

```text
# 1. Start binary search:
git bisect start
git bisect bad                 # Current version is broken
git bisect good v1.2.0          # Known good previous release

# 2. Test intermediate commits checked out by Git:
git bisect good   # (or 'git bisect bad')

# 3. Finish and return to active branch:
git bisect reset

# Inspect line-by-line author timestamps:
git blame -L 20,45 src/app.js
```

## card-tag

- Trigger: Card selected by search/task/deep link.
- Preconditions: Marking an official production release, milestone, or version number (e.g. v1.0.0 ) in your Git history. Annotated Tag
- Preservation/consequences (original claims): Creates an annotated Git tag object containing author, timestamp, and release notes permanently referencing the current commit.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git describe --tags to verify the active release version.
- Coverage: no executable recovery test.

```text
# 1. Create an annotated release tag:
git tag -a v1.0.0 -m "Release v1.0.0: Initial public launch"

# 2. Push tag to GitHub (tags are not pushed by default!):
git push origin v1.0.0

# Or push all local tags at once:
git push origin --tags

# List all tags sorted by version:
git tag -l -n 1
```

## card-force-lease

- Trigger: Card selected by search/task/deep link.
- Preconditions: Updating a pull request branch after rebasing or squashing local commits, without the danger of destroying teammates' pushed work. Safe PR Force-Push Copy # Safely push rebased branch to remote pull request: git push --force-with-lease origin feature/auth # NEVER use raw 'git push --force' on shared repositories!
- Preservation/consequences (original claims): Git verifies if the remote branch has received commits from teammates since your last fetch. If someone else pushed work, Git refuses the push instead of blindly overwriting it.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Git responds with [forced update] only if your local ref was synchronized with remote.
- Coverage: no executable recovery test.

```text
# Safely push rebased branch to remote pull request:
git push --force-with-lease origin feature/auth

# NEVER use raw 'git push --force' on shared repositories!
```

## card-cherry-pick

- Trigger: Card selected by search/task/deep link.
- Preconditions: Applying a specific bugfix commit from one branch (e.g. main ) into a separate maintenance or release branch without merging the whole branch. Cherry-Pick Recipe Copy
- Preservation/consequences (original claims): Re-applies the exact code diff from the specified commit hash and records a brand new commit on the currently active branch.
- Assumptions: Examples often use main/origin and unquoted paths; optional alternatives share copy blocks.
- Verification (original): Run git log -1 --stat to confirm the bugfix commit was applied.
- Coverage: no executable recovery test.

```text
# 1. Switch to target branch (e.g. maintenance branch):
git switch release/v1.0

# 2. Pluck specific bugfix commit by hash:
git cherry-pick 7a1b2c3

# If conflict occurs:
# git cherry-pick --continue
# Or cancel and return to safety:
# git cherry-pick --abort
```

## analyzer/detached

- Trigger: "HEAD detached at 7a2b3c4\nnothing to commit, working tree clean"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): ⚠️ Warning: HEAD is unattached! Any new commits made here will be orphaned if you switch branches without naming them. Creates a permanent named branch pointer anchored to your current commit checkpoint.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git branch --show-current to verify you are on a named branch.
- Coverage: no executable recovery test.

```text
# 1. Check if you created new commits while detached:
git log -1 --oneline

# 2. Secure your commits with a named rescue branch:
git switch -c rescue-branch

# 3. Or return to main if no commits were created:
git switch main
```

## analyzer/conflict

- Trigger: "On branch main\nYou have unmerged paths.\n  (fix conflicts and run \"git commit\")\n  (use \"git merge --abort\" to abort the merge)\n\nUnmerged paths:\n  (use \"git add <file>...\" to mark resolution)\n\tboth modified:   src/app.js\n\nno changes added to commit (use \"git add\" and/or \"git commit -a\")"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! All conflicting files are preserved on disk with marker lines (<<<<<<< ======= >>>>>>>). Completes the merge operation and seals the combined snapshot.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status. It will report "nothing to commit, working tree clean".
- Coverage: no executable recovery test.

```text
# 1. List all files currently in conflict:
git diff --name-only --diff-filter=U

# 2. Open each file, choose desired code, remove <<<<<<< markers

# 3. Stage resolved files:
git add src/app.js

# 4. Finalize the merge commit:
git merge --continue
```

## analyzer/diverged

- Trigger: "On branch main\nYour branch and 'origin/main' have diverged,\nand have 2 and 1 different commits each, respectively.\n  (use \"git pull\" if you want to integrate the remote branch with yours)\n\nnothing to commit, working tree clean"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! Both your local commits and incoming remote commits exist safely. Integrates remote updates with your local commits.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git log --oneline -5 to verify linear history, then push.
- Coverage: no executable recovery test.

```text
# Recommended: Replay your commits linearly on top of remote work:
git pull --rebase origin main

# Alternative: Create an explicit 3-way merge commit:
git pull origin main
```

## analyzer/secret

- Trigger: "remote: error: GH013: Repository rule violations found for refs/heads/main.\nremote: Review all 1 check failure at https://github.com/user/repo/rules\nremote: - Push cannot contain secrets: OpenAI API Key found in src/config.js\nTo https://github.com/user/repo.git\n ! [remote rejected] main -> main (push declined due to repository rule violations)\nerror: failed to push some refs to 'https://github.com/user/repo.git'"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! Your commits are safely stored locally. The cloud remote rejected the push to protect your secrets. Removes the secret from Git commit objects before it reaches remote servers.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Push completes without GH013 rejection.
- Coverage: no executable recovery test.

```text
# 1. Rewind the commit while keeping edits on disk:
git reset --soft HEAD~1

# 2. Add sensitive file to .gitignore:
echo ".env" >> .gitignore

# 3. Re-commit clean files and push:
git add .gitignore <clean-files>
git commit -m "fix: sanitize secrets"
git push origin <branch>
```

## analyzer/clean

- Trigger: "On branch feature/login\nnothing to commit, working tree clean"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 All files on disk match your latest commit checkpoint. If your work seems missing, you may be on the wrong branch! Inspects your full local history and branch bookmarks to locate misplaced commits.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Locate your commit ID in reflog, then run git switch <branch-name>.
- Coverage: no executable recovery test.

```text
# 1. List all branches to see where you might have worked:
git branch -a

# 2. View recent commit checkpoints:
git log -n 5 --oneline

# 3. Check your local action ledger for recent switches:
git reflog -n 10
```

## analyzer/unknown

- Trigger: "mystery failure"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 General status output analyzed. Take a breath and inspect the state below. Gathers clean diagnostics without altering your files.
- Assumptions: General Guidance; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Review the output to decide on next action.
- Coverage: no executable recovery test.

```text
# 1. Check detailed status without altering files:
git status

# 2. Inspect unstaged and staged diffs:
git diff
git diff --staged

# 3. View recent commit history:
git log -n 5 --oneline
```

## analyzer/ahead

- Trigger: "Your branch is ahead of 'origin/main' by 1 commit"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! Your changes are safely recorded in your local Git repository database. Updates remote tracking branch to match local HEAD.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status. It will report up to date with origin.
- Coverage: no executable recovery test.

```text
# Upload your commits to remote:
git push origin <branch-name>
```

## analyzer/behind

- Trigger: "Your branch is behind 'origin/main' by 1 commit"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! You just need to download incoming commits created by teammates. Advances your local branch bookmark to include incoming remote changes.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git log -1 to inspect the latest downloaded commit.
- Coverage: no executable recovery test.

```text
# Download and integrate linearly:
git pull --rebase origin <branch-name>
```

## analyzer/sensitive

- Trigger: "Untracked files:\n  .env"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 Safe on disk, but high risk of accidental commit! Prevents sensitive credentials from accidentally being staged by git add .
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status. Sensitive files must not appear under Untracked files.
- Coverage: no executable recovery test.

```text
# 1. Append sensitive files to .gitignore:
echo ".env" >> .gitignore

# 2. Verify git status ignores them:
git status
```

## analyzer/auth

- Trigger: "fatal: Authentication failed"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! Your local work is 100% intact. Only remote transmission failed. Clears stale cached credentials and verifies cryptographic key access.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Remote returns a welcome message.
- Coverage: no executable recovery test.

```text
# Clear cached credentials in Git Credential Manager:
git credential reject

# Or test SSH key connection directly:
ssh -T git@github.com
```

## analyzer/protected

- Trigger: "remote: error: GH006: Protected branch update failed"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! All your commits exist safely on your computer. Direct pushes to this branch are restricted by team policy. Publishes your changes on a review branch and restores local main cleanly.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status on both branches to verify local main matches remote.
- Coverage: no executable recovery test.

```text
# 1. Move your commits onto a new feature branch:
git switch -c feature/my-fix

# 2. Push the branch to remote:
git push -u origin feature/my-fix

# 3. Align local main back to remote clean state:
git switch main
git fetch origin
git reset --hard origin/main
```

## analyzer/notRepo

- Trigger: "fatal: not a git repository"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No files were deleted. Your current folder is simply not configured with Git tracking. Creates a new .git/ ledger or navigates to the correct repository checkout.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status. It will display branch information instead of a fatal error.
- Coverage: no executable recovery test.

```text
# Option A: Initialize Git in this project folder:
git init -b main

# Option B: Or navigate to your existing project repository:
cd path/to/your/actual/project
git status
```

## analyzer/ambiguous

- Trigger: "rebase in progress\nUnmerged paths:\nboth modified: app.js"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! All conflicting files are preserved on disk with marker lines (<<<<<<< ======= >>>>>>>). Completes the merge operation and seals the combined snapshot.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Run git status. It will report "nothing to commit, working tree clean".
- Coverage: no executable recovery test.

```text
# 1. List all files currently in conflict:
git diff --name-only --diff-filter=U

# 2. Open each file, choose desired code, remove <<<<<<< markers

# 3. Stage resolved files:
git add app.js

# 4. Finalize the merge commit:
git merge --continue
```

## analyzer/rules

- Trigger: "remote: error: GH013: Repository rule violations found"
- Preconditions: Only pasted output is available; live repository state is unknown.
- Preservation/consequences (original claims): 🟢 No! Your commits are safely stored locally. The cloud remote rejected the push to protect your secrets. Removes the secret from Git commit objects before it reaches remote servers.
- Assumptions: High Confidence; context tokens are altered by sanitization; implicit origin/main.
- Verification (original): Push completes without GH013 rejection.
- Coverage: no executable recovery test.

```text
# 1. Rewind the commit while keeping edits on disk:
git reset --soft HEAD~1

# 2. Add sensitive file to .gitignore:
echo ".env" >> .gitignore

# 3. Re-commit clean files and push:
git add .gitignore <clean-files>
git commit -m "fix: sanitize secrets"
git push origin <branch>
```

## zone/working

- Trigger: Zone 1: Working Directory (Files on Disk)
- Preconditions: Your actual files on disk inside your project directory. You modify, create, and delete files here in your code editor. Git tracks differences on disk, but nothing here is permanently recorded or protected by snapshots until staged.
- Preservation/consequences (original claims): ⚠️ Permanent loss risk: Changes on disk that were never staged or committed cannot be recovered once discarded with git restore. Overwrites your working file with the clean version from HEAD.
- Assumptions: Illustration using example files, origin/main; reversals are not symmetric.
- Verification (original): No explicit result check.
- Coverage: no executable recovery test.

```text
git add src/app.js
# Or add all changes in current folder:
git add .

git restore src/app.js
# Or discard all uncommitted edits in directory:
git restore .
```

## zone/staging

- Trigger: Zone 2: Staging Area (Index / Shopping Cart)
- Preconditions: A binary staging buffer stored at .git/index. Think of staging as a shopping cart: you inspect items, choose which files and lines belong together in this logical checkpoint, and keep unrelated edits out.
- Preservation/consequences (original claims): 🟢 Work is 100% Safe! git restore --staged only unloads the cart. Zero lines of your code on disk are touched or deleted. Removes the file from the staging index. Your code edits on disk remain 100% untouched and preserved.
- Assumptions: Illustration using example files, origin/main; reversals are not symmetric.
- Verification (original): No explicit result check.
- Coverage: no executable recovery test.

```text
git commit -m "feat: implement user authentication"

git restore --staged src/app.js
# Or unstage everything:
git restore --staged .
```

## zone/local

- Trigger: Zone 3: Local Repository (Immutable Vault & HEAD)
- Preconditions: Your permanent local database stored in .git/objects and branch bookmarks in .git/refs/heads/. Every commit is an immutable cryptographic snapshot identified by a SHA hash. Commits here exist safely on your computer even when offline.
- Preservation/consequences (original claims): 🟢 Your local commits are recorded. Even orphaned commits stay in git reflog for 30 to 90 days. Moves your branch bookmark back one commit, leaving all your code changes staged and ready to edit or re-commit.
- Assumptions: Illustration using example files, origin/main; reversals are not symmetric.
- Verification (original): No explicit result check.
- Coverage: no executable recovery test.

```text
git push origin main

git reset --soft HEAD~1

# Or create a safety bookmark before experimenting:
git switch -c rescue-branch
```

## zone/remote

- Trigger: Zone 4: Remote Cloud Host (GitHub • GitLab • Bitbucket)
- Preconditions: The centralized cloud host hosting shared team branches (origin/*), Pull/Merge Requests, issue trackers, and automated CI/CD test runners. Pushing publishes your local commits to teammates worldwide.
- Preservation/consequences (original claims): 🟢 Safe Team History! git revert preserves history and never rewrites public commits, preventing branch divergence for teammates. Records a brand new commit that undoes the exact diff of the target commit, preserving forward-only public history.
- Assumptions: Illustration using example files, origin/main; reversals are not symmetric.
- Verification (original): No explicit result check.
- Coverage: no executable recovery test.

```text
gh pr create --title "feat: login" --body "Ready for review"
# Or push feature branch to create PR:
git push -u origin feature/login

# Create safe inverse commit without breaking teammates' branches:
git revert <commit-id>
git push origin main
```

## zone/reverse

- Trigger: The Two-Way Highway: Forward Flow vs. Safe Reversal
- Preconditions: Git is designed as a symmetric, two-way highway. For every forward operation, an exact safe reversal command exists to move files backward across zones without data loss.
- Preservation/consequences (original claims): 🟢 The Golden Rule: Only git restore on uncommitted files can lose work. Commits and staged files are always protected! Navigates backward across all 4 zones safely without losing committed or staged code.
- Assumptions: Illustration using example files, origin/main; reversals are not symmetric.
- Verification (original): No explicit result check.
- Coverage: no executable recovery test.

```text
git status                 # 1. Inspect
git add <file>             # 2. Stage into Cart
git commit -m "message"    # 3. Seal Checkpoint
git push origin <branch>   # 4. Publish

# Discard unstaged file edits (Destructive):       git restore <file>
# Unstage file without losing code edits (Safe):      git restore --staged <file>
# Rewind local unpushed commit to cart (Safe):        git reset --soft HEAD~1
# Undo public shared commit on GitHub (Team Safe):    git revert <commit-id>
# Download remote changes safely:                     git pull --rebase origin <branch>
```

## graph/linear

- Trigger: Daily Save Points (git commit)
- Preconditions: Illustrative commit graph, not repository-aware.
- Preservation/consequences (original claims): A branch is a tiny sticky note pointing to your latest save point.
- Assumptions: Example main/feature/login/hash values.
- Verification (original): Diagram only, no repository-state verification.
- Coverage: no executable recovery test.

```text
git commit -m "feat: login button"
```

## graph/branch

- Trigger: Branch (Safe Sandbox to Try Ideas)
- Preconditions: Illustrative commit graph, not repository-aware.
- Preservation/consequences (original claims): Always create a branch when starting new work. It keeps your main codebase safe while you build and test.
- Assumptions: Example main/feature/login/hash values.
- Verification (original): Diagram only, no repository-state verification.
- Coverage: no executable recovery test.

```text
git switch -c feature/login && git commit -m "add password reset"
```

## graph/merge

- Trigger: Merging (Combining Your Work)
- Preconditions: Illustrative commit graph, not repository-aware.
- Preservation/consequences (original claims): Merging is like pouring two rivers into one: it combines work from both branches into a single shared milestone.
- Assumptions: Example main/feature/login/hash values.
- Verification (original): Diagram only, no repository-state verification.
- Coverage: no executable recovery test.

```text
git switch main && git merge feature/login
```

## graph/rebase

- Trigger: Rebase (Straighten Your Timeline)
- Preconditions: Illustrative commit graph, not repository-aware.
- Preservation/consequences (original claims): Golden Rule: Only rebase your own private work before sharing it. Never rebase commits already pushed to a team branch.
- Assumptions: Example main/feature/login/hash values.
- Verification (original): Diagram only, no repository-state verification.
- Coverage: no executable recovery test.

```text
git switch feature/login && git rebase main
```

## graph/detached

- Trigger: Looking at the Past (Detached HEAD State)
- Preconditions: Illustrative commit graph, not repository-aware.
- Preservation/consequences (original claims): Detached HEAD is harmless for reading history. If you make changes you want to keep, attach a bookmark with git switch -c <name>.
- Assumptions: Example main/feature/login/hash values.
- Verification (original): Diagram only, no repository-state verification.
- Coverage: no executable recovery test.

```text
git switch --detach <hash-c2>
```

## snapshot/commit

- Trigger: Before a fix
- Preconditions: Existing HEAD, unique backup name.
- Preservation/consequences (original claims): Only the current commit is referenced; dirty files are not backed up.
- Assumptions: Fixed backup name.
- Verification (original): Missing.
- Coverage: no executable recovery test.

```text
git branch backup-before-fix
```

## snapshot/dirty

- Trigger: Before a fix with dirty files
- Preconditions: Working index, no conflict, unique branch; no staged-only content absent from disk.
- Preservation/consequences (original claims): Claims full snapshot; ignores ignored files, does not restore index, can reapply an older stash when there are no changes.
- Assumptions: POSIX && (not PowerShell 5), fixed branch and stash selection.
- Verification (original): Missing.
- Coverage: no executable recovery test.

```text
git branch backup-before-fix
git stash push -u -m "safety-backup" && git stash apply
```

## Observed baseline defects

GH013/rules-only text selects secret removal. Soft reset retains secrets in the index and earlier commits. Protected-branch paths hard reset with dirty work. Generic conflict text takes precedence over explicit rebase state. Unknown text receives a safe verdict. Authentication is host-specific without reliable host evidence. Detached/reflog recipes copy alternatives or guessed offsets. Divergence prescribes rewriting before checking publication and index state. Reflog/zone/graph claims overpromise retention or reversibility. Bitbucket App Password instructions and fine-grained token claims require provider review.

## Browser review

Observed in Chromium at 1440x1000 and 390x844: no page errors. Mobile document is 406px wide at a 390px viewport (16px overflow). Desktop exposes 30+ controls before the primer; mobile first viewport shows four symptom selectors but no analyzer input. Screenshots were inspected. Warning styling surrounds routine entry actions and blanket reassurance is prominent. Keyboard, contrast, copy behavior and deployed behavior are not established by these screenshots.

## Baseline checks

155/155 existing assertions pass, including unsafe expected advice. Build check passes (397.1 KB source, 320.7 KB minified). scan-a11y.mjs fails with ERR_MODULE_NOT_FOUND for playwright; it is ignored/untracked local tooling, not a declared repository check. Browser review used an already installed external playwright-core and existing Chromium; no dependency was added.
