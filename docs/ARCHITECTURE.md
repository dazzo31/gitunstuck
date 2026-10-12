# GitUnstuck architecture

Static Pages app; no core backend, telemetry or shell execution. Public assets are copied to dist by scripts/build.mjs. Development files and fixtures are excluded. Hash routes will support task navigation without server rewrites.

| File | Responsibility |
| --- | --- |
| index.html | Semantic shell and essential reference fallback; stable legacy anchors |
| assets/css/site.css | Themes, responsive behavior, print, focus and contrast |
| assets/js/knowledge.mjs | Canonical snippets/workflow metadata, recovery definitions, controlled graph SVG and provider examples |
| assets/js/schema.mjs | Command, workflow, observation, risk and provider validators |
| assets/js/filter.mjs | Pure query AND category AND effect matching |
| assets/js/dom.mjs | Text-only DOM construction |
| assets/js/app.mjs | UI bootstrap/controller; closure-scoped preferences/filter state; explicit legacy copy/API adapters |
| tests | Frozen baseline, current-source unit/schema tests, disposable Git semantics and CI browser checks |

Bundled graph SVG and three-tag inline explanations are the sole trusted knowledge-markup boundary. Validators reject executable SVG and uncontrolled explanation tags. Recovery values render through textContent. Pasted data must never be added to knowledge objects, innerHTML, URLs, logs or storage. There is no arbitrary command executor.

Node 24, Playwright 1.56.1 and axe-core 4.10.3 are development tools only. No framework/runtime dependency added. Native ES modules load through relative asset paths under /gitunstuck/. Explanations and examples target Git 2.28+. CI evidence currently covers Chromium; other browsers and human screen-reader review are limitations.
