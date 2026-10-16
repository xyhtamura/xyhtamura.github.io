// Five Ways Through: the shared scene, derived from flashbrush/scene.js by
// scripts/make_engine.py. Edit Flashbrush and rerun the script rather than this file.
import {BrushSynth, stepFrequency} from './brush-audio.js';
const DATA = new URL('../data/', import.meta.url).href;
const VARIANTS = 4;           // wind poses per species; instances pick one
const NEAR_LENGTH = 30;       // metres of lit brush ahead of the camera
const FAR_LENGTH = 50;        // depth band holding the tree-line silhouettes
const GRASS_LENGTH = 26;

const $ = id => document.getElementById(id);
const canvas = $('view');
const gl = canvas.getContext('webgl2', {antialias: false, alpha: false, depth: false, powerPreference: 'high-performance'});
const status = text => { const el = $('status'); if (el) el.textContent = text; };
if (!gl) { status('This browser does not support WebGL2.'); throw new Error('no webgl2'); }
const floatTargets = !!gl.getExtension('EXT_color_buffer_float');
const HDR = floatTargets ? 1 : 0.25;   // an 8-bit target stores light scaled down to fit
const maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];

// Every setting the scene reads. A piece changes these directly; looks set many at once.
export const S = {
  walking: true, speed: .22, drift: 30, sway: 1, height: .55, tilt: 7.4, fov: 56, lateral: 0, yaw: 0,
  focus: 2.2, aperture: .8, power: 6, flash: '#eef3ff', exposure: 1.3, bloom: .35, pollen: .7, lift: [0, .004, .02],
  density: 1, plantScale: 1, overhang: .14, wind: .35, fgc: true, path: true, ground: 1, palms: 0, poles: false,
  hue: 0, sat: .7, skyTop: '#06123f', skyHorizon: '#1d4fd6', ridge: .5, trees: .7, lights: .5, haze: .6,
  volcano: .8, volcanoAz: 22, volcanoGlow: .25, moon: true, moonColour: '#e8f0ff', moonSize: 1, moonDir: [-.06, .34, -1],
  clouds: .45, cloudColour: '#9fd8ff', cloudLight: .2, cloudHue: -20, cloudDrift: 1, grain: .06, scale: 1,
  ambient: 1, ambientColour: null, flashFar: null, farRange: [2, 7], hazeLift: .16,
  gels: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], gel: 0, shide: [], cloudSun: 0, peak: 1, stars: 0, bob: 1, backwards: false, pollenTint: .8, bulbPos: [0, -100, 0], bulbColour: [0, 0, 0],
  grab: true, notes: true, sparks: true, brushSound: true, bokehPalette: 'night', handCursor: true, handScale: .7,
  clearing: [0, 0, 0], plantGroups: ['herbarium', 'fgc'], poleLateral: 3.2, payphoneEvery: 6, payphoneOffset: 0, festival: false,
  festivalLight: 1, festivalEmission: 1, festivalVisible: true,
};
export const LOOKS = {
  nightBlue: {skyTop: '#06123f', skyHorizon: '#1d4fd6', flash: '#eef3ff', power: 6, exposure: 1.3, hue: 0, sat: .7, ridge: .5, trees: .7, lights: .5, haze: .6,
    volcano: .8, volcanoGlow: .15, moon: true, moonColour: '#e8f0ff', moonSize: 1, pollen: .3, bloom: .35, lift: [0, .004, .02],
    clouds: .45, cloudColour: '#9fd8ff', cloudLight: .2, cloudHue: -20, ambient: 1, bokehPalette: 'night'},
  dusk: {skyTop: '#2a2a48', skyHorizon: '#f29a6a', flash: '#4f9dff', power: 8, exposure: 1.3, hue: 0, sat: .45, ridge: .3, trees: .6, lights: .2, haze: .5,
    volcano: .6, volcanoGlow: .3, moon: false, pollen: .15, bloom: .3, lift: [0, .01, .03],
    clouds: .35, cloudColour: '#ffd2a0', cloudLight: .3, cloudHue: 15, moonColour: '#fff1d6', ambient: 3, bokehPalette: 'moon'},
  magenta: {skyTop: '#3a1630', skyHorizon: '#b65c7e', flash: '#ffe2ee', power: 4.5, exposure: 1.2, hue: -60, sat: 1.35, ridge: 1, trees: .5, lights: .15, haze: .8,
    volcano: .9, volcanoGlow: .4, moon: false, pollen: 0, bloom: .25, lift: [.05, .01, .05],
    clouds: .5, cloudColour: '#c8a0ff', cloudLight: .2, cloudHue: -35, moonColour: '#ffe0f0', ambient: 1.5, bokehPalette: 'spectrum'},
  amber: {skyTop: '#2b1a2e', skyHorizon: '#ff9b45', flash: '#ffc98a', power: 5, exposure: 1.15, hue: 0, sat: .85, ridge: .45, trees: .7, lights: .75, haze: .55,
    volcano: .6, volcanoGlow: .2, moon: true, moonColour: '#ffe2b8', moonSize: 2.2, pollen: .45, bloom: .4, lift: [.02, .01, 0],
    clouds: .35, cloudColour: '#ffcf9a', cloudLight: .25, cloudHue: 10, ambient: 2, bokehPalette: 'ember'},
  moonlight: {skyTop: '#0b1424', skyHorizon: '#4a5d7a', flash: '#dfe8ff', power: 5, exposure: 1.2, hue: 0, sat: .45, ridge: .3, trees: .6, lights: .2, haze: .9,
    volcano: .35, volcanoGlow: .05, moon: true, moonColour: '#f0f4ff', moonSize: 1.6, pollen: .4, bloom: .4, lift: [.01, .015, .03],
    clouds: .55, cloudColour: '#c8d8ff', cloudLight: .15, cloudHue: 0, ambient: 1.5, bokehPalette: 'moon'},
};
LOOKS.daylight = {skyTop: '#0b3a9e', skyHorizon: '#6fb7f2', flash: '#ffffff', power: 5, exposure: 1.05, hue: 0, sat: 1.25, ridge: .6, trees: .4, lights: 0,
  haze: .5, hazeLift: .9, volcano: 1, volcanoGlow: 0, peak: .18, moon: false, pollen: .2, bloom: .2, lift: [0, 0, .01],
  clouds: .62, cloudColour: '#ffffff', cloudLight: .6, cloudHue: 0, cloudSun: 1, ambient: 70, ambientColour: '#fff3e2', flashFar: null, gel: 0};
LOOKS.gels = {skyTop: '#010104', skyHorizon: '#0b0716', flash: '#7fe9ff', flashFar: '#e8309e', farRange: [1.8, 6], power: 9, exposure: 1.25, hue: 0, sat: 1.3,
  ridge: .15, trees: .5, lights: 0, haze: .3, hazeLift: .16, volcano: 0, volcanoGlow: 0, peak: 1, moon: false, pollen: .5, bloom: .45, lift: [.004, 0, .01],
  clouds: 0, cloudSun: 0, ambient: .2, ambientColour: null, gels: ['#3fffd0', '#ff5fc8', '#d8e070', '#8a6cff'], gel: .7};
export function applyLook(look) { Object.assign(S, typeof look === 'string' ? LOOKS[look] : look); }

// ---------- small matrix kit (column-major) ----------
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function viewMatrix(eye, fwd) {
  const r = norm(cross(fwd, [0, 1, 0])), u = cross(r, fwd);
  return {r, u, m: new Float32Array([r[0], u[0], -fwd[0], 0, r[1], u[1], -fwd[1], 0, r[2], u[2], -fwd[2], 0, -dot(r, eye), -dot(u, eye), dot(fwd, eye), 1])};
}
function multiply(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s;
  }
  return o;
}
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const linear = hex => [1, 3, 5].map(i => Math.pow(parseInt(hex.slice(i, i + 2), 16) / 255, 2.2));

// ---------- shaders ----------
const COMMON = `
uniform vec3 uCam, uFwd, uFlash, uSkyH;
uniform float uHue, uSat, uHdr, uCone, uHaze, uAmbient;
uniform vec3 uFestivalPos[4], uFestivalCol[4]; uniform int uFestivalCount;
uniform vec3 uBulbPos, uBulbCol, uMoonDir, uAmbCol, uFlashFar; uniform vec2 uFarRange; uniform float uHazeLift;
vec3 toLin(vec3 c){ return pow(max(c, 0.), vec3(2.2)); }
vec3 grade(vec3 c){
  const vec3 k = vec3(.57735); float ca = cos(uHue);
  c = c * ca + cross(k, c) * sin(uHue) + k * dot(k, c) * (1. - ca);
  return max(mix(vec3(dot(c, vec3(.299, .587, .114))), c, uSat), 0.);
}
// Light from a flash on the camera: inverse-square falloff inside a soft cone.
vec3 festivalLighting(vec3 world){
  vec3 light = vec3(0.);
  for (int i = 0; i < 4; i++) {
    if (i >= uFestivalCount) break;
    vec3 delta = world - uFestivalPos[i]; float d2 = dot(delta, delta);
    // Smooth finite reach, so selecting the next lantern never adds a hard edge.
    float fade = max(0., 1. - d2 / 64.);
    light += uFestivalCol[i] * fade * fade / (d2 + .5);
  }
  return light;
}
vec3 flashLit(vec3 albedo, vec3 world){
  vec3 v = world - uCam; float d2 = dot(v, v);
  float cone = pow(max(dot(v * inversesqrt(d2), uFwd), 0.), uCone);
  vec3 b = world - uBulbPos;
  vec3 flash = mix(uFlash, uFlashFar, smoothstep(uFarRange.x, uFarRange.y, sqrt(d2)));
  return albedo * (flash * cone / (d2 + .1) + uAmbCol * .012 * uAmbient + uBulbCol / (dot(b, b) + .25) + festivalLighting(world));   // .1 keeps the nearest plants from going pure white
}
// Aerial perspective: with distance, a surface fades toward the darkened horizon
// colour. The sky's horizon layers use the same colour, so the ground runs into them.
vec3 hazeColour(){ return uSkyH * uHazeLift * uHaze; }
vec3 hazed(vec3 c, vec3 world){ return mix(c, hazeColour(), 1. - exp(-distance(world, uCam) * .012)); }`;

// The brush is laid out along the line of travel: u is distance ahead along uDir,
// v is distance to its right. The camera faces -z, so a travel direction turned
// to the left makes it strafe.
const TRAVEL = `
uniform vec2 uDir; uniform float uTravel;
vec3 travelPoint(float u, float v){ vec2 p = (uTravel + u) * uDir + v * vec2(-uDir.y, uDir.x); return vec3(p.x, 0., p.y); }
float wrapAhead(float u0, float len, float back){ return mod(u0 - uTravel + back, len) - back; }
uniform float uSide, uBackwards, uBack;
float lane(float x, float seed){ return uSide > .5 ? x : uSide < -.5 ? .7 - x : (fract(seed * 3.7) < .5 ? x : .7 - x); }`;
// Brushing. Each point is xyz plus a radius in uPush. With a positive radius it
// is a grab: vertices near it move by the displacement in uPushDir.xyz (the
// hand has dragged that spot of the brush along), more at a plant's top than
// at its root. With a negative radius it pushes vertices away from it by
// uPushDir.w; the walker's body uses that so plants part around the lens.
const PUSH_POINTS = 17;   // the first is the walker's body
const PUSH = `
uniform vec4 uPush[${PUSH_POINTS}], uPushDir[${PUSH_POINTS}];
vec3 pushOffset(vec3 w, float lift){
  vec3 o = vec3(0.);
  for (int i = 0; i < ${PUSH_POINTS}; i++) {
    float a = uPushDir[i].w;
    if (a == 0.) continue;
    vec3 d = w - uPush[i].xyz; d.y *= .4;
    float r = abs(uPush[i].w), f = exp(-dot(d, d) / (r * r));
    if (uPush[i].w > 0.) { o += uPushDir[i].xyz * f * lift; continue; }
    vec2 flat_ = d.xz; float l = length(flat_);
    o += (l > 1e-4 ? vec3(flat_.x / l, 0., flat_.y / l) : vec3(0.)) * a * f * lift;
  }
  return o;
}`;
const BONE_ROW = 2048;          // texels per row of the shared bone texture
const CARD_VS = `#version 300 es
precision highp float;
#define BONE_ROW ${BONE_ROW}
layout(location=0) in vec4 aD;   // rest offsets from the parent joints of bone 0 and bone 1
layout(location=1) in vec3 aB;   // bone 0, bone 1, weight of bone 0
layout(location=2) in vec2 aUV;
layout(location=3) in vec4 iA;   // v, u, base height, yaw
layout(location=4) in vec4 iB;   // metres per pixel, mirror, flip, wind variant
layout(location=5) in vec4 iC;   // lit, band length, band offset, lying flat
uniform sampler2D uBones; uniform int uBase, uCount; uniform vec2 uSize; uniform mat4 uVP; uniform vec3 uCam, uClear;
${TRAVEL}
${PUSH}
out vec2 vUV; out vec3 vW; out float vFade, vLit; flat out float vGel;
vec2 skin(float b, vec2 d){
  int k = uBase + int(iB.w) * uCount + int(b);
  vec4 t = texelFetch(uBones, ivec2(k % BONE_ROW, k / BONE_ROW), 0);
  return t.xy + vec2(d.x * t.z - d.y * t.w, d.x * t.w + d.y * t.z);
}
void main(){
  vec2 p = mix(skin(aB.y, aD.zw), skin(aB.x, aD.xy), aB.z);
  float x = (p.x - uSize.x * .5) * iB.x * iB.y, y = (uSize.y - p.y) * iB.x * iB.z;
  float c = cos(iA.w), s = sin(iA.w);
  float u = wrapAhead(iA.y, iC.y, iC.z), ahead = (u + iC.z) / iC.y;
  if (uBackwards > .5) ahead = 1. - ahead;   // the band's far edge is then behind the line of travel
  vFade = (1. - smoothstep(.82, 1., ahead)) * (iC.x > .5 ? 1. : smoothstep(0., .12, ahead));
  vLit = iC.x; vUV = aUV; vGel = fract(sin(dot(iA.xy, vec2(12.9898, 78.233))) * 43758.5453);
  // A lying card turns its height into the ground plane.
  vec3 offset = iC.w > .5 ? vec3(x * c - y * s, 0., x * s + y * c) : vec3(x * c, y, x * s);
  vW = travelPoint(u, iA.x) + vec3(0., iA.z, 0.) + offset;
  float lift = iC.w > .5 ? .25 : pow(clamp(abs(y) / (uSize.y * iB.x), 0., 1.), 1.3);
  if (uClear.z > 0. && iC.x > .5) vFade *= smoothstep(uClear.z * .7, uClear.z, distance(vW.xz, uClear.xy));
  vW += pushOffset(vW, lift);
  gl_Position = uVP * vec4(vW, 1.);
}`;
const CARD_FS = `#version 300 es
precision highp float;
${COMMON}
in vec2 vUV; in vec3 vW; in float vFade, vLit; flat in float vGel;
uniform sampler2D uTex; uniform float uFocus, uAperture, uGelAmt; uniform vec3 uGel[4];
out vec4 o;
void main(){
  float d = distance(vW, uCam);
  // Defocus as mip bias: a card off the focal plane samples a blurrier level.
  float coc = abs(1. / d - 1. / uFocus) * uAperture;
  vec4 t = texture(uTex, vUV, clamp(coc * 3.5, 0., 3.5));
  float a = t.a * vFade * smoothstep(.12, .38, d);   // nothing closer than the lens can focus fills the frame
  if (a < .03) discard;
  vec3 albedo = grade(toLin(t.rgb / max(t.a, 1e-3)));
  albedo *= mix(vec3(1.), uGel[int(vGel * 3.999)], uGelAmt);   // each plant under its own coloured gel
  o = vec4(hazed(vLit > .5 ? flashLit(albedo, vW) : vec3(0.), vW) * uHdr, a);
}`;

const GRASS_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aT;   // along the blade 0..1, side -1 or 1
layout(location=1) in vec4 iA;   // v, u, height, yaw
layout(location=2) in vec4 iB;   // lean, width, shade, phase
uniform mat4 uVP; uniform vec3 uCam, uClear; uniform float uTime, uWind, uLen, uLat, uPath;
${TRAVEL}
${PUSH}
out vec3 vW; out float vT, vShade;
void main(){
  float t = aT.x, c = cos(iA.w), s = sin(iA.w);
  float h = iA.z * mix(1. - .7 * uPath, 1., smoothstep(.15, .7, abs(lane(iA.x, iB.w) - uLat)));   // a walked path is trampled
  vec3 p = vec3(aT.y * iB.y * (1. - t * .9), h * t, iB.x * h * t * t);
  p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  float sway = uWind * (.3 * sin(uTime * 1.1 + iB.w + iA.x * .3 + iA.y * .25) + .07 * sin(uTime * 3.7 + iB.w * 3.));
  p.x += sway * h * t * t; p.y -= abs(sway) * .3 * h * t * t;
  vW = travelPoint(wrapAhead(iA.y, uLen, uBack), lane(iA.x, iB.w)) + p;
  if (uClear.z > 0.) vW.y *= mix(.3, 1., smoothstep(uClear.z * .5, uClear.z, distance(vW.xz, uClear.xy)));
  vW += pushOffset(vW, t * t);
  vT = t; vShade = iB.z;
  gl_Position = uVP * vec4(vW, 1.);
}`;
const GRASS_FS = `#version 300 es
precision highp float;
${COMMON}
in vec3 vW; in float vT, vShade;
out vec4 o;
void main(){
  vec3 albedo = grade(toLin(mix(vec3(.5, .45, .33), vec3(.33, .42, .29), vShade))) * mix(.25, .9, vT);
  o = vec4(hazed(flashLit(albedo, vW), vW) * uHdr, 1.);
}`;

const GROUND_VS = `#version 300 es
precision highp float;
uniform mat4 uVP; uniform vec3 uCam;
out vec3 vW;
void main(){
  vec2 q = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  vW = vec3(uCam.x + mix(-500., 500., q.x), 0., uCam.z + mix(-500., 500., q.y));   // far enough to be fully hazed at its edge
  gl_Position = uVP * vec4(vW, 1.);
}`;
const GROUND_FS = `#version 300 es
precision highp float;
${COMMON}
${TRAVEL}
in vec3 vW; out vec4 o;
uniform vec3 uSkyT, uMoonColour; uniform float uMoon, uGround, uPath;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), f.x), f.y); }
void main(){
  // Position across the line of travel; the path follows the camera's slow wander.
  float u = dot(vW.xz, uDir), v = dot(vW.xz, vec2(-uDir.y, uDir.x));
  float across = v - .45 * sin(u * .09) + (noise(vec2(u * .3, 1.)) - .5) * .25;
  float n = noise(vW.xz * 3.) * .6 + noise(vW.xz * 17.) * .4;
  vec3 col = mix(vec3(.16, .14, .11), vec3(.34, .3, .22), n);
  // A worn path of lighter packed earth with two ruts.
  float path = (1. - smoothstep(.55, .95, abs(across))) * uGround * uPath;
  float rut = exp(-pow((abs(across) - .32) / .07, 2.)) * path;
  col = mix(col, vec3(.56, .5, .4) * (.8 + .35 * noise(vW.xz * 9.)), path * .85);
  col *= 1. - rut * .35;
  // Leaf litter off the path.
  vec2 warp = vec2(noise(vW.xz * 5.), noise(vW.xz * 5. + 9.)) * 1.5;
  float fleck = smoothstep(.6, .75, noise(vW.xz * 38. + warp * 6.)) * smoothstep(.35, .6, noise(vW.xz * 4. + 2.)) * (1. - path * .7) * uGround;
  col = mix(col, mix(vec3(.4, .29, .15), vec3(.3, .32, .18), noise(vW.xz * 11.)), fleck * .45);
  // Pebbles: round domes on a jittered grid, denser on the path, shaded by their own normal.
  vec2 g = vW.xz * 7., cell = floor(g), f = fract(g);
  float pebble = 0., tone = 0., contact = 0.; vec3 normal = vec3(0., 1., 0.);
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
    vec2 id = cell + vec2(i, j);
    if (hash(id) > (.07 + .2 * path) * uGround) continue;
    vec2 c = vec2(i, j) + vec2(hash(id + 7.), hash(id + 13.)) * .8 + .1 - f;
    float r = .06 + .14 * hash(id + 3.), d = length(c) / r;
    contact = max(contact, smoothstep(1.6, 1., d));   // a darker ring where the stone meets the soil
    if (d < 1.) { pebble = 1.; tone = hash(id + 5.); normal = normalize(vec3(-c.x / r * 1.4, sqrt(1. - d * d), -c.y / r * 1.4)); }
  }
  col *= 1. - contact * (1. - pebble) * .45;
  col = mix(col, mix(vec3(.36, .34, .31), vec3(.5, .46, .4), tone), pebble);
  vec3 toCam = normalize(uCam - vW);
  vec3 lit = flashLit(grade(toLin(col)), vW) * mix(1., .2 + .9 * max(dot(normal, toCam), 0.), pebble);
  // Puddles in the ruts and dips of the path reflect the sky and the moon.
  float wet = smoothstep(.55, .63, noise(vec2(u * .35, across * 1.1) + 5.)) * max(rut * 1.6, path * .5) * (1. - pebble);
  if (wet > .01) {
    vec3 view = normalize(vW - uCam), ray = reflect(view, vec3(0., 1., 0.));
    ray.xz += (noise(vW.xz * 20.) - .5) * .04;   // a little ripple
    ray = normalize(ray);
    vec3 sky = mix(uSkyH, uSkyT, smoothstep(-.02, .55, ray.y));
    float m = dot(ray, normalize(uMoonDir));
    sky += uMoon * uMoonColour * (smoothstep(.9997, .9999, m) * 6. + pow(max(m, 0.), 300.) * .9);
    float fresnel = .3 + .7 * pow(1. - max(-view.y, 0.), 5.);
    lit = mix(lit, lit * .25 + sky * fresnel, clamp(wet, 0., 1.));
  }
  o = vec4(hazed(lit, vW) * uHdr, 1.);
}`;

const SCREEN_VS = `#version 300 es
out vec2 vN;
void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2) * 2. - 1.; vN = p; gl_Position = vec4(p, 1., 1.); }`;
const SKY_FS = `#version 300 es
precision highp float;
${COMMON}
in vec2 vN; uniform vec3 uRight, uUp, uSkyT, uMoonColour, uCloudColour; uniform vec2 uTan;
uniform float uRidge, uMoon, uMoonSize, uTrees, uLights, uPixel, uTime, uClouds, uCloudLight, uCloudHue, uCloudDrift;
uniform float uVolcano, uVolcanoAz, uVolcanoGlow, uCloudSun, uPeak, uStars;
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
// A height around the horizon that wraps seamlessly with azimuth.
float profile(float az, float scale, float seed){ return fbm(vec2(cos(az), sin(az)) * scale + seed); }
float hillTop(float az){ return .008 + .07 * pow(profile(az, 3.4, 11.), 1.4) * (.5 + .5 * uRidge); }
// Draws one silhouette layer: everything below top takes colour, with a one-pixel soft edge.
vec3 layer(vec3 c, float e, float top, vec3 colour){ return mix(c, colour, smoothstep(top + uPixel, top - uPixel, e)); }
void main(){
  vec3 dir = normalize(uFwd + vN.x * uTan.x * uRight + vN.y * uTan.y * uUp);
  float e = dir.y, az = atan(dir.x, -dir.z);
  vec3 c = mix(uSkyH, uSkyT, smoothstep(-.02, .55, e));
  if (uStars > 0.) {
    vec3 g = dir * 260.; vec3 cell = floor(g); float h = hash(cell.xy + cell.z * 37.1);
    if (h > 1. - .02 * uStars) {
      float d = length(fract(g) - .5), b = fract(h * 91.7);
      vec3 tint = b > .93 ? vec3(.5, 1., .95) : b > .86 ? vec3(1., .75, .9) : vec3(.85, .9, 1.);   // a few teal and pink
      c += tint * smoothstep(.3, 0., d) * (.4 + 2.2 * b * b) * smoothstep(.0, .2, e) * uStars;
    }
  }
  float m = dot(dir, normalize(uMoonDir));
  // The moon's disc radius is uMoonSize degrees; 1 - cos(r) is about r^2 / 2.
  float rr = radians(uMoonSize), disc = 1. - rr * rr * .5;
  c += uMoon * (smoothstep(disc - rr * rr * .08, disc + rr * rr * .08, m) * 9. + pow(max(m, 0.), 300. / max(uMoonSize, .2)) * .9) * uMoonColour;
  // Clouds: domain-warped noise on a plane above the camera, drifting slowly.
  // They tint and hue-shift the sky behind them, dim the moon, and catch its light.
  if (uClouds > 0.) {
    vec2 q = dir.xz / (max(dir.y, 0.) + .12) * 1.5 + vec2(uTime * uCloudDrift * .012, uTime * uCloudDrift * .005);
    vec2 warp = vec2(fbm(q * 1.3 + 4.), fbm(q * 1.3 + 9.));
    float density = fbm(q + warp * 1.6);
    float threshold = mix(.72, .3, uClouds);   // more cover lowers the density a cloud needs
    float cover = smoothstep(threshold, threshold + .14, density) * smoothstep(-.01, .14, e);
    const vec3 k = vec3(.57735);
    float ha = radians(uCloudHue), ca = cos(ha);
    vec3 shifted = c * ca + cross(k, c) * sin(ha) + k * dot(k, c) * (1. - ca);
    vec3 under = max(shifted, 0.) * (1. + uCloudLight) * mix(vec3(1.), uCloudColour * 1.6, .4);
    under += uMoon * uMoonColour * pow(max(m, 0.), 60.) * cover * .8;   // moonlit cloud
    // Sunlit clouds: white, brighter where the cloud is thick, grey underneath.
    float body = smoothstep(threshold, threshold + .4, density), base = smoothstep(.14, .02, e) * .5;
    under = mix(under, uCloudColour * mix(.5, 1.25, body) * (1. - base), uCloudSun);
    c = mix(c, under, cover);
  }
  vec3 haze = hazeColour();
  // Far to near: mountains, hills with lights, a low mist, the tree line.
  // Each nearer layer is darker, closer to the haze colour: aerial perspective.
  float strength = min(1., uRidge * 3.);
  float mountain = .015 + uRidge * (.04 + .4 * pow(profile(az, 1.7, 3.), 2.));
  c = layer(c, e, mountain, mix(c, mix(haze, uSkyH, .45), strength));
  if (uVolcano > 0.) {
    // A cone with concave flanks, a flattened summit, and a notched crater.
    float x = az - radians(uVolcanoAz); x = atan(sin(x), cos(x));
    float w = .36 * uVolcano, H = .26 * uVolcano, t = clamp(1. - abs(x) / w, 0., 1.);
    float top = H * pow(t, 1.7) * (1. + .05 * (noise(vec2(x * 60., 3.)) - .5));
    top = min(top, H * .9) - H * .045 * smoothstep(w * .07, 0., abs(x));
    c = layer(c, e, top, mix(haze, uSkyH, .2) * uPeak);
    float gx = x / (w * .1), gy = (e - H * .86) / (H * .06);
    c += uVolcanoGlow * vec3(1., .32, .07) * exp(-(gx * gx + gy * gy)) * .45;   // glow from the crater
    float rise = e - H * .87;
    if (rise > 0.) {
      // Plume: noise in a column that widens and leans as it rises.
      float px = (x - rise * .5) / (w * .08 + rise * .55);
      float smoke = fbm(vec2(px * 2.5, rise * 30. - uTime * .03)) * exp(-px * px * 1.5) * exp(-rise * 7.);
      vec3 lit = mix(mix(haze, uSkyH, .5), vec3(1., .4, .12), uVolcanoGlow * exp(-rise * 25.) * .3);
      c = mix(c, lit, clamp(smoke * 1.6 * uVolcano, 0., 1.));
    }
  }
  float ridge = .01 + uRidge * (.02 + .16 * pow(profile(az, 2.6, 23.), 1.6));
  c = layer(c, e, ridge, mix(c, mix(haze, uSkyH, .28), strength));
  float hill = hillTop(az);
  c = layer(c, e, hill, mix(haze, uSkyH, .14));
  if (uLights > 0.) {
    const float N = 900.;
    float cell = floor((az + 3.14159) / 6.28318 * N);
    for (int k = -1; k <= 1; k++) {
      float id = cell + float(k), h1 = hash(vec2(id, 1.)), h2 = hash(vec2(id, 2.)), h3 = hash(vec2(id, 3.));
      if (h1 > uLights * .3) continue;
      float laz = (id + .5 + (h2 - .5) * .8) / N * 6.28318 - 3.14159;
      float le = mix(.0015, hillTop(laz) - .002, h3);
      vec2 d = vec2((az - laz) * cos(e), e - le) / uPixel;   // distance to the light in pixels
      float r2 = dot(d, d), twinkle = .8 + .2 * sin(uTime * (2. + h2 * 5.) + h3 * 40.);
      vec3 lc = h2 > .72 ? vec3(.75, .85, 1.) : vec3(1., .52, .18);   // mostly sodium, some white
      c += lc * (exp(-r2 * .8) * 2.5 + exp(-sqrt(r2) * .45) * .05) * twinkle;
    }
  }
  float tree = -.004 + uTrees * (.006 + .014 * profile(az, 9., 5.) + .006 * profile(az, 60., 9.));
  c += uSkyH * .1 * uHaze * exp(-max(e - tree, 0.) * 120.) * step(tree, e);
  c = layer(c, e, tree, haze);
  o = vec4(c * uHdr, 1.);
}`;

const SOLID_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNormal; layout(location=2) in float aRole; layout(location=3) in vec2 aUV;
uniform mat4 uVP, uModel; uniform float uWind, uTime, uPhase, uSwayHeight, uFlutter, uFestival;
out vec3 vW, vN; out float vRole; out vec2 vUV;
void main(){
  vec3 p = aPos; vUV = aUV;
  if (uWind > 0.) {
    // A palm sways more the higher up it is; fronds (role 1) also flutter.
    float k = p.y / uSwayHeight; k *= k;
    p.x += uWind * .3 * k * sin(uTime * .7 + uPhase);
    p.z += uWind * .15 * k * sin(uTime * .53 + uPhase * 1.3);
    if (aRole > .5 && aRole < 1.5) p.y += uWind * .08 * k * sin(uTime * 3.1 + p.x * 1.7 + p.z * 1.3 + uPhase);
  }
  if (uFlutter > 0. && aRole > 2.5) {
    float h = uFestival > .5 ? max(0., aRole - 3.) : aUV.x, s = aUV.y + uPhase;
    p.z += uFlutter * h * (.5 * sin(uTime * 1.9 + s) + .25 * sin(uTime * 4.7 + s * 2.3));
    p.x += uFlutter * h * .25 * sin(uTime * 2.6 + s * 1.7);
  }
  vec4 w = uModel * vec4(p, 1.); vW = w.xyz; vN = mat3(uModel) * aNormal; vRole = aRole; gl_Position = uVP * w;
}`;
const SOLID_FS = `#version 300 es
precision highp float;
${COMMON}
in vec3 vW, vN; in float vRole; in vec2 vUV; uniform vec3 uAlbedo, uPalette[9]; uniform float uFlat, uTextured, uFestivalEmission; uniform sampler2D uSolidTex; out vec4 o;
void main(){
  vec3 l = normalize(uCam - vW), n = normalize(vN);
  n = dot(n, l) < 0. ? -n : n;   // meshes are drawn two-sided
  float facing = uFlat > .5 ? 1. : .25 + .75 * max(dot(n, l), 0.);
  vec3 albedo = uTextured > .5 ? texture(uSolidTex, vUV).rgb : vRole < -.5 ? uAlbedo : uPalette[int(vRole + .5)];
  vec3 emission = vRole < -.5 ? toLin(albedo) * vec3(5., 3.2, 1.8) * uFestivalEmission : vec3(0.);
  o = vec4(hazed(flashLit(grade(toLin(albedo)), vW) * facing + emission, vW) * uHdr, 1.);
}`;

const POLLEN_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 iP;   // v, height, u, seed
uniform mat4 uVP; uniform vec3 uCam, uFwd, uFlash, uBokeh[4]; uniform float uLen, uFocus, uAperture, uPx, uTime, uMaxPt, uCone, uHdr, uTint;
${TRAVEL}
out vec3 vC;
void main(){
  vec3 w = travelPoint(wrapAhead(iP.z, uLen, uBack), lane(iP.x, iP.w)) + vec3(.06 * sin(uTime * .7 + iP.w * 20.), iP.y + .05 * sin(uTime * .5 + iP.w * 13.), 0.);
  gl_Position = uVP * vec4(w, 1.);
  vec3 v = w - uCam; float d = length(v);
  float size = clamp(abs(1. / d - 1. / uFocus) * uAperture * uPx * .06 + 2., 2., min(uMaxPt, uPx * .1));
  gl_PointSize = size;
  float cone = pow(max(dot(v / d, uFwd), 0.), uCone);
  // Brightness spread over the disc, so a large disc is dimmer per pixel.
  vC = uFlash * cone / (d * d + .02) * (.3 + iP.w) * 6. / max(4., size) * uHdr * smoothstep(.15, .45, d);
  vC *= mix(vec3(1.), uBokeh[int(fract(iP.w * 9.13) * 3.999)], uTint);   // dust takes the piece's bokeh colours
}`;
const SPARK_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aP;   // position, size factor
layout(location=1) in vec4 aC;   // colour, opacity
uniform mat4 uVP; uniform vec3 uCam; uniform float uFocus, uAperture, uPx, uMaxPt, uHdr;
out vec3 vC;
void main(){
  gl_Position = uVP * vec4(aP.xyz, 1.);
  float d = distance(aP.xyz, uCam);
  float size = clamp((abs(1. / d - 1. / uFocus) * uAperture * uPx * .06 + 3.) * aP.w, 2., min(uMaxPt, uPx * .14));
  gl_PointSize = size;
  vC = aC.rgb * aC.a * 18. / max(6., size) * uHdr;   // a spark gives its own light, spread over the disc
}`;
const POLLEN_FS = `#version 300 es
precision highp float;
in vec3 vC; out vec4 o;
void main(){
  float r = length(gl_PointCoord - .5) * 2.;
  float disc = smoothstep(1., .82, r) * (.8 + .35 * smoothstep(.6, .95, r));
  o = vec4(vC * disc, 0.);
}`;

const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vN; uniform sampler2D uSrc; uniform vec2 uStep; out vec4 o;
void main(){
  vec2 uv = vN * .5 + .5; vec3 s = texture(uSrc, uv).rgb * .227;
  s += (texture(uSrc, uv + uStep * 1.38).rgb + texture(uSrc, uv - uStep * 1.38).rgb) * .316;
  s += (texture(uSrc, uv + uStep * 3.23).rgb + texture(uSrc, uv - uStep * 3.23).rgb) * .07;
  o = vec4(s, 1.);
}`;
const FINAL_FS = `#version 300 es
precision highp float;
in vec2 vN; uniform sampler2D uScene, uBloom; uniform float uExposure, uBloomAmt, uGrain, uTime, uHdr; uniform vec3 uLift; uniform vec2 uRes;
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vN * .5 + .5;
  vec3 x = (texture(uScene, uv).rgb + texture(uBloom, uv).rgb * uBloomAmt) / uHdr * uExposure;
  vec3 c = 1. - exp(-x);
  c = mix(c, vec3(1.), smoothstep(1.2, 4., max(max(x.r, x.g), x.b)) * .55);   // blown highlights lose their colour
  vec2 q = uv - .5; c *= 1. - dot(q, q) * .9;
  c = pow(c, vec3(1. / 2.2));
  c = uLift + c * (1. - uLift);
  c += (hash(uv * uRes + fract(uTime * 7.31) * 91.) - .5) * uGrain;
  o = vec4(c, 1.);
}`;

function compile(vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), u = {};
  for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
  return {p, u};
}
const P = {
  card: compile(CARD_VS, CARD_FS), grass: compile(GRASS_VS, GRASS_FS), ground: compile(GROUND_VS, GROUND_FS),
  sky: compile(SCREEN_VS, SKY_FS), pollen: compile(POLLEN_VS, POLLEN_FS), solid: compile(SOLID_VS, SOLID_FS), spark: compile(SPARK_VS, POLLEN_FS),
  blur: compile(SCREEN_VS, BLUR_FS), final: compile(SCREEN_VS, FINAL_FS),
};
const emptyVAO = gl.createVertexArray();

// ---------- render targets ----------
let targets = null;
function texture2D(w, h, format) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texStorage2D(gl.TEXTURE_2D, 1, format, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return {t, f, w, h};
}
function makeTargets(w, h) {
  if (targets) for (const k of ['scene', 'halfA', 'halfB']) { gl.deleteTexture(targets[k].t); gl.deleteFramebuffer(targets[k].f); }
  if (targets) { gl.deleteRenderbuffer(targets.colour); gl.deleteRenderbuffer(targets.depth); gl.deleteFramebuffer(targets.ms); }
  const format = floatTargets ? gl.RGBA16F : gl.RGBA8;
  const samples = Math.min(4, gl.getInternalformatParameter(gl.RENDERBUFFER, format, gl.SAMPLES)[0] || 0);
  const ms = gl.createFramebuffer(), colour = gl.createRenderbuffer(), depth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, colour); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, format, w, h);
  gl.bindRenderbuffer(gl.RENDERBUFFER, depth); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, w, h);
  gl.bindFramebuffer(gl.FRAMEBUFFER, ms);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colour);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
  const hw = Math.max(1, w >> 2), hh = Math.max(1, h >> 2);
  targets = {ms, colour, depth, samples, w, h, scene: texture2D(w, h, format), halfA: texture2D(hw, hh, format), halfB: texture2D(hw, hh, format)};
}

// ---------- plants ----------
const species = [];
async function loadSpecies(base, entry, group) {
  const data = await (await fetch(base + entry.name + '.json')).json();
  // createImageBitmap decodes without waiting for the page to paint, unlike Image.decode().
  const image = await createImageBitmap(await (await fetch(base + data.texture)).blob(), {premultiplyAlpha: 'none'});
  const n = data.nodes.length, s = {name: entry.name, group, src: base + data.texture, w: data.width, h: data.height, n};
  s.x = new Float32Array(n); s.y = new Float32Array(n); s.parent = new Int32Array(n); s.order = new Int32Array(n);
  s.radius = new Float32Array(n); s.len = new Float32Array(n); s.depth = new Float32Array(n);
  data.nodes.forEach(([x, y, p, o, r], i) => {
    s.x[i] = x; s.y[i] = y; s.parent[i] = p; s.order[i] = o; s.radius[i] = r;
    if (p >= 0) { s.len[i] = Math.hypot(x - s.x[p], y - s.y[p]); s.depth[i] = s.depth[p] + s.len[i]; }
  });
  const stem = [...s.radius].filter((_, i) => s.order[i] === 0).sort((a, b) => a - b);
  s.refRadius = stem[stem.length >> 1] || 1;
  s.flex = s.radius.map(r => Math.min(3, Math.max(.35, Math.pow(s.refRadius / Math.max(.6, r), .84))));
  s.px = new Float32Array(n); s.py = new Float32Array(n);

  // Two meshes share one rig: the fine grid for plants close to the camera, a
  // coarse one for the rest. Each draws from its own instance buffer.
  s.full = buildMesh(s, data.verts, data.quads);
  s.lod = data.lod ? buildMesh(s, data.lod.verts, data.lod.quads) : s.full;

  s.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, s.tex);
  // Premultiplied here rather than by an upload flag: browsers disagree on whether the
  // flag applies to an ImageBitmap, and straight alpha makes blurred mip levels glow at the rim.
  const pixels = premultiplied(image);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s.w, s.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  s.alpha = new Uint8Array(s.w * s.h); for (let i = 0; i < s.alpha.length; i++) s.alpha[i] = pixels[i * 4 + 3];
  image.close();
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Per-joint wind constants, so the per-frame loop only does the trigonometry it must.
  // sin(t - phase) is expanded as sin t cos phase - cos t sin phase, so these
  // cosines and sines are all the loop needs per joint.
  s.gain = new Float32Array(n); s.wave = new Float32Array(n * 6);
  s.cs = new Float32Array(n * 2);   // posed cosine and sine of each joint's angle
  for (let i = 0; i < n; i++) {
    const phase = s.depth[i] / s.h * 1.3 + s.x[i] / s.w * .7, quiver = s.order[i] ? .2 : 0;
    s.gain[i] = group === 'objects' ? 0 : s.len[i] / s.h * s.flex[i] * .3;   // objects do not sway
    s.wave.set([Math.cos(phase), Math.sin(phase), .35 * Math.cos(2.1 * phase), .35 * Math.sin(2.1 * phase),
      quiver * Math.cos(1.7 * i), quiver * Math.sin(1.7 * i)], i * 6);
  }
  species.push(s);
  status(`Loading plants… ${species.length}`);
}

function buildMesh(s, v, q) {
  const count = v.length / 5, mesh = new Float32Array(count * 9);
  for (let i = 0; i < count; i++) {
    const x = v[i * 5], y = v[i * 5 + 1], b0 = v[i * 5 + 2], b1 = v[i * 5 + 3];
    const p0 = Math.max(0, s.parent[b0]), p1 = Math.max(0, s.parent[b1]);
    mesh.set([x - s.x[p0], y - s.y[p0], x - s.x[p1], y - s.y[p1], b0, b1, v[i * 5 + 4] / 255, x / s.w, y / s.h], i * 9);
  }
  const index = new Uint32Array(q.length / 4 * 6);
  for (let i = 0, j = 0; i < q.length; i += 4, j += 6) index.set([q[i], q[i + 1], q[i + 2], q[i], q[i + 2], q[i + 3]], j);
  const m = {vao: gl.createVertexArray(), indexCount: index.length, vertexCount: count, instances: gl.createBuffer(), count: 0};
  gl.bindVertexArray(m.vao);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 36, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 36, 16);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 36, 28);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, m.instances);
  for (let k = 0; k < 3; k++) {
    gl.enableVertexAttribArray(3 + k); gl.vertexAttribPointer(3 + k, 4, gl.FLOAT, false, 48, k * 16); gl.vertexAttribDivisor(3 + k, 1);
  }
  gl.bindVertexArray(null);
  return m;
}

function premultiplied(bitmap) {
  const c = new OffscreenCanvas(bitmap.width, bitmap.height), cx = c.getContext('2d', {willReadFrequently: true});
  cx.drawImage(bitmap, 0, 0);
  const px = cx.getImageData(0, 0, bitmap.width, bitmap.height).data;
  for (let i = 0; i < px.length; i += 4) { const a = px[i + 3] / 255; px[i] *= a; px[i + 1] *= a; px[i + 2] *= a; }
  return px;
}

// Same wind model as the rig preview: thin bones turn further, gusts travel up the plant.
// Every species writes into one packed texture, uploaded once per frame.
const bones = {tex: gl.createTexture(), data: null, rows: 0};
function packBones() {
  let base = 0;
  for (const s of species) { s.base = base; base += s.n * VARIANTS; }
  bones.rows = Math.ceil(base / BONE_ROW);
  bones.data = new Float32Array(bones.rows * BONE_ROW * 4);
  gl.bindTexture(gl.TEXTURE_2D, bones.tex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, BONE_ROW, bones.rows);
  for (const f of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, f, gl.NEAREST);
}
function poseSpecies(s, time, strength) {
  const out = bones.data, n = s.n, w = s.wave, cs = s.cs, px = s.px, py = s.py, x = s.x, y = s.y, parent = s.parent;
  for (let v = 0; v < VARIANTS; v++) {
    const t = time + v * 2.9, row = (s.base + v * n) * 4;
    const A = Math.sin(t * .9), B = Math.cos(t * .9), C = Math.sin(t * 1.89 + .8), D = Math.cos(t * 1.89 + .8);
    const E = Math.sin(t * 5.1), F = Math.cos(t * 5.1);
    for (let i = 0; i < n; i++) {
      const p = parent[i], k = row + i * 4;
      if (p < 0) { cs[i * 2] = 1; cs[i * 2 + 1] = 0; px[i] = x[i]; py[i] = y[i]; out[k] = x[i]; out[k + 1] = y[i]; out[k + 2] = 1; out[k + 3] = 0; continue; }
      const j = i * 6;
      const sway = A * w[j] - B * w[j + 1] + C * w[j + 2] - D * w[j + 3] + E * w[j + 4] + F * w[j + 5];
      // The turn at one joint is small, so its cosine and sine come from a short series.
      const d = s.gain[i] * strength * sway, cd = 1 - d * d * .5, sd = d - d * d * d / 6;
      const cp = cs[p * 2], sp = cs[p * 2 + 1], c = cp * cd - sp * sd, sn = sp * cd + cp * sd;
      const dx = x[i] - x[p], dy = y[i] - y[p];
      cs[i * 2] = c; cs[i * 2 + 1] = sn; px[i] = px[p] + dx * c - dy * sn; py[i] = py[p] + dx * sn + dy * c;
      out[k] = px[p]; out[k + 1] = py[p]; out[k + 2] = c; out[k + 3] = sn;
    }
  }
}
function uploadBones() {
  if (!bones.data) return;
  gl.bindTexture(gl.TEXTURE_2D, bones.tex);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, BONE_ROW, bones.rows, gl.RGBA, gl.FLOAT, bones.data);
}

// Heights in metres for each kind of cutout; herbarium sheets are scaled up freely.
function heightFor(s, rnd) { return plantHeight(s, rnd) * value('plantScale'); }
function plantHeight(s, rnd) {
  if (s.name.startsWith('malunggay')) return .7 + rnd() * .7;
  if (s.name.startsWith('hydrangea')) return .5 + rnd() * .45;
  if (s.name.startsWith('sunflower')) return .4 + rnd() * .3;
  return .5 + Math.pow(rnd(), .8) * 2.1;
}
// +1 when the camera looks right of travel, -1 left, 0 along it.
function laneSide() { const sn = Math.sin(S.drift * Math.PI / 180); return Math.abs(sn) < .2 ? 0 : Math.sign(sn); }
function placePlants() {
  const rnd = seeded(20261014), density = +S.density, overhang = +S.overhang, side = laneSide();
  const lane = x => side > 0 ? x : side < 0 ? .7 - x : (rnd() < .5 ? x : .7 - x);
  // Walking backwards, the bands lie behind the line of travel, where the camera looks.
  const nearBack = S.backwards ? NEAR_LENGTH - 1.2 : 1.2, farBack = S.backwards ? FAR_LENGTH + 18 : -18;
  const pool = species.filter(s => S.plantGroups.includes(s.group) && (s.group !== 'fgc' || S.fgc));
  const weight = s => s.name.startsWith('malunggay') ? 3 : s.group === 'fgc' ? .7 : 1;
  const total = pool.reduce((a, s) => a + weight(s), 0);
  const pick = () => { let r = rnd() * total; for (const s of pool) if ((r -= weight(s)) <= 0) return s; return pool[0]; };
  const lists = new Map(species.map(s => [s, []]));
  const near = Math.round(600 * density);
  for (let i = 0; i < near; i++) {
    const s = pick(), hang = s.group === 'herbarium' && rnd() < overhang;
    // The camera looks to the right of its line of travel, so the band extends further that way.
    let x = rnd() < .7 ? -4.5 + rnd() * 11 : 6.5 + rnd() * 6.5;
    // Keep the line of travel clear, more so on the right, where the camera looks.
    if (S.path && !hang && x > -.7 && x < 1.4 && rnd() < .92) x = rnd() < .35 ? -.7 - rnd() * .8 : 1.4 + rnd() * 1.2;
    const y = hang ? value('height') + 1.15 + rnd() * 1.4 : 0;
    // A hanging plant stops short of head height so the camera passes under it.
    const h = hang ? Math.min(heightFor(s, rnd), y - value('height') - .3) : heightFor(s, rnd);
    lists.get(s).push(lane(x), rnd() * NEAR_LENGTH, hang ? y : -.04 * h, (rnd() * 2 - 1) * .5,
      h / s.h, rnd() < .5 ? -1 : 1, hang ? -1 : 1, Math.floor(rnd() * VARIANTS),
      1, NEAR_LENGTH, nearBack, 0);
  }
  // Without a path, a thicket fills the line of travel, so there is always
  // something in front to push through.
  if (!S.path) {
    const thicket = Math.round(110 * density);
    for (let i = 0; i < thicket; i++) {
      const s = pick(), h = Math.min(heightFor(s, rnd), .5 + rnd() * 1.1);
      lists.get(s).push(lane(-1.6 + rnd() * 3.6), rnd() * NEAR_LENGTH, -.04 * h, (rnd() * 2 - 1) * .5,
        h / s.h, rnd() < .5 ? -1 : 1, 1, Math.floor(rnd() * VARIANTS),
        1, NEAR_LENGTH, nearBack, 0);
    }
  }
  // Leaf litter: small broad-leaved cards lying on the ground.
  const leafy = species.filter(s => /^(Adiantum|Lunaria|malunggay|Briza_maxima)/.test(s.name));
  const litter = Math.round(260 * density * value('ground'));
  for (let i = 0; i < litter && leafy.length; i++) {
    const s = leafy[Math.floor(rnd() * leafy.length)], h = .12 + rnd() * .25;
    lists.get(s).push(lane(-3 + rnd() * 9), rnd() * NEAR_LENGTH, .004 + rnd() * .006, rnd() * Math.PI * 2,
      h / s.h, rnd() < .5 ? -1 : 1, 1, Math.floor(rnd() * VARIANTS),
      1, NEAR_LENGTH, nearBack, 1);
  }
  const tall = species.filter(s => s.group === 'herbarium');
  for (let i = 0; i < 150; i++) {
    // Kept below about ten degrees of the view so the horizon layers behind them show.
    const s = tall[Math.floor(rnd() * tall.length)], h = 3 + rnd() * 6;
    lists.get(s).push((rnd() * 2 - 1) * 42, rnd() * FAR_LENGTH, -.4, (rnd() * 2 - 1) * .3,
      h / s.h, rnd() < .5 ? -1 : 1, 1, Math.floor(rnd() * VARIANTS),
      0, FAR_LENGTH, farBack, 0);
  }
  let cards = 0;
  for (const [s, list] of lists) { s.baseList = list; rebuildSpecies(s); cards += s.instanceCount; }
  canvas.dataset.cards = cards;
}

// Plants within FULL_DETAIL metres ahead of the camera use the fine mesh.
const FULL_DETAIL = 9;
function sortByDistance(s, lat) {
  const a = s.placed;
  if (s.full === s.lod) {
    s.full.count = s.instanceCount;
    gl.bindBuffer(gl.ARRAY_BUFFER, s.full.instances); gl.bufferData(gl.ARRAY_BUFFER, a, gl.DYNAMIC_DRAW);
    return s.instanceCount;
  }
  let n = 0, f = 0;
  for (let i = 0; i < a.length; i += 12) {
    const back = a[i + 10], length = a[i + 9];
    const u = (((a[i + 1] - travel + back) % length) + length) % length - back;
    const near = a[i + 8] > .5 && Math.hypot(u, a[i] - lat) < FULL_DETAIL;
    const dst = near ? s.nearBuf : s.farBuf, k = near ? n : f;
    for (let j = 0; j < 12; j++) dst[k + j] = a[i + j];
    if (near) n += 12; else f += 12;
  }
  for (const [m, buf, len] of [[s.full, s.nearBuf, n], [s.lod, s.farBuf, f]]) {
    m.count = len / 12;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.instances); gl.bufferData(gl.ARRAY_BUFFER, buf.subarray(0, len), gl.DYNAMIC_DRAW);
  }
  return n / 12;
}

// ---------- grass and pollen ----------
const grass = {vao: gl.createVertexArray(), count: 46000, segments: 6};
{
  const strip = [];
  for (let i = 0; i <= grass.segments; i++) strip.push(i / grass.segments, -1, i / grass.segments, 1);
  gl.bindVertexArray(grass.vao);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strip), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const rnd = seeded(77), inst = new Float32Array(grass.count * 8);
  for (let i = 0; i < grass.count; i++) {
    const x = -5 + rnd() * 16, tuft = rnd() < .2 ? 1.6 : 1;
    inst.set([x, rnd() * GRASS_LENGTH, (.08 + Math.pow(rnd(), 1.8) * .42) * tuft, rnd() * 6.283,
      (rnd() * 2 - 1) * .45, .006 + rnd() * .008, rnd(), rnd() * 6.283], i * 8);
  }
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
  for (let k = 0; k < 2; k++) { gl.enableVertexAttribArray(1 + k); gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, 32, k * 16); gl.vertexAttribDivisor(1 + k, 1); }
  gl.bindVertexArray(null);
}
const pollen = {vao: gl.createVertexArray(), max: 900, length: 7};
{
  const rnd = seeded(5), inst = new Float32Array(pollen.max * 4);
  for (let i = 0; i < pollen.max; i++) inst.set([-2 + rnd() * 6.5, .05 + rnd() * 2.8, rnd() * pollen.length, rnd() * .7], i * 4);
  gl.bindVertexArray(pollen.vao);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(0, 1);
  gl.bindVertexArray(null);
}

// ---------- telephone poles ----------
// Wooden poles in a row beside the line of travel, with sagging wires between
// them. Every PAYPHONE_EVERY-th pole has the payphone from 3d/models at its foot.
const POLE = {spacing: 28, offset: 12, lateral: 3.2, behind: 30, ahead: 170};
const poleSpan = () => S.backwards ? [POLE.ahead, POLE.behind] : [POLE.behind, POLE.ahead];
const PAYPHONE_EVERY = 6;
function meshBuilder() {
  const data = [];
  const push = (p, n) => data.push(p[0], p[1], p[2], n[0], n[1], n[2]);
  return {
    data,
    cylinder(x, z, y0, y1, r0, r1, sides = 12) {
      for (let i = 0; i < sides; i++) {
        const a0 = i / sides * Math.PI * 2, a1 = (i + 1) / sides * Math.PI * 2;
        const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
        const p = [[x + c0 * r0, y0, z + s0 * r0], [x + c1 * r0, y0, z + s1 * r0], [x + c1 * r1, y1, z + s1 * r1], [x + c0 * r1, y1, z + s0 * r1]];
        const n0 = [c0, 0, s0], n1 = [c1, 0, s1];
        push(p[0], n0); push(p[1], n1); push(p[2], n1); push(p[0], n0); push(p[2], n1); push(p[3], n0);
        push([x, y1, z], [0, 1, 0]); push(p[3], [0, 1, 0]); push(p[2], [0, 1, 0]);
      }
    },
    box(cx, cy, cz, sx, sy, sz) {
      const h = [sx / 2, sy / 2, sz / 2];
      for (const [axis, sign] of [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]) {
        const n = [0, 0, 0]; n[axis] = sign;
        const u = (axis + 1) % 3, v = (axis + 2) % 3, q = [];
        for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const p = [cx, cy, cz]; p[axis] += sign * h[axis]; p[u] += a * h[u]; p[v] += b * h[v]; q.push(p);
        }
        push(q[0], n); push(q[1], n); push(q[2], n); push(q[0], n); push(q[2], n); push(q[3], n);
      }
    },
  };
}
// Pole space: x along the cross-arms (across the wires), y up, z along the wires.
// Each wire point is [x, height, sag at mid-span]; the last is the telephone cable.
const WIRE_POINTS = [[-1.05, 8.86, .35], [-.5, 8.86, .35], [.5, 8.86, .35], [1.05, 8.86, .35], [-.75, 8.06, .3], [.75, 8.06, .3], [.2, 6.3, .7]];
function buildPole(transformer) {
  const m = meshBuilder();
  m.cylinder(0, 0, -.3, 9.2, .15, .11);
  m.box(0, 8.6, 0, 2.5, .1, .12); m.box(0, 7.8, 0, 1.8, .1, .12);
  for (const [x, y] of WIRE_POINTS.slice(0, 6)) m.cylinder(x, 0, y - .26, y - .02, .045, .035, 8);
  m.box(.16, 6.3, 0, .1, .12, .1);
  if (transformer) { m.cylinder(.42, 0, 6.6, 7.45, .26, .26, 14); m.box(.25, 7.05, 0, .2, .08, .08); }
  return m.data;
}
function solidMesh(data, stride = 6, uv = false) {
  const vao = gl.createVertexArray(), b = gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride * 4, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride * 4, 12);
  if (uv) { gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 2, gl.FLOAT, false, stride * 4, 24); }
  if (stride > (uv ? 8 : 6)) { gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride * 4, uv ? 32 : 24); }
  gl.bindVertexArray(null);
  return {vao, count: data.length / stride};
}
const poleMeshes = [solidMesh(new Float32Array(buildPole(false))), solidMesh(new Float32Array(buildPole(true)))];
const wires = {vao: gl.createVertexArray(), buffer: gl.createBuffer(), data: new Float32Array(16 * WIRE_POINTS.length * 24 * 2 * 6)};
gl.bindVertexArray(wires.vao); gl.bindBuffer(gl.ARRAY_BUFFER, wires.buffer);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
gl.bindVertexArray(null);
let payphone = null;
// Part colours, in the order of the roles in data/payphone-roles.json. The shell
// colour comes from the control.
const PAYPHONE_PARTS = {trim: '#3c3f42', shell: null, sign: '#efe9da', body: '#a3a9ad', handset: '#141414',
  cord: '#161616', keys: '#d9d8d2', post: '#8a8f93', base: '#4a4a48'};
let payphoneRoles = [];
let payphoneTex = null;
async function loadPayphone() {
  const [meta, buffer, image] = await Promise.all([(await fetch(DATA + 'payphone.json')).json(), (await fetch(DATA + 'payphone.bin')).arrayBuffer(),
    (async () => createImageBitmap(await (await fetch(DATA + 'payphone.webp')).blob()))()]);
  payphoneRoles = meta.roles || [];
  payphone = solidMesh(new Float32Array(buffer), meta.stride || 6, !!meta.uv);
  payphoneTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, payphoneTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}
function payphonePalette() {
  const out = new Float32Array(27);
  payphoneRoles.forEach((role, i) => {
    const hex = PAYPHONE_PARTS[role] || '#1d5aa6';
    out.set([1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255), i * 3);
  });
  return out;
}
// A model matrix whose x and z axes are the given ground-plane vectors, placed at t.
const frameMatrix = (x, z, t) => new Float32Array([x[0], 0, x[1], 0, 0, 1, 0, 0, z[0], 0, z[1], 0, t[0], 0, t[1], 1]);
const IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const wrapIndex = (k, n) => ((k % n) + n) % n;

// Ground position of pole k, and its distance along the route.
function poleBase(k, d = brush.view ? brush.view.dir : [0, -1]) {
  const r = [-d[1], d[0]], along = POLE.offset + k * POLE.spacing;
  return [along * d[0] + S.poleLateral * r[0], along * d[1] + S.poleLateral * r[1], along];
}
function drawPoles(cam, vp) {
  const d = cam.dir, r = [-d[1], d[0]], u = P.solid.u;
  gl.useProgram(P.solid.p); common(P.solid, cam); gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uFlat, 0);
  gl.uniform3fv(u['uPalette[0]'], payphonePalette());
  gl.vertexAttrib1f(2, -1);   // poles and wires carry no role and use uAlbedo
  const [behind, ahead] = poleSpan();
  const first = Math.floor((travel - behind - POLE.offset) / POLE.spacing);
  const last = Math.ceil((travel + ahead - POLE.offset) / POLE.spacing);
  const at = k => poleBase(k, d);
  let w = 0, phones = 0;
  const out = wires.data;
  for (let k = first; k <= last; k++) {
    const base = at(k);
    gl.uniform3fv(u.uAlbedo, [.34, .29, .24]);
    gl.uniformMatrix4fv(u.uModel, false, frameMatrix(r, [-d[0], -d[1]], base));
    const mesh = poleMeshes[wrapIndex(k, 3) === 1 ? 1 : 0];
    gl.bindVertexArray(mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    if (payphone && wrapIndex(k - S.payphoneOffset, S.payphoneEvery) === 0) {
      // Beside the pole on the path side, its front turned to the path.
      const t = [base[0] - .6 * r[0] + .45 * d[0], base[1] - .6 * r[1] + .45 * d[1]];
      gl.uniform3fv(u.uAlbedo, [.6, .64, .66]);
      gl.uniformMatrix4fv(u.uModel, false, frameMatrix([-d[0], -d[1]], [-r[0], -r[1]], t));
      if (payphoneTex) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, payphoneTex); gl.uniform1i(u.uSolidTex, 2); gl.uniform1f(u.uTextured, 1); gl.activeTexture(gl.TEXTURE0); }
      gl.bindVertexArray(payphone.vao); gl.drawArrays(gl.TRIANGLES, 0, payphone.count);
      gl.uniform1f(u.uTextured, 0);
      phones++;
    }
    if (k === last) continue;
    // Wires to the next pole, each a parabola, which is close to a catenary at this sag.
    const next = at(k + 1);
    for (const [x, y, sag] of WIRE_POINTS) {
      const a = [base[0] + x * r[0], base[1] + x * r[1]], b = [next[0] + x * r[0], next[1] + x * r[1]];
      for (let i = 0; i < 24; i++) for (const t of [i / 24, (i + 1) / 24]) {
        out[w++] = a[0] + (b[0] - a[0]) * t; out[w++] = y - sag * 4 * t * (1 - t); out[w++] = a[1] + (b[1] - a[1]) * t;
        out[w++] = 0; out[w++] = 1; out[w++] = 0;
      }
    }
  }
  canvas.dataset.poles = last - first + 1; canvas.dataset.payphones = phones;
  gl.uniformMatrix4fv(u.uModel, false, IDENTITY); gl.uniform3fv(u.uAlbedo, [.16, .15, .14]); gl.uniform1f(u.uFlat, 1);
  gl.bindVertexArray(wires.vao); gl.bindBuffer(gl.ARRAY_BUFFER, wires.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, out.subarray(0, w), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.LINES, 0, w / 6);
}

// ---------- palms ----------
// Procedural coconut palms: a curved, tapering trunk and a crown of arching
// fronds lined with drooping leaflets. Several variants are built once and
// drawn with a model matrix each. Like the poles, palms are placed by index along
// the line of travel, so they never wrap or pop in near the camera.
const PALM = {height: 9, spacing: 7, behind: 14, ahead: 160};
const PALM_COLOURS = ['#5e5548', '#4f6a33', '#4a4239'];   // trunk, frond, trunk ring
const PALM_PALETTE = new Float32Array(27);
PALM_COLOURS.forEach((hex, i) => PALM_PALETTE.set([1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255), i * 3));
function buildPalm(lean, seed) {
  const rnd = seeded(seed), data = [];
  const tri = (a, b, c, role) => {
    const n = norm(cross(sub(b, a), sub(c, a)));
    for (const p of [a, b, c]) data.push(p[0], p[1], p[2], n[0], n[1], n[2], role);
  };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  // Trunk along a quadratic curve leaning towards +x.
  const H = PALM.height, tip = [lean * H, H, 0], ctrl = [lean * H * .15, H * .6, 0];
  const curve = t => [2 * (1 - t) * t * ctrl[0] + t * t * tip[0], 2 * (1 - t) * t * ctrl[1] + t * t * tip[1], 0];
  const rings = 32, sides = 10, ringAt = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, c = curve(t), d = norm(sub(curve(Math.min(1, t + .01)), curve(Math.max(0, t - .01))));
    const a = norm(cross(d, [0, 0, 1])), b = cross(a, d), r = .17 * (1 - .3 * t) + .1 * Math.exp(-t * 14);
    ringAt.push(Array.from({length: sides}, (_, k) => { const q = k / sides * Math.PI * 2; return add(c, add(mul(a, Math.cos(q) * r), mul(b, Math.sin(q) * r))); }));
  }
  for (let i = 0; i < rings; i++) for (let k = 0; k < sides; k++) {
    const role = i % 2 ? 2 : 0, a = ringAt[i][k], b = ringAt[i][(k + 1) % sides], c = ringAt[i + 1][(k + 1) % sides], d = ringAt[i + 1][k];
    tri(a, b, c, role); tri(a, c, d, role);
  }
  // Fronds from the crown.
  const fronds = 16 + Math.floor(rnd() * 6);
  for (let f = 0; f < fronds; f++) {
    const phi = f / fronds * Math.PI * 2 + rnd() * .3, rise = -.2 + rnd() * 1.1, droop = .7 + rnd() * 1.1, L = 3.4 + rnd() * 1.6;
    const steps = 22, pts = [], tangents = [];
    let p = add(tip, [0, .1, 0]);
    for (let i = 0; i <= steps; i++) {
      const s = i / steps, alpha = rise - droop * Math.pow(s, 1.5);
      const dir = [Math.cos(alpha) * Math.cos(phi), Math.sin(alpha), Math.cos(alpha) * Math.sin(phi)];
      pts.push(p); tangents.push(dir); p = add(p, mul(dir, L / steps));
    }
    for (let i = 0; i < steps; i++) {
      const side = norm(cross(tangents[i], [0, 1, 0])), wdt = .025 * (1 - i / steps) + .008;
      const a = add(pts[i], mul(side, wdt)), b = add(pts[i], mul(side, -wdt)), c = add(pts[i + 1], mul(side, -wdt)), d = add(pts[i + 1], mul(side, wdt));
      tri(a, b, c, 1); tri(a, c, d, 1);
      // Two leaflets per step on each side, angled down into a V and slightly forward.
      for (const sign of [1, -1]) for (const half of [0, .5]) {
        const s = (i + half) / steps, base = add(pts[i], mul(sub(pts[i + 1], pts[i]), half));
        const len = .15 + .85 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.05)), .7), drop = .45 + .35 * s;
        const out = norm(add(add(mul(side, sign * Math.cos(drop)), [0, -Math.sin(drop), 0]), mul(tangents[i], .35)));
        const mid = add(add(base, mul(out, len * .55)), [0, -.06 * len, 0]), end = add(add(base, mul(out, len)), [0, -.22 * len, 0]);
        const across = mul(norm(cross(out, [0, 1, 0])), .028 * len + .01);
        tri(add(base, across), add(base, mul(across, -1)), add(mid, mul(across, -1)), 1);
        tri(add(base, across), add(mid, mul(across, -1)), add(mid, across), 1);
        tri(add(mid, across), add(mid, mul(across, -1)), end, 1);
      }
    }
  }
  return new Float32Array(data);
}
const PALM_LEANS = [.06, .14, .22, .3, .38, .46];
const palmMeshes = PALM_LEANS.map((lean, i) => solidMesh(buildPalm(lean, 4001 + i * 17), 7));

// One palm per slot along the line of travel, decided by a hash of the slot.
// Slots are the same every frame, so each is worked out once and kept.
const palmSlots = new Map();
function palmAt(k, density) {
  let slot = palmSlots.get(k);
  if (!slot) { slot = makePalm(k); palmSlots.set(k, slot); if (palmSlots.size > 400) palmSlots.delete(palmSlots.keys().next().value); }
  return slot.present > density * .9 ? null : slot;
}
function makePalm(k) {
  const rnd = seeded(k * 7919 + 13);
  const present = rnd(), lane = rnd(), across = rnd(), size = rnd(), turn = rnd(), shape = rnd();
  const along = k * PALM.spacing + (rnd() - .5) * PALM.spacing * .8;
  let v, lean, toward;
  // Palms by the path are shorter and lean over it, so their fronds hang into the top of the frame.
  if (lane < .4) { v = -2.5 + across * 5.5; lean = .3 + shape * .16; toward = v > .3 ? -1 : v < -.3 ? 1 : (turn < .5 ? 1 : -1); }
  else if (lane < .6) { v = -9 - across * 6; lean = .06 + shape * .2; toward = 0; }
  else { v = 4 + across * 14; lean = .06 + shape * .24; toward = 0; }
  const variant = PALM_LEANS.reduce((best, l, i) => Math.abs(l - lean) < Math.abs(PALM_LEANS[best] - lean) ? i : best, 0);
  const scale = lane < .4 ? .42 + size * .28 : .65 + size * .5;
  return {present, along, v, toward, angle: turn * Math.PI * 2, scale, variant, phase: k * 1.7, matrix: new Float32Array(16)};
}

function drawPalms(cam, vp) {
  const density = value('palms');
  if (density <= 0) { canvas.dataset.palms = 0; return; }
  const d = cam.dir, r = [-d[1], d[0]], u = P.solid.u;
  gl.useProgram(P.solid.p); common(P.solid, cam); gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uFlat, 0);
  gl.uniform3fv(u['uPalette[0]'], PALM_PALETTE);
  gl.uniform1f(u.uWind, value('wind')); gl.uniform1f(u.uTime, time); gl.uniform1f(u.uSwayHeight, PALM.height);
  let drawn = 0;
  for (let k = Math.floor((travel - PALM.behind) / PALM.spacing); k <= Math.ceil((travel + PALM.ahead) / PALM.spacing); k++) {
    const palm = palmAt(k, density);
    if (!palm) continue;
    // The palm's lean direction (its local +x) in the ground plane.
    const ax = palm.toward ? [r[0] * palm.toward, r[1] * palm.toward] : [Math.cos(palm.angle), Math.sin(palm.angle)];
    const base = [palm.along * d[0] + palm.v * r[0], palm.along * d[1] + palm.v * r[1]];
    const k2 = palm.scale;
    palm.matrix.set([ax[0] * k2, 0, ax[1] * k2, 0, 0, k2, 0, 0, -ax[1] * k2, 0, ax[0] * k2, 0, base[0], 0, base[1], 1]);
    gl.uniformMatrix4fv(u.uModel, false, palm.matrix);
    gl.uniform1f(u.uPhase, palm.phase);
    const mesh = palmMeshes[palm.variant];
    gl.bindVertexArray(mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    drawn++;
  }
  gl.uniform1f(u.uWind, 0);
  canvas.dataset.palms = drawn;
}

// Injected into engine/scene.js by make_engine.py. Uses that scene's solid
// shader and lighting; geometry is exported by build_props.cjs.
const festivalMeshes = new Map();
const FESTIVAL_NAMES = ['banderitas', 'parol', 'chochin', 'koinobori'];
const festivalInstances = [], festivalLightPositions = new Float32Array(12), festivalLightColours = new Float32Array(12);
let festivalLightCount = 0;
async function loadFestival() {
  await Promise.all(FESTIVAL_NAMES.map(async name => {
    const base = DATA + 'festival/' + name;
    const [meta, buffer, image] = await Promise.all([
      fetch(base + '.json').then(r => r.json()), fetch(base + '.bin').then(r => r.arrayBuffer()),
      fetch(base + '.webp').then(r => r.blob()).then(createImageBitmap),
    ]);
    const mesh = solidMesh(new Float32Array(buffer), meta.stride, true), tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    image.close(); festivalMeshes.set(name, {...mesh, tex, light: meta.light});
  }));
}
function prepareFestival(cam) {
  festivalInstances.length = 0; festivalLightCount = 0;
  festivalLightPositions.fill(0); festivalLightColours.fill(0);
  if (!S.festival || !festivalMeshes.size) return;
  const d = cam.dir, r = [-d[1], d[0]], lights = [];
  const place = (name, along, across, yaw, phase) => {
    const mesh = festivalMeshes.get(name), c = Math.cos(yaw), s = Math.sin(yaw);
    const ax = [r[0] * c - d[0] * s, r[1] * c - d[1] * s];
    const az = [-r[0] * s - d[0] * c, -r[1] * s - d[1] * c];
    const base = [along * d[0] + across * r[0], along * d[1] + across * r[1]];
    festivalInstances.push({name, mesh, matrix: frameMatrix(ax, az, base), phase});
    if (mesh.light) {
      const light = mesh.light, [x, y, z] = light.position;
      const p = [base[0] + ax[0] * x + az[0] * z, y, base[1] + ax[1] * x + az[1] * z];
      lights.push({name, p, c: linear(light.colour).map(c => c * light.power * S.festivalLight), d2: p.reduce((sum, v, i) => sum + (v - cam.eye[i]) ** 2, 0)});
    }
  };
  // Index-addressed stations stream indefinitely; no objects accumulate. The
  // same station has the same arrangement when reached from either direction.
  const first = Math.max(0, Math.floor((travel - 12) / 18)), last = Math.ceil((travel + 65) / 18);
  for (let k = first; k <= last; k++) {
    const rnd = seeded(1016 + k * 7919), along = 9 + k * 18 + rnd() * 4;
    if (rnd() < .55) place('banderitas', along, 0, (rnd() - .5) * .25, k * 2.7);
    const name = FESTIVAL_NAMES[1 + Math.floor(rnd() * 3)], side = rnd() < .5 ? -1 : 1;
    place(name, along + 4, side * (2 + rnd() * .8), side * (.12 + rnd() * .4), k * 3.1);
    if (rnd() < .3) place(FESTIVAL_NAMES[1 + Math.floor(rnd() * 3)], along + 10, -side * 2.5, -.3 * side, k * 1.3);
  }
  // Only four local sources reach the shaders, independently of route length.
  const nearby = lights.sort((a, b) => a.d2 - b.d2).slice(0, 4);
  for (const light of nearby) {
    festivalLightPositions.set(light.p, festivalLightCount * 3); festivalLightColours.set(light.c, festivalLightCount * 3); festivalLightCount++;
  }
  canvas.dataset.festivalLights = String(festivalLightCount);
  canvas.dataset.festivalLightTypes = JSON.stringify(nearby.map(light => light.name));
  canvas.dataset.festivalLightPositions = JSON.stringify([...festivalLightPositions.slice(0, festivalLightCount * 3)]);
  canvas.dataset.festivalStations = first + ':' + last;
}
function drawFestival(cam, vp) {
  if (!S.festival || !festivalMeshes.size || !S.festivalVisible) return;
  const u = P.solid.u, counts = {};
  gl.useProgram(P.solid.p); common(P.solid, cam);
  gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uFlat, 0);
  gl.uniform1f(u.uWind, 0); gl.uniform1f(u.uTime, time);
  gl.uniform1f(u.uFestival, 1); gl.uniform1f(u.uFestivalEmission, S.festivalEmission); gl.uniform1f(u.uFlutter, .08 + S.wind * .2);
  gl.uniform1f(u.uTextured, 1); gl.activeTexture(gl.TEXTURE2); gl.uniform1i(u.uSolidTex, 2);
  for (const {name, mesh, matrix, phase} of festivalInstances) {
    gl.uniformMatrix4fv(u.uModel, false, matrix); gl.uniform1f(u.uPhase, phase);
    gl.bindTexture(gl.TEXTURE_2D, mesh.tex); gl.bindVertexArray(mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    counts[name] = (counts[name] || 0) + 1;
  }
  canvas.dataset.festival = JSON.stringify(counts);
  gl.uniform1f(u.uFestival, 0); gl.uniform1f(u.uFestivalEmission, 0); gl.uniform1f(u.uFlutter, 0); gl.uniform1f(u.uTextured, 0);
  gl.activeTexture(gl.TEXTURE0);
}


// ---------- shide ----------
// A shimenawa: two bamboo stakes, a sagging straw rope between them, and zigzag
// paper shide hanging from the rope. Local x runs along the rope, z across it.
const SHIDE = {span: 1.6, height: 1.15, sag: .09, papers: 4};
const SHIDE_PALETTE = new Float32Array(27);
['#8f9a4e', '#c9b27a', '#4a3a24', '#ffffff'].forEach((c, i) => SHIDE_PALETTE.set(linear(c), i * 3));   // bamboo, straw, tie, paper
const shideMesh = (() => {
  const data = [], push = (p, n, uv, role) => data.push(p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1], role);
  const quad = (a, b, c, d, n, uvs, role) => { for (const [p, t] of [[a, 0], [b, 1], [c, 2], [a, 0], [c, 2], [d, 3]]) push(p, n, uvs[t], role); };
  const tube = (from, to, r, role, sides = 8) => {
    const ax = norm(sub(to, from)), up = Math.abs(ax[1]) > .9 ? [1, 0, 0] : [0, 1, 0], s = norm(cross(ax, up)), t = cross(s, ax);
    for (let i = 0; i < sides; i++) {
      const a0 = i / sides * Math.PI * 2, a1 = (i + 1) / sides * Math.PI * 2;
      const o0 = [0, 1, 2].map(k => (Math.cos(a0) * s[k] + Math.sin(a0) * t[k])), o1 = [0, 1, 2].map(k => (Math.cos(a1) * s[k] + Math.sin(a1) * t[k]));
      const p = (base, o) => base.map((v, k) => v + o[k] * r);
      quad(p(from, o0), p(from, o1), p(to, o1), p(to, o0), norm(o0.map((v, k) => v + o1[k])), [[0, 0], [0, 0], [0, 0], [0, 0]], role);
    }
  };
  const L = SHIDE.span / 2, H = SHIDE.height;
  for (const x of [-L, L]) {
    tube([x, -.2, 0], [x, H + .14, 0], .022, 0);
    tube([x - .03, H - .01, 0], [x + .03, H - .01, 0], .03, 2);   // the rope's tie at the stake
  }
  const ropeY = x => H - SHIDE.sag * (1 - (x / L) ** 2);
  for (let i = 0; i < 16; i++) {
    const x0 = -L + i / 16 * 2 * L, x1 = -L + (i + 1) / 16 * 2 * L;
    tube([x0, ropeY(x0), 0], [x1, ropeY(x1), 0], .02, 1, 7);
  }
  // Each shide: four paper pieces stepping down in a zigzag, about 45 cm long,
  // larger than life so they read at a few metres in the dark.
  const w = .06, h = .115;
  for (let k = 0; k < SHIDE.papers; k++) {
    const x0 = -L * .72 + k / (SHIDE.papers - 1) * L * 1.44, top = ropeY(x0) - .012, seed = k * 2.39;
    for (let i = 0; i < 4; i++) {
      // Alternate pieces step sideways by 60% of a width, so neighbours overlap and the strip reads as one folded zigzag.
      const xa = x0 + (i % 2 ? w * .3 : -w * .3) - w / 2, ya = top - i * h, yb = ya - h * .98;
      const uv = y => [top - y, seed];
      quad([xa, ya, 0], [xa + w, ya, 0], [xa + w, yb, 0], [xa, yb, 0], [0, 0, 1], [uv(ya), uv(ya), uv(yb), uv(yb)], 3);
    }
  }
  return solidMesh(new Float32Array(data), 9, true);
})();
const shideMatrix = new Float32Array(16);
// S.shide holds [{u, v, yaw}]: u along the route, v to its right, yaw turning the rope off parallel.
function drawShide(cam, vp) {
  if (!S.shide.length) return;
  const d = cam.dir, r = [-d[1], d[0]], u = P.solid.u;
  gl.useProgram(P.solid.p); common(P.solid, cam); gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uFlat, 0);
  gl.uniform3fv(u['uPalette[0]'], SHIDE_PALETTE); gl.uniform1f(u.uTextured, 0);
  gl.uniform1f(u.uWind, 0); gl.uniform1f(u.uTime, time); gl.uniform1f(u.uFlutter, .25 + value('wind') * .9);
  for (const s of S.shide) {
    if (Math.abs(s.u - travel) > 60) continue;
    const c = Math.cos(s.yaw || 0), sn = Math.sin(s.yaw || 0), ax = [d[0] * c - d[1] * sn, d[0] * sn + d[1] * c];
    const base = [s.u * d[0] + s.v * r[0], s.u * d[1] + s.v * r[1]];
    shideMatrix.set([ax[0], 0, ax[1], 0, 0, 1, 0, 0, -ax[1], 0, ax[0], 0, base[0], 0, base[1], 1]);
    gl.uniformMatrix4fv(u.uModel, false, shideMatrix); gl.uniform1f(u.uPhase, s.u * 1.7);
    gl.bindVertexArray(shideMesh.vao); gl.drawArrays(gl.TRIANGLES, 0, shideMesh.count);
  }
  gl.uniform1f(u.uFlutter, 0);
}

// ---------- brushing ----------
const SPARK_MAX = 400;
// Bokeh palettes; the reel uses a restricted one so the sparks sit with the blue night.
const SPARK_PALETTES = {
  night: ['#43e0ff', '#7f9bff', '#9b7bff', '#ffd98a'],
  ember: ['#ffb347', '#ff7a4a', '#ff5a6e'],
  moon: ['#cfe4ff', '#9fc4ff', '#ffffff'],
  spectrum: ['#ff4fd8', '#43e0ff', '#ffd04a', '#9b7bff', '#ff6a4a', '#7dffb0'],
  running: ['#3fe6ff', '#6f8dff', '#e6f6ff', '#2fb8ff'],        // cold electric blue and white
  exchange: ['#ff5fa8', '#f4b48c', '#ffd0dc', '#b46cff'],       // magenta, skin, pale pink, violet
  hours: ['#4f86ff', '#f29a6a', '#d0609a', '#ffb347'],          // the four hours' horizons
  toward: ['#ffc98a', '#ff9b45', '#ff6a3d', '#fff0c8'],         // the bulb, ember to cream
  forgetting: ['#dfe8ff', '#c3cde6', '#e3d6ef', '#cfe8e2'],     // faded pastels, close to white
};
for (const key in SPARK_PALETTES) SPARK_PALETTES[key] = SPARK_PALETTES[key].map(linear);
// A palette's first four colours, each scaled so its brightest channel is 1.
function bokehTints() { return tints(SPARK_PALETTES[S.bokehPalette] || SPARK_PALETTES.night); }
function tints(list) {
  const p = list.map(c => typeof c === 'string' ? linear(c) : c), out = new Float32Array(12);
  for (let i = 0; i < 4; i++) { const c = p[i % p.length], m = Math.max(...c) || 1; out.set(c.map(v => v / m), i * 3); }
  return out;
}
const EIGHTH = 60 / 98 / 2;   // the reel music is 98 BPM
const brush = {
  x: .5, y: .5, down: false, shown: false, wasDown: false, point: null, lastTrail: 0, sinceNote: 0, held: 0,
  trail: [], sparks: [], pushData: new Float32Array(PUSH_POINTS * 4), dirData: new Float32Array(PUSH_POINTS * 4),
  sparkData: new Float32Array((SPARK_MAX + 16) * 8), glows: [], sparkBuffer: gl.createBuffer(), sparkVao: gl.createVertexArray(),
  view: null, events: null, steps: null, audio: null, synth: null, random: seeded(99), pushOn: 1,
};
gl.bindVertexArray(brush.sparkVao); gl.bindBuffer(gl.ARRAY_BUFFER, brush.sparkBuffer);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
gl.bindVertexArray(null);

// The world point under screen position (x, y), `depth` metres along the view ray.
function rayPoint(x, y, depth) {
  const v = brush.view;
  if (!v) return null;
  const nx = x * 2 - 1, ny = 1 - y * 2;
  const dir = norm(v.fwd.map((f, k) => f + nx * v.tanX * v.r[k] + ny * v.tanY * v.u[k]));
  return v.eye.map((e, k) => e + dir[k] * depth);
}
function playSnap(pan, velocity, time = brush.clock) {
  if (brush.events) brush.events.push({time, type: 'snap', pan, velocity});
  else if (brush.synth) brush.synth.snap(brush.audio.currentTime + .005, {pan, velocity});
}
function playNote(step, pan, velocity, time = brush.clock) {
  if (brush.events) brush.events.push({time, step, pan, velocity});
  else if (brush.synth) brush.synth.note(brush.audio.currentTime + .01, stepFrequency(step), {pan, velocity});
}
const GRAB_REACH = 1.4;   // the farthest a grabbed spot follows the hand, metres
function addGrabs(depths) {
  for (const [depth, radius] of depths) {
    if (brush.trail.filter(g => g.held).length >= PUSH_POINTS - 1) return;
    const p = rayPoint(brush.x, brush.y, depth);
    if (!p) return;
    brush.trail.push({anchor: p, depth, radius, disp: [0, 0, 0], held: true, age: 0});
    while (brush.trail.length > PUSH_POINTS - 1) brush.trail.splice(brush.trail.findIndex(g => !g.held) >= 0 ? brush.trail.findIndex(g => !g.held) : 0, 1);
  }
}
function updateBrush(dt) {
  brush.clock = (brush.clock || 0) + dt;
  const point = rayPoint(brush.x, brush.y, 1.6);
  if (brush.down && point && S.grab) {
    if (!brush.wasDown) {
      brush.sinceNote = EIGHTH; brush.held = 0; brush.prev = point; brush.lastGrab = [brush.x, brush.y];
      addGrabs([[1.3, .8], [2.4, 1.1], [3.6, 1.4]]);
    }
    brush.held += dt;
    const v = point.map((c, k) => (c - brush.prev[k]) / Math.max(dt, 1e-3)), speed = Math.hypot(v[0], v[2]);
    // Sweeping across the frame gathers more of the brush into the hand.
    if (Math.hypot(brush.x - brush.lastGrab[0], brush.y - brush.lastGrab[1]) > .06) {
      brush.lastGrab = [brush.x, brush.y];
      addGrabs([[1.4, .8], [2.8, 1.2]]);
    }
    // Held spots follow the hand, a little behind it, up to GRAB_REACH.
    const follow = 1 - Math.exp(-14 * dt);
    for (const g of brush.trail) {
      if (!g.held) continue;
      const target = rayPoint(brush.x, brush.y, g.depth).map((c, k) => c - g.anchor[k]);
      const l = Math.hypot(...target), k = l > GRAB_REACH ? GRAB_REACH / l : 1;
      for (let i = 0; i < 3; i++) g.disp[i] += (target[i] * k - g.disp[i]) * follow;
    }
    // Notes on the eighth-note grid while held; pitch from the hand's height unless a script sets it.
    brush.sinceNote += dt;
    if (S.notes && brush.sinceNote >= EIGHTH - 1e-6) {
      brush.sinceNote -= EIGHTH;
      const step = brush.steps ? brush.steps.shift() ?? 0 : Math.round((1 - brush.y) * 7);
      // The note belongs where the eighth fell, not at the frame that noticed it.
      playNote(step, brush.x * 2 - 1, .6 + Math.min(.4, speed * .2), brush.clock - brush.sinceNote);
    }
    // Coloured bokeh between the lens and the hand.
    if (S.sparks) spawnSparks(Math.round((40 + speed * 30) * dt + brush.random() * .99), .12, speed);
    brush.prev = point;
  }
  updateRelease(dt);
}
function spawnSparks(spawn, spread, speed) {
  {
    for (let i = 0; i < spawn && brush.sparks.length < SPARK_MAX; i++) {
      const p = rayPoint(brush.x + (brush.random() - .5) * spread, brush.y + (brush.random() - .5) * spread, .35 + brush.random() * 1.3);
      if (!p) return;
      const palette = SPARK_PALETTES[S.bokehPalette] || SPARK_PALETTES.night;
      const c = palette[Math.floor(brush.random() * palette.length)];
      brush.sparks.push({p, v: [(brush.random() - .5) * .4, .05 + brush.random() * .25, (brush.random() - .5) * .4], life: 0, span: 1 + brush.random() * 1.3, c, size: .6 + brush.random() * .8});
    }
  }
}
function updateRelease(dt) {
  if (brush.wasDown && !brush.down) {
    // Let go: everything gathered snaps back.
    let pull = 0;
    for (const g of brush.trail) if (g.held) { g.held = false; g.age = 0; g.release = g.disp.slice(); pull = Math.max(pull, Math.hypot(...g.disp)); }
    if (pull > .05) { if (S.notes) playSnap(brush.x * 2 - 1, Math.min(1, .4 + pull / GRAB_REACH)); if (hooks.snap) hooks.snap(pull); }
  }
  brush.wasDown = brush.down;
  // Released spots spring back fast, overshooting a little.
  for (const g of brush.trail) {
    if (g.held) continue;
    g.age += dt;
    const k = Math.exp(-g.age * 5.5) * Math.cos(g.age * 17);
    for (let i = 0; i < 3; i++) g.disp[i] = g.release[i] * k;
  }
  brush.trail = brush.trail.filter(g => g.held || g.age < 1.4);
  brush.pushData.fill(0); brush.dirData.fill(0);
  const v = brush.view;
  if (v && !S.path) {
    // Just ahead of the lens and below it: plants part around the walker instead of passing through the lens.
    const f = [v.fwd[0], 0, v.fwd[2]], l = Math.hypot(f[0], f[2]) || 1;
    brush.pushData.set([v.eye[0] + f[0] / l * .5, v.eye[1] - .35, v.eye[2] + f[2] / l * .5, -1], 0);
    brush.dirData.set([0, 0, 0, .85 * brush.pushOn || 1e-6], 0);
  }
  brush.trail.forEach((g, j) => {
    brush.pushData.set([g.anchor[0], g.anchor[1], g.anchor[2], g.radius], (j + 1) * 4);
    brush.dirData.set([g.disp[0] * brush.pushOn, g.disp[1] * brush.pushOn, g.disp[2] * brush.pushOn, 1], (j + 1) * 4);
  });
  for (const sp of brush.sparks) { sp.life += dt; for (let k = 0; k < 3; k++) sp.p[k] += sp.v[k] * dt; sp.v[0] *= .98; sp.v[2] *= .98; }
  brush.sparks = brush.sparks.filter(sp => sp.life < sp.span);
}
function setPush(prog) {
  gl.uniform4fv(prog.u['uPush[0]'], brush.pushData); gl.uniform4fv(prog.u['uPushDir[0]'], brush.dirData);
}
function drawSparks(cam, vp, h) {
  const list = brush.glows.length ? brush.sparks.concat(brush.glows) : brush.sparks;
  if (!list.length) return;
  const d = brush.sparkData;
  list.forEach((sp, i) => {
    const fade = sp.glow ?? Math.sin(Math.PI * sp.life / sp.span);
    d.set([sp.p[0], sp.p[1], sp.p[2], sp.size, sp.c[0], sp.c[1], sp.c[2], fade], i * 8);
  });
  // Bokeh is light at the lens, so it draws over everything.
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
  gl.useProgram(P.spark.p); const u = P.spark.u;
  gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform3fv(u.uCam, cam.eye); gl.uniform1f(u.uFocus, value('focus'));
  gl.uniform1f(u.uAperture, value('aperture')); gl.uniform1f(u.uPx, h); gl.uniform1f(u.uMaxPt, maxPoint); gl.uniform1f(u.uHdr, HDR);
  gl.bindVertexArray(brush.sparkVao); gl.bindBuffer(gl.ARRAY_BUFFER, brush.sparkBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, list.length * 8), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, list.length);
  gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
}

// The hand: Xyh's own photographs, relaxed by default and open while pressed.
// `at` is the point in each image that sits on the pointer.
const HANDS = {
  rest: {src: DATA + 'hands/handcursor.png', at: [.33, .3]},
  press: {src: DATA + 'hands/handopen.png', at: [.55, .28]},
};
// Bitmaps for compositing reel frames: Image.decode() waits for the page to paint.
const handsReady = Promise.all(Object.values(HANDS).map(async hand => {
  hand.image = await createImageBitmap(await (await fetch(hand.src)).blob());
}));
const HAND_HEIGHT = .55;   // of the frame height

// ---------- frame ----------
let time = 0, travel = 0, last = 0, frame = 0, frames = 0;
const value = id => +S[id];

function camera() {
  const hand = value('sway');   // handheld drift, independent of the walk
  const drift = value('drift') * Math.PI / 180, dir = [-Math.sin(drift), -Math.cos(drift)], right = [-dir[1], dir[0]];
  const lat = .45 * Math.sin(travel * .09) + hand * .04 * Math.sin(time * .6) + S.lateral;
  // Stride: one step per 1.4 m, felt fully at running pace (3 m/s) and not at all when still.
  const pace = Math.min(1, value('speed') / 3), step = travel / 1.4 * Math.PI;
  const bob = pace * S.bob * (.05 * Math.abs(Math.sin(step)) - .025);
  const eye = [travel * dir[0] + (lat + pace * .02 * Math.sin(step / 2)) * right[0], value('height') + bob + hand * .025 * Math.sin(time * 1.3),
    travel * dir[1] + (lat + pace * .02 * Math.sin(step / 2)) * right[1]];
  const yaw = .14 * Math.sin(travel * .05 + 1) + hand * .02 * Math.sin(time * .45) + S.yaw;
  const fwd = norm([Math.sin(yaw), Math.tan(value('tilt') * Math.PI / 180) + hand * .03 * Math.sin(time * .37) + pace * S.bob * .012 * Math.cos(step * 2), -Math.cos(yaw)]);
  return {eye, fwd, dir, lat};
}

function common(prog, cam) {
  const u = prog.u, flash = linear(S.flash).map(c => c * value('power'));
  gl.uniform3fv(u.uCam, cam.eye); gl.uniform3fv(u.uFwd, cam.fwd);
  if (u.uDir) { gl.uniform2fv(u.uDir, cam.dir); gl.uniform1f(u.uTravel, travel); }
  if (u.uLat) gl.uniform1f(u.uLat, cam.lat);
  if (u.uFlash) gl.uniform3fv(u.uFlash, flash);
  if (u.uSkyH) gl.uniform3fv(u.uSkyH, linear(S.skyHorizon));
  if (u.uHue) gl.uniform1f(u.uHue, value('hue') * Math.PI / 180);
  if (u.uSat) gl.uniform1f(u.uSat, value('sat'));
  if (u.uHdr) gl.uniform1f(u.uHdr, HDR);
  if (u.uCone) gl.uniform1f(u.uCone, 2.5);
  if (u.uHaze) gl.uniform1f(u.uHaze, value('haze'));
  if (u.uAmbient) gl.uniform1f(u.uAmbient, value('ambient'));
  if (u.uBulbPos) { gl.uniform3fv(u.uBulbPos, S.bulbPos); gl.uniform3fv(u.uBulbCol, S.bulbColour); }
  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);
  if (u.uFestivalCount) { gl.uniform1i(u.uFestivalCount, festivalLightCount);
    gl.uniform3fv(u['uFestivalPos[0]'], festivalLightPositions); gl.uniform3fv(u['uFestivalCol[0]'], festivalLightColours); }
  if (u.uSide) gl.uniform1f(u.uSide, laneSide());
  if (u.uAmbCol) gl.uniform3fv(u.uAmbCol, linear(S.ambientColour || S.skyHorizon));
  if (u.uFlashFar) { gl.uniform3fv(u.uFlashFar, linear(S.flashFar || S.flash).map(c => c * value('power'))); gl.uniform2fv(u.uFarRange, S.farRange); }
  if (u.uHazeLift) gl.uniform1f(u.uHazeLift, value('hazeLift'));
  if (u.uBackwards) gl.uniform1f(u.uBackwards, S.backwards ? 1 : 0);
  if (u.uClear) gl.uniform3fv(u.uClear, S.clearing);
}

function render() {
  const scale = value('scale'), ratio = Math.min(1.5, devicePixelRatio || 1) * scale;
  const w = fixedSize ? fixedSize[0] : Math.max(2, Math.round(canvas.clientWidth * ratio));
  const h = fixedSize ? fixedSize[1] : Math.max(2, Math.round(canvas.clientHeight * ratio));
  if (canvas.width !== w || canvas.height !== h || !targets) { canvas.width = w; canvas.height = h; makeTargets(w, h); }
  const aspect = w / h, cam = camera(), fovy = Math.min(100, value('fov') * (aspect < 1 ? 1 + (1 - aspect) * .7 : 1)) * Math.PI / 180;
  const view = viewMatrix(cam.eye, cam.fwd), vp = multiply(perspective(fovy, aspect, .03, 220), view.m);
  brush.view = {eye: cam.eye, fwd: cam.fwd, dir: cam.dir, r: view.r, u: view.u, tanX: Math.tan(fovy / 2) * aspect, tanY: Math.tan(fovy / 2)};

  prepareFestival(cam);
  gl.bindFramebuffer(gl.FRAMEBUFFER, targets.ms); gl.viewport(0, 0, w, h);
  gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
  // Sky first, behind everything.
  gl.useProgram(P.sky.p); common(P.sky, cam);
  gl.uniform3fv(P.sky.u.uRight, view.r); gl.uniform3fv(P.sky.u.uUp, view.u);
  gl.uniform2f(P.sky.u.uTan, Math.tan(fovy / 2) * aspect, Math.tan(fovy / 2));
  gl.uniform3fv(P.sky.u.uSkyT, linear(S.skyTop));
  gl.uniform1f(P.sky.u.uRidge, value('ridge')); gl.uniform1f(P.sky.u.uMoon, S.moon ? 1 : 0);
  gl.uniform1f(P.sky.u.uTrees, value('trees')); gl.uniform1f(P.sky.u.uLights, value('lights'));
  gl.uniform1f(P.sky.u.uPixel, 2 * Math.tan(fovy / 2) / h); gl.uniform1f(P.sky.u.uTime, time);
  gl.uniform3fv(P.sky.u.uMoonColour, linear(S.moonColour)); gl.uniform1f(P.sky.u.uMoonSize, value('moonSize'));
  gl.uniform1f(P.sky.u.uVolcano, value('volcano')); gl.uniform1f(P.sky.u.uVolcanoAz, value('volcanoAz')); gl.uniform1f(P.sky.u.uVolcanoGlow, value('volcanoGlow'));
  gl.uniform1f(P.sky.u.uClouds, value('clouds')); gl.uniform1f(P.sky.u.uCloudSun, value('cloudSun')); gl.uniform1f(P.sky.u.uPeak, value('peak')); gl.uniform1f(P.sky.u.uStars, value('stars')); gl.uniform3fv(P.sky.u.uCloudColour, linear(S.cloudColour));
  gl.uniform1f(P.sky.u.uCloudLight, value('cloudLight')); gl.uniform1f(P.sky.u.uCloudHue, value('cloudHue')); gl.uniform1f(P.sky.u.uCloudDrift, value('cloudDrift'));
  gl.bindVertexArray(emptyVAO); gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(P.ground.p); common(P.ground, cam); gl.uniformMatrix4fv(P.ground.u.uVP, false, vp);
  gl.uniform3fv(P.ground.u.uSkyT, linear(S.skyTop)); gl.uniform3fv(P.ground.u.uMoonColour, linear(S.moonColour));
  gl.uniform1f(P.ground.u.uMoon, S.moon ? 1 : 0); gl.uniform1f(P.ground.u.uGround, value('ground'));
  gl.uniform1f(P.ground.u.uPath, S.path ? 1 : 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.useProgram(P.grass.p); common(P.grass, cam); gl.uniformMatrix4fv(P.grass.u.uVP, false, vp);
  gl.uniform1f(P.grass.u.uTime, time); gl.uniform1f(P.grass.u.uWind, value('wind')); gl.uniform1f(P.grass.u.uLen, GRASS_LENGTH); setPush(P.grass);
  gl.uniform1f(P.grass.u.uBack, S.backwards ? GRASS_LENGTH - 1 : 1);
  gl.uniform1f(P.grass.u.uPath, S.path ? 1 : 0);
  gl.bindVertexArray(grass.vao); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (grass.segments + 1) * 2, grass.count);
  if (S.poles) drawPoles(cam, vp);
  drawPalms(cam, vp);
  drawShide(cam, vp);
  drawFestival(cam, vp);

  // Cards: alpha-to-coverage keeps soft edges without sorting hundreds of cards.
  gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  gl.useProgram(P.card.p); common(P.card, cam);
  gl.uniformMatrix4fv(P.card.u.uVP, false, vp);
  gl.uniform1f(P.card.u.uFocus, value('focus')); gl.uniform1f(P.card.u.uAperture, value('aperture'));
  gl.uniform1i(P.card.u.uTex, 0); gl.uniform1i(P.card.u.uBones, 1); setPush(P.card);
  gl.uniform3fv(P.card.u['uGel[0]'], tints(S.gels)); gl.uniform1f(P.card.u.uGelAmt, value('gel'));
  const wind = value('wind');
  let detailed = 0, vertices = 0;
  const t0 = performance.now();
  for (const s of species) if (s.instanceCount) poseSpecies(s, time, wind);
  const t1 = performance.now();
  uploadBones();
  const t2 = performance.now();
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bones.tex); gl.activeTexture(gl.TEXTURE0);
  for (const s of species) {
    if (!s.instanceCount) continue;
    detailed += sortByDistance(s, cam.lat);
    gl.bindTexture(gl.TEXTURE_2D, s.tex);
    gl.uniform2f(P.card.u.uSize, s.w, s.h); gl.uniform1i(P.card.u.uBase, s.base); gl.uniform1i(P.card.u.uCount, s.n);
    for (const m of s.full === s.lod ? [s.full] : [s.full, s.lod]) {
      if (!m.count) continue;
      vertices += m.vertexCount * m.count;
      gl.bindVertexArray(m.vao); gl.drawElementsInstanced(gl.TRIANGLES, m.indexCount, gl.UNSIGNED_INT, 0, m.count);
    }
  }
  const poseMs = t1 - t0, uploadMs = t2 - t1, sortMs = performance.now() - t2;
  canvas.dataset.detailed = detailed; canvas.dataset.cardVertices = vertices;
  canvas.dataset.cpu = `pose ${poseMs.toFixed(1)} ms, upload ${uploadMs.toFixed(1)} ms, draw calls ${sortMs.toFixed(1)} ms`;
  gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

  const count = Math.round(value('pollen') * pollen.max);
  if (count) {
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
    gl.useProgram(P.pollen.p); common(P.pollen, cam); const u = P.pollen.u;
    gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uLen, pollen.length); gl.uniform1f(u.uFocus, value('focus'));
    gl.uniform1f(u.uAperture, value('aperture')); gl.uniform1f(u.uPx, h); gl.uniform1f(u.uTime, time); gl.uniform1f(u.uMaxPt, maxPoint);
    gl.uniform1f(u.uBack, S.backwards ? pollen.length - .2 : .2); gl.uniform1f(u.uTint, value('pollenTint'));
    gl.uniform3fv(u['uBokeh[0]'], bokehTints());
    gl.bindVertexArray(pollen.vao); gl.drawArraysInstanced(gl.POINTS, 0, 1, count);
    gl.disable(gl.BLEND); gl.depthMask(true);
  }
  drawSparks(cam, vp, h);
  gl.disable(gl.DEPTH_TEST);

  // Resolve, glow, and grade.
  const t = targets;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, t.ms); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, t.scene.f);
  gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, t.scene.f); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, t.halfA.f);
  gl.blitFramebuffer(0, 0, w, h, 0, 0, t.halfA.w, t.halfA.h, gl.COLOR_BUFFER_BIT, gl.LINEAR);
  gl.useProgram(P.blur.p); gl.bindVertexArray(emptyVAO); gl.uniform1i(P.blur.u.uSrc, 0); gl.activeTexture(gl.TEXTURE0);
  for (let pass = 0; pass < 2; pass++) for (const [src, dst, dx, dy] of [[t.halfA, t.halfB, 1, 0], [t.halfB, t.halfA, 0, 1]]) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.viewport(0, 0, dst.w, dst.h);
    gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform2f(P.blur.u.uStep, dx * (1 + pass) / src.w, dy * (1 + pass) / src.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h);
  gl.useProgram(P.final.p); const u = P.final.u;
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t.scene.t); gl.uniform1i(u.uScene, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, t.halfA.t); gl.uniform1i(u.uBloom, 1);
  gl.uniform1f(u.uExposure, value('exposure')); gl.uniform1f(u.uBloomAmt, value('bloom')); gl.uniform1f(u.uGrain, value('grain'));
  gl.uniform1f(u.uTime, time); gl.uniform1f(u.uHdr, HDR); gl.uniform2f(u.uRes, w, h);
  gl.uniform3fv(u.uLift, S.lift);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.activeTexture(gl.TEXTURE0);
  frames++; canvas.dataset.frames = frames; canvas.dataset.camera = cam.eye.map(c => c.toFixed(3)).join(',');
}

function advance(dt) { time += dt; if (S.walking) travel += value('speed') * dt; updateBrush(dt);
  // A piece's error is logged once, not allowed to stop the scene.
  if (hooks.update) try { hooks.update(dt); } catch (error) { if (!advance.failed) console.error(error); advance.failed = true; }
}
// Below 40 fps the render scale steps down, and above 70 it steps back up.
let frameMs = 16, scaleAt = 0;
function loop(now) {
  frame = 0;
  if (document.hidden) return;
  if (last) {
    frameMs += ((now - last) - frameMs) * .05;
    if (now - scaleAt > 1000) {
      scaleAt = now;
      if (frameMs > 25 && S.scale > .5) S.scale = Math.max(.5, S.scale - .1);
      else if (frameMs < 14 && S.scale < 1) S.scale = Math.min(1, S.scale + .05);
    }
  }
  advance(last ? Math.min(.05, (now - last) / 1000) : 0);
  last = now;
  render();
  frame = requestAnimationFrame(loop);
}
function start() { cancelAnimationFrame(frame); last = 0; if (!document.hidden) frame = requestAnimationFrame(loop); }
let fixedSize = null;
window.sceneStep = (seconds = 0) => { advance(seconds); render(); return {camera: canvas.dataset.camera, cards: +canvas.dataset.cards, frames}; };

document.addEventListener('visibilitychange', start);
// Live brushing with the pointer, shown as the hand.
const handEl = Object.assign(document.createElement('img'), {id: 'hand', alt: ''});
document.body.append(handEl);
const heldEl = Object.assign(document.createElement('img'), {id: 'held', alt: ''});
document.body.append(heldEl);
function placeHand() {
  const r = canvas.getBoundingClientRect(), hand = brush.cursor || (brush.down ? HANDS.press : HANDS.rest);
  const hh = r.height * (brush.cursor ? brush.cursor.height : HAND_HEIGHT * S.handScale);
  const hw = handEl.naturalHeight ? hh * handEl.naturalWidth / handEl.naturalHeight : hh;
  if (handEl.getAttribute('src') !== hand.src) handEl.src = hand.src;
  if (brush.carry) {
    const sh = r.height * brush.carry.height, sw = heldEl.naturalHeight ? sh * heldEl.naturalWidth / heldEl.naturalHeight : sh;
    if (heldEl.getAttribute('src') !== brush.carry.src) heldEl.src = brush.carry.src;
    Object.assign(heldEl.style, {display: brush.shown ? 'block' : 'none', height: sh + 'px', left: r.left + brush.x * r.width - sw * .5 + 'px', top: r.top + brush.y * r.height - sh * .65 + 'px'});
  } else heldEl.style.display = 'none';
  Object.assign(handEl.style, {height: hh + 'px', left: r.left + brush.x * r.width - hand.at[0] * hw + 'px', top: r.top + brush.y * r.height - hand.at[1] * hh + 'px', display: brush.shown && S.handCursor ? 'block' : 'none'});
  canvas.style.cursor = S.handCursor ? 'none' : 'crosshair';
}
function pointerAt(e) {
  const r = canvas.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) { brush.x = (e.clientX - r.left) / r.width; brush.y = (e.clientY - r.top) / r.height; }
}
canvas.addEventListener('pointermove', e => { pointerAt(e); brush.shown = true; placeHand(); if (hooks.move) hooks.move(brush.x, brush.y, brush.pressed); });
canvas.addEventListener('pointerleave', () => { brush.shown = false; brush.down = false; placeHand(); });
canvas.addEventListener('pointerdown', e => {
  pointerAt(e); canvas.setPointerCapture(e.pointerId); brush.shown = true; brush.pressed = true;
  const take = hooks.down ? hooks.down(brush.x, brush.y) !== false : true; brush.down = S.grab && take; placeHand();
  if (brush.audio) brush.audio.resume();
});
for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { brush.down = false; brush.pressed = false; placeHand(); if (hooks.up) hooks.up(brush.x, brush.y); });



// ---------- pieces ----------
// Hooks a piece fills in: pointer events, a per-frame update, and the moment a grab is let go.
export const hooks = {down: null, move: null, up: null, update: null, snap: null};
export const getTravel = () => travel, setTravel = v => { travel = v; }, getTime = () => time;
export {species, brush, rayPoint, playNote, poleBase, placePlants, seeded, linear};

// Cards a piece adds itself. A fixed card stays where it was put instead of
// recycling ahead of the camera; `u` is then distance along the route.
// A band this long never wraps within a visit, and stays small enough for float precision.
const FIXED_LENGTH = 2e4, FIXED_BACK = 5e3;
export function addCard(name, {v = 0, u = 0, y = 0, yaw = 0, height = 1, mirror = 1, flip = 1, lying = false, fixed = true, variant = 0} = {}) {
  const s = species.find(x => x.name === name);
  if (!s) throw new Error(`no species ${name}`);
  const data = [v, u, y, yaw, height / s.h, mirror, flip, variant, 1, fixed ? FIXED_LENGTH : NEAR_LENGTH, fixed ? FIXED_BACK : 1.2, lying ? 1 : 0];
  const card = {s, data};
  (s.extras ||= []).push(card); rebuildSpecies(s);
  return card;
}
export function removeCard(card) {
  const list = card.s.extras || [], i = list.indexOf(card);
  if (i >= 0) { list.splice(i, 1); rebuildSpecies(card.s); }
}
// Takes one of the scene's own cards out of its species and returns its 12 values.
export function detachCard(s, index) {
  const base = s.baseList.length / 12;
  if (index >= base) { const card = s.extras[index - base]; removeCard(card); return card.data; }
  const data = s.baseList.splice(index * 12, 12); rebuildSpecies(s);
  return data;
}
export function attachCard(name, data) {
  const s = species.find(x => x.name === name), card = {s, data: data.slice()};
  (s.extras ||= []).push(card); rebuildSpecies(s);
  return card;
}
function rebuildSpecies(s) {
  const all = s.baseList.concat(...(s.extras || []).map(c => c.data));
  s.placed = new Float32Array(all); s.instanceCount = all.length / 12;
  s.nearBuf = new Float32Array(s.placed.length); s.farBuf = new Float32Array(s.placed.length);
}

// The lit card under screen position (x, y), nearest first, judged against its
// rest shape and its texture's alpha. `slop` widens the hit by that many metres, for thin things.
// Returns the species, index, distance, and point.
export function pickCard(x, y, accept = () => true, slop = 0) {
  const v = brush.view;
  if (!v) return null;
  const nx = x * 2 - 1, ny = 1 - y * 2;
  const ray = norm(v.fwd.map((f, k) => f + nx * v.tanX * v.r[k] + ny * v.tanY * v.u[k]));
  const d2 = v.dir, r2 = [-d2[1], d2[0]];
  let best = null;
  for (const s of species) {
    if (!s.placed || !accept(s)) continue;
    const a = s.placed;
    for (let i = 0; i < a.length; i += 12) {
      if (a[i + 8] < .5) continue;
      const L = a[i + 9], back = a[i + 10], u = (((a[i + 1] - travel + back) % L) + L) % L - back;
      const bx = (travel + u) * d2[0] + a[i] * r2[0], bz = (travel + u) * d2[1] + a[i] * r2[1], by = a[i + 2];
      const c = Math.cos(a[i + 3]), sn = Math.sin(a[i + 3]), k = a[i + 4], mirror = a[i + 5], flip = a[i + 6];
      let t, lx, ly;
      if (a[i + 11] > .5) {
        if (Math.abs(ray[1]) < 1e-4) continue;
        t = (by - v.eye[1]) / ray[1]; if (t <= 0) continue;
        const px = v.eye[0] + ray[0] * t - bx, pz = v.eye[2] + ray[2] * t - bz;
        lx = px * c + pz * sn; ly = -px * sn + pz * c;
      } else {
        const denom = -ray[0] * sn + ray[2] * c;
        if (Math.abs(denom) < 1e-4) continue;
        t = (-(bx - v.eye[0]) * sn + (bz - v.eye[2]) * c) / denom; if (t <= 0) continue;
        const px = v.eye[0] + ray[0] * t - bx, py = v.eye[1] + ray[1] * t - by, pz = v.eye[2] + ray[2] * t - bz;
        lx = px * c + pz * sn; ly = py;
      }
      const tx = lx / (k * mirror) + s.w / 2, ty = s.h - ly / (k * flip), r = slop / k;
      let solid = false;
      for (let j = -1; j <= 1 && !solid; j++) for (let i2 = -1; i2 <= 1 && !solid; i2++) {
        const sx = tx + i2 * r, sy = ty + j * r;
        solid = sx >= 0 && sy >= 0 && sx < s.w && sy < s.h && s.alpha[(sy | 0) * s.w + (sx | 0)] >= 90;
      }
      if (!solid) continue;
      if (!best || t < best.t) best = {s, index: i / 12, t, point: [v.eye[0] + ray[0] * t, v.eye[1] + ray[1] * t, v.eye[2] + ray[2] * t]};
    }
  }
  return best;
}

// The hand can show another image in its place: a plant, or a held thing beside it.
export function setCursor(src = null, at = [.5, .5], height = .3) { brush.cursor = src ? {src, at, height} : null; placeHand(); }
export function setHeld(src = null, height = .12) { brush.carry = src ? {src, height} : null; placeHand(); }

export function setAudio(ctx, destination) {
  brush.audio = ctx; brush.synth = new BrushSynth(ctx, destination || ctx.destination);
  return brush.synth;
}
export const sparksAt = (count, spread = .12) => spawnSparks(count, spread, 0);

// `only`, when given, names the species to load, for a page that needs a few.
export async function init({sets = ['herbarium', 'fgc'], payphone = false, only = null} = {}) {
  const bases = {herbarium: DATA + 'herbarium/', fgc: DATA + 'fgc/', objects: DATA + 'objects/', handrigs: DATA + 'handrigs/'};
  const lists = await Promise.all(sets.map(async k => [k, (await (await fetch(bases[k] + 'index.json')).json()).filter(e => !only || only.includes(e.name))]));
  await Promise.all([payphone ? loadPayphone() : null, S.festival ? loadFestival() : null, ...lists.flatMap(([k, list]) => list.map(e => loadSpecies(bases[k], e, k)))]);
  species.sort((a, b) => a.name.localeCompare(b.name));
  packBones();
  placePlants();
  status('');
  start();
}
