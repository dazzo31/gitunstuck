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
      "riskBadge": "<span class=\"badge badge-risk-rev\">Effects: Local change; inspect prerequisites</span>",
      "desc": "You committed too early or forgot a file, but you have NOT pushed to GitHub yet.",
      "code": "# Option A: Rewind 1 commit and keep changes staged in cart:\ngit reset --soft HEAD~1\n\n# Option B: Add a forgotten file to the previous commit:\ngit add <forgotten-file>\ngit commit --amend --no-edit",
      "effect": "Moves HEAD back one commit while keeping your staged code ready to edit and re-commit.",
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
      "name": "Branch (Safe Sandbox to Try Ideas)",
      "command": "git switch -c feature/login && git commit -m \"add password reset\"",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Branch Sandbox Visual Timeline\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-green\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-green)\"/>\n            </marker>\n            <marker id=\"arrow-purple\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-purple)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"22\" text-anchor=\"middle\" class=\"graph-hint-text\">← Safe sandbox: experiment on your branch without touching the working main branch ←</text>\n          <line x1=\"250\" y1=\"125\" x2=\"150\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"430\" y1=\"125\" x2=\"310\" y2=\"125\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-green)\"/>\n          <path d=\"M 435 60 C 370 60, 340 100, 305 118\" fill=\"none\" stroke=\"var(--accent-purple)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-purple)\"/>\n          <circle cx=\"120\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"120\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <text x=\"120\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">Initial</text>\n          <circle cx=\"280\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"280\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <text x=\"280\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">Shared base</text>\n          <circle cx=\"460\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"3\"/>\n          <text x=\"460\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"460\" y=\"162\" text-anchor=\"middle\" class=\"node-text-desc\">main progress</text>\n          <circle cx=\"460\" cy=\"55\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-purple)\" stroke-width=\"3.5\"/>\n          <text x=\"460\" y=\"60\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-purple)\">c4</text>\n          <text x=\"460\" y=\"90\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--accent-purple)\">experimental feature</text>\n          <rect x=\"500\" y=\"114\" width=\"70\" height=\"22\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"535\" y=\"129\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"500\" y=\"44\" width=\"105\" height=\"22\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"552\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"625\" y=\"44\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"662\" y=\"59\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"625\" y1=\"55\" x2=\"608\" y2=\"55\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>Created a new sticky note:</strong> <code>git switch -c</code> placed a new bookmark on your project so you can work independently.",
        "<strong>Moved your camera (HEAD):</strong> You are now editing in this safe sandbox branch.",
        "<strong>Commits stay on their named branches:</strong> Uncommitted changes can carry across switches; inspect status first.",
        "<strong>Zero fear of making mistakes:</strong> If your experiment fails, you can discard this branch with zero harm."
      ],
      "rule": "Always create a branch when starting new work. It keeps your main codebase safe while you build and test."
    },
    "merge": {
      "name": "Merging (Combining Your Work)",
      "command": "git switch main && git merge feature/login",
      "svg": "<svg viewBox=\"0 0 760 220\" class=\"graph-svg\" aria-label=\"Merging Work Visual Timeline\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-blue\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-blue)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\">← Checkpoint c5 brings both sets of work together safely ←</text>\n          <line x1=\"180\" y1=\"110\" x2=\"110\" y2=\"110\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 320 155 C 270 155, 250 125, 225 115\" fill=\"none\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 320 65 C 270 65, 250 95, 225 105\" fill=\"none\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 495 110 C 440 110, 410 145, 370 152\" fill=\"none\" stroke=\"var(--accent-blue)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-blue)\"/>\n          <path d=\"M 495 110 C 440 110, 410 75, 370 68\" fill=\"none\" stroke=\"var(--accent-blue)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-blue)\"/>\n          <circle cx=\"85\" cy=\"110\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"85\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"205\" cy=\"110\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"205\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <circle cx=\"345\" cy=\"155\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\"/>\n          <text x=\"345\" y=\"160\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <circle cx=\"345\" cy=\"65\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-purple)\" stroke-width=\"2.5\"/>\n          <text x=\"345\" y=\"70\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-purple)\">c4</text>\n          <circle cx=\"520\" cy=\"110\" r=\"24\" class=\"node-circle-base\" stroke=\"var(--accent-blue)\" stroke-width=\"3.5\"/>\n          <text x=\"520\" y=\"115\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-blue)\">c5</text>\n          <text x=\"520\" y=\"146\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--accent-blue)\">Combined together!</text>\n          <rect x=\"300\" y=\"24\" width=\"90\" height=\"20\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"345\" y=\"38\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"560\" y=\"99\" width=\"60\" height=\"22\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"590\" y=\"114\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"640\" y=\"99\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"677\" y=\"114\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"640\" y1=\"110\" x2=\"624\" y2=\"110\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>Your feature is done:</strong> You tested your work and you are ready to include it in the main project.",
        "<strong>A reunion checkpoint (c5):</strong> Git automatically compares changes from c3 and c4, combines them, and records checkpoint c5.",
        "<strong>Notice the lines joining together:</strong> Checkpoint c5 connects both branches so no history is lost.",
        "<strong>Main now has all your improvements:</strong> You can now safely delete the temporary feature branch bookmark."
      ],
      "rule": "Merging is like pouring two rivers into one: it combines work from both branches into a single shared milestone."
    },
    "rebase": {
      "name": "Rebase (Straighten Your Timeline)",
      "command": "git switch feature/login && git rebase main",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Rebase Straight Timeline Visual\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-green\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-green)\"/>\n            </marker>\n            <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--git-orange)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\">← Rebase moves your work to the front of the line so your project history is a simple straight line ←</text>\n          <line x1=\"200\" y1=\"120\" x2=\"115\" y2=\"120\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"355\" y1=\"120\" x2=\"255\" y2=\"120\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-green)\"/>\n          <line x1=\"510\" y1=\"120\" x2=\"410\" y2=\"120\" stroke=\"var(--git-orange)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-orange)\"/>\n          <path d=\"M 235 60 C 235 85, 235 95, 235 98\" fill=\"none\" class=\"graph-edge-base\" stroke-dasharray=\"3,3\" opacity=\"0.4\" marker-end=\"url(#arrow)\"/>\n          <circle cx=\"90\" cy=\"120\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"90\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"235\" cy=\"120\" r=\"20\" class=\"node-circle-base\"/>\n          <text x=\"235\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\">c2</text>\n          <circle cx=\"235\" cy=\"45\" r=\"18\" class=\"node-circle-base\" stroke-dasharray=\"3,3\" opacity=\"0.4\"/>\n          <text x=\"235\" y=\"50\" text-anchor=\"middle\" class=\"node-text-title\" opacity=\"0.6\">c4</text>\n          <text x=\"235\" y=\"75\" text-anchor=\"middle\" class=\"node-text-desc\" opacity=\"0.6\">Old draft</text>\n          <circle cx=\"380\" cy=\"120\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"2.5\"/>\n          <text x=\"380\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"380\" y=\"155\" text-anchor=\"middle\" class=\"node-text-desc\">main progress</text>\n          <circle cx=\"535\" cy=\"120\" r=\"24\" class=\"node-circle-base\" stroke=\"var(--git-orange)\" stroke-width=\"3.5\"/>\n          <text x=\"535\" y=\"125\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--git-orange)\">c4'</text>\n          <text x=\"535\" y=\"155\" text-anchor=\"middle\" class=\"node-text-desc\" font-weight=\"bold\" fill=\"var(--git-orange)\">replayed at front</text>\n          <rect x=\"345\" y=\"80\" width=\"70\" height=\"20\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"380\" y=\"94\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <rect x=\"480\" y=\"52\" width=\"110\" height=\"22\" rx=\"4\" fill=\"rgba(192, 132, 252, 0.18)\" stroke=\"var(--accent-purple)\" stroke-width=\"1.5\"/>\n          <text x=\"535\" y=\"67\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-purple)\">feature branch</text>\n          <rect x=\"610\" y=\"52\" width=\"75\" height=\"22\" rx=\"4\" fill=\"var(--git-orange)\"/>\n          <text x=\"647\" y=\"67\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\" fill=\"#ffffff\">HEAD (You)</text>\n          <line x1=\"610\" y1=\"63\" x2=\"593\" y2=\"63\" stroke=\"var(--git-orange)\" stroke-width=\"2\" marker-end=\"url(#arrow-orange)\"/>\n        </svg>",
      "bullets": [
        "<strong>New updates happened on main:</strong> While you were coding on your branch, someone added c3 to main.",
        "<strong>Replaying your work at the front:</strong> Rebase lifts your changes (c4) and replays them right after c3 as c4'.",
        "<strong>A clean straight timeline:</strong> It looks like you started your work today on the freshest code, avoiding messy merge criss-crosses.",
        "<strong>The old draft is safely discarded:</strong> Git replaces the old branch pointer with your new replayed checkpoint."
      ],
      "rule": "Golden Rule: Only rebase your own private work before sharing it. Never rebase commits already pushed to a team branch."
    },
    "detached": {
      "name": "Looking at the Past (Detached HEAD State)",
      "command": "git switch --detach <hash-c2>",
      "svg": "<svg viewBox=\"0 0 760 210\" class=\"graph-svg\" aria-label=\"Detached HEAD Time Travel Visual\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <marker id=\"arrow\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"#64748b\"/>\n            </marker>\n            <marker id=\"arrow-red\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\">\n              <path d=\"M 0 1.5 L 8 5 L 0 8.5 z\" fill=\"var(--accent-red)\"/>\n            </marker>\n          </defs>\n          <text x=\"380\" y=\"20\" text-anchor=\"middle\" class=\"graph-hint-text\" fill=\"var(--accent-amber)\">Viewing a historical commit without an attached branch. Preserve wanted work before switching.</text>\n          <line x1=\"260\" y1=\"125\" x2=\"160\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <line x1=\"460\" y1=\"125\" x2=\"340\" y2=\"125\" class=\"graph-edge-base\" marker-end=\"url(#arrow)\"/>\n          <path d=\"M 300 70 C 300 90, 300 95, 300 100\" fill=\"none\" stroke=\"var(--accent-red)\" stroke-width=\"2.5\" marker-end=\"url(#arrow-red)\"/>\n          <circle cx=\"130\" cy=\"125\" r=\"22\" class=\"node-circle-base\"/>\n          <text x=\"130\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\">c1</text>\n          <circle cx=\"300\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-amber)\" stroke-width=\"3\"/>\n          <text x=\"300\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-amber)\">c2</text>\n          <text x=\"300\" y=\"160\" text-anchor=\"middle\" class=\"node-text-desc\">inspecting past checkpoint</text>\n          <circle cx=\"490\" cy=\"125\" r=\"22\" class=\"node-circle-base\" stroke=\"var(--accent-green)\" stroke-width=\"3\"/>\n          <text x=\"490\" y=\"130\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-green)\">c3</text>\n          <text x=\"490\" y=\"160\" text-anchor=\"middle\" class=\"node-text-desc\">main (today's work)</text>\n          <rect x=\"460\" y=\"80\" width=\"60\" height=\"20\" rx=\"4\" fill=\"rgba(52, 211, 153, 0.18)\" stroke=\"var(--accent-green)\" stroke-width=\"1.5\"/>\n          <text x=\"490\" y=\"94\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"bold\" fill=\"var(--accent-green)\">main</text>\n          <circle cx=\"300\" cy=\"48\" r=\"20\" class=\"node-circle-base\" stroke=\"var(--accent-red)\" stroke-width=\"3\"/>\n          <text x=\"300\" y=\"53\" text-anchor=\"middle\" class=\"node-text-title\" fill=\"var(--accent-red)\">exp</text>\n          <rect x=\"345\" y=\"36\" width=\"180\" height=\"24\" rx=\"4\" fill=\"rgba(248, 113, 113, 0.18)\" stroke=\"var(--accent-red)\" stroke-width=\"1.5\"/>\n          <text x=\"435\" y=\"52\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"bold\" fill=\"var(--accent-red)\">HEAD (Viewing without bookmark)</text>\n          <line x1=\"345\" y1=\"48\" x2=\"324\" y2=\"48\" stroke=\"var(--accent-red)\" stroke-width=\"2\" marker-end=\"url(#arrow-red)\"/>\n        </svg>",
      "bullets": [
        "<strong>You are browsing an old milestone:</strong> Your view (<code>HEAD</code>) hopped off branch bookmarks to look directly at c2.",
        "<strong>Nothing is broken:</strong> It is like looking through an old photo album. Your main branch and recent work are completely safe.",
        "<strong>Want to experiment here?</strong> If you want to make changes and keep them, run <code>git switch -c new-feature</code> to attach a new bookmark.",
        "<strong>Return to safety anytime:</strong> Run <code>git switch main</code> to jump straight back to today's work."
      ],
      "rule": "Detached HEAD is harmless for reading history. If you make changes you want to keep, attach a bookmark with git switch -c <name>."
    }
  },
  "pipelineConfigs": {
    "github": {
      "title": "GitHub Actions (.github/workflows/ci.yml)",
      "code": "# .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run Tests\n        run: npm test"
    },
    "gitlab": {
      "title": "GitLab CI/CD (.gitlab-ci.yml)",
      "code": "# .gitlab-ci.yml\nstages:\n  - test\n\ntest-job:\n  stage: test\n  image: node:latest\n  script:\n    - npm test"
    },
    "bitbucket": {
      "title": "Bitbucket Pipelines (bitbucket-pipelines.yml)",
      "code": "# bitbucket-pipelines.yml\npipelines:\n  default:\n    - step:\n        name: Test\n        image: node:latest\n        script:\n          - npm test"
    }
  },
  "commands": [
    {
      "id": "card-init-snippet-1",
      "syntax": "# 1. Choose your new repository's initial branch (Git 2.28+):\ngit init -b <initial-branch>\n\n# 2. Stage all initial files and make the first milestone\ngit add .\ngit commit -m \"feat: initial project setup\"\n\n# 3. Link to your empty GitHub repository and push\ngit remote add <remote> <repository-url>\ngit push -u <remote> <initial-branch>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "initial-branch",
        "remote",
        "repository-url"
      ],
      "effects": [
        "local-change",
        "remote-publish"
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
        "https://git-scm.com/docs/git-init"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-clone-snippet-1",
      "syntax": "# 1. Download complete repository history into a new folder:\ngit clone https://github.com/username/repo.git\n\n# 2. Enter directory and inspect status:\ncd repo\ngit status\n\n# 3. List all local and remote branches:\ngit branch -a",
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
        "https://git-scm.com/docs/git-clone"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-stage-snippet-1",
      "syntax": "# 1. Review status of modified files:\ngit status\n\n# 2. Stage specific intended files:\ngit add src/app.js\n\n# 3. Review the exact staged snapshot:\ngit diff --staged\n\n# 4. Commit with a clear note:\ngit commit -m \"feat: add user authentication\"",
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
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-branch-snippet-1",
      "syntax": "# 1. Create and switch to a new branch:\ngit switch -c feature/redesign\n\n# 2. Work safely, edit files, and commit:\ngit add src/redesign.css\ngit commit -m \"style: apply new color palette\"\n\n# 3. After committing/preserving changes, return to your original branch:\ngit switch <original-branch>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "original-branch"
      ],
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
        "https://git-scm.com/docs/git-switch"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-undo-snippet-1",
      "syntax": "# 1. Unstage a file (SAFE: keeps your local edits in file):\ngit restore --staged <filename>\n\n# 2. Discard uncommitted edits (PERMANENT: overwrites file):\ngit restore <filename>\n\n# 3. Undo a pushed commit safely with an inverse commit:\ngit revert <commit-id>",
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
        "Inspect git status and both diffs; preserve wanted work.",
        "Verify repository-specific branch, remote and target values."
      ],
      "verification": [
        "Inspect git status and relevant commits/refs after the selected action."
      ],
      "sources": [
        "https://git-scm.com/docs/git-restore"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-sync-snippet-1",
      "syntax": "# 1. Download remote changes WITHOUT altering working files:\ngit fetch <remote>\n\n# 2. Pull & integrate linearly into your branch:\ngit pull --rebase <remote> <upstream-branch>\n\n# 3. Upload your commits to remote:\ngit push <remote> <branch-name>\n\n# Remote URL conventions across hosts:\ngit remote add origin https://github.com/user/repo.git     # GitHub\ngit remote add origin https://gitlab.com/user/repo.git     # GitLab\ngit remote add origin https://bitbucket.org/user/repo.git  # Bitbucket",
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
        "Inspect git status and both diffs; preserve wanted work.",
        "Verify repository-specific branch, remote and target values."
      ],
      "verification": [
        "Inspect git status and relevant commits/refs after the selected action."
      ],
      "sources": [
        "https://git-scm.com/docs/git-fetch"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-pipeline-snippet-1",
      "syntax": "# .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run Tests\n        run: npm test",
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
      "syntax": "# 1. Stash changes (use -u to include newly created files):\ngit stash push -u -m \"WIP: navigation refactor\"\n\n# 2. Your workspace is now clean. Switch branches or patch...\ngit switch hotfix\n\n# 3. Commit/preserve the hotfix work, then return to the original branch:\ngit switch <original-branch>\n\n# 4. Inspect the intended stash and apply it (keeps the stash):\ngit stash list\ngit stash apply <stash-reference>\n# Verify restored files before separately dropping that stash.",
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
        "Inspect git status and both diffs; preserve wanted work.",
        "Verify repository-specific branch, remote and target values."
      ],
      "verification": [
        "Inspect git status and relevant commits/refs after the selected action."
      ],
      "sources": [
        "https://git-scm.com/docs/git-stash"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-conflict-snippet-1",
      "syntax": "<<<<<<< HEAD\nconst apiEndpoint = \"https://api.v2.internal\";\n=======\nconst apiEndpoint = \"https://api.v3.production\";\n>>>>>>> feature/endpoint-upgrade",
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
      "id": "card-conflict-snippet-2",
      "syntax": "# 1. Edit file: delete the 3 marker lines and keep the right code\n# 2. Mark conflict resolved:\ngit add src/config.js\n\n# 3. Finalize merge (or abort if you need to rethink):\ngit merge --continue   # Or 'git merge --abort'",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "data-loss-potential"
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
        "https://git-scm.com/docs/git-add"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-rebase-snippet-1",
      "syntax": "# Rebase the last 3 local commits:\ngit rebase -i HEAD~3\n\n# In editor:\n# pick   = keep commit\n# squash = combine into previous commit & merge message\n# fixup  = combine into previous commit & discard message\n\n# After resolving and staging any conflicts, choose continuation:\n# git rebase --continue\n# Or request cancellation instead (inspect status afterwards):\n# git rebase --abort",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "history-rewrite",
        "data-loss-potential"
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
        "https://git-scm.com/docs/git-rebase"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-detached-snippet-1",
      "syntax": "# 1. Check if detached:\ngit status  # Shows: \"HEAD detached at a1b2c3d\"\n\n# Exit A: Switch only after preserving any wanted detached commits:\ngit switch <existing-branch>\n\n# Exit B: Preserve commits made while detached:\ngit switch -c recovery-branch",
      "minimumGit": "2.28",
      "requiredParameters": [
        "existing-branch"
      ],
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
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-worktree-snippet-1",
      "syntax": "# 1. Check out hotfix branch into sibling folder:\ngit worktree add ../project-hotfix hotfix-branch\n\n# 2. List all active directory locations:\ngit worktree list\n\n# 3. Clean up folder when finished:\ngit worktree remove ../project-hotfix",
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
        "https://git-scm.com/docs/git-worktree"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-reflog-snippet-1",
      "syntax": "# 1. View chronological action ledger:\ngit reflog -n 15\n\n# 2. Locate the commit hash before the mistake (e.g. HEAD@{2})\n# 3. Create a rescue branch attached to that commit:\ngit branch rescue-branch <verified-commit-id>",
      "minimumGit": "2.28",
      "requiredParameters": [
        "verified-commit-id"
      ],
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
        "https://git-scm.com/docs/git-reflog"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-bisect-snippet-1",
      "syntax": "# 1. Start binary search:\ngit bisect start\ngit bisect bad                 # Current version is broken\ngit bisect good v1.2.0          # Known good previous release\n\n# 2. Test intermediate commits checked out by Git:\ngit bisect good   # (or 'git bisect bad')\n\n# 3. Finish and return to active branch:\ngit bisect reset\n\n# Inspect line-by-line author timestamps:\ngit blame -L 20,45 src/app.js",
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
        "https://git-scm.com/docs/git-bisect"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-tag-snippet-1",
      "syntax": "# 1. Create an annotated release tag:\ngit tag -a v1.0.0 -m \"Release v1.0.0: Initial public launch\"\n\n# 2. Push tag to GitHub (tags are not pushed by default!):\ngit push origin v1.0.0\n\n# Or push all local tags at once:\ngit push origin --tags\n\n# List all tags sorted by version with annotation lines:\ngit tag --sort=version:refname -n 1",
      "minimumGit": "2.28",
      "requiredParameters": [],
      "effects": [
        "local-change",
        "remote-publish"
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
        "https://git-scm.com/docs/git-tag"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-force-lease-snippet-1",
      "syntax": "# Inspect repository and remote first:\ngit status\ngit branch -vv\ngit remote -v\n\n# After coordination, use verified values and expected remote object ID:\n# git push --force-with-lease=refs/heads/<remote-branch>:<expected-oid> <remote> HEAD:refs/heads/<remote-branch>\n# Do not execute while any prerequisite remains unknown.",
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
        "Inspect git status and both diffs; preserve wanted work.",
        "Verify repository-specific branch, remote and target values."
      ],
      "verification": [
        "Inspect git status and relevant commits/refs after the selected action."
      ],
      "sources": [
        "https://git-scm.com/docs/git-status"
      ],
      "reviewed": "2026-10-12"
    },
    {
      "id": "card-cherry-pick-snippet-1",
      "syntax": "# 1. Switch to target branch (e.g. maintenance branch):\ngit switch release/v1.0\n\n# 2. Pluck specific bugfix commit by hash:\ngit cherry-pick 7a1b2c3\n\n# If conflict occurs:\n# git cherry-pick --continue\n# Or cancel and return to safety:\n# git cherry-pick --abort",
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
        "https://git-scm.com/docs/git-switch"
      ],
      "reviewed": "2026-10-12"
    }
  ],
  "workflows": [
    {
      "id": "card-init",
      "title": "Start a Repository from Scratch",
      "category": "essential",
      "effects": [
        "local-change",
        "remote-publish"
      ],
      "commands": [
        "card-init-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-clone",
      "title": "Clone an Existing Project",
      "category": "essential",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-clone-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-stage",
      "title": "Precise Staging & Checkpoints",
      "category": "essential",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-stage-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-branch",
      "title": "Branches: Isolated Sandboxes",
      "category": "branch",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-branch-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-undo",
      "title": "Undoing Mistakes Safely",
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
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-sync",
      "title": "Working with Remotes (GitHub, GitLab, Bitbucket)",
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
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-pipeline",
      "title": "Pipelines & Automated CI/CD",
      "category": "cloud",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-pipeline-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-stash",
      "title": "Stashing: Temporary Work Shelving",
      "category": "essential",
      "effects": [
        "local-change",
        "data-loss-potential"
      ],
      "commands": [
        "card-stash-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-conflict",
      "title": "Merge Conflict Resolution",
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
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-rebase",
      "title": "Interactive Rebase (Commit Polish)",
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
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-detached",
      "title": "Detached HEAD Recovery",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-detached-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-worktree",
      "title": "Git Worktrees (Parallel Folders)",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-worktree-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-reflog",
      "title": "Reflog Recovery (Lost Work)",
      "category": "undo",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-reflog-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-bisect",
      "title": "Regression Hunting (bisect & blame)",
      "category": "pro",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-bisect-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-tag",
      "title": "Release Tags & Semantic Versioning",
      "category": "cloud",
      "effects": [
        "local-change",
        "remote-publish"
      ],
      "commands": [
        "card-tag-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-force-lease",
      "title": "Force-Push with an Explicit Lease",
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
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    },
    {
      "id": "card-cherry-pick",
      "title": "Port Isolated Commits (cherry-pick)",
      "category": "branch",
      "effects": [
        "local-change"
      ],
      "commands": [
        "card-cherry-pick-snippet-1"
      ],
      "prerequisites": [
        "Select one operation, not every alternative in the snippet."
      ],
      "verification": [
        "Inspect intended repository state and test the result."
      ]
    }
  ]
};

export default knowledge;
