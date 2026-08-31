/* Signal generators for the ITU-T handshake sequence.
 *
 * A port of `line-probe/protocol.py`. Every generator is built from the
 * published spec rather than sampled from a recording; frequencies, durations
 * and levels are cited inline so a render can be checked against the
 * Recommendations.
 *
 * References
 *   ITU-T V.8   Procedures for starting sessions of data transmission over the
 *               PSTN. ANSam, CM, JM.
 *   ITU-T V.21  300 bit/s duplex FSK. Channel 1 (low) 980/1180 Hz,
 *               channel 2 (high) 1650/1850 Hz.
 *   ITU-T V.34  Line probing signals L1 and L2.
 */

export const SR = 48000;

// V.21 channel 1 is used by the calling DCE, channel 2 by the answering DCE.
// Mark is binary 1, space is binary 0.
export const V21_LOW = { mark: 980.0, space: 1180.0 };
export const V21_HIGH = { mark: 1650.0, space: 1850.0 };
export const V21_BAUD = 300.0;

// V.8 ANSam: 2100 Hz, amplitude modulated at 15 Hz, phase reversal every 450 ms.
export const ANSAM_CARRIER = 2100.0;
export const ANSAM_MOD = 15.0;
export const ANSAM_REVERSAL = 0.45;

// V.34 line probe: twenty-one tones, 150 Hz to 3750 Hz on a 150 Hz grid, with
// four omitted so the receiver has places to read noise with no signal in them.
export const PROBE_SPACING = 150.0;
export const PROBE_OMITTED = [900.0, 1200.0, 1800.0, 2400.0];
export const PROBE_TONES = (() => {
  const out = [];
  for (let f = 150.0; f <= 3750.0 + 1e-9; f += PROBE_SPACING) {
    if (!PROBE_OMITTED.includes(f)) out.push(f);
  }
  return out;
})();

// L1 is 24 repetitions of the 1/150 s period at +6 dB on nominal; L2 is the
// same comb at nominal level for at least 550 ms plus the round trip delay.
export const PROBE_PERIOD = 1.0 / PROBE_SPACING;
export const L1_REPEATS = 24;
export const L1_GAIN_DB = 6.0;
export const L2_MIN = 0.55;

export function db(x) {
  return Math.pow(10.0, x / 20.0);
}

function times(dur) {
  return Math.round(dur * SR);
}

/* Short raised-cosine edges. Real line signalling is switched, not faded, but
 * an instantaneous edge produces a click louder than this piece. */
function applyEdge(sig, ms = 4.0) {
  const n = sig.length;
  const k = Math.min(Math.floor((SR * ms) / 1000.0), Math.floor(n / 2));
  if (k < 2) return sig;
  for (let i = 0; i < k; i++) {
    const r = 0.5 * (1 - Math.cos((Math.PI * i) / k));
    sig[i] *= r;
    sig[n - 1 - i] *= r;
  }
  return sig;
}

/** V.8 ANSam: the answering modem saying it is there and it speaks V.8. */
export function ansam(dur) {
  const n = times(dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const envelope = 1.0 + 0.2 * Math.sin(2 * Math.PI * ANSAM_MOD * t);
    // Phase reversals every 450 ms disable network echo suppressors.
    const reversals = Math.floor(t / ANSAM_REVERSAL) % 2;
    out[i] = envelope * Math.sin(2 * Math.PI * ANSAM_CARRIER * t + Math.PI * reversals);
  }
  return applyEdge(out);
}

/* Frequency-shift keying of an actual bit sequence. CM and JM are carried this
 * way at 300 bit/s, so the audible warble is the bit pattern itself and not an
 * impression of one. Instantaneous frequency is integrated, keeping the carrier
 * phase continuous across bit boundaries as a real FSK modulator does. */
export function v21(bits, channel = "high", baud = V21_BAUD) {
  const tones = channel === "high" ? V21_HIGH : V21_LOW;
  const spb = Math.round(SR / baud);
  const n = bits.length * spb;
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const f = bits[Math.floor(i / spb)] ? tones.mark : tones.space;
    phase += (2 * Math.PI * f) / SR;
    out[i] = Math.sin(phase);
  }
  return applyEdge(out);
}

/* V.34 L1/L2 line probe: the 21-tone comb. Phases follow a Schroeder-style
 * quadratic distribution, which keeps a sum of equal-amplitude tones from
 * stacking into an impulse. The spec fixes the phases for the same reason. */
export function probe(dur, gainDb = 0.0) {
  const n = times(dur);
  const out = new Float64Array(n);
  const count = PROBE_TONES.length;
  const scale = db(gainDb) / Math.sqrt(count);
  for (let k = 0; k < count; k++) {
    const f = PROBE_TONES[k];
    const phi = (Math.PI * k * k) / count;
    const w = (2 * Math.PI * f) / SR;
    for (let i = 0; i < n; i++) out[i] += Math.sin(w * i + phi);
  }
  for (let i = 0; i < n; i++) out[i] *= scale;
  return applyEdge(out);
}

/** L1 then L2, at the durations the Recommendation gives. */
export function probePair(roundTrip = 0.08) {
  const l1 = probe(L1_REPEATS * PROBE_PERIOD, L1_GAIN_DB);
  const l2 = probe(L2_MIN + roundTrip, 0.0);
  const out = new Float64Array(l1.length + l2.length);
  out.set(l1, 0);
  out.set(l2, l1.length);
  return out;
}

/* CM and JM are octet sequences preceded by a synchronisation run. The octet
 * tables in V.8 encode call function and available modulation modes; the bytes
 * passed in stand for a negotiated capability set, and the framing and the
 * resulting audio are as specified. */
export function bitsFromBytes(data, syncOnes = 32) {
  const bits = [];
  for (let i = 0; i < syncOnes; i++) bits.push(1);
  for (const byte of data) {
    bits.push(0); // start bit
    for (let i = 0; i < 8; i++) bits.push((byte >> i) & 1); // LSB first
    bits.push(1); // stop bit
  }
  return bits;
}
