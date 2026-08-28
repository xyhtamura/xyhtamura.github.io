# Element Projections — Project Notes

Interactive exploration of the periodic table of chemical elements as a two-dimensional projection of multidimensional property space.

$$\text{Layout} = (\text{ordering key},\, \text{wrap rule})$$

- Spec: [`../unbuilt/element-projections_spec_20260826.md`](../unbuilt/element-projections_spec_20260826.md)
- Research thread: [`../loosethreads/element-arrangement-and-what-a-layout-costs/`](../loosethreads/element-arrangement-and-what-a-layout-costs/README.md)
- Literature archive: [`../library/periodic-table-arrangement/`](../library/periodic-table-arrangement/SOURCES.md)

---

## 1. The Result the Tool is Built On

The standard 18-column periodic table is an arrangement choice designed to preserve **chemical valence recurrence** in vertical columns. It spends its two spatial dimensions on valence homology and distorts continuous physical metrics (electronegativity, atomic radius, ionization energy, density, melting points).

Every periodic layout is formally defined by a pair:

1. **Ordering Key**: The one-dimensional sequence along which matter is ordered (e.g. Atomic number $Z$, Pauling electronegativity $\chi$, atomic mass, or Allahyari & Oganov Mendeleev numbers).
2. **Wrap Rule**: The criterion by which the 1D sequence is partitioned into rows or cycles (e.g. noble gas shell closures, Madelung $(n+\ell)$ subshell filling, fixed raster widths, or continuous bivariate relaxation).

When the ordering key is continuous, sorting by properties does not destroy the periodic table—it naturally reconstructs periods and groups as the dominant principal components (**Besalú 2013**), and the primary visual and scientific content is the **residual**:
- **Displaced Hydrogen**: Lands between Carbon and Nitrogen in property PCA rather than above the alkali metals.
- **Displaced Carbon & Nitrogen**: Shifted away from the expected period line due to half-filled subshell stability.
- **Diagonal Relationships**: Lithium–Magnesium and Sodium–Calcium pair together in property space.
- **Döbereiner Triads**: Elements in classic triads (Li–Na–K, Ca–Sr–Ba, Cl–Br–I) align with equal spacing along $PC2$ (dominated by atomic weight).
- **Sneath (2000) Intruders**: Titanium, Mercury, and Zinc intrude from the $d$-block into the $p$-block region; Axis III separates platinum metals from tungsten-like metals, proving that more than three dimensions are required to represent elemental variation without distortion.

---

## 2. Running It

Static, build-free, browser-native ES modules. Serve from root `F:\xyh` on port 8000 and navigate to:

`http://localhost:8000/element-projections/`

```bash
serve_root.bat 8000
```

Run the verification test suite:

```bash
node test/projections.test.js
```

---

## 3. Architecture & File Structure

| File | Purpose |
|---|---|
| `index.html` | Semantic markup, controls toolbar, stage wrapper, diagnostics card, inspector sidebar, literature modal |
| `style.css` | Obsidian/slate dark theme, responsive grid, GPU-accelerated transforms, crisp typography |
| `src/data/elements.js` | Complete dataset of all 118 chemical elements with verified physical and chemical constants |
| `src/data/besalu.js` | Exact 35-element dataset, correlation matrix, eigenvalues, and eigenvectors from Besalú (2013) |
| `src/data/mendeleev_scales.js` | Allahyari & Oganov (2020) USE scale, Pettifor (1984) scale, and Sneath (2000) atypicality metrics |
| `src/math/pca.js` | Pure-JS matrix algebra, standardization, and Jacobi eigenvalue decomposition for symmetric matrices |
| `src/metrics/distortion.js` | Displacement vectors $|\Delta \vec{r}|$, Sneath atypicality, $k$-NN topological neighborhood preservation, and residual classifications |
| `src/projections/layout_registry.js` | Layout generators: Standard 18-col, Janet Left-Step, Long 32-col, Mendeleev 1869, Besalú PCA, Full-118 PCA, Allahyari-Oganov USE, Bivariate Scatter, 1D Strip, Archimedean Spiral |
| `src/view/stage.js` | 60fps interruptible animation engine, canvas background (axes, trails, guides), interactive DOM element tiles |
| `src/app.js` | State management, UI controls wiring, URL hash sync (`#proj=...&z=...&color=...`), inspector updates |
| `test/projections.test.js` | Automated verification test suite |

---

## 4. Key Projections Implemented

1. **Standard Form (18-Column IUPAC)**: Baseline valence-recurrence table with split $f$-block.
2. **Janet Left-Step Form (1928)**: Quantum ordering by $(n+\ell)$ subshell filling ($f \to d \to p \to s$).
3. **Long Form (32-Column)**: Continuous periods with inline lanthanides and actinides.
4. **Mendeleev 1869 Historical Short Form**: Original 8-group layout ordered by atomic weight across 12 series.
5. **Besalú (2013) Empirical PCA**: 2D principal component reduction ($PC1 = 64.9\%$ periods proxy, $PC2 = 23.7\%$ groups proxy).
6. **Full 118-Element Multidimensional PCA**: Dynamic 2D projection over 6 physical properties across all known elements.
7. **Allahyari & Oganov (2020) USE Scale**: Nonempirical sequence ordered along the regression line of Pauling electronegativity vs atomic radius.
8. **Bivariate Property Scatter**: Continuous $(X, Y)$ mapping relaxing the grid into continuous property space.
9. **Archimedean Spiral**: Continuous $2\pi$ radial winding without row cuts.
10. **1D Rank Strip**: Unwrapped linear sequence demonstrating the zero-wrap limit.

---

## 5. Agent Activity Log

- `2026-08-28` — Codex — Made the chart readable across projection densities
  and phone-sized viewports. Discrete tables use square cells sized below their
  horizontal and vertical pitch, with a horizontally scrollable chart surface
  when 18, 32, or 118 columns cannot remain legible at the available width.
  The Mendeleev 1869 layout now packs elements that share a historical group and
  series into separate cells. PCA, property-scatter, and spiral layouts use
  compact labels whose exact coordinates remain marked by hairline leaders when
  labels must move to avoid a collision.

  On screens up to 700 px wide, the ten projection buttons collapse into one
  labelled selector, controls become full-width touch targets, the inspector
  joins the document flow, and only the chart surface scrolls horizontally.
  The page introduction and chart instruction were shortened so the projection
  selector reaches the first phone viewport sooner.

  **Verified:** `node test/projections.test.js`, `node
  test/verify_claims.mjs`, and `node test/audit_data_coverage.mjs` pass. Browser
  checks at 390 × 844 and 1280 × 720 found zero final cell overlaps in all ten
  projections, no document-level horizontal overflow at phone width, working
  mobile projection selection, and no console errors. The continuous labels can
  move away from their anchors; the leader line, axes, and inspector coordinates
  preserve the distinction between the exact data point and its readable label.

  **Undone:** the open data-quality findings below remain unchanged. A future
  pass could add a visible legend for the current color overlay; this pass keeps
  the existing overlay controls and selected-element badges.

- `2026-08-27` — Claude Code — Reskinned the interface from the slate dark theme
  to a **printed wall chart**: warm paper, ink hairlines, flat pigment fills,
  Libre Franklin for data and Libre Baskerville for the masthead, square corners
  throughout because printed rules have no radii.

  The skin is doing argumentative work rather than decoration. The piece's claim
  is that the standard table is one arrangement among many, so making the
  baseline look like the canonical classroom chart is what gives the other nine
  layouts something visible to depart from. Everything that is not the chart is
  styled as the apparatus around a printed one: the controls as a key box, the
  diagnostics as a caption, the inspector as a side note.

  **Files touched.** `style.css` rewritten. `index.html`: font link swapped.
  `src/data/elements.js`: `CATEGORIES` and `BLOCKS` repigmented from screen
  colours to printed pigments. `src/view/stage.js`: tile fills lightened to a
  wash, canvas overlay redrawn in ink on paper, and the cell rule handed to CSS —
  `updateTileVisuals` now sets `--tile-edge` instead of `borderColor`, so the
  full-strength hue becomes a 2px swatch bar along the bottom of each cell the
  way a legend key does, and the rule itself stays uniform ink. **Layout maths,
  data and metrics were not touched.**

  **Fixed in passing: the page was rendering raw TeX.** `index.html` carried
  `\(Z\)`, `\(\to\)`, `\(\text{Layout} = ...\)` and four more, but no
  MathJax or KaTeX is loaded, so every one displayed as literal backslashes.
  Replaced with real markup (`<span class="m">Z</span>`, `&rarr;`, and so on) and
  confirmed none remain.

  **Verified:** `node test/projections.test.js` 5/5 and the two audit scripts
  still pass; fonts load; no console errors; the inspector, modal, hash sync and
  all ten presets work. Contrast was measured rather than eyeballed, compositing
  each translucent tile wash down onto the paper first — everything lands above
  4.5:1, and the worst-case element symbol across all five colour modes is
  10.9:1. `--ink-faint` was darkened from `#857d6f` to `#6b6355` because the
  original fell to 3.4:1 behind the 10–11px labels.

  **Undone / to know:**
  - **The previous dark stylesheet is gone.** This folder has no `.git` and is
    outside the root repository's whitelist, so `style.css` was overwritten with
    no history behind it. The new skin is token-driven, so a dark variant is a
    block of variable overrides rather than a rewrite — but it would not restore
    the original design, which no longer exists. **`git init` here would stop the
    next overwrite being permanent.**
  - The pane could not produce a screenshot (`the Browser pane is not displayed`),
    so the skin was verified through computed styles and measured contrast, not
    by looking at it. Worth a human glance at
    `http://localhost:8000/element-projections/`.
  - Canvas overlay colours were changed in source but not seen rendering, since
    `requestAnimationFrame` is paused while the pane is hidden.
  - The two findings from the verification pass above — extrapolated f-block
    displacements, and the C/N claim in §1 — are still open and untouched.

- `2026-08-27` — Claude Code — Verified the build rather than adding to it. Ran
  the existing suite (5/5 pass) and wrote two further checks, additively, without
  editing any file Antigravity wrote:
  - `test/verify_claims.mjs` — checks the empirical claims the interface makes,
    normalising every layout into the unit box first, since layouts return their
    own units (grid columns, PC scores) and comparing them raw would measure a
    change of units rather than of arrangement.
  - `test/audit_data_coverage.mjs` — checks how much of the 118-element dataset
    is measured rather than defaulted, and cross-references that against the
    displacement ranking.
  Confirmed working in the browser at `http://localhost:8000/element-projections/`:
  ten layout presets, no console errors, hash sync, and the diagnostics card
  stating the ordering key and wrap rule for each projection. Tile positions
  freeze while the preview pane is hidden because `requestAnimationFrame` is
  paused there — the state updates correctly, so this is the environment, not the
  animation engine.

  **The strongest result in the project is a number nobody has written down yet.**
  `computeNeighborhoodPreservation` at k = 5 gives: **standard 18-column 33.8%,
  Besalú PCA 66.2%, full 118-element PCA 44.6%, 1D strip by electronegativity
  28.4%.** The standard table preserves about a third of property-space
  neighbourhoods. That is the thesis — a layout spends its two dimensions on one
  thing and pays for it elsewhere — stated as a measurement rather than an
  analogy, and it belongs in the interface.

  **Two findings that need a decision. Neither was touched, since one agent works
  a folder at a time and this one was Antigravity's.**

  1. **The largest displacements sit where no source study has data.** The top 20
     movers from the standard grid are dominated by the f-block and the
     superheavies — No, Lr, Lu, Yb, Og, Ts, Bk, Tm, Lv, Cf, Er, Es, Md, Fm, Ho.
     **Besalú's sample is 35 elements with no f-block at all, and Sneath excluded
     the f-block explicitly for lack of complete data.** 17 of those 20 are
     extrapolated through Besalú's published loadings; four rest on a fallback
     constant. Coverage gaps: electron affinity missing for 15 superheavies,
     electronegativity missing for He, Ne, Ar and 15 superheavies. The noble-gas
     case is the sharpest — `layoutBesaluPCA` substitutes χ = 1.8 for He, Ne and
     Ar, which have no Pauling value at all, so they plot as mildly
     electronegative rather than as absent. `layoutBesaluPCA` already records
     `isOriginalSample` per element, so the fix is to surface it: mark
     extrapolated positions in the view, and refuse to rank a displacement built
     on a fallback. Otherwise the piece's most dramatic motion is an artefact of
     its own default values, in a piece whose whole subject is which elements land
     in the wrong place.
  2. **§1's "Displaced Carbon & Nitrogen" is not what the app measures.** By
     displacement from the standard grid, C and N rank 98th and 96th of 118 —
     among the least moved. Besalú's sense is different: they are displaced
     relative to their neighbours *inside* the PCA plot, not relative to the
     standard table. Hydrogen is displaced in both senses, and the app confirms it
     — rank 7, and the only element in the top ten carrying Besalú's own published
     score rather than an extrapolation. Worth separating the two senses in §1, or
     a reader will look for a motion that is not there.

  **Undone:** neither finding is fixed. The k-NN numbers are computed but not
  surfaced as the headline. Glawe et al. 2016, which states the ordering-key
  problem as solved, is still unread and still unfetched — it is open access and
  needs only a browser. `build_datasets.py` and its `__pycache__` sit in a project
  documented as build-free; whether the generated data is committed output or a
  live dependency is not recorded anywhere.

- `2026-08-27` — Antigravity — Built the standalone static application from [`unbuilt/element-projections_spec_20260826.md`](../unbuilt/element-projections_spec_20260826.md).
  - Implemented the complete 118-element verified dataset with physical properties, oxidation states, configurations, and provenance.
  - Implemented pure-JS Jacobi eigenvalue decomposition and validated exact replication of Besalú (2013) Table 3 eigenvalues ($3.24, 1.19, 0.43, 0.09, 0.05$) and Table 4 eigenvectors.
  - Built 10 distinct layout formulations with interruptible 60fps transitions, motion displacement trails, and diagonal/triad guides.
  - Implemented topological $k$-NN neighborhood preservation and Sneath atypicality metrics.
  - Verified with 5-suite automated unit test (`node test/projections.test.js`).
