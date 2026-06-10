const PORTFOLIO = {
  name: "Xyh Tamura",
  sections: [
    { id: "intermedia", label: "Intermedia"},
	{ id: "music", label: "music" },
	{ id: "theater", label: "Theater" },
	  { id: "technology", label: "Technology" },

  
    { id: "scoring", label: "Scoring" },
  { id: "research", label: "Research" }
    // You can append "major-works", "instruments", etc. here
  ]
};

let secRange = {};

const slides = [
  // --------------------------------------------------
  // 0. TITLE SLIDE
  // --------------------------------------------------
  { kind: "title" },

  // --------------------------------------------------
  // 1. SECTION: INTERMEDIA
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "intermedia",
      label: "Intermedia",
      description: "Intermedia art, electronic literature, creative code, sound art, and installations."
    }
  },


{
    kind: "set",
    main: {
      id: "of-another-shore",
      title: "Of Another Shore",
      year: "2025→",
      tags: ["intermedia suite"],
      media: [
        { type: "image", src: "../card/oas.webp", label: "hypertext constellation" },
        { type: "image", src: "../card/oas2.webp", label: "hypertext constellation" },
        { type: "image", src: "../card/edi.gif", label: "hypertext constellation" },
        { type: "image", src: "../card/threefloor.jpeg", label: "hypertext constellation" }
      ],
      blurb: "Of Another Shore is an intermedia suite of electronic literature, experimental pop, videopoetry, web art, glitch art, conceptual performance, and music. Structured as a decentralized hypertext network, the work links poems, songs, videos, scores, simulations, and interactive texts into a constellation of personal, cultural, geological, virtual, and speculative worlds. Suite treats the present as a porous shore between inaccessible pasts and futures. Across its fragmented and networked form, Of Another Shore explores liminality, multiplicity, memory, inheritance, cybertime, and the unstable construction of self within a reality where the dead, the dreamed, the virtual, the ancestral, and the not-yet-arrived remain strangely adjacent.",
      links: [
        { label: "Launch Suite", url: "https://ppk80.github.io/of-another-shore/" }
      ]
    },
    children: [
      {
        kind: "panels",
        label: "Suite Extensions & Artifacts",
        panels: [
          {
            id: "insulae-incognita",
            title: "Insulae Incognita",
            year: "2025→",
            tags: ["intermedia", "algorithmic poetry", "installation", "web art"],
            exhibitions: [
              {
                type: "Exhibited at",
                venue: "98B Collaboratory",
                event: "proposal for (an)other history",
                details: "— Physical installation with Orange Pi and monitor. Curated by Dayang Yraola.",
                year: "2025"
              }
            ],
            blurb: "A media art algorithmic poem generating a digital archipelago constructed from special Unicode characters and historical scripts of cultures holding precolonial contact with Manila.",
            links: [
              { label: "Open Poem", url: "https://xyhtamura.github.io/insulaeincognita/" },
              { label: "Exhibition Note", url: "https://www.dayangyraola.com/2025/07/proposal-for-another-history-98b-fub-9.html" },
              { label: "98B Collaboratory", url: "https://www.instagram.com/98bcollaboratory/" }
            ]
          },
          {
            id: "whisper-house",
            title: "Whisper House",
            year: "2025→",
            tags: ["conceptual performance", "score", "soundscape"],
            blurb: "A conceptual performance score designed for four performers, designated as 'guests,' situated inside an empty house. The instructions guide the ensemble through a series of quiet, contemplative actions that create an intimate, house-based soundscape—ranging from mundane actions like frying an egg or turning encyclopedia pages, to gentle sonic gestures like cooing quietly into a room.",
            links: [
              { label: "View Score", url: "https://xyhtamura.github.io/whisperhouse/" }
            ]
          }
        ]
      }
    ]
  },
  {
    kind: "piece",
    piece: {
      title: "Table of Metalloids",
      year: "2024→",
      tags: ["hypertext", "e-lit", "HTML"],
      media: [
        { type: "image", src: "../card/table.jpeg", label: "interface — hue field editor" }
      ],
      blurb: "Table of Metalloids is an interactive collection of experimental literature organized around the seven metalloids. Presented as a digital periodic table, the work uses each element’s scientific properties as a generative constraint for pieces including New Weird fiction, slipstream, body horror, kinetic poetry, science writing, nonfiction, and prose poetry. Across stories of termite symbiosis, programmable skin, undersea cables, emotional poisoning, metallic wolves, cosmic diaspora, and radioactive decay, the collection explores hybridity, toxicity, memory, geopolitics, embodiment, and transformation.",
      links: [
        { label: "Plasticoid", url: "https://ppk80.github.io/plasticoid/" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      title: "Manifest",
      year: "2024–2025→",
      tags: ["short film", "videopoem", "live score", "collaboration", "Pacific"],
      collaborators: "Bea Mariano", 
      exhibitions: [
        {
          type: "Presented at",
		  venue: "WHYNoT",
          event: "On the Verge",
          year: "2025"
        },
        {
          type: "Presented at",
		  venue: "Search Mindscape Foundation / Immersive Art",
          event: "Of Echoes and Currents",
          year: "2024"
        }
      ],
      media: [
        { type: "image", src: "../card/manifest.jpeg", label: "film still — oceanic archive" },
		{ type: "image", src: "../card/mani1.webp", label: "film still — oceanic archive" },
		{ type: "image", src: "../card/mani2.png", label: "film still — oceanic archive" },
		{ type: "image", src: "../card/mani3.webp", label: "film still — oceanic archive" }
      ],
      blurb: "Manifest is a collaborative short film and videopoem by Bea Mariano and Xyh Tamura, with a live score performed by Xyh at Search Mindscape Foundation’s Of Oceans and Currents. The work asks how the reverberations of American influence in the Philippines continue to structure what can be built, who is carried forward, and whose futures are allowed to arrive. Digitally stitching shipwrecks, Manila skylines, construction sites, archival photographs, handwashing footage, microorganisms, and oceanic imagery, Manifest becomes a meditation on war, development, salvage, and futurity. Its title evokes the ship manifest, ghostly manifestation, the making-real of the future, and the Pacific reach of manifest destiny, moving from the submerged wreck of the USS Samuel B. Roberts to construction workers turned sideways into underwater divers.",
      links: [
        { label: "Manifest", url: "https://vimeo.com/1019003508" }, 
        { label: "Bea Mariano", url: "https://www.beamariano.com/" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      id: "cornice",
      title: "Cornice",
      year: "2026",
      tags: ["art game", "ASCII terrarium", "web art", "generative audio", "cyberpunk"],
      blurb: "A browser-based poetic art game and ASCII terrarium, modeling a nocturnal balcony at the edge of an impossible post-cyberpunk city. The work combines WASD traversal, click-to-inspect textual specimens, movable world elements, randomized distant vistas, changing weather states, and an interactive sound engine to create a compact, living ecology of terminal life.",
      links: [
        { label: "Launch Game", url: "https://xyhtamura.github.io/cornice" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      id: "media",
      title: "Media",
      year: "2026",
      tags: ["virtual exhibit", "sculpture", "intermedia", "electronic literature"],
      media: [
        { type: "image", src: "../card/media.png", label: "gelatin poem — virtual exhibit" }
      ],
      blurb: "Media exists in two simultaneous forms: a physical sculpture and an interactive virtual artifact. Physically, it is a poem set in four strata of clear gelatin, where text cut from documents is suspended so each layer remains partly transparent to the one behind it. The virtual exhibit is a digital extension of the piece that allows readers to dynamically parse the block. As users adjust the virtual cut depth to zoom through the layers, the interface simulates the optical properties of the physical jelly—the top layer lifts away quickly, while the deeper textual fragments slowly clarify and emerge.",
      links: [
        { label: "Open Exhibit", url: "https://xyhtamura.github.io/media/" }
      ]
    }
  },
  {
  kind: "panels",
  sec: { id: "literature", label: "Literature" },
  panels: [
    {
      id: "plasticoid",
      title: "Plasticoid",
      year: "2024→",
      tags: ["cyberpoetry", "digital collage", "docupoetry"],
      media: [
        { type: "image", src: "../card/plasticoid.gif", label: "interface — hue field editor" }
      ],
      blurb: "Plasticoid is hypertext digital collage poetry in which every image and text fragment is sourced from and links out to academic papers, but includes public-domain archives, found images, recordings, online forums, garbage, and commercial packaging. The work explores identity as a collage of references inside academia, plastics, capitalism, virtuality, globalization, and ecological crisis. It asks how the self is constructed today through reference, how different sources can form poetic links through citation and collection, and the concept of the postmodern self as being composed entirely of references.",
      links: [
        { label: "Plasticoid", url: "https://ppk80.github.io/plasticoid/" }
      ]
    },
    {
      id: "shook",
      title: "Shook",
      year: "2024→",
      tags: ["electronic literature", "videopoetry", "docupoetry", "web art", "disaster"],
      media: [
        { type: "image", src: "../card/shook.gif", label: "browser-based disaster interface" }
      ],
      blurb: "Shook is an ongoing suite of electronic literature, videopoetry, docupoetry, and web art about the afterlives of disaster. From a Filipino-Japanese perspective, Shook explores how national histories, family memory, economic anxiety, digital media, and inherited trauma continue to reverberate through the present. Anchored by the 1990 Luzon earthquake, the 2011 Tōhoku earthquake, and the 2020 Taal phreatic eruption, the work pairs seismic events with the cultural and political conditions surrounding them: the post-Marcos Philippine state, Japan’s Lost Decades, and the pandemic-era internet. Through browser-based poems, movable windows, layered archival footage, blackout video editing, and Windows XP-inspired interfaces, the suite treats disasters as temporal lighthouses where geological rupture can be used to think about collective ghosts.",
      links: []
    },
    {
      id: "galvanism",
      title: "Galvanism",
      year: "2025",
      tags: ["web poetry", "electronic literature", "body porosity", "infrastructure", "Philippines"],
      media: [
        { type: "image", src: "../card/galvanism.gif", label: "web sequence — conductive body" }
      ],
      blurb: "Galvanism is a web-based poetic sequence about body porosity in the 2000s Philippines. Framing electricity as life-force, infrastructure, weather, media, empire, and nervous sensation, the work follows a Filipino-Japanese neuroqueer speaker whose body becomes a conductive membrane for television, dial-up internet, typhoons, political unrest, language, ghosts, rumors, floods, voltage, and history. In this charged Manila, plants break through concrete, insects invade power boxes, storms disrupt circuitry, and global events arrive as bodily current.",
      links: [
        // { label: "Galvanism", url: "..." }
      ]
    },
	{
      title: "Where You Were Last Seen",
      year: "2025",
      tags: ["textual-visual art", "drawing", "maps", "asemic writing", "disappearance"],
      media: [
        { type: "image", src: "../card/where-you-were-last-seen.jpg", label: "textual-visual work — disappearance map" }
      ],
      blurb: "Where You Were Last Seen is a series of three textual-visual works combining traditional and digital drawing, maps, diagrams, manipulated photographs, poetry, prose, and asemic writing. Drawing from the visual languages of police diagrams, personal scrapbooks, and hand-drawn cartography, the series explores disappearance as a liminal state: distinct from death, and marked instead by traces, uncertainty, and unresolved grief. Through partially legible writing, diagrammatic layouts, and intimate acts of mapping, the works examine how memory and documentation circle around what has vanished without ever fully recovering it.",
      links: [
        // { label: "Where You Were Last Seen", url: "..." }
      ]
    }
  ]
},

  {
    kind: "piece",
    piece: {
      title: "Piyesta Plaza",
      year: "2025",
      tags: ["vaporwave", "hauntology", "listening event", "Filipino cultural memory", "live audiovisual performance"],
      collaborators: "Mono by Phono",
      exhibitions: [
        {
          venue: "Mono by Phono",
          event: "Piyesta Plaza",
          year: "2025"
        },
        {
          venue: "Mono by Phono",
          event: "Piyesta Plaza 1985–1995 Airwaves",
          year: "2025"
        }
      ],
      media: [
        { type: "image", src: "../card/mono.gif", label: "live audiovisual set — archival airwaves" },
		{ type: "image", src: "../card/vaporwave.jpeg", label: "live audiovisual set — archival airwaves" }
      ],
      blurb: "Piyesta Plaza is a vaporwave and hauntological listening/social gathering hosted by Mono by Phono that explores Filipino cultural memory through archival sound, image, fashion, and atmosphere. While functioning as a broader vaporwave scene event, it also includes focused conceptual programs that trace Philippine history through 90s OPM, 80s ballads, Martial Law-era disco, Manila Sound, Golden Age cinema soundtracks, traditional folk songs, vintage commercials, and archival footage. The project has since expanded into Piyesta Plaza 1985–1995 Airwaves, a full-length vaporwave album and live audiovisual performance reflecting on Philippine pop culture, the 1986 People Power Revolution and its aftermath, and the early 1990s earthquakes.",
      links: [
	  { label: "Piyesta Plaza", url: "https://www.instagram.com/piyesta_plaza/" },
       { label: "Mono by Phono", url: "https://www.instagram.com/monobyphono/" }
       
      ]
    }
  },


  {
    kind: "grid",
    sec: {
      id: "short-works",
      label: "Short Works Portfolio",
    },
    pieces: [
      {
        title: "Chanidae",
        year: "2025",
        blurb: "Chanidae is a web-based slide poem that reads like a cinematic presentation, with fragments of text appearing across shifting blue gradients that evoke water, depth, and disappearance. Navigated through arrows, swipes, or keyboard input, the work uses animated transitions and subtitle-like placement to create a rhythmic reading experience where memory, history, and song seem to dissolve across an empty screen.",
        tags: ["web-based", "slide poem", "electronic literature"]
      },
      {
        title: "LOVE-LETTER-FOR-YOU.TXT",
        year: "2025",
        blurb: "LOVE-LETTER-FOR-YOU.TXT is an algorithmic poem based on the ILOVEYOU virus, written through the imagined persona of its creator and reframed through a postcolonial reading of internet access, desire, and corruption. As the poem remains on screen, its words are gradually replaced one by one with ILOVEYOU until the phrase overtakes the entire text, making the poem perform its own viral collapse.",
        tags: ["algorithmic poem", "electronic literature", "generative text"]
      },
      {
        title: "breakfast",
        year: "2025",
        blurb: "breakfast is a lo-fi spoken-word poem recorded on a phone during an early morning walk. Shaped by breath, footsteps, and passing traffic, the poem juxtaposes a grotesque encounter with roadside animal death against an eroticized vision of an approaching runner, blurring desire, violence, virility, and decay. Its raw field-recording quality heightens the speaker’s uneasy movement between observation, fantasy, and complicity.",
        tags: ["spoken word", "field recording", "sound sketch"]
      },
      {
        title: "Uniform",
        year: "2025",
        blurb: "Animated asemic writing short",
        tags: ["animation", "asemic writing", "video"]
      },
      {
        title: "72 Munting Panahon",
        year: "2025",
        blurb: "An interactive web timeline presenting a Filipino adaptation of the 72 microseasons. 72 Munting Panahon",
        tags: ["interactive timeline", "web", "generative"]
      },
	  {
        title: "KuboCities",
        year: "2025",
        blurb: "This digital poem takes the form of an interactive GeoCities homage, using GIFs, guestbooks, CRT glitches, and Web 1.0 design to archive Manila’s millennial geopolitics. Through references to EDSA revolts, pirated software, postcolonial tech culture, and urban mythology, the work treats the early internet as both personal memory and historical interface, inviting visitors to reshape the poem through submissions.",
        tags: ["digital poem", "interactive", "web 1.0"]
      }
    ]
  },
  // --------------------------------------------------
  // 2. SECTION: MUSIC
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "music",
      label: "Music",
      description: "Electronic, experimental, and vocal works."
    }
  },
{
    kind: "piece",
    piece: {
      title: "Pacing To",
      year: "2015",
      tags: ["Synthpop", "Vaporpop", "Collaboration", "Album Art"],
      media: [
        { type: "image", src: "../card/masm.jpeg", label: "film still — oceanic archive" },
		{ type: "image", src: "https://f4.bcbits.com/img/0004708717_10.jpg", label: "film still — oceanic archive" },
		{ type: "youtube", id: "ffGUR_9GX6E" }
      ],
      blurb: "A collaboration with Brazilian artist MASM. This is a synthpop and vaporpop 6-track EP. Besides these genres, it takes influences from industrial music, bossa nova, trap EDM, eurodance, R&B, and minimalist music. It was mixed to have the sensation of being listened through an old device. It explores ideas of memories and the haunting of the past, as well as the inevitable change, development, and decay of reality. Also was the album artist for this incorporating 3d graphics, vector graphics, mixing different types of technological degradation such as glitch, paper, and vhs. draws on glowing 80's neon on black screen imagery as well as spray painted high color movie posters.",
      links: []
    }
  },

  {
    kind: "grid",
    sec: {
      id: "music",
      label: "Selected Tracks & Audio",
    },
    pieces: [
      {
        title: "Open Play Assembly 2",
        year: "2026",
        blurb: "Open Play Assembly 2 was a curated live free-improvisation performance organized by Joee Mejias, featuring Xyh on voice and synthesizer with bower gra! on processed electric violin and Blend Earth on electronics, loops, effects, and Filipino instruments. The set moved through loose sections: bright folktronica, moody violin-synth call-and-response, and a final ambient sound bed.",
        tags: ["Live Performance", "Free Improvisation", "Vocal & Synth"]
      },
      {
        title: "Sail",
        year: "2023",
        blurb: "Released as Cye Tamura. A piano driven pop ballad.",
        tags: ["Pop Ballad", "Piano"]
      },
      {
        title: "Lie",
        year: "2012–2018",
        blurb: "A harp-based meterless song with multiplied harps which are also manipulated through granular synthesis to create a soundscape of infinite harps. It is based on the mythology of sirens, and tries to reimagine the modern digitally mediated siren, where the voice distorts and melts into the soundscape.",
        tags: ["Experimental", "Granular Synthesis"]
      },
      {
        title: "Know Me Do",
        year: "2012–2018",
        blurb: "An IDM pop song, mixing synthesized kick drums with household found sounds and musique concrète techniques, soft distorted beats, and a hybrid acoustic-electronic plucked instrument. This resists the typical drum set sound in electronic and pop music, favoring new materials as sonic sources, and resists the acoustic/electronic divide. It creates an ecosystem of fuzzy digital and analog distortion sound objects. The lyrics are surreal and blabber-like, about surveillance. “rat me out to the NSA, you really know me do”",
        tags: ["IDM Pop", "Musique Concrète"]
      },
      {
        title: "Hyacinth",
        year: "2012–2018",
        blurb: "A song composed with total serialism, and uses a shrill head voice for the melody, as well as synthesizers in 7/4 as a repeating loop through the song.",
        tags: ["Total Serialism", "Experimental"]
      },
      {
        title: "PT01 (Perihelion)",
        year: "2012–2018",
        blurb: "A short song, using a square-wave-like synth as the main accompanying instrument to the vocals. Its project is to elevate the synthesizer and electronics as an accompaniment to a singer-songwriter work instead of a typical instrument like a guitar. It’s written in the vein of Alanis Morrissette or Lisa Loeb. It also uses purely synthesized beats, resisting the ordinary drum kit.",
        tags: ["Synthpop", "Singer-Songwriter"]
      },
      {
        title: "Meiosis",
        year: "2009",
        blurb: "Asian Composer's League · instrumental electronic music based on simple waveforms, Philippine gongs, and vertical composition",
        tags: ["Instrumental", "Electronic"]
      }
    ]
  },

// --------------------------------------------------
  // SECTION: THEATER
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "theater",
      label: "Theater",
      description: "Performance, libretto, playwrighting, live streaming production, and theatrical experiments."
    }
  },
   {
    kind: "piece",
    piece: {
      id: "biopsy",
      title: "Biopsy",
      year: "2026",
      tags: ["playwriting", "experimental theater", "body horror", "institutional critique"],
      blurb: "An experimental play set in a pandemic-era hospital biopsy room, where three forgotten tumors (Glioblastoma, Meningioma, and Hematoma) become conscious and begin performing the roles of doctors, patients, administrators, and hospital staff. As their abandoned biomass grows into a living hospital of flesh, wires, mold, and paperwork, the play moves through medical realism, absurd bureaucracy, and body horror to explore how individuals become locked into social roles inside complex systems of care, debt, migration, and public health.",
      links: []
    }
  },
  {
    kind: "piece",
    piece: {
      id: "dice-cult",
      title: "The Dice Cult",
      year: "2020→",
      tags: ["virtual performance", "actual play", "TTRPG", "live streaming"],
      exhibitions: [
        {
          type: "Streamed on",
          venue: "Twitch & YouTube",
          event: "Serialized Tabletop Performances",
          year: "2020→"
        }
      ],
      blurb: "An actual play streaming collective producing serialized tabletop roleplaying performances using systems such as D&D 5e, Call of Cthulhu, and Vampire: The Masquerade. Roles encompassed live acting, long-form improvisation, character costuming, and remote ensemble storytelling, alongside full production support: video and audio editing, background music, soundscape creation, stream asset design, and community moderation.",
      links: [
        { label: "YouTube Channel", url: "https://www.youtube.com/@TheDiceCult/videos" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      id: "magic-staff",
      title: "The Magic Staff",
      year: "1999",
      tags: ["musical theater", "performance", "libretto", "songwriting"],
      exhibitions: [
        {
          type: "Staged at",
          venue: "Meralco Theatre",
          year: "1999"
        }
      ],
      blurb: "A full-scale musical production conceived and written at age nine, where I served as librettist, songwriter, and lead actor. Staged in collaboration with prominent figures in Philippine theatre, including Fides Cuyugan-Asensio, Bernardo Bernardo, and Monique Wilson.",
      links: [
        { label: "watch", url: "https://www.youtube.com/watch?v=R4hyaAySjG0" },
        { label: "Philstar Press", url: "https://www.philstar.com/pilipino-star-ngayon/showbiz/2000/11/04/118632/gifted-children-san-sila-galing-" }
      ]
    }
  },

// --------------------------------------------------
  // SECTION: TECHNOLOGY
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "technology",
      label: "Technology",
      description: "Creative tools, instruments, software, web systems, experimental interfaces, and speculative technical prototypes."
    }
  },
  {
    kind: "piece",
    piece: {
      id: "tabota",
      title: "TaboTa",
      year: "2025",
      tags: ["composition tool", "notation language", "microtonal", "polymetric", "web audio"],
      blurb: "A post-MIDI experimental composition tool and notation language for microtonal, polymetric, and time-based media. The project combines a JSON-based score format with browser-based editors: a piano-roll interface for drawing held tones, glides, freehand pitch contours, and voice assignments, alongside Cycla, a subdivision grammar builder for designing recursive meters and exporting .cyc time maps. TaboTa models a score as a set of translatable temporal and axial regimes: beats, seconds, unordered cues, frequencies, categories, and performance instructions. Where .scl files describe tuning systems for pitch, Cycla’s .cyc files describe tuning systems for time.",
      links: [
        { label: "Launch Instrument", url: "https://xyhtamura.github.io/tabota/" }
      ]
    }
  },
    // --------------------------------------------------
  // SECTION: SGUELTCH SUITE
  // --------------------------------------------------
  
{
    kind: "set",
    main: {
      title: "Sgueltch",
      year: "2025",
      tags: ["Software Suite", "Aesthetic Philosophy", "Tool Design"],
      blurb: "Sgueltch, a word between squelch and glitch, is both an aesthetic philosophy and a software suite. It proposes a shift in digital aesthetics away from traditional glitch art’s rigid, pixelated, grid-bound, and mechanical disruptions toward organic, fluid, and biologically inflected distortions. Rather than treating glitch as the natural look of the digital, Sgueltch argues that conventional glitch mainly reveals the dominant abstractions underlying many computational systems: grids, blocks, lines, harmonic regularity, and schematic repetition. In response, Sgueltch develops alternative computational substrates drawn from material processes such as fluid flow, growth, diffusion, viscosity, and bodily transformation, as well as from less predictable abstract logics. Its glitches ooze, breathe, spread, stain, and mutate, foregrounding asymmetry, unpredictability, embodiment, and collaboration between human and nonhuman agencies. In this sense, Sgueltch is not simply about making glitch softer or more organic-looking; it is about rethinking what digital systems can become when they begin from other material and conceptual foundations. It takes the mechanics and aesthetics of glitch and moves them from rigidity toward living, symbiotic, ecological transformation.",
      media: [{ type: "placeholder", label: "Sgueltch Visuals" }]
    },
    pieces: [
      {
        title: "Gurgulator",
        year: "2025",
        tags: ["Granular Resynthesis", "Web Audio"],
        blurb: "Gurgulator is a web-based granular resynthesizer for producing wet, unstable, gurgling sound textures. Using erratic pitch bends, time warps, burping filters, and gooey convolution reverb, the tool turns audio into a bubbling, bodily material suited for organic glitch, creaturely sound design, and viscous electronic textures.",
      },
      {
        title: "Pixel Lesions",
        year: "2025",
        tags: ["Image Processing", "Pixel Sorting"],
        blurb: "Pixel Lesions reimagines pixel sorting as biological infection. Instead of producing rigid linear glitches, the tool lets organic lesion-like forms spread across an image like lichen, slime mold, or tissue decay, sorting pixels only within their boundaries to create fluid, visceral distortions that feel alive.",
      },
      {
        title: "SiltCRT",
        year: "2025",
        tags: ["Shader Tool", "Interactive Image"],
        blurb: "SiltCRT is an interactive shader-based image tool that reimagines CRT decay beyond the pixel grid. Using Voronoi tessellation, turbulence, chromatic bleed, current flow, radiant bloom, and an inverse “Umbra” bleed, it transforms images into soft, glowing cellular fields that feel less like screens than unstable phosphorescent matter.",
      },
	        {
        title: "TypeBojangler",
        year: "2025",
        tags: ["typography", "SVG tool", "organic noise", "generative graphics"],
        blurb: "A browser-based organic text renderer that applies seeded, per-character noise to typography — jittering size, rotation, position, color, blur, and spacing independently across characters. Controls split smooth cumulative drift from sharp per-character variation, letting parameters produce either subtle texture or total disintegration. Outputs dependency-free HTML with SVG/PNG export.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/typebojangler/" }
        ]
      }
    ]
  },

  {
    kind: "grid",
    sec: {
      id: "technology",
      label: "Creative Code, Instruments, & Software Utilities",
    },
    pieces: [
      {
        title: "Cytophone",
        year: "2026",
        tags: ["web audio", "modal synthesis", "physical modeling", "generative instrument"],
        blurb: "A browser-based modal-synthesis instrument in which drifting cell-like bodies ring when struck, their timbre derived from physical resonance models (membrane, plate, bell) pushed into impossible hybrids. Visual properties map directly to sound, so the colony is played by setting it in motion and letting bodies collide.",
        links: [
          { label: "Launch Instrument", url: "https://xyhtamura.github.io/cytophone/" }
        ]
      },
      {
        title: "Glossolalia",
        year: "2026",
        tags: ["formant synthesis", "vocal tract model", "experimental interface", "web art"],
        blurb: "A browser-based formant-synthesis instrument in which drifting IPA glyphs act as sounding bodies, generating speech-like syllables from a vocal-tract model so that the output only ever seems to be language. The vowel space serves as the interface, sitting at the boundary of instrument, speaking toy, and writing machine.",
        links: [
          { label: "In Vitro", url: "https://xyhtamura.github.io/glossolalia-invitro.html" },
          { label: "Rabble", url: "https://xyhtamura.github.io/glossolalia-rabble.html" }
        ]
      },
      {
        title: "FrameSmear",
        year: "2025→",
        tags: ["video processing", "feedback engine", "web tool", "glitch art"],
        blurb: "A browser-based video feedback processor for creating frame-accumulation, motion-smear, and video-reverb effects from uploaded footage. It utilizes adjustable parameters for memory decay, frame opacity, drift, zoom, rotation, chromatic split, edge inscription, brightness persistence, and softening, with options to preview, snapshot, and export.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/framesmear.html" }
        ]
      },
      {
        title: "xyhnthesizer",
        year: "2026",
        tags: ["Kontakt instrument", "sampler", "vocal synthesis", "sound design"],
        blurb: "A specialized Kontakt vocal-organ virtual instrument built entirely from custom, self-recorded vocal samples and custom script controls.",
        links: [
          { label: "Video Demo", url: "https://www.instagram.com/p/DXrk60ITOau/" }
        ]
      },
      {
        title: "stitcher",
        year: "2025",
        tags: ["utility", "LLM workflow", "archiving", "file parsing"],
        blurb: "A lightweight file-concatenation utility that merges collections of files into single, searchable .txt documents for research, archiving, and LLM workflows. It preserves source context through clear file delimiters and metadata (path, size, type). Available as a browser drag-and-drop interface and a recursive Windows desktop batch script.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/stitcher/" }
        ]
      },
      {
        title: "Pythia",
        year: "2025",
        tags: ["granular delay", "audio effect", "web audio", "predictive DSP"],
        blurb: "A web-based 'precognitive' granular delay effect that uses one audio file to anticipate and shape textures from another file. Features dual-signal processing, negative delay, lookahead sampling, threshold triggering, and precise grain parameters.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/pythia/" }
        ]
      },
      {
        title: "Electropond",
        year: "2026",
        tags: ["FM synthesis", "physics engine", "microtonal", "visual music"],
        blurb: "A browser-based visual-physics instrument where FM-synthesis plankton generate complex sound layers through physical motion, color properties, collision dynamics, and rippling microtonal fields.",
        links: [
          { label: "Launch Instrument", url: "https://xyhtamura.github.io/electropond.html" }
        ]
      },
      {
        title: "Critterances",
        year: "2026",
        tags: ["procedural audio", "interaction audio", "creature design", "web audio"],
        blurb: "A procedural creature-sound engine and browser toy. It generates chirps, murmurs, droplets, and filtered grains for imaginary digital critters. Functions as an interaction-audio module for a robot-toy to convey systemic states (thinking, transcribing, crafting) and standalone as a playable web interface to modulate garbage-bot vocalizations.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/critterances/" }
        ]
      },
	  {
        title: "Ganymede",
        year: "2026",
        tags: ["WebGL", "image processing", "audio reactive", "web tool", "noise field"],
        blurb: "A browser-based WebGL image-warping tool that subjects any uploaded photograph or graphic to a continuously animated noise field, featuring layered controls for lens distortion, chromatic aberration, seamless tiling, hue and saturation shifting, and real-time audio reactivity via live microphone input.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/ganymede" }
        ]
      }

    ]
  },
// --------------------------------------------------
  // SECTION: SCORING
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "scoring",
      label: "Scoring",
      description: "Commissioned composition, sound design, and music for film, documentary, podcast, and media projects."
    }
  },
{
    kind: "piece",
    piece: {
      title: "Naughty Maids",
      year: "2026",
      tags: ["short film", "music composer"],
      exhibitions: [
        {
          type: "Screened at",
		  venue: "Austin, Texas",
          event: "The Comedy Film Festival",
		  details: "Won: Best Pilot Script",
          year: "2026"
        },
        {
          type: "Screened at",
		  venue: "Glendale, California",
          event: "HollyShorts Film Festival — Official Selection",
          year: "2026"
        }
      ],
      blurb: "A short film score that incorporates cleaning materials as sound sources, blending Southern California influences with modern orchestration.",
      links: [
        { label: "Instagram", url: "https://www.instagram.com/stories/thenaughtymaids/" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      title: "Memory of Jaro",
      year: "2019",
      tags: ["full length documentary", "music composer", "sound designer", "sound recordist", "video editor"],
      blurb: "Full-length documentary score and complete audio-visual post-production management. Features 'Asó nga Tin-aw,' an end credits piece built from melodic fragments of Ilonggo folksongs.",
      links: [
        { label: "trailer", url: "https://youtu.be/ulzUkRW31S4" },
        { label: "Asó nga Tin-aw", url: "https://youtu.be/m5h0V8sohe4" }
      ]
    }
  },{
    kind: "piece",
    piece: {
      title: "Handaan",
      year: "2018",
      tags: ["short film", "music composer"],
      exhibitions: [
        {
          type: "Screened at",
          venue: "Las Vegas Filipino Short Film Festival",
          event: "",
          details: "— Nominated for Best Director, Best Cinematography",
          year: "2025"
        }
      ],
      blurb: "A warm, narrative film score with a more traditional animation-film sensibility, inflected with Filipino timbres such as gongs, bamboo instruments, and guitars, seamlessly incorporating Filipino instruments with modern soundtrack instruments.",
      links: [
        { label: "watch", url: "https://vimeo.com/257075950/16254d49cb" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      title: "Palibut-Libot",
      year: "2018",
      tags: ["short film", "music composer"],
      exhibitions: [
        {
          type: "Screened at",
          venue: "FilAm Creative Film Festival",
          details: "— Won: Best Short Film",
          year: "2023"
        },
        {
          type: "Screened at",
          venue: "Las Vegas Filipino Short Film Festival",
          details: "— Nominated for Best Editing, Bahaghari (LGBTQ Award)",
          year: "2025"
        }
      ],
      blurb: "A Manila interpretation of neon-noir: a synth-driven Manila soundtrack using field recordings, noise, and rougher textures, moving away from glossy slickness toward something grimier and more unstable.",
      links: [
        { label: "watch", url: "https://vimeo.com/245099254/f42219fc27" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      title: "Ave Maria, Gaia Mystica",
      year: "2007",
      tags: ["Soundscape", "Live Performance", "Custom Instrument"],
      media: [
        { type: "placeholder", label: "Performance Documentation" }
      ],
      blurb: "Roles: Music composer & performer for an Earth Day 2007 Event at Quirino Grandstand, Metro Manila. Transitional music for concert composed from non-human nature sounds such as star recordings, animal sounds, earth and ice sounds, and thunder. Includes live performance with a custom-made glass harmonica.",
      links: []
    }
  },
  // --------------------------------------------------
  // SECTION: RESEARCH
  // --------------------------------------------------
  {
    kind: "divider",
    sec: {
      id: "research",
      label: "Research",
      description: "Academic, para-academic, autotheoretical, participatory, and arts-based research."
    }
  },
{
  kind: "grid",
  sec: { id: "research", label: "Research" },
  pieces: [
    {
      id: "hauntotechnics",
      title: "Hauntotechnics",
      year: "2026",
      tags: ["autotheory"],
      blurb: "Hauntotechnics is an autotheoretical research essay that understands haunting as both cultural memory and technological mediation. Bringing Derrida’s hauntology together with Yuk Hui’s cosmotechnics, it argues that ghosts emerge through specific bodies, rituals, histories, media systems, infrastructures, and habits of recognition. Moving across Filipino multo, Japanese yūrei, vaporwave, Hiroshima, U.S.–Philippine colonial memory, and Ringu, the essay proposes “hauntotechnics” as the co-mutation between ghosts and the systems through which societies learn what to notice, repeat, aestheticize, forget, or call common sense."
    },
    {
      id: "practice-sharing-iii",
      title: "Practice Sharing III",
      year: "2026",
      tags: ["artistic research"],
      blurb: "This practice sharing reflected on my intermedia approach to language as a material, cultural, and technological medium shaped by bodies, histories, interfaces, and modalities. Through examples in web-based literature, code, sound poetry, installation, and performance scores, I traced how my work shifted from using media to present language toward treating code, sound, notation, and performance as compositional systems that actively transform what language can do.",
      exhibitions: [
        {
          venue: "Journal for Artistic Research",
          event: "Language-Based Artistic Research Group",
          year: "2026 forthcoming"
        }
      ]
    },
    {
      id: "from-interiority-to-interaction",
      title: "From Interiority to Interaction: Reframing Personhood, Communication, and Affect with Artificial Interaction Partners through Japanese Cultures",
      year: "2025",
      tags: ["Philosophy of Technology"],
      blurb: "Shifts debates about AI, robots, and large language models away from whether they possess “real” consciousness or intelligence, and toward the social roles they already perform in human life. Drawing on Japanese robotics, technoanimism, relational personhood, and ontological fluidity, the paper examines artificial interaction partners—from AIBO robot pets and android Buddhist figures to companion robots and LLMs—as technologies that mediate affect, communication, ritual, kinship, and care. It argues that technological personhood is not an internal property, but something that emerges through interaction."
    },
    {
      id: "commitments-of-physical-modeling",
      title: "The Commitments of Physical Modeling: Timbre, Mediation, and Virtual Instrument Construction",
      year: "2026",
      tags: ["Timbre Studies"],
      blurb: "Examines how timbre is constructed in virtual instrument design, especially through physical modeling synthesis. Rather than treating timbre as a fixed property that can be recovered from physical mechanisms alone, this research argues that timbral identity emerges from an assemblage of materials, mediation technologies, acoustic spaces, bodily cues, and culturally trained listening. Using physical modeling as a case study, the paper shows how virtual instruments inevitably make “commitments” about what counts as the instrument, what kind of listener is being addressed, and which aspects of timbral experience are being prioritized.",
      exhibitions: [
        {
          venue: "Université de Montréal",
          event: "International Conference on Timbre",
          year: "July 2026"
        }
      ]
    },
    {
      id: "dungeon-synth-synthetic-medievalisms",
      title: "Dungeon Synth as Transcultural and Transtemporal Construction: Synthetic Medievalisms",
      year: "2026",
      tags: ["Medieval Reception"],
      blurb: "Studies dungeon synth as a form of mediated world-building rather than a straightforward revival of medieval music. The project argues that the genre’s “medieval” atmosphere is assembled through layers of prior imagination: Norwegian black metal’s lo-fi mythic austerity, American and Japanese video game music, early MIDI and sound-chip aesthetics, fantasy literature, tabletop gaming, zines, pixel art, and online genre communities. By tracing these references across cultures and historical moments, the paper frames dungeon synth as a synthetic medievalism: a music of dungeons, ruins, forests, and quests that returns not directly to the Middle Ages, but to the late twentieth-century media systems that had already transformed the medieval into fantasy."
    },
    {
      id: "night-bus-intermedia-musicopoetics",
      title: "Intermedia Musicopoetics and Transpractice Songwriting in “Night Bus”",
      year: "2026",
      tags: ["music composition"],
      blurb: "A conference presentation around Night Bus, an experimental pop composition that thinks about how the singer-songwriter genre can expand through intermedial practice, drawing together contemporary music, poetry, electronic sound, and Philippine cultural memory. Developed as part of the intermedia poetic suite Of Another Shore, the song treats pop as a hybrid artform where sung phrases behave like poetic lines, shaped by enjambment, asemic vocality, timbre, polytonality, ostinato, and electronic transformation. Inspired by soliranin and indolanin, Filipino song forms often referenced in literature but lacking definitive recorded versions, Night Bus reimagines rowing and work-song rhythms within an urban transit setting, layering maritime, riverine, mythological, and funerary imagery onto contemporary city life.",
	  exhibitions: [
        {
          venue: "University of the Philippines",
          event: "Saliksik-Musika II",
          year: "June 2025"
        }
      ]
    },
    {
      id: "feeling-together",
      title: "Feeling Together: Affective Circuits and the Relational Self in Philippine Cultures Beyond Literary Individualism",
      year: "2025",
      tags: ["affect theory"],
      blurb: "Examines how emotion and personhood operate beyond Western models of the self as private, bounded, and individual. Centering Filipino concepts such as loób and kapwa, the project argues that affect is not simply an inner state but a relational force that emerges through language, social expectations, media, ethical responsibility, and shared cultural worlds. Through philosophical and literary analysis, participant interviews, and autoethnographic reflection, the research explores affective phenomena such as hiyâ, kilíg, and húgot, showing how these blur the boundaries between feeling, action, virtue, perception, and performance.",
	  exhibitions: [
        {
          venue: "Nanyang Technological University",
          event: "Feeling Formal",
          year: "Jule 2025"
        }
      ]
    }
  ]
}
];

// Dynamically calculates the start and end slides for each section
// so the navigation dots and header tabs highlight correctly.
function buildSlides() {
  let currentSec = null;
  secRange = {}; // Reset just in case
  
  slides.forEach((s, i) => {
    if (s.sec && s.sec.id) {
      if (currentSec !== s.sec.id) {
        if (currentSec) {
          secRange[currentSec][1] = i - 1;
        }
        currentSec = s.sec.id;
        secRange[currentSec] = [i, i];
      } else {
        secRange[currentSec][1] = i;
      }
    }
  });
  
  if (currentSec) {
    secRange[currentSec][1] = slides.length - 1;
  }
}