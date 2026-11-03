#!/usr/bin/env node
/**
 * Zero-dependency build for GitUnstuck.
 *
 * The repository keeps index.html readable, self-contained and
 * dependency-free. This script emits a minified copy into dist/ for GitHub
 * Pages to serve, so visitors download less while the source stays
 * maintainable.
 *
 * Uses only Node built-ins - no packages, no lockfile, nothing to install.
 *
 *   node scripts/build.mjs           build dist/
 *   node scripts/build.mjs --check   report sizes, write nothing
 */

import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync,
  readdirSync, existsSync, statSync,
} from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');
const DIST = join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

const DELIMS = '{};:,>';

/**
 * Conservative CSS minifier. Tracks strings and url() so it never touches
 * literal content, collapses whitespace runs, strips comments (except
 * /*! ... *\/) and drops the final semicolon before a closing brace.
 *
 * Deliberately does NOT strip whitespace around arithmetic operators, which
 * keeps calc(100% - 20px) valid.
 */
function minifyCss(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  let quote = null;

  while (i < n) {
    const c = css[i];

    if (quote) {
      out += c;
      i++;
      if (c === '\\') { out += css[i] ?? ''; i++; continue; }
      if (c === quote) quote = null;
      continue;
    }

    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      if (css.startsWith('/*!', i)) out += css.slice(i, stop);
      i = stop;
      continue;
    }

    if (c === '"' || c === "'") { quote = c; out += c; i++; continue; }

    if ((c === 'u' || c === 'U') && /^url\(/i.test(css.slice(i, i + 4))) {
      const close = css.indexOf(')', i);
      const stop = close === -1 ? n : close + 1;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }

    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      let j = i;
      while (j < n && ' \t\n\r'.includes(css[j])) j++;
      const prev = out[out.length - 1] ?? '';
      const next = css[j] ?? '';
      if (!DELIMS.includes(prev) && !DELIMS.includes(next)) out += ' ';
      i = j;
      continue;
    }

    if (c === ';') {
      let j = i + 1;
      while (j < n && ' \t\n\r'.includes(css[j])) j++;
      if (css[j] === '}') { i = j; continue; }
    }

    out += c;
    i++;
  }

  return out.trim();
}

/* ------------------------------------------------------------------ *
 * JavaScript
 * ------------------------------------------------------------------ */

// After these, a '/' starts a regex literal rather than a division.
const REGEX_AFTER = new Set([
  '', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';',
  '+', '-', '*', '%', '<', '>', '~', '^',
  'return', 'typeof', 'instanceof', 'case', 'in', 'of', 'new',
  'delete', 'void', 'do', 'else', 'yield', 'await', 'throw',
]);

const IDENT = /[A-Za-z0-9_$]/;

/**
 * Conservative JS minifier: removes comments and line indentation, keeps
 * every newline so automatic semicolon insertion semantics are unchanged.
 *
 * String, template-literal and regex literals are copied verbatim, so
 * content such as '# .github/workflows/ci.yml' inside a template is safe.
 */
function minifyJs(js) {
  let out = '';
  let i = 0;
  const n = js.length;
  let prev = '';

  while (i < n) {
    const c = js[i];

    // Line comment
    if (c === '/' && js[i + 1] === '/') {
      i += 2;
      while (i < n && js[i] !== '\n') i++;
      continue;
    }

    // Block comment - preserve its newlines so line-based ASI is unaffected
    if (c === '/' && js[i + 1] === '*') {
      const end = js.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      const body = js.slice(i, stop);
      if (body.startsWith('/*!')) { out += body; }
      else {
        const breaks = (body.match(/\n/g) || []).length;
        if (breaks) out += '\n'.repeat(breaks);
        else if (IDENT.test(out[out.length - 1] ?? '') && IDENT.test(js[stop] ?? '')) out += ' ';
      }
      i = stop;
      continue;
    }

    // Single / double quoted string
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (js[j] === '\\') { j += 2; continue; }
        if (js[j] === c) { j++; break; }
        j++;
      }
      out += js.slice(i, j);
      prev = 'x';
      i = j;
      continue;
    }

    // Template literal (with ${...} nesting)
    if (c === '`') {
      let j = i + 1, depth = 0;
      while (j < n) {
        const d = js[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '`' && depth === 0) { j++; break; }
        if (d === '$' && js[j + 1] === '{') { depth++; j += 2; continue; }
        if (d === '}' && depth > 0) { depth--; j++; continue; }
        j++;
      }
      out += js.slice(i, j);
      prev = 'x';
      i = j;
      continue;
    }

    // Regex literal
    if (c === '/' && REGEX_AFTER.has(prev)) {
      let j = i + 1, inClass = false, ok = false;
      while (j < n) {
        const d = js[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '\n') break;
        if (d === '[') { inClass = true; j++; continue; }
        if (d === ']') { inClass = false; j++; continue; }
        if (d === '/' && !inClass) { j++; ok = true; break; }
        j++;
      }
      if (ok) {
        while (j < n && /[a-z]/i.test(js[j])) j++;
        out += js.slice(i, j);
        prev = 'x';
        i = j;
        continue;
      }
      // Not a regex after all - fall through and emit as division
    }

    // Identifier / number run - lets us detect keywords like `return`
    if (IDENT.test(c)) {
      let j = i;
      while (j < n && IDENT.test(js[j])) j++;
      const word = js.slice(i, j);
      out += word;
      prev = REGEX_AFTER.has(word) ? word : 'x';
      i = j;
      continue;
    }

    out += c;
    if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') prev = c;
    i++;
  }

  // Strip indentation and blank lines; newlines are preserved for ASI.
  return out
    .split('\n')
    .map(l => l.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''))
    .filter(l => l.length > 0)
    .join('\n');
}

/* ------------------------------------------------------------------ *
 * HTML
 * ------------------------------------------------------------------ */

const MASK = [];
const mask = s => `\u0000${MASK.push(s) - 1}\u0000`;

function minifyHtml(html) {
  MASK.length = 0;

  // 1. Inline stylesheet
  html = html.replace(/(<style>)([\s\S]*?)(<\/style>)/, (_, a, body, b) =>
    a + mask(minifyCss(body)) + b);

  // 2. JSON-LD blocks
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (_, a, body, b) => a + mask(JSON.stringify(JSON.parse(body))) + b);

  // 3. Inline script
  html = html.replace(/(<script>)([\s\S]*?)(<\/script>)/g, (_, a, body, b) =>
    a + mask(minifyJs(body)) + b);

  // 4. Verbatim regions - whitespace here is content
  html = html.replace(/<pre[\s\S]*?<\/pre>/gi, m => mask(m));
  html = html.replace(/<textarea[\s\S]*?<\/textarea>/gi, m => mask(m));

  // 5. HTML comments (keep conditional comments)
  html = html.replace(/<!--(?!\[)[\s\S]*?-->/g, '');

  // 6. Remove line indentation. Newlines are kept, so inline text still
  //    renders with its inter-word whitespace intact.
  html = html
    .split('\n')
    .map(l => l.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''))
    .filter(l => l.length > 0)
    .join('\n');

  // 7. Restore masked regions (inner content may itself contain masks)
  let out = html;
  let guard = 0;
  const tokenRe = /\u0000(\d+)\u0000/g;
  while (tokenRe.test(out) && guard++ < 20) {
    out = out.replace(tokenRe, (_, idx) => MASK[Number(idx)] ?? '');
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

const kb = n => (n / 1024).toFixed(1) + ' KB';
const enc = s => Buffer.from(s, 'utf8');
const gz = s => gzipSync(enc(s), { level: 9 }).length;
const br = s => brotliCompressSync(enc(s), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

const source = readFileSync(SRC, 'utf8');
const minified = minifyHtml(source);

console.log('GitUnstuck build');
console.log('  source    ' + kb(enc(source).length).padStart(10) +
            '  gzip ' + kb(gz(source)).padStart(8) + '  brotli ' + kb(br(source)).padStart(8));
console.log('  minified  ' + kb(enc(minified).length).padStart(10) +
            '  gzip ' + kb(gz(minified)).padStart(8) + '  brotli ' + kb(br(minified)).padStart(8));
const save = (a, b) => ((a - b) / 1024).toFixed(1) + ' KB (' + (100 * (a - b) / a).toFixed(1) + '%)';
console.log('  saved     brotli ' + save(br(source), br(minified)));

// Sanity: minification must not change the number of <script>/<style> tags
const count = (s, re) => (s.match(re) || []).length;
for (const [label, re] of [['<script>', /<script/g], ['<style>', /<style/g], ['<pre>', /<pre/gi]]) {
  const a = count(source, re), b = count(minified, re);
  if (a !== b) { console.error(`\nFAIL: ${label} count changed ${a} -> ${b}`); process.exit(1); }
}
if (!minified.includes('</html>')) { console.error('\nFAIL: output truncated'); process.exit(1); }
// Balanced braces inside the style block catches the most common CSS breakage
const styleBody = minified.slice(minified.indexOf('<style>') + 7, minified.indexOf('</style>'));
const open = (styleBody.match(/\{/g) || []).length;
const close = (styleBody.match(/\}/g) || []).length;
if (open !== close) { console.error(`\nFAIL: CSS braces unbalanced (${open} vs ${close})`); process.exit(1); }

if (CHECK_ONLY) {
  console.log('\n--check: nothing written.');
  process.exit(0);
}

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, 'index.html'), minified);
writeFileSync(join(DIST, '.nojekyll'), '');

// Copy the static assets the page references (icons, favicons, wordmarks).
let copied = 0;
for (const f of readdirSync(ROOT)) {
  if (extname(f) !== '.svg') continue;
  if (!statSync(join(ROOT, f)).isFile()) continue;
  copyFileSync(join(ROOT, f), join(DIST, f));
  copied++;
}

console.log(`\nwrote dist/index.html + ${copied} svg assets + .nojekyll`);
