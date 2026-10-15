// The opening page's background: lying among plants and looking up, with the
// plants in a ring around a patch of starry sky, turning slowly. With sound on,
// Xyh's theme loops and swells in and out against a wind recording.
import {S, hooks, init, addCard, species, seeded} from './engine/scene.js';
import {playLoop} from './engine/brush-audio.js';
import {soundBytes} from './engine/sounds.js';

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
Object.assign(S, {walking: false, speed: 0, path: true, density: 0, ground: 0, height: .45, tilt: 77, fov: 88, sway: calm ? 0 : .35, drift: 0,
  skyTop: '#120f3e', skyHorizon: '#3a2462', flash: '#fff2e6', flashFar: '#ff7a5a', farRange: [1.5, 4.5], power: 7, exposure: 1.25, sat: 1.3, hue: 0,
  ridge: 0, trees: .3, lights: 0, haze: .25, volcano: 0, moon: false, clouds: .12, cloudColour: '#b9a0ff', cloudLight: .1, stars: 1,
  pollen: .35, bloom: .45, lift: [.01, 0, .02], ambient: .6, gels: ['#ff5a2a', '#ffc04a', '#ff5fc8', '#7fe9ff'], gel: .7,
  bokehPalette: 'spectrum', handCursor: false, grab: false, notes: false, sparks: false, wind: calm ? 0 : .3, focus: 2.5, aperture: .5});

const ONLY = ['hydrangea_blue_potted', 'hydrangea_pink_pair', 'malunggay_leaves', 'sunflower_arrangement',
  'Adiantum_pedatum_GH_02758123', 'Adiantum_capillus-veneris_GH_02529094', 'Lunaria_annua_GH_00612043', 'Daucus_carota_GH_00973324',
  'Gypsophila_paniculata_GH_01744502', 'Briza_maxima_WU_0172352', 'Equisetum_arvense_GH_02291188', 'Carex_pendula_GH_02599206'];

// The camera looks along -z with x to its right, so a ring point at angle a and
// radius r is v = r cos a, u = -r sin a; a card faces the centre at yaw a + 90°.
function ring() {
  const rnd = seeded(1032), tall = species.filter(s => s.group === 'herbarium'), low = species.filter(s => s.group === 'fgc');
  const put = (s, r, a, opts) => addCard(s.name, {v: r * Math.cos(a), u: -r * Math.sin(a), yaw: a + Math.PI / 2, mirror: rnd() < .5 ? -1 : 1, ...opts});
  for (let i = 0; i < 110; i++) {
    const a = rnd() * Math.PI * 2, r = 1 + Math.pow(rnd(), .7) * 2.6;
    put(tall[Math.floor(rnd() * tall.length)], r, a, {height: 1.4 + rnd() * 2.2, y: -.05});
  }
  for (let i = 0; i < 40; i++) {
    const a = rnd() * Math.PI * 2, r = .7 + rnd() * 1.4;
    put(low[Math.floor(rnd() * low.length)], r, a, {height: .5 + rnd() * .7, y: -.03});
  }
  // A canopy hanging overhead, thinning toward the middle so the sky shows through.
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, r = 1.1 + rnd() * 2.2;
    put(tall[Math.floor(rnd() * tall.length)], r, a, {height: 1 + rnd() * 1.3, y: 3.4 + rnd() * 1.4, flip: -1});
  }
}

hooks.update = dt => { if (!calm) S.yaw += dt * .025; };
init({sets: ['herbarium', 'fgc'], only: ONLY}).then(ring).catch(error => console.warn(error));

// Sound starts only when asked for, since browsers need a press first.
const button = document.getElementById('sound');
let ctx = null;
const WIND = .5 * 10 ** (-5 / 20);   // the rustle sits 5 dB under the theme's middle level
button.addEventListener('click', async () => {
  if (ctx) {
    const on = ctx.state !== 'running';
    await (on ? ctx.resume() : ctx.suspend());
    button.textContent = on ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-pressed', String(on));
    return;
  }
  ctx = new AudioContext();
  button.textContent = 'Sound on'; button.setAttribute('aria-pressed', 'true');
  const [theme, wind] = await Promise.all([playLoop(ctx, soundBytes('theme'), ctx.destination, {level: .5, fadeIn: 5}),
    playLoop(ctx, soundBytes('opening-wind'), ctx.destination, {level: WIND, fadeIn: 5})]);
  // One slow wave, 34 s long, raises the theme while it lowers the wind, and back.
  const lfo = ctx.createOscillator(), up = ctx.createGain(), down = ctx.createGain();
  lfo.frequency.value = 1 / 34; up.gain.value = .42; down.gain.value = -WIND * .84;
  lfo.connect(up); lfo.connect(down); up.connect(theme.gain.gain); down.connect(wind.gain.gain); lfo.start();
});
