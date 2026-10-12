export const MAX_STATUS_BYTES = 102400;
const oid = '(?:[0-9a-f]{40}|[0-9a-f]{64})';
const sub = '(?:N\\.\\.\\.|S[.C][.M][.U])';
const mode = '[0-7]{6}';
const normal = new RegExp(`^1 ([.MADRCUT]{2}) (${sub}) ${mode} ${mode} ${mode} (${oid}) (${oid}) (.+)$`);
const renamed = new RegExp(`^2 ([.MADRCUT]{2}) (${sub}) ${mode} ${mode} ${mode} (${oid}) (${oid}) ([RC]\\d{1,3}) (.+)\\t(.+)$`);
const unmerged = new RegExp(`^u (DD|AU|UD|UA|DU|AA|UU) (${sub}) ${mode} ${mode} ${mode} ${mode} ${oid} ${oid} ${oid} (.+)$`);
const conflictCodes = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);
function reference(value) { return value.length > 0 && !/[\s\x00-\x1f\x7f]/.test(value); }
export function parseStatus(input) {
  const state = {
    format: 'unsupported', certainty: 'partial', branchKind: 'unknown', branch: null, headOid: null, hasCommit: null,
    upstream: null, ahead: null, behind: null, staged: 0, unstaged: 0, untracked: 0, ignored: 0, conflicts: 0,
    changes: [], submodules: [], warnings: [], unknownLineCount: 0, freshness: 'unknown', remoteState: 'unknown', operation: 'unknown',
    observations: [], followUps: []
  };
  const followUps = new Set(['git status --porcelain=v2 --branch']);
  const warn = message => { if (!state.warnings.includes(message)) state.warnings.push(message); };
  const finish = () => {
    if (state.branchKind === 'unknown' || state.hasCommit === null) followUps.add('git rev-parse --verify HEAD');
    if (state.upstream === null) followUps.add('git branch -vv');
    if (state.conflicts) followUps.add('git status');
    if (state.ahead || state.behind) followUps.add('git log --oneline --graph --decorate --all -n 20');
    if (state.unknownLineCount) warn('Some records were not recognized. Do not infer a complete repository state.');
    warn('Pasted status is partial evidence: freshness, current remote state and ongoing operation remain unknown.');
    state.followUps = [...followUps];
    for (const [field, value] of [['branch', state.branch], ['headOid', state.headOid], ['upstream', state.upstream], ['ahead', state.ahead], ['behind', state.behind], ['operation', null], ['freshness', null], ['remoteState', null]]) {
      state.observations.push({ field, value, state: state.certainty === 'contradictory' && ['branch', 'headOid', 'upstream', 'ahead', 'behind'].includes(field) ? 'contradictory' : value === null ? 'unknown' : 'known', confidence: value === null ? 0 : 1, provenance: `pasted ${state.format}; parsing confidence does not establish freshness` });
    }
    return state;
  };
  if (typeof input !== 'string' || !input.trim()) { warn('Paste supported status output to begin.'); return finish(); }
  if (new TextEncoder().encode(input).length > MAX_STATUS_BYTES) { warn('Input exceeds the 100 KiB limit.'); return finish(); }
  const text = input.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)) { warn('Unsupported control characters. Use non-NUL status output.'); return finish(); }
  const lines = text.split(/\r?\n/).filter(line => line !== '');
  state.format = lines.some(line => /^# branch\.|^[12u?!] /.test(line)) ? 'porcelain-v2' : lines[0].startsWith('## ') ? 'short-sb' : 'unsupported';
  if (state.format === 'unsupported') { state.unknownLineCount = lines.length; warn('Unsupported format. Use porcelain v2 --branch or the scoped status -sb format.'); return finish(); }
  const headers = new Map(); const paths = new Set();
  function changed(xy, path, submodule = null, kind = 'tracked', originalPath = null) {
    if (paths.has(path)) { state.certainty = 'contradictory'; warn('Duplicate file records make change counts unreliable.'); }
    paths.add(path);
    if (kind === 'untracked') state.untracked++;
    else if (kind === 'ignored') state.ignored++;
    else if (kind === 'conflict') state.conflicts++;
    else { if (!['.', ' '].includes(xy[0])) state.staged++; if (!['.', ' '].includes(xy[1])) state.unstaged++; }
    if (submodule?.startsWith('S')) state.submodules.push({ path, indication: submodule });
    state.changes.push({ xy, path, originalPath, kind, submodule });
  }
  for (const line of lines) {
    if (state.format === 'porcelain-v2') {
      const header = line.match(/^# (branch\.(?:oid|head|upstream|ab)) (.+)$/);
      if (header) {
        const [, key, value] = header;
        if (headers.has(key) && headers.get(key) !== value) { state.certainty = 'contradictory'; warn('Contradictory branch headers; gather fresh status before acting.'); }
        headers.set(key, value); continue;
      }
      if (/^# stash \d+$/.test(line)) continue;
      const one = line.match(normal); const two = line.match(renamed); const conflict = line.match(unmerged);
      if (one && !one[1].includes('U') && one[3].length === one[4].length) { changed(one[1], one[5], one[2]); continue; }
      if (two && !two[1].includes('U') && two[3].length === two[4].length && Number(two[5].slice(1)) <= 100) { changed(two[1], two[6], two[2], 'rename-or-copy', two[7]); continue; }
      if (conflict) { changed(conflict[1], conflict[3], conflict[2], 'conflict'); continue; }
      if (/^[?!] .+$/.test(line)) { changed(line[0], line.slice(2), null, line[0] === '?' ? 'untracked' : 'ignored'); continue; }
      state.unknownLineCount++;
    } else {
      if (line.startsWith('## ')) {
        if (headers.has('short')) { state.certainty = 'contradictory'; warn('Multiple short-status branch headers; use fresh canonical output.'); }
        headers.set('short', line.slice(3)); continue;
      }
      const match = line.match(/^([ MADRCUT?!]{2}) (.+)$/);
      if (!match) { state.unknownLineCount++; continue; }
      const [, xy, path] = match;
      changed(xy, path, null, conflictCodes.has(xy) ? 'conflict' : xy === '??' ? 'untracked' : xy === '!!' ? 'ignored' : 'tracked');
    }
  }
  if (state.format === 'porcelain-v2') {
    const head = headers.get('branch.head'); const object = headers.get('branch.oid');
    if (head === '(detached)') state.branchKind = 'detached';
    else if (head && reference(head)) { state.branch = head; state.branchKind = 'attached'; }
    else if (head) { state.unknownLineCount++; warn('Unrecognized branch header.'); }
    if (object === '(initial)') { state.hasCommit = false; if (state.branchKind === 'attached') state.branchKind = 'unborn'; else if (state.branchKind === 'detached') { state.certainty = 'contradictory'; warn('Unborn and detached headers contradict each other.'); } }
    else if (object && new RegExp(`^${oid}$`).test(object)) { state.headOid = object; state.hasCommit = true; }
    else if (object) state.unknownLineCount++;
    const upstream = headers.get('branch.upstream'); if (upstream && reference(upstream)) state.upstream = upstream; else if (upstream) state.unknownLineCount++;
    const ab = headers.get('branch.ab'); const match = ab?.match(/^\+(\d+) -(\d+)$/);
    if (match && match.slice(1).every(value => Number.isSafeInteger(Number(value)))) { state.ahead = Number(match[1]); state.behind = Number(match[2]); }
    else if (ab) state.unknownLineCount++;
  } else {
    const header = headers.get('short') || '';
    const initial = header.match(/^(?:No commits yet on|Initial commit on) (.+)$/);
    if (initial && reference(initial[1])) { state.branch = initial[1]; state.branchKind = 'unborn'; state.hasCommit = false; }
    else if (header === 'HEAD (no branch)') state.branchKind = 'detached';
    else {
      const match = header.match(/^(.+?)(?:\.\.\.([^ ]+))?(?: \[([^\]]+)\])?$/);
      if (match && reference(match[1])) {
        state.branch = match[1]; state.branchKind = 'attached'; state.upstream = match[2] || null;
        const summary = match[3];
        if (summary) {
          if (/^(?:ahead \d+|behind \d+)(?:, (?:ahead \d+|behind \d+))?$/.test(summary)) {
            const ahead = summary.match(/ahead (\d+)/); const behind = summary.match(/behind (\d+)/);
            const numbers = [ahead?.[1], behind?.[1]].filter(Boolean);
            if (numbers.every(value => Number.isSafeInteger(Number(value))) && new Set(summary.split(', ').map(part => part.split(' ')[0])).size === summary.split(', ').length) {
              state.ahead = ahead ? Number(ahead[1]) : null; state.behind = behind ? Number(behind[1]) : null;
            } else { state.unknownLineCount++; warn('Invalid ahead/behind counts.'); }
          } else if (summary !== 'gone') { state.unknownLineCount++; warn('Unsupported tracking summary.'); }
          else warn('Upstream tracking ref is reported gone locally; current remote availability is unknown.');
        }
      } else { state.unknownLineCount++; warn('Unsupported short-status branch header.'); }
    }
  }
  return finish();
}
