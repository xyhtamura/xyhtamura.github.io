// Running: grab the brush ahead and let it go. Each snap adds speed; without
// them the run slows and the brush closes in. After a while the brush opens
// onto the volcano and the piece settles. The flash starts white and, as the
// run goes on, takes on colour against a sky moving to the opposite colour:
// red against green, violet against an aurora green, orange-red against dark green.
import {S, applyLook, hooks, brush, getTravel, getTime} from '../engine/scene.js';
import {piece} from '../engine/shell.js';
import {along} from '../engine/blend.js';

applyLook('nightBlue');
Object.assign(S, {path: false, height: .85, tilt: 3, fov: 62, sway: 1.6, plantScale: .9, density: 1, drift: 30,
  power: 8, exposure: 1, volcanoGlow: .15, wind: .55, speed: .7, bokehPalette: 'running'});   // drift 30: strafing forward and left

const BASE = .7, TOP = 3.5;
// Position is the share of the way to the settle point, by distance run.
const COLOURS = [
  {at: 0, flash: '#eef3ff', skyTop: '#06123f', skyHorizon: '#1d4fd6', cloudColour: '#9fd8ff', cloudHue: -20, sat: .7},
  {at: .12, flash: '#eef3ff', skyTop: '#06123f', skyHorizon: '#1d4fd6', cloudColour: '#9fd8ff', cloudHue: -20, sat: .7},
  {at: .35, flash: '#ff3a2a', skyTop: '#06160e', skyHorizon: '#5e9a3a', cloudColour: '#c8e88a', cloudHue: 0, sat: 1.1},
  {at: .62, flash: '#b46cff', skyTop: '#010a05', skyHorizon: '#23d468', cloudColour: '#7dffb0', cloudHue: 10, sat: 1.25},
  {at: .9, flash: '#ff6a2a', skyTop: '#030f08', skyHorizon: '#24603a', cloudColour: '#9fd8a0', cloudHue: 0, sat: 1.15},
];
const SETTLE_AT = 220, SETTLE_TIME = 150;   // metres run, or seconds, whichever comes first
let boost = 0, settle = 0, settleFrom = null, end = null, settledFor = 0, wind = null, ctx = null, windAt = 0;

hooks.snap = pull => { boost = Math.min(TOP - BASE, boost + .45 + pull * .9); };
hooks.update = dt => {
  boost *= Math.exp(-dt / 5);
  if (!settleFrom && (getTravel() > SETTLE_AT || getTime() > SETTLE_TIME)) settleFrom = getTime();
  if (settleFrom) settle = Math.min(1, (getTime() - settleFrom) / 14);
  along(S, COLOURS, Math.min(1, getTravel() / SETTLE_AT));
  const e = settle * settle * (3 - 2 * settle);
  S.speed = (BASE + boost) * (1 - e) + .35 * e;
  // The faster the run, the more the brush parts around the lens.
  brush.pushOn = .35 + .65 * Math.min(1, S.speed / 2.5);
  S.height = .85 + e * .75; S.tilt = 3 + e * 4; S.sway = 1.6 - e * .9;
  S.volcanoGlow = .15 + e * .4; S.lights = .5 + e * .5; S.exposure = 1 + e * .2; S.wind = .55 - e * .25;
  // The wind recording swells with the run.
  if (wind && (windAt += dt) > .25) { windAt = 0; wind.gain.gain.setTargetAtTime(.5 + .5 * Math.min(1, S.speed / TOP), ctx.currentTime, .4); }
  if (settle >= 1 && end && (settledFor += dt) > 6) { end(); end = null; }
};

piece({
  slug: 'running', sets: ['herbarium', 'fgc'],
  how: 'Press and drag to grab the brush ahead, then let go. Each time it snaps back, you run faster.',
  onStart(shell) { end = shell.end; ctx = shell.ctx; shell.wind.then(w => { wind = w; }); },
});
