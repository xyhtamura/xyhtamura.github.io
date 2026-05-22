const PORTFOLIO = {
  name: "Xyh Tamura",
  sections: [
    { id: "intermedia", label: "Intermedia"},
	{ id: "music", label: "music" }
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
      links: []
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
          venue: "WHYNoT",
          event: "On the Verge",
          year: "2025"
        },
        {
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
  // 4. SECTION: MUSIC
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
        { type: "placeholder", label: "Album Cover / Audio" }
      ],
      blurb: "A collaboration with Brazilian artist MASM. This is a synthpop and vaporpop 6-track EP. Besides these genres, it takes influences from industrial music, bossa nova, trap EDM, eurodance, R&B, and minimalist music. It was mixed to have the sensation of being listened through an old device. It explores ideas of memories and the haunting of the past, as well as the inevitable change, development, and decay of reality. Also was the album artist for this incorporating 3d graphics, vector graphics, mixing different types of technological degradation such as glitch, paper, and vhs. draws on glowing 80's neon on black screen imagery as well as spray painted high color movie posters.",
      links: []
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
      blurb: "Roles: Music composer & performer. Transitional music for concert composed from non-human nature sounds such as star recordings, animal sounds, earth and ice sounds, and thunder. Includes live performance with a custom-made glass harmonica.",
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
  // SECTION: SGUELTCH SUITE
  // --------------------------------------------------
  {
    kind: "piece",
    piece: {
      title: "Sgueltch",
      year: "2025",
      tags: ["Aesthetic Philosophy", "Software Suite", "Glitch Art"],
      media: [
        { type: "placeholder", label: "Sgueltch Overview / Visuals" }
      ],
      blurb: "Sgueltch, a word between squelch and glitch, is both an aesthetic philosophy and a software suite. It proposes a shift in digital aesthetics away from traditional glitch art’s rigid, pixelated, grid-bound, and mechanical disruptions toward organic, fluid, and biologically inflected distortions. Rather than treating glitch as the natural look of the digital, Sgueltch argues that conventional glitch mainly reveals the dominant abstractions underlying many computational systems: grids, blocks, lines, harmonic regularity, and schematic repetition. In response, Sgueltch develops alternative computational substrates drawn from material processes such as fluid flow, growth, diffusion, viscosity, and bodily transformation, as well as from less predictable abstract logics. Its glitches ooze, breathe, spread, stain, and mutate, foregrounding asymmetry, unpredictability, embodiment, and collaboration between human and nonhuman agencies. In this sense, Sgueltch is not simply about making glitch softer or more organic-looking; it is about rethinking what digital systems can become when they begin from other material and conceptual foundations. It takes the mechanics and aesthetics of glitch and moves them from rigidity toward living, symbiotic, ecological transformation.",
      links: []
    }
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
      }
    ]
  },
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