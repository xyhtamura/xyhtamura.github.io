# SOMEWAREZ multicart

A five-work browser menu for TOUCH-SCREEN: Cornice, Ombak Lock, Foam Green City, Drawing the Hours, and Sulat. Open `index.html` to select a game from its live GitHub Pages URL. This folder also holds the architecture and game registry; consolidated game builds are deferred until nearer delivery.

The working folder name is `somewarez-multicart`; the public title remains Xyh's choice. The collection is intended to move as one folder into the GitHub site, with an offline exhibition copy served over local HTTP.

- [Architecture](ARCHITECTURE.md): visitor flow, runtime boundaries, packaging, and implementation stages.
- [Game registry](games.json): the five selected works and their live URLs, plus an `extras` array for the three hacks, each with its `kind` and `parents`.
- [Offline game summaries](GAME-SUMMARIES.md): descriptions from local source folders and a review of their documentation.
- [Shareable descriptions](DESCRIPTIONS.md): self-contained descriptions of the multicart and its five works.
- Design studies: [cartridge label](prototypes/cartridge-label.html), [bootleg catalogue](prototypes/bootleg-catalogue.html), and [strange room](prototypes/strange-room.html). Each sample links to the five live games and includes navigation between designs.
- [Development notes](NOTES.md): decisions, checks, and unfinished work.
- [TOUCH-SCREEN record](../profiles/open-calls/OPEN-CALLS.md): exhibition context and delivery dates.

Review the live-link menu first. The source games remain authoritative; export snapshots into the eventual bundle rather than moving or editing their repositories here.


The menu uses the bootleg catalogue design: a large 5 IN 1 heading, three illustrated panels followed by two wider panels, and a cream, coral, amber, and foam-green palette. Below the five, a +3 HAX panel lists Between Banks, Foam Green Crawl, and Bahura on dark cards, each labelled with the works it was made from. `hax.js` renders it from the `extras` array with original SVG illustrations in `assets/hax/`: fish inside a cord loop, a glyph corridor, and gongs over terrain. [The preceding menu](archive/menu-2026-10-06/index.html) is preserved with its scripts, statement data, styles, and fonts. [Asset credits](ASSETS.md) record the illustrations and bundled fonts.


## Artist and work text

Edit `content.json` to supply the artist bio and each work's statement. Each entry has a `title` and a `paragraphs` array; put one plain-text paragraph in each array item. Empty arrays show “Text to come.” The artist button and each **About this work** button open the matching panel. The renderer treats text as text, without HTML markup.

After six seconds without input, the illustrations animate and occasional fragments leave Cornice, Drawing the Hours, or Sulat to travel along the outside margin. One fragment appears at a time, fades away, and is followed after a variable interval. Mobile fragments shrink to fit the narrower margin. Input, scrolling, resizing, an open panel, and a hidden tab clear the fragments and pause the illustrations. **Pause motion** disables movement for the visit. Reduced-motion preferences disable animation and hide the redundant pause control. The decorative layer ignores pointer input and is hidden from assistive technology. Game links work independently of the panel script.
Collection title: XYH 5 IN 1 MULTICART 2026-11. The edition code identifies the November 2026 exhibition.


## Idle motion check

`scripts/check-idle-motion.cjs` runs the menu in headless Microsoft Edge through Playwright. The shared root server must be running on port 8000. The script accepts `--modules` for a `node_modules` directory containing Playwright and `--screenshots` for an optional output folder. It checks margin paths, pointer transparency, activity resets, pause and resume, artist-panel suppression, reduced motion, and narrow-screen layout.

`scripts/check-hax.cjs` uses the same server and arguments to check the three card images, dark backgrounds, registry destinations, five main game links, and layout overflow at 1280, 900, 768, and 375 pixels wide.
