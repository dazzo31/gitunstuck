export const effects = ['inspect', 'local-change', 'history-rewrite', 'data-loss-potential', 'remote-publish'];
export const observationStates = ['known', 'unknown', 'not-applicable', 'contradictory'];
const require = (condition, message) => { if (!condition) throw new TypeError(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const id = value => text(value) && /^[a-z0-9-]+$/.test(value);
const texts = value => Array.isArray(value) && value.every(text);
const flags = value => texts(value) && value.length > 0 && value.every(v => effects.includes(v));
const sources = value => texts(value) && value.length > 0 && value.every(v => {
  try { return new URL(v).protocol === 'https:'; } catch { return false; }
});
export function validateCommand(value) {
  require(id(value?.id) && text(value.syntax), 'Command needs stable ID and literal syntax');
  require(/^\d+\.\d+(\.\d+)?$/.test(value.minimumGit), 'Command minimum Git version missing');
  require(flags(value.effects) && texts(value.requiredParameters), 'Invalid command effects/parameters');
  require(text(value.shellNotes) && texts(value.preflight) && value.preflight.length && texts(value.verification) && value.verification.length, 'Command preflight/verification/shell notes missing');
  require(sources(value.sources), 'Command sources must be HTTPS'); return value;
}
export function validateWorkflow(value, commandIds) {
  require(id(value?.id) && text(value.title) && text(value.category), 'Workflow metadata missing');
  require(flags(value.effects) && texts(value.commands), 'Workflow commands/effects missing');
  require(value.commands.every(v => commandIds.has(v)), 'Workflow references unknown command');
  require(texts(value.prerequisites) && value.prerequisites.length && texts(value.verification) && value.verification.length, 'Workflow prerequisites/verification missing'); return value;
}
export function validateObservation(value) {
  require(text(value?.field) && observationStates.includes(value.state), 'Observation state missing');
  require(Number.isFinite(value.confidence) && value.confidence >= 0 && value.confidence <= 1 && text(value.provenance), 'Observation confidence/provenance missing');
  require(value.state !== 'known' || value.value !== undefined, 'Known observation needs value'); return value;
}
export function validateRisk(value) {
  require(flags(value?.effects) && texts(value.affectedSurfaces), 'Risk effects/surfaces missing');
  require(texts(value.uncertainties) && text(value.explanation) && typeof value.requiresAcknowledgement === 'boolean', 'Risk reasoning/acknowledgement missing'); return value;
}
export function validatePlatform(value) {
  require(id(value?.id) && text(value.title) && text(value.reviewTerm) && text(value.ciPath), 'Provider metadata missing');
  require(value.cli === null || text(value.cli), 'Provider CLI must be known or explicitly null');
  require(sources(value.sources) && texts(value.constraints), 'Provider sources/constraints missing'); return value;
}
export function validateKnowledge(data) {
  const ids = new Set();
  for (const command of data.commands) { validateCommand(command); require(!ids.has(command.id), 'Duplicate command ID'); ids.add(command.id); }
  const workflowIds = new Set();
  for (const workflow of data.workflows) { validateWorkflow(workflow, ids); require(!workflowIds.has(workflow.id), 'Duplicate workflow ID'); workflowIds.add(workflow.id); }
  for (const [key, recipe] of Object.entries(data.undoSolutions)) {
    require(['title', 'scope', 'riskBadge', 'desc', 'code', 'effect', 'verify', 'warning'].every(f => text(recipe[f])), `Recovery ${key} incomplete`);
  }
  for (const graph of Object.values(data.graphScenarios)) {
    require(text(graph.svg) && !/(<script|foreignObject|\bon\w+\s*=|javascript:)/i.test(graph.svg), 'Bundled graph contains executable markup');
    require(texts(graph.bullets) && graph.bullets.every(v => !/<[^>]+>/.test(v.replace(/<\/?(?:strong|code|em)>/g, ''))), 'Graph explanations allow only controlled inline markup');
  }
  return data;
}
