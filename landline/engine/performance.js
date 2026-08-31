/* One performance of the score.
 *
 * A port of `line-probe/render.py`, restructured to produce the piece a stretch
 * at a time instead of all at once, so a listener can start hearing it before
 * it has finished being made. Everything else is the same: the whole
 * negotiation runs, and only fragments of it are sounded.
 *
 * The stereo image is the two ends of the call — originating DCE toward the
 * left, answering DCE toward the right, the line itself uncorrelated across
 * both. Fragments keep a bias toward their source's side. There is no
 * reverberation and no processing beyond the channel model, because anything
 * else would be a space the signal is not in.
 */

import { SR, db, ansam, v21, probePair, bitsFromBytes } from "./protocol.js";
import * as line from "./line.js";
import * as negotiate from "./negotiate.js";
import { Rng } from "./rng.js";

/* The piece is levelled from the bed, not from its peak. The bed is the one
 * continuous thing in it and the level everything else is heard against,
 * whereas the peak is whichever single fragment came out loudest. */
export const BED_TARGET_DBFS = -68.0;
export const PEAK_CEILING_DBFS = -6.0;

/* Mix levels. The measurement must be taken at the same level the listener
 * hears, or the negotiation stops being a measurement of the audible line. */
const GAIN_ANSAM = -30.0;
const GAIN_PROBE = -26.0;
const GAIN_V21 = -32.0;
const GAIN_DATA = -33.0;

// Lengths are drawn log-uniform, so most are very short and a few approach the
// ceiling; the ceiling itself closes as the line degrades.
const FRAG_MIN_S = 0.035;
const FRAG_MAX_S = 1.0;
const FRAG_MAX_S_LATE = 0.3;

const FRAG_COUNT_EARLY = 8.0;
const FRAG_COUNT_LATE = 2.5;

// Attempts are spaced closer than their scatter windows are wide, so the clouds
// overlap and no fragment can be assigned to an attempt by ear.
const ATTEMPT_GAP_S = [12.0, 30.0];
const SCATTER_WINDOW_S = [20.0, 52.0];

const SOURCE_WEIGHTS = { probe: 0.3, ansam: 0.2, cm: 0.14, jm: 0.14, data: 0.22 };

// How far a fragment can land before and after the attempt that shed it.
const SCATTER_BACK_S = 0.15 * SCATTER_WINDOW_S[1];
const SCATTER_FORWARD_S = SCATTER_WINDOW_S[1];

// The bed is made in overlapping blocks with crossfades. Independent blocks
// butted together would step at every seam; at this level the step is small,
// but the bed never stops, so a periodic seam in it would be the most audible
// regularity in the piece.
const BED_BLOCK_S = 8.0;
const BED_OVERLAP_S = 1.0;

const TAIL_PAD_S = 6.0;
const FADE_OUT_S = 6.0;

// The ceiling `tune.py` fitted to the measured failure point. The storm has to
// end past it, not graze it.
export const DEFAULT_CEILING = 3.06;

const RING_S = 96; // must exceed SCATTER_FORWARD_S plus a bed block

function smoothNoise(n, rng, smoothing = 14) {
  const x = rng.normalArray(n);
  const k = Math.max(3, Math.floor(n / smoothing));
  const kern = new Float64Array(k);
  let ksum = 0;
  for (let i = 0; i < k; i++) {
    // np.hanning(k): symmetric, zero at both ends.
    kern[i] = k === 1 ? 1 : 0.5 * (1 - Math.cos((2 * Math.PI * i) / (k - 1)));
    ksum += kern[i];
  }
  for (let i = 0; i < k; i++) kern[i] /= ksum || 1;

  // np.convolve(..., mode="same")
  const out = new Float64Array(n);
  const off = Math.floor((k - 1) / 2);
  let peak = 1e-12;
  for (let i = 0; i < n; i++) {
    let acc = 0;
    for (let j = 0; j < k; j++) {
      const idx = i + off - j;
      if (idx >= 0 && idx < n) acc += x[idx] * kern[j];
    }
    out[i] = acc;
    if (Math.abs(acc) > peak) peak = Math.abs(acc);
  }
  for (let i = 0; i < n; i++) out[i] /= peak;
  return out;
}

/* How bad the loop is, over the duration. A rising trend with gusts. The gusts
 * matter: a line that only ever worsens gives a monotonic descent, and real
 * weather lets a connection come back briefly before it goes for good. */
function stormCurve(totalSeconds, rng, ceiling) {
  const n = Math.max(2, Math.floor(totalSeconds));
  const wobble = smoothNoise(n, rng);
  const curve = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = 0.04 + ceiling * t * t;
    curve[i] = Math.min(Math.max(base + 0.14 * wobble[i], 0.0), ceiling * 1.15);
  }
  return curve;
}

/* Root-raised-cosine pulse. */
function rrc(beta, sps, span = 6) {
  const half = span * sps;
  const h = new Float64Array(2 * half + 1);
  let energy = 0;
  for (let i = 0; i < h.length; i++) {
    const x = (i - half) / sps;
    let v;
    if (Math.abs(x) < 1e-9) {
      v = 1.0 - beta + (4.0 * beta) / Math.PI;
    } else if (beta > 0 && Math.abs(Math.abs(x) - 1.0 / (4.0 * beta)) < 1e-9) {
      v =
        (beta / Math.SQRT2) *
        ((1 + 2 / Math.PI) * Math.sin(Math.PI / (4 * beta)) +
          (1 - 2 / Math.PI) * Math.cos(Math.PI / (4 * beta)));
    } else {
      const num =
        Math.sin(Math.PI * x * (1 - beta)) +
        4 * beta * x * Math.cos(Math.PI * x * (1 + beta));
      const den = Math.PI * x * (1 - Math.pow(4 * beta * x, 2));
      v = num / den;
    }
    h[i] = v;
    energy += v * v;
  }
  const norm = Math.sqrt(energy);
  for (let i = 0; i < h.length; i++) h[i] /= norm;
  return h;
}

/* Scrambled data at the negotiated mode. Once negotiation succeeds the signal
 * stops being legible as tones and becomes shaped noise — which is what a
 * working connection sounds like, and why the handshake is the only part of the
 * internet anyone ever heard. */
function dataBurst(dur, result, rng) {
  const sps = Math.max(4, Math.round(SR / result.symbol_rate));
  const nsym = Math.max(8, Math.round((dur * SR) / sps));
  const bits = Math.max(1, Math.round(result.bits_per_symbol));
  const side = Math.max(2, Math.round(Math.pow(2, bits / 2)));

  const levels = new Float64Array(side);
  for (let i = 0; i < side; i++) levels[i] = (i * 2 - (side - 1)) / (side - 1);

  const n = nsym * sps;
  const upI = new Float64Array(n);
  const upQ = new Float64Array(n);
  for (let s = 0; s < nsym; s++) {
    upI[s * sps] = levels[rng.integers(0, side)];
    upQ[s * sps] = levels[rng.integers(0, side)];
  }

  const h = rrc(0.25, sps);
  const off = Math.floor((h.length - 1) / 2);
  const out = new Float64Array(n);
  let peak = 1e-12;
  const w = (2 * Math.PI * result.carrier_hz) / SR;
  for (let i = 0; i < n; i++) {
    let bi = 0;
    let bq = 0;
    // The upsampler leaves every sps-th sample non-zero; walking only those
    // turns an O(n·taps) convolution into O(n·taps/sps).
    const first = i + off;
    let k = first % sps === 0 ? first : first - (first % sps);
    for (; k >= i + off - (h.length - 1); k -= sps) {
      if (k < 0 || k >= n) continue;
      const tap = h[i + off - k];
      bi += upI[k] * tap;
      bq += upQ[k] * tap;
    }
    const v = bi * Math.cos(w * i) - bq * Math.sin(w * i);
    out[i] = v;
    if (Math.abs(v) > peak) peak = Math.abs(v);
  }
  for (let i = 0; i < n; i++) out[i] /= peak;
  return out;
}

/** Raised-cosine edges on a cut fragment, short enough to leave the attack. */
function fragmentWindow(seg, rng) {
  const n = seg.length;
  for (const edge of [0, 1]) {
    const k = Math.min(Math.floor(SR * rng.uniform(0.003, 0.012)), Math.floor(n / 2));
    if (k < 2) continue;
    for (let i = 0; i < k; i++) {
      const r = 0.5 * (1 - Math.cos((Math.PI * i) / k));
      if (edge === 0) seg[i] *= r;
      else seg[n - 1 - i] *= r;
    }
  }
  return seg;
}

/** One fragment, log-uniform in length so short ones dominate. */
function cut(src, rng, maxLen) {
  const n = src.length;
  if (n < 16) return null;
  const dur = FRAG_MIN_S * Math.pow(maxLen / FRAG_MIN_S, rng.random());
  const k = Math.min(Math.floor(dur * SR), n);
  if (k < 16) return null;
  const start = rng.integers(0, Math.max(1, n - k));
  return fragmentWindow(src.slice(start, start + k), rng);
}

export class Performance {
  constructor({ seed = 3, seconds = 306, ceiling = DEFAULT_CEILING } = {}) {
    this.seed = seed >>> 0;
    this.seconds = seconds;
    this.ceiling = ceiling;

    this.rng = new Rng(this.seed);
    this.totalSamples = Math.floor((seconds + TAIL_PAD_S) * SR);
    this.storm = stormCurve(seconds + TAIL_PAD_S, this.rng, ceiling);

    this.ringLength = Math.floor(RING_S * SR);
    this.ring = [new Float32Array(this.ringLength), new Float32Array(this.ringLength)];
    this.ringStart = 0; // absolute index of the oldest sample still held
    this.playhead = 0; // absolute index of the next sample to be read
    this.finalised = 0; // absolute index up to which nothing more will be added

    // Two independent beds: the line is uncorrelated across the two channels.
    this.bedRng = [new Rng(this.seed ^ 0x5f356495), new Rng(this.seed ^ 0x27d4eb2f)];
    this.bedPos = 0;
    this.bedComplete = 0;

    this.attemptRng = new Rng(this.seed ^ 0x165667b1);
    this.nextAttemptAt = this.attemptRng.uniform(6.0, 14.0);
    this.attemptCount = 0;
    this.log = [];

    this.peak = 0;
    this.gain = db(BED_TARGET_DBFS) / (this._estimateBedRms() + 1e-30);
  }

  /* The whole-piece bed level, which render.py gets by measuring the finished
   * bed and cannot be got that way while streaming. The bed's RMS is a function
   * of storm alone, so it is sampled on a grid and integrated over the storm
   * curve. The check is whether the finished performance lands on
   * BED_TARGET_DBFS — see tools/measure.mjs. */
  _estimateBedRms() {
    const grid = [];
    const probeRng = new Rng(this.seed ^ 0x9e3779b9);
    const maxStorm = Math.max(...this.storm);
    const points = 12;
    const chunk = Math.floor(0.5 * SR);
    for (let i = 0; i < points; i++) {
      const s = (maxStorm * i) / (points - 1);
      const seg = line.noise(chunk, s, probeRng);
      let sum = 0;
      for (let j = 0; j < chunk; j++) sum += seg[j] * seg[j];
      grid.push({ s, ms: sum / chunk });
    }
    const at = (s) => {
      if (s <= grid[0].s) return grid[0].ms;
      if (s >= grid[grid.length - 1].s) return grid[grid.length - 1].ms;
      let i = 1;
      while (grid[i].s < s) i++;
      const t = (s - grid[i - 1].s) / (grid[i].s - grid[i - 1].s);
      return grid[i - 1].ms + t * (grid[i].ms - grid[i - 1].ms);
    };
    let acc = 0;
    for (let sec = 0; sec < this.storm.length; sec++) acc += at(this.storm[sec]);
    // The crossfaded overlap-add of two independent blocks preserves mean
    // square, so the block structure does not enter here.
    return Math.sqrt(acc / this.storm.length);
  }

  stormAt(seconds) {
    const i = Math.min(this.storm.length - 1, Math.max(0, Math.floor(seconds)));
    return this.storm[i];
  }

  _add(channel, absPos, mono, gain) {
    const buf = this.ring[channel];
    const n = mono.length;
    for (let i = 0; i < n; i++) {
      const abs = absPos + i;
      if (abs < this.ringStart || abs >= this.totalSamples) continue;
      const idx = abs % this.ringLength;
      buf[idx] += mono[i] * gain;
    }
  }

  /** Additively mix a mono fragment into the stereo ring at a sample offset. */
  _place(absPos, mono, pan = 0.0, gainDb = 0.0) {
    const theta = ((Math.min(Math.max(pan, -1), 1) + 1) * Math.PI) / 4;
    const g = db(gainDb);
    this._add(0, absPos, mono, Math.cos(theta) * g);
    this._add(1, absPos, mono, Math.sin(theta) * g);
  }

  _generateBedBlock() {
    const L = Math.floor(BED_BLOCK_S * SR);
    const O = Math.floor(BED_OVERLAP_S * SR);
    const hop = L - O;
    const pos = this.bedPos;
    const k = Math.min(L, this.totalSamples - pos);
    if (k < 32) {
      this.bedComplete = this.totalSamples;
      this.bedPos = this.totalSamples;
      return;
    }
    const s = this.stormAt((pos + k / 2) / SR);
    for (let ch = 0; ch < 2; ch++) {
      const seg = line.noise(k, s, this.bedRng[ch]);
      if (pos > 0 && k > O) {
        for (let i = 0; i < O; i++) seg[i] *= 0.5 * (1 - Math.cos((Math.PI * i) / O));
      }
      if (pos + k < this.totalSamples && k > O) {
        for (let i = 0; i < O; i++) {
          seg[k - 1 - i] *= 0.5 * (1 - Math.cos((Math.PI * i) / O));
        }
      }
      this._add(ch, pos, seg, 1.0);
    }
    this.bedPos = pos + hop;
    this.bedComplete = Math.min(this.totalSamples, pos + hop);
    if (this.bedPos >= this.totalSamples) this.bedComplete = this.totalSamples;
  }

  /* Run a full call setup at storm level s. The signals produced are complete;
   * the piece only ever hears pieces of them. */
  _attempt(s, rng) {
    const pr = probePair(rng.uniform(0.04, 0.12));
    const prLine = line.filterSignal(pr, s);
    const bedNoise = line.noise(pr.length, s, rng);
    const gp = db(GAIN_PROBE);
    const received = new Float64Array(pr.length);
    for (let i = 0; i < pr.length; i++) received[i] = prLine[i] * gp + bedNoise[i];
    const result = negotiate.choose(line.measure(received));

    const octets = negotiate.capabilityOctets(result);
    const src = {
      ansam: [line.filterSignal(ansam(rng.uniform(1.6, 3.3)), s), 0.55, GAIN_ANSAM],
      probe: [prLine, -0.55, GAIN_PROBE],
      cm: [line.filterSignal(v21(bitsFromBytes(octets), "low"), s), -0.7, GAIN_V21],
      jm: [line.filterSignal(v21(bitsFromBytes([...octets].reverse()), "high"), s), 0.7, GAIN_V21],
    };
    if (result !== null) {
      const hold = 1.4 + 6.5 * (result.bit_rate / 33600.0);
      src.data = [line.filterSignal(dataBurst(hold, result, rng), s), 0.0, GAIN_DATA];
    }
    return { result, src };
  }

  _runNextAttempt() {
    const rng = this.attemptRng;
    const t = this.nextAttemptAt;
    this.attemptCount += 1;
    const pos = Math.floor(t * SR);
    const s = this.stormAt(t);
    const sn = Math.min(1.0, s / this.ceiling);

    const { result, src } = this._attempt(s, rng);

    // Fewer and shorter fragments as the line degrades: there is less of
    // anything getting through, and what does is briefer.
    const mu = FRAG_COUNT_EARLY + (FRAG_COUNT_LATE - FRAG_COUNT_EARLY) * sn;
    const count = Math.max(1, Math.round(rng.normal(mu, 1.4)));
    const maxLen = FRAG_MAX_S + (FRAG_MAX_S_LATE - FRAG_MAX_S) * sn;
    const spread = rng.uniform(SCATTER_WINDOW_S[0], SCATTER_WINDOW_S[1]);

    const names = Object.keys(SOURCE_WEIGHTS).filter((k) => k in src);
    const weights = names.map((k) => SOURCE_WEIGHTS[k]);

    const placed = [];
    for (let i = 0; i < count; i++) {
      const name = names[rng.weightedIndex(weights)];
      const [sig, bias, gain] = src[name];
      const frag = cut(sig, rng, maxLen);
      if (frag === null) continue;
      const at = pos + Math.floor(rng.uniform(-0.15, 1.0) * spread * SR);
      const pan = Math.min(Math.max(bias + rng.normal(0.0, 0.45), -1), 1);
      this._place(at, frag, pan, gain + rng.uniform(-11.0, 0.0));
      placed.push({ source: name, at_s: at / SR, len_s: frag.length / SR });
    }

    this.log.push({
      attempt: this.attemptCount,
      negotiated_at_s: t,
      storm: s,
      scatter_window_s: spread,
      result: result === null ? null : { ...result, indices: undefined },
      fragments: placed.sort((a, b) => a.at_s - b.at_s),
    });

    this.nextAttemptAt = t + rng.uniform(ATTEMPT_GAP_S[0], ATTEMPT_GAP_S[1]);
    return this.log[this.log.length - 1];
  }

  get attemptsExhausted() {
    return this.nextAttemptAt >= this.seconds;
  }

  /* How far attempts alone would allow the piece to be emitted. A fragment can
   * land up to SCATTER_BACK_S before the attempt that shed it, so nothing
   * within that distance of the next attempt is settled yet. */
  get _attemptHorizon() {
    if (this.attemptsExhausted) return this.totalSamples;
    return Math.max(0, Math.floor((this.nextAttemptAt - SCATTER_BACK_S) * SR));
  }

  /* Advance generation until `untilSample` is final — that is, until no later
   * attempt could still place a fragment before it and the bed under it exists.
   *
   * The bed and the attempts are independent: both write into the same ring
   * additively, so neither has to run ahead of the other. Only emission is
   * ordered, which is what keeps the wait before the first sound to one bed
   * block rather than the width of a scatter window. */
  ensure(untilSample, onAttempt) {
    const target = Math.min(untilSample, this.totalSamples);
    let guard = 0;
    while (this.finalised < target && guard++ < 100000) {
      let moved = false;
      if (!this.attemptsExhausted && this._attemptHorizon < target) {
        const entry = this._runNextAttempt();
        if (onAttempt) onAttempt(entry);
        moved = true;
      }
      if (this.bedComplete < target && this.bedPos < this.totalSamples) {
        this._generateBedBlock();
        moved = true;
      }
      this.finalised = Math.min(this.bedComplete, this._attemptHorizon);
      if (!moved) break;
    }
    return this.finalised;
  }

  get finished() {
    return this.playhead >= this.totalSamples;
  }

  /* Read the next `count` samples, applying the whole-piece gain and the
   * closing fade. Samples handed out are dropped from the ring. */
  read(count) {
    const available = Math.max(0, Math.min(count, this.finalised - this.playhead));
    const left = new Float32Array(available);
    const right = new Float32Array(available);
    const fadeStart = this.totalSamples - Math.floor(FADE_OUT_S * SR);
    for (let i = 0; i < available; i++) {
      const abs = this.playhead + i;
      const idx = abs % this.ringLength;
      let g = this.gain;
      if (abs >= fadeStart) {
        g *= Math.max(0, (this.totalSamples - abs) / (this.totalSamples - fadeStart));
      }
      const l = this.ring[0][idx] * g;
      const r = this.ring[1][idx] * g;
      left[i] = l;
      right[i] = r;
      const m = Math.max(Math.abs(l), Math.abs(r));
      if (m > this.peak) this.peak = m;
      this.ring[0][idx] = 0;
      this.ring[1][idx] = 0;
    }
    this.playhead += available;
    this.ringStart = this.playhead;
    return { left, right, samples: available };
  }

  peakDbfs() {
    return 20 * Math.log10(this.peak + 1e-30);
  }
}
