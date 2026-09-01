# PFI portfolio notes

## Current state

`pfi/` is a static 20-slide web edition of the INHABIT #16 / #17 portfolio. It preserves the source document's page order, text, palette, and picture-heavy layouts. Its continuous vertical slide system, previous and next controls, keyboard navigation, counter, direct work links, and image viewer derive from the existing `/portfolio/` interaction pattern without its category structure.

## Work log

2026-09-01 — Codex — Created the 20-slide web portfolio from `profiles/open-calls/inhabit/portfolio/portfolio.build.html`, copied 114 web-sized source images, restored direct work links available in `/portfolio/data.js`, and added responsive mosaic, panel, grid, and image-viewer layouts. Browser checks at 1440 × 900 and 390 × 844 confirmed all 20 slides, correct counters and hashes, working previous and next controls, working direct links and image viewer, and no page, main-area, slide, or footer horizontal overflow. `node --check pfi/app.js` passed, and an audit of all 114 referenced media paths found no missing files. Undone: works without a direct link in the existing live portfolio remain unlinked rather than receiving inferred URLs.
