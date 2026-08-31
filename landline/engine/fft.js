/* Real FFT, radix-2.
 *
 * `line.py` filters by multiplying a real spectrum by the channel response and
 * transforming back, and it measures by summing power in bands of a windowed
 * spectrum. Both are reproduced here. numpy transforms at arbitrary length;
 * this pads to the next power of two, which changes bin spacing but not the
 * power in a band, and not the ratio the measurement actually reads. The
 * difference is checked rather than assumed — see `tools/compare.mjs`.
 */

function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

const twiddleCache = new Map();

function twiddles(n) {
  let t = twiddleCache.get(n);
  if (t) return t;
  const cos = new Float64Array(n / 2);
  const sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((-2 * Math.PI * i) / n);
    sin[i] = Math.sin((-2 * Math.PI * i) / n);
  }
  t = { cos, sin };
  twiddleCache.set(n, t);
  return t;
}

/** In-place complex FFT. `inverse` skips the 1/n scaling; callers apply it. */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  const { cos, sin } = twiddles(n);
  for (let len = 2; len <= n; len <<= 1) {
    const step = n / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const idx = k * step;
        const wr = cos[idx];
        const wi = inverse ? -sin[idx] : sin[idx];
        const a = i + k;
        const b = a + len / 2;
        const xr = re[b] * wr - im[b] * wi;
        const xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr;
        im[b] = im[a] - xi;
        re[a] += xr;
        im[a] += xi;
      }
    }
  }
}

/* Multiply a real signal's spectrum by a real, even response and transform
 * back — the `filter_signal` of line.py. `responseAt` is called once per
 * positive frequency.
 *
 * `addSpectrum`, when given, contributes [re, im] to each positive-frequency
 * bin before the response is applied, with the conjugate written to the mirror
 * bin so the result stays real. It exists so a shaped noise source can be drawn
 * in the frequency domain instead of being generated in time and transformed —
 * see the bed in line.js. */
export function filterReal(signal, sampleRate, responseAt, addSpectrum = null) {
  const n = signal.length;
  if (n === 0) return signal;
  const N = nextPow2(n);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  re.set(signal);
  fft(re, im, false);

  const half = N / 2;
  for (let k = 0; k <= half; k++) {
    const f = (k * sampleRate) / N;
    if (addSpectrum) {
      const [ar, ai] = addSpectrum(f, N);
      if (k === 0 || k === half) {
        // DC and Nyquist have no partner to be conjugate with, so they must be
        // real or the inverse transform stops being real.
        re[k] += ar;
      } else {
        re[k] += ar;
        im[k] += ai;
        re[N - k] += ar;
        im[N - k] -= ai;
      }
    }
    const h = responseAt(f);
    re[k] *= h;
    im[k] *= h;
    if (k > 0 && k < half) {
      const m = N - k;
      re[m] *= h;
      im[m] *= h;
    }
  }
  fft(re, im, true);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = re[i] / N;
  return out;
}

/* Power spectrum of a Hann-windowed real signal, plus the frequency of each
 * bin — the two halves of `measure` in line.py. */
export function powerSpectrum(signal, sampleRate) {
  const n = signal.length;
  const N = nextPow2(n);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  // numpy's np.hanning(n) is the symmetric window: zero at both ends.
  for (let i = 0; i < n; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
    re[i] = signal[i] * w;
  }
  fft(re, im, false);
  const half = N / 2;
  const power = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) power[k] = re[k] * re[k] + im[k] * im[k];
  return { power, binHz: sampleRate / N };
}
