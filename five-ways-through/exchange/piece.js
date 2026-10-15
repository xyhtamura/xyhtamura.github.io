// Exchange: press on a plant and the hand and the plant change places. The
// cursor becomes that plant, and a hand stands in the brush where it was,
// moving in the wind like the plants. Each exchange is a sung vowel gliding
// from the last pitch to the new one. It is daytime, with the flash on anyway,
// so the light gives no clue to the hour.
import {S, applyLook, hooks, pickCard, detachCard, attachCard, setCursor, sparksAt, species} from '../engine/scene.js';
import {stepFrequency} from '../engine/brush-audio.js';
import {piece} from '../engine/shell.js';

applyLook('daylight');
// drift -22: the camera looks left of its line, so the field slides slowly to the right.
Object.assign(S, {speed: .06, path: true, height: .62, tilt: 5, fov: 52, sway: .7, drift: -22, wind: .5, density: .85,
  focus: 2.6, aperture: .7, grab: false, notes: false, sparks: false, bokehPalette: 'exchange',
  plantGroups: ['herbarium', 'fgc']});

const HANDS = ['handopen', 'handcursor'], VOWELS = ['a', 'o', 'e', 'u', 'i'];
let synth = null, end = null, count = 0, lastStep = 0;

hooks.down = (x, y) => {
  const hit = pickCard(x, y, s => s.group === 'herbarium' || s.group === 'fgc');
  if (!hit) return false;
  const {s, index} = hit, data = detachCard(s, index), height = data[4] * s.h;
  // The hand stands where the plant stood, at the plant's height, within reason.
  const hand = species.find(h => h.name === HANDS[count % 2]), h = Math.max(.35, Math.min(1.1, height));
  // A hanging or fallen plant leaves a hand standing on the ground below it.
  const card = data.slice(); card[4] = h / hand.h; card[2] = data[6] < 0 ? 0 : Math.max(card[2], -.02); card[6] = 1; card[11] = 0;
  attachCard(hand.name, card);
  setCursor(s.src, [.5, .82], Math.min(.6, .18 + height * .2));
  sparksAt(26, .08);
  const step = Math.round((1 - y) * 7);
  if (synth) synth.vowel(synth.ctx.currentTime + .01, stepFrequency(lastStep), stepFrequency(step),
    {fromVowel: VOWELS[count % 5], toVowel: VOWELS[(count + 1) % 5], pan: x * 2 - 1, velocity: .9});
  lastStep = step; count++;
  if (count === 12 && end) end();
  return false;
};

piece({
  slug: 'exchange', sets: ['herbarium', 'fgc', 'handrigs'],
  how: 'Press on a plant. Your hand and the plant change places.',
  onStart(ctx) { synth = ctx.synth; end = ctx.end; },
});
