/* VENDORED into xyhtamura.github.io/harvests-happen from renderedwork/goblincore/goblincore.js
   sha256:5e7619e4ae7df237. Refresh with renderedwork/goblincore/scripts/publish_site.py;
   do not edit this copy. */
// Goblincore scene: the background drawing, a rigged plant growing from the
// rock, and the goblin cut into layered parts on a hand-placed skeleton.
// The build scripts in scripts/ make everything in data/; this page poses the
// bones and draws. Bone posing follows 2d/botanicals/rigged/viewer.js.
import {exportLoop, supported as canExport, checkFramecast} from './export.js';
const $ = id => document.getElementById(id);
const canvas = $('view');
const gl = canvas.getContext('webgl2', {premultipliedAlpha: true, antialias: true});

const VERT = `#version 300 es
in vec2 pos; in vec2 uv;
uniform vec4 fit; uniform float pointSize;
out vec2 vUv; out vec2 vWorld;
void main(){ vUv = uv; vWorld = pos; gl_Position = vec4(pos * fit.xy + fit.zw, 0., 1.); gl_PointSize = pointSize; }`;
// Redraw: the scene is cut into irregular patches (a Voronoi diagram re-seeded on
// every redraw), and each patch reads the drawing from a few pixels away along the
// local crayon stroke, so colour samples swap between neighbours and the strokes
// seem to be drawn again. Hue turns a texture's colour around the grey axis.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vWorld;
uniform sampler2D tex; uniform sampler2D flow; uniform int mode; uniform vec4 colour;
uniform float boil; uniform float cell; uniform float seed; uniform vec2 uvPerPx; uniform vec2 sceneSize;
uniform float hue; uniform float mute; uniform vec3 muteTint; uniform float lift;
out vec4 o;
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))) + seed * vec2(17.13, 31.71);
  return fract(sin(p) * 43758.5453);
}
void main(){
  if (mode != 0) { o = colour; return; }
  vec2 uv = vUv;
  if (boil > 0.) {
    vec2 g = vWorld / cell, i = floor(g), f = fract(g), id = i;
    float best = 1e9;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 n = vec2(x, y), d = n + hash2(i + n) - f;
      float dd = dot(d, d);
      if (dd < best) { best = dd; id = i + n; }
    }
    vec2 r = hash2(id + 7.31) * 2. - 1.;
    vec4 fl = texture(flow, vWorld / sceneSize);
    float th = atan(fl.g * 2. - 1., fl.r * 2. - 1.) * .5;
    vec2 along = vec2(cos(th), sin(th)), across = vec2(-along.y, along.x);
    uv += (along * r.x + across * r.y * mix(1., .25, fl.b)) * boil * uvPerPx;
  }
  // Gradients from the unshifted coordinates, so patch edges do not pick a blurred mip level.
  vec4 c = textureGrad(tex, uv, dFdx(vUv), dFdy(vUv));
  if (hue != 0. && c.a > 0.) {
    vec3 rgb = c.rgb / c.a, k = vec3(.57735);
    float cs = cos(hue), sn = sin(hue);
    rgb = rgb * cs + cross(k, rgb) * sn + k * dot(k, rgb) * (1. - cs);
    c.rgb = clamp(rgb, 0., 1.) * c.a;
  }
  // Muting pulls colour toward a grey of the same lightness, tinted like the room.
  if (mute > 0. && c.a > 0.) {
    vec3 rgb = c.rgb / c.a, luma = vec3(.2126, .7152, .0722);
    vec3 grey = muteTint * (dot(rgb, luma) / dot(muteTint, luma));
    c.rgb = clamp(mix(rgb, grey, mute), 0., 1.) * c.a;
  }
  // Lift raises the black point toward the room's tint: dark bodies and
  // cut-paper shadows come up, so creatures sit at lower contrast.
  if (lift > 0. && c.a > 0.) {
    vec3 rgb = c.rgb / c.a;
    c.rgb = (muteTint * lift + rgb * (1. - lift)) * c.a;
  }
  o = c * colour;
}`;

function shader(type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const program = gl.createProgram();
gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
gl.bindAttribLocation(program, 0, 'pos'); gl.bindAttribLocation(program, 1, 'uv');
gl.linkProgram(program); gl.useProgram(program);
const U = Object.fromEntries(['fit', 'pointSize', 'tex', 'flow', 'mode', 'colour', 'boil', 'cell', 'seed', 'uvPerPx', 'sceneSize', 'hue', 'mute', 'muteTint', 'lift']
  .map(n => [n, gl.getUniformLocation(program, n)]));
gl.uniform1i(U.tex, 0); gl.uniform1i(U.flow, 1);
gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

async function json(url) { const r = await fetch(url); if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); }

// createImageBitmap decodes without waiting for a paint; premultiplied in
// script because upload flags are applied inconsistently to an ImageBitmap.
async function texture(url) {
  const r = await fetch(url); if (!r.ok) throw new Error(`${url}: ${r.status}`);
  const image = await createImageBitmap(await r.blob(), {premultiplyAlpha: 'none'});
  const w = image.width, h = image.height;
  const work = new OffscreenCanvas(w, h), wc = work.getContext('2d', {willReadFrequently: true});
  wc.drawImage(image, 0, 0); image.close();
  const px = wc.getImageData(0, 0, w, h).data;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255; px[i] *= a; px[i + 1] *= a; px[i + 2] *= a;
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(px.buffer));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return {tex, w, h};
}

// A joint hierarchy: rest positions, and posed positions and angles.
class Rig {
  constructor(nodes) {
    const n = this.n = nodes.length;
    for (const k of ['x', 'y', 'len', 'depth', 'radius', 'px', 'py', 'angle', 'cos', 'sin', 'turn', 'ux', 'uy']) this[k] = new Float32Array(n);
    // Stretch of each bone: `along` lengthens it, `across` widens the image around it.
    this.along = new Float32Array(n).fill(1); this.across = new Float32Array(n).fill(1);
    this.scaled = new Uint8Array(n);
    this.parent = new Int32Array(n); this.order = new Int32Array(n);
    nodes.forEach(([x, y, p, o, rad], i) => {
      this.x[i] = x; this.y[i] = y; this.parent[i] = p; this.order[i] = o; this.radius[i] = rad;
      if (p >= 0) { this.len[i] = Math.hypot(x - this.x[p], y - this.y[p]); this.depth[i] = this.depth[p] + this.len[i]; }
      const l = this.len[i] || 1;
      if (p >= 0) { this.ux[i] = (x - this.x[p]) / l; this.uy[i] = (y - this.y[p]) / l; }
    });
  }
  // Each joint's angle is its parent's plus its own turn.
  pose() {
    for (let i = 0; i < this.n; i++) {
      const p = this.parent[i];
      if (p < 0) { this.px[i] = this.x[i]; this.py[i] = this.y[i]; this.angle[i] = 0; this.cos[i] = 1; this.sin[i] = 0; continue; }
      const a = this.angle[p] + this.turn[i], c = Math.cos(a), s = Math.sin(a);
      const dx = (this.x[i] - this.x[p]) * this.along[i], dy = (this.y[i] - this.y[p]) * this.along[i];
      this.angle[i] = a; this.cos[i] = c; this.sin[i] = s;
      this.px[i] = this.px[p] + dx * c - dy * s; this.py[i] = this.py[p] + dx * s + dy * c;
    }
  }
}

// A rest offset from a bone's start, scaled along the bone and across it.
function stretch(r, b, dx, dy) {
  const ux = r.ux[b], uy = r.uy[b];
  const a = (dx * ux + dy * uy) * (r.along[b] - 1), q = (dy * ux - dx * uy) * (r.across[b] - 1);
  return [dx + a * ux - q * uy, dy + a * uy + q * ux];
}

// One textured grid mesh skinned to a rig. verts are [x, y, bone, bone2, weight255]
// in rig pixels; (x0, y0, w, h) is where the texture sits in rig pixels.
class Mesh {
  constructor(rig, verts, quads, tex, x0, y0, w, h) {
    this.rig = rig; this.verts = verts; this.tex = tex;
    const count = this.count = verts.length / 5;
    this.out = new Float32Array(count * 2);
    const uv = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) { uv[i * 2] = (verts[i * 5] - x0) / w; uv[i * 2 + 1] = (verts[i * 5 + 1] - y0) / h; }
    const index = new Uint32Array(quads.length / 4 * 6), wire = new Uint32Array(quads.length * 2);
    for (let i = 0, j = 0, k = 0; i < quads.length; i += 4) {
      const [a, b, c, d] = [quads[i], quads[i + 1], quads[i + 2], quads[i + 3]];
      index.set([a, b, c, a, c, d], j); j += 6;
      wire.set([a, b, b, c, c, d, d, a], k); k += 8;
    }
    this.indexCount = index.length; this.wireCount = wire.length;
    this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer); gl.bufferData(gl.ARRAY_BUFFER, this.out, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    this.wireBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wire, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }
  // Skin, then place in background pixels: (ox, oy) + scale * posed.
  skin(scale, ox, oy) {
    const r = this.rig, v = this.verts, out = this.out;
    for (let i = 0, j = 0; j < this.count; i += 5, j++) {
      const x = v[i], y = v[i + 1], w = v[i + 4] / 255;
      let b = v[i + 2], p = r.parent[b], dx = x - r.x[p], dy = y - r.y[p];
      if (r.scaled[b]) [dx, dy] = stretch(r, b, dx, dy);
      let X = r.px[p] + dx * r.cos[b] - dy * r.sin[b], Y = r.py[p] + dx * r.sin[b] + dy * r.cos[b];
      if (w < 1) {
        b = v[i + 3]; p = r.parent[b]; dx = x - r.x[p]; dy = y - r.y[p];
        if (r.scaled[b]) [dx, dy] = stretch(r, b, dx, dy);
        X = X * w + (r.px[p] + dx * r.cos[b] - dy * r.sin[b]) * (1 - w);
        Y = Y * w + (r.py[p] + dx * r.sin[b] + dy * r.cos[b]) * (1 - w);
      }
      out[j * 2] = ox + X * scale; out[j * 2 + 1] = oy + Y * scale;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer); gl.bufferSubData(gl.ARRAY_BUFFER, 0, out);
  }
  draw(colour = [1, 1, 1, 1], wire = false) {
    gl.bindVertexArray(this.vao);
    gl.bindTexture(gl.TEXTURE_2D, this.tex.tex);
    gl.uniform1i(U.mode, 0); gl.uniform4fv(U.colour, colour);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
    if (wire) {
      gl.uniform1i(U.mode, 1); gl.uniform4fv(U.colour, [0, .3, .28, .3]);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireBuffer);
      gl.drawElements(gl.LINES, this.wireCount, gl.UNSIGNED_INT, 0);
    }
    gl.bindVertexArray(null);
  }
}

// A plain textured rectangle in background pixels.
function quad(tex, x, y, w, h) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const pos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, x + w, y, x, y + h, x + w, y + h]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uv); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return boil => {
    gl.bindVertexArray(vao); gl.bindTexture(gl.TEXTURE_2D, tex.tex);
    gl.uniform1i(U.mode, 0); gl.uniform4fv(U.colour, [1, 1, 1, 1]);
    gl.uniform1f(U.boil, boil); gl.uniform2f(U.uvPerPx, 1 / w, 1 / h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindVertexArray(null);
    gl.uniform1f(U.boil, 0);
  };
}

const lineVao = gl.createVertexArray(), lineBuffer = gl.createBuffer();
gl.bindVertexArray(lineVao); gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.disableVertexAttribArray(1); gl.bindVertexArray(null);
function drawBones(rig, scale, ox, oy, colour) {
  const pts = [];
  for (let i = 0; i < rig.n; i++) {
    const p = rig.parent[i]; if (p < 0) continue;
    pts.push(ox + rig.px[p] * scale, oy + rig.py[p] * scale, ox + rig.px[i] * scale, oy + rig.py[i] * scale);
  }
  gl.bindVertexArray(lineVao); gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.DYNAMIC_DRAW);
  gl.uniform1i(U.mode, 1); gl.uniform4fv(U.colour, colour);
  gl.drawArrays(gl.LINES, 0, pts.length / 2);
  gl.uniform4fv(U.colour, [1, 1, 1, 1]); gl.uniform1f(U.pointSize, 4 * Math.min(2, devicePixelRatio || 1));
  gl.drawArrays(gl.POINTS, 0, pts.length / 2);
  gl.bindVertexArray(null);
}

// Insects: textured sprites from data/insects.webp (baked from Drawing the Hours),
// flying set paths given in scene.json. Each is a rotated quad; the atlas cell
// is picked by species and flap frame.
const spriteVao = gl.createVertexArray(), spritePos = gl.createBuffer(), spriteUv = gl.createBuffer();
gl.bindVertexArray(spriteVao);
gl.bindBuffer(gl.ARRAY_BUFFER, spritePos); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, spriteUv); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);

// Where an insect is at loop time t, or null outside its pass.
function insectAt(f, t) {
  const tau = (t - f.start) / f.duration;
  if (tau < 0 || tau > 1) return null;
  const at = k => {
    const [x0, y0] = f.from, [x1, y1] = f.to, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    const w = Math.sin(2 * Math.PI * f.waves * k + (f.phase || 0)) + .3 * Math.sin(2 * Math.PI * f.waves * 2.3 * k);
    return [x0 + dx * k - dy / len * f.wobble * w, y0 + dy * k + dx / len * f.wobble * w];
  };
  const [x, y] = at(tau), [x2, y2] = at(Math.min(1, tau + .002)), [x1, y1] = at(Math.max(0, tau - .002));
  return {x, y, heading: Math.atan2(y2 - y1, x2 - x1)};
}

function drawInsects(t, layer) {
  const ins = insects;
  gl.uniform1f(U.mute, +$('mute').value / 100);
  gl.uniform1f(U.lift, +$('lift').value / 100);
  gl.uniform3fv(U.muteTint, scene.muteTint || [.73, .77, .66]);
  for (const f of ins.paths) {
    if ((f.layer || 'front') !== layer) continue;
    const pos = [], uv = [];
    const at = insectAt(f, t); if (!at) continue;
    const row = ins.meta.species.indexOf(f.kind);
    const phase = ins.meta.flutterFreq[f.kind] * t * (f.flap ?? 1);
    const col = Math.floor((phase / (2 * Math.PI)) * ins.meta.frames) % ins.meta.frames;
    // The sprite faces up; turn it so up points along the heading.
    const a = at.heading + Math.PI / 2, c = Math.cos(a), s = Math.sin(a), h = ins.meta.unitsPerCell * f.scale / 2;
    const corner = (u, v) => [at.x + (u * c - v * s) * h, at.y + (u * s + v * c) * h];
    const [p00, p10, p01, p11] = [corner(-1, -1), corner(1, -1), corner(-1, 1), corner(1, 1)];
    const U0 = col / ins.meta.frames, U1 = (col + 1) / ins.meta.frames;
    const V0 = row / ins.meta.species.length, V1 = (row + 1) / ins.meta.species.length;
    pos.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    uv.push(U0, V0, U1, V0, U1, V1, U0, V0, U1, V1, U0, V1);
    gl.bindVertexArray(spriteVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, spritePos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteUv); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, ins.tex.tex);
    gl.uniform1i(U.mode, 0); gl.uniform4fv(U.colour, [1, 1, 1, 1]);
    gl.uniform1f(U.hue, (f.hue || 0) * Math.PI / 180);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  gl.bindVertexArray(null);
  gl.uniform1f(U.hue, 0); gl.uniform1f(U.mute, 0); gl.uniform1f(U.lift, 0);
}

const TINTS = [[1, .6, .6, 1], [.6, 1, .6, 1], [1, 1, 1, 1], [.6, .7, 1, 1], [1, .9, .45, 1], [1, .6, 1, 1]];
let scene, goblin, plant, insects, drawBackground, drawRock;
let time = 0, last = 0, frame = 0, playing = true, fixedSize = null, exporting = null;

async function load() {
  scene = await json('scene.json');
  const [gData, pData, motion, rockMeta, insectMeta] = await Promise.all(
    ['data/goblin.json', 'data/plant.json', 'motion.json', 'data/rock.json', 'data/insects.json'].map(json));
  const [bgTex, rockTex, flowTex, insectTex, plantTex, ...partTex] = await Promise.all(
    ['data/background.webp', 'data/rock.webp', 'data/flow.png', 'data/insects.webp', `data/${pData.texture}`,
      ...gData.parts.map(p => `data/${p.texture}`)].map(texture));
  for (const f of scene.insects || [])
    if (!insectMeta.species.includes(f.kind)) throw new Error(`scene.json names an insect not in the atlas: ${f.kind}`);
  insects = {meta: insectMeta, tex: insectTex, paths: scene.insects || []};
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, flowTex.tex); gl.activeTexture(gl.TEXTURE0);
  gl.uniform2f(U.sceneSize, scene.width, scene.height);

  drawBackground = quad(bgTex, 0, 0, scene.width, scene.height);
  drawRock = quad(rockTex, rockMeta.x, rockMeta.y, rockMeta.width, rockMeta.height);

  const gRig = new Rig(gData.nodes), byName = Object.fromEntries(gData.names.map((n, i) => [n, i]));
  // A motion entry turns every bone that starts at its joint.
  const drivers = motion.idle.joints.map(m => {
    if (!(m.joint in byName)) throw new Error(`motion.json names an unknown joint: ${m.joint}`);
    const j = byName[m.joint], kids = [];
    for (let i = 0; i < gRig.n; i++) if (gRig.parent[i] === j) kids.push(i);
    return {...m, kids};
  });
  const stretches = (motion.idle.stretch || []).map(m => {
    if (!(m.bone in byName) || gRig.parent[byName[m.bone]] < 0) throw new Error(`motion.json stretches an unknown bone: ${m.bone}`);
    gRig.scaled[byName[m.bone]] = 1;
    return {...m, b: byName[m.bone]};
  });
  // Fidgets: keyframed turns and stretches, resolved to joint indices.
  const index = name => {
    if (!(name in byName)) throw new Error(`motion.json names an unknown joint: ${name}`);
    return byName[name];
  };
  const fidgets = motion.fidgets.map(f => ({
    name: f.name, start: f.start, touch: f.touchPlant,
    turns: Object.entries(f.turns || {}).map(([j, keys]) => {
      const kids = []; for (let i = 0; i < gRig.n; i++) if (gRig.parent[i] === index(j)) kids.push(i);
      return {kids, keys};
    }),
    stretch: Object.entries(f.stretch || {}).map(([b, keys]) => { gRig.scaled[index(b)] = 1; return {b: index(b), keys}; }),
    wiggles: (f.wiggles || []).map(w => {
      const kids = []; for (let i = 0; i < gRig.n; i++) if (gRig.parent[i] === index(w.joint)) kids.push(i);
      return {...w, kids};
    }),
    end: Math.max(0, ...Object.values(f.turns || {}).flat().map(k => k[0]), ...Object.values(f.stretch || {}).flat().map(k => k[0]),
      ...(f.wiggles || []).map(w => w.to)),
  }));
  goblin = {
    rig: gRig, drivers, stretches, fidgets, place: scene.goblin, byName,
    meshes: gData.parts.map((p, k) => ({name: p.name,
      mesh: new Mesh(gRig, p.verts, p.quads, partTex[k], p.x, p.y, p.width, p.height)})),
  };

  const pRig = new Rig(pData.nodes);
  const stem = [...pRig.radius].filter((_, i) => pRig.order[i] === 0).sort((a, b) => a - b);
  pRig.refRadius = stem[stem.length >> 1] || 1;
  const root = pRig.parent.indexOf(-1);
  const scale = scene.plant.height / pData.height;
  plant = {
    rig: pRig, h: pData.height, w: pData.width, scale,
    ox: scene.plant.x - pRig.x[root] * scale, oy: scene.plant.y - pRig.y[root] * scale,
    mesh: new Mesh(pRig, pData.verts, pData.quads, plantTex, 0, 0, pData.width, pData.height),
  };
  let tip = 0;
  for (let i = 1; i < pRig.n; i++) if (pRig.depth[i] > pRig.depth[tip]) tip = i;
  plant.tip = tip;
  // How much plant hangs beyond each joint: short at leaflets and branch tips.
  plant.reach = new Float32Array(pRig.n);
  for (let i = pRig.n - 1; i > 0; i--) {
    const p = pRig.parent[i];
    if (p >= 0) plant.reach[p] = Math.max(plant.reach[p], plant.reach[i] + pRig.len[i]);
  }

  $('status').textContent = `Goblin: ${gData.parts.length} parts, ${gRig.n} joints. ` +
    `Plant: ${pRig.n} joints. Loop: ${scene.loopSeconds} s.`;
}

function poseGoblin(u) {
  const g = goblin, r = g.rig, amount = +$('motion').value / 100;
  r.turn.fill(0);
  for (const d of g.drivers) {
    if (!$('g-' + d.group).checked) continue;
    const a = amount * d.deg * Math.PI / 180 * Math.sin(2 * Math.PI * (d.cycles * u + d.phase));
    for (const k of d.kids) r.turn[k] += a;
  }
  r.along.fill(1); r.across.fill(1);
  for (const d of g.stretches) {
    if (!$('g-' + d.group).checked) continue;
    const wave = amount * Math.sin(2 * Math.PI * (d.cycles * u + d.phase));
    r.along[d.b] *= 1 + wave * d.along / 100;
    r.across[d.b] *= 1 + wave * d.across / 100;
  }
  g.touch = 0;
  if ($('fidgets').checked) {
    const t = u * scene.loopSeconds;
    for (const f of g.fidgets) {
      // Time since the fidget started, wrapping so one may run across the loop point.
      const dt = ((t - f.start) % scene.loopSeconds + scene.loopSeconds) % scene.loopSeconds;
      if (dt > f.end) continue;
      for (const c of f.turns) { const a = keyed(c.keys, dt)[0] * Math.PI / 180; for (const k of c.kids) r.turn[k] += a; }
      for (const c of f.stretch) {
        const [along, across] = keyed(c.keys, dt);
        r.along[c.b] *= 1 + along / 100; r.across[c.b] *= 1 + across / 100;
      }
      if (f.touch) {
        const [a, b] = f.touch;
        if (dt > a && dt < b) g.touch = Math.max(g.touch, Math.min(1, (dt - a) / .4, (b - dt) / .4));
      }
      for (const w of f.wiggles) {
        if (dt < w.from || dt > w.to) continue;
        const env = Math.min(1, (dt - w.from) / .3, (w.to - dt) / .3);
        const a = env * w.deg * Math.PI / 180 * Math.sin(2 * Math.PI * w.hz * (dt - w.from));
        for (const k of w.kids) r.turn[k] += a;
      }
    }
  }
  r.pose();
}

// Values at time t from [time, ...values] keys, eased between keys, held outside them.
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    const [t1, ...b] = keys[i];
    if (t > t1) continue;
    const [t0, ...a] = keys[i - 1], x = (t - t0) / Math.max(1e-6, t1 - t0), e = x * x * (3 - 2 * x);
    return a.map((v, k) => v + (b[k] - v) * e);
  }
  return keys[keys.length - 1].slice(1);
}

// Wind as in the rig preview, with whole-number cycles so the loop closes.
function posePlant(u) {
  const r = plant.rig, strength = .35 * +$('wind').value / 100, flutter = .4, flexPower = .6 * 1.4;
  const T = 2 * Math.PI * u, leaf = +$('flutter').value / 100 * strength / .35;
  // Where the goblin's fingertip is, while a fidget has it touching the plant.
  const g = goblin.rig, gp = goblin.place, f = goblin.byName.fingersA, touch = goblin.touch;
  const fx = gp.x + g.px[f] * gp.scale, fy = gp.y + g.py[f] * gp.scale, reachPx = 240 / plant.scale;
  for (let i = 0; i < r.n; i++) {
    const p = r.parent[i];
    if (p < 0) { r.turn[i] = 0; continue; }
    const flex = Math.min(3, Math.max(.35, Math.pow(r.refRadius / Math.max(.6, r.radius[i]), flexPower)));
    const share = r.len[i] / plant.h, phase = T - r.depth[i] / plant.h * 1.3 - r.x[i] / plant.w * .7;
    const gust = Math.sin(phase) + .35 * Math.sin(2 * phase + .8);
    const quiver = r.order[i] ? flutter * .5 * Math.sin(T * 9 + i * 1.7) : 0;
    r.turn[i] = share * flex * strength * .3 * (gust + quiver);
    // Leaflets and tips flutter on their own, each patch of them in its own phase.
    const tipward = Math.exp(-plant.reach[i] / 50), ph = r.x[i] * .023 + r.y[i] * .031;
    r.turn[i] += leaf * .09 * tipward * (Math.sin(T * 37 + ph) + .5 * Math.sin(T * 61 + 1.3 * ph));
    if (touch > 0) {
      const dx = (plant.ox + r.x[i] * plant.scale - fx) / plant.scale, dy = (plant.oy + r.y[i] * plant.scale - fy) / plant.scale;
      const near = Math.exp(-(dx * dx + dy * dy) / (reachPx * reachPx));
      r.turn[i] += touch * near * (.12 + .25 * tipward) * Math.sin(T * 96 + i * .7);
    }
  }
  r.pose();
}

// loop: a position in the loop, 0 to 1; by default it follows the clock.
function draw(loop) {
  for (const id of ['motion', 'wind', 'flutter', 'plantHue', 'redraw', 'mute', 'lift', 'speed']) $(id + 'Value').value = $(id).value;
  const ratio = Math.min(2, devicePixelRatio || 1);
  const [cw, ch] = fixedSize || [Math.max(1, Math.round(canvas.clientWidth * ratio)), Math.max(1, Math.round(canvas.clientHeight * ratio))];
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  gl.viewport(0, 0, cw, ch);
  gl.clearColor(.082, .09, .078, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  if (!scene || !goblin) return;
  // On screen the scene is letterboxed; an export frame is filled edge to edge,
  // since rounding its height to an even number can leave a sub-pixel border.
  const s = Math.min(cw / scene.width, ch / scene.height);
  const sx = fixedSize ? cw / scene.width : s, sy = fixedSize ? ch / scene.height : s;
  const ox = (cw - scene.width * sx) / 2, oy = (ch - scene.height * sy) / 2;
  gl.uniform4f(U.fit, 2 * sx / cw, -2 * sy / ch, 2 * ox / cw - 1, 1 - 2 * oy / ch);
  gl.uniform1f(U.pointSize, 1);
  const u = loop ?? (time / scene.loopSeconds) % 1;
  const wire = $('showMesh').checked, tinted = $('showParts').checked;

  // Redraws come at a fixed rate on the loop's own clock, a whole number per loop.
  const redraws = Math.round(scene.loopSeconds * +$('redrawRate').value);
  gl.uniform1f(U.seed, Math.floor(u * redraws) % redraws);
  gl.uniform1f(U.cell, +$('redrawCell').value);
  const boil = +$('redraw').value;
  drawBackground(boil);
  const t = u * scene.loopSeconds, flying = $('insects').checked;
  if (flying) drawInsects(t, 'back');
  poseGoblin(u);
  posePlant(u);
  plant.mesh.skin(plant.scale, plant.ox, plant.oy);
  gl.uniform1f(U.hue, +$('plantHue').value * Math.PI / 180);
  plant.mesh.draw(undefined, wire);
  gl.uniform1f(U.hue, 0);
  drawRock(0);   // the rock holds still while the wall around it is redrawn
  const gp = goblin.place;
  goblin.meshes.forEach(({mesh}, k) => {
    mesh.skin(gp.scale, gp.x, gp.y);
    mesh.draw(tinted ? TINTS[k % TINTS.length] : undefined, wire);
  });
  if (flying) drawInsects(t, 'front');
  if ($('showRig').checked) {
    drawBones(plant.rig, plant.scale, plant.ox, plant.oy, [.2, .85, .75, .9]);
    drawBones(goblin.rig, gp.scale, gp.x, gp.y, [1, .85, .1, 1]);
  }
  // Readouts for checks that cannot rely on a visible frame.
  const g = goblin.rig, f = goblin.byName.fingersA, pr = plant.rig;
  canvas.dataset.loop = u.toFixed(4);
  canvas.dataset.fingers = `${(gp.x + g.px[f] * gp.scale).toFixed(1)},${(gp.y + g.py[f] * gp.scale).toFixed(1)}`;
  canvas.dataset.plantTip = `${(plant.ox + pr.px[plant.tip] * plant.scale).toFixed(1)},${(plant.oy + pr.py[plant.tip] * plant.scale).toFixed(1)}`;
}

function animate(now) {
  frame = 0;
  if (document.hidden || !playing || exporting) return;
  time += last ? Math.min(.05, (now - last) / 1000) * +$('speed').value / 100 : 0; last = now;
  draw();
  frame = requestAnimationFrame(animate);
}
function restart() {
  cancelAnimationFrame(frame); frame = 0; last = 0;
  if (exporting) return;
  draw();
  if (!document.hidden && playing) frame = requestAnimationFrame(animate);
}
// Advance the clock by hand; used when the page is not being painted.
window.goblinStep = seconds => { time += seconds; draw(); return {...canvas.dataset}; };
// The goblin's extent over the whole loop, in background pixels, from every
// posed vertex of every part (mesh padding included, so it errs wide).
window.goblinBounds = (fps = 30) => {
  const n = Math.round(scene.loopSeconds * fps), b = {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity};
  const worst = {};
  for (let i = 0; i < n; i++) {
    poseGoblin(i / n);
    const gp = goblin.place;
    for (const {mesh} of goblin.meshes) {
      mesh.skin(gp.scale, gp.x, gp.y);
      const o = mesh.out;
      for (let j = 0; j < o.length; j += 2) {
        if (o[j] < b.left) { b.left = o[j]; worst.left = i / fps; }
        if (o[j] > b.right) { b.right = o[j]; worst.right = i / fps; }
        if (o[j + 1] < b.top) { b.top = o[j + 1]; worst.top = i / fps; }
        if (o[j + 1] > b.bottom) { b.bottom = o[j + 1]; worst.bottom = i / fps; }
      }
    }
  }
  draw();
  const r = v => Math.round(v);
  return {left: r(b.left), top: r(b.top), right: r(b.right), bottom: r(b.bottom), frame: [scene.width, scene.height], atSeconds: worst};
};
window.goblinAt = seconds => { time = seconds; draw(); return {...canvas.dataset}; };

$('play').addEventListener('click', () => { playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; restart(); });
for (const el of document.querySelectorAll('#controls input, #controls select')) el.addEventListener('input', () => { if (!exporting) draw(); });

// Export one loop as WebM, frame by frame at a fixed size. The sliders and
// checkboxes apply as set; Speed does not, since the loop is exported whole.
// With `url`, the file is sent there by HTTP PUT instead of downloaded (for
// checks with framecast/test/put-receiver.py).
window.goblinExport = async ({width = 1920, fps = 30, url = null} = {}) => {
  if (exporting) throw new Error('An export is already running.');
  const height = Math.round(width * scene.height / scene.width / 2) * 2;
  const frames = Math.round(scene.loopSeconds * fps);
  exporting = new AbortController();
  cancelAnimationFrame(frame); frame = 0;
  fixedSize = [width, height];
  draw(0);   // sizes the canvas before the encoder reads its dimensions
  $('export').textContent = 'Cancel export';
  const started = performance.now();
  try {
    const result = await exportLoop({
      canvas, fps, frames, signal: exporting.signal, draw: i => draw(i / frames),
      onProgress: ({frame: n, total}) => { $('status').textContent = `Exporting frame ${n} of ${total}…`; canvas.dataset.exported = n; },
    });
    const name = `goblincore-loop-${width}x${height}-${fps}fps.webm`;
    if (url) {
      const response = await fetch(url + name, {method: 'PUT', body: result.blob});
      if (!response.ok) throw new Error(`PUT ${url + name}: ${response.status}`);
    } else {
      const link = Object.assign(document.createElement('a'), {href: URL.createObjectURL(result.blob), download: name});
      link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 60000);
    }
    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    $('status').textContent = `Exported ${name}: ${result.frames} frames, ${result.seconds} s, ` +
      `${(result.blob.size / 1e6).toFixed(1)} MB, ${result.codec}. Took ${seconds} s.`;
    return {name, frames: result.frames, bytes: result.blob.size, codec: result.codec, width, height, took: +seconds};
  } catch (error) {
    $('status').textContent = error.name === 'AbortError' ? 'Export cancelled.' : `Export failed: ${error.message}`;
    throw error;
  } finally {
    exporting = null; fixedSize = null;
    $('export').textContent = 'Export loop';
    restart();
  }
};
$('export').addEventListener('click', () => {
  if (exporting) { exporting.abort(); return; }
  const [width, fps] = [+$('exportWidth').value, +$('exportFps').value];
  window.goblinExport({width, fps}).catch(() => {});
});
document.addEventListener('visibilitychange', restart);
addEventListener('resize', () => draw());

// Checks that the goblin stays inside the frame for the whole loop at the
// current settings, and says so in the status line when it does not.
function checkFrame() {
  const b = window.goblinBounds(15), out = [];
  if (b.top < 0) out.push(`top by ${-b.top} px at ${b.atSeconds.top.toFixed(1)} s`);
  if (b.left < 0) out.push(`left by ${-b.left} px`);
  if (b.right > scene.width) out.push(`right by ${b.right - scene.width} px`);
  if (b.bottom > scene.height) out.push(`bottom by ${b.bottom - scene.height} px`);
  canvas.dataset.frameCheck = out.length ? out.join('; ') : 'inside';
  if (out.length) $('status').textContent = `The goblin leaves the frame: ${out.join('; ')}.`;
}
try {
  await load();
  restart();
  checkFrame();
  for (const id of ['motion', 'fidgets', 'g-head', 'g-body', 'g-arms', 'g-legs']) $(id).addEventListener('change', checkFrame);
  if (!canExport()) { $('export').disabled = true; $('export').title = 'Needs WebCodecs: use Chrome or Edge.'; }
  checkFramecast();
} catch (error) {
  $('status').textContent = `Could not load the scene: ${error.message}`;
  throw error;
}
