// Harvests Happen: runs the goblincore scene (engine/, copied from
// renderedwork/goblincore) and loops its music in Web Audio.
//
// The music is a 15.000 s loop, sample for sample, and an AudioBufferSourceNode
// loops a decoded buffer with no gap, which a <video> or <audio> element does
// not. While the music plays, every frame is drawn at the music's own position
// (the audio clock, less output latency), so picture and sound cannot drift.
// Without sound, the engine runs on its own clock.
const $ = id => document.getElementById(id);
const LOOP = 15;   // seconds; scene.json loopSeconds and the music's length

function showFallback(reason) {
  $('view').hidden = true;
  $('fallback').hidden = false;
  $('fallback').preload = 'metadata';
  $('sound').hidden = true;
  $('note').textContent = `${reason} Showing the video instead; its sound may pause briefly where it loops.`;
}

if (!document.createElement('canvas').getContext('webgl2')) {
  showFallback('This browser cannot draw the scene live (no WebGL 2).');
} else {
  try {
    await import('./engine/goblincore.js');   // resolves once the scene has loaded
    start();
  } catch (error) {
    showFallback(`The live scene did not load (${error.message}).`);
  }
}

function start() {
  const button = $('sound');
  let ctx = null, buffer = null, source = null, t0 = 0, frame = 0;
  button.disabled = false;
  button.textContent = '▷ play with sound';

  async function load() {
    // 44.1 kHz context: the buffer is not resampled, so its loop point stays exact;
    // the browser resamples the output stream instead, which has no seam.
    ctx = new AudioContext({sampleRate: 44100});
    const bytes = await (await fetch('harvests-happen.flac')).arrayBuffer();
    buffer = await ctx.decodeAudioData(bytes);
  }

  function follow() {
    const t = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0) - t0;
    window.goblinAt(((t % LOOP) + LOOP) % LOOP);
    frame = requestAnimationFrame(follow);
  }

  async function play() {
    button.disabled = true; button.textContent = 'Loading sound…';
    if (!ctx) await load();
    await ctx.resume();
    source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true;
    source.connect(ctx.destination);
    t0 = ctx.currentTime + 0.05;
    source.start(t0);
    if ($('play').textContent === 'Pause') $('play').click();   // stop the engine's own clock
    frame = requestAnimationFrame(follow);
    button.disabled = false; button.textContent = '□ stop sound';
  }

  function stop() {
    source?.stop(); source = null;
    cancelAnimationFrame(frame);
    if ($('play').textContent === 'Play') $('play').click();    // the engine carries on alone
    button.textContent = '▷ play with sound';
  }

  button.addEventListener('click', () => {
    (source ? Promise.resolve(stop()) : play()).catch(error => {
      button.disabled = false; button.textContent = '▷ play with sound';
      $('note').textContent = `The sound could not start (${error.message}).`;
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !source) return;
    if (document.hidden) { cancelAnimationFrame(frame); ctx.suspend(); }
    else ctx.resume().then(() => { frame = requestAnimationFrame(follow); });
  });
}
