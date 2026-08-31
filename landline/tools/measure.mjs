/* Render a performance headlessly and report the figures NOTES.md records.
 *
 *   node measure.mjs [--seconds 300] [--seed 3] [--wav out.wav]
 *
 * The point is the level and shape of the result, which no amount of checking
 * the deterministic parts will tell you: bed level, peak headroom, how much of
 * the piece sits under −55 dBFS, how many attempts connect, and the fragment
 * length and gap distributions. Compare against the table in
 * `line-probe/NOTES.md` under "Verified (2026-08-08)".
 *
 * It also exercises the streaming path — the ring buffer, the finalisation
 * rule, the bed's overlap-add across block seams — which the browser depends on
 * and which the Python renderer has no equivalent of.
 */

import { writeFileSync } from "node:fs";
import { Performance } from "../engine/performance.js";
import { SR } from "../engine/protocol.js";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};

const seconds = parseFloat(arg("--seconds", "300"));
const seed = parseInt(arg("--seed", "3"), 10);
const wavPath = arg("--wav", null);

const started = Date.now();
const perf = new Performance({ seed, seconds });

const left = new Float32Array(perf.totalSamples);
const right = new Float32Array(perf.totalSamples);
let written = 0;
const BLOCK = SR * 4;
while (written < perf.totalSamples) {
  perf.ensure(Math.min(perf.totalSamples, written + BLOCK * 2));
  const { left: l, right: r, samples } = perf.read(BLOCK);
  if (samples === 0) break;
  left.set(l, written);
  right.set(r, written);
  written += samples;
}
const elapsed = (Date.now() - started) / 1000;

// --- levels ------------------------------------------------------------------
const dbfs = (x) => 20 * Math.log10(x + 1e-30);

let peak = 0;
let sumsq = 0;
for (let i = 0; i < written; i++) {
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  sumsq += left[i] * left[i] + right[i] * right[i];
}
const overallRms = Math.sqrt(sumsq / (2 * written));

const secondRms = [];
for (let s = 0; s + SR <= written; s += SR) {
  let acc = 0;
  for (let i = s; i < s + SR; i++) acc += left[i] * left[i] + right[i] * right[i];
  secondRms.push(Math.sqrt(acc / (2 * SR)));
}
const sortedRms = [...secondRms].sort((a, b) => a - b);
const medianRms = sortedRms[Math.floor(sortedRms.length / 2)];
const below55 = secondRms.filter((v) => dbfs(v) < -55).length;

let clipped = 0;
let dcL = 0;
for (let i = 0; i < written; i++) {
  if (Math.abs(left[i]) >= 1 || Math.abs(right[i]) >= 1) clipped++;
  dcL += left[i];
}

// --- structure ---------------------------------------------------------------
const attempts = perf.log;
const connected = attempts.filter((a) => a.result !== null).length;
const frags = attempts.flatMap((a) => a.fragments);
const lens = frags.map((f) => f.len_s).sort((a, b) => a - b);
const q = (p) => lens[Math.min(lens.length - 1, Math.floor(p * lens.length))];
const times = frags.map((f) => f.at_s).sort((a, b) => a - b);
const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);

const modes = attempts.map((a) => (a.result === null ? "NONE" : a.result.mode));

const row = (k, v) => console.log(`${k.padEnd(26)} ${v}`);
console.log(`\nseed ${seed} · ${seconds} s requested\n`);
row("Render time", `${elapsed.toFixed(1)} s wall (${(seconds / elapsed).toFixed(1)}x real time)`);
row("Duration", `${(written / SR).toFixed(1)} s`);
row("Peak", `${dbfs(peak).toFixed(2)} dBFS`);
row("Overall RMS", `${dbfs(overallRms).toFixed(2)} dBFS`);
row("Median 1 s RMS", `${dbfs(medianRms).toFixed(1)} dBFS`);
row(
  "Below -55 dBFS",
  `${below55}/${secondRms.length} s (${Math.round((100 * below55) / secondRms.length)}%)`
);
row("Clipped samples", clipped);
row("DC offset (L)", (dcL / written).toExponential(2));
row("Attempts", `${attempts.length} (${connected} connect, ${attempts.length - connected} fail)`);
row("Fragments", frags.length);
row(
  "Fragment length",
  `${q(0.05).toFixed(3)} / ${q(0.5).toFixed(3)} / ${q(0.95).toFixed(3)} s (min ${lens[0].toFixed(3)}, max ${lens[lens.length - 1].toFixed(3)})`
);
row(
  "Gap between fragments",
  `median ${gaps[Math.floor(gaps.length / 2)].toFixed(2)} s, longest ${gaps[gaps.length - 1].toFixed(1)} s`
);
row("Bed gain applied", `${dbfs(perf.gain).toFixed(2)} dB`);
console.log(`\nDescent: ${modes.join(" -> ")}\n`);

if (wavPath) {
  const n = written;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))), 46 + i * 4);
  }
  writeFileSync(wavPath, buf);
  console.log(`Wrote ${wavPath} (16-bit; the bed is below the 16-bit floor, so this is for looking at, not for listening).`);
}
