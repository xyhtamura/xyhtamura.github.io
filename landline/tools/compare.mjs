/* Check the browser engine against the Python renderer.
 *
 *   python dump_reference.py > reference.json
 *   node compare.mjs reference.json
 *
 * Compares only what is deterministic in both: the channel response at the
 * probe tones, the measurement of a noise-free probe, and the ladder's decision
 * on fixed SNR vectors. The two implementations use different random number
 * generators on purpose (see engine/rng.js), so anything random is checked in
 * distribution by measure.mjs instead.
 *
 * Exits non-zero on the first tolerance failure.
 */

import { readFileSync } from "node:fs";
import { PROBE_TONES, probePair, db } from "../engine/protocol.js";
import * as line from "../engine/line.js";
import * as negotiate from "../engine/negotiate.js";

const TOL_RESPONSE = 1e-12; // pure arithmetic; should agree to the last bits
const TOL_SNR_DB = 0.75; // different FFT lengths, same band-summed power
const TOL_MEAN_SNR_DB = 0.5;

const refPath = process.argv[2] || "reference.json";
const ref = JSON.parse(readFileSync(refPath, "utf8"));

let failures = 0;
const report = [];

function check(name, ok, detail) {
  report.push(`${ok ? "  ok  " : "FAIL  "} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

/* Comparing per-tone SNR needs care. A tone that is thoroughly dead reports
 * 10·log10(1e-30 / noise) — a clamp, not a measurement — and the two
 * implementations estimate the local noise floor over slightly different bin
 * counts, so those figures differ by a couple of dB while meaning the same
 * thing. What the piece actually reads off this array is one bit per tone:
 * whether it clears USABLE_SNR_DB. So tones near the decision are compared in
 * dB, and the rest are compared on the verdict. */
const NEAR_DECISION_DB = 0.0;

function compareSnr(label, snr, expected) {
  let worst = 0;
  let worstAt = null;
  let verdictMismatch = 0;
  snr.forEach((v, i) => {
    const e = expected[i];
    const near = v > NEAR_DECISION_DB || e > NEAR_DECISION_DB;
    if (near) {
      const d = Math.abs(v - e);
      if (d > worst) { worst = d; worstAt = PROBE_TONES[i]; }
    }
    const usable = v >= negotiate.USABLE_SNR_DB;
    const usableRef = e >= negotiate.USABLE_SNR_DB;
    if (usable !== usableRef) verdictMismatch++;
  });
  check(
    `${label} per-tone SNR`,
    worst < TOL_SNR_DB && verdictMismatch === 0,
    `max |Δ| = ${worst.toFixed(3)} dB${worstAt === null ? "" : " at " + worstAt + " Hz"}` +
      `, ${verdictMismatch} tone(s) disagree on usable`
  );
}

// --- probe tones -------------------------------------------------------------
const tonesMatch =
  ref.probe_tones.length === PROBE_TONES.length &&
  ref.probe_tones.every((f, i) => f === PROBE_TONES[i]);
check("probe comb", tonesMatch, `${PROBE_TONES.length} tones`);

// --- channel response --------------------------------------------------------
for (const [key, values] of Object.entries(ref.response)) {
  if (key === "dry_gain") continue;
  const storm = parseFloat(key);
  let worst = 0;
  PROBE_TONES.forEach((f, i) => {
    const d = Math.abs(line.response(f, storm) - values[i]);
    if (d > worst) worst = d;
  });
  check(`response(storm=${key})`, worst < TOL_RESPONSE, `max |Δ| = ${worst.toExponential(2)}`);
}
{
  const d = Math.abs(line.DRY_GAIN - ref.response.dry_gain);
  check("DRY_GAIN", d < 1e-9, `Δ = ${d.toExponential(2)} (js ${line.DRY_GAIN.toFixed(9)})`);
}

// --- measurement -------------------------------------------------------------
const GAIN_PROBE = -26.0;
for (const [key, expected] of Object.entries(ref.measure)) {
  const storm = parseFloat(key);
  const pr = probePair(0.08);
  const filtered = line.filterSignal(pr, storm);
  const g = db(GAIN_PROBE);
  const received = new Float64Array(pr.length);
  for (let i = 0; i < pr.length; i++) received[i] = filtered[i] * g;
  const snr = line.measure(received);

  compareSnr(`measure(storm=${key})`, snr, expected.snr_db);

  const r = negotiate.choose(snr);
  const gotMode = r === null ? null : r.mode;
  check(
    `measure(storm=${key}) negotiated mode`,
    gotMode === expected.mode,
    `python ${expected.mode} · js ${gotMode}`
  );
  if (r !== null && expected.mean_snr_db !== null) {
    const d = Math.abs(r.mean_snr_db - expected.mean_snr_db);
    check(`measure(storm=${key}) mean SNR`, d < TOL_MEAN_SNR_DB, `Δ = ${d.toFixed(3)} dB`);
    check(
      `measure(storm=${key}) usable bandwidth`,
      r.bandwidth_hz === expected.bandwidth_hz,
      `python ${expected.bandwidth_hz} · js ${r.bandwidth_hz}`
    );
  }
}

// --- the descent -------------------------------------------------------------
/* The noise-free case above cannot show the descent: with no floor, every storm
 * level negotiates the same rate. Here the two implementations run the same
 * deterministic noise — 32-bit xorshift, small enough to write twice without
 * the copies drifting — so the whole path from probe to ladder rung is
 * compared, including the point where the line stops carrying anything. */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}

for (const [key, expected] of Object.entries(ref.descent)) {
  const storm = parseFloat(key);
  const pr = probePair(0.08);
  const filtered = line.filterSignal(pr, storm);
  const g = db(GAIN_PROBE);
  const next = xorshift32(0x1d0b57 + Math.trunc(storm * 1000));
  const level = Math.pow(
    10,
    (line.NOISE_DBFS + line.NOISE_STORM_RISE_DB * Math.min(storm, 1.0)) / 20
  );
  const received = new Float64Array(pr.length);
  for (let i = 0; i < pr.length; i++) {
    received[i] = filtered[i] * g + (next() * 2 - 1) * level;
  }
  const snr = line.measure(received);
  const r = negotiate.choose(snr);

  compareSnr(`descent(storm=${key})`, snr, expected.snr_db);
  check(
    `descent(storm=${key}) rung`,
    (r === null ? null : r.mode) === expected.mode,
    `python ${expected.mode} · js ${r === null ? null : r.mode}`
  );
}

// --- ladder ------------------------------------------------------------------
for (const [name, expected] of Object.entries(ref.ladder)) {
  const n = PROBE_TONES.length;
  const cases = {
    all_40db: Array(n).fill(40),
    all_20db: Array(n).fill(20),
    all_8db: Array(n).fill(8),
    all_below: Array(n).fill(7.9),
    top_half_dead: [
      ...Array(Math.floor(n / 2)).fill(30),
      ...Array(n - Math.floor(n / 2)).fill(0),
    ],
    one_notch: [...Array(8).fill(25), 0, 0, ...Array(n - 10).fill(25)],
    two_tones: [...Array(n - 2).fill(0), 50, 50],
    single_tone: [...Array(n - 1).fill(0), 50],
  };
  const r = negotiate.choose(cases[name]);
  if (expected === null) {
    check(`ladder ${name}`, r === null, r === null ? "no connection, as expected" : `js ${r.mode}`);
    continue;
  }
  const okMode = r !== null && r.mode === expected.mode;
  const okBw = r !== null && r.bandwidth_hz === expected.bandwidth_hz;
  const okSnr = r !== null && Math.abs(r.mean_snr_db - expected.mean_snr_db) < 1e-9;
  const octets = r === null ? null : negotiate.capabilityOctets(r);
  const okOct =
    octets !== null && expected.octets.every((v, i) => v === octets[i]);
  check(
    `ladder ${name}`,
    okMode && okBw && okSnr && okOct,
    `python ${expected.mode} · js ${r === null ? "null" : r.mode}`
  );
}

console.log(report.join("\n"));
console.log(
  failures === 0
    ? `\nAll ${report.length} checks passed.`
    : `\n${failures} of ${report.length} checks FAILED.`
);
process.exit(failures === 0 ? 0 : 1);
