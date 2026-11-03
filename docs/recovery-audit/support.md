# Recovery support snapshot

This snapshot describes the current recovery.js definitions after the consistency pass. The UI and executable tests use recovery.js directly. Counts and environment details are recorded in README.md and the task tracker. The earlier release report remains historical evidence for its named revision.

## inspect

- Meaning: This output does not establish a recovery path or whether work is preserved.
- Preconditions: Provide fresh, complete git status output and the exact failing command and error. Redact credentials. Do not combine output from different attempts.
- Consequences: Collects repository information; no recovery is attempted.
- Verify: Check the branch, staged and unstaged changes, and any operation in progress.
- Failure/limits: If the cause is still unclear, stop and seek help with the redacted output.
- Documentation: https://git-scm.com/docs/git-status

## protected

- Meaning: The remote explicitly rejected a direct update to a protected branch.
- Preconditions: Confirm this is the intended repository and HEAD contains the commits to review. No merge, rebase or other operation may be in progress. Inspect git remote -v and choose REMOTE. Choose a new REVIEW_BRANCH; if it exists, choose another name. Uncommitted files stay local and are not published.
- Consequences: Adds and publishes a branch pointing to your existing commits. Staged, unstaged and untracked files stay in place. The original local branch still points to its commits; no realignment is needed for this fix.
- Verify: Compare git status and git diff --staged with the initial state. Run git ls-remote --heads "REMOTE" "REVIEW_BRANCH" and compare its hash with git rev-parse HEAD.
- Failure/limits: If branch creation or push fails, stop. The remote may restrict new branch names or your write access. Read its complete rejection; do not reset or force-push.
- Documentation: https://git-scm.com/docs/git-push

## secret

- Meaning: The output explicitly mentions secret scanning or a push containing secrets. A rule code by itself does not establish this.
- Preconditions: Revoke or rotate the credential if exposure occurred or cannot be excluded. Read every reported commit and path. Determine whether the secret is confined to the latest unpublished, non-merge commit, and whether it is an entire accidentally tracked file or a value inside legitimate source. A rejected push does not prove the credential was never exposed. Check the destination remote and whether the destination branch already exists before choosing the outgoing range. Patches containing credentials must stay local.
- Consequences: Fetch updates the selected remote-tracking references; the history commands inspect the chosen outgoing range. Local files, the index and HEAD are unchanged. No cleanup is attempted. Ignoring a file or adding a later deletion does not remove it from earlier commits.
- Verify: For latest-commit cleanup, use exactly one of the two recipes below only after all prerequisites hold. Review every commit that will be pushed. Absence of a rejection alone does not verify cleanup.
- Failure/limits: Earlier commits, published history, merge commits, uncertain ancestry, or a dirty index/working tree require a separate cleanup plan. Follow the linked authoritative history-cleanup instructions; this app does not claim to clean those cases.
- Documentation: https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line

## secretFile

- Meaning: The whole file should remain local and never be tracked.
- Preconditions: Only for a clean index and working tree, no operation in progress, and a latest unpublished non-merge commit. The file and credential must be absent from every earlier outgoing commit, including other paths. Confirm this by inspecting the scanner locations and outgoing history. Do not use a backup ref in any push; old local objects/reflogs still contain the secret. Rotate the credential when exposure cannot be excluded.
- Consequences: The amended tip excludes the file. Its local working copy remains. Older objects and reflogs are not erased. Review the final commit after hooks run; run required project checks separately.
- Verify: git ls-files and git log for the file in the outgoing range must print nothing. Inspect every outgoing commit for the credential, including renamed/copied files; confirm the local file contents survived. Push only the checked branch after this review.
- Failure/limits: If the file or credential exists in an ancestor, stop; amending the tip is insufficient. Use the linked earlier-commit cleanup guidance.
- Documentation: https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line

## secretSource

- Meaning: The source file belongs in Git, but its embedded credential does not.
- Preconditions: Require the same clean-state, unpublished non-merge tip and ancestry checks as file removal. The credential must appear only in the latest outgoing commit, under no other path. Rotate it when exposure cannot be excluded. Do not put the credential itself into shell commands or this page.
- Consequences: Replaces the tip snapshot while keeping the source file tracked. A new removal commit would leave the old secret in the pushed ancestry. Old local objects/reflogs remain.
- Verify: The source file remains tracked, the application still passes its checks, and every commit being pushed is free of the credential. No remote publication happens in this recipe.
- Failure/limits: If any older commit contains the credential or you cannot inspect the outgoing range confidently, stop and use authoritative earlier-history cleanup instructions.
- Documentation: https://docs.github.com/en/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-on-the-command-line

## merge

- Meaning: Git status explicitly says a merge is in progress.
- Preconditions: Confirm current git status says you are merging, not rebasing, cherry-picking or reverting. Copy any needed in-progress resolutions outside the repository before changing them. Resolve every unmerged file in your editor; add and remove paths according to the intended result.
- Consequences: Records the merge resolution. Staging a file does not prove its contents are correct.
- Verify: git diff --name-only --diff-filter=U must be empty; git status must no longer show an active merge. Inspect the resulting commit and run project checks.
- Failure/limits: Stop if another file conflicts or checks fail. Abort is a separate choice that discards merge resolutions and may not reconstruct pre-existing dirty work.
- Documentation: https://git-scm.com/docs/git-merge

## rebase

- Meaning: Git status explicitly says a rebase is in progress.
- Preconditions: Confirm current git status says you are rebasing. Preserve needed resolution edits outside the repository. Resolve every unmerged path; at an intentional edit stop, make only the planned change before continuing. Do not switch to merge --continue.
- Consequences: Replays commits with new identities. It can stop repeatedly. It does not also run rebase --abort.
- Verify: git status must no longer report a rebase in progress. Review the resulting history and content and run project checks.
- Failure/limits: Stop for unexpected state. Aborting is a separate decision that discards rebase resolutions; copy needed edits first. Do not skip commits merely to silence an error.
- Documentation: https://git-scm.com/docs/git-rebase

## detached

- Meaning: HEAD points to a commit directly rather than a branch.
- Preconditions: Confirm git status reports detached HEAD, with no other operation in progress. Choose a new RESCUE_BRANCH; never reuse an existing name with -C or -f.
- Consequences: Names the current commit without changing file contents or the index. Uncommitted work is still uncommitted.
- Verify: git branch --show-current must print RESCUE_BRANCH; git rev-parse HEAD must equal the starting hash. Compare file/index state with the starting state.
- Failure/limits: If the name exists, select another unused name. If a rebase or another operation is active, follow that operation instead.
- Documentation: https://git-scm.com/docs/git-switch

## diverged

- Meaning: Local and upstream histories each have commits the other lacks.
- Preconditions: Confirm current branch and configured upstream with git branch -vv. Fetch the checked REMOTE. Require a clean index and working tree, no active operation, and agreement with your team before choosing merge or rebase. This diagnostic does not choose one automatically.
- Consequences: Fetch updates remote-tracking refs; no local history or working files are integrated.
- Verify: Identify commits unique to each side, whether local commits are already shared, and the intended upstream before choosing an integration method.
- Failure/limits: If publication state or upstream is unclear, stop. Rebase rewrites commits; merge can conflict. Do not force-push to resolve divergence.
- Documentation: https://git-scm.com/docs/git-fetch

## auth

- Meaning: The remote rejected authentication or authorization. This does not establish the state of local files.
- Preconditions: Check the exact remote URL, account, transport and repository permissions. Do not paste a token into a URL. Use the selected host’s official credential instructions; an SSH test must match that host, including self-hosted addresses.
- Consequences: Inspects configuration without clearing credentials or assuming a host.
- Verify: After following host instructions, verify read access with git ls-remote "REMOTE". Read access does not prove write access; retry only the intended push.
- Failure/limits: If access still fails, check token permissions, expiry, organization authorization and repository access. Do not delete all cached credentials.
- Documentation: https://git-scm.com/docs/gitcredentials

## reflog

- Meaning: A local reference may have moved away from a commit you need.
- Preconditions: Reflogs are local and retention is configurable. Uncommitted work is not recovered by this recipe. Find and inspect the full commit hash; do not guess a HEAD@{n} offset. Choose a new RESCUE_BRANCH.
- Consequences: Makes an existing commit reachable by a new branch. It does not restore unstaged files, ignored files or pruned objects.
- Verify: Compare git rev-parse "RESCUE_BRANCH" with the chosen commit hash; inspect its file contents with git show. Your current index and files should be unchanged.
- Failure/limits: If the object no longer exists, this recipe cannot recover it. Check other clones/backups. Stop if the name exists and choose another; never force-replace it.
- Documentation: https://git-scm.com/docs/git-reflog

## snapshot

- Meaning: A branch references committed history only. A separate stash can preserve staged, unstaged and untracked work.
- Preconditions: Require an existing commit and dirty files, no unmerged index or active operation, and a new BACKUP_BRANCH. Copy ignored files, submodule work and external files separately; -u does not include them. If there is nothing to save, do not apply an older stash. Keep the stash until you have verified restoration.
- Consequences: Keeps a branch reference and a stash. --index attempts to restore staged state as well as working files. Ignored files and submodule contents are outside this snapshot.
- Verify: Compare file contents, git diff and git diff --staged with the starting state; verify untracked files and the stash entry. Keep the stash; no drop or clear is included.
- Failure/limits: If application conflicts, stop and preserve the stash. Do not repeatedly apply it. A stash is not an external backup and may contain credentials.
- Documentation: https://git-scm.com/docs/git-stash

## unstage

- Meaning: The next commit should exclude this file’s staged changes.
- Preconditions: Require an existing HEAD and no unmerged index or active operation. Inspect staged and unstaged diffs. If staged content differs from disk and must be kept, save it separately first.
- Consequences: Copies the HEAD version into the index for this path. The working file is unchanged; a distinct staged-only version is replaced.
- Verify: Compare the working file with its previous contents and inspect git diff and git diff --staged.
- Failure/limits: For an unborn branch or conflicted path, stop and inspect status; this recipe does not cover those states.
- Documentation: https://git-scm.com/docs/git-restore

## discard

- Meaning: You deliberately want this working file to match its index version.
- Preconditions: Inspect git diff -- "FILE" and git diff --staged -- "FILE" first. Copy needed file contents outside the repository. Confirm the path and no operation/conflict is active. Git cannot recover never-saved edits.
- Consequences: Replaces the working file with the staged/index version, which may differ from HEAD. No whole-directory discard is included.
- Verify: git diff -- "FILE" must be empty; staged changes remain. Inspect actual file contents.
- Failure/limits: If you need discarded unsaved edits, check editor history or external backups. A backup branch alone does not contain them.
- Documentation: https://git-scm.com/docs/git-restore

## rewind

- Meaning: Keep the latest commit’s changes in the index while moving the branch back one parent.
- Preconditions: Only for an unpublished non-merge tip with a parent, clean index and working tree, and no operation in progress. Do not use this for secret cleanup. Save a unique local backup branch first; do not publish backups containing sensitive history.
- Consequences: Moves the branch one commit back. The original tip is referenced by BACKUP_BRANCH and its file snapshot remains staged.
- Verify: HEAD equals the original parent; files match the old tip; git diff --staged shows exactly that commit’s changes.
- Failure/limits: Stop for a root commit, merge commit, dirty state or shared history. Do not chain amend as an alternative in this sequence.
- Documentation: https://git-scm.com/docs/git-reset

## revert

- Meaning: Create an inverse commit while keeping the original shared history.
- Preconditions: Require a clean index and working tree with no operation in progress. Inspect COMMIT_ID and confirm it is a non-merge commit on the intended branch. Review and test the result before publishing through your team’s normal review process.
- Consequences: Adds a new commit, or pauses on conflicts. The original remains reachable. This does not remove secrets from history.
- Verify: Inspect git log -1 --stat and the resulting file contents; run project checks. Confirm the original commit is still in history.
- Failure/limits: If conflicted, inspect git status; use revert-specific continuation after resolution. Aborting discards revert resolutions. Merge commits need a separate mainline-parent decision.
- Documentation: https://git-scm.com/docs/git-revert

## init

- Meaning: Track an existing project folder that is not already a repository.
- Preconditions: Confirm the directory is the intended project and is not inside another repository. Create .gitignore in your editor before staging. Inspect files for credentials. Choose INITIAL_BRANCH deliberately; configure author identity if needed. Stop if git init reports an existing repository.
- Consequences: Creates a local repository and records selected files. Nothing is published.
- Verify: git status and git log -1 --stat must show the expected branch, commit and file selection. Confirm sensitive files were excluded.
- Failure/limits: If any step fails, stop before staging or committing more files. Do not initialize a second repository inside an existing one.
- Documentation: https://git-scm.com/docs/git-init

## clone

- Meaning: Create a local checkout from a reviewed repository URL.
- Preconditions: Verify REPOSITORY_URL, read access and an unused CLONE_DIRECTORY. Do not embed credentials in URLs or clone an untrusted project to run its code automatically.
- Consequences: Downloads available history and checks out the remote default branch. Shallow/partial server history and permissions can limit available objects.
- Verify: Inspect the remote URL, checked-out branch and expected files in CLONE_DIRECTORY.
- Failure/limits: If cloning fails, inspect the exact access or path error. Do not delete or overwrite an existing destination.
- Documentation: https://git-scm.com/docs/git-clone

## stage

- Meaning: A commit records the staged snapshot, which can differ from current working files.
- Preconditions: Confirm the intended branch, no active operation, and which changes already exist in the index. Inspect the selected file for credentials. This commit includes every staged path, not just FILE.
- Consequences: Creates a commit from all staged changes. Unstaged and untracked work is excluded.
- Verify: git log -1 --stat and git status must agree with the intended snapshot and any remaining edits. Run project checks.
- Failure/limits: If unexpected paths are staged, stop and follow the unstage recipe before committing. If a hook changes files, inspect the final commit and remaining work.
- Documentation: https://git-scm.com/docs/git-commit

## branch

- Meaning: A branch names a commit; uncommitted changes remain in the same working directory.
- Preconditions: Require an existing commit, no active operation, and an unused NEW_BRANCH. Inspect dirty work; a new branch does not snapshot or isolate it. Confirm the current commit is the intended starting point.
- Consequences: Adds a branch reference at the current commit and attaches HEAD to it. Files and the index remain in place.
- Verify: git branch --show-current must print NEW_BRANCH. Compare HEAD and file/index state with the starting state.
- Failure/limits: Choose another unused name if creation fails. Never use -C or -f to overwrite an existing branch as a shortcut.
- Documentation: https://git-scm.com/docs/git-switch

## worktree

- Meaning: A second worktree lets you inspect an existing branch without switching this directory.
- Preconditions: Confirm TARGET_BRANCH exists and is not checked out in another worktree. WORKTREE_PATH must be an unused directory, preferably outside this checkout. Inspect git worktree list first.
- Consequences: Creates a second working directory sharing objects and refs with this repository. It is not an independent backup.
- Verify: git worktree list must show the expected path and branch. Inspect its files.
- Failure/limits: If the path or branch is already in use, stop and choose another. Remove a worktree separately only after preserving its dirty and untracked files; never force removal.
- Documentation: https://git-scm.com/docs/git-worktree

## rebasePlan

- Meaning: Interactive rebase changes commit order or combines local commits.
- Preconditions: Require clean index and working tree, no operation in progress, unpublished non-merge commits and a checked BASE_COMMIT before those commits. Make a unique backup branch. Review the todo list before saving; never replay shared history without team agreement.
- Consequences: Replays selected commits with new identities. An editor or a conflict can pause the operation.
- Verify: Review git log, the final file tree and project checks against BACKUP_BRANCH. git status must show no active rebase.
- Failure/limits: For conflicts, follow the confirmed rebase recipe. Aborting is a separate choice that discards resolutions; preserve needed edits first.
- Documentation: https://git-scm.com/docs/git-rebase

## bisect

- Meaning: Bisect narrows down the first bad commit between known good and bad revisions.
- Preconditions: Require a clean index and working tree, no active operation, and tested GOOD_COMMIT/BAD_COMMIT boundaries. Tests must distinguish the regression consistently. Save generated or ignored files separately if checkouts could affect them.
- Consequences: Moves HEAD through candidate revisions; it does not edit commits. Use git bisect good or git bisect bad separately after each actual test; do not copy both.
- Verify: Reproduce the regression at the reported first bad commit and verify its parent is good. After reset, compare HEAD and work with the starting state.
- Failure/limits: If a test cannot run, use a deliberate skip or stop the search. A changing or incorrect test invalidates the result.
- Documentation: https://git-scm.com/docs/git-bisect

## tag

- Meaning: A tag gives a checked commit a release name.
- Preconditions: Confirm RELEASE_TAG is unused and HEAD is the exact tested release commit. Inspect git tag --list and project checks. Tags can be moved; coordinate with users rather than rewriting a published tag.
- Consequences: Adds a local annotated tag. It does not publish every local tag.
- Verify: git rev-parse "RELEASE_TAG^{}" must equal the intended release commit. Inspect git show "RELEASE_TAG". Publish this single tag to a checked remote only after review.
- Failure/limits: If the tag exists, stop. Do not force-replace it or push --tags as a shortcut.
- Documentation: https://git-scm.com/docs/git-tag

## forceLease

- Meaning: A force update replaces a remote branch tip. An explicit lease checks that the tip has not moved from the hash you reviewed.
- Preconditions: Only for an agreed rewrite of your own review branch. Inspect git ls-remote and fetch the exact REMOTE_BRANCH, review every remote commit and record its full EXPECTED_REMOTE_SHA. Ensure no needed teammate commits will be dropped. Automatic fetches do not constitute review. Confirm LOCAL_BRANCH is the intended replacement.
- Consequences: Replaces the remote tip only if it still equals the reviewed hash. It can deliberately remove commits even with a valid lease; the lease is not proof that the history is appropriate.
- Verify: git ls-remote --heads "REMOTE" "REMOTE_BRANCH" must equal the intended local branch hash. Check the review diff and retained commits.
- Failure/limits: If the lease rejects, stop and inspect the new remote history. Do not refresh the expected hash and retry blindly. Never use this to bypass protected-branch rules.
- Documentation: https://git-scm.com/docs/git-push

## cherryPick

- Meaning: Cherry-pick creates a new commit from another commit’s changes.
- Preconditions: Require a clean index and working tree, no operation in progress, the correct target branch already checked out, and a reviewed non-merge COMMIT_ID. Check dependencies on other commits before applying it.
- Consequences: Adds a commit on the current branch or pauses with conflicts. It does not switch branches or also abort.
- Verify: Review git log -1 --stat, file contents and project checks. git status must show no cherry-pick in progress.
- Failure/limits: If conflicts occur, stop and resolve using cherry-pick-specific continuation, or separately choose abort after preserving needed resolutions. Do not run merge --continue or rebase --continue.
- Documentation: https://git-scm.com/docs/git-cherry-pick

## sensitive

- Meaning: An untracked filename resembles local configuration or a private key. The name does not prove its contents are secret, nor that it never appeared in history.
- Preconditions: Inspect the actual file locally. Do not paste credentials here. Confirm it is genuinely untracked, whether it belongs in the project, and whether any credential has already been exposed. Rotate a credential when exposure cannot be excluded.
- Consequences: Inspection alone changes no tracked files. An ignore rule prevents normal accidental staging of matching untracked files; it does not untrack files or remove secrets from earlier history.
- Verify: The intended file remains on disk, git ls-files prints no path, and git check-ignore identifies the intended rule. Review all matching paths before staging .gitignore.
- Failure/limits: If the file is already tracked or exists in secret-bearing history, ignoring it is insufficient. Follow the separate secret-history guidance when scanning evidence or local inspection establishes a credential.
- Documentation: https://git-scm.com/docs/gitignore

## sync

- Meaning: For everyday updates, fetch the selected remote, inspect the relationship to its tracking branch, then accept only a fast-forward. This workflow does not reconcile diverged histories.
- Preconditions: Require the intended named branch, a clean index and working tree, and no active operation. Check REMOTE, BRANCH and its fetched UPSTREAM_REF; do not assume origin or main. If both sides have unique commits, stop and use the separate divergence guidance below. Inspect every outgoing commit for credentials and run project checks before publishing.
- Consequences: Fetch refreshes remote-tracking references. The fast-forward step advances the current branch only when histories permit it; existing local commits are retained. The optional push publishes the reviewed commits. No merge commit, rebase or force update is chosen automatically.
- Verify: The checked remote branch hash must match the intended HEAD after any push. Inspect the resulting files and history and confirm the index and working tree remain clean.
- Failure/limits: If histories have diverged, stop and inspect the separate divergence recipe. If permissions, policy, credentials or a concurrent update reject the push, use the exact rejection to choose the next step; do not force-push.
- Documentation: https://git-scm.com/docs/git-merge

## Evidence boundaries

The consistency suite executes authored commands in disposable repositories and local bare remotes. It verifies actual staged diff content, outgoing-secret patches after fetch, preservation and commit reachability, including routine fast-forward updates and divergence rejection. Snapshot command text also runs in PowerShell and Git Bash. Provider rule engines, authentication services, real credential rotation, interactive-editor variations, other browsers and full accessibility certification are not reproduced. Ignored files, submodule work and external files require separate preservation. Earlier/published/merge/uncertain secret history is not automatically cleaned.
