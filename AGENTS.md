# AGENTS.md — website and portfolio media

This repository is the source for both the main website (`index.html`) and the
slide portfolio (`portfolio/`). Images for the same work must not be maintained
twice. `work-images.json` is the source of truth for representative work images,
and `work-images.js` is generated from it.

The nested contract in `17/AGENTS.md` remains authoritative for everything
inside `17/`. Do not add Taper drafts to the public image manifest unless the
user explicitly asks for that piece to be published.

## Image policy

Use this order of preference:

1. Reuse a strong existing artwork, production still, poster, or documentary
   photograph.
2. For a work with a webpage, generate a stable browser capture.
3. For upload-, camera-, microphone-, or gesture-dependent work, add a curated
   fixture/action or record a `skipReason`. Never pass off an empty state as a
   representative image.

Generated captures live in `img/works/` and use a 4:3 master frame. Keep the
important subject near the center because the portfolio also presents the same
image in 16:9 cover crops.

Do not replace curated media already present in either view. The shared map is
a fallback for entries that do not already have an image.

## Agent workflow

When adding or materially changing a webpage work:

1. Add or update its record in `work-images.json`.
2. Prefer `image` pointing to an existing repository asset. Otherwise add a
   `capture` block with the canonical deployed URL and a bounded `waitMs`.
3. When a project source lives under `F:\xyh`, set `capture.localUrl` to its
   `http://localhost:8000/<project>/` route and run the shared root server before
   capturing. Keep `capture.url` as the canonical deployed URL.
4. Run one target first:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/capture-work-images.ps1 -Id <work-id>
   ```

5. Open the result and check framing, legibility, loading state, and whether the
   image honestly represents the work.
6. Run all straightforward captures only after the single-target result is good:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/capture-work-images.ps1 -All
   ```

7. Serve the repository and verify both `/` and `/portfolio/` at desktop and
   mobile widths. Check the browser console for failed images.

Useful commands:

```powershell
# Show configured targets and whether each preferred image exists
powershell -ExecutionPolicy Bypass -File scripts/capture-work-images.ps1 -List

# Rebuild work-images.js without taking screenshots
powershell -ExecutionPolicy Bypass -File scripts/capture-work-images.ps1 -SyncOnly
```

The capture script uses installed Microsoft Edge or Google Chrome in headless
mode and requires no npm or Python dependencies. It stages files under
`.capture/`, preserves the previous good image on failure, writes a compact
report there, and regenerates `work-images.js` from images that really exist.

## Manifest conventions

- `id`: stable kebab-case work identifier.
- `aliases`: IDs used by the other portfolio surface.
- `image`: repository-root-relative preferred image path.
- `alt`: concise description of what is visible, not the work's blurb.
- `capture.url`: canonical deployed page to capture.
- `capture.localUrl`: optional shared-root-server route used to render local
  source without waiting for deployment.
- `page`: canonical deployed page for a work that is intentionally skipped.
- `capture.waitMs`: bounded rendering time before capture.
- `skipReason`: why automation would produce a weak or misleading result.

If an automated frame is poor, adjust the work's capture-ready state or use a
curated existing asset. Do not add timing hacks repeatedly until a random frame
happens to look acceptable.
