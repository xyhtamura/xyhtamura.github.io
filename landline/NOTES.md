# landline

*a landline imagining a line probe during a storm* — browser implementation and realization files.

The work is defined as an algorithmic score. This folder contains a client-side JavaScript engine that synthesizes the score live during playback, alongside two fixed reference renderings produced in Python in August 2026 and the score document.

Project roadmap entry: [ROADMAP.md](../../ROADMAP.md). The initial Python reference implementation is in [reference/](reference/) with its own [NOTES.md](reference/NOTES.md) recording synthesis design.

## What is here

| Path | Role |
| :-- | :-- |
| `index.html`, `landline.css`, `app.js` | User interface and audio graph orchestration. `app.js` manages audio scheduling and telemetry readouts without performing DSP. |
| `engine/protocol.js` | Signal generators specified in ITU-T Recommendations: ANSam (V.8), FSK (V.21), and the V.34 line probe comb. |
| `engine/line.js` | Subscriber loop channel model: frequency response, noise bed, and receiver-side spectral estimation. |
| `engine/negotiate.js` | Rate negotiation ladder mapping measured bandwidth and SNR to modem operational modes. |
| `engine/performance.js` | Performance scheduler: storm curves, connection attempts, fragment scattering, and noise bed synthesis. |
| `engine/rng.js`, `engine/fft.js` | Seeded PRNG and split-radix real FFT implementation. |
| `engine/worker.js` | Web Worker generating stereo audio blocks off the main UI thread. |
| `reference/` | Python reference implementation and synthesis notes. |
| `tools/dump_reference.py` | Exports reference DSP vectors from the Python engine to JSON. |
| `tools/reference.json` | Committed reference test vectors. |
| `tools/compare.mjs` | Test harness validating the JavaScript engine against `reference.json`. |
| `tools/measure.mjs` | Headless performance renderer reporting audio levels and structural statistics. |
| `scorev3.html`, `landline.pdf` | Realization score. `score.html` and `scorev2.html` are preserved earlier drafts. |
| `landline.flac`, `landline.mp3` | 5:06 fixed reference rendering (seed 3). |

`package.json` exists solely so Node.js resolves `engine/*.js` as ECMAScript modules; there is no build step or package dependency.

```bash
cd tools
python dump_reference.py > reference.json   # Run only when Python reference changes
node compare.mjs reference.json             # Validates 59 assertions
node measure.mjs --seconds 300 --seed 3     # Audits structural statistics
```

## Cross-implementation verification

The Python and JavaScript engines use different pseudo-random number generators; browser execution avoids the overhead of porting NumPy's PCG64, ziggurat normal, and Poisson samplers. Verification is split into deterministic and statistical validation:

- **Deterministic components (exact comparison).** `compare.mjs` tests channel response across probe frequencies, `DRY_GAIN`, noise-free probe measurements, rate ladder logic on fixed SNR vectors, and CM/JM octet framing against `reference.json`.
- **Stochastic components (distributional comparison).** `measure.mjs` verifies statistical convergence for noise floor RMS, peak levels, fragment duration distributions, interval lengths, and connection success ratios against reference run logs.

On dead channels, per-tone SNR evaluates to `10 * log10(1e-30 / noise)`. Because the two engines compute local noise floors over slightly different bin windows, clamped SNR values diverge by up to 2 dB without affecting synthesis. `compareSnr` checks boundary tones in decibels and all other tones by boolean usability status (`USABLE_SNR_DB`), matching how the negotiation logic consumes the array.

## Architectural differences from the Python reference

Each difference represents an arithmetic accommodation for real-time browser execution rather than a modification of the underlying physical model:

1. **Streaming synthesis vs. whole-buffer rendering.** `render.py` generates the complete audio buffer before normalizing against measured noise bed RMS. The streaming browser engine estimates bed RMS in advance via `Performance._estimateBedRms`, integrating mean-square power across sampled storm points. Headless evaluation confirms a median 1-second RMS of &minus;67.4 dBFS compared to Python's &minus;67.2 dBFS.
2. **Consolidated spectral filtering.** Because the Fourier transform is linear, spectral tilt and channel response are applied in a single inverse FFT pass, synthesizing frequency-domain noise directly rather than filtering time-domain white noise.
3. **Power-of-two FFT dimensions.** NumPy supports arbitrary-length FFTs, whereas the JavaScript engine uses power-of-two transforms. Total power across equivalent frequency bands remains consistent: maximum SNR discrepancy near decision boundaries is 0.17 dB, with identical tone usability classifications.
4. **Decoupled audio ring buffer.** Noise bed synthesis and connection attempts write additively into an interleaved ring buffer. Decoupling generation scheduling reduces startup latency to a single buffer block duration.

## Volume control and clipping guard

The noise bed is calibrated to &minus;68 dBFS RMS. To accommodate listener hardware differences, the user interface provides an unweighted output gain ranging from &minus;12 to +36 dB, normalized to unity gain at 0 dB. Gain applies uniformly across the entire mix, preserving the relative amplitude balance between the noise bed and probe fragments.

The output stage uses a polynomial waveshaper rather than dynamic range compression. Testing `DynamicsCompressorNode` in `OfflineAudioContext` introduced a 0.5 dB gain offset on &minus;22 dBFS signals while permitting extreme peaks to reach +0.59 dBFS at +36 dB gain.

The waveshaper implements an exact identity function ($y = x$) below &minus;3 dBFS with a hyperbolic tangent ($\tanh$) transfer curve above threshold. Below &minus;3 dBFS, signal divergence is bounded by 32-bit floating-point precision ($6 \times 10^{-8}$ maximum difference). Output peaks remain clamped at &minus;0.63 dBFS under input overloads up to +36 dB. Oversampling is disabled (`oversample = "none"`) because 4x polyphase resampling filters altered passband levels and allowed overshoot up to +0.6 dBFS.

The UI telemetry tap samples signal amplitude preceding the waveshaper, applying a two-second peak-hold to register transient limiting events.

## Python reference implementation

The `reference/` directory preserves the initial reference implementation: `protocol.py`, `line.py`, `negotiate.py`, `render.py`, `tune.py`, `check.py`, and run logs for the two reference renderings.

Rendered WAV files (~437 MB) and spectrograms are excluded from version control via `reference/.gitignore`.

Execution remains verified: `python tools/dump_reference.py` reproduces `tools/reference.json` identically, passing all 59 assertions in `compare.mjs`.

## Undone

1. **Critical listening check.** Verification to date is numerical. The &minus;68 dBFS noise floor calibration and default gain setting require acoustic evaluation on headphones.
2. **Waveshaper harmonic distortion audit.** Non-oversampled saturation above &minus;3 dBFS introduces aliasing during limiting events; acoustic evaluation is required to confirm whether this distortion is acceptable.
3. **Mobile performance benchmarking.** Audio block generation runs at ~7x real-time speed in Chromium on desktop hardware; throughput and buffer continuity under mobile browser engines have not been benchmarked.
4. **Score specification synchronization.** `scorev3.html` instructs performers to select duration and bracketed parameters manually, whereas the browser engine samples these automatically from ranges defined in code.
5. **Tail fade evaluation on short realizations.** Performance durations range from 5:00 to 10:00 with fixed 6-second tail padding and fade-out curves. Short realizations require evaluation for abrupt termination.
6. **Permalink UI discoverability.** Unique performance seeds can be reproduced via query parameters, but the permalink is not exposed outside the live transport view.

---

2026-08-31 — Claude Code — Built the browser release. Ported `protocol.py`,
`line.py`, `negotiate.py`, and `render.py` to `engine/*.js`, restructured the
renderer to stream ahead of the playhead, and wrote the page, the audio graph, and
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

2026-09-01 — Antigravity — Removed the "The score and performances of it" section from `index.html` (score link, fixed renderings player, download links, and performance parameter table) and cleaned up unused CSS rules in `landline.css`. Updated `ROADMAP.md` mechanism line to remove the reference to on-page fixed renderings.

**Verified.** `index.html` structure verified; browser synthesis UI, volume controls, telemetry ladder, and conceptual descriptions remain intact.
