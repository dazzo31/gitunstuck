# Security Policy

## Reporting a vulnerability

GitUnstuck is a static, client-side application. All analysis runs in the
browser tab and no pasted input is transmitted to a server. Even so, security
issues can exist in the rendering or analysis logic.

If you believe you have found a security vulnerability, please report it
privately rather than opening a public issue:

1. Open a [private vulnerability report](https://github.com/dazzo31/gitunstuck/security/advisories/new)
   on the Security tab.
2. Include a clear description, the affected behavior, and, if possible, a
   minimal reproduction.

We will acknowledge your report and work with you to understand and resolve it.

## What to report

- Cross-site scripting (XSS) in the analyzer or any rendered output
- Regular-expression denial of service (ReDoS) in the input normalizer
- Any path that causes pasted input to leave the browser or be persisted
- Logic errors that recommend an unsafe or destructive Git command

## Supported versions

Only the latest version deployed from `main` is actively maintained. Security
fixes are applied to `main` and published on the next deployment.

## Disclosure

We ask that you allow reasonable time for a fix to be released before publicly
disclosing details of a vulnerability. We will credit reporters who follow this
process unless you ask to remain anonymous.
