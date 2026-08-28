// src/metrics/distortion.js
// Calculates displacement vectors, Sneath (2000) atypicality metrics,
// topological k-NN neighborhood preservation, and empirical residual classifications.

import { SNEATH_TYPICALITY } from '../data/mendeleev_scales.js';

/**
 * Computes Euclidean displacement of each element from baseline coordinates.
 * @param {Map<number, {x: number, y: number}>} currentCoords - Map of Z -> {x, y}
 * @param {Map<number, {x: number, y: number}>} baselineCoords - Map of Z -> {x, y}
 * @returns {Map<number, {dx: number, dy: number, dist: number, normDist: number}>}
 */
export function computeDisplacements(currentCoords, baselineCoords) {
  const result = new Map();
  let maxDist = 0;

  for (const [z, curr] of currentCoords.entries()) {
    const base = baselineCoords.get(z);
    if (!base || !curr) continue;
    const dx = curr.x - base.x;
    const dy = curr.y - base.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) maxDist = dist;
    result.set(z, { dx, dy, dist, normDist: 0 });
  }

  const safeMax = maxDist || 1.0;
  for (const [z, item] of result.entries()) {
    item.normDist = item.dist / safeMax;
  }

  return result;
}

/**
 * Calculates k-nearest neighbor topological preservation between high-D property space and 2D layout space.
 * @param {Object[]} elements - Array of element objects with numeric property vectors.
 * @param {Map<number, {x: number, y: number}>} layoutCoords - 2D layout positions.
 * @param {number} k - Number of nearest neighbors to check (default 5).
 * @returns {{ overallScore: number, perElementScore: Map<number, number> }}
 */
export function computeNeighborhoodPreservation(elements, layoutCoords, k = 5) {
  // Build normalized multi-property vectors for elements that have complete properties
  const validElements = elements.filter(e => 
    e.electronegativity != null && e.atomicRadius != null && e.ionizationEnergy1 != null
  );

  const n = validElements.length;
  if (n <= k) return { overallScore: 1.0, perElementScore: new Map() };

  // Standardize property vectors: [mass, radius, IP, χ]
  const rawMatrix = validElements.map(e => [
    e.atomicMass,
    e.atomicRadius,
    e.ionizationEnergy1,
    e.electronegativity || 1.5,
    e.electronAffinity || 0
  ]);

  const m = rawMatrix[0].length;
  const means = new Array(m).fill(0);
  const stds = new Array(m).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) means[j] += rawMatrix[i][j];
  }
  for (let j = 0; j < m; j++) means[j] /= n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const diff = rawMatrix[i][j] - means[j];
      stds[j] += diff * diff;
    }
  }
  for (let j = 0; j < m; j++) stds[j] = Math.sqrt(stds[j] / n) || 1.0;

  const propZ = rawMatrix.map(row => row.map((v, j) => (v - means[j]) / stds[j]));

  // Calculate high-D pairwise distance matrix
  const highDDist = new Array(n);
  for (let i = 0; i < n; i++) {
    highDDist[i] = new Array(n);
    for (let j = 0; j < n; j++) {
      if (i === j) {
        highDDist[i][j] = 0;
      } else if (j < i) {
        highDDist[i][j] = highDDist[j][i];
      } else {
        let sum = 0;
        for (let p = 0; p < m; p++) {
          const diff = propZ[i][p] - propZ[j][p];
          sum += diff * diff;
        }
        highDDist[i][j] = Math.sqrt(sum);
      }
    }
  }

  // Calculate 2D layout pairwise distance matrix
  const layoutDist = new Array(n);
  for (let i = 0; i < n; i++) {
    layoutDist[i] = new Array(n);
    const posI = layoutCoords.get(validElements[i].z) || { x: 0, y: 0 };
    for (let j = 0; j < n; j++) {
      if (i === j) {
        layoutDist[i][j] = 0;
      } else if (j < i) {
        layoutDist[i][j] = layoutDist[j][i];
      } else {
        const posJ = layoutCoords.get(validElements[j].z) || { x: 0, y: 0 };
        layoutDist[i][j] = Math.hypot(posI.x - posJ.x, posI.y - posJ.y);
      }
    }
  }

  // Measure overlap in k-nearest neighbors
  const perElementScore = new Map();
  let totalOverlap = 0;

  for (let i = 0; i < n; i++) {
    // Indices sorted by property distance
    const highDNeighbors = validElements
      .map((_, idx) => idx)
      .filter(idx => idx !== i)
      .sort((a, b) => highDDist[i][a] - highDDist[i][b])
      .slice(0, k);

    // Indices sorted by 2D distance
    const layoutNeighbors = validElements
      .map((_, idx) => idx)
      .filter(idx => idx !== i)
      .sort((a, b) => layoutDist[i][a] - layoutDist[i][b])
      .slice(0, k);

    const highDSet = new Set(highDNeighbors);
    let matchCount = 0;
    for (const neighbor of layoutNeighbors) {
      if (highDSet.has(neighbor)) matchCount++;
    }

    const score = matchCount / k;
    perElementScore.set(validElements[i].z, score);
    totalOverlap += score;
  }

  const overallScore = totalOverlap / n;
  return { overallScore, perElementScore };
}

/**
 * Evaluates residual types and named anomalies for a given element.
 * @param {Object} element
 * @returns {{
 *   isBesaluH: boolean,
 *   isBesaluCN: boolean,
 *   isDiagonal: boolean,
 *   diagonalPartner: string|null,
 *   isDobereinerTriad: boolean,
 *   triadName: string|null,
 *   isSneathIntruder: boolean,
 *   isSneathPlatinum: boolean,
 *   sneathAtypicality: number|null
 * }}
 */
export function classifyResiduals(element) {
  const sym = element.symbol;
  const z = element.z;

  const isBesaluH = (sym === 'H');
  const isBesaluCN = (sym === 'C' || sym === 'N');

  const diagonalPairs = {
    'Li': 'Mg', 'Mg': 'Li',
    'Be': 'Al', 'Al': 'Be',
    'B': 'Si', 'Si': 'B'
  };
  const isDiagonal = sym in diagonalPairs;
  const diagonalPartner = diagonalPairs[sym] || null;

  const triads = {
    'Li': 'Li-Na-K (Alkali Triad)', 'Na': 'Li-Na-K (Alkali Triad)', 'K': 'Li-Na-K (Alkali Triad)',
    'Ca': 'Ca-Sr-Ba (Alkaline Earth Triad)', 'Sr': 'Ca-Sr-Ba (Alkaline Earth Triad)', 'Ba': 'Ca-Sr-Ba (Alkaline Earth Triad)',
    'Cl': 'Cl-Br-I (Halogen Triad)', 'Br': 'Cl-Br-I (Halogen Triad)', 'I': 'Cl-Br-I (Halogen Triad)',
    'S': 'S-Se-Te (Chalcogen Triad)', 'Se': 'S-Se-Te (Chalcogen Triad)', 'Te': 'S-Se-Te (Chalcogen Triad)',
    'P': 'P-As-Sb (Pnictogen Triad)', 'As': 'P-As-Sb (Pnictogen Triad)', 'Sb': 'P-As-Sb (Pnictogen Triad)'
  };
  const isDobereinerTriad = sym in triads;
  const triadName = triads[sym] || null;

  // Sneath (2000) d-block intruders into p-block region: Ti, Hg, Zn
  const isSneathIntruder = (sym === 'Ti' || sym === 'Hg' || sym === 'Zn');

  // Sneath (2000) axis III platinum vs tungsten split
  const isSneathPlatinum = ['Pt', 'Ir', 'Os', 'Pd', 'Rh', 'Ru', 'Au', 'Ag', 'Cu'].includes(sym);

  const sneathAtypicality = SNEATH_TYPICALITY[sym] || element.sneathTypicality || null;

  return {
    isBesaluH,
    isBesaluCN,
    isDiagonal,
    diagonalPartner,
    isDobereinerTriad,
    triadName,
    isSneathIntruder,
    isSneathPlatinum,
    sneathAtypicality
  };
}
