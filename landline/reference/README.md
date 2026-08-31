# reference — the Python renderer

The first implementation of *a landline imagining a line probe during a storm*,
and the one the browser engine is checked against. It made the 5:06 and 10:06
fixed renderings in August 2026, and the 5:06 is what was sent to Electronic
Thinking.

It is here because it was nowhere: it lived in `F:\xyh\line-probe\`, which is
outside every repository, so losing that folder would have lost the method with
no history to recover it from.

[NOTES.md](NOTES.md) is the build record — what the piece is, why it is built
this way, the one coupling to understand before editing, the nine
self-contradictions found and fixed, and the known simplifications. Read it
before changing any of these files.

| File | Role |
| :-- | :-- |
| `protocol.py` | Signal generators from the Recommendations: ANSam, V.21 FSK, the V.34 probe comb. Frequencies and durations cited inline. |
| `line.py` | The subscriber loop: frequency response, noise bed, and the receiver-side measurement. |
| `negotiate.py` | Measurement → mode. The only place the ladder is decided. |
| `render.py` | Attempts, fragmentation, scatter, storm curve, 24-bit WAV + JSON log. |
| `tune.py` | Fits `--ceiling` to the measured failure point. Run after any change to the noise floor, channel model or ladder. |
| `check.py` | Level and headroom report, and a spectrogram. Uses PIL, not matplotlib. |
| `line-probe-5.json`, `line-probe-10.json` | The logs of the two fixed renderings: every attempt with its measurement and negotiated mode, and every fragment with its source, position and length. They record the parts of the process that were never sounded. |

Needs `numpy`, and `pillow` for `check.py`. Nothing else.

```bash
python tune.py                                                   # fit the ceiling
python render.py --seconds 300 --seed 3 --out line-probe-5.wav   # the 5:06
python render.py --seconds 600 --seed 3 --out line-probe-10.wav  # the 10:06
python check.py line-probe-5.wav
```

Renders are not committed — see `.gitignore`. Both fixed renderings are on the
page one level up as FLAC and MP3.

## Its relationship to the browser engine

`../engine/*.js` is a port of `protocol.py`, `line.py`, `negotiate.py` and
`render.py`. The two do not share a random number generator and cannot be made
to, so they are held together by checks instead:

```bash
cd ../tools
python dump_reference.py > reference.json   # reads this folder
node compare.mjs reference.json             # 59 checks
```

`reference.json` is committed, so the check runs without Python; regenerate it
only when something here changes. `../NOTES.md` sets out what is compared
exactly, what is compared in distribution, and the four places the browser's
arithmetic departs from this renderer.

**If you change this folder, the JavaScript is now stale, and so is the score.**
`../scorev3.html`, these modules, and `../engine/` are three statements of the
same procedure and can drift apart silently.
