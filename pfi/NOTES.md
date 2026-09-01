# PFI portfolio notes

## Current state

`pfi/` is a static 20-slide web edition of the INHABIT #16 / #17 portfolio. It preserves the source document's page order, text, palette, and picture-heavy layouts. Its continuous vertical slide system, previous and next controls, keyboard navigation, counter, direct work links, and image viewer derive from the existing `/portfolio/` interaction pattern without its category structure.

## Work log

2026-09-01 — Codex — Created the 20-slide web portfolio from `profiles/open-calls/inhabit/portfolio/portfolio.build.html`, copied 114 web-sized source images, restored direct work links available in `/portfolio/data.js`, and added responsive mosaic, panel, grid, and image-viewer layouts. Browser checks at 1440 × 900 and 390 × 844 confirmed all 20 slides, correct counters and hashes, working previous and next controls, working direct links and image viewer, and no page, main-area, slide, or footer horizontal overflow. `node --check pfi/app.js` passed, and an audit of all 114 referenced media paths found no missing files. Undone: works without a direct link in the existing live portfolio remain unlinked rather than receiving inferred URLs.

2026-09-01 — Codex — Rounded the cover practice plate and added media-count and copy-density classes that drive separate landscape and portrait slide layouts. Landscape slides use viewport-capped image rows, compact type, and page-specific grids for Desiderata, Tabota/Cycla/Stanzuary, and Tanim-Kalye; portrait retains larger images and compresses only the seven-image music-practice mosaic. Browser measurements confirmed all 20 slides fit exactly at 1440 × 900. At 900 × 1440, 17 fit exactly and the three remaining documentation slides use no more than 4% extra height. At 390 × 844, dense slides scroll vertically at readable type size; checks found no document, slide-area, or footer horizontal overflow, no broken loaded images, and no console errors. Undone: phone slides are not forced into one viewport because doing so would make multi-work text and controls unreadable.
