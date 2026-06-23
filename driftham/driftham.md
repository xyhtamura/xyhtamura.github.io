# DriftHam

*a radio that wanders · leave it on, let it drift*

A single-file, browser-native internet-radio drift device. You press **tune in** and it wanders from station to station on its own — pulled live from the free [Radio-Browser](https://www.radio-browser.info/) community database — playing each for a while before drifting to the next. The whole machine is housed inside a breathing, glazed ham: the controls are organs clustered in its body, not a panel of widgets. It's a generative *listening toy* more than a player.

The visual register is Frutiger Aero gone wet and biological — glossy flesh, iridescent drift-sheen, marbled fat veins, a phosphor-green VFD readout. Strangeness disciplined into a device that reads as internally coherent.

---

## What it does

The core loop is **drift**: tune in → a station plays for a random interval → it crossfades or cuts to the next, on its own, until you stop it.

- **Auto-drift** through a randomized pool of stations, each held for a duration picked from your **drift range** (a dual-thumb slider, default 0:30–3:00).
- **Liveness gate.** Before committing to a station it confirms the stream actually produces audio; dead/errored streams are skipped silently. Static, dead-air, quiet, and AM-ish streams *pass on purpose* — noise is welcome, that's part of the texture.
- **Blend**: melt (crossfade, ~2.2s) or hard cut between stations.
- **Cure (hold)** freezes on the current station; the dial shows a ❄.
- **Drift on (skip)** jumps to the next station immediately.
- **Savor (like)** + a per-station **taste note**.
- **Tasting log** records everything heard with likes and notes; **wrap it up** exports it as a plain-text log (`driftham-log-*.txt`).
- **Dial readout** is a hashed pseudo-frequency — mostly FM, occasionally AM — derived from the station's identity. Purely decorative; it's not the real stream frequency.
- **Name ticker** at the bottom of the ham shows the current station; if the name is too long to fit it scrolls as a slow marquee (see below).
- **Session-only.** Nothing is persisted; the log lives in memory until you wrap it up.

Audio is plain `<audio>` over the stations' own HTTPS streams. No server, no build step — one HTML file.

---

## Anatomy

```
.fit                         viewport-filling, flex-centered, overflow:hidden
└─ .stage                    the fixed-size DESIGN canvas (520 × 760), transform:scale(s)
   ├─ .brand                 DriftHam wordmark + tagline
   ├─ .ham                   520 × 676 organic blob, overflow:hidden, breathing
   │  ├─ texture layers      .marble (SVG fractal noise) · .rim · .sheen · .gloss
   │  ├─ .layer-ui
   │  │  ├─ .screen          VFD: freq + signal bars, meta line, status line
   │  │  ├─ .organs          .dial (countdown ring + needle) + tune / drift / cure
   │  │  ├─ .controls        blend toggle · drift range · volume · taste · utility pills
   │  │  └─ .ticker          station-name marquee, pinned to the bottom
   │  └─ .logwrap            tasting-log overlay (slides up over the organs)
   └─ .credit-strip          radio-browser attribution
```

Everything that should grow together lives inside `.stage`. The ham's content sits in a centered **safe zone** (padding `100px 72px 148px`) because the blob's curved corners eat the rectangle near its edges — see *Fitting inside a border-radius blob* below.

---

## Features so far

| Area | Status |
|---|---|
| Random pool from Radio-Browser (4 mirrors, failover) | ✅ |
| Auto-drift with user-set interval range | ✅ |
| Liveness gate, dead-air/AM tolerant | ✅ |
| Crossfade / hard-cut blend | ✅ |
| Cure (hold) and Drift-on (skip) | ✅ |
| Savor (like) + taste notes | ✅ |
| Tasting log + text export | ✅ |
| Bottom name ticker with overflow marquee | ✅ |
| Hashed FM/AM dial readout | ✅ |
| Viewport-fit canvas scaling (proportion-locked) | ✅ |
| Reduced-motion fallback | ✅ |
| Persisted likes/log across sessions | ⬜ future |
| Real now-playing track metadata | ⬜ future (needs proxy) |
| Spectrum-reactive bars | ⬜ future (CORS-gated) |

---

## Reusable mechanic 1 — the "contain-fit" scaling canvas

> **The spec, in plain words:** if the viewport is wider than it is tall, the ham grows to the viewport's **height** (width follows proportionally); if it's taller than wide, the ham grows to the viewport's **width** (height follows). Either way the device and everything inside it keep their exact proportions.

This is `object-fit: contain` expressed as a single CSS transform. It's worth keeping as a pattern — any time you want a fixed composition to fill the viewport without reflowing, this is the move.

### The idea

Author the entire thing **once** at a fixed *design size* (here `DESIGN_W × DESIGN_H = 520 × 760`). Then compute a single scale factor and apply `transform: scale(s)` to the whole canvas. Because one transform scales every descendant — fonts, padding, SVG, gaps, border-radii — as a rigid unit, **internal proportions are preserved for free**. No media queries, no `rem` ladder, no per-element clamps.

### The code

```html
<div class="fit"><div class="stage" id="stage"> … </div></div>
```

```css
.fit   { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.stage { width:520px; height:760px; transform-origin:center center; }
```

```js
const DESIGN_W = 520, DESIGN_H = 760, MARGIN = 14;   // MARGIN = breathing gap from the edges
const stageEl = document.getElementById("stage");

function fit(){
  const availW = window.innerWidth  - MARGIN*2;
  const availH = window.innerHeight - MARGIN*2;
  const s = Math.min(availW / DESIGN_W, availH / DESIGN_H);   // ← contain
  stageEl.style.transform = "scale(" + s + ")";
}
window.addEventListener("resize", fit, { passive:true });
window.addEventListener("orientationchange", fit);
fit();
```

### Why `min()` is exactly the spec

`s` is the smaller of the two axis ratios, so the **tighter** axis decides the size:

- **Viewport wider than tall** (landscape) → `availH/DESIGN_H` is the smaller ratio → height-limited → the canvas grows until its **height** fills the viewport; width follows. *(Matches "grows to the viewport's height.")*
- **Viewport taller than wide** (portrait) → `availW/DESIGN_W` is smaller → width-limited → grows until its **width** fills the viewport; height follows. *(Matches "grows to the viewport's width.")*

`MARGIN` just shrinks the available box a little so the drop-shadow isn't clipped against the screen edge.

### Variants (keep these in your back pocket)

- **Cover instead of contain** (fill, allow crop): `Math.max(...)` instead of `min`. Pair with `.fit { overflow:hidden }` to clip the overflow.
- **Never upscale past 1:1** (sharp on huge screens): `const s = Math.min(1, Math.min(availW/DESIGN_W, availH/DESIGN_H));`
- **Pin to a corner** instead of centering: change `transform-origin` and the flex alignment together.

### Gotchas (the ones that actually bite)

1. **Measure layout in *design* pixels.** `offsetWidth`, `clientWidth`, `scrollWidth` are **unaffected** by the CSS transform — they report design-space px. Use them. The ticker's overflow test relies on this:
   ```js
   if (seg.offsetWidth > ticker.clientWidth - pad) { /* needs to scroll */ }
   ```
2. **`getBoundingClientRect()` returns *scaled* px.** If you need design-space px from it, divide by `s`. Mixing the two is the classic "my measurement is off by a factor of 0.83" bug.
3. **Pointer/drag still maps correctly.** Range thumbs, buttons, and clicks all work under `transform:scale` — the browser inverts the transform for hit-testing. You don't compensate manually.
4. **Centering is automatic.** `transform-origin:center` + flex-centering the unscaled box keeps the scaled box centered. `min()` guarantees it never exceeds the viewport, so nothing spills.
5. **Re-run on `resize` *and* `orientationchange`,** and once on boot. That's the whole lifecycle.
6. **Reduced motion is irrelevant here** — a static layout scale isn't animation, so it's safe to leave on.

---

## Reusable mechanic 2 — fitting inside a border-radius blob

The ham is a soft organic shape made entirely with `border-radius`. Its corners curve *inward*, so a rectangular child placed near an edge gets sliced by `overflow:hidden`. To keep the organs inside the flesh you have to know where the real boundary is. This math is reusable for any rounded/blobby container.

### How percentage `border-radius` reads

```
border-radius: hTL hTR hBR hBL / vTL vTR vBR vBL;
```

The four values **before** the slash are the *horizontal* radii (resolved against **width**); the four **after** are the *vertical* radii (resolved against **height**). Order is always **TL, TR, BR, BL**. Each corner is a quarter-ellipse with its own `rx` (horizontal) and `ry` (vertical).

DriftHam's ham:

```
border-radius: 48% 52% 43% 57% / 40% 42% 58% 60%;
```

So, on a `520 × 676` box: TL = `(0.48·520, 0.40·676) = (250, 270)`, and so on.

### "Radius loss" — why things clip

On any edge, the two corner radii along it consume part of that edge. **If they sum to 100% of the side, there's no straight segment left — the whole edge is a curve.** DriftHam is the extreme case: every pair sums to *exactly* the side length, so there are **no straight edges at all** — it's a pure blob. That's why a full-width screen at the top clips: at the screen's top corners the flesh boundary has already curved down ~100px, but a naive top padding only pushed it down ~44px.

> **Normalization caveat:** if a side's two radii would exceed its length, CSS scales *all* radii down by a single factor `f = min(side / (r₁+r₂))` across all four sides. Compute `f` first and multiply every radius by it before doing geometry. (For the ham, `f = 1`.)

### The boundary equation

For the **top edge**, the top-left quarter-ellipse is centered at `(rx, ry)` and the top-right at `(W−rx', ry')`. The upper branch of each ellipse gives the boundary `y` at a given `x`:

```
topY(x) = ry − ry · √( 1 − ((x − cx) / rx)² )
```

…with `(cx, rx, ry)` taken from whichever top corner `x` falls under. The bottom edge is the mirror (lower branch, measured up from `H`). The boundary is **highest (least headroom) at the corners** and dips toward the centre peak — which is exactly why corners clip first.

### Finding the safe rectangle

For a symmetric side inset `Px`, the binding constraints are the rectangle's four corners:

```
topPad    ≥ max( topY(Px), topY(W−Px) )
bottomPad ≥ H − min( botY(Px), botY(W−Px) )
```

Reusable solver:

```js
// largest axis-aligned rectangle inside a CSS %-border-radius box
const W = 520, H = 676;
const h = { tl:.48, tr:.52, br:.43, bl:.57 };   // horizontal radii (fractions of W)
const v = { tl:.40, tr:.42, br:.58, bl:.60 };   // vertical radii   (fractions of H)

const f = Math.min(1,                            // CSS overlap normalization
  W/((h.tl+h.tr)*W), W/((h.bl+h.br)*W),
  H/((v.tl+v.bl)*H), H/((v.tr+v.br)*H));
const RX = k => h[k]*W*f, RY = k => v[k]*H*f;

const topY = x => x <= RX('tl')
  ? RY('tl') - RY('tl')*Math.sqrt(Math.max(0, 1-((x-RX('tl'))/RX('tl'))**2))
  : (cx => RY('tr') - RY('tr')*Math.sqrt(Math.max(0, 1-((x-cx)/RX('tr'))**2)))(W-RX('tr'));

const botY = x => x <= RX('bl')
  ? (H-RY('bl')) + RY('bl')*Math.sqrt(Math.max(0, 1-((x-RX('bl'))/RX('bl'))**2))
  : (cx => (H-RY('br')) + RY('br')*Math.sqrt(Math.max(0, 1-((x-cx)/RX('br'))**2)))(W-RX('br'));

const safeBox = Px => {
  const top = Math.max(topY(Px), topY(W-Px));
  const bot = Math.min(botY(Px), botY(W-Px));
  return { width:W-2*Px, height:bot-top, topPad:top, bottomPad:H-bot };
};
```

Running it across side insets shows the tradeoff that drove the layout:

| side inset `Px` | safe width | safe height | top pad | bottom pad |
|---:|---:|---:|---:|---:|
| 56 | 408 | 397 | 111 | 168 |
| 64 | 392 | 422 | 100 | 154 |
| **72** | **376** | **444** | **91** | **141** |
| 80 | 360 | 465 | 82 | 128 |

**Narrower side inset → wider but shorter safe box; wider side inset → narrower but taller.** DriftHam uses `Px = 72`, giving a `376 × 444` interior. The padding ships as `100 / 72 / 148` rather than the bare `91 / 72 / 141` minimum — see *animation* below.

### Account for animated radii

The ham **breathes** — its radii animate between two states on a 9s loop:

```
0%, 100%:  48% 52% 43% 57% / 40% 42% 58% 60%
50%:       52% 48% 47% 53% / 43% 45% 55% 57%
```

A child fits *only if it fits in every frame*. The practical rule: **run the solver on the deepest-corner state** (the one with the largest relevant `ry`), or just add a safety margin over the static minimum. Here the breathe state deepens the top dome by ~9px, so top padding goes `91 → 100`; bottom is padded `141 → 148`. Lifting the bottom-most element higher (the ticker's `margin-bottom:24px`) buys the same clearance from the other direction.

### Practical recipe

1. Write out the eight radii as fractions; compute `f`; multiply through.
2. Pick a side inset `Px` and read off the safe box with the solver.
3. Set the container padding to `[topPad] [Px] [bottomPad]`, adding a few px if the radii animate.
4. Make the content stack *fit that height* — shrink type/gaps until it does, rather than letting it overflow the curve.
5. If the safe box is too cramped, your levers are: **ease the corner radii** (opens a wider band, but changes the silhouette), **narrow `Px`** (wider/shorter), or **accept some intentional clip** as texture.

---

## Implementation reference

| Constant | Value | Note |
|---|---|---|
| `DESIGN_W × DESIGN_H` | `520 × 760` | the authored canvas |
| ham | `520 × 676` | `flex:0 0 auto` (deterministic, not flex-grown) |
| ham padding (safe zone) | `100 72 148` | derived above |
| safe interior | `~376 × 444` | where the organs live |
| `MARGIN` | `14` | edge gap so the shadow shows |
| `XFADE_MS` | `2200` | crossfade duration |
| `LIVE_TIMEOUT_MS` | `8000` | give-up time per station probe |
| `MAX_TRIES` | `7` | station probes before re-pooling |
| `TK_SPEED / TK_GAP` | `42 px·s⁻¹ / 70px` | marquee speed (design-space) and loop gap |
| pool query | `…/json/stations/search?hidebroken=true&order=random&limit=700` | filtered to playable HTTPS, non-HLS, last-check-OK |

**The marquee, briefly:** on each station change, render the name into one `.tk-seg`, then in a `requestAnimationFrame` compare `seg.offsetWidth` to the ticker's inner width. If it overflows, clone the segment (with a `TK_GAP` right pad) so the track holds two copies, set `--dur = unit / TK_SPEED`, and animate `translateX: 0 → −50%`, which loops seamlessly. If it fits, it sits centered and static. Speed is constant in design space, so it reads the same at any viewport size.

---

## Future directions

Held loosely — directions, not commitments.

**Listening / behavior**
- **Pool seeding** by genre, country, tag, or a "mood" — bias the random pool instead of pure chance.
- **Sleep timer** with a long fade-out; "drift me to sleep."
- **Confirmed-noise gate (optional):** a Web Audio RMS read to distinguish *has-signal* dead-air from truly silent streams — only if you ever want to filter the silent ones out, since right now keeping them is the point.
- **Shareable session:** encode the tasting log into a URL so a drift can be handed to someone else.

**Display / metadata**
- **Real now-playing track** via Icecast/SHOUTcast ICY metadata. Caveat: browser `<audio>` can't read ICY headers directly — needs a tiny proxy or the station's companion API. Worth a spike.
- **Drift map:** plot each station's country as you pass through it; the log becomes a route.
- **Per-station tint:** let the ham's sheen or rim pick up a hue hashed from the station, so the body subtly shifts as it drifts.

**Reactive visuals**
- **Spectrum/waveform bars** driven by a real `AnalyserNode`. Caveat: cross-origin streams without permissive CORS headers feed the analyser **silence**, so this works only for CORS-friendly stations or via a proxy. Document the limitation rather than ship something that looks broken on most stations.
- **Signal-reactive breathing:** tie the breathe rate or gloss to volume/level.

**Persistence & polish**
- **Keep likes/log across sessions** (localStorage or IndexedDB — fine in a standalone file; *not* in a Claude artifact sandbox).
- **Keyboard shortcuts** (space = tune/stop, → = drift, ↑↓ = volume) and a focus-visible/a11y pass on the custom controls.
- **A "cured shelf":** pin savored stations so a future session can revisit them directly.

---

*Stations via the free [radio-browser](https://www.radio-browser.info/) community database. Built as a single self-contained HTML file.*
