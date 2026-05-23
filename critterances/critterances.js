// ─────────────────────────────────────────────────────────────────────────────
//  Iris Sound Engine  ·  Sgueltch Edition
//  A procedural creature-state synth. Part of the Sgueltch suite (2025).
//
//  Sgueltch moves digital aesthetics away from rigid, grid-bound, mechanical
//  disruption toward organic, fluid, biologically inflected distortion.
//  Glitches here ooze, breathe, spread, stain, and mutate.
//
//  Sound architecture
//  ──────────────────
//  Four grain types form the metabolic vocabulary:
//
//    click  — ultra-fast filter-sweep transient (pitch-drop osc + bandpass
//             noise burst). Like a snare flam or insect tap, scaled to creature size.
//             Can produce a "flam" (two micro-clicks in quick succession).
//             Dominates transcribing and crafting states.
//
//    kick   — low-body thump grain with a closed→open→closed lowpass envelope.
//             The cutoff begins ultra-low, snaps open in 5–20ms, then falls shut.
//             This is the classic kick / filter-pluck gesture, made creaturely.
//
//    blip   — oscillator grain with a per-grain lowpass filter envelope
//             (the original grain type, evolved). Optional integrated noise.
//             Mid-weight. Present in all states.
//
//    breath — longer (150–550ms), noise-dominant grain with an asymmetric
//             amplitude envelope: faster rise, slower fall. Tone layer quiet
//             underneath. Creates the "ooze" and metabolic slowness of thinking.
//
//  Above individual grains, a phrase-level system shifts global filter
//  frequency, brightness, density, gain, and pitch over 2–5 second arcs.
//  Phrases may also leave short rests between them, so the creature has
//  utterances, gaps, and breath-like negative space.
//
//  Output chain:
//    grains → [stereo panner] → grandFilter (lowpass) → waveshaper (soft clip)
//           → compressor → master gain → destination
//
//  API
//  ───
//    irisSound.start("transcribing" | "thinking" | "crafting")
//    irisSound.stop()
//    irisSound.setIntensity(0–1)
//    irisSound.setDensity(multiplier)
//    irisSound.addProfile(name, profileObject)
// ─────────────────────────────────────────────────────────────────────────────

class IrisSoundEngine {
  constructor(options = {}) {
    this.context    = null;
    this.master     = null;
    this.compressor = null;
    this.shaper     = null;       // waveshaper: soft organic saturation
    this.grandFilter = null;      // global lowpass: phrases breathe through here

    this.currentState = null;
    this.isRunning    = false;

    this.grainTimer  = null;
    this.phraseTimer = null;

    this.intensity        = options.intensity        ?? 0.65;
    this.densityMultiplier = options.densityMultiplier ?? 1.0;
    this.fadeTime         = options.fadeTime         ?? 0.18;

    // Phrase-level macro state — evolves every 2–5 seconds
    this.phrase = {
      brightness: 1,
      density:    1,
      gain:       1,
      pitch:      1,
      filterQ:    1,
      rest:       false
    };

    // ── Default state profiles ────────────────────────────────────────────────
    this.profiles = {

      // ── Transcribing ────────────────────────────────────────────────────────
      // Light, attentive, scanning. High register. Tick-like.
      // Mostly clicks with scattered blips; rare breaths.
      transcribing: {
        label:       "Transcribing",
        baseDensity: 20,

        // Probability weights: [click, blip, breath, kick]
        grainMix: [0.62, 0.16, 0.06, 0.16],

        // ── Blip grain ──────────────────────────────────────────────────────
        pitchMin:    520,
        pitchMax:    1400,
        durationMin: 0.028,
        durationMax: 0.22,       // allows occasional longer blips
        gainMin:     0.009,
        gainMax:     0.030,
        waveform:    ["sine", "triangle"],
        pan:         0.40,
        pitchGlide:  0.06,
        noiseChance: 0.28,
        clusterChance: 0.07,

        // ── Click grain ─────────────────────────────────────────────────────
        // fast filter-sweep transient: pitch drops high→low in sweepMs millis
        click: {
          pitchHigh:    1200,
          pitchHighMax: 5000,
          pitchLow:     80,
          pitchLowMax:  300,
          sweepMs:      [2, 9],          // filter + pitch sweep duration
          filterHigh:   [3500, 12000],   // filter open range (start)
          filterLow:    [80,   420],     // filter closed range (end)
          filterQ:      [0.8,  5.0],     // resonant peak during sweep
          gainMin:      0.018,
          gainMax:      0.048,
          noiseGain:    [0.008, 0.022],  // bandpass noise burst gain
          tailChance:   0.35,            // probability of resonant tail after click
          tailDurMin:   0.025,
          tailDurMax:   0.09,
          flamChance:   0.12,            // probability of double-tap (flam)
          flamDelayMs:  [8, 28]          // gap between flam taps
        },

        // ── Kick / thump grain ──────────────────────────────────────────────
        // closed → open → closed lowpass envelope; a tiny classic kick gesture
        kick: {
          pitchHigh:     110,
          pitchLow:      42,
          pitchSweepMs:  [35, 80],
          durationMin:   0.075,
          durationMax:   0.18,
          gainMin:       0.010,
          gainMax:       0.034,
          filterLow:     [45, 140],      // ultra-low starting cutoff
          filterPeak:    [900, 3800],    // rapid open point
          filterEnd:     [55, 220],      // falls shut
          filterAttackMs:[5, 18],
          filterDecayMs: [24, 110],
          filterQ:       [1.6, 6.0],
          tickChance:    0.35,
          tickGain:      [0.002, 0.009]
        },

        // ── Breath grain ────────────────────────────────────────────────────
        breath: {
          pitchMin:    700,
          pitchMax:    1800,
          durationMin: 0.18,
          durationMax: 0.42,
          gainMin:     0.005,
          gainMax:     0.018,
          noiseRatio:  0.65,        // fraction of grain that is noise-dominant
          filterFreqMin: 400,
          filterFreqMax: 2800,
          filterQ:     [0.3, 1.2]
        },

        // ── Per-blip filter envelope ────────────────────────────────────────
        grainFilter: {
          type:         "lowpass",
          startFreqMin: 700,
          startFreqMax: 1800,
          peakFreqMin:  1600,
          peakFreqMax:  5000,
          endFreqMin:   500,
          endFreqMax:   1400,
          qMin:         0.4,
          qMax:         2.0,
          attackRatio:  0.18,
          releaseRatio: 0.72
        },

        // ── Phrase-level global movement ────────────────────────────────────
        grand: {
          phraseMin:      1,
          phraseMax:      3.5,
          filterFreqMin:  1000,
          filterFreqMax:  4000,
          qMin:           0.4,
          qMax:           1.6,
          brightnessMin:  0.75,
          brightnessMax:  1.30,
          densityMin:     0.50,
          densityMax:     5.10,
          gainMin:        0.72,
          gainMax:        1.12,
          pitchMin:       0.90,
          pitchMax:       1.10,
          restChance:     0.80,
          restMin:        0.2,
          restMax:        1.5
        }
      },


      // ── Thinking ────────────────────────────────────────────────────────────
      // Interior, metabolic, lower register. More breaths and blips.
      // Clicks are rarer, lower-pitched, more bodily. Filter murky.
      thinking: {
        label:       "Thinking",
        baseDensity: 20,

        grainMix: [0.13, 0.36, 0.35, 0.16],

        pitchMin:    90,
        pitchMax:    680,
        durationMin: 0.05,
        durationMax: 0.35,
        gainMin:     0.007,
        gainMax:     0.030,
        waveform:    ["sine", "triangle", "sawtooth"],
        pan:         0.55,
        pitchGlide:  0.16,
        noiseChance: 0.32,
        clusterChance: 0.09,

        click: {
          pitchHigh:    400,
          pitchHighMax: 1800,
          pitchLow:     40,
          pitchLowMax:  180,
          sweepMs:      [4, 14],
          filterHigh:   [1200, 5000],
          filterLow:    [40,   200],
          filterQ:      [1.2,  7.0],   // more resonant — throatier, deeper
          gainMin:      0.016,
          gainMax:      0.040,
          noiseGain:    [0.010, 0.028],
          tailChance:   0.55,          // more tails — clicks linger and resonate
          tailDurMin:   0.04,
          tailDurMax:   0.18,
          flamChance:   0.06,
          flamDelayMs:  [12, 40]
        },

        kick: {
          pitchHigh:     85,
          pitchLow:      30,
          pitchSweepMs:  [45, 110],
          durationMin:   0.10,
          durationMax:   0.24,
          gainMin:       0.011,
          gainMax:       0.038,
          filterLow:     [35, 110],
          filterPeak:    [420, 1800],
          filterEnd:     [38, 150],
          filterAttackMs:[8, 20],
          filterDecayMs: [40, 160],
          filterQ:       [2.0, 8.0],
          tickChance:    0.22,
          tickGain:      [0.0015, 0.007]
        },

        breath: {
          pitchMin:    80,
          pitchMax:    420,
          durationMin: 0.25,
          durationMax: 0.55,
          gainMin:     0.006,
          gainMax:     0.022,
          noiseRatio:  0.75,
          filterFreqMin: 120,
          filterFreqMax: 1400,
          filterQ:     [0.4, 2.0]
        },

        grainFilter: {
          type:         "lowpass",
          startFreqMin: 200,
          startFreqMax: 900,
          peakFreqMin:  600,
          peakFreqMax:  2800,
          endFreqMin:   150,
          endFreqMax:   800,
          qMin:         0.8,
          qMax:         5.0,
          attackRatio:  0.30,
          releaseRatio: 0.70
        },

        grand: {
          phraseMin:      3.0,
          phraseMax:      5.5,
          filterFreqMin:  280,
          filterFreqMax:  2000,
          qMin:           0.8,
          qMax:           3.5,
          brightnessMin:  0.60,
          brightnessMax:  1.10,
          densityMin:     0.45,
          densityMax:     1.15,
          gainMin:        0.68,
          gainMax:        1.12,
          pitchMin:       0.80,
          pitchMax:       1.18,
          restChance:     0.48,
          restMin:        0.30,
          restMax:        1.35
        }
      },


      // ── Crafting ────────────────────────────────────────────────────────────
      // Brighter, slightly more active. An answer forming.
      // Fast clicks; some upward pitch glides; filter more open; eager.
      crafting: {
        label:       "Crafting",
        baseDensity: 30,

        grainMix: [0.32, 0.38, 0.10, 0.20],

        pitchMin:    580,
        pitchMax:    2000,
        durationMin: 0.025,
        durationMax: 0.28,
        gainMin:     0.009,
        gainMax:     0.036,
        waveform:    ["sine", "triangle", "square"],
        pan:         0.60,
        pitchGlide:  0.18,       // occasional upward glides
        noiseChance: 0.22,
        clusterChance: 0.14,

        click: {
          pitchHigh:    2000,
          pitchHighMax: 8000,
          pitchLow:     120,
          pitchLowMax:  500,
          sweepMs:      [1, 7],
          filterHigh:   [5000, 16000],
          filterLow:    [120,  600],
          filterQ:      [0.6,  4.0],
          gainMin:      0.020,
          gainMax:      0.055,
          noiseGain:    [0.006, 0.018],
          tailChance:   0.28,
          tailDurMin:   0.018,
          tailDurMax:   0.065,
          flamChance:   0.18,          // more flams — restless, anticipatory
          flamDelayMs:  [5, 22]
        },

        kick: {
          pitchHigh:     130,
          pitchLow:      48,
          pitchSweepMs:  [25, 70],
          durationMin:   0.065,
          durationMax:   0.16,
          gainMin:       0.012,
          gainMax:       0.042,
          filterLow:     [55, 170],
          filterPeak:    [1200, 5200],
          filterEnd:     [65, 280],
          filterAttackMs:[5, 15],
          filterDecayMs: [22, 95],
          filterQ:       [1.2, 5.5],
          tickChance:    0.42,
          tickGain:      [0.002, 0.010]
        },

        breath: {
          pitchMin:    600,
          pitchMax:    2000,
          durationMin: 0.15,
          durationMax: 0.35,
          gainMin:     0.006,
          gainMax:     0.018,
          noiseRatio:  0.55,
          filterFreqMin: 600,
          filterFreqMax: 3500,
          filterQ:     [0.3, 1.0]
        },

        grainFilter: {
          type:         "lowpass",
          startFreqMin: 1000,
          startFreqMax: 2800,
          peakFreqMin:  3000,
          peakFreqMax:  9000,
          endFreqMin:   700,
          endFreqMax:   2200,
          qMin:         0.45,
          qMax:         2.8,
          attackRatio:  0.14,
          releaseRatio: 0.66
        },

        grand: {
          phraseMin:      1.8,
          phraseMax:      3.8,
          filterFreqMin:  1400,
          filterFreqMax:  6000,
          qMin:           0.40,
          qMax:           2.2,
          brightnessMin:  0.88,
          brightnessMax:  1.50,
          densityMin:     0.60,
          densityMax:     1.30,
          gainMin:        0.72,
          gainMax:        1.22,
          pitchMin:       0.94,
          pitchMax:       1.16,
          restChance:     0.32,
          restMin:        0.12,
          restMax:        0.55
        }
      }
    };
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Audio context initialisation
  // ────────────────────────────────────────────────────────────────────────────

  async ensureAudio() {
    if (this.context) return;

    const AC = window.AudioContext || window.webkitAudioContext;
    this.context = new AC();

    // Master output gain (faded in/out on start/stop)
    this.master = this.context.createGain();
    this.master.gain.value = 0;

    // Global phrase-level lowpass — the creature breathes through this
    this.grandFilter = this.context.createBiquadFilter();
    this.grandFilter.type = "lowpass";
    this.grandFilter.frequency.value = 3000;
    this.grandFilter.Q.value = 0.9;

    // Waveshaper — mild soft saturation for organic, slightly imperfect quality
    // At low gain levels this adds subtle harmonic warmth without obvious clipping
    this.shaper = this.context.createWaveShaper();
    this.shaper.curve = _softClipCurve(256, 2.0);
    this.shaper.oversample = "2x";

    // Compressor — safety net when grains pile up
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -22;
    this.compressor.knee.value      = 14;
    this.compressor.ratio.value     = 4.0;
    this.compressor.attack.value    = 0.003;
    this.compressor.release.value   = 0.12;

    this.grandFilter.connect(this.shaper);
    this.shaper.connect(this.compressor);
    this.compressor.connect(this.master);
    this.master.connect(this.context.destination);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Public API
  // ────────────────────────────────────────────────────────────────────────────

  async start(stateName) {
    if (!this.profiles[stateName]) {
      throw new Error(`Unknown Iris state: "${stateName}"`);
    }
    await this.ensureAudio();
    if (this.context.state === "suspended") await this.context.resume();

    const stateChanged   = this.currentState !== stateName;
    this.currentState    = stateName;
    this.isRunning       = true;

    this.fadeMasterTo(0.62 * this.intensity, this.fadeTime);

    if (stateChanged)      this.startNewPhrase(true);
    if (!this.grainTimer)  this.scheduleNextGrain(0.04);
  }

  stop() {
    if (!this.context || !this.master) return;
    this.isRunning    = false;
    clearTimeout(this.grainTimer);
    clearTimeout(this.phraseTimer);
    this.grainTimer   = null;
    this.phraseTimer  = null;
    this.currentState = null;
    this.fadeMasterTo(0, 0.30);
  }

  setIntensity(value) {
    this.intensity = _clamp(value, 0, 1);
    if (this.isRunning && this.master) {
      this.fadeMasterTo(0.62 * this.intensity, 0.10);
    }
  }

  setDensity(value) {
    this.densityMultiplier = _clamp(value, 0.05, 4);
  }

  // Register a custom state profile (for standalone use / Sgueltch extensions)
  addProfile(name, profile) {
    if (!profile.grainMix || !profile.click || !profile.breath ||
        !profile.grainFilter || !profile.grand) {
      throw new Error("Profile missing required sections (grainMix, click, breath, grainFilter, grand). Optional section: kick.");
    }
    this.profiles[name] = profile;
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Internal: master gain fade
  // ────────────────────────────────────────────────────────────────────────────

  fadeMasterTo(value, seconds) {
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(value, now, seconds);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Internal: phrase-level movement
  //  Re-targets the grandFilter and phrase variables every 2–5 seconds.
  //  This creates the "breathing", slow attention-shift, metabolic arcs.
  // ────────────────────────────────────────────────────────────────────────────

  startNewPhrase(immediate = false) {
    if (!this.isRunning || !this.currentState) return;

    const profile  = this.profiles[this.currentState];
    const grand    = profile.grand;
    const now      = this.context.currentTime;
    const dur      = _rand(grand.phraseMin, grand.phraseMax);

    this.phrase = {
      brightness: _rand(grand.brightnessMin, grand.brightnessMax),
      density:    _rand(grand.densityMin,    grand.densityMax),
      gain:       _rand(grand.gainMin,       grand.gainMax),
      pitch:      _rand(grand.pitchMin,      grand.pitchMax),
      filterQ:    _rand(grand.qMin,          grand.qMax)
    };

    const nextFreq = _clamp(
      _rand(grand.filterFreqMin, grand.filterFreqMax) * this.phrase.brightness,
      40, 20000
    );
    const nextQ = this.phrase.filterQ;

    this.grandFilter.frequency.cancelScheduledValues(now);
    this.grandFilter.Q.cancelScheduledValues(now);

    if (immediate) {
      this.grandFilter.frequency.setValueAtTime(nextFreq, now);
      this.grandFilter.Q.setValueAtTime(nextQ, now);
    } else {
      // Slow organic drift — not a jump, a slide
      this.grandFilter.frequency.setTargetAtTime(nextFreq, now, dur * 0.38);
      this.grandFilter.Q.setTargetAtTime(nextQ,            now, dur * 0.48);
    }

    this.phrase.rest = false;

    clearTimeout(this.phraseTimer);
    this.phraseTimer = setTimeout(() => {
      const shouldRest = Math.random() < (grand.restChance ?? 0);
      if (shouldRest) this.startPhraseRest();
      else            this.startNewPhrase(false);
    }, dur * 1000);
  }

  // Short rests between active phrases. This is not a fade-out of the engine;
  // it is compositional negative space: the creature stops uttering for a beat.
  startPhraseRest() {
    if (!this.isRunning || !this.currentState) return;

    const profile = this.profiles[this.currentState];
    const grand   = profile.grand;
    const now     = this.context.currentTime;
    const restDur = _rand(grand.restMin ?? 0.15, grand.restMax ?? 0.75);

    this.phrase.rest = true;
    this.phrase.density = 0;
    this.phrase.gain = 0.35;

    // During a rest, close the mouth of the global filter a bit.
    this.grandFilter.frequency.cancelScheduledValues(now);
    this.grandFilter.frequency.setTargetAtTime(
      _clamp((grand.filterFreqMin ?? 120) * 0.55, 40, 20000),
      now,
      restDur * 0.25
    );

    clearTimeout(this.phraseTimer);
    this.phraseTimer = setTimeout(() => this.startNewPhrase(false), restDur * 1000);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Internal: grain scheduling
  //  Irregular gap distribution → phrase-like sparseness and clustering.
  // ────────────────────────────────────────────────────────────────────────────

  scheduleNextGrain(fixedDelay = null) {
    if (!this.isRunning || !this.currentState) {
      this.grainTimer = null;
      return;
    }

    const profile = this.profiles[this.currentState];

    // If the phrase system is in a rest, keep the scheduler alive but do not
    // emit grains. The next phrase timer will reopen the stream.
    if (this.phrase.rest) {
      this.grainTimer = setTimeout(() => this.scheduleNextGrain(), _rand(0.08, 0.18) * 1000);
      return;
    }

    const density =
      profile.baseDensity *
      this.densityMultiplier *
      this.phrase.density *
      (0.25 + this.intensity * 0.75);

    const avgGap = 1 / Math.max(0.1, density);
    const gap    = fixedDelay ?? _rand(avgGap * 0.38, avgGap * 2.9);

    this.grainTimer = setTimeout(() => {
      if (!this.isRunning || !this.currentState) {
        this.grainTimer = null;
        return;
      }

      const now     = this.context.currentTime;
      const type    = this._selectGrainType(profile);

      if (type === "click")       this.makeClickGrain(profile, now);
      else if (type === "kick" && profile.kick) this.makeKickGrain(profile, now);
      else if (type === "breath") this.makeBreathGrain(profile, now);
      else                        this.makeBlipGrain(profile, now);

      // Occasional cluster: a second blip shortly after
      if (Math.random() < profile.clusterChance * this.intensity) {
        const clusterDelay = _rand(0.022, 0.090);
        setTimeout(() => {
          if (this.isRunning && this.currentState) {
            this.makeBlipGrain(profile, this.context.currentTime);
          }
        }, clusterDelay * 1000);
      }

      this.scheduleNextGrain();
    }, gap * 1000);
  }

  _selectGrainType(profile) {
    // Backward-compatible weighted choice.
    // grainMix may be [click, blip, breath] or [click, blip, breath, kick].
    const labels  = ["click", "blip", "breath", "kick"];
    const weights = labels.map((_, i) => Math.max(0, profile.grainMix?.[i] ?? 0));
    if (!profile.kick) weights[3] = 0;

    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) return "blip";

    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return labels[i];
    }
    return "blip";
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Grain: Kick / Thump
  //
  //  A classic synthesized kick gesture, but smaller and stranger:
  //    1. Sine body with fast pitch drop
  //    2. Lowpass filter envelope: ultra-low → open in 5–20ms → closed
  //    3. Optional tiny tick/noise beater
  //
  //  In synth language, this is basically a fast attack/decay filter pluck
  //  plus a pitch envelope. In Sgueltch language: a thump grain.
  // ────────────────────────────────────────────────────────────────────────────

  makeKickGrain(profile, now = this.context.currentTime) {
    const kp = profile.kick;

    const filterAttack = _rand(kp.filterAttackMs[0], kp.filterAttackMs[1]) * 0.001;
    const filterDecay  = _rand(kp.filterDecayMs[0],  kp.filterDecayMs[1])  * 0.001;
    const pitchSweep   = _rand(kp.pitchSweepMs[0],   kp.pitchSweepMs[1])   * 0.001;
    const dur          = Math.max(_rand(kp.durationMin, kp.durationMax), filterAttack + filterDecay + 0.012);

    const pitchStart = _clamp(kp.pitchHigh * _rand(0.82, 1.22) * this.phrase.pitch, 20, 20000);
    const pitchEnd   = _clamp(kp.pitchLow  * _rand(0.82, 1.18) * this.phrase.pitch, 20, 20000);
    const gainPeak   = _rand(kp.gainMin, kp.gainMax) * (0.35 + this.intensity) * this.phrase.gain;
    const panAmt     = _rand(-profile.pan * 0.45, profile.pan * 0.45); // kicks stay closer to center

    const fLow   = _clamp(_rand(...kp.filterLow)  * this.phrase.brightness, 20, 20000);
    const fPeak  = _clamp(_rand(...kp.filterPeak) * this.phrase.brightness, 40, 20000);
    const fEnd   = _clamp(_rand(...kp.filterEnd)  * this.phrase.brightness, 20, 20000);
    const filterQ = _rand(...kp.filterQ);

    const osc    = this.context.createOscillator();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(pitchEnd, now + pitchSweep);
    osc.frequency.setTargetAtTime(
      _clamp(pitchEnd * _rand(0.90, 1.04), 20, 20000),
      now + pitchSweep,
      dur * 0.38
    );

    // The requested formation: cutoff starts ultra-low, opens rapidly, then shuts.
    filt.type = "lowpass";
    filt.Q.setValueAtTime(filterQ, now);
    filt.frequency.setValueAtTime(fLow, now);
    filt.frequency.exponentialRampToValueAtTime(fPeak, now + filterAttack);
    filt.frequency.exponentialRampToValueAtTime(fEnd, now + filterAttack + filterDecay);
    filt.frequency.setTargetAtTime(_clamp(fEnd * 0.60, 20, 20000), now + dur * 0.70, dur * 0.18);

    // Percussive amplitude: almost instant onset, then rounded decay.
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainPeak), now + 0.0012);
    amp.gain.setTargetAtTime(0.0001, now + dur * 0.18, dur * 0.22);
    amp.gain.setValueAtTime(0.0001, now + dur);

    panner.pan.setValueAtTime(panAmt, now);

    osc.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    osc.start(now);
    osc.stop(now + dur + 0.03);

    if (Math.random() < (kp.tickChance ?? 0) * this.intensity) {
      this._makeKickTick(kp, now, Math.min(0.024, filterAttack + 0.014), panAmt);
    }
  }

  _makeKickTick(kp, now, dur, panAmt) {
    const bufSize = Math.max(1, Math.ceil(this.context.sampleRate * dur));
    const buffer  = this.context.createBuffer(1, bufSize, this.context.sampleRate);
    const data    = buffer.getChannelData(0);

    for (let i = 0; i < bufSize; i++) {
      const t = i / bufSize;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 5.0);
    }

    const src    = this.context.createBufferSource();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    const tickGain = _rand(...kp.tickGain) * (0.35 + this.intensity) * this.phrase.gain;

    filt.type = "bandpass";
    filt.Q.value = _rand(0.8, 4.0);
    filt.frequency.setValueAtTime(_clamp(_rand(700, 4200) * this.phrase.brightness, 40, 20000), now);
    filt.frequency.exponentialRampToValueAtTime(_clamp(_rand(140, 700) * this.phrase.brightness, 40, 20000), now + dur);

    amp.gain.setValueAtTime(Math.max(0.0001, tickGain), now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    panner.pan.value = panAmt + _rand(-0.06, 0.06);

    src.buffer = buffer;
    src.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    src.start(now);
    src.stop(now + dur + 0.004);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Grain: Click
  //
  //  The signature Sgueltch transient. A tiny kick / snare flam for a creature.
  //
  //  Structure:
  //    1. Pitch-dropping sine oscillator — the "body" of the click
  //    2. Resonant lowpass filter sweeping HIGH → LOW in sweepMs milliseconds
  //       (this fast filter sweep is what makes it "click" rather than "beep")
  //    3. Optional resonant tail (the overtone that lingers)
  //    4. Bandpass noise burst (adds air and attack texture)
  //    5. Optional flam: a second, quieter, offset click tap
  // ────────────────────────────────────────────────────────────────────────────

  makeClickGrain(profile, now) {
    const cp       = profile.click;
    const sweepDur = _rand(cp.sweepMs[0], cp.sweepMs[1]) * 0.001;
    const tailDur  = Math.random() < cp.tailChance
      ? _rand(cp.tailDurMin, cp.tailDurMax)
      : 0;
    const totalDur = sweepDur + tailDur;

    const pitchStart = _clamp(_rand(cp.pitchHigh, cp.pitchHighMax) * this.phrase.pitch, 20, 20000);
    const pitchEnd   = _clamp(_rand(cp.pitchLow,  cp.pitchLowMax)  * this.phrase.pitch, 20, 20000);
    const gainPeak   = _rand(cp.gainMin, cp.gainMax) * (0.35 + this.intensity) * this.phrase.gain;
    const panAmt     = _rand(-profile.pan, profile.pan);

    const filtHigh = _clamp(_rand(...cp.filterHigh) * this.phrase.brightness, 40, 20000);
    const filtLow  = _clamp(_rand(...cp.filterLow)  * this.phrase.brightness, 40, 20000);
    const filtQ    = _rand(...cp.filterQ);

    const osc    = this.context.createOscillator();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    // Pitch: fast high→low drop (the "body" of the click)
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(pitchEnd, now + sweepDur);
    if (tailDur > 0) {
      // Tail: pitch continues settling downward, slowly
      osc.frequency.setTargetAtTime(
        _clamp(pitchEnd * _rand(0.55, 0.85), 20, 20000),
        now + sweepDur,
        tailDur * 0.4
      );
    }

    // Filter: WIDE OPEN → CLOSED in sweepMs — this is what makes it click
    filt.type = "lowpass";
    filt.Q.setValueAtTime(filtQ, now);
    filt.frequency.setValueAtTime(filtHigh, now);
    filt.frequency.exponentialRampToValueAtTime(filtLow, now + sweepDur);
    if (tailDur > 0) {
      filt.frequency.setTargetAtTime(
        _clamp(filtLow * _rand(0.25, 0.55), 20, 20000),
        now + sweepDur,
        tailDur * 0.5
      );
    }

    // Amplitude: 0.4ms attack (near-instant), then exponential decay
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainPeak), now + 0.0004);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + totalDur + 0.005);

    panner.pan.setValueAtTime(panAmt, now);

    osc.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    osc.start(now);
    osc.stop(now + totalDur + 0.025);

    // Bandpass noise burst: adds attack texture / "snap"
    this._makeClickNoise(cp, now, sweepDur, panAmt);

    // Flam: a second softer click shortly after
    if (Math.random() < cp.flamChance) {
      const flamAt = now + _rand(cp.flamDelayMs[0], cp.flamDelayMs[1]) * 0.001;
      this._makeFlamTap(cp, profile, flamAt);
    }
  }

  // Second tap of a flam — quieter, slightly different pitch
  _makeFlamTap(cp, profile, now) {
    const sweepDur   = _rand(cp.sweepMs[0], cp.sweepMs[1] * 0.6) * 0.001;
    const pitchStart = _clamp(_rand(cp.pitchHigh, cp.pitchHighMax) * this.phrase.pitch * _rand(0.55, 0.88), 20, 20000);
    const pitchEnd   = _clamp(_rand(cp.pitchLow,  cp.pitchLowMax)  * this.phrase.pitch, 20, 20000);
    const gainPeak   = _rand(cp.gainMin, cp.gainMax) * 0.45 * this.phrase.gain;
    const panAmt     = _rand(-profile.pan, profile.pan);

    const osc    = this.context.createOscillator();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(pitchEnd, now + sweepDur);

    filt.type = "lowpass";
    filt.Q.value = _rand(...cp.filterQ) * 0.75;
    filt.frequency.setValueAtTime(_clamp(_rand(...cp.filterHigh) * 0.65 * this.phrase.brightness, 40, 20000), now);
    filt.frequency.exponentialRampToValueAtTime(_clamp(_rand(...cp.filterLow) * this.phrase.brightness, 40, 20000), now + sweepDur);

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainPeak), now + 0.0003);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + sweepDur + 0.012);

    panner.pan.value = panAmt;

    osc.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    osc.start(now);
    osc.stop(now + sweepDur + 0.025);
  }

  // Bandpass noise burst layered with click — gives it air and attack grain
  _makeClickNoise(cp, now, sweepDur, panAmt) {
    const dur     = sweepDur + _rand(0.005, 0.018);
    const bufSize = Math.max(1, Math.ceil(this.context.sampleRate * dur));
    const buffer  = this.context.createBuffer(1, bufSize, this.context.sampleRate);
    const data    = buffer.getChannelData(0);

    // Fast-decay noise envelope
    for (let i = 0; i < bufSize; i++) {
      const t = i / bufSize;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.5);
    }

    const src    = this.context.createBufferSource();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    const noiseGain = _rand(...cp.noiseGain) * this.intensity * this.phrase.gain;

    // Bandpass sweep: gives the noise the same spectral movement as the click
    filt.type = "bandpass";
    filt.Q.value = _rand(...cp.filterQ) * 0.5;
    filt.frequency.setValueAtTime(_clamp(_rand(...cp.filterHigh) * 0.55 * this.phrase.brightness, 40, 20000), now);
    filt.frequency.exponentialRampToValueAtTime(_clamp(_rand(...cp.filterLow) * this.phrase.brightness, 40, 20000), now + dur);

    amp.gain.setValueAtTime(Math.max(0.0001, noiseGain), now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    panner.pan.value = panAmt + _rand(-0.12, 0.12);

    src.buffer = buffer;
    src.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    src.start(now);
    src.stop(now + dur + 0.005);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Grain: Blip
  //
  //  Evolved from the original grain. Oscillator with a per-grain filter
  //  envelope (a tiny mouth opening and closing). Optional integrated noise
  //  (parallel mix — not a separate tick, but part of the same event).
  //  Duration range allows for some longer, slower blips.
  // ────────────────────────────────────────────────────────────────────────────

  makeBlipGrain(profile, now = this.context.currentTime) {
    const dur      = _rand(profile.durationMin, profile.durationMax) * _rand(0.7, 1.5);
    const pitch    = _randExp(profile.pitchMin, profile.pitchMax) * this.phrase.pitch;
    const endPitch = _clamp(pitch * _rand(1 - profile.pitchGlide, 1 + profile.pitchGlide), 20, 20000);
    const gainPeak = _rand(profile.gainMin, profile.gainMax) * (0.35 + this.intensity) * this.phrase.gain;
    const waveform = _choose(profile.waveform);
    const panAmt   = _rand(-profile.pan, profile.pan);

    const osc    = this.context.createOscillator();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();
    const gFilt  = this.context.createBiquadFilter();

    osc.type = waveform;
    osc.frequency.setValueAtTime(_clamp(pitch, 20, 20000), now);
    osc.frequency.exponentialRampToValueAtTime(_clamp(endPitch, 20, 20000), now + dur);

    this._applyGrainFilterEnvelope(gFilt, profile.grainFilter, now, dur);

    // Slightly randomised attack ratio — asymmetric, organic
    const attackFrac = _rand(0.05, 0.24);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainPeak), now + dur * attackFrac);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    panner.pan.setValueAtTime(panAmt, now);

    // Optional integrated noise (parallel, same event — not a separate tick)
    if (Math.random() < profile.noiseChance * this.intensity) {
      this._makeIntegratedNoise(
        profile,
        now,
        dur * _rand(0.35, 0.85),
        panAmt,
        gainPeak * 0.30
      );
    }

    osc.connect(gFilt);
    gFilt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    osc.start(now);
    osc.stop(now + dur + 0.022);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Grain: Breath
  //
  //  Longer, slower, noise-dominant. Soft sine tone underneath.
  //  Asymmetric amplitude envelope: faster rise, slower fall.
  //  Sgueltch character: ooze, secretion, metabolic event.
  // ────────────────────────────────────────────────────────────────────────────

  makeBreathGrain(profile, now = this.context.currentTime) {
    const bp       = profile.breath;
    const dur      = _rand(bp.durationMin, bp.durationMax);
    const pitch    = _randExp(bp.pitchMin, bp.pitchMax) * this.phrase.pitch;
    const gainPeak = _rand(bp.gainMin, bp.gainMax) * (0.35 + this.intensity) * this.phrase.gain;
    const panAmt   = _rand(-profile.pan, profile.pan);

    const toneGain  = gainPeak * (1 - bp.noiseRatio);
    const noiseGain = gainPeak * bp.noiseRatio;

    // ── Quiet tone layer underneath ─────────────────────────────────────────
    const osc    = this.context.createOscillator();
    const tFilt  = this.context.createBiquadFilter();
    const tAmp   = this.context.createGain();
    const panner = this.context.createStereoPanner();

    osc.type = "sine";
    osc.frequency.setValueAtTime(_clamp(pitch, 20, 20000), now);
    // Subtle pitch drift: the breath is slightly alive
    osc.frequency.setTargetAtTime(
      _clamp(pitch * _rand(0.90, 1.10), 20, 20000),
      now + dur * 0.25,
      dur * 0.5
    );

    const filtFreq1 = _clamp(_rand(bp.filterFreqMin, bp.filterFreqMax) * this.phrase.brightness, 40, 20000);
    const filtFreq2 = _clamp(_rand(bp.filterFreqMin, bp.filterFreqMax) * this.phrase.brightness, 40, 20000);
    tFilt.type = "lowpass";
    tFilt.frequency.setValueAtTime(filtFreq1, now);
    tFilt.frequency.setTargetAtTime(filtFreq2, now + dur * 0.45, dur * 0.4);
    tFilt.Q.value = _rand(...bp.filterQ);

    // Slow, asymmetric rise–fall
    tAmp.gain.setValueAtTime(0.0001, now);
    tAmp.gain.setTargetAtTime(Math.max(0.0001, toneGain), now, dur * 0.22);
    tAmp.gain.setTargetAtTime(0.0001, now + dur * 0.60, dur * 0.28);

    panner.pan.value = panAmt;

    osc.connect(tFilt);
    tFilt.connect(tAmp);
    tAmp.connect(panner);
    panner.connect(this.grandFilter);
    osc.start(now);
    osc.stop(now + dur + 0.05);

    // ── Dominant noise layer ────────────────────────────────────────────────
    this._makeBreathNoise(bp, now, dur, panAmt, noiseGain);
  }

  // Shaped noise with asymmetric bell envelope — faster rise, slower fall
  _makeBreathNoise(bp, now, dur, panAmt, gainPeak) {
    const bufSize = Math.max(1, Math.ceil(this.context.sampleRate * dur));
    const buffer  = this.context.createBuffer(1, bufSize, this.context.sampleRate);
    const data    = buffer.getChannelData(0);

    for (let i = 0; i < bufSize; i++) {
      const t   = i / bufSize;
      // Asymmetric envelope: 35% rise (power 1.4), 65% fall (power 2.0)
      const env = t < 0.35
        ? Math.pow(t / 0.35, 1.4)
        : Math.pow(1 - (t - 0.35) / 0.65, 2.0);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const src    = this.context.createBufferSource();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    const fBase = _clamp(_rand(bp.filterFreqMin, bp.filterFreqMax) * this.phrase.brightness, 40, 20000);

    // Filter: opens slowly then closes — the "breath" shape
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(_clamp(fBase * 0.65, 40, 20000), now);
    filt.frequency.setTargetAtTime(_clamp(fBase, 40, 20000),        now + dur * 0.18, dur * 0.32);
    filt.frequency.setTargetAtTime(_clamp(fBase * 0.45, 40, 20000), now + dur * 0.52, dur * 0.30);
    filt.Q.value = _rand(...bp.filterQ);

    amp.gain.setValueAtTime(Math.max(0.0001, gainPeak * 0.55), now);
    amp.gain.setTargetAtTime(Math.max(0.0001, gainPeak),         now,          dur * 0.18);
    amp.gain.setTargetAtTime(0.0001,                             now + dur * 0.58, dur * 0.30);

    panner.pan.value = panAmt + _rand(-0.14, 0.14);

    src.buffer = buffer;
    src.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    src.start(now);
    src.stop(now + dur + 0.025);
  }

  // Short filtered noise mixed in parallel with a blip grain
  _makeIntegratedNoise(profile, now, dur, panAmt, gainPeak) {
    const bufSize = Math.max(1, Math.ceil(this.context.sampleRate * dur));
    const buffer  = this.context.createBuffer(1, bufSize, this.context.sampleRate);
    const data    = buffer.getChannelData(0);
    const gf      = profile.grainFilter;

    for (let i = 0; i < bufSize; i++) {
      const t = i / bufSize;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
    }

    const src    = this.context.createBufferSource();
    const filt   = this.context.createBiquadFilter();
    const amp    = this.context.createGain();
    const panner = this.context.createStereoPanner();

    filt.type = "lowpass";
    filt.frequency.setValueAtTime(
      _clamp(_rand(gf.startFreqMin, gf.peakFreqMax) * this.phrase.brightness, 40, 20000), now
    );
    filt.frequency.exponentialRampToValueAtTime(
      _clamp(_rand(gf.endFreqMin, gf.peakFreqMin) * this.phrase.brightness, 40, 20000), now + dur
    );
    filt.Q.value = _rand(gf.qMin, gf.qMax);

    amp.gain.setValueAtTime(Math.max(0.0001, gainPeak * this.intensity), now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    panner.pan.value = panAmt + _rand(-0.10, 0.10);

    src.buffer = buffer;
    src.connect(filt);
    filt.connect(amp);
    amp.connect(panner);
    panner.connect(this.grandFilter);

    src.start(now);
    src.stop(now + dur + 0.008);
  }


  // ────────────────────────────────────────────────────────────────────────────
  //  Internal: per-blip filter envelope
  //  Start → peak → decay to end. Like a tiny mouth opening and closing.
  // ────────────────────────────────────────────────────────────────────────────

  _applyGrainFilterEnvelope(filterNode, fp, now, dur) {
    const b         = this.phrase.brightness;
    const startFreq = _clamp(_rand(fp.startFreqMin, fp.startFreqMax) * b, 40, 20000);
    const peakFreq  = _clamp(_rand(fp.peakFreqMin,  fp.peakFreqMax)  * b, 40, 20000);
    const endFreq   = _clamp(_rand(fp.endFreqMin,   fp.endFreqMax)   * b, 40, 20000);
    const q         = _rand(fp.qMin, fp.qMax);

    filterNode.type = fp.type ?? "lowpass";
    filterNode.Q.setValueAtTime(q, now);

    filterNode.frequency.setValueAtTime(startFreq, now);
    filterNode.frequency.exponentialRampToValueAtTime(peakFreq, now + dur * fp.attackRatio);
    filterNode.frequency.setTargetAtTime(endFreq, now + dur * fp.releaseRatio, dur * 0.18);
    filterNode.frequency.setValueAtTime(endFreq, now + dur);
  }
}


// ──────────────────────────────────────────────────────────────────────────────
//  Waveshaper curve — soft saturation
//  At low signal levels this adds subtle harmonic warmth without audible clipping.
//  The amount parameter controls how quickly the curve rolls off toward ±1.
// ──────────────────────────────────────────────────────────────────────────────

function _softClipCurve(samples, amount) {
  const curve = new Float32Array(samples);
  const k     = amount;
  for (let i = 0; i < samples; i++) {
    const x  = (i * 2) / samples - 1;
    curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
  }
  return curve;
}


// ──────────────────────────────────────────────────────────────────────────────
//  Utility functions
// ──────────────────────────────────────────────────────────────────────────────

function _rand(min, max)     { return min + Math.random() * (max - min); }
function _randExp(min, max)  { return min * Math.pow(max / min, Math.random()); }
function _choose(items)      { return items[Math.floor(Math.random() * items.length)]; }
function _clamp(v, lo, hi)   { return Math.min(hi, Math.max(lo, Number(v))); }


// ──────────────────────────────────────────────────────────────────────────────
//  Export
// ──────────────────────────────────────────────────────────────────────────────

const irisSound = new IrisSoundEngine();
window.irisSound = irisSound;