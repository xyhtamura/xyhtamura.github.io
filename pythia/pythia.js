window.onload = () => {
    // ── DOM refs ──────────────────────────────────────────────────────────────
    const controlInput       = document.getElementById('control-input');
    const sourceInput        = document.getElementById('source-input');
    const sourceInputGroup   = document.getElementById('source-input-group');
    const playButton         = document.getElementById('play-button');
    const recordButton       = document.getElementById('record-button');
    const recordingsList     = document.getElementById('recordings-list');
    const selfSampleCheckbox = document.getElementById('self-sample-checkbox');
    const lookaheadGroup     = document.getElementById('lookahead-group');
    const modeRadios         = document.querySelectorAll('input[name="mode"]');
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

    const sliders = {
        delay:         document.getElementById('delay'),
        threshold:     document.getElementById('threshold'),
        grainSize:     document.getElementById('grain-size'),
        grainDensity:  document.getElementById('grain-density'),
        lookahead:     document.getElementById('lookahead'),
        mix:           document.getElementById('mix'),
        densityJitter: document.getElementById('density-jitter'),
        envelopeShape: document.getElementById('envelope-shape'),
    };
    const valueSpans = {
        delay:         document.getElementById('delay-value'),
        threshold:     document.getElementById('threshold-value'),
        grainSize:     document.getElementById('grain-size-value'),
        grainDensity:  document.getElementById('grain-density-value'),
        lookahead:     document.getElementById('lookahead-value'),
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
    let lastGrainTime  = 0;
    let nextGrainInterval = 0;

    const params = {
        delay: 0, threshold: 0.1, grainSize: 150,
        grainDensity: 20, lookahead: 0.5, mix: 0.7,
        densityJitter: 0, envelopeShape: 0.5,
    };

    // ── Viz state ─────────────────────────────────────────────────────────────
    let vizEnabled           = true;
    let activeGrains         = [];
    let currentAmplitude     = 0;        // live amplitude, for dot opacity scaling
    let controlWaveformCache = null;     // offscreen canvas (shared by ctrl + delay views)
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

    const getRmsAtTime = (t) => {
        if (!controlRmsEnvelope.length) return 0;
        const idx = Math.max(0, Math.min(
            controlRmsEnvelope.length - 1,
            Math.floor(t * audioContext.sampleRate / 256)
        ));
        return controlRmsEnvelope[idx] * 4.0;
    };

    // ── Waveform cache ────────────────────────────────────────────────────────
    // Renders buffer to an offscreen canvas once; each frame blits cheaply.
    const buildWaveformCache = (buffer, referenceCanvas) => {
        const w = referenceCanvas.offsetWidth  || 800;
        const h = referenceCanvas.offsetHeight || 72;

        referenceCanvas.width  = w;
        referenceCanvas.height = h;

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

        ctx.strokeStyle = 'rgba(88,178,168,0.5)';
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
            controlWaveformCache = buildWaveformCache(controlBuffer, controlCanvas);
            // Delay canvas uses same waveform data — just size it and share the cache
            if (delayCanvas) {
                delayCanvas.width  = controlCanvas.width;
                delayCanvas.height = controlCanvas.height;
            }
        }
        if (sourceBuffer && sourceCanvas)
            sourceWaveformCache = buildWaveformCache(sourceBuffer, sourceCanvas);
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

    // Delay amplitude canvas: same waveform as ctrl, playhead at t - delay.
    // Shows which point in the control's timeline is currently shaping grain amplitude.
    // Gap between ctrl and delay playheads = the delay value.
    const renderDelayCanvas = () => {
        if (!controlWaveformCache || !delayCanvas || !controlBuffer) return;
        const w   = delayCanvas.width;
        const h   = delayCanvas.height;
        const ctx = delayCanvas.getContext('2d');

        ctx.drawImage(controlWaveformCache, 0, 0);

        if (!isPlaying) return;

        const t      = (audioContext.currentTime - startTime) % controlBuffer.duration;
        const ampT   = ((t - params.delay) % controlBuffer.duration + controlBuffer.duration) % controlBuffer.duration;
        const x      = (ampT / controlBuffer.duration) * w;

        // Playhead line — ember/terracotta
        ctx.strokeStyle = 'rgba(216,104,64,0.85)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        // Top marker triangle
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

    const triggerGrain = (amplitude = 1.0) => {
        if (!sourceBuffer || amplitude <= 0.001) return;

        const grainDuration = params.grainSize / 1000;

        // ── Source read position ──────────────────────────────────────────────
        // Source always reads at t + lookahead.
        // Delay is NOT part of this — it only shifts which control amplitude shapes the grain.
        // Changing delay moves the amp canvas playhead, not the src grain dots.
        const t = (audioContext.currentTime - startTime) % controlBuffer.duration;
        const center = ((t + params.lookahead) % sourceBuffer.duration
                        + sourceBuffer.duration) % sourceBuffer.duration;

        // Small positional jitter for granular texture (±½ grain duration)
        const posJitter = (Math.random() - 0.5) * grainDuration;
        const startOffset = Math.max(0, Math.min(sourceBuffer.duration - grainDuration, center + posJitter));

        // Log for viz
        if (vizEnabled) {
            activeGrains.push({ startOffset, firedAt: audioContext.currentTime, duration: grainDuration });
            if (activeGrains.length > 300) activeGrains.shift();
        }

        const grain     = audioContext.createBufferSource();
        const grainGain = audioContext.createGain();
        grain.buffer    = sourceBuffer;

        const now        = audioContext.currentTime;
        const attackTime = grainDuration * params.envelopeShape;
        grainGain.gain.setValueAtTime(0, now);
        grainGain.gain.linearRampToValueAtTime(amplitude, now + attackTime);
        grainGain.gain.linearRampToValueAtTime(0, now + grainDuration);

        grain.connect(grainGain).connect(wetGain);
        grain.start(now, Math.max(0, startOffset), grainDuration);
    };

    // ── Playback loop ─────────────────────────────────────────────────────────
    const playbackLoop = () => {
        if (!isPlaying) return;

        const now = audioContext.currentTime;
        const currentPlaybackTime = (now - startTime) % controlBuffer.duration;

        // Level meter
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(dataArray);
        let sumSq = 0;
        for (const amp of dataArray) { const v = (amp / 128) - 1; sumSq += v * v; }
        const liveRms = Math.sqrt(sumSq / dataArray.length);
        levelMeter.style.width = `${Math.min(100, liveRms * 300)}%`;

        // Canvas viz
        if (vizEnabled) {
            renderControlCanvas();
            renderDelayCanvas();
            renderSourceCanvas();
        }

        // Grain generation
        if ((now - lastGrainTime) > nextGrainInterval) {
            if (operatingMode === 'continuous') {
                // Amplitude reads at t - delay in the control:
                //   delay=+D → reads D seconds into the past → output follows control with lag
                //   delay=-D → reads D seconds into the future → output anticipates control
                //   delay=0  → reads current control amplitude
                const ampT = ((currentPlaybackTime - params.delay) % controlBuffer.duration
                              + controlBuffer.duration) % controlBuffer.duration;
                currentAmplitude = getRmsAtTime(ampT);
                triggerGrain(currentAmplitude);
            } else {
                // Threshold mode: fire at full amplitude when live level crosses threshold
                currentAmplitude = liveRms * 4; // normalise to match getRmsAtTime scale
                if (liveRms > params.threshold) triggerGrain(1.0);
            }
            lastGrainTime = now;
            calculateNextGrainInterval();
        }

        requestAnimationFrame(playbackLoop);
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
        lastGrainTime = 0;
        activeGrains  = [];
        calculateNextGrainInterval();
        controlSourceNode.start(startTime);

        isPlaying              = true;
        playButton.textContent = 'Stop Pythia';
        playbackLoop();
    };

    const stop = () => {
        if (!isPlaying) return;
        if (isRecording) stopRecording();

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

    // ── Init ──────────────────────────────────────────────────────────────────
    updateModeUI();
};
