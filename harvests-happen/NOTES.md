# Harvests Happen

The page for the work *Harvests Happen*: the goblincore scene from
[renderedwork/goblincore](../../renderedwork/goblincore/NOTES.md), drawn live,
with its music looping in Web Audio. Locally it is at
`http://localhost:8000/xyhtamura.github.io/harvests-happen/`; on the site,
`https://xyhtamura.github.io/harvests-happen/`. Every path in the page is
relative, so both resolve.

## Why the page draws the scene instead of playing the video

The music has to loop without a gap. A `<video loop>` or `<audio loop>`
restarts by seeking, and with AAC the encoder's padding adds silence as well,
so the seam can be heard. Here the music is decoded once into a buffer of
exactly 661,500 samples (15.000 s at 44.1 kHz) and looped by an
`AudioBufferSourceNode`, which repeats a buffer with no gap. While it plays,
`player.js` draws each frame at the music's position (the audio clock less
output latency) through the engine's `window.goblinAt(seconds)`, so picture and
sound cannot drift apart. Without sound, the engine runs on its own clock.

The AudioContext runs at 44.1 kHz so the buffer is never resampled; resampling
it would treat the loop's ends as edges. The browser resamples the output
stream instead, which has no seam.

Without WebGL 2, or if the scene fails to load, the page shows
`harvests-happen.mp4` instead and says that its sound may pause where it loops.

## Files

| File | Holds | Written by |
| --- | --- | --- |
| `index.html`, `style.css`, `player.js` | The page, and the music loop and clock | Hand, here |
| `engine/goblincore.js`, `engine/export.js` | The scene engine, stamped copies | `publish_site.py` |
| `data/`, `scene.json`, `motion.json` | Scene data | `publish_site.py` |
| `harvests-happen.flac` | The 15 s music loop, 24-bit | `make_loop_audio.py`, then `publish_site.py` |
| `harvests-happen.mp4`, `poster.jpg` | One pass of the loop with music, 1920×1270; its first frame | `publish_site.py --webm` |
| `manifest.json` | Source path and SHA-256 prefix of every copied file | `publish_site.py` |
| `ASSETS.md` | Credits and licences | Hand, here |

The engine reads its settings from a hidden form in `index.html`, holding the
values the work was approved at (idle motion 45%, plant hue −14°, redraw 10 px
at 8 per second, creature muting 45% and lift 35%). Changing a setting means
changing it there, not in the engine.

## Refresh after changing the scene or the music

From `renderedwork/goblincore/`:

```bash
python scripts/make_loop_audio.py
python scripts/publish_site.py --webm renders/goblincore-loop-1920x1270-30fps.webm
```

The WebM is a fresh export from the goblincore page's *Export loop*. Commit the
changed files here afterwards.

## Record

2026-10-18 — Claude Code — Built the page at Xyh's request. The music loop is
the first 15 s of `goblincore.wav` with the ring-out after 15 s added back onto
the start, so one pass's tail sounds under the next pass's opening. Checked: the
browser decodes the FLAC to 661,500 samples; the step across the seam is 0.002
(left) and 0.006 (right) against steps up to 0.65 inside the music. Pressing
*play with sound* with a real click started the music and handed the picture
to the audio clock, which then advanced 0.068 of the loop per second (1/15 is
0.067). No console errors. At 375 px wide the canvas is 343×227 with no
sideways scroll. The fallback video first showed under the canvas because the
stylesheet's `display: block` overrode `hidden`; fixed with a `[hidden]` rule
and rechecked.

Not checked: the no-WebGL fallback path was not triggered, and the loop was not
listened to by anyone. The index, portfolio data, CV, and portfolio summaries
are left to Antigravity, at Xyh's instruction.
