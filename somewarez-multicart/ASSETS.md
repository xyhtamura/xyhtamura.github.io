# Assets

The menu uses CSS drawings, text glyphs, and three locally bundled fonts. Its layout adapts [the 2026-08-06 menu mock](../multicart-menu-mock.html). No Nintendo artwork or logos are included.

Fonts downloaded unmodified from the Google Fonts repository on 2026-10-04. Each uses the SIL Open Font License 1.1; licences remain beside the fonts in `assets/fonts/`.

| Font | Use | Source | Licence |
| --- | --- | --- | --- |
| Bungee Shade | `4 IN 1` masthead | [Source](https://github.com/google/fonts/tree/main/ofl/bungeeshade) | [OFL](assets/fonts/bungeeshade-OFL.txt) |
| Rubik Puddles | Multicart wordmark | [Source](https://github.com/google/fonts/tree/main/ofl/rubikpuddles) | [OFL](assets/fonts/rubikpuddles-OFL.txt) |
| Pixelify Sans | Headings, folios, and labels | [Source](https://github.com/google/fonts/tree/main/ofl/pixelifysans) | [OFL](assets/fonts/pixelifysans-OFL.txt) |

The games remain at their live URLs. Their assets are not copied into this package.

The 2026-10-06 samples in `prototypes/` reuse Bungee Shade and Pixelify Sans. Their game motifs are original inline SVG drawings in `prototypes/designs.js`: a balcony and glyph plants, tuning rings, a domestic doorway, cord loops and insects, and a glyph landscape. They contain no copied game artwork or third-party illustrations. The drawings are design-study representations, not screenshots of gameplay.

The main menu adopts the bootleg catalogue study on 2026-10-06 and uses those same SVG drawings and fonts. `catalogue.css` animates illustration shapes during idle periods. The preceding menu is preserved in `archive/menu-2026-10-06/` with its original fonts and licence files.
Portrait: portrait.png supplied by Xyh for the artist panel on 2026-10-07, displayed unmodified and uncropped. Photographer credit was not supplied.

Space Grotesk: body paragraphs and game descriptions in the current menu. Downloaded unmodified on 2026-10-07 from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/spacegrotesk); bundled as assets/fonts/SpaceGrotesk[wght].ttf with [SIL OFL 1.1](assets/fonts/spacegrotesk-OFL.txt). Loaded locally from catalogue.css. Pixelify Sans headings and labels are retained.

Favicon: favicon.svg is an original cartridge drawing with a path-drawn numeral 5 in the menu palette. Drawn by Codex on 2026-10-07. No third-party artwork or fonts are embedded.

Margin escapes: margin-escapes.js contains original SVG drawings of a moth, mountain/water marks, and a radial mote, drawn by Codex on 2026-10-07 from the existing menu motifs and palette. No third-party assets or fonts are embedded.

Hax illustrations: three original SVG files drawn by Codex on 2026-10-10 in `assets/hax/`. `between-banks.svg` retains the cord, vegetation, dots, and palette of the original Drawing the Hours menu drawing, replacing its insects with fish; the existing hue rotation remains in CSS. `foam-green-crawl.svg` depicts a square terminal room with furniture glyphs. `bahura.svg` depicts five glyph-bearing shoals and two water strokes. These two drawings were simplified on 2026-10-10 using screenshots supplied by Xyh as visual references; no screenshot pixels are embedded. These are menu illustrations, not gameplay captures. No third-party artwork or embedded fonts are included; glyphs use the viewer's monospace font.
