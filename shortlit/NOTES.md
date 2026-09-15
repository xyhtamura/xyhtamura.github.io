# shortlit notes

## 2026-09-11 — Codex — Cutaway Sims text box

- Changed `cutaway.html` to import `cutaway.css` after the shared collection stylesheet.
- Added a scoped Sims-like presentation for `Cutaway`: the poem reads as a bevelled game dialog/text box, with a grid-ground background, plumbob-like ambient marks, cutaway wall/floor color fields, and exposed joist graphics.
- Verified in the in-app browser at `http://localhost:8000/xyhtamura.github.io/shortlit/cutaway.html`: `cutaway.css` loaded, the page had no console errors, and the 390 px viewport had no horizontal overflow.
- Left the wider collection styling in `poetry.css` unchanged.

## 2026-09-11 — Codex — Sims 1 dialog color pass

- Retuned `cutaway.css` toward the Sims 1 white-text-on-blue dialog box: the title and poem panels now share a dark blue bevelled surface, with white text and cyan highlights.
- Kept the background graphics from the first pass, but reduced the poem body’s paper-grid feel so the reading surface reads as a game message box.
- Verified in the in-app browser at 390 px: the blue dialog loaded, the text stayed white, and the page had no horizontal overflow.

## 2026-09-16 — Claude Code — Line breaks hold at every width

- Lineated poems no longer wrap. `poetry.css` sets `pre.poem-text` to `white-space: pre` on every page without `body.prose-poem`, and sets the line blocks of `口` to `nowrap`.
- Added `shortlit-lines.js`. When the longest line is wider than the column, it scales the poem's font size down until the line fits, so the poem behaves like an image: pinch-zoom enlarges it without reflowing. It refits after web fonts load and whenever the column resizes. Without the script, a long line scrolls sideways inside the poem rather than breaking.
- The script is loaded by the 14 lineated `pre` pages and by `mouth.html`. Prose (`cell.html`, `pollen.html`) keeps wrapping and does not load it. A new lineated page needs the `<script src="shortlit-lines.js">` tag after `shortlit-state.js`.
- Verified in the in-app browser by loading each page in iframes at 320, 390, 768, and 1280 px and comparing rendered line count (`scrollHeight / line-height`) against source line count, plus `scrollWidth − clientWidth` on the poem: every page matched with zero overflow at every width. For `口` (checked at 320, 390, and 1280 px), each line block's height was checked against its `<br>` count; before the change, "sizzling through a nearby flood." broke onto two lines at 320 px.
- Known trade-off: poems with long lines get small on phones. At 320 px, `kill quota` renders at 5.5 px and `UHF Channel 43 in 198X` at 6.3 px; at 390 px, 7.4 px and 8.2 px. On desktop `UHF` and `kill quota` drop from 18.9 px to 16.9 px, because their longest lines are wider than the 620 px column. If phone size needs to be larger, the next option is to widen the column for lineated poems, not to allow wrapping.
- A browser's page zoom (Ctrl +) refits the poem to the column, so on desktop page zoom does not enlarge a poem that is already scaled — the same way an image with `max-width: 100%` behaves. Pinch-zoom is unaffected.
