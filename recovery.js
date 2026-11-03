/* Shared by the browser and executable Git tests. No repository commands run here. */
(function (root) {
  'use strict';
  const stop = 'Run one step at a time. Stop on any error. Replace UPPER_CASE values with checked values before running commands. Commands use Git 2.23+ and work in Bash, zsh and PowerShell; do not paste real credentials into this page.';
  const recipes = {
    "inspect": {
      "title": "Not enough information.",
      "risk": "Unknown",
      "means": "This output does not establish a recovery path or whether work is preserved.",
      "checks": "Provide fresh, complete git status output and the exact failing command and error. Redact credentials. Do not combine output from different attempts.",
      "steps": [
        {
          "text": "Inspect the current state without changing tracked files or history.",
          "code": "git status\ngit diff\ngit diff --staged\ngit log -5 --oneline"
        }
      ],
      "effect": "Collects repository information; no recovery is attempted.",
      "verify": "Check the branch, staged and unstaged changes, and any operation in progress.",
      "failure": "If the cause is still unclear, stop and seek help with the redacted output.",
      "source": "https://git-scm.com/docs/git-status"
    },
    "protected": {
      "title": "Publish a review branch",
      "risk": "Publishes existing commits",
      "means": "The remote explicitly rejected a direct update to a protected branch.",
      "checks": "Confirm this is the intended repository and HEAD contains the commits to review. No merge, rebase or other operation may be in progress. Inspect git remote -v and choose REMOTE. Choose a new REVIEW_BRANCH; if it exists, choose another name. Uncommitted files stay local and are not published.",
      "steps": [
        {
          "text": "Inspect the branch, work and configured remotes.",
          "code": "git status\ngit log -1 --oneline\ngit remote -v\ngit branch --list \"REVIEW_BRANCH\""
        },
        {
          "text": "Create a new branch at the current commit. Continue only if this succeeds.",
          "code": "git switch -c \"REVIEW_BRANCH\""
        },
        {
          "text": "Publish only this branch to the checked remote, then open a pull or merge request in its web UI.",
          "code": "git push -u \"REMOTE\" \"REVIEW_BRANCH\""
        }
      ],
      "effect": "Adds and publishes a branch pointing to your existing commits. Staged, unstaged and untracked files stay in place. The original local branch still points to its commits; no realignment is needed for this fix.",
      "verify": "Compare git status and git diff --staged with the initial state. Run git ls-remote --heads \"REMOTE\" \"REVIEW_BRANCH\" and compare its hash with git rev-parse HEAD.",
      "failure": "If branch creation or push fails, stop. The remote may restrict new branch names or your write access. Read its complete rejection; do not reset or force-push.",
      "source": "https://git-scm.com/docs/git-push"
    },
    "secret": {
      "title": "Secret scanning explicitly blocked this push",
      "risk": "Credential exposure; history inspection required",
      "means": "The output explicitly mentions secret scanning or a push containing secrets. A rule code by itself does not establish this.",
      "checks": "Revoke or rotate the credential if exposure occurred or cannot be excluded. Read every reported commit and path. Determine whether the secret is confined to the latest unpublished, non-merge commit, and whether it is an entire accidentally tracked file or a value inside legitimate source. A rejected push does not prove the credential was never exposed. Check the destination remote and whether the destination branch already exists before choosing the outgoing range. Patches containing credentials must stay local.",
      "steps": [
        {
          "text": "Inspect the current state and configured remote. Check REMOTE before fetching. These commands can display credentials from local history; inspect them locally and do not share unredacted output.",
          "code": "git status\ngit remote -v\ngit show --stat HEAD"
        },
        {
          "text": "Fetch the selected remote so its tracking references reflect the current remote history. No commits are published.",
          "code": "git fetch \"REMOTE\""
        },
        {
          "text": "Choose OUTGOING_RANGE from the fetched destination branch to HEAD (for example team/release..HEAD). For a new remote branch, use HEAD to inspect all ancestors. Read every listed commit and its patch, including scanner-reported paths. Merges or unclear ancestry require separate history-cleanup guidance.",
          "code": "git log --oneline \"OUTGOING_RANGE\"\ngit log --format=fuller --patch \"OUTGOING_RANGE\""
        }
      ],
      "effect": "Fetch updates the selected remote-tracking references; the history commands inspect the chosen outgoing range. Local files, the index and HEAD are unchanged. No cleanup is attempted. Ignoring a file or adding a later deletion does not remove it from earlier commits.",
      "verify": "For latest-commit cleanup, use exactly one of the two recipes below only after all prerequisites hold. Review every commit that will be pushed. Absence of a rejection alone does not verify cleanup.",
      "failure": "Earlier commits, published history, merge commits, uncertain ancestry, or a dirty index/working tree require a separate cleanup plan. Follow the linked authoritative history-cleanup instructions; this app does not claim to clean those cases.",
      "source": "https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line"
    },
    "secretFile": {
      "title": "Latest unpublished commit: remove an accidentally tracked secret file",
      "risk": "Rewrites latest commit",
      "means": "The whole file should remain local and never be tracked.",
      "checks": "Only for a clean index and working tree, no operation in progress, and a latest unpublished non-merge commit. The file and credential must be absent from every earlier outgoing commit, including other paths. Confirm this by inspecting the scanner locations and outgoing history. Do not use a backup ref in any push; old local objects/reflogs still contain the secret. Rotate the credential when exposure cannot be excluded.",
      "steps": [
        {
          "text": "In your editor add an anchored pattern for SECRET_FILE to .gitignore. Escape Git ignore metacharacters if needed; do not ignore legitimate source files.",
          "code": "git diff -- .gitignore"
        },
        {
          "text": "Untrack only the checked file; its working copy is retained. Stage the ignore rule.",
          "code": "git rm --cached -- \"SECRET_FILE\"\ngit add -- .gitignore"
        },
        {
          "text": "Review the staged deletion and ignore rule. Continue only when they are the intended changes.",
          "code": "git diff --cached --stat\ngit diff --cached -- .gitignore"
        },
        {
          "text": "Replace the latest commit, rather than adding a later deletion.",
          "code": "git commit --amend --no-edit"
        },
        {
          "text": "Inspect outgoing history and confirm the file is ignored but still on disk. Replace OUTGOING_RANGE with the checked range, or HEAD to inspect all ancestors.",
          "code": "git log --oneline \"OUTGOING_RANGE\"\ngit log \"OUTGOING_RANGE\" -- \"SECRET_FILE\"\ngit ls-files -- \"SECRET_FILE\"\ngit check-ignore -- \"SECRET_FILE\""
        }
      ],
      "effect": "The amended tip excludes the file. Its local working copy remains. Older objects and reflogs are not erased. Review the final commit after hooks run; run required project checks separately.",
      "verify": "git ls-files and git log for the file in the outgoing range must print nothing. Inspect every outgoing commit for the credential, including renamed/copied files; confirm the local file contents survived. Push only the checked branch after this review.",
      "failure": "If the file or credential exists in an ancestor, stop; amending the tip is insufficient. Use the linked earlier-commit cleanup guidance.",
      "source": "https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line"
    },
    "secretSource": {
      "title": "Latest unpublished commit: remove a secret value from source",
      "risk": "Rewrites latest commit",
      "means": "The source file belongs in Git, but its embedded credential does not.",
      "checks": "Require the same clean-state, unpublished non-merge tip and ancestry checks as file removal. The credential must appear only in the latest outgoing commit, under no other path. Rotate it when exposure cannot be excluded. Do not put the credential itself into shell commands or this page.",
      "steps": [
        {
          "text": "Edit SOURCE_FILE in your editor to remove the credential and use the existing configuration mechanism. Keep the legitimate code tracked, then stage only that file.",
          "code": "git add -- \"SOURCE_FILE\""
        },
        {
          "text": "Review locally that only the intended credential removal is staged. Do not share this diff if it contains the old credential.",
          "code": "git diff --cached"
        },
        {
          "text": "Replace the unpublished tip. Review the final commit after hooks run; run project checks separately.",
          "code": "git commit --amend --no-edit"
        },
        {
          "text": "Review every outgoing commit locally, checking all paths for the credential. OUTGOING_RANGE must be checked first; use HEAD to inspect the entire ancestry for a new branch.",
          "code": "git log --oneline \"OUTGOING_RANGE\"\ngit ls-files -- \"SOURCE_FILE\"\ngit status"
        }
      ],
      "effect": "Replaces the tip snapshot while keeping the source file tracked. A new removal commit would leave the old secret in the pushed ancestry. Old local objects/reflogs remain.",
      "verify": "The source file remains tracked, the application still passes its checks, and every commit being pushed is free of the credential. No remote publication happens in this recipe.",
      "failure": "If any older commit contains the credential or you cannot inspect the outgoing range confidently, stop and use authoritative earlier-history cleanup instructions.",
      "source": "https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line"
    },
    "merge": {
      "title": "Continue a confirmed merge",
      "risk": "Resolution changes file contents",
      "means": "Git status explicitly says a merge is in progress.",
      "checks": "Confirm current git status says you are merging, not rebasing, cherry-picking or reverting. Copy any needed in-progress resolutions outside the repository before changing them. Resolve every unmerged file in your editor; add and remove paths according to the intended result.",
      "steps": [
        {
          "text": "List unresolved paths.",
          "code": "git status\ngit diff --name-only --diff-filter=U"
        },
        {
          "text": "After resolving RESOLVED_FILE, stage that exact path. Repeat for every resolved path, then review the staged result locally.",
          "code": "git add -- \"RESOLVED_FILE\"\ngit diff --cached"
        },
        {
          "text": "Continue only after no unresolved paths remain and project checks pass.",
          "code": "git merge --continue"
        }
      ],
      "effect": "Records the merge resolution. Staging a file does not prove its contents are correct.",
      "verify": "git diff --name-only --diff-filter=U must be empty; git status must no longer show an active merge. Inspect the resulting commit and run project checks.",
      "failure": "Stop if another file conflicts or checks fail. Abort is a separate choice that discards merge resolutions and may not reconstruct pre-existing dirty work.",
      "source": "https://git-scm.com/docs/git-merge"
    },
    "rebase": {
      "title": "Continue a confirmed rebase",
      "risk": "Rewrites replayed commits",
      "means": "Git status explicitly says a rebase is in progress.",
      "checks": "Confirm current git status says you are rebasing. Preserve needed resolution edits outside the repository. Resolve every unmerged path; at an intentional edit stop, make only the planned change before continuing. Do not switch to merge --continue.",
      "steps": [
        {
          "text": "Inspect the paused replay and unresolved paths.",
          "code": "git status\ngit diff --name-only --diff-filter=U"
        },
        {
          "text": "After resolving a conflicted path, stage it. Repeat as needed.",
          "code": "git add -- \"RESOLVED_FILE\""
        },
        {
          "text": "Continue this replay. Git may pause again; inspect status and repeat the appropriate resolution step.",
          "code": "git rebase --continue"
        }
      ],
      "effect": "Replays commits with new identities. It can stop repeatedly. It does not also run rebase --abort.",
      "verify": "git status must no longer report a rebase in progress. Review the resulting history and content and run project checks.",
      "failure": "Stop for unexpected state. Aborting is a separate decision that discards rebase resolutions; copy needed edits first. Do not skip commits merely to silence an error.",
      "source": "https://git-scm.com/docs/git-rebase"
    },
    "detached": {
      "title": "Keep the current detached commit on a branch",
      "risk": "Adds a local branch",
      "means": "HEAD points to a commit directly rather than a branch.",
      "checks": "Confirm git status reports detached HEAD, with no other operation in progress. Choose a new RESCUE_BRANCH; never reuse an existing name with -C or -f.",
      "steps": [
        {
          "text": "Inspect the current commit and work.",
          "code": "git status\ngit log -1 --oneline\ngit branch --list \"RESCUE_BRANCH\""
        },
        {
          "text": "Create a new branch at HEAD. Stop if the name exists.",
          "code": "git switch -c \"RESCUE_BRANCH\""
        }
      ],
      "effect": "Names the current commit without changing file contents or the index. Uncommitted work is still uncommitted.",
      "verify": "git branch --show-current must print RESCUE_BRANCH; git rev-parse HEAD must equal the starting hash. Compare file/index state with the starting state.",
      "failure": "If the name exists, select another unused name. If a rebase or another operation is active, follow that operation instead.",
      "source": "https://git-scm.com/docs/git-switch"
    },
    "diverged": {
      "title": "Inspect diverged history before integrating",
      "risk": "Inspection only",
      "means": "Local and upstream histories each have commits the other lacks.",
      "checks": "Confirm current branch and configured upstream with git branch -vv. Fetch the checked REMOTE. Require a clean index and working tree, no active operation, and agreement with your team before choosing merge or rebase. This diagnostic does not choose one automatically.",
      "steps": [
        {
          "text": "Inspect configuration, then fetch only the selected remote.",
          "code": "git status\ngit branch -vv\ngit remote -v\ngit fetch \"REMOTE\""
        },
        {
          "text": "Inspect both sides of the checked upstream ref.",
          "code": "git log --left-right --graph --oneline \"HEAD...UPSTREAM_REF\""
        }
      ],
      "effect": "Fetch updates remote-tracking refs; no local history or working files are integrated.",
      "verify": "Identify commits unique to each side, whether local commits are already shared, and the intended upstream before choosing an integration method.",
      "failure": "If publication state or upstream is unclear, stop. Rebase rewrites commits; merge can conflict. Do not force-push to resolve divergence.",
      "source": "https://git-scm.com/docs/git-fetch"
    },
    "auth": {
      "title": "Authentication failed",
      "risk": "Inspection only",
      "means": "The remote rejected authentication or authorization. This does not establish the state of local files.",
      "checks": "Check the exact remote URL, account, transport and repository permissions. Do not paste a token into a URL. Use the selected host’s official credential instructions; an SSH test must match that host, including self-hosted addresses.",
      "steps": [
        {
          "text": "Inspect remote and credential-helper configuration. Redact credentials before sharing output.",
          "code": "git remote -v\ngit config --show-origin --get-all credential.helper"
        }
      ],
      "effect": "Inspects configuration without clearing credentials or assuming a host.",
      "verify": "After following host instructions, verify read access with git ls-remote \"REMOTE\". Read access does not prove write access; retry only the intended push.",
      "failure": "If access still fails, check token permissions, expiry, organization authorization and repository access. Do not delete all cached credentials.",
      "source": "https://git-scm.com/docs/gitcredentials"
    },
    "reflog": {
      "title": "Find and reference a lost local commit",
      "risk": "Adds a local branch",
      "means": "A local reference may have moved away from a commit you need.",
      "checks": "Reflogs are local and retention is configurable. Uncommitted work is not recovered by this recipe. Find and inspect the full commit hash; do not guess a HEAD@{n} offset. Choose a new RESCUE_BRANCH.",
      "steps": [
        {
          "text": "Search the local reflog and inspect a candidate full hash.",
          "code": "git reflog -n 30\ngit show \"COMMIT_ID\""
        },
        {
          "text": "After checking the content, add a branch without switching your working tree.",
          "code": "git branch \"RESCUE_BRANCH\" \"COMMIT_ID\""
        }
      ],
      "effect": "Makes an existing commit reachable by a new branch. It does not restore unstaged files, ignored files or pruned objects.",
      "verify": "Compare git rev-parse \"RESCUE_BRANCH\" with the chosen commit hash; inspect its file contents with git show. Your current index and files should be unchanged.",
      "failure": "If the object no longer exists, this recipe cannot recover it. Check other clones/backups. Stop if the name exists and choose another; never force-replace it.",
      "source": "https://git-scm.com/docs/git-reflog"
    },
    "snapshot": {
      "title": "Keep a commit reference and a stash of dirty work",
      "risk": "Temporarily removes dirty work; application can conflict",
      "means": "A branch references committed history only. A separate stash can preserve staged, unstaged and untracked work.",
      "checks": "Require an existing commit and dirty files, no unmerged index or active operation, and a new BACKUP_BRANCH. Copy ignored files, submodule work and external files separately; -u does not include them. If there is nothing to save, do not apply an older stash. Keep the stash until you have verified restoration.",
      "steps": [
        {
          "text": "Inspect work and any existing stashes. Confirm something needs saving.",
          "code": "git status\ngit stash list\ngit branch --list \"BACKUP_BRANCH\""
        },
        {
          "text": "Create a commit reference. Continue only if it succeeds.",
          "code": "git branch \"BACKUP_BRANCH\""
        },
        {
          "text": "Save dirty work, including untracked files. Continue only if Git reports a new stash.",
          "code": "git stash push --include-untracked -m \"before-recovery\""
        },
        {
          "text": "Confirm the newest stash is the one just created before applying it; do not run this after an empty or failed stash.",
          "code": "git stash list -1\ngit stash apply --index \"stash@{0}\""
        }
      ],
      "effect": "Keeps a branch reference and a stash. --index attempts to restore staged state as well as working files. Ignored files and submodule contents are outside this snapshot.",
      "verify": "Compare file contents, git diff and git diff --staged with the starting state; verify untracked files and the stash entry. Keep the stash; no drop or clear is included.",
      "failure": "If application conflicts, stop and preserve the stash. Do not repeatedly apply it. A stash is not an external backup and may contain credentials.",
      "source": "https://git-scm.com/docs/git-stash"
    },
    "unstage": {
      "title": "Unstage a file while keeping its working copy",
      "risk": "Changes the index",
      "means": "The next commit should exclude this file’s staged changes.",
      "checks": "Require an existing HEAD and no unmerged index or active operation. Inspect staged and unstaged diffs. If staged content differs from disk and must be kept, save it separately first.",
      "steps": [
        {
          "text": "Unstage only the selected path.",
          "code": "git restore --staged -- \"FILE\""
        }
      ],
      "effect": "Copies the HEAD version into the index for this path. The working file is unchanged; a distinct staged-only version is replaced.",
      "verify": "Compare the working file with its previous contents and inspect git diff and git diff --staged.",
      "failure": "For an unborn branch or conflicted path, stop and inspect status; this recipe does not cover those states.",
      "source": "https://git-scm.com/docs/git-restore"
    },
    "discard": {
      "title": "Discard a selected file’s unstaged edits",
      "risk": "Permanent loss of unstaged edits",
      "means": "You deliberately want this working file to match its index version.",
      "checks": "Inspect git diff -- \"FILE\" and git diff --staged -- \"FILE\" first. Copy needed file contents outside the repository. Confirm the path and no operation/conflict is active. Git cannot recover never-saved edits.",
      "steps": [
        {
          "text": "Overwrite only the selected working file from its index snapshot.",
          "code": "git restore -- \"FILE\""
        }
      ],
      "effect": "Replaces the working file with the staged/index version, which may differ from HEAD. No whole-directory discard is included.",
      "verify": "git diff -- \"FILE\" must be empty; staged changes remain. Inspect actual file contents.",
      "failure": "If you need discarded unsaved edits, check editor history or external backups. A backup branch alone does not contain them.",
      "source": "https://git-scm.com/docs/git-restore"
    },
    "rewind": {
      "title": "Rewind one unpublished commit",
      "risk": "Rewrites local branch history",
      "means": "Keep the latest commit’s changes in the index while moving the branch back one parent.",
      "checks": "Only for an unpublished non-merge tip with a parent, clean index and working tree, and no operation in progress. Do not use this for secret cleanup. Save a unique local backup branch first; do not publish backups containing sensitive history.",
      "steps": [
        {
          "text": "Name the starting commit before moving the current branch.",
          "code": "git branch \"BACKUP_BRANCH\""
        },
        {
          "text": "Move back one parent while retaining the index and working files.",
          "code": "git reset --soft \"HEAD~1\""
        }
      ],
      "effect": "Moves the branch one commit back. The original tip is referenced by BACKUP_BRANCH and its file snapshot remains staged.",
      "verify": "HEAD equals the original parent; files match the old tip; git diff --staged shows exactly that commit’s changes.",
      "failure": "Stop for a root commit, merge commit, dirty state or shared history. Do not chain amend as an alternative in this sequence.",
      "source": "https://git-scm.com/docs/git-reset"
    },
    "revert": {
      "title": "Undo a shared non-merge commit with a revert",
      "risk": "Changes files; can conflict",
      "means": "Create an inverse commit while keeping the original shared history.",
      "checks": "Require a clean index and working tree with no operation in progress. Inspect COMMIT_ID and confirm it is a non-merge commit on the intended branch. Review and test the result before publishing through your team’s normal review process.",
      "steps": [
        {
          "text": "Inspect the selected commit, then create its inverse.",
          "code": "git show \"COMMIT_ID\"\ngit revert \"COMMIT_ID\""
        }
      ],
      "effect": "Adds a new commit, or pauses on conflicts. The original remains reachable. This does not remove secrets from history.",
      "verify": "Inspect git log -1 --stat and the resulting file contents; run project checks. Confirm the original commit is still in history.",
      "failure": "If conflicted, inspect git status; use revert-specific continuation after resolution. Aborting discards revert resolutions. Merge commits need a separate mainline-parent decision.",
      "source": "https://git-scm.com/docs/git-revert"
    },
    "init": {
      "title": "Start a repository in a new project folder",
      "risk": "Creates Git metadata and a first commit",
      "means": "Track an existing project folder that is not already a repository.",
      "checks": "Confirm the directory is the intended project and is not inside another repository. Create .gitignore in your editor before staging. Inspect files for credentials. Choose INITIAL_BRANCH deliberately; configure author identity if needed. Stop if git init reports an existing repository.",
      "steps": [
        {
          "text": "Initialize only this checked directory.",
          "code": "git init -b \"INITIAL_BRANCH\""
        },
        {
          "text": "Inspect files and ignore rules, then stage only the intended file. Repeat this step for each intended file.",
          "code": "git status\ngit add -- \"FILE\""
        },
        {
          "text": "Read the full staged diff locally. Check the actual contents and every staged path, including credentials and ignore rules. Continue only after the review passes.",
          "code": "git diff --cached"
        },
        {
          "text": "Create the first commit from the reviewed index.",
          "code": "git commit -m \"Initial commit\""
        }
      ],
      "effect": "Creates a local repository and records selected files. Nothing is published.",
      "verify": "git status and git log -1 --stat must show the expected branch, commit and file selection. Confirm sensitive files were excluded.",
      "failure": "If any step fails, stop before staging or committing more files. Do not initialize a second repository inside an existing one.",
      "source": "https://git-scm.com/docs/git-init"
    },
    "clone": {
      "title": "Clone an existing repository",
      "risk": "Downloads history and writes a new directory",
      "means": "Create a local checkout from a reviewed repository URL.",
      "checks": "Verify REPOSITORY_URL, read access and an unused CLONE_DIRECTORY. Do not embed credentials in URLs or clone an untrusted project to run its code automatically.",
      "steps": [
        {
          "text": "Clone into an unused destination. Continue only if the clone succeeds.",
          "code": "git clone \"REPOSITORY_URL\" \"CLONE_DIRECTORY\""
        },
        {
          "text": "Inspect the checkout without changing your shell directory.",
          "code": "git -C \"CLONE_DIRECTORY\" status\ngit -C \"CLONE_DIRECTORY\" branch -a"
        }
      ],
      "effect": "Downloads available history and checks out the remote default branch. Shallow/partial server history and permissions can limit available objects.",
      "verify": "Inspect the remote URL, checked-out branch and expected files in CLONE_DIRECTORY.",
      "failure": "If cloning fails, inspect the exact access or path error. Do not delete or overwrite an existing destination.",
      "source": "https://git-scm.com/docs/git-clone"
    },
    "stage": {
      "title": "Stage a file and save a commit",
      "risk": "Changes the index and adds a commit",
      "means": "A commit records the staged snapshot, which can differ from current working files.",
      "checks": "Confirm the intended branch, no active operation, and which changes already exist in the index. Inspect the selected file for credentials. This commit includes every staged path, not just FILE.",
      "steps": [
        {
          "text": "Review the current selection before adding a file.",
          "code": "git status\ngit diff --staged\ngit diff -- \"FILE\""
        },
        {
          "text": "Stage the selected file’s current contents.",
          "code": "git add -- \"FILE\""
        },
        {
          "text": "Review the complete staged diff locally. Continue only after checking its contents.",
          "code": "git diff --staged"
        },
        {
          "text": "Save the reviewed snapshot.",
          "code": "git commit -m \"Describe the change\""
        }
      ],
      "effect": "Creates a commit from all staged changes. Unstaged and untracked work is excluded.",
      "verify": "git log -1 --stat and git status must agree with the intended snapshot and any remaining edits. Run project checks.",
      "failure": "If unexpected paths are staged, stop and follow the unstage recipe before committing. If a hook changes files, inspect the final commit and remaining work.",
      "source": "https://git-scm.com/docs/git-commit"
    },
    "branch": {
      "title": "Create a branch for new work",
      "risk": "Adds and switches to a branch",
      "means": "A branch names a commit; uncommitted changes remain in the same working directory.",
      "checks": "Require an existing commit, no active operation, and an unused NEW_BRANCH. Inspect dirty work; a new branch does not snapshot or isolate it. Confirm the current commit is the intended starting point.",
      "steps": [
        {
          "text": "Inspect the starting state and name availability.",
          "code": "git status\ngit log -1 --oneline\ngit branch --list \"NEW_BRANCH\""
        },
        {
          "text": "Create and switch to the new name. Stop if it already exists.",
          "code": "git switch -c \"NEW_BRANCH\""
        }
      ],
      "effect": "Adds a branch reference at the current commit and attaches HEAD to it. Files and the index remain in place.",
      "verify": "git branch --show-current must print NEW_BRANCH. Compare HEAD and file/index state with the starting state.",
      "failure": "Choose another unused name if creation fails. Never use -C or -f to overwrite an existing branch as a shortcut.",
      "source": "https://git-scm.com/docs/git-switch"
    },
    "worktree": {
      "title": "Use a second worktree",
      "risk": "Creates a directory and checks out files",
      "means": "A second worktree lets you inspect an existing branch without switching this directory.",
      "checks": "Confirm TARGET_BRANCH exists and is not checked out in another worktree. WORKTREE_PATH must be an unused directory, preferably outside this checkout. Inspect git worktree list first.",
      "steps": [
        {
          "text": "Create the additional checkout.",
          "code": "git worktree list\ngit worktree add \"WORKTREE_PATH\" \"TARGET_BRANCH\""
        }
      ],
      "effect": "Creates a second working directory sharing objects and refs with this repository. It is not an independent backup.",
      "verify": "git worktree list must show the expected path and branch. Inspect its files.",
      "failure": "If the path or branch is already in use, stop and choose another. Remove a worktree separately only after preserving its dirty and untracked files; never force removal.",
      "source": "https://git-scm.com/docs/git-worktree"
    },
    "rebasePlan": {
      "title": "Plan an interactive rebase of unpublished commits",
      "risk": "Rewrites selected commits",
      "means": "Interactive rebase changes commit order or combines local commits.",
      "checks": "Require clean index and working tree, no operation in progress, unpublished non-merge commits and a checked BASE_COMMIT before those commits. Make a unique backup branch. Review the todo list before saving; never replay shared history without team agreement.",
      "steps": [
        {
          "text": "Inspect the range and reference the current tip.",
          "code": "git status\ngit log --oneline \"BASE_COMMIT..HEAD\"\ngit branch \"BACKUP_BRANCH\""
        },
        {
          "text": "Open the interactive todo list. Keep the first commit as pick when squashing.",
          "code": "git rebase -i \"BASE_COMMIT\""
        }
      ],
      "effect": "Replays selected commits with new identities. An editor or a conflict can pause the operation.",
      "verify": "Review git log, the final file tree and project checks against BACKUP_BRANCH. git status must show no active rebase.",
      "failure": "For conflicts, follow the confirmed rebase recipe. Aborting is a separate choice that discards resolutions; preserve needed edits first.",
      "source": "https://git-scm.com/docs/git-rebase"
    },
    "bisect": {
      "title": "Find a regression with bisect",
      "risk": "Checks out different commits",
      "means": "Bisect narrows down the first bad commit between known good and bad revisions.",
      "checks": "Require a clean index and working tree, no active operation, and tested GOOD_COMMIT/BAD_COMMIT boundaries. Tests must distinguish the regression consistently. Save generated or ignored files separately if checkouts could affect them.",
      "steps": [
        {
          "text": "Start with the checked boundaries.",
          "code": "git bisect start \"BAD_COMMIT\" \"GOOD_COMMIT\""
        },
        {
          "text": "Test the checked-out revision. Run only one classification that matches the result, repeating until the first bad commit is reported.",
          "code": "git status"
        },
        {
          "text": "After the search, return to the original checkout.",
          "code": "git bisect reset"
        }
      ],
      "effect": "Moves HEAD through candidate revisions; it does not edit commits. Use git bisect good or git bisect bad separately after each actual test; do not copy both.",
      "verify": "Reproduce the regression at the reported first bad commit and verify its parent is good. After reset, compare HEAD and work with the starting state.",
      "failure": "If a test cannot run, use a deliberate skip or stop the search. A changing or incorrect test invalidates the result.",
      "source": "https://git-scm.com/docs/git-bisect"
    },
    "tag": {
      "title": "Create an annotated release tag",
      "risk": "Adds a tag; publishing is a separate action",
      "means": "A tag gives a checked commit a release name.",
      "checks": "Confirm RELEASE_TAG is unused and HEAD is the exact tested release commit. Inspect git tag --list and project checks. Tags can be moved; coordinate with users rather than rewriting a published tag.",
      "steps": [
        {
          "text": "Inspect the commit and create only the selected tag.",
          "code": "git log -1 --oneline\ngit tag --list \"RELEASE_TAG\"\ngit tag -a \"RELEASE_TAG\" -m \"Release\""
        }
      ],
      "effect": "Adds a local annotated tag. It does not publish every local tag.",
      "verify": "git rev-parse \"RELEASE_TAG^{}\" must equal the intended release commit. Inspect git show \"RELEASE_TAG\". Publish this single tag to a checked remote only after review.",
      "failure": "If the tag exists, stop. Do not force-replace it or push --tags as a shortcut.",
      "source": "https://git-scm.com/docs/git-tag"
    },
    "forceLease": {
      "title": "Review a lease before rewriting your own remote branch",
      "risk": "Can remove remote commits",
      "means": "A force update replaces a remote branch tip. An explicit lease checks that the tip has not moved from the hash you reviewed.",
      "checks": "Only for an agreed rewrite of your own review branch. Inspect git ls-remote and fetch the exact REMOTE_BRANCH, review every remote commit and record its full EXPECTED_REMOTE_SHA. Ensure no needed teammate commits will be dropped. Automatic fetches do not constitute review. Confirm LOCAL_BRANCH is the intended replacement.",
      "steps": [
        {
          "text": "Inspect the remote tip and fetched history first. These commands do not publish anything.",
          "code": "git ls-remote --heads \"REMOTE\" \"REMOTE_BRANCH\"\ngit fetch \"REMOTE\" \"REMOTE_BRANCH\"\ngit log --oneline FETCH_HEAD"
        },
        {
          "text": "Only after checking that exact hash and history, request the agreed update with an explicit lease.",
          "code": "git push \"--force-with-lease=refs/heads/REMOTE_BRANCH:EXPECTED_REMOTE_SHA\" \"REMOTE\" \"LOCAL_BRANCH:refs/heads/REMOTE_BRANCH\""
        }
      ],
      "effect": "Replaces the remote tip only if it still equals the reviewed hash. It can deliberately remove commits even with a valid lease; the lease is not proof that the history is appropriate.",
      "verify": "git ls-remote --heads \"REMOTE\" \"REMOTE_BRANCH\" must equal the intended local branch hash. Check the review diff and retained commits.",
      "failure": "If the lease rejects, stop and inspect the new remote history. Do not refresh the expected hash and retry blindly. Never use this to bypass protected-branch rules.",
      "source": "https://git-scm.com/docs/git-push"
    },
    "cherryPick": {
      "title": "Apply one non-merge commit to the current branch",
      "risk": "Changes files; may conflict",
      "means": "Cherry-pick creates a new commit from another commit’s changes.",
      "checks": "Require a clean index and working tree, no operation in progress, the correct target branch already checked out, and a reviewed non-merge COMMIT_ID. Check dependencies on other commits before applying it.",
      "steps": [
        {
          "text": "Inspect the target and source commit.",
          "code": "git status\ngit branch --show-current\ngit show \"COMMIT_ID\""
        },
        {
          "text": "Apply just the reviewed commit.",
          "code": "git cherry-pick \"COMMIT_ID\""
        }
      ],
      "effect": "Adds a commit on the current branch or pauses with conflicts. It does not switch branches or also abort.",
      "verify": "Review git log -1 --stat, file contents and project checks. git status must show no cherry-pick in progress.",
      "failure": "If conflicts occur, stop and resolve using cherry-pick-specific continuation, or separately choose abort after preserving needed resolutions. Do not run merge --continue or rebase --continue.",
      "source": "https://git-scm.com/docs/git-cherry-pick"
    },
    "sensitive": {
      "title": "Possibly sensitive untracked filename",
      "risk": "Inspection; ignore-rule editing requires review",
      "means": "An untracked filename resembles local configuration or a private key. The name does not prove its contents are secret, nor that it never appeared in history.",
      "checks": "Inspect the actual file locally. Do not paste credentials here. Confirm it is genuinely untracked, whether it belongs in the project, and whether any credential has already been exposed. Rotate a credential when exposure cannot be excluded.",
      "steps": [
        {
          "text": "Inspect tracking and known local history for the exact checked path.",
          "code": "git status --untracked-files=all\ngit ls-files -- \"FILE\"\ngit log --all --oneline -- \"FILE\""
        },
        {
          "text": "Only if this is an untracked local-only file, edit .gitignore in your editor with an appropriate anchored pattern. Keep legitimate source tracked. Confirm the intended rule matches.",
          "code": "git check-ignore -v -- \"FILE\"\ngit status --untracked-files=all"
        }
      ],
      "effect": "Inspection alone changes no tracked files. An ignore rule prevents normal accidental staging of matching untracked files; it does not untrack files or remove secrets from earlier history.",
      "verify": "The intended file remains on disk, git ls-files prints no path, and git check-ignore identifies the intended rule. Review all matching paths before staging .gitignore.",
      "failure": "If the file is already tracked or exists in secret-bearing history, ignoring it is insufficient. Follow the separate secret-history guidance when scanning evidence or local inspection establishes a credential.",
      "source": "https://git-scm.com/docs/gitignore"
    },
    "sync": {
      "title": "Update a branch from its remote",
      "risk": "Fetches remote history; may advance the branch and publish reviewed commits",
      "means": "For everyday updates, fetch the selected remote, inspect the relationship to its tracking branch, then accept only a fast-forward. This workflow does not reconcile diverged histories.",
      "checks": "Require the intended named branch, a clean index and working tree, and no active operation. Check REMOTE, BRANCH and its fetched UPSTREAM_REF; do not assume origin or main. If both sides have unique commits, stop and use the separate divergence guidance below. Inspect every outgoing commit for credentials and run project checks before publishing.",
      "steps": [
        {
          "text": "Confirm the current branch, work and remote configuration.",
          "code": "git status\ngit branch --show-current\ngit branch -vv\ngit remote -v"
        },
        {
          "text": "Fetch the checked remote without integrating changes.",
          "code": "git fetch \"REMOTE\""
        },
        {
          "text": "Inspect both sides. A < marks a local-only commit and > marks an upstream-only commit. If both appear, use the divergence guidance instead of continuing.",
          "code": "git log --left-right --graph --oneline \"HEAD...UPSTREAM_REF\""
        },
        {
          "text": "Bring in upstream commits only if this can fast-forward. If it fails, stop; do not replace it with a reset or an automatic rebase.",
          "code": "git merge --ff-only \"UPSTREAM_REF\""
        },
        {
          "text": "Review all outgoing commits and their full patches locally. Do not share output containing credentials. Continue only after content review and project checks pass.",
          "code": "git log --format=fuller --patch \"UPSTREAM_REF..HEAD\""
        },
        {
          "text": "If you have reviewed local commits to publish, push only to the checked destination branch. If nothing is outgoing, this step is unnecessary.",
          "code": "git push \"REMOTE\" \"HEAD:refs/heads/BRANCH\""
        },
        {
          "text": "Compare the remote destination hash with HEAD and inspect the final work state.",
          "code": "git ls-remote --heads \"REMOTE\" \"BRANCH\"\ngit rev-parse HEAD\ngit status"
        }
      ],
      "effect": "Fetch refreshes remote-tracking references. The fast-forward step advances the current branch only when histories permit it; existing local commits are retained. The optional push publishes the reviewed commits. No merge commit, rebase or force update is chosen automatically.",
      "verify": "The checked remote branch hash must match the intended HEAD after any push. Inspect the resulting files and history and confirm the index and working tree remain clean.",
      "failure": "If histories have diverged, stop and inspect the separate divergence recipe. If permissions, policy, credentials or a concurrent update reject the push, use the exact rejection to choose the next step; do not force-push.",
      "source": "https://git-scm.com/docs/git-merge"
    }
  };
  const normalize = raw => String(raw || '').slice(0,102400).replace(/\x1b\[[0-9;]*[a-zA-Z]/g,'').replace(/\r\n?/g,'\n');
  function result(key,text,confidence='Explicit output') {
    const r=recipes[key];
    return {recipeKey:key,title:r.title,icon:'',confidence,triggerLine:text.split('\n').find(l=>l.trim())||'',risk:r.risk,checks:r.checks,workLostStatus:'unknown',workLostText:r.effect,desc:r.means,code:r.steps.map(s=>'# '+s.text+'\n'+s.code).join('\n\n'),effect:r.effect,verify:r.verify,warning:r.failure,linkText:'Review the related guidance',linkId:key==='secret'?'card-forge-troubleshoot':key==='auth'?'card-forge-troubleshoot':key==='rebase'?'card-rebase':key==='merge'?'card-conflict':key==='detached'?'card-detached':key==='reflog'?'card-reflog':'troubleshootConsole'};
  }
  function analyze(raw) {
    const text=normalize(raw); if(!text.trim())return null;
    const rebase=/^(?:interactive )?rebase in progress\b|^You are currently rebasing\b/im.test(text);
    const merge=/^You are (?:still )?merging\b|^All conflicts fixed but you are still merging\b|git merge --abort.*abort the merge/im.test(text);
    const other=/^You are currently (?:cherry-picking|reverting|bisecting)\b/im.test(text);
    const conflict=/^Unmerged paths:|^\s*(?:both modified|both added|both deleted):|^CONFLICT \(/im.test(text);
    const detached=/^HEAD detached (?:at|from)\b|^## HEAD \(no branch\)/im.test(text);
    const secret=/Push cannot contain secrets|Push rules: Secret detection|secret scanning detected|secret push protection|SECRET PUSH PROTECTION/i.test(text);
    const protectedBranch=/GH006|protected branch (?:update failed|hook declined)|not allowed to push code to protected branches|branch.*cannot be updated directly|changes must be made through a pull request/i.test(text);
    const auth=/Authentication failed|Permission denied \(publickey\)|Support for password authentication was removed|Invalid username or password/i.test(text);
    const diverged=/have diverged|\[ahead \d+, behind \d+\]/i.test(text);
    const families=[rebase||merge||other||conflict||detached,secret,protectedBranch,auth,diverged].filter(Boolean).length;
    if(families>1||(rebase&&merge)||other||((merge||rebase)&&detached))return result('inspect',text,'Ambiguous output');
    if(rebase)return result('rebase',text);
    if(merge)return result('merge',text);
    if(conflict)return result('inspect',text,'Operation not established');
    if(secret)return result('secret',text);
    if(protectedBranch)return result('protected',text);
    if(auth)return result('auth',text);
    if(detached)return result('detached',text);
    if(diverged)return result('diverged',text);
    if(/GH013|repository rule violations|hook declined|pre-receive hook declined/i.test(text))return result('inspect',text,'Rule cause not established');
    if(/(?:^Untracked files:[\s\S]*?^\s+|^\?\?\s+)(?:[^\r\n]*[\\/])?(?:\.env(?:\.[^\s]+)?|id_rsa|id_ed25519|secrets\.json|[^\s]+\.(?:pem|key))\s*$/im.test(text))return result('sensitive',text,'Filename observation only');
    if(/^nothing to commit, working tree clean\s*$/im.test(text)) {
      const r=result('inspect',text);r.title='Working tree reported clean';r.desc='This status reports no staged or unstaged tracked changes, and no visible untracked changes. Ignored files, remote state, backups and earlier lost work are not established.';r.confidence='Explicit status observation';return r;
    }
    return result('inspect',text,'Not enough information');
  }
  const api={recipes,normalize,analyze,stop};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GitRecovery=api;
})(typeof globalThis!=='undefined'?globalThis:this);
