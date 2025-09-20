// A simple 2D noise function for GLSL
const noiseFunction = `
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
`;

// === THREE.JS SETUP =================================================
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const canvas = document.getElementById('main-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, preserveDrawingBuffer: true });
const canvasContainer = document.getElementById('canvas-container');
renderer.setSize(600, 600);
camera.position.z = 1;

// === GEOMETRY & MATERIAL =============================================
const geometry = new THREE.PlaneGeometry(2, 2);

const uniforms = {
    u_time: { value: 0.0 },
    u_texture: { value: null },
    u_aspect: { value: 1.0 },
    u_turbulence: { value: 0.5 },
    u_flowSpeed: { value: 0.1 },
    u_chromaticBleed: { value: 0.001 },
    u_phosphorSize: { value: 600.0 }
};

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D u_texture;
        uniform float u_time;
        uniform float u_aspect;
        uniform float u_turbulence;
        uniform float u_flowSpeed;
        uniform float u_chromaticBleed;
        uniform float u_phosphorSize;

        ${noiseFunction}

        void main() {
            // Correct UVs for noise calculation based on aspect ratio
            vec2 correctedUv = vUv - 0.5; // Center the coordinates
            correctedUv.x *= u_aspect; // Correct for aspect ratio
            correctedUv += 0.5; // Un-center

            // --- WARPING ---
            vec2 flow = vec2(
                (noise(correctedUv * 2.0 + u_time * u_flowSpeed) - 0.5) * 2.0,
                (noise(correctedUv * 2.0 - u_time * u_flowSpeed + 0.5) - 0.5) * 2.0
            );
            vec2 distortedUv = vUv + flow * u_turbulence * 0.1;

            // --- PHOSPHOR/PIXELATION ---
            vec2 phosphorUv = floor(distortedUv * u_phosphorSize) / u_phosphorSize;

            // --- COLOR ---
            float r = texture2D(u_texture, phosphorUv - u_chromaticBleed).r;
            float g = texture2D(u_texture, phosphorUv).g;
            float b = texture2D(u_texture, phosphorUv + u_chromaticBleed).b;

            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const persistenceGeometry = new THREE.PlaneGeometry(2, 2);
const persistenceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.05 });
const persistencePlane = new THREE.Mesh(persistenceGeometry, persistenceMaterial);
scene.add(persistencePlane);

// === HELPER FUNCTIONS =============================================
function updateAspectRatio(texture) {
    const MAX_SIZE = 600;
    const aspect = texture.image.naturalWidth / texture.image.naturalHeight;

    let newWidth, newHeight;
    
    // Reset scale before applying new values
    plane.scale.set(1, 1, 1);
    persistencePlane.scale.set(1, 1, 1);

    if (aspect >= 1) { // Landscape or square
        newWidth = MAX_SIZE;
        newHeight = MAX_SIZE / aspect;
        
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
        
        plane.scale.x = aspect;
        persistencePlane.scale.x = aspect;

    } else { // Portrait
        newWidth = MAX_SIZE * aspect;
        newHeight = MAX_SIZE;

        camera.left = -1;
        camera.right = 1;
        camera.top = 1 / aspect;
        camera.bottom = -1 / aspect;
        
        plane.scale.y = 1 / aspect;
        persistencePlane.scale.y = 1 / aspect;
    }

    // Apply changes
    camera.updateProjectionMatrix();
    canvasContainer.style.width = `${newWidth}px`;
    canvasContainer.style.height = `${newHeight}px`;
    renderer.setSize(newWidth, newHeight);
    uniforms.u_aspect.value = aspect;
}


function loadImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            new THREE.TextureLoader().load(event.target.result, (texture) => {
                uniforms.u_texture.value = texture;
                updateAspectRatio(texture);
                document.getElementById('drop-zone').classList.add('hidden');
            });
        };
        reader.readAsDataURL(file);
    }
}

// === UI & CONTROLS =================================================
function setupSliderSync(sliderId, numberId, uniformKey, options = {}) {
    const slider = document.getElementById(sliderId);
    const numberInput = document.getElementById(numberId);

    const updateValue = (value) => {
        let finalValue = parseFloat(value);
        if (options.isLog) finalValue = Math.pow(finalValue, 3);
        
        if (options.isOpacity) {
            persistenceMaterial.opacity = 1.0 - finalValue;
        } else if (uniformKey) {
            uniforms[uniformKey].value = finalValue;
        }
    };
    
    slider.addEventListener('input', () => { numberInput.value = slider.value; updateValue(slider.value); });
    numberInput.addEventListener('input', () => { slider.value = numberInput.value; updateValue(numberInput.value); });
}

setupSliderSync('turbulence', 'turbulence-num', 'u_turbulence');
setupSliderSync('flowSpeed', 'flowSpeed-num', 'u_flowSpeed', { isLog: true });
setupSliderSync('phosphorSize', 'phosphorSize-num', 'u_phosphorSize');
setupSliderSync('chromaticBleed', 'chromaticBleed-num', 'u_chromaticBleed');
setupSliderSync('persistence', 'persistence-num', null, { isOpacity: true });

// === FILE INPUTS =============================================
const dropZone = document.getElementById('drop-zone');
const body = document.body;
const fileUpload = document.getElementById('file-upload');
const uploadBtn = document.getElementById('upload-btn');
const uploadBtnPlaceholder = document.getElementById('upload-btn-placeholder');

body.addEventListener('dragover', (e) => { e.preventDefault(); body.classList.add('drag-over'); });
body.addEventListener('dragleave', () => { body.classList.remove('drag-over'); });
body.addEventListener('drop', (e) => {
    e.preventDefault();
    body.classList.remove('drag-over');
    loadImage(e.dataTransfer.files[0]);
});

uploadBtn.addEventListener('click', () => fileUpload.click());
uploadBtnPlaceholder.addEventListener('click', () => fileUpload.click());
fileUpload.addEventListener('change', (e) => loadImage(e.target.files[0]));


// === SAVE IMAGE BUTTON =============================================
document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'siltcrt-snapshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// === ANIMATION LOOP ================================================
function animate() {
    requestAnimationFrame(animate);
    if (uniforms.u_texture.value) { // Only render if there's an image
        uniforms.u_time.value += 0.01;
        
        persistencePlane.visible = true; 
        renderer.render(scene, camera);
        persistencePlane.visible = false;
        renderer.autoClear = false;
        renderer.render(scene, camera);
        renderer.autoClear = true;
    }
}

animate();