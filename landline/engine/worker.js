/* The performance runs here, off the main thread.
 *
 * Generating the piece costs roughly a tenth of the time it takes to play, so
 * it keeps ahead comfortably — but it does so in bursts of a second or more,
 * which on the main thread would stall the page and, worse, the audio clock.
 */

import { Performance } from "./performance.js";
import { SR } from "./protocol.js";

let perf = null;

self.onmessage = (event) => {
  const msg = event.data;

  if (msg.type === "start") {
    perf = new Performance({ seed: msg.seed, seconds: msg.seconds });
    self.postMessage({
      type: "ready",
      seed: perf.seed,
      seconds: perf.seconds,
      totalSamples: perf.totalSamples,
      sampleRate: SR,
      gainDb: 20 * Math.log10(perf.gain),
      ceiling: perf.ceiling,
      storm: Array.from(perf.storm),
    });
    return;
  }

  if (msg.type === "pull" && perf) {
    const frames = msg.frames;
    const attempts = [];
    perf.ensure(perf.playhead + frames, (entry) => attempts.push(entry));
    const { left, right, samples } = perf.read(frames);
    self.postMessage(
      {
        type: "chunk",
        left,
        right,
        samples,
        attempts,
        finished: perf.finished,
        playheadSeconds: perf.playhead / SR,
        peakDbfs: perf.peakDbfs(),
      },
      [left.buffer, right.buffer]
    );
    return;
  }

  if (msg.type === "stop") {
    perf = null;
  }
};
