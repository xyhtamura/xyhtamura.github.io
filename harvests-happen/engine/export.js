/* VENDORED into xyhtamura.github.io/harvests-happen from renderedwork/goblincore/export.js
   sha256:2faa5d93b0236248. Refresh with renderedwork/goblincore/scripts/publish_site.py;
   do not edit this copy. */
// Frame-exact export of the loop: each frame is drawn at loop position i / frames,
// encoded with the timestamp it should have, and written to a WebM by the vendored
// framecast muxer. No frame is dropped however long a frame takes to draw.
//
// framecast's own export driver is not used: it pulls frames from a <video>, and this
// scene has none. The loop below follows ephemeralrenders/yero-rain-reel/export.js.
/* global FramecastWebM, VideoEncoder, VideoFrame */
const CODECS = ['vp09.00.40.08', 'vp09.00.10.08', 'vp8'];
const QUEUE_LIMIT = 8;
// Yields to the encoder's callbacks. A message, not a timer: a hidden tab holds
// timers to one a second.
const idle = () => new Promise(resolve => {
  const channel = new MessageChannel();
  channel.port1.onmessage = () => resolve();
  channel.port2.postMessage(0);
});

export const supported = () => typeof VideoEncoder === 'function' && typeof VideoFrame === 'function' && !!window.FramecastWebM;

// draw(index) must leave frame `index` in `canvas`, at the canvas's current size.
export async function exportLoop({canvas, draw, fps, frames, bitrate = 16e6, signal, onProgress = () => {}}) {
  if (!supported()) throw new Error('This browser has no WebCodecs video encoder. Use Chrome or Edge.');
  const width = canvas.width, height = canvas.height;
  let codec = null;
  for (const candidate of CODECS) {
    const support = await VideoEncoder.isConfigSupported({codec: candidate, width, height, bitrate, framerate: fps});
    if (support?.supported) { codec = candidate; break; }
  }
  if (!codec) throw new Error(`No VP9 or VP8 encoder at ${width}×${height}.`);
  const muxer = new FramecastWebM.Muxer({video: {codec: codec === 'vp8' ? 'V_VP8' : 'V_VP9', width, height,
    frameDurationNs: 1e9 / fps, codecPrivate: null}});
  let failure = null;
  const encoder = new VideoEncoder({
    output(chunk, metadata) {
      if (metadata?.decoderConfig?.description && !muxer.videoConfig.codecPrivate)
        muxer.videoConfig.codecPrivate = new Uint8Array(metadata.decoderConfig.description);
      const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data);
      muxer.addVideoChunk(data, chunk.timestamp, chunk.type === 'key');
    },
    error(error) { failure = error; },
  });
  encoder.configure({codec, width, height, bitrate, framerate: fps, latencyMode: 'quality'});
  const frameUs = 1e6 / fps;
  try {
    for (let index = 0; index < frames; index++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
      if (failure) throw failure;
      draw(index);
      // Read in the same task as the draw, before the WebGL buffer is presented and cleared.
      const frame = new VideoFrame(canvas, {timestamp: Math.round(index * frameUs), duration: Math.round(frameUs)});
      while (encoder.encodeQueueSize > QUEUE_LIMIT) await idle();
      encoder.encode(frame, {keyFrame: index % Math.round(fps * 2) === 0}); frame.close();
      onProgress({frame: index + 1, total: frames});
      if (index % 4 === 3) await idle();
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
  const written = muxer.frameCount, blob = muxer.finalize();
  return {blob, frames: written, seconds: frames / fps, codec, width, height};
}

// SHA-256 prefix of the canonical file the vendored muxer was copied from. Notifies; never swaps.
const FRAMECAST_CANON = {'/framecast/webm-muxer.js': 'e1fa493b25df8b3a'};
export async function checkFramecast() {
  if (location.protocol === 'file:') return;
  for (const [path, want] of Object.entries(FRAMECAST_CANON)) {
    try {
      const response = await fetch(path, {cache: 'no-store'});
      if (!response.ok) continue;
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await response.arrayBuffer()));
      const got = [...digest.slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (got !== want) console.warn(`framecast: ${path} is now ${got}; the vendored copy is from ${want}. Re-vendor when convenient.`);
    } catch { /* not served here */ }
  }
}
