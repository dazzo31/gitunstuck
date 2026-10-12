import './app.mjs';
import knowledge from './knowledge.mjs';
import { textElement as element } from './dom.mjs';
import { formatSnippet } from './shell-format.mjs';
import { parseRoute, viewNames } from './routing.mjs';
import './status-ui.mjs';

const el = (tag, className, text) => element(document, tag, className, text);
const views = viewNames;
const titles = { fix: 'Fix My Git', workflows: 'Workflows', reference: 'Reference', playground: 'Playground', learn: 'Learn Git' };
const view = name => document.getElementById(`view-${name}`);
const move = (selector, destination) => document.querySelectorAll(selector).forEach(node => view(destination).append(node));
move('#troubleshootConsole', 'fix');
move('.task-navigator', 'workflows');
move('#commitGraphExplorer', 'playground');
move('#beginnerPrimer, #jargonDeepDive', 'learn');
move('.filter-controls-container, #searchFeedback, #cardsGrid, #noResults', 'reference');
const preferences = { provider: ['generic', 'github', 'gitlab', 'bitbucket'], shell: ['powershell', 'bash', 'cmd'] };
function readPreference(key, fallback) {
  try { const value = localStorage.getItem(`gitunstuck.${key}`); return preferences[key].includes(value) ? value : fallback; }
  catch { return fallback; }
}
function savePreference(key, value) { try { localStorage.setItem(`gitunstuck.${key}`, value); } catch {} }
const host = document.getElementById('providerSelect'); const shell = document.getElementById('shellSelect');
host.value = readPreference('provider', 'generic'); shell.value = readPreference('shell', 'powershell');
function showShellNote() {
  document.getElementById('shellNote').textContent = `${host.selectedOptions[0].textContent} · ${shell.selectedOptions[0].textContent}. ` + (shell.value === 'cmd' ? 'Comment lines use REM. ' : shell.value === 'powershell' ? 'PowerShell examples avoid && for 5.1 compatibility. ' : 'Comment lines use #. ') + 'Replace placeholders and quote paths with spaces. Each action requires its stated prerequisites.';
  window.GitUnstuck.applyShell(shell.value);
}
host.addEventListener('change', () => { savePreference('provider', host.value); showShellNote(); });
shell.addEventListener('change', () => { savePreference('shell', shell.value); showShellNote(); if (activeWorkflow) renderWorkflow(false); });
document.getElementById('resetPreferences').addEventListener('click', () => {
  host.value = 'generic'; shell.value = 'powershell';
  savePreference('provider', host.value); savePreference('shell', shell.value);
  window.GitUnstuck.setMode('beginner'); window.GitUnstuck.setTheme(matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  showShellNote();
});
let activeRoute = 'fix'; let activeWorkflow = null; let workflowStep = 0;
function selectRoute(event) {
  const { view: candidate, item, legacy } = parseRoute(location.hash);
  const target = legacy ? document.getElementById(legacy) : null;
  activeRoute = candidate || target?.closest('.v2-view')?.id.replace('view-', '') || 'fix';
  for (const name of views) view(name).hidden = name !== activeRoute;
  document.body.classList.toggle('is-searching', activeRoute === 'reference' && document.getElementById('searchInput').value.trim().length > 0);
  document.querySelectorAll('#v2NavLinks a').forEach(link => {
    if (link.hash === `#${activeRoute}`) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  document.getElementById('routeBreadcrumb').textContent = `GitUnstuck / ${titles[activeRoute]}`;
  document.getElementById('mobileNavToggle').setAttribute('aria-expanded', 'false');
  document.getElementById('v2NavLinks').classList.remove('expanded');
  if (activeRoute === 'fix' && item && Object.hasOwn(knowledge.undoSolutions, item)) {
    document.querySelector(`[data-location="${item}"]`)?.click();
    const heading = document.querySelector('#treeSolutionPanel h3'); if (heading) { heading.tabIndex = -1; heading.focus(); }
  }
  if (activeRoute === 'workflows' && item) {
    activeWorkflow = knowledge.workflows.find(recipe => recipe.id === item) || null; workflowStep = 0;
    if (activeWorkflow) renderWorkflow(); else document.getElementById('workflowStepper').hidden = true;
  }
  if (target && !views.includes(candidate)) { target.tabIndex = -1; target.scrollIntoView({ block: 'start', behavior: 'auto' }); target.focus(); }
  if (event?.type === 'hashchange' && !item && !target) { const destination = view(activeRoute).querySelector('h2') || view(activeRoute); destination.tabIndex = -1; destination.focus(); }
}
window.addEventListener('hashchange', selectRoute);
document.getElementById('mobileNavToggle').addEventListener('click', event => {
  const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
  event.currentTarget.setAttribute('aria-expanded', String(open)); document.getElementById('v2NavLinks').classList.toggle('expanded', open);
});
document.querySelectorAll('[data-recovery]').forEach(button => button.addEventListener('click', () => {
  const same = location.hash === `#fix/${button.dataset.recovery}`;
  location.hash = `fix/${button.dataset.recovery}`;
  if (same) selectRoute();
}));
document.getElementById('searchInput').addEventListener('input', () => { if (activeRoute !== 'reference') location.hash = 'reference'; });
document.querySelectorAll('.task-chip').forEach(button => button.addEventListener('click', () => { location.hash = button.dataset.target; }));

const choices = document.getElementById('workflowChoices');
for (const recipe of knowledge.workflows) {
  const link = el('a', '', recipe.title); link.href = `#workflows/${recipe.id}`;
  link.append(el('span', '', recipe.effects.join(' · '))); choices.append(link);
}
function renderWorkflow(focus = true) {
  const panel = document.getElementById('workflowStepper'); panel.hidden = false;
  const labels = ['Inspect', 'Decide', 'Act', 'Verify'];
  const heading = el('h3', '', activeWorkflow.title); const progress = el('p', 'v2-kicker', `Step ${workflowStep + 1} of 4 · ${labels[workflowStep]}`);
  const warning = el('p', 'callout warning', `Effects: ${activeWorkflow.effects.join(', ')}. Preserve wanted changes, verify targets, and choose one action. Rewriting, discarding and publishing may affect other people or lose work.`);
  const body = el('div', 'v2-step-body');
  const code = text => { const pre = el('pre', 'code-content'); pre.tabIndex = 0; pre.setAttribute('aria-label', 'Code example'); pre.append(el('code', '', formatSnippet(text, shell.value))); const block = el('div', 'snippet-block'); block.append(pre); body.append(block); };
  if (workflowStep === 0) { body.append(el('p', '', 'Observation: inspect the current branch, working files and staged changes. These commands do not change history.')); code('git status\ngit branch -vv\ngit diff\ngit diff --staged'); }
  if (workflowStep === 1) body.append(el('p', '', `Decision: ${activeWorkflow.prerequisites.join(' ')} Stop if an operation is in progress or targets/ownership are unknown. Confirm the intended outcome; do not choose an action solely from its name.`));
  if (workflowStep === 2) {
    body.append(el('p', '', 'Action options: replace placeholders, inspect the recipe, and execute only the chosen step after its prerequisites hold. These examples are not a script to run as a whole.'));
    activeWorkflow.commands.forEach(id => code(knowledge.commands.find(command => command.id === id).syntax));
  }
  if (workflowStep === 3) { body.append(el('p', '', `Expected outcome: ${activeWorkflow.verification.join(' ')} Inspect the actual result, not just the exit message.`)); code('git status\ngit log -n 5 --oneline'); }
  const controls = el('div', 'v2-step-controls');
  for (const [label, action, disabled] of [
    ['Back', () => { workflowStep--; renderWorkflow(); }, workflowStep === 0],
    [workflowStep === 3 ? 'Restart' : 'Next', () => { workflowStep = (workflowStep + 1) % 4; renderWorkflow(); }, false],
    ['I got a different result', () => { workflowStep = 0; renderWorkflow(); document.getElementById('liveAnnouncer').textContent = 'Return to observation. Inspect status before taking another action.'; }, false]
  ]) { const button = el('button', '', label); button.type = 'button'; button.disabled = disabled; button.addEventListener('click', action); controls.append(button); }
  panel.replaceChildren(heading, progress, warning, body, controls);
  if (focus) { heading.tabIndex = -1; heading.focus(); }
}
showShellNote(); selectRoute();
