// src/math/pca.js
// Pure JavaScript linear algebra and Principal Component Analysis (PCA) solver.
// Supports arbitrary N-dimensional matrices, standardization, Jacobi eigenvalue decomposition,
// and projection onto principal axes.

/**
 * Standardizes an N x M data matrix (zero mean, unit standard deviation ddof=0).
 * @param {number[][]} data - Array of N rows, each with M numeric features.
 * @returns {{ Z: number[][], means: number[], stds: number[] }}
 */
export function standardize(data) {
  const n = data.length;
  if (n === 0) return { Z: [], means: [], stds: [] };
  const m = data[0].length;

  const means = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < m; j++) {
    means[j] /= n;
  }

  const stds = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const diff = data[i][j] - means[j];
      stds[j] += diff * diff;
    }
  }
  for (let j = 0; j < m; j++) {
    stds[j] = Math.sqrt(stds[j] / n) || 1.0;
  }

  const Z = new Array(n);
  for (let i = 0; i < n; i++) {
    Z[i] = new Array(m);
    for (let j = 0; j < m; j++) {
      Z[i][j] = (data[i][j] - means[j]) / stds[j];
    }
  }

  return { Z, means, stds };
}

/**
 * Computes the Pearson correlation matrix (M x M) for an N x M data matrix.
 * @param {number[][]} data
 * @returns {number[][]}
 */
export function correlationMatrix(data) {
  const { Z } = standardize(data);
  const n = Z.length;
  const m = Z[0].length;
  const R = new Array(m);

  for (let i = 0; i < m; i++) {
    R[i] = new Array(m);
    for (let j = 0; j < m; j++) {
      if (i === j) {
        R[i][j] = 1.0;
      } else if (j < i) {
        R[i][j] = R[j][i];
      } else {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += Z[k][i] * Z[k][j];
        }
        R[i][j] = sum / n;
      }
    }
  }
  return R;
}

/**
 * Matrix multiplication A (n x k) * B (k x m) -> C (n x m)
 */
export function matmul(A, B) {
  const n = A.length;
  const k = A[0].length;
  const m = B[0].length;
  const C = new Array(n);

  for (let i = 0; i < n; i++) {
    C[i] = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      let sum = 0;
      for (let p = 0; p < k; p++) {
        sum += A[i][p] * B[p][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

/**
 * Jacobi eigenvalue algorithm for real symmetric matrix (M x M).
 * Computes all eigenvalues and eigenvectors accurately.
 * @param {number[][]} A - Real symmetric M x M matrix.
 * @param {number} maxIter - Maximum rotation iterations.
 * @param {number} eps - Convergence tolerance.
 * @returns {{ eigenvalues: number[], eigenvectors: number[][] }}
 */
export function jacobiEigenvalue(A, maxIter = 150, eps = 1e-12) {
  const n = A.length;
  // Clone A
  const S = A.map(row => [...row]);
  // V starts as identity matrix (n x n)
  const V = new Array(n);
  for (let i = 0; i < n; i++) {
    V[i] = new Array(n).fill(0);
    V[i][i] = 1.0;
  }

  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal element S[p][q]
    let maxOff = 0;
    let p = 0;
    let q = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const absVal = Math.abs(S[i][j]);
        if (absVal > maxOff) {
          maxOff = absVal;
          p = i;
          q = j;
        }
      }
    }

    if (maxOff < eps) break;

    // Calculate rotation angle theta
    const diff = S[q][q] - S[p][p];
    let t;
    if (Math.abs(diff) < eps) {
      t = 1.0;
    } else {
      const phi = diff / (2.0 * S[p][q]);
      t = 1.0 / (Math.abs(phi) + Math.sqrt(phi * phi + 1.0));
      if (phi < 0) t = -t;
    }

    const c = 1.0 / Math.sqrt(t * t + 1.0);
    const s = t * c;
    const tau = s / (1.0 + c);

    // Apply Jacobi rotation to S
    const Spq = S[p][q];
    S[p][q] = 0;
    S[q][p] = 0;
    S[p][p] -= t * Spq;
    S[q][q] += t * Spq;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Sip = S[i][p];
        const Siq = S[i][q];
        S[i][p] = Sip - s * (Siq + tau * Sip);
        S[p][i] = S[i][p];
        S[i][q] = Siq + s * (Sip - tau * Siq);
        S[q][i] = S[i][q];
      }
    }

    // Accumulate eigenvectors in V
    for (let i = 0; i < n; i++) {
      const Vip = V[i][p];
      const Viq = V[i][q];
      V[i][p] = Vip - s * (Viq + tau * Vip);
      V[i][q] = Viq + s * (Vip - tau * Viq);
    }
  }

  // Extract eigenvalues from diagonal of S
  const rawEig = [];
  for (let i = 0; i < n; i++) {
    rawEig.push({ val: S[i][i], vec: V.map(row => row[i]) });
  }

  // Sort descending by eigenvalue
  rawEig.sort((a, b) => b.val - a.val);

  const eigenvalues = rawEig.map(e => e.val);
  const eigenvectors = new Array(n);
  for (let row = 0; row < n; row++) {
    eigenvectors[row] = new Array(n);
    for (let col = 0; col < n; col++) {
      eigenvectors[row][col] = rawEig[col].vec[row];
    }
  }

  return { eigenvalues, eigenvectors };
}

/**
 * Performs full PCA on an N x M dataset.
 * Returns eigenvalues, percentage of explained variance, cumulative variance, loadings, and scores (Z * L).
 * @param {number[][]} data
 * @returns {{
 *   means: number[],
 *   stds: number[],
 *   R: number[][],
 *   eigenvalues: number[],
 *   variancePct: number[],
 *   cumVariancePct: number[],
 *   loadings: number[][],
 *   scores: number[][]
 * }}
 */
export function computePCA(data) {
  const { Z, means, stds } = standardize(data);
  const m = data[0].length;
  const R = correlationMatrix(data);
  const { eigenvalues, eigenvectors } = jacobiEigenvalue(R);

  // Total variance equals m (sum of eigenvalues for correlation matrix)
  const totalVar = eigenvalues.reduce((acc, v) => acc + Math.max(0, v), 0) || m;
  const variancePct = eigenvalues.map(v => (Math.max(0, v) / totalVar) * 100);
  
  let cum = 0;
  const cumVariancePct = variancePct.map(pct => {
    cum += pct;
    return Math.min(100, cum);
  });

  // Loadings matrix L = eigenvectors
  const scores = matmul(Z, eigenvectors);

  return {
    means,
    stds,
    R,
    eigenvalues,
    variancePct,
    cumVariancePct,
    loadings: eigenvectors,
    scores
  };
}

/**
 * Projects a raw vector into existing PCA coordinate space.
 * @param {number[]} vector - Raw M features
 * @param {number[]} means - M means
 * @param {number[]} stds - M stds
 * @param {number[][]} loadings - M x K loadings matrix
 * @returns {number[]} K principal component scores
 */
export function projectVector(vector, means, stds, loadings) {
  const m = vector.length;
  const k = loadings[0].length;
  const z = vector.map((v, i) => (v - means[i]) / stds[i]);
  const out = new Array(k).fill(0);

  for (let c = 0; c < k; c++) {
    let sum = 0;
    for (let r = 0; r < m; r++) {
      sum += z[r] * loadings[r][c];
    }
    out[c] = sum;
  }
  return out;
}
