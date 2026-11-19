const assert = require('node:assert/strict');
const { Worker, isMainThread, parentPort } = require('node:worker_threads');
const { analyze } = require('../recovery.js');

if (!isMainThread) {
  // The former section-wide regex takes several seconds on this capped input.
  for (const input of [
    'Untracked files:\n' + ' '.repeat(100000) + 'x',
    '?? ' + ' '.repeat(100000) + 'x',
    'Untracked files:\n' + '\n'.repeat(100000) + 'x',
    'Untracked files:\n' + '  ordinary.txt\n'.repeat(6000)
  ]) assert.equal(analyze(input).recipeKey, 'inspect');
  parentPort.postMessage('done');
} else {
  for (const file of ['.env', '.env.local', 'id_rsa', 'id_ed25519', 'secrets.json', 'cert.pem', 'private.key', 'dir/.env', 'dir\\private.key', 'folder with spaces/.env']) {
    for (const input of ['Untracked files:\n  ' + file, '?? ' + file]) {
      assert.equal(analyze(input).recipeKey, 'sensitive', input);
    }
  }
  for (const input of [
    'Untracked files:\n  ordinary.txt',
    'Untracked files:\n  ordinary.txt\nChanges not staged for commit:\n  .env',
    'Untracked files:\n  ordinary.txt\n\nOn branch example\n  private.key',
    '?? ordinary.txt\n  .env',
    'Untracked files:\n  ordinary.env'
  ]) assert.equal(analyze(input).recipeKey, 'inspect', input);
  assert.equal(analyze('Untracked files:\n  ordinary.txt\n  nested/.env').recipeKey, 'sensitive');

  const worker = new Worker(__filename);
  const timeout = setTimeout(() => {
    worker.terminate();
    console.error('FAIL: adversarial analyzer inputs exceeded two seconds');
    process.exitCode = 1;
  }, 2000);
  worker.on('error', error => { clearTimeout(timeout); throw error; });
  worker.on('exit', code => {
    clearTimeout(timeout);
    if (code !== 0) process.exitCode = 1;
  });
  worker.on('message', () => console.log('PASS sensitive filename detection and bounded adversarial input analysis'));
}
