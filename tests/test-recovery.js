/* Executes the authored recipe commands in disposable repositories. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {recipes,analyze} = require('../recovery.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gitunstuck-recovery-'));
const env = {...process.env, GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null', GIT_TERMINAL_PROMPT:'0', GIT_EDITOR:'true', GIT_SEQUENCE_EDITOR:'true', GIT_MERGE_AUTOEDIT:'no'};
let passed=0;
function git(cwd,...args) {
  const r=spawnSync('git',args,{cwd,env,encoding:'utf8'});
  assert.equal(r.status,0,`${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
  return r.stdout.trim();
}
function write(repo,name,content){fs.writeFileSync(path.join(repo,name),content);}
function read(repo,name){return fs.readFileSync(path.join(repo,name),'utf8');}
function init(name='main') {
  const dir=fs.mkdtempSync(path.join(root,'repo with spaces-'));
  git(dir,'init','-b',name);git(dir,'config','user.name','Recovery Test');git(dir,'config','user.email','recovery@example.invalid');git(dir,'config','commit.gpgSign','false');git(dir,'config','core.autocrlf','false');
  write(dir,'tracked file.txt','base\n');git(dir,'add','.');git(dir,'commit','-m','base');return dir;
}
function snapshot(repo){return {head:git(repo,'rev-parse','HEAD'),status:git(repo,'status','--porcelain'),index:git(repo,'diff','--cached','--binary'),working:git(repo,'diff','--binary'),untracked:git(repo,'ls-files','--others','--exclude-standard')};}
function command(recipe,step,vars={}) {
  return recipes[recipe].steps[step].code.replace(/\b(?:REVIEW_BRANCH|REMOTE_BRANCH|LOCAL_BRANCH|RESCUE_BRANCH|BACKUP_BRANCH|EXPECTED_REMOTE_SHA|SECRET_FILE|SOURCE_FILE|RESOLVED_FILE|OUTGOING_RANGE|UPSTREAM_REF|WORKTREE_PATH|TARGET_BRANCH|BASE_COMMIT|GOOD_COMMIT|BAD_COMMIT|RELEASE_TAG|COMMIT_ID|REPOSITORY_URL|CLONE_DIRECTORY|INITIAL_BRANCH|NEW_BRANCH|BRANCH|REMOTE|FILE)\b/g, k=>{assert.ok(k in vars,`Missing ${k} in ${recipe}`);assert.ok(!/["\r\n`$;&|]/.test(vars[k]),'Fixture value must be shell-neutral');return vars[k];});
}
function step(repo,recipe,i,vars={}) {
  // The recipes use only Git commands with double-quoted arguments. Execute
  // their exact argv without an intermediate shell; separate shell checks
  // below verify the identical authored text in PowerShell and Bash.
  const output=[];
  for(const line of command(recipe,i,vars).split('\n')) {
    const args=[...line.matchAll(/"([^"]*)"|([^\s"]+)/g)].map(m=>m[1]??m[2]);
    assert.equal(args.shift(),'git');output.push(git(repo,...args));
  }
  return output.join('\n');
}
function test(name,fn){fn();passed++;console.log(`PASS ${name}`);}
function bare(){const d=fs.mkdtempSync(path.join(root,'remote with spaces-'));git(d,'init','--bare');return d;}
function noCredential(repo,revision,credential){
  for(const id of git(repo,'rev-list',revision).split('\n').filter(Boolean)) {
    const r=spawnSync('git',['grep','-F',credential,id],{cwd:repo,env,encoding:'utf8'});
    assert.equal(r.status,1,`Credential remains reachable in ${id}: ${r.stdout}`);
  }
}
try {
  test('GH013 and generic hook failures cannot diagnose a secret',()=>{
    for(const text of ['GH013: Repository rule violations found','pre-receive hook declined','arbitrary noise','both modified: tracked file.txt','Unmerged paths:']) {const r=analyze(text);assert.equal(r.recipeKey,'inspect');assert.equal(r.title,'Not enough information.');assert.equal(r.risk,'Unknown');}
    assert.equal(analyze('Push cannot contain secrets').recipeKey,'secret');
    assert.equal(analyze('Authentication failed\nPush cannot contain secrets').recipeKey,'inspect');
  });
  test('latest commit: accidentally tracked secret file with spaces',()=>{
    const r=init();const remote=bare();git(r,'remote','add','team',remote);git(r,'push','team','HEAD:main');const base=git(r,'rev-parse','HEAD');
    const file='private config.env',credential='TEST-CREDENTIAL-file-938462';write(r,file,credential);git(r,'add','--',file);git(r,'commit','-m','accidental file');
    const badTip=git(r,'rev-parse','HEAD');write(r,'.gitignore','/private config.env\n');
    for(let i=0;i<recipes.secretFile.steps.length;i++)step(r,'secretFile',i,{SECRET_FILE:file,OUTGOING_RANGE:`${base}..HEAD`});
    assert.equal(read(r,file),credential);assert.equal(git(r,'ls-files','--',file),'');assert.equal(git(r,'log',`${base}..HEAD`,'--',file),'');noCredential(r,'HEAD',credential);
    git(r,'push','team','HEAD:main');assert.equal(git(remote,'rev-parse','refs/heads/main'),git(r,'rev-parse','HEAD'));noCredential(remote,'refs/heads/main',credential);
    assert.notEqual(git(r,'rev-parse','HEAD'),badTip);git(r,'cat-file','-e',badTip); // old objects explicitly remain local
  });
  test('latest commit: remove credential inside legitimate source',()=>{
    const r=init();const credential='TEST-CREDENTIAL-source-284662';write(r,'source file.js',`module.exports = '${credential}';\n`);git(r,'add','.');git(r,'commit','-m','source with credential');
    write(r,'source file.js','module.exports = process.env.EXISTING_TOKEN;\n');
    for(let i=0;i<recipes.secretSource.steps.length;i++)step(r,'secretSource',i,{SOURCE_FILE:'source file.js',OUTGOING_RANGE:'HEAD'});
    noCredential(r,'HEAD',credential);assert.equal(git(r,'ls-files','--','source file.js'),'source file.js');assert.equal(read(r,'source file.js'),'module.exports = process.env.EXISTING_TOKEN;\n');assert.equal(git(r,'status','--porcelain'),'');
  });
  test('earlier secret: inspection never claims history is cleaned',()=>{
    const r=init(),remote=bare();git(r,'remote','add','team',remote);git(r,'push','team','HEAD:main');const base=git(r,'rev-parse','HEAD');const credential='TEST-CREDENTIAL-earlier-382649';write(r,'source.js',credential);git(r,'add','.');git(r,'commit','-m','earlier leak');write(r,'tracked file.txt','later\n');git(r,'commit','-am','later');
    const before=snapshot(r);let inspection='';for(let i=0;i<recipes.secret.steps.length;i++)inspection+=step(r,'secret',i,{REMOTE:'team',OUTGOING_RANGE:`${base}..HEAD`});
    assert.ok(inspection.includes(credential),'The authored outgoing-history inspection must show the earlier secret in the full patch');assert.equal(git(r,'rev-parse','team/main'),base);
    assert.deepEqual(snapshot(r),before);assert.ok(git(r,'show','HEAD:source.js').includes(credential));assert.match(recipes.secret.failure,/Earlier commits/);
    // Demonstrate why unsupported tip-only cleanup cannot erase an ancestor.
    write(r,'source.js','removed at tip\n');git(r,'add','source.js');git(r,'commit','--amend','--no-edit');assert.ok(git(r,'show','HEAD~1:source.js').includes(credential));
  });
  for(const branch of ['main','master','custom/release'])test(`protected branch preserves staged, unstaged and untracked work on ${branch}`,()=>{
    const r=init(branch),remote=bare();git(r,'remote','add','team',remote);git(r,'push','team',`HEAD:refs/heads/${branch}`);
    write(r,'tracked file.txt','committed review\n');git(r,'commit','-am','review commit');const start=git(r,'rev-parse','HEAD');
    write(r,'tracked file.txt','staged version\n');git(r,'add','--','tracked file.txt');write(r,'tracked file.txt','working version\n');write(r,'untracked file.txt','untracked\n');const before=snapshot(r);
    const vars={REVIEW_BRANCH:'review/change',REMOTE:'team'};for(let i=0;i<recipes.protected.steps.length;i++)step(r,'protected',i,vars);
    assert.equal(read(r,'tracked file.txt'),'working version\n');assert.equal(read(r,'untracked file.txt'),'untracked\n');const after=snapshot(r);assert.deepEqual(after,before);
    assert.equal(git(r,'rev-parse',branch),start);assert.equal(git(remote,'rev-parse','refs/heads/review/change'),start);
    assert.equal(git(remote,'ls-tree','-r','--name-only','refs/heads/review/change').includes('untracked file.txt'),false);
  });
  if (!process.argv.includes('--smoke')) {
    test('existing backup and rescue branches fail without replacing history',()=>{
      const r=init();git(r,'branch','existing-backup');const before=snapshot(r);const existing=git(r,'rev-parse','existing-backup');
      for(const recipe of ['snapshot','rewind']) {
        const line=command(recipe,recipe==='snapshot'?1:0,{BACKUP_BRANCH:'existing-backup'});const args=[...line.matchAll(/"([^"]*)"|([^\s"]+)/g)].map(m=>m[1]??m[2]).slice(1);const result=spawnSync('git',args,{cwd:r,env,encoding:'utf8'});assert.notEqual(result.status,0);assert.deepEqual(snapshot(r),before);assert.equal(git(r,'rev-parse','existing-backup'),existing);
      }
      git(r,'switch','--detach','HEAD');const detached=snapshot(r);const result=spawnSync('git',['switch','-c','existing-backup'],{cwd:r,env,encoding:'utf8'});assert.notEqual(result.status,0);assert.deepEqual(snapshot(r),detached);
    });
    test('snapshot restores staged-only, unstaged and untracked content, keeps ignored work and older stash',()=>{
      const r=init();write(r,'tracked file.txt','older stash\n');git(r,'stash','push','-m','older');const older=git(r,'rev-parse','refs/stash');
      write(r,'.gitignore','ignored file.txt\n');git(r,'add','.gitignore');git(r,'commit','-m','ignore rule');write(r,'ignored file.txt','ignored\n');
      write(r,'tracked file.txt','staged\n');git(r,'add','.');write(r,'tracked file.txt','unstaged\n');write(r,'new file.txt','new\n');const before=snapshot(r);
      for(let i=0;i<recipes.snapshot.steps.length;i++)step(r,'snapshot',i,{BACKUP_BRANCH:'backup-before-fix'});
      assert.deepEqual(snapshot(r),before);assert.equal(read(r,'ignored file.txt'),'ignored\n');assert.equal(read(r,'new file.txt'),'new\n');assert.equal(git(r,'rev-parse','stash@{1}'),older);assert.equal(git(r,'stash','list').split('\n').length,2);
    });
    test('untracked sensitive-name observation preserves the file and does not claim history cleanup',()=>{
      const r=init();write(r,'.env','local fixture value\n');const before=snapshot(r);assert.equal(analyze(git(r,'status')).recipeKey,'sensitive');step(r,'sensitive',0,{FILE:'.env'});assert.deepEqual(snapshot(r),before);write(r,'.gitignore','/.env\n');step(r,'sensitive',1,{FILE:'.env'});assert.equal(read(r,'.env'),'local fixture value\n');assert.equal(git(r,'ls-files','--','.env'),'');assert.equal(git(r,'check-ignore','--','.env'),'.env');
    });
    for(const operation of ['merge','rebase'])test(`${operation} conflict with spaces selects and executes its own continuation`,()=>{
      const r=init();git(r,'switch','-c','other');write(r,'tracked file.txt','other\n');git(r,'commit','-am','other change');git(r,'switch','main');write(r,'tracked file.txt','main\n');git(r,'commit','-am','main change');
      const result=spawnSync('git',operation==='merge'?['merge','other']:['rebase','other'],{cwd:r,env,encoding:'utf8'});assert.notEqual(result.status,0);
      const status=git(r,'status');assert.equal(analyze(status).recipeKey,operation);assert.match(status,/both modified:/);assert.ok(git(r,'diff','--name-only','--diff-filter=U').includes('tracked file.txt'));
      step(r,operation,0);write(r,'tracked file.txt','resolved both\n');step(r,operation,1,{RESOLVED_FILE:'tracked file.txt'});step(r,operation,2);
      assert.equal(git(r,'diff','--name-only','--diff-filter=U'),'');assert.equal(git(r,'status','--porcelain'),'');assert.equal(read(r,'tracked file.txt'),'resolved both\n');assert.equal(analyze(git(r,'status')).recipeKey,'inspect');
      if(operation==='merge')assert.equal(git(r,'rev-list','--parents','-1','HEAD').split(' ').length,3);
    });
    test('detached rescue retains exact commit and dirty index/work',()=>{
      const r=init();git(r,'switch','--detach','HEAD');write(r,'tracked file.txt','detached commit\n');git(r,'commit','-am','detached');write(r,'tracked file.txt','staged\n');git(r,'add','.');write(r,'tracked file.txt','unstaged\n');const before=snapshot(r);
      for(let i=0;i<recipes.detached.steps.length;i++)step(r,'detached',i,{RESCUE_BRANCH:'rescue/current'});
      assert.deepEqual(snapshot(r),before);assert.equal(git(r,'branch','--show-current'),'rescue/current');
    });
    test('reflog creates a reference to an inspected full hash without switching dirty work',()=>{
      const r=init();write(r,'tracked file.txt','lost commit\n');git(r,'commit','-am','lost');const lost=git(r,'rev-parse','HEAD');git(r,'reset','--soft','HEAD~1');write(r,'untracked file.txt','keep\n');const before=snapshot(r);
      for(let i=0;i<recipes.reflog.steps.length;i++)step(r,'reflog',i,{COMMIT_ID:lost,RESCUE_BRANCH:'rescue/lost'});
      assert.equal(git(r,'rev-parse','rescue/lost'),lost);assert.deepEqual(snapshot(r),before);assert.equal(git(r,'show','rescue/lost:tracked file.txt'),'lost commit');
    });
    test('unstage leaves disk alone but replaces a distinct staged-only snapshot',()=>{
      const r=init();write(r,'tracked file.txt','staged-only\n');git(r,'add','.');write(r,'tracked file.txt','working\n');step(r,'unstage',0,{FILE:'tracked file.txt'});assert.equal(read(r,'tracked file.txt'),'working\n');assert.equal(git(r,'diff','--cached'),'');assert.equal(git(r,'show',':tracked file.txt'),'base');
    });
    test('discard restores the index version rather than assuming HEAD',()=>{
      const r=init();write(r,'tracked file.txt','staged\n');git(r,'add','.');write(r,'tracked file.txt','discard me\n');step(r,'discard',0,{FILE:'tracked file.txt'});assert.equal(read(r,'tracked file.txt'),'staged\n');assert.notEqual(git(r,'diff','--cached'),'');assert.equal(git(r,'diff'),'');
    });
    test('unpublished rewind retains original tree in index and backup reachability',()=>{
      const r=init();const parent=git(r,'rev-parse','HEAD');write(r,'tracked file.txt','new commit\n');git(r,'commit','-am','new');const tip=git(r,'rev-parse','HEAD');for(let i=0;i<recipes.rewind.steps.length;i++)step(r,'rewind',i,{BACKUP_BRANCH:'backup/tip'});assert.equal(git(r,'rev-parse','HEAD'),parent);assert.equal(git(r,'rev-parse','backup/tip'),tip);assert.equal(git(r,'write-tree'),git(r,'rev-parse',`${tip}^{tree}`));assert.equal(read(r,'tracked file.txt'),'new commit\n');
    });
    test('revert restores content while keeping original commit reachable',()=>{
      const r=init();const baseTree=git(r,'rev-parse','HEAD^{tree}');write(r,'tracked file.txt','bad change\n');git(r,'commit','-am','bad');const bad=git(r,'rev-parse','HEAD');step(r,'revert',0,{COMMIT_ID:bad});git(r,'merge-base','--is-ancestor',bad,'HEAD');assert.equal(git(r,'rev-parse','HEAD^{tree}'),baseTree);assert.equal(git(r,'status','--porcelain'),'');
    });
    test('divergence inspection fetches a custom upstream without integrating either side',()=>{
      const r=init('custom'),remote=bare();git(r,'remote','add','team',remote);git(r,'push','-u','team','custom');const clone=path.join(root,'other clone');git(root,'clone','-b','custom',remote,clone);git(clone,'config','user.name','Other');git(clone,'config','user.email','other@example.invalid');write(clone,'other.txt','remote work\n');git(clone,'add','.');git(clone,'commit','-m','remote change');git(clone,'push','origin','custom');
      write(r,'local.txt','local work\n');git(r,'add','.');git(r,'commit','-m','local change');const before=snapshot(r);
      for(let i=0;i<recipes.diverged.steps.length;i++)step(r,'diverged',i,{REMOTE:'team',UPSTREAM_REF:'team/custom'});
      assert.deepEqual(snapshot(r),before);assert.equal(git(r,'rev-list','--left-right','--count','HEAD...team/custom'),'1\t1');assert.equal(fs.existsSync(path.join(r,'other.txt')),false);
    });
    for(const state of ['equal','ahead','behind','diverged'])test(`everyday remote update handles ${state} history without rewriting commits`,()=>{
      const r=init('custom'),remote=bare();git(r,'remote','add','team',remote);git(r,'push','-u','team','custom');
      if(['behind','diverged'].includes(state)){const other=fs.mkdtempSync(path.join(root,'sync clone-'));git(root,'clone','-b','custom',remote,other);git(other,'config','user.name','Other');git(other,'config','user.email','other@example.invalid');write(other,'remote.txt','remote work\n');git(other,'add','.');git(other,'commit','-m','remote update');git(other,'push','origin','custom');}
      if(['ahead','diverged'].includes(state)){write(r,'local.txt','local work\n');git(r,'add','.');git(r,'commit','-m','local update');}
      const before=snapshot(r),remoteBefore=git(remote,'rev-parse','refs/heads/custom');const vars={REMOTE:'team',UPSTREAM_REF:'team/custom',BRANCH:'custom'};
      for(let i=0;i<3;i++)step(r,'sync',i,vars);
      if(state==='diverged'){assert.throws(()=>step(r,'sync',3,vars),/Not possible to fast-forward|Diverging branches/);assert.deepEqual(snapshot(r),before);assert.equal(git(remote,'rev-parse','refs/heads/custom'),remoteBefore);return;}
      for(let i=3;i<recipes.sync.steps.length;i++)step(r,'sync',i,vars);
      git(r,'merge-base','--is-ancestor',before.head,'HEAD');assert.equal(git(remote,'rev-parse','refs/heads/custom'),git(r,'rev-parse','HEAD'));assert.equal(git(r,'status','--porcelain'),'');assert.equal(read(r,'tracked file.txt'),'base\n');
      if(state==='behind')assert.equal(read(r,'remote.txt'),'remote work\n');if(state==='ahead')assert.equal(read(r,'local.txt'),'local work\n');
    });
    test('new repository, stage and branch use the same authored commands',()=>{
      const r=fs.mkdtempSync(path.join(root,'new project-'));write(r,'first file.txt','first\n');step(r,'init',0,{INITIAL_BRANCH:'custom'});git(r,'config','user.name','Test');git(r,'config','user.email','test@example.invalid');step(r,'init',1,{FILE:'first file.txt'});assert.match(step(r,'init',2),/^\+first$/m,'The pre-commit review must display the actual staged content');step(r,'init',3);assert.equal(git(r,'show','HEAD:first file.txt'),'first');
      write(r,'first file.txt','second\n');for(let i=0;i<recipes.stage.steps.length;i++)step(r,'stage',i,{FILE:'first file.txt'});assert.equal(git(r,'show','HEAD:first file.txt'),'second');const before=snapshot(r);for(let i=0;i<recipes.branch.steps.length;i++)step(r,'branch',i,{NEW_BRANCH:'feature/work'});assert.deepEqual(snapshot(r),before);assert.equal(git(r,'branch','--show-current'),'feature/work');
    });
    test('clone writes the selected directory and leaves source untouched',()=>{
      const r=init(),destination=path.join(root,'cloned project');const before=snapshot(r);for(let i=0;i<recipes.clone.steps.length;i++)step(root,'clone',i,{REPOSITORY_URL:r,CLONE_DIRECTORY:destination});assert.deepEqual(snapshot(r),before);assert.equal(git(destination,'rev-parse','HEAD'),before.head);assert.equal(read(destination,'tracked file.txt'),'base\n');
    });
    test('worktree adds a second checkout without disturbing dirty files',()=>{
      const r=init();git(r,'branch','other');write(r,'tracked file.txt','dirty\n');const before=snapshot(r),destination=path.join(root,'second worktree');step(r,'worktree',0,{TARGET_BRANCH:'other',WORKTREE_PATH:destination});assert.deepEqual(snapshot(r),before);assert.equal(read(destination,'tracked file.txt'),'base\n');assert.equal(git(destination,'branch','--show-current'),'other');
    });
    test('annotated tag resolves to the exact tested commit',()=>{
      const r=init();const before=snapshot(r);step(r,'tag',0,{RELEASE_TAG:'v-test'});assert.equal(git(r,'rev-parse','v-test^{}'),before.head);assert.equal(git(r,'cat-file','-t','v-test'),'tag');assert.deepEqual(snapshot(r),before);
    });
    test('interactive rebase preserves file tree and a backup of the original commits',()=>{
      const r=init();const base=git(r,'rev-parse','HEAD');write(r,'a.txt','a\n');git(r,'add','.');git(r,'commit','-m','a');write(r,'b.txt','b\n');git(r,'add','.');git(r,'commit','-m','b');const tip=git(r,'rev-parse','HEAD'),tree=git(r,'rev-parse','HEAD^{tree}');for(let i=0;i<recipes.rebasePlan.steps.length;i++)step(r,'rebasePlan',i,{BASE_COMMIT:base,BACKUP_BRANCH:'backup/rebase'});assert.equal(git(r,'rev-parse','backup/rebase'),tip);assert.equal(git(r,'rev-parse','HEAD^{tree}'),tree);assert.equal(git(r,'status','--porcelain'),'');
    });
    test('cherry-pick applies only the reviewed non-merge change',()=>{
      const r=init();git(r,'switch','-c','source');write(r,'fix file.txt','fix\n');git(r,'add','.');git(r,'commit','-m','fix');const commit=git(r,'rev-parse','HEAD');git(r,'switch','main');for(let i=0;i<recipes.cherryPick.steps.length;i++)step(r,'cherryPick',i,{COMMIT_ID:commit});assert.equal(read(r,'fix file.txt'),'fix\n');assert.equal(git(r,'status','--porcelain'),'');assert.equal(git(r,'rev-list','--count','HEAD'),'2');
    });
    test('explicit force lease rejects a concurrent remote update',()=>{
      const r=init(),remote=bare();git(r,'remote','add','team',remote);git(r,'push','team','HEAD:review');const expected=git(r,'rev-parse','HEAD');write(r,'tracked file.txt','review\n');git(r,'commit','-am','review');const newer=git(r,'rev-parse','HEAD');git(r,'push','team','HEAD:review');git(r,'reset','--soft',expected);const before=snapshot(r);
      step(r,'forceLease',0,{REMOTE:'team',REMOTE_BRANCH:'review'});
      const line=command('forceLease',1,{REMOTE:'team',REMOTE_BRANCH:'review',EXPECTED_REMOTE_SHA:expected,LOCAL_BRANCH:'main'});const args=[...line.matchAll(/"([^"]*)"|([^\s"]+)/g)].map(m=>m[1]??m[2]).slice(1);const rejected=spawnSync('git',args,{cwd:r,env,encoding:'utf8'});assert.notEqual(rejected.status,0);assert.equal(git(remote,'rev-parse','refs/heads/review'),newer);assert.deepEqual(snapshot(r),before);
      // With the actually reviewed current hash, the explicitly agreed rewrite works.
      step(r,'forceLease',1,{REMOTE:'team',REMOTE_BRANCH:'review',EXPECTED_REMOTE_SHA:newer,LOCAL_BRANCH:'main'});assert.equal(git(remote,'rev-parse','refs/heads/review'),expected);
    });
    test('bisect identifies a deterministic regression and restores the original checkout',()=>{
      const r=init(),good=git(r,'rev-parse','HEAD');let firstBad;
      for(let i=0;i<4;i++){write(r,'regression.txt',i<1?'good':'bad');write(r,'counter.txt',String(i));git(r,'add','.');git(r,'commit','-m',`change ${i}`);if(i===1)firstBad=git(r,'rev-parse','HEAD');}
      const before=snapshot(r);step(r,'bisect',0,{BAD_COMMIT:'HEAD',GOOD_COMMIT:good});
      for(let i=0;i<10;i++){step(r,'bisect',1);const state=fs.existsSync(path.join(r,'regression.txt'))?read(r,'regression.txt'):'good';const out=git(r,'bisect',state==='bad'?'bad':'good');if(out.includes('is the first bad commit'))break;}
      assert.equal(git(r,'rev-parse','refs/bisect/bad'),firstBad);step(r,'bisect',2);assert.deepEqual(snapshot(r),before);
    });
    const shells=process.platform==='win32'?[['PowerShell','powershell.exe'],['Bash','C:/Program Files/Git/bin/bash.exe']]:[['Bash','bash']];
    for(const [label,exe] of shells)test(`authored quoted commands execute in ${label} with spaces and stash selectors`,()=>{
      const r=init();write(r,'tracked file.txt','staged\n');git(r,'add','.');write(r,'tracked file.txt','working\n');write(r,'new file.txt','new\n');const before=snapshot(r);
      const lines=recipes.snapshot.steps.flatMap((_,i)=>command('snapshot',i,{BACKUP_BRANCH:'backup/shell'}).split('\n'));
      const script=path.join(root,label==='PowerShell'?'recipe.ps1':'recipe.sh');fs.writeFileSync(script,label==='PowerShell'?lines.map(line=>`${line}\nif ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`).join('\n'):'set -e\n'+lines.join('\n')+'\n');
      const args=label==='PowerShell'?['-NoProfile','-NonInteractive','-File',script]:[script.replace(/\\/g,'/')];const result=spawnSync(exe,args,{cwd:r,env,encoding:'utf8'});assert.equal(result.status,0,`${label}: ${result.error||''}\n${result.stderr}`);assert.deepEqual(snapshot(r),before);assert.equal(read(r,'new file.txt'),'new\n');
    });
  }
  console.log(`${passed} recovery scenarios passed. Temporary repositories: ${root}`);
} finally {
  // Only remove the exact directory allocated by mkdtemp under the OS temp root.
  assert.equal(path.dirname(root),os.tmpdir());assert.ok(path.basename(root).startsWith('gitunstuck-recovery-'));fs.rmSync(root,{recursive:true,force:true});
}
