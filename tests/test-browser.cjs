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
(async()=>{
  const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const results=[];
  try {
    for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
      const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
      const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(()=>{window.testClipboard=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.testClipboard.push(text)},configurable:true});});
      await page.goto(target);await page.waitForFunction(()=>document.documentElement.dataset.destination==='fix');
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
      await page.locator('.destination-link[data-destination="learn"]').click();await page.locator('#learn').waitFor({state:'visible'});
      await page.mouse.move(0,0);
      const lessonLink=page.locator('.learning-path a').first();
      const linkStyle=await lessonLink.evaluate(element=>({color:getComputedStyle(element).color,decoration:getComputedStyle(element).textDecorationLine}));
      assert.equal(linkStyle.decoration,'none');
      assert.equal(linkStyle.color,'rgb(4, 120, 87)','Learning links use the green theme colour rather than the browser default');
      const lessonTreatment=await lessonLink.evaluate(element=>({display:getComputedStyle(element).display,arrow:getComputedStyle(element,'::after').content,radius:getComputedStyle(element).borderRadius}));
      assert.equal(lessonTreatment.display,'flex');assert.equal(lessonTreatment.radius,'6px');assert.ok(lessonTreatment.arrow.includes('\u2192'));
      await page.locator('.learning-path a[href="#analogy-staging"]').click();await page.waitForFunction(()=>location.hash==='#analogy-staging');
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
        const headings=await recipe.locator(':scope > h4').allTextContents();assert.deepEqual(headings,['What this means','Check before continuing','Steps','What changes','Confirm it worked','If it didn’t work']);
        const commands=await recipe.locator(':scope > .recovery-steps > li pre code').allTextContents();assert.deepEqual(commands,require('../recovery.js').recipes[key].steps.map(s=>s.code));
        const documentation=recipe.locator(':scope > .card-source a');assert.equal(await documentation.count(),1);assert.equal((await documentation.textContent()).trim(),'Official documentation');
        const treatment=await documentation.evaluate(element=>({display:getComputedStyle(element).display,decoration:getComputedStyle(element).textDecorationLine,radius:getComputedStyle(element).borderRadius}));assert.equal(treatment.display,'inline-flex');assert.equal(treatment.decoration,'none');assert.equal(treatment.radius,'6px');
      }
      assert.equal(await page.locator('article:has([data-recovery-slot]) > .card-source, #card-forge-troubleshoot > .card-source').count(),0,'Recipe cards must not receive a duplicate fallback source footer');
      for(const destination of ['fix','learn','reference']) {
        await page.goto(target.split('#')[0].split('?')[0]+'#'+destination);
        await page.waitForFunction(d=>document.documentElement.dataset.destination===d,destination);
        const heading=await page.locator('#'+destination+' h2').first().boundingBox();assert.ok(heading.y>=0,'Destination heading must not be hidden above the viewport');
        assert.equal(await page.locator('#'+destination).evaluate(element=>getComputedStyle(element).outlineStyle),'none','Focusing a destination must not outline the entire panel');
        await page.screenshot({path:path.join(output,`${label}-${destination}.png`),fullPage:false});
      }
      results.push({label,width,height,errors,widths,contrast,focus});assert.deepEqual(errors,[]);
      await context.close();
    }
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({target,results},null,2));console.log(JSON.stringify(results,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
