# Five Ways Through

Five short browser pieces in a field of plants at night, lit by a camera flash
and played with a photographed hand. The landing page is Xyh's five-sentence
text; each sentence opens one piece.

| Piece | Look, heading, pace | What you do | Sound |
| --- | --- | --- | --- |
| [Running](running/) | Starts as blue night with a white flash; with distance the flash turns red, violet, then orange-red against a sky moving to green; no path; strafing forward and left; 0.7–3.5 m/s | Grab the brush ahead and let it snap back. Each snap adds speed, which decays; after 220 m or 150 s the brush opens onto the horizon and the piece ends. | Bend-down notes while holding, a snap on release |
| [Exchange](exchange/) | Daytime with the flash on: deep blue sky, white clouds, a dark peak; path; drifting right; 0.06 m/s | Press a plant: a hand card stands where it was, and the cursor becomes the plant. Ends after 12 exchanges. | A vowel gliding from the last pitch to the new one |
| [Hours](hours/) | Night blue → dusk → magenta → amber; straight ahead; 6.5 m/s, faster when dragging, almost no stride | Drag sideways (or arrow keys) to move through the hours; the moon arcs, the flash fades as the sky's light rises; fast drags are wind. Ends once all four have been reached. | A held F minor seventh gliding between equal, just minor, septimal, and Whitewood35 tunings |
| [Toward](toward/) | A new colour at each pole: amber sepia, rose dusk, orange flash on violet-blue, pink flash on aurora green, teal night with the bulb left warm; standing still drains it; poles and palms; straight ahead; walks by itself at 0.9 m/s | Holding a press (over 0.22 s) stops the walk; the hand steers, and a short tap steers too. A bulb over the payphone on the fourth pole, 96 m on, is the destination; arrival turns to face it. | Step pulses; a detuned chord drawn into septimal tune by distance; a rising phrase on arrival |
| [Forgetting](forgetting/) | Near-black, cyan light near and magenta further off, each plant under a coloured gel; shide on straw ropes mark every other place a thing lies; looking down; walking backwards; 0.38 m/s | Pick up things lying on the path; picking up another puts the last one down where the hand is, and pressing the ground puts it down on its own. Ends after the last thing passes. | A held note per thing, bent down when it is put down; the carried notes return with only the last one sounding |

Each piece also loops its own wind recording, and has its own bokeh palette
(`running`, `exchange`, `hours`, `toward`, `forgetting` in the engine), which
also tints the floating dust. Type is Averia Sans Libre, served from `fonts/`.

## How it is built

- `engine/scene.js` is generated from [flashbrush/scene.js](../../flashbrush/scene.js)
  by `scripts/make_engine.py`, which applies exact replacements and fails if one
  no longer matches. It removes the controls panel, reel renderer, and gesture
  recorder, reads a settings object `S` instead, and adds what the pieces need:
  hooks, card picking against texture alpha (with a tolerance for thin things), adding and moving single cards, a
  bulb light and glow, a movable moon, a clearing, a textured payphone, camera
  offsets, a wider view on portrait screens, render scaling from frame time,
  brush laid out to match the facing angle (`S.drift`: positive looks right of
  travel, negative left, near 0 or 180 even on both sides), walking backwards
  (`S.backwards`), a stride multiplier (`S.bob`), dust tinted by the bokeh
  palette, a flash that changes colour with distance (`S.flashFar`,
  `S.farRange`), per-plant coloured gels (`S.gels`, `S.gel`), a separate fill
  light colour and bright haze for daylight (`S.ambientColour`, `S.hazeLift`),
  sunlit clouds (`S.cloudSun`), and a darkened peak (`S.peak`). Looks
  `daylight` and `gels` are new; `engine/blend.js` moves settings between
  looks along a progress value. `S.shide` places shimenawa with shide (bamboo
  stakes, a sagging straw rope, four zigzag paper streamers that flutter in the
  wind), drawn as geometry.
  **Change Flashbrush and rerun the script; do not edit `engine/scene.js`.**
- `engine/brush-audio.js` is Flashbrush's synth plus a held voice, a vowel
  voice, a step pulse, a chord pad, and a looped recording.
- `engine/shell.js` gives every piece its first screen (the press that unlocks
  audio), the way back, the sound switch, and the ending card.
- Each piece is one `piece.js` that sets a look and movement and fills hooks.
- `scripts/make_credits.py` writes `credits.html`. `scripts/make_wind_loops.py`
  writes the loops outside the repository, and `scripts/pack_sounds.py` packs
  them into `data/sounds.pak`, read by `engine/sounds.js`.

Credits are in [credits.html](credits.html). The development log (`NOTES.md`),
asset provenance (`ASSETS.md`), and description text (`DESCRIPTION.md`) are kept
beside this file but are not published; see `.gitignore`.

No build step and no libraries. Served by the root server at
`http://localhost:8000/xyhtamura.github.io/five-ways-through/`.

For testing in a page that is not being painted, `sceneStep(seconds)` advances
and draws one frame.
