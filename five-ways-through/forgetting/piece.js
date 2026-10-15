// Forgetting: walking backwards, so the way ahead is never seen and everything
// comes into view only once it has been passed. Things lie in the grass along the
// way. Press on one to pick it up. The hand holds one thing at a time, so picking up another puts the last
// one down, and it stays behind. Each thing held sounds a note; putting it down
// bends the note away. At the end the notes come back in the order they were
// carried, with only the last one sounding. A thing can also be put down on its
// own, by pressing the ground. Dark, with each plant under a coloured light, and
// shide, paper streamers on a straw rope, marking every other place a thing lies.
import {S, applyLook, hooks, brush, pickCard, detachCard, addCard, setHeld, getTravel, species, seeded, sparksAt} from '../engine/scene.js';
import {stepFrequency} from '../engine/brush-audio.js';
import {piece} from '../engine/shell.js';

applyLook('gels');
// drift 180 and backwards: travel runs away from where the camera looks.
Object.assign(S, {speed: .38, path: true, height: 1.05, tilt: -15, fov: 58, sway: .5, drift: 180, backwards: true, density: .8,
  grab: false, notes: false, sparks: false, focus: 3.2, aperture: .6, wind: .3, ground: .6, bokehPalette: 'forgetting',
  plantGroups: ['herbarium', 'fgc']});

// Long side in metres, roughly true to life and a little generous so each reads from standing height.
const THINGS = {abaniko_fan: .45, backpack_teal: .5, bayong_beaded_bag: .45, clothes_hanger_blue: .42, envelope_kraft: .32,
  index_card_white: .2, jeans_blue: .95, kamatis_tomatoes: .22, onion_red: .18, teddy_bear_brown: .4, tshirt_red: .7, tumbler_plastic_blue: .24};
const FIRST = -3, SPACING = 5.5;   // the first is already in view, behind the start
let placed = [], held = null, voice = null, carried = [], synth = null, end = null, lastU = 0, finished = false;

function place() {
  const rnd = seeded(1016), names = Object.keys(THINGS).filter(n => species.some(s => s.name === n));
  for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
  names.forEach((name, i) => {
    const s = species.find(x => x.name === name), long = THINGS[name], height = s.h >= s.w ? long : long * s.h / s.w;
    // On the walked line, where the grass is trampled; the camera wanders .45 sin(.09 u) either side of it.
    const u = FIRST + i * SPACING + (rnd() - .5) * 2, v = .45 * Math.sin(u * .09) + (rnd() - .5) * .7;
    // Upright and sunk a little into the grass: a card lying flat is too foreshortened to read from standing height.
    addCard(name, {u, v, y: -.08 * height, yaw: (rnd() * 2 - 1) * .5, height, mirror: rnd() < .5 ? -1 : 1});
    placed.push({name, step: i % 8, height});
    // Every other place is marked: a rope of shide beside the path, on alternating sides.
    // The rope runs out from the path's edge, across the line of sight, so its paper faces the camera.
    if (i % 2 === 0) S.shide.push({u: u + .4, v: .45 * Math.sin(u * .09) + (i % 4 ? -1.55 : 1.55), yaw: Math.PI / 2 + (rnd() - .5) * .4});
    lastU = u;
  });
}

// Where the ray under the hand meets the ground, in route coordinates.
function groundUnder(x, y) {
  const v = brush.view; if (!v) return null;
  const nx = x * 2 - 1, ny = 1 - y * 2, ray = v.fwd.map((f, k) => f + nx * v.tanX * v.r[k] + ny * v.tanY * v.u[k]);
  if (ray[1] >= -1e-3) return null;
  const t = -v.eye[1] / ray[1], px = v.eye[0] + ray[0] * t, pz = v.eye[2] + ray[2] * t, d = v.dir;
  return {u: px * d[0] + pz * d[1], v: -px * d[1] + pz * d[0]};
}

hooks.down = (x, y) => {
  if (finished) return false;
  const hit = pickCard(x, y, s => s.group === 'objects', .05);
  if (!hit) { if (held) putDown(x, y); return false; }
  const data = detachCard(hit.s, hit.index), thing = placed.find(p => p.name === hit.s.name);
  if (held) {
    // Put the last thing down where the hand is, and let its note go.
    const g = groundUnder(x, y) || {u: data[1], v: data[0] + .3};
    addCard(held.name, {u: g.u + .25, v: g.v + .15, y: -.08 * held.height, yaw: data[3] + .4, height: held.height});
    if (voice) voice.release({drop: 30, fall: 3});
  }
  held = thing; carried.push(thing);
  sparksAt(14, .06);
  setHeld(hit.s.src, Math.min(.34, .12 + thing.height * .22));
  if (synth) voice = synth.hold(stepFrequency(thing.step), {pan: x * 2 - 1, velocity: .8});
  return false;
};

// Pressing the ground with something in hand puts it down there.
function putDown(x, y) {
  const g = groundUnder(x, y);
  if (!g) return;
  addCard(held.name, {u: g.u, v: g.v, y: -.08 * held.height, yaw: (Math.random() * 2 - 1) * .5, height: held.height});
  if (voice) voice.release({drop: 30, fall: 3});
  held = null; voice = null; setHeld(null);
}

hooks.update = () => {
  if (finished || getTravel() < lastU + 6) return;
  finished = true;
  S.speed = 0;
  if (voice) voice.release({drop: 0, fall: 1.5});
  if (!synth || !carried.length) { setTimeout(() => end && end(), 1500); return; }
  // The phrase: every thing carried, in order, and only the one still held sounds;
  // if the hand is empty, the phrase is all rests.
  const t = synth.ctx.currentTime + 2.2, gap = .55;
  carried.forEach((thing, i) => { if (held && i === carried.length - 1) synth.note(t + i * gap, stepFrequency(thing.step), {velocity: .9, hold: .8}); });
  setTimeout(() => end && end(), (2.2 + carried.length * gap + 2) * 1000);
};

piece({
  slug: 'forgetting', sets: ['herbarium', 'fgc', 'objects'],
  how: 'Press on the things in the grass to pick them up. You can carry one at a time; press the ground to put it down.',
  onReady: place,
  onStart(shell) { synth = shell.synth; end = shell.end; },
});
