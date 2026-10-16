/** Rebuild the phone, footwear cards, and festival meshes from authored geometry.
 * Usage: node scripts/build_props.cjs [--workspace PATH] [--previews PATH] [--verify]
 * Requires Playwright on NODE_PATH and installed Microsoft Edge. Uses the
 * workspace's existing Three.js and FGC toolkit only while authoring.
 */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const args=process.argv.slice(2),option=(flag,fallback)=>args.includes(flag)?args[args.indexOf(flag)+1]:fallback;
const series=path.resolve(__dirname,'..'),workspace=path.resolve(option('--workspace',path.join(series,'../..')));
const previews=option('--previews',null);
const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff':'font/woff','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/build'){res.setHeader('Content-Type','text/html');return res.end('<script type="importmap">{"imports":{"three":"/foam-green-city/vendor/three/build/three.module.js"}}</script>');}
  let file=path.resolve(workspace,'.'+pathname);
  if(!file.startsWith(workspace+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(error?'Not found':data);});
});
const writeImage=(file,uri)=>fs.writeFileSync(file,Buffer.from(uri.split(',')[1],'base64'));
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/build`);
    const assets=await page.evaluate(async()=>{
      const m=await import('/xyhtamura.github.io/five-ways-through/scripts/prop-models.js');
      const phone=m.phone();
      const festival={},previews={phone:m.render(phone),geta:m.render(m.geta()),tsinelas:m.render(m.tsinelas())};
      for(const name of ['banderitas','parol','chochin','koinobori']){
        const model=m[name]();festival[name]=m.exportPhone(model,true);previews[name]=m.render(model);
      }
      return {phone:m.exportPhone(phone),festival,previews};
    });
    const data=path.join(series,'data');
    fs.writeFileSync(path.join(data,'payphone.bin'),Buffer.from(new Float32Array(assets.phone.vertices).buffer));
    fs.writeFileSync(path.join(data,'payphone.json'),JSON.stringify(assets.phone.meta,null,2)+'\n');
    writeImage(path.join(data,'payphone.webp'),assets.phone.texture);
    fs.mkdirSync(path.join(data,'festival'),{recursive:true});
    for(const [name,asset]of Object.entries(assets.festival)){
      fs.writeFileSync(path.join(data,`festival/${name}.bin`),Buffer.from(new Float32Array(asset.vertices).buffer));
      fs.writeFileSync(path.join(data,`festival/${name}.json`),JSON.stringify(asset.meta,null,2)+'\n');
      writeImage(path.join(data,`festival/${name}.webp`),asset.texture);
    }
    const indexFile=path.join(data,'objects/index.json'),index=JSON.parse(fs.readFileSync(indexFile,'utf8')).filter(e=>!['geta','tsinelas'].includes(e.name));
    for(const name of ['geta','tsinelas']){
      const image=await page.evaluate(async uri=>{
        const bitmap=await createImageBitmap(await(await fetch(uri)).blob());
        const src=Object.assign(document.createElement('canvas'),{width:bitmap.width,height:bitmap.height}),g=src.getContext('2d');g.drawImage(bitmap,0,0);
        const pixels=g.getImageData(0,0,src.width,src.height).data;let x0=src.width,y0=src.height,x1=0,y1=0;
        for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++)if(pixels[(y*src.width+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
        const out=Object.assign(document.createElement('canvas'),{width:x1-x0+9,height:y1-y0+9});out.getContext('2d').drawImage(src,x0,y0,x1-x0+1,y1-y0+1,4,4,x1-x0+1,y1-y0+1);
        return {width:out.width,height:out.height,uri:out.toDataURL('image/webp',.97)};
      },assets.previews[name]);
      const w=image.width,h=image.height;
      writeImage(path.join(data,`objects/${name}.webp`),image.uri);
      const rig={name,texture:`${name}.webp`,width:w,height:h,source:'scripts/prop-models.js',nodes:[[w/2,h,-1,0,1]],verts:[0,0,0,0,255,w,0,0,0,255,w,h,0,0,255,0,h,0,0,255],quads:[0,1,2,3]};
      fs.writeFileSync(path.join(data,`objects/${name}.json`),JSON.stringify(rig)+'\n');
      index.push({name,width:w,height:h,joints:1,verts:4,quads:1});
    }
    fs.writeFileSync(indexFile,JSON.stringify(index,null,1)+'\n');
    if(previews){fs.mkdirSync(previews,{recursive:true});for(const [name,uri]of Object.entries(assets.previews))writeImage(path.join(previews,`${name}.png`),uri);}
    console.log(`Built phone (${assets.phone.meta.vertices} vertices), footwear, and four festival models.`);
    if(args.includes('--verify')){
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      page.on('response',response=>{if(response.status()>=400)errors.push(response.status()+' '+response.url());});
      const base=`http://127.0.0.1:${server.address().port}/xyhtamura.github.io/five-ways-through/`;
      await page.setViewportSize({width:1200,height:800});
      await page.goto(base+'forgetting/');
      await page.waitForFunction(()=>document.querySelector('#begin')?.disabled===false);
      const checks=await page.evaluate(async()=>{
        const m=await import('../engine/scene.js');m.S.walking=false;
        const result=[];
        for(const name of ['geta','tsinelas']){
          const s=m.species.find(s=>s.name===name);
          if(!s||s.instanceCount!==1)throw Error(name+' not placed on the route');
          m.addCard(name,{u:-2,v:0,y:.05,height:.65});sceneStep(0);
          let hit=null;
          for(let y=.1;y<.95&&!hit;y+=.01)for(let x=.1;x<.9;x+=.01){const p=m.pickCard(x,y,s=>s.group==='objects',.05);if(p?.s.name===name){hit={x,y};break;}}
          if(!hit)throw Error(name+' not visible/pickable');
          m.hooks.down(hit.x,hit.y);
          if(!m.brush.carry?.src.endsWith(name+'.webp'))throw Error(name+' not held');
          let ground=null;
          for(let x=.05;x<.99&&!ground;x+=.05)if(!m.pickCard(x,.95,s=>s.group==='objects',.05))ground={x,y:.95};
          if(!ground)throw Error('No empty ground for drop check');
          m.hooks.down(ground.x,ground.y);
          if(m.brush.carry)throw Error(name+' not put down');
          result.push({name,picked:true,putDown:true});
        }
        return result;
      });
      console.log('Forgetting: '+JSON.stringify(checks));
      if(previews){await page.locator('#begin').evaluate(el=>el.remove());await page.screenshot({path:path.join(previews,'forgetting-scene.png')});}
      await page.goto(base+'toward/');
      await page.waitForFunction(()=>document.querySelector('#begin')?.disabled===false);
      const phone=await page.evaluate(async()=>{
        const m=await import('../engine/scene.js');m.S.walking=true;m.S.speed=.9;sceneStep(101);
        m.S.walking=false;m.S.yaw=.5;m.S.tilt=-6;m.S.aperture=.15;sceneStep(0);
        return {...document.querySelector('canvas').dataset};
      });
      if(+phone.payphones!==1)throw Error('Toward phone not drawn: '+JSON.stringify(phone));
      console.log('Toward: one phone drawn at '+phone.camera);
      if(previews){await page.locator('#begin').evaluate(el=>el.remove());await page.screenshot({path:path.join(previews,'toward-scene.png')});}
      await page.goto(base+'hours/');
      await page.waitForFunction(()=>document.querySelector('#begin')?.disabled===false);
      await page.locator('#begin').evaluate(el=>el.remove());
      const stations=await page.evaluate(async()=>{
        const m=await import('../engine/scene.js');m.S.walking=true;m.S.speed=6.5;sceneStep(3.5);m.S.walking=false;sceneStep(0);
        return {counts:JSON.parse(document.querySelector('canvas').dataset.festival),stations:document.querySelector('canvas').dataset.festivalStations};
      });
      if(Object.keys(stations.counts).length!==4)throw Error('Initial Hours mix missing: '+JSON.stringify(stations));
      if(previews)await page.screenshot({path:path.join(previews,'hours-night.png')});
      const pixels=await page.evaluate(async()=>{
        const m=await import('../engine/scene.js'),c=document.querySelector('canvas'),gl=c.getContext('webgl2');
        const read=()=>{const a=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
        sceneStep(0);const on=read();m.S.festival=false;sceneStep(0);const off=read();m.S.festival=true;sceneStep(0);
        let changed=0;for(let i=0;i<on.length;i+=4)if(Math.abs(on[i]-off[i])+Math.abs(on[i+1]-off[i+1])+Math.abs(on[i+2]-off[i+2])>10)changed++;
        return changed;
      });
      if(pixels<200)throw Error('Festival geometry not visibly contributing: '+pixels+' pixels');
      const streamed=await page.evaluate(async()=>{
        const m=await import('../engine/scene.js');m.S.walking=true;m.S.speed=6.5;sceneStep(200);m.S.walking=false;sceneStep(0);
        return {counts:JSON.parse(document.querySelector('canvas').dataset.festival),stations:document.querySelector('canvas').dataset.festivalStations};
      });
      if(streamed.stations===stations.stations)throw Error('Festival did not stream');
      for(let i=0;i<34;i++)await page.keyboard.press('ArrowRight');
      await page.evaluate(()=>sceneStep(0));
      if(previews)await page.screenshot({path:path.join(previews,'hours-amber.png')});
      console.log('Hours: '+JSON.stringify({initial:stations,streamed,changedPixels:pixels}));
      if(errors.length)throw Error(errors.join('\n'));
      console.log('No page errors.');
    }
  }finally{await browser.close();server.close();}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1;});
