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
      id: "cutline",
      title: "CUTLINE",
      year: "2026",
      tags: ["intermedia", "generative poetry", "electronic literature", "live collage"],
      blurb: "An open generative poetry deck assembled live from outside language. Each draw queries keyless sources, cuts retrieved fragments into a poem, builds a collage from public image searches, and returns its synthesized title to the deck; operator cards can replace, reinterpret, return, mash, or skip cards in the reading.",
      links: [
        { label: "Open Deck", url: "https://xyhtamura.github.io/cutline/" }
      ]
    }
  },
{
    kind: "piece",
    piece: {
      id: "plica",
      title: "plica",
      year: "2026",
      tags: ["intermedia", "games", "electronic literature", "generative collage", "interactive web"],
      blurb: "plica is an interactive generative collage built as an indefinitely unfolding sheet of paper. An artist-curated bank of themes and language seeds live searches for text and images, which are combined with procedural graphics, typography, blank space, and transformative effects. These are pulled from keyless public APIs (Wikipedia, Datamuse, PoetryDB, and Wikimedia Commons).",
      links: [
        { label: "Launch App", url: "https://xyhtamura.github.io/plica/" }
      ]
    }
  },
{
    kind: "piece",
    piece: {
      id: "ombak-lock",
      title: "Ombak Lock",
      year: "2026",
      tags: ["intermedia", "games", "acoustic puzzle", "sound art", "web audio"],
      blurb: "An acoustic tuning puzzle game picked by ear, where zero-beat is failure. Grounded in Balinese gamelan's ombak (paired tuning where nominal unison shimmers with cultivated beating), the player must match target beat rates and depth across three multi-tone tumblers without allowing any two frequencies to reach unison.",
      links: [
        { label: "Launch Game", url: "https://xyhtamura.github.io/ombak-lock/" }
      ]
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
      blurb: "A physical and browser poem that isolates the commas in José García Villa’s “I, it, was, that, saw,” and transfers their coordinates through a stencil into mung bean sprouts on black gulaman. The germinating punctuation turns Villa’s cultivatory image into a temporary domestic response to agricultural and water anxiety around the developing 2026 El Niño; the interface lets readers fade between the source punctuation and its living transfer.",
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
      blurb: "An intermedia suite linking electronic literature, experimental pop, videopoetry, web art, performance scores, and simulations through a decentralized hypertext. Its shore is the present: a boundary where personal, ancestral, geological, virtual, remembered, and speculative times remain adjacent but inaccessible to one another. Individual works use that structure to test how identity and inheritance are assembled across incompatible media and temporal scales.",
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
            blurb: "A score for four performers, designated as guests, inside an empty house. Frying an egg, turning encyclopedia pages, listening at doors, and cooing into rooms organize domestic actions into a quiet, distributed soundscape.",
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
      blurb: "An interactive literature collection organized as a periodic table of the seven metalloids. Each element’s physical and chemical properties constrain a different work—New Weird fiction, body horror, kinetic poetry, science writing, nonfiction, or prose poetry—about objects including termite symbiosis, programmable skin, undersea cables, metallic wolves, and radioactive decay.",
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
      blurb: "A short film and videopoem made with Bea Mariano, accompanied by my live score. It stitches the wreck of the USS Samuel B. Roberts, Manila construction sites, archival photographs, handwashing footage, microorganisms, and ocean imagery to examine how American military history remains embedded in Philippine development. The title connects cargo records, apparitions, futures made material, and manifest destiny; construction workers rotated sideways become divers moving through the same Pacific archive.",
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
      blurb: "A browser-based poem, art game, and ASCII terrarium set on a nocturnal balcony above an impossible city. WASD movement, inspectable textual specimens, movable objects, randomized vistas, changing weather, and a reactive sound engine make the terminal window behave as a small ecology.",
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
      blurb: "A physical gelatin poem and an interactive browser counterpart. Four clear gel strata suspend fragments of cut-up documents so depth determines which texts remain legible; the interface models the same block and lets readers change its virtual cut depth to expose lower layers.",
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
      blurb: "A hypertext collage poem whose images and text fragments link outward to academic papers, public-domain archives, found media, recordings, forums, discarded materials, and commercial packaging. Citation is both structure and subject: the linked fragments model identity as an arrangement of references shaped by academia, plastics, capitalism, globalization, and ecological crisis.",
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
      blurb: "An ongoing suite of electronic literature, videopoetry, docupoetry, and web art about the afterlives of disaster from a Filipino-Japanese perspective. The 1990 Luzon earthquake, 2011 Tōhoku earthquake, and 2020 Taal eruption organize works about the post-Marcos state, Japan’s Lost Decades, the pandemic-era internet, family memory, and inherited trauma. Browser poems, movable windows, archival video, blackout editing, and Windows XP interfaces make each geological rupture a point from which different historical times are read.",
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
      blurb: "A web-based poetic sequence about body porosity in the 2000s Philippines. A Filipino-Japanese neuroqueer speaker conducts television, dial-up internet, typhoons, political unrest, language, ghosts, floods, and voltage; electricity links nervous sensation to infrastructure, weather, media, and empire.",
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
      blurb: "Three textual-visual works combining hand and digital drawing, maps, diagrams, manipulated photographs, poetry, prose, and asemic writing. Police diagrams, scrapbooks, and hand-drawn cartography supply formats for recording disappearance through traces and uncertainty without converting it into death or recovery.",
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
      blurb: "A vaporwave listening and social gathering hosted by Mono by Phono, using archival sound, image, fashion, commercials, and film footage to organize programs around Philippine cultural memory. Sets move among 1990s OPM, 1980s ballads, Martial Law-era disco, Manila Sound, film soundtracks, and folk songs. The project later became Piyesta Plaza 1985–1995 Airwaves, an album and live audiovisual performance about Philippine pop culture, People Power and its aftermath, and the early-1990s earthquakes.",
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
        id: "cutline",
        title: "CUTLINE",
        year: "2026",
        blurb: "An open generative poetry deck assembled live from outside language. Each draw queries keyless sources, cuts retrieved fragments into a poem, builds a collage from public image searches, and returns its synthesized title to the deck; operator cards can replace, reinterpret, return, mash, or skip cards in the reading.",
        tags: ["generative poetry", "electronic literature", "live collage"],
        links: [
          { label: "Open Deck", url: "https://xyhtamura.github.io/cutline/" }
        ]
      },
      {
        title: "Chanidae",
        year: "2025",
        blurb: "A web-based slide poem presented through animated text fragments, blue gradients, and subtitle-like placement. Arrow, swipe, and keyboard navigation pace the text across screens associated with water, depth, and disappearance.",
        tags: ["web-based", "slide poem", "electronic literature"]
      },
      {
        title: "LOVE-LETTER-FOR-YOU.TXT",
        year: "2025",
        blurb: "An algorithmic poem based on the ILOVEYOU virus, written through its creator's imagined persona and a postcolonial account of internet access and desire. Its words are replaced one by one with ILOVEYOU until the phrase overtakes the text and the poem performs its own viral collapse.",
        tags: ["algorithmic poem", "electronic literature", "generative text"]
      },
      {
        title: "breakfast",
        year: "2025",
        blurb: "A lo-fi spoken-word poem recorded on a phone during an early-morning walk. Breath, footsteps, and traffic hold together a roadside animal death and an eroticized approaching runner, placing observation, fantasy, desire, violence, and complicity in the same field recording.",
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
        blurb: "An interactive web timeline and timekeeper presenting a Filipino adaptation of the Japanese 72 microseasons (七十二候).",
        tags: ["interactive timeline", "web", "generative"]
      },
	  {
        title: "KuboCities",
        year: "2025",
        blurb: "An interactive GeoCities-style poem using GIFs, guestbooks, CRT glitches, and Web 1.0 layouts to archive millennial Manila. References to the EDSA revolts, pirated software, postcolonial technology, and urban mythology treat the early web as both personal memory and historical interface; visitor submissions can alter the archive.",
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
      blurb: "A six-track synthpop and vaporpop EP made with Brazilian artist MASM, combining industrial music, bossa nova, trap EDM, eurodance, R&B, and minimalism through deliberately degraded playback. I co-wrote, sang, produced, mixed, mastered, and designed the album art, combining 3D and vector graphics with paper, VHS, and digital damage.",
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
        id: "desiderata",
        title: "Desiderata",
        year: "2026",
        blurb: "Drone ambient made purely from manipulated voice and breath. Microtonally vocoded with oceans and insects, layered, stretched, recorded in odd places, and sampled (including speech synthesis) to produce a cyborg flesh-scape.",
        tags: ["Drone Ambient", "Vocal Synthesis", "Album"],
        links: [
          { label: "Bandcamp", url: "https://xyhtamura.bandcamp.com/album/desiderata" }
        ]
      },
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
        blurb: "A meterless song built from multiplied harp recordings, granular synthesis, ocean field sound, and a voice that distorts into the instrumental field. The siren is treated as a digitally mediated voice whose source cannot be separated from its transmission.",
        tags: ["Experimental", "Granular Synthesis"]
      },
      {
        title: "Know Me Do",
        year: "2012–2018",
        blurb: "An IDM-pop song combining synthesized kicks, household recordings, musique concrète edits, soft distortion, and a hybrid acoustic-electronic plucked instrument. Its blabber-like lyrics place surveillance inside an unstable field of digital and analog sound objects.",
        tags: ["IDM Pop", "Musique Concrète"]
      },
      {
        title: "Hyacinth",
        year: "2012–2018",
        blurb: "A total-serial song setting a shrill head-voice melody against a repeating synthesizer loop in 7/4.",
        tags: ["Total Serialism", "Experimental"]
      },
      {
        title: "PT01 (Perihelion)",
        year: "2012–2018",
        blurb: "A short singer-songwriter piece in which a square-wave-like synthesizer and programmed beat take the accompanying roles usually assigned to guitar and drum kit.",
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
      blurb: "An experimental play set in a pandemic-era biopsy room where three forgotten tumors—Glioblastoma, Meningioma, and Hematoma—become conscious and perform the roles of doctors, patients, administrators, and staff. Their biomass grows into a hospital of flesh, wires, mold, and paperwork; medical realism, bureaucratic absurdity, and body horror model how care, debt, migration, and public health assign people to institutional roles.",
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
      id: "stanzuary",
      title: "Stanzuary",
      year: "2026",
      tags: ["3D text editor", "spatial writing", "Tabota", "PNG export"],
      blurb: "A browser-based 3D text editor for writing and arranging text as spatial objects. Users can style fragments and move, rotate, or extrude them in three dimensions, then export the view as a transparent PNG or exchange the scene as Stanzuary JSON or portable .tabota events.",
      links: [
        { label: "Launch Editor", url: "https://xyhtamura.github.io/stanzuary/" }
      ]
    }
  },
  {
    kind: "piece",
    piece: {
      id: "w2xdx",
      title: "W2XDX",
      year: "2026",
      tags: ["experimental television", "space-filling curves", "multipath channel", "signal receiver"],
      blurb: "An experimental television instrument that threads a luminance field along six space-filling scan curves, transmits the resulting waveform through a phenomenological multipath atmosphere, then recovers sync and reconstructs the picture. The same delayed echo becomes a raster ghost, Hilbert blur, or scattered snow because each standard maps one-dimensional signal time to two-dimensional space differently.",
      links: [
        { label: "Launch Receiver", url: "https://xyhtamura.github.io/w2xdx/" }
      ]
    }
  },
{
  title: "Moire",
  year: "2026",
  tags: ["phase modulation", "synthesizer", "audio worklet", "mathematical grammar", "live codegen"],
  blurb: "A phase-modulation synthesizer that replaces box-and-wire algorithm charts with live equations, arbitrary operator graphs, feedback loops, continuous drift, and non-integer ratios.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/moire" }
  ]
},
{
  kind: "piece",
  piece: {
    id: "driftham",
    title: "DriftHam",
    year: "2026",
    tags: ["internet radio", "generative listening", "browser-native", "radio-browser", "listening toy"],
    blurb: "An internet-radio drift device that moves through live stations from the Radio Browser database, holding each for a randomized interval before crossfading or cutting onward. Listeners can hold or skip stations, annotate favorites, and export the session as a plain-text tasting log.",
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
blurb: "An event-domain granular MIDI generator. Each input note remains as a pinned anchor while density, spread, profile, velocity jitter, and seed controls generate a reproducible cloud around it for drums or pitched instruments.",
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
      blurb: "A post-MIDI composition tool and JSON notation for microtonal, polymetric, and time-based media. Its editors draw held tones, glides, pitch contours, and voice assignments; Cycla builds recursive subdivision grammars and exports .cyc time maps. TaboTa translates among beats, seconds, unordered cues, frequencies, categories, and instructions: where .scl files tune pitch, .cyc files tune time.",
      links: [
        { label: "Launch Instrument", url: "https://xyhtamura.github.io/tabota/" }
      ]
    }
  },
  {
    kind: "set",
    main: {
      id: "hindcasts",
      title: "Hindcasts",
      year: "2025–2026→",
      tags: ["Software Suite", "Acausal DSP", "Un-live Effects"],
      blurb: "A suite of offline audio and video effects that process a static file as a complete span. Whole-file access allows an effect to respond before an event, filter in both temporal directions, measure across passes, and optimize against the file's full distribution.",
      media: [{ type: "image", src: "../card/hindcasts.png", label: "Hindcasts index causality readout display" }]
    },
    pieces: [
      {
        title: "Metachamber",
        year: "2026",
        tags: ["gap-aware reverb", "acausal decay", "envelope follower", "masking credit", "offline WAV bounce"],
        blurb: "An offline reverb that maps each event's release-to-next-onset gap, then fits or ducks its tail to the available span. The next event's level supplies masking credit, so inaudible spill need not be suppressed."
      },
      {
        title: "Pythia",
        year: "2025–2026",
        tags: ["acausal granular delay", "sidechain lookahead", "BPM sync", "pitch & pan spray", "offline WAV bounce"],
        blurb: "An acausal granular delay and sidechain processor that reads both files before rendering. A control signal supplies a future amplitude envelope; a source signal supplies pristine taps or grains, with negative delay, lookahead ducking, tempo-synced time, feedback, pitch, and pan controls."
      },
      {
        title: "Sounder",
        year: "2025",
        tags: ["un-live compressor", "depth · dynamics", "web audio"],
        blurb: "An offline dynamics processor that measures the file's amplitude distribution and maps it to a drawn transfer curve. The RMS window moves continuously from sample-level waveshaping to whole-file normalization."
      },
      {
        title: "Prolepsis",
        year: "2026",
        tags: ["acausal feedback field", "video processing", "framesmear"],
        blurb: "A video feedback field computed across a complete clip. Future and past frames can feed the current frame, producing trails before events and symmetric zero-phase wakes; rendered frames are cached for immediate scrubbing."
      }
    ]
  },
{
    kind: "set",
    main: {
      title: "Sgueltch",
      year: "2025",
      tags: ["Software Suite", "Aesthetic Philosophy", "Tool Design"],
      blurb: "A software suite built on the observation that digital errors inherit the geometry of the systems that fail. Its tools replace raster rows, codec blocks, and fixed glyph metrics with blobs, Voronoi territories, filaments, wet fields, or independent vectors, so corruption can seep, spread, and decay.",
      media: [{ type: "placeholder", label: "Sgueltch Visuals" }]
    },
    pieces: [
      {
        title: "Gurgulator",
        year: "2025",
        tags: ["Granular Resynthesis", "Web Audio"],
        blurb: "A browser-based granular resynthesizer tuned for gurgling sounds. It turns a loaded sample into irregular pitch bends, time warps, overlapping bursts, and filter movement, then feeds the result through convolution reverb.",
      },
      {
        title: "Pixel Lesions",
        year: "2025",
        tags: ["Image Processing", "Pixel Sorting"],
        blurb: "Pixel sorting confined to expanding lichen-, mycelium-, dendrite-, or slime-mold-shaped regions. Growth topology replaces the raster row or column as the sorting path.",
      },
      {
        title: "SiltCRT",
        year: "2025",
        tags: ["Shader Tool", "Interactive Image"],
        blurb: "A shader that replaces the regular RGB-triad lattice with silt cells, Gaussian bodies, or weighted Voronoi territories; a block grid remains as a control. Geometry and signal memory vary independently, combining dry refresh, remanence, or advected wet feedback with turbulence, chromatic bleed, Kawase bloom, and subtractive Umbra.",
      },
	        {
        title: "TypeBojangler",
        year: "2025",
        tags: ["typography", "SVG tool", "organic noise", "generative graphics"],
        blurb: "A text renderer that treats each character as an independently perturbed vector object. Seeded controls vary size, rotation, spacing, baseline, color, opacity, blur, breathing, and chromatic ghosts; users can load OTF or TTF fonts and export SVG or PNG.",
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
      blurb: "Browser-based codecs and native file formats built for databending. Ooid stores Gaussian blobs, Scute stores Voronoi territories, Vermis stores samples along a Hilbert filament, and Urumizuri stores a wet-state ink matrix; byte or text edits therefore deform those structures instead of exposing a conventional raster or block codec.",
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
	  title: "Benzaiten",
	  year: "2026",
	  tags: ["video synthesiser", "WebGL", "GPGPU", "fluid simulation", "Navier-Stokes", "magnetohydrodynamics", "audio-responsive"],
	  blurb: "Benzaiten is a video synthesiser driven by a fluid simulation. A 2D incompressible fluid runs on a 256×256 grid in WebGL every frame — semi-Lagrangian advection, a curl-noise stirring force, and a pressure projection — and its velocity field is what warps the image. Nothing is pre-rendered. The picture is the state of the simulation, read out as colour. Five regimes change what is being solved. Domain warp uses layered noise and runs no simulation at all. Navier-Stokes and viscoelastic run the fluid with different responses to shear. The two magnetohydrodynamic regimes evolve a magnetic vector potential under induction — carried by the flow, spread by resistivity — and feed the Lorentz force back into the fluid, so current sheets build and tear. A magnetic injection control sets how hard the field is re-fed; at zero it is a closed system and decays, which is what a two-dimensional magnetic field has to do. Three substrates take the flow: a procedural eight-stop colour field, uploaded media (images, looping video, live webcam), and a gradient map that colours media contours by the velocity field. Dragging stirs momentum into the fluid, two fingers open a sink or a source, and audio can drive vorticity, convection rate, and hue on separate frequency bands. The physics is here to make images, not to model the sun: a cross-sectional plane, incompressible, with the idealisations named in the project's notes rather than smoothed over. Benzaiten began as Hadean Flare, which replaced the static sun with a mutating one, and generalised from that sun to flow. Includes Ganymede, a WebGL image-warping tool with animated noise fields and audio reactivity.",
	  links: [
	    { label: "Launch Instrument", url: "https://xyhtamura.github.io/benzaiten/" },
	    { label: "Ganymede", url: "https://xyhtamura.github.io/ganymede" }
	  ]
	},
	{
	  title: "Aeropane",
	  year: "2026",
	  tags: ["frosted glass", "light scattering", "gel physics", "WebGL progressive render", "Frutiger Aero"],
      blurb: "A WebGL simulator of light passing through frosted, fluted, or hammered glass. A progressive slice renderer combines height-map normals, distance-dependent blur, Fresnel reflection, and Beer–Lambert absorption; a Frutiger Aero interface exposes the optical model.",
	  links: [
	    { label: "Launch App", url: "https://xyhtamura.github.io/aeropane/" }
	  ]
	},
	{
	  title: "kíkik",
	  year: "2026",
	  tags: ["swarm dequantizer", "audio onset analyzer", "hit-seeded granulator", "MIDI generator"],
	  blurb: "A swarm dequantizer, audio onset analyzer, and hit-seeded event/sound granulator. Derived from field recordings of Platypleura fulvigera (cicada), the tool detects micro-peaks to extract a found score, which simultaneously feeds a swarm of MIDI notes (mapping spectral centroids to pitch) and a granulation engine (rendering voice/poem files at the recording's pace), maintaining deterministic playback from a stable seed.",
	  links: [
	    { label: "Launch App", url: "https://xyhtamura.github.io/kikik/" }
	  ]
	},
	{
	  title: "DHuenut",
	  year: "2026",
	  tags: ["color theory", "hue-vs-hue curve", "circle maps", "torus projection", "WebGL image processor"],
	  blurb: "A hue-remapping editor that models color transforms as circle maps S¹ → S¹ on a torus. A spline with winding-degree controls drives HSL or OKLCH remapping; the tool visualizes the map on a projected torus and exports a 3D LUT.",
	  links: [
	    { label: "Launch App", url: "https://xyhtamura.github.io/dhuenut/" }
	  ]
	},
	{
	  title: "Gliese",
	  year: "2026",
	  tags: ["planetary acoustics", "multi-tap delay", "ray tracing", "offline convolution", "web audio"],
	  blurb: "A multi-tap delay and reverb generator that derives tap times by ray-tracing sound through a spherically symmetric graded-index atmospheric channel. Users draft trajectories, inspect a 3D wavefront, and convolve stereo audio offline with the resulting tap set.",
	  links: [
	    { label: "Launch App", url: "https://xyhtamura.github.io/gliese/" }
	  ]
	},
	{
  title: "Remanence",
  year: "2026",
  tags: ["audio processing", "video processing", "acausal rendering", "tape print-through", "hindcasts"],
  blurb: "A model of magnetic print-through for audio and video. Mapping a complete clip onto a wound reel lets adjacent wraps exchange amplitude or image content, producing pre-echo, post-echo, drift, wear, and VHS bleed with WAV or WebM export.",
  links: [
    { label: "Launch App", url: "https://xyhtamura.github.io/hindcasts/remanence/" }
  ]
},
	{
  title: "CyberScotoma",
  year: "2026",
  tags: ["video processing", "datamosh", "acausal rendering", "voronoi", "motion estimation"],
  blurb: "A video effect in which noised Voronoi regions stop refreshing their source pixels, continue to advect under optical flow, and accept content from a later frame or a second clip. This combines the visual-field shape of a scintillating scotoma with acausal, non-macroblock datamosh.",
  links: [
    { label: "Launch App", url: "https://xyhtamura.github.io/sgueltch/cyberscotoma/" }
  ]
},
	{
  title: "Put Many Pictures Together",
  year: "2026",
  tags: ["image utilities", "layout tools", "html5 canvas", "client-side", "responsive design"],
  blurb: "A drag-and-drop tool for arranging images into justified rows, grids, columns, or freeform collages, then copying the result or exporting a high-resolution layout.",
  links: [
    { label: "Launch App", url: "https://xyhtamura.github.io/putmanypicturestogether" }
  ]
},
	{
  title: "Cella",
  year: "2026",
  tags: ["additive synthesis", "resonator bank", "audio worklet", "spectral math", "microtonal"],
  blurb: "A resonant additive synthesizer that maps custom equations onto a noise-driven resonator bank, with painted partials, Gaussian, Lorentzian, or Voigt spectral distributions, microtonal macro-detuning, and offline WAV rendering.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/cella/" },
    { label: "Open Document", url: "https://xyhtamura.github.io/cella/README.md" }
  ]
},
	{
  title: "aliquoto",
  year: "2026",
  tags: ["additive synthesis", "acausal grammar", "audio worklet", "spectral math", "hindcasts"],
  blurb: "A pure additive synthesizer for writing spectral series as summations, envelopes, and conditionals. Its offline equation parser and phase-exact AudioWorklet support fractional, irrational, subharmonic, and drift-modulated partial ratios.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/aliquoto/" },
    { label: "Open Document", url: "https://xyhtamura.github.io/hindcasts/aliquoto/README.md" }
  ]
},
	{
  title: "Horn of Plenty",
  year: "2026",
  tags: ["audio texture synthesis", "acausal", "granular synthesis", "audio substrate", "hindcasts"],
  blurb: "A stationarizer that analyzes a finite sound, redistributes selected grains across time, and renders a statistically even texture long enough to sample without an audible loop.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/hindcasts/horn-of-plenty/" }
  ]
},
	{
  title: "Bakezuri / 化け摺り",
  year: "2026",
  tags: ["wet printing", "image separation", "suminagashi", "riso", "goopCodec"],
  blurb: "A wet-print simulator that deposits quantized image separations into a shared field modeled on risograph printing and suminagashi. Inks bleed, repel, fix, and misregister; .bakezuri stores the process recipe, while .urumizuri exposes the wet-state matrix for databending.",
  links: [
    { label: "Launch Instrument", url: "https://xyhtamura.github.io/bakezuri/" },
    { label: "Open urumizuri Codec", url: "https://xyhtamura.github.io/sgueltch/goopCodecs/urumizuri/" }
  ]
},
      {
        title: "Cytophone",
        year: "2026",
        tags: ["web audio", "modal synthesis", "physical modeling", "generative instrument"],
        blurb: "A family of browser instruments in which animated 2D bodies are both interface and sound source. Size, geometry, motion, contact, pressure, tension, or environmental data control each instrument's synthesis and spatialization; users play them by seeding, striking, bowing, plucking, dragging, or disturbing the simulated ecology.",
        links: [
          { label: "Launch Instrument", url: "https://xyhtamura.github.io/cytophone/" }
        ]
      },
      {
        title: "Glossolalia",
        year: "2026",
        tags: ["formant synthesis", "vocal tract model", "experimental interface", "web art"],
        blurb: "A browser-based formant-synthesis instrument in which drifting IPA glyphs act as sounding bodies. Position in vowel space controls a vocal-tract model that produces speech-like syllables without resolving into language.",
        links: [
          { label: "In Vitro", url: "https://xyhtamura.github.io/glossolalia-invitro.html" },
          { label: "Rabble", url: "https://xyhtamura.github.io/glossolalia-rabble.html" }
        ]
      },
      {
        title: "FrameSmear",
        year: "2025→",
        tags: ["video processing", "feedback engine", "web tool", "glitch art"],
        blurb: "A browser-based video feedback processor for frame accumulation, motion smear, and video reverb. Controls govern memory decay, opacity, drift, zoom, rotation, chromatic split, edge inscription, brightness persistence, and softening; results can be previewed, captured, or exported.",
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
        blurb: "A browser and Windows utility that concatenates files into one searchable .txt while preserving each source path, size, type, and delimiter.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/stitcher/" }
        ]
      },
      {
        title: "Electropond",
        year: "2026",
        tags: ["FM synthesis", "physics engine", "microtonal", "visual music"],
        blurb: "A browser instrument in which moving plankton drive FM synthesis through color, collisions, and rippling microtonal fields.",
        links: [
          { label: "Launch Instrument", url: "https://xyhtamura.github.io/electropond.html" }
        ]
      },
      {
        title: "Critterances",
        year: "2026",
        tags: ["procedural audio", "interaction audio", "creature design", "web audio"],
        blurb: "A procedural sound engine that generates chirps, murmurs, droplets, and filtered grains for imaginary creatures. It maps robot states such as thinking, transcribing, and crafting to distinct vocal behaviors, and also runs as a standalone browser toy.",
        links: [
          { label: "Launch App", url: "https://xyhtamura.github.io/critterances/" }
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
      blurb: "A narrative animation score combining gongs, bamboo instruments, and guitars with a contemporary orchestral and electronic soundtrack palette.",
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
      blurb: "An autotheoretical essay arguing that haunting is produced jointly by cultural memory and technical mediation. Filipino multo, Japanese yūrei, vaporwave, Hiroshima, U.S.–Philippine colonial memory, and Ringu show ghosts taking form through specific bodies, rituals, media systems, infrastructures, and habits of recognition; hauntotechnics names that mutual modification."
    },
    {
      id: "practice-sharing-iii",
      title: "Practice Sharing III",
      year: "2026",
      tags: ["artistic research"],
      blurb: "A practice sharing on treating language as material shaped by bodies, histories, interfaces, and modalities. Examples from web literature, code, sound poetry, installation, and performance scores trace my shift from using media to present language toward using each medium as a compositional system that changes it.",
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
      blurb: "A paper analyzing artificial interaction partners through the social roles they already perform rather than as containers of hidden consciousness. AIBO, android Buddhist figures, companion robots, and LLMs show personhood emerging through communicative affordances involving affect, ritual, kinship, and care; the cases are drawn from Japanese robotics and relational accounts of personhood."
    },
    {
      id: "commitments-of-physical-modeling",
      title: "The Commitments of Physical Modeling: Timbre, Mediation, and Virtual Instrument Construction",
      year: "2026",
      tags: ["Timbre Studies"],
      blurb: "A paper arguing that physical modeling does not recover a fixed timbre from mechanism. Virtual instruments construct timbral identity by selecting materials, mediation, acoustic space, bodily cues, and assumed listening competencies; each design therefore commits to a particular account of what the instrument is and which parts of its sound matter.",
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
      blurb: "A paper treating dungeon synth as mediated world-building rather than a revival of medieval music. Its synthetic medievalism is assembled from Norwegian black metal, American and Japanese game music, early MIDI and sound chips, fantasy literature, tabletop games, zines, pixel art, and online genre formation; the genre returns to late-twentieth-century media that had already converted the medieval into fantasy."
    },
    {
      id: "night-bus-intermedia-musicopoetics",
      title: "Intermedia Musicopoetics and Transpractice Songwriting in “Night Bus”",
      year: "2026",
      tags: ["music composition"],
      blurb: "A presentation analyzing Night Bus as an intermedia song within Of Another Shore. Enjambed sung lines, asemic vocality, timbre, polytonality, ostinato, and electronic processing connect songwriting to poetic practice; references to soliranin and indolanin move rowing and work-song rhythms into urban transit without claiming to reconstruct unrecorded historical forms.",
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
      blurb: "A study of relational accounts of emotion and personhood through Tagalog concepts of loób and kapwa as theorized largely in Metro Manila, participant interviews, literary analysis, and autoethnography. It does not treat these terms as a national Filipino ontology: Hiligaynon, for example, has no direct equivalent of kapwa. Cases involving hiyâ, kilíg, and húgot test how feeling crosses language, ethical judgment, social expectation, perception, and performance.",
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
