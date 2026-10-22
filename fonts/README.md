# Xyh Fonts

Four original Latin display faces: Bract Regular 1.100, Sump Regular 1.000,
Skirl Oblique 1.100, and Lode Regular 1.000. Each maps 346 codepoints and has
four finite contextual states, accents, combining-mark attachment and stacking,
and fitted spacing. TTF, WOFF, and WOFF2 files are available in the specimen.

[Public specimen](https://xyhtamura.github.io/fonts/).

The tester shares text, size, tracking, leading, and variation controls across
the four faces. Contextual alternates cycle within unbroken runs; spaces restart
the cycle. Disable `calt` and select `ss01`, `ss02`, or `ss03` for a fixed state.
The glyph explorer uses the same 346-codepoint repertoire, displaying combining
marks on a sample x. Two spaces are omitted from its 344 grid entries.

[`catalog.json`](catalog.json) lists export hashes, sizes, versions, and proofs.
[`ASSETS.md`](ASSETS.md) records provenance. Font production remains in the
local fontmaking workspace. Its publication script accepts only the four named
original families and requires completed verification and matching export hashes.
The private bank and build dependencies are excluded.

From the local workspace root, publish the checked copies with:

```powershell
python fontmaking/scripts/sync_public_fonts.py
```

The browser check is `scripts/check-fonts.cjs` in this repository. It accepts
`--modules PATH`, `--browser PATH`, and `--url URL`. It loads all four webfonts,
compares contextual/base pixels, checks controls and glyphs, hashes all twelve
downloads, and captures desktop and 390 px layouts.
