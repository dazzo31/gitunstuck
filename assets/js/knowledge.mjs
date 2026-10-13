// Bundled trusted definitions. Never store pasted/user text here.
const knowledge = {
  "undoSolutions": {
    "unstaged": {
      "title": "Discard Uncommitted Edits in Working Tree",
      "scope": "Working Tree",
      "riskBadge": "<span class=\"badge badge-risk-caution\">Effects: Data loss potential</span>",
      "desc": "You intend to discard unstaged edits to a tracked file. Inspect git diff and git diff --staged, and preserve wanted edits first.",
      "code": "# Discard unstaged edits in a specific file:\ngit restore <filename>\n\n# Or discard all unstaged edits in current directory:\ngit restore .",
      "effect": "Overwrites the working file with the index version, which may differ from HEAD. Unstaged edits can be lost.",
      "verify": "Run git status — the file will no longer be listed under \"Changes not staged for commit\".",
      "warning": "DATA LOSS: Git cannot guarantee recovery of discarded unstaged edits. Stop if conflicts or another Git operation are in progress. Copy out wanted work first."
    },
    "staged": {
      "title": "Unstage Files (Remove from Cart) Without Losing Edits",
      "scope": "Staging Area (Index)",
      "riskBadge": "<span class=\"badge badge-risk-safe\">Effects: Local change</span>",
      "desc": "You ran git add, but you are not ready to commit this file yet. You want to preserve your code edits in the file.",
      "code": "# Unstage a specific file:\ngit restore --staged <filename>\n\n# Or unstage everything:\ngit restore --staged .",
      "effect": "Removes the file snapshot from the staging index. Your working code edits on disk remain 100% untouched.",
      "verify": "Run git diff --staged and git diff to confirm intended index and working-file changes.",
      "warning": "Working files are preserved. This HEAD-based recipe requires an existing commit; a new empty repository needs different unstaging guidance."
    },
    "local-commit": {
      "title": "Rewind or Amend a Local Commit (Not Pushed)",
      "scope": "Local History",
      "riskBadge": "<span class=\"badge badge-risk-caution\">Effects: History rewrite</span>",
      "desc": "The affected commits are verified unshared; choose rewind or amend after inspecting the intended result.",
      "code": "# Option A: Rewind 1 commit and keep changes staged in cart:\ngit reset --soft HEAD~1\n\n# Option B: Add a forgotten file to the previous commit:\ngit add <forgotten-file>\ngit commit --amend --no-edit",
      "effect": "Choose one outcome: soft reset moves HEAD back while keeping index/worktree; amend replaces the latest commit using all staged content. Both rewrite history.",
      "verify": "Run git status and git log -1 to inspect the adjusted commit history.",
      "warning": "HISTORY REWRITE: Verify the target and that affected commits are not shared. HEAD~1 requires a parent commit. Amend records all staged content, so review git diff --staged first. Do not run both alternatives as one sequence."
    },
    "pushed-commit": {
      "title": "Revert an Ordinary Shared Commit",
      "scope": "Remote / Shared History",
      "riskBadge": "<span class=\"badge badge-risk-caution\">Effects: Local change; remote publish after review</span>",
      "desc": "The faulty commit has already been pushed to GitHub. Rewriting history with reset would break teammates' branches.",
      "code": "# 1. Inspect status and select an ordinary commit:\ngit status\ngit log -n 5 --oneline\n\n# 2. With a clean tree, create an inverse commit:\ngit revert <commit-id>\n\n# 3. Inspect and test BEFORE publishing:\ngit status\ngit log -1\n# Publish separately using your verified remote/branch.",
      "effect": "Creates a NEW commit that applies the exact opposite changes. History remains forward-moving and clean.",
      "verify": "Run git log -1 to see the new revert commit, then push to upstream.",
      "warning": "Revert can conflict. Inspect git status, resolve and stage intended files, then git revert --continue; or git revert --abort. Merge commits require an explicit mainline decision. Test the result before publishing."
    },
    "lost-reflog": {
      "title": "Resurrect a Lost Commit or Deleted Branch via Reflog",
      "scope": "Local Reflog Ledger",
      "riskBadge": "<span class=\"badge badge-risk-safe\">Effects: Local change; inspect prerequisites</span>",
      "desc": "You accidentally ran reset --hard, deleted a branch with unmerged work, or lost a detached commit.",
      "code": "# 1. Find a retained commit ID:\ngit reflog -n 15\n\n# 2. Inspect the chosen commit:\ngit show <commit-id>\n\n# 3. Preserve it without switching your working tree:\ngit branch rescue-branch <commit-id>",
      "effect": "Makes a retained commit reachable through a new branch. No working-tree switch is required; object availability and expiry vary.",
      "verify": "Run git log -1 rescue-branch to verify your recovered work is intact.",
      "warning": "Reflogs are local and may expire. They do not guarantee recovery of discarded unstaged edits. Verify the chosen ID and use an unused rescue branch name."
    }
  },
  "graphScenarios": {
    "linear": {
      "name": "Daily Save Points (git commit)",
      "command": "git commit -m \"feat: login button\"",
      "svg": "<svg viewBox=\"0 0 760 190\" class=\"graph-svg\" aria-label=\"Daily Save Points Visual Timeline\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-green\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-green)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"24\" text-anchor=\"middle\" class=\"graph-hint-text\">← Breadcrumb trail: each save point remembers the checkpoint that came before it ←</text>\n          <line x1=\"300\" y1=\"95\" x2=\"170\" y2=\"95\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"490\" y1=\"95\" x2=\"360\" y2=\"95\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-green)\"/>\n          <circle cx=\"140\" cy=\"95\" r=\"24\" class=\"node-circle-base\"/>\n          <text x=\"140\" y=\"100\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <text x=\"140\" y=\"136\" text-anchor=\"middle\" class=\"node-text-desc\">Started project</text>\n          <circle cx=\"330\" cy=\"95\" r=\"24\" class=\"node-circle-base\"/>\n          <text x=\"330\" y=\"100\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <text x=\"330\" y=\"136\" text-anchor=\"middle\" class=\"node-text-desc\">Added page layout</text>\n          <circle cx=\"520\" cy=\"95\" r=\"24\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"3.5\"/>\n          <text x=\"520\" y=\"100\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"520\" y=\"136\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--accent-green)\">feat: login button</text>\n          <rect x=\"475\" y=\"44\" width=\"90\" height=\"22\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"520\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-green)\">main branch</text>\n          <rect x=\"585\" y=\"44\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"622\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"585\" y1=\"55\" x2=\"568\" y2=\"55\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>Created checkpoint c3:</strong> Git saved a snapshot of your files and linked it to c2.",
        "<strong>Your main bookmark slid forward:</strong> Git automatically moved the <code>main</code> label to c3 so you never lose your spot.",
        "<strong>HEAD is your camera lens:</strong> <code>HEAD</code> just means \"what you are currently looking at\". Right now, you are looking at your main branch.",
        "<strong>Why arrows point backwards:</strong> Like breadcrumbs in a trail, each save point links back to where you came from."
      ],
      "rule": "Branches are not giant duplicate folders on your hard drive — they are just tiny sticky notes pointing to your latest save point."
    },
    "branch": {
      "name": "Create a branch reference",
      "command": "git switch -c feature/login && git commit -m \"add password reset\"",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Branch Sandbox Visual Timeline\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-green\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-green)\"/>\n            </marker>\n            <marker id=\"arrow-purple\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-purple)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"22\" text-anchor=\"middle\" class=\"graph-hint-text\">← Safe sandbox: experiment on your branch without touching the working main branch ←</text>\n          <line x1=\"250\" y1=\"125\" x2=\"150\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"430\" y1=\"125\" x2=\"310\" y2=\"125\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-green)\"/>\n          <path d=\"M 435 60 C 370 60, 340 100, 305 118\" fill=\"none\" stroke=\"var(--accent-purple)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-purple)\"/>\n          <circle cx=\"120\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"120\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <text x=\"120\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">Initial</text>\n          <circle cx=\"280\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"280\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <text x=\"280\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">Shared base</text>\n          <circle cx=\"460\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"3\"/>\n          <text x=\"460\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"460\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">main progress</text>\n          <circle cx=\"460\" cy=\"55\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-purple)\" stroke-width=\"3.5\"/>\n          <text x=\"460\" y=\"60\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-purple)\">c4</text>\n          <text x=\"460\" y=\"90\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--accent-purple)\">experimental feature</text>\n          <rect x=\"500\" y=\"114\" width=\"70\" height=\"22\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"535\" y=\"129\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"500\" y=\"44\" width=\"105\" height=\"22\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"552\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"625\" y=\"44\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"662\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"625\" y1=\"55\" x2=\"608\" y2=\"55\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>A named reference:</strong> A branch points to a commit and moves when you commit on it.",
        "<strong>Attached HEAD:</strong> HEAD names the branch you are currently using.",
        "<strong>One working directory:</strong> Normal branches share working files. Uncommitted changes can carry across or block switches.",
        "<strong>Separate folders:</strong> Use a worktree when you need a separate checkout, and preserve work before removing anything."
      ],
      "rule": "A branch names a line of history. It does not automatically isolate uncommitted files."
    },
    "merge": {
      "name": "Merging (Combining Your Work)",
      "command": "git switch main && git merge feature/login",
      "svg": "<svg viewBox=\"0 0 760 220\" class=\"graph-svg\" aria-label=\"Merging Work Visual Timeline\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-blue\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-blue)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\">← Checkpoint c5 brings both sets of work together safely ←</text>\n          <line x1=\"180\" y1=\"110\" x2=\"110\" y2=\"110\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 320 155 C 270 155, 250 125, 225 115\" fill=\"none\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 320 65 C 270 65, 250 95, 225 105\" fill=\"none\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 495 110 C 440 110, 410 145, 370 152\" fill=\"none\" stroke=\"var(--accent-blue)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-blue)\"/>\n          <path d=\"M 495 110 C 440 110, 410 75, 370 68\" fill=\"none\" stroke=\"var(--accent-blue)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-blue)\"/>\n          <circle cx=\"85\" cy=\"110\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"85\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"205\" cy=\"110\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"205\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <circle cx=\"345\" cy=\"155\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\"/>\n          <text x=\"345\" y=\"160\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <circle cx=\"345\" cy=\"65\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-purple)\" stroke-width=\"2.5\"/>\n          <text x=\"345\" y=\"70\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-purple)\">c4</text>\n          <circle cx=\"520\" cy=\"110\" r=\"24\" class=\"node-circle-base\" stroke=\"var(--accent-blue)\" stroke-width=\"3.5\"/>\n          <text x=\"520\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-blue)\">c5</text>\n          <text x=\"520\" y=\"146\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--accent-blue)\">Combined together!</text>\n          <rect x=\"300\" y=\"24\" width=\"90\" height=\"20\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"345\" y=\"38\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"560\" y=\"99\" width=\"60\" height=\"22\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"590\" y=\"114\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"640\" y=\"99\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"677\" y=\"114\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"640\" y1=\"110\" x2=\"624\" y2=\"110\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>Inspect both histories:</strong> Verify the target and project integration policy.",
        "<strong>This illustrated case:</strong> A successful non-fast-forward merge creates c5 with two parents.",
        "<strong>Other outcomes:</strong> A merge can fast-forward or stop on conflicts; this picture does not predict every case.",
        "<strong>Verify content:</strong> Inspect the resulting tree and run tests before publishing or deleting refs."
      ],
      "rule": "Merging integrates ancestry; the resulting files still need review."
    },
    "rebase": {
      "name": "Rebase (Straighten Your Timeline)",
      "command": "git switch feature/login && git rebase main",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Rebase Straight Timeline Visual\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-green\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-green)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\">← Rebase moves your work to the front of the line so your project history is a simple straight line ←</text>\n          <line x1=\"200\" y1=\"120\" x2=\"115\" y2=\"120\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"355\" y1=\"120\" x2=\"255\" y2=\"120\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-green)\"/>\n          <line x1=\"510\" y1=\"120\" x2=\"410\" y2=\"120\" stroke=\"var(--git-orange)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-orange)\"/>\n          <path d=\"M 235 60 C 235 85, 235 95, 235 98\" fill=\"none\" class=\"graph-edge-base\" stroke-dasharray=\"3,3\" opacity=\"0.4\" marker-end=\"url(#arrow)\"/>\n          <circle cx=\"90\" cy=\"120\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"90\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"235\" cy=\"120\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"235\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <circle cx=\"235\" cy=\"45\" r=\"18\" class=\"node-circle-base\" stroke-dasharray=\"3,3\" opacity=\"0.4\"/>\n          <text x=\"235\" y=\"50\" text-anchor=\"middle\" class=\"node-text-title\" opacity=\"0.6\">c4</text>\n          <text x=\"235\" y=\"75\" text-anchor=\"middle\" class=\"node-text-desc\" opacity=\"0.6\">Old draft</text>\n          <circle cx=\"380\" cy=\"120\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\"/>\n          <text x=\"380\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"380\" y=\"155\" text-anchor=\"middle\" class=\"node-text-desc\">main progress</text>\n          <circle cx=\"535\" cy=\"120\" r=\"24\" class=\"node-circle-base\" stroke=\"var(--git-orange)\" stroke-width=\"3.5\"/>\n          <text x=\"535\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--git-orange)\">c4'</text>\n          <text x=\"535\" y=\"155\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--git-orange)\">replayed at front</text>\n          <rect x=\"345\" y=\"80\" width=\"70\" height=\"20\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"380\" y=\"94\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"480\" y=\"52\" width=\"110\" height=\"22\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"535\" y=\"67\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"610\" y=\"52\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"647\" y=\"67\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"610\" y1=\"63\" x2=\"593\" y2=\"63\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>A selected base:</strong> c3 is the inspected new base in this example.",
        "<strong>Replayed change:</strong> The selected patch becomes c4' with different ancestry and identity.",
        "<strong>Possible conflicts:</strong> Replaying can stop and require a correct resolution.",
        "<strong>Changed reference:</strong> The branch points to the new sequence; old objects may remain retained locally."
      ],
      "rule": "Rebase unshared work deliberately; coordinate any exceptional shared rewrite."
    },
    "detached": {
      "name": "Looking at the Past (Detached HEAD State)",
      "command": "git switch --detach <hash-c2>",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Detached HEAD Time Travel Visual\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-red\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-red)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\" fill=\"var(--accent-amber)\">Viewing a historical commit without an attached branch. Preserve wanted work before switching.</text>\n          <line x1=\"260\" y1=\"125\" x2=\"160\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"460\" y1=\"125\" x2=\"340\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 300 70 C 300 90, 300 95, 300 100\" fill=\"none\" stroke=\"var(--accent-red)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-red)\"/>\n          <circle cx=\"130\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"130\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"300\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-amber)\" stroke-width=\"3\"/>\n          <text x=\"300\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-amber)\">c2</text>\n          <text x=\"300\" y=\"160\" text-anchor=\"middle\" class=\"node-text-desc\">inspecting past checkpoint</text>\n          <circle cx=\"490\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"3\"/>\n          <text x=\"490\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"490\" y=\"160\" text-anchor=\"middle\" class=\"node-text-desc\">main (today's work)</text>\n          <rect x=\"460\" y=\"80\" width=\"60\" height=\"20\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"490\" y=\"94\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <circle cx=\"300\" cy=\"48\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-red)\" stroke-width=\"3\"/>\n          <text x=\"300\" y=\"53\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-red)\">exp</text>\n          <rect x=\"345\" y=\"36\" width=\"180\" height=\"24\" rx=\"4\" fill=\"rgba(248, 113, 113, 0.18)\" stroke=\"var(--accent-red)\" stroke-width=\"1.5\"/>\n          <text x=\"435\" y=\"52\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-red)\">HEAD (Viewing without bookmark)</text>\n          <line x1=\"345\" y1=\"48\" x2=\"324\" y2=\"48\" stroke=\"var(--accent-red)\" stroke-width=\"2\" marker-end=\"url(#arrow-red)\"/>\n        </svg>",
      "bullets": [
        "<strong>Direct HEAD:</strong> HEAD points to a commit instead of through a branch.",
        "<strong>Normal inspection:</strong> Reading a historical commit is a valid use of detached HEAD.",
        "<strong>Retain wanted commits:</strong> Verify the commit and create an unused branch before switching away.",
        "<strong>Preserve edits separately:</strong> A branch reference does not record uncommitted files. Use your verified destination branch."
      ],
      "rule": "Detached HEAD does not imply damage. Preserve wanted committed and uncommitted work appropriately."
    }
  },
  "pipelineConfigs": {
    "github": {
      "title": "GitHub Actions (.github/workflows/ci.yml)",
      "code": "# Test-only example: Node 24 project, lockfile and npm test required.\n# .github/workflows/ci.yml\nname: Test\non: [push, pull_request]\npermissions:\n  contents: read\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"24\"\n      - run: npm ci\n      - run: npm test"
    },
    "gitlab": {
      "title": "GitLab CI/CD (.gitlab-ci.yml)",
      "code": "# Test-only example: Node 24 project, lockfile and npm test required.\n# .gitlab-ci.yml\nimage: node:24\nstages:\n  - test\ntest-job:\n  stage: test\n  script:\n    - npm ci\n    - npm test"
    },
    "bitbucket": {
      "title": "Bitbucket Pipelines (bitbucket-pipelines.yml)",
      "code": "# Test-only example: Node 24 project, lockfile and npm test required.\n# bitbucket-pipelines.yml (Bitbucket Cloud)\nimage: node:24\npipelines:\n  default:\n    - step:\n        name: Test\n        script:\n          - npm ci\n          - npm test"
    }
  },
  "commands": [
    {
      "id": "card-init-snippet-1",
      "syntax": "git init -b <initial-branch>\ngit status\n# Create or edit a file, then stage only that intended file:\ngit add -- <filename>\ngit diff --staged\ngit commit -m \"Initial commit\"",
      "minimumGit": "2.28",
      "requiredParameters": [
        "initial-branch",
        "remote",
        "repository-url"
      ],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Choose the intended project folder. Check that it is not already inside another repository. Choose an initial branch name and configure your Git author name/email; Git 2.28+ supports init -b."
      ],
      "verification": [
        "git status should identify your chosen branch. git log -1 --stat should show the intended first commit and files. Unstaged or untracked files may still remain; a completely clean tree is not required for a successful selected-file commit."
      ],
      "sources": [
        "https://git-scm.com/docs/git-init"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-clone-snippet-1",
      "syntax": "git clone <repository-url> <new-folder>\ncd <new-folder>\ngit status\ngit remote -v\ngit branch -a",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Copy the clone URL from the intended host and confirm you have read access. Choose a new destination folder. You do not need an existing local Git repository."
      ],
      "verification": [
        "Check that the folder, configured remote URL and checked-out branch match the intended project. An empty remote can produce an unborn branch without a commit."
      ],
      "sources": [
        "https://git-scm.com/docs/git-clone"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-stage-snippet-1",
      "syntax": "git status\ngit diff\ngit add -- <filename>\ngit diff --staged\ngit commit -m \"Describe the change\"\ngit log -1 --stat\ngit status",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Use an existing repository on the intended branch, with a file you have edited. If this is a new project, start with the repository guide. Set your Git author identity if needed."
      ],
      "verification": [
        "Compare the staged diff before committing with git show --stat HEAD afterwards. Only the intended staged snapshot should be recorded. Other files or later edits can remain uncommitted. No push occurs."
      ],
      "sources": [
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-branch-snippet-1",
      "syntax": "git status\ngit branch --show-current\ngit switch -c <new-branch>\n# Edit and commit your intended changes here.\n# Preserve remaining work before switching:\ngit switch <existing-branch>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "original-branch"
      ],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect status and preserve wanted work before switching. Choose an unused branch name and the correct starting commit."
      ],
      "verification": [
        "After creation, git branch --show-current should report the new name. After switching back, verify the expected branch and inspect status. Existing commits remain reachable through their refs."
      ],
      "sources": [
        "https://git-scm.com/docs/git-switch"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-undo-snippet-1",
      "syntax": "# Start by inspecting; choose an action in the linked help guides:\ngit status\ngit diff\ngit diff --staged\ngit log -n 5 --oneline",
      "minimumGit": "2.28",
      "requiredParameters": [
        "filename",
        "commit-id"
      ],
      "effects": [
        "local-change",
        "history-rewrite",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Identify whether the change is unstaged, staged or committed. Inspect both diffs, commit ownership and any operation already in progress."
      ],
      "verification": [
        "Define the intended outcome first: edits kept but unstaged, selected edits discarded, or an inverse commit recorded. Verify the corresponding index, working file or commit afterwards."
      ],
      "sources": [
        "https://git-scm.com/docs/git-restore"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-sync-snippet-1",
      "syntax": "git status\ngit remote -v\ngit branch -vv\ngit fetch <remote>\ngit log --oneline --graph --decorate --all -n 20\n# Choose integration only after inspecting the fetched history.\n# Publish separately after testing and verifying the destination.",
      "minimumGit": "2.28",
      "requiredParameters": [
        "remote",
        "upstream-branch",
        "branch-name"
      ],
      "effects": [
        "local-change",
        "history-rewrite",
        "remote-publish"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect the actual remote and tracking branch. Preserve local work. Check the team’s integration policy and whether your commits are shared."
      ],
      "verification": [
        "Inspect the fetched tracking ref and graph. After deliberate integration, check the intended history/files and run project tests. Verify the destination separately after publishing."
      ],
      "sources": [
        "https://git-scm.com/docs/git-fetch"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-pipeline-snippet-1",
      "syntax": "# Test-only example: Node 24 project, lockfile and npm test required.\n# .github/workflows/ci.yml\nname: Test\non: [push, pull_request]\npermissions:\n  contents: read\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"24\"\n      - run: npm ci\n      - run: npm test",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect git status and both diffs; preserve wanted work.",
        "Verify repository-specific branch, remote and target values."
      ],
      "verification": [
        "Inspect git status and relevant commits/refs after the selected action."
      ],
      "sources": [
        "https://docs.github.com/en/actions"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-stash-snippet-1",
      "syntax": "git status\ngit stash push -u -m \"Work in progress\"\n# Inspect status before switching to an existing branch:\ngit switch <other-branch>\n# Finish/preserve that work, then return:\ngit switch <original-branch>\ngit stash list\ngit stash apply <stash-reference>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "original-branch",
        "stash-reference"
      ],
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect tracked, staged, untracked and ignored work. Identify the original branch and intended stash. Preserve important work separately."
      ],
      "verification": [
        "Inspect restored file contents, git diff and git diff --staged. The intended stash should still be listed after apply. Do not assume status is clean or the staged arrangement was recreated."
      ],
      "sources": [
        "https://git-scm.com/docs/git-stash"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-conflict-snippet-1",
      "syntax": "git status\ngit diff --name-only --diff-filter=U\n# Edit and test the intended final contents.\ngit add -- <resolved-file>\ngit status\n# For an identified merge with all paths resolved:\ngit merge --continue",
      "minimumGit": "2.28",
      "requiredParameters": [
        "<<<<<< HEAD\nconst apiEndpoint = \"https://api.v2.internal\";\n=======\nconst apiEndpoint = \"https://api.v3.production\";\n"
      ],
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Read full git status to identify a merge. Rebase, cherry-pick and revert have their own continuation commands. Preserve wanted work and inspect every unmerged path."
      ],
      "verification": [
        "No unmerged paths should remain. Inspect the merge commit’s parents and tree, and test the intended combined changes. Re-paste fresh status if using guided checks."
      ],
      "sources": [
        "https://docs.github.com/en/actions"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-conflict-snippet-2",
      "syntax": "git status\ngit diff --name-only --diff-filter=U",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Read full git status to identify a merge. Rebase, cherry-pick and revert have their own continuation commands. Preserve wanted work and inspect every unmerged path."
      ],
      "verification": [
        "No unmerged paths should remain. Inspect the merge commit’s parents and tree, and test the intended combined changes. Re-paste fresh status if using guided checks."
      ],
      "sources": [
        "https://git-scm.com/docs/git-add"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-rebase-snippet-1",
      "syntax": "git status\ngit log --oneline -n 6\n# Only if the inspected private sequence has this ancestor:\ngit rebase -i HEAD~3\n# Resolve and stage conflicts before rebase --continue.\n# If cancellation is intended, inspect rebase --abort guidance.",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "history-rewrite",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Verify the selected commits have the needed ancestor and are unshared. Preserve work, inspect history and agree any collaboration policy before rewriting."
      ],
      "verification": [
        "Inspect the resulting graph, intended file tree and project tests. Confirm the selected changes remain present in the intended order; do not publish rewritten history automatically."
      ],
      "sources": [
        "https://git-scm.com/docs/git-rebase"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-detached-snippet-1",
      "syntax": "git status\ngit log -1 --oneline\ngit branch --list\n# Use an unused name and verified commit ID:\ngit branch <rescue-name> <verified-commit-id>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "existing-branch"
      ],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect HEAD and any uncommitted changes. If you created commits while detached, verify their IDs before switching elsewhere."
      ],
      "verification": [
        "git log -1 <rescue-name> should identify the intended commit. Inspect its files. Branch creation alone does not switch working files or save uncommitted edits."
      ],
      "sources": [
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-worktree-snippet-1",
      "syntax": "git worktree list\ngit worktree add <new-folder> <available-branch>\n# Work in the new folder and preserve its changes.\ngit worktree list\n# Remove only after confirming its work is no longer needed:\ngit worktree remove <new-folder>",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect current worktrees and branch use. Choose a new folder and an existing branch not already checked out elsewhere."
      ],
      "verification": [
        "Check the registered path and checked-out branch in worktree list, then inspect status inside that folder. Before removal verify its work is committed/preserved."
      ],
      "sources": [
        "https://git-scm.com/docs/git-worktree"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-reflog-snippet-1",
      "syntax": "git reflog -n 20\ngit show <verified-commit-id>\ngit branch <unused-rescue-name> <verified-commit-id>\ngit log -1 <unused-rescue-name>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "verified-commit-id"
      ],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "This is committed-work recovery. Confirm the object still exists locally and choose an unused rescue branch name. Reflogs are local and may expire."
      ],
      "verification": [
        "Confirm the rescue branch points to the selected commit and inspect its tree for the wanted content. A new ref makes that retained commit reachable; it does not restore arbitrary disk edits."
      ],
      "sources": [
        "https://git-scm.com/docs/git-reflog"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-bisect-snippet-1",
      "syntax": "git bisect start\ngit bisect bad <known-bad-commit>\ngit bisect good <known-good-commit>\n# Test the selected revision, then choose exactly one:\n# git bisect good\n# git bisect bad\n# git bisect skip\n# Finish by returning to the original checkout:\ngit bisect reset\n# A separate attribution example:\ngit blame -L 20,45 -- <filename>",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Preserve work and choose a reproducible test with known good/bad revisions. Bisect checks out intermediate commits; older revisions may need different build dependencies."
      ],
      "verification": [
        "Inspect and reproduce the change identified by bisect; then verify the original checkout after reset. For blame, inspect the relevant commit and context rather than assigning fault."
      ],
      "sources": [
        "https://git-scm.com/docs/git-bisect"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-tag-snippet-1",
      "syntax": "git status\ngit log -1\ngit tag -a <new-tag> <verified-commit-id> -m \"Describe the release\"\ngit show <new-tag>\n# Publish only after verifying the intended remote and policy:\ngit push <remote> refs/tags/<new-tag>\ngit tag --sort=version:refname -n 1",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "remote-publish"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Verify the commit, unused tag name, release policy and actual remote. Semantic versioning is a project convention, not something Git enforces."
      ],
      "verification": [
        "Inspect the tag target and annotation. After authorized publication, verify the exact tag ref on the chosen remote. describe reports a nearby reachable tag, not proof of a release or successful publication."
      ],
      "sources": [
        "https://git-scm.com/docs/git-tag"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-force-lease-snippet-1",
      "syntax": "# Inspect first; no rewrite command is enabled here.\ngit status\ngit branch -vv\ngit remote -v\n# Advanced syntax, after deliberate verification and coordination:\n# git push --force-with-lease=refs/heads/<remote-branch>:<expected-oid> <remote> HEAD:refs/heads/<remote-branch>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "remote-branch",
        "expected-oid",
        "remote"
      ],
      "effects": [
        "history-rewrite",
        "remote-publish",
        "data-loss-potential"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Only consider this for a deliberately coordinated rewrite with verified ownership, target and expected remote OID. Preserve wanted history and understand who relies on the branch."
      ],
      "verification": [
        "After any authorized publication, inspect the actual remote ref and intended history. If a lease fails, stop and investigate the new remote state rather than refreshing the expectation and overwriting it."
      ],
      "sources": [
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-cherry-pick-snippet-1",
      "syntax": "git status\ngit show <ordinary-commit-id>\ngit switch <target-branch>\ngit cherry-pick <ordinary-commit-id>\n# If conflicts occur, resolve/test/stage first.\n# Only then: git cherry-pick --continue\n# To cancel the identified operation: git cherry-pick --abort",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change"
      ],
      "shellNotes": "Replace placeholders; quote paths with spaces. Comment lines use # in Bash/PowerShell; in CMD use REM.",
      "preflight": [
        "Inspect the source commit and intended target branch, preserve work and start with no other operation in progress. Merge commits require additional mainline decisions not covered by this simple example."
      ],
      "verification": [
        "Inspect the resulting commit’s patch and target branch files, and run tests. A new identity may differ from the source; verify content rather than expecting identical hashes."
      ],
      "sources": [
        "https://git-scm.com/docs/git-switch"
      ],
      "reviewed": "2026-10-12"
    }
  ],
  "workflows": [
    {
      "id": "card-init",
      "title": "Start a Git repository",
      "category": "essential",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-init-snippet-1"
      ],
      "prerequisites": [
        "Choose the intended project folder. Check that it is not already inside another repository. Choose an initial branch name and configure your Git author name/email; Git 2.28+ supports init -b."
      ],
      "verification": [
        "git status should identify your chosen branch. git log -1 --stat should show the intended first commit and files. Unstaged or untracked files may still remain; a completely clean tree is not required for a successful selected-file commit."
      ]
    },
    {
      "id": "card-clone",
      "title": "Clone an existing project",
      "category": "essential",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-clone-snippet-1"
      ],
      "prerequisites": [
        "Copy the clone URL from the intended host and confirm you have read access. Choose a new destination folder. You do not need an existing local Git repository."
      ],
      "verification": [
        "Check that the folder, configured remote URL and checked-out branch match the intended project. An empty remote can produce an unborn branch without a commit."
      ]
    },
    {
      "id": "card-stage",
      "title": "Save your first commit",
      "category": "essential",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-stage-snippet-1"
      ],
      "prerequisites": [
        "Use an existing repository on the intended branch, with a file you have edited. If this is a new project, start with the repository guide. Set your Git author identity if needed."
      ],
      "verification": [
        "Compare the staged diff before committing with git show --stat HEAD afterwards. Only the intended staged snapshot should be recorded. Other files or later edits can remain uncommitted. No push occurs."
      ]
    },
    {
      "id": "card-branch",
      "title": "Create and switch branches",
      "category": "branch",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-branch-snippet-1"
      ],
      "prerequisites": [
        "Inspect status and preserve wanted work before switching. Choose an unused branch name and the correct starting commit."
      ],
      "verification": [
        "After creation, git branch --show-current should report the new name. After switching back, verify the expected branch and inspect status. Existing commits remain reachable through their refs."
      ]
    },
    {
      "id": "card-undo",
      "title": "Choose how to undo a change",
      "category": "undo",
      "effects": [
        "local-change",
        "history-rewrite",
        "data-loss-potential"
      ],
      "commands": [
        "card-undo-snippet-1"
      ],
      "prerequisites": [
        "Identify whether the change is unstaged, staged or committed. Inspect both diffs, commit ownership and any operation already in progress."
      ],
      "verification": [
        "Define the intended outcome first: edits kept but unstaged, selected edits discarded, or an inverse commit recorded. Verify the corresponding index, working file or commit afterwards."
      ]
    },
    {
      "id": "card-sync",
      "title": "Fetch, integrate and publish changes",
      "category": "cloud",
      "effects": [
        "local-change",
        "history-rewrite",
        "remote-publish"
      ],
      "commands": [
        "card-sync-snippet-1"
      ],
      "prerequisites": [
        "Inspect the actual remote and tracking branch. Preserve local work. Check the team’s integration policy and whether your commits are shared."
      ],
      "verification": [
        "Inspect the fetched tracking ref and graph. After deliberate integration, check the intended history/files and run project tests. Verify the destination separately after publishing."
      ]
    },
    {
      "id": "card-pipeline",
      "title": "Understand configured CI test jobs",
      "category": "cloud",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-pipeline-snippet-1"
      ],
      "prerequisites": [
        "A project needs tests, a supported runner and a configured host workflow. Check the file path, event triggers, permissions and dependency setup."
      ],
      "verification": [
        "Check whether the intended event produced a job. Read its logs and verify the runner installed the required tools and dependencies. A passing test job does not establish deployment."
      ]
    },
    {
      "id": "card-stash",
      "title": "Temporarily set work aside",
      "category": "essential",
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "commands": [
        "card-stash-snippet-1"
      ],
      "prerequisites": [
        "Inspect tracked, staged, untracked and ignored work. Identify the original branch and intended stash. Preserve important work separately."
      ],
      "verification": [
        "Inspect restored file contents, git diff and git diff --staged. The intended stash should still be listed after apply. Do not assume status is clean or the staged arrangement was recreated."
      ]
    },
    {
      "id": "card-conflict",
      "title": "Resolve an identified merge conflict",
      "category": "branch",
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "commands": [
        "card-conflict-snippet-1",
        "card-conflict-snippet-2"
      ],
      "prerequisites": [
        "Read full git status to identify a merge. Rebase, cherry-pick and revert have their own continuation commands. Preserve wanted work and inspect every unmerged path."
      ],
      "verification": [
        "No unmerged paths should remain. Inspect the merge commit’s parents and tree, and test the intended combined changes. Re-paste fresh status if using guided checks."
      ]
    },
    {
      "id": "card-rebase",
      "title": "Rewrite unshared commits with interactive rebase",
      "category": "pro",
      "effects": [
        "local-change",
        "history-rewrite",
        "data-loss-potential"
      ],
      "commands": [
        "card-rebase-snippet-1"
      ],
      "prerequisites": [
        "Verify the selected commits have the needed ancestor and are unshared. Preserve work, inspect history and agree any collaboration policy before rewriting."
      ],
      "verification": [
        "Inspect the resulting graph, intended file tree and project tests. Confirm the selected changes remain present in the intended order; do not publish rewritten history automatically."
      ]
    },
    {
      "id": "card-detached",
      "title": "Understand detached HEAD and keep your commits",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-detached-snippet-1"
      ],
      "prerequisites": [
        "Inspect HEAD and any uncommitted changes. If you created commits while detached, verify their IDs before switching elsewhere."
      ],
      "verification": [
        "git log -1 <rescue-name> should identify the intended commit. Inspect its files. Branch creation alone does not switch working files or save uncommitted edits."
      ]
    },
    {
      "id": "card-worktree",
      "title": "Use separate working folders with worktrees",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-worktree-snippet-1"
      ],
      "prerequisites": [
        "Inspect current worktrees and branch use. Choose a new folder and an existing branch not already checked out elsewhere."
      ],
      "verification": [
        "Check the registered path and checked-out branch in worktree list, then inspect status inside that folder. Before removal verify its work is committed/preserved."
      ]
    },
    {
      "id": "card-reflog",
      "title": "Find a retained commit with reflog",
      "category": "undo",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-reflog-snippet-1"
      ],
      "prerequisites": [
        "This is committed-work recovery. Confirm the object still exists locally and choose an unused rescue branch name. Reflogs are local and may expire."
      ],
      "verification": [
        "Confirm the rescue branch points to the selected commit and inspect its tree for the wanted content. A new ref makes that retained commit reachable; it does not restore arbitrary disk edits."
      ]
    },
    {
      "id": "card-bisect",
      "title": "Find a regression with bisect; inspect attribution with blame",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-bisect-snippet-1"
      ],
      "prerequisites": [
        "Preserve work and choose a reproducible test with known good/bad revisions. Bisect checks out intermediate commits; older revisions may need different build dependencies."
      ],
      "verification": [
        "Inspect and reproduce the change identified by bisect; then verify the original checkout after reset. For blame, inspect the relevant commit and context rather than assigning fault."
      ]
    },
    {
      "id": "card-tag",
      "title": "Create and publish a release tag",
      "category": "cloud",
      "effects": [
        "local-change",
        "remote-publish"
      ],
      "commands": [
        "card-tag-snippet-1"
      ],
      "prerequisites": [
        "Verify the commit, unused tag name, release policy and actual remote. Semantic versioning is a project convention, not something Git enforces."
      ],
      "verification": [
        "Inspect the tag target and annotation. After authorized publication, verify the exact tag ref on the chosen remote. describe reports a nearby reachable tag, not proof of a release or successful publication."
      ]
    },
    {
      "id": "card-force-lease",
      "title": "Understand an explicit force-push lease",
      "category": "cloud",
      "effects": [
        "history-rewrite",
        "remote-publish",
        "data-loss-potential"
      ],
      "commands": [
        "card-force-lease-snippet-1"
      ],
      "prerequisites": [
        "Only consider this for a deliberately coordinated rewrite with verified ownership, target and expected remote OID. Preserve wanted history and understand who relies on the branch."
      ],
      "verification": [
        "After any authorized publication, inspect the actual remote ref and intended history. If a lease fails, stop and investigate the new remote state rather than refreshing the expectation and overwriting it."
      ]
    },
    {
      "id": "card-cherry-pick",
      "title": "Apply a selected commit with cherry-pick",
      "category": "branch",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-cherry-pick-snippet-1"
      ],
      "prerequisites": [
        "Inspect the source commit and intended target branch, preserve work and start with no other operation in progress. Merge commits require additional mainline decisions not covered by this simple example."
      ],
      "verification": [
        "Inspect the resulting commit’s patch and target branch files, and run tests. A new identity may differ from the source; verify content rather than expecting identical hashes."
      ]
    }
  ]
};
export default knowledge;
