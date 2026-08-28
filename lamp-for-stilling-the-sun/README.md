# Lamp for Stilling the Sun

A browser light instrument with adjustable 4–18 Hz flicker, frequency drift,
duty-cycle jitter, brightness, color temperature, and masks. Optional network
seeding and camera feedback are off by default.

Use the instrument with your eyes closed. Face the light, close your eyes, then
start it. Do not look directly at the flashing field.

## Run

Serve the project root and open `/lamp-for-stilling-the-sun/`:

```text
F:\xyh\serve_root.bat
http://localhost:8000/lamp-for-stilling-the-sun/
```

There is no build step and no required network connection. The optional
network seed uses a public Wikipedia API response to initialize drift. Camera
feedback processes frames in the browser and requests permission when enabled.

## Safety behavior

- A three-second hold acknowledges a full-screen photosensitivity warning.
- Entering does not start the light; starting requires a second action.
- Brightness is capped and ramps in over 4.5 seconds.
- `Space` starts or pauses the light, including in fullscreen.
- `Escape` stops the light, as does leaving or hiding the tab.
- Camera and network modes are off by default.
- The light stays warm and low-saturation. Saturated color flicker—in
  particular, red and blue alternation—is a stricter photosensitivity hazard than
  luminance flicker alone, and is deliberately not offered. For the design
  constraints, see [SPEC.md](SPEC.md).

## Development log

**2026-08-28 — Codex —** Rewrote the warning gate, control labels, help text,
status messages, metadata description, and README introduction in the plain
interface register. Removed historical explanation, repeated descriptions,
metaphorical control names, and the footer assurance block. The warning retains
the 4–18 Hz range, seizure and physical-reaction risk, stop condition,
closed-eye instruction, and three-second hold. Checked the warning against W3C
WCAG 2.2 guidance, then verified the page at desktop and 390 px widths with no
horizontal overflow or console errors. The warning is a gate, not a claim that
the deliberately flashing instrument conforms to WCAG 2.2. The next development
step is unchanged: phase-delay light canvas and Web Audio drone synthesis.
