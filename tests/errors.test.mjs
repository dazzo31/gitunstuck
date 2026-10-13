import test from 'node:test';
import assert from 'node:assert/strict';
import { errors, diagnoseError, validateErrors, MAX_ERROR_BYTES } from '../assets/js/errors.mjs';
test('catalogue covers 24 distinct documented families',()=>{assert.equal(errors.length,24);assert.ok(validateErrors());});
for(const item of errors) test(`canonical fixture: ${item.id}`,()=>{
 const result=diagnoseError(item.canonical,item.providers.includes('generic')?'generic':item.providers[0]);
 assert.ok(['matched','ambiguous'].includes(result.status));assert.ok(result.matches.some(x=>x.definition.id===item.id && x.score>=.85));
});
test('could not apply cannot choose cherry-pick versus rebase',()=>{
 const r=diagnoseError('error: could not apply abc1234... change');assert.equal(r.status,'ambiguous');assert.deepEqual(r.matches.filter(x=>x.score>=.85).map(x=>x.definition.id),['cherry-pick-conflict','rebase-conflict']);
});
test('policy and secret messages remain ambiguous rather than assuming a secret',()=>assert.equal(diagnoseError('GH013: Repository rule violations').status,'ambiguous'));
test('refspec is not remote permission or divergence',()=>assert.equal(diagnoseError('error: src refspec missing does not match any').matches[0].definition.id,'invalid-refspec'));
test('private remote not found retains both URL and access causes',()=>{const r=diagnoseError('remote: Repository not found.');assert.equal(r.matches[0].definition.causes.length,2);});
test('HTTPS authentication and SSH are different families',()=>{assert.equal(diagnoseError('fatal: Authentication failed').matches[0].definition.id,'https-auth');assert.equal(diagnoseError('Permission denied (publickey).').matches[0].definition.id,'ssh-auth');});
test('synonyms never have strong repair confidence',()=>{const r=diagnoseError('my push behind');assert.equal(r.status,'weak');assert.ok(r.matches.every(x=>x.score<.85));});
test('provider mismatch cannot become high confidence',()=>{const r=diagnoseError('Push cannot contain secrets','bitbucket');assert.equal(r.status,'weak');assert.equal(r.matches[0].providerMismatch,true);});
test('unknown and empty have a diagnostic return path',()=>{assert.equal(diagnoseError('something entirely unexplained').status,'none');assert.equal(diagnoseError('').status,'none');});
test('bounded UTF-8 and NUL reject input',()=>{assert.equal(diagnoseError('é'.repeat(MAX_ERROR_BYTES)).status,'unsupported');assert.equal(diagnoseError('x\0').status,'unsupported');});
test('ANSI color stripped, remaining controls unsupported',()=>{assert.equal(diagnoseError('\x1b[31mfatal: not a git repository\x1b[0m').status,'matched');assert.equal(diagnoseError('x\x07').status,'unsupported');});
test('pasted hostile text never enters trusted diagnostic commands',()=>{const r=diagnoseError('fatal: not a git repository <img onerror=alert(1)> $(id)');assert.equal(r.status,'matched');assert.deepEqual(r.matches[0].definition.diagnostics,['git rev-parse --show-toplevel']);});
test('ranking deterministic and independent of repeated calls',()=>{assert.deepEqual(diagnoseError('could not apply'),diagnoseError('could not apply'));});
test('duplicate and invalid definitions rejected',()=>{assert.throws(()=>validateErrors([errors[0],errors[0]]));assert.throws(()=>validateErrors([{...errors[0],source:'javascript:alert(1)'}]));assert.throws(()=>validateErrors([{...errors[0],diagnostics:['git reset --hard']}]));});
