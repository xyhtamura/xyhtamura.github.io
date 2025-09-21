// A simple 2D noise function for GLSL
const noiseFunction = `
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
`;

// A hash function to create pseudo-random points for Voronoi cells
const voronoiHash = `
    vec2 hash22(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }
`;

// === THREE.JS SETUP =================================================
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const canvas = document.getElementById('main-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 1);
renderer.autoClear = true;
const canvasContainer = document.getElementById('canvas-container');
renderer.setSize(200, 200);
camera.position.z = 1;

// === GEOMETRY & MATERIAL =============================================
const geometry = new THREE.PlaneGeometry(2, 2);

const uniforms = {
  u_time: { value: 0.0 },
  u_texture: { value: null },
  u_aspect: { value: 1.0 },
  u_turbulence: { value: 0.0 },     
  u_flowSpeed: { value: 0.0 },      
  u_chromaticBleed: { value: 0.001 },
  u_phosphorSize: { value: 7500.0 },
  u_softness: { value: 0.5 },
  u_bloomIntensity: { value: 0.8 },
  u_bloomThreshold: { value: 0.7 },
  u_bloomRadius: { value: 2.0 }, // New
  u_umbraIntensity: { value: 0.5 },
  u_umbraThreshold: { value: 0.3 },
  u_umbraRadius: { value: 2.0 }, // New
  u_texel: { value: new THREE.Vector2(1/1024, 1/1024) }
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
        uniform float u_softness;
        uniform float u_bloomIntensity;
        uniform float u_bloomThreshold;
        uniform float u_bloomRadius; // New
        uniform float u_umbraIntensity;
        uniform float u_umbraThreshold;
        uniform float u_umbraRadius; // New
        uniform vec2 u_texel;

        ${noiseFunction}
        ${voronoiHash}
        
        float luminance(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
        
        vec3 kawaseBloom(sampler2D tex, vec2 uv, float radius, float threshold, float intensity, vec2 texel, float time){
            const int N = 12;
            float angStep = 6.2831853 / float(N);
            float rot = fract(time * 0.03) * 6.2831853;
            vec3 acc = vec3(0.0);
            float wsum = 0.0;
            for (int i = 0; i < N; ++i) {
                float a = rot + angStep * float(i);
                vec2 dir = vec2(cos(a), sin(a));
                for (int r = 1; r <= 3; ++r) {
                    vec2 offs = dir * texel * (radius * float(r));
                    vec3 c = texture2D(tex, uv + offs).rgb;
                    float b = max(0.0, luminance(c) - threshold);
                    float w = 1.0 / float(r);
                    acc += c * b * w;
                    wsum += w;
                }
            }
            if (wsum > 0.0) acc /= wsum;
            return acc * intensity;
        }
        
        // --- NEW: Kawase Umbra function ---
        // Mirrors the bloom function but calculates a dimming factor based on darkness
        float kawaseUmbra(sampler2D tex, vec2 uv, float radius, float threshold, float intensity, vec2 texel, float time){
            const int N = 12;
            float angStep = 6.2831853 / float(N);
            float rot = fract(time * 0.03) * 6.2831853;
            float acc = 0.0;
            float wsum = 0.0;
            for (int i = 0; i < N; ++i) {
                float a = rot + angStep * float(i);
                vec2 dir = vec2(cos(a), sin(a));
                for (int r = 1; r <= 3; ++r) {
                    vec2 offs = dir * texel * (radius * float(r));
                    vec3 c = texture2D(tex, uv + offs).rgb;
                    // Inverted logic: check how FAR BELOW the threshold the luminance is
                    float b = max(0.0, threshold - luminance(c));
                    float w = 1.0 / float(r);
                    acc += b * w;
                    wsum += w;
                }
            }
            if (wsum > 0.0) acc /= wsum;
            return acc * intensity;
        }

        void main() {
            vec2 correctedUv = vUv - 0.5;
            correctedUv.x *= u_aspect;
            correctedUv += 0.5;

            // --- WARPING ---
            vec2 flow = vec2(
                (noise(correctedUv * 2.0 + u_time * u_flowSpeed) - 0.5) * 2.0,
                (noise(correctedUv * 2.0 - u_time * u_flowSpeed + 0.5) - 0.5) * 2.0
            );
            vec2 distortedUv = vUv + flow * u_turbulence * 0.1;

            // --- PROBABILISTIC VORONOI CELLS ---
            // This part is now only for the main image, not bloom/umbra
            vec2 uv = distortedUv;
            uv.x *= u_aspect;
            uv *= u_phosphorSize / 20.0;
            vec2 i_uv = floor(uv);

            vec2 points[9];
            float dists[9];
            int index = 0;
            for (int i = -1; i <= 1; i++) {
                for (int j = -1; j <= 1; j++) {
                    vec2 neighbor = vec2(float(i), float(j));
                    vec2 seed_point = i_uv + neighbor + hash22(i_uv + neighbor) * 0.5 + 0.5;
                    points[index] = seed_point;
                    dists[index] = length(seed_point - uv);
                    index++;
                }
            }

            // --- VORONOI WEIGHTING AND SELECTION ---
            float total_weight = 0.0;
            float weights[9];
            for (int k = 0; k < 9; k++) {
                float power = mix(16.0, 2.0, u_softness);
                float weight = 1.0 / (pow(dists[k], power) + 0.0001);
                weights[k] = weight;
                total_weight += weight;
            }
            vec2 final_point_pos = points[0];
            float roll = noise(vUv * 5.0 + u_time) * total_weight;
            float cumulative_weight = 0.0;
            for (int k = 0; k < 9; k++) {
                cumulative_weight += weights[k];
                if (roll < cumulative_weight) {
                    final_point_pos = points[k];
                    break;
                }
            }
            vec2 phosphorUv = final_point_pos / (u_phosphorSize / 20.0);
            phosphorUv.x /= u_aspect;

            // --- FINAL COLOR ASSEMBLY ---
            float r = texture2D(u_texture, phosphorUv - u_chromaticBleed).r;
            float g = texture2D(u_texture, phosphorUv).g;
            float b = texture2D(u_texture, phosphorUv + u_chromaticBleed).b;

            vec3 final_color = vec3(r, g, b);
            
            // Apply Kawase Bloom
            vec3 bloom_color = kawaseBloom(u_texture, distortedUv, u_bloomRadius, u_bloomThreshold, u_bloomIntensity, u_texel, u_time);
            final_color += bloom_color;
            
            // --- REVISED: Apply Kawase Umbra ---
            // The old Voronoi loop is gone, replaced with this single line
            float total_umbra_dimming = kawaseUmbra(u_texture, distortedUv, u_umbraRadius, u_umbraThreshold, u_umbraIntensity, u_texel, u_time);
            final_color -= total_umbra_dimming;

            gl_FragColor = vec4(clamp(final_color, 0.0, 1.0), 1.0);
        }
    `
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// === HELPER FUNCTIONS =============================================
function updateAspectRatio(texture) {
    const MAX_SIZE = 600;
    const aspect = texture.image.naturalWidth / texture.image.naturalHeight;
    let newWidth, newHeight;
    plane.scale.set(1, 1, 1);
    if (aspect >= 1) { newWidth = MAX_SIZE; newHeight = MAX_SIZE / aspect; camera.left = -aspect; camera.right = aspect; camera.top = 1; camera.bottom = -1; plane.scale.x = aspect; } 
    else { newWidth = MAX_SIZE * aspect; newHeight = MAX_SIZE; camera.left = -1; camera.right = 1; camera.top = 1 / aspect; camera.bottom = -1 / aspect; plane.scale.y = 1 / aspect; }
    camera.updateProjectionMatrix();
    canvasContainer.style.width = `${newWidth}px`;
    canvasContainer.style.height = `${newHeight}px`;
    renderer.setSize(newWidth, newHeight);
    uniforms.u_aspect.value = aspect;
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;
    uniforms.u_texel.value.set(1 / w, 1 / h);
}
function loadImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            new THREE.TextureLoader().load(event.target.result, (texture) => {
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                uniforms.u_texture.value = texture;
                updateAspectRatio(texture);
                document.getElementById('drop-zone').classList.add('hidden');
                renderer.setClearColor(0x000000, 1);
                renderer.clear(true, true, true);
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
        if (options.isExponential) finalValue = Math.pow(finalValue, 2);
        if (uniformKey) { uniforms[uniformKey].value = finalValue; }
    };
    slider.addEventListener('input', () => { numberInput.value = slider.value; updateValue(slider.value); });
    numberInput.addEventListener('input', () => { slider.value = numberInput.value; updateValue(numberInput.value); });
	numberInput.value = slider.value;
    updateValue(slider.value);
}

setupSliderSync('turbulence', 'turbulence-num', 'u_turbulence', { isLog: true });
setupSliderSync('flowSpeed', 'flowSpeed-num', 'u_flowSpeed', { isLog: true });
setupSliderSync('phosphorSize', 'phosphorSize-num', 'u_phosphorSize');
setupSliderSync('chromaticBleed', 'chromaticBleed-num', 'u_chromaticBleed');
setupSliderSync('voronoiSoftness', 'voronoiSoftness-num', 'u_softness'); 
setupSliderSync('bloomIntensity', 'bloomIntensity-num', 'u_bloomIntensity');
setupSliderSync('bloomThreshold', 'bloomThreshold-num', 'u_bloomThreshold');
setupSliderSync('umbraIntensity', 'umbraIntensity-num', 'u_umbraIntensity');
setupSliderSync('umbraThreshold', 'umbraThreshold-num', 'u_umbraThreshold');

// New slider connections
setupSliderSync('bloomRadius', 'bloomRadius-num', 'u_bloomRadius');
setupSliderSync('umbraRadius', 'umbraRadius-num', 'u_umbraRadius');


// === FILE INPUTS =============================================
const dropZone = document.getElementById('drop-zone');
const body = document.body;
const fileUpload = document.getElementById('file-upload');
const uploadBtn = document.getElementById('upload-btn');
const uploadBtnPlaceholder = document.getElementById('upload-btn-placeholder');
body.addEventListener('dragover', (e) => { e.preventDefault(); body.classList.add('drag-over'); });
body.addEventListener('dragleave', () => { body.classList.remove('drag-over'); });
body.addEventListener('drop', (e) => { e.preventDefault(); body.classList.remove('drag-over'); loadImage(e.dataTransfer.files[0]); });
uploadBtn.addEventListener('click', () => fileUpload.click());
uploadBtnPlaceholder.addEventListener('click', () => fileUpload.click());
fileUpload.addEventListener('change', (e) => loadImage(e.target.files[0]));
document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'siltcrt-snapshot.png';
    link.href = canvas.to_data_url('image/png');
    link.click();
});

// === ANIMATION LOOP ================================================
function animate() {
  requestAnimationFrame(animate);
  if (!uniforms.u_texture.value) return;
  uniforms.u_time.value += 0.01;
  renderer.render(scene, camera);
}
animate();