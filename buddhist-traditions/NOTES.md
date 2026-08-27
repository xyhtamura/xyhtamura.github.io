# Buddhist Traditions Atlas — Notes

## Mechanism

A static comparative atlas of 43 Buddhist traditions. Four views project the same dataset as a lineage map, taxonomy grid, practice matrix, and set of transmission routes. Family, region, practice, and text filters update every view; selecting a tradition opens its detailed record.

## Next in development

Add a poster export mode that fits the selected view to one landscape canvas and prints the active filters in its caption.

## Work log

### 2026-08-27 — Codex

- Moved the atlas into the \`xyhtamura.github.io\` source repository at \`/buddhist-traditions/\` for publication.
- Kept the public URL unlinked: it is absent from the landing page, interactive portfolio, shared work-image manifest, sitemap, and CV.
- Updated the internal root roadmap to the new source location.
- Verified `https://xyhtamura.github.io/buddhist-traditions/` returned HTTP 200 from GitHub Pages after the push.

### 2026-08-27 — Codex

- Replaced the rounded dashboard styling with a high-contrast print-atlas system: dark masthead, paper field, editorial hierarchy, indexed view tabs, compact family filters, and stable bordered cells across all four views.
- Fixed the lineage-node hover jump. The previous CSS hover transform replaced each SVG group's coordinate transform; hover now changes only its outline and shadow.
- Added map-band labels, lineage-specific link colors, full node titles, keyboard activation for family filters, cards, and lineage nodes, and current theme/tab accessibility state.
- Verified all four views, search filtering, the detail drawer, light/dark switching, and the 720px layout in Chromium. The page reported no console warnings or errors; the narrow layout had no page-level horizontal overflow. A hover position check showed identical node coordinates before and after hover.
- Left undone: single-canvas poster export. The lineage SVG remains horizontally scrollable at narrow widths so its labels stay legible.
