/** Check all four published font offerings in an actual Chromium browser.
 * node scripts/check-fonts.cjs --modules PATH --browser PATH [--url URL]
 */
const {parseArgs}=require('node:util'),{createRequire}=require('node:module');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {values}=parseArgs({options:{modules:{type:'string'},browser:{type:'string'},url:{type:'string',default:'http://localhost:8000/xyhtamura.github.io/fonts/'}}});
const runtime=values.modules?createRequire(path.join(path.resolve(values.modules),'_fonts.cjs')):require;
const {chromium}=runtime('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(values.browser?{executablePath:values.browser}:{}),args:['--disable-gpu-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],bad=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
  await page.goto(values.url);await page.waitForSelector('html[data-catalog-ready="true"]');await page.waitForFunction(()=>document.querySelectorAll('.glyph-cell').length===344);
  const catalog=await page.evaluate(()=>fetch('catalog.json').then(r=>r.json()));assert.equal(catalog.length,4);
  for(const f of catalog){
   const fontSpec=`${f.style==='Oblique'?'italic ':''}${f.id==='sump'||f.id==='lode'?800:400} 64px "${f.family}"`;
   await page.evaluate(spec=>document.fonts.load(spec),fontSpec);assert(await page.evaluate(spec=>document.fonts.check(spec),fontSpec));
   for(const ext of ['ttf','woff','woff2']){
    const file=f.files[ext],r=await page.request.get(new URL(file.path,values.url).href);assert.equal(r.status(),200);
    assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'),file.sha256);
   }
   await page.locator(`[data-view="${f.id}"]`).click();assert.equal(await page.locator(`#block-${f.id}`).isVisible(),true);
   for(const other of catalog)if(other.id!==f.id)assert.equal(await page.locator(`#block-${other.id}`).isVisible(),false);
   await page.locator(`#input-${f.id}`).fill('Été, São Tomé. aaaa nnnn 0123456789');
   for(const other of catalog)assert.equal(await page.locator(`#input-${other.id}`).inputValue(),'Été, São Tomé. aaaa nnnn 0123456789');
   await page.locator(`[data-font="${f.id}"]`).click();assert((await page.locator('#detail-char').getAttribute('class')).includes('font-'+f.id));
  }
  await page.locator('[data-view="stack"]').click();for(const f of catalog)assert(await page.locator('#block-'+f.id).isVisible());
  for(const f of catalog){
   await page.locator('[data-view="'+f.id+'"]').click();await page.locator('#input-'+f.id).fill('aaaa nnnn 8888');
   await page.locator('#variation-select').selectOption('auto');const a=await page.locator('#input-'+f.id).screenshot();
   await page.locator('#variation-select').selectOption('base');const b=await page.locator('#input-'+f.id).screenshot();assert(!a.equals(b),f.id+' has no contextual pixel variation');
   await page.locator('#variation-select').selectOption('2');assert((await page.evaluate(()=>getComputedStyle(document.querySelector('.test-input')).fontFeatureSettings)).includes('ss02'));
  }
  await page.locator('#variation-select').selectOption('auto');await page.locator('[data-view="stack"]').click();
  await page.locator('.preset-chip').filter({hasText:'Multilingual Latin'}).click();
  const out=path.resolve(__dirname,'../.capture/fonts');await fs.mkdir(out,{recursive:true});
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).slice(0,15).map(n=>({tag:n.tagName,id:n.id,class:n.className,right:n.getBoundingClientRect().right}))}));
  assert(overflow.scroll<=overflow.width,JSON.stringify(overflow));
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
  const portfolioChecks=[];
  const siteRoot=new URL('../',values.url);
  // The portfolio embeds unrelated videos/audio. Keep this check on its own UI and image.
  await page.route('**/*',route=>{
   const r=route.request(),u=new URL(r.url());
   if(u.origin!==siteRoot.origin||['media'].includes(r.resourceType())||r.isNavigationRequest()&&r.frame()!==page.mainFrame())return route.abort();
   return route.continue();
  });
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.goto(siteRoot.href,{waitUntil:'domcontentloaded'});
   await page.locator('#xyh-fonts').evaluate(n=>{n.open=true;n.scrollIntoView();});
   const entry=page.locator('#xyh-fonts');assert((await entry.innerText()).includes('Lode'));
   await entry.locator('img').evaluate(n=>n.decode());
   assert((await entry.locator('img').getAttribute('src')).includes('four-faces'));
   await page.goto(new URL('portfolio/',siteRoot).href,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof goTo==='function');
   await page.evaluate(()=>goTo(slides.findIndex(s=>s.piece?.id==='xyh-fonts')));
   const img=page.locator('img[src*="xyh-fonts-four-faces"]');await img.first().waitFor({state:'visible'});
   await img.first().scrollIntoViewIfNeeded();
   await img.first().evaluate(n=>n.decode());
   assert((await page.locator('#mainArea').innerText()).includes('Lode'));
   portfolioChecks.push(width);
  }
  const report={families:catalog.map(f=>({id:f.id,version:f.version})),downloadHashes:12,glyphCells:344,contextualPixelsDiffer:4,controls:true,mobileOverflow:false,pageErrors:[],portfolioWidths:portfolioChecks};
  await fs.writeFile(path.resolve(__dirname,'../fonts/verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
