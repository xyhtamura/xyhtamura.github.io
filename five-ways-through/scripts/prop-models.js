// Authoring only. Three.js and the FGC kit are read from the local workspace;
// exported assets have no runtime dependency on either project.
import * as THREE from '/foam-green-city/vendor/three/build/three.module.js';
import {createHouseholdToolKit} from '/foam-green-city/household-tools.js';
import {createDecorKit} from '/foam-green-city/decor.js';

const material = colour => new THREE.MeshStandardMaterial({color: colour, roughness: .65});
function box(group, colour, p, size, radius = .005) {
  const [w,h,d]=size,r=Math.min(radius,w/3,h/3,d/3),shape=new THREE.Shape();
  shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,steps:1});
  geometry.translate(0,0,-d/2+r);
  const mesh = new THREE.Mesh(geometry, material(colour));
  mesh.position.set(...p); group.add(mesh); return mesh;
}
function tube(group, colour, points, radius, segments = 32) {
  const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, segments, radius, 6, false), material(colour));
  group.add(mesh); return mesh;
}
export function phone() {
  const g = new THREE.Group(), green = '#28a348', darkGreen = '#167432', steel = '#a6aba7';
  box(g, '#626b67', [0,.025,0], [.44,.05,.34]);
  box(g, steel, [0,.56,-.025], [.14,1.08,.14]);
  box(g, steel, [0,1.09,0], [.46,.045,.34]);
  box(g, green, [0,1.36,0], [.43,.5,.28], .026);
  box(g, darkGreen, [0,1.115,.01], [.45,.045,.31]);
  // Receiver vertically on the left; raised ear and mouth cups face the user.
  box(g, darkGreen, [-.155,1.38,.164], [.076,.255,.065], .018);
  for (const y of [1.25,1.51]) {
    box(g, green, [-.155,y,.18], [.105,.095,.095], .025);
    box(g, darkGreen, [-.155,y,.231], [.065,.053,.009]);
    for (let i=0;i<3;i++) box(g, '#143a22', [-.175+i*.02,y,.237], [.006,.026,.003], .001);
  }
  box(g, '#c2c5b5', [.06,1.495,.145], [.215,.135,.014]);
  box(g, '#23372b', [.06,1.515,.155], [.17,.045,.009]);
  // Coin entry, card slot, keypad, return pocket and red emergency button.
  box(g, '#d3d6c9', [.146,1.587,.15], [.054,.025,.015]);
  box(g, '#27312d', [.146,1.59,.16], [.035,.005,.004], .001);
  box(g, '#27312d', [.06,1.455,.159], [.16,.009,.005], .001);
  box(g, '#464e48', [.05,1.34,.15], [.17,.153,.013]);
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const x=.001+col*.049,y=1.39-row*.033;
    box(g, '#e0ded1', [x,y,.163], [.039,.025,.014], .003);
    // Small dark marks keep the buttons legible without a font asset.
    box(g, '#343b35', [x,y,.171], [.008,.009,.002], .001);
  }
  box(g, '#a82d23', [.173,1.367,.154], [.028,.034,.016]);
  box(g, steel, [.06,1.205,.148], [.15,.06,.02]);
  box(g, '#27312d', [.06,1.21,.162], [.115,.025,.006]);
  const cord=[];
  for(let i=0;i<=200;i++){
    const t=i/200,a=t*Math.PI*2*24;
    cord.push([-.155+.016*Math.cos(a),1.2-.45*t,.12+.016*Math.sin(a)]);
  }
  tube(g,'#303b32',cord,.004,600);
  tube(g,'#303b32',[[-.155,.75,.12],[-.14,.7,.1],[-.08,.75,.04],[-.08,1.12,.04]],.007);
  return g;
}
export function geta() {
  const g = new THREE.Group();
  box(g, '#b48b53', [0,.073,0], [.115,.026,.267], .012);
  for(const z of [-.072,.075]) box(g, '#88613a', [0,.03,z], [.105,.06,.024], .003);
  // Long, fine grain lines follow the wooden platform.
  for(let i=0;i<11;i++) box(g, i%3?'#ae824d':'#c39a64', [-.047+i*.009,.0865,0], [.0015,.001,.235], .0003);
  for(const side of [-1,1])tube(g,'#34344b',[[0,.105,-.075],[side*.022,.137,-.018],[side*.049,.092,.055]],.01,24);
  tube(g,'#782b35',[[0,.087,-.075],[0,.11,-.075]],.006,8);
  g.rotation.y=-.3; return g;
}
export function tsinelas() {
  return createHouseholdToolKit().pair({colour:0x527f9d,accent:0xdfd5b4,scattered:true});
}
export function render(model, size=768) {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(size,size); renderer.setClearColor(0,0); renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(); scene.add(model);
  scene.add(new THREE.HemisphereLight(0xffffff,0x77746b,2));
  const light=new THREE.DirectionalLight(0xfff3de,2.6); light.position.set(-2,4,3); scene.add(light);
  const bounds=new THREE.Box3().setFromObject(model), centre=bounds.getCenter(new THREE.Vector3());
  const extent=bounds.getSize(new THREE.Vector3()).length()*.56;
  const camera=new THREE.OrthographicCamera(-extent,extent,extent,-extent,.01,30);
  camera.position.copy(centre).add(new THREE.Vector3(.55,.75,1).normalize().multiplyScalar(4)); camera.lookAt(centre);
  renderer.render(scene,camera);
  const result=renderer.domElement.toDataURL('image/png'); renderer.dispose(); return result;
}
export function exportPhone(model, flex = false) {
  model.updateMatrixWorld(true);
  const colours=[], vertices=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const colour='#'+mesh.material.color.getHexString(); let role=colours.indexOf(colour);
    if(role<0){role=colours.length;colours.push(colour);}
    const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    const p=geometry.attributes.position,n=geometry.attributes.normal;
    for(let i=0;i<p.count;i++){
      vertices.push(p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i),role,0);
      const delta=mesh.userData.flexAxis==='x'?p.getX(i)-mesh.userData.anchorX:mesh.userData.anchorY-p.getY(i);
      if(flex)vertices.push(mesh.userData.flex ? 3+Math.max(0,Math.min(1,delta/(mesh.userData.flexLength||1))) : 0);
    }
    geometry.dispose();
  });
  // Atlas texels are well separated, sampled at their centres, with no UV seams.
  const canvas=Object.assign(document.createElement('canvas'),{width:colours.length*32,height:32}),ctx=canvas.getContext('2d');
  colours.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i*32,0,32,32);});
  const stride=flex?9:8;
  for(let i=0;i<vertices.length;i+=stride){vertices[i+6]=(vertices[i+6]+.5)/colours.length;vertices[i+7]=.5;}
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  return {vertices,texture:canvas.toDataURL('image/webp',1),meta:{source:'scripts/prop-models.js',vertices:vertices.length/stride,stride,uv:true,roles:null,size:size.toArray(),layout:'float32 x, y, z, nx, ny, nz, u, v'+(flex?', flexRole':'')+' per vertex; triangles, no index'}};
}

function panel(group,colour,points,flex=false,anchorY=0,flexLength=1){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
  const index=[];for(let i=1;i<points.length-1;i++)index.push(0,i,i+1);
  geometry.setIndex(index);geometry.computeVertexNormals();
  const mat=material(colour);mat.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(geometry,mat);mesh.userData={flex,anchorY,flexLength};group.add(mesh);return mesh;
}
function mast(group,x,height){
  box(group,'#8a8651',[x,height/2,0],[.045,height,.045],.003);
  for(let y=.5;y<height;y+=.52)box(group,'#545637',[x,y,0],[.051,.025,.051],.003);
}
export function banderitas(){
  const g=new THREE.Group();
  const flags=createDecorKit().create('bunting',{length:6,drop:.42,sag:.45,flags:16,palette:[0xc4493b,0xe6bd4f,0x467aaf,0xd4d4ad],seed:1016});
  flags.position.y=3.8;flags.traverse(m=>{if(m.isMesh&&m.geometry.attributes.position.count===3){m.geometry.computeBoundingBox();m.userData={flex:true,anchorY:3.8+m.geometry.boundingBox.max.y,flexLength:.42};}});
  g.add(flags);mast(g,-3,4.05);mast(g,3,4.05);return g;
}
export function parol(){
  const g=new THREE.Group();mast(g,0,3.6);
  tube(g,'#78754b',[[0,3.5,0],[.3,3.55,0],[.65,3.35,0]],.016,8);
  const x=.65,y=2.8,points=[];
  for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.23:.53;points.push([x+Math.cos(a)*r,y+Math.sin(a)*r,.04]);}
  for(let i=0;i<10;i++){
    panel(g,i%2?'#e0b94c':'#bf4e3d',[[x,y,.12],points[i],points[(i+1)%10]]);
    tube(g,'#e5c976',[points[i],points[(i+1)%10]],.009,2);
  }
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const tx=x+side*.32+(i-1.5)*.035,top=y-.3,len=.6+(i%2)*.18;
    panel(g,i%2?'#d9b751':'#b94d45',[[tx,top,.04],[tx+.025,top,.04],[tx+.06,top-len,.08],[tx+.025,top-len,.08]],true,top,len);
  }
  return g;
}
export function chochin(){
  const g=new THREE.Group();mast(g,0,3.65);
  tube(g,'#777850',[[0,3.5,0],[.65,3.5,0],[.65,3.25,0]],.016,5);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.29,18,14),material('#d87455'));body.scale.y=1.35;body.position.set(.65,2.8,0);g.add(body);
  for(let i=-5;i<=5;i++){
    const y=i*.06,r=.294*Math.sqrt(1-(y/.4)**2);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.006,4,24),material('#8c4437'));ring.rotation.x=Math.PI/2;ring.position.set(.65,2.8+y,0);g.add(ring);
  }
  for(const y of [2.42,3.18])box(g,'#423b30',[.65,y,0],[.21,.045,.21]);
  return g;
}
export function koinobori(){
  const g=new THREE.Group();mast(g,0,4.2);
  for(const [i,colour]of ['#435c70','#bb5148','#4b89a2'].entries()){
    const y=3.8-i*.6,length=1.6-i*.22;
    tube(g,'#b2a886',[[0,y,0],[.28,y,0]],.007,3);
    const first=g.children.length;
    // Inflated mouth, tapered fabric body, and split tail, all actual geometry.
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.075,length,16,10,true),material(colour));
    body.rotation.z=Math.PI/2;body.position.set(.28+length/2,y-.13,0);body.userData={flex:true,anchorY:y+.17,flexLength:.6};g.add(body);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.17,.014,5,20),material('#e2d4b3'));ring.rotation.y=Math.PI/2;ring.position.set(.28,y-.13,0);g.add(ring);
    for(const z of [-.15,.15]){
      const eye=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),material('#dfd8bc'));eye.position.set(.43,y-.09,z);g.add(eye);
      const pupil=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),material('#252d31'));pupil.position.set(.43,y-.09,z*1.18);g.add(pupil);
    }
    const end=.28+length;
    panel(g,colour,[[end-.04,y-.055,0],[end+.3,y+.03,0],[end+.2,y-.13,0],[end+.3,y-.29,0],[end-.04,y-.205,0]],true,y+.1,.45);
    // Pale scale chevrons on both sides, without an image texture.
    for(let j=0;j<5;j++)for(const z of [-1,1]){
      const x=.65+j*(length-.5)/5;
      const radius=.17-(x-.28)/length*.095;
      tube(g,'#cfbd95',[[x,y-.08,z*radius*.9],[x+.06,y-.13,z*(radius+.003)],[x,y-.18,z*radius*.9]],.005,4);
    }
    for(const mesh of g.children.slice(first))mesh.userData={flex:true,flexAxis:'x',anchorX:.28,flexLength:length};
  }
  return g;
}
