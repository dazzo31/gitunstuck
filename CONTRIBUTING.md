# Contributing to GitUnstuck

Thanks for your interest in contributing. GitUnstuck is a dependency-free,
client-side application: `index.html`, shared `recovery.js`, SVG assets and automated tests.
We welcome contributions that keep it small, private, and easy to run.

## How to contribute

1. **Open an issue first.** Describe the problem or improvement you want to make.
   This lets us agree on scope before you invest time in code.
2. **Fork and branch.** Create a branch from `main` with a short, descriptive name
   (for example, `fix/gh013-detection` or `feat/bitbucket-auth`).
3. **Make focused changes.** One logical change per pull request.
4. **Run the test suite.** Everything must pass before review:

   ```bash
   npm test
   ```

5. **Open a pull request.** Link the issue and describe what changed and why.

## Coding conventions

- **Zero dependencies.** Do not add npm packages, external fonts, external
  scripts or runtime frameworks. Preserve the existing build-only minifiers. Source use opens `index.html` alongside `recovery.js`.
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

- `index.html` — markup, styles, navigation and rendering.
- `recovery.js` — shared recipe data and diagnosis logic.
- `tests/test-analyzer.js` — parser, data and source assertions.
- `tests/test-recovery.js` — executable disposable-repository scenarios.
- `tests/test-browser.cjs` — optional browser journey and presentation checks.
- `docs/` — plans, feature specifications, and design notes.
- `.github/` — CI workflows, issue/PR templates, and funding configuration.

## Tests

Keep parser checks, executable recovery evidence and browser checks distinct. Tests must execute the same recipe definitions as the UI and assert protected file/index/history state. Do not treat matching source strings as proof that a recovery works. See README.md for supported environments and provider limitations.

## Code of Conduct

All participants are expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Questions

Open a [GitHub issue](https://github.com/dazzo31/gitunstuck/issues) and ask.
