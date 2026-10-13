# Experience content inventory

Canonical records following the 2026-10-13 review. Titles, purpose, prerequisites and verification now live in task-specific data. This inventory is an editorial contract, not a declaration that visual/human acceptance is finished.

## Learning guides

| ID | Title | Purpose |
| --- | --- | --- |
| card-init | Start a Git repository | Track a project that is not already a repository. |
| card-clone | Clone an existing project | Get a local checkout from a verified repository URL. |
| card-stage | Save your first commit | Choose the changes to record, then check the snapshot. |
| card-branch | Create and switch branches | Give a line of work a name and understand what switching changes. |
| card-undo | Choose how to undo a change | Separate unstaging, discarding edits and undoing a commit. |
| card-sync | Fetch, integrate and publish changes | Understand three different operations when working with a remote. |
| card-pipeline | Understand configured CI test jobs | Learn when a host runs tests and what a workflow file does. |
| card-stash | Temporarily set work aside | Save local changes for later without confusing apply and drop. |
| card-conflict | Resolve an identified merge conflict | Decide the final file contents, stage them and finish the merge. |
| card-rebase | Rewrite unshared commits with interactive rebase | Reorder or combine a selected private commit sequence. |
| card-detached | Understand detached HEAD and keep your commits | Inspect a commit directly, or give wanted committed work a branch name. |
| card-worktree | Use separate working folders with worktrees | Check out separate branches without another full clone. |
| card-reflog | Find a retained commit with reflog | Locate committed work that lost a branch reference. |
| card-bisect | Find a regression with bisect; inspect attribution with blame | Use distinct tools for a failing revision and line history. |
| card-tag | Create and publish a release tag | Name a verified commit and publish only the intended tag. |
| card-force-lease | Understand an explicit force-push lease | Review a coordinated history rewrite without treating it as routine sync. |
| card-cherry-pick | Apply a selected commit with cherry-pick | Bring a change onto another branch without merging all its history. |

## Help topics

| ID | Title | Purpose |
| --- | --- | --- |
| unstage | Unstage a file, keep your edits | Undo git add without throwing away working changes. |
| discard | Discard selected unstaged edits | Understand what will be overwritten before choosing discard. |
| amend | Change an unshared latest commit | Review staged content and commit ownership before amend. |
| revert | Undo an ordinary shared commit | Record an inverse commit without rewriting the existing sequence. |
| divergence | My push was rejected | Separate divergence from authentication and branch policy. |
| merge | I have a merge conflict | Identify the operation and decide the correct final files. |
| detached | I am on detached HEAD | Understand this normal state and retain wanted commits. |
| reflog | Find lost committed work | Look for a retained commit; reflog cannot recover every edit. |

## Command definitions

| ID | Title | Purpose |
| --- | --- | --- |
| status | git status | Inspect file and operation state |
| diff | git diff | Compare changes |
| init | git init | Create repository metadata |
| clone | git clone | Create a local checkout |
| add | git add | Stage the intended snapshot |
| commit | git commit | Record staged contents |
| branch | git branch | Inspect or create branch references |
| switch | git switch | Change the current branch |
| restore | git restore | Change index or working-file contents |
| fetch | git fetch | Update remote-tracking information |
| pull | git pull | Fetch and integrate |
| push | git push | Publish to a remote ref |
| remote | git remote | Inspect remote configuration |
| merge | git merge | Integrate another history |
| rebase | git rebase | Replay a commit sequence |
| revert | git revert | Record inverse changes |
| reset | git reset | Move HEAD and optionally index/worktree |
| stash | git stash | Temporarily save selected local work |
| worktree | git worktree | Manage separate working folders |
| reflog | git reflog | Inspect local ref movements |
| bisect | git bisect | Narrow a regression |
| blame | git blame | Inspect line attribution |
| tag | git tag | Name a selected object |
| cherry-pick | git cherry-pick | Apply a selected change |

## Error explanations

| ID | Title | Purpose |
| --- | --- | --- |
| non-fast-forward | Push rejected: non-fast-forward | Cause alternatives + read-only checks; no inferred repair |
| https-auth | HTTPS authentication failed | Cause alternatives + read-only checks; no inferred repair |
| ssh-auth | SSH key rejected | Cause alternatives + read-only checks; no inferred repair |
| write-permission | Remote write access denied | Cause alternatives + read-only checks; no inferred repair |
| not-repository | Outside a Git repository | Cause alternatives + read-only checks; no inferred repair |
| merge-unfinished | A merge is unfinished | Cause alternatives + read-only checks; no inferred repair |
| rebase-unfinished | A rebase is unfinished | Cause alternatives + read-only checks; no inferred repair |
| untracked-overwrite | Untracked files would be overwritten | Cause alternatives + read-only checks; no inferred repair |
| unrelated-histories | Histories have no common ancestor | Cause alternatives + read-only checks; no inferred repair |
| invalid-refspec | Source refspec does not resolve | Cause alternatives + read-only checks; no inferred repair |
| detached-head | HEAD is detached | Cause alternatives + read-only checks; no inferred repair |
| bad-revision | Revision cannot be resolved | Cause alternatives + read-only checks; no inferred repair |
| index-lock | Git index lock already exists | Cause alternatives + read-only checks; no inferred repair |
| no-upstream | Branch has no upstream | Cause alternatives + read-only checks; no inferred repair |
| divergent-pull | Pull needs an integration choice | Cause alternatives + read-only checks; no inferred repair |
| cherry-pick-conflict | Cherry-pick stopped on a conflict | Cause alternatives + read-only checks; no inferred repair |
| rebase-conflict | Rebase stopped applying a commit | Cause alternatives + read-only checks; no inferred repair |
| local-overwrite | Local modifications block a switch or merge | Cause alternatives + read-only checks; no inferred repair |
| push-protection | Push blocked by secret scanning | Cause alternatives + read-only checks; no inferred repair |
| branch-policy | Push rejected by repository policy | Cause alternatives + read-only checks; no inferred repair |
| tag-exists | Tag name already exists | Cause alternatives + read-only checks; no inferred repair |
| credential-helper | Credential helper could not run | Cause alternatives + read-only checks; no inferred repair |
| repository-unavailable | Remote repository is unavailable | Cause alternatives + read-only checks; no inferred repair |
| remote-missing | Named remote is not configured | Cause alternatives + read-only checks; no inferred repair |

## Fixed visual guides

| ID | Title | Purpose |
| --- | --- | --- |
| linear | Daily Save Points (git commit) | Illustration, not simulation |
| branch | Create a branch reference | Illustration, not simulation |
| merge | Merging (Combining Your Work) | Illustration, not simulation |
| rebase | Rebase (Straighten Your Timeline) | Illustration, not simulation |
| detached | Looking at the Past (Detached HEAD State) | Illustration, not simulation |

## Acceptance boundaries

- Guide preparation and expected result are unique, validated fields, not shared scaffolding.
- Help is readable without diagnostic input; personalized mutation guidance retains explicit evidence gates.
- Reference examples name their affected surfaces and link to official Git documentation.
- Error family matching preserves multiple causes and operation ambiguity.
- Branches share working files; commits require explicit recording; reflog does not promise unstaged recovery.
- Provider choice scopes error interpretation. Shell choice scopes code formatting.
- UI labels, static fallback and canonical snippets are checked for parity.
