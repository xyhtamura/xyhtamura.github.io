# Tabota Language Reference v1.2

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Positioning Systems](#positioning-systems)
3. [Nested Timelines](#nested-timelines)
4. [External References](#external-references)
5. [Complete Examples](#complete-examples)

---

## Core Concepts

### The Three Axes of Organization

Tabota separates **temporal flow** from **value semantics**, creating a flexible matrix:

| Temporal Regime | Description | Use Cases |
|----------------|-------------|-----------|
| **metered** | Musical time with BPM and beats | Traditional scores, rhythmic music |
| **chronological** | Absolute time in seconds/minutes | Sound design, film scores, precise timing |
| **achronous** | Sequential ordering without time | Interactive media, performer-dependent cues |

| Axis Mode | Description | Use Cases |
|-----------|-------------|-----------|
| **frequency** | Y-axis represents Hz | Pitched music, microtonal composition |
| **categorical** | Y-axis divided into named lanes | Percussion, MIDI triggers, lighting cues |
| **instructional** | Y-axis for visual layout only | Theater, performance art, conceptual scores |

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
  "startYValue": 440,
  "endYValue": 660
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
- `0.25` or `"25%"` = anchor is 25% through the event
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
      "axisMode": "frequency",
      "events": [...]
    },
    {
      "trackId": "Percussion",
      "axisMode": "categorical",
      "events": [...]
    },
    {
      "trackId": "FieldRecording",
      "temporalRegime": "chronological",  // Override parent regime!
      "regimeSettings": {"duration": 20},
      "startOffset": 4,
      "axisMode": "instructional",
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

### Pattern 1: Imports (Recommended)
Declare all external files at the top:

```json
{
  "projectName": "Main Composition",
  "imports": [
    {
      "id": "rain_ambience",
      "file": "./recordings/rain.json",
      "type": "full"
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
      "events": [...],
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

### Pattern 2: Direct File References
Reference files directly without imports:

```json
{
  "score": [
    {
      "externalFile": "./sections/intro.json",
      "parallelTo": {
        "section": "MainTheme",
        "startAt": 0
      }
    }
  ]
}
```

### Pattern 3: External Events
Import and position individual event patterns:

```json
{
  "events": [
    {
      "type": "external",
      "externalRef": "rock_pattern",
      "time": 16,
      "transform": {
        "timeOffset": 0,
        "transpose": 1.5,  // Multiply all yValues by 1.5
        "scale": 1.0       // Scale timing
      }
    }
  ]
}
```

### Pattern 4: Track References
Import entire tracks:

```json
{
  "tracks": [
    {
      "trackId": "Melody",
      "axisMode": "frequency",
      "events": [...]
    },
    {
      "externalRef": "drone_textures",
      "startOffset": 8
    }
  ]
}
```

---

## Complete Examples

### Example 1: Song with Field Recording Trigger

**main.json:**
```json
{
  "projectName": "Song with Rain",
  "languageVersion": "1.2",
  "imports": [
    {"id": "rain", "file": "./rain.json"}
  ],
  "score": [
    {
      "sectionId": "Song",
      "temporalRegime": "metered",
      "regimeSettings": {"beats": 32, "bpm": 120},
      "axisMode": "frequency",
      "modeSettings": {"minHz": 200, "maxHz": 800},
      "events": [
        {
          "type": "line",
          "startTime": 0,
          "duration": 8,
          "startYValue": 440,
          "endYValue": 523.25,
          "payload": {"comment": "Verse"}
        },
        {
          "type": "line",
          "startTime": 8,
          "duration": 8,
          "startYValue": 587.33,
          "endYValue": 659.25,
          "payload": {"comment": "Chorus - rain starts here"}
        }
      ],
      "childSections": [
        {
          "externalRef": "rain",
          "startTrigger": {
            "parentTime": 16,
            "anchorPosition": 0
          }
        }
      ]
    }
  ]
}
```

**rain.json:**
```json
{
  "projectName": "Rain Recording",
  "languageVersion": "1.2",
  "score": [
    {
      "sectionId": "RainAmbience",
      "temporalRegime": "chronological",
      "regimeSettings": {"duration": 30, "units": "seconds"},
      "axisMode": "frequency",
      "modeSettings": {"minHz": 100, "maxHz": 500},
      "events": [
        {
          "type": "point",
          "time": 0,
          "yValue": 220,
          "payload": {"text": "Rain starts"}
        }
      ]
    }
  ]
}
```

### Example 2: Multi-Track with Different Time Regimes

```json
{
  "projectName": "Mixed Regime Composition",
  "languageVersion": "1.2",
  "score": [
    {
      "sectionId": "MainSection",
      "temporalRegime": "metered",
      "regimeSettings": {"beats": 32, "bpm": 100},
      "tracks": [
        {
          "trackId": "MelodicLayer",
          "axisMode": "frequency",
          "modeSettings": {"minHz": 400, "maxHz": 1000},
          "events": [
            {
              "type": "line",
              "anchor": {"time": 16, "position": "50%"},
              "duration": 8,
              "startYValue": 440,
              "endYValue": 880,
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
        },
        {
          "trackId": "TimedSoundEffect",
          "temporalRegime": "chronological",
          "regimeSettings": {"duration": 15, "units": "seconds"},
          "startOffset": 8,
          "axisMode": "instructional",
          "events": [
            {
              "type": "point",
              "time": 0,
              "yValue": 50,
              "payload": {"text": "Whoosh sound effect"}
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 3: Modular Library System

**composition.json:**
```json
{
  "projectName": "Modular Piece",
  "languageVersion": "1.2",
  "imports": [
    {"id": "motif_a", "file": "./library/motif_a.json"},
    {"id": "motif_b", "file": "./library/motif_b.json"},
    {"id": "drums", "file": "./library/drums.json", "target": "Rock_Beat"}
  ],
  "score": [
    {
      "sectionId": "Intro",
      "temporalRegime": "metered",
      "regimeSettings": {"beats": 16, "bpm": 120},
      "axisMode": "frequency",
      "modeSettings": {"minHz": 200, "maxHz": 800},
      "events": [
        {
          "type": "external",
          "externalRef": "motif_a",
          "time": 0
        },
        {
          "type": "external",
          "externalRef": "motif_b",
          "time": 8,
          "transform": {
            "transpose": 1.5,
            "timeOffset": 0
          }
        },
        {
          "type": "external",
          "externalRef": "drums",
          "time": 4
        }
      ]
    }
  ]
}
```

---

## Processing Order

When rendering a Tabota score, follow this order:

1. **Load external files** from `imports` and direct references
2. **Resolve relative positioning** (events referencing other events)
3. **Calculate missing time values** (duration-based, anchor-based)
4. **Process parallel sections** and child sections
5. **Apply transforms** to external events
6. **Render to global timeline**

---

## Key Design Principles

1. **Separation of Concerns**: Time flow (regime) is independent of value semantics (mode)
2. **Modularity**: Build libraries of reusable patterns
3. **Flexibility**: Multiple positioning systems for different compositional needs
4. **Nestability**: Timelines within timelines, regimes within regimes
5. **Human Readability**: JSON is verbose but clear
6. **Machine Parsable**: Strict schema validation

---

## Use Cases

- **Microtonal Music**: frequency mode with custom tuning
- **Theatrical Scores**: instructional mode with achronous regime
- **Film Scores**: chronological regime with parallel sections
- **Interactive Media**: conditional triggers and external references
- **Live Coding**: Reference libraries and transform on-the-fly
- **Multimedia Installations**: Mixed regimes and nested timelines
- **Algorithmic Composition**: Generate and combine external modules
- **Collaborative Scores**: Multiple composers working on separate files

---

## Version History

- **v1.2**: Added external file references and percentage-based anchors
- **v1.1**: Added nested timelines (parallel sections, tracks, child sections)
- **v1.0**: Core specification (regimes, modes, events, positioning)

---

## Future Considerations

- **Conditional Execution**: More robust condition system
- **Live Parameters**: Real-time control mappings
- **Spatial Audio**: 3D positioning and movement
- **Video Sync**: Frame-accurate timing
- **MIDI/OSC Export**: Standard format conversion
- **Playback Engine**: Reference implementation
- **Visual Editor**: GUI for score creation