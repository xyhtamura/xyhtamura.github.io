# Whisper house notes

`index.html` presents the score, performance requirements, and program notes.
`pn.html` carries the same prose with print styles. `whisperhouse.pdf` is the
original ten-page score.

## PDF generation

With the shared workspace server running on port 8000, run:

```powershell
python whisperhouse/pdf.py --modules PATH_TO_NODE_MODULES --browser PATH_TO_BROWSER
```

Run from the website repository. The renderer requires Python with PyMuPDF,
Node.js, Playwright, and a Chromium browser. `--node` selects a Node.js
executable; `--url` selects the served print page. Omit `--modules` when
Playwright is available through Node's normal module resolution, and omit
`--browser` when Playwright's Chromium is installed.

The script prints `pn.html` to `programnotes.pdf` and prepends those notes to
the original score in `whisperhousefull.pdf`. It stages both PDFs before
replacing them. Update the prose in both HTML pages before regenerating.
Extracted Markdown files are local caches excluded by `.gitignore`.

## Log

2026-10-26 — Codex — Applied the writing voice to the web and print pages,
using the original program notes in `../../Night Bus Whisper House Now/` and
the surrounding *Of Another Shore* descriptions as context. Established the
score and its available forms before the genre readings; retained all seven
readings, the four family experiences, and the questions left open by the work.
Replaced repeated framing, dramatic fragments, and unexplained comparisons to
other works or traditions with descriptions of the actions and listening
positions. Kept the first-person reflection and qualified the cats' possible
experience as a question. Added the phone or laptop to the materials list,
consistent with Guest 1's starting instructions. Replaced the PDF script's
separate, abbreviated prose with a renderer of the print page. Regenerated the
five-page notes and fifteen-page combined PDF. The original score and curated
portfolio image remain unchanged.

Read the revised browser DOM and inspected the page at a 492 px viewport:
no horizontal overflow or console errors. Inspected all five rendered PDF pages,
checked that every print-page text segment occurs in the PDF, and compared the
web and print prose. The standalone score matches the original bytes; all ten
score pages in the combined PDF match its text and rendered pixels. Kept PDF
text extractions locally and removed them from tracking after the interim
`2a42620` commit captured them. No development plan changed. Undone: remote
publication and a desktop browser layout check. The web pages still load
Tailwind and fonts from their existing external services.
