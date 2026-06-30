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
    kind: "piece",
    piece: {
      id: "comma-poem-villa",
      title: "A Comma Poem, after José García Villa’s “I, it, was, that, saw,” before the coming El Niño",
      year: "2026",
      tags: ["intermedia", "bio-art", "electronic literature", "interactive web", "climate art"],
      media: [
        { type: "image", src: "../card/comma.png", label: "sprouted comma map on black gulaman slab" },
        { type: "image", src: "../card/poem.png", label: "original punctuation field mapping coordinates" }
      ],
      blurb: "A poem done on black gulaman and mung bean sprouts as well as an interactive digital poem that isolates only the commas from José García Villa's work and replants them as sprouts using a stencil technique onto a slab of black gulaman. Moving Villa’s classic imagery of a cultivatory miracle into a domestic act of munggo germination, the project acts as a small, temporary ritual for the agricultural and water anxieties of the developing 2026 El Niño. The browser interface maps the coordinates of the physical text, allowing users to wipe and fade dynamically between the original typographic punctuation and its temporary, living transfer.",
      links: [
        { label: "Open Poem", url: "https://xyhtamura.github.io/acommapoem/" },
      ]
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
      blurb: "Media exists in two related forms: a physical gelatin poem and an interactive virtual artifact. In the sculptural work, cut-up documents are suspended across four clear gel strata, allowing fragments of text to show through, obscure, and transform one another across depth. Its web counterpart extends this layered reading experience by letting readers adjust a virtual cut depth, moving through the block as upper layers recede and deeper textual fragments slowly clarify.",
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
    id: "driftham",
    title: "DriftHam",
    year: "2026",
    tags: ["internet radio", "generative listening", "browser-native", "radio-browser", "listening toy"],
    blurb: "DriftHam is an internet-radio drift device that wanders through live stations from the Radio-Browser community database, holding each signal for a randomized interval before crossfading or cutting to the next. Rather than functioning as a conventional radio player, it frames listening as a generative encounter with networked audio: users can cure a station in place, drift onward manually, savor stations, write taste notes, and export the session as a plain-text tasting log. Its breathing glazed ham interface turns the tool into a coherent media object, positioning the work between net art, sound art, interface sculpture, and listening instrument.",
    links: [
      { label: "Launch App", url: "https://xyhtamura.github.io/driftham" }
    ]
  }
},


  {
kind: "piece",
piece: {
id: "binlod",
title: "Binlod",
year: "2026",
tags: ["granular MIDI", "event generator", "composition tool", "Tabota", "rhythm"],
blurb: "An event-domain granular MIDI generator that turns input note-ons into seeded clouds of grain-events while preserving each original note as a pinned anchor. Rather than granulating audio, Binlod granulates musical events, using density, spread, profile shape, velocity jitter, and seed controls to create baked rhythmic textures for drums, instruments, or other MIDI-driven systems.",
links: [
{ label: "Launch App", url: "https://xyhtamura.github.io/binlod" }
]
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
      id: "hindcasts",
      title: "Hindcasts",
      year: "2025–2026→",
      tags: ["Software Suite", "Acausal DSP", "Un-live Effects"],
      blurb: "A collection of “un-live” audio and video effects that work from the whole file rather than the passing instant[cite: 1]. Treating static media as already-readable temporal objects, the suite explores what becomes possible when an effect can respond before, smooth backward, optimize globally, and act with full knowledge of the piece[cite: 1]. It intentionally drops causality to move past the traditional reactive, threshold-and-attack limitations of real-time systems, viewing the entire digital timeline at once[cite: 1].",
      media: [{ type: "image", src: "../card/hindcasts.png", label: "Hindcasts index causality readout display" }]
    },
    pieces: [
      {
        title: "Pythia",
        year: "2025",
        tags: ["precognitive granular delay", "audio effect", "web audio"],
        blurb: "A web-based “precognitive” or “paracognitive” granular delay effect that uses one audio file to anticipate and shape textures from another file[cite: 1, 4]. Driven by a dual-signal interface, it uses the structural envelope of a control signal to redistribute and scatter source material via negative delay, lookahead sampling, threshold triggering, and variable grain density[cite: 4]."
      },
      {
        title: "Sounder",
        year: "2025",
        tags: ["un-live compressor", "depth · dynamics", "web audio"],
        blurb: "An un-live dynamics processor that turns a sound file into a time-occupancy depth chart showing exactly how long the audio spends at each amplitude tier[cite: 1, 2]. Instead of modifying playback through standard compressor thresholds, ratios, and attack windows, the user redraws the dynamic seabed of the sound directly through an interactive visual transfer curve[cite: 2]."
      },
      {
        title: "Prolepsis",
        year: "2026",
        tags: ["acausal feedback field", "video processing", "framesmear"],
        blurb: "An acausal video feedback field that reads a clip completely end-to-end before generating its visual artifacting[cite: 1, 3]. It transforms traditional trailing framesmear into a pre-rendered temporal material: trails can bloom symmetrically or build up entirely ahead of a physical motion event, all while maintaining completely instant, zero-phase scrubbing across the clip[cite: 3]."
      }
    ]
  },
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
    kind: "set",
    main: {
      id: "goopcodecs",
      title: "goopCodecs",
      year: "2026→",
      tags: ["Software Suite", "Databending Codecs", "Substrate Distortion"],
      media: [
        { type: "image", src: "../card/manifest.jpeg", label: "goopCodecs format interface" }
      ],
      blurb: "A suite of browser-native, custom file formats architected explicitly for databending, mojibake text-editing, and substrate-specific data corruption. Moving away from standard optimization metrics like compression or speed, goopCodecs protects essential file headers while leaving structural bodies highly vulnerable to direct byte manipulation. The resulting errors translate directly into continuous, analog-organic artifacts rather than traditional rigid, grid-based digital crashes.",
      links: [
        { label: "Open Suite", url: "https://xyhtamura.github.io/sgueltch/goopCodecs.html" }
      ]
    },
    children: [
      {
        kind: "panels",
        label: "Codec Formats Registry",
        panels: [
          {
            id: "ooid",
            title: "ooid (.ooid)",
            year: "2026",
            tags: ["Gaussian blobs", "round loss"],
            blurb: "A layered anisotropic Gaussian blob still and video format. Byte corruption produces swelling fields, soft lesions, relayering, and shifting fog across alpha paths. Video uses independent ooid frames in a video container, allowing damage to stay frame-local or be pushed across boundaries.",
            links: [
              { label: "Open Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/ooid/" }
            ]
          },
          {
            id: "scute",
            title: "scute (.scute)",
            year: "2026",
            tags: ["Voronoi seeds", "cellular loss"],
            blurb: "A warped Voronoi-cell image codec that constructs territory boundaries from scattered seed coordinates. Corruption deforms and buckles borders, causing surviving cell territories to aggressively annex missing space. Record order is intentionally not meaningful, making shuffle operations external to the format grammar.",
            links: [
              { label: "Open Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/scute/" }
            ]
          },
          {
            id: "vermis",
            title: "vermis (.vermis)",
            year: "2026",
            tags: ["Hilbert thread", "flowing loss"],
            blurb: "A continuous space-filling Hilbert-thread image codec utilizing DPCM color deltas. The image is sampled along a Hilbert curve and repainted as one continuous filament instead of a square pixel grid. Corruption accumulates downstream, turning a damaged delta into a travelling stain, bruise, or phase shift through the body of the worm.",
            links: [
              { label: "Open Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/vermis/" }
            ]
          },
		  {
  id: "urumizuri",
  title: "urumizuri (.urumizuri)",
  year: "2026",
  tags: ["wet-state codec", "fluid databending"],
  blurb: "A wet-state snapshot codec that stores Bakezuri’s fluid ink bath as an uncompressed, byte-editable matrix of fixation states and pigment loads. Corruption acts on the material structure of the bath itself, producing shears, scars, dry gaps, channel faults, and other performable damage before the field is reopened in Bakezuri.",
  links: [
    { label: "Open Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/urumizuri/" }
  ]
},
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
  title: "Horn of Plenty",
  year: "2026",
  tags: ["audio texture synthesis", "acausal", "granular synthesis", "audio substrate", "hindcasts"],
  blurb: "Horn of Plenty is an audio texture synthesis tool that processes sound samples into longer textures. It stationarizes the sample, producing an even, statistical sound layer that can be sampled at any arbitrary length without noticeable looping.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/hindcasts/horn-of-plenty/" }
  ]
},
	{
  title: "Bakezuri / 化け摺り",
  year: "2026",
  tags: ["wet printing", "image separation", "suminagashi", "riso", "goopCodec"],
  blurb: "A browser-based wet-printing instrument that stages a sliding membrane between riso-style image separation and suminagashi-like ink-on-water flow.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/bakezuri/" },
    { label: "Open urumizuri Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/urumizuri/" }
  ]
},
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