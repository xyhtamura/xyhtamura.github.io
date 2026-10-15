// Hours: dragging sideways moves through the night. The sky passes through four
// looks, the moon arcs over, the flash gives way to the sky's own light, and a
// held F minor seventh slides between four tunings, all while moving very fast,
// straight ahead and almost without a stride. Dragging fast is also wind and speed.
import {S, LOOKS, applyLook, hooks, sparksAt} from '../engine/scene.js';
import {ChordPad, TUNINGS} from '../engine/brush-audio.js';
import {piece} from '../engine/shell.js';

applyLook('nightBlue');
const FAST = 6.5;   // metres a second; drags add up to 5 more
Object.assign(S, {speed: FAST, path: true, height: 1.05, tilt: 9, fov: 64, sway: .3, bob: .15, drift: 0, density: .9,
  grab: false, notes: false, sparks: false, focus: 4, aperture: .9, moon: true, bokehPalette: 'hours'});

// Keyframes along one axis, 0 to 1, each a look and a tuning.
const KEYS = [
  {look: LOOKS.nightBlue, tuning: TUNINGS.equal},
  {look: LOOKS.dusk, tuning: TUNINGS.just},
  {look: LOOKS.magenta, tuning: TUNINGS.septimal},
  {look: LOOKS.amber, tuning: TUNINGS.whitewood},
];
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => {
  if (typeof a === 'number') return a + (b - a) * t;
  if (typeof a === 'string' && a[0] === '#') { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); }
  if (Array.isArray(a)) return a.map((v, i) => v + (b[i] - v) * t);
  return t < .5 ? a : b;
};
const MIXED = ['skyTop', 'skyHorizon', 'flash', 'power', 'exposure', 'hue', 'sat', 'ridge', 'trees', 'lights', 'haze', 'volcano', 'volcanoGlow',
  'moonColour', 'moonSize', 'pollen', 'bloom', 'lift', 'clouds', 'cloudColour', 'cloudLight', 'cloudHue', 'ambient'];

let hour = 0, shown = -1, pad = null, gust = 0, lastX = null, end = null;
const seen = new Set();
function setHour(h) {
  hour = Math.max(0, Math.min(1, h));
  const f = hour * (KEYS.length - 1), i = Math.min(KEYS.length - 2, Math.floor(f)), t = f - i, e = t * t * (3 - 2 * t);
  const a = KEYS[i], b = KEYS[i + 1];
  for (const k of MIXED) S[k] = mix(a.look[k] ?? S[k], b.look[k] ?? S[k], e);
  // The flash gives way as the night goes on; the moon crosses from east to west.
  S.power *= 1 - .55 * hour; S.ambient *= 1 + 1.5 * hour;
  S.moonDir = [-.75 + 1.5 * hour, .12 + .42 * Math.sin(Math.PI * hour), -1];
  if (pad) pad.tune(a.tuning.cents.map((c, k) => c + (b.tuning.cents[k] - c) * e), .12);
  const near = Math.round(f);
  if (near !== shown) { shown = near; seen.add(near); if (seen.size === KEYS.length && end) { end(); end = null; } }
}
setHour(0);

hooks.down = x => { lastX = x; return false; };
hooks.move = (x, y, pressed) => {
  if (!pressed || lastX === null) { lastX = x; return; }
  const dx = x - lastX; lastX = x;
  setHour(hour + dx * .6);
  gust = Math.min(1.6, gust + Math.abs(dx) * 6);
  if (Math.abs(dx) > .004) sparksAt(Math.min(6, 1 + Math.round(Math.abs(dx) * 120)), .1);
};
hooks.up = () => { lastX = null; };
hooks.update = dt => { gust *= Math.exp(-dt / 1.5); S.wind = .3 + gust; S.speed = FAST + gust * 3; };
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setHour(hour + (e.key === 'ArrowRight' ? .03 : -.03)); gust = Math.min(1.6, gust + .2); }
});

piece({
  slug: 'hours', sets: ['herbarium', 'fgc'],
  how: 'Drag sideways, or use the arrow keys, to move through the hours. Drag fast for wind.',
  onStart(shell) {
    end = shell.end;
    pad = new ChordPad(shell.synth, {level: .55});
    setHour(hour); pad.fadeIn(4);
  },
});
