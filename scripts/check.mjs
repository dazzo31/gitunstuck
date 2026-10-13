import { readFileSync, existsSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validateErrors } from '../assets/js/errors.mjs';
import { validateGuides } from '../assets/js/guides.mjs';
import { validateReference } from '../assets/js/reference.mjs';
import knowledge from '../assets/js/knowledge.mjs';
import { validateKnowledge } from '../assets/js/schema.mjs';
const html = readFileSync('index.html', 'utf8');
assert.match(html, /<html[^>]*lang="en"/);
assert.match(html, /name="viewport"/);
for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (m[1].includes('application/ld+json')) JSON.parse(m[2]);
  else if (!m[1].includes('type="module"')) new vm.Script(m[2]);
}
const staticHtml = html.slice(0, html.indexOf('<script>'));
const ids = [...staticHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate static ID');
for (const m of html.matchAll(/data-target="([^"]+)"/g)) assert.ok(ids.includes(m[1]), `Missing task target ${m[1]}`);
for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
  if (/^(https?:|data:|mailto:|\/)/.test(m[1])) continue;
  assert.ok(existsSync(m[1].split('#')[0]), `Missing local asset ${m[1]}`);
}
assert.ok(!html.includes('eval('), 'Dynamic code execution is forbidden');
validateKnowledge(knowledge);
validateErrors();
validateGuides();
validateReference();
for (const file of readdirSync('assets/js').filter(f => /\.m?js$/.test(f))) {
  const source = readFileSync(`assets/js/${file}`, 'utf8');
  assert.equal(spawnSync(process.execPath, ['--check', `assets/js/${file}`]).status, 0, file);
  assert.ok(!source.includes('eval('), 'No eval in app source');
}
console.log('CHECK: HTML structure, IDs, task targets, local assets, JSON-LD and inline JS passed.');
