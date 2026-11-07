/* Optional browser QA using an existing Playwright installation; no new dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname,'..');
const target = process.env.GITUNSTUCK_TEST_URL || pathToFileURL(path.join(root,'index.html')).href;
const output = path.join(root,'artifacts');
fs.mkdirSync(output,{recursive:true});
async function checkLearningPresentation(browser) {
  const matrix=[];
  const base=target.split('#')[0].split('?')[0];
  async function controlContrast(control,focus=false) {
    const measured=await control.evaluate((element,checkFocus)=>{
      const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number);
      const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      const ratio=(a,b)=>{a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
      function background(node) {const ancestors=[];for(let p=node;p;p=p.parentElement)ancestors.push(p);let b=[255,255,255];for(const p of ancestors.reverse()){const c=rgb(getComputedStyle(p).backgroundColor),a=c[3]??1;b=b.map((v,i)=>c[i]*a+v*(1-a));}return b;}
      const s=getComputedStyle(element),b=background(element);return {text:ratio(rgb(s.color).slice(0,3),b),border:ratio(rgb(s.borderTopColor).slice(0,3),b),focus:checkFocus?ratio(rgb(s.outlineColor).slice(0,3),background(element.parentElement)):null};
    },focus);
    assert.ok(measured.text>=4.5&&measured.border>=3,'Control state has readable text and visible boundary');
    if(focus)assert.ok(measured.focus>=3,'Focus indicator contrasts with surrounding surface');
  }
  for(const width of [320,390,768,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    for(const theme of ['light','dark']) {
      await page.goto(base+'#learn/staging/edited-v3');
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      const contrast=await page.evaluate(()=>{
        const rgba=color=>(color.match(/[\d.]+/g)||[]).map(Number);
        const luminance=rgb=>rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        let minimum=Infinity;const failures=[];
        for(const element of document.querySelectorAll('#learningCourse :is(p,a,button,summary,legend,code,pre,th,caption,h3,h4,figcaption)')) {
          if(!element.checkVisibility())continue;
          const style=getComputedStyle(element),ancestors=[];for(let p=element;p;p=p.parentElement)ancestors.push(p);
          let background=[255,255,255];for(const parent of ancestors.reverse()){const c=rgba(getComputedStyle(parent).backgroundColor),a=c[3]??1;if(c.length>=3)background=background.map((v,i)=>c[i]*a+v*(1-a));}
          const measured=ratio(rgba(style.color),background);minimum=Math.min(minimum,measured);
          const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&Number(style.fontWeight)>=700);
          if(measured<(large?3:4.5))failures.push({text:element.textContent.trim().slice(0,40),measured});
          if(element.matches('.learning-prediction button,.lesson-movement button,.copy-btn')&&ratio(rgba(style.borderTopColor),background)<3)failures.push({border:element.textContent});
        }
        return {minimum,failures};
      });
      assert.deepEqual(contrast.failures,[],`${width} ${theme} lesson contrast`);
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert.equal(await page.getByRole('region',{name:'Compare notes.txt versions'}).count(),1,'Scrolling comparison has an accessible region name');
      assert.ok(sizes.scroll<=sizes.client,`${width} ${theme} learning reflow`);
      const heading=await page.locator('#lessonTitle').boundingBox(),header=await page.locator('header').boundingBox();
      assert.ok(heading.y>=header.y+header.height,`${width} heading below sticky header`);
      for(const key of ['working','staged'])assert.equal(await page.locator(`[data-learning-diff="${key}"] code`).textContent(),require('../learning.js').checkpoint('staging','edited-v3').diffs[key]);
      const targets=await page.locator('.learning-prediction button, .lesson-reading .copy-btn').evaluateAll(elements=>elements.filter(e=>e.checkVisibility()).map(e=>({label:e.textContent,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})));
      assert.ok(targets.every(t=>t.height>=44&&t.width>=44),`${width} primary controls have 44px targets`);
      const prediction=page.locator('[data-prediction="v3"]');await prediction.hover();await controlContrast(prediction);
      await prediction.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');await controlContrast(prediction,true);
      await prediction.press('Enter');assert.match(await page.locator('#learningFeedback').innerText(),/only the working file/);
      if(width===390||width===1440)await page.screenshot({path:path.join(output,`learning-${width}-${theme}.png`)});
      matrix.push({width,theme,contrast:contrast.minimum,...sizes});
      await page.goto(base+'#learn/branches/merged');await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      const graphicContrast=await page.evaluate(()=>{
        const color=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
        const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
        const ratio=(a,b)=>{a=luminance(color(a));b=luminance(color(b));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
        const background=getComputedStyle(document.body).backgroundColor;
        const text=[...document.querySelectorAll('.learning-graph-svg text')].map(e=>ratio(getComputedStyle(e).fill,background));
        const graphics=[...document.querySelectorAll('.learning-graph-svg circle,.learning-graph-svg line')].map(e=>{const s=getComputedStyle(e);return ratio(s.stroke,e.tagName==='circle'?s.fill:background);});
        return {text:Math.min(...text),graphics:Math.min(...graphics)};
      });
      assert.ok(graphicContrast.text>=4.5&&graphicContrast.graphics>=3,'Graph text and meaningful marks have sufficient contrast');matrix[matrix.length-1].graphContrast=graphicContrast;
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Before/after graphs scroll inside the reading column');
      for(const phase of ['before','after']) {
        const figure=page.locator(`[data-graph-instance="${phase}"]`),graph=require('../learning.js').graph('branches',phase==='before'?'diverged':'merged');
        const tip=await figure.locator(`[data-commit="${graph.head}"] circle`).boundingBox(),region=await figure.locator('.learning-graph-scroll').boundingBox();
        assert.ok(tip.x>=region.x&&tip.x+tip.width<=region.x+region.width,'Current tip is visible without searching across the graph');
        assert.ok(await figure.locator('line[data-child]').evaluateAll(lines=>lines.every(line=>Number(line.getAttribute('x1'))>Number(line.getAttribute('x2')))),'Parent arrows point to older commits');
      }
      if(width===390||width===1440){await page.locator('.learning-graph-pair').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`branch-comparison-${width}-${theme}.png`)});}
    }
    // Keyboard operation starts at the focused lesson heading, with no mouse or scripted focus.
    await page.goto(base+'#learn/staging/edited-v3');
    let reached=false;
    for(let i=0;i<40;i++) {
      await page.keyboard.press('Tab');
      if(await page.evaluate(()=>document.activeElement.dataset.prediction==='v3')){reached=true;break;}
    }
    assert.ok(reached,'Prediction reachable by keyboard');
    assert.notEqual(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'none');
    const focused=await page.locator(':focus').boundingBox(),header=await page.locator('header').boundingBox();
    assert.ok(focused.y>=header.y+header.height&&focused.y+focused.height<=1000,'Focused prediction stays in visible reading area');
    await page.keyboard.press('Enter');assert.match(await page.locator('#learningFeedback').innerText(),/only the working file/);
    await page.goto(base+'#learn/staging/initial');
    let next=false;
    for(let i=0;i<45;i++) {
      await page.keyboard.press('Tab');
      if(await page.evaluate(()=>document.activeElement.closest('.lesson-movement')&&document.activeElement.tagName==='A')){next=true;break;}
    }
    assert.ok(next,'Next checkpoint reachable by keyboard');await page.keyboard.press('Enter');
    assert.equal(await page.locator('#checkpointTitle').innerText(),'Save a second version');
    // Copy failure must keep focus and explain a usable fallback.
    await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('test failure');}},configurable:true});document.execCommand=()=>false;});
    const copy=page.locator('.lesson-reading .copy-btn:visible').last();await copy.click();
    await copy.locator('xpath=self::*[contains(@class,"copy-error")]').waitFor();
    assert.equal(await copy.textContent(),'Copy failed');assert.equal(await copy.evaluate(e=>e===document.activeElement),true);
    await page.waitForFunction(()=>document.querySelector('#liveAnnouncer').textContent.includes('copy it manually'));
    for(const theme of ['light','dark']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await controlContrast(copy);}
    assert.equal(await page.locator('textarea[style*="-9999px"]').count(),0);
    await page.goto(base+'#learn/staging/committed-v2');await page.locator('.learning-transfer summary').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Expanded transfer answer contains long commands');
    // CSS zoom exercises enlarged text/reflow; actual browser-UI zoom remains separately documented.
    if(width===1440) {
      await page.evaluate(()=>document.documentElement.style.zoom='2');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'200% desktop CSS zoom does not cause page overflow');
    }
    if(width===320) {
      await page.goto(base+'#learn/inspect/working');
      const table=page.locator('.learning-table-scroll');
      assert.ok(await table.evaluate(e=>e.scrollWidth>e.clientWidth),'Longer comparison scrolls locally on narrow screens');
      await table.focus();await page.keyboard.press('ArrowRight');
      await page.waitForFunction(()=>document.querySelector('.learning-table-scroll').scrollLeft>0);
    }
    await page.close();
  }
  fs.writeFileSync(path.join(output,'learning-presentation.json'),JSON.stringify({target,matrix},null,2));
  return matrix;
}
(async()=>{
  const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const results=[];
  try {
    for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
      const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
      const page=await context.newPage();const errors=[],requests=[],messages=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',request=>requests.push(request.url()));page.on('console',message=>messages.push({type:message.type(),text:message.text()}));
      await page.addInitScript(()=>{window.testClipboard=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.testClipboard.push(text)},configurable:true});});
      await page.goto(target);await page.waitForFunction(()=>document.documentElement.dataset.destination==='fix');
      if(new URL(target).pathname.endsWith('/dist/index.html')) {
        const crypto=require('node:crypto'),fingerprint=crypto.createHash('sha256');
        const inputs=['index.html','recovery.js','learning.js','scripts/build.mjs','package-lock.json',...fs.readdirSync(root).filter(name=>name.endsWith('.svg'))].sort();
        for(const name of inputs)fingerprint.update(name+'\0').update(fs.readFileSync(path.join(root,name)));
        assert.equal(await page.locator('meta[name="gitunstuck-source-sha256"]').getAttribute('content'),fingerprint.digest('hex'),'Built artifact identifies the exact tested source inputs');
      }
      assert.deepEqual(await page.evaluate(()=>GitRecovery.recipes),require('../recovery.js').recipes,'Built/browser recipe data must equal the tested definitions');
      assert.equal(await page.locator('#statusInputText').isVisible(),true);
      await page.locator('#statusInputText').fill('GH013: Repository rule violations found');await page.locator('#analyzeStatusBtn').click();
      await page.locator('#analyzerResultPanel [data-recipe="inspect"]').waitFor({state:'visible'});
      assert.match(await page.locator('#analyzerResultPanel').innerText(),/Not enough information\./);
      await page.locator('#statusInputText').fill('GH013: Repository rule violations found\nPush cannot contain secrets');assert.equal(await page.locator('#analyzerResultPanel').isVisible(),false);await page.locator('#analyzeStatusBtn').click();
      await page.locator('#analyzerResultPanel [data-recipe="secret"]').waitFor({state:'visible'});
      await page.locator('#statusInputText').fill('<img src="invalid" onerror="window.untrustedExecuted=true">');await page.locator('#analyzeStatusBtn').click();assert.equal(await page.evaluate(()=>window.untrustedExecuted),undefined);assert.equal(await page.locator('#analyzerResultPanel img').count(),0);
      const contrast = [];
      for (const theme of ['light','dark']) {
        await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
        const failures = await page.evaluate(()=>{
          const rgba = color => (color.match(/[\d.]+/g)||[]).map(Number);
          const luminance = rgb => rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
          const failures=[];
          for(const element of document.querySelectorAll('#fix p, #fix h2, #fix h3, #fix h4, #fix pre code, #fix .card-source a, .destination-link, .btn-analyze, #fix .copy-btn')) {
            if(!element.checkVisibility())continue;
            const style=getComputedStyle(element),ancestors=[];for(let p=element;p;p=p.parentElement)ancestors.push(p);
            let background=[255,255,255];for(const parent of ancestors.reverse()){const color=rgba(getComputedStyle(parent).backgroundColor),alpha=color[3]??1;if(color.length>=3)background=background.map((v,i)=>color[i]*alpha+v*(1-alpha));}
            const foreground=rgba(style.color),a=luminance(foreground),b=luminance(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
            const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&Number(style.fontWeight)>=700),minimum=large?3:4.5;
            if(ratio<minimum)failures.push({text:element.textContent.trim().slice(0,55),ratio,minimum});
          }
          return failures;
        });
        contrast.push({theme,failures});assert.deepEqual(failures,[],`${label} ${theme} recovery text contrast`);
      }
      await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
      // Real user journeys: navigation, learning staging, command lookup and Back.
      const learning=require('../learning.js');
      assert.deepEqual(await page.evaluate(()=>GitLearning.lessons),learning.lessons,'Browser lessons must equal canonical tested definitions');
      const base=target.split('#')[0].split('?')[0];
      await page.goto(base+'#learn/setup/initial');
      assert.match(await page.locator('.learning-setup').innerText(),/outside that project/);
      assert.match(await page.locator('.learning-setup').innerText(),/Confirm location and local identity before committing/);
      await page.locator('.lesson-outline a[href="#learn/setup/confirmed"]').click();
      assert.equal(await page.locator('#checkpointTitle').innerText(),'Verify the starting snapshot');
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/gitunstuck-setup/);
      await page.locator('.next-lesson a').click();assert.equal(new URL(page.url()).hash,'#learn/inspect/initial');
      for(const point of learning.lesson('inspect').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/inspect/${point.id}"]`).click();
        assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        if(point.prediction) {
          for(const choice of point.prediction.choices) {
            await page.locator(`[data-prediction="${choice.id}"]`).click();
            assert.equal(await page.locator('#learningFeedback').textContent(),choice.feedback);
          }
        }
      }
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/checklist remains untracked/);
      await page.locator('.next-lesson a').click();assert.equal(new URL(page.url()).hash,'#learn/staging/initial');
      await page.goto(base+'#learn');
      await page.locator('#learningCourse a[href="#learn/staging/initial"]').click();
      await page.locator('#lessonTitle').waitFor({state:'visible'});
      for(const point of learning.lesson('staging').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/staging/${point.id}"]`).click();
        assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        const contents=await page.locator('.learning-comparison td pre').allTextContents();
        assert.deepEqual(contents,['head','index','working'].map(zone=>point.state[zone]['notes.txt']));
        assert.ok(await page.locator('.lesson-outline [aria-current="step"]').count()===1);
      }
      assert.match(await page.locator('.learning-transfer').innerText(),/checklist.txt/);
      await page.locator('.learning-transfer summary').click();
      assert.equal(await page.locator('.learning-transfer details').evaluate(e=>e.open),true);
      await page.locator('[data-learning-reset]').click();
      assert.equal(new URL(page.url()).hash,'#learn/staging/initial');
      await page.locator('.lesson-outline a[href="#learn/staging/edited-v3"]').click();
      await page.locator('[data-prediction="v3"]').click();assert.match(await page.locator('#learningFeedback').innerText(),/only the working file/);
      await page.locator('[data-learning-retry]').click();assert.match(await page.locator('#learningFeedback').innerText(),/another prediction/);
      await page.locator('[data-prediction="v1"]').click();assert.match(await page.locator('#learningFeedback').innerText(),/old commit/);
      await page.locator('[data-learning-reveal]').click();assert.match(await page.locator('#learningFeedback').innerText(),/index contains Version 2/);
      await page.locator('[data-prediction="v2"]').click();assert.match(await page.locator('#learningFeedback').innerText(),/unstaged working edit/);
      await page.evaluate(()=>{window.dispatchEvent(new PopStateEvent('popstate'));window.dispatchEvent(new HashChangeEvent('hashchange'));});
      assert.match(await page.locator('#learningFeedback').innerText(),/unstaged working edit/,'Duplicate history notifications preserve current feedback');
      assert.equal(new URL(page.url()).hash,'#learn/staging/edited-v3','Feedback preserves checkpoint');
      await page.reload();assert.equal(await page.locator('#checkpointTitle').innerText(),'Edit again without staging');
      await page.locator('.lesson-outline a[href="#learn/staging/staged-v2"]').click();
      await page.goBack();assert.equal(await page.locator('#checkpointTitle').innerText(),'Edit again without staging');
      await page.goForward();assert.equal(await page.locator('#checkpointTitle').innerText(),'Stage the current content');
      const lessonCopy=page.locator('.lesson-reading .snippet-block .copy-btn:visible').last();
      const lessonExpected=await lessonCopy.locator('xpath=ancestor::div[contains(@class,"snippet-block")]').locator('pre code').innerText();
      await lessonCopy.click();assert.equal(await page.evaluate(()=>window.testClipboard.at(-1)),lessonExpected);
      assert.ok(await page.locator('.lesson-reading').evaluate(e=>e.scrollWidth<=e.clientWidth),'Lesson reading column contains wide content');
      await page.locator('.lesson-reading a[data-learning-reference]').click();
      await page.locator('#card-stage').waitFor({state:'visible'});await page.reload();
      assert.equal(await page.locator('#card-stage').isVisible(),true);
      await page.goBack();assert.equal(await page.locator('#checkpointTitle').innerText(),'Stage the current content');
      await page.goto(base+'#learn/staging/edited-v3');await page.evaluate(()=>window.navigationSentinel='preserved');
      await page.locator('[data-learning-reference]').click();assert.equal(await page.evaluate(()=>window.navigationSentinel),'preserved','Reference navigation keeps the current tab document');
      assert.equal(new URL(page.url()).searchParams.get('learnStep'),'edited-v3');
      await page.reload();assert.match(await page.locator('#referenceLearningContext').innerText(),/Return to.*Edit again without staging/);
      await page.locator('#searchInput').fill('reflog');
      await page.waitForFunction(()=>new URL(location.href).searchParams.get('q')==='reflog');
      assert.equal(new URL(page.url()).searchParams.get('learnReturn'),'staging');
      const contextualReference=page.url();await page.reload();assert.equal(await page.locator('#searchInput').inputValue(),'reflog');
      await page.locator('#referenceLearningContext a').click();assert.equal(new URL(page.url()).hash,'#learn/staging/edited-v3');assert.equal(new URL(page.url()).search,'');
      await page.goBack();assert.equal(page.url(),contextualReference);assert.equal(await page.locator('#searchInput').inputValue(),'reflog');
      await page.goForward();assert.equal(await page.locator('#checkpointTitle').innerText(),'Edit again without staging');
      for(const query of ['?learnReturn=invalid&learnStep=initial','?learnReturn=staging&learnStep=invalid','?learnReturn=staging&learnReturn=recovery&learnStep=initial']) {
        await page.goto(base+query+'#card-stage');assert.doesNotMatch(await page.locator('#referenceLearningContext').innerText(),/Return to/);assert.match(await page.locator('#referenceLearningContext').innerText(),/Practise:/);
      }
      for(const [hash,recipe,expected] of [['#undo-staged','unstage','#learn/staging/edited-v3'],['#card-detached','detached','#learn/branches/initial'],['#card-sync','sync','#learn/remotes/fetched']]) {
        await page.goto(base+hash);const teaching=page.locator(`[data-recipe="${recipe}"] .recipe-learning-link a:visible`).first();
        await teaching.click();assert.equal(new URL(page.url()).hash,expected);
      }
      await page.goto(base+'#learn/history/initial');
      for(const point of learning.lesson('history').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/history/${point.id}"]`).click();
        assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        if(point.prediction)for(const choice of point.prediction.choices){await page.locator(`[data-prediction="${choice.id}"]`).click();assert.equal(await page.locator('#learningFeedback').textContent(),choice.feedback);}
      }
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/Only checklist.txt changed/);
      await page.locator('.next-lesson a').click();assert.equal(new URL(page.url()).hash,'#learn/branches/initial');
      for(const point of learning.lesson('branches').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/branches/${point.id}"]`).click();
        assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        assert.deepEqual(await page.locator('.learning-comparison td pre').allTextContents(),['head','index','working'].map(zone=>learning.content(point.state,zone,'notes.txt')));
        const refs=await page.locator('.learning-ref-list > div').evaluateAll(elements=>Object.fromEntries(elements.map(e=>[e.querySelector('dt').textContent,e.querySelector('dd').textContent])));
        assert.deepEqual(refs,point.state.refs);
        const displayed=await page.locator('[data-graph-instance="after"] line[data-child]').evaluateAll(elements=>elements.map(e=>[e.dataset.child,e.dataset.parent]));
        assert.deepEqual(displayed,learning.graph('branches',point.id).nodes.flatMap(node=>node.parents.map(parent=>[node.id,parent])));
        assert.equal(await page.locator('[data-graph-instance="after"] g[data-commit]').count(),learning.graph('branches',point.id).nodes.length);
        if(point.prediction)for(const choice of point.prediction.choices){await page.locator(`[data-prediction="${choice.id}"]`).click();assert.equal(await page.locator('#learningFeedback').textContent(),choice.feedback);}
        if(point.alternative) {
          await page.locator('.learning-alternative summary').click();
          assert.match(await page.locator('.learning-alternative').innerText(),/may not reconstruct pre-existing dirty work/);
          const abortCopy=page.locator('.learning-alternative .copy-btn').last();await abortCopy.click();
          assert.equal(await page.evaluate(()=>window.testClipboard.at(-1)),'git merge --abort');
          await page.screenshot({path:path.join(output,`${label}-branches-conflict.png`)});
        }
      }
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/without another commit/);
      await page.goto(base+'#learn/branches/conflicted');await page.reload();
      assert.equal(await page.locator('.learning-comparison th').nth(1).innerText(),'Index — unresolved versions');
      await page.locator('[data-learning-reset]').click();assert.equal(new URL(page.url()).hash,'#learn/branches/initial');
      await page.goto(base+'#learn/remotes/initial');
      let learnerContents;
      for(const point of learning.lesson('remotes').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/remotes/${point.id}"]`).click();
        assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        const contents=await page.locator('.learning-comparison td pre').allTextContents();
        assert.deepEqual(contents,['head','index','working'].map(zone=>learning.content(point.state,zone,'notes.txt')));
        assert.match(await page.locator('.learning-comparison caption').innerText(),/learner\/notes.txt/);
        for(const [name,snapshot] of Object.entries(point.state.repositories)) {
          const copy=page.locator(`[data-example-repository="${name}"]`);
          assert.match(await copy.innerText(),new RegExp('main: '+snapshot.refs.main));
          if(snapshot.remoteTracking)assert.match(await copy.innerText(),new RegExp('origin/main: '+snapshot.remoteTracking['origin/main']));
        }
        if(point.prediction)for(const choice of point.prediction.choices){await page.locator(`[data-prediction="${choice.id}"]`).click();assert.equal(await page.locator('#learningFeedback').textContent(),choice.feedback);}
        if(point.id==='partner-pushed')learnerContents=contents;
        if(point.id==='fetched') {
          assert.deepEqual(contents,learnerContents,'Illustrated fetch preserves current versions');
          await page.locator('.lesson-reading > section > .snippet-block .copy-btn').first().click();
          assert.equal(await page.evaluate(()=>window.testClipboard.at(-1)),'git -C learner fetch origin');
          await page.screenshot({path:path.join(output,`${label}-remotes-fetch.png`)});
        }
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Remote comparison stays within page');
      }
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/without changing Tuesday/);
      await page.reload();assert.equal(await page.locator('#checkpointTitle').innerText(),'Integrate the fetched commit');
      await page.locator('.next-lesson a').click();assert.equal(new URL(page.url()).hash,'#learn/recovery/initial');
      for(const point of learning.lesson('recovery').checkpoints) {
        await page.locator(`.lesson-outline a[href="#learn/recovery/${point.id}"]`).click();assert.equal(await page.locator('#checkpointTitle').innerText(),point.title);
        assert.deepEqual(await page.locator('.learning-comparison td pre').allTextContents(),['head','index','working'].map(zone=>learning.content(point.state,zone,point.comparisonFile||'notes.txt')));
        if(point.prediction)for(const choice of point.prediction.choices){await page.locator(`[data-prediction="${choice.id}"]`).click();assert.equal(await page.locator('#learningFeedback').textContent(),choice.feedback);}
        if(point.gate) {
          const gate=page.locator('[aria-labelledby="checkpointTitle"] .learning-recovery-gate');
          const recipe=require('../recovery.js').recipes[point.gate.recipe];
          assert.ok((await gate.innerText()).includes(recipe.effect),'Canonical recovery consequences stay visible');
          assert.equal(await gate.locator('a').getAttribute('href'),recipe.source);
          assert.equal(await gate.evaluate(e=>Boolean(e.compareDocumentPosition(e.parentElement.querySelector(':scope > .snippet-block'))&Node.DOCUMENT_POSITION_FOLLOWING)),true,'Prerequisites and consequences precede action commands');
        }
        if(point.id==='discarded') {
          await page.locator('[aria-labelledby="checkpointTitle"] > .snippet-block .copy-btn').first().click();
          assert.equal(await page.evaluate(()=>window.testClipboard.at(-1)),'git restore -- checklist.txt');
        }
      }
      await page.locator('.learning-transfer summary').click();assert.match(await page.locator('.learning-transfer').innerText(),/Choose unstage/);
      assert.equal(await page.locator('.learning-transfer [data-learning-recipe="unstage"]').count(),1);
      await page.goto(base+'#zone-staging');
      for(const point of learning.lesson('staging').checkpoints) {
        await page.locator('#zoneCheckpointSelect').selectOption(point.id);
        assert.equal(await page.locator('#zoneWorkingContent').textContent(),point.state.working['notes.txt']);
        assert.equal(await page.locator('#zoneIndexContent').textContent(),point.state.index['notes.txt']);
        assert.equal(await page.locator('#zoneHeadContent').textContent(),point.state.head['notes.txt']);
        assert.equal(await page.locator('#zonePracticeLink').getAttribute('href'),'#learn/staging/'+point.id);
      }
      await page.locator('#zoneExamplePrevious').click();assert.equal(await page.locator('#zoneCheckpointSelect').inputValue(),'edited-v3');
      await page.locator('#zoneExampleNext').click();assert.equal(await page.locator('#zoneHeadContent').textContent(),'Version 2\n');
      await page.locator('#zoneCheckpointSelect').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
      assert.equal(await page.locator('#zoneCheckpointSelect').inputValue(),'edited-v2');
      await page.locator('#zoneExampleReset').click();assert.equal(await page.locator('#zoneCheckpointSelect').inputValue(),'initial');
      await page.goto(base+'#commitGraphExplorer');
      const metadata=page.locator('#gitInternalsInspector');assert.equal(await metadata.evaluate(e=>e.open),false);
      await metadata.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await metadata.evaluate(e=>e.open),true);
      for(const scenario of ['linear','branch','merge','rebase','detached']) {
        await page.locator(`[data-scenario="${scenario}"]`).click();
        assert.match(await page.locator('#inspectorBranchContent').innerText(),/^[0-9a-f]{40}$/);
        const head=await page.locator('#inspectorHeadContent').innerText();
        assert.match(head,scenario==='detached'?/^[0-9a-f]{40}$/:/^ref: refs\/heads\//);
        if(scenario==='detached'){assert.equal(await page.locator('#graphSvgContainer circle').count(),3);assert.match(await page.locator('#inspectorBranchPath').innerText(),/refs\/heads\/main/);}
      }
      for(const invalid of ['#learn/unknown/initial','#learn/staging/unknown','#learn/staging/initial/extra','#learn/%3Cimg%3E/initial']) {
        await page.goto(base+invalid);assert.match(await page.locator('#learningCourse [role="status"]').innerText(),/unavailable/);
        assert.equal(await page.locator('#learningCourse img').count(),0);
      }
      await page.locator('.destination-link[data-destination="learn"]').click();await page.locator('#learn').waitFor({state:'visible'});
      assert.equal(await page.locator('#learningIllustrations').isVisible(),false,'Overview has one course path without a separate illustration collection');
      await page.goto(base+'#learn/staging/edited-v3');
      await page.locator('.learning-visual > summary').click();
      assert.equal(await page.locator('.lesson-reading #fourZoneModel').isVisible(),true,'Staging tool belongs to its lesson');
      assert.equal(await page.locator('#zoneCheckpointSelect').inputValue(),'edited-v3','Embedded staging starts at the current lesson checkpoint');
      assert.equal(await page.locator('#commitGraphExplorer').isVisible(),false);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Embedded staging tool reflows');
      await page.goto(base+'#learn/branches/merged');
      await page.locator('.learning-visual > summary').click();
      assert.equal(await page.locator('.lesson-reading #commitGraphExplorer').isVisible(),true,'Graph explorer belongs to branches');
      assert.equal(await page.locator('#fourZoneModel').isVisible(),false);
      await page.locator('[data-scenario="detached"]').click();
      assert.match(await page.locator('#graphExplanationPanel').innerText(),/detached/i);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Embedded graph explorer reflows');
      await page.goto(base+'#analogy-staging');
      assert.equal(await page.locator('#analogy-staging').isVisible(),true);
      await page.locator('.destination-link[data-destination="reference"]').click();await page.locator('#reference').waitFor({state:'visible'});
      await page.locator('#searchInput').fill('reflog');assert.equal(await page.locator('#card-reflog').isVisible(),true);assert.equal(await page.locator('#card-init').isVisible(),false);
      const searchUrl=page.url();await page.reload();await page.waitForFunction(()=>document.querySelector('#searchInput').value==='reflog');assert.equal(await page.locator('#card-reflog').isVisible(),true);
      await page.locator('.destination-link[data-destination="fix"]').click();await page.goBack();await page.waitForFunction(()=>document.documentElement.dataset.destination==='reference');assert.equal(await page.locator('#searchInput').inputValue(),'reflog');assert.equal(page.url(),searchUrl);
      // Old hashes must reveal the correct destination, including advanced cards.
      for(const [hash,selector,destination] of [['#undo-lost-reflog','#treeSolutionPanel [data-recipe="reflog"]','fix'],['#card-detached','#card-detached','reference'],['#forge-gitlab/secret','#forgeDisplayPanel [data-recipe="secret"]','reference'],['#zone-staging','#zoneDetailPanel','learn'],['#terminalAnalyzer','#statusInputText','fix']]){
        await page.goto(target.split('#')[0].split('?')[0]+hash);await page.locator(selector).waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.documentElement.dataset.destination),destination);
      }
      await page.goto(target.split('#')[0].split('?')[0]+'#card-detached');await page.locator('#card-detached').waitFor({state:'visible'});
      const copy=page.locator('#card-detached [data-recipe="detached"] .copy-btn').first();const expected=await copy.locator('xpath=ancestor::div[contains(@class,"snippet-block")]').locator('pre code').innerText();await copy.click();assert.equal(await page.evaluate(()=>window.testClipboard.at(-1)),expected);
      // Keyboard entry and focus: the skip link and destination links are reachable.
      await page.goto(target);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'mainContent');
      const widths={};for(const dest of ['fix','learn','reference']) {await page.locator(`.destination-link[data-destination="${dest}"]`).click();widths[dest]=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(widths[dest].scroll<=widths[dest].client,`${label} ${dest} must not overflow`);}
      await page.goto(target.split('#')[0].split('?')[0]+'#undo-staged');await page.waitForFunction(()=>document.activeElement.id==='troubleshootConsole'&&document.querySelector('#treeSolutionPanel [data-recipe="unstage"]'));await page.locator('.tree-choice-btn[data-location="staged"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.location),'local-commit');assert.equal(await page.locator('#treeSolutionPanel [data-recipe="rewind"]').isVisible(),true);
      const focus=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle);assert.notEqual(focus,'none');
      assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
      await page.goto(target.split('#')[0].split('?')[0]+'#forge-bitbucket/secret');await page.locator('#forgeDisplayPanel [data-recipe="secret"]').waitFor({state:'visible'});await page.locator('#card-forge-troubleshoot .card-link-btn').first().click();assert.ok((await page.evaluate(()=>window.testClipboard.at(-1))).endsWith('#forge-bitbucket/secret'));
      for(const recipe of await page.locator('[data-recipe]').all()) {
        const key=await recipe.getAttribute('data-recipe');
        const headings=await recipe.locator('h4').allTextContents();const compact=await recipe.evaluate(element=>element.classList.contains('recipe-compact'));assert.deepEqual(headings,compact?['What this means','Check before continuing','What changes','Steps','Confirm it worked','If it didn’t work']:['What this means','Check before continuing','Steps','What changes','Confirm it worked','If it didn’t work']);
        const commands=await recipe.locator('.recovery-steps > li pre code').allTextContents();assert.deepEqual(commands,require('../recovery.js').recipes[key].steps.map(s=>s.code));
        const documentation=recipe.locator(':scope > .card-source a');const inherited=await recipe.evaluate(element=>Boolean(element.closest('#forgeDisplayPanel')))&&['secretFile','secretSource'].includes(key);assert.equal(await documentation.count(),inherited?0:1);
        if(!inherited){assert.equal((await documentation.textContent()).trim(),'Official documentation');const treatment=await documentation.evaluate(element=>({display:getComputedStyle(element).display,decoration:getComputedStyle(element).textDecorationLine,radius:getComputedStyle(element).borderRadius}));assert.equal(treatment.display,'inline-flex');assert.equal(treatment.decoration,'none');assert.equal(treatment.radius,'6px');}
      }
      assert.equal(await page.locator('article:has([data-recovery-slot]) > .card-source, #card-forge-troubleshoot > .card-source').count(),0,'Recipe cards must not receive a duplicate fallback source footer');
      assert.equal(await page.locator('#card-forge-troubleshoot .badge-risk-safe').count(),0);assert.equal(await page.locator('#card-forge-troubleshoot').getAttribute('data-risk'),'caution');assert.match(await page.locator('#forgeDisplayPanel [data-recipe="secret"] .recipe-risk').innerText(),/Credential exposure/);assert.equal(await page.locator('#forgeDisplayPanel [data-recipe="secret"] > h3').count(),0);
      assert.equal(await page.locator('#forgeDisplayPanel .card-source a').count(),1,'The two cleanup variants share their parent documentation link');
      await page.locator('.forge-incident-btn[data-incident="auth"]').click();await page.locator('.risk-pill[data-risk-filter="safe"]').click();assert.equal(await page.locator('#card-forge-troubleshoot').isVisible(),true);await page.locator('.forge-incident-btn[data-incident="secret"]').click();assert.equal(await page.locator('#card-forge-troubleshoot').getAttribute('data-risk'),'caution');assert.equal(await page.locator('.risk-pill[data-risk-filter="all"]').getAttribute('aria-pressed'),'true');
      await page.goto(target.split('#')[0].split('?')[0]+'#reference');await page.reload();await page.locator('#referenceInstructions').waitFor({state:'visible'});
      assert.equal(await page.locator('#reference .execution-instructions').count(),0,'Common execution guidance belongs above the reference, once');assert.equal(await page.locator('#card-stage [data-recipe="stage"] > h3').count(),0,'The card title must not repeat inside its recipe');
      const stageDetails=page.locator('#card-stage .recipe-details');assert.equal(await stageDetails.evaluate(element=>element.open),false);assert.equal(await page.locator('#card-stage .card-check').count(),0,'Do not inject a second prerequisite checklist');await stageDetails.locator('summary').click();assert.equal(await page.locator('#card-stage .recovery-steps').isVisible(),true);
      await page.locator('.destination-link[data-destination="learn"]').click();assert.match(await page.locator('.graph-subtitle').textContent(),/Each time you create a commit/);assert.doesNotMatch(await page.locator('#learn').textContent(),/automatic scrapbook|Each time you save|Two-Way Highway|Data Flow Lifecycle/);
      await page.goto(base+'#analogy-remote');
      await page.locator('#analogy-remote .analogy-action-btn').click();await page.locator('#card-sync [data-recipe="sync"]').waitFor({state:'visible'});assert.equal(await page.locator('#card-sync .card-title').innerText(),'Update a branch from its remote');assert.equal(await page.locator('#sync-diverged').evaluate(element=>element.open),false);await page.locator('#sync-diverged > summary').click();assert.equal(await page.locator('#sync-diverged [data-recipe="diverged"]').isVisible(),true);
      assert.equal(await page.locator('#heroJumpToAnalyzer').count(),0,'Do not jump to an input already visible in the hero');
      for(const destination of ['fix','learn','reference']) {
        await page.goto(target.split('#')[0].split('?')[0]+'#'+destination);
        await page.waitForFunction(d=>document.documentElement.dataset.destination===d,destination);
        const heading=await page.locator('#'+destination+' h2').first().boundingBox();assert.ok(heading.y>=0,'Destination heading must not be hidden above the viewport');
        assert.equal(await page.locator('#'+destination).evaluate(element=>getComputedStyle(element).outlineStyle),'none','Focusing a destination must not outline the entire panel');
        await page.screenshot({path:path.join(output,`${label}-${destination}.png`),fullPage:false});
      }
      await page.goto(base+'#fix');const privateMarker='PRIVATE-LEARNER-TEXT-71839';await page.locator('#statusInputText').fill(privateMarker);await page.locator('#analyzeStatusBtn').click();
      await page.locator('.destination-link[data-destination="learn"]').click();await page.locator('#learningCourse a[href="#learn/staging/initial"]').click();await page.locator('[data-learning-reference]').click();
      assert.equal(page.url().includes(privateMarker),false);assert.equal(requests.some(url=>url.includes(privateMarker)),false);assert.equal(messages.some(message=>message.text.includes(privateMarker)),false);
      assert.equal(await page.evaluate(marker=>[...Object.values(localStorage),...Object.values(sessionStorage)].some(value=>value.includes(marker)),privateMarker),false,'Terminal text is not persisted');
      await page.goto(base+'#reference');const printDetails=page.locator('#card-stage .recipe-details');assert.equal(await printDetails.evaluate(e=>e.open),false);
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('#card-stage .recovery-steps').isVisible(),true,'Print includes the reference steps');
      if(label==='desktop'){await page.screenshot({path:path.join(output,'reference-print-preview.png')});await page.pdf({path:path.join(output,'reference-print.pdf'),format:'A4'});}
      await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await printDetails.evaluate(e=>e.open),false,'Printing restores original disclosures');
      assert.deepEqual(messages.filter(message=>message.type==='error'),[],'No console errors');
      results.push({label,width,height,errors,widths,contrast,focus});assert.deepEqual(errors,[]);
      await context.close();
    }
    const learningPresentation=await checkLearningPresentation(browser);
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({target,results,learningPresentation},null,2));console.log(JSON.stringify({results,learningPresentation},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
