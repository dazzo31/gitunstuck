/* Canonical teaching examples. This module never runs commands or reads learner data. */
(function (root) {
  'use strict';
  const sources = {
    status: 'https://git-scm.com/docs/git-status', add: 'https://git-scm.com/docs/git-add',
    diff: 'https://git-scm.com/docs/git-diff', commit: 'https://git-scm.com/docs/git-commit',
    branch: 'https://git-scm.com/docs/git-branch', switch: 'https://git-scm.com/docs/git-switch', merge: 'https://git-scm.com/docs/git-merge',
    fetch: 'https://git-scm.com/docs/git-fetch', push: 'https://git-scm.com/docs/git-push', clone: 'https://git-scm.com/docs/git-clone', remote: 'https://git-scm.com/docs/git-remote', restore: 'https://git-scm.com/docs/git-restore',
    revert: 'https://git-scm.com/docs/git-revert', config: 'https://git-scm.com/docs/git-config',
    init: 'https://git-scm.com/docs/git-init', revParse: 'https://git-scm.com/docs/git-rev-parse',
    ignore: 'https://git-scm.com/docs/gitignore', show: 'https://git-scm.com/docs/git-show', log: 'https://git-scm.com/docs/git-log'
  };
  const git = (...args) => ({kind:'git', args});
  const edit = (file, content) => ({kind:'edit', file, content});
  const at = (repository,action) => ({...action,repository});
  const state = (head, index, working, status) => ({
    head:{'notes.txt':head}, index:{'notes.txt':index}, working:{'notes.txt':working},
    branch:'main', status
  });
  const initial = state('Version 1\n','Version 1\n','Version 1\n','');
  function practiceSetup(directory, files={'notes.txt':'Version 1\n'}, tracked=Object.keys(files), identity={name:'Practice Learner',email:'learner@example.invalid'}) {
    return {
      availability:[git('--version')],parentCheck:[git('rev-parse','--show-toplevel')],
      confirm:[git('rev-parse','--show-toplevel'),git('config','--local','--get','user.name'),git('config','--local','--get','user.email')],
      files,
      actions:[git('add','--',...tracked),git('commit','-m','Record the first version')],
      explanation:'Create each file shown below in your editor, with the exact plain-text contents and a final newline. The first commit below establishes the starting snapshot. Stage only the named files.',
      bash:`mkdir ${directory}\ncd ${directory}\npwd`,
      powershell:`New-Item -ItemType Directory -Path ${directory} -ErrorAction Stop\nSet-Location -LiteralPath ${directory}\nGet-Location`,
      git:[git('-c','init.templateDir=','init'),git('symbolic-ref','HEAD','refs/heads/main'),git('config','--local','user.name',identity.name),git('config','--local','user.email',identity.email),git('config','--local','commit.gpgSign','false'),git('config','--local','core.hooksPath','.git/hooks'),git('config','--local','core.pager','cat')]
    };
  }
  const lessons = [{
    id:'staging', title:'Choose what goes into a commit',
    summary:'Choose which version of a file to record.',
    outcome:'Predict and verify which version of a file a commit records, even after you edit the file again.',
    prerequisites:'Git is installed. You can open a terminal and edit a plain-text file. Use a fresh practice directory for this lesson; no hosting account is needed.',
    directory:'gitunstuck-staging', reference:'card-stage', sources:['add','diff','commit','status'],
    initial, final:state('Version 2\n','Version 2\n','Version 3\n',' M notes.txt'),
    setup:practiceSetup('gitunstuck-staging'),
    checkpoints:[
      {id:'initial',title:'Start with a committed file', actions:[], state:initial,
        diffs:{working:'',staged:''},
        instruction:'Complete the practice setup below before running the exercise commands. All three versions of notes.txt now agree.',
        inspect:[git('status','--short'),git('show','HEAD:notes.txt'),git('show',':notes.txt')],
        observation:'Status prints nothing: there are no staged or unstaged changes and no untracked files. Both show commands print Version 1.'},
      {id:'edited-v2',title:'Save a second version',actions:[edit('notes.txt','Version 2\n')],
        state:state('Version 1\n','Version 1\n','Version 2\n',' M notes.txt'),
        diffs:{working:'-Version 1\n+Version 2\n',staged:''},
        instruction:'In your editor, replace the file contents with Version 2 and save. Saving changes the working file; it does not stage or commit it.',
        inspect:[git('status','--short'),git('diff'),git('diff','--staged')],
        observation:'The second status column is M (unstaged modification). git diff shows -Version 1 and +Version 2: working content compared with the index. The staged diff is empty because index and HEAD still agree.'},
      {id:'staged-v2',title:'Stage the current content',actions:[git('add','--','notes.txt')],
        state:state('Version 1\n','Version 2\n','Version 2\n','M  notes.txt'),
        diffs:{working:'',staged:'-Version 1\n+Version 2\n'},
        instruction:'Stage notes.txt. Git copies its current content into the index. The working file remains on disk.',
        inspect:[git('status','--short'),git('diff'),git('diff','--staged')],
        observation:'The first status column is M (staged modification). The working diff is empty. The staged diff shows -Version 1 and +Version 2: index compared with HEAD.'},
      {id:'edited-v3',title:'Edit again without staging',actions:[edit('notes.txt','Version 3\n')],
        state:state('Version 1\n','Version 2\n','Version 3\n','MM notes.txt'),
        diffs:{working:'-Version 2\n+Version 3\n',staged:'-Version 1\n+Version 2\n'},
        instruction:'Replace the working file contents with Version 3 and save. Do not run git add again. One file now has both staged and unstaged changes.',
        inspect:[git('status','--short'),git('diff'),git('diff','--staged')],
        observation:'MM means both status columns are modified. The working diff compares Version 2 with Version 3. The staged diff still compares Version 1 with Version 2.',
        prediction:{question:'If you commit now, without staging again, which version will the new commit contain?',
          choices:[
            {id:'v1',text:'Version 1',correct:false,feedback:'Version 1 is the old commit. Staging already replaced the index with Version 2, which is what the next commit records.'},
            {id:'v2',text:'Version 2',correct:true,feedback:'Yes. The index contains Version 2. Committing it leaves Version 3 as an unstaged working edit.'},
            {id:'v3',text:'Version 3',correct:false,feedback:'Saving Version 3 changed only the working file. Without another git add, the index still contains Version 2.'}
          ]}},
      {id:'committed-v2',title:'Commit the staged version',actions:[git('commit','-m','Record the selected second version')],
        state:state('Version 2\n','Version 2\n','Version 3\n',' M notes.txt'),
        diffs:{working:'-Version 2\n+Version 3\n',staged:''},
        instruction:'Commit without staging again. Do not use -a: that option would stage tracked modifications and change this experiment.',
        inspect:[git('show','HEAD:notes.txt'),git('show',':notes.txt'),git('status','--short'),git('diff','--staged'),git('diff')],
        observation:'The commit and index contain Version 2. The working file still contains Version 3. The staged diff is empty; the working diff still shows Version 2 → Version 3. The exercise intentionally ends with an uncommitted edit.'}
    ],
    independent:{
      title:'Choose one version and leave another file out',
      task:'In the same practice repository, replace notes.txt with Meet on Tuesday and save. Stage only notes.txt. Then change it to Meet on Wednesday without staging again. Create checklist.txt containing Bring a notebook. Commit only the staged Tuesday version, leaving Wednesday and the checklist outside the commit. Predict the result before opening the answer.',
      actions:[edit('notes.txt','Meet on Tuesday\n'),git('add','--','notes.txt'),edit('notes.txt','Meet on Wednesday\n'),edit('checklist.txt','Bring a notebook\n'),git('commit','-m','Record the Tuesday meeting')],
      inspect:[git('show','HEAD:notes.txt'),git('diff','--staged'),git('diff'),git('status','--short'),git('ls-tree','--name-only','HEAD')],
      answer:'Stage notes.txt after saving Tuesday, then save Wednesday and create checklist.txt. Commit without -a or another add. HEAD and the index contain Meet on Tuesday; the working notes contain Meet on Wednesday. checklist.txt remains untracked and is absent from HEAD. The staged diff is empty, the working diff shows Tuesday → Wednesday, and status shows an unstaged notes.txt plus an untracked checklist.txt.',
      final:{head:{'notes.txt':'Meet on Tuesday\n'},index:{'notes.txt':'Meet on Tuesday\n'},working:{'notes.txt':'Meet on Wednesday\n','checklist.txt':'Bring a notebook\n'},branch:'main',status:' M notes.txt\n?? checklist.txt'}
    }
  }];
  lessons.unshift({
    id:'setup',title:'Set up a practice repository',optional:true,
    outcome:'Check Git availability, confirm the practice directory, and verify repository-local author identity.',
    prerequisites:'Use a terminal in a parent directory outside your existing repositories and a plain-text editor. This lesson is optional if you already know how to prepare a fresh practice repository.',
    directory:'gitunstuck-setup',reference:'card-init',referenceLabel:'Repository setup reference',sources:['init','config','revParse'],
    initial,final:initial,setup:practiceSetup('gitunstuck-setup'),
    checkpoints:[
      {id:'initial',title:'Prepare and locate the repository',actions:[],state:initial,
        instruction:'Use the shared setup above. Before the first commit, confirm the location and example author settings. The displayed comparison describes the completed starting snapshot, not the empty directory before setup.',
        inspect:[git('rev-parse','--show-toplevel'),git('config','--local','--get','user.name'),git('config','--local','--get','user.email')],
        observation:'The top-level path ends in gitunstuck-setup. The local identity is Practice Learner and learner@example.invalid. If the path is different, stop and find the practice directory before changing repository state.'},
      {id:'confirmed',title:'Verify the starting snapshot',actions:[],state:initial,
        instruction:'Inspect the initial commit and status. A successful editor save alone would not have created this commit.',
        inspect:[git('show','HEAD:notes.txt'),git('status','--short'),git('log','-1','--format=%s')],
        observation:'The committed file is Version 1, the commit message is Record the first version, and short status prints nothing. This setup repository is clean. Each later lesson starts in a separate named directory.'}
    ],
    independent:{
      title:'Confirm the context without changing it',
      task:'Close and reopen your terminal, return to gitunstuck-setup, and check its top-level path and local author identity before running another repository-changing command. Explain why a different path or missing identity should stop the exercise.',
      actions:[],inspect:[git('rev-parse','--show-toplevel'),git('config','--local','--get','user.name'),git('config','--local','--get','user.email'),git('status','--short')],
      answer:'Use pwd in Bash or Get-Location in PowerShell to locate yourself. Change to your existing gitunstuck-setup directory, then run the checks below. The repository path must match it; local identity should show Practice Learner and learner@example.invalid. A different path risks changing the wrong project. If identity is missing, repeat only the two local identity commands from setup in the checked practice repository. Status should still be empty; this task intentionally creates no new changes.',
      final:initial
    }
  });
  const inspectHead={'notes.txt':'Version 1\n','.gitignore':'scratch.txt\n'};
  const inspectWorking={...inspectHead,'scratch.txt':'Private practice draft\n'};
  const inspectInitial={head:inspectHead,index:inspectHead,working:inspectWorking,branch:'main',status:''};
  const inspectEdited={head:inspectHead,index:inspectHead,working:{...inspectWorking,'notes.txt':'Plan the meeting\n','checklist.txt':'Bring a notebook\n'},branch:'main',status:' M notes.txt\n?? checklist.txt'};
  const inspectStaged={...inspectEdited,index:{...inspectHead,'notes.txt':'Plan the meeting\n'},status:'M  notes.txt\n?? checklist.txt'};
  lessons.splice(1,0,{
    id:'inspect',title:'Read the repository’s state',
    summary:'Read what changed and what a commit would include.',
    outcome:'Identify tracked, untracked, ignored, staged and unstaged content, and explain what the next commit can record.',
    prerequisites:'Know how to locate a fresh practice repository, or use the optional setup lesson. No previous lesson’s files are reused.',
    directory:'gitunstuck-inspect',reference:'card-stage',referenceLabel:'Status and staged-diff reference',sources:['status','diff','add','ignore'],
    initial:inspectInitial,final:inspectStaged,
    setup:practiceSetup('gitunstuck-inspect',inspectWorking,['notes.txt','.gitignore']),
    checkpoints:[
      {id:'initial',title:'Read a clean status and its limits',actions:[],state:inspectInitial,
        instruction:'Complete the setup above, including .gitignore and scratch.txt. The ignore rule excludes scratch.txt from ordinary status. It does not protect or back up that file.',
        inspect:[git('status','--short'),git('ls-files'),git('status','--short','--ignored'),git('remote','-v')],
        observation:'Ordinary short status is empty. ls-files lists .gitignore and notes.txt as tracked. With --ignored, status shows !! scratch.txt. Clean status does not mean every disk file is committed. It also says nothing about current server changes; this practice repository has no remote.'},
      {id:'working',title:'Distinguish modified and untracked files',actions:[edit('notes.txt','Plan the meeting\n'),edit('checklist.txt','Bring a notebook\n')],state:inspectEdited,
        instruction:'Edit the tracked notes file and create the new checklist file. Read status before choosing anything to stage.',
        inspect:[git('status','--short'),git('diff'),git('diff','--staged')],
        observation:'The second-column M is an unstaged tracked-file edit; ?? marks an untracked file. git diff shows the notes edit but not checklist content. The staged diff is empty: neither new content is selected for a commit yet.',
        prediction:{question:'What will git add -- notes.txt select for the next commit?',choices:[
          {id:'notes',text:'Only the current notes content',correct:true,feedback:'Yes. This path selects notes.txt. The checklist remains untracked and the ignored scratch file is still outside the index.'},
          {id:'all',text:'Every file in the directory',correct:false,feedback:'Naming notes.txt limits the action to that path. It does not add checklist.txt or the ignored scratch file.'},
          {id:'none',text:'Nothing until a commit is created',correct:false,feedback:'Staging changes the index before a commit exists. The next checkpoint shows that selected content separately from HEAD.'}
        ]}},
      {id:'selected',title:'Explain the staged selection',actions:[git('add','--','notes.txt')],state:inspectStaged,
        instruction:'Stage only notes.txt, then explain each observation before opening the independent answer.',
        inspect:[git('status','--short'),git('diff'),git('diff','--staged'),git('ls-files')],
        observation:'The first-column M now describes the staged notes edit. The working diff is empty for tracked files, but checklist.txt is still untracked. The next commit would change notes.txt and leave the checklist and ignored scratch file out. This lesson ends without committing that selection.'}
    ],
    independent:{
      title:'Read a fresh mixed state',
      task:'Save notes.txt as Confirm the room and stage only it. Then save it as Confirm the room and time without staging again. Change the untracked checklist to Bring two notebooks. Predict the status columns and the content selected for a commit; explain why an empty checklist entry in git diff is not evidence that the checklist was committed.',
      actions:[edit('notes.txt','Confirm the room\n'),git('add','--','notes.txt'),edit('notes.txt','Confirm the room and time\n'),edit('checklist.txt','Bring two notebooks\n')],
      inspect:[git('status','--short'),git('diff'),git('diff','--staged'),git('show',':notes.txt'),git('status','--short','--ignored')],
      answer:'Status shows MM notes.txt and ?? checklist.txt. The index selects Confirm the room; the working file adds and time. The checklist remains untracked, so ordinary git diff omits its content. --ignored also shows !! scratch.txt. No new commit has been created: HEAD is still Version 1, while staged and working edits intentionally remain.',
      final:{head:inspectHead,index:{...inspectHead,'notes.txt':'Confirm the room\n'},working:{...inspectWorking,'notes.txt':'Confirm the room and time\n','checklist.txt':'Bring two notebooks\n'},branch:'main',status:'MM notes.txt\n?? checklist.txt'}
    }
  });
  const historyHead={'notes.txt':'Version 1\n','checklist.txt':'Bring a notebook\n'};
  const historyWorking={'notes.txt':'Meet at 10\n','checklist.txt':'Bring a notebook and pen\n'};
  const historyInitial={head:historyHead,index:historyHead,working:historyHead,branch:'main',status:''};
  const historySelected={head:historyHead,index:{...historyHead,'notes.txt':'Meet at 10\n'},working:historyWorking,branch:'main',status:' M checklist.txt\nM  notes.txt'};
  const historyCommitted={head:historySelected.index,index:historySelected.index,working:historyWorking,branch:'main',status:' M checklist.txt'};
  lessons.push({
    id:'history',title:'Record and inspect history',
    summary:'Make a focused commit and check its contents.',
    outcome:'Create a focused commit, inspect its complete snapshot and message, and identify work that remains outside that commit.',
    prerequisites:'Understand working files and the index from the staging lesson. Begin in this lesson’s fresh directory, not a previous exercise.',
    directory:'gitunstuck-history',reference:'card-stage',referenceLabel:'Commit creation and inspection reference',sources:['commit','show','log','diff'],
    initial:historyInitial,final:historyCommitted,setup:practiceSetup('gitunstuck-history',historyHead),
    checkpoints:[
      {id:'initial',title:'Inspect the first snapshot',actions:[],state:historyInitial,
        instruction:'Complete the two-file setup. Inspect a commit by its name HEAD, which identifies your current commit through main here.',
        inspect:[git('log','-1','--oneline'),git('show','HEAD:notes.txt'),git('show','HEAD:checklist.txt')],
        observation:'The first message is Record the first version. Its snapshot contains Version 1 in notes.txt and Bring a notebook in checklist.txt. Commit IDs depend on metadata and will differ from another person’s practice repository.'},
      {id:'edited',title:'Make two separate changes',actions:[edit('notes.txt','Meet at 10\n'),edit('checklist.txt','Bring a notebook and pen\n')],
        state:{head:historyHead,index:historyHead,working:historyWorking,branch:'main',status:' M checklist.txt\n M notes.txt'},
        instruction:'Change the meeting time and the checklist in your editor. Treat the time change as one focused commit; leave the checklist edit for later.',
        inspect:[git('status','--short'),git('diff')],
        observation:'Both tracked files have unstaged changes. Nothing is selected for the next commit. A meaningful commit message describes a change; Git does not require a prefix such as feat:.'},
      {id:'selected',title:'Review the focused selection',actions:[git('add','--','notes.txt')],state:historySelected,
        instruction:'Stage only notes.txt, then review the staged diff before committing. Do not use git add . or commit -a for this selection.',
        inspect:[git('diff','--staged'),git('diff'),git('status','--short')],
        observation:'The staged diff contains only the time change. The working diff contains the checklist edit. The index still contains the checklist’s original content.',
        prediction:{question:'What snapshot will the next commit record?',choices:[
          {id:'selected',text:'New meeting time, original checklist',correct:true,feedback:'Yes. The complete staged snapshot contains the new notes and the unchanged tracked checklist. Its unstaged edit stays on disk.'},
          {id:'both',text:'Both files’ latest working content',correct:false,feedback:'Committing without -a does not stage the checklist edit. The index still has the original checklist.'},
          {id:'missing',text:'Only notes.txt; no checklist file',correct:false,feedback:'A commit records a full snapshot, not just changed files. The unchanged checklist is still in the index, so the commit keeps its original content.'}
        ]}},
      {id:'committed',title:'Verify the commit and remaining work',actions:[git('commit','-m','Set the meeting time')],state:historyCommitted,
        instruction:'Record the reviewed selection, then inspect the committed contents rather than relying only on the success message.',
        inspect:[git('log','-2','--oneline'),git('show','--stat','--oneline','HEAD'),git('show','HEAD:notes.txt'),git('show','HEAD:checklist.txt'),git('diff'),git('status','--short')],
        observation:'The new message is Set the meeting time. Only notes.txt changed relative to its parent, but the snapshot contains both tracked files. The committed checklist still says Bring a notebook; its and pen edit remains unstaged. This local commit has not been published; there is no remote configured.'}
    ],
    independent:{
      title:'Commit the checklist and leave a later time edit',
      task:'Replace checklist.txt with Bring two notebooks and stage only that file. Then change notes.txt to Meet at 11 without staging it. Record a focused checklist commit with a meaningful message. Verify the new snapshot, changed paths, parent relationship and remaining working edit.',
      actions:[edit('checklist.txt','Bring two notebooks\n'),git('add','--','checklist.txt'),edit('notes.txt','Meet at 11\n'),git('commit','-m','Prepare two notebooks')],
      inspect:[git('show','HEAD:checklist.txt'),git('show','HEAD:notes.txt'),git('show','--stat','--oneline','HEAD'),git('log','-3','--oneline'),git('diff','--staged'),git('diff'),git('status','--short')],
      answer:'The new commit contains Bring two notebooks in checklist.txt and Meet at 10 in notes.txt. Only checklist.txt changed from its parent, the Set the meeting time commit. The index agrees with HEAD and its diff is empty. Meet at 11 remains an unstaged notes edit; it is intentionally not part of this commit. No push occurred.',
      final:{head:{'notes.txt':'Meet at 10\n','checklist.txt':'Bring two notebooks\n'},index:{'notes.txt':'Meet at 10\n','checklist.txt':'Bring two notebooks\n'},working:{'notes.txt':'Meet at 11\n','checklist.txt':'Bring two notebooks\n'},branch:'main',status:' M notes.txt'}
    }
  });
  const branchFiles=(notes,checklist='Bring a notebook\n')=>({'notes.txt':notes,'checklist.txt':checklist});
  const branchState=(notes,checklist,branch,headCommit,refs)=>{
    const files=branchFiles(notes,checklist);
    return {head:files,index:files,working:files,status:'',branch,headCommit,refs,mergeHead:null};
  };
  const record=(commitId,message)=>({...git('commit','-m',message),commitId});
  const branchInitial=branchState('Meet on Tuesday\n','Bring a notebook\n','main','b0',{main:'b0'});
  const branchRefs={main:'b4','topic-notes':'b1','topic-checklist':'b2'};
  const preparedRefs={...branchRefs,main:'b6','topic-time':'b5'};
  const branchPrepared=branchState('Meet at 11\n','Bring a notebook and pen\n','main','b6',preparedRefs);
  const branchConflict={...branchPrepared,
    index:{'checklist.txt':'Bring a notebook and pen\n'},
    unmerged:{'notes.txt':{base:'Meet on Thursday\n',ours:'Meet at 11\n',theirs:'Meet at 10\n'}},
    working:branchFiles('<<<<<<< HEAD\nMeet at 11\n=======\nMeet at 10\n>>>>>>> topic-time\n','Bring a notebook and pen\n'),
    status:'UU notes.txt',mergeHead:'b5'
  };
  const branchResolved={...branchPrepared,index:branchFiles('Meet at 10:30\n','Bring a notebook and pen\n'),working:branchFiles('Meet at 10:30\n','Bring a notebook and pen\n'),status:'M  notes.txt',mergeHead:'b5'};
  const branchFinal=branchState('Meet at 10:30\n','Bring a notebook and pen\n','main','b7',{...preparedRefs,main:'b7'});
  const branchSetup=practiceSetup('gitunstuck-branches',branchInitial.working);
  branchSetup.git.push(git('config','--local','merge.conflictStyle','merge'));
  branchSetup.note='This practice repository uses the simple merge conflict-marker style. The setting is local to this directory.';
  lessons.push({
    id:'branches',title:'Work on a branch and merge',
    summary:'Work on a branch, merge, and resolve a simple conflict.',
    outcome:'Explain HEAD and branch tips, distinguish fast-forward from a merge commit, and resolve a deliberate same-line conflict.',
    prerequisites:'Understand commits and the index. Use this fresh practice directory and check that status is clean before each branch switch or merge below.',
    directory:'gitunstuck-branches',reference:'card-branch',referenceLabel:'Branch creation reference',sources:['switch','merge','show'],
    initial:branchInitial,final:branchFinal,setup:branchSetup,
    commits:[
      {id:'b0',parents:[],subject:'Record the first version'},
      {id:'b1',parents:['b0'],subject:'Move meeting to Wednesday'},
      {id:'b2',parents:['b1'],subject:'Prepare a pen'},
      {id:'b3',parents:['b1'],subject:'Move meeting to Thursday'},
      {id:'b4',parents:['b3','b2'],subject:'Merge checklist work'},
      {id:'b5',parents:['b4'],subject:'Choose the morning meeting'},
      {id:'b6',parents:['b4'],subject:'Choose the later meeting'},
      {id:'b7',parents:['b6','b5'],subject:'Resolve the meeting time'},
      {id:'b8',parents:['b7'],subject:'Choose the library'}
    ],
    checkpoints:[
      {id:'initial',title:'Start from a clean main branch',actions:[],state:branchInitial,
        instruction:'Complete the setup. In these illustrations, b0, b1 and later labels name example commits; your Git commands print actual object IDs instead.',
        inspect:[git('status','--short'),git('branch','--show-current'),git('log','-1','--oneline')],
        observation:'Status is empty and main is checked out. HEAD names main, and main identifies the initial commit b0.'},
      {id:'branched',title:'Create a branch reference',actions:[git('switch','-c','topic-notes')],
        state:branchState('Meet on Tuesday\n','Bring a notebook\n','topic-notes','b0',{main:'b0','topic-notes':'b0'}),
        instruction:'Create topic-notes. Creating a branch does not create a commit. The working directory and index are shared when switching branches: uncommitted edits can carry across, or Git can refuse a switch that would overwrite them. This example starts clean.',
        inspect:[git('branch','--show-current'),git('log','--all','--oneline','--decorate')],
        observation:'HEAD now names topic-notes. Both main and topic-notes still identify b0, and the files are unchanged.'},
      {id:'topic-committed',title:'Commit on the topic branch',
        actions:[edit('notes.txt','Meet on Wednesday\n'),git('add','--','notes.txt'),record('b1','Move meeting to Wednesday')],
        state:branchState('Meet on Wednesday\n','Bring a notebook\n','topic-notes','b1',{main:'b0','topic-notes':'b1'}),
        instruction:'Change the meeting day, stage that file, and commit on topic-notes.',
        inspect:[git('log','--all','--oneline','--decorate'),git('show','main:notes.txt')],
        observation:'Topic-notes advances to b1, whose parent is b0. Main still identifies b0, and git show main:notes.txt still prints Tuesday.'},
      {id:'fast-forward',title:'Advance main with a fast-forward',actions:[git('switch','main'),git('merge','--ff-only','topic-notes')],
        state:branchState('Meet on Wednesday\n','Bring a notebook\n','main','b1',{main:'b1','topic-notes':'b1'}),
        instruction:'Switch to clean main and merge with --ff-only. Stop if it refuses: this example expects main to be an ancestor of topic-notes.',
        inspect:[git('log','--all','--oneline','--decorate'),git('status','--short')],
        observation:'Main advances from b0 to the existing b1. HEAD names main; topic-notes stays at b1. No merge commit is created and the file now says Wednesday.'},
      {id:'diverged',title:'Create two non-overlapping changes',
        actions:[git('switch','-c','topic-checklist'),edit('checklist.txt','Bring a notebook and pen\n'),git('add','--','checklist.txt'),record('b2','Prepare a pen'),git('switch','main'),edit('notes.txt','Meet on Thursday\n'),git('add','--','notes.txt'),record('b3','Move meeting to Thursday')],
        state:branchState('Meet on Thursday\n','Bring a notebook\n','main','b3',{main:'b3','topic-notes':'b1','topic-checklist':'b2'}),
        instruction:'Commit a checklist change on a new branch, then a day change on main. Each branch now has a commit the other does not have.',
        inspect:[git('log','--all','--graph','--oneline','--decorate'),git('show','topic-checklist:checklist.txt')],
        observation:'Main identifies b3 and topic-checklist identifies b2; both have b1 as parent. Switching back to main restored its old checklist content. The two changes affect different files.',
        prediction:{question:'What should merging topic-checklist into main do here?',choices:[
          {id:'merge',text:'Create a commit with both histories as parents',correct:true,feedback:'Yes. These branches diverged. Their non-overlapping changes can combine in a new commit with b3 and b2 as parents.'},
          {id:'ff',text:'Fast-forward main without a new commit',correct:false,feedback:'Main has its own b3 commit, which is not an ancestor of topic-checklist. A fast-forward alone cannot retain both tips.'},
          {id:'conflict',text:'Always require a conflict resolution',correct:false,feedback:'Divergence does not imply a conflict. These changes affect different files, so this example combines them automatically.'}
        ]}},
      {id:'merged',title:'Inspect a clean merge commit',actions:[{...git('merge','--no-ff','--no-edit','-m','Merge checklist work','topic-checklist'),commitId:'b4'}],
        state:branchState('Meet on Thursday\n','Bring a notebook and pen\n','main','b4',branchRefs),
        instruction:'Merge the checklist branch. The message is supplied to avoid opening an editor for this example.',
        inspect:[git('show','-s','--format=%P','HEAD'),git('show','HEAD:notes.txt'),git('show','HEAD:checklist.txt'),git('status','--short')],
        observation:'The new b4 commit has b3 and b2 as its two parents. Main advances to b4, while topic-checklist remains at b2. The snapshot contains Thursday and the pen; status is clean.'},
      {id:'conflict-prepared',title:'Prepare a deliberate same-line conflict',
        actions:[git('switch','-c','topic-time'),edit('notes.txt','Meet at 10\n'),git('add','--','notes.txt'),record('b5','Choose the morning meeting'),git('switch','main'),edit('notes.txt','Meet at 11\n'),git('add','--','notes.txt'),record('b6','Choose the later meeting')],
        state:branchPrepared,
        instruction:'Choose different meeting times on topic-time and main. Both replace the same original line. Inspect the two committed versions before merging.',
        inspect:[git('show','main:notes.txt'),git('show','topic-time:notes.txt'),git('status','--short')],
        observation:'Main at b6 says 11 and topic-time at b5 says 10. Their common base b4 says Thursday. Status is clean before the merge.'},
      {id:'conflicted',title:'Inspect the paused merge',actions:[{...git('merge','--no-ff','--no-edit','topic-time'),expectedExit:1}],state:branchConflict,
        instruction:'This merge intentionally reports a conflict. That expected error is the checkpoint: stop and inspect it. Do not commit the conflict markers as your resolution.',
        inspect:[git('status','--short'),git('show',':1:notes.txt'),git('show',':2:notes.txt'),git('show',':3:notes.txt')],
        observation:'UU marks an unmerged path. Main and HEAD remain at b6; no merge commit exists yet. The index holds base (Thursday), ours (11) and theirs (10), rather than one staged notes version. The working file contains conflict markers. This illustration uses the configured simple marker style.',
        recovery:'merge',
        alternative:{title:'If you choose to stop this practice merge',
          stop:'Stop if this is not the fresh gitunstuck-branches repository, another operation is active, or you need the current resolution and have not copied it elsewhere.',
          checks:[git('status'),git('diff','--name-only','--diff-filter=U')],
          effect:'Abort discards this merge’s in-progress resolution. This fixture started clean: abort restores the notes from main at b6 and leaves the branch tips unchanged. It is not a general way to preserve pre-existing uncommitted work.',
          actions:[git('merge','--abort')],
          after:'After aborting, do not continue to the resolution checkpoint. Use a fresh practice directory and repeat setup and preceding steps if you want to retry.',recipe:'merge',source:'merge'}},
      {id:'resolved',title:'Choose and review the intended resolution',actions:[edit('notes.txt','Meet at 10:30\n'),git('add','--','notes.txt')],state:branchResolved,
        instruction:'For this exercise, agree on 10:30. Replace all notes.txt contents with the chosen line, removing every conflict marker. Stage the path, then read the staged result and the actual file.',
        inspect:[git('diff','--name-only','--diff-filter=U'),git('diff','--staged'),git('show',':notes.txt'),git('status','--short')],
        observation:'The unresolved-path list is empty and the staged notes contain only Meet at 10:30. The merge is still in progress. Staging marks a path resolved; it does not prove you chose the correct text. Confirm the agreed line and absence of markers before recording it.'},
      {id:'committed',title:'Record and inspect the resolution',actions:[record('b7','Resolve the meeting time')],state:branchFinal,
        instruction:'Commit the reviewed merge resolution. Here commit -m supplies the message and completes the pending merge; the recovery reference instead uses merge --continue, which may open your editor.',
        inspect:[git('show','-s','--format=%P','HEAD'),git('show','HEAD:notes.txt'),git('status','--short')],
        observation:'Main now identifies b7, with b6 and b5 as parents. The committed, indexed and working notes all say Meet at 10:30. The merge is no longer active and no uncommitted changes remain. Topic-time still identifies b5.'}
    ],
    independent:{title:'Change the location on a new branch',
      task:'From the clean resolved state, create topic-location. Change notes.txt to Meet in the library, stage it, and commit with a meaningful message. Return to main and fast-forward it from topic-location. Predict which references move and whether another commit is created by the fast-forward.',
      actions:[git('switch','-c','topic-location'),edit('notes.txt','Meet in the library\n'),git('add','--','notes.txt'),record('b8','Choose the library'),git('switch','main'),git('merge','--ff-only','topic-location')],
      inspect:[git('branch','--show-current'),git('log','--all','--oneline','--decorate'),git('show','HEAD:notes.txt'),git('show','-s','--format=%P','HEAD'),git('status','--short')],
      answer:'The topic commit b8 changes notes.txt and has b7 as its single parent. Topic-location advances when you commit there; main stays at b7 until the fast-forward. Returning to main and merging advances it to the existing b8, without another commit. HEAD names main, both tips identify b8, the working notes say Meet in the library, and status is clean. Older topic branches keep their previous tips.',
      final:branchState('Meet in the library\n','Bring a notebook and pen\n','main','b8',{...branchFinal.refs,main:'b8','topic-location':'b8'})
    }
  });
  const remoteTexts={r0:'Version 1\n',r1:'Meet on Tuesday\n',r2:'Meet on Thursday\n'};
  function copyState(tip,observed) {
    const files={'notes.txt':remoteTexts[tip]};
    return {head:files,index:files,working:files,status:'',branch:'main',headCommit:tip,refs:{main:tip},remoteTracking:{'origin/main':observed},mergeHead:null};
  }
  function remoteState(local,observed,partner,partnerObserved,server) {
    const learner=copyState(local,observed);
    return {...learner,repositories:{learner,partner:copyState(partner,partnerObserved),'shared.git':{bare:true,refs:{main:server},snapshot:{'notes.txt':remoteTexts[server]}}}};
  }
  const remoteInitial=remoteState('r0','r0','r0','r0','r0');
  const learnerSetup=practiceSetup('learner');
  const partnerSetup=practiceSetup('partner',undefined,undefined,{name:'Partner Learner',email:'partner@example.invalid'});
  const remoteSetup=practiceSetup('gitunstuck-remotes');
  remoteSetup.kind='remote-workspace';remoteSetup.primary='learner';
  remoteSetup.files={'learner/notes.txt':'Version 1\n'};
  remoteSetup.git=[git('-c','init.templateDir=','init','--bare','shared.git'),at('shared.git',git('symbolic-ref','HEAD','refs/heads/main')),at('shared.git',git('config','--local','core.hooksPath','hooks')),git('-c','init.templateDir=','init','learner'),...learnerSetup.git.slice(1).map(action=>at('learner',action))];
  remoteSetup.confirm=learnerSetup.confirm.map(action=>at('learner',action));
  remoteSetup.actions=[...learnerSetup.actions.map(action=>at('learner',action)),at('learner',git('remote','add','origin','../shared.git')),at('learner',git('push','-u','origin','main')),git('-c','init.templateDir=','clone','shared.git','partner'),...partnerSetup.git.filter(action=>action.args[0]==='config').map(action=>at('partner',action)),...partnerSetup.confirm.map(action=>at('partner',action))];
  remoteSetup.note='Keep your terminal in gitunstuck-remotes. Commands use git -C learner or git -C partner to choose a copy; edit the explicitly named copy’s file. shared.git is a bare repository with no working files. You act for both people in this local exercise. The notes comparison below always describes the learner copy.';
  lessons.push({
    id:'remotes',title:'Exchange work with another copy',
    summary:'See how another person’s changes reach your copy.',
    outcome:'Distinguish local, remote-tracking and server branch tips; fetch another copy’s commit without changing your files, then integrate it appropriately.',
    prerequisites:'Understand branches and fast-forward integration. Use a fresh workspace containing two local copies and one bare repository. No login or hosting account is needed; you perform both people’s actions.',
    directory:'gitunstuck-remotes',reference:'card-sync',referenceLabel:'Remote inspection and integration reference',sources:['fetch','push','clone','remote'],
    initial:remoteInitial,final:remoteState('r1','r1','r1','r1','r1'),setup:remoteSetup,
    hostingNote:'Hosted services add authentication, permissions, review requests and server rules. This local exercise does not reproduce those services; provider troubleshooting remains available in Find a command.',
    commits:[{id:'r0',parents:[],subject:'Record the first version'},{id:'r1',parents:['r0'],subject:'Arrange the Tuesday meeting'},{id:'r2',parents:['r1'],subject:'Arrange the Thursday meeting'}],
    checkpoints:[
      {id:'initial',title:'Prepare two copies and a shared repository',actions:[],state:remoteInitial,
        instruction:'Complete the workspace setup, including the first publication and partner clone. Confirm which directory every command or editor action refers to.',
        inspect:[at('learner',git('remote','-v')),at('learner',git('log','--all','--oneline','--decorate')),at('partner',git('log','--all','--oneline','--decorate')),at('shared.git',git('rev-parse','refs/heads/main'))],
        observation:'Both copies’ main and origin/main identify r0, as does main in shared.git. Each copy has its own index and working files. origin is a configured repository name; origin/main is a local remote-tracking reference, not the server’s branch itself. Clone may print absolute paths that differ on your machine.'},
      {id:'partner-committed',title:'Create a commit in the partner copy',actions:[at('partner',edit('notes.txt','Meet on Tuesday\n')),at('partner',git('add','--','notes.txt')),at('partner',record('r1','Arrange the Tuesday meeting'))],
        state:remoteState('r0','r0','r1','r0','r0'),
        instruction:'Act as the partner: edit partner/notes.txt, stage it there, and commit there. This does not publish it or change your learner copy.',
        inspect:[at('partner',git('log','--all','--oneline','--decorate')),at('shared.git',git('show','main:notes.txt')),at('learner',git('show','HEAD:notes.txt'))],
        observation:'Partner main advances to r1. Its origin/main still records r0. The shared branch and the learner copy remain at r0, with Version 1.'},
      {id:'partner-pushed',title:'Publish while the learner observation stays stale',actions:[at('partner',git('push','origin','main'))],
        state:remoteState('r0','r0','r1','r1','r1'),
        instruction:'Publish the partner’s main to the shared repository. Inspect the learner’s existing observation separately from the example server.',
        inspect:[at('learner',git('log','--oneline','main..origin/main')),at('shared.git',git('show','main:notes.txt')),at('learner',git('status','--short'))],
        observation:'Shared main now identifies r1, and the partner’s origin/main updates after its push. Learner origin/main still identifies r0: no automatic message updated this copy. Its incoming log is empty and status is clean, despite the server having a newer commit.',
        prediction:{question:'What should fetching origin in the learner copy change?',choices:[
          {id:'tracking',text:'The learner’s origin/main observation',correct:true,feedback:'Yes. Fetch downloads objects and updates the configured remote-tracking reference. Learner main, its index and working notes stay at r0 until a separate integration.'},
          {id:'working',text:'The learner’s checked-out notes immediately',correct:false,feedback:'Fetch is separate from integration. It updates origin/main here, while main and the working file remain unchanged.'},
          {id:'server',text:'The server’s branch from the learner’s old files',correct:false,feedback:'Fetch receives information; it does not publish your old branch or push working files to the server.'}
        ]}},
      {id:'fetched',title:'Fetch without changing the current snapshot',actions:[at('learner',git('fetch','origin'))],
        state:remoteState('r0','r1','r1','r1','r1'),
        instruction:'Fetch in learner, then inspect incoming commits, any outgoing commits, and current file content before choosing an integration.',
        inspect:[at('learner',git('log','--oneline','main..origin/main')),at('learner',git('log','--oneline','origin/main..main')),at('learner',git('show','HEAD:notes.txt')),at('learner',git('show','origin/main:notes.txt')),at('learner',git('status','--short'))],
        observation:'Learner origin/main now records r1, but local main, the index and working notes are still Version 1 at r0. The incoming log shows the Tuesday commit; the outgoing log is empty. With clean files and main an ancestor of origin/main, a fast-forward is appropriate.'},
      {id:'integrated',title:'Integrate the fetched commit',actions:[at('learner',git('merge','--ff-only','origin/main'))],
        state:remoteState('r1','r1','r1','r1','r1'),
        instruction:'Fast-forward learner main from its checked remote-tracking reference. If --ff-only refuses, stop and inspect the actual histories instead of forcing a replacement.',
        inspect:[at('learner',git('show','HEAD:notes.txt')),at('learner',git('log','--all','--oneline','--decorate')),at('learner',git('status','--short'))],
        observation:'Learner main advances to the existing r1 and the working file now says Meet on Tuesday. No new merge commit is created. Both copies and the shared branch agree, and all working files are clean.'}
    ],
    independent:{title:'Exchange a different meeting change',
      task:'In the partner copy, change the note to Meet on Thursday, commit it and publish it. Before fetching in learner, predict local main, origin/main and shared main. Then fetch, confirm learner notes are still Tuesday, and choose an appropriate integration. Explain which operation first changes learner’s working content.',
      actions:[at('partner',edit('notes.txt','Meet on Thursday\n')),at('partner',git('add','--','notes.txt')),at('partner',record('r2','Arrange the Thursday meeting')),at('partner',git('push','origin','main')),at('learner',git('fetch','origin')),at('learner',git('merge','--ff-only','origin/main'))],
      checkpoints:[{id:'published',afterAction:3,state:remoteState('r1','r1','r2','r2','r2')},{id:'fetched',afterAction:4,state:remoteState('r1','r2','r2','r2','r2')},{id:'integrated',afterAction:5,state:remoteState('r2','r2','r2','r2','r2')}],
      inspect:[at('learner',git('log','--all','--oneline','--decorate')),at('learner',git('show','HEAD:notes.txt')),at('partner',git('show','HEAD:notes.txt')),at('shared.git',git('show','main:notes.txt')),at('learner',git('status','--short'))],
      answer:'After the partner push, shared main and the partner’s main and origin/main identify r2, while learner main and origin/main still identify r1. Fetch updates learner origin/main to r2 without changing Tuesday in its working file. The checked fast-forward then advances learner main to r2 and updates its working note to Thursday; it creates no extra commit. All copies end clean. In a changed or diverged real state, inspect before choosing an integration.',
      final:remoteState('r2','r2','r2','r2','r2')
    }
  });
  function recoveryState(headNotes,headList,indexNotes,indexList,workingNotes,workingList,status,headCommit='k0') {
    return {head:{'notes.txt':headNotes,'checklist.txt':headList},index:{'notes.txt':indexNotes,'checklist.txt':indexList},working:{'notes.txt':workingNotes,'checklist.txt':workingList},status,branch:'main',headCommit,refs:{main:headCommit},mergeHead:null};
  }
  const keptNote='Keep this local note\n',oneBook='Bring a notebook\n',twoBooks='Bring two notebooks\n';
  const recoveryInitial=recoveryState('Version 1\n',oneBook,'Version 1\n',oneBook,'Version 1\n',oneBook,'');
  const recoveryStaged=recoveryState('Version 1\n',oneBook,keptNote,oneBook,keptNote,oneBook,'M  notes.txt');
  const recoveryUnstaged=recoveryState('Version 1\n',oneBook,'Version 1\n',oneBook,keptNote,oneBook,' M notes.txt');
  const discardReady=recoveryState('Version 1\n',oneBook,'Version 1\n',twoBooks,keptNote,'An unwanted scratch change\n','MM checklist.txt\n M notes.txt');
  const discarded=recoveryState('Version 1\n',oneBook,'Version 1\n',twoBooks,keptNote,twoBooks,'M  checklist.txt\n M notes.txt');
  const recoveryRecorded=recoveryState(keptNote,twoBooks,keptNote,twoBooks,keptNote,twoBooks,'','k2');
  const recoveryFinal=recoveryState(keptNote,oneBook,keptNote,oneBook,keptNote,oneBook,'','k3');
  lessons.push({
    id:'recovery',title:'Choose a recovery action',
    summary:'Choose a recovery action for the state you are in.',
    outcome:'Choose and justify unstaging, replacing one unwanted working edit, or adding a revert commit from the actual repository state.',
    prerequisites:'Understand HEAD, index and working files. Use only this fresh practice directory. Inspect the selected path before each operation; the cases below deliberately preserve the wanted note.',
    directory:'gitunstuck-recovery',reference:'card-undo',referenceLabel:'Checked recovery reference',sources:['restore','revert','diff'],
    initial:recoveryInitial,final:recoveryFinal,setup:practiceSetup('gitunstuck-recovery',recoveryInitial.working),
    commits:[{id:'k0',parents:[],subject:'Record the first version'},{id:'k1',parents:['k0'],subject:'Record the checklist choice'},{id:'k2',parents:['k1'],subject:'Keep the local note'},{id:'k3',parents:['k2'],subject:'Revert "Record the checklist choice"'}],
    checkpoints:[
      {id:'initial',title:'Identify what needs to change',actions:[],state:recoveryInitial,
        instruction:'Complete the two-file setup. The next cases distinguish the index, a working file, and an already recorded commit. They do not use a broad reset or force-push.',
        inspect:[git('status','--short'),git('log','-1','--oneline')],
        observation:'The repository is clean. No merge or other operation is active. Keep notes.txt throughout the first two cases; only the deliberately unwanted checklist working edit will be discarded.'},
      {id:'selected',title:'Prepare a wanted note that should not be staged',actions:[edit('notes.txt',keptNote),git('add','--','notes.txt')],state:recoveryStaged,
        instruction:'Save and stage the wanted note. Now decide to keep it on disk but exclude its change from the next commit.',
        inspect:[git('diff'),git('diff','--staged'),git('status','--short')],
        observation:'Notes content agrees in index and working file, but differs from HEAD. You want to change the selection, not replace the working file or undo a commit.',
        prediction:{question:'Which action fits this goal?',choices:[
          {id:'unstage',text:'Unstage notes.txt',correct:true,feedback:'Yes. Unstaging replaces the selected index content from HEAD and leaves the wanted working file alone.'},
          {id:'discard',text:'Discard the working edit',correct:false,feedback:'Discard acts on working content, not the staged selection. Here index and disk agree, so restoring the working file would not even remove the staged change.'},
          {id:'revert',text:'Revert a commit',correct:false,feedback:'This note has not been committed. Revert creates a new commit for an existing history change; it does not remove this staged selection.'}
        ]}},
      {id:'unstaged',title:'Unstage while keeping the working note',actions:[git('restore','--staged','--','notes.txt')],state:recoveryUnstaged,
        instruction:'After checking the state, unstage only notes.txt. In this case there is no unique staged-only content to preserve: it also exists on disk.',
        gate:{recipe:'unstage',stop:'Stop if this is not the practice repository, a conflict/operation is active, or needed staged-only content has not been saved separately.',values:{FILE:'notes.txt'},checks:[git('status'),git('diff','--','notes.txt'),git('diff','--staged','--','notes.txt')]},
        inspect:[git('status','--short'),git('show',':notes.txt'),git('diff','--staged'),git('diff')],
        observation:'The index returns to Version 1, while the working note still says Keep this local note. The staged diff is empty and the wanted edit remains unstaged.'},
      {id:'discard-ready',title:'Prepare one unwanted working edit',comparisonFile:'checklist.txt',
        actions:[edit('checklist.txt',twoBooks),git('add','--','checklist.txt'),edit('checklist.txt','An unwanted scratch change\n')],state:discardReady,
        instruction:'Stage the two-notebook checklist, then overwrite its working contents with the unwanted scratch line. Keep the note edit. You want only the checklist working file to match its reviewed index version.',
        inspect:[git('diff','--','checklist.txt'),git('diff','--staged','--','checklist.txt'),git('status','--short')],
        observation:'The checklist index contains two notebooks, while HEAD still contains one and disk contains the scratch line. Restoring this working file will use the index, not HEAD. The unrelated notes edit must remain.'},
      {id:'discarded',title:'Replace only the unwanted checklist working content',comparisonFile:'checklist.txt',actions:[git('restore','--','checklist.txt')],state:discarded,
        instruction:'The scratch checklist line is deliberately unwanted. Confirm its path and differences, then replace only that working file from the index.',
        gate:{recipe:'discard',stop:'Stop if you want to keep the scratch checklist line, or this is not the fresh practice repository.',values:{FILE:'checklist.txt'},checks:[git('status'),git('diff','--','checklist.txt'),git('diff','--staged','--','checklist.txt')]},
        inspect:[git('diff','--','checklist.txt'),git('diff','--staged','--','checklist.txt'),git('status','--short')],
        observation:'The checklist working file now contains two notebooks, matching the index. Its working diff is empty, its staged change remains, and notes.txt still contains the wanted unstaged note. The scratch working content was replaced.'},
      {id:'recorded',title:'Prepare a clean history-recovery case',
        actions:[record('k1','Record the checklist choice'),git('add','--','notes.txt'),record('k2','Keep the local note')],state:recoveryRecorded,
        instruction:'Record the reviewed checklist selection, then record the wanted note separately. For the next case, treat the checklist choice as a committed mistake while keeping the note. HEAD~1 means the current commit’s first parent: here it is exactly the checklist commit.',
        inspect:[git('status','--short'),git('log','-3','--oneline'),git('show','HEAD~1')],
        observation:'The index and working tree are clean. HEAD is the Keep the local note commit; its parent recorded only the checklist change. Inspect that non-merge parent before choosing an inverse operation. No publishing occurs in this practice case.'},
      {id:'reverted',title:'Add an inverse commit without deleting history',actions:[{...git('revert','--no-edit','HEAD~1'),commitId:'k3'}],state:recoveryFinal,
        instruction:'Undo the checked checklist commit. In this fixed exercise HEAD~1 identifies it; in another repository inspect and use the intended commit ID. --no-edit accepts the generated revert message instead of opening an editor.',
        gate:{recipe:'revert',title:'Revert the checked checklist commit',stop:'Stop unless the index and working tree are clean, no operation is active, and the selected parent is the intended non-merge checklist commit.',values:{COMMIT_ID:'HEAD~1'},checks:[git('status'),git('show','HEAD~1')]},
        inspect:[git('log','-4','--oneline'),git('show','HEAD:checklist.txt'),git('show','HEAD:notes.txt'),git('status','--short')],
        observation:'A new revert commit restores the one-notebook checklist and keeps the wanted note. The checklist commit and the note commit remain in history. The repository ends clean. Revert adds history; it does not erase a commit or remove a secret from old history.'}
    ],
    independent:{title:'Choose from a different mixed state',
      task:'Save notes.txt as Keep this later draft and stage it. Then save Keep this later draft and detail without staging again. Keep the current working contents but remove the notes change from the next commit. The intermediate staged-only draft is not needed. Choose among unstage, discard and revert and justify which state should change.',
      actions:[edit('notes.txt','Keep this later draft\n'),git('add','--','notes.txt'),edit('notes.txt','Keep this later draft and detail\n'),git('restore','--staged','--','notes.txt')],
      gateBefore:3,gate:{recipe:'unstage',stop:'Stop if you need the intermediate staged-only draft; save it separately first. This task explicitly keeps the current working version instead.',values:{FILE:'notes.txt'},checks:[git('status'),git('diff','--','notes.txt'),git('diff','--staged','--','notes.txt')]},
      inspect:[git('status','--short'),git('show',':notes.txt'),git('diff','--staged'),git('diff'),git('log','-4','--oneline')],
      answer:'Choose unstage: the goal changes the index selection while preserving current disk content. The index returns to Keep this local note from HEAD; disk keeps Keep this later draft and detail. Discard would instead replace working content and lose the extra detail. Revert is for a checked committed change and requires a clean starting state, which this scenario does not have. No commit or history change is needed; the note intentionally remains unstaged.',
      final:recoveryState(keptNote,oneBook,keptNote,oneBook,'Keep this later draft and detail\n',oneBook,' M notes.txt','k3')
    }
  });
  function lesson(id) { return lessons.find(item=>item.id===id) || null; }
  function checkpoint(id, step) { return lesson(id)?.checkpoints.find(item=>item.id===step) || null; }
  function route(hash) {
    if(hash==='#learn') return {lesson:null,checkpoint:null,valid:true};
    const match=/^#learn\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/.exec(hash);
    if(!match || !checkpoint(match[1],match[2])) return {lesson:null,checkpoint:null,valid:false};
    return {lesson:match[1],checkpoint:match[2],valid:true};
  }
  const relatedLessons={
    'card-init':['setup','initial'], 'card-stage':['staging','edited-v3'],
    'card-branch':['branches','branched'], 'card-conflict':['branches','conflicted'],
    'card-detached':['branches','initial'], 'card-sync':['remotes','fetched'],
    'card-undo':['recovery','initial']
  };
  const recipeLessons={unstage:['staging','edited-v3'],discard:['recovery','discard-ready'],revert:['recovery','recorded'],merge:['branches','conflicted'],detached:['branches','initial'],diverged:['remotes','fetched'],sync:['remotes','fetched']};
  function returnContext(search) {
    const params=new URLSearchParams(search);
    if(params.getAll('learnReturn').length!==1 || params.getAll('learnStep').length!==1)return null;
    const id=params.get('learnReturn'),step=params.get('learnStep');
    return checkpoint(id,step)?{lesson:id,checkpoint:step}:null;
  }
  function referenceUrl(reference,id,step,search='') {
    if(!Object.hasOwn(relatedLessons,reference) || !checkpoint(id,step))return null;
    const params=new URLSearchParams(),existing=new URLSearchParams(search);
    for(const key of ['q','category','risk','mode'])if(existing.has(key))params.set(key,existing.get(key));
    params.set('learnReturn',id);params.set('learnStep',step);
    return '?'+params.toString()+'#'+reference;
  }
  function transition(id, step, direction) {
    const item=lesson(id); if(!item || !['next','previous','reset'].includes(direction)) return null;
    const index=item.checkpoints.findIndex(point=>point.id===step);if(index<0)return null;
    const next=direction==='reset'?0:Math.max(0,Math.min(item.checkpoints.length-1,index+(direction==='next'?1:-1)));
    return JSON.parse(JSON.stringify(item.checkpoints[next]));
  }
  function command(action) {
    if(action.kind!=='git') throw new Error('Only Git actions have command text');
    const args=action.repository?['-C',action.repository,...action.args]:action.args;
    return 'git '+args.map(arg=>/^[a-zA-Z0-9_./:@=-]+$/.test(arg)?arg:'"'+arg+'"').join(' ');
  }
  function content(snapshot,zone,file) {
    if(zone==='index' && snapshot.unmerged?.[file]) {
      const versions=snapshot.unmerged[file];
      return 'Unmerged — no single staged version\n'+['base','ours','theirs'].map(key=>key+': '+versions[key]).join('');
    }
    return snapshot[zone]?.[file] ?? '(absent)';
  }
  function graph(id,step) {
    const item=lesson(id), point=checkpoint(id,step);
    if(!item?.commits || !point?.state.refs)return null;
    const byId=Object.fromEntries(item.commits.map(commit=>[commit.id,commit]));
    const visible=new Set(),depths={};
    function visit(key) {
      if(visible.has(key))return depths[key];
      const commit=byId[key];if(!commit)throw new Error('Unknown example commit '+key);
      const depth=commit.parents.length?1+Math.max(...commit.parents.map(visit)):0;
      visible.add(key);depths[key]=depth;return depth;
    }
    Object.values(point.state.refs).forEach(visit);
    return {branch:point.state.branch,head:point.state.headCommit,refs:{...point.state.refs},nodes:item.commits.filter(commit=>visible.has(commit.id)).map(commit=>({id:commit.id,parents:[...commit.parents],depth:depths[commit.id]}))};
  }
  function validate(items=lessons, referenceIds=['card-stage','card-init','card-branch','card-sync','card-undo']) {
    const errors=[], ids=new Set();
    for(const item of items) {
      if(ids.has(item.id))errors.push('Duplicate lesson: '+item.id);ids.add(item.id);
      for(const field of ['id','title','outcome','prerequisites','initial','final','independent'])if(!item[field])errors.push('Missing '+field);
      if(!referenceIds.includes(item.reference))errors.push('Unknown reference: '+item.reference);
      for(const key of item.sources||[])if(!sources[key])errors.push('Unknown source: '+key);
      if(!item.independent?.final || !Array.isArray(item.independent?.actions))errors.push('Missing independent outcome: '+item.id);
      const steps=new Set();
      for(const point of item.checkpoints||[]) {
        if(steps.has(point.id))errors.push('Duplicate checkpoint: '+point.id);steps.add(point.id);
        if(!point.state || !point.observation)errors.push('Missing checkpoint evidence: '+point.id);
        if(!Array.isArray(point.actions))errors.push('Missing actions: '+point.id);
        if(point.prediction && point.prediction.choices.filter(choice=>choice.correct).length!==1)errors.push('Prediction needs one correct choice: '+point.id);
        if(point.gate && !['unstage','discard','revert'].includes(point.gate.recipe))errors.push('Unknown recovery gate: '+point.id);
      }
      if(!steps.size)errors.push('Missing checkpoints');
    }
    return errors;
  }
  const api={lessons,sources,lesson,checkpoint,route,transition,command,content,graph,validate,relatedLessons,recipeLessons,returnContext,referenceUrl};
  if(typeof module==='object' && module.exports)module.exports=api;
  else root.GitLearning=api;
})(typeof globalThis==='object'?globalThis:this);
