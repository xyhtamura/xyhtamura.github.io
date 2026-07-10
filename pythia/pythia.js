window.onload = () => {
    // ── DOM refs ──────────────────────────────────────────────────────────────
    const controlInput       = document.getElementById('control-input');
    const sourceInput        = document.getElementById('source-input');
    const sourceInputGroup   = document.getElementById('source-input-group');
    const playButton         = document.getElementById('play-button');
    const recordButton       = document.getElementById('record-button');
    const recordingsList     = document.getElementById('recordings-list');
    const selfSampleCheckbox = document.getElementById('self-sample-checkbox');
    const timeGroup          = document.getElementById('time-group');
    const modeRadios         = document.querySelectorAll('input[name="mode"]');
    const loopRadios         = document.querySelectorAll('input[name="loopmode"]');
    const delayGroup         = document.getElementById('delay-group');
    const thresholdGroup     = document.getElementById('threshold-group');
    const levelMeter         = document.getElementById('level-meter');

    // Viz
    const vizToggle          = document.getElementById('viz-toggle');
    const bufferSizeSelect   = document.getElementById('buffer-size');
    const vizPanel           = document.getElementById('viz-panel');
    const controlCanvas      = document.getElementById('control-canvas');
    const delayCanvas        = document.getElementById('delay-canvas');
    const sourceCanvas       = document.getElementById('source-canvas');
    const controlFileDisplay = document.getElementById('control-file-display');
    const sourceFileDisplay  = document.getElementById('source-file-display');

    // State toolbar
    const windowSelect   = document.getElementById('window-type');
    const saveStateBtn   = document.getElementById('save-state');
    const loadStateInput = document.getElementById('load-state');

    const sliders = {
        delay:         document.getElementById('delay'),
        threshold:     document.getElementById('threshold'),
        grainSize:     document.getElementById('grain-size'),
        grainDensity:  document.getElementById('grain-density'),
        time:          document.getElementById('time'),
        mix:           document.getElementById('mix'),
        densityJitter: document.getElementById('density-jitter'),
        envelopeShape: document.getElementById('envelope-shape'),
    };
    const valueSpans = {
        delay:         document.getElementById('delay-value'),
        threshold:     document.getElementById('threshold-value'),
        grainSize:     document.getElementById('grain-size-value'),
        grainDensity:  document.getElementById('grain-density-value'),
        time:          document.getElementById('time-value'),
        mix:           document.getElementById('mix-value'),
        densityJitter: document.getElementById('density-jitter-value'),
        envelopeShape: document.getElementById('envelope-shape-value'),
    };

    // ── Web Audio ─────────────────────────────────────────────────────────────
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let controlBuffer        = null;
    let sourceBuffer         = null;
    let externalSourceBuffer = null;
    let controlSourceNode    = null;
    let analyserNode         = null;
    let mediaRecorder        = null;
    let recordedChunks       = [];
    let controlRmsEnvelope   = [];

    const dryGain   = audioContext.createGain();
    const wetGain   = audioContext.createGain();
    const masterOut = audioContext.createGain();
    masterOut.connect(audioContext.destination);

    // ── Playback state ────────────────────────────────────────────────────────
    let isPlaying      = false;
    let isRecording    = false;
    let isSelfSampling = false;
    let operatingMode  = 'continuous';
    let startTime      = 0;
    let nextGrainInterval = 0;

    const params = {
        delay: 0, threshold: 0.1, grainSize: 150,
        grainDensity: 20, time: 0, mix: 0.7,
        densityJitter: 0, envelopeShape: 0.5,
    };
    // Clip loop mode: true = ⥀ ouroboros (reads wrap the clip; current default),
    // false = 𓆙 unloop (reads outside [0, D] don't sound, like a regular delay).
    let loopClip = true;
    // Grain amplitude window: 'linear' = the classic attack/decay ramps (default,
    // preserves current sound); 'hann' = a true raised-cosine window (no click at
    // short grain sizes). Hann ignores envelopeShape by construction.
    let windowType = 'linear';

    // ── Audio-clock scheduler ─────────────────────────────────────────────────
    // Grains are scheduled ahead against audioContext.currentTime rather than fired
    // at "now" from requestAnimationFrame. This decouples grain timing from the
    // frame rate (no jitter, no background-tab throttle) — a correctness fix with
    // no intended change to the sound.
    const SCHEDULE_AHEAD     = 0.1;   // seconds of lookahead window
    const SCHEDULER_INTERVAL = 25;    // ms between scheduler wakeups
    let schedulerTimer = null;
    let nextGrainTime  = 0;

    // Unit Hann window, sampled once; scaled per-grain by amplitude.
    const HANN_POINTS = 256;
    const hannUnit = new Float32Array(HANN_POINTS);
    for (let i = 0; i < HANN_POINTS; i++) {
        hannUnit[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (HANN_POINTS - 1)));
    }

    // ── Viz state ─────────────────────────────────────────────────────────────
    let vizEnabled           = true;
    let activeGrains         = [];
    let currentAmplitude     = 0;        // live amplitude, for dot opacity scaling
    let controlWaveformCache = null;     // offscreen canvas — teal
    let ampWaveformCache     = null;     // offscreen canvas — ember (same ctrl data, scrolled)
    let sourceWaveformCache  = null;

    // ── Pre-computation ───────────────────────────────────────────────────────
    const analyzeControlBuffer = () => {
        if (!controlBuffer) return;
        controlRmsEnvelope = [];
        const data = controlBuffer.getChannelData(0);
        const windowSize = 256;
        for (let i = 0; i < data.length; i += windowSize) {
            let sumSq = 0;
            const end = Math.min(i + windowSize, data.length);
            for (let j = i; j < end; j++) sumSq += data[j] * data[j];
            controlRmsEnvelope.push(Math.sqrt(sumSq / windowSize));
        }
    };

    const rawRmsAtTime = (t) => {
        if (!controlRmsEnvelope.length) return 0;
        const idx = Math.max(0, Math.min(
            controlRmsEnvelope.length - 1,
            Math.floor(t * audioContext.sampleRate / 256)
        ));
        return controlRmsEnvelope[idx];
    };

    const getRmsAtTime = (t) => rawRmsAtTime(t) * 4.0;

    // ── Waveform cache ────────────────────────────────────────────────────────
    // Builds an offscreen canvas from buffer data. Canvas sizing is handled by
    // refreshWaveformCaches — this function only draws.
    const buildWaveformCache = (buffer, w, h, waveColor = 'rgba(88,178,168,0.5)') => {
        const off = document.createElement('canvas');
        off.width  = w;
        off.height = h;
        const ctx  = off.getContext('2d');

        // bg
        ctx.fillStyle = '#111209';
        ctx.fillRect(0, 0, w, h);

        // centre line
        ctx.strokeStyle = 'rgba(51,55,32,0.7)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // waveform: min/max per pixel column
        const data = buffer.getChannelData(0);
        const step = Math.max(1, Math.floor(data.length / w));

        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            let min = 1, max = -1;
            const base = x * step;
            const end  = Math.min(base + step, data.length);
            for (let i = base; i < end; i++) {
                if (data[i] < min) min = data[i];
                if (data[i] > max) max = data[i];
            }
            const yTop = ((1 - max) / 2) * h;
            const yBot = ((1 - min) / 2) * h;
            ctx.moveTo(x + 0.5, yTop);
            ctx.lineTo(x + 0.5, yBot);
        }
        ctx.stroke();

        return off;
    };

    const refreshWaveformCaches = () => {
        if (!vizEnabled) return;
        if (controlBuffer && controlCanvas) {
            const w = controlCanvas.offsetWidth  || 800;
            const h = controlCanvas.offsetHeight || 72;
            controlCanvas.width  = w;
            controlCanvas.height = h;
            controlWaveformCache = buildWaveformCache(controlBuffer, w, h, 'rgba(88,178,168,0.5)');

            // Amp view: same ctrl data, ember colour, same dimensions
            if (delayCanvas) {
                delayCanvas.width  = w;
                delayCanvas.height = h;
                ampWaveformCache   = buildWaveformCache(controlBuffer, w, h, 'rgba(216,104,64,0.6)');
            }
        }
        if (sourceBuffer && sourceCanvas) {
            const w = sourceCanvas.offsetWidth  || 800;
            const h = sourceCanvas.offsetHeight || 72;
            sourceCanvas.width  = w;
            sourceCanvas.height = h;
            sourceWaveformCache = buildWaveformCache(sourceBuffer, w, h, 'rgba(88,178,168,0.5)');
        }
    };

    // ── Per-frame canvas rendering ────────────────────────────────────────────
    const renderControlCanvas = () => {
        if (!controlWaveformCache || !controlCanvas || !controlBuffer) return;
        const w   = controlCanvas.width;
        const h   = controlCanvas.height;
        const ctx = controlCanvas.getContext('2d');

        ctx.drawImage(controlWaveformCache, 0, 0);

        if (!isPlaying) return;

        const t = (audioContext.currentTime - startTime) % controlBuffer.duration;
        const x = (t / controlBuffer.duration) * w;

        // Playhead line — acid green
        ctx.strokeStyle = 'rgba(194,220,50,0.85)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        // Top marker triangle
        ctx.fillStyle = '#c2dc32';
        ctx.beginPath();
        ctx.moveTo(x - 4, 0);
        ctx.lineTo(x + 4, 0);
        ctx.lineTo(x,     6);
        ctx.closePath();
        ctx.fill();
    };

    // Delay / amplitude canvas.
    // The waveform IMAGE scrolls left/right based on params.delay — the terrain moves,
    // not the playhead. Positive delay shifts the waveform right (earlier content
    // drifts toward the playhead); negative delay shifts it left (future content).
    // The playhead pin stays at the same screen position as the ctrl canvas.
    // Works even when paused: the scroll preview reflects the current delay value.
    const renderDelayCanvas = () => {
        if (!ampWaveformCache || !delayCanvas || !controlBuffer) return;
        const w   = delayCanvas.width;
        const h   = delayCanvas.height;
        const ctx = delayCanvas.getContext('2d');

        // Pixel shift: positive delay → shift right (show earlier file content)
        const pixelShift = (params.delay / controlBuffer.duration) * w;
        // Wrap into [0, w) so we always draw exactly two tiles covering the canvas
        const wrapped = ((pixelShift % w) + w) % w;

        ctx.fillStyle = '#111209';
        ctx.fillRect(0, 0, w, h);

        // Two copies tile the canvas seamlessly regardless of shift
        ctx.drawImage(ampWaveformCache, wrapped - w, 0);
        ctx.drawImage(ampWaveformCache, wrapped,     0);

        if (!isPlaying) return;

        // Playhead fixed at same t position as ctrl canvas
        const t = (audioContext.currentTime - startTime) % controlBuffer.duration;
        const x = (t / controlBuffer.duration) * w;

        ctx.strokeStyle = 'rgba(216,104,64,0.85)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        ctx.fillStyle = '#d86840';
        ctx.beginPath();
        ctx.moveTo(x - 4, 0);
        ctx.lineTo(x + 4, 0);
        ctx.lineTo(x,     6);
        ctx.closePath();
        ctx.fill();
    };

    const renderSourceCanvas = () => {
        if (!sourceWaveformCache || !sourceCanvas || !sourceBuffer) return;
        const w   = sourceCanvas.width;
        const h   = sourceCanvas.height;
        const ctx = sourceCanvas.getContext('2d');
        const now = audioContext.currentTime;

        ctx.drawImage(sourceWaveformCache, 0, 0);

        // Prune expired grains
        activeGrains = activeGrains.filter(g => (now - g.firedAt) < g.duration);

        // Amplitude factor: scale dot visibility by current control amplitude.
        // Dots go nearly invisible when the control is quiet.
        const ampFactor = Math.min(1, Math.max(0, currentAmplitude));

        for (const g of activeGrains) {
            const age    = (now - g.firedAt) / g.duration;
            const alpha  = (1 - age) * 0.9 * ampFactor;
            const radius = 2.5 + (1 - age) * 4.5;
            const x      = (g.startOffset / sourceBuffer.duration) * w;
            const cy     = h / 2;

            // Outer glow
            ctx.beginPath();
            ctx.arc(x, cy, radius + 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(194,220,50,${alpha * 0.15})`;
            ctx.fill();

            // Dot
            ctx.beginPath();
            ctx.arc(x, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(194,220,50,${alpha})`;
            ctx.fill();
        }
    };

    // ── Drag and drop ─────────────────────────────────────────────────────────
    const setupDragDrop = (zone, onFile) => {
        zone.addEventListener('dragenter', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragover',  (e) => { e.preventDefault(); });
        zone.addEventListener('dragleave', (e) => {
            // Only remove if leaving the zone entirely, not a child element
            if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) onFile(file);
        });
    };

    setupDragDrop(document.getElementById('control-input-group'), async (file) => {
        try {
            controlBuffer = await loadAudioFile(file);
            analyzeControlBuffer();
            if (isSelfSampling) { sourceBuffer = controlBuffer; sourceFileDisplay.textContent = file.name; }
            controlWaveformCache = null;
            sourceWaveformCache  = null;
            controlFileDisplay.textContent = file.name;
            refreshWaveformCaches();
            checkReadyState();
        } catch (err) { console.error('Control drag-drop error:', err); }
    });

    setupDragDrop(document.getElementById('source-input-group'), async (file) => {
        if (isSelfSampling) return;
        try {
            externalSourceBuffer = await loadAudioFile(file);
            sourceBuffer        = externalSourceBuffer;
            sourceWaveformCache = null;
            sourceFileDisplay.textContent = file.name;
            refreshWaveformCaches();
            checkReadyState();
        } catch (err) { console.error('Source drag-drop error:', err); }
    });

    // ── File loading ──────────────────────────────────────────────────────────
    const loadAudioFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => audioContext.decodeAudioData(e.target.result, resolve, reject);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

    const checkReadyState = () => {
        const ready = isSelfSampling ? !!controlBuffer : (!!controlBuffer && !!sourceBuffer);
        playButton.disabled   = !ready;
        recordButton.disabled = !ready;
        playButton.textContent = ready ? 'Start Pythia' : 'Load Files to Start';
    };

    controlInput.addEventListener('change', async (e) => {
        if (!e.target.files[0]) return;
        try {
            controlBuffer = await loadAudioFile(e.target.files[0]);
            analyzeControlBuffer();
            if (isSelfSampling) { sourceBuffer = controlBuffer; sourceFileDisplay.textContent = e.target.files[0].name; }
            controlWaveformCache = null;
            sourceWaveformCache  = null;
            controlFileDisplay.textContent = e.target.files[0].name;
            refreshWaveformCaches();
            checkReadyState();
        } catch (err) { console.error('Control load error:', err); }
    });

    sourceInput.addEventListener('change', async (e) => {
        if (!e.target.files[0]) return;
        try {
            externalSourceBuffer = await loadAudioFile(e.target.files[0]);
            if (!isSelfSampling) {
                sourceBuffer        = externalSourceBuffer;
                sourceWaveformCache = null;
                sourceFileDisplay.textContent = e.target.files[0].name;
                refreshWaveformCaches();
            }
            checkReadyState();
        } catch (err) { console.error('Source load error:', err); }
    });

    // ── UI ────────────────────────────────────────────────────────────────────
    const updateModeUI = () => {
        delayGroup.classList.toggle('hidden', operatingMode !== 'continuous');
        thresholdGroup.classList.toggle('hidden', operatingMode === 'continuous');
    };

    modeRadios.forEach(r => r.addEventListener('change', (e) => {
        operatingMode = e.target.value;
        updateModeUI();
    }));

    loopRadios.forEach(r => r.addEventListener('change', (e) => {
        loopClip = (e.target.value === 'loop');
    }));

    selfSampleCheckbox.addEventListener('change', () => {
        isSelfSampling = selfSampleCheckbox.checked;
        sourceInputGroup.style.opacity = isSelfSampling ? '0.5' : '1';
        sourceInput.disabled           = isSelfSampling;
        // Lookahead is always active — not gated to self-sampling
        sourceBuffer        = isSelfSampling ? controlBuffer : externalSourceBuffer;
        sourceWaveformCache = null;
        refreshWaveformCaches();
        checkReadyState();
    });

    Object.keys(sliders).forEach(key => {
        sliders[key].addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            params[key] = v;
            valueSpans[key].textContent = v.toFixed(key === 'grainSize' ? 0 : 2);
            if (key === 'mix') {
                dryGain.gain.value = Math.cos(v * 0.5 * Math.PI);
                wetGain.gain.value = Math.cos((1 - v) * 0.5 * Math.PI);
            }
            // Preview the scrolled amp waveform immediately when delay changes, even when paused
            if (key === 'delay' && vizEnabled && ampWaveformCache && !isPlaying) {
                renderDelayCanvas();
            }
        });
    });

    // Viz toggle — hide panel, skip all canvas work in the loop
    vizToggle.addEventListener('change', () => {
        vizEnabled = vizToggle.checked;
        vizPanel.style.display = vizEnabled ? '' : 'none';
        if (vizEnabled) refreshWaveformCaches();
        else activeGrains = [];
    });

    // Buffer size — live-updates the analyser if playing; else applied on start()
    bufferSizeSelect.addEventListener('change', () => {
        if (analyserNode) analyserNode.fftSize = parseInt(bufferSizeSelect.value, 10);
    });

    // Rebuild waveform caches on resize (debounced 200ms)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            controlWaveformCache = null;
            ampWaveformCache     = null;
            sourceWaveformCache  = null;
            refreshWaveformCaches();
        }, 200);
    });

    // ── Core audio ────────────────────────────────────────────────────────────
    const calculateNextGrainInterval = () => {
        const base   = 1 / params.grainDensity;
        const jitter = (Math.random() - 0.5) * base * params.densityJitter;
        nextGrainInterval = Math.max(0.001, base + jitter);
    };

    const triggerGrain = (amplitude, when) => {
        if (!sourceBuffer || amplitude <= 0.001) return;

        const grainDuration = params.grainSize / 1000;

        // ── Source read position ──────────────────────────────────────────────
        // Grain reads the source at t − time, where t is the grain's own
        // scheduled playback time (not "now"). Positive time reads the past
        // (normal delay), negative reads the future (pre-echo).
        // Delay is NOT part of this — it only shifts which control amplitude shapes the grain.
        // Changing delay moves the amp canvas playhead, not the src grain dots.
        const t = (when - startTime) % controlBuffer.duration;
        let readPos = t - params.time;

        if (loopClip) {
            // ⥀ ouroboros: wrap reads past either edge back into the clip
            readPos = ((readPos % sourceBuffer.duration) + sourceBuffer.duration) % sourceBuffer.duration;
        } else if (readPos < 0 || readPos > sourceBuffer.duration) {
            // 𓆙 unloop: reads outside the clip simply don't sound
            return;
        }

        // Small positional jitter for granular texture (±½ grain duration)
        const posJitter = (Math.random() - 0.5) * grainDuration;
        const startOffset = Math.max(0, Math.min(sourceBuffer.duration - grainDuration, readPos + posJitter));

        // Log for viz
        if (vizEnabled) {
            activeGrains.push({ startOffset, firedAt: when, duration: grainDuration });
            if (activeGrains.length > 300) activeGrains.shift();
        }

        const grain     = audioContext.createBufferSource();
        const grainGain = audioContext.createGain();
        grain.buffer    = sourceBuffer;

        if (windowType === 'hann') {
            // Raised-cosine window, scaled to this grain's amplitude.
            const curve = new Float32Array(HANN_POINTS);
            for (let i = 0; i < HANN_POINTS; i++) curve[i] = hannUnit[i] * amplitude;
            grainGain.gain.setValueCurveAtTime(curve, when, grainDuration);
        } else {
            const attackTime = grainDuration * params.envelopeShape;
            grainGain.gain.setValueAtTime(0, when);
            grainGain.gain.linearRampToValueAtTime(amplitude, when + attackTime);
            grainGain.gain.linearRampToValueAtTime(0, when + grainDuration);
        }

        grain.connect(grainGain).connect(wetGain);
        grain.start(when, Math.max(0, startOffset), grainDuration);
    };

    // ── Grain scheduler ───────────────────────────────────────────────────────
    // Runs on a timer, scheduling every grain that falls inside the lookahead
    // window at its exact audio-clock time. Grain amplitude is read from the
    // precomputed control envelope at each grain's own scheduled time, so the
    // schedule is deterministic (no dependence on the live analyser).
    const scheduleGrains = () => {
        if (!isPlaying) return;
        const horizon = audioContext.currentTime + SCHEDULE_AHEAD;

        while (nextGrainTime < horizon) {
            const playbackT = (nextGrainTime - startTime) % controlBuffer.duration;

            if (operatingMode === 'continuous') {
                // Amplitude reads at t - delay in the control:
                //   delay=+D → reads D seconds into the past → output follows control with lag
                //   delay=-D → reads D seconds into the future → output anticipates control
                //   delay=0  → reads current control amplitude
                const ampT = ((playbackT - params.delay) % controlBuffer.duration
                              + controlBuffer.duration) % controlBuffer.duration;
                currentAmplitude = getRmsAtTime(ampT);
                triggerGrain(currentAmplitude, nextGrainTime);
            } else {
                // Threshold mode: fire at full amplitude when the control envelope
                // crosses threshold at the grain's scheduled time.
                const raw = rawRmsAtTime(playbackT);
                currentAmplitude = raw * 4; // normalise to match getRmsAtTime scale
                if (raw > params.threshold) triggerGrain(1.0, nextGrainTime);
            }

            calculateNextGrainInterval();
            nextGrainTime += nextGrainInterval;
        }
    };

    // ── Visual loop ───────────────────────────────────────────────────────────
    // Frame-rate work only: level meter + canvas viz. No audio scheduling here.
    const visualLoop = () => {
        if (!isPlaying) return;

        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(dataArray);
        let sumSq = 0;
        for (const amp of dataArray) { const v = (amp / 128) - 1; sumSq += v * v; }
        const liveRms = Math.sqrt(sumSq / dataArray.length);
        levelMeter.style.width = `${Math.min(100, liveRms * 300)}%`;

        if (vizEnabled) {
            renderControlCanvas();
            renderDelayCanvas();
            renderSourceCanvas();
        }

        requestAnimationFrame(visualLoop);
    };

    // ── Start / Stop ──────────────────────────────────────────────────────────
    const start = () => {
        if (isPlaying || !controlBuffer || !sourceBuffer) return;
        if (audioContext.state === 'suspended') audioContext.resume();

        analyserNode         = audioContext.createAnalyser();
        analyserNode.fftSize = parseInt(bufferSizeSelect.value, 10);

        controlSourceNode        = audioContext.createBufferSource();
        controlSourceNode.buffer = controlBuffer;
        controlSourceNode.loop   = true;

        sliders.mix.dispatchEvent(new Event('input'));

        controlSourceNode.connect(analyserNode);
        analyserNode.connect(dryGain);
        dryGain.connect(masterOut);
        wetGain.connect(masterOut);

        startTime     = audioContext.currentTime;
        nextGrainTime = startTime;
        activeGrains  = [];
        calculateNextGrainInterval();
        controlSourceNode.start(startTime);

        isPlaying              = true;
        playButton.textContent = 'Stop Pythia';
        schedulerTimer = setInterval(scheduleGrains, SCHEDULER_INTERVAL);
        scheduleGrains();  // prime the first window immediately
        visualLoop();
    };

    const stop = () => {
        if (!isPlaying) return;
        if (isRecording) stopRecording();

        if (schedulerTimer !== null) { clearInterval(schedulerTimer); schedulerTimer = null; }
        controlSourceNode.stop();
        controlSourceNode      = null;
        analyserNode           = null;
        isPlaying              = false;
        activeGrains           = [];
        playButton.textContent = 'Start Pythia';
        levelMeter.style.width = '0%';

        // Redraw waveforms without overlays
        if (vizEnabled) {
            if (controlWaveformCache && controlCanvas)
                controlCanvas.getContext('2d').drawImage(controlWaveformCache, 0, 0);
            if (ampWaveformCache && delayCanvas)
                renderDelayCanvas(); // uses the scrolling draw, just skips the playhead
            if (sourceWaveformCache && sourceCanvas)
                sourceCanvas.getContext('2d').drawImage(sourceWaveformCache, 0, 0);
        }
    };

    playButton.addEventListener('click', () => { if (!isPlaying) start(); else stop(); });

    // ── Recording ─────────────────────────────────────────────────────────────
    const startRecording = () => {
        if (isRecording) return;
        const dest     = audioContext.createMediaStreamDestination();
        masterOut.connect(dest);
        const mimeType = MediaRecorder.isTypeSupported('audio/wav') ? 'audio/wav' : 'audio/webm';
        mediaRecorder  = new MediaRecorder(dest.stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const url  = URL.createObjectURL(blob);
            const ext  = mimeType.includes('wav') ? 'wav' : 'webm';
            const a    = document.createElement('a');
            a.href       = url;
            a.download   = `pythia-${new Date().toISOString()}.${ext}`;
            a.textContent = a.download;
            const li = document.createElement('li');
            li.appendChild(a);
            recordingsList.appendChild(li);
            masterOut.disconnect(dest);
        };

        isRecording              = true;
        mediaRecorder.start();
        recordButton.textContent = 'Stop Recording';
        recordButton.classList.add('recording');
    };

    const stopRecording = () => {
        if (!isRecording || !mediaRecorder) return;
        mediaRecorder.stop();
        isRecording              = false;
        recordButton.textContent = 'Record';
        recordButton.classList.remove('recording');
    };

    recordButton.addEventListener('click', () => { if (!isRecording) startRecording(); else stopRecording(); });

    // ── State (single source of truth for JSON export/import) ──────────────────
    // Audio buffers stay out of the JSON — processing state only, so a saved
    // preset travels across files. Versioned from day one.
    const STATE_VERSION = 1;

    const serializeState = () => ({
        version:      STATE_VERSION,
        mode:         operatingMode,
        selfSampling: isSelfSampling,
        loopClip,
        windowType,
        params:       { ...params },
    });

    const applyState = (s) => {
        if (!s || typeof s !== 'object') return;
        if (s.params) {
            const p = { ...s.params };
            // Legacy migration: pre-Phase-1 states carry `lookahead` (read at
            // t + lookahead); the signed Time knob is its negation.
            if (p.time === undefined && typeof p.lookahead === 'number') p.time = -p.lookahead;
            Object.keys(sliders).forEach(key => {
                if (typeof p[key] === 'number') {
                    sliders[key].value = p[key];
                    sliders[key].dispatchEvent(new Event('input'));
                }
            });
        }
        if (typeof s.loopClip === 'boolean') {
            loopClip = s.loopClip;
            loopRadios.forEach(r => { r.checked = (r.value === (s.loopClip ? 'loop' : 'unloop')); });
        }
        if (s.windowType) {
            windowType = s.windowType;
            if (windowSelect) windowSelect.value = s.windowType;
        }
        if (s.mode) {
            operatingMode = s.mode;
            modeRadios.forEach(r => { r.checked = (r.value === s.mode); });
            updateModeUI();
        }
        if (typeof s.selfSampling === 'boolean') {
            selfSampleCheckbox.checked = s.selfSampling;
            selfSampleCheckbox.dispatchEvent(new Event('change'));
        }
    };

    if (windowSelect) {
        windowSelect.addEventListener('change', (e) => { windowType = e.target.value; });
    }

    if (saveStateBtn) {
        saveStateBtn.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(serializeState(), null, 2)], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `pythia-state-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (loadStateInput) {
        loadStateInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try { applyState(JSON.parse(ev.target.result)); }
                catch (err) { console.error('State load error:', err); }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    updateModeUI();
};
