# Website notes

2026-10-18 — Antigravity — Published `fonts/` as a dedicated web page for Xyh Fonts, making Bract Regular 1.000, Sump Regular 0.003, and Skirl Oblique 1.001 available with an interactive type tester, wardrobe comparison, 346-character glyph explorer, and downloadable TTF/WOFF/WOFF2 packages. Added *Xyh Fonts* as a design entry (`data-cats="design"`) on the landing page (`index.html`) with direct link `/fonts/`, specimen comparison still (`img/works/xyh-fonts.jpg`), interactive portfolio (`portfolio/data.js`), general CV (`profiles/cv/cv.md`), detailed portfolio summaries (`profiles/cv/portfolio.md`), and `sitemap.xml`. Rebuilt general CV HTML and PDF. Verified HTTP 200 responses on all font assets and specimen endpoints at localhost:8000.

2026-10-04 — Codex — Added a collapsed “Earlier work and names” note to the existing footer in `index.html`, identifying Xyh Tamura as also known as Cy Tamura and linking The Magic Staff and Promil gifted-child coverage. Added JSON-LD connecting Xyh, Cy, and Cye Tamura to one Person identifier and The Magic Staff to that person as author and creator. Kept the main biography and search description focused on current work. Opened the local page in the Codex browser, confirmed the note starts collapsed, expanded it and read the rendered footer, parsed the JSON-LD from the DOM, and checked the note has no horizontal overflow at the browser's default viewport. Mobile layout and search-engine interpretation remain unverified. No portfolio work entries or development plans changed; no remote push performed.

2026-10-05 — Codex — Updated Insulae Incognitae's title and canonical `/insulae-incognitae/` destination across the landing page, interactive portfolio data, active slide cuts, sitemap, and image capture manifest following Xyh's repository rename. Retained stable portfolio IDs, anchors, and asset filenames. Regenerated `work-images.js` with the existing SyncOnly command. Read the landing-page entry and destination from the local browser DOM; all six slide-cut audits passed, including heading-to-link-registry checks, and `portfolio/data.js` parses. The parent's notes record Sulat and generator checks at the renamed route. No portfolio plans changed, and no remote push was performed; the live site still needs these commits published.

2026-10-16 — Claude Code — Added `five-ways-through/`: a landing page with Xyh's five-sentence text as links over a live background, five interactive WebGL pieces (Running, Exchange, Hours, Toward, Forgetting), a generated credits page, and the data they load (about 24 MB). The folder's development log, asset provenance, and description are kept locally and gitignored (`five-ways-through/.gitignore`); `five-ways-through/README.md` says how it is built. No portfolio entry, sitemap, or `work-images.json` change was made.

2026-10-23 — Codex — Expanded Xyh Fonts to Bract Regular 1.100, Sump Regular
1.000, Skirl Oblique 1.100, and Lode Regular 1.000. The first three are complete
irregular Latin revisions, not seven-letter previews. Each maps 346 codepoints
with accents, mark stacking, fitted spacing, and four contextual states. Added
the catalog, exact export hashes, Lode downloads/proofs, alternate controls,
unsupported-character feedback, and mobile layout fixes. Updated both portfolio
entries and the private CV/portfolio Markdown. Captured and inspected the four-face
4:3 representative image; preserved the earlier image. The browser check in
`scripts/check-fonts.cjs` checks twelve downloaded file hashes, real contextual
pixel differences for all four fonts, controls, 344 glyph cells, and the 390 px
layout. Source geometry, shaping, accent, and repeat-export checks are recorded
in the local fontmaking workspace. Existing personal and creative use terms
remain; no reference-bank fonts or build libraries are published. The publication
branch excludes the two earlier unrelated unpublished site commits.

2026-10-23 — Codex — Published the font-only tree as
`916cf9ce13ada685579cee6e4d718aef975fe2e0` through the connected Xyh GitHub
account after the local HTTPS credential helper could not authenticate. Every
uploaded blob and the assembled Git tree matched the checked local commit.
GitHub Pages run `39839524244` completed successfully. Ran `check-fonts.cjs`
against `https://xyhtamura.github.io/fonts/`: all twelve live download hashes,
four contextual pixel comparisons, controls, 344 glyph cells, and the 390 px
layout pass, with no font-page errors. Landing and slide portfolio images and
Lode descriptions load at 1440 and 390 px. Returned to local main and merged
the remote font commit; both earlier draft commit IDs and contents remain
local. No requested Latin production or publication step remains pending.

2026-10-23 — Codex — Added `kikik/`, a static presentation of the electroacoustic and text poems with their existing artist statements. Audio reuses `../kikik.mp3`; the text image, PDF, and UTF-8 text are copies of the finished local `../kikik/text/out/` files. The audio statement comes from `F:/Eggs2/kikik/XYH_DESCRIPTION.pdf`; its source copy and extracted cache are retained in the local kikik project's `text/` folder. Preserved statement wording and restored the PDF's six translation rows in HTML. Updated the shared work-image record to the actual text poem and regenerated `work-images.js`. Edge loaded audio metadata (196.67 s), advanced playback beyond one second, loaded all three poem files with HTTP 200, and reported no horizontal overflow at 1440 and 390 px. Inspected the full mobile screenshot. No third-party assets added. Undone: publication; the portfolio's existing tool descriptions remain unchanged because this task adds the work page only.
