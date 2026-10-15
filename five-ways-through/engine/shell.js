// What every piece has around its scene: a way back to the text, a sound switch,
// a first screen whose press unlocks audio, and an ending card.
import {init, setAudio} from './scene.js';
import {PIECES} from './series.js';
import {playLoop} from './brush-audio.js';
import {soundBytes} from './sounds.js';

const el = (tag, props = {}, ...children) => { const e = Object.assign(document.createElement(tag), props); e.append(...children); return e; };

export async function piece({slug, how, sets, payphone = false, windLevel = .8, onReady, onStart}) {
  const index = PIECES.findIndex(p => p.slug === slug), info = PIECES[index];
  document.title = `${info.title} · Five Ways Through`;

  const sound = el('button', {type: 'button', textContent: 'Sound on', hidden: true});
  sound.setAttribute('aria-pressed', 'true');
  document.body.append(el('div', {className: 'bar'}, el('a', {href: '../', textContent: '← Five Ways Through'}), sound));

  const press = el('span', {className: 'press', textContent: 'Loading…'});
  const begin = el('button', {id: 'begin', type: 'button', disabled: true},
    el('span', {className: 'sentence', textContent: info.sentence}), el('span', {className: 'how', textContent: how}), press);
  document.body.append(begin);

  try {
    await init({sets, payphone});
  } catch (error) {
    press.textContent = `The scene could not load: ${error.message}`;
    throw error;
  }
  if (onReady) onReady();
  press.textContent = 'Press anywhere to begin';
  begin.disabled = false; begin.focus();

  await new Promise(resolve => begin.addEventListener('click', resolve, {once: true}));
  const ctx = new AudioContext(), master = ctx.createGain();
  master.connect(ctx.destination);
  await ctx.resume();
  const synth = setAudio(ctx, master);
  // Each piece has its own wind recording, looped; credited in credits.html.
  const wind = playLoop(ctx, soundBytes(slug), master, {level: windLevel}).catch(error => { console.warn(error); return null; });
  begin.hidden = true;
  setTimeout(() => begin.remove(), 1000);
  sound.hidden = false;
  sound.addEventListener('click', () => {
    const on = master.gain.value < .5;
    master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, .05);
    sound.textContent = on ? 'Sound on' : 'Sound off';
    sound.setAttribute('aria-pressed', String(on));
  });

  let ended = false;
  // Shows the ending card once; the scene keeps running behind it.
  const end = () => {
    if (ended) return; ended = true;
    const next = PIECES[index + 1];
    const nav = el('nav', {},
      el('button', {type: 'button', textContent: 'Again', onclick: () => location.reload()}),
      el('a', {href: '../', textContent: 'Back to the text'}));
    if (next) nav.append(el('a', {href: `../${next.slug}/`, textContent: `Next: ${next.title}`}));
    const card = el('div', {id: 'ending'}, el('p', {className: 'sentence', textContent: info.sentence}), nav);
    card.setAttribute('role', 'status');
    document.body.append(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('shown')));
  };
  if (onStart) onStart({ctx, master, synth, end, wind});
}
