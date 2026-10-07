# Multicart architecture

Design proposal dated 2026-10-04. The four-game selection is Xyh's instruction; runtime and presentation decisions below are proposed defaults. A static menu links to the live Pages builds. The consolidated runtime described below is deferred until nearer delivery.

## First version: live links

Xyh chose live links on 2026-10-04. The root `index.html` links to the four existing Pages routes in the same tab, so browser Back returns to the menu and navigation leaves the previous game document. No iframe, game copies, storage adapter, or offline mode is needed at this stage. `games.json` records these URLs; the HTML carries ordinary links so the menu also works without JavaScript. Keep both in agreement until a registry-driven menu becomes useful. Consolidation is deferred until nearer the submission or delivery point.

## Proposed consolidated form

One entry screen presents four equally available works. The visitor selects a work, plays it in a dedicated viewport, and returns through a persistent **Games** button. Each work retains its own visual design, instructions, and internal menus. There is no shared score or required order.

The menu adapts the existing 12 IN 1 mock into a magazine and cartridge design: a 4 IN 1 masthead, an irregular multicart wordmark, numbered entries, and bright accents from the earlier palette. Desktop uses four editorial columns, medium widths use two columns, and phones use a vertical list. Locally bundled Bungee Shade, Rubik Puddles, and Pixelify Sans provide the display lettering and labels; ASSETS.md records their licences. CSS and glyph drawings represent the four works. The menu remains silent.

Default ordering follows the supplied selection: Cornice, Ombak Lock, Foam Green City, Drawing the Hours. Preserve that order in keyboard navigation. Public descriptions and the collection title need Xyh's editorial pass before exhibition use. The recorded briefer excludes AI-generated text as well as images, audio, and video; these internal planning documents are not exhibition assets.

## Four works, four requirements

| Work | Observed source structure | Integration requirement |
| --- | --- | --- |
| Cornice | Single HTML runtime, creator image, Google Fonts requests, keyboard movement, inspection, browser synthesis, theme storage | Keep supplementary files and glyph coverage; test movement focus and inspect overlays; prepare licensed local fonts or assess fallback rendering. |
| Ombak Lock | Single HTML runtime, local favicon, Google Fonts requests, Web Audio, keyboard-enabled dials | Keep its start gesture and listening instructions; test dials with mouse and touch; prepare licensed local fonts. |
| Foam Green City | HTML plus local modules and assets; Three.js r160 and add-ons imported from unpkg | Vendor the dependency tree with its licence; preserve all asset-relative paths; test WebGL, pause, restart, and long-running resource use. It is a silent autonomous walkthrough with pause control. |
| Drawing the Hours | HTML, CSS, ES modules, bundled Mali fonts, drawn gestures, campaign and preference storage | Keep the full runtime tree; preserve private campaign resume; provide isolated exhibition progress and test portrait, landscape, and drawing near the shell controls. |

These observations come from source and notes, not a fresh playthrough. Exact runtime file lists must be established during export. Foam Green City's notes record user clearance for supplied images; earlier SOMEWAREZ image holds are stale. Other assets still need their own source records checked.

## Runtime boundary

Load a single same-origin iframe on selection. Create it only when a game is launched. Returning to the menu removes the iframe and its browsing context; merely hiding it would leave rendering and sound running. Treat this as a lifecycle requirement to measure, especially for Web Audio and WebGL.

The shell owns navigation, collection fullscreen, loading status, and session selection. The game owns gameplay, its pause menu, sound controls, and instructions. Reserve a small shell toolbar outside the game viewport, with at least a 44 CSS-pixel **Games** target. Size the iframe to the remaining viewport rather than overlaying a control on a drawing field. Use dynamic viewport units and safe-area insets.

Keep the parent fullscreen so **Games** remains available. In an embedded exhibition build, child fullscreen controls should delegate to the parent or be suppressed by an explicit embed option. Standalone builds retain their own controls. A game fullscreen request must not hide the only exit.

Escape already belongs to Cornice overlays and Drawing the Hours pause menus. Preserve those uses; Escape is not a global exit shortcut. Parent keyboard listeners cannot receive keys focused inside an iframe. Keyboard access to **Games** needs either normal cross-frame focus traversal or a small child bridge for a reserved shortcut; test the traversal before adding the bridge.

Each game keeps its own audio start gesture. Clicking a parent launch button is not proof that the child AudioContext can start. Do not remove the game's existing start screen until the target browser has demonstrated the intended activation path.

## Small integration bridge

The first launcher can use iframe removal and the visible return button without game changes. Add a bridge only where session isolation, fullscreen, readiness, or cleanup needs it. Carry changes back to the source game before exporting another snapshot.

Proposed messages have a version, game ID, type, and payload. Types: `ready`, `request-menu`, `request-fullscreen`, and `error` from child to parent; `configure` and `dispose` from parent to child. Child sends `ready`; parent responds with the session configuration. Use the exact same origin as `targetOrigin`; accept messages only from the active iframe's `contentWindow`, with the expected origin, version, ID, and allowed type.

For an opted-in embed mode, start gameplay only after configuration arrives. Show a recoverable error if that handshake fails. `dispose` can suspend audio and stop game-owned loops before removal, but returning must still remove the iframe if the child never acknowledges. Ignore late replies from an earlier frame.

An iframe `load` event proves document loading, not successful module execution or an available audio engine. Until a game implements `ready`, the shell must not report it as verified ready. Keep **Games** available through loading failures and expose a retry action. A configurable timeout can identify a stalled handshake; derive its value from target-machine loading measurements.

## Sessions and persistence

Offer two deployment modes, configured separately from game content:

- **Personal web mode:** retain each game's existing preferences and progress. Returning to the menu unloads the running instance; relaunch uses the game's own resume behavior.
- **Exhibition mode:** begin a fresh visitor session when a game is launched. Keep visitor progress in memory or in explicitly namespaced session storage. Staff can retain display preferences without inheriting an earlier visitor's campaign.

All bundled same-origin games share localStorage with the site. A subfolder does not isolate storage. Drawing the Hours uses `dth_campaign_save_v2`, `drawing-the-hours-hints`, and `drawing-the-hours-color-mode`; Cornice also stores a theme. Never call `localStorage.clear()` to reset a visitor. Add explicit storage adapters or embed-specific keys in the games that need them. Returning may confirm loss of unsaved in-memory progress in personal mode; choose the exact behavior after observing each game.

Do not enable an idle reset in the first build. Still listening and watching are valid interactions, so inactivity alone is an unreliable exit signal. A staff reset and a clear return button are sufficient for the initial installation test. An attract cycle remains a later preference decision and would need muted execution and genuine activity reports from the active game.

## Portable package

Proposed deliverable layout (files marked here are not yet created):

```text
somewarez-multicart/
  index.html              # entry menu and shell
  style.css
  src/shell.js
  games.json              # registry already present
  games/
    cornice/
    ombak-lock/
    foam-green-city/
    drawing-the-hours/
  build-manifest.json     # snapshot commits, file hashes, export dates
  ASSETS.md               # shell assets and bundled provenance references
  scripts/                # repeatable exporter and package checks
```

Use document-relative URLs for the shell and each bundled game. No runtime references to sibling development folders, origin-root game routes, or local drive paths. A development preview can use a separate registry pointing at source folders, but it is not the deliverable registry.

Export explicit runtime file lists from pinned source commits, retaining licences and asset credits. Record source commit and SHA-256 hashes in the build manifest; reject dirty sources or explicitly record an intentional working-tree snapshot. Exclude `.git`, tests, research files, screenshots, and development previews unless the runtime uses them. Regenerate snapshots rather than hand-editing copies. This makes later game fixes reviewable and avoids silently shipping an old build.

For exhibition delivery, vendor Three.js and the imported add-ons, and resolve their transitive imports locally. Audit Google Fonts, font licences, images, model textures, and every fetch. Prefer a local HTTP server over `file://`, because ES modules and asset loading need normal HTTP behavior. Offline readiness means a cold browser with network access disabled loads and plays all four works, not that an online browser happened to cache them.

The same relative package should serve at `/somewarez-multicart/` under the root server and a nested site route after the move. Adding a service worker is deferred: a fixed local bundle meets the installation need without another update cache. Browser kiosk startup is a separate machine setup task, governed by `system/README.md` when hardware is known.

## Implementation stages

1. **Menu and lifecycle prototype.** Build the four-panel menu and one-frame shell against the local source games. Exercise launch, return, relaunch, keyboard focus, errors, and fullscreen. Decide the visual direction from this functioning prototype.
2. **Portable snapshots.** Write the exporter, pin the four builds, inventory assets, and remove network runtime dependencies. Test a relocated nested folder with the network disabled.
3. **Exhibition sessions.** Add the minimum source-game embed adapters for fresh progress and fullscreen ownership. Verify that existing personal saves remain unchanged.
4. **Installation rehearsal.** Run on the actual machine and input device. Measure frame rate, memory, sound termination, and repeated switching. Play the intended short-form encounter in every work. Prepare staff startup and recovery instructions.

Stages 1–4 apply when consolidation resumes. The immediate next step is to review the live-link menu and play through its four destinations. Delivery is the local portable package; GitHub publication and venue configuration follow after it passes the rehearsal.

## Acceptance checks

- Launch and return through all four games at least ten times; only one game frame exists, and audio stops after every return. Observe browser process memory and WebGL context behavior across the sequence.
- Open every game from a moved, nested package with a cold cache and network access disabled; inspect failed requests and console errors.
- Test the menu and return control by keyboard, pointer, and the available touch device. Check desktop, narrow portrait, and short landscape layouts with each game's actual canvas or controls visible.
- Test parent fullscreen, child fullscreen controls, loading failure, missing assets, and WebGL failure. The return control remains usable.
- Complete part of a Drawing the Hours campaign, return, and relaunch in both modes. Check personal resume, exhibition freshness, and the original personal save's contents.
- Listen to Cornice and Ombak Lock on the installation's sound route. Repeated launch must not produce doubled audio or require a browser reload.
- Run Foam Green City for an installation-length sample agreed against the venue schedule. Earlier room checks do not establish sustained resource use.

## Decisions left to Xyh

The public collection title, refinement of the magazine/cart menu, venue hardware and sound route, and whether a shared installation should offer a fixed encounter or the full Drawing the Hours campaign remain open. The four-work roster is settled for this architecture. Performance, input compatibility, and offline readiness are observable checks, not preference questions.



## Roster update: 2026-10-05

Xyh added Sulat as the fifth work. The live-link menu is 5 IN 1. Sulat links to https://xyhtamura.github.io/insulae-incognitae/sulat/ and uses keyboard typing to construct terrain. Consolidation must include its parent-relative shared scripts and fonts, not only the sulat subfolder. Desktop uses five columns; medium and narrow layouts retain two and one. Earlier four-work counts describe the preceding design.
