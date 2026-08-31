# a landline imagining a line probe during a storm

Fixed-media electroacoustic work. Stereo, 48 kHz / 24-bit.
Two reference realizations: **5:06** and **10:06**.

Built in `F:\xyh\line-probe\`, moved here on 2026-08-31 to establish version control.
Created for the Electronic Thinking open call (HfM Weimar, August 2026).

## What it is

A telephone subscriber loop degrades across the duration of the piece. A modem initiates repeated connection attempts at 20- to 30-second intervals. Each attempt executes the ITU-T call setup sequence—the V.8 answer tone, V.34 line probe, and V.21 capability exchange—measures channel attenuation and noise, and negotiates the highest sustainable data rate. As channel conditions deteriorate, negotiated rates descend the fallback ladder until reaching total connection failure.

Each attempt is simulated in full, but sounded only as brief fragments under one second. Fragments are scattered across a temporal window wider than the attempt interval, overlapping successive attempts so boundaries cannot be distinguished by ear. A continuous noise bed sits near the threshold of hearing across the entire piece.

All audio is synthesised directly from ITU-T Recommendations without pre-recorded samples.

## Synthesis model and musical structure

The V.34 modem handshake defines both the sound material and formal trajectory:

- **Noise floor as measurement reference.** The audible noise bed serves as the physical reference for probe spectral analysis, directly governing SNR calculations and subsequent rate decisions.
- **Protocol-driven formal structure.** Rate descent across the fallback ladder is generated dynamically by channel measurements rather than fixed composition. Temporary decreases in storm intensity produce corresponding recoveries in negotiated bandwidth.
- **Generative fragmentation.** Connection attempts are evaluated in their entirety; fragmentary sounding reflects selective audition of a complete underlying protocol execution.
- **Spatial channel separation.** The stereo field maps the physical endpoints of the connection: originating DCE panned left, answering DCE panned right, and uncorrelated noise sources across channels, without external reverberation.

## Files

| File | Role |
| :-- | :-- |
| `protocol.py` | Signal generators from ITU-T Recommendations: ANSam (V.8), FSK (V.21), and the V.34 probe comb. Frequencies and durations cited inline. |
| `line.py` | Subscriber loop channel model: frequency response, noise bed, and receiver-side spectral estimation. |
| `negotiate.py` | Rate ladder mapping measured channel bandwidth and SNR to modem operational modes. |
| `render.py` | Performance scheduler: attempts, fragmentation, scatter, storm curve, and 24-bit WAV generation with JSON execution logs. |
| `tune.py` | Fits `--ceiling` to channel failure thresholds. Run after modifying the noise floor, channel model, or rate ladder. |
| `check.py` | Level and headroom auditor with spectrogram generation (Pillow). |
| `check_statement.py` | Audits submission statement character counts against limits. |

```bash
python tune.py                                                   # Calibrate failure ceiling
python render.py --seconds 300 --seed 3 --out line-probe-5.wav   # 5:06 reference rendering
python render.py --seconds 600 --seed 3 --out line-probe-10.wav  # 10:06 reference rendering
python check.py line-probe-5.wav                                 # Audit levels and generate spectrogram
```

The JSON file alongside each rendered WAV logs every attempt (timestamp, storm value, measured bandwidth and SNR, negotiated rate) and every fragment (source signal, time offset, duration).

## Coupling between noise floor and rate descent

The audible noise bed and the negotiation logic share identical signal levels. Adjusting `NOISE_DBFS` directly alters measured SNR: lowering the noise floor extends line survival later into the storm, requiring recalibration of the storm ceiling via `tune.py` to ensure complete connection failure before the end of the piece. Measurement and mix levels must remain coupled to maintain the integrity of the protocol simulation.

## Verified (2026-08-08)

Both reference renders evaluated at `--seed 3 --ceiling 3.06` via `check.py`:

| Metric | 5-minute | 10-minute |
| :-- | :-- | :-- |
| Duration | 306.0 s | 606.0 s |
| Peak | &minus;14.19 dBFS | &minus;19.01 dBFS |
| Overall RMS | &minus;52.52 dBFS | &minus;52.66 dBFS |
| Median 1 s RMS | &minus;67.2 dBFS | &minus;67.2 dBFS |
| Below &minus;55 dBFS | 266/306 s (87%) | 543/606 s (90%) |
| Attempts | 14 (11 connect, 3 fail) | 28 (23 connect, 5 fail) |
| Fragments | 97 | 187 |
| Fragment length | 0.035 / 0.173 / 0.798 s | 0.036 / 0.180 / 0.863 s |
| Gap between fragments | median 2.00 s, longest 28.2 s | median 1.91 s, longest 33.7 s |

Zero clipped samples and DC offset below 1e&minus;8 in both renders. Median 1-second RMS is identical across both durations due to noise-bed-referenced gain calibration. Fragment durations conform to the 1.0 s ceiling with power-law distribution toward short lengths.

The probe comb conforms to ITU-T V.34: 21 active carriers on the 150 Hz grid from 150 to 3750 Hz (omitting 900, 1200, 1800, and 2400 Hz). The L1 duration of 24 repetitions equals exactly $24 \times (1 / 150\text{ s}) = 160\text{ ms}$.

## Resolved model inconsistencies

1. **Probe amplitude calibration.** The probe was previously measured at 0 dBFS while mixed at &minus;26 dBFS. Both measurement and audio synthesis now use shared gain constants.
2. **Bandwidth aggregation.** Usable bandwidth was initially evaluated as the longest contiguous run of surviving tones, causing single-frequency notches to trigger excessive rate drops. The metric now evaluates total surviving bandwidth across the band.
3. **Mains hum filtering.** Mains hum (50 Hz) was initially added after loop filtering, bypassing low-frequency roll-off. The noise bed is now filtered through the complete channel transfer function.
4. **Spectral notch clipping.** Notch attenuation (`0.75 * storm`) exceeded unity gain at high storm levels, causing phase inversion. Attenuation is now strictly clamped to $[0.0, 1.0]$.
5. **Noise bed calibration.** Post-filter peak normalization coupled perceived loudness inversely to storm intensity. The bed is now calibrated against a fixed dry-line reference (`DRY_GAIN`).
6. **Storm parameter saturation.** Noise power and impulse rates initially scaled linearly without bound, producing excessive impulse density (~150 clicks/s) at high storm levels. Both parameters now saturate at `STORM_SATURATES`.
7. **Distributed loop attenuation.** Applying total loop loss across the noise bed caused complete silence at high storm levels. Because physical loop noise is induced along the wire length, noise filtering now saturates to preserve a continuous bed.
8. **Noise floor spectral estimation.** Estimating background noise from four reference bins led to false carrier detections on severed lines. The estimator now evaluates reference points every 150 Hz across the spectrum with median filtering.
9. **Noise-referenced normalization.** Normalizing to peak fragment amplitudes caused 5 dB loudness discrepancies between 5-minute and 10-minute renderings. Master gain is now calibrated to noise bed RMS, treating peak levels as unconstrained headroom.

## Known simplifications

1. **Rate negotiation ladder.** V.34 calculates symbol rate, carrier frequency, and data rate through multidimensional lookup tables based on attenuation distortion and SNR. `negotiate.py` uses a simplified one-dimensional priority ladder indexed by usable bandwidth and mean SNR.
2. **V.8 capability bitfields.** CM/JM frames use valid 300 bit/s FSK framing, but encode measured channel metrics rather than official V.8 binary capability octets.
3. **Baud rate quantization.** Symbol rates are quantized to integer sample periods at 48 kHz (e.g., 3429 baud renders as 3428.57 baud).
4. **Channel transfer function.** The physical subscriber loop is approximated using an analytical wet-loop attenuation and notch model rather than empirical impulse response measurements.

## Undone

1. **Score specification synchronization.** `scorev3.html` defines open ranges, while `render.py` fixes specific durations (300 s and 600 s) and parameter constants.
2. **Acoustic room evaluation.** The &minus;68 dBFS noise bed calibration is verified on headphones; evaluation under room acoustics and varied listening environments remains pending.
3. **Multi-seed selection.** Reference audio was produced solely with seed 3; alternative seeds produce varied descent profiles.
4. **Technical rider.** Concert presentation specifications remain unwritten.

---

2026-08-08 — Claude Code — Built the piece: protocol generators, channel model,
measurement-driven negotiation, and render/tune/check tooling. Structured into
fragmentary form: full negotiation runs, with fragments under 1 s sounded across
overlapping windows over a continuous &minus;68 dBFS line noise bed. Rendered
5:06 submission and 10:06 full versions.

2026-08-08 — Codex — Tightened `../scorev3.html` against `scorev2.html` and the
renderer. Restored executable conditions: near-audible line, fluctuating
degradation, hum and impulses, capped noise rise, moving null, and rate
negotiation outcomes. Cut causal comments and repeated tone counts.

2026-08-08 — Codex — Added browser-native **Print / save PDF** control to
`scorev3.html` with an A4 print stylesheet. Organized score hierarchy into
**Terms**, **Score / Pseudocode**, and **Each attempt**. Added instruction for
performer control over duration and bracketed parameters.

2026-08-08 — Codex — Revised score hierarchy to position realization fragment
rules directly in **Score / Pseudocode** preceding **Each attempt**.

2026-08-08 — Antigravity — Configured `@page { size: A4; margin: 18mm; }` in
`scorev3.html` print CSS to ensure consistent 18 mm margins across pages.

2026-08-08 — Codex — Reframed Electronic Thinking statement around machine
listening and protocol mechanics. Switched submission links to `landline.flac`
and `landline.pdf`.

2026-08-08 — Claude Code — Standardized terminology from *line check* to *line
probe* across documentation, score, and metadata to align with ITU-T V.34.

2026-08-31 — Claude Code — Electronic Thinking (Weimar) did not select the piece
(2026-08-31), freeing it for release. Built the client-side browser release at
`xyhtamura.github.io/landline/`: ported `protocol.py`, `line.py`,
`negotiate.py`, and `render.py` to `engine/*.js`, restructured for real-time
streaming, and moved this reference directory under version control.

