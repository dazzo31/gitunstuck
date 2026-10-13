import './app.mjs';
import knowledge from './knowledge.mjs';
import { guides, helpTopics } from './guides.mjs';
import { reference, comparisons } from './reference.mjs';
import { errors, diagnoseError } from './errors.mjs';
import { textElement as element } from './dom.mjs';
import { formatSnippet } from './shell-format.mjs';
import { parseRoute, viewNames } from './routing.mjs';
import './status-ui.mjs';
import './errors-ui.mjs';
import './recovery-ui.mjs';
const el=(tag,cls,text)=>element(document,tag,cls,text);
const view=name=>document.getElementById(`view-${name}`);
const titles={home:'Home',learn:'Learn',fix:'Help',reference:'Reference'};
const move=(selector,dest)=>document.querySelectorAll(selector).forEach(node=>view(dest).append(node));
move('.filter-controls-container, #searchFeedback, #cardsGrid, #noResults','reference');
// Kept hidden for legacy API adapters, not a second advertised recovery interface.
move('#troubleshootConsole','reference');
for(const [selector,label] of [['#beginnerPrimer','The essentials: files, staging and commits'],['#commitGraphExplorer','Visual guide: commits and branches'],['#jargonDeepDive','Technical detail: how Git stores history']]){
 const node=document.querySelector(selector);if(!node)continue;const details=el('details','learning-detail');details.id=selector==='#commitGraphExplorer'?'visualGuides':selector==='#beginnerPrimer'?'gitEssentials':'technicalDetail';details.append(el('summary','',label),node);view('learn').append(details);
}
const shell=document.getElementById('shellSelect');const host=document.getElementById('providerSelect');
function read(key,allowed,fallback){try{const value=localStorage.getItem(`gitunstuck.${key}`);return allowed.includes(value)?value:fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(`gitunstuck.${key}`,value);}catch{}}
shell.value=read('shell',['bash','powershell','cmd'],'powershell');host.value=read('provider',['generic','github','gitlab','bitbucket'],'generic');
function shellNote(){document.getElementById('shellNote').textContent=`${shell.selectedOptions[0].textContent} examples. Replace <placeholders> with verified values and quote paths containing spaces. Examples target Git 2.28+. Each guide states its own prerequisites.`;window.GitUnstuck.applyShell(shell.value);document.querySelectorAll('[data-canonical]').forEach(node=>node.textContent=formatSnippet(node.dataset.canonical,shell.value));}
shell.addEventListener('change',()=>{save('shell',shell.value);shellNote();});host.addEventListener('change',()=>save('provider',host.value));
document.getElementById('resetPreferences').addEventListener('click',()=>{shell.value='powershell';host.value='generic';save('shell',shell.value);save('provider',host.value);window.GitUnstuck.setMode('beginner');shellNote();});
function code(text,label='Worked example'){
 const block=el('div','snippet-block');block.append(el('div','snippet-header',label));const pre=el('pre','code-content');pre.tabIndex=0;pre.setAttribute('aria-label',label);const node=el('code','',formatSnippet(text,shell.value));node.dataset.canonical=text;pre.append(node);block.append(pre);
 const lines=text.split('\n').filter(x=>x.trim()&&!x.trim().startsWith('#'));
 if(lines.length&&lines.every(x=>/^git (status|diff|log)( |$)|^git remote -v$|^git branch --list$/.test(x))&&!text.includes('<')){const button=el('button','copy-btn','Copy checks');button.type='button';button.setAttribute('aria-label','Copy read-only checks');button.addEventListener('click',()=>window.copySnippet(button));block.querySelector('.snippet-header').append(button);}return block;
}
function part(panel,title,text){panel.append(el('h3','',title),el('p','',text));}
function link(text,href){const a=el('a','',text);a.href=href;return a;}
const guideChoices=document.getElementById('guideChoices');
for(const level of ['Start here','Everyday Git','Working with a team','Advanced Git']){
 const group=el('section','topic-group');group.append(el('h3','',level));for(const item of guides.filter(x=>x.level===level)){const a=link(item.title,`#learn/${item.id}`);a.append(el('span','',item.summary));group.append(a);}guideChoices.append(group);
}
const helpChoices=document.getElementById('helpChoices');for(const item of helpTopics){const a=link(item.title,`#fix/${item.id}`);a.append(el('span','',item.summary));helpChoices.append(a);}
const commandIndex=document.getElementById('commandIndex');for(const item of reference)commandIndex.append(link(`git ${item.id}`,`#reference/${item.id}`));
const compare=el('details','learning-detail');compare.id='commandComparisons';compare.append(el('summary','','Compare similar commands'));for(const [title,text]of comparisons)part(compare,title,text);view('reference').insertBefore(compare,document.getElementById('referenceTopicsHeading'));
function renderGuide(item){const panel=document.getElementById('guideArticle');panel.hidden=false;guideChoices.hidden=true;const heading=el('h2','',item.title);heading.tabIndex=-1;panel.replaceChildren(link('← All learning guides','#learn'),heading,el('p','guide-summary',item.summary));part(panel,'Before you start',item.prepare);part(panel,'Understand the change',item.explanation);panel.append(code(item.example));part(panel,'Check the result',item.verify);const details=el('details','learning-detail');details.append(el('summary','','If something differs'),el('p','',item.fallback));panel.append(details);const related=el('nav','related-links');related.setAttribute('aria-label','Related reference and help');for(const command of item.commands)related.append(link(`git ${command}`,`#reference/${command}`));if(item.help)related.append(link('Related help',`#fix/${item.help}`));panel.append(related);heading.focus();}
function renderHelp(item){const panel=document.getElementById('helpArticle');panel.hidden=false;helpChoices.hidden=true;const heading=el('h2','',item.title);heading.tabIndex=-1;panel.replaceChildren(link('← All help topics','#fix'),heading,el('p','guide-summary',item.summary),el('p','',item.explanation));if(item.example){panel.append(code(item.example,'Example: unstage with an existing commit'));part(panel,'What to check',item.verify);}panel.append(link('Read the worked guide',`#learn/${item.guide}`));const go=el('button','primary-action','Use guided checks for this goal');go.type='button';go.addEventListener('click',()=>{const tools=document.getElementById('guidedChecks');tools.open=true;document.getElementById('statusInput').focus();});panel.append(go);document.getElementById('guidedChecks').hidden=false;heading.focus();}
function renderCommand(item){const panel=document.getElementById('commandPage');panel.hidden=false;const heading=el('h2','',`git ${item.id} — ${item.title}`);heading.tabIndex=-1;panel.replaceChildren(link('← Reference index','#reference'),heading,code(item.syntax,'Syntax and distinct examples'));part(panel,'What it changes or reports',item.effect);part(panel,'Before using it',item.preflight);part(panel,'Check the result',item.verify);panel.append(el('p','',`These examples target Git ${item.minimumGit}+. Replace each placeholder yourself; no interpolation or execution occurs here.`),link('Worked guide',`#learn/${item.guide}`),link('Official Git documentation',item.source));heading.focus();}
const aliases={ 'undo git add':'unstage','lost branch':'reflog','push rejected':'divergence' };
function search(){const query=document.getElementById('searchInput').value.toLowerCase().trim();const output=document.getElementById('searchResults');output.replaceChildren();output.hidden=!query;if(!query)return;
 const tokens=query.split(/\s+/);const matches=text=>tokens.every(t=>text.toLowerCase().includes(t));
 const groups=[['Lessons and guides',guides.filter(x=>matches(x.title+' '+x.summary+' '+x.explanation)).map(x=>[x.title,`#learn/${x.id}`])],['Help topics',helpTopics.filter(x=>matches(x.title+' '+x.summary+' '+x.explanation)||aliases[query]===x.id).map(x=>[x.title,`#fix/${x.id}`])],['Command definitions',reference.filter(x=>matches('git '+x.id+' '+x.title+' '+x.effect)).map(x=>['git '+x.id+' — '+x.title,`#reference/${x.id}`])],['Error explanations',diagnoseError(query,host.value).matches.map(x=>[x.definition.title,`#fix/error-${x.definition.id}`])]];
 for(const [title,items]of groups){if(!items.length)continue;const group=el('section','search-group');group.append(el('h3','',title));items.forEach(([label,url])=>group.append(link(label,url)));output.append(group);}
 output.append(el('p','', 'Reference topics below use the selected category/effect filters. Related error wording is a lead to investigate, not a confirmed cause.'));
}
function selectRoute(event){const route=parseRoute(location.hash);let candidate=route.view;const legacy=route.legacy;let target=legacy?document.getElementById(legacy):null;
 if(legacy==='taskNav'||legacy==='taskNavHeading')candidate='learn';
 if(legacy==='troubleshootConsole'||legacy==='troubleshootHeading'||legacy==='treeSolutionPanel')candidate='fix';
 const active=candidate||target?.closest('.v2-view')?.id.replace('view-','')||'home';
 for(const name of viewNames)view(name).hidden=name!==active;
 for(const a of document.querySelectorAll('#v2NavLinks a')){if(a.hash===`#${active}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
 document.getElementById('routeBreadcrumb').textContent=`GitUnstuck / ${titles[active]}`;document.getElementById('mobileNavToggle').setAttribute('aria-expanded','false');document.getElementById('v2NavLinks').classList.remove('expanded');document.body.classList.toggle('is-searching',active==='reference'&&!!document.getElementById('searchInput').value.trim());
 guideChoices.hidden=false;document.getElementById('guideArticle').hidden=true;helpChoices.hidden=false;document.getElementById('helpArticle').hidden=true;document.getElementById('guidedChecks').hidden=true;document.getElementById('guidedChecks').open=false;document.getElementById('commandPage').hidden=true;
 if(active==='learn'&&route.item){const item=guides.find(x=>x.id===route.item);if(item)renderGuide(item);else if(route.item==='visuals')target=document.getElementById('visualGuides');}
 if(active==='fix'&&route.item){const ids={staged:'unstage',unstaged:'discard','local-commit':'amend','pushed-commit':'revert','lost-reflog':'reflog'};const item=helpTopics.find(x=>x.id===(ids[route.item]||route.item));if(item)renderHelp(item);else if(route.item.startsWith('error-')){const error=errors.find(x=>x.id===route.item.slice(6));if(error){document.getElementById('errorTools').open=true;document.getElementById('errorInput').value=error.canonical;document.getElementById('diagnoseError').click();}}}
 if(active==='reference'&&route.item){const item=reference.find(x=>x.id===route.item);if(item)renderCommand(item);}
 if(target&&!target.hidden){const detail=target.closest('details');if(detail)detail.open=true;target.tabIndex=-1;target.focus();target.scrollIntoView({block:'start',behavior:'auto'});}
 else if(event?.type==='hashchange'&&!route.item&&document.activeElement!==document.getElementById('searchInput')){const heading=view(active).querySelector('h2');heading?.focus();}
 document.body.classList.toggle('specific-reference',active==='reference'&&!!reference.find(x=>x.id===route.item));
 document.body.classList.toggle('specific-guide',active==='learn'&&!!guides.find(x=>x.id===route.item));
 document.body.classList.toggle('specific-help',active==='fix'&&!!helpTopics.find(x=>x.id===(route.item==='staged'?'unstage':route.item)));
 document.body.classList.toggle('home-route',active==='home');
 search();
}
window.addEventListener('hashchange',selectRoute);
document.getElementById('mobileNavToggle').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',String(open));document.getElementById('v2NavLinks').classList.toggle('expanded',open);});
document.getElementById('searchInput').addEventListener('input',()=>{search();if(location.hash!=='#reference')location.hash='reference';});
document.getElementById('searchInput').addEventListener('focus',()=>{if(document.getElementById('view-reference').hidden)location.hash='reference';});
document.getElementById('searchInput').addEventListener('keyup',event=>{if(event.key==='Escape')search();});
document.getElementById('clearSearchBtn').addEventListener('click',search);document.getElementById('resetFiltersBtn').addEventListener('click',search);
window.GitUnstuck.setMode('beginner');shellNote();selectRoute();document.documentElement.dataset.enhanced='true';
