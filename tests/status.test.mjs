import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStatus, MAX_STATUS_BYTES } from '../assets/js/status.mjs';
import { validateObservation } from '../assets/js/schema.mjs';
const H = 'a'.repeat(40); const Z = '0'.repeat(40);
const header = `# branch.oid ${H}\n# branch.head topic`;
const file = (xy, path = 'file.txt', sub = 'N...', mode = '100644') => `1 ${xy} ${sub} ${mode} ${mode} ${mode} ${H} ${H} ${path}`;
const fixtures = [
  ['attached, no upstream shown', header, { branch: 'topic', branchKind: 'attached', upstream: null, ahead: null, behind: null, hasCommit: true }],
  ['unborn branch', '# branch.oid (initial)\n# branch.head new', { branchKind: 'unborn', hasCommit: false, upstream: null }],
  ['detached HEAD', `# branch.oid ${H}\n# branch.head (detached)`, { branchKind: 'detached', branch: null }],
  ['nonstandard upstream and divergence', `${header}\n# branch.upstream team/default\n# branch.ab +3 -2`, { upstream: 'team/default', ahead: 3, behind: 2 }],
  ['staged change', `${header}\n${file('M.')}`, { staged: 1, unstaged: 0 }],
  ['unstaged change', `${header}\n${file('.M')}`, { staged: 0, unstaged: 1 }],
  ['staged and unstaged', `${header}\n${file('MM')}`, { staged: 1, unstaged: 1 }],
  ['untracked with spaces', `${header}\n? folder/new file.txt`, { untracked: 1 }],
  ['rename', `${header}\n2 R. N... 100644 100644 100644 ${H} ${H} R100 new.txt\told.txt`, { staged: 1, unstaged: 0 }],
  ['unmerged conflict', `${header}\nu UU N... 100644 100644 100644 100644 ${H} ${H} ${H} conflict.txt`, { conflicts: 1, staged: 0 }],
  ['submodule indicators', `${header}\n${file('.M', 'module', 'SC.U', '160000')}`, { unstaged: 1 }],
  ['short-sb with dotted branch', '## feature/2.0...team/default [ahead 2, behind 1]\n M file.txt\n?? new.txt', { format: 'short-sb', branch: 'feature/2.0', upstream: 'team/default', ahead: 2, behind: 1, unstaged: 1, untracked: 1 }],
  ['short unborn', '## No commits yet on initial\nA  new.txt', { branchKind: 'unborn', hasCommit: false, staged: 1 }],
  ['short detached', '## HEAD (no branch)', { branchKind: 'detached' }],
  ['short upstream gone', '## topic...team/topic [gone]', { upstream: 'team/topic', ahead: null, behind: null }],
  ['SHA-256', `# branch.oid ${'b'.repeat(64)}\n# branch.head sha256`, { hasCommit: true, headOid: 'b'.repeat(64) }]
];
for (const [name, source, expected] of fixtures) test(`status golden: ${name}`, () => {
  const result = parseStatus(source); for (const [key, value] of Object.entries(expected)) assert.equal(result[key], value, key);
  assert.equal(result.freshness, 'unknown'); assert.equal(result.remoteState, 'unknown'); assert.equal(result.operation, 'unknown');
  assert.equal(result.unknownLineCount, 0);
  result.observations.forEach(observation => validateObservation(observation));
});
test('rename paths and submodule indications are preserved literally', () => {
  assert.equal(parseStatus(fixtures[8][1]).changes[0].originalPath, 'old.txt');
  assert.equal(parseStatus(fixtures[10][1]).submodules[0].indication, 'SC.U');
});
test('missing branch metadata stays unknown despite a valid file record', () => {
  const result = parseStatus(file('A.', '<img src=x onerror=alert(1)>'));
  assert.equal(result.branchKind, 'unknown'); assert.equal(result.hasCommit, null);
  assert.equal(result.changes[0].path, '<img src=x onerror=alert(1)>');
  assert.ok(result.followUps.includes('git rev-parse --verify HEAD'));
});
test('malformed records do not produce guessed file states', () => {
  const result = parseStatus(`${header}\n1 garbage\n${file('UU')}\n2 R. N... 100644 100644 100644 ${H} ${H} R999 new\told`);
  assert.equal(result.unknownLineCount, 3); assert.equal(result.staged, 0); assert.equal(result.conflicts, 0);
});
test('contradictory headers and duplicate paths require fresh diagnostics', () => {
  assert.equal(parseStatus(`${header}\n# branch.head another`).certainty, 'contradictory');
  assert.equal(parseStatus(`${header}\n${file('M.')}\n${file('.M')}`).certainty, 'contradictory');
  assert.equal(parseStatus('# branch.head (detached)\n# branch.oid (initial)').certainty, 'contradictory');
});
test('overflow and malformed tracking counts remain unknown', () => {
  for (const source of [`${header}\n# branch.ab +999999999999999999 -0`, '## topic...team/topic [ahead 999999999999999999]', '## topic...team/topic [ahead 1, ahead 2]']) {
    const result = parseStatus(source); assert.equal(result.ahead, null); assert.ok(result.unknownLineCount > 0);
  }
});
test('empty, unsupported, NUL and oversized input fail safely', () => {
  for (const source of ['', 'On branch topic', '\0# branch.head topic', 'x'.repeat(MAX_STATUS_BYTES + 1), '界'.repeat(MAX_STATUS_BYTES / 2)]) {
    const result = parseStatus(source); assert.equal(result.format, 'unsupported'); assert.equal(result.hasCommit, null);
    assert.ok(result.followUps.includes('git status --porcelain=v2 --branch'));
  }
});
test('ANSI colors and CRLF are tolerated without accepting arbitrary controls', () => {
  const result = parseStatus(`\x1b[32m# branch.oid ${H}\x1b[0m\r\n# branch.head topic\r\n${file('M.')}`);
  assert.equal(result.branch, 'topic'); assert.equal(result.staged, 1);
});
test('zero OID in file metadata is accepted without claiming a missing HEAD', () => {
  const result = parseStatus(`${header}\n1 A. N... 000000 100644 100644 ${Z} ${H} new.txt`);
  assert.equal(result.hasCommit, true); assert.equal(result.staged, 1);
});
