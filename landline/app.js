/* The page: one performance of the score, made while you listen.
 *
 * The engine runs in a worker and hands back stereo chunks; this file schedules
 * them end to end on the audio clock, and reveals each negotiation at the
 * moment the playhead reaches the attempt that produced it — not when the
 * worker computed it, which is up to a minute earlier.
 */

const SR = 48000;
const CHUNK_SECONDS = 2.0;
const LEAD_TARGET_SECONDS = 8.0;

const el = (id) => document.getElementById(id);
const ui = {
  begin: el("begin"),
  stop: el("stop"),
  state: el("state"),
  volume: el("volume"),
  volumeRead: el("volume-read"),
  limiting: el("limiting"),
  elapsed: el("elapsed"),
  seed: el("seed"),
  permalink: el("permalink"),
  rate: el("rate"),
  storm: el("storm"),
  ladder: el("ladder"),
  transport: el("transport"),
};

const params = new URLSearchParams(location.search);

function drawSeed() {
  const given = params.get("seed");
  if (given !== null && /^\d+$/.test(given)) return Number(given) >>> 0;
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

/* The score says to choose the total duration. The two fixed renderings chose
 * 5:06 and 10:06; a visit draws something between them. */
function drawSeconds(rand) {
  const given = params.get("seconds");
  if (given !== null && /^\d+$/.test(given)) {
    return Math.min(900, Math.max(60, Number(given)));
  }
  return Math.round(300 + rand * 300);
}

let ctx = null;
let worker = null;
let master = null;
let guard = null;
let probeTap = null;
let tapFrame = null;
let analyserTimer = null;

let seed = drawSeed();
let seconds = 0;
let startTime = 0; // ctx.currentTime at which the piece began
let nextStartAt = 0; // ctx.currentTime for the next scheduled chunk
let pulling = false;
let finished = false;
let pending = []; // attempts computed but not yet reached by the playhead
let stormCurve = null;
let stormCeiling = 1;
let guardHoldUntil = 0;
let sources = [];

function fmt(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setState(text) {
  ui.state.textContent = text;
}

function volumeDb() {
  return Number(ui.volume.value);
}

function applyVolume() {
  const db = volumeDb();
  ui.volumeRead.textContent =
    db === 0 ? "0 dB — as recorded" : `${db > 0 ? "+" : ""}${db} dB`;
  if (master) {
    master.gain.setTargetAtTime(Math.pow(10, db / 20), ctx.currentTime, 0.02);
  }
}

/* The ceiling above which the guard starts shaping, and the curve that does it.
 * Below this the transfer function is exactly y = x, so at any volume setting
 * that does not clip, nothing is applied at all. */
const GUARD_THRESHOLD = 0.7079; // -3 dBFS

function guardCurve(n = 8193) {
  const curve = new Float32Array(n);
  const t = GUARD_THRESHOLD;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const a = Math.abs(x);
    const y = a <= t ? a : t + (1 - t) * Math.tanh((a - t) / (1 - t));
    curve[i] = Math.sign(x) * y;
  }
  return curve;
}

function buildGraph() {
  master = ctx.createGain();
  master.gain.value = Math.pow(10, volumeDb() / 20);

  /* A clipping guard, not a compressor.
   *
   * The first version of this used a DynamicsCompressorNode, which turned out
   * to be wrong twice over: measured in an OfflineAudioContext it raised a
   * -22 dBFS signal by 0.5 dB while reporting gain reduction it was not making,
   * and at +36 dB it still let the output reach +0.59 dBFS. So it coloured the
   * piece when it should have been idle and failed at the one job it had.
   *
   * A waveshaper is exact instead: identity below -3 dBFS, a smooth knee above
   * it, asymptotic to full scale and so incapable of passing anything louder.
   * The concert note on this piece asks for no dynamic processing, and that is
   * still the right instruction — at 0 dB the curve is a straight line and this
   * node is not doing anything. It exists because a volume control that can be
   * pushed 36 dB needs a floor under it, and the readout says when the shaping
   * starts. */
  guard = ctx.createWaveShaper();
  guard.curve = guardCurve();
  /* No oversampling, deliberately. The curve is exactly y = x below the
   * threshold and the node interpolates linearly between curve points, so with
   * the resamplers out of the path the sub-threshold signal passes bit for bit,
   * and the output cannot exceed the curve's asymptote. Measured at 4x, the
   * resampling filters both altered the signal below the threshold and let a
   * hard-driven peak overshoot to +0.6 dBFS. Aliasing when the guard is
   * actually shaping is the accepted cost; that state is already the piece
   * being altered, and it is announced. */
  guard.oversample = "none";

  // Tapped between the two so the readout measures what is going *into* the
  // guard, which is what decides whether it acts.
  probeTap = ctx.createAnalyser();
  probeTap.fftSize = 2048;
  tapFrame = new Float32Array(probeTap.fftSize);

  master.connect(probeTap);
  probeTap.connect(guard);
  guard.connect(ctx.destination);
}

function scheduleChunk(left, right, samples) {
  if (samples === 0) return;
  const buffer = ctx.createBuffer(2, samples, SR);
  buffer.copyToChannel(left.subarray(0, samples), 0);
  buffer.copyToChannel(right.subarray(0, samples), 1);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(master);
  const at = Math.max(nextStartAt, ctx.currentTime + 0.05);
  src.start(at);
  src.onended = () => {
    sources = sources.filter((s) => s !== src);
  };
  sources.push(src);
  if (startTime === 0) startTime = at;
  nextStartAt = at + samples / SR;
}

function pump() {
  if (!worker || finished || pulling) return;
  const lead = nextStartAt - ctx.currentTime;
  if (lead > LEAD_TARGET_SECONDS) return;
  pulling = true;
  worker.postMessage({ type: "pull", frames: Math.floor(CHUNK_SECONDS * SR) });
}

function reveal() {
  if (startTime === 0) return;
  const played = Math.max(0, ctx.currentTime - startTime);
  ui.elapsed.textContent = `${fmt(played)} / ${fmt(seconds)}`;

  if (stormCurve) {
    const s = stormCurve[Math.min(stormCurve.length - 1, Math.floor(played))];
    ui.storm.textContent = s.toFixed(2);
    ui.storm.style.setProperty("--fill", `${Math.min(100, (s / stormCeiling) * 100)}%`);
  }

  while (pending.length && pending[0].negotiated_at_s <= played) {
    const entry = pending.shift();
    const mode = entry.result === null ? "no connection" : entry.result.mode;
    ui.rate.textContent = mode;
    ui.rate.classList.toggle("dead", entry.result === null);
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="at">${fmt(entry.negotiated_at_s)}</span>` +
      `<span class="mode">${mode}</span>` +
      `<span class="bw">${entry.result === null ? "—" : entry.result.bandwidth_hz + " Hz"}</span>`;
    ui.ladder.append(li);
    ui.ladder.scrollTop = ui.ladder.scrollHeight;
  }

  if (probeTap) {
    probeTap.getFloatTimeDomainData(tapFrame);
    let m = 0;
    for (let i = 0; i < tapFrame.length; i++) m = Math.max(m, Math.abs(tapFrame[i]));
    /* The piece is mostly bed, so at a volume that shapes the fragments the
     * guard acts in bursts a second or two apart. Reporting that instant by
     * instant would flicker; the readout holds for two seconds after the last
     * one, which is what the listener needs to know — that this setting is
     * shaping the loud events, not that this exact moment is. */
    if (m > GUARD_THRESHOLD) {
      guardHoldUntil = ctx.currentTime + 2.0;
      ui.limiting.textContent =
        `clipping guard shaping peaks at ${(20 * Math.log10(m)).toFixed(1)} dBFS`;
    }
    ui.limiting.hidden = ctx.currentTime > guardHoldUntil;
  }

  if (finished && ctx.currentTime > nextStartAt) {
    setState("finished — the line stopped carrying anything");
    ui.transport.classList.add("done");
    clearInterval(analyserTimer);
    analyserTimer = null;
  }
}

function begin() {
  ctx = new AudioContext({ sampleRate: SR, latencyHint: "playback" });
  buildGraph();
  applyVolume();

  seconds = drawSeconds(Math.random());
  worker = new Worker("engine/worker.js", { type: "module" });
  worker.onmessage = (event) => {
    const msg = event.data;
    if (msg.type === "ready") {
      stormCurve = msg.storm;
      stormCeiling = msg.ceiling * 1.15;
      ui.seed.textContent = String(msg.seed);
      const link = new URL(location.href);
      link.search = `?seed=${msg.seed}&seconds=${msg.seconds}`;
      ui.permalink.href = link.toString();
      ui.permalink.textContent = "this performance again";
      setState("generating — playback starts shortly");
      pump();
      return;
    }
    if (msg.type === "chunk") {
      pulling = false;
      pending.push(...msg.attempts);
      scheduleChunk(msg.left, msg.right, msg.samples);
      finished = msg.finished;
      if (!finished) pump();
      if (startTime !== 0 && ui.transport.dataset.started !== "1") {
        ui.transport.dataset.started = "1";
        setState("playing");
      }
    }
  };

  worker.postMessage({ type: "start", seed, seconds });
  ui.begin.hidden = true;
  ui.stop.hidden = false;
  ui.transport.hidden = false;
  setState("preparing the performance");

  analyserTimer = setInterval(() => {
    reveal();
    pump();
  }, 100);

  if (ctx.sampleRate !== SR) {
    // The buffers carry their own rate, so the source node resamples them; this
    // is worth saying rather than hiding, because it is not what was rendered.
    console.info(
      `Audio context is running at ${ctx.sampleRate} Hz; the piece is made at ` +
        `${SR} Hz and is being resampled on playback.`
    );
  }
}

function stop() {
  for (const src of sources) {
    try {
      src.stop();
    } catch (e) {
      /* already ended */
    }
  }
  sources = [];
  if (worker) worker.postMessage({ type: "stop" });
  if (worker) worker.terminate();
  worker = null;
  if (analyserTimer) clearInterval(analyserTimer);
  analyserTimer = null;
  if (ctx) ctx.close();
  ctx = null;
  startTime = 0;
  nextStartAt = 0;
  finished = false;
  pending = [];
  ui.stop.hidden = true;
  ui.begin.hidden = false;
  ui.begin.textContent = "begin another performance";
  setState("stopped.");
}

ui.begin.addEventListener("click", begin);
ui.stop.addEventListener("click", stop);
ui.volume.addEventListener("input", applyVolume);
applyVolume();
