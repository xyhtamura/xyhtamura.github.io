/* The line.
 *
 * A port of `line-probe/line.py`. The subscriber loop is the object the piece
 * is about. Everything the modems do is an attempt to find out what this is,
 * and the piece degrades it over its duration until nothing can be negotiated
 * across it.
 *
 * The same channel model is used twice: once to filter what the listener
 * hears, and once to produce the signal the receiving modem measures. The
 * negotiation is therefore a measurement of the audible line and not a
 * decoration on top of one. Do not give the two paths different levels.
 */

import { SR, PROBE_TONES, PROBE_OMITTED } from "./protocol.js";
import { filterReal, powerSpectrum } from "./fft.js";

export const TELEPHONE_LOW = 300.0;
export const TELEPHONE_HIGH = 3400.0;

/* Nominal RMS of the noise bed on a dry line, in dBFS, and how far it rises as
 * the loop wets. The floor is meant to stay low: the call is lost because the
 * signal is attenuated into the noise, not because the noise gets loud.
 *
 * Both the level rise and the impulse rate saturate at STORM_SATURATES.
 * Induced noise on a loop does not grow without bound, but loss does — so past
 * this point the bed holds still and only the signal keeps sinking. */
export const NOISE_DBFS = -72.0;
export const NOISE_STORM_RISE_DB = 13.0;
export const STORM_SATURATES = 1.0;

/* Magnitude response of the loop at a given storm level. storm runs 0 (a dry,
 * short loop) to 1 (wet, long, and about to be unusable) and the piece drives
 * it past that. Attenuation rises with frequency because that is what water
 * and length do to twisted pair, so the top of the band is lost first and the
 * negotiated rate falls with it. */
export function response(f, storm) {
  let h = 1.0;

  // Passband edges of the voice channel.
  h *= 1.0 / (1.0 + Math.pow(TELEPHONE_LOW / Math.max(f, 1.0), 4));
  h *= 1.0 / (1.0 + Math.pow(f / TELEPHONE_HIGH, 6));

  // Frequency-proportional loss that grows with the storm.
  h *= Math.exp((-storm * 2.8 * f) / TELEPHONE_HIGH);

  // Flat loss across the band, standing for series resistance on a long wet
  // loop. This is what finally takes the call.
  h *= Math.exp(-storm * 1.35);

  // A bridged tap reflection puts a null in the band and walks it downward as
  // the loop wets and its velocity of propagation changes.
  const notchF = 3100.0 - 900.0 * Math.min(storm, 1.0);
  const depth = Math.min(0.9, 0.75 * storm); // below 1 or the null inverts phase
  h *= 1.0 - depth * Math.exp(-Math.pow((f - notchF) / 220.0, 2));

  return h;
}

export function filterSignal(sig, storm) {
  if (sig.length === 0) return sig;
  return filterReal(sig, SR, (f) => response(f, storm));
}

/** Loop noise is not flat; it rises toward the bottom of the band. */
function tilt(f) {
  return Math.sqrt(1.0 + 200.0 / Math.max(f, 40.0));
}

/* RMS gain of tilt and band limit together on a dry line. Calibrating against
 * this fixed reference keeps the absolute noise level from moving every time
 * the channel model is edited, while leaving the storm's effect on the bed
 * intact. Peak-normalising the filtered bed instead would couple level to
 * storm backwards: a stormier, more heavily filtered bed would be boosted back
 * up. */
export const DRY_GAIN = (() => {
  // np.fft.rfftfreq(SR, 1/SR) is 0, 1, 2, … Hz up to SR/2.
  let sum = 0;
  const n = SR / 2 + 1;
  for (let f = 0; f < n; f++) {
    const h = response(f, 0.0) * tilt(f);
    sum += h * h;
  }
  return Math.sqrt(sum / n);
})();

/* The near-silence.
 *
 * Hiss shaped to the voice band, mains hum and its harmonics, and impulse
 * noise from switching and weather. This is the bed the whole piece sits on
 * and the thing the probe is measuring against. */
export function noise(n, storm, rng) {
  if (n <= 0) return new Float64Array(0);

  const hum = new Float64Array(n);
  const harmonics = [[1, 1.0], [2, 0.35], [3, 0.22], [5, 0.08]];
  for (const [k, amp] of harmonics) {
    const phase = rng.uniform(0, 2 * Math.PI);
    const w = (2 * Math.PI * 50.0 * k) / SR;
    for (let i = 0; i < n; i++) hum[i] += amp * Math.sin(w * i + phase);
  }
  for (let i = 0; i < n; i++) hum[i] /= 1.65;

  // Impulse noise: sparse at the start, frequent under weather.
  const rate = 0.4 + 8.0 * Math.pow(Math.min(storm, STORM_SATURATES), 2);
  const count = rng.poisson((rate * n) / SR);
  const clicks = new Float64Array(n);
  for (let c = 0; c < count; c++) {
    const p = rng.integers(0, n);
    const length = rng.integers(4, 90);
    const end = Math.min(p + length, n);
    const amp = rng.uniform(0.2, 1.0);
    for (let i = p; i < end; i++) {
      clicks[i] += Math.exp(-(i - p) / (length / 3.5)) * rng.standardNormal() * amp;
    }
  }

  /* Hum and impulse noise are induced into the loop, so they reach the ear
   * through the same band-limited path as everything else. Filtering the bed as
   * a whole is what removes the 50 Hz fundamental: a handset earpiece does not
   * reproduce it, and what is left is the harmonics, which is what mains hum on
   * a telephone actually sounds like.
   *
   * The shaping saturates with the level, for the same reason as above. The
   * signal crosses the whole loop and takes all of its loss; noise is induced
   * along the loop's length, so most of it enters past most of the attenuation.
   * Letting the bed take the full end-to-end loss makes it vanish late in the
   * piece, which is both wrong and the opposite of what the bed is for. */
  /* Written as one spectral pass rather than the two of line.py.
   *
   * line.py filters hiss by tilt, sums, then filters the sum by the response —
   * four transforms. The transform is linear, so multiplying the white
   * spectrum by tilt inside the sum is the same arithmetic, and the white
   * spectrum can be drawn directly instead of being transformed into
   * existence: the DFT of Gaussian white noise is Gaussian white noise. That
   * leaves two transforms, and the bed is most of the cost of the piece. */
  const shaped = Math.min(storm, STORM_SATURATES) * 0.5;
  const mix = new Float64Array(n);
  for (let i = 0; i < n; i++) mix[i] = 0.1 * hum[i] + 0.3 * clicks[i];
  const bed = filterReal(mix, SR, (f) => response(f, shaped), (f, N) => {
    // 0.72 · tilt(f) · response(f) · a unit-variance white spectrum, scaled by
    // sqrt(N/2) so that the inverse transform lands at unit variance in time.
    const a = 0.72 * tilt(f) * Math.sqrt(N / 2);
    return [rng.standardNormal() * a, rng.standardNormal() * a];
  });

  // Deliberately not renormalised here — see DRY_GAIN.
  const level = Math.pow(
    10.0,
    (NOISE_DBFS + NOISE_STORM_RISE_DB * Math.min(storm, STORM_SATURATES)) / 20.0
  );
  const g = level / DRY_GAIN;
  for (let i = 0; i < n; i++) bed[i] *= g;
  return bed;
}

/* What the receiving modem learns from the probe.
 *
 * The four omitted tones in the V.34 comb exist so the receiver has places in
 * the band where it can read noise with no signal present. That is exactly how
 * the noise reference is taken here: signal power at the transmitted tones,
 * noise power interpolated from the gaps. Returns per-tone SNR in dB. */
export function measure(received) {
  const { power, binHz } = powerSpectrum(received, SR);
  const top = power.length - 1;

  const powerAt = (f, width = 40.0) => {
    const lo = Math.max(0, Math.ceil((f - width) / binHz));
    const hi = Math.min(top, Math.floor((f + width) / binHz));
    if (hi < lo) return 1e-30;
    let sum = 0;
    for (let k = lo; k <= hi; k++) sum += power[k];
    return sum;
  };

  /* Noise references. The comb sits on a 150 Hz grid, so every midpoint
   * between two grid frequencies carries no signal. Together with the four
   * tones the standard omits, that gives a reference roughly every 150 Hz
   * across the band.
   *
   * Estimating the floor from only the four omitted tones is not enough: with
   * that few points the estimate is noisy enough that, on a line carrying
   * nothing at all, a few tones land above threshold by chance and the receiver
   * reports a connection in pure noise. */
  const refSet = new Set(PROBE_OMITTED);
  for (let f = 75.0; f < 3826.0; f += 150.0) refSet.add(f);
  const refs = [...refSet].sort((a, b) => a - b);
  let refP = refs.map((f) => powerAt(f));

  // Three-point median across neighbouring references, so one unlucky bin
  // cannot drag the local floor estimate down.
  if (refP.length >= 3) {
    const smoothed = refP.map((_, i) => {
      const a = refP[Math.max(0, i - 1)];
      const b = refP[i];
      const c = refP[Math.min(refP.length - 1, i + 1)];
      return [a, b, c].sort((x, y) => x - y)[1];
    });
    refP = smoothed;
  }

  const interp = (x) => {
    if (x <= refs[0]) return refP[0];
    if (x >= refs[refs.length - 1]) return refP[refP.length - 1];
    let i = 1;
    while (refs[i] < x) i++;
    const t = (x - refs[i - 1]) / (refs[i] - refs[i - 1]);
    return refP[i - 1] + t * (refP[i] - refP[i - 1]);
  };

  return PROBE_TONES.map((f) => {
    const npow = interp(f);
    const s = powerAt(f);
    return 10.0 * Math.log10(Math.max(s - npow, 1e-30) / Math.max(npow, 1e-30));
  });
}
