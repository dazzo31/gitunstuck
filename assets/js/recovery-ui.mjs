import { recoveryFlows, buildRecoveryPlan } from './recovery.mjs';
import { textElement as node } from './dom.mjs';
import { formatSnippet } from './shell-format.mjs';
import { parseRoute } from './routing.mjs';
const el = (tag, className, text) => node(document, tag, className, text);
const intent = document.getElementById('recoveryIntent'); const contextForm = document.getElementById('recoveryContext'); const panel = document.getElementById('recoveryPlan');
let step = 0;
for (const flow of recoveryFlows) { const option = el('option', '', flow.title); option.value = flow.id; intent.append(option); }
const checked = id => document.getElementById(id).checked;
function context() { return {
  freshComplete: checked('recoveryFresh'), versionChecked: checked('recoveryVersion'), workPreserved: checked('recoveryPreserved'), targetVerified: checked('recoveryTarget'),
  operation: document.getElementById('recoveryOperation').value, lossAcknowledged: checked('recoveryLoss'), sharing: checked('recoveryUnshared') ? 'unshared' : 'unknown', historyRewriteAcknowledged: checked('recoveryRewrite'),
  ordinaryCommit: checked('recoveryOrdinary'), upstreamReviewed: checked('recoveryUpstream'), resolutionReviewed: checked('recoveryResolved'), retainedCommit: checked('recoveryRetained')
}; }
function reset() { contextForm.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = false; }); document.getElementById('recoveryOperation').value = 'unknown'; step = 0; }
function render(focus = false) {
  const state = window.GitUnstuck.getDiagnosticState?.() || null; const plan = buildRecoveryPlan(intent.value, state, context());
  contextForm.hidden = step !== 2;
  document.querySelectorAll('[data-check-intent]').forEach(label => { label.hidden = label.dataset.checkIntent !== intent.value; });
  document.getElementById('recoveryExtra').hidden = !document.querySelector(`[data-check-intent="${intent.value}"]`);
  const heading = el('h3', '', plan.title); const progress = el('p', 'v2-kicker', `Step ${step + 1} of 6 · ${plan.stages[step]}`);
  const risk = el('div', 'callout warning', `Effects: ${plan.risk.effects.join(', ')}. ${plan.risk.explanation}`);
  risk.append(el('p', '', `Affected surfaces: ${plan.risk.affectedSurfaces.join(', ')}.`));
  risk.append(el('p', '', `Uncertainties: ${plan.risk.uncertainties.join(' ')}`));
  const body = el('div', 'v2-step-body');
  const code = (text, allowCopy = true) => {
    const block = el('div', 'snippet-block'); const header = el('div', 'snippet-header', allowCopy ? 'Read the prerequisites before copying' : 'Verified substitution/manual action required');
    if (allowCopy) { const button = el('button', 'copy-btn', 'Copy'); button.type = 'button'; button.addEventListener('click', () => window.copySnippet(button)); header.append(button); }
    const pre = el('pre', 'code-content'); pre.tabIndex = 0; pre.setAttribute('aria-label', 'Recovery guidance code'); pre.append(el('code', '', formatSnippet(text, document.getElementById('shellSelect').value))); block.append(header, pre); body.append(block);
  };
  if (step === 0) { body.append(el('p', '', 'Observation: gather current output, identify the operation and inspect the proposed target. These diagnostics only inspect local state.')); code(plan.diagnostics.join('\n'), !plan.diagnostics.some(value => value.includes('<'))); }
  if (step === 1) {
    body.append(el('p', '', state ? `Pasted observations: ${state.branchKind}; ${state.staged} staged, ${state.unstaged} unstaged, ${state.conflicts} conflicts reported. No host or freshness check was performed.` : 'No supported diagnostic state is available yet. Paste and interpret status before continuing.'));
  }
  if (step === 2) body.append(el('p', '', 'Preparation: confirm the applicable facts above. These confirmations are your testimony; the website cannot verify your repository or host.'));
  if (step === 3) {
    if (!plan.ready) body.append(el('p', '', 'Mutating guidance is blocked. Return to Prepare/Inspect and resolve the missing evidence.'));
    else { body.append(el('p', '', 'Choose the stated action only. Replace verified placeholders manually, and stop if the observed state differs. No command executes here.')); plan.actions.forEach(action => code(action.syntax, action.requiredParameters.length === 0 && !action.effects.includes('data-loss-potential'))); }
  }
  if (step === 4) { body.append(el('p', '', plan.verification.join(' ') + ' Re-paste new status after the action; expected guidance is not proof of success.')); code('git status\ngit diff\ngit diff --staged\ngit log -n 5 --oneline'); }
  if (step === 5) body.append(el('p', '', plan.fallback));
  if (plan.blockers.length) { const list = el('ul', 'v2-blockers'); plan.blockers.forEach(reason => list.append(el('li', '', reason))); body.append(list); }
  const controls = el('div', 'v2-step-controls');
  const button = (label, action, disabled = false) => { const value = el('button', '', label); value.type = 'button'; value.disabled = disabled; value.addEventListener('click', action); controls.append(value); };
  button('Back', () => { step--; render(true); }, step === 0);
  if (step < 5) button('Next', () => { step++; render(true); }, step === 2 && !plan.ready);
  button('Restart', () => { reset(); render(true); });
  button('I got a different result', () => { document.getElementById('clearStatus').click(); reset(); render(true); });
  button('Copy flow link', async () => {
    const url = `${location.origin}${location.pathname}#fix/${intent.value}`;
    try { await navigator.clipboard.writeText(url); document.getElementById('liveAnnouncer').textContent = 'Flow link copied. It contains the intent only, no pasted data or targets.'; }
    catch { document.getElementById('liveAnnouncer').textContent = 'Copy unavailable. The current flow link contains only its intent.'; }
  });
  panel.replaceChildren(heading, progress, risk, body, controls);
  if (focus) { heading.tabIndex = -1; heading.focus(); }
}
contextForm.addEventListener('submit', event => event.preventDefault());
contextForm.addEventListener('change', () => render());
intent.addEventListener('change', () => { reset(); render(true); });
document.addEventListener('gitunstuck:diagnostic-changed', () => { reset(); render(); });
document.getElementById('shellSelect').addEventListener('change', () => render());
const legacy = { staged: 'unstage', unstaged: 'discard', 'local-commit': 'amend', 'pushed-commit': 'revert', 'lost-reflog': 'reflog' };
function fromRoute() {
  const route = parseRoute(location.hash); const candidate = legacy[route.item] || route.item;
  if (route.view === 'fix' && recoveryFlows.some(flow => flow.id === candidate)) {
    intent.value = candidate; reset(); render();
    setTimeout(() => { if (!document.getElementById('view-fix').hidden) { const heading = panel.querySelector('h3'); heading.tabIndex = -1; heading.focus(); } }, 0);
  }
}
window.addEventListener('hashchange', fromRoute); fromRoute(); render();
