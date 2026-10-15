// The sound of the hand, shared by the five pieces. Derived from flashbrush/brush-audio.js:
// a soft two-oscillator synth that starts in tune on the septimal scale Xyh is using
// (1/1 F, 7/6, 3/2, 7/4), holds briefly, then bends down while it fades into a long
// reverb. Added here: a held voice, a vowel voice, a step pulse, and a chord pad.

const F4 = 349.228;                       // 1/1, at its equal-tempered pitch
export const SEPTIMAL = [1, 7 / 6, 3 / 2, 7 / 4];

// Scale step n (0 = F4) to a frequency, wrapping into higher and lower octaves.
export function stepFrequency(step) {
  const octave = Math.floor(step / SEPTIMAL.length), degree = ((step % SEPTIMAL.length) + SEPTIMAL.length) % SEPTIMAL.length;
  return F4 * SEPTIMAL[degree] * 2 ** octave;
}

function reverbImpulse(ctx, seconds = 3.6, seed = 7) {
  const length = Math.round(ctx.sampleRate * seconds), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let s = seed + ch * 101;
    for (let i = 0; i < length; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const t = i / ctx.sampleRate;
      // Noise under an exponential decay, darkening as it goes.
      data[i] = (s / 4294967296 * 2 - 1) * Math.exp(-t * 2.1) * (t < .012 ? t / .012 : 1);
    }
    for (let i = 1; i < length; i++) data[i] = data[i] * .55 + data[i - 1] * .45;
  }
  return buffer;
}

export class BrushSynth {
  constructor(ctx, destination = ctx.destination, {level = .5, wet = .55} = {}) {
    this.ctx = ctx;
    this.out = ctx.createGain(); this.out.gain.value = level; this.out.connect(destination);
    this.reverb = ctx.createConvolver(); this.reverb.buffer = reverbImpulse(ctx);
    const wetGain = ctx.createGain(); wetGain.gain.value = wet;
    this.reverb.connect(wetGain); wetGain.connect(this.out);
    this.dry = ctx.createGain(); this.dry.gain.value = 1 - wet * .6; this.dry.connect(this.out);
  }
  // One note at time t: in tune for `hold` seconds, then down `drop` semitones over `fall` seconds.
  note(t, frequency, {pan = 0, velocity = 1, hold = .14, fall = 2.6, drop = 36} = {}) {
    const ctx = this.ctx, end = t + hold + fall;
    const amp = ctx.createGain(), filter = ctx.createBiquadFilter(), panner = ctx.createStereoPanner();
    filter.type = 'lowpass'; filter.Q.value = .7;
    filter.frequency.setValueAtTime(Math.min(9000, frequency * 6), t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(120, frequency * .8), end);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(.22 * velocity, t + .012);
    amp.gain.setTargetAtTime(.14 * velocity, t + .02, .12);
    amp.gain.setTargetAtTime(0, t + hold, fall / 4);
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    amp.connect(filter); filter.connect(panner); panner.connect(this.dry); panner.connect(this.reverb);
    for (const [type, detune, gain] of [['triangle', 0, 1], ['sawtooth', 7, .35], ['sine', -1200, .5]]) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.detune.value = detune; g.gain.value = gain;
      osc.frequency.setValueAtTime(frequency, t);
      osc.frequency.setValueAtTime(frequency, t + hold);
      osc.frequency.exponentialRampToValueAtTime(frequency * 2 ** (-drop / 12), end);
      osc.connect(g); g.connect(amp);
      osc.start(t); osc.stop(end + .05);
    }
  }
}

// The brush snapping back: a tick of filtered noise and a high note that falls
// fast, both into the reverb.
BrushSynth.prototype.snap = function (t, {pan = 0, velocity = 1} = {}) {
  const ctx = this.ctx, panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  panner.connect(this.dry); panner.connect(this.reverb);
  const length = Math.round(ctx.sampleRate * .08), noise = ctx.createBuffer(1, length, ctx.sampleRate), data = noise.getChannelData(0);
  let s = 12345;
  for (let i = 0; i < length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; data[i] = (s / 4294967296 * 2 - 1) * Math.exp(-i / length * 6); }
  const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; band.type = 'bandpass'; band.frequency.value = 2800; band.Q.value = 1.2; g.gain.value = .5 * velocity;
  src.connect(band); band.connect(g); g.connect(panner); src.start(t);
  const osc = ctx.createOscillator(), amp = ctx.createGain(), f0 = stepFrequency(8);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(f0 / 6, t + .35);
  amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(.2 * velocity, t + .004); amp.gain.setTargetAtTime(0, t + .01, .08);
  osc.connect(amp); amp.connect(panner); osc.start(t); osc.stop(t + .6);
};

// A note that sustains until it is let go. `glide` moves it to another pitch;
// `release` bends it down while it fades, like a brush note.
BrushSynth.prototype.hold = function (frequency, {pan = 0, velocity = 1} = {}) {
  const ctx = this.ctx, t = ctx.currentTime + .01;
  const amp = ctx.createGain(), filter = ctx.createBiquadFilter(), panner = ctx.createStereoPanner();
  filter.type = 'lowpass'; filter.Q.value = .7; filter.frequency.value = Math.min(6000, frequency * 4);
  amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(.16 * velocity, t + .08);
  amp.gain.setTargetAtTime(.1 * velocity, t + .1, .4);
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  amp.connect(filter); filter.connect(panner); panner.connect(this.dry); panner.connect(this.reverb);
  const oscs = [['triangle', 0, 1], ['sawtooth', 7, .25], ['sine', -1200, .5]].map(([type, detune, gain]) => {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.detune.value = detune; g.gain.value = gain; osc.frequency.value = frequency;
    // A slow vibrato keeps a long note from sounding like a test tone.
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 4.6; depth.gain.value = 6; lfo.connect(depth); depth.connect(osc.detune); lfo.start(t);
    osc.connect(g); g.connect(amp); osc.start(t);
    return {osc, lfo};
  });
  let ended = false;
  return {
    frequency,
    glide(to, seconds = .4) {
      if (ended) return;
      const now = ctx.currentTime;
      for (const {osc} of oscs) { osc.frequency.cancelScheduledValues(now); osc.frequency.setValueAtTime(osc.frequency.value, now); osc.frequency.exponentialRampToValueAtTime(to, now + seconds); }
      this.frequency = to;
    },
    release({drop = 36, fall = 2.6} = {}) {
      if (ended) return; ended = true;
      const now = ctx.currentTime, end = now + fall;
      amp.gain.cancelScheduledValues(now); amp.gain.setValueAtTime(amp.gain.value, now); amp.gain.setTargetAtTime(0, now, fall / 4);
      filter.frequency.setValueAtTime(filter.frequency.value, now); filter.frequency.exponentialRampToValueAtTime(120, end);
      for (const {osc, lfo} of oscs) {
        osc.frequency.cancelScheduledValues(now); osc.frequency.setValueAtTime(osc.frequency.value, now);
        osc.frequency.exponentialRampToValueAtTime(osc.frequency.value * 2 ** (-drop / 12), end);
        osc.stop(end + .1); lfo.stop(end + .1);
      }
    },
  };
};

// A sung vowel: a buzz through three formant filters, gliding from one pitch and
// vowel to another, then bending down and fading like the other notes.
const VOWELS = {a: [800, 1150, 2900], e: [400, 1600, 2700], i: [300, 2200, 3000], o: [450, 800, 2830], u: [325, 700, 2530]};
BrushSynth.prototype.vowel = function (t, from, to, {fromVowel = 'a', toVowel = 'o', glide = .45, hold = .5, fall = 2.4, drop = 24, pan = 0, velocity = 1} = {}) {
  const ctx = this.ctx, end = t + glide + hold + fall;
  const src = ctx.createOscillator(), sub = ctx.createOscillator(), amp = ctx.createGain(), panner = ctx.createStereoPanner();
  src.type = 'sawtooth'; sub.type = 'sine';
  for (const osc of [src, sub]) {
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + glide);
    osc.frequency.setValueAtTime(to, t + glide + hold);
    osc.frequency.exponentialRampToValueAtTime(to * 2 ** (-drop / 12), end);
  }
  const vib = ctx.createOscillator(), depth = ctx.createGain();
  vib.frequency.value = 5.2; depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(14, t + glide + hold);
  vib.connect(depth); depth.connect(src.detune);
  amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(.32 * velocity, t + .06);
  amp.gain.setTargetAtTime(0, t + glide + hold, fall / 4);
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  const subGain = ctx.createGain(); subGain.gain.value = .25; sub.connect(subGain); subGain.connect(amp);
  VOWELS[fromVowel].forEach((f0, k) => {
    const band = ctx.createBiquadFilter(), g = ctx.createGain();
    band.type = 'bandpass'; band.Q.value = 9 + k * 3;
    band.frequency.setValueAtTime(f0, t); band.frequency.linearRampToValueAtTime(VOWELS[toVowel][k], t + glide + hold * .5);
    g.gain.value = [1, .6, .25][k];
    src.connect(band); band.connect(g); g.connect(amp);
  });
  amp.connect(panner); panner.connect(this.dry); panner.connect(this.reverb);
  for (const osc of [src, sub, vib]) { osc.start(t); osc.stop(end + .05); }
};

// One footstep: a short low tone, mostly dry.
BrushSynth.prototype.pulse = function (t, frequency, {velocity = 1, pan = 0} = {}) {
  const ctx = this.ctx, osc = ctx.createOscillator(), amp = ctx.createGain(), panner = ctx.createStereoPanner();
  osc.type = 'sine'; osc.frequency.setValueAtTime(frequency * 1.5, t); osc.frequency.exponentialRampToValueAtTime(frequency, t + .05);
  amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(.28 * velocity, t + .005); amp.gain.setTargetAtTime(0, t + .02, .07);
  panner.pan.value = pan;
  osc.connect(amp); amp.connect(panner); panner.connect(this.dry);
  const send = ctx.createGain(); send.gain.value = .25; panner.connect(send); send.connect(this.reverb);
  osc.start(t); osc.stop(t + .5);
};

// Cents away from equal temperament for the A♭, C, and E♭ of an F minor seventh.
// Each tuning's own ratios: JI minor 6/5, 3/2, 9/5; septimal 7/6, 3/2, 7/4;
// Whitewood35 from tabota/scala/xenharmonic/whitewood35_12key.scl (A = 1/1), taken
// relative to its own F (-11.4 c) so the root holds still while the others move.
export const TUNINGS = {
  equal: {name: 'Equal temperament', cents: [0, 0, 0, 0]},
  just: {name: 'Just minor', cents: [0, 15.6, 2.0, 17.6]},
  septimal: {name: 'Septimal', cents: [0, -33.1, 2.0, -31.2]},
  whitewood: {name: 'Whitewood35', cents: [0, 42.9, -14.3, 28.6]},
};

// A held F minor seventh, four sustained voices, each retunable by cents.
export class ChordPad {
  constructor(synth, {root = F4 / 2, semitones = [0, 3, 7, 10], level = .5} = {}) {
    const ctx = this.ctx = synth.ctx;
    this.out = ctx.createGain(); this.out.gain.value = 0;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .5;
    this.out.connect(filter); filter.connect(synth.dry); filter.connect(synth.reverb);
    this.level = level;
    this.voices = semitones.map((semi, k) => {
      const f = root * 2 ** (semi / 12), g = ctx.createGain(), panner = ctx.createStereoPanner();
      g.gain.value = .18; panner.pan.value = (k / (semitones.length - 1)) * 1.2 - .6;
      const oscs = [['triangle', 0], ['sawtooth', 5], ['sawtooth', -5]].map(([type, spread], j) => {
        const osc = ctx.createOscillator(), og = ctx.createGain();
        osc.type = type; osc.frequency.value = f; osc.detune.value = spread; og.gain.value = j ? .18 : 1;
        osc.connect(og); og.connect(g); osc.start();
        return osc;
      });
      g.connect(panner); panner.connect(this.out);
      return {oscs, spread: [0, 5, -5]};
    });
  }
  fadeIn(seconds = 3) { const now = this.ctx.currentTime; this.out.gain.cancelScheduledValues(now); this.out.gain.setTargetAtTime(this.level, now, seconds / 3); }
  fadeOut(seconds = 3) { const now = this.ctx.currentTime; this.out.gain.cancelScheduledValues(now); this.out.gain.setTargetAtTime(0, now, seconds / 3); }
  // Retune every voice; `cents` has one offset per chord tone.
  tune(cents, seconds = .15) {
    const now = this.ctx.currentTime;
    this.voices.forEach((v, k) => v.oscs.forEach((osc, j) => osc.detune.setTargetAtTime(cents[k] + v.spread[j], now, seconds)));
  }
}

// Decode a file once and play it through `destination`.
export async function playFile(ctx, url, destination, {level = 1, when = 0} = {}) {
  const buffer = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buffer; g.gain.value = level; src.connect(g); g.connect(destination);
  src.start(ctx.currentTime + when);
  return src;
}

// A recording looped under the scene, faded in, from its file bytes. Returns its
// gain, so a piece can swell it with the wind.
export async function playLoop(ctx, bytes, destination, {level = .8, fadeIn = 4} = {}) {
  const buffer = await ctx.decodeAudioData(await bytes);
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buffer; src.loop = true;
  g.gain.setValueAtTime(0, ctx.currentTime); g.gain.setTargetAtTime(level, ctx.currentTime, fadeIn / 3);
  src.connect(g); g.connect(destination); src.start();
  return {source: src, gain: g, duration: buffer.duration};
}
