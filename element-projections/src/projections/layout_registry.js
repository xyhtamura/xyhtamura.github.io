// src/projections/layout_registry.js
// Projection layout engines mapping each of the 118 chemical elements to 2D coordinates.
// Every layout represents a specific pair: Layout = (ordering key, wrap rule).

import { ELEMENTS } from '../data/elements.js';
import { BESALU_ELEMENTS, BESALU_LOADINGS } from '../data/besalu.js';
import { ALLAHYARI_OGANOV_USE } from '../data/mendeleev_scales.js';
import { computePCA, projectVector } from '../math/pca.js';

/**
 * Standard 18-column IUPAC periodic table.
 * Ordering key: Atomic number Z.
 * Wrap rule: Noble gases (closed electron shells).
 */
export function layoutStandard() {
  const coords = new Map();
  for (const elem of ELEMENTS) {
    let x = elem.stdCol;
    let y = elem.stdRow;
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  }
  return {
    key: 'standard',
    name: 'Standard Form (18-Column IUPAC)',
    orderingKey: 'Atomic Number Z',
    wrapRule: 'Shell closures (Noble gases np⁶ / 1s²)',
    thesis: 'Preserves valence recurrence and group homology in vertical columns at the cost of metric continuity.',
    description: 'The ubiquitous medium-form table. Splits the f-block (lanthanides & actinides) into detached rows below to keep an 18-column aspect ratio.',
    coords,
    aspectRatio: 18 / 10,
    hasAxes: false,
    displayMode: 'grid'
  };
}

/**
 * Janet Left-Step Periodic Table (Charles Janet, 1928).
 * Ordering key: Atomic number Z.
 * Wrap rule: Quantum subshell filling (n + ℓ rule / Madelung ordering).
 */
export function layoutJanet() {
  const coords = new Map();
  for (const elem of ELEMENTS) {
    const x = elem.janetCol;
    const y = elem.janetRow;
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  }
  return {
    key: 'janet',
    name: 'Janet Left-Step Form (1928)',
    orderingKey: 'Atomic Number Z',
    wrapRule: 'Madelung quantum subshell filling (n + ℓ)',
    thesis: 'Orders elements strictly by electron orbital filling: f (cols 1–14) → d (cols 15–24) → p (cols 25–30) → s (cols 31–32).',
    description: 'Highly favored in quantum physics and philosophy of chemistry (Scerri 2020). Places Helium directly above Beryllium in the s-block, forming continuous blocks of lengths 2, 2, 8, 8, 18, 18, 32, 32.',
    coords,
    aspectRatio: 32 / 9,
    hasAxes: false,
    displayMode: 'grid'
  };
}

/**
 * Long Form Periodic Table (32 Columns).
 * Ordering key: Atomic number Z.
 * Wrap rule: Noble gases (uncollapsed lanthanides and actinides inline).
 */
export function layoutLong() {
  const coords = new Map();
  for (const elem of ELEMENTS) {
    const x = elem.group32;
    const y = elem.period;
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  }
  return {
    key: 'long',
    name: 'Long Form Table (32-Column)',
    orderingKey: 'Atomic Number Z',
    wrapRule: 'Shell closures without f-block folding',
    thesis: 'Shows the true continuous progression of atomic numbers across periods without detaching the f-block.',
    description: 'Expands the table to its full 32-column width. Lanthanides and actinides sit directly between s-block alkaline earths and d-block transition metals.',
    coords,
    aspectRatio: 32 / 8,
    hasAxes: false,
    displayMode: 'grid'
  };
}

/**
 * Mendeleev 1869 Short Form Table (8 Groups).
 * Ordering key: Atomic weight.
 * Wrap rule: 8 vertical groups across 12 horizontal series.
 */
export function layoutMendeleev1869() {
  const coords = new Map();
  for (const elem of ELEMENTS) {
    const x = elem.mendeleev1869Group;
    const y = elem.mendeleev1869Series;
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  }
  return {
    key: 'mendeleev1869',
    name: 'Mendeleev 1869 Historical Short Form',
    orderingKey: 'Atomic Weight (historical)',
    wrapRule: '8-group stoichiometry / oxidation capacity',
    thesis: 'The historical 8-group layout that predicted the existence and properties of undiscovered elements (Ga, Sc, Ge).',
    description: 'Organizes elements into 8 groups based on empirical highest-oxide stoichiometry (R₂O through R₂O₇ / RO₄), alternating between odd and even series.',
    coords,
    aspectRatio: 8 / 14,
    hasAxes: false,
    displayMode: 'packed-grid'
  };
}

/**
 * Besalú (2013) Empirical PCA Table.
 * "From Periodic Properties to a Periodic Table Arrangement", J. Chem. Educ. 2013, 90(8), 1009-1013.
 * Ordering key: Principal Component 1 (64.9% variance: Ionization Energy & Electronegativity vs Atomic Radius).
 * Wrap rule / 2nd Axis: Principal Component 2 (23.7% variance: Atomic Weight).
 */
export function layoutBesaluPCA() {
  const coords = new Map();

  // Create lookup for the exact 35 elements
  const besaluMap = new Map();
  for (const b of BESALU_ELEMENTS) {
    besaluMap.set(b.z, b);
  }

  // Besalú standardization constants from Table 1:
  // Weight mean=73.57, std=67.43; Radius mean=141.43, std=54.78; IP mean=865.71, std=327.97; EA mean=94.57, std=97.90; χ mean=2.046, std=0.817
  const means = [73.57, 141.43, 865.71, 94.57, 2.046];
  const stds = [67.43, 54.78, 327.97, 97.90, 0.817];

  for (const elem of ELEMENTS) {
    if (besaluMap.has(elem.z)) {
      const b = besaluMap.get(elem.z);
      // Besalú coordinates: PC1 is periods (x-axis), -PC2 is groups (y-axis inverted so lighter elements are on top)
      coords.set(elem.z, {
        x: b.pc1,
        y: -b.pc2,
        rawX: b.pc1,
        rawY: b.pc2,
        isOriginalSample: true
      });
    } else {
      // Project other elements into Besalú PCA space
      const vec = [
        elem.atomicMass,
        elem.atomicRadius || 140,
        elem.ionizationEnergy1 || 700,
        elem.electronAffinity || 50,
        elem.electronegativity || 1.8
      ];
      const scores = projectVector(vec, means, stds, BESALU_LOADINGS);
      coords.set(elem.z, {
        x: scores[0],
        y: -scores[1],
        rawX: scores[0],
        rawY: scores[1],
        isOriginalSample: false
      });
    }
  }

  return {
    key: 'besalu_pca',
    name: 'Besalú (2013) Empirical PCA Projection',
    orderingKey: 'PC1 (64.9% var: IP + χ vs Atomic Radius) — Periodic Row axis',
    wrapRule: 'PC2 (23.7% var: Atomic Weight) — Periodic Group axis',
    thesis: 'Principal Component Analysis over 5 physical properties reconstructs the periodic table without theory, while exposing empirical residuals (H, C, N; diagonal relationships; Döbereiner triads).',
    description: 'PC1 corresponds to periods; PC2 corresponds to groups. The classical grid softens into continuous chemical coordinates. Note Hydrogen floating near C/N, and the Li–Mg / Na–Ca diagonal clustering.',
    coords,
    aspectRatio: 1.3,
    hasAxes: true,
    displayMode: 'points',
    xAxisLabel: 'PC 1 (Periods: +IP, +χ, −Radius) [64.9% var]',
    yAxisLabel: 'PC 2 (Groups: +Atomic Weight) [23.7% var]'
  };
}

/**
 * Dynamic 118-Element Multidimensional PCA.
 * Evaluates PCA over all 118 elements on normalized properties.
 */
export function layoutFullPCA() {
  const validElements = ELEMENTS.filter(e => e.ionizationEnergy1 != null);
  const dataMatrix = validElements.map(e => [
    e.atomicMass,
    e.atomicRadius || 140,
    e.ionizationEnergy1 || 700,
    e.electronegativity || 1.8,
    e.density || 5.0,
    e.meltingPoint || 1000
  ]);

  const pcaResult = computePCA(dataMatrix);
  const coords = new Map();

  for (let i = 0; i < validElements.length; i++) {
    const elem = validElements[i];
    const pc1 = pcaResult.scores[i][0];
    const pc2 = pcaResult.scores[i][1];
    coords.set(elem.z, {
      x: pc1,
      y: -pc2,
      rawX: pc1,
      rawY: pc2
    });
  }

  return {
    key: 'full_pca',
    name: 'Full 118-Element Multidimensional PCA',
    orderingKey: `PC1 (${pcaResult.variancePct[0].toFixed(1)}% variance)`,
    wrapRule: `PC2 (${pcaResult.variancePct[1].toFixed(1)}% variance)`,
    thesis: 'Full dimensional reduction across 6 physicochemical properties for all 118 elements.',
    description: 'Dimensionality reduction over atomic mass, radius, 1st IP, electronegativity, density, and melting point. Demonstrates how s-, p-, d-, and f-blocks naturally segregate in continuous property space.',
    coords,
    aspectRatio: 1.2,
    hasAxes: true,
    displayMode: 'points',
    xAxisLabel: `PC 1 (${pcaResult.variancePct[0].toFixed(1)}% variance)`,
    yAxisLabel: `PC 2 (${pcaResult.variancePct[1].toFixed(1)}% variance)`
  };
}

/**
 * Allahyari & Oganov (2020) Universal Sequence of Elements (USE).
 * Ordering key: Chemical Scale / Mendeleev Number.
 * Wrap rule: 12-element raster wrap.
 */
export function layoutMendeleevUSE() {
  const coords = new Map();
  const useMap = new Map();
  for (const item of ALLAHYARI_OGANOV_USE) {
    useMap.set(item.symbol, item);
  }

  // Sort elements by USE rank (or atomic number if past Cm)
  const sorted = [...ELEMENTS].sort((a, b) => {
    const useA = useMap.get(a.symbol)?.useRank ?? (a.z + 100);
    const useB = useMap.get(b.symbol)?.useRank ?? (b.z + 100);
    return useA - useB;
  });

  const colsPerRow = 12;
  sorted.forEach((elem, index) => {
    const col = (index % colsPerRow) + 1;
    const row = Math.floor(index / colsPerRow) + 1;
    coords.set(elem.z, { x: col, y: row, rawX: col, rawY: row });
  });

  return {
    key: 'mendeleev_use',
    name: 'Allahyari & Oganov (2020) Mendeleev Sequence (USE)',
    orderingKey: 'Nonempirical Mendeleev Scale (Regression of χ on Atomic Radius)',
    wrapRule: '12-element raster wrap',
    thesis: 'Orders elements along the single 1D axis that maximizes chemical similarity of adjacent elements in crystal structure databases.',
    description: 'Derived from nonempirical regression in Pauling electronegativity vs atomic radius space. Adjacent elements have minimal chemical divergence in unary and binary compound phase diagrams.',
    coords,
    aspectRatio: 12 / 10,
    hasAxes: false,
    displayMode: 'grid'
  };
}

/**
 * Continuous Bivariate Property Scatter.
 * Ordering key: Property X.
 * Wrap rule / 2nd Axis: Property Y.
 */
export function layoutScatter(xProp = 'electronegativity', yProp = 'atomicRadius') {
  const propLabels = {
    electronegativity: 'Pauling Electronegativity (χ)',
    atomicRadius: 'Atomic Radius (pm)',
    ionizationEnergy1: '1st Ionization Potential (kJ/mol)',
    atomicMass: 'Atomic Weight (amu)',
    electronAffinity: 'Electron Affinity (kJ/mol)',
    density: 'Density at STP (g/cm³)',
    meltingPoint: 'Melting Point (K)',
    boilingPoint: 'Boiling Point (K)',
    valence: 'Nominal Valence',
    discoveryYear: 'Discovery Year'
  };

  const coords = new Map();
  const valid = [];

  for (const elem of ELEMENTS) {
    let vx = elem[xProp];
    let vy = elem[yProp];

    if (vx == null) vx = (xProp === 'electronegativity' ? 1.5 : 0);
    if (vy == null) vy = (yProp === 'atomicRadius' ? 140 : 0);

    valid.push({ z: elem.z, x: Number(vx), y: Number(vy) });
  }

  // Calculate min/max for normalization
  const xs = valid.map(v => v.x);
  const ys = valid.map(v => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = (maxX - minX) || 1.0;
  const rangeY = (maxY - minY) || 1.0;

  for (const item of valid) {
    // Normalize to [0, 10] coordinate box
    const normX = ((item.x - minX) / rangeX) * 16 + 1;
    // Invert Y so higher values appear at top
    const normY = (1.0 - (item.y - minY) / rangeY) * 10 + 1;

    coords.set(item.z, {
      x: normX,
      y: normY,
      rawX: item.x,
      rawY: item.y
    });
  }

  return {
    key: 'scatter',
    name: `Property Scatter: ${propLabels[xProp] || xProp} × ${propLabels[yProp] || yProp}`,
    orderingKey: propLabels[xProp] || xProp,
    wrapRule: `Continuous 2nd dimension: ${propLabels[yProp] || yProp}`,
    thesis: 'The limit case of the periodic table: the wrap rule weakens to zero, relaxing the discrete tabular grid into continuous metric property space.',
    description: `Directly plots ${propLabels[xProp] || xProp} on the horizontal axis against ${propLabels[yProp] || yProp} on the vertical axis. Notice how periods and blocks stretch or cluster.`,
    coords,
    aspectRatio: 16 / 10,
    hasAxes: true,
    displayMode: 'points',
    xAxisLabel: propLabels[xProp] || xProp,
    yAxisLabel: propLabels[yProp] || yProp
  };
}

/**
 * 1D Unwrapped Rank Strip.
 * Ordering key: Selected property or Z.
 * Wrap rule: None (1D continuous line).
 */
export function layoutStrip(sortKey = 'z') {
  const sorted = [...ELEMENTS].sort((a, b) => {
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    return va - vb;
  });

  const coords = new Map();
  sorted.forEach((elem, index) => {
    const x = index + 1;
    const y = 1;
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  });

  return {
    key: 'strip',
    name: `1D Rank Strip (Sorted by ${sortKey.toUpperCase()})`,
    orderingKey: `Rank by ${sortKey}`,
    wrapRule: 'None (Unwrapped 1D sequence)',
    thesis: 'Demonstrates what happens when the wrap rule is completely removed: one continuous rank strip of matter.',
    description: 'All 118 elements arranged in a single unbroken linear rank. No recurrence or artificial row divisions.',
    coords,
    aspectRatio: 118 / 2,
    hasAxes: false,
    displayMode: 'strip'
  };
}

/**
 * Archimedean Spiral Layout.
 * Elements placed along a spiral path: r = a * θ.
 */
export function layoutSpiral() {
  const coords = new Map();
  const a = 0.8;
  const turns = 4.5;
  const total = ELEMENTS.length;

  ELEMENTS.forEach((elem, index) => {
    const theta = (index / total) * turns * 2 * Math.PI;
    const r = a * (1 + theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    coords.set(elem.z, { x, y, rawX: x, rawY: y });
  });

  return {
    key: 'spiral',
    name: 'Archimedean Continuous Spiral',
    orderingKey: 'Atomic Number Z along spiral arc length',
    wrapRule: 'Continuous 2π radial winding without abrupt row cuts',
    thesis: 'Continuous winding wraps atomic numbers smoothly, aligning homologous elements along radial rays without cutting periods.',
    description: 'Based on historical spiral formulations (Baumhauer 1870, Courtines 1925, Theodor Benfey 1964). Eliminates row cuts and treats period lengths as expanding spiral loops.',
    coords,
    aspectRatio: 1.0,
    hasAxes: false,
    displayMode: 'points'
  };
}

export const LAYOUT_PRESETS = [
  { id: 'standard', name: 'Standard (18-Col IUPAC)', fn: layoutStandard },
  { id: 'janet', name: 'Janet Left-Step (n+ℓ)', fn: layoutJanet },
  { id: 'long', name: 'Long Form (32-Col)', fn: layoutLong },
  { id: 'mendeleev1869', name: 'Mendeleev 1869 Short Form', fn: layoutMendeleev1869 },
  { id: 'besalu_pca', name: 'Besalú (2013) Empirical PCA', fn: layoutBesaluPCA },
  { id: 'full_pca', name: 'Full 118-Element PCA', fn: layoutFullPCA },
  { id: 'mendeleev_use', name: 'Allahyari–Oganov (2020) USE', fn: layoutMendeleevUSE },
  { id: 'scatter', name: 'Property Scatter (χ × Radius)', fn: () => layoutScatter('electronegativity', 'atomicRadius') },
  { id: 'spiral', name: 'Archimedean Spiral', fn: layoutSpiral },
  { id: 'strip', name: '1D Rank Strip', fn: () => layoutStrip('z') }
];
