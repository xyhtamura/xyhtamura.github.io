# Physa

A charge-controlled memristor as the sounding element. Single-file browser
instrument, `index.html`, AudioWorklet, no build, no dependencies beyond web
fonts and KaTeX.

A standalone monophonic circuit instrument and input processor. Previously part
of [Anexacta](../../anexacta/suite.md), it moved to the website repository on
2026-09-30. Its charge history and `M(q)` language remain independent of the
suite's equation-driven polyphonic voices. Built for the ESNMA 2026 argument;
see [the abstract](../../loosethreads/active/ESNMA2026-abstract.md).
Formerly `worn`, at `F:\xyh\worn\`, an untracked folder outside any repository.
Renamed and moved in 2026-08-25.

---

## The name

*Physa* is Greek for bellows, and it is the root of *Physarum* — the slime mould
named for its sporangia. The reference is deliberate and it is the opposite of a
citation.

*Physarum polycephalum* was reported as a biological memristor in 2015 (Gale, de
Lacy Costello and Adamatzky), and roughly a decade of computer music was built on
that claim. In 2025 Schmidt, Seyfried, Reutina, Seskir and Miranda characterised
multiple specimens and found no significant memristance: elliptical I–V curves
produced by the organism's own capacitance, which they reproduced with resistors
and capacitors alone (*MRS Advances* 10(14): 1710–1716). Miranda had composed the
music. The paper trail is
[loosethreads/biomemristor-music-and-the-physarum-claim.md](../../loosethreads/biomemristor-music-and-the-physarum-claim.md),
and `suite.md` warns explicitly against citing that lineage as evidence.

So the name spends the organism's root without spending its claim, and the
**Mould** control puts the 2025 measurement on a dial. Anyone reading the name as
an endorsement is corrected by the instrument itself within about ten seconds.

Naming was run against
[principles/xyh-naming-calibration.md](../../principles/xyh-naming-calibration.md).
Rejected: anything from rutile or TiO₂, the actual HP device material, because the
page's central argument is that this is not a device — the name would have
contradicted the mechanism, which is the failure mode that note is built around.

---

## What it is

```
dq_e/dt = μ_e·i_e − q_e/τ        i_e = v·D_e/M(q)        i = (1/N)·Σ i_e + C·dv/dt
M(q)    = (1−w(q))·M₀(q) + w(q)·⟨M₀⟩        dw/dt = σ·|v·i|·(1−w)
```

One ODE per element over a shared substrate, plus a memoryless branch. The
instrument is **M₀(q)**, the memristance curve, written as an equation rather than
chosen from a list. `q` runs −1 to 1, `Math` is in scope.

The argument it embodies: Chua deduced the memristor in 1971 from the symmetry of
*v, i, q, φ* — it existed as a gap in a table before it existed as anything else.
Whether matter can realise the ideal element is disputed (Vongehr & Meng;
Pershin & Di Ventra's charge-only test). Those results constrain hardware.
**This is not a simulation of a device; it is the object in the territory where it
lives.** M(q) can be periodic in charge, discontinuous, anything matter would
refuse.

Three mechanics were added 2026-08-25 on Xyh's ask for biological behaviour,
"the decaying quality found in the RC mold":

- **Mould** — a capacitance in parallel with the element. It carries current and
  holds no state, so it contributes pure quadrature at the fundamental. The loop
  opens into an ellipse that misses the origin, nothing appears above the
  fundamental, and the memory reading climbs anyway. That combination is the 2025
  *Physarum* result, reproducible on the dial.
- **Senescence** — the curve is a state variable. Playing abrades it: where the
  charge dwells, M(q) blends toward its own mean, so the played stretch loses its
  shape and becomes an ordinary resistor. Irreversible within a session, unlike τ.
  Resets on reload; **Fresh substrate** clears it deliberately.
- **Colony** — several elements across one drive over one shared substrate, with
  Tero's tube law: an element carrying more current thickens and carries more
  still, an idle one thins back. Saturating, so the positive feedback is bounded.

Together the first two do something the page did not plan for and is worth
keeping: **playing the instrument wears it toward the thing Physarum actually
was.** Senescence drives the element toward memorylessness and the Mould dial
supplies the capacitance, so the false positive is the instrument's own
end state rather than an external comparison.

## Playing it

Monophonic, and that is the one thing not copied from the siblings: one element
means one history, and one history is what makes the wear legible. The note model
is last-note priority rather than a voice pool.

- **Keys** — 25 contacts, C3 to C5. Where you press vertically inside a key is
  velocity, the way a ribbon reads it.
- **QWERTY** — `a w s e d f t g y h u j k o l p`, sixteen semitones. `z` and `x`
  shift octave, space is a sustain pedal. The key remembers which note it
  started, so shifting octave while a note is held still releases the note that
  is actually sounding.
- **MIDI** — notes with velocity, pitch bend at ±2 semitones, sustain on CC64,
  and all-notes-off on CC120/123. The status chip follows `onstatechange`, so
  plugging a device in mid-session picks it up. States are unsupported, denied,
  no device, and the device list.
- **Ribbon** — a continuous strip, four octaves from C2, with velocity on the
  vertical. This is the surface the instrument actually wants: state excursion
  goes as 1/f, so sliding along the ribbon sweeps the element from dirty to clean
  without a step anywhere. On keys that behaviour is a table in this file; on the
  ribbon it is a gesture.
- **Glide** — 0 to 400 ms, logarithmic in pitch. Glide applies between notes and
  not out of silence, so a phrase does not open on a portamento from whatever was
  played last. Frequency updates once per block; phase is integrated, so a
  frequency step between blocks cannot click.
- **Velocity depth** — velocity multiplies the drive amplitude, which is
  `suite.md`'s "velocity becomes a physical timbre axis rather than a mapped one"
  taken literally rather than mapped to a filter. Verified bit-for-bit: velocity
  0.5 at amplitude 1 renders identically to amplitude 0.5 at velocity 1. With
  Auto level on this changes harmonic content without changing loudness, so
  playing harder changes the timbre and not the volume.

Not built, and deliberately: polyphony, and aliquoto's MIDI file import. The
second one is worth revisiting, because a scheduled note sequence is exactly what
the untested cross-note memory claim needs.

## Processing a voice

The **Voice** panel runs an input through the circuit built above it. It is an
effect, not part of the synthesizer: its own source, its own controls, and no
connection to the note input. Both paths can run at once, and they share one
substrate.

A **Synth / Voice** switch in the header decides which set of controls is on
screen. It is a *view*, not a mode: it never stops a signal path. The circuit
— `M(q)`, μ, τ, charge domain, Mould, Senescence, Reinforce, master Output,
and every analysis panel — is in both views, because it is the object both
drives interrogate. The deck, drive Amplitude, Auto level and the colony's
Elements and Spread are synth-only; the Voice cell is voice-only. Whichever half
is hidden keeps running, and a chip says so when it is live, so that singing into
the element and then playing the curve you wore stays something you can do rather
than something you have to be told.

The input is DC-blocked, split into 4 to 12 constant-Q bands, and each band drives
its own element through the same `M(q)`, mould, reinforcement and senescence the
keyboard plays.

**It has to be a bank, and the reason is the mechanism.** `q` is the time-integral
of the current, so the charge sees the drive with a 1/f weight — the keyfollow
table above, read the other way round. A voice's energy is in its formants, so a
DC-blocked voice at amplitude 1 moves the charge ±0.044 of the domain against
−0.686..0.937 for the 110 Hz sine the page is calibrated on. One element hears
almost nothing a voice does. Scaling μ with band centre is the compensation, and
**Tilt** is that scaling on a dial: at 1 every band reaches its element, at 0 only
the low ones do.

- **Input** sets how hard each band drives its element, so it is the timbre
  control, the same way Amplitude is on the synth side. **Level** trims what comes
  back. There is deliberately no AGC on this path: it would fix the level and also
  flatten the axis the effect is played on. A fixed makeup of `flat/Rref` does the
  level instead, which is exactly 1 for a constant M(q), so a plain resistor
  passes the input through untouched.
- **Mix** crossfades against the untouched input.
- **Bands** trades resolution for cost. The bank is normalised by evaluating its
  own summed transfer function, so the level holds at any count.
- The **mould** runs per band as a real differentiator, since an input has no
  single drive phase. High bands see more capacitive current, so sibilants pass
  least processed.

**Senescence is where it pays off.** Wear deposits where each band's charge
dwells, so a vowel abrades the bands its formants sit in and a sibilant abrades
the top. The substrate ends up a record of what was said into it, and because it
is the same substrate, singing wears the curve the keyboard then plays.

Two ways in: the microphone, and a dropped audio file. The file path exists
because a microphone needs a permission the automation browser denies, so the
path stays testable.

**The analysis panels follow a Showing: Drive / Input switch**, in the Hysteresis
head, and both move together — the circuit is the topology the loop is a reading
of. On **Input** the loop becomes a sliding 32 ms X–Y trail of one band's own
voltage against its own current, chosen by the **Shown** dial; it has to be one
band's own voltage, because plotting the bank's input against its total current
measures the filterbank too, and a plain resistor behind one bandpass reads 36.6%
memoryless when it is nothing of the kind. Memory and harmonic are defined at a
fundamental, so on Input they are replaced by **memoryless** (the share no
single-valued `i(v)` accounts for — zero for a resistor, high for a capacitance)
and **nonlinear** (what is left after the best two-pole linear model — zero for a
resistor *and* an RC network, so only a real nonlinearity reads high). That pair
keeps the memristor-versus-mould distinction the sine version carries. **Opening**
is unchanged; it only ever needed zero crossings. The circuit panel draws one
branch per band with live current shares and, when the mould is up, each band's
own capacitance beside its own element.

## Verified 2026-08-25

All figures measured by rendering the shipping worklet in an `OfflineAudioContext`
and taking a DFT at harmonics of the fundamental. The harness is
[test.html](test.html) beside this file: it **extracts the worklet source out of
`index.html` at run time**, so it cannot drift from what ships, and it asserts
`offset + window <= buffer.length` before believing any zero. Open
`http://localhost:8000/xyhtamura.github.io/physa/test.html` and press Run. All checks pass as
of this entry.

Windows are Hann, 0.4–1.0 s after note-on unless stated. Defaults: μ = 10⁶,
τ = 2 s, HP curve, amplitude 1, AGC off, 48 kHz.

**Keyfollow, with no keyfollow rule written anywhere:**

| Drive | 55 Hz | 110 | 220 | 440 | 880 |
|---|---|---|---|---|---|
| Harmonic % | 29.90 | 4.54 | 0.76 | 0.18 | 0.04 |

About a quarter per octave from 110 up. The state integrates current, so its
excursion goes as charge per cycle and therefore as 1/f. Low notes come out dirty,
high notes pass nearly clean, and nothing in the code says so.

**The 55 Hz figure disagrees with the one recorded 2026-08-24 (16.14%), and the
disagreement is now explained.** At 55 Hz the charge sweeps most of the domain and
the harmonic content becomes hypersensitive to μ:

| μ | 3×10⁵ | 6×10⁵ | 1×10⁶ | 2×10⁶ |
|---|---|---|---|---|
| Harmonic % at 55 Hz | 1.63 | 16.47 | 29.90 | 65.71 |

A factor of 6.7 in μ moves it by a factor of 40. At 110 Hz the same μ range moves
it from 0.29% to 4.54%, far less steeply. The charge does **not** reach the clamp
(measured range −0.686 to 0.937 over a 2 s render), so this is the curvature of
the nonlinearity rather than clipping. The old 16.14% corresponds to μ ≈ 6×10⁵.
Whether the earlier session measured at a different μ or the earlier harness was
wrong is **not resolved** — that harness is the one with a known history of
reading past the end of its buffer. Either way the page no longer quotes 55 Hz as
a property; it quotes it as a setting, and says so.

The 110–880 Hz figures reproduce 2026-08-24 closely (4.27 / 0.77 / 0.19 / 0.04),
so the keyfollow claim itself is unaffected.

**Level dependence** — velocity is a physical timbre axis, not a mapped one:

| Amplitude | 0.25 | 0.5 | 1 | 2 |
|---|---|---|---|---|
| Harmonic % | 0.20 | 0.86 | 4.54 | 18.13 |

**Wear within a held note**, harmonic % at t = 0.1 / 0.6 / 1.5 / 2.2 s:

| τ | | | | |
|---|---|---|---|---|
| 20 ms | 5.39 | 5.39 | 5.39 | 5.39 |
| 500 ms | 4.98 | 4.73 | 4.61 | 4.58 |
| 3 s | 4.87 | 4.34 | 3.77 | 3.50 |
| off | 4.85 | 4.23 | 3.47 | 3.05 |

Reproduces 2026-08-24 within a few tenths of a point. τ is a choice between an
element that wears while you hold it and one that reaches equilibrium at once.

**The mould, and what the analysis panel does with it.** Constant M(q) = 1200 with
1.4 µF in parallel, at 110 Hz:

| | memory | harmonic | opening |
|---|---|---|---|
| plain resistor | 0.01% | 0.01% | 0.00% |
| memristor (HP curve) | 3.79% | 4.13% | 0.00% |
| resistor + 1.4 µF | **57.42%** | **0.01%** | **75.77%** |

The third row is the Schmidt et al. signature and it is the reason the
**harmonic** readout was added. Memory as hysterion defined it — energy in Fourier
coefficients no memoryless device can produce — counts quadrature at the
fundamental, so a linear capacitance scores very high on it. That is not a defect
in the measure: a capacitor genuinely has state. It is a defect in reading
"memory" as "memristance". Harmonic content above the fundamental is what
separates them, and it is zero for any linear reactance.

The closed form for that row is `a₁/b₁ = ωCM`, giving memory = 57.4%. Measured
57.42%. The capacitive share also rises in exact proportion to pitch (measured
8.00× across three octaves), which is the inverse of how the element behaves —
so the mould takes over at the top of the keyboard exactly where the memristor
stops distorting.

**Senescence.** Half-life 4 s at the default curve and drive gives 50.64% peak
wear after 4 s. Wear is local, not global: a 3 s half-life over a 6 s render on
the periodic curve reaches 96.61% at the busiest bin against 30.11% mean. Harmonic
content falls as it wears (1.13% → 0.78%). Two things hold by construction and are
asserted: with senescence off, nothing wears and the timbre is stable to within
0.01 points; and **wear on a constant curve is bit-for-bit a no-op** (max sample
difference 0.0), because blending a constant toward its own mean changes nothing.

**Colony.** Six elements, spread 0.75 decades, reinforcement 0.7: tube thickness
diverges to [1.68, 1.67, 1.64, 1.56, 1.48, 1.93] and every charge stays inside the
domain. With reinforcement at 0 every tube stays at exactly 1.

**Headroom.** Across five configurations at amplitude 2 — including eight elements
at full reinforcement, and 20 µF of mould — peak output never exceeds 1.0 and the
sustained level settles to the 0.25 AGC target within 0.006. The 1.0 is the soft
limiter's asymptote (`0.9 + 0.1·tanh(...)`) and is a bound, not clipping.

## Bugs found by measuring

Four were found 2026-08-24 and are kept here because each was invisible by
inspection and the page would have *sounded plausible* with three of them still in.
The fifth was found this session.

1. **The memristor was cancelling itself out.** Output was written as `i*M(q)` to
   normalise away the large resistance scale — but `i = v/M(q)`, so `i*M(q)` is
   exactly `v`. The instrument emitted the bare drive sine with the element
   perfectly removed. Fixed by scaling with a *constant* reference resistance.
2. **Port messages are not reliably delivered before the first `process()` call in
   an `OfflineAudioContext`.** Initial state arrives through `processorOptions`,
   which is guaranteed at construction. The realtime path was never affected, so
   this would have looked fine in the browser and failed every offline test.
3. **Default μ was 10⁴, about two orders too low.** Charge swing was 0.007 of the
   domain, so the element sat in a nearly linear patch and produced 0.02%
   harmonics. It ran, it made a tone, and it was doing essentially nothing.
4. **Output was scaled by mean(M), not min(M).** Since output is `v·Rref/M(q)`, a
   mean reference lets the gain reach mean/min — 40× on the HP curve — clipping
   hard at full wear. Now bounded by construction.
5. **The hysteresis loop was captured with a systematic half-slot phase bias**
   *(found 2026-08-25)*. The loop is sampled onto a 256-slot phase grid so it is
   one cycle at any pitch. Several samples fall in one slot and the last one wins,
   which lands systematically near the top of the slot — so assuming each slot sat
   at its nominal phase skewed every reading by about half a slot and reported
   memory where there was none. Caught because the capacitive quadrature scaled by
   7.07× across three octaves where theory demands exactly 8. The worklet now
   stores each sample's own phase alongside it. After the fix: 8.00×, the plain
   resistor's memory reading fell from 0.03% to 0.01%, and the RC case moved from
   59.11% to 57.42% against a closed-form 57.4%.

6. **The entire surface treatment was invisible, and every structural check
   still passed** *(found 2026-08-25, second pass)*. Each shell paints its
   surface on a `.skin` backdrop layer so the tear filter can run on the skin
   alone; a later rule, `.organism > *, .cell > *, .deck > * { position:relative }`,
   was meant to lift content above that layer and instead overrode the skin's own
   `position:absolute`, since it is the more specific selector. Every skin
   computed to 0x0 and painted nothing. The page looked structurally correct
   under every DOM check I had — ids present, no overflow, no console errors,
   canvases painting — because none of those measure whether a background exists.
   Caught only by measuring the skins' bounding boxes directly. The rule now
   excludes `.skin`.
7. **Presets did not refresh the veins** *(same session)*. The vein thickness is
   bound to the `input` event on the colony controls, and `applyPreset` sets the
   values without dispatching it, so loading the Colony preset moved every control
   and left the plumbing thin. `applyPreset` now calls `setVeins` directly.

And one process note carried forward: a **stale cached page** once produced a
false negative that read as a broken AGC. Append a cache-busting query string when
re-testing after an edit; a plain reload of the same URL is not enough.

## Known approximations

- **The senescence half-life is nominal, and the page says so.** The derivation
  assumes a stationary charge. The charge is not stationary — it sweeps a wide
  stretch of the domain, so the deposit reaching any one bin is diluted by roughly
  the ratio of swept width to kernel width. Measured at **42×** for the default
  curve and drive, and that factor is compiled in as `SWEEP_DILUTION`. It is
  accurate where it is calibrated and drifts elsewhere: a wider sweep spreads the
  wear and slows it. A version that deposits per unit `|dq|` rather than per unit
  time (Archard's wear law) would remove most of the dependence and make wear
  scale with cycles rather than seconds — considered and not built, because it
  makes the time label frequency-dependent instead.
- **The decimation filter is approximate.** 8× oversampling with a Hann-weighted
  average over the substeps — a real lowpass, but not a designed half-band FIR.
  The aliasing floor is unmeasured. `suite.md` budgets 4–8× for this element, so
  the oversampling factor is right; the filter is the weak part.
- **`new Function` on the M(q) input.** Fine for a local single-user page, and the
  reason the curve can be an arbitrary expression. Worth noting before this is
  ever hosted anywhere that takes untrusted input. Note that it is now hosted:
  the website repository is published on Pages, so this is a live consideration rather
  than a hypothetical one.

## Left undone

- **Next: verify cross-note memory with a scheduled note sequence.** Measure
  whether a second note begins on the substrate worn by the first, and compare
  it against a fresh-substrate render. Keep the monophonic circuit model.
- **Superseded 2026-09-30:** per-partial additive elements, the Anexacta grammar,
  and adoption of the suite's Hz voice seam are no longer the next development
  step. Those were membership prerequisites; Physa is a separate instrument.
  Independent tuning improvements remain possible without adopting that plan.
- **No aesthetic verdict, and no screenshot.** Xyh has heard it and confirmed the
  level problem is fixed. The reskin of 2026-08-25 has been verified by
  measurement and by reading the DOM, but **not seen** — the browser pane has not
  been displayed in any of the three sessions, so `requestAnimationFrame` never
  runs and the live readouts and `--age` bloom cannot be observed under
  automation. The canvases were confirmed to paint by counting lit pixels with the
  draw functions called directly.
- **MIDI has never touched a device.** The implementation follows the pattern in
  `aliquoto`, `cella` and `moire`, and the automation browser denies the Web MIDI
  permission, so what has been verified is the denial path printing "MIDI denied"
  rather than throwing. Notes, velocity, bend, sustain and hot-plug re-binding are
  all unexercised against real hardware.
- **Cross-note memory is untested.** Wear *within* a held note is measured; the
  claim that the element arrives at each note already worn by the previous one is
  reasonable from the ODE but was not verified. Needs a scheduled note sequence.
  Senescence makes this more interesting and more worth doing.
- **Per-crossing `opening`, so the transient pinch is readable.** The shipped readout
  averages both crossing families over the window and reports ~2.5% for an RC transient
  that actually alternates between ~0.4% and ~5%. The average is right for a steady
  loop and hides the transient entirely. The ESNMA paper cites the per-crossing
  numbers, so either the readout gains a per-crossing mode or the paper has to cite a
  console procedure. Measured 2026-09-08, entry below.
- **The 55 Hz provenance question**, above.
- Monophonic, deliberately. No preset browser beyond the nine built in, no
  save/recall, no MIDI file import, no envelope beyond a fixed 4 ms attack and
  250 ms release.

## Relation to the rest

- **Anexacta.** Physa left the suite on 2026-09-30. No code is imported or
  vendored in either direction. The suite's memristive-element proposals remain
  historical design material, not prerequisites for this instrument.
- **hysterion.** Archived, and as of 2026-09-08 fully superseded: both measurements
  the ESNMA argument cited it for were re-derived here and reproduce, so the
  "do not delete without re-siting" condition on it is discharged. Its two tests run
  live here on the note being played, and the third that separates them was added
  2026-08-25. Neither imports the other.
- **[physics/GAPS.md](../../physics/GAPS.md)** § "Memory versus keyfollow-invariance
  in a memristive audio element" is directly visible here. The τ table is the
  two-timescale tension the gap describes: short τ gives a stable timbre and no
  cross-note memory, long τ gives cross-note memory and a timbre that drifts while
  you hold it. Senescence adds a third timescale on top and does **not** resolve
  the gap — it sidesteps it by making the slow drift permanent and local rather
  than reversible and global.

## Prior art — the earlier sweep was incomplete

`suite.md`'s search of 2026-08-03 concluded that memristive audio-rate synthesis
was unattested, while flagging that negative results are weak evidence. Rechecked
2026-08-24, and there is more than it found:

- Memristor music at note/control level is well established — Gale, Matthews, de
  Lacy Costello & Adamatzky, "Beyond Markov Chains" (arXiv:1302.0785), which is
  transition matrices over a 24-note range with no audio synthesis; and the
  Braund/Miranda body of work.
- Chua's circuit as a chaotic sound source dates to Bilotta & Pantano 1993 and
  Rodet 1994.
- Hardware memristor-emulator modules exist in analog synthesis practice.
- **There is a real engineering literature on memristor harmonic generation**,
  including emulator circuits presented explicitly as wave-shaping and generation
  circuits, and Fourier analyses of memristor harmonic weights. This is the part
  the earlier sweep missed, and it is the closest prior art at the signal level.

Still not found: a software instrument with a memristor model in the audio path
where **M(q) is the authored object**. But **do not build a novelty claim on
this.** The argument is about where the ideal memristor can be said to exist, not
about priority, and it is stronger without a claim that a reviewer could falsify
with one citation.

---

2026-08-24 — Claude Code — Built the MVP as `worn`: charge-controlled memristor in
an AudioWorklet, equation-first M(q) compiled to a 1024-point lookup table, wear
and relaxation controls, 25-key range, live M(q) curve with charge marker, scope.
Verified by offline render and DFT rather than by description. Found and fixed
four defects, one of which had the element cancelling itself out entirely, and one
test-harness error of my own that produced two false zero readings I reported
before catching. Nobody has listened to it yet, and the name is provisional.

2026-08-25 — Claude Code — Fixed the level behaviour Xyh reported: DC blocker,
slow AGC and soft limiter inside the worklet, with an Auto level switch to hear
the raw current. The Chrome/Firefox split was not a browser bug — the output was
simply 0.028 peak, and the volume leaps were the same 80:1 `1/M` swing seen from
the other end. Verified that the keyfollow and level-dependence figures survive
the gain stage, which is why the AGC detector is slow. Lost time to a stale cached
page reporting a false negative.

2026-08-25 — Claude Code — Absorbed the archived hysterion: its two tests now run
live on the note being played, with the I–V loop captured before the gain stage
and sampled on a phase grid so it is one cycle at any pitch.

2026-08-25 — Claude Code — **Renamed to Physa, moved into the Anexacta repository
as its fourth member, reskinned, and given three biological mechanics.** Decisions
were Xyh's: move in rather than cross-link; tarnish and wear crossed with bioart;
a Physarum-derived name; the full member kit; wear resets on reload.

Reskin follows [principles/xyh-design-calibration.md](../../principles/xyh-design-calibration.md)
and the fallbacks note — a bronze plate left somewhere damp with a culture on it.
Oxide interference runs amber → verdigris → violet on its own, which lands the
45/165/285 fallback triad without imposing it; *Physarum*'s own chrome yellow is
reserved for the memoryless branch, the mould dial and the wear it leaves. The
old page was a strict two-column grid of three equal cells, which is the lattice
the calibration note calls the killer; panels are now irregularly radiused organs
at unequal widths with sub-half-degree tilts. Display type is Averia Gruesa Libre
per the fallbacks note, with Space Mono shared with the other three members.

Mechanics added: the mould (parallel capacitance), senescence (the curve as a
state variable), and a colony under Tero's tube law. A third loop measure,
harmonic share above the fundamental, was added because it is the one that
separates a memristor from an RC network — without it the mould's capacitance
reads as 57% memory and the panel cannot tell you it has been fooled.

Wrote [test.html](test.html), which extracts the worklet from `index.html` at run
time so the tests cannot drift from what ships. All checks pass. It caught a real
defect (the loop-capture phase bias, #5 above) and it caught my own senescence
calibration being 42× out. Three of the first run's four failures were wrong
assertions in the test rather than faults in the page, which is worth recording:
the capacitive ratio and the limiter ceiling were both behaving exactly as the
algebra demands and I had written the wrong expectation.

Also resolved the 55 Hz keyfollow discrepancy against 2026-08-24 — see above; the
figure is μ-hypersensitive and the page now presents it as a setting rather than a
property.

**Undone:** per-partial elements, the thing that would make this additive, are
still not built and are now the Next in Dev. Nobody has looked at the reskin; the
browser pane has not been displayable in any session, so there is still no
screenshot and no aesthetic verdict on the new surface.

2026-08-25 — Claude Code — **Second reskin pass and the full input treatment**, on
Xyh's ask: the first skin was fine but tame, and the instrument had no performance
inputs worth the name. Direction was his — biometallic, and not much animation.

The first skin took the tarnish half of the brief and skipped the instruction that
matters most in [xyh-design-calibration.md](../../principles/xyh-design-calibration.md):
the constructive inverse, *house the controls inside a continuous organic body,
the container is alive*. It was still a rail of rectangles with soft corners. What
is there now:

- **Torn edges instead of rounded ones.** `feTurbulence` into `feDisplacementMap`,
  run on a `.skin` backdrop layer rather than on the shell, so the membrane is
  ragged and the type and controls stay crisp. Displacing the shell itself would
  drag the text with it.
- **One organism.** The rail is a single body; the four groups are chambers inside
  it divided by a septum rather than separate panels with gaps. A vein runs beside
  them, and it **thickens with the colony** — element count and reinforcement set
  its stroke width, so the page's plumbing is the instrument's. Set on change
  only; nothing animates on its own.
- **The control vocabulary the calibration note says has vanished.** Rotary dials,
  rocker switches for the two binary settings, a needle gauge for substrate wear,
  and the equation as a card slotted into the plate. Each dial **wraps a real
  `input type=range`** — clipped rather than hidden, so it keeps its keyboard
  behaviour and its accessible name, and every existing listener stays bound to
  it. The knob writes back through the same `input` event. Drag vertically, shift
  for fine, double-click to reset.
- **Strange placement, in the sense the note means.** The Mould dial now sits in
  the hysteresis panel and the Senescence dial and wear gauge sit in the substrate
  panel, because each is a control whose entire evidence is the display beside it.
  Drive returned to the rail; only the genuinely performative controls, glide and
  velocity, live on the deck.
- **Biometallic** rather than tarnish alone: a flesh hue at 340 sits in the seam
  where the bronze turns soft, between the amber and the verdigris. Knobs are
  metal rims around wet tissue.

Two defects found, both by measuring rather than by looking — #6 and #7 above. #6
is the instructive one: **the skins never painted at all, and every check I had
still passed.** Ids present, no overflow, no console errors, canvases painting,
fonts loaded, layout balanced — none of which can see that a background is
missing. Under a displayed browser pane this would have been obvious in a second.
It is the clearest cost yet of working without a visible pane, and the lesson is
that DOM checks verify structure and cannot verify surface: measure the thing you
actually claim, which here meant the skins' own bounding boxes.

Input treatment is above under **Playing it**. The offline suite grew to **42
checks, all passing**, including velocity being bit-for-bit identical to the
equivalent amplitude and glide not applying out of silence.

**Undone:** the surface is still unseen — the browser pane has not been
displayable in any of four sessions, so there is no screenshot and no aesthetic
verdict, and #6 means "structurally verified" has now been demonstrated to be a
weaker claim here than it sounds. MIDI has never touched a device. Per-partial
elements remain the Next in Dev.

2026-08-25 — Codex — **Rebuilt the surface from the Kioskarium soft-ecology
terminal reference after Xyh found the biometallic pass too dependent on the
default fallback palette.** Physa now sits inside one olive field-terminal shell:
a milk-plastic control cabinet, gel dials and keys, CRT-green plot apertures,
scanlines, and restrained cyan/pink optical bleed. The title uses the reference's
large soft serif treatment. Conductive traces and the wear-driven background bloom
remain, but amber/verdigris/violet no longer organize the page.

Fixed the left-column layout defect visible in the first screenshot: a generic
child rule had overridden the vein's absolute positioning and inserted a large
blank block before the first chamber. Replaced the flex keybed with fixed grid
tracks so the last row no longer expands into four oversized keys. Reduced every
explanatory panel paragraph to an operational caption; the equations, plots and
state changes carry the concept.

Verified the displayed page at 1280×720 and as a full-page capture in the in-app
browser: KaTeX loaded, all 25 keys measured the same width, the left chamber began
directly below the header, and the console had no errors or warnings. Ran
`physa/test.html`; all offline checks passed. MIDI hardware and per-partial
elements remain untested/unbuilt, as above.

2026-08-25 — Codex — **Replaced the performance deck with the suite's full
piano / hex / ribbon surface and removed the scanline treatment.** The new deck
combines Moire's one-canvas surface switcher with Aliquoto/Cella's 37-note piano
range and +2/+1-semitone isomorphic hex mapping. Piano and hex gestures still
enter Physa's last-note-priority queue; the four-octave ribbon writes continuous
frequency and velocity into the same single element. QWERTY follows the selected
surface: the piano uses the `a w s e d f…` row, hex uses four staggered rows, and
ribbon is pointer-only. The monophonic one-element/one-history model is unchanged.

Removed every `repeating-linear-gradient` from the page, including the ground,
header, equation display and plot windows. Vendored
`xyhtamura.github.io/fonts/GOMini-Goofy.ttf` to
`physa/fonts/GOMini-Goofy.ttf` and made it the display face for the title and
section labels; Space Mono remains the measurement/control face.

Verified all three modes in the displayed in-app browser: GOMini loaded from the
vendored file, piano rendered 37 notes, hex rendered 48 close-packed cells,
ribbon rendered four octaves, switching changed the canvas height and hint, and
the console stayed clear. `physa/test.html` passed all 42 offline checks.

2026-08-27 — Claude Code — **Added a Circuit panel: the topology the Colony and
Mould dials actually build, drawn from the numbers the worklet reports.** It sits
as a full-width cell at the foot of the analysis bank, below Hysteresis and
Current, because it is what those two panels are readings *of*.

A drive source on the left, N memristive branches in parallel across it, the
mould capacitor beside them when the dial is up, and Rref on the return with the
output tap. Each memristive branch is drawn with its wire thickness set by its
tube thickness `D`, labelled with its own `M(q)` and its share of the total
current; the mould branch is in *Physarum*'s chrome yellow, the palette's
reserved memoryless colour. The one relationship the panel exists to show is the
quadrature — the capacitor peaks a quarter cycle away from the memristors — so
the cycle is replayed at 0.5 Hz (a **Slow cycle** rocker drops it to 0.12 Hz).
The element runs at the note's pitch, two orders above the frame rate, and the
caption says so rather than implying the animation is the real waveform.

The worklet now reports `this.freq` alongside the rest of its state, which is the
only change below the UI; test.html picks the worklet out of `index.html` at run
time, so this is the version under test.

Branch brightness is normalised against the busiest branch rather than the total.
Normalising against the sum dims every branch just for adding another, which is
backwards: they are in parallel.

**Verified 2026-08-27** by pixel-probing the canvas and calling `drawCircuit()`
directly, because the browser pane is still not displayed in this session and
`requestAnimationFrame` therefore never runs. The pane refuses screenshots for
the same reason, so this panel joins the reskin in having been *measured* and not
*seen*.

- Structure, by column ink profile: 1 element → peaks at the source, one branch,
  and the sense resistor; 6 elements → six branch peaks; 6 + mould → seven. Source
  in `--verd-hi`, sense resistor in `--iris`, branches in `--hot`, mould in
  `--slime`, all counted by nearest-colour against the `.terminal` palette.
- **The mould share reproduces an independently measured number.** Constant
  M = 1200 with 1.4 µF at 110 Hz reads 75.8%, against the 75.77% *opening* recorded
  2026-08-25 for that same row and a closed form of 75.8%. Impedance reads 783 Ω
  against a closed-form 783 Ω.
- Capacitive share scales with pitch as it must: 75.8% → 91.8% → 97.8% across
  three octaves, which is the same 8× in `ωC` the loop panel measures.
- Quadrature holds: mean alpha over the memristive branches peaks at phase 0.25
  and 0.75 exactly where the mould branch bottoms, and reverses at 0 and 0.5.
- At 642 px with 8 elements and the mould — the worst case for space — the label
  band resolves into 26 separate ink runs with an 81 px minimum gap between
  adjacent branch groups, so nothing collides, and the page has no horizontal
  overflow.
- `physa/test.html` still passes every check, and the console is clear.

Left undone, unchanged: per-partial elements, MIDI against real hardware,
cross-note memory, the 55 Hz provenance question. Added to that list: **nobody
has looked at the Circuit panel**, and its 0.5 Hz replay in particular is a
judgement about legibility that measurement cannot settle.

2026-08-27 — Claude Code — **Renamed the `pinch` readout to `opening` and rewrote
the Hysteresis caption.** Raised by Xyh, who read the panel the way the label
invites: a high number as a strong memristor fingerprint. It is the reverse. The
measure is `|I|` at the voltage zero-crossings as a share of peak current, so it
reads **0 on a pinched loop** and climbs as the loop opens. Under the old label
the ideal element scored 0.00% and the RC network scored 75.77%, which inverts the
one distinction the panel exists to carry.

The word survives where it is accurate: `test.html`'s assertions already read
"a plain resistor pinches" against a *low* value, and those are unchanged.

Renamed through: the legend, the `#openPct` id and its CSS rule, the
`loopMeasures` return key and its doc comment, all of `test.html`, the table
above, and the ROADMAP Mechanism line — which had also mis-named this as the
measure that tells a memristor from an RC network. Two do: harmonic content
separates them, and so does the opening. The ROADMAP now says which.

The caption was replaced outright. It read "**Memory**, **harmonic** and
**pinch** describe the loop", which fails
[WRITING_VOICE_AGENT.md](../../WRITING_VOICE_AGENT.md)'s test for interface
text — a reader could not act on it without having read something else. It now
defines each readout, states which direction means what, and gives the two-line
discriminator between a memristor and a capacitance in parallel.

**Verified 2026-08-27**: the three reference rows reproduce exactly, with no
number shifted by the rename — plain resistor 0.01 / 0.01 / 0.00%, memristor on
the HP curve 3.79 / 4.13 / 0.00%, resistor + 1.4 µF 57.42 / 0.01 / 75.77%. All
`test.html` checks pass and the console is clear. Read back from the live DOM
rather than from the source, since `pinchPct` is gone and a stale id would have
thrown silently into a readout nobody watches.

2026-08-29 — Claude Code — **Recorded the membership gap, no code.** Xyh asked
whether Physa belongs in Anexacta given that it is monophonic and does not do the
grammar. Checked it against the criterion `suite.md` already states — expression
DSL, Hz voice seam, n-EDO, surfaces, MIDI/WAV export — and against the Horn of
Plenty precedent of 2026-08-03. Findings: no `compileExpr`, no `MENV`, no
`sum n=1..N`; the only compiled expression is `M(q)` at `index.html:1242`, baked
to a 1024-entry LUT that never sees `hz`; `hzOf` is hardcoded 12-EDO; no MIDI file
import or WAV export. The seam is `noteOn(midi, vel)` rather than
`startNote(id, hz, vel)`, and that single mismatch is why n-EDO never carried over.

Monophony turned out to be the wrong worry — it is not in the criterion, and the
comment at `index.html:1343` argues it well. The grammar is the real gap. Wrote it
into Left undone as a second bullet paired with per-partial elements, into
Relation to the rest as the standing status, into `../suite.md`'s taxonomy entry,
and into the root `ROADMAP.md` Next in Dev line. Nothing in the instrument changed
and nothing was re-measured.

2026-09-08 — Claude Code — **Re-sited hysterion's two cited measurements into Physa,
which discharges the condition blocking its deletion.** Xyh decided to abandon hysterion
for Physa; the absorption of 2026-08-25 had already moved the tests, but two specific
numbers the ESNMA argument quotes had only ever been produced in hysterion, and both
`NOTES.md` and the root ROADMAP entry said not to delete it until they were re-sited.
Both now reproduce against `loopMeasures`, driven from the page console with no UI
involved.

**Harmonic null.** Steady-state series RC, τ = 75.7 ms against a 12.5 ms period:
harmonics above the fundamental measure **3.1e-31**, against hysterion's 1e-18. Both are
numerical zero and the gap is summation path, not disagreement. Worth more than the
reproduction: `opening` came out at **0.026271468** against **|sin φ| = 0.026271468** for
the same network, so the claim that a capacitance's whole memory signature is a phase
shift of the fundamental is exact here to eight decimal places rather than merely
consistent with a near-zero harmonic figure.

**Transient pinch.** Series RC from rest, same τ and period, RK4 at 400k steps over 12
cycles. hysterion: 0.39, 0.72, 1.00, 1.24%. Physa: **0.400, 0.739, 1.026, 1.270%**.

**The re-run found something the original phrasing hid, and it strengthens the argument.**
Those four are *one family* of voltage zero-crossings. The alternating family over the
same cycles sits at **5.05, 4.68, 4.37, 4.10%** — an order of magnitude wider, closing
from the other side as the transient decays. So the loop does not pinch: it has one
near-origin crossing and one wide crossing per cycle. A transient RC is mistakable for a
pinched loop only by reading the near family and not the far one, which is a sharper and
more falsifiable claim than "passes within one percent of the origin" and is now written
into the preprint spec.

**Limitation, and the reason for the new Left undone bullet.** Physa's shipped `opening`
readout averages both families and reports ~2.5% rising slowly per cycle for this
transient. It does not show the pinch and must not be quoted for it. Reproducing the
table needs per-crossing values, which the UI does not expose.

Verified by measurement in the browser at `localhost:8000/anexacta/physa/`, calling
`loopMeasures` directly against synthesised V/I arrays — the pane was hidden, so nothing
here rests on a rendered readout. Sanity check first: a pure resistor (I ∝ V) returns
H = 5e-32, harm = 9e-32, opening = 0. Nothing in the instrument was changed; this session
only measured it. Undone: the per-crossing readout, and `hysterion/` is still on disk —
deletion is now unblocked but was not done, and it has no version control, so it is
Xyh's call. Moved to `archive/hysterion/` later the same day.

2026-09-11 — Claude Code — **Measured whether Physa can process a voice, on Xyh's
question about introducing vocality. The obvious route does not work, and the
reason it fails names the route that does.** No code changed; this session only
measured.

Method: extracted the shipping worklet from `index.html` the way `test.html` does,
ran it under Node with an `AudioWorkletProcessor` shim, and patched exactly two
lines — the drive (`drv*Math.sin(this.phase)` → an external buffer at the
oversampled rate) and the mould branch (closed-form quadrature → numeric
derivative, which is what it must become for a drive with no single phase). The
mould was off in every run reported here, so that second patch affects no number
below. Drive was a synthetic vowel: impulse train at f₀ = 120 Hz through three
formant resonators, HP curve, μ = 10⁶, τ = 2 s, AGC off, 48 kHz, measured 0.4–0.9 s.

**Feeding a voice to the element as the drive does nothing.** With the input
DC-blocked at 60 Hz — what any mic input stage gives you — the charge excursion at
amplitude 1 is **[−0.044, 0.044]**, about 4% of the domain, and the output differs
from the input by 0.40 dB in the busiest band. Raising amplitude to 2 reaches
±0.09 and 1.14 dB. Compare the 110 Hz sine that the page is calibrated on, which
sweeps **−0.686 to 0.937**. τ across 0.02–0.5 s changes nothing (charge span moves
by 0.007), and `edge: wrap` is bit-identical to `clamp`, because q never reaches
the wall.

**Why, and it is the mechanism rather than a setting.** `q` is the time-integral of
the current, so the charge sees the drive spectrum with a 1/f weight — the same
fact behind the keyfollow table above, read the other way round. A vowel's energy
is in its formants, and its fundamental is 26.5 dB below its total. Normalise a
voice to a sane peak and almost none of what you fed it lands where the charge can
hear it. The element sits in a 4%-wide patch and behaves as a linear resistor.

**The undisciplined version is worse, not better.** Without the DC block, a raw
glottal waveform is non-negative, so the charge walks to the clamp and parks:
q reached 1.000 at every amplitude tested. Above amplitude 0.5 the output gains
+29 dB in the 2.5–4.8 kHz band, which reads as dramatic and is not memristance —
it is the element pinned against `edge: clamp` at one end of the curve. The
transition is a cliff between amplitude 0.25 (+0.41 dB) and 0.5 (+16.4 dB), with
no usable middle.

**What the element actually is, on a broadband drive.** Correlating the output
against the input times `Rref/M(q(t))` gives **r = 0.9988**. To three decimal
places it is not a waveshaper; it is a **gain modulated by the drive's own charge
history**, applied to the whole band. That is why it flattens a formant envelope
rather than colouring it: multiplying by a gain periodic at f₀ convolves the
spectrum with a harmonic comb and fills the valleys. At amplitude 1 the gain's
modulation depth is ~50% of its mean at every harmonic from f₀ to 8f₀.

**Per-band elements pass, and the compensation is μ ∝ band centre.** Eight
log-spaced bandpasses into eight elements. With μ flat at 10⁶ every band above
125 Hz sits at ±0.04 — the situation today. With μ scaled by the band centre, each
element lands in a usable patch. Scaling at exactly f_c/f₀ pins the top three
bands; **0.5·f_c/f₀** does not. Charge span as a fraction of the domain, per band,
with no per-band level normalisation, so the phoneme decides which elements work:

| | 125 | 250 | 500 | 1k | 2k | 3.15k | 5k | 8k |
|---|---|---|---|---|---|---|---|---|
| /a/ span | 0.021 | 0.061 | 0.234 | **0.670** | 0.634 | 0.578 | 0.561 | 0.552 |
| /i/ span | 0.149 | **0.404** | 0.397 | 0.370 | 0.413 | 0.503 | 0.503 | 0.495 |
| /s/ span | 0.001 | 0.003 | 0.011 | 0.029 | 0.130 | 0.359 | 0.527 | **0.608** |

**And the wear map comes out phoneme-specific**, peak wear per band after 1 s at a
2 s half-life:

| | 125 | 250 | 500 | 1k | 2k | 3.15k | 5k | 8k |
|---|---|---|---|---|---|---|---|---|
| /a/ wear | 0.299 | 0.443 | **0.574** | 0.418 | 0.111 | 0.043 | 0.016 | 0.006 |
| /i/ wear | 0.609 | **0.736** | 0.290 | 0.082 | 0.083 | 0.050 | 0.016 | 0.006 |
| /s/ wear | 0.005 | 0.021 | 0.073 | 0.166 | 0.117 | 0.089 | 0.280 | **0.347** |

/a/ wears where its F1 and F2 are, /i/ wears at its low F1, /s/ wears the top two
bands. **The substrate becomes a record of which phonemes were spoken into it** —
which is the existing senescence mechanic doing exactly what it claims, made
legible for the first time because there is now more than one element to wear
unevenly. Note that wear does not simply follow span: /s/ at 1 kHz has a span of
0.029 and a wear of 0.166, because a narrow span concentrates the deposit. Quiet
bands are notched; loud bands are flattened.

**Proposal, not a decision.** A vocal processor is worth building and the shape is
forced by the above: mic → DC block → gain → a filterbank of N elements with
μ ∝ f_c, summed. That is **the per-partial colony already at the top of Left
undone, indexed by band instead of by partial**, so it is one build rather than
two — and a filterbank is the version that does not require additive synthesis
first. Three things it needs that do not exist: `numberOfInputs: 1` on the node
(currently 0), the mould branch as a numeric derivative, and a hysteresis capture
that does not assume `this.phase` — an X-Y trail over a sliding window rather than
a phase grid, which is what a scope in X-Y mode actually shows for an aperiodic
drive.

**Rejected in the same sitting: a formant filter on the output.** Physa's audio-rate
dynamics are one leaky integrator and a static nonlinearity in q, so the page has no
poles and **structurally cannot make a resonance**. Adding a vocal tract would be a
second instrument bolted on, and everything you heard would stop coming from M(q),
which is the page's whole argument. Per-band elements get vocality from inside the
mechanism instead.

**Limitations.** The drive was a synthetic vowel, not recorded speech — no jitter,
shimmer, or breath noise, and a more regular pulse train than a real glottis. The
1/f finding is robust to that, since it follows from the integrator and any
formant-dominated spectrum, but the wear tables would move with a real voice.
Nothing here was heard; all of it is offline measurement. `test.html` was not
re-run, because nothing in the instrument changed.

2026-09-11 — Claude Code — **Built the voice path: the input processed by the
circuit built above it, one element per band.** Xyh's call after the measurement
session earlier the same day, and deliberately not a change to the synthesizer —
it is an effect on top of a vocal, with its own source, its own controls, and
nothing to do with the note input.

**What it is.** A **Voice** cell in the analysis bank, full width above Circuit.
Input arrives from the microphone or a dropped audio file, is DC-blocked, split
into 4–12 constant-Q bands, and each band drives its own memristive element
through the same `M(q)`, mould, reinforcement and senescence the keyboard plays.
The bands sum, cross-fade against the untouched signal, and join the synth output
before the limiter. Controls are **Input**, **Mix**, **Bands**, **Tilt** and
**Level**; the display shows each band's charge span, its level, and the wear it
has deposited.

**Why a bank rather than a single element, which is the whole design.** Measured
earlier today: `q` is the time-integral of the current, so the charge sees the
drive with a 1/f weight, and a voice's energy is in its formants. A DC-blocked
voice at amplitude 1 moves the charge **±0.044** of the domain, against
−0.686..0.937 for the 110 Hz sine the page is calibrated on. One element hears
almost nothing a voice does. Splitting into bands and scaling μ with band centre
is the compensation, and **Tilt** is that scaling on a dial: at 1 every band
reaches its element, at 0 only the low ones do, which is a bass-only effect kept
on purpose because it is what the instrument does without the correction.

**Decisions, with the reasoning that is not visible in the code:**

- **One substrate, two ways to abrade it.** The band elements deposit into the
  same `this.wear` array the synth path uses, so singing wears the curve the
  keyboard plays. Verified live: 39 s of a spoken phrase took the shared map to
  5.4% mean wear with a peak of 0.777 at charge +0.008, and the curve display,
  gauge and `--age` bloom all followed.
- **No AGC on the voice path, and a fixed makeup instead.** The wet path's gain is
  `Rref/M(q)`, which averages `Rref/flat` — about 1/40 on the HP curve — so
  without makeup the wet signal arrives 32 dB under the dry one and Mix is not a
  crossfade. An AGC would fix the level and also flatten the drive axis, which is
  the axis the effect is played on. The makeup is `flat/Rref`, which is **exactly
  1 for a constant M(q)**, so a plain resistor passes the input through at its own
  level. That is asserted rather than described.
- **The mould becomes a real differentiator.** `capF*(v−v_prev)/dt` instead of the
  closed-form quadrature, because an input has no single drive phase. Each band
  has its own, so the capacitance carries most current in the top bands — the
  sibilants pass least processed, which is the same behaviour the keyboard shows
  at the top of its range.
- **Constant-Q bandpasses, not a perfect-reconstruction bank.** Difference-of-
  cascaded-lowpasses telescopes to the input exactly (measured 2.22e-16) and was
  **rejected**: below each band the two lowpasses both pass unity magnitude at
  different phases, so a 267 Hz tone came out of band 2 at +0.4 dB against band
  1's −0.7 dB. Reconstruction was exact and isolation was nil, and isolation is
  what makes the per-band μ mean anything. Constant-Q at Q = 1.2/octave-spacing
  gives 6.1 dB of isolation and 1.4–1.9 dB of summed ripple, which does not read
  as a comb. The bank's summed gain is normalised by **evaluating its own transfer
  function** at 25 probe frequencies on every parameter change, rather than
  carrying a tuned constant that would be silently wrong at every band count but
  the one it was tuned at.

**Verified 2026-09-11.** `test.html` grew from 42 checks to **54, all passing**,
and the new ones render the shipping worklet with a real signal connected to
`inputs[0]` rather than driving it internally:

- With nothing connected the synth path is **bit-for-bit unchanged** — the voice
  path does not exist until something is patched in, so none of the measurements
  above are measuring a different instrument.
- Mix at dry passes the input through with **max difference 0.00e+0**.
- Summed ripple 1.88 / 1.76 / 1.39 dB at 4 / 8 / 12 bands, elements linear.
- Tilt at 0 leaves every band above 1.2 kHz idle (max span 0.028); Tilt at 1 puts
  every one of them to work (min span 0.098).
- **The wear record is phoneme-specific**, which is the payoff:

| | 110 | 199 | 360 | 652 | 1181 | 2137 | 3867 | 7000 Hz |
|---|---|---|---|---|---|---|---|---|
| /a/ | 0.031 | 0.096 | 0.375 | **1.665** | 1.241 | 0.258 | 0.063 | 0.016 |
| /i/ | 0.518 | **1.615** | 1.093 | 0.280 | 0.106 | 0.165 | 0.056 | 0.011 |
| /s/ | 0.000 | 0.001 | 0.002 | 0.007 | 0.022 | 0.079 | 0.349 | **0.695** |

  /a/ wears where its F1 and F2 sit, /i/ wears at its low F1, /s/ wears the top.
  The substrate becomes a record of what was said into it, which is the existing
  senescence mechanic finally having more than one element to wear unevenly.
- Worst case — 12 bands, Input at 16, Level 3, full reinforcement, 20 µF of mould,
  and a note held at 55 Hz — stays finite, peaks at the limiter's 1.0 asymptote,
  and every band charge stays inside the domain.
- Cost: **17–19% of one core** in V8 for 12 bands alongside the synth path.
- At the shipped defaults a −12 dBFS source never reaches the limiter and a
  −1 dBFS source touches it on 6.55% of samples, which is transient catching.

Also verified in the page rather than the harness: the file path decodes,
connects and reports telemetry; `applyPreset` leaves the voice controls alone and
re-pushes them correctly; the panel's skin paints at 899×493 rather than 0×0 (the
2026-08-25 lesson); and at 12 bands the label band resolves into 12 groups with a
44 px minimum gap and no horizontal overflow.

**Undone, and one correction to the standing list.** Per-partial elements for the
*synth* path are still not built and remain the Next in Dev — the bank built here
is indexed by band and fed by an input, which is the same machinery pointed at a
different problem, so it is a step toward that item rather than that item. Also
still open: the Hz voice seam and the grammar, MIDI against real hardware,
cross-note memory, per-crossing `opening`, and the 55 Hz provenance question.

New to the list: **the hysteresis and circuit panels still assume the synth
drive.** The loop is captured on a phase grid derived from `this.phase`, which an
aperiodic input does not have, so with only the voice path running those two
panels show the last note played rather than the input. An X-Y trail over a
sliding window is what a scope actually shows for an aperiodic drive and is the
honest replacement. **The microphone has never been used** — the automation
browser denies the permission, so only the denial path and the file path are
exercised. And **nobody has looked at any of this**: the browser pane refused
screenshots in this session as in the six before it, so the Voice panel joins the
reskin and the Circuit panel in having been measured and not seen.

2026-09-11 — Claude Code — **Fixed the hysteresis and circuit panels for an
aperiodic drive.** Both assumed the synth's sine: the loop was folded onto a phase
grid derived from `this.phase`, and the circuit replayed a cycle at 0.5 Hz. With
only the voice path running, both showed the last note played. A **Showing:
Drive / Input** switch now sits in the Hysteresis head and moves both panels
together — the circuit is the topology the loop is a reading of, and letting one
show the drive while the other showed the input would be a trap.

**The trail is one band's own voltage against its own current, and it has to be.**
My first version plotted the bank's input against the bank's total current, which
seemed like the obvious two-terminal view. It is wrong, and measurably: a **plain
resistor behind one bandpass read 36.6% memoryless and 33.5% opening**, where the
element has neither. A bandpass on its own reads as memory, so that plot measures
the filterbank as much as the elements. The trail is now one band, selected by a
**Shown** dial in the Voice panel, which also marks the band in the band display
and in the circuit. Changing it clears the trail, since a trail mixing two bands
would be neither.

**Memory and harmonic are defined at a fundamental, and an input has none.** Rather
than print the old numbers against a drive that cannot support them, the Input
legend carries their counterparts:

- **memoryless** — the share of the current no single-valued `i(v)` can account
  for. Zero for a resistor; high for anything with state, a plain capacitance
  included. Computed by binning on `v` and measuring what the best `i(v)` misses.
- **nonlinear** — what is left after the best **two-pole linear** model of the
  band, `i[n] = a₁i[n−1] + a₂i[n−2] + b₀v[n] + b₁v[n−1] + b₂v[n−2]`. Zero for a
  resistor *and* for an RC network, so only a genuinely nonlinear element reads
  high. This is the pair that keeps the distinction the panel exists to carry.
- **opening** — unchanged, and it never needed a fundamental. It is `|i|` at the
  voltage zero crossings over peak `|i|`, and any drive has zero crossings.

Two poles rather than an FIR because the mould at 20 µF is a 24 ms time constant,
some 600 taps at the trail's rate; two poles represent any second-order linear
network exactly, which is what a resistor, a parallel capacitance and a series RC
all are.

**The fit is ridge-regularised, and that is not a refinement.** For a plain
resistor `i` is exactly proportional to `v`, so the regressors are perfectly
collinear, the normal equations are singular, and the unregularised solve reported
**the one case that must read zero as 100%**. Near-collinearity is the same fault
more quietly: the fit reaches for huge cancelling coefficients and absorbs the
nonlinearity it is there to expose. λ = 10⁻⁷ · trace/K. There is a check for this
specific case in `test.html`.

**The trail is a sliding window, not a folded cycle** — 768 points at 24 kHz
effective, so 32 ms, drawn oldest to newest with the alpha rising so the direction
of travel is visible without an arrowhead. An earlier version decimated 8× with no
anti-alias filter, which folded everything above 3 kHz into both the picture and
anything fitted to it; 2× keeps the fold above 12 kHz. It is drawn in 16 alpha
steps rather than 768 per-segment strokes, which is the difference between the
panel costing nothing and costing the frame.

**The circuit panel gains a band view.** One branch per band, thickness from its
tube, brightness and percentage from the live current the worklet reports — there
is no cycle to replay, so nothing is animated on a phase. When the mould is up
**each band carries its own capacitance beside its own element**, drawn that way
because that is where it is, and because it is why sibilants come through least
processed: a band's capacitive current goes as its own ω. The source is drawn as
the actual input waveform rather than as a sine.

**Verified 2026-09-11.** `test.html` grew from 54 checks to **61, all passing**.
The harness now **slices the measures out of `index.html`** between
`MEASURES-BEGIN` and `MEASURES-END` and evaluates them, the same way it already
extracts the worklet — a second copy in the harness could pass while the page was
wrong. The 2026-08-25 hysteresis table, re-run with a voice instead of a sine:

| | memoryless | nonlinear | opening |
|---|---|---|---|
| plain resistor | 0.16% | 0.00% | 0.00% |
| resistor + 1.4 µF | **74.50%** | 0.01% | **30.87%** |
| quartic soft knee | 24.91% | **45.67%** | 0.01% |

Same shape as the original table: the mould scores high on the memory-like reading
and nil on the one that requires nonlinearity, and the panel can still say it has
been fooled.

Also checked live in the page rather than in the harness: turning the Mould from 0
to 1.4 µF moved memoryless from 0.1% to 93.4% with nonlinear unchanged at 0.0% and
opening from 0.0% to 41.4%; the measure tracks drive as it should (the quartic
curve reads 19.6% / 4.3% at Input 6 with a 0.917 charge span and 29.9% / 28.5% at
Input 16 with a full sweep); switching Drive→Input→Drive is stable and idempotent,
with both canvases painting in both modes and the console clear; and at the worst
case for space — 12 bands with the mould on, so every band carries a capacitor —
the circuit's label band resolves into 14 groups with a 35 px minimum gap and no
horizontal overflow.

**One reading that looks wrong and is not.** The *hard switch* curve reads 0.19%
nonlinear. Its band-4 charge range is [−0.630, −0.028] — entirely negative, so the
switch at `q = 0` is never crossed and the element really is a constant 7000 Ω
resistor under that drive. Worth knowing before quoting the measure: it reports
what the element did, not what the curve could do.

**Undone.** The microphone still has never been used — the automation browser
denies the permission, so only the file path is exercised. Nobody has looked at
any of this: screenshots timed out again, as in the seven sessions before it, so
the trail rendering, the alpha ramp, and the band view are measured and not seen,
and whether a 32 ms window is the right length is a judgement measurement cannot
settle. Per-partial elements for the synth path, the Hz voice seam and the grammar,
MIDI against hardware, cross-note memory, per-crossing `opening`, and the 55 Hz
provenance question are all unchanged.

2026-09-11 — Claude Code — **Split the controls into a Synth / Voice view.** Xyh's
ask, and the right one: the page was carrying two full control sets, and in either
use about half of it was inert — a vocal session was staring at a 37-note keybed,
glide, velocity and a colony count that does nothing for it.

**It is a view, not a mode, and that was the one change I made to the ask.** The
switch changes what is on screen and never what is running. Both paths keep going
whichever is shown: the synth sounds while a note is held, the voice path
processes whenever a source is connected, and they share one substrate either way.
Making it a mode would have cost the best thing in the build — sing into it, then
play the curve you wore — by turning something you can *do* into something you
have to be told. The other half of that bargain is the **chip**: when the hidden
half is live it says so ("voice live: vowel.wav", "note sounding"), because
nothing should run unseen without saying so.

**What is in each view, and what is in both.** The split follows what the two
paths actually share rather than where the controls happened to sit:

- **Both, always:** `M(q)`, μ, τ, charge domain, Mould, Senescence, Reinforce,
  master Output, and every analysis panel. That is the circuit — the object both
  drives interrogate — and it never moves.
- **Synth only:** the performance deck and its glide and velocity, drive
  Amplitude, Auto level, and the colony's Elements and Spread. Also the MIDI,
  octave and sustain chips.
- **Voice only:** the Voice cell — source, Input, Mix, Bands, Tilt, Level, Shown,
  and the band display.

Reinforce is in both because the voice path genuinely uses it: the bands are the
colony there, and the caption says so rather than leaving the same word to mean
two things silently. The Drive chamber's heading reads **Output** in the voice
view, since there is no drive in it.

**The analysis panels follow the view** — choosing a view is choosing what you are
working on — and stay independently switchable afterwards, because watching what a
voice is doing to the element while playing it is a real thing to want and the
Drive/Input switch is still there for it. Connecting a source moves the view to
Voice, which is what the person just asked to look at.

Implemented as `body[data-view]` against `data-only` attributes, so the split is
one CSS rule rather than a list of elements toggled in JS; a control that leaves
the screen keeps its value, and `params()` keeps reading it. `frame()` no longer
draws into whichever of the deck or band canvases is hidden — a hidden canvas has
a zero-width box, so that was work with no result.

**Verified 2026-09-11**, by reading the DOM at 1280×900 with the pane hidden:

- Every synth-only control reports `offsetParent === null` in the voice view and
  back again on return; the shared ones (`eq`, `sen`, `cap`, `rein`, `gain`) stay
  visible in both. Switching Synth → Voice → Synth is idempotent.
- **Both paths keep running across a switch, which is the whole claim.** With a
  file connected, moving to the synth view left `vOn` set, telemetry arriving, the
  shared substrate wear rising from 3.87% to 10.3% over three seconds, and the
  played counter advancing 1.4 → 4.4 s. In the other direction, holding a note in
  the voice view with the deck hidden still sounded — analyser peak 0.355 — and
  the chip read "note sounding", clearing on release.
- Page height 1775 px in the synth view and 2004 px in the voice view, against
  roughly 2270 for the combined page, so both views are shorter than what they
  replaced.
- The switch holds its layout from 1440 px down to 700 px: two 144 px buttons on
  one row, no overlap, no horizontal overflow.
- `test.html` still passes all **61** checks. Nothing in the worklet changed, and
  the suite confirms it.

**Found, not fixed, and unrelated to this change:** below about 700 px the header
overflows by ~200 px, and the offender is the KaTeX element definition in the
nameplate (`#tex1` measures 315 px against a 420 px body). It predates the view
switch. The equations would need to wrap or scroll in their own container.

**Undone:** the microphone still has never been used. And nobody has seen any of
this — screenshots timed out again, so the view split, the chip, and the trail
rendering are all measured and not looked at.

## 2026-09-30 — Codex — move out of Anexacta

Moved the complete instrument, font, favicon, notes, and offline harness to
`xyhtamura.github.io/physa/`. The instrument and harness retain their adjacent
paths; the DSP is unchanged. Physa remains monophonic with its own `M(q)`
language. The per-partial additive/grammar plan was superseded because it was
intended to earn membership in Anexacta, rather than develop this instrument.
Next is a measured cross-note memory check.

Public destination: `https://xyhtamura.github.io/physa/`. Local destination:
`http://localhost:8000/xyhtamura.github.io/physa/`. CV, portfolio, public page
links, and the representative-image manifest URL update are left to Antigravity
at Xyh's request. No redirect remains at the former Anexacta path. Repository
history before the move is in Anexacta, through commit `13b13e0`.

Verification: all 61 checks pass in the relocated `test.html` against the
shipping worklet, and the relocated instrument starts audio with no captured
console warnings or errors. The instrument, harness, font, and favicon match
the files moved from Anexacta. Microphone permission and physical MIDI hardware
were not exercised. Nothing was pushed or deployed.
