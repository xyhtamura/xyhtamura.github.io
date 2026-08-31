# reference — the Python renderer

This directory contains the Python reference implementation for *a landline imagining a line probe during a storm*, used to validate the client-side JavaScript engine. It generated the 5:06 and 10:06 reference audio renderings in August 2026.

[NOTES.md](NOTES.md) provides the complete synthesis log, design rationale, parameter couplings, resolved model inconsistencies, and documented simplifications. Read it before modifying any files in this directory.

| File | Role |
| :-- | :-- |
| `protocol.py` | ITU-T signal generators: ANSam (V.8), FSK (V.21), and the V.34 probe comb. Frequencies and durations cited inline. |
| `line.py` | Subscriber loop channel model: frequency response, noise bed, and receiver-side spectral estimation. |
| `negotiate.py` | Rate ladder mapping measured channel bandwidth and SNR to modem operational modes. |
| `render.py` | Batch performance renderer: connection scheduling, fragmentation, scattering, and 24-bit WAV export with JSON logs. |
| `tune.py` | Calibration tool fitting `--ceiling` to channel failure thresholds. Run after modifying noise floor or channel parameters. |
| `check.py` | Headroom, level auditing, and spectrogram generation utility using Pillow. |
| `line-probe-5.json`, `line-probe-10.json` | Execution telemetry for the 5:06 and 10:06 reference renderings. |

Dependencies: `numpy` (DSP and synthesis) and `pillow` (`check.py` spectrogram rendering).

```bash
python tune.py                                                   # Calibrate failure ceiling
python render.py --seconds 300 --seed 3 --out line-probe-5.wav   # 5:06 reference rendering
python render.py --seconds 600 --seed 3 --out line-probe-10.wav  # 10:06 reference rendering
python check.py line-probe-5.wav                                 # Audit levels and generate spectrogram
```

Audio render outputs (`*.wav`) are excluded by `.gitignore`. The reference renderings are available in the parent directory as FLAC and MP3 files.

## Relationship to the browser engine

The JavaScript engine in `../engine/` ports `protocol.py`, `line.py`, `negotiate.py`, and `render.py`. Because the implementations use distinct random number generators, consistency is maintained through test suites:

```bash
cd ../tools
python dump_reference.py > reference.json   # Export reference vectors
node compare.mjs reference.json             # Run 59 validation assertions
```

`reference.json` is committed to the repository. Re-export test vectors only when modifying reference DSP logic. See `../NOTES.md` for deterministic assertions, statistical distribution checks, and architectural differences in the browser engine.

Modifications to this reference implementation require updating both `../engine/` and `../scorev3.html` to prevent specification drift.
