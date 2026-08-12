# AGENTS.md — Taper #17 submission project (`xyhtamura.github.io/17/`)

Spec for any agent (or human) building or editing a piece in this folder. Read this
before touching a poem file. `17.md` is the slot tracker / creative log; **this
file is the contract**. If a rule here conflicts with an instinct to "improve" a piece,
the rule wins — Taper will reject work that breaks them.

---

## 0. What this is

Submissions to **Taper #17**, an online journal of computational poetry (publisher: Bad
Quarto / Nick Montfort). Theme: **"Prime."** Each piece is one self-contained HTML file
that *is* the poem. Up to **5 pieces** per author.

- **Deadline:** 2026-08-17 23:59 AoE. No extensions.
- **Submit:** one zip of the HTML file(s) → `submit@taperzine.org`.
- **Publishes:** Fall 2026 at taperzine.org.
- License on acceptance: short all-permissive (already in each file's header comment).

---

## 1. The hard constraints (non-negotiable — Taper enforces these)

1. **2 KB poem region.** Everything **between `</header>` and `</body>`** must be
   **≤ 2048 bytes**, measured as UTF-8. The header, the `<head>`, the license comment,
   the closing tags — none of that counts. Only the poem code counts.
   - Measure with `check-bytes.ps1` (see §4). Do not eyeball it; multibyte glyphs
     (IPA, ñ, ·, curly quotes) cost 2–3 bytes each and blow the budget silently.
2. **Valid HTML5.** Must pass the W3C validator (validator.w3.org) with no errors.
   Warnings are tolerable if the feature is cross-browser; prefer zero.
   - **One exemption, granted by the call itself:** a `<style>` element in the poem
     region makes Nu report `Element “style” not allowed as child of element
     “body”`. The call reads: *"(An exception is made for using &lt;style&gt; tags
     within your poem code; please do not modify the template's stylesheet.)"*
     Every piece here trips it and every piece is fine. Ignore that one error;
     any *other* error is real. Settled 2026-08-12 — see 17.md, and do not
     restructure the style tags to chase a clean report.
3. **ES6, no more.** Modern JS is fine. No transpilers assumed.
4. **No external resources, period.** No CDN, no `<link>` fonts, no fetch, no APIs, no
   remote images. The file must work fully **offline** (gallery / air-gapped setting).
   Everything is inline or synthesized in-code.
5. **No `exec` or regex `eval`.** Taper bans these outright (legibility policy). Don't
   obfuscate to the point of illegibility either — minification is fine, `eval`-parsing
   the license comment to smuggle assets is not.
6. **Mobile-viewable.** Desktop is prioritized, but the piece must be reasonable on a
   narrow screen. Test at ~375px.
7. **Don't fight the template.** Edit only two regions of the official template: the
   **license/statement comment** in the head, and the **poem region** after `</header>`.
   Do **not** modify the template's own `<style>` block. You *may* add your own
   `<style>` inside the poem region (Taper explicitly allows this).

---

## 2. The template

`17/template.html` is the official Taper #17 template, placed at the folder root by
Xyh on 2026-08-12. `primer-for-a-song/template.html` is a copy of it and was verified
byte-identical (SHA-256 `16cc6409…`, 1879 B, LF endings, no BOM) on the same day. Every
piece is built on it. Structure:

```
<head> … official <style> (DO NOT EDIT) … </head>
<body>
<header id="nav"> … nav + title + byline … </header>
<!-- POEM REGION STARTS HERE — this is the 2KB budget -->
   … your <style>, HTML, <script> …
<!-- POEM REGION ENDS at </body> -->
</body>
```

**The template's whitespace is part of the template.** It carries three trailing
spaces — one in the license line after `the copyright`, two in the nav after
`&nbsp;` — that a save-on-format editor will silently strip. All four pieces had
lost them and they were restored on 2026-08-12. The call says to edit only the
comment and the poem region, so treat the header bytes as fixed. Verify with the
skeleton diff in the pre-submission pass (17.md), not by eye. `git diff --check`
will report these as trailing-whitespace warnings; that is expected, leave them.

Per-piece template chores (do all of them, consistently):
- License comment: fill title, `© 2026 Xyh Tamura`, the `taperzine.org/17/<file>.html`
  URL, and the **creative statement** (wrap to 72 cols; use curly quotes `“” ‘’`).
- Nav byline: set the title in `“…”`, the filename in the `<a href>`, and the
  `about.html#tamura` anchor. Keep the `<<`/`>>`/index links as-is.
- **Template `<body>` is `overflow:hidden`.** A piece that accumulates content must
  scroll **inside its own container** (`#Q{height:…;overflow:hidden}` + pin
  `scrollTop=1e9`), not rely on page scroll. Primer for a Song and abakada both do this.

> A copy of the published Taper #16 piece `16 anna` was once kept in
> `primer-for-a-song/` as a reference artifact. It is no longer in the folder.

---

## 3. Project conventions

- **One folder per piece**, file named `index.html` (`primer-for-a-song/index.html`,
  `bumebecome/index.html`). The folder name is the working slug.
- The **final submission filename** is a flat name like `primer_for_a_song.html` /
  `bumebecome.html` (underscores), referenced in the license URL + byline. Rename on the
  way into the zip; keep `index.html` locally so the dev server serves it directly.
- `17.md` = slot table (5 slots) + per-piece creative notes + parked ideas.
  Update the slot's status + byte count whenever a piece changes.
- Theme discipline: every piece must earn "Prime." Primeness should be **structural**
  (drives the mechanism), not decorative. 17 is the issue number and is itself prime —
  bonus if a piece lands on 17 (Primer for a Song's 17-pitch scale; abakada's baybayin-17
  parallel).

---

## 4. Byte-checking workflow

```
powershell -ExecutionPolicy Bypass -File check-bytes.ps1 <path-to-index.html>
```

Reads the file, slices `</header>`…`</body>`, prints `N / 2048 bytes (M left)`. Negative
`M` = over budget, must trim. The script is the single source of truth for the limit —
run it after **every** edit that touches the poem region.

**Golfing techniques already used here** (reach for these when over budget):
- Alias hot APIs once: `C=t=>X['create'+t]()`, `D=_=>document.createElement('div')`,
  `Z=(p,v,t)=>p.exponentialRampToValueAtTime(v,t)`.
- Destructure-build repeated nodes: `[fa,fb,nf]=[0,0,0].map(_=>{…})`.
- Drop `let`/`const` on loop counters that can ride an implicit global (`for(l=0;…)`) —
  ugly but legal and cheap. (Watch for collisions.)
- Short color hex (`#eed` not `#e9ecd8`), drop trailing `;`/`}` where the parser allows.
- Prefer arithmetic/boolean glyph selection over lookup tables when it's shorter.
- Every multibyte character is 2–3 bytes — budget IPA/special glyphs deliberately.

---

## 5. Autoplay / AudioContext — a settled lesson (don't relitigate)

Browsers gate `AudioContext` behind a real **user gesture**. In stock Chrome/Safari the
context stays `suspended` until an actual click/tap/keydown; **no top-level code can
resume it**, and `autoplay` policy cannot be bypassed. A silent no-prompt audio page
just sits there looking dead.

**Settled decision:** audio pieces show a minimal prompt (`"tap to sing"`) and start on
first click:
```js
onclick=_=>X.resume().then(_=>U||(U=1,Q.textContent='',verse()));
```
Build the whole audio graph at load so the first sound is immediate on tap. Text-only
pieces (abakada) have no gesture requirement and **do** start on their own — autostart is
only forbidden for *audio*, and only because the platform forbids it.

(The in-app Browser pane's synthetic clicks and screenshots are currently broken; verify
click-to-start by dispatching a real DOM event — `document.body.click()` — via the
javascript tool, not the `computer` click tool.)

---

## 6. Verification (before calling a piece done)

1. `check-bytes.ps1` → ≤ 2048.
2. Serve locally and open in the Browser pane:
   `.claude/launch.json` has a `static` server (http-server on :8796, cwd = repo root).
   URL: `http://localhost:8796/17/<piece>/index.html`.
3. Probe with the javascript tool (screenshots are unreliable right now): check
   `X.state`, line/word accumulation, and — for audio — tap an `AnalyserNode` on the
   output gain and confirm a nonzero peak over a few seconds.
4. `read_console_messages` with `onlyErrors:true` → must be clean.
5. Resize to mobile (375px) and confirm it's still readable.
6. **Before zipping:** run the file through the W3C validator. Rename `index.html` →
   `<slug>.html`, confirm the byline/URL/filename all agree.

---

## 7. Current slots (see 17.md for full DNA)

| # | slug | status | one-line |
|---|---|---|---|
| 1 | `primer-for-a-song` | submitted (2014 B) | glossolalic song, 17-pitch random scale, prime-partial voice, prime-Hz formants, 3\|5\|7 verses; tap-to-start |
| 2 | — | open | *Stealing Prime* was archived on 2026-08-11 |
| 3 | `bumebecome` | submitted (1462 B) | Filipino 28-letter alphabet, prime positions lit; Tagalog + absorbed English via all-prime `-um-` infix; C/Q flash only for loanwords |
| 4 | `same-time-tomorrow` | submitted (1841 B) | 47-kana iroha clock; prime-addressed persistent grafts; computational senescence |
| 5 | `drawing-the-day` | submitted (1550 B) | 17-decision date lines try to pass through four schematic island fields without touching a point |

All four active pieces are byte-legal, validated, browser-verified, and packaged
into `taper17_xyh_tamura.zip`. The zip has not been emailed yet. Slot 2 is open;
a fifth piece before the 2026-08-17 deadline means rebuilding the zip. See the
pre-submission pass in 17.md for what was checked and what is still undone.
