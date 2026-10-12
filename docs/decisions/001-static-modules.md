# GU-0301: Static modules and Pages-compatible routing

Decision: retain buildless static HTML, native DOM controls and relative assets. No framework/backend is needed for core parsing, recovery, lessons or simulations. A small Node build copies public files only. Future task routes use URL fragments so Pages never needs a server rewrite under /gitunstuck/.

Extract styles to assets/css/site.css, trusted knowledge to assets/js/knowledge.mjs and the existing controller to assets/js/app.mjs. Native ES modules import explicit dependencies; the controller state stays in a closure. GitUnstuckKnowledge is an explicit compatibility/testing namespace, not implicit state. A small explicit GitUnstuck UI API bridges existing controls, and window.copySnippet remains solely as the compatibility adapter for existing inline handlers. New logic uses pure ES modules with zero runtime dependencies. Data is validated in CI through small explicit validators rather than adding a large schema dependency.

Retain essential reference HTML for no-JavaScript/print use. Canonical command code is checked against static fallback text, preventing silent drift. Typed metadata names mixed recipes as workflows rather than pretending every card is a single atomic command. Trusted SVG/markup remains a controlled bundled source boundary; pasted/user text only receives text nodes.

Targets: current evergreen Chrome/Edge, Firefox and Safari; CI evidence currently covers Chromium only. Node 24 is the development/test minimum. Git 2.28 is the published example minimum. No claim of other-browser or human assistive-technology validation is made until those checks run.
