# Contributing to GitUnstuck

Thanks for your interest in contributing. GitUnstuck is a dependency-free,
client-side application: a single `index.html` plus an automated test suite.
We welcome contributions that keep it small, private, and easy to run.

## How to contribute

1. **Open an issue first.** Describe the problem or improvement you want to make.
   This lets us agree on scope before you invest time in code.
2. **Fork and branch.** Create a branch from `main` with a short, descriptive name
   (for example, `fix/gh013-detection` or `feat/bitbucket-auth`).
3. **Make focused changes.** One logical change per pull request.
4. **Run the test suite.** Everything must pass before review:

   ```bash
   node tests/test-analyzer.js
   ```

5. **Open a pull request.** Link the issue and describe what changed and why.

## Coding conventions

- **Zero dependencies.** Do not add npm packages, external fonts, external
  scripts, or a build step. GitUnstuck runs by opening `index.html` directly.
- **Privacy first.** Pasted terminal output stays in the browser tab. Never
  transmit input over the network, and do not log or store it.
- **Risk-aware guidance.** Every destructive command must be paired with a
  "When to stop" gate, a "Check first" read-only checklist, and an authoritative
  source citation (see the existing cards for the pattern).
- **Accessibility.** Keep WCAG AA contrast, keyboard navigation, and screen-reader
  announcements. Add `aria-label`/`title` to new interactive elements.
- **Plain language.** Match the existing tone: neutral, instructional, and free
  of marketing phrasing.

## Project layout

- `index.html` — the entire application (markup, styles, and scripts).
- `tests/test-analyzer.js` — the automated regression suite (155 assertions).
- `docs/` — plans, feature specifications, and design notes.
- `.github/` — CI workflows, issue/PR templates, and funding configuration.

## Tests

The suite covers diagnostics, input normalization, forge guidance, navigation,
accessibility, branding, experience modes, and the visual data-flow tools. If you
change behavior, add or update the corresponding assertions.

## Code of Conduct

All participants are expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Questions

Open a [GitHub issue](https://github.com/dazzo31/gitunstuck/issues) and ask.
