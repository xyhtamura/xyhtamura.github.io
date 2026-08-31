/* Turning a measurement into a decision.
 *
 * A port of `line-probe/negotiate.py`. This is the part of the piece that is
 * not composed. The probe is measured, the usable band falls out of the
 * measurement, and the mode is whatever the line will carry. As the line
 * degrades the ladder descends on its own; the descent is not written into the
 * score.
 *
 * The threshold table is a simplification. V.34 selects symbol rate, carrier
 * and data rate from tables in the Recommendation using attenuation distortion
 * and signal-to-noise measurements together; what is used here is a single
 * ordered ladder keyed on usable bandwidth and mean SNR, which reproduces the
 * behaviour that matters (higher rates die first, from the top of the band
 * down) without reproducing the tables.
 */

import { PROBE_TONES } from "./protocol.js";

export const USABLE_SNR_DB = 8.0;

// name, bit rate, symbol rate, carrier Hz, min usable bandwidth Hz, min mean SNR dB
export const MODES = [
  ["V.34 33600", 33600, 3429, 1959, 3200, 34.0],
  ["V.34 28800", 28800, 3200, 1920, 3000, 30.0],
  ["V.34 24000", 24000, 3000, 1800, 2800, 26.0],
  ["V.34 19200", 19200, 2800, 1800, 2600, 22.0],
  ["V.34 14400", 14400, 2743, 1800, 2400, 19.0],
  ["V.32bis 14400", 14400, 2400, 1800, 2200, 17.0],
  ["V.32 9600", 9600, 2400, 1800, 2000, 14.0],
  ["V.32 4800", 4800, 2400, 1800, 1700, 11.0],
  ["V.22bis 2400", 2400, 600, 1700, 1200, 9.0],
  ["V.22 1200", 1200, 600, 1700, 900, 7.0],
  ["V.21 300", 300, 300, 1080, 600, 4.0],
];

/* The spectrum the receiver can actually use.
 *
 * Usable bandwidth is the total of the tones that survive, not the longest
 * unbroken run of them. A single null in the middle of the band costs a modem
 * the tones inside it and nothing more — V.34 answers a notch with
 * pre-emphasis, it does not abandon everything above it. */
export function usableBand(snrDb) {
  const idx = [];
  for (let i = 0; i < snrDb.length; i++) {
    if (snrDb[i] >= USABLE_SNR_DB) idx.push(i);
  }
  if (idx.length < 2) return null;
  let sum = 0;
  for (const i of idx) sum += snrDb[i];
  return {
    indices: idx,
    low_hz: PROBE_TONES[idx[0]],
    high_hz: PROBE_TONES[idx[idx.length - 1]],
    bandwidth_hz: idx.length * 150.0,
    mean_snr_db: sum / idx.length,
  };
}

/** The negotiated result, or null if the line will not carry a connection. */
export function choose(snrDb) {
  const band = usableBand(snrDb);
  if (band === null) return null;
  for (const [name, bitRate, symbolRate, carrier, minBw, minSnr] of MODES) {
    if (band.bandwidth_hz >= minBw && band.mean_snr_db >= minSnr) {
      return {
        mode: name,
        bit_rate: bitRate,
        symbol_rate: symbolRate,
        carrier_hz: carrier,
        bits_per_symbol: bitRate / symbolRate,
        ...band,
      };
    }
  }
  return null;
}

/* Bytes for the CM/JM sequence that correspond to what was measured. V.8 CM
 * and JM carry a call function and a list of modulation modes the DCE is
 * willing to use; here the list is derived from the measurement, so the audible
 * 300 bit/s warble differs from attempt to attempt in step with what the line
 * was found to be. */
export function capabilityOctets(result) {
  if (result === null) return [0x00, 0x00];
  const idx = MODES.findIndex((m) => m[0] === result.mode);
  const bw = Math.floor(result.bandwidth_hz / 150);
  const snr = Math.max(0, Math.min(63, Math.floor(result.mean_snr_db)));
  return [0xe0 | (idx & 0x0f), bw & 0xff, snr & 0x3f, (idx * 37 + bw) & 0xff];
}
