"""Derive engine/scene.js for Five Ways Through from flashbrush/scene.js.

Flashbrush is the workshop: it reads its settings from a controls panel and
carries a reel renderer and a gesture recorder. The pieces need the same scene
with none of that, read from a settings object, plus a few hooks. This script
applies those changes as exact replacements and fails if any of them no longer
matches, so a change in Flashbrush cannot slip through unnoticed.

Usage:
  python make_engine.py            # paths default to this repository layout
  python make_engine.py --source F:/xyh/flashbrush/scene.js --out ../engine/scene.js
"""
import argparse
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SETTINGS = """// Every setting the scene reads. A piece changes these directly; looks set many at once.
export const S = {
  walking: true, speed: .22, drift: 30, sway: 1, height: .55, tilt: 7.4, fov: 56, lateral: 0, yaw: 0,
  focus: 2.2, aperture: .8, power: 6, flash: '#eef3ff', exposure: 1.3, bloom: .35, pollen: .7, lift: [0, .004, .02],
  density: 1, plantScale: 1, overhang: .14, wind: .35, fgc: true, path: true, ground: 1, palms: 0, poles: false,
  hue: 0, sat: .7, skyTop: '#06123f', skyHorizon: '#1d4fd6', ridge: .5, trees: .7, lights: .5, haze: .6,
  volcano: .8, volcanoAz: 22, volcanoGlow: .25, moon: true, moonColour: '#e8f0ff', moonSize: 1, moonDir: [-.06, .34, -1],
  clouds: .45, cloudColour: '#9fd8ff', cloudLight: .2, cloudHue: -20, cloudDrift: 1, grain: .06, scale: 1,
  ambient: 1, bulbPos: [0, -100, 0], bulbColour: [0, 0, 0],
  grab: true, notes: true, sparks: true, brushSound: true, bokehPalette: 'night', handCursor: true, handScale: .7,
  plantGroups: ['herbarium', 'fgc'], poleLateral: 3.2, payphoneEvery: 6, payphoneOffset: 0,
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
export function applyLook(look) { Object.assign(S, typeof look === 'string' ? LOOKS[look] : look); }
"""

SHIDE_JS = r"""
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
"""

INIT = r"""
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
  await Promise.all([payphone ? loadPayphone() : null, ...lists.flatMap(([k, list]) => list.map(e => loadSpecies(bases[k], e, k)))]);
  species.sort((a, b) => a.name.localeCompare(b.name));
  packBones();
  placePlants();
  status('');
  start();
}
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--source', default=os.path.join(HERE, '..', '..', '..', 'flashbrush', 'scene.js'))
    ap.add_argument('--out', default=os.path.join(HERE, '..', 'engine', 'scene.js'))
    args = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    s = io.open(args.source, encoding='utf-8').read()

    def rep(a, b, n=1):
        nonlocal s
        if s.count(a) != n:
            sys.exit(f'expected {n} of: {a[:90]!r}, found {s.count(a)}')
        s = s.replace(a, b)

    def cut(start, end, keep_end=True, insert=''):
        nonlocal s
        i = s.index(start); j = s.index(end, i)
        s = s[:i] + insert + (s[j:] if keep_end else s[j + len(end):])

    # Header, data paths, settings, looks.
    cut("// Flashbrush: a slow walk", "const VARIANTS = 4;", insert=
        "// Five Ways Through: the shared scene, derived from flashbrush/scene.js by\n"
        "// scripts/make_engine.py. Edit Flashbrush and rerun the script rather than this file.\n"
        "import {BrushSynth, stepFrequency} from './brush-audio.js';\n"
        "const DATA = new URL('../data/', import.meta.url).href;\n")
    cut("const PRESETS = {", "// ---------- small matrix kit", insert=SETTINGS + "\n")
    rep("const status = text => { $('status').textContent = text; };", "const status = text => { const el = $('status'); if (el) el.textContent = text; };")

    # Lighting extras: ambient strength, a bulb, a moon that can move.
    rep("uniform float uHue, uSat, uHdr, uCone, uHaze;", "uniform float uHue, uSat, uHdr, uCone, uHaze, uAmbient;\nuniform vec3 uBulbPos, uBulbCol, uMoonDir;")
    rep("  return albedo * (uFlash * cone / (d2 + .1) + uSkyH * .012);   // .1 keeps the nearest plants from going pure white",
        "  vec3 b = world - uBulbPos;\n"
        "  return albedo * (uFlash * cone / (d2 + .1) + uSkyH * .012 * uAmbient + uBulbCol / (dot(b, b) + .25));   // .1 keeps the nearest plants from going pure white")
    rep("normalize(vec3(-.06, .34, -1.))", "normalize(uMoonDir)", 2)
    rep("  if (u.uHaze) gl.uniform1f(u.uHaze, value('haze'));",
        "  if (u.uHaze) gl.uniform1f(u.uHaze, value('haze'));\n"
        "  if (u.uAmbient) gl.uniform1f(u.uAmbient, value('ambient'));\n"
        "  if (u.uBulbPos) { gl.uniform3fv(u.uBulbPos, S.bulbPos); gl.uniform3fv(u.uBulbCol, S.bulbColour); }\n"
        "  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);")

    # Textured solid meshes (the payphone).
    rep("layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNormal; layout(location=2) in float aRole;",
        "layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNormal; layout(location=2) in float aRole; layout(location=3) in vec2 aUV;")
    rep("out vec3 vW, vN; out float vRole;\nvoid main(){\n  vec3 p = aPos;", "out vec3 vW, vN; out float vRole; out vec2 vUV;\nvoid main(){\n  vec3 p = aPos; vUV = aUV;")
    rep("in vec3 vW, vN; in float vRole; uniform vec3 uAlbedo, uPalette[9]; uniform float uFlat; out vec4 o;",
        "in vec3 vW, vN; in float vRole; in vec2 vUV; uniform vec3 uAlbedo, uPalette[9]; uniform float uFlat, uTextured; uniform sampler2D uSolidTex; out vec4 o;")
    rep("  vec3 albedo = vRole < -.5 ? uAlbedo : uPalette[int(vRole + .5)];   // a role index picks a part colour",
        "  vec3 albedo = uTextured > .5 ? texture(uSolidTex, vUV).rgb : vRole < -.5 ? uAlbedo : uPalette[int(vRole + .5)];")
    rep("""function solidMesh(data, stride = 6) {
  const vao = gl.createVertexArray(), b = gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride * 4, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride * 4, 12);
  if (stride > 6) { gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride * 4, 24); }""",
        """function solidMesh(data, stride = 6, uv = false) {
  const vao = gl.createVertexArray(), b = gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride * 4, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride * 4, 12);
  if (uv) { gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 2, gl.FLOAT, false, stride * 4, 24); }
  if (stride > (uv ? 8 : 6)) { gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride * 4, uv ? 32 : 24); }""")
    rep("""async function loadPayphone() {
  const [meta, buffer] = await Promise.all([(await fetch('data/payphone.json')).json(), (await fetch('data/payphone.bin')).arrayBuffer()]);
  payphoneRoles = meta.roles || [];
  payphone = solidMesh(new Float32Array(buffer), meta.stride || 6);
}""", """let payphoneTex = null;
async function loadPayphone() {
  const [meta, buffer, image] = await Promise.all([(await fetch(DATA + 'payphone.json')).json(), (await fetch(DATA + 'payphone.bin')).arrayBuffer(),
    (async () => createImageBitmap(await (await fetch(DATA + 'payphone.webp')).blob()))()]);
  payphoneRoles = meta.roles || [];
  payphone = solidMesh(new Float32Array(buffer), meta.stride || 6, !!meta.uv);
  payphoneTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, payphoneTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}""")
    rep("    const hex = PAYPHONE_PARTS[role] || $('payphoneColour').value;", "    const hex = PAYPHONE_PARTS[role] || '#1d5aa6';")
    rep("    if (payphone && wrapIndex(k, PAYPHONE_EVERY) === 0) {", "    if (payphone && wrapIndex(k - S.payphoneOffset, S.payphoneEvery) === 0) {")
    rep("      gl.bindVertexArray(payphone.vao); gl.drawArrays(gl.TRIANGLES, 0, payphone.count);",
        "      if (payphoneTex) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, payphoneTex); gl.uniform1i(u.uSolidTex, 2); gl.uniform1f(u.uTextured, 1); gl.activeTexture(gl.TEXTURE0); }\n"
        "      gl.bindVertexArray(payphone.vao); gl.drawArrays(gl.TRIANGLES, 0, payphone.count);\n"
        "      gl.uniform1f(u.uTextured, 0);")
    rep("  const at = k => { const along = POLE.offset + k * POLE.spacing; return [along * d[0] + POLE.lateral * r[0], along * d[1] + POLE.lateral * r[1]]; };",
        "  const at = k => poleBase(k, d);")
    rep("function drawPoles(cam, vp) {", """// Ground position of pole k, and its distance along the route.
function poleBase(k, d = brush.view ? brush.view.dir : [0, -1]) {
  const r = [-d[1], d[0]], along = POLE.offset + k * POLE.spacing;
  return [along * d[0] + S.poleLateral * r[0], along * d[1] + S.poleLateral * r[1], along];
}
function drawPoles(cam, vp) {""")

    # Control reads become settings reads.
    rep("const value = id => +$(id).value;", "const value = id => +S[id];")
    s = s.replace("PRESETS[$('preset').value].lift", "S.lift")
    s = re.sub(r"\$\('([A-Za-z]+)'\)\.(checked|value)", lambda m: f"S.{m.group(1)}", s)

    # Plants: groups, rigid objects, alpha for picking, extras survive re-placing.
    rep("  const pool = species.filter(s => s.group === 'herbarium' || S.fgc);",
        "  const pool = species.filter(s => S.plantGroups.includes(s.group) && (s.group !== 'fgc' || S.fgc));")
    rep("""  for (const [s, list] of lists) {
    s.placed = new Float32Array(list); s.instanceCount = list.length / 12; cards += s.instanceCount;
    s.nearBuf = new Float32Array(s.placed.length); s.farBuf = new Float32Array(s.placed.length);
  }""", """  for (const [s, list] of lists) { s.baseList = list; rebuildSpecies(s); cards += s.instanceCount; }""")
    rep("  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s.w, s.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, premultiplied(image));",
        "  const pixels = premultiplied(image);\n"
        "  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s.w, s.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);\n"
        "  s.alpha = new Uint8Array(s.w * s.h); for (let i = 0; i < s.alpha.length; i++) s.alpha[i] = pixels[i * 4 + 3];")
    rep("    s.gain[i] = s.len[i] / s.h * s.flex[i] * .3;", "    s.gain[i] = group === 'objects' ? 0 : s.len[i] / s.h * s.flex[i] * .3;   // objects do not sway")

    # Brushing: grab and notes are optional, sparks have their own entry point, a snap hook.
    rep("  if (brush.down && point) {", "  if (brush.down && point && S.grab) {")
    rep("""    brush.sinceNote += dt;
    if (brush.sinceNote >= EIGHTH - 1e-6) {""", """    brush.sinceNote += dt;
    if (S.notes && brush.sinceNote >= EIGHTH - 1e-6) {""")
    rep("""    const spawn = Math.round((40 + speed * 30) * dt + brush.random() * .99);
    for (let i = 0; i < spawn && brush.sparks.length < SPARK_MAX; i++) {""", """    if (S.sparks) spawnSparks(Math.round((40 + speed * 30) * dt + brush.random() * .99), .12, speed);
    brush.prev = point;
  }
  updateRelease(dt);
}
function spawnSparks(spawn, spread, speed) {
  {
    for (let i = 0; i < spawn && brush.sparks.length < SPARK_MAX; i++) {""")
    rep("""      const p = rayPoint(brush.x + (brush.random() - .5) * .12, brush.y + (brush.random() - .5) * .12, .35 + brush.random() * 1.3);""",
        """      const p = rayPoint(brush.x + (brush.random() - .5) * spread, brush.y + (brush.random() - .5) * spread, .35 + brush.random() * 1.3);
      if (!p) return;""")
    rep("""    brush.prev = point;
  }
  if (brush.wasDown && !brush.down) {""", """  }
}
function updateRelease(dt) {
  if (brush.wasDown && !brush.down) {""")
    rep("    if (pull > .05) playSnap(brush.x * 2 - 1, Math.min(1, .4 + pull / GRAB_REACH));",
        "    if (pull > .05) { if (S.notes) playSnap(brush.x * 2 - 1, Math.min(1, .4 + pull / GRAB_REACH)); if (hooks.snap) hooks.snap(pull); }")
    rep("  else if (brush.synth && S.brushSound) brush.synth.snap(", "  else if (brush.synth) brush.synth.snap(")
    rep("  else if (brush.synth && S.brushSound) brush.synth.note(", "  else if (brush.synth) brush.synth.note(")
    rep("  brush.view = {eye: cam.eye, fwd: cam.fwd, r: view.r, u: view.u, tanX: Math.tan(fovy / 2) * aspect, tanY: Math.tan(fovy / 2)};",
        "  brush.view = {eye: cam.eye, fwd: cam.fwd, dir: cam.dir, r: view.r, u: view.u, tanX: Math.tan(fovy / 2) * aspect, tanY: Math.tan(fovy / 2)};")

    # Lights that stay: glows drawn with the bokeh, at a fixed brightness.
    rep("""function drawSparks(cam, vp, h) {
  if (!brush.sparks.length) return;""",
        """function drawSparks(cam, vp, h) {
  const list = brush.glows.length ? brush.sparks.concat(brush.glows) : brush.sparks;
  if (!list.length) return;""")
    rep("""  brush.sparks.forEach((sp, i) => {
    const fade = Math.sin(Math.PI * sp.life / sp.span);""",
        """  list.forEach((sp, i) => {
    const fade = sp.glow ?? Math.sin(Math.PI * sp.life / sp.span);""")
    rep("""gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, brush.sparks.length * 8), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, brush.sparks.length);""",
        """gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, list.length * 8), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, list.length);""")
    rep("sparkData: new Float32Array(SPARK_MAX * 8)", "sparkData: new Float32Array((SPARK_MAX + 16) * 8), glows: []")
    rep("const n = data.nodes.length, s = {name: entry.name, group, w: data.width, h: data.height, n};",
        "const n = data.nodes.length, s = {name: entry.name, group, src: base + data.texture, w: data.width, h: data.height, n};")

    # A clearing: cards and grass thin out within a radius of one ground point.
    rep("uniform sampler2D uBones; uniform int uBase, uCount; uniform vec2 uSize; uniform mat4 uVP; uniform vec3 uCam;",
        "uniform sampler2D uBones; uniform int uBase, uCount; uniform vec2 uSize; uniform mat4 uVP; uniform vec3 uCam, uClear;")
    rep("  vW += pushOffset(vW, lift);\n  gl_Position = uVP * vec4(vW, 1.);",
        "  if (uClear.z > 0. && iC.x > .5) vFade *= smoothstep(uClear.z * .7, uClear.z, distance(vW.xz, uClear.xy));\n"
        "  vW += pushOffset(vW, lift);\n  gl_Position = uVP * vec4(vW, 1.);")
    rep("uniform mat4 uVP; uniform vec3 uCam; uniform float uTime, uWind, uLen, uLat, uPath;",
        "uniform mat4 uVP; uniform vec3 uCam, uClear; uniform float uTime, uWind, uLen, uLat, uPath;")
    rep("  vW = travelPoint(wrapAhead(iA.y, uLen, 1.), iA.x) + p;",
        "  vW = travelPoint(wrapAhead(iA.y, uLen, 1.), iA.x) + p;\n"
        "  if (uClear.z > 0.) vW.y *= mix(.3, 1., smoothstep(uClear.z * .5, uClear.z, distance(vW.xz, uClear.xy)));")
    rep("  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);",
        "  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);\n  if (u.uClear) gl.uniform3fv(u.uClear, S.clearing);")
    rep("plantGroups: ['herbarium', 'fgc'], poleLateral", "clearing: [0, 0, 0], plantGroups: ['herbarium', 'fgc'], poleLateral")

    # A portrait screen widens the vertical view, so a phone sees about what a laptop does across.
    rep("  const cam = camera(), fovy = value('fov') * Math.PI / 180, aspect = w / h;",
        "  const aspect = w / h, cam = camera(), fovy = Math.min(100, value('fov') * (aspect < 1 ? 1 + (1 - aspect) * .7 : 1)) * Math.PI / 180;")

    # Facing. The brush is laid out in a frame where the camera looks to the right of
    # its line of travel (drift > 0). Facing left of travel mirrors it about the
    # path's centre (v = .35); facing along the line (drift near 0 or 180) mirrors a
    # random half, so the brush is even on both sides.
    rep("float wrapAhead(float u0, float len, float back){ return mod(u0 - uTravel + back, len) - back; }`;",
        "float wrapAhead(float u0, float len, float back){ return mod(u0 - uTravel + back, len) - back; }\n"
        "uniform float uSide, uBackwards, uBack;\n"
        "float lane(float x, float seed){ return uSide > .5 ? x : uSide < -.5 ? .7 - x : (fract(seed * 3.7) < .5 ? x : .7 - x); }`;")
    rep("  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);",
        "  if (u.uMoonDir) gl.uniform3fv(u.uMoonDir, S.moonDir);\n"
        "  if (u.uSide) gl.uniform1f(u.uSide, laneSide());\n"
        "  if (u.uBackwards) gl.uniform1f(u.uBackwards, S.backwards ? 1 : 0);")
    rep("function placePlants() {\n  const rnd = seeded(20261014), density = +S.density, overhang = +S.overhang;",
        "// +1 when the camera looks right of travel, -1 left, 0 along it.\n"
        "function laneSide() { const sn = Math.sin(S.drift * Math.PI / 180); return Math.abs(sn) < .2 ? 0 : Math.sign(sn); }\n"
        "function placePlants() {\n  const rnd = seeded(20261014), density = +S.density, overhang = +S.overhang, side = laneSide();\n"
        "  const lane = x => side > 0 ? x : side < 0 ? .7 - x : (rnd() < .5 ? x : .7 - x);\n"
        "  // Walking backwards, the bands lie behind the line of travel, where the camera looks.\n"
        "  const nearBack = S.backwards ? NEAR_LENGTH - 1.2 : 1.2, farBack = S.backwards ? FAR_LENGTH + 18 : -18;")
    rep("    lists.get(s).push(x, rnd() * NEAR_LENGTH, hang ? y : -.04 * h,", "    lists.get(s).push(lane(x), rnd() * NEAR_LENGTH, hang ? y : -.04 * h,")
    rep("      lists.get(s).push(-1.6 + rnd() * 3.6, rnd() * NEAR_LENGTH,", "      lists.get(s).push(lane(-1.6 + rnd() * 3.6), rnd() * NEAR_LENGTH,")
    rep("    lists.get(s).push(-3 + rnd() * 9, rnd() * NEAR_LENGTH,", "    lists.get(s).push(lane(-3 + rnd() * 9), rnd() * NEAR_LENGTH,")
    rep("1, NEAR_LENGTH, 1.2, ", "1, NEAR_LENGTH, nearBack, ", 3)
    rep("0, FAR_LENGTH, -18, 0);", "0, FAR_LENGTH, farBack, 0);")
    rep("float u = wrapAhead(iA.y, iC.y, iC.z), ahead = (u + iC.z) / iC.y;",
        "float u = wrapAhead(iA.y, iC.y, iC.z), ahead = (u + iC.z) / iC.y;\n  if (uBackwards > .5) ahead = 1. - ahead;   // the band's far edge is then behind the line of travel")
    rep("smoothstep(.15, .7, abs(iA.x - uLat))", "smoothstep(.15, .7, abs(lane(iA.x, iB.w) - uLat))")
    rep("travelPoint(wrapAhead(iA.y, uLen, 1.), iA.x)", "travelPoint(wrapAhead(iA.y, uLen, uBack), lane(iA.x, iB.w))")
    rep("gl.uniform1f(P.grass.u.uLen, GRASS_LENGTH); setPush(P.grass);",
        "gl.uniform1f(P.grass.u.uLen, GRASS_LENGTH); setPush(P.grass);\n  gl.uniform1f(P.grass.u.uBack, S.backwards ? GRASS_LENGTH - 1 : 1);")
    rep("travelPoint(wrapAhead(iP.z, uLen, .2), iP.x)", "travelPoint(wrapAhead(iP.z, uLen, uBack), lane(iP.x, iP.w))")
    rep("uniform mat4 uVP; uniform vec3 uCam, uFwd, uFlash; uniform float uLen, uFocus, uAperture, uPx, uTime, uMaxPt, uCone, uHdr;",
        "uniform mat4 uVP; uniform vec3 uCam, uFwd, uFlash, uBokeh[4]; uniform float uLen, uFocus, uAperture, uPx, uTime, uMaxPt, uCone, uHdr, uTint;")
    rep("  vC = uFlash * cone / (d * d + .02) * (.3 + iP.w) * 6. / max(4., size) * uHdr * smoothstep(.15, .45, d);",
        "  vC = uFlash * cone / (d * d + .02) * (.3 + iP.w) * 6. / max(4., size) * uHdr * smoothstep(.15, .45, d);\n"
        "  vC *= mix(vec3(1.), uBokeh[int(fract(iP.w * 9.13) * 3.999)], uTint);   // dust takes the piece's bokeh colours")
    rep("gl.uniform1f(u.uTime, time); gl.uniform1f(u.uMaxPt, maxPoint);\n    gl.bindVertexArray(pollen.vao);",
        "gl.uniform1f(u.uTime, time); gl.uniform1f(u.uMaxPt, maxPoint);\n"
        "    gl.uniform1f(u.uBack, S.backwards ? pollen.length - .2 : .2); gl.uniform1f(u.uTint, value('pollenTint'));\n"
        "    gl.uniform3fv(u['uBokeh[0]'], bokehTints());\n"
        "    gl.bindVertexArray(pollen.vao);")
    rep("const POLE = {spacing: 28, offset: 12, lateral: 3.2, behind: 30, ahead: 170};",
        "const POLE = {spacing: 28, offset: 12, lateral: 3.2, behind: 30, ahead: 170};\n"
        "const poleSpan = () => S.backwards ? [POLE.ahead, POLE.behind] : [POLE.behind, POLE.ahead];")
    rep("  const first = Math.floor((travel - POLE.behind - POLE.offset) / POLE.spacing);\n  const last = Math.ceil((travel + POLE.ahead - POLE.offset) / POLE.spacing);",
        "  const [behind, ahead] = poleSpan();\n  const first = Math.floor((travel - behind - POLE.offset) / POLE.spacing);\n  const last = Math.ceil((travel + ahead - POLE.offset) / POLE.spacing);")
    rep("  const bob = pace * (.05 * Math.abs(Math.sin(step)) - .025);", "  const bob = pace * S.bob * (.05 * Math.abs(Math.sin(step)) - .025);")
    rep("pace * .012 * Math.cos(step * 2)", "pace * S.bob * .012 * Math.cos(step * 2)")
    rep("ambient: 1, bulbPos:", "ambient: 1, bob: 1, backwards: false, pollenTint: .8, bulbPos:")

    # A bokeh palette for each piece; dust is tinted from the same colours.
    rep("  spectrum: ['#ff4fd8', '#43e0ff', '#ffd04a', '#9b7bff', '#ff6a4a', '#7dffb0'],\n};",
        "  spectrum: ['#ff4fd8', '#43e0ff', '#ffd04a', '#9b7bff', '#ff6a4a', '#7dffb0'],\n"
        "  running: ['#3fe6ff', '#6f8dff', '#e6f6ff', '#2fb8ff'],        // cold electric blue and white\n"
        "  exchange: ['#ff5fa8', '#f4b48c', '#ffd0dc', '#b46cff'],       // magenta, skin, pale pink, violet\n"
        "  hours: ['#4f86ff', '#f29a6a', '#d0609a', '#ffb347'],          // the four hours' horizons\n"
        "  toward: ['#ffc98a', '#ff9b45', '#ff6a3d', '#fff0c8'],         // the bulb, ember to cream\n"
        "  forgetting: ['#dfe8ff', '#c3cde6', '#e3d6ef', '#cfe8e2'],     // faded pastels, close to white\n"
        "};")
    rep("for (const key in SPARK_PALETTES) SPARK_PALETTES[key] = SPARK_PALETTES[key].map(linear);",
        "for (const key in SPARK_PALETTES) SPARK_PALETTES[key] = SPARK_PALETTES[key].map(linear);\n"
        "// The palette's first four colours, each scaled so its brightest channel is 1.\n"
        "function bokehTints() {\n"
        "  const p = SPARK_PALETTES[S.bokehPalette] || SPARK_PALETTES.night, out = new Float32Array(12);\n"
        "  for (let i = 0; i < 4; i++) { const c = p[i % p.length], m = Math.max(...c) || 1; out.set(c.map(v => v / m), i * 3); }\n"
        "  return out;\n"
        "}")

    # Colour. The flash can change colour with distance (S.flashFar over S.farRange
    # metres); the sky's fill light can have its own colour (S.ambientColour, for
    # daylight); haze can be bright (S.hazeLift); each lit card can carry a coloured
    # gel from S.gels (S.gel is how much); clouds can be sunlit white (S.cloudSun);
    # the volcano can stand dark against a bright sky (S.peak).
    rep("uniform vec3 uBulbPos, uBulbCol, uMoonDir;",
        "uniform vec3 uBulbPos, uBulbCol, uMoonDir, uAmbCol, uFlashFar; uniform vec2 uFarRange; uniform float uHazeLift;")
    rep("  return albedo * (uFlash * cone / (d2 + .1) + uSkyH * .012 * uAmbient + uBulbCol / (dot(b, b) + .25));",
        "  vec3 flash = mix(uFlash, uFlashFar, smoothstep(uFarRange.x, uFarRange.y, sqrt(d2)));\n"
        "  return albedo * (flash * cone / (d2 + .1) + uAmbCol * .012 * uAmbient + uBulbCol / (dot(b, b) + .25));")
    rep("vec3 hazeColour(){ return uSkyH * .16 * uHaze; }", "vec3 hazeColour(){ return uSkyH * uHazeLift * uHaze; }")
    rep("  if (u.uSide) gl.uniform1f(u.uSide, laneSide());",
        "  if (u.uSide) gl.uniform1f(u.uSide, laneSide());\n"
        "  if (u.uAmbCol) gl.uniform3fv(u.uAmbCol, linear(S.ambientColour || S.skyHorizon));\n"
        "  if (u.uFlashFar) { gl.uniform3fv(u.uFlashFar, linear(S.flashFar || S.flash).map(c => c * value('power'))); gl.uniform2fv(u.uFarRange, S.farRange); }\n"
        "  if (u.uHazeLift) gl.uniform1f(u.uHazeLift, value('hazeLift'));")
    rep("out vec2 vUV; out vec3 vW; out float vFade, vLit;", "out vec2 vUV; out vec3 vW; out float vFade, vLit; flat out float vGel;")
    rep("  vLit = iC.x; vUV = aUV;", "  vLit = iC.x; vUV = aUV; vGel = fract(sin(dot(iA.xy, vec2(12.9898, 78.233))) * 43758.5453);")
    rep("in vec2 vUV; in vec3 vW; in float vFade, vLit;\nuniform sampler2D uTex; uniform float uFocus, uAperture;",
        "in vec2 vUV; in vec3 vW; in float vFade, vLit; flat in float vGel;\nuniform sampler2D uTex; uniform float uFocus, uAperture, uGelAmt; uniform vec3 uGel[4];")
    rep("  vec3 albedo = grade(toLin(t.rgb / max(t.a, 1e-3)));\n  o = vec4(hazed(vLit > .5 ? flashLit(albedo, vW) : vec3(0.), vW) * uHdr, a);",
        "  vec3 albedo = grade(toLin(t.rgb / max(t.a, 1e-3)));\n"
        "  albedo *= mix(vec3(1.), uGel[int(vGel * 3.999)], uGelAmt);   // each plant under its own coloured gel\n"
        "  o = vec4(hazed(vLit > .5 ? flashLit(albedo, vW) : vec3(0.), vW) * uHdr, a);")
    rep("gl.uniform1i(P.card.u.uTex, 0); gl.uniform1i(P.card.u.uBones, 1); setPush(P.card);",
        "gl.uniform1i(P.card.u.uTex, 0); gl.uniform1i(P.card.u.uBones, 1); setPush(P.card);\n"
        "  gl.uniform3fv(P.card.u['uGel[0]'], tints(S.gels)); gl.uniform1f(P.card.u.uGelAmt, value('gel'));")
    rep("// The palette's first four colours, each scaled so its brightest channel is 1.\nfunction bokehTints() {\n  const p = SPARK_PALETTES[S.bokehPalette] || SPARK_PALETTES.night, out = new Float32Array(12);",
        "// A palette's first four colours, each scaled so its brightest channel is 1.\n"
        "function bokehTints() { return tints(SPARK_PALETTES[S.bokehPalette] || SPARK_PALETTES.night); }\n"
        "function tints(list) {\n  const p = list.map(c => typeof c === 'string' ? linear(c) : c), out = new Float32Array(12);")
    rep("uniform float uVolcano, uVolcanoAz, uVolcanoGlow;\nout vec4 o;", "uniform float uVolcano, uVolcanoAz, uVolcanoGlow, uCloudSun, uPeak;\nout vec4 o;")
    rep("    c = mix(c, under, cover);\n  }",
        "    // Sunlit clouds: white, brighter where the cloud is thick, grey underneath.\n"
        "    float body = smoothstep(threshold, threshold + .4, density), base = smoothstep(.14, .02, e) * .5;\n"
        "    under = mix(under, uCloudColour * mix(.5, 1.25, body) * (1. - base), uCloudSun);\n"
        "    c = mix(c, under, cover);\n  }")
    rep("    c = layer(c, e, top, mix(haze, uSkyH, .2));", "    c = layer(c, e, top, mix(haze, uSkyH, .2) * uPeak);")
    rep("gl.uniform1f(P.sky.u.uClouds, value('clouds'));", "gl.uniform1f(P.sky.u.uClouds, value('clouds')); gl.uniform1f(P.sky.u.uCloudSun, value('cloudSun')); gl.uniform1f(P.sky.u.uPeak, value('peak'));")
    rep("ambient: 1, bob: 1,", "ambient: 1, ambientColour: null, flashFar: null, farRange: [2, 7], hazeLift: .16,\n"
        "  gels: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], gel: 0, cloudSun: 0, peak: 1, bob: 1,")
    rep("export function applyLook(look) {", """LOOKS.daylight = {skyTop: '#0b3a9e', skyHorizon: '#6fb7f2', flash: '#ffffff', power: 5, exposure: 1.05, hue: 0, sat: 1.25, ridge: .6, trees: .4, lights: 0,
  haze: .5, hazeLift: .9, volcano: 1, volcanoGlow: 0, peak: .18, moon: false, pollen: .2, bloom: .2, lift: [0, 0, .01],
  clouds: .62, cloudColour: '#ffffff', cloudLight: .6, cloudHue: 0, cloudSun: 1, ambient: 70, ambientColour: '#fff3e2', flashFar: null, gel: 0};
LOOKS.gels = {skyTop: '#010104', skyHorizon: '#0b0716', flash: '#7fe9ff', flashFar: '#e8309e', farRange: [1.8, 6], power: 9, exposure: 1.25, hue: 0, sat: 1.3,
  ridge: .15, trees: .5, lights: 0, haze: .3, hazeLift: .16, volcano: 0, volcanoGlow: 0, peak: 1, moon: false, pollen: .5, bloom: .45, lift: [.004, 0, .01],
  clouds: 0, cloudSun: 0, ambient: .2, ambientColour: null, gels: ['#3fffd0', '#ff5fc8', '#d8e070', '#8a6cff'], gel: .7};
export function applyLook(look) {""")

    # Shide: a shimenawa rope between two bamboo stakes, with zigzag paper streamers
    # hanging from it. Placed at fixed spots along the route by S.shide. The paper
    # (role 3) swings about the rope; its UV carries depth below the rope and a phase.
    rep("uniform mat4 uVP, uModel; uniform float uWind, uTime, uPhase, uSwayHeight;",
        "uniform mat4 uVP, uModel; uniform float uWind, uTime, uPhase, uSwayHeight, uFlutter;")
    rep("  vec4 w = uModel * vec4(p, 1.); vW = w.xyz; vN = mat3(uModel) * aNormal; vRole = aRole; gl_Position = uVP * w;",
        "  if (uFlutter > 0. && aRole > 2.5) {\n"
        "    float h = aUV.x, s = aUV.y + uPhase;\n"
        "    p.z += uFlutter * h * (.5 * sin(uTime * 1.9 + s) + .25 * sin(uTime * 4.7 + s * 2.3));\n"
        "    p.x += uFlutter * h * .25 * sin(uTime * 2.6 + s * 1.7);\n"
        "  }\n"
        "  vec4 w = uModel * vec4(p, 1.); vW = w.xyz; vN = mat3(uModel) * aNormal; vRole = aRole; gl_Position = uVP * w;")
    rep("  drawPalms(cam, vp);", "  drawPalms(cam, vp);\n  drawShide(cam, vp);")
    rep("// ---------- brushing ----------", SHIDE_JS + "\n// ---------- brushing ----------")
    rep("gels: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], gel: 0,", "gels: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], gel: 0, shide: [],")

    # Stars: one in a small share of cells of a fine grid over the sky's directions.
    rep("uniform float uVolcano, uVolcanoAz, uVolcanoGlow, uCloudSun, uPeak;", "uniform float uVolcano, uVolcanoAz, uVolcanoGlow, uCloudSun, uPeak, uStars;")
    rep("  float m = dot(dir, normalize(uMoonDir));", """  if (uStars > 0.) {
    vec3 g = dir * 260.; vec3 cell = floor(g); float h = hash(cell.xy + cell.z * 37.1);
    if (h > 1. - .02 * uStars) {
      float d = length(fract(g) - .5), b = fract(h * 91.7);
      vec3 tint = b > .93 ? vec3(.5, 1., .95) : b > .86 ? vec3(1., .75, .9) : vec3(.85, .9, 1.);   // a few teal and pink
      c += tint * smoothstep(.3, 0., d) * (.4 + 2.2 * b * b) * smoothstep(.0, .2, e) * uStars;
    }
  }
  float m = dot(dir, normalize(uMoonDir));""")
    rep("gl.uniform1f(P.sky.u.uPeak, value('peak'));", "gl.uniform1f(P.sky.u.uPeak, value('peak')); gl.uniform1f(P.sky.u.uStars, value('stars'));")
    rep("cloudSun: 0, peak: 1, bob: 1,", "cloudSun: 0, peak: 1, stars: 0, bob: 1,")

    # Camera offsets a piece can steer with.
    rep("  const lat = .45 * Math.sin(travel * .09) + hand * .04 * Math.sin(time * .6);",
        "  const lat = .45 * Math.sin(travel * .09) + hand * .04 * Math.sin(time * .6) + S.lateral;")
    rep("  const yaw = .14 * Math.sin(travel * .05 + 1) + hand * .02 * Math.sin(time * .45);",
        "  const yaw = .14 * Math.sin(travel * .05 + 1) + hand * .02 * Math.sin(time * .45) + S.yaw;")

    # Clock: piece update hook; render scale follows the measured frame time.
    rep("function advance(dt) { time += dt; if (S.walking) travel += value('speed') * dt; updateBrush(dt); }",
        """function advance(dt) { time += dt; if (S.walking) travel += value('speed') * dt; updateBrush(dt);
  // A piece's error is logged once, not allowed to stop the scene.
  if (hooks.update) try { hooks.update(dt); } catch (error) { if (!advance.failed) console.error(error); advance.failed = true; }
}""")
    cut("function loop(now) {", "function start() {", insert="""// Below 40 fps the render scale steps down, and above 70 it steps back up.
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
""")

    # Remove the workshop's reel renderer, gesture recorder, and controls panel.
    cut("// Advance by hand and draw one frame; used when the page is not being painted.", "window.sceneStep = (seconds = 0) =>",
        insert="let fixedSize = null;\n")
    cut("// ---------- gesture recording ----------", "document.addEventListener('visibilitychange', start);")

    # The hand: piece hooks, cursor replacement, a held thing.
    rep("""function placeHand() {
  const r = canvas.getBoundingClientRect(), hand = brush.down ? HANDS.press : HANDS.rest;
  const hh = r.height * HAND_HEIGHT * (activeReel ? 1 : .7), hw = hh * (hand.image ? hand.image.width / hand.image.height : 1);
  if (handEl.getAttribute('src') !== hand.src) handEl.src = hand.src;""", """const heldEl = Object.assign(document.createElement('img'), {id: 'held', alt: ''});
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
  } else heldEl.style.display = 'none';""")
    rep("canvas.addEventListener('pointermove', e => { pointerAt(e); brush.shown = true; placeHand(); });",
        "canvas.addEventListener('pointermove', e => { pointerAt(e); brush.shown = true; placeHand(); if (hooks.move) hooks.move(brush.x, brush.y, brush.pressed); });")
    rep("""canvas.addEventListener('pointerdown', e => {
  pointerAt(e); canvas.setPointerCapture(e.pointerId); brush.down = true; placeHand();
  if (!brush.audio) { brush.audio = new AudioContext(); brush.synth = new BrushSynth(brush.audio); }
  brush.audio.resume();
});
for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { brush.down = false; placeHand(); });
applyPreset('night');
""", """canvas.addEventListener('pointerdown', e => {
  pointerAt(e); canvas.setPointerCapture(e.pointerId); brush.shown = true; brush.pressed = true;
  const take = hooks.down ? hooks.down(brush.x, brush.y) !== false : true; brush.down = S.grab && take; placeHand();
  if (brush.audio) brush.audio.resume();
});
for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { brush.down = false; brush.pressed = false; placeHand(); if (hooks.up) hooks.up(brush.x, brush.y); });
""")
    cut("try {\n  const [herbarium, fgc] = await Promise.all(", "\n} catch (error) {", keep_end=False)
    rep("""  status(`Could not load the plants: ${error.message}`);
  throw error;
}
""", INIT)
    rep("  const hh = r.height * HAND_HEIGHT", "  const hh = r.height * HAND_HEIGHT", 0) if False else None

    # Paths in the scene's own data.
    for name in ["HANDS", "FGC"]:
        pass
    rep("  rest: {src: 'data/hands/handcursor.png', at: [.33, .3]},\n  press: {src: 'data/hands/handopen.png', at: [.55, .28]},",
        "  rest: {src: DATA + 'hands/handcursor.png', at: [.33, .3]},\n  press: {src: DATA + 'hands/handopen.png', at: [.55, .28]},")

    leftovers = [w for w in ['activeReel', 'gesture', 'reelRender', 'PRESETS', "$('preset')", 'recording', 'HERBARIUM', 'FGC +'] if w in s]
    if leftovers:
        sys.exit(f'left over after the transform: {leftovers}')
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    io.open(args.out, 'w', encoding='utf-8', newline='\n').write(s)
    print(f'wrote {args.out}: {s.count(chr(10))} lines')


if __name__ == '__main__':
    main()
