# Lamp for Stilling the Sun — Dreamachine (RECEPTION pole)

*Title and folder name settled 2026-07-23.*

Part of the occult-tools-suite (`../occult-tools-suite.md`, tool #1). The literal
historical sibling of the cut-up — Gysin invented both. Completes the Gysin diptych
`cutline/` started. Browser flicker at alpha, eyes-closed, driving phosphene trance.
Keyless, offline-capable, serve-from-root, copyleft — family idiom.

## Base (from suite doc)

- `requestAnimationFrame` flicker; frequency slider (8–13 Hz core, extend 4–18).
- Brightness / duty-cycle controls.
- Optional radial/mandala mask so closed-eye phosphenes have structure.
- **Photosensitivity warning gate on entry — non-negotiable.** Full-screen consent
  before any light; hold-to-enter, no auto-play, epilepsy risk stated plain.
- Optional webcam-feedback moiré mode (reuse `../moire/`).
- No network needed by default.

## The twist (why this one is Xyh's, not a generic strobe)

Governing move: **anti-lattice, applied to time.** A stock Dreamachine is a metronome —
one pure square wave at a fixed rate. That is exactly the discretized lattice the whole
practice resists. So:

1. **Drift, don't lock.** The flicker breathes. Frequency wanders inside a set band
   (slow LFO / random-walk over the slider value), instead of a rigid clock. Same stance
   as the beating-is-like-color note: the flutter/roughness is the instrument, not error
   to be smoothed. Add a **"lock ⇄ drift"** control (0 = pure metronome, 1 = free wander)
   and a **duty-cycle jitter** so the on/off edge isn't perfectly clean.

2. **Operate, don't induce.** Framing + defaults assume a user who already goes under at
   will. This is a *tuning* instrument — steer an accessible state, not brute-force a
   naive one. Gentle ramps, a "hold" to sustain a found frequency, no aggressive presets
   up front. It is meant to be *operated*, not shipped as a novelty.

3. **The field breathes the light (optional, off by default).** Feed the drift LFO from
   live network-entropy — the suite's keyless "the field answers" spine (reuse cutline's
   fetch layer / the future shared module). Toggle: `Math.random` walk ↔ field-seeded
   walk. "The field casts the flicker." Purely optional so the core stays fully offline.

4. **Frozen light aesthetic (Apollo / still sunlight).** Not a clinical white strobe.
   Warm, no-pure-white/no-pure-black substrate (design fallbacks); the light reads as
   *chopped sun* — Apollo's "still sunlight / frozen light," his oracular frenzy the state
   it serves. Mask geometry curated, not a regular tiling.

5. **Marbling / oceanic moiré (sirens register).** The webcam-feedback mode isn't a
   gimmick — route it toward fluid, non-repeating marble/moiré (Jaffer-marbling adjacent),
   the oceanic underside-muse register. Feedback + slow rotation, not a fixed grid.

## Safety constraints (binding)

*Added 2026-07-25.*

- **Eyes closed is the instrument's mode of use**, not a suggestion. Stated on
  the consent gate and in the idle field. The graphics are an aperture for the
  eyelid, not a picture. This also bounds what the mask can usefully do: closed
  eyelids low-pass hard, so only large-scale luminance survives — fine detail is
  invisible in the mode the tool is actually for.
- **No saturated-colour flicker.** Red/blue alternation is judged against a
  separate and stricter threshold than luminance flashing (Harding / ITU-R
  BT.1702); a brightness cap constrains luminance only and does nothing for it.
  An "iridescent" mode existed briefly and was **removed 2026-07-25** for this
  reason — the consent gate was warning about a milder stimulus than the mode
  delivered. If colour ever returns, it must be low-saturation, or rate-limited
  well below the alpha band, and the gate copy must be rewritten to match.
- Brightness stays capped below full display intensity, with a slow ramp in.

## Controls (summary)

| control | range / behavior |
|---|---|
| frequency | 4–18 Hz, core 8–13 highlighted |
| lock ⇄ drift | 0 metronome → 1 free wander (LFO/random-walk depth) |
| duty jitter | edge softness / on-off ratio noise |
| brightness | 0–max, capped below harsh |
| light temperature | 1800–10000 K, warm substrate; no saturated-colour mode |
| mask | none / radial / mandala (curated forms, not tiled) |
| entropy source | offline random-walk ↔ field-seeded (network) |
| moiré mode | off / webcam-feedback marble |

## Build

~a weekend for the core (RAF flicker + drift LFO + gate + slider). Moiré mode reuses
`../moire/`. Field-entropy toggle reuses cutline's fetch spine — cheap once that lands.
No build step; single `index.html` + css in the family idiom (cf. `moire/`, `cutline/`).

## Open (known, not yet done)

- **Mandala contradicts §4 of this spec.** It is currently a `repeating-conic-gradient`
  — a regular tiling — plus an arbitrary star `clip-path`. It should instead be
  generated from the same walk that drives the flicker: irregular arm angles
  `θ_k = 2πk/N + ε_k` drawn from the entropy pool, radii on slow LFOs, rotating at
  a rate not harmonic with the flicker so aperture and light beat against each
  other. Near-symmetry, never exact. Render as SVG/canvas in a 0–100 square viewBox.
- **Feather is asymmetric.** The edge softening measures distance only to the
  `duty` edge, so the off→on transition at `phase = 0` is hard while on→off is
  soft. Needs circular distance `min(phase, |phase − duty|, 1 − phase)`.
- **Flicker is quantised to the display refresh.** At ~60 Hz only `f = 60/n` is
  expressible cleanly; everything else snaps its edges to the 16.67 ms grid,
  which injects uncontrolled period error that competes with the deliberate
  jitter. Fix is a box filter: set per-frame luminance to the exact average of
  the square wave over the frame interval, so perceived rate and duty stay true
  off-grid (modulation depth then falls off toward Nyquist, correctly).

## Rendering notes

- Light and mask layers are sized to a **square** (`aspect-ratio: 1` with
  `min-width/min-height: 100%`, centred and overflowing the field) so that every
  percentage inside them resolves against equal axes. Previously they filled the
  rectangular field, so `ellipse` gradients, `background-size` percentages and
  the `clip-path` polygon all stretched with the window's aspect ratio.
  `container-type: size` was tried first and rejected — it strips the field's
  content-based sizing and collapsed its height.

## Reuse / dependency notes

- `../moire/` for webcam-feedback moiré. Read-only reuse for now.
- Future shared network-entropy module (see suite doc "Shared substrate note") —
  field-seeded drift sits on it. Not built yet; keep the toggle isolated so core is
  offline-pure. If that shared module lands, update `../DEPENDENCIES.md`.

## Title

*Lamp for Stilling the Sun*. Folder slug: `lamp-for-stilling-the-sun`.
