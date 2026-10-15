// Toward: the walk goes on by itself, slowly; holding a press stops it, and the
// hand steers. A bulb burns over the payphone on the fourth pole, about a hundred
// metres on. A detuned chord draws into tune as it nears, each step sounds, and
// arriving ends the piece. Each pole passed brings a new colour: amber sepia, rose
// dusk, an orange flash on a violet-blue sky, a pink flash on aurora green, then a
// teal night with the bulb the one warm thing. Standing still drains the colour;
// walking brings it back.
import {S, applyLook, hooks, brush, getTravel, poleBase, linear, sparksAt} from '../engine/scene.js';
import {ChordPad, TUNINGS, stepFrequency} from '../engine/brush-audio.js';
import {piece} from '../engine/shell.js';
import {along} from '../engine/blend.js';

applyLook('amber');
// drift 0: walking straight at it.
Object.assign(S, {speed: 0, path: true, height: .95, tilt: 4, fov: 54, sway: .6, drift: 0, density: .9, palms: .6,
  poles: true, payphoneEvery: 1000, payphoneOffset: 3, grab: false, notes: false, sparks: false, focus: 3, aperture: .7,
  wind: .3, bokehPalette: 'toward'});

const POLE = 3, WALK = .9, STRIDE = 1.4;
// Position is the share of the way to the payphone.
// Poles stand at 12, 40, 68, and 96 m, so the frames fall about where each is passed.
const COLOURS = [
  {at: 0, sat: .12, flash: '#ffc98a', flashFar: '#ffc98a', skyTop: '#2b1a2e', skyHorizon: '#ff9b45', cloudColour: '#ffcf9a', cloudHue: 10, lift: [.02, .01, 0], haze: .55},
  {at: .14, sat: .45, flash: '#ffd2b0', flashFar: '#ffd2b0', skyTop: '#2a1430', skyHorizon: '#e2706a', cloudColour: '#f2a8a0', cloudHue: 0, lift: [.02, .005, .01], haze: .5},
  {at: .44, sat: .9, flash: '#ffa860', flashFar: '#ff6a8a', skyTop: '#0b1240', skyHorizon: '#5b62e0', cloudColour: '#9aa8ff', cloudHue: -10, lift: [.005, .005, .02], haze: .5},
  {at: .74, sat: 1.15, flash: '#ff7ab8', flashFar: '#ff7ab8', skyTop: '#02150f', skyHorizon: '#27c78a', cloudColour: '#8fffc0', cloudHue: 10, lift: [0, .015, .008], haze: .45},
  {at: 1, sat: 1.3, flash: '#e6f4ff', flashFar: '#e6f4ff', skyTop: '#03141b', skyHorizon: '#1f8088', cloudColour: '#7fd8d0', cloudHue: -10, lift: [0, .012, .014], haze: .45},
];
const DETUNE = [0, 38, -27, 44];   // cents off at the start; zero on arrival
const BULB = linear('#ffc98a');
const HOLD = .22;   // seconds a press lasts before it counts as stopping; a shorter press only steers
let pressed = false, pressedFor = 0, aimX = .5, pad = null, synth = null, end = null, arrived = false, started = false, nextStep = STRIDE, colourOn = 0;

hooks.down = x => { pressed = true; pressedFor = 0; aimX = x; return false; };
hooks.move = x => { aimX = x; };
hooks.up = () => { pressed = false; };
addEventListener('keydown', e => { if (e.key === ' ') { pressed = true; pressedFor = HOLD; e.preventDefault(); } });
addEventListener('keyup', e => { if (e.key === ' ') pressed = false; });

hooks.update = dt => {
  if (!brush.view) return;
  const [bx, bz, poleDistance] = poleBase(POLE), d = brush.view.dir, r = [-d[1], d[0]];
  const stop = poleDistance - 4.5, travel = getTravel(), p = Math.min(1, travel / stop);
  // The bulb hangs from the pole on the road side, at the height of the cable box.
  S.bulbPos = [bx - r[0] * .5, 5.9, bz - r[1] * .5];
  S.bulbColour = BULB.map(c => c * 14 * (.4 + .6 * p));
  brush.glows = [{p: S.bulbPos, c: BULB.map(c => c * 2.2), size: 2.2, glow: 1}];
  // An open patch around the payphone, so it can be seen on arrival.
  const phone = [bx - .6 * r[0] + .45 * d[0], bz - .6 * r[1] + .45 * d[1]];
  S.clearing = [phone[0], phone[1], 4.2];

  if (pressed) pressedFor += dt;
  const stopped = pressed && pressedFor >= HOLD;
  const target = started && !stopped && !arrived ? WALK : 0;
  S.speed += (target - S.speed) * (1 - Math.exp(-dt * (target ? 1.2 : 3)));
  if (arrived) {
    // Turn to face the payphone. The camera's own sway is .14 sin(travel * .05 + 1).
    const e = brush.view.eye, want = Math.atan2(phone[0] - e[0], -(phone[1] - e[2])) - .14 * Math.sin(travel * .05 + 1);
    S.yaw += (want - S.yaw) * (1 - Math.exp(-dt * .9));
    S.tilt += (-6 - S.tilt) * (1 - Math.exp(-dt * .9));
  } else if (!stopped) {
    S.lateral += (Math.max(-1.4, Math.min(1.4, (aimX - .5) * 3)) - S.lateral) * (1 - Math.exp(-dt * .8));
    S.yaw += ((aimX - .5) * .3 - S.yaw) * (1 - Math.exp(-dt * 1.5));
  }
  if (synth && travel >= nextStep) {
    nextStep += STRIDE;
    synth.pulse(synth.ctx.currentTime + .01, stepFrequency(-4), {velocity: .35 + .5 * S.speed / WALK, pan: (Math.floor(nextStep / STRIDE) % 2) ? -.25 : .25});
  }
  along(S, COLOURS, p);
  // Colour follows the walking: it drains toward sepia while standing still, and
  // each stride sways the hue a little. Arrival keeps it.
  colourOn += ((arrived ? 1 : S.speed / WALK) - colourOn) * (1 - Math.exp(-dt * 1.4));
  S.sat *= .25 + .75 * colourOn; S.exposure = 1.15 * (.82 + .18 * colourOn);
  S.hue = 5 * colourOn * Math.sin(travel / STRIDE * Math.PI);
  if (pad) pad.tune(TUNINGS.septimal.cents.map((c, k) => c + DETUNE[k] * (1 - p) ** 1.5), .4);
  if (!arrived && travel >= stop) arrive();
};

function arrive() {
  arrived = true;
  sparksAt(40, .3);
  if (synth) {
    const t = synth.ctx.currentTime + .3;
    [0, 1, 2, 3, 4].forEach((step, i) => synth.note(t + i * .32, stepFrequency(step), {velocity: .8, pan: i * .2 - .4, hold: .4}));
  }
  setTimeout(() => end && end(), 3500);
}

piece({
  slug: 'toward', sets: ['herbarium', 'fgc'], payphone: true,
  how: 'The walk goes on by itself. Press and hold to stop. Move the hand to steer. There is a light ahead.',
  onStart(shell) {
    synth = shell.synth; end = shell.end; started = true;
    pad = new ChordPad(synth, {level: .5}); pad.tune(TUNINGS.septimal.cents.map((c, k) => c + DETUNE[k]), .01); pad.fadeIn(5);
  },
});
