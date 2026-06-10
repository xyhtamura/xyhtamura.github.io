# Portfolio Summary: seismocyte

**seismocyte** is an interactive, browser-based audio-visual instrument that translates real-time global tectonic activity into generative soundscapes and visual topography. By feeding live earthquake data from the USGS API into a custom physics and audio engine, it maps seismic magnitude and focal depth directly to a stereo field of mineral-differentiated friction voices, physical collisions, and fluid drift. Each cell in the field is assigned a mineral composition—iron oxide, oxidized copper, sulfur, ochre sediment, quartz, basalt—and that composition determines its timbre: composition is timbre the way tuning is morphology elsewhere in the cytophone collection. The result is a living geological interface—a digital tissue sample reacting autonomously to the grinding of the earth's crust.

## System Documentation: Tectonic Data Integration

The autonomous movement and generative audio in seismocyte are entirely driven by real-world seismic data. The application establishes a live link to the **United States Geological Survey (USGS) Earthquake Hazards Program API**, fetching recent tectonic events based on user-defined coordinates.

### The API Call

When a user enters a coordinate pair (e.g., 14.57, 121.06), the Seismic.fetch() method constructs a GET request to the USGS FDSN Event Web Service.

**Endpoint:**
https://earthquake.usgs.gov/fdsnws/event/1/query

**Query Parameters Used:**
  - **format=geojson**: Ensures the response is formatted as easily parsable JSON.
  - **latitude & longitude**: The focal point of the sensor array, defined by the user.
  - **maxradiuskm=2500**: Limits the search to a 2,500-kilometer radius around the target coordinates, capturing regional fault lines and tectonic plates.
  - **minmagnitude=4.0**: Filters out micro-tremors, ensuring the instrument only reacts to significant geological shifts.
  - **limit=40**: Retrieves the 40 most recent events matching the criteria.
  - **orderby=time**: Sorts the data chronologically.

### Data Parsing & Extraction

The USGS API returns a GeoJSON FeatureCollection. The Seismic module reverses this array to play the events back sequentially (from oldest to newest) and extracts three critical data points for each "shudder":

1.  **Magnitude (properties.mag):** The strength of the earthquake.
2.  **Focal Depth (geometry.coordinates[2]):** The depth of the earthquake's origin beneath the surface, measured in kilometers.
3.  **Location (properties.place):** The geographic text descriptor used for the UI status tag.

## System Documentation: Mineral Voice Synthesis

Each seismocyte is assigned one of six mineral compositions on creation, drawn from the same palette that governs its visual tint. The mineral determines the architecture of the cell's Web Audio voice—what kind of friction it produces when the earth moves it. All six voices share a common chassis (filtered noise, a sub-oscillator, and a sawtooth-driven crackle gate whose density tracks velocity and pressure), but each composition reconfigures that chassis into a distinct friction archetype:

  - **iron-oxide** — Dry, gritty scrape. Bandpass-filtered noise over a gated triangle sub, with the densest crackle duty cycle in the set. The baseline tearing voice.
  - **oxidized-copper** — Struck metal. Sparse gate bursts excite a bank of three high-Q bandpass resonators tuned to inharmonic ratios (1 / 2.76 / 5.4), which continue ringing after each impact—a modal afterimage of the collision.
  - **sulfur-deposit** — Brittle fizz. The noise filter sits far up the spectrum and the crackle runs fast and sparse: sparks rather than grind, with almost no low end.
  - **ochre-sediment** — Rolling rumble. A lowpass replaces the bandpass and the gate softens from a hard chop into a linear surge, so motion reads as dragging through wet sand. A continuous ungated sub murmurs underneath.
  - **quartz-vein** — Glassy shimmer. Two tonal partials at 4× and 6.02× the base frequency drift against each other under a slow detune LFO, over a faint high-Q noise bed—closer to bowed glass than to scraping.
  - **basalt-core** — Tectonic groan. A deep ungated sine sub at one-third of the base frequency, wobbled by slow frequency modulation. It breathes rather than crackles.

Base frequency derives from cell size with a per-cell jitter, so even two cells of identical mineral and similar mass never sit on the same pitch, and each cell's noise source starts at a randomized buffer offset to prevent phase-locking between voices. Every voice is routed through a stereo panner that continuously tracks the cell's horizontal position, so as quakes scatter bodies across the field, the ensemble spatializes with them.

### Engine Mapping

The extracted data directly manipulates both the 2D canvas physics and the Web Audio API synthesis engine.

  - **Magnitude → Tectonic Force (boost)**
    The magnitude dictates the kinetic energy injected into the system. A baseline 4.0 magnitude triggers a subtle, localized twitch. As the magnitude scales toward 7.0+, the force multiplies drastically, violently tearing the seismocytes apart and driving each voice's crackle density and friction envelope upward.

  - **Focal Depth → Resonant Frequency (depthModifier)**
    The depth of the quake shifts the entire resonant structure of each affected voice—filter centers, modal resonator banks, shimmer partials, and sub-oscillators alike. Shallow quakes maintain a higher, tearing register across the field. Deep-crust events (depths approaching 500km+) pull every mineral's spectrum downward in proportion: copper's ring darkens, quartz's shimmer drops, and basalt's groan descends into a heavy, bowel-shaking sub-bass.
