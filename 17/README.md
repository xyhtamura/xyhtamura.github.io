# 17 — Taper #17 submissions ("Prime")

Up to 5 pieces per author. Deadline **2026-08-17 23:59 AoE**, no extensions.
Submit: zip of HTML files → submit@taperzine.org. Issue launches Fall 2026 at taperzine.org.

Constraint: everything between `</header>` and `</body>` ≤ **2048 bytes**, valid HTML5,
ES6, no external resources, no exec/regex-eval, works offline + mobile.
`<style>` tags inside poem code OK; do not modify template stylesheet.
Official template: `prime-song/template.html` (reference copy) — piece 1 already built on it.
Template body has `overflow:hidden` → pieces must scroll inside their own container.

## Slots

| # | piece | status | source DNA |
|---|---|---|---|
| 1 | `prime-song/` — glossolalic song in a 17-pitch random scale | building | antemelos (phrase/arc/glide/breath) + glossolalia (formant voice, IPA) + aliquoto (prime-partial timbre) |
| 2 | prime meridian / colonialism — critical horology | concept only | Greenwich as imposed zero; longitude as empire's coordinate system; clock discipline |
| 3 | `abakada/` — "aBaKada": Filipino alphabet, primes lit | built (1492 B) | 28 letters, prime positions → B C E G K M O Q U lit in strip; NG at 16=2⁴ dark. Tagalog lexicon (oo mo ko buo buko kubo kuko ube ubo gugo bukbok bugbog kubkob ugok bugok) + English arrivals (be me um emu oboe moo book become queue cue come cube ego q go) — C,Q flash only for English; one unified italic voice (code-switch typography nixed — cohesive language); -um- infix (all prime letters) conjugates both: buko→bumubuko, queue→qumuqueue, emu→umemu. Unpicked English inventory: bee gee ebb egg eke gem keg beg bog cog cob mob mug bug cub gum geek meek boom cook comb combo gumbo gecko cuckoo kook muck mock buck emcee cuke. Unused strata idea: baybayin (17 chars — prime) / abakada 20 → B K E H N O T W |
| 4 | — | open | |
| 5 | — | open | |

## Piece 1 notes — prime song

- Voice source: additive partials at prime harmonics 1·2·3·5·7·11 of f0 (aliquoto move).
- Formants: two bandpass filters; F1 = 55·{5,7,11,13}, F2 = 55·{13,17,19,23,29,37,43} Hz.
  Vowel glyph derived from the prime pair via articulatory grid (F1→height, F2→backness).
- Consonants: filtered noise bursts at 470·{2,3,5,7,11,13} Hz, glyphs `hkpʃts`.
- Scale: 17 random pitches, 98–450 Hz (2^2.2 span), sorted; melodic walk over indices
  with per-line arch/trough bias (antemelos contour), phrase-final lengthening,
  breath rests between lines.
- Verse structure: 3|5|7 lines × 3|5|7 syllables.
- One persistent WebAudio graph; song schedules automation, never rebuilds nodes.
- Byte check: `powershell -File check-bytes.ps1 prime-song/index.html`
