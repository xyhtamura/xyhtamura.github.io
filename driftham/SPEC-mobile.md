# DriftHam mobile app

Implementation spec, 2026-10-11. Planned work; no mobile build exists.
Progress: [project notes](driftham.md).

DriftHam's mobile app will keep the ham interface and play successive internet
radio stations while the screen is locked. Android is the first target; iOS
follows after the background-playback design passes on a physical Android phone.

## Baseline and scope

The browser app lives in `index.html`. It uses two HTML audio elements during
crossfades, a playback-event gate, and animation frames for fades and drift
deadlines. Browser animation frames generally pause when the page is hidden
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)),
so installing or wrapping the page alone does not establish background drift.

The first release will retain these behaviors:

- Random station selection from Radio Browser, with its mirror failover and
  HTTPS, non-HLS, last-check-OK filtering.
- A 20% curated-source selection chance, with curated fallback when the
  directory is unavailable, and provider attribution.
- A uniformly sampled 30–180-second default drift interval, adjustable through
  the existing range control.
- Tune In, Skip, Hold, crossfade or cut, station likes, notes, and text-log export.
- Acceptance of quiet, noisy, and dead-air streams that start playback.
  Playback events establish decoding, not the identity or content of a sound.

The mobile release will add background playback, system media controls,
persistent settings and logs, and native sharing. Accounts, cloud sync,
recording, rehosting, ICY track metadata, HLS expansion, and reactive spectra are
outside this release. The source-mix control remains deferred until the Android
background prototype passes.

## Architecture

Use Capacitor to package the HTML/CSS interface with a native playback bridge.
Native builds require package and platform tooling because the operating system
must own background audio. The browser alternative remains a static app on
GitHub Pages, using the same interface through a browser playback adapter.
The native shell must bundle local web assets.

Keep the mobile build tooling separate from the files deployed to Pages. Pin
dependencies when implementation starts, record licenses and build instructions,
and exclude generated build output, signing credentials, and development caches
from version control. Repository placement and platform minimums are to be
settled at milestone 1, before adding tooling.

The native playback controller will own station discovery and selection,
stream probes, both players, drift deadlines, fades, recovery, and session-log
writes. These operations must survive suspension of the web interface. Port
the selection rules with shared fixtures.

The interface will send commands and render controller snapshots. Its animation
frames will draw the dial and decorative layers only. The browser adapter will
retain browser playback, with drift scheduling separated from dial rendering;
browser background behavior will remain subject to browser restrictions.

Android will use Media3 players and a `MediaSessionService` for background audio
and system controls ([Android background playback](https://developer.android.com/media/media3/session/background-playback)).
iOS will use native AVPlayer playback, an `AVAudioSession` playback category,
background audio mode, and system now-playing controls
([Apple audio sessions](https://developer.apple.com/documentation/avfaudio/avaudiosession)).
Two-player crossfading and deadline scheduling require a device prototype.

## Playback contract

| Command | Required behavior |
| --- | --- |
| Tune In | Start a session or resume paused playback after explicit user input. |
| Pause | Silence both players, suspend drift, and retain the station and remaining interval. |
| Stop | Release both players, cancel pending work, and close the current log visit. |
| Skip | Cancel the pending transition and probe a different station. |
| Hold | Keep playing the station and suspend automatic drift. |
| Release Hold | Start a fresh sampled interval on the held station. |
| Set range or blend | Apply the setting to subsequent intervals or transitions. |
| Set volume | Apply the master gain to both players, including during a fade. |
| Like or note | Update the identified visit, even if the station changes before delivery. |

Resume will attempt the same live stream; if it fails, recovery may select another station. A Skip
while Hold is active will select another station and keep Hold active.

Use monotonic time for deadlines and fades, and wall-clock timestamps for log
entries. Start an interval when a candidate begins playback and is promoted.
During a transition, keep the previous stream until the candidate passes the
gate. Retain the existing 8-second probe timeout, seven-attempt search limit,
and 2.2-second crossfade as initial values.

After a failed search cycle, retry after 2 seconds, doubling the delay to a
30-second cap. Keep a playable current stream while searching. When the network
is unavailable, wait for connectivity; Pause and Stop cancel recovery. A
recovered stream starts a fresh interval. Display the recovery state explicitly.

Serialize state changes and assign each transition a generation ID. Late probe
results from canceled generations must release their player without promotion.
Stop during a probe or fade must prevent subsequent playback. Skip during a
fade must settle the outgoing player before probing again, with at most two
active players. Reopening the interface must attach to the existing session.

Each command will carry an ID. Snapshots will carry a revision, playback state,
station and visit IDs, Hold state, remaining interval, settings, and recovery
status. On attachment, subscribe to events and obtain a snapshot; ignore older
revisions. Native state is authoritative when displayed state disagrees.

## System integration and storage

Expose Play/Pause, Next as Skip, and station name through system media controls.
Show provider attribution in the app. Keep the decorative dial frequency out of
system metadata. Hold remains an app control.

On a call or loss of audio focus, suspend playback and drift. Resume only when
the platform permits it and no user Pause or Stop intervened. Headphone
disconnection will pause playback and require explicit resume.

Store settings, likes, notes, and visit records locally with a versioned schema.
Commit each promotion, departure, like, and note through the controller so a
suspended interface cannot lose the session. Retain station ID, stream URL,
provider, website, timestamps, and exit reason. Close an interrupted visit on
relaunch without inventing its departure time. App relaunch restores records
and settings but requires explicit input to start audio.

Export a UTF-8 text log through native sharing without stopping playback.
Provide a confirmed action to clear stored listening history. No analytics or
cloud collection is planned; direct directory and stream requests still expose
network information to their providers. Live listening requires connectivity.
Check provider terms and prepare the corresponding store privacy disclosures
before public distribution.

## Phone interface

Preserve the ham's visual design while reserving safe areas around system bars.
Measure touch targets after scaling: primary controls must have at least a
48-by-48 logical-pixel hit area. If the scaled design cannot accommodate them,
reflow the controls rather than shrink their hit areas.

Test portrait, landscape, larger text, the notes keyboard, and screen-reader
names. Include explicit Pause and Stop actions, visible keyboard focus, and
textual playback states. Respect reduced motion. Recheck sheen and gloss
clipping on phones; the desktop clipping check did not reproduce the reported
mobile fault.

## Milestones and acceptance

1. **Android background prototype.** Select the repository layout, pin the
   toolchain, and build a minimal native player with curated and directory
   selection, probing, Hold, Skip, and both blend modes. Pass the locked-screen
   test before integrating the full interface.
2. **Shared interface and bridge.** Extract the browser modules, implement the
   command/snapshot contract, and connect the ham to native state.
3. **Mobile beta.** Add persistence, sharing, interruption handling, phone
   layout, and accessibility. Produce a signed installable Android beta.
4. **iOS port.** Build and repeat the acceptance suite on a physical iPhone.
   This requires Mac/Xcode access
   ([Capacitor environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup)).
5. **Public distribution.** Complete attribution, license notices, privacy
   disclosures, icons, screenshots, signing, and store submission requirements.
   Check store requirements at submission time.

Record device, OS, build, source, and observed result:

| Check | Pass condition |
| --- | --- |
| Locked screen | A 20-minute session completes at least five automatic changes without reopening the app; native logs record scheduled and actual transitions. |
| Blend | Crossfade and cut both work while locked; listening confirms the fade, and traces show no retained outgoing player. |
| Hold and controls | Hold prevents changes for five minutes; system Pause silences both players, Play resumes, and Next changes station. |
| Cancellation | Repeated Skip and Stop during probes and fades produce no late promotion, duplicate visits, or playback after Stop. |
| Recovery | A dead URL, directory outage, network loss, and Wi-Fi/mobile handoff follow the recovery policy without an unbounded probe loop. |
| Interruptions | A call and headphone disconnection follow the specified resume policy. |
| Persistence | Relaunch retains likes, notes, settings, and logs without starting audio; shared text includes provider attribution. |
| Interface | Physical-phone checks confirm target sizes, safe areas, keyboard access, text sizing, and clipping. |
| Browser | Tune In, Skip, Hold, both blends, curated fallback, and log export remain usable from the static Pages build. |

Measure battery drain and network bytes over a one-hour locked session, recording
device, stream bitrate, transition count, and overlap time. Platform minimums, acceptable
resource budgets, store accounts, and release pricing remain release decisions.
