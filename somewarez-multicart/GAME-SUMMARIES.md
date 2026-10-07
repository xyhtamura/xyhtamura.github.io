# Games in the multicart

Internal offline reference for the five works listed in [games.json](games.json), compiled on 2026-10-06 from their local documentation and source entry points. The source folders remain separate from this menu; this document does not bundle the games for offline play. These are descriptive working summaries, not approved exhibition statements.

The documentation review asks whether a reader can identify the work, understand what they do in it, find its controls, and distinguish implemented behavior from older plans. It is a source review, not a fresh gameplay, listening, or touch-device test. Local builds can differ from the linked live Pages builds.

## Cornice

Cornice is a browser-based glyph terrarium set on a nocturnal balcony overlooking an impossible city. Plants, machines, and organisms share the same small environment, with changing weather and distant city scenes. Moving through it produces terrain-specific footsteps; inspecting a cell reveals short texts and the objects occupying its layers. The encounter centers on wandering, listening, and reading the environment.

**Interaction:** WASD or arrow keys move the player. Clicking a cell inspects it; clicking again cycles its layers. The page includes sound and display controls.

**Local sources:** [Entry page](../cornice/index.html), [research-creation handover](../cornice/cornice_handover.md).

**Description assessment: rich conceptual account; weak entry documentation.** The handover records the maker's spatial references, inspection texts, sound, and organic/machine taxonomy in detail. It separates maker statements from analytical extensions, which matters when borrowing language for a statement. Its source header names `cornice.html`, while the entry file is `index.html`; historical line counts are unsuitable as current technical reference. There is no root README or dated development notes file. The page itself supplies concise movement and inspection instructions. `typographic_matter.md` contains copied conversation material rather than a maintained project overview.

## Ombak Lock

Ombak Lock is a listening puzzle in which the player tunes three lock tumblers by matching audible beating between nearby tones. The reference is the deliberately differing paired tunings associated with Balinese gamelan. Each tumbler asks for a particular tuning and depth of beating, held for a specified duration. Bringing tones into unison seizes the lock. Fixed modes keep one reference tone stationary; floating modes let the player adjust the complete tone set. Six modes vary tone count, tolerance, hold duration, and failure cost.

**Interaction:** Start the audio, listen to the target, and adjust the pitch and depth dials. Pointer and keyboard controls are available. Sound is central to the puzzle.

**Local sources:** [Project description and development record](../ombak-lock/ombak-lock.md), [entry page](../ombak-lock/index.html).

**Description assessment: well described.** The project document explains the premise, modes, matching rules, synthesis model, controls, and outstanding checks. It is the strongest rules reference in this set, though lengthy for a first encounter. Its opening claim of “no deps” needs qualification: the HTML requests Google Fonts, even though the gameplay uses browser APIs without a JavaScript library. The root roadmap's proposed DSP integration is not a description of the implemented oscillator puzzle.

## Foam Green City

Foam Green City is a silent browser-based 3D walkthrough through procedurally arranged Filipino domestic interiors. Foam-green walls, family photographs, furniture, and household objects recur along a curved and twisting route. Seeded room generation produces familiar domestic runs interrupted by unusual geometry, larger spaces, side rooms, and passages; later additions include covered basketball courts and open-air paths made from roofing sheets. The visitor can let the walk proceed automatically or take control and explore. There is no navigation objective or win state.

**Interaction:** Select **Enter** to begin. WASD, **Take control**, or clicking the scene enables manual movement; mouse-look or dragging changes the view. Space returns to automatic walking. Pause, restart, and fullscreen controls are available. WebGL is required.

**Local sources:** [README](../foam-green-city/README.md), [concept](../foam-green-city/CONCEPT.md), [development notes](../foam-green-city/NOTES.md), [entry page](../foam-green-city/index.html).

**Description assessment: well described, with recent additions scattered through the log.** The README explains the experience, controls, procedural structure, setup, and limits. The dated notes carry newer room types and verification. The multicart architecture is behind this source: it describes an autonomous-only walk and CDN Three.js, while the source README documents manual exploration and bundled Three.js. Sustained performance remains an explicitly unfinished check.

## Drawing the Hours

Drawing the Hours is a gesture game in which the player draws a continuous cord among moving insects and airborne seeds. Loops enclose groups, multi-pocket figures separate combinations, and ordered strokes thread creatures in sequence. Stroke length changes the cord's color and available combinations; hazards can cut the cord or spoil a pocket. The campaign moves through morning, noon, dusk, and midnight, with different inhabitants, environments, and demands. The expanded sequence contains twenty-four visits, six per hour, adding teaching and buffer visits around the earlier twelve-visit campaign.

**Interaction:** Draw with a pointer, touch, or stylus and follow the visit's requirements. Visit cards and the Field Book explain combinations. Practice, visit selection, pause, hints, and saved campaign progress support replay. The work includes ambient sound.

**Local sources:** [Campaign specification](../drawing-the-hours/CAMPAIGN.md), [string rules](../drawing-the-hours/STRING.md), [development notes](../drawing-the-hours/NOTES.md), [early concept](../drawing-the-hours/CONCEPT.md), [entry page](../drawing-the-hours/index.html).

**Description assessment: extensively described; current overview needs consolidation.** There is no root README. The concept file clearly marks its early direction, but the campaign document opens by declaring twelve implemented visits and later identifies its expanded twenty-four-visit table as the current sequence. The root roadmap also has duplicate entries, one describing twenty-four visits and another emphasizing twelve. A concise current overview should state the twenty-four-visit structure and link to the detailed gesture rules. Full campaign pacing and real touch-device checks remain distinct from implementation checks.

## Sulat

Sulat is a typing artwork in which keys construct a landscape from thirty-six kinds of terrain. Glyphs drawn from several writing systems are chosen for their shape and terrain role. Completed lines advance in whole rows during playback, change through translation and neighboring biome contact, and support animals moving over connected land or water. Fliers appear as words whose names become readable in flight. Towns form beside water and send their names by boat. Water movement, icebergs, tides, floods, storms, and rare earthquakes alter the typed field. These are authored behavior rules, rather than a validated ecological simulation.

**Interaction:** Type with a physical keyboard or use the on-screen terrain keys. Space leaves a gap; Enter completes a line. Play advances the landscape, and Pause holds it. Settings adjust alignment and the on-screen keyboard. The in-page guide explains terrain changes, animals, towns, and event markings.

**Local sources:** [Development notes and overview](../insulae-incognitae/sulat/NOTES.md), [entry page and guide](../insulae-incognitae/sulat/index.html), [parent project notes](../insulae-incognitae/NOTES.md).

**Description assessment: clear mechanics; opening summary trails the guide.** The notes begin with a useful definition and file inventory, but their opening script list omits Thai, Telugu, Burmese, and Javanese, which the page guide includes. The opening animal list also omits newer species, fliers, and towns described elsewhere in the folder. There is no separate README, though the notes serve much of that role. The multicart registry lists keyboard input only, despite the implemented on-screen keyboard for pointer and touch. Sulat depends on shared code and fonts in its parent folder, so copying only `sulat/` is insufficient for an offline build.

## Collection documentation

All five works have substantive local descriptions. The main gap is consistency and a short current entry point, rather than an absence of material.

- The multicart [README](README.md) introduces five works but labels the registry link as four works with proposed bundle paths. The registry actually holds five live URLs.
- The [architecture](ARCHITECTURE.md) retains four-work sections followed by a fifth-work addendum. Its Foam Green City dependency and interaction observations have been superseded by the source documentation.
- The [statement data](content.json) contains empty paragraphs for the artist and all five works. The menu's statement panels therefore remain placeholders.
- Cornice would benefit from an entry README and a dated notes file; Drawing the Hours from a single current campaign overview; Sulat from an updated opening summary. Ombak Lock and Foam Green City already provide usable project descriptions.

This review records the gaps without rewriting source-game documents or filling the exhibition statement panels. Source documentation should be reconciled before consolidating the installation builds.
