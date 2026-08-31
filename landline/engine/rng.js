/* Seeded random numbers.
 *
 * The Python renderer uses numpy's PCG64 through `default_rng`. Reproducing
 * that bit for bit in the browser would mean reimplementing PCG64 *and*
 * numpy's ziggurat normal and its Poisson sampler, and any drift in any of the
 * three would be silent. So this is a different generator, deliberately, and
 * the two implementations are held together by the checks in `tools/` — which
 * compare the parts that are *not* random (the channel response, the
 * measurement, the ladder) exactly, and the parts that are only in
 * distribution.
 *
 * sfc32, seeded through splitmix32. Fast, passes PractRand, and small enough
 * to read.
 */

export class Rng {
  constructor(seed = 1) {
    let s = seed >>> 0;
    const next = () => {
      s = (s + 0x9e3779b9) >>> 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
      z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
      return (z ^ (z >>> 15)) >>> 0;
    };
    this.a = next();
    this.b = next();
    this.c = next();
    this.d = next();
    this._spare = null;
    for (let i = 0; i < 12; i++) this.random();
  }

  /** Uniform in [0, 1). */
  random() {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) >>> 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) >>> 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) >>> 0;
    t = (t + this.d) >>> 0;
    this.c = (this.c + t) >>> 0;
    return t / 4294967296;
  }

  uniform(lo = 0, hi = 1) {
    return lo + (hi - lo) * this.random();
  }

  /** Integer in [lo, hi). */
  integers(lo, hi) {
    return lo + Math.floor(this.random() * (hi - lo));
  }

  /** Box–Muller, one value cached. */
  standardNormal() {
    if (this._spare !== null) {
      const v = this._spare;
      this._spare = null;
      return v;
    }
    let u = 0, v = 0, s = 0;
    do {
      u = this.random() * 2 - 1;
      v = this.random() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const f = Math.sqrt((-2 * Math.log(s)) / s);
    this._spare = v * f;
    return u * f;
  }

  normal(mu = 0, sigma = 1) {
    return mu + sigma * this.standardNormal();
  }

  normalArray(n) {
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = this.standardNormal();
    return out;
  }

  /* Knuth below 30, where the product stays representable; a normal
   * approximation with continuity correction above it. The rates here are
   * impulses per block and reach a few hundred at full storm. */
  poisson(lambda) {
    if (lambda <= 0) return 0;
    if (lambda < 30) {
      const limit = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k += 1;
        p *= this.random();
      } while (p > limit);
      return k - 1;
    }
    return Math.max(0, Math.round(this.normal(lambda, Math.sqrt(lambda))));
  }

  /** Index into `weights`, drawn in proportion to them. */
  weightedIndex(weights) {
    let total = 0;
    for (const w of weights) total += w;
    let x = this.random() * total;
    for (let i = 0; i < weights.length; i++) {
      x -= weights[i];
      if (x <= 0) return i;
    }
    return weights.length - 1;
  }

  pick(items) {
    return items[Math.floor(this.random() * items.length)];
  }
}

/** A seed a listener can read back and type in again. */
export function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
