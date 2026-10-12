import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
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
console.log('CHECK: HTML structure, IDs, task targets, local assets, JSON-LD and inline JS passed.');
