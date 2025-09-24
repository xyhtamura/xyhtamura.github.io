window.onload = () => {
    // --- DOM Elements ---
    const controlInput = document.getElementById('control-input');
    const sourceInput = document.getElementById('source-input');
    const sourceInputGroup = document.getElementById('source-input-group');
    const playButton = document.getElementById('play-button');
    const recordButton = document.getElementById('record-button');
    const recordingsList = document.getElementById('recordings-list');
    const selfSampleCheckbox = document.getElementById('self-sample-checkbox');
    const lookaheadGroup = document.getElementById('lookahead-group');
    
    const sliders = {
        threshold: document.getElementById('threshold'),
        grainSize: document.getElementById('grain-size'),
        grainDensity: document.getElementById('grain-density'),
        lookahead: document.getElementById('lookahead'),
        mix: document.getElementById('mix'),
        densityJitter: document.getElementById('density-jitter'),
        envelopeShape: document.getElementById('envelope-shape'),
    };
    const valueSpans = {
        threshold: document.getElementById('threshold-value'),
        grainSize: document.getElementById('grain-size-value'),
        grainDensity: document.getElementById('grain-density-value'),
        lookahead: document.getElementById('lookahead-value'),
        mix: document.getElementById('mix-value'),
        densityJitter: document.getElementById('density-jitter-value'),
        envelopeShape: document.getElementById('envelope-shape-value'),
    };
    const levelMeter = document.getElementById('level-meter');

    // --- Web Audio API Setup ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let controlBuffer = null;
    let sourceBuffer = null;
    let externalSourceBuffer = null;
    let controlSourceNode = null;
    let analyserNode = null;
    let mediaRecorder = null;
    let recordedChunks = [];

    // --- Audio Graph Nodes ---
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const masterOut = audioContext.createGain();
    masterOut.connect(audioContext.destination);


    // --- Audio State & Parameters ---
    let isPlaying = false;
    let isRecording = false;
    let isSelfSampling = false;
    let startTime = 0;
    const params = {
        threshold: 0.1,
        grainSize: 150,
        grainDensity: 20,
        lookahead: 0.5,
        mix: 0.7,
        densityJitter: 0,
        envelopeShape: 0.5,
    };
    let lastGrainTime = 0;
    let nextGrainInterval = 0;

    // --- File Loading ---
    const loadAudioFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => audioContext.decodeAudioData(e.target.result, resolve, reject);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

    const checkReadyState = () => {
        const ready = isSelfSampling ? controlBuffer : (controlBuffer && sourceBuffer);
        playButton.disabled = !ready;
        recordButton.disabled = !ready;
        if (ready) {
            playButton.textContent = "Start Pythia";
        } else {
            playButton.textContent = "Load Files to Start";
        }
    };

    controlInput.addEventListener('change', async (e) => {
        if (!e.target.files[0]) return;
        try {
            controlBuffer = await loadAudioFile(e.target.files[0]);
            if (isSelfSampling) sourceBuffer = controlBuffer;
            checkReadyState();
        } catch (error) { console.error("Error loading control file:", error); }
    });

    sourceInput.addEventListener('change', async (e) => {
        if (!e.target.files[0]) return;
        try {
            externalSourceBuffer = await loadAudioFile(e.target.files[0]);
            if (!isSelfSampling) sourceBuffer = externalSourceBuffer;
            checkReadyState();
        } catch (error) { console.error("Error loading source file:", error); }
    });
    
    // --- UI Updates ---
    selfSampleCheckbox.addEventListener('change', (e) => {
        isSelfSampling = e.target.checked;
        sourceInputGroup.style.opacity = isSelfSampling ? '0.5' : '1';
        sourceInput.disabled = isSelfSampling;
        sliders.lookahead.disabled = !isSelfSampling;
        lookaheadGroup.style.opacity = isSelfSampling ? '1' : '0.5';

        if (isSelfSampling) {
            sourceBuffer = controlBuffer;
        } else {
            sourceBuffer = externalSourceBuffer;
        }
        checkReadyState();
    });

    Object.keys(sliders).forEach(key => {
        sliders[key].addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            params[key] = value;
            valueSpans[key].textContent = value.toFixed(key === 'grainSize' ? 0 : 2);
            if (key === 'mix') {
                dryGain.gain.value = Math.cos(value * 0.5 * Math.PI);
                wetGain.gain.value = Math.cos((1.0 - value) * 0.5 * Math.PI);
            }
        });
    });
    
    // --- Core Audio Logic ---
    const calculateNextGrainInterval = () => {
        const baseInterval = 1 / params.grainDensity;
        const jitter = (Math.random() - 0.5) * baseInterval * params.densityJitter;
        nextGrainInterval = Math.max(0, baseInterval + jitter);
    };

    const triggerGrain = () => {
        if (!sourceBuffer) return;
        const grainDuration = params.grainSize / 1000;
        let startOffset = 0;

        if (isSelfSampling) {
            const currentPlaybackTime = (audioContext.currentTime - startTime) % controlBuffer.duration;
            startOffset = (currentPlaybackTime + params.lookahead) % sourceBuffer.duration;
        } else {
            startOffset = Math.random() * (sourceBuffer.duration - grainDuration);
        }
        
        if (startOffset + grainDuration > sourceBuffer.duration) {
            startOffset = sourceBuffer.duration - grainDuration;
        }

        const grain = audioContext.createBufferSource();
        const grainGain = audioContext.createGain();
        grain.buffer = sourceBuffer;
        
        const now = audioContext.currentTime;
        grainGain.gain.setValueAtTime(0, now);
        // Use the envelope shape parameter to control attack time
        const attackTime = grainDuration * params.envelopeShape;
        grainGain.gain.linearRampToValueAtTime(1, now + attackTime);
        grainGain.gain.linearRampToValueAtTime(0, now + grainDuration);

        grain.connect(grainGain).connect(wetGain);
        grain.start(now, Math.max(0, startOffset), grainDuration);
    };

    const analysisLoop = () => {
        if (!isPlaying) return;
        
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(dataArray);
        
        let sumSquares = 0.0;
        for (const amplitude of dataArray) {
            const val = (amplitude / 128.0) - 1.0;
            sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        levelMeter.style.width = `${Math.min(100, rms * 300)}%`;
        
        const now = audioContext.currentTime;
        
        if (rms > params.threshold && (now - lastGrainTime) > nextGrainInterval) {
            triggerGrain();
            lastGrainTime = now;
            calculateNextGrainInterval(); // Calculate the next random interval
        }
        requestAnimationFrame(analysisLoop);
    };

    // --- Playback Control ---
    const start = () => {
        if (isPlaying || !controlBuffer || !sourceBuffer) return;
        if (audioContext.state === 'suspended') audioContext.resume();
        
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;

        controlSourceNode = audioContext.createBufferSource();
        controlSourceNode.buffer = controlBuffer;
        controlSourceNode.loop = true;
        
        sliders.mix.dispatchEvent(new Event('input')); 
        
        controlSourceNode.connect(analyserNode);
        analyserNode.connect(dryGain);
        dryGain.connect(masterOut);
        wetGain.connect(masterOut);
        
        startTime = audioContext.currentTime;
        lastGrainTime = 0; // Reset grain timer
        calculateNextGrainInterval(); // Set the first interval
        controlSourceNode.start(startTime);
        
        isPlaying = true;
        playButton.textContent = "Stop Pythia";
        analysisLoop();
    };
    
    const stop = () => {
        if (!isPlaying) return;
        if (isRecording) stopRecording();
        controlSourceNode.stop();
        controlSourceNode = null;
        analyserNode = null;
        isPlaying = false;
        playButton.textContent = "Start Pythia";
        levelMeter.style.width = '0%';
    };

    playButton.addEventListener('click', () => {
        if (!isPlaying) start();
        else stop();
    });

    // --- Recording Logic ---
    const startRecording = () => {
        if (isRecording) return;
        
        const dest = audioContext.createMediaStreamDestination();
        masterOut.connect(dest);
        
        const mimeType = MediaRecorder.isTypeSupported('audio/wav') ? 'audio/wav' : 'audio/webm';
        
        mediaRecorder = new MediaRecorder(dest.stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const li = document.createElement('li');
            const a = document.createElement('a');
a.href = url;
            const extension = mimeType.includes('wav') ? 'wav' : 'webm';
            a.download = `pythia-recording-${new Date().toISOString()}.${extension}`;
            a.textContent = a.download;
            li.appendChild(a);
            recordingsList.appendChild(li);
            masterOut.disconnect(dest);
        };

        isRecording = true;
        mediaRecorder.start();
        recordButton.textContent = 'Stop Recording';
        recordButton.classList.add('recording');
    };

    const stopRecording = () => {
        if (!isRecording || !mediaRecorder) return;
        mediaRecorder.stop();
        isRecording = false;
        recordButton.textContent = 'Record';
        recordButton.classList.remove('recording');
    };

    recordButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
};