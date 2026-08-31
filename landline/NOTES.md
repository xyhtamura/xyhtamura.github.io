# landline

*a landline imagining a line probe during a storm* — the browser release.

The work is a score, not a recording. This folder holds a JavaScript engine that
performs that score live, one performance per visit, plus the two fixed
renderings made in Python in August 2026 and the score itself.

Root entry: [ROADMAP.md](../../ROADMAP.md). The Python renderer that came first
lives at `F:\xyh\line-probe\` with its own `NOTES.md`, and is **not under version
control anywhere** — see the warning below.

## What is here

| Path | Role |
| :-- | :-- |
| `index.html`, `landline.css`, `app.js` | The page. `app.js` owns the audio graph, the schedule and the readouts; it holds no DSP. |
| `engine/protocol.js` | Signal generators from the Recommendations: ANSam, V.21 FSK, the V.34 probe comb. |
| `engine/line.js` | The subscriber loop: frequency response, noise bed, receiver-side measurement. |
| `engine/negotiate.js` | Measurement → mode. The only place the ladder is decided. |
| `engine/performance.js` | Storm curve, attempts, fragmentation, scatter, the bed, and the streaming. |
| `engine/rng.js`, `engine/fft.js` | Seeded random numbers; radix-2 real FFT. |
| `engine/worker.js` | Runs a performance off the main thread and hands back stereo chunks. |
| `tools/dump_reference.py` | Reference values out of the Python renderer. |
| `tools/reference.json` | Those values, committed. |
| `tools/compare.mjs` | Checks the engine against them. |
| `tools/measure.mjs` | Renders a performance headlessly and reports its levels and structure. |
| `scorev3.html`, `landline.pdf` | The score. `score.html` and `scorev2.html` are earlier drafts, kept. |
| `landline.flac`, `landline.mp3` | The 5:06 fixed rendering, seed 3. |

`package.json` exists only so Node reads `engine/*.js` as modules; there is no
build and nothing is installed.

```bash
cd tools
python dump_reference.py > reference.json   # only when the Python renderer changes
node compare.mjs reference.json             # 59 checks
node ../tools/measure.mjs --seconds 300 --seed 3
```

## How the two implementations are held together

They do not share a random number generator. numpy's PCG64 plus its ziggurat
normal and Poisson samplers cannot be reproduced in the browser at a sensible
cost, and a half-reproduction would drift silently. So the port is checked in two
halves instead:

- **Deterministic parts, compared exactly.** The channel response at the probe
  tones, `DRY_GAIN`, the measurement of a noise-free probe, the ladder's decision
  on fixed SNR vectors, and the CM/JM octets. `compare.mjs` does this.
- **Random parts, compared in distribution.** Bed level, peak, fragment lengths
  and gaps, attempt count, connect/fail ratio. `measure.mjs` prints the same
  table `line-probe/NOTES.md` records under *Verified (2026-08-08)*.

One subtlety in the first half: per-tone SNR on a dead tone is
`10·log10(1e-30 / noise)` — a clamp, not a measurement — and the two
implementations estimate the local floor over slightly different bin counts, so
those figures differ by ~2 dB while meaning the same thing. `compareSnr` therefore
compares tones near the decision in dB and every other tone on the verdict
(above or below `USABLE_SNR_DB`), which is the only thing the piece reads off
that array.

## Where the browser engine departs from the Python

Each of these is a change of arithmetic, not of the model.

1. **Streaming instead of one pass.** `render.py` builds the whole buffer, then
   normalises by the finished bed's measured RMS. Streaming cannot measure a bed
   that does not exist yet, so `Performance._estimateBedRms` samples the bed's
   mean square on a grid of storm values and integrates it over the storm curve.
   Checked, not assumed: a headless render lands at **&minus;67.4 dBFS median 1 s
   RMS** against the Python's &minus;67.2.
2. **Two transforms for the bed instead of four.** The transform is linear, so
   the tilt can be folded into the same spectral pass as the response, and the
   white spectrum can be drawn directly rather than generated in time and
   transformed. Same distribution, and the bed is most of the cost.
3. **Power-of-two FFT lengths.** numpy transforms at arbitrary length. Bin
   spacing changes; power summed over a fixed frequency width does not, and the
   measurement reads a ratio. Worst per-tone disagreement near the decision is
   **0.17 dB**, and no tone ever disagrees on whether it is usable.
4. **The bed and the attempts are decoupled in time.** Both write additively into
   the same ring, so neither has to run ahead of the other; only emission is
   ordered. This is what keeps the wait before the first sound to one bed block
   rather than the width of a scatter window.

## The volume control and the clipping guard

The bed is &minus;68 dBFS by design and the piece is unplayable at that level on
most web listeners' hardware, so the page has a plain output gain, &minus;12 to
+36 dB, marked at 0 dB. The gain is applied to everything at once, so the
relationship between the bed and the fragments — which is the whole level design
— is untouched by it.

Under it sits a clipping guard, because +36 dB on a &minus;14 dBFS peak clips.
**It is a waveshaper, not a compressor, and that was measured rather than
assumed.** The first version used a `DynamicsCompressorNode`; rendered in an
`OfflineAudioContext` it raised a &minus;22 dBFS signal by 0.5 dB while reporting
gain reduction it was not making, and at +36 dB it still let the output reach
**+0.59 dBFS**. It coloured the piece when it should have been idle and failed at
the one thing it was there for.

The waveshaper is identity below &minus;3 dBFS with a tanh knee above it.
Measured against the same graph without it: **6e&minus;8 maximum difference**
below the threshold (float32 rounding), and the output peak pinned at
&minus;0.63 dBFS for inputs up to +36 dBFS. `oversample` is `"none"` on purpose —
at `"4x"` the resampling filters both altered the sub-threshold signal and let a
hard-driven peak overshoot to +0.6 dBFS.

The readout measures the signal going *into* the guard through an analyser tap
and holds for two seconds, because the piece is sparse enough that the guard acts
in bursts.

## Warning: the Python renderer is not versioned

`F:\xyh\line-probe\` is outside every repository — the root `.gitignore`
whitelist does not include it, and it is not its own repo. It holds `protocol.py`,
`line.py`, `negotiate.py`, `render.py`, `tune.py`, `check.py`, the two rendered
WAVs and the JSON logs, and if that folder is lost there is no history to recover
it from. `tools/reference.json` here is currently the only versioned trace of its
behaviour, and it covers the deterministic parts only.

## Undone

1. **Nobody has heard this.** Every claim above is a measurement. The bed at
   &minus;68 dBFS is the one parameter that cannot be settled numerically, and
   whether the volume range and its 0 dB mark are the right ones is a listening
   question. Open the page, put on headphones, and find the setting.
2. **The guard's aliasing when it acts has not been listened to.** `oversample`
   was set to `"none"` for exactness below the threshold; above it, the shaping
   aliases. It was chosen on the argument that the piece is already being altered
   at that point, which is a defensible trade but not a heard one.
3. **No mobile device has run it.** Generation is ~7x real time in Chromium on
   this machine; a phone will be slower, and the margin over playback has not
   been measured on one. If it falls under 1x the schedule will gap.
4. **The score has not been updated.** `scorev3.html` says "choose the total
   duration and every value in brackets"; the browser now chooses them per visit,
   from ranges that are stated in the code and not in the score. `line-probe/NOTES.md`
   already warns that the score and the renderer are two statements of the same
   thing and can drift apart silently — there are now three.
5. **Duration is drawn 5:00–10:00** and the tail pad and fade are fixed at 6 s
   each, inherited from the Python. Whether the shorter draws end too abruptly is
   unheard.
6. **The seed permalink is not linked from anywhere.** A performance can be
   reproduced by URL, which makes it citable, but nothing points at that.

---

2026-08-31 — Claude Code — Built the browser release. Ported `protocol.py`,
`line.py`, `negotiate.py` and `render.py` to `engine/*.js`, restructured the
renderer to stream ahead of the playhead, and wrote the page, the audio graph and
the negotiation readout. Rewrote `index.html` around the live performance, with
the fixed renderings kept below it as performances of the same score.

**Verified.** `node tools/compare.mjs` passes 59 of 59 against values dumped from
the Python renderer: channel response to 1e&minus;16, `DRY_GAIN` to 9e&minus;16,
the ladder exactly on eight hand-made SNR vectors including its boundaries, and
the full probe→measure→negotiate path at seven storm levels — including a shared
deterministic noise case that walks the descent 24000 → 14400 → 1200 → dead and
agrees on every rung. `node tools/measure.mjs --seconds 300 --seed 3` renders at
9.6x real time with median 1 s RMS &minus;67.4 dBFS (Python: &minus;67.2), peak
&minus;18.2 dBFS, zero clipped samples, DC 3e&minus;9, 14 attempts (12 connect),
73 fragments, none over 1 s. In Chromium at
`http://localhost:8000/xyhtamura.github.io/landline/`: the worker reproduces the
Node figures exactly (gain 5.62 dB for seed 3) at 7x real time; a performance
plays with the negotiation log revealing in step with the playhead; the storm
gauge tracks; the guard readout fires at +36 dB and clears at 0; no console
errors; no horizontal overflow at 375x812, where the log drops its bandwidth
column. The waveshaper measurements are in the section above.

**Not verified: the sound.** The browser pane used for testing renders blank, so
nothing was heard and nothing was seen. See Undone.

**Context.** Electronic Thinking (Weimar) did not select the piece
(2026-08-31), which is what freed it for release. The 5:06 FLAC submitted there
is unchanged and stays on the page.
