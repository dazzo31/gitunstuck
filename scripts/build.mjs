#!/usr/bin/env node
/**
 * Production build for GitUnstuck.
 *
 * The repository keeps index.html readable, self-contained and
 * dependency-free. This script emits a minified copy into dist/ for GitHub
 * Pages to serve, so visitors download less while the source stays
 * maintainable.
 *
 * Build-only minifiers are pinned in package-lock.json. The deployed app has
 * no runtime dependencies.
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
import { execFileSync } from 'node:child_process';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { createHash } from 'node:crypto';
import { transform as transformCss } from 'lightningcss';
import { minify as minifyJavaScript } from 'terser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');
const DIST = join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

function minifyCss(css) {
  return transformCss({
    filename: SRC,
    code: Buffer.from(css),
    minify: true,
  }).code.toString();
}

/* ------------------------------------------------------------------ *
 * JavaScript
 * ------------------------------------------------------------------ */

async function minifyJs(js) {
  const result = await minifyJavaScript(js, {
    compress: { passes: 2 },
    mangle: { toplevel: false },
    toplevel: false,
    format: { comments: false },
  });
  if (!result.code) throw new Error('Terser returned empty JavaScript output');
  return result.code;
}

/* ------------------------------------------------------------------ *
 * HTML
 * ------------------------------------------------------------------ */

const MASK = [];
const mask = s => `\u0000${MASK.push(s) - 1}\u0000`;

async function minifyHtml(html) {
  MASK.length = 0;

  // 1. Inline stylesheet
  html = html.replace(/(<style>)([\s\S]*?)(<\/style>)/, (_, a, body, b) =>
    a + mask(minifyCss(body)) + b);

  // 2. JSON-LD blocks
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (_, a, body, b) => a + mask(JSON.stringify(JSON.parse(body))) + b);

  // 3. Inline scripts. Process from the end so earlier offsets remain valid.
  const scriptBlocks = [...html.matchAll(/(<script>)([\s\S]*?)(<\/script>)/g)];
  for (const match of scriptBlocks.reverse()) {
    const minifiedScript = await minifyJs(match[2]);
    html = html.slice(0, match.index) + match[1] + mask(minifiedScript) + match[3] +
      html.slice(match.index + match[0].length);
  }

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

// Inline the shared recovery module so the deployed artifact stays self-contained.
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const dirty=Boolean(execFileSync('git',['status','--porcelain','--untracked-files=normal'],{cwd:ROOT,encoding:'utf8'}).trim());
const inputs=['index.html','recovery.js','learning.js','scripts/build.mjs','package-lock.json',...readdirSync(ROOT).filter(name=>extname(name)==='.svg')].sort();
const fingerprint=createHash('sha256');
for(const name of inputs)fingerprint.update(name+'\0').update(readFileSync(join(ROOT,name)));
const sourceHash=fingerprint.digest('hex');
const source = readFileSync(SRC, 'utf8').replace('</head>',
  `<meta name="gitunstuck-revision" content="${revision}"><meta name="gitunstuck-working-tree" content="${dirty?'dirty':'clean'}"><meta name="gitunstuck-source-sha256" content="${sourceHash}"></head>`).replace(
  '<script src="recovery.js"></script>',
  () => '<script>' + readFileSync(join(ROOT, 'recovery.js'), 'utf8') + '</script>',
).replace('<script src="learning.js"></script>',
  () => '<script>' + readFileSync(join(ROOT, 'learning.js'), 'utf8') + '</script>');
const minified = await minifyHtml(source);

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
