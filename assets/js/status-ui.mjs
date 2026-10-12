import { parseStatus, MAX_STATUS_BYTES } from './status.mjs';
import { textElement as node } from './dom.mjs';
const input = document.getElementById('statusInput'); const output = document.getElementById('statusResults');
const el = (tag, className, text) => node(document, tag, className, text);
document.getElementById('interpretStatus').addEventListener('click', () => {
  const state = parseStatus(input.value);
  const heading = el('h3', '', state.format === 'unsupported' ? 'More diagnostic evidence needed' : 'What the pasted output reports');
  heading.tabIndex = -1;
  const description = el('p', '', `Format: ${state.format}. Evidence is partial${state.certainty === 'contradictory' ? ' and contradictory' : ''}. These are observations from pasted text, not a live repository or remote check.`);
  const details = el('dl', 'v2-status-facts');
  const fields = [
    ['Branch state', state.branchKind], ['Branch name', state.branch || 'unknown'], ['Commit present', state.hasCommit === null ? 'unknown' : state.hasCommit ? 'OID reported' : 'no commit reported'],
    ['Upstream shown', state.upstream || 'unknown'], ['Ahead / behind shown', `${state.ahead ?? 'unknown'} / ${state.behind ?? 'unknown'}`],
    ['Staged changes shown', state.staged], ['Unstaged changes shown', state.unstaged], ['Untracked shown', state.untracked], ['Conflicts shown', state.conflicts],
    ['Ongoing operation', 'unknown — inspect full git status'], ['Freshness / current remote state', 'unknown / unknown']
  ];
  if (state.format !== 'unsupported') for (const [label, value] of fields) details.append(el('dt', '', label), el('dd', '', value));
  const caution = el('div', 'callout warning', state.warnings.join(' '));
  if (state.submodules.length) caution.append(el('p', '', 'Submodule indicators require separate inspection within the submodule before any mutating action.'));
  const paths = el('details', 'v2-status-paths'); paths.append(el('summary', '', 'Show reported paths (local to this tab)'));
  const list = el('ul'); state.changes.slice(0, 200).forEach(change => list.append(el('li', '', `${change.kind} · ${change.xy} · ${change.path}`))); paths.append(list);
  const next = el('h4', '', 'Next read-only diagnostics');
  const pre = el('pre', 'code-content'); pre.tabIndex = 0; pre.setAttribute('aria-label', 'Read-only diagnostic commands'); pre.append(el('code', '', state.followUps.join('\n')));
  const block = el('div', 'snippet-block'); const header = el('div', 'snippet-header', 'Inspect before choosing an action');
  const copy = el('button', 'copy-btn', 'Copy'); copy.type = 'button'; copy.setAttribute('aria-label', 'Copy read-only diagnostics'); copy.addEventListener('click', () => window.copySnippet(copy)); header.append(copy); block.append(header, pre);
  output.replaceChildren(heading, description, details, caution, paths, next, block); output.hidden = false; heading.focus();
  // Ephemeral tab-only state; never persist or log input/output.
  window.GitUnstuck.getDiagnosticState = () => state;
  document.dispatchEvent(new CustomEvent('gitunstuck:diagnostic-changed'));
});
document.getElementById('clearStatus').addEventListener('click', () => {
  input.value = ''; output.replaceChildren(); output.hidden = true;
  window.GitUnstuck.getDiagnosticState = () => null; input.focus();
  document.dispatchEvent(new CustomEvent('gitunstuck:diagnostic-changed'));
});
input.maxLength = MAX_STATUS_BYTES;
input.addEventListener('input', () => { output.hidden = true; window.GitUnstuck.getDiagnosticState = () => null; document.dispatchEvent(new CustomEvent('gitunstuck:diagnostic-changed')); });
