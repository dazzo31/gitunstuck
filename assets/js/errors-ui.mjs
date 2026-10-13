import { diagnoseError, MAX_ERROR_BYTES, ERROR_CATALOGUE_VERSION } from './errors.mjs';
import { textElement } from './dom.mjs';
const el = (tag, cls, text) => textElement(document, tag, cls, text);
const input = document.getElementById('errorInput');
const output = document.getElementById('errorResults');
const provider = document.getElementById('providerSelect');
input.maxLength = MAX_ERROR_BYTES;
function clear() {output.replaceChildren();output.hidden=true;}
function render(focus=true) {
 const result = diagnoseError(input.value, provider.value);
 const heading=el('h3','',`Diagnosis: ${result.status}`);heading.tabIndex=-1;
 output.replaceChildren(heading,el('p','callout warning',result.message),el('p','',`Catalogue ${ERROR_CATALOGUE_VERSION}. Match scores rank wording; they are not probabilities or proof of a cause.`));
 for(const match of result.matches) {
  const item=match.definition; const card=el('article','v2-error-match');
  card.append(el('h4','',item.title),el('p','',`${match.reason} · score ${match.score.toFixed(2)} · supported hosts: ${item.providers.join(', ')}`));
  for(const [label,lines] of [['Possible causes',item.causes],['Questions that distinguish causes',item.questions]]) {
   card.append(el('h5','',label)); const ul=el('ul');lines.forEach(text=>ul.append(el('li','',text)));card.append(ul);
  }
  card.append(el('h5','','Read-only checks — inspect locally and redact output'));
  const pre=el('pre','code-content');pre.tabIndex=0;pre.setAttribute('aria-label','Read-only checks for '+item.title);pre.append(el('code','',item.diagnostics.join('\n')));
  const block=el('div','snippet-block');block.append(pre);card.append(block,el('p','',item.next));
  const link=el('a','','Official documentation');link.href=item.source;card.append(link,el('p','',`Reviewed ${item.lastReviewed}. Provider access and current repository state are still unverified.`));
  if(result.status==='matched' && match.score>=.85 && !match.providerMismatch && item.route) {
   const recovery=el('a','','Inspect this recovery journey');recovery.href=`#fix/${item.route}`;recovery.addEventListener('click',()=>document.getElementById('clearStatus').click());card.append(recovery);
  }
  output.append(card);
 }
 const none=el('button','','None of these match');none.type='button';none.addEventListener('click',()=>{
  clear();document.getElementById('clearStatus').click();document.getElementById('liveAnnouncer').textContent='Inspect full git status and verify the failing command, Git version and host. No repair was selected.';
 });output.append(none);output.hidden=false;if(focus)heading.focus();
}
document.getElementById('diagnoseError').addEventListener('click',()=>render());
document.getElementById('clearError').addEventListener('click',()=>{input.value='';clear();input.focus();});
input.addEventListener('input',clear);
provider.addEventListener('change',()=>{if(!output.hidden)render(false);});
