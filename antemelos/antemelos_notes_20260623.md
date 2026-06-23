# Antemelos — Tool Notes & Emission Contract

*Notes for the **Antemelos v2 MVP**: what it is, the `.tabota` it emits, the
generator that produces it, and the decisions behind both. Unlike
`binlod_design_notes_20260623.md` (contract before code), this tool is **built**
— so this doubles as a reference and a conformance description of its output.
Read alongside `tabota_schema.json`, `tabota_handover_20260616.md`, and the
Binlod notes.*

*Lineage note: Antemelos is the **second** instance of the
`generator → events → sink` abstraction named in Binlod §2. Binlod is the
**rate-curve** generator (λ(t) integrated → grain instants). Antemelos is the
**pitch-lens** generator (a contour drawn under the pitch chart). Same engine,
different lens. Where Binlod is the first *reader* of a shared Tabota core,
Antemelos is the first *writer* — together they bracket the format from both
ends.*

---

## 0. What it is

Antemelos is a **hertz-native, scale-free, monophonic melody generator**. It
produces vocal lines that are singable but never settle — melody *before*
scale, tuning, or fixed form. Its output is a continuous pitch filament over a
seconds clock: held tones are flat, slides are sloped. It is a **pure emitter**
— it generates, plays, and writes files; it does not import Roll's runtime.

It belongs to two projects at once:

- **Eosforos** — a track/tool in the Hadean intermedia suite (with *Init*,
  *Roil*, *Theia*, *Hadean Flare*). The primordial, pre-form voice.
- **Tabota** — a generator citizen whose authored master is `.tabota`.

---

## 1. Positioning: two orbits, two radii

The two memberships are not a conflict; they are two **distances** from the same
tool:

- **Eosforos-orbit Antemelos = an emitter.** The only coupling to Tabota is a
  *file format*. Self-contained, ships next to Hadean Flare, needs nothing
  installed. This is the MVP.
- **Tabota-orbit Antemelos = a peer view** (later). Imports the shared core
  (`tabota-resolve.js` + primitives) to preview/realize the line on a mini-roll.
  This is the read-only enrichment; it inherits B-layer changes for free, and
  only needs cross-page state if Antemelos must ever *write live* (it doesn't).

**Rosetta, pointed downstream.** Antemelos emits pitches no scale can hold —
that is its reason to exist. So `.tabota` is not the lossy export here, it is
the **only lossless home**; MIDI is the lossy rung. The fidelity ladder inverts
the way the thesis predicts: Hz-native master, scales/MIDI as projections.

---

## 2. Locked decisions (v2 MVP)

| decision | choice | why |
|---|---|---|
| coupling | **pure emitter** | loosest possible; "Roll is one client, not the definitive one" |
| pitch | **Hz + slides** | discrete targets keep it singable; slides keep it unstable |
| voice | **monophonic** | one channel — keeps pitchbend trivial, defers the MPE rung |
| determinism | **baked** | generator runs once; the events are the score; seed reproduces it |
| extension | **`.tabota`** | `.tab` is overloaded (tablature, TSV); `.tabota` is unambiguous |
| theme | **dark** | first dark-mode Tabota app; "before everything," inherited from Eosforos |

---

## 3. The emission contract (`.tabota`) — load-bearing

One **chronological / frequency** section: a seconds clock (no meter), an Hz
axis (no scale). The melody is a chain of **LineEvents**. A flat segment
(`startYValue == endYValue`) is a held tone; a sloped segment is a slide, shaped
by `interpolation`. Held tones are degenerate slides — the line is one
continuous filament.

Validates strictly against `tabota_schema.json` (v1.5).

### Shape

| field | value |
|---|---|
| `languageVersion` | `"1.5"` (the format version — *not* Roll's "v2" app architecture) |
| `score[0].temporalRegime` | `"chronological"` |
| `score[0].regimeSettings` | `{ duration: <total seconds>, units: "seconds" }` |
| `score[0].axisMode` | `"frequency"` |
| `score[0].defaultEventType` | `"line"` |
| each event | `{ type:"line", id, startTime, endTime, startYValue:<Hz>, endYValue:<Hz>, interpolation }` |
| `interpolation` enum | `linear · exponential · ease-out · ease-in-out` (the shapeK vocabulary) |
| seed / a4 / Hz range | parked in `metadata.antemelos` (see §3.1) |

### Example (a single 2-note phrase: hold → glide → hold)

```json
{
  "projectName": "Antemelos line",
  "languageVersion": "1.5",
  "author": "Xyh",
  "created": "2026-06-23T…Z",
  "metadata": {
    "description": "A hertz-native, scale-free monophonic vocal line …",
    "tags": ["antemelos","eosforos","microtonal","vocal","chronological","frequency"],
    "antemelos": { "seed": 42, "a4": 432, "hzRange": [213.497, 216.92],
                   "generator": "antemelos-v2", "params": { /* see §4 */ } }
  },
  "score": [{
    "sectionId": "antemelos-line",
    "temporalRegime": "chronological",
    "regimeSettings": { "duration": 2.802, "units": "seconds" },
    "axisMode": "frequency",
    "defaultEventType": "line",
    "events": [
      { "type":"line","id":"seg0","startTime":0,    "endTime":0.65, "startYValue":213.497,"endYValue":213.497,"interpolation":"linear" },
      { "type":"line","id":"seg1","startTime":0.65, "endTime":0.981,"startYValue":213.497,"endYValue":216.92, "interpolation":"ease-in-out" },
      { "type":"line","id":"seg2","startTime":0.981,"endTime":2.802,"startYValue":216.92, "endYValue":216.92, "interpolation":"linear" }
    ]
  }]
}
```

### 3.1 Why `modeSettings` is omitted (a real schema finding)

The schema's `modeSettings` `oneOf` is **non-exclusive**: `InstructionalSettings`
is `{"type":"object"}`, which matches *any* object, so a `frequency`
`modeSettings` block validates against three branches at once → `oneOf` fails.
To keep the emitted file strictly valid, Antemelos **omits `modeSettings`** and
parks `a4` / Hz-range / seed in `metadata.antemelos` instead.

**Consequence:** until a reader consults that metadata, it falls back to the
`FrequencySettings` defaults (20 Hz – 20 kHz), so a ~150–400 Hz line renders as a
thin band.

**Fix (for the schema, later):** make the settings subschemas mutually
exclusive — e.g. add `"required": ["minHz"]` to `FrequencySettings`, add
`"additionalProperties": false` to each settings block, or introduce an explicit
discriminator key. Once fixed, Antemelos can emit `modeSettings: { minHz, maxHz,
a4 }` directly and drop the metadata workaround.

---

## 4. The generation model (reproducible)

Deterministic from `(params, seed)` via a `mulberry32` PRNG. The seed is written
into the file, so any `.tabota` reproduces exactly.

**Per phrase (a breath):**

1. Pick a **contour arc** — `arch | fall | rise | wave`.
2. Walk pitch targets in **octave space** (log-Hz, so steps are perceptually
   even). Each step = a Gaussian increment scaled by `stepSemis`, widened by
   `instability`, plus an arc bias; with small probability a leap; plus a
   microtonal wobble proportional to `instability`. Targets reflect softly off
   the ambitus floor/ceiling. **No scale attractor anywhere** — that absence
   *is* the primordial quality.
3. Assign durations in seconds (`durMin..durMax`), with phrase-final
   lengthening.
4. Emit each note as **hold + (optional) glide-to-next**. `glideAmount` splits
   the note's time between the flat hold and the slide into the next target:
   `0` = stepped tones, `1` = near-constant portamento.
5. A breath rest (`breathMin..breathMax`) separates phrases — a gap in the
   filament, not a segment.

**Param reference**

| param | default | UI range | meaning |
|---|---|---|---|
| `centerHz` | 196 | 80–500 | tonal center of the voice (~G3) |
| `ambitusSemis` | 14 | 4–36 | total span (a range, **not** a scale) |
| `a4` | **432** | 396–466 | reference; off-440 on purpose (predates the standard) |
| `phrases` | 4 | 1–10 | breaths |
| `notesMin/Max` | 3 / 7 | 1–10 / 1–12 | notes per phrase |
| `stepSemis` | 2.2 | 0.5–8 | mean interval magnitude (small = singable) |
| `instability` | 0.35 | 0–1 | 0 = steady & near-tonal · 1 = wandering & detuned |
| `glideAmount` | 0.55 | 0–1 | 0 = stepped · 1 = portamento-saturated |
| `glideShape` | ease-in-out | enum | slide curve → `interpolation` |
| `durMin/Max` | 0.45 / 1.3 s | 0.15–2 / 0.3–3.5 | note length |
| `breathMin/Max` | 0.4 / 1.1 s | 0–2.5 / 0.2–4 | rest between phrases |
| `vibrato` | 0.4 | 0–1 | **synth only** — not part of the baked pitch |

`glideShape` → `interpolation`: smooth=`ease-in-out`, linear=`linear`,
exponential=`exponential`, log-like=`ease-out`.

**Presets:** *whisper* (low, soft, near-tonal) · *keening* (high, long glides,
wailing) · *drift* (slow, sparse, wandering) · *roil-before-roil* (chaotic,
leaping, wide).

---

## 5. Exports

- **`.tabota`** — the master (§3). Open in Tabota Roll. Lossless.
- **MIDI + pitchbend** — the lossy convenience rung. SMF format 0, one channel.
  Per phrase: one sustained note (base = nearest semitone to the phrase mean) +
  a continuous pitchbend stream tracking the contour. Bend range (±2…±48) is
  written via **RPN 0,0** so the receiver agrees; user-selectable. Mono means no
  MPE needed. The high-fidelity MIDI path remains *Roll's realizer reading the
  `.tabota`* — Antemelos's MIDI is the standalone-Eosforos convenience.

`vibrato` is a **playback** property of the synth voice; it is intentionally not
baked into the pitch curve, so it never enters either export.

---

## 6. Controls (quick reference)

`Generate` re-rolls a fresh seed. `Play` schedules the baked contour through the
voice synth (saw pair → parallel formant bandpass → lowpass → amp, with vibrato
LFO + gated breath noise). The **stage** draws the filament over drifting plasma;
the playhead sweeps during playback. `octave hints` toggles ghosted,
non-binding octave lines (off by default — the grid does not exist here yet).
Every value is editable where it is shown (scope-as-door); sliders and number
fields stay in sync.

---

## 7. Design language (1/3 each, on different layers)

Tabota is light/warm/paper; Eosforos is dark/magma — near negatives. Averaging
them on every layer gives mud, so each parent wins **different layers**. The
shared substrate is **warmth**: Roil's blacks are warm browns, so Antemelos
lives in **warm darkness — Tabota's warmth at Eosforos's value**.

- **Eosforos third** (mood + membership): warm-dark ground; magma-orange/ember +
  deep indigo-void straight off the album cover; a whisper of scanline/film
  grain; the terse instrument register.
- **Tabota third** (credibility + voice): editor discipline (labeled fields,
  scope-as-door, no separate inspector); **IBM Plex Mono** for Hz readouts
  (mono is right for frequency); **Fraunces** italic as the display face — a
  literary serif reads as *song*, the one thing Antemelos is about; the 田 motif.
- **Antemelos third** (its own thing): blur, continuous gradient, and the
  **absent grid**. Pitch is continuous Hz, time is pre-metric, so the grid
  doesn't exist yet — the cover's blurred plasma renders "pre-grid," and the
  **田 dissolves** into the gradient: the paddy *before* cultivation.

A single green thread runs through all three (Roil's `--value` sage, Hadean's
`--phos`, the Tabota sage/plum), so the Hz readout glows sage-green and satisfies
every parent at once.

---

## 8. Verification & build provenance

- **Proven in Node** (jsonschema accept suite + invariants): 227/227 across 9
  parameter regimes × 5 seeds. Asserts: schema conformance against the real
  `tabota_schema.json`; monophonic (no overlapping events); times forward; Hz
  finite & positive; section `duration` conserves the last event; sampler
  in-bounds; MIDI well-headed.
- **One source of truth:** the generator/serializer/emitter live in
  `antemelos-core.js` (pure, DOM-free). The same file is injected verbatim into
  the browser shell at build, so "proven in Node" == "what the browser runs."
  Both script blocks pass `node --check`.
- **Needs browser feel-test:** whether the voice *sounds* primordial-but-
  singable; whether the presets land; whether the `.tabota` opens cleanly in
  Roll and renders in the right Hz band (see §3.1).

---

## 9. On the horizon (deferred past the MVP)

- **Generative mode** (the lore-exact one). Store the *generator spec + seed*
  rather than baked events; re-roll at playback. "A melody never the same line
  twice" — Antemelos becomes the first genuinely **generative** Tabota citizen,
  the achronous/Cage reach landing on the single most appropriate object. Same
  DOF resolution as Binlod §8: pin the phrase boundaries (extent fixed, seconds
  conserved), indeterminacy lives inside.
- **Tabota-orbit peer view:** import the shared core to realize the line on a
  mini-roll and route MIDI through Roll's realizer (the high-fidelity rung).
- **Polyphony / stacked voices:** the MPE rung — out of scope for a monophonic
  voice, in scope the moment two lines stack.
- **Conformance fixtures:** Antemelos-emitted `.tabota` files *are* conformance
  fixtures by construction — the second authoring surface that proves the format
  ports beyond Roll.
- **Schema patch:** make `modeSettings` `oneOf` exclusive (§3.1), then emit
  `modeSettings` directly.
