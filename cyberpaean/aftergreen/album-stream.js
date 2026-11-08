const MIME = "audio/mpeg";
const BUFFER_AHEAD = 75;
const KEEP_BEHIND = 45;

export function supportsMP3Stream() {
  return window.MediaSource?.isTypeSupported(MIME) ?? false;
}

function waitForEvent(target, type, signal) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const listeners = new AbortController();
    const options = { once: true, signal: listeners.signal };
    function finish(callback, value) {
      listeners.abort();
      callback(value);
    }
    target.addEventListener(type, () => finish(resolve), options);
    target.addEventListener("error", () => finish(reject, new Error("Audio buffer error")), options);
    signal.addEventListener("abort", () => finish(reject, signal.reason), options);
  });
}

export function openMP3Stream(audio, album, firstTrack, onError) {
  const source = new MediaSource();
  const controller = new AbortController();
  const { signal } = controller;
  const url = URL.createObjectURL(source);
  const seconds = (samples) => samples / album.sampleRate;

  async function fill() {
    await waitForEvent(source, "sourceopen", signal);
    const buffer = source.addSourceBuffer(MIME);
    // MP3 has no container timestamps. Sequence mode advances with each append.
    buffer.mode = "sequence";
    source.duration = seconds(album.samples);

    async function update(action) {
      signal.throwIfAborted();
      action();
      await waitForEvent(buffer, "updateend", signal);
    }

    async function reserveSpace() {
      while (buffer.buffered.length) {
        const playhead = audio.currentTime;
        if (buffer.buffered.start(0) < playhead - KEEP_BEHIND - 15) {
          await update(() => buffer.remove(0, playhead - KEEP_BEHIND));
        }
        if (buffer.buffered.end(buffer.buffered.length - 1) - playhead < BUFFER_AHEAD) break;
        await waitForEvent(audio, "timeupdate", signal);
      }
    }

    for (const track of album.tracks.slice(firstTrack)) {
      await reserveSpace();
      const response = await fetch("audio/" + encodeURIComponent(track.file), { signal });
      if (!response.ok || !response.body) throw new Error("Audio file unavailable");

      const start = seconds(track.start);
      buffer.appendWindowEnd = Infinity;
      buffer.appendWindowStart = start;
      buffer.appendWindowEnd = seconds(track.start + track.samples);
      buffer.timestampOffset = start - seconds(track.delay);

      // Skip the Xing metadata frame and append the MP3 frame stream in network chunks.
      let skip = track.firstFrame;
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = value.subarray(skip);
          skip = Math.max(0, skip - value.length);
          if (data.length) await update(() => buffer.appendBuffer(data));
          await reserveSpace();
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    }
    if (source.readyState === "open") source.endOfStream();
  }

  fill().catch((error) => {
    if (!signal.aborted) onError(error);
  });
  audio.src = url;

  return () => {
    controller.abort();
    URL.revokeObjectURL(url);
  };
}
