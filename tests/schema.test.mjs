import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import knowledge from '../assets/js/knowledge.mjs';
import { validateKnowledge, validateCommand, validateObservation, validateRisk, validatePlatform } from '../assets/js/schema.mjs';
const clone = x => structuredClone(x);
test('published knowledge has 17 unique workflows and 18 validated snippets', () => {
  assert.equal(validateKnowledge(knowledge), knowledge);
  assert.equal(knowledge.workflows.length, 17); assert.equal(knowledge.commands.length, 18);
});
for (const [name, change] of [
  ['duplicate command ID', d => d.commands.push(clone(d.commands[0]))],
  ['duplicate workflow ID', d => d.workflows.push(clone(d.workflows[0]))],
  ['missing reference', d => d.workflows[0].commands.push('nonexistent')],
  ['executable SVG', d => d.graphScenarios.linear.svg = '<svg onload="alert(1)"></svg>'],
  ['uncontrolled graph markup', d => d.graphScenarios.linear.bullets = ['<img src=x onerror=alert(1)>']],
  ['missing recovery caution', d => d.undoSolutions.unstaged.warning = '']
]) test(`schema rejects ${name}`, () => { const data = clone(knowledge); change(data); assert.throws(() => validateKnowledge(data)); });
for (const [field, value] of [['sources', ['javascript:alert(1)']], ['effects', ['safe']], ['minimumGit', 'latest'], ['preflight', []]]) {
  test(`command schema rejects invalid ${field}`, () => {
    const command = clone(knowledge.commands[0]); command[field] = value; assert.throws(() => validateCommand(command));
  });
}
test('observation distinguishes unknown from known and validates provenance', () => {
  assert.doesNotThrow(() => validateObservation({ field: 'remote', state: 'unknown', confidence: 0, provenance: 'pasted status' }));
  assert.throws(() => validateObservation({ field: 'remote', state: 'known', confidence: 1, provenance: 'pasted status' }));
  assert.throws(() => validateObservation({ field: 'remote', state: 'guessed', confidence: 1, provenance: 'pasted status' }));
});
test('risk model requires explicit effects, uncertainties and acknowledgement', () => {
  const risk = { effects: ['history-rewrite', 'remote-publish'], affectedSurfaces: ['remote refs'], uncertainties: ['shared ownership unknown'], explanation: 'Lease cannot establish ownership', requiresAcknowledgement: true };
  assert.doesNotThrow(() => validateRisk(risk)); delete risk.uncertainties; assert.throws(() => validateRisk(risk));
});
test('platform model accepts explicitly unknown CLI and rejects unsafe source', () => {
  const provider = { id: 'generic', title: 'Generic Git', reviewTerm: 'Host-defined', ciPath: 'Host-defined', cli: null, constraints: ['Check chosen host'], sources: ['https://git-scm.com/docs/git'] };
  assert.doesNotThrow(() => validatePlatform(provider)); provider.sources = ['data:text/html,x']; assert.throws(() => validatePlatform(provider));
});
test('canonical snippets exactly equal no-JavaScript reference fallbacks', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  for (const workflow of knowledge.workflows) {
    const article = [...html.matchAll(/<article class="card[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].find(m => m[1] === workflow.id)[0];
    const codes = [...article.matchAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)].map(m => decode(m[1]));
    assert.deepEqual(codes, workflow.commands.map(id => knowledge.commands.find(c => c.id === id).syntax), workflow.id);
  }
});
