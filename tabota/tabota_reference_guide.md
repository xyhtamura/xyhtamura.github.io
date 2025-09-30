<html>
# Tabota Language Reference v1.4

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [The Symbolic Axis Mode](#the-symbolic-axis-mode)
3. [Positioning Systems](#positioning-systems)
4. [Nested Timelines](#nested-timelines)
5. [External References](#external-references)
6. [Complete Examples](#complete-examples)

---

## Core Concepts

### The Regime Pair: Temporal + Axial

A Tabota **Scoring Regime** is a pair of two settings that define the fundamental "physics" of a section: the **Temporal Regime** (how time flows) and the **Axis Mode** (what the Y-axis values mean).

| Temporal Regime | Description | Use Cases |
|----------------|-------------|-----------|
| **metered** | Musical time with BPM and beats | Traditional scores, rhythmic music |
| **chronological** | Absolute time in seconds/minutes | Sound design, film scores, precise timing |
| **achronous** | Sequential ordering without time | Interactive media, performer-dependent cues |

| Axis Mode | Description | Use Cases |
|-----------|-------------|-----------|
| **frequency** | Y-axis represents Hz | Pitched music, microtonal composition |
| **symbolic** | Y-axis represents note names | Conventional notation, custom tuning systems |
| **categorical** | Y-axis divided into named lanes | Percussion, MIDI triggers, lighting cues |
| **instructional** | Y-axis for visual layout only | Theater, performance art, conceptual scores |

### The Conversion Principle

Tabota is built on the principle of mutual translation between abstract compositional ideas and their physical realization.

* **Temporal Conversion**: `metered` (beats) can be translated to `chronological` (seconds) using a **BPM** value as the key.
* **Axial Conversion**: `symbolic` (note names) can be translated to `frequency` (Hz) using a **Tuning Map** as the key.

---

## The Symbolic Axis Mode

The `symbolic` axis mode allows composers to work with familiar note names and durations, abstracting away the underlying frequencies. It must be used with the `metered` temporal regime.

Events in this mode use `"note"` and `"duration"` properties.

### Standard 12-TET Notation

By default, the `symbolic` mode uses standard 12-Tone Equal Temperament with A4=440Hz.

```json
{
  "sectionId": "C_Major_Scale",
  "temporalRegime": "metered",
  "regimeSettings": { "beats": 8, "bpm": 120 },
  "axisMode": "symbolic",
  "modeSettings": {
    "tuning": "12-TET",
    "a4": 440
  },
  "events": [
    { "type": "line", "startTime": 0, "duration": 1, "note": "C4" },
    { "type": "line", "startTime": 1, "duration": 1, "note": "D4" },
    { "type": "line", "startTime": 2, "duration": 1, "note": "E4" },
    { "type": "line", "startTime": 3, "duration": 1, "note": "F4" }
  ]
}
```

### Custom Tuning Systems

You can override the default tuning by providing a path to a custom **Tuning Map** file. This allows for historical temperaments (like Pythagorean or Just Intonation) or completely novel, user-defined scales.

The `modeSettings` object is changed to point to your file:

```json
{
  "axisMode": "symbolic",
  "modeSettings": {
    "tuning": {
      "system": "custom",
      "file": "./tunings/pythagorean_c.json"
    }
  }
}
```

The referenced JSON file is a simple map of note names to their exact frequencies in Hz.

**Example: `pythagorean_c.json`**
```json
{
  "name": "Pythagorean Scale on C",
  "description": "A 12-tone scale derived from a stack of pure 3:2 perfect fifths.",
  "referenceNote": "A4",
  "referenceFreq": 440.00,
  "notes": {
    "C4": 260.74,
    "D4": 293.33,
    "E4": 330.00,
    "F4": 347.65,
    "G4": 391.11,
    "A4": 440.00,
    "B4": 495.00,
    "C5": 521.48
  }
}
```

---

## Positioning Systems

### 1. Absolute Positioning
```json
{
  "type": "point",
  "time": 4.5,
  "yValue": 440
}
```

### 2. Duration-Based (Start + Duration)
```json
{
  "type": "line",
  "startTime": 0,
  "duration": 3,
  "note": "C4" 
}
// Calculates: endTime = 0 + 3 = 3
```

### 3. Duration-Based (End + Duration)
```json
{
  "type": "line",
  "endTime": 8,
  "duration": 2,
  "startYValue": 440,
  "endYValue": 660
}
// Calculates: startTime = 8 - 2 = 6
```

### 4. Anchor-Based Positioning
Position an event where you know ONE point within its span:

```json
{
  "type": "line",
  "anchor": {
    "time": 10,
    "position": 0.5  // or "50%"
  },
  "duration": 6,
  "startYValue": 440,
  "endYValue": 660
}
// position: 0.5 means MIDDLE is at time 10
// Calculates: startTime = 10 - (6 * 0.5) = 7
//            endTime = 10 + (6 * 0.5) = 13
```

**Position Values:**
- `0` or `"0%"` = anchor is at the START
- `0.5` or `"50%"` = anchor is at the MIDDLE
- `1` or `"100%"` = anchor is at the END
- Any value 0-1 or 0%-100% works!

### 5. Relative Positioning
```json
{
  "type": "point",
  "relativeTime": {
    "after": "event_id",
    "offset": 2
  },
  "yValue": 440
}
// Positions 2 beats/seconds AFTER the referenced event ends
```

---

## Nested Timelines

### Pattern 1: Parallel Sections
Sections that run alongside each other with different temporal regimes:

```json
{
  "score": [
    {
      "sectionId": "Song",
      "temporalRegime": "metered",
      "regimeSettings": {"beats": 32, "bpm": 120},
      "events": [...]
    },
    {
      "sectionId": "FieldRecording",
      "temporalRegime": "chronological",
      "regimeSettings": {"duration": 30, "units": "seconds"},
      "parallelTo": {
        "section": "Song",
        "startAt": 16,  // Start at beat 16 of Song
        "anchorPosition": 0  // This section's start aligns with beat 16
      },
      "events": [...]
    }
  ]
}
```

### Pattern 2: Multiple Tracks
Multiple tracks within one section, each with its own axis mode:

```json
{
  "sectionId": "MultiTrack",
  "temporalRegime": "metered",
  "regimeSettings": {"beats": 16, "bpm": 90},
  "tracks": [
    {
      "trackId": "Melody",
      "axisMode": "symbolic",
      "events": [...]
    },
    {
      "trackId": "Percussion",
      "axisMode": "categorical",
      "events": [...]
    }
  ]
}
```

### Pattern 3: Child Sections
Nested sections triggered at specific points in the parent:

```json
{
  "sectionId": "Parent",
  "temporalRegime": "metered",
  "regimeSettings": {"beats": 40, "bpm": 100},
  "events": [...],
  "childSections": [
    {
      "sectionId": "Child",
      "temporalRegime": "chronological",
      "regimeSettings": {"duration": 12},
      "startTrigger": {
        "parentTime": 16,      // Trigger at beat 16 of parent
        "childTime": 0,        // Start at beginning of child
        "anchorPosition": 0    // Child's start aligns with parent's beat 16
      },
      "events": [...]
    }
  ]
}
```

---

## External References

Declare external files at the top via `imports` and reference them by ID.

```json
{
  "projectName": "Main Composition",
  "imports": [
    {
      "id": "rain_ambience",
      "file": "./recordings/rain.json"
    },
    {
      "id": "rock_pattern",
      "file": "./library/percussion.json",
      "type": "section",
      "target": "BasicRock_16beat"
    }
  ],
  "score": [
    {
      "sectionId": "Movement1",
      "childSections": [
        {
          "externalRef": "rain_ambience",
          "startTrigger": {"parentTime": 32}
        }
      ]
    }
  ]
}
```

---

## Complete Examples

### Example 1: Symbolic Mode with Custom Tuning

**composition.json:**
```json
{
  "projectName": "Pythagorean Melody",
  "languageVersion": "1.4",
  "score": [
    {
      "sectionId": "MainTheme",
      "temporalRegime": "metered",
      "regimeSettings": { "beats": 8, "bpm": 100 },
      "axisMode": "symbolic",
      "modeSettings": {
        "tuning": {
          "system": "custom",
          "file": "./tunings/pythagorean_c.json"
        }
      },
      "events": [
        { "type": "line", "startTime": 0, "duration": 2, "note": "C4" },
        { "type": "line", "startTime": 2, "duration": 2, "note": "G4" },
        { "type": "line", "startTime": 4, "duration": 2, "note": "D4" },
        { "type": "line", "startTime": 6, "duration": 2, "note": "A4" }
      ]
    }
  ]
}
```

**./tunings/pythagorean_c.json:**
```json
{
  "name": "Pythagorean Scale on C",
  "referenceNote": "A4",
  "referenceFreq": 440.00,
  "notes": {
    "C4": 260.74, "D4": 293.33, "E4": 330.00, "F4": 347.65, 
    "G4": 391.11, "A4": 440.00, "B4": 495.00
  }
}
```

### Example 2: Multi-Track with Mixed Regimes

```json
{
  "projectName": "Mixed Regime Composition",
  "languageVersion": "1.4",
  "score": [
    {
      "sectionId": "MainSection",
      "temporalRegime": "metered",
      "regimeSettings": {"beats": 32, "bpm": 100},
      "tracks": [
        {
          "trackId": "MelodicLayer",
          "axisMode": "symbolic",
          "events": [
            {
              "type": "line",
              "anchor": {"time": 16, "position": "50%"},
              "duration": 8,
              "note": "A4",
              "payload": {"comment": "Climax centered at beat 16"}
            }
          ]
        },
        {
          "trackId": "Percussion",
          "axisMode": "categorical",
          "modeSettings": {"categories": ["Kick", "Snare", "HiHat"]},
          "events": [
            {"type": "point", "time": 0, "yValue": "Kick"},
            {"type": "point", "time": 1, "yValue": "Snare"}
          ]
        }
      ]
    }
  ]
}
