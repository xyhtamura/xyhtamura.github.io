# cytophone: weather documentation
## murmuration · stomata

---

### Data source

Both instruments pull from a single OpenWeatherMap call for Manila, PH. Four fields are used: `main.temp` (normalised over 20–40°C), `main.humidity` (0–100%), `wind.speed` (normalised over 0–12 m/s), and `weather[0].main` (condition string). *murmuration* refreshes every ten minutes and re-tints spores on each update. *stomata* fetches once on page load and does not refresh.

---

## murmuration

**Temperature → pitch register.** The frequency bounds for edge-collision pings sweep across Manila's typical temperature range. Cool conditions (~20°C) yield a lower, darker register (2.2–5.5 kHz); hot conditions (~40°C) push it higher and brighter (5–11 kHz).

**Humidity → reverb wetness.** The convolution shimmer reverb tracks relative humidity. Low RH returns a sparse, close sound (wet mix 0.25); high RH expands the tail significantly (wet mix 0.65). The slider reflects the weather-derived value on load and can be adjusted manually from there.

**Wind speed → flock physics.** Wind speed injects a directional force into the flocking simulation rather than generating a separate noise source. The force vector rotates slowly — one full revolution every ~2 minutes — at a magnitude of 0–0.15 per axis. Stronger winds produce more relative motion between agents, which raises the rate and energy of sonic collisions.

**Condition → timbre and ping articulation.**

| Condition | Oscillator | Decay | Ping rate |
|-----------|-----------|-------|-----------|
| Clear | sine or triangle | ×0.9 | ×0.8 |
| Clouds | random | ×1.0 | ×1.0 |
| Drizzle | sine | ×1.2 | ×1.2 |
| Rain | sine | ×1.6 | ×1.4 |
| Thunderstorm | sawtooth | ×0.6 | ×0.7 |
| Haze | triangle | ×1.1 | ×0.9 |
| Fog | sine | ×2.0 | ×0.6 |
| Mist | sine | ×2.2 | ×0.6 |

Rain increases both sustain and event density. Mist and fog produce long diffuse sine pings at low density. Thunderstorm gives sparse, short, spectrally harsh bursts.

**Condition → spore colour.** Spore and web hues cluster around condition-specific centres. On each ten-minute refresh, existing hues blend 50% toward the new palette, so colour shifts are gradual rather than instantaneous.

| Condition | Hue centre | Spread |
|-----------|-----------|--------|
| Clear | warm gold (42°) | ±15° |
| Clouds | cool silver (205°) | ±28° |
| Drizzle / Rain | blue-green (195–205°) | ±18–20° |
| Thunderstorm | deep purple (270°) | ±25° |
| Mist / Fog | lavender (220–240°) | ±28–30° |
| Haze / Smoke | amber-ochre (32–38°) | ±15–20° |

---

## stomata

**Temperature → pitch register.** Each pore's fundamental is `f0 = clamp(1200 / r, 120, 680) × pitchMult`, where `pitchMult` spans 0.75 to 1.35 across 20–40°C. The multiplier propagates through the entire voice: noise filter centres, bandpass targets, oscillator frequencies, and flute pitch all scale together.

**Humidity → duration, reverb, and room presence.** Three parameters track humidity in parallel. Exhale duration multiplier spans 0.8× (dry) to 1.5× (saturated) — humid air makes each breath hang longer. Reverb wet mix moves from 0.22 to 0.52. A continuous very-low-amplitude ambient presence layer (filtered noise routed through the master chain, providing room texture in silence) scales its gain from 0.003 to 0.011 and shifts its centre frequency upward with humidity.

**Wind speed → idle breath rate.** `idleIntervalMult` spans 1.3 (calm) to 0.45 (strong). This scalar applies to both the main idle breath timer (interval `rnd(0.6, 2.4) × mult`) and the micro-breath timer (interval `rnd(0.22, 0.65) × mult`). At high wind the instrument breathes noticeably faster even without interaction; at low wind it settles into slower cycles.

**Condition → amplitude and duration character.**

| Condition | Amplitude | Duration |
|-----------|-----------|----------|
| Clear | ×1.0 | ×0.85 |
| Clouds | ×1.0 | ×1.0 |
| Drizzle | ×0.85 | ×1.2 |
| Rain | ×0.9 | ×1.35 |
| Thunderstorm | ×1.25 | ×0.65 |
| Haze | ×0.9 | ×1.05 |
| Fog | ×0.65 | ×1.7 |
| Mist | ×0.7 | ×1.65 |

The combined duration multiplier (`durMult × condDurMult`) is clamped at 2.2× to keep voice activity reasonable.

---

## Portfolio

**cytophone: murmuration** — A browser instrument in which 180 flocking agents generate sound through proximity and relative velocity: collisions between neighbours trigger brief pitched oscillator pings, accumulating into a sparse, shimmering network of clicks and resonance. Continuously tuned to Manila's live weather, the instrument's character shifts with atmospheric conditions — temperature lifts or lowers the pitch register, humidity expands the reverb tail, and wind speed physically drives the flock, increasing sonic activity as real-world pressure builds. The visual field, spore hues clustering by condition, records the same data as a kind of chromatic index.

**cytophone: stomata** — A pressure-sensitive aerophone built from an ecology of pore-like entities, each sized, tuned, and biased independently, producing breath sounds through exhalation events shaped by aperture, applied pressure, and individual acoustic character. The instrument breathes when left alone: micro-puffs and inhales with randomised sub-register pitch sustain the field without interaction, the rate of autonomous breathing governed by Manila's wind speed at load time. Temperature scales every pore's pitch proportionally, humidity makes exhalations linger and thickens the room presence, and atmospheric condition adjusts the overall weight and duration of each breath.
