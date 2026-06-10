# Cytophones Documentation

Documentation for the current three-piece cytophone collection:


These are single-file browser instruments: each file contains its own HTML, CSS, canvas renderer, interaction logic, and Web Audio synthesis engine. They can be opened directly in a modern browser and do not require a build step.

> Note on naming: the uploaded filename is `cytophone-xenalloy.html`, but the HTML title, visible gate, and instrument label say `cytophone: xenalloy`. Consider normalizing this spelling across filename, `<title>`, and UI if the collection will be published.

---

## 1. What a Cytophone Is

A **cytophone** is a small interactive sound-body ecosystem. The user seeds, strikes, plucks, grows, or disturbs animated bodies on a canvas. The visual morphology of each body is not only decoration: it is mapped into sound behavior.

The collection’s core idea is that **tuning is morphology**. A cell, node, membrane, fiber, or alloy-body has a shape, material behavior, drift, damping, brightness, and collision life. Those same traits determine what it sounds like.

Across the collection, each piece shares a common interaction language:

- A full-screen `<canvas>` is the performance field.
- A gate screen unlocks Web Audio on first touch/click.
- A small title and hint describe the instrument.
- A dry/wet slider controls the reverb send.
- The animation loop uses `requestAnimationFrame`.
- Audio is generated live through the Web Audio API.
- Object counts and voice counts are capped to prevent overload.

---

## 2. Shared User Controls

### Start

Click or touch the gate screen to begin. This is required because browsers usually block audio until the user performs a gesture.

### Wet/Dry

Each instrument has a bottom-center slider:

- **Dry** emphasizes the immediate synthetic source.
- **Wet** sends more signal into that instrument’s built-in convolution reverb.

The wet control is intentionally minimal: it is the shared “one-knob spatiality” for the collection.

### Hide UI

- Press **H** to toggle the UI in all three instruments.
- In `understory` and `xenalloy`, double-tap also toggles UI visibility.
- In `cambium`, the code currently only defines keyboard-based UI hiding.

### Erase

Most instruments support erasure by:

- Right-clicking a body or node.
- Holding **Shift** while clicking.
- Double-tapping a body/node in some versions.

Maintenance note: in `understory` and `xenalloy`, double-tap is used both for erasing and for UI toggle behavior. This can create accidental UI hiding on mobile. Consider separating these gestures if the pieces are published for touchscreens.

---

## 3. Shared Technical Architecture

### File Structure

Each cytophone follows the same broad structure:

```text
<!doctype html>
<head>
  metadata, Google Fonts, CSS variables, canvas/UI styling
</head>
<body>
  <canvas id="stage"></canvas>
  title / hint / wet-dry slider / gate overlay
  <script>
    utility functions
    synthesis engine
    field objects/classes
    interaction handlers
    animation loop
  </script>
</body>
```

### Rendering

Rendering uses the 2D canvas context. The canvas is resized to the viewport, with device pixel ratio capped at `2` for performance:

```js
DPR = Math.min(2, window.devicePixelRatio || 1);
```

The frame loop usually leaves a translucent background wash instead of fully clearing the canvas, producing a smear/trail effect. This gives the colony a sense of persistence, afterimage, and bodily transformation.

### Audio

Audio is created lazily on first user gesture. Each instrument builds a Web Audio graph with some version of:

```text
source voices → bus/master → dry path
                         ↘ convolver/reverb → wet path
mixed output → compressor → destination
```

The compressor is important because these pieces can create overlapping resonances. When extending the instruments, keep the compressor and object/voice limits unless you replace them with a different gain-management strategy.

---

## 4. Instrument: Understory

**File:** `cytophone-understory(5).html`  
**Visible title:** `cytophone: understory`  
**Gate text:** “a small colony of resonant cells.”

### Concept

`understory` is the drum-gong member of the collection. It treats cells as circular membrane resonators. The code explicitly frames the piece as “resonant bodies as an encounter,” where the same simulation is read by the eye and the ear.

The key line of thought is:

> Cells are circular-membrane resonators: inharmonic by physics, so there is no scale to be inside or outside of.

### Interaction

- Tap empty space to seed a cell.
- Tap an existing cell to wake/strike it.
- Right-click, Shift-click, or double-tap a cell to erase it.
- Cells drift, collide, bounce off the walls, and ring when struck.

On start, the instrument seeds three initial cells near the center of the viewport.

### Visual System

The palette is bronze, copper, patina, old gold, and occasional oil-slick violet/magenta. Cells breathe, wobble, shimmer, and emit ripples when excited. Their bodies are not perfect circles: low-harmonic outline perturbations make them feel biological and unstable.

Important visual variables/functions:

- `gongBaseHue()` chooses bronze/copper/patina/oil-slick hue families.
- `gongRimHue(base)` gives each cell an unexpected rim shimmer.
- `Cell.outline(a)` deforms the circular body with animated lobes.
- `this.detune` drifts over time, so each cell’s tuning slowly mutates.

### Sound System

`understory` uses a circular membrane model. Its modal ratios are hardcoded:

```js
const MODE_RATIO = [1.000, 1.593, 2.136, 2.296, 2.653, 2.918];
const MODE_AMP   = [1.00,  0.62,  0.42,  0.34,  0.26,  0.19];
const MODE_DECAY = [2.6,   2.0,   1.55,  1.35,  1.05,  0.85];
```

These ratios imitate the inharmonic spectrum of a drumhead rather than a Western harmonic series.

The core pitch mapping is:

```js
get f0(){ return clamp(4400 / this.r, 58, 360); }
```

So larger cells sound lower, and smaller cells sound higher.

### Main Parameters to Edit

- `MAX_CELLS = 12` controls colony density.
- `MODE_RATIO`, `MODE_AMP`, and `MODE_DECAY` define the membrane timbre.
- `get f0()` controls size-to-pitch mapping.
- `wetAmt = 0.35` sets the initial wet level.
- `gongBaseHue()` and `gongRimHue()` define the color ecology.
- Collision intensity is calculated from relative velocity and passed into `excite()`.

### Best Extension Directions

- Add more rare hue intrusions for stranger patina/oil effects.
- Add occasional “sympathetic ringing” where nearby cells respond faintly to a struck cell.
- Add slow environmental states: damp cave, bronze heat, flooded room, fungal bloom.
- Add cell aging: old cells could darken, detune more, or become more resonant.

---

## 5. Instrument: Cambium

**File:** `cytophone-cambium(3).html`  
**Visible title:** `cytophone: cambium`  
**Gate text:** “strikable and pluckable sound network”

### Concept

`cambium` is the network/fiber member of the collection. Instead of isolated resonant cells, it creates nodes connected by elastic fibers. The user does not only seed objects; they grow a living sound graph.

Its synthesis model is described in the file as:

> friction / comb / reed synthesis

This makes it feel more like woody tissue, pulled filament, string, reed, nerve, vine, or fibrous connective growth.

### Interaction

- Tap empty space to seed a node.
- Tap a node to pulse it and pluck its connected fibers.
- Tap a fiber to pluck it.
- Drag from a node or empty area to grow new nodes and fibers.
- While dragging, crossing a fiber can scrape it.
- Right-click, Shift-click, or double-tap a node to erase it.

On start, `cambium` seeds a triangular network of three nodes and three fibers.

### Visual System

The palette is a medium, clinical-industrial steel ground with sap, lichen, bruise, and vein colors. Nodes are soft, irregular, chromatic bodies. Fibers curve, sag, tremble, glow, dash, and sometimes sprout short perpendicular hairs if they are rough.

Key visual entities:

- `Node`: a pulsing body with pitch, sap, hue, drift, and excitation.
- `Fiber`: an elastic connection with tension, roughness, woody quality, age, and excitation.
- `motes`: small particles emitted by plucked fibers.
- `drawGhost(t)`: a dashed preview line shown while dragging a new fiber.

### Sound System

`cambium` uses three main sound gestures.

#### Node Pulse

`nodePulse(node, amount)` creates a short filtered triangle tone. It marks the node as alive and gives the network a rooted pulse.

#### Fiber Pluck

`pluckFiber(fiber, amount)` combines:

- A short noise burst.
- A bandpass filter.
- A comb-like delay line whose delay time follows fiber frequency.
- Feedback for resonance.
- A quieter oscillator tail.

The fiber’s frequency depends on length and tension:

```js
freq(){
  const L = this.length();
  const t = this.tension();
  const base = lerp(520, 110, clamp((L - 30) / 360, 0, 1));
  return clamp(base * lerp(0.78, 1.8, t) * lerp(0.92, 1.08, this.woody), 85, 720);
}
```

Longer fibers tend lower; tighter fibers tend higher.

#### Fiber Scrape

`scrapeFiber(fiber, amount)` makes a short noisy friction gesture with highpass/bandpass filtering and tremolo modulation. This is used when the user drags over a fiber, or when a fiber is strained by motion.

### Network Behavior

- `MAX_NODES = 18`
- `MAX_FIBERS = 34`
- New nodes auto-connect to the nearest node if it is within `230px`.
- Dragging creates new nodes when the pointer is far enough from the last node.
- Node collisions can create fibers.
- `autoWeave()` occasionally adds a nearby connection.
- Non-manual fibers can decay and break after aging.
- Breaking a connection triggers a pluck before deletion.

### Main Parameters to Edit

- `MAX_NODES` and `MAX_FIBERS` control network density.
- Drag thresholds around `72px` and `130px` control how easily dragging grows new nodes.
- `autoWeave()` probability controls autonomous network growth.
- Fiber expiration currently checks `f.age > 18` for non-manual fibers.
- `MAX_SCRAPES = 4` limits simultaneous scrape sounds.
- `wetAmt = 0.26` sets initial wetness.
- The output ramp currently goes very high:

```js
out.gain.linearRampToValueAtTime(5, ctx.currentTime + 1.2);
```

The compressor catches this, but this is a loud gain structure. If adapting the piece for installation, headphones, or embedding, test levels carefully.

### Best Extension Directions

- Add named or unnamed growth states: bark, sap, scar, rot, mycelium, graft.
- Let older fibers thicken visually and lower in pitch.
- Let deleted nodes leave ghost fibers that remain visible but silent.
- Add local “pressure zones” where fibers grow denser or scrape more easily.
- Add a very slow autonomous mode where the network continues composing itself.

---

## 6. Instrument: xenalloy

**File:** `cytophone-xenalloy.html`  
**Visible title:** `cytophone: xenalloy`  
**Gate text:** “a colony of ringing bodies.”

### Concept

`xenalloy` is the impossible-material member of the collection. It is built around **decoupled modal synthesis**: pitch, size, geometry, and substance are separated so the body behaves like a material that does not need to correspond to any real-world object.

The file’s conceptual map is:

```text
lightness  -> pitch
size       -> sustain/body
geometry   -> mode set
hue        -> behavior in time
```

This is the clearest “material fiction” instrument: it creates alloys that are seen and heard, but never named.

### Interaction

- Tap empty space to seed a body.
- Tap a body to strike it and nudge it.
- Bodies collide with each other and with the walls, triggering rings.
- Right-click, Shift-click, or double-tap a body to erase it.

On start, it seeds three initial bodies near the center of the viewport.

### Visual System

The palette is dark steel-teal with low-chroma but chromatically charged bodies. The body’s lightness is meaningful: brighter bodies sound higher, darker bodies sound lower.

Each cell has:

- `size`: visual radius and sustain/body weight.
- `light`: pitch identity.
- `jag`: geometry/timbre density.
- `hue`: substance/time behavior.
- `irr`: fixed irregularities in the mode set.
- `lobes`: animated outline deformation.

### Sound System

The fundamental pitch comes from lightness, not from size:

```js
const lightToF0 = L => 78 * Math.pow(2, clamp(L,0,1) * 3.7);
```

This maps lightness to roughly `78 Hz` through `1020 Hz`.

The timbre is built from two important functions.

#### `substance(h)`

Hue determines temporal behavior:

- `decay`: ring length.
- `hf`: high-frequency damping.
- `beat`: detuned beating/shimmer.
- `bright`: attack-transient amount.
- `glide`: onset pitch glide.

#### `modeRatios(jag, irr)`

Jaggedness controls modal density and inharmonicity:

- Rounder bodies have fewer, more nearly harmonic modes.
- More jagged bodies have more partials and more clangorous detuning.

Size affects sustain and low-mode weight, but not basic pitch. This keeps small objects tappable without forcing them to become tiny high-pitched sprites.

### Main Parameters to Edit

- `MAX_CELLS = 12` controls body density.
- `lightToF0()` controls pitch range.
- `substance(h)` controls hue-to-material behavior.
- `modeRatios(jag, irr)` controls geometry-to-partial mapping.
- `Sound.MAX = 8` limits simultaneous modal clusters.
- `wetAmt = 0.12` keeps the default sound relatively dry.

### Best Extension Directions

- Add slow alloy-state transitions where bodies drift toward brittleness, glassiness, gumminess, or magnetic beating without naming those states in the UI.
- Add sympathetic resonance based on similar hue/lightness.
- Add merging/splitting: two bodies collide and temporarily exchange jaggedness or hue.
- Add a “cooling” state where bright bodies darken and pitch descends after repeated strikes.

---

## 7. Collection-Level Design Notes

### Aesthetic Continuity

These pieces work best as a collection because they share a common frame but each answers a different material question:

| Instrument | Primary Body | Sound Model | Material Feeling |
|---|---|---|---|
| `understory` | resonant cell / drumhead | circular membrane modes | bronze, patina, low gong-body |
| `cambium` | node-fiber network | friction, comb, reed, pluck | sapwood, nerve, vine, connective tissue |
| `xenalloy` | impossible ringing body | decoupled modal synthesis | alien metal, glass, alloy, unnamed matter |

### The Shared “Cytophone” Grammar

A new cytophone can be developed by keeping this grammar:

1. Define a body type.
2. Define which visual traits matter sonically.
3. Give the user one simple way to create bodies.
4. Give bodies a way to sound through touch, collision, or growth.
5. Give the piece one shared wet/dry control.
6. Cap voices and objects.
7. Make the animation readable even without explanation.

### Suggested Folder Structure

If publishing as a small collection:

```text
cytophones/
  index.html
  cytophone-understory.html
  cytophone-cambium.html
  cytophone-xenalloy.html
  docs/
    cytophones_documentation.md
```

### Suggested Collection Landing Copy

> Cytophones are small browser instruments where animated bodies become sound. Each piece is a colony of visual-synthetic organisms whose morphology determines tuning, resonance, friction, and decay. They are not simulations of known instruments so much as encounters with impossible materials: bronze cells, cambium networks, and xenalloy bodies that ring, scrape, pluck, collide, and mutate.

---

## 8. Maintenance Notes

### 1. Normalize Naming

The filename `cytophone-xenalloy.html` and the internal title `xenalloy` differ. Pick one spelling for publication.

### 2. Review Double-Tap Gesture Conflicts

In `understory` and `xenalloy`, double-tap can both erase objects and toggle the UI. For mobile, it may be better to use:

- double-tap object = erase
- two-finger tap = hide UI
- or only `H` key / explicit small button = hide UI

### 3. Collection Switcher CSS Is Partially Present

`understory` and `xenalloy` include CSS for `#coll`, but the current body markup does not include a `#coll` element. Either add the collection switcher markup or remove the unused CSS.

### 4. Watch Output Levels

All three instruments use compression, but `cambium` in particular has a very high final gain ramp. Test on headphones and mobile speakers before publishing.

### 5. Keep Web Audio Unlock Behavior

The gate is not just aesthetic. It ensures the audio context starts from a user gesture. If replacing the gate, keep the first-touch audio unlock.

### 6. Preserve Object Limits

The object and voice caps are part of the performance design:

- `understory`: `MAX_CELLS = 12`, `MAX_VOICES = 11`
- `cambium`: `MAX_NODES = 18`, `MAX_FIBERS = 34`, `MAX_SCRAPES = 4`
- `xenalloy`: `MAX_CELLS = 12`, `Sound.MAX = 8`

Increasing these can make the pieces denser, but it can also cause audio clipping, CPU spikes, and visual overload.

---

## 9. Quick Editing Guide

### To make a cytophone louder

Prefer changing one gain stage at a time. Do not raise every oscillator and the master output together. Test with many objects active.

Useful places:

- Per-voice amplitude inside the strike/pluck/scrape function.
- Dry/wet gain mapping inside `setWet()`.
- Final `out.gain` or `master.gain` ramp.
- Compressor threshold/ratio if peaks become harsh.

### To make it more active without user input

Use a low-probability event in the frame loop:

- Randomly strike a body.
- Nudge a cell.
- Auto-pluck a fiber.
- Add or decay a connection.
- Trigger sympathetic resonance in nearby bodies.

Keep autonomous activity sparse enough that user action remains meaningful.

### To add a new material logic

Pick one visible trait and map it to one audible trait:

```text
brightness → pitch
radius → sustain
jaggedness → inharmonicity
hue → damping / beating / attack
fiber length → pitch
fiber tension → pitch + Q
age → thickness + decay
```

The strongest cytophone mappings are legible but not literal. The user should be able to feel that a visual change matters sonically, even if they cannot immediately name the rule.

---

## 10. One-Sentence Summaries

- **Understory**: bronze-patina drumhead cells drift, breathe, collide, and ring with inharmonic membrane spectra.
- **Cambium**: a growable node-fiber network plucks, scrapes, decays, and rewires itself like resonant connective tissue.
- **xenalloy**: luminous, jagged, unnamed bodies ring as impossible materials whose pitch, size, geometry, and substance are deliberately decoupled.

---

# cytophone: halocline

**Conceptual & Technical Documentation**

## Overview

cytophone: halocline is an interactive, browser-based intermedia environment that maps live marine meteorological data to generative audio-visual "cells." Unlike atmospheric scattering models, *halocline* relies on depth, pressure, and fluid dynamics.

It simulates a submerged acoustic environment where entities act as struck and bowed resonators. The interactions and sonic behaviors are strictly governed by live ocean conditions—specifically wave height, wave period, and current velocity—creating a localized, algorithmic reflection of a specific geographic coordinate.

## 1. Conceptual Mapping (Data to Aesthetics)

The core mechanic of *halocline* is the translation of rigid, quantitative marine data into organic, hauntological soundscapes and fluid visual behaviors.

  - **Wave Period → Respiration (LFO):** The time between swells (e.g., 4s vs. 14s) directly modulates the slow "current tremolo" of the bowed cell. A long, deep-ocean swell creates an incredibly slow, pressurized breathing effect, while a choppy bay wave induces rapid fluttering.
  - **Wave Height → Agitation (Beating):** The amplitude of the ocean waves dictates how aggressively the harmonic partials within a cell detune and beat against each other. High waves create turbulent, dissonant shimmering; calm waters produce glassy, near-unison drones.
  - **Ocean Current Velocity → Buoyancy (Drift):** The literal speed of the water current dictates the physical drift speed of the visual cells, overriding their baseline buoyancy.
  - **Y-Axis Depth → Spectral Tilt:** Emulating acoustic behavior in stratified layers (similar to the SOFAR channel), the vertical position of a cell alters its EQ. Surface-level cells have crushed subs and boosted high harmonics (surface noise/splash), while deep cells have heavily boosted subs and completely muted upper harmonics (deep pressure).

## 2. Technical Architecture

The application is built entirely in vanilla JavaScript, utilizing the Web Audio API for sound generation and the HTML5 <canvas> API for rendering.

### 2.1 API Integration (Marine)

The environment fetches data without requiring API keys by chaining two open-source endpoints:

1.  **Geocoding:** geocoding-api.open-meteo.com translates user-inputted strings (e.g., "Pacific Ocean") into exact latitude/longitude coordinates. It also accepts raw lat, lng strings natively.
2.  **Marine Fetch:** marine-api.open-meteo.com retrieves wave_height, wave_period, and ocean_current_velocity for those coordinates.

### 2.2 Audio Engine (Sound)

The audio engine acts as a dynamic polyphonic synthesizer featuring a custom algorithmic reverb.

  - **The Reverb Plate:** A custom impulse response (_plate) generates a wide, smooth, slightly bright tail to simulate open-water dispersion rather than a dark enclosed room.
  - **Voice Allocation:** Limits to a MAX of 6 concurrent voices to prevent audio clipping and maintain a sparse, clinical aesthetic.
  - **Oscillator Bank:** Each cell utilizes an array of sine oscillators governed by non-linear ratios (VOX_RATIO = [0.5, 1.0, 2.0, 3.01, 4.03, 5.06]) to create voices that sound organic and slightly reedy, avoiding clean major/minor scales.
  - **Envelope (bow):** Triggering a cell swells its amplitude and opens its low-pass filter simultaneously, mimicking the physical friction of bowing a rigid material.

### 2.3 Physics & Rendering (Cell & collide)

The visual system is a 2D fluid-dynamic simulation without strict boundaries.

  - **Geometry & Salinity:** Cells possess an inherent geometry (round to lobed) and a hue mapped to a specific "salinity" palette (indigo, saline cyan, violet, and rare coral oil-slicks).
  - **Buoyant Drift:** Cells constantly recalculate their velocity (vx, vy) based on underlying sine/cosine fields that scale with the marine current data.
  - **Elastic Collisions:** When cells intersect, collide(dt) calculates the overlap and applies an opposing impulse, transferring kinetic energy. High-velocity collisions automatically trigger an acoustic excitation (a sympathetic "strike").
  - **Caustic Rendering:** Rendering utilizes overlapping radial gradients, globalCompositeOperation = 'lighter', and animated conic gradients to create a wet, sub-surface optical effect without relying on heavy WebGL shaders.

## 3. Interaction Model

The user interface is designed to be minimal, allowing the user to act as an external force acting upon the marine ecosystem.

  - **Initialize:** The system awaits a physical interaction (Touch/Click) to bypass browser autoplay policies and instantiate the AudioContext.
  - **Location Query:** Users can type a location name or specific coordinates into the top-right terminal to shift the environmental data.
  - **Seed (Tap Empty Space):** Creates a new halocline cell at the pointer location, assigning it random mass and geometry.
  - **Bow (Tap Existing Cell):** Injects kinetic energy into a cell, swelling its volume and brightness. Repeated bowing accumulates energy, extending the release tail.
  - **Erase (Right-Click / Double-Tap):** Destroys a cell and smoothly fades out its active audio voice.
  - **Hide UI (Press 'H' or fast Double-Tap):** Dims all overlay elements for a clean, immersive visual state.


