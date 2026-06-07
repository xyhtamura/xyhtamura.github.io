# CORNICE — Research-Creation Handover Document
**Purpose:** LLM-parseable summary of maker's stated ideas, analytical contributions from interview sessions, theoretical touchstones, and unresolved tensions. For use in artist statements, research-creation papers, and poetics drafting.
**Source:** Three spoken-word interview sessions + code analysis of `cornice.html` (single-file browser-based ASCII worldtoy, 2806 lines).
**Maker position:** Filipino-Japanese, based in Manila/Philippines. Practice spans e-lit, sound art, visual art, games.

---

## 1. WHAT CORNICE IS

### Primary description (maker-stated)
- Browser-based navigable ASCII terrarium/worldtoy
- "A nocturnal balcony at the edge of an impossible city"
- Single HTML file; currently ~2800 lines; designed to be portable and platform-agnostic
- The maker's preferred term is **webtoy**, with acknowledged awareness that this term causes category problems (see §7)

### Technical architecture (relevant to theory)
- **Tile/entity separation:** world objects are semantic data structures; glyphs are explicitly described in code comments as "temporary visual skins" — "the character displayed is not the object itself"
- **Tag system:** entities carry compound taxonomic tags, e.g. `machine_mushroom: ["fungus","machine","FM-chirp"]`, `socket_fern: ["plant","machine","conductive","photosynthetic"]`, `wire_vine: ["vine","cybernetic","conductive"]` — the organic/synthetic binary is refused at the data level
- **Whisper system:** each tile/entity carries 3–5 short text strings surfaced on click/inspect
- **Sound system:** footstep sounds mapped to terrain type; ambient drone frequency tuned to a pitch scale; separate mix buses for SFX and drone
- **Pack registry:** `window.NightTerrarium.registerPack()` API exists, enabling external tile/entity/scene/weather/biome extension packs — Cornice is designed as a platform, not just an object
- **Procedural weather:** 24 named weather states with tint, drone frequency, and one-line atmospheric description (e.g. "afterparty humidity," "archival drizzle," "velvet interference," "soft alarm fog")
- **Distant vistas:** 20+ named backdrop scenes (e.g. "Taxidermy Moon," "Pink Refinery," "Airport Afterlife," "Server Monastery," "Weather Factory") — the impossible city seen from the balcony, never entered
- **Renderer separation:** planned future upgrade path from glyph to sprite/texture mode without rewriting map logic; engine is architecturally forward-compatible

---

## 2. ORIGIN IMAGES AND SPATIAL IMAGINARIES

### 2a. Wimmelbilder (primary generative instinct)
- Maker explicitly cites wimmelbilder (hyper-dense illustrated scenes, "Where's Wally" tradition) as the foundational aesthetic logic
- Key claim: wimmelbilder don't just show a world, they make the world's **interiority available** — every corner is parseable, every zone's drama is simultaneously legible
- Contrast with photography: a photo captures what's visible from one position; a wimmelbild is more like an audit or X-ray
- **Analytical extension:** Cornice enacts this logic at the interaction layer, not the visual layer. The world looks sparse (ASCII) but is internally dense (semantic tags, whisper texts, sound profiles). Every tile has a legible interiority accessible through inspection. This is the inverse of AI-generated teeming images (which produce *appearance* of story-density without internal logic per element)
- Richard Nadler cited as example of AI art enabling teeming landscapes with less authorial effort

### 2b. Height and terrain — the non-hierarchical reading
- **Maker's claim:** building higher does not universally code as status/wealth. In mountainous regions (Philippines, Japan, South America, SE Asia), height is a function of **slope negotiation**, not social aspiration. Terraces exist because there are slopes.
- The flat-land American context is what makes elevation = status; this is not a universal
- Cornice's terraced structure invokes rice terrace logic: not above the landscape, in conversation with the slope
- **Analytical extension:** architectural meaning of "cornice" = horizontal protrusion at vertical edge, where wall becomes threshold of view. Also: mountaineering meaning = overhanging snow formation that could give way. There is structural **precarity** in the image the decorative-molding definition doesn't carry. The cornice is where you stand to see the city while being the least structurally essential part of the building — a foothold at the edge of multiple vertical systems
- Related reference: Greenbelt Makati — architects forced to incorporate green space; suspended corridor bridges at tree-height; architecture in conversation with existing nature, not above it

### 2c. Key spatial references
- **Jacques Tati, *Playtime* (1967):** mid-century imagination of skyscraper life as legitimate social space; garden parties high in buildings; promise of height as habitable, not just aspirational
- **Supergiant Games, *Transistor*:** entire game world on rooftops; city suspended high up with implied lower levels; life that has ascended without hierarchy
- **Tokyo at night:** maker's key image — continuous traversal density; cohabitation of things that evolved under different conditions; "a cactus diorama passing through an alley, above an AC unit, and then there are three or four shops, one of which is still open." This image is identified (analytically) as Cornice's actual logic: climatically wrong plant, machine infrastructure, interstitial space, uneven time, no designer of the whole
- **Philippines rice terraces:** vertical life as terrain negotiation; the terrace as a form that acknowledges and works with slope rather than flattening it
- **Singapore architecture:** necessity of incorporating nature in tropical/SE Asian urban contexts; nature not as add-on but as structural negotiation
- **Greenbelt, Makati:** forced green space; tree-height bridges; corridors where you can touch the canopy

### 2d. The post-party liminal feeling
- Maker-stated: "This is after a party when everyone's gone and the confetti is on the floor and you're kind of there. But things are still going on because the next day is still about to happen."
- Key distinction: **liminality requires the sense that something continues after.** Not Turner's threshold-between-two-states; more like rhythmic suspension — a pause between beats of an ongoing cycle
- The cornice as architectural element: decorative protrusion that finishes an edge, not load-bearing but required for completeness; forgotten but protruding outward
- "Forgotten but protruding outwards" — the quality of the space that makes it usable precisely because it isn't primary

---

## 3. TEXT, BODY, AND THE WHISPER SYSTEM

### 3a. Why text was necessary
- Maker needed the environment to be **responsive** without requiring physical proximity for every interaction
- In real life you can look at something from afar; Cornice simulates this: click-to-inspect is not proximity-gated
- Walking still matters for **tactile and spatial feeling** — you are moving a body through a space, your body is "here now"
- Walking sound is the primary vehicle of **sonic tactility** — footsteps do something in the world even if you bypass navigation entirely

### 3b. Theoretical frame: technotext (Hayles)
- Maker explicitly invokes N. Katherine Hayles, *Writing Machines* — technotext: the material substrate of inscription is constitutive of meaning, not incidental
- Cornice whispers are not text that happens to live in a web environment; the condition of access (navigate → click → read text presupposing embodied presence) changes what the text means
- **Analytical extension:** the Hayles argument is undersold by the maker. It should be claimed more specifically: the whisper texts assume a present body ("the path behind me is slightly more awake"; "I know the edge"). This is not just context — the text is addressed to someone who arrived.

### 3c. Theoretical frame: ergodic literature (Aarseth)
- Maker invokes Espen Aarseth, *Cybertext* — ergodic texts require nontrivial traversal work from the reader; the text does not reveal itself passively
- Also invokes George Landow on hypertext — reader action exposes text
- **Analytical extension:** Cornice adds **sonic tactility** to the ergodic framework — Aarseth's cybertext theory doesn't account for the embodied footstep sound as part of the traversal experience. This may be claimable as a contribution or distinction.

### 3d. Voice ambiguity as formal feature
- Maker-stated: unsure if tile/entity is speaking, or if reader is reading a description, or if someone else is speaking — "that ambiguity is kind of part of what I'm thinking about"
- **Analytical extension (important):** this is not uncertainty in the writing, it is a deliberate structural feature. The whispers occupy at least four distinct voice positions:
  1. **First-person entity speech:** "I carry one weather pixel under my shell"
  2. **Ambient ecological description:** "the ground keeps count without becoming a ledger"
  3. **Direct address to reader:** "You have been logged in seven discontinued systems simultaneously"
  4. **System output / bureaucratic notation:** "Atmospheric conditions: [weather]. Logged."
- None of these frames dominates. Effect: you can never locate the speaker, so you can never locate yourself as reader. You don't know if you're being spoken to, observed, or simply in the presence of something that generates text as a metabolic process.
- This is a **specific poetics**, not ambiguity. The reader's position is structurally unstable.

### 3e. Spatiality constructed through reading, not just position
- Maker's claim: you cannot fully feel the spatiality of Cornice just because there is a body in the space. You need to read the text.
- Spatiality = knowing where things are AND knowing what things are in reference to where you are
- "The feeling that a wall or a railing is to your right or to your left a couple squares away — it's a different feeling and a different sense of spatiality"
- The ASCII visual layer is insufficient for full spatial experience; the semantic layer (inspection/whispers) completes it

### 3f. ASCII as structural choice
- Maker history: made ZZT games; ASCII has personal continuity
- Current choice: expanded Unicode glyph set used (beyond 90s ASCII constraint) — contemporary capability acknowledged
- Maker notes Cornice works well as pure ASCII object
- **Analytical extension:** ASCII is not a retro aesthetic choice. The visual constraint of ASCII *makes the whisper system necessary*. Because you cannot render a machine mushroom visually, the machine mushroom has to speak. The visual poverty of ASCII relocates the world's interiority from image to text. If rendered in full sprites, the text could be bypassed. In ASCII, it cannot. This connects back to the wimmelbild logic: the world's drama is made available through inspection, not visual representation; ASCII makes this unavoidable rather than optional.

---

## 4. POST-COLONIAL ARGUMENT: URBAN/NATURAL COLLAPSE

### 4a. The claim
- Cornice does not distinguish between urban and natural — machine mushrooms, moss walls, wire vines, neon fuzz coexist without hierarchy between organic and synthetic
- This is intentional and post-colonial: in the Philippines, Japan, and much of SE Asia, the residential/commercial/industrial/natural have **not been cleanly partitioned** in the way they have been in Western (particularly American) urban planning
- The Western urban/suburban/pastoral divide is not a universal; it is a specific historical and geographic artifact
- Maker: "We did not partition our urban life and our residential life in such a way"
- Cyberpunk is cited: cyberpunk's visual language is drawn from Asian cities where these zones are mixed, but this debt is often unacknowledged

### 4b. Formal enactment in the work
- The tile tag system performs this collapse at the data level. Selected examples:
  - `machine_mushroom`: `["fungus","machine","FM-chirp"]`
  - `socket_fern`: `["plant","machine","conductive","photosynthetic"]`
  - `wire_vine`: `["vine","cybernetic","conductive","wind-responsive"]`
  - `lantern_snail`: `["organism","slow","light","soft-machine"]`
  - `signal_crab`: `["organism","machine","sideways","signal"]`
- Compound taxonomic identity is the norm, not the exception. The taxonomy refuses the organic/synthetic binary structurally, not just aesthetically.

### 4c. The underbelly claim
- Maker: "This is partly the underbelly of the underbelly of the city — it's not the most glamorous parts"
- Not techno-optimistic, not techno-pessimistic
- Finding momentary solace and attention in an environment that isn't performing for you
- The Polly Pocket analogy: pocket-sized, teeming, passable — an experience you can carry and re-enter

---

## 5. AFFECT AS CRITICAL — ATTENTION AS DISTINCT CATEGORY

### 5a. The Warhol analogy
- Maker invokes Warhol's Campbell's Soup Cans: when asked if it's critique, Warhol answered — "when you go outside, what you see on the billboard is Campbell soup cans. He's just making art of what's there."
- Cornice's posture is similar: not critique (I oppose this), not acceptance (I endorse this), but **attention** (this is what's there; I am looking at it)
- **Attention** = sustained looking that doesn't resolve into a verdict

### 5b. Attention as philosophical category
- Analytically, this connects to Simone Weil's use of attention as an ethical/spiritual category: a quality of looking that doesn't impose but receives; that changes the one attending
- Distinction worth developing: attention vs observation — attention is sustained, embodied, and changes you. Moving through Cornice proposes this.
- Maker's framing: "It's not even critique in the sense that I don't like this. It's more of attention."
- Finding peace in the ecumenopolis — not because it's resolved but because the attention itself is the act

### 5c. Affect as critical (feminist epistemology thread)
- Maker's claim: academic discourse requires articulable, citational, textual argumentation — "it needs to be in this sort of argumentative way"
- Counter-claim: why must knowledge always be in this positivist/rationalist mode? Intuition-first making is a legitimate knowledge practice
- Maker states: "I usually feel something first. I have an intuition to do something. I do it. I don't know why. But it makes sense maybe years later."
- Key distinction (analytical): this is two separate arguments that should be kept distinct in a paper:
  1. **Process claim** (autobiographical): intuition-first making is valid; felt knowledge precedes articulable knowledge
  2. **Work function claim** (theoretical): certain kinds of knowledge can only be transmitted affectively, not propositionally. Building a space where someone *feels* the collapse of urban/idyllic is not a substitute for arguing it — it is a different, and in some cases more rigorous, mode of making the claim
- Affect theory grounding available: Sara Ahmed, Sianne Ngai, Lauren Berlant

### 5d. Atmosphere as critical position
- Cornice's atmosphere: post-party quiet, nocturnal, liminal, between-events, dense but not spectacular
- **Analytical extension:** this atmosphere is a critique of the urban image as spectacle — the teeming AI city, the Instagram rooftop, the never-sleeping metropolis as aspirational image. Cornice refuses visual saturation and replaces it with something navigated slowly, tile by tile. You cannot consume Cornice the way you consume a teeming cityscape image.
- The density is semantic rather than visual — a position on how cities get imagined and sold
- Post-party liminal atmosphere puts you in the gap that urban spectacle never shows: the city at the moment when it is not performing

---

## 6. THEORETICAL TOUCHSTONES

| Reference | Domain | Relevance to Cornice |
|---|---|---|
| N. Katherine Hayles, *Writing Machines* | Media studies / e-lit | Technotext: material substrate is constitutive of meaning; how text is accessed changes what it means |
| Espen Aarseth, *Cybertext* | E-lit / game studies | Ergodic literature; nontrivial traversal; reader must make tangible action to expose text |
| George Landow, hypertext theory | E-lit | Reader action as textual condition |
| Simone Weil, on attention | Philosophy / ethics | Attention as sustained, receptive, non-imposing looking; changes the one attending |
| Sara Ahmed / Sianne Ngai / Lauren Berlant | Affect theory | Affect as critical; mood as argument; atmosphere as knowledge |
| Andy Warhol, Campbell's Soup Cans | Art history | Attention vs critique vs acceptance; art of what's there |
| Jacques Tati, *Playtime* (1967) | Cinema | Mid-century imagination of elevated habitable space; architecture as social space |
| Donna Haraway (implied) | Feminist epistemology | Situated knowledge; non-positivist argumentation |
| ZZT (Tim Sweeney / Epic Games, 1991) | Game history | Maker's personal ASCII game lineage |
| Supergiant Games, *Transistor* (2014) | Games | Rooftop world; suspended elevation; implied lower levels |
| Viridi / walking simulators / aquarium games | Games | Existing genre context for non-gamified spatial exploration |
| Richard Nadler | AI art | Teeming AI landscapes; context for Cornice's counter-move |

---

## 7. ONTOLOGICAL PROBLEM: WHAT CORNICE IS CALLED

### 7a. The webtoy problem
- "Webtoy" = freedom from disciplinary commitments; can renew forms without being beholden to them
- But: easy to dismiss; loses legibility as art object
- "Technological doohickey" — the risk of the term

### 7b. Disciplinary frames as partial but distorting
- **If approached as e-lit:** foregrounds text as primary, treats spatial navigation as delivery mechanism — inverts the actual relationship (sound and movement produce the body that makes text meaningful)
- **If approached as game:** looks for progression/reward structures; their absence reads as failure rather than intention
- **If approached as visual art:** misses sonic dimension and literary register
- **If approached as sound art:** misses everything else
- These are not neutral partial readings — each introduces specific distortions
- Maker's resolution: "lightly carry the baggage of those disciplines and suspend the question of what this should be"
- Maker's allegiance: prefers game framing (vernacular over institutionalized); would rather this be seen as a game than as serious visual art

### 7c. Walking simulators as closest existing genre
- Maker identifies walking simulators as the existing tradition most calibrated to Cornice's logic
- People from that tradition would have "more of a handle" on how to approach it
- Aquarium games (Viridi cited) also relevant: non-gamified, ambient, spatial

---

## 8. UNRESOLVED TENSIONS (flagged for paper/statement development)

### 8a. Vernacular allegiance vs serious theoretical claims
- Maker states preference for game framing and vernacular forms over institutional art reception
- But the post-colonial, feminist epistemology, and affect-as-critical arguments are serious theoretical claims
- **Tension:** is the webtoy/game frame protecting the work from accountability to its own claims, or is it the right way to make those claims without institutional distortion?
- Recommendation: name this as deliberate unresolved tension rather than leave as ambivalence

### 8b. The maker's positionality in the work (underdeveloped)
- A Filipino-Japanese maker building an imaginary ecumenopolis borrowing from Tokyo, Manila, Singapore, rice terraces, Greenbelt
- The impossible city is assembled from those specific reference points — this is not neutral geography
- The work is experienced from a cornice — at balcony distance, never from inside the city
- Questions not yet answered: Who stands on the cornice? What is the city in relation to that person? Is the distance structural — i.e., is looking at the city from a forgotten protrusion rather than from within it a position statement about the maker's relationship to the urban formations being invoked?

### 8c. Platform vs singular artwork
- Pack registry suggests Cornice as platform (extensible, inviting external packs, genre-generator)
- Poetic precision of whispers and weather names suggests singular artwork (complete, internally authored)
- These ambitions pull in opposite directions; architecture currently wants to be both
- Not necessarily a problem to resolve, but worth naming which is primary for different contexts (artist statement vs research paper vs distribution platform)

### 8d. The body-text relationship (underdeveloped)
- Maker said spatial experience required the user to feel they have a body in the space, then moved on
- Whisper system presupposes embodied presence — texts addressed to someone who arrived
- The reading experience is not the same as navigating: you have to move to find the texts, and the texts assume the movement happened
- This is where Cornice crosses from toy into e-lit, and the body-in-space framing is the justification for why it couldn't be a poem on a page
- Needs more development in any paper treatment

---

## 9. POSSIBLE EXPANSION DIRECTIONS (from earlier in session)

- **Cornice as platform:** external packs for distinct biome/world tones; base terrarium as one pack among many
- **Cornice as instrument:** navigation as composition; walked path generates generative score; ensemble mode (multiple instances)
- **Cornice as e-lit node:** path-text mode where tile sequence generates poem from whispers; terrarium as hypertext node within larger navigable sequence
- **The railing as threshold mechanic:** crossing into the distant vista; vertical world structure (balcony → street → rooftop)
- **The player as specimen:** archive bird responding to specific player movements; tiles inspecting the player; walked path as persistent trace
- **Persistent state / seasonal time:** specimen log accumulating across sessions; weather running on real-world clock or local weather API
- **Shared presence / soft multiplayer:** party ghosts as other users; asynchronous "someone was here" traces; distributed archive bird observation log

---

## 10. PORTFOLIO LANGUAGE (drafted)

### Tight/conceptual version
"A browser-based ASCII terrarium set on a nocturnal balcony at the edge of an impossible city, where bracket wasps, puddle saints, and archive birds share space with a signal scanner that renders each tile in deadpan ecological prose. Glyphs are treated as temporary rendering skins over persistent semantic objects — the architecture performing its own transience."

### Atmospheric version
"Cornice is a navigable worldtoy: a damp, luminous balcony populated by machine mushrooms and party ghosts, with procedural weather running names like 'afterparty humidity' and 'archival drizzle.' The piece lives at the intersection of terminal ecology and nocturnal diorama — synthetic-organic, bureaucratically haunted, explorable rather than gamified."

### Compressed version
"A single-file ASCII terrarium-worldtoy — fungal neons, bruise purples, and deadpan whisper texts ('the city punctuates, not punctually') — treating the terminal glyph as a temporary skin over a persistent semantic world."

---

## 11. KEY PHRASES / QUOTABLE LINES FROM MAKER (verbatim or near-verbatim)

- "A nocturnal balcony at the edge of an impossible city"
- "It's not a hierarchical thing, it's just the feeling of height and air"
- "A cactus diorama passing through an alley, above an AC unit, and then there's three or four shops, one of which is still open"
- "This is after a party when everyone's gone and the confetti is on the floor and you're kind of there"
- "You can't have the feeling of liminality without the feeling of continuity that something's gonna continue afterwards"
- "Forgotten but protruding outwards"
- "The character displayed is not the object itself; it is only the current glyph representation of that object" (from code comments)
- "It's not even critique in the sense that I don't like this. It's more of attention."
- "If you lightly carry the baggage of those disciplines and suspend the question of what this should be"
- "Affect can be critical. Atmosphere can be critical."
- "This is partly the underbelly of the underbelly of the city"
- "We can Polly Pocket this experience"
- "I usually feel something first. I have an intuition to do something. I do it. I don't know why."
- "Terminal ecology, haunted garden, fungal interface, night-party ruin, tiny ecumenopolis understory" (from code comments)
- "Synthetic-organic, post-digital, damp, luminous, strange, decorative, alive" (from code comments)

---

*Document generated from: code analysis of cornice.html + three spoken-word interview sessions. Analytical extensions are flagged as such throughout. All maker-stated claims represent direct or near-verbatim reported speech.*
