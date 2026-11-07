/* Execute controlled canonical actions, never lesson prose or learner commands. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const learning=require('../learning.js');
const {recipes}=require('../recovery.js');
assert.deepEqual(learning.validate(),[]);
assert.deepEqual(learning.lessons.map(item=>item.id),['setup','inspect','staging','history','branches','remotes','recovery'],'Bounded course sequence');
assert.deepEqual(learning.returnContext('?learnReturn=staging&learnStep=edited-v3'),{lesson:'staging',checkpoint:'edited-v3'});
for(const query of ['?learnReturn=unknown&learnStep=initial','?learnReturn=staging&learnStep=unknown','?learnReturn=staging&learnReturn=recovery&learnStep=initial','?learnReturn=https://example.com&learnStep=initial'])assert.equal(learning.returnContext(query),null);
assert.equal(learning.referenceUrl('https://example.com','staging','initial'),null);
assert.equal(learning.referenceUrl('card-stage','staging','unknown'),null);
const referenceLink=learning.referenceUrl('card-stage','staging','edited-v3','?q=diff&risk=safe&terminal=private');
assert.ok(referenceLink.includes('q=diff')&&referenceLink.includes('risk=safe')&&!referenceLink.includes('terminal'));
assert.deepEqual(learning.returnContext(referenceLink.split('#')[0]),{lesson:'staging',checkpoint:'edited-v3'});
assert.ok(learning.validate([...learning.lessons,...learning.lessons]).some(e=>e.startsWith('Duplicate lesson')));
assert.ok(learning.validate([{...learning.lessons[0],outcome:'',reference:'missing'}]).includes('Missing outcome'));
assert.ok(learning.validate([{...learning.lessons[0],reference:'missing'}]).some(e=>e.startsWith('Unknown reference')));
assert.ok(learning.validate([{...learning.lessons[0],sources:['unknown']}]).some(e=>e.startsWith('Unknown source')));
assert.ok(learning.validate([{...learning.lessons[0],independent:{actions:[]}}]).some(e=>e.startsWith('Missing independent outcome')));
assert.ok(learning.validate([{...learning.lessons[0],checkpoints:[learning.lessons[0].checkpoints[0],learning.lessons[0].checkpoints[0]]}]).some(e=>e.startsWith('Duplicate checkpoint')));
assert.equal(learning.lesson('unknown'),null);
assert.equal(learning.checkpoint('staging','unknown'),null);
for(const hash of ['#learn/unknown/initial','#learn/staging/unknown','#learn/staging/initial/extra','#learn/%3Cimg%3E/initial'])assert.equal(learning.route(hash).valid,false);
assert.deepEqual(learning.route('#learn/staging/edited-v3'),{lesson:'staging',checkpoint:'edited-v3',valid:true});
assert.equal(learning.transition('staging','initial','previous').id,'initial');
assert.equal(learning.transition('staging','edited-v3','previous').id,'staged-v2');
assert.equal(learning.transition('staging','edited-v3','reset').id,'initial');
assert.equal(learning.transition('unknown','initial','next'),null);
assert.equal(learning.transition('staging','initial','bogus'),null);
const clone=learning.transition('staging','initial','next');clone.state.working['notes.txt']='tampered';
assert.equal(learning.checkpoint('staging','edited-v2').state.working['notes.txt'],'Version 2\n');
assert.deepEqual(learning.transition('branches','conflicted','previous').state,learning.checkpoint('branches','conflict-prepared').state);
const conflictClone=learning.transition('branches','conflict-prepared','next');conflictClone.state.unmerged['notes.txt'].ours='tampered';
assert.equal(learning.checkpoint('branches','conflicted').state.unmerged['notes.txt'].ours,'Meet at 11\n');
assert.equal(learning.graph('unknown','initial'),null);
assert.equal(learning.graph('branches','unknown'),null);
assert.equal(learning.graph('branches','fast-forward').nodes.length,2);
assert.deepEqual(learning.graph('branches','merged').nodes.find(node=>node.id==='b4').parents,['b3','b2']);
assert.equal(learning.graph('branches','conflicted').head,'b6');
assert.equal(learning.graph('branches','conflicted').nodes.some(node=>node.id==='b7'),false,'Paused merge must not display a nonexistent resolution commit');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const item of learning.lessons)assert.ok(html.includes('id="'+item.reference+'"'),'Reference must exist in the source');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'gitunstuck-learning-'));
const env={...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null',GIT_TERMINAL_PROMPT:'0',GIT_EDITOR:'true'};
function git(repo,args,allowFailure=false) {
 const result=spawnSync('git',args,{cwd:repo,env,encoding:'utf8'});
 if(!allowFailure)assert.equal(result.status,0,`${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
 return result;
}
function run(repo,actions,labels) {
 for(const action of actions) {
  const target=action.repository?path.resolve(repo,action.repository):repo;
  if(action.repository)assert.ok(target.startsWith(path.resolve(repo)+path.sep),'Action repository stays inside the disposable workspace');
  if(action.kind==='git'){
   const result=git(target,action.args,action.expectedExit!==undefined);
   if(action.expectedExit!==undefined)assert.equal(result.status,action.expectedExit,action.args.join(' '));
   if(action.commitId){assert.ok(labels,'Commit labels must be captured for reference verification');labels[action.commitId]=git(target,['rev-parse','HEAD']).stdout.trim();}
  }
  else if(action.kind==='edit')fs.writeFileSync(path.join(target,action.file),action.content);
  else assert.fail('Unknown action kind');
 }
}
function verify(repo,state,labels) {
 for(const [file,content] of Object.entries(state.head))assert.equal(git(repo,['show','HEAD:'+file]).stdout,content);
 for(const [file,content] of Object.entries(state.index))assert.equal(git(repo,['show',':'+file]).stdout,content);
 for(const [file,content] of Object.entries(state.working))assert.equal(fs.readFileSync(path.join(repo,file),'utf8'),content);
 assert.equal(git(repo,['branch','--show-current']).stdout.trim(),state.branch);
 // Git orders status entries lexically; leading spaces in porcelain status are essential.
 const status=git(repo,['status','--porcelain']).stdout.trimEnd().split('\n').sort();
 assert.deepEqual(status,state.status.split('\n').sort());
 const names=git(repo,['ls-tree','--name-only','HEAD']).stdout.trim().split('\n').sort();
 assert.deepEqual(names,Object.keys(state.head).sort(),'Commit contains precisely the declared paths');
 const indexNames=[...new Set(git(repo,['ls-files']).stdout.trim().split('\n'))].sort();
 assert.deepEqual(indexNames,[...Object.keys(state.index),...Object.keys(state.unmerged||{})].sort(),'Index contains precisely the declared paths');
 for(const [file,versions] of Object.entries(state.unmerged||{})) {
  for(const [index,key] of ['base','ours','theirs'].entries())assert.equal(git(repo,['show',`:${index+1}:${file}`]).stdout,versions[key]);
  assert.notEqual(git(repo,['show',':'+file],true).status,0,'Unmerged path has no stage-zero snapshot');
 }
 if(state.refs) {
  assert.ok(labels,'Reference manifest needs actual fixture commit labels');
  for(const [name,id] of Object.entries(state.refs)){assert.ok(labels[id],`Unknown fixture label ${id}`);assert.equal(git(repo,['rev-parse','refs/heads/'+name]).stdout.trim(),labels[id]);}
  assert.equal(git(repo,['symbolic-ref','HEAD']).stdout.trim(),'refs/heads/'+state.branch);
  assert.equal(git(repo,['rev-parse','HEAD']).stdout.trim(),labels[state.headCommit]);
  assert.deepEqual(git(repo,['for-each-ref','--format=%(refname:short)','refs/heads']).stdout.trim().split('\n').sort(),Object.keys(state.refs).sort());
 }
 for(const [name,id] of Object.entries(state.remoteTracking||{}))assert.equal(git(repo,['rev-parse','refs/remotes/'+name]).stdout.trim(),labels[id]);
 if(Object.hasOwn(state,'mergeHead')) {
  const merge=git(repo,['rev-parse','--verify','MERGE_HEAD'],true);
  if(state.mergeHead)assert.equal(merge.stdout.trim(),labels[state.mergeHead]);
  else assert.notEqual(merge.status,0,'No merge should remain active');
 }
}
function verifyRemote(workspace,state,labels) {
 for(const [name,snapshot] of Object.entries(state.repositories)) {
  const repo=path.join(workspace,name);
  if(snapshot.bare) {
   assert.equal(git(repo,['rev-parse','--is-bare-repository']).stdout.trim(),'true');
   assert.equal(git(repo,['symbolic-ref','HEAD']).stdout.trim(),'refs/heads/main');
   for(const [branch,id] of Object.entries(snapshot.refs))assert.equal(git(repo,['rev-parse','refs/heads/'+branch]).stdout.trim(),labels[id]);
   for(const [file,content] of Object.entries(snapshot.snapshot))assert.equal(git(repo,['show','refs/heads/main:'+file]).stdout,content);
   assert.equal(fs.existsSync(path.join(repo,'notes.txt')),false,'Bare server has no working notes file');
  } else verify(repo,snapshot,labels);
 }
}
try {
 const item=learning.lesson('staging'),repo=path.join(root,'practice with spaces');fs.mkdirSync(repo);
 run(repo,item.setup.git);
 // Test isolation only: never emitted as learner setup or used in their repository.
 git(repo,['config','core.autocrlf','false']);git(repo,['config','commit.gpgSign','false']);git(repo,['config','core.hooksPath',path.join(root,'no-hooks')]);
 for(const [file,content] of Object.entries(item.setup.files))fs.writeFileSync(path.join(repo,file),content);
 run(repo,item.setup.actions);verify(repo,item.initial);
 const original=git(repo,['rev-parse','HEAD']).stdout.trim();
 for(const point of item.checkpoints) {
  run(repo,point.actions);verify(repo,point.state);
  const unstaged=git(repo,['diff','--','notes.txt']).stdout;
  const staged=git(repo,['diff','--staged','--','notes.txt']).stdout;
  for(const [kind,actual] of Object.entries({working:unstaged,staged})) {
   const excerpt=point.diffs[kind];
   if(excerpt)assert.ok(actual.includes(excerpt),`${point.id} ${kind} displayed excerpt must occur in real Git output`);
   else assert.equal(actual,'',`${point.id} ${kind} displayed empty comparison must be empty in Git`);
  }
  if(point.id==='edited-v3') {
   assert.match(staged,/-Version 1\n\+Version 2/);assert.match(unstaged,/-Version 2\n\+Version 3/);
   assert.equal(git(repo,['rev-parse','HEAD']).stdout.trim(),original);
  }
  if(point.id==='committed-v2') {
   assert.equal(staged,'');assert.match(unstaged,/-Version 2\n\+Version 3/);
   assert.equal(git(repo,['rev-parse','HEAD^']).stdout.trim(),original);
  }
  console.log('PASS staging checkpoint '+point.id);
 }
 run(repo,item.independent.actions);verify(repo,item.independent.final);
 assert.equal(git(repo,['diff','--staged']).stdout,'');
 assert.match(git(repo,['diff']).stdout,/-Meet on Tuesday\n\+Meet on Wednesday/);
 assert.doesNotMatch(git(repo,['diff']).stdout,/checklist|notebook/,'Ordinary diff does not display untracked file content');
 assert.notEqual(git(repo,['show','HEAD:checklist.txt'],true).status,0);
 console.log('PASS independent selected-version/selected-file commit and untracked diff behaviour');
 const optional=learning.lesson('setup'),setupRepo=path.join(root,'optional setup');fs.mkdirSync(setupRepo);
 run(setupRepo,optional.setup.availability);
 assert.notEqual(git(setupRepo,optional.setup.parentCheck[0].args,true).status,0,'Parent preflight must reject an existing repository and report expected non-repository state');
 run(setupRepo,optional.setup.git);git(setupRepo,['config','core.autocrlf','false']);git(setupRepo,['config','commit.gpgSign','false']);
 assert.equal(path.resolve(git(setupRepo,optional.setup.confirm[0].args).stdout.trim()),path.resolve(setupRepo));
 assert.equal(git(setupRepo,optional.setup.confirm[1].args).stdout.trim(),'Practice Learner');
 assert.equal(git(setupRepo,optional.setup.confirm[2].args).stdout.trim(),'learner@example.invalid');
 assert.equal(git(setupRepo,optional.setup.parentCheck[0].args).status,0,'Preflight detects a repository after init');
 assert.notEqual(git(setupRepo,['config','--global','--get','user.name'],true).status,0,'Setup does not write global identity');
 for(const [file,content] of Object.entries(optional.setup.files))fs.writeFileSync(path.join(setupRepo,file),content);
 run(setupRepo,optional.setup.actions);
 for(const point of optional.checkpoints){run(setupRepo,point.actions);run(setupRepo,point.inspect);verify(setupRepo,point.state);}
 run(setupRepo,optional.independent.inspect);verify(setupRepo,optional.independent.final);
 assert.deepEqual(optional.setup.git,item.setup.git,'Optional setup reuses exactly the staging setup Git actions');
 console.log('PASS optional setup, local identity, directory preflight and unchanged independent verification');
 const inspection=learning.lesson('inspect'),inspectRepo=path.join(root,'inspect practice');fs.mkdirSync(inspectRepo);
 run(inspectRepo,inspection.setup.git);git(inspectRepo,['config','core.autocrlf','false']);git(inspectRepo,['config','commit.gpgSign','false']);
 for(const [file,content] of Object.entries(inspection.setup.files))fs.writeFileSync(path.join(inspectRepo,file),content);
 run(inspectRepo,inspection.setup.actions);verify(inspectRepo,inspection.initial);
 const inspectTip=git(inspectRepo,['rev-parse','HEAD']).stdout;
 assert.equal(git(inspectRepo,['remote','-v']).stdout,'');
 for(const point of inspection.checkpoints) {
  run(inspectRepo,point.actions);run(inspectRepo,point.inspect);verify(inspectRepo,point.state);
  assert.match(git(inspectRepo,['status','--short','--ignored']).stdout,/!! scratch.txt/);
  assert.equal(git(inspectRepo,['rev-parse','HEAD']).stdout,inspectTip,'Inspection/staging does not create a commit');
  assert.notEqual(git(inspectRepo,['show',':scratch.txt'],true).status,0,'Ignored file remains outside the index');
 }
 run(inspectRepo,inspection.independent.actions);verify(inspectRepo,inspection.independent.final);
 assert.equal(git(inspectRepo,['show',':notes.txt']).stdout,'Confirm the room\n');
 assert.match(git(inspectRepo,['diff']).stdout,/-Confirm the room\n\+Confirm the room and time/);
 assert.doesNotMatch(git(inspectRepo,['diff']).stdout,/checklist|notebook|scratch/);
 assert.notEqual(git(inspectRepo,['show',':checklist.txt'],true).status,0);
 // A meaningful wrong continuation: staging again replaces the selected version.
 git(inspectRepo,['add','--','notes.txt']);
 assert.notEqual(git(inspectRepo,['show',':notes.txt']).stdout,inspection.independent.final.index['notes.txt']);
 assert.equal(git(inspectRepo,['diff']).stdout,'');
 console.log('PASS inspect tracked/untracked/ignored states, selected content and wrong restaging continuation');
 const history=learning.lesson('history'),historyRepo=path.join(root,'history practice');fs.mkdirSync(historyRepo);
 run(historyRepo,history.setup.git);git(historyRepo,['config','core.autocrlf','false']);git(historyRepo,['config','commit.gpgSign','false']);
 for(const [file,content] of Object.entries(history.setup.files))fs.writeFileSync(path.join(historyRepo,file),content);
 run(historyRepo,history.setup.actions);verify(historyRepo,history.initial);
 const firstHistoryTip=git(historyRepo,['rev-parse','HEAD']).stdout;
 for(const point of history.checkpoints) {
  run(historyRepo,point.actions);run(historyRepo,point.inspect);verify(historyRepo,point.state);
  if(point.id==='selected')assert.equal(git(historyRepo,['show',':checklist.txt']).stdout,'Bring a notebook\n');
 }
 const timeTip=git(historyRepo,['rev-parse','HEAD']).stdout;
 assert.equal(git(historyRepo,['rev-parse','HEAD^']).stdout,firstHistoryTip);
 assert.equal(git(historyRepo,['log','-1','--format=%s']).stdout.trim(),'Set the meeting time');
 assert.equal(git(historyRepo,['diff-tree','--no-commit-id','--name-only','-r','HEAD']).stdout.trim(),'notes.txt');
 assert.equal(git(historyRepo,['show','HEAD:checklist.txt']).stdout,'Bring a notebook\n','Unchanged tracked file remains in the complete snapshot');
 run(historyRepo,history.independent.actions);verify(historyRepo,history.independent.final);
 assert.equal(git(historyRepo,['rev-parse','HEAD^']).stdout,timeTip);
 assert.equal(git(historyRepo,['log','-1','--format=%s']).stdout.trim(),'Prepare two notebooks');
 assert.equal(git(historyRepo,['diff-tree','--no-commit-id','--name-only','-r','HEAD']).stdout.trim(),'checklist.txt');
 assert.equal(git(historyRepo,['diff','--staged']).stdout,'');
 assert.match(git(historyRepo,['diff']).stdout,/-Meet at 10\n\+Meet at 11/);
 assert.equal(git(historyRepo,['remote','-v']).stdout,'');
 console.log('PASS history snapshots, focused changed paths, commit messages/parents and independent remaining work');
 const branching=learning.lesson('branches');
 function branchFixture(name) {
  const repo=path.join(root,name);fs.mkdirSync(repo);run(repo,branching.setup.git);git(repo,['config','core.autocrlf','false']);
  for(const [file,content] of Object.entries(branching.setup.files))fs.writeFileSync(path.join(repo,file),content);
  run(repo,branching.setup.actions);
  const labels={b0:git(repo,['rev-parse','HEAD']).stdout.trim()};verify(repo,branching.initial,labels);return {repo,labels};
 }
 const branches=branchFixture('branch transitions');
 for(const point of branching.checkpoints) {
  run(branches.repo,point.actions,branches.labels);run(branches.repo,point.inspect);verify(branches.repo,point.state,branches.labels);
  if(point.id==='fast-forward')assert.equal(git(branches.repo,['rev-list','--count','--all']).stdout.trim(),'2','Fast-forward did not invent a third commit');
  if(point.id==='merged')assert.equal(git(branches.repo,['rev-list','--parents','-n','1','HEAD']).stdout.trim().split(' ').length,3,'Clean diverged merge has two parents');
  if(point.id==='conflicted') {
   const failed=git(branches.repo,['commit','-m','Attempt unresolved merge'],true);
   assert.notEqual(failed.status,0,'Commit refuses an unmerged index');verify(branches.repo,point.state,branches.labels);
   assert.match(learning.content(point.state,'index','notes.txt'),/Unmerged — no single staged version/);
  }
  if(point.id==='resolved')assert.equal(git(branches.repo,['diff','--name-only','--diff-filter=U']).stdout,'');
  console.log('PASS branch checkpoint '+point.id);
 }
 run(branches.repo,branching.independent.actions,branches.labels);verify(branches.repo,branching.independent.final,branches.labels);
 assert.equal(git(branches.repo,['diff-tree','--no-commit-id','--name-only','-r','HEAD']).stdout.trim(),'notes.txt');
 for(const commit of branching.commits) {
  const parts=git(branches.repo,['rev-list','--parents','-n','1',branches.labels[commit.id]]).stdout.trim().split(' ');
  assert.deepEqual(parts.slice(1),commit.parents.map(id=>branches.labels[id]),commit.id+' actual parent relationships');
  assert.equal(git(branches.repo,['log','-1','--format=%s',branches.labels[commit.id]]).stdout.trim(),commit.subject);
 }
 for(const point of branching.checkpoints) {
  const graph=learning.graph('branches',point.id);
  for(const node of graph.nodes) {
   const actual=git(branches.repo,['rev-list','--parents','-n','1',branches.labels[node.id]]).stdout.trim().split(' ').slice(1);
   assert.deepEqual(actual,node.parents.map(id=>branches.labels[id]),'Rendered graph parents match Git at '+point.id);
   for(const parent of node.parents)assert.ok(graph.nodes.find(candidate=>candidate.id===parent).depth<node.depth);
  }
 }
 fs.writeFileSync(path.join(branches.repo,'notes.txt'),'Uncommitted replacement\n');
 assert.notEqual(git(branches.repo,['switch','topic-notes'],true).status,0,'Switch refuses to overwrite a conflicting local edit');
 verify(branches.repo,{...branching.independent.final,working:{...branching.independent.final.working,'notes.txt':'Uncommitted replacement\n'},status:' M notes.txt'},branches.labels);
 const aborted=branchFixture('abort practice');
 for(const point of branching.checkpoints){run(aborted.repo,point.actions,aborted.labels);if(point.id==='conflicted')break;}
 const paused=learning.checkpoint('branches','conflicted');verify(aborted.repo,paused.state,aborted.labels);
 // Git accepts marker text into stage zero: staging alone cannot validate a resolution.
 git(aborted.repo,['add','--','notes.txt']);assert.equal(git(aborted.repo,['diff','--name-only','--diff-filter=U']).stdout,'');
 assert.match(git(aborted.repo,['show',':notes.txt']).stdout,/<<<<<<< HEAD/);
 run(aborted.repo,paused.alternative.checks);run(aborted.repo,paused.alternative.actions);
 verify(aborted.repo,learning.checkpoint('branches','conflict-prepared').state,aborted.labels);
 const carry=branchFixture('dirty work carry');
 fs.writeFileSync(path.join(carry.repo,'notes.txt'),'An uncommitted local note\n');git(carry.repo,['add','--','notes.txt']);
 fs.writeFileSync(path.join(carry.repo,'notes.txt'),'A later local note\n');
 const beforeCarry={head:git(carry.repo,['rev-parse','HEAD']).stdout,index:git(carry.repo,['show',':notes.txt']).stdout,working:fs.readFileSync(path.join(carry.repo,'notes.txt'),'utf8'),status:git(carry.repo,['status','--porcelain']).stdout};
 git(carry.repo,['switch','-c','carry']);git(carry.repo,['switch','main']);
 assert.deepEqual({head:git(carry.repo,['rev-parse','HEAD']).stdout,index:git(carry.repo,['show',':notes.txt']).stdout,working:fs.readFileSync(path.join(carry.repo,'notes.txt'),'utf8'),status:git(carry.repo,['status','--porcelain']).stdout},beforeCarry);
 console.log('PASS branch parents/references, independent fast-forward, conflict/abort, marker staging and dirty-switch preservation');
 const remotes=learning.lesson('remotes'),workspace=path.join(root,'remote workspace');fs.mkdirSync(workspace);
 run(workspace,remotes.setup.git);
 for(const [file,content] of Object.entries(remotes.setup.files))fs.writeFileSync(path.join(workspace,file),content);
 run(workspace,remotes.setup.actions);
 const remoteLabels={r0:git(path.join(workspace,'learner'),['rev-parse','HEAD']).stdout.trim()};
 verifyRemote(workspace,remotes.initial,remoteLabels);
 function learnerSnapshot() {
  const repo=path.join(workspace,'learner');
  return {head:git(repo,['rev-parse','HEAD']).stdout,index:git(repo,['show',':notes.txt']).stdout,working:fs.readFileSync(path.join(repo,'notes.txt'),'utf8'),status:git(repo,['status','--porcelain']).stdout};
 }
 for(const point of remotes.checkpoints) {
  const before=learnerSnapshot();run(workspace,point.actions,remoteLabels);run(workspace,point.inspect);verifyRemote(workspace,point.state,remoteLabels);
  if(point.id!=='integrated')assert.deepEqual(learnerSnapshot(),before,'Partner actions and fetch leave learner HEAD/index/files/status unchanged');
  if(point.id==='partner-pushed')assert.equal(git(path.join(workspace,'learner'),['rev-parse','origin/main']).stdout.trim(),remoteLabels.r0);
  if(point.id==='fetched')assert.equal(git(path.join(workspace,'learner'),['rev-parse','origin/main']).stdout.trim(),remoteLabels.r1);
  if(point.id==='integrated')assert.equal(git(path.join(workspace,'learner'),['rev-list','--count','main']).stdout.trim(),'2');
  console.log('PASS remote checkpoint '+point.id);
 }
 for(const [index,action] of remotes.independent.actions.entries()) {
  const before=learnerSnapshot();run(workspace,[action],remoteLabels);
  if(index===4)assert.deepEqual(learnerSnapshot(),before,'Independent fetch also leaves checked-out state unchanged');
  const check=remotes.independent.checkpoints.find(check=>check.afterAction===index);
  if(check)verifyRemote(workspace,check.state,remoteLabels);
 }
 verifyRemote(workspace,remotes.independent.final,remoteLabels);
 for(const commit of remotes.commits){const parts=git(path.join(workspace,'learner'),['rev-list','--parents','-n','1',remoteLabels[commit.id]]).stdout.trim().split(' ');assert.deepEqual(parts.slice(1),commit.parents.map(id=>remoteLabels[id]));}
 assert.equal(git(path.join(workspace,'learner'),['rev-list','--count','main']).stdout.trim(),'3','Independent fast-forward adds no artificial merge commit');
 // The taught --ff-only guard must refuse a different, diverged real state without overwriting either side.
 for(const [copy,text] of [['learner','Local alternative\n'],['partner','Partner alternative\n']]) {
  const repo=path.join(workspace,copy);fs.writeFileSync(path.join(repo,'notes.txt'),text);git(repo,['add','--','notes.txt']);git(repo,['commit','-m','Create a divergent alternative']);
 }
 git(path.join(workspace,'partner'),['push','origin','main']);git(path.join(workspace,'learner'),['fetch','origin']);
 const guarded=learnerSnapshot(),serverTip=git(path.join(workspace,'shared.git'),['rev-parse','main']).stdout;
 assert.notEqual(git(path.join(workspace,'learner'),['merge','--ff-only','origin/main'],true).status,0);
 assert.deepEqual(learnerSnapshot(),guarded);assert.equal(git(path.join(workspace,'shared.git'),['rev-parse','main']).stdout,serverTip);
 console.log('PASS independent three-repository references/content, stale observation, fetch invariance and divergent integration refusal');
 const recovery=learning.lesson('recovery'),recoveryRepo=path.join(root,'recovery practice');fs.mkdirSync(recoveryRepo);
 run(recoveryRepo,recovery.setup.git);git(recoveryRepo,['config','core.autocrlf','false']);
 for(const [file,content] of Object.entries(recovery.setup.files))fs.writeFileSync(path.join(recoveryRepo,file),content);
 run(recoveryRepo,recovery.setup.actions);
 const recoveryLabels={k0:git(recoveryRepo,['rev-parse','HEAD']).stdout.trim()};verify(recoveryRepo,recovery.initial,recoveryLabels);
 for(const point of recovery.checkpoints) {
  if(point.gate)run(recoveryRepo,point.gate.checks);
  if(point.id==='reverted')assert.equal(git(recoveryRepo,['rev-parse','HEAD~1']).stdout.trim(),recoveryLabels.k1,'Checked revert target is precisely the checklist commit');
  const beforeNotes=fs.readFileSync(path.join(recoveryRepo,'notes.txt'),'utf8');
  run(recoveryRepo,point.actions,recoveryLabels);run(recoveryRepo,point.inspect);verify(recoveryRepo,point.state,recoveryLabels);
  if(['unstaged','discarded'].includes(point.id))assert.equal(fs.readFileSync(path.join(recoveryRepo,'notes.txt'),'utf8'),beforeNotes,'Recovery preserves wanted working note');
  if(point.id==='discarded')assert.equal(git(recoveryRepo,['diff','--','checklist.txt']).stdout,'');
  if(point.gate?.recipe==='unstage')assert.equal(recipes.unstage.steps[0].code,'git restore --staged -- "FILE"');
  if(point.gate?.recipe==='discard')assert.equal(recipes.discard.steps[0].code,'git restore -- "FILE"');
  console.log('PASS recovery checkpoint '+point.id);
 }
 git(recoveryRepo,['merge-base','--is-ancestor',recoveryLabels.k1,'HEAD']);
 assert.equal(git(recoveryRepo,['rev-list','--count','HEAD']).stdout.trim(),'4','Revert adds a commit while retaining original history');
 for(const commit of recovery.commits){const parts=git(recoveryRepo,['rev-list','--parents','-n','1',recoveryLabels[commit.id]]).stdout.trim().split(' ');assert.deepEqual(parts.slice(1),commit.parents.map(id=>recoveryLabels[id]));}
 run(recoveryRepo,recovery.independent.actions.slice(0,3));
 const wantedDraft=fs.readFileSync(path.join(recoveryRepo,'notes.txt'),'utf8');
 // Verify the rejected discard choice on this disposable mixed state before restoring the intended draft.
 git(recoveryRepo,['restore','--','notes.txt']);assert.equal(fs.readFileSync(path.join(recoveryRepo,'notes.txt'),'utf8'),'Keep this later draft\n');
 fs.writeFileSync(path.join(recoveryRepo,'notes.txt'),wantedDraft);
 run(recoveryRepo,recovery.independent.gate.checks);run(recoveryRepo,recovery.independent.actions.slice(3));
 verify(recoveryRepo,recovery.independent.final,recoveryLabels);assert.equal(git(recoveryRepo,['diff','--staged']).stdout,'');
 assert.equal(git(recoveryRepo,['rev-parse','HEAD']).stdout.trim(),recoveryLabels.k3,'Independent unstaging adds no history');
 console.log('PASS recovery transfer choice, wanted content, index source and retained revert history');
 // Personal defaults must not make the fresh exercise depend on keys, hooks or default branch names.
 const hostileGlobal=path.join(root,'inherited-config'),hostileHooks=path.join(root,'inherited-hooks'),hostileTemplate=path.join(root,'template');
 fs.mkdirSync(hostileHooks);fs.mkdirSync(path.join(hostileTemplate,'hooks'),{recursive:true});
 for(const dir of [hostileHooks,path.join(hostileTemplate,'hooks')])fs.writeFileSync(path.join(dir,'pre-commit'),'#!/bin/sh\nexit 1\n',{mode:0o755});
 const portable=value=>value.replaceAll('\\','/');
 const globalText=`[init]\n defaultBranch = inherited\n templateDir = "${portable(hostileTemplate)}"\n[commit]\n gpgSign = true\n[gpg]\n program = unavailable-practice-signer\n[core]\n hooksPath = "${portable(hostileHooks)}"\n pager = unavailable-practice-pager\n`;
 fs.writeFileSync(hostileGlobal,globalText);
 const normalGlobal=env.GIT_CONFIG_GLOBAL;env.GIT_CONFIG_GLOBAL=hostileGlobal;
 try {
  const isolated=path.join(root,'inherited defaults');fs.mkdirSync(isolated);run(isolated,item.setup.git);
  for(const [file,content] of Object.entries(item.setup.files))fs.writeFileSync(path.join(isolated,file),content);
  run(isolated,item.setup.actions);verify(isolated,item.initial);
  assert.equal(fs.existsSync(path.join(isolated,'.git','hooks','pre-commit')),false,'Practice init does not import template hooks');
  assert.equal(git(isolated,['config','--local','core.pager']).stdout.trim(),'cat');
  assert.equal(fs.readFileSync(hostileGlobal,'utf8'),globalText,'Practice setup leaves inherited settings intact');
 }finally{env.GIT_CONFIG_GLOBAL=normalGlobal;}
 console.log('PASS setup isolates inherited branch/signing/hooks/pager defaults without changing global config');
 // Execute the actual published setup strings in real shells; editor actions stay file writes.
 const shellCases=process.platform==='win32' ? [
  {name:'Windows PowerShell 5.1',exe:'powershell.exe',args:['-NoProfile','-NonInteractive','-Command'],setup:item.setup.powershell,prefix:"$ErrorActionPreference='Stop'\n",cd:'Set-Location -LiteralPath gitunstuck-staging\n'},
  {name:'Git Bash',exe:'C:/Program Files/Git/bin/bash.exe',args:['--noprofile','--norc','-c'],setup:item.setup.bash,prefix:'set -e\n',cd:'cd gitunstuck-staging\n'}
 ] : [{name:'Bash',exe:'bash',args:['--noprofile','--norc','-c'],setup:item.setup.bash,prefix:'set -e\n',cd:'cd gitunstuck-staging\n'}];
 for(const exercise of [item,optional,inspection,history,branching,remotes,recovery])for(const shell of shellCases) {
  const parent=fs.mkdtempSync(path.join(root,'shell-'));
  const shellEnv={...env,GIT_CONFIG_COUNT:'2',GIT_CONFIG_KEY_0:'commit.gpgSign',GIT_CONFIG_VALUE_0:'false',GIT_CONFIG_KEY_1:'core.autocrlf',GIT_CONFIG_VALUE_1:'false'};
  function execute(code) {
   const result=spawnSync(shell.exe,[...shell.args,shell.prefix+code],{cwd:parent,env:shellEnv,encoding:'utf8'});
   assert.equal(result.status,0,`${shell.name}\n${result.error||''}\n${result.stdout}\n${result.stderr}`);
  }
  const directoryCommands=shell.name==='Windows PowerShell 5.1'?exercise.setup.powershell:exercise.setup.bash;
  execute(directoryCommands+'\n'+exercise.setup.git.map(learning.command).join('\n'));
  const actual=path.join(parent,exercise.directory);
  for(const [file,content] of Object.entries(exercise.setup.files))fs.writeFileSync(path.join(actual,file),content);
  execute(shell.cd.replaceAll(item.directory,exercise.directory)+exercise.setup.actions.map(learning.command).join('\n'));
  const primary=exercise.setup.primary?path.join(actual,exercise.setup.primary):actual;
  const initialLabels=exercise.initial.headCommit?{[exercise.initial.headCommit]:git(primary,['rev-parse','HEAD']).stdout.trim()}:undefined;
  verify(primary,exercise.initial,initialLabels);
  if(exercise.initial.repositories)verifyRemote(actual,exercise.initial,initialLabels);
  console.log('PASS '+exercise.id+' published setup in '+shell.name);
 }
 console.log('Learning data, routes, transitions and current lesson Git outcomes passed.');
} finally {
 fs.rmSync(root,{recursive:true,force:true});
}
