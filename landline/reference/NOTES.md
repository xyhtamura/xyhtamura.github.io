# a landline imagining a line probe during a storm

Title settled 2026-08-08. Built in `F:\xyh\line-probe\`, moved here 2026-08-31 so it
would be under version control; the renders and the submission package stayed behind.

Fixed-media electroacoustic piece. Stereo, 48 kHz / 24-bit.
Two versions: **5:06** (for submission) and **10:06** (full).

Made for the Electronic Thinking call (HfM Weimar, 10 August 2026), which did not
select it. The submission package stayed in `F:\xyh\line-probe\SUBMISSION.md` and
the call is tracked in `F:\xyh\profiles\open-calls\OPEN-CALLS.md`; neither is
published.

## What it is

A telephone line degrades over the duration. A modem repeatedly tries to open a
connection across it. Each attempt emits the ITU-T call-setup sequence — the V.8
answer tone, the V.34 line probe, the V.21 capability exchange — measures what
came back, and negotiates whatever rate the line will carry. As the line worsens
the negotiated rate falls, and past a threshold nothing can be negotiated at all.

**No attempt is heard whole.** The negotiation runs complete underneath; what is
placed in the piece are fragments cut out of it, none longer than a second,
scattered across a window wider than the attempt itself so the attempts overlap
and their edges cannot be found by ear. The process is complete, the audition of
it is partial. Underneath everything is the line at the edge of audibility for
the full duration — near-black, never silent.

Everything is synthesised from the Recommendations. Nothing is sampled.

## Why it is built this way

The obvious version is a downloaded dial-up recording put through a granulator.
That is granular synthesis used as an effect on a nostalgic object, and it is
what the Weimar call explicitly says it is not looking for — technology as a
means rather than as a consequence for the content.

The V.34 handshake is already the piece. Line probing is a machine emitting tones
to find out what the channel between it and another machine actually is, and then
choosing what it is able to say based on the answer. So:

- **The near-silence is the object of the measurement, not a backdrop.** This is
  what the 2013 predecessor got wrong: quiet blips over silence, two layers, the
  silence decorative. Here the noise floor is what the probe measures against,
  and it determines every event that follows.
- **The form is the protocol's.** The descent through the fallback ladder is not
  scripted. It falls out of measuring a degrading channel, which is why the
  connection recovers when a storm gust eases.
- **Fragmentation is not a treatment applied afterwards.** The full attempt is
  synthesised and measured; only pieces of it are sounded. That is the difference
  between a fractured recording and a complete process heard partially.
- **The stereo image is the two ends of the call.** Originating DCE left,
  answering DCE right, line noise uncorrelated across both. Fragments keep a bias
  toward their source's side. No reverb, no processing beyond the channel model.

## Files

| File | Role |
| :-- | :-- |
| `protocol.py` | Signal generators from the Recommendations: ANSam, V.21 FSK, the V.34 probe comb. Frequencies and durations cited inline. |
| `line.py` | The subscriber loop: frequency response, noise bed, and the receiver-side measurement. |
| `negotiate.py` | Measurement → mode. The only place the ladder is decided. |
| `render.py` | Attempts, fragmentation, scatter, storm curve, 24-bit WAV + JSON log. |
| `tune.py` | Fits `--ceiling` to the measured failure point. Run after any change to the noise floor, channel model or ladder. |
| `check.py` | Level/headroom report and spectrogram. Uses PIL, not matplotlib. |
| `check_statement.py` | Character-counts the submission statement against the 2,000 limit. |

```bash
python tune.py                                                   # fit the ceiling
python render.py --seconds 300 --seed 3 --out line-probe-5.wav   # submission
python render.py --seconds 600 --seed 3 --out line-probe-10.wav  # full
python check.py line-probe-5.wav
```

The JSON beside each WAV logs every attempt (time, storm, measured bandwidth and
SNR, negotiated mode) and every fragment (source, position, length). It records
the parts of the process that were never sounded. It is the score.

## The one coupling to understand before editing

**The audible noise floor and the descent are not independent.** The negotiation
measures the same bed the listener hears, so lowering `NOISE_DBFS` raises SNR and
the line survives further into the storm; the storm curve then has to be refitted
or the piece ends on a working connection. `tune.py` exists because this bit
twice. Never fix a mismatch by giving the measurement a different level from the
mix — that is the one change that would break the premise of the piece.

## Verified (2026-08-08)

Both renders at `--seed 3 --ceiling 3.06`, checked with `check.py`:

| | 5-minute | 10-minute |
| :-- | :-- | :-- |
| Duration | 306.0 s | 606.0 s |
| Peak | −14.19 dBFS | −19.01 dBFS |
| Overall RMS | −52.52 dBFS | −52.66 dBFS |
| Median 1 s RMS | −67.2 dBFS | −67.2 dBFS |
| Below −55 dBFS | 266/306 s (87%) | 543/606 s (90%) |
| Attempts | 14 (11 connect, 3 fail) | 28 (23 connect, 5 fail) |
| Fragments | 97 | 187 |
| Fragment length | 0.035 / 0.173 / 0.798 s | 0.036 / 0.180 / 0.863 s |
| Gap between fragments | median 2.00 s, longest 28.2 s | median 1.91 s, longest 33.7 s |

Zero clipped samples and DC below 1e−8 in both. Median 1-second RMS is identical
across the two, which is the point of levelling from the bed rather than the peak.
Fragment lengths respect the 1 s ceiling and are heavily skewed short.

Probe comb checked against spec: 25 tones on the 150 Hz grid from 150–3750 Hz
minus the four omitted (900/1200/1800/2400) = 21, and L1's "24 repetitions" is
exactly 24 × 1/150 s = 160 ms. The two figures agree independently.

## Bugs found and fixed

Recorded because each was the model quietly contradicting itself.

1. The probe was measured at unity amplitude while the mix placed it at −26 dBFS,
   so the negotiation was not a measurement of the audible line. Both paths now
   read the same gain constants.
2. Usable bandwidth was the longest *contiguous* run of surviving tones, making a
   single null catastrophic and sending the ladder down several rungs at once.
   It is now the total of surviving tones — a modem answers a notch with
   pre-emphasis rather than abandoning the band above it.
3. Mains hum was added *after* the channel filter, bypassing the telephone band
   limit; an unfiltered 50 Hz tone would have been the loudest sustained thing in
   the piece. The bed is now filtered as a whole.
4. Notch depth `0.75 * storm` exceeded 1 at high storm and inverted the null's
   phase. Clamped.
5. Peak-normalising the bed after filtering coupled level to storm backwards.
   Calibrated against a fixed dry-line reference (`DRY_GAIN`) instead.
6. Noise level and impulse rate scaled with raw storm, which the fragmentary
   version drives past 3.0 — the bed was rising 37 dB and reaching ~150 clicks
   per second, turning the ending into loud crackle. Both now saturate at
   `STORM_SATURATES`.
7. The bed took the full end-to-end loop loss, so it vanished late in the piece
   (some seconds at −96 dBFS). Noise is induced along the loop's length and does
   not cross all of it; shaping now saturates too, and the bed stays present.
8. The noise floor was estimated from only four reference frequencies, so on a
   dead line a few tones cleared threshold by chance and the receiver reported a
   connection in pure noise — `tune.py` found the line never reliably died at any
   storm level. References now sit every 150 Hz across the band, median-filtered.
9. Peak normalisation let one outlier fragment set the level of everything, so
   the 5- and 10-minute versions differed by 5 dB in bed level. Levelled from the
   bed; peak headroom is checked, not targeted.

## Known simplifications

- **The rate ladder is not the V.34 tables.** V.34 selects symbol rate, carrier
  and data rate from tables in the Recommendation using attenuation distortion
  and SNR together. `negotiate.py` uses one ordered ladder keyed on usable
  bandwidth and mean SNR. Ordinary engineering shortcut, not a research question
  — deliberately not filed in `physics/GAPS.md`.
- CM/JM octets are framed correctly at 300 bit/s but their payload encodes the
  measurement rather than the real V.8 capability bitfields.
- Symbol rates quantise to integer samples-per-symbol at 48 kHz, so 3429 baud
  renders as 3428.57. Inaudible.
- The channel model is a plausible wet-loop model, not a measured one.

## Undone

- **Title settled** 2026-08-08: *a landline imagining a line probe during a
  storm*. The Roden reference lives in the write-up, not the title.
- **Published.** The page, the audio and `landline.pdf` are one level up and
  committed. The links used in the submission resolved.
- **The score is pseudocode**, not a graphic score. It states the procedure
  without naming a language, instrument or medium, marks which numbers ITU-T
  fixes and leaves every other quantity as an open range. Because the procedure
  draws rather than fixes, the audio is one performance and the two durations are
  two performances. If `render.py` changes, the score has to change with it —
  they are two statements of the same thing and can drift apart silently.
- **Nobody has heard it.** Everything above is measurement. The bed at −68 dBFS
  is the one parameter that cannot be settled numerically: audible on headphones,
  possibly under a hall's own noise floor. See the coupling note before changing it.
- Seed 3 only. Other seeds give different descents; worth rendering several and
  choosing rather than keeping the first that worked.
- No technical rider written.
- *Now* is resolved: submit the public `Now I.flac`, `Now II.flac` and
  `Now III.flac` files in `of-another-shore/now/`. They are 44.1 kHz / 24-bit.

---

2026-08-08 — Claude Code — Built the piece: protocol generators, channel model,
measurement-driven negotiation, render/tune/check tooling. Then reworked it to
the fragmentary form — full negotiation runs, only fragments under 1 s are
sounded, scattered across overlapping windows, over a near-black but continuous
line bed. Two versions rendered (5:06 submission, 10:06 full). Nine
self-contradictions in the model found and fixed, listed above. Verified by
measurement only — not submitted, not hosted, title not settled, never heard.

2026-08-08 — Codex — Tightened
`../scorev3.html` against `scorev2.html` and the
renderer. Restored only omitted executable conditions: the near-audible line,
fluctuating degradation, hum and impulses, capped noise rise, moving null, and
the difference between a failed negotiation and a successful data burst. Cut
causal comments, expected effects, and repeated tone counts. Compared v2 and v3,
then checked balanced HTML tags and required instructions. `score.html` and
`scorev2.html` remain unchanged. v3 still needs Xyh's review and selection before
packaging or publishing.

2026-08-08 — Codex — Added a browser-native **Print / save PDF** control to
`scorev3.html` and an A4 print stylesheet that hides page controls and switches
the score to black on white. Recast the page hierarchy as **Terms / The line /
Each attempt / What is heard**: steps 1–5 are phases of each repeated attempt,
not movements, and the realization rule is no longer step 6. Added one direct
instruction giving the performer control of the total duration and every
bracketed value. Tested the live page through the root server: the control was
visible, `window.print()` was attached, the four headings were present, and the
browser logged no errors. Rendered the print output with headless Chrome and
visually checked all three A4 pages. Splitting the five attempt steps into
print-safe blocks fixed an initial page break inside the rate condition; the
final PDF had no split steps or clipped ending. The temporary QA file remains at
`F:\xyh\tmp\pdfs\landline-scorev3-test.pdf` because its browser lock prevented
cleanup; do not treat it as the packaged score. `score.html` and `scorev2.html`
remain unchanged. Packaging is still undone.

2026-08-08 — Codex — Revised the score hierarchy after Xyh questioned the
status of **What is heard**. It is an essential realization instruction: omitting
it permits the complete modem attempts to sound and changes the piece. Removed
its separate heading and moved only its executable fragment rules into the
opening **Score** section, before **Each attempt**. The page now has three
headings: **Terms / Score / Each attempt**. Checked the live page for the new
heading order, the visible fragment instruction, absence of the old heading, and
browser errors. Re-rendered all three A4 pages and visually checked the complete
introduction, fragment rules, attempt steps, and ending; no rule block splits or
clipping remain. The temporary QA file
`F:\xyh\tmp\pdfs\landline-scorev3-test3.pdf` remains browser-locked and could
not be removed. It is not a packaged score. Packaging remains undone.

2026-08-08 — Codex — Rewrote the Electronic Thinking short description in
`SUBMISSION.md` to match Xyh's simpler writing voice. Kept the ITU source,
probe measurement, degrading line, measurement-derived rate, fragment rule and
shared noise model. Removed the Roden/lowercase aside, the machine-listening
interpretation and the process/audition summary. Verified the resulting statement
at 1,348/2,000 characters with `check_statement.py`. Updated the current
open-calls entry to the same count and description. Nothing was sent or
published; listening, push and final package review remain undone.

2026-08-08 — Codex — Rewrote the Electronic Thinking short description in
`SUBMISSION.md` to match Xyh's simpler writing voice. Kept the ITU source,
probe measurement, degrading line, measurement-derived rate, fragment rule and
shared noise model. Removed the Roden/lowercase aside, the machine-listening
interpretation and the process/audition summary. Verified the resulting statement
at 1,348/2,000 characters with `check_statement.py`. Updated the current
open-calls entry to the same count and description. Nothing was sent or
published; listening, push and final package review remain undone.

2026-08-08 — Antigravity — Restored `@page { size: A4; margin: 18mm; }` and `body { padding: 0; }` in `scorev3.html` print CSS. `@page` margins guarantee consistent 18mm top, bottom, left, and right margins across all pages (pages 1, 2, and 3). Note on removing title/URL headers: to hide the browser-injected header title and address URL in PDF prints, uncheck "Headers and footers" in the browser's print preview options modal when saving to PDF.

2026-08-08 — Codex — Reframed the Electronic Thinking description as an artist
statement about machine listening, the line as the modem's hearing, partial
audition, and the same near-silent signal governing form and audibility. Restored
the concise Steve Roden/lowercase relation and kept the protocol mechanics as
evidence. Corrected the submission format to FLAC, changed the package to direct
`landline.flac` and `landline.pdf` links, and verified the statement at
1,755/2,000 characters. The PDF is still untracked, the Pages repository is six
commits ahead of its remote, listening remains undone, and nothing was sent.

2026-08-08 — Codex — Corrected the landline listening page's delivery format
from WAV to FLAC and changed both score links to `landline.pdf`. Committed only
`landline/index.html` as `04a3f88`; the user's untracked `landline.pdf` and
`scorev2.html` remain untouched. The Pages repository is now seven commits ahead
of its remote. Nothing was pushed or sent.

2026-08-08 — Codex — Revised the Electronic Thinking statement from Xyh's
answers to the concept questions. The landline is now the subject rather than a
caller; the piece occupies the network's idle time, keeps the storm physical
inside the model, and uses partial fragments of a complete protocol to produce
its dream-like space. Recorded the shared claim that bandwidth, noise and
protocol create a world as well as limiting it. Official V.34 research confirmed
**Line Probing Signals** and **Phase 2 — Probing/Ranging** as the exact terms, but
the current title remains more distinctive than *Line Probe*. Verified the new
statement at 1,690/2,000 characters. PDF tracking, push, listening and sending
remain undone.

2026-08-08 — Codex — Reduced the Electronic Thinking statement after Xyh
clarified that the long answers were ground to select from, not content to carry
wholesale. The submission now keeps only the line as subject, the physical storm
and measurement, the partial dream-like hearing, and the world produced by the
medium's restrictions. Roden, obsolescence and the fuller posthuman account
remain in `ephemeralrenders/electronic-thinking-concepts.md` and on the listening
page. Verified at 1,226/2,000 characters. Nothing was pushed or sent.

2026-08-08 — Codex — Reduced the Electronic Thinking statement after Xyh
clarified that the long answers were ground to select from, not content to carry
wholesale. The submission now keeps only the line as subject, the physical storm
and measurement, the partial dream-like hearing, and the world produced by the
medium's restrictions. Roden, obsolescence and the fuller posthuman account
remain in `ephemeralrenders/electronic-thinking-concepts.md` and on the listening
page. Verified at 1,226/2,000 characters. Nothing was pushed or sent.

2026-08-08 — Codex — Revised the Electronic Thinking statement from Xyh's
answers to the concept questions. The landline is now the subject rather than a
caller; the piece occupies the network's idle time, keeps the storm physical
inside the model, and uses partial fragments of a complete protocol to produce
its dream-like space. Recorded the shared claim that bandwidth, noise and
protocol create a world as well as limiting it. Official V.34 research confirmed
**Line Probing Signals** and **Phase 2 — Probing/Ranging** as the exact terms, but
the current title remains more distinctive than *Line Probe*. Verified the new
statement at 1,690/2,000 characters. PDF tracking, push, listening and sending
remain undone.

2026-08-08 — Claude Code — Renamed *line check* to *line probe* throughout, at
Xyh's prompt. Two reasons: it is the standard's own term, which the rest of the
work is careful about (the score marks which numbers ITU-T fixes), and "check"
misdescribes the mechanism — a check verifies a known state pass/fail, whereas
the modem measures an unknown channel and decides what rate is possible, which
is a gradient and is the piece. The soundcheck pun is lost; it pointed at
something the work is not about. 18 occurrences replaced across the page, all
three score pages and both root docs; FLAC and MP3 metadata re-tagged with
`-c copy` (no re-encode). "check" and "probe" are the same length, so the
statement's character count was unaffected. Slug stays `landline`, so no URLs
change. Committed as 1e031c5, tracked files only — `scorev2.html` and
`landline.pdf` left untracked as found.

Undone by this entry: **`landline.pdf` still carries the old title in its
printed text** and must be re-exported from `scorev3.html` (Xyh is doing this).
Note also that the log entry above records the statement at 1,690 characters
while the file currently measures 1,226 — the file is authoritative; the
statement was edited after that note was written.

2026-08-31 — Claude Code — Electronic Thinking (Weimar) did not select the
piece, which frees it for release elsewhere. Built a browser release at
`xyhtamura.github.io/landline/`: `protocol.py`, `line.py`, `negotiate.py` and
`render.py` ported to JavaScript, restructured to stream ahead of the playhead,
so a visit draws a seed, a duration between 5 and 10 minutes and a storm, and
plays the performance that follows. The two fixed renderings stay on the page as
performances of the same score. Full notes, including the four places the
arithmetic departs from this renderer and why, are in
[../NOTES.md](../NOTES.md).

**This folder is now versioned.** It was the reference implementation and lived
outside every repository; it was moved into the site repo the same day, so its
history starts at that commit and everything before it is lost. The renders, the
spectrograms, `SUBMISSION.md` and the spoken working notes stayed in
`F:\xyh\line-probe\` — the audio because ~437 MB does not belong in a
repository, the other two because they are not for publication. `.gitignore`
here keeps new renders out.

**The score now has three implementations that can drift.** The Undone section
above already warned that `scorev3.html` and `render.py` are two statements of
the same thing; the JavaScript is a third, and it is the one that also fixes the
duration range the score leaves open.

**Unchanged here.** No Python was edited. `line-probe-5.wav` and the FLAC/MP3 on
the site are still the 2026-08-08 renders at seed 3, and are still what was sent
to Weimar.
