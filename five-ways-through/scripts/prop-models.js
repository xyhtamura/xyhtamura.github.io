// Authoring only. Three.js and the FGC kit are read from the local workspace;
// exported assets have no runtime dependency on either project.
import * as THREE from '/foam-green-city/vendor/three/build/three.module.js';
import {createHouseholdToolKit} from '/foam-green-city/household-tools.js';

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
export function exportPhone(model) {
  model.updateMatrixWorld(true);
  const colours=[], vertices=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const colour='#'+mesh.material.color.getHexString(); let role=colours.indexOf(colour);
    if(role<0){role=colours.length;colours.push(colour);}
    const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    const p=geometry.attributes.position,n=geometry.attributes.normal;
    for(let i=0;i<p.count;i++)vertices.push(p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i),role,0);
    geometry.dispose();
  });
  // Atlas texels are well separated, sampled at their centres, with no UV seams.
  const canvas=Object.assign(document.createElement('canvas'),{width:colours.length*32,height:32}),ctx=canvas.getContext('2d');
  colours.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i*32,0,32,32);});
  for(let i=0;i<vertices.length;i+=8){vertices[i+6]=(vertices[i+6]+.5)/colours.length;vertices[i+7]=.5;}
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  return {vertices,texture:canvas.toDataURL('image/webp',1),meta:{source:'scripts/prop-models.js',vertices:vertices.length/8,stride:8,uv:true,roles:null,size:size.toArray(),layout:'float32 x, y, z, nx, ny, nz, u, v per vertex; triangles, no index'}};
}
