# Contributing

Use Node 24 and Git. Run `npm ci --ignore-scripts`, `npm test`, `npm run check`, `npm run build`. Browser and automated accessibility gates run in GitHub Actions.

Author commands in assets/js/knowledge.mjs with stable IDs, explicit effects, Git minimum, parameters, shell notes, preflight, verification and official sources. Keep matching static code fallback in index.html; parity tests reject drift. A workflow can include alternatives: do not present it as one blindly executable script. Update every affected recovery/simulator/lesson definition when semantics change.

Safety review: inspect working-tree/index/history/remote effects; identify unknown prerequisites; explain loss and conflict possibilities; verify in disposable Git repositories only. Never use production remotes or user worktrees in tests. Do not classify mutations as read-only or guarantee reflog recovery of unstaged edits. Use textContent for user text; permit bundled SVG/inline markup only through validated knowledge boundaries.

Every GU task records changed files, actual commands/outcomes, decisions and remaining limits in docs/TASK_EVIDENCE.md and docs/IMPLEMENTATION_STATUS.md. Do not mark later-phase proposed behavior as existing implementation. Main merge/deployment is a separate release action.
