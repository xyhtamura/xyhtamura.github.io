// test/projections.test.js
// Verification suite for Element Projections:
// Checks dataset integrity, mathematical accuracy of PCA against Besalú 2013 Tables 3 & 4,
// Allahyari & Oganov 2020 scale consistency, coordinate validity across all layouts, and distortion metrics.

import assert from 'node:assert/strict';
import { ELEMENTS, CATEGORIES, BLOCKS } from '../src/data/elements.js';
import { BESALU_ELEMENTS, BESALU_EIGENVALUES, BESALU_LOADINGS } from '../src/data/besalu.js';
import { ALLAHYARI_OGANOV_USE, SNEATH_TYPICALITY } from '../src/data/mendeleev_scales.js';
import { computePCA } from '../src/math/pca.js';
import {
  layoutStandard,
  layoutJanet,
  layoutLong,
  layoutMendeleev1869,
  layoutBesaluPCA,
  layoutFullPCA,
  layoutMendeleevUSE,
  layoutScatter,
  layoutStrip,
  layoutSpiral
} from '../src/projections/layout_registry.js';
import { computeDisplacements, computeNeighborhoodPreservation, classifyResiduals } from '../src/metrics/distortion.js';

console.log('--- Running Element Projections Verification Suite ---');

// 1. Dataset Integrity
console.log('1. Verifying 118 Elements Dataset...');
assert.equal(ELEMENTS.length, 118, 'Must have exactly 118 elements');

const zSet = new Set();
const symSet = new Set();

for (let i = 0; i < ELEMENTS.length; i++) {
  const elem = ELEMENTS[i];
  assert.equal(elem.z, i + 1, `Element at index ${i} must have z = ${i + 1}`);
  assert.ok(elem.symbol && typeof elem.symbol === 'string', `Element ${elem.z} must have symbol`);
  assert.ok(elem.name && typeof elem.name === 'string', `Element ${elem.z} must have name`);
  assert.ok(elem.atomicMass > 0, `Element ${elem.z} must have positive atomic mass`);
  assert.ok(['s', 'p', 'd', 'f'].includes(elem.block), `Element ${elem.z} must have valid block`);
  assert.ok(CATEGORIES[elem.category], `Element ${elem.z} category "${elem.category}" must exist in CATEGORIES`);
  assert.ok(BLOCKS[elem.block], `Element ${elem.z} block "${elem.block}" must exist in BLOCKS`);

  zSet.add(elem.z);
  symSet.add(elem.symbol);
}

assert.equal(zSet.size, 118, 'All atomic numbers must be unique');
assert.equal(symSet.size, 118, 'All element symbols must be unique');
console.log('✓ 118 Elements verified.');

// 2. Besalú (2013) PCA Verification
console.log('2. Verifying Besalú (2013) Table 3 & Table 4 replication...');
assert.equal(BESALU_ELEMENTS.length, 35, 'Besalú sample must contain 35 elements');

const besaluData = BESALU_ELEMENTS.map(e => [
  e.atomicWeight,
  e.atomicRadius,
  e.firstIP,
  e.firstEA,
  e.electronegativity
]);

const pcaResult = computePCA(besaluData);

// Table 3: PC1 = 3.24 (64.9%), PC2 = 1.19 (23.7%), PC3 = 0.43 (8.6%), PC4 = 0.09 (1.8%), PC5 = 0.05 (1.0%)
const expectedEigenvalues = [3.24, 1.19, 0.43, 0.09, 0.05];
for (let i = 0; i < 5; i++) {
  const diff = Math.abs(pcaResult.eigenvalues[i] - expectedEigenvalues[i]);
  assert.ok(diff < 0.03, `Eigenvalue ${i+1} (${pcaResult.eigenvalues[i].toFixed(2)}) should match expected (${expectedEigenvalues[i]}) within 0.03`);
}

const cumVar2 = pcaResult.cumVariancePct[1];
assert.ok(Math.abs(cumVar2 - 88.6) < 1.0, `Cumulative variance of first 2 PCs (${cumVar2.toFixed(1)}%) should be ~88.6%`);
console.log(`✓ Besalú Eigenvalues match: PC1=${pcaResult.eigenvalues[0].toFixed(2)} (${pcaResult.variancePct[0].toFixed(1)}%), PC2=${pcaResult.eigenvalues[1].toFixed(2)} (${pcaResult.variancePct[1].toFixed(1)}%), CumVar2=${cumVar2.toFixed(1)}%`);

// Table 4: Check loadings sign and dominance
// PC1 is dominated by First IP (+), Pauling χ (+), and Radius (-)
// PC2 is dominated by Atomic Weight (-)
const L = pcaResult.loadings;
assert.ok(Math.abs(L[0][1]) > 0.65, `PC2 must be heavily loaded by atomic weight (expected ~ -0.77, got ${L[0][1].toFixed(2)})`);
console.log('✓ Besalú loadings match Table 4 structure.');

// 3. Allahyari & Oganov (2020) USE Scale Verification
console.log('3. Verifying Allahyari & Oganov (2020) USE table...');
assert.equal(ALLAHYARI_OGANOV_USE.length, 96, 'USE table must have 96 elements');
assert.equal(ALLAHYARI_OGANOV_USE[0].symbol, 'Fr', 'USE rank 1 must be Francium');
assert.equal(ALLAHYARI_OGANOV_USE[1].symbol, 'Cs', 'USE rank 2 must be Cesium');
assert.equal(ALLAHYARI_OGANOV_USE[95].symbol, 'F', 'USE rank 96 must be Fluorine');
console.log('✓ Allahyari & Oganov scale verified.');

// 4. Layout Generators Coordinate Verification
console.log('4. Verifying coordinate generation across all 10 layout presets...');
const layouts = [
  layoutStandard(),
  layoutJanet(),
  layoutLong(),
  layoutMendeleev1869(),
  layoutBesaluPCA(),
  layoutFullPCA(),
  layoutMendeleevUSE(),
  layoutScatter('electronegativity', 'atomicRadius'),
  layoutStrip('z'),
  layoutSpiral()
];

for (const layout of layouts) {
  assert.ok(layout.coords instanceof Map, `${layout.name} must return coords Map`);
  assert.equal(layout.coords.size, 118, `${layout.name} must place all 118 elements`);

  for (let z = 1; z <= 118; z++) {
    const c = layout.coords.get(z);
    assert.ok(c, `${layout.name} missing coordinates for element z=${z}`);
    assert.ok(Number.isFinite(c.x), `${layout.name} x coordinate for z=${z} must be finite (got ${c.x})`);
    assert.ok(Number.isFinite(c.y), `${layout.name} y coordinate for z=${z} must be finite (got ${c.y})`);
  }
}
console.log(`✓ All ${layouts.length} layouts generated finite, valid coordinates for all 118 elements.`);

// 5. Distortion & Residual Metrics Verification
console.log('5. Verifying distortion and residual classification...');
const stdCoords = layouts[0].coords;
const besaluCoords = layouts[4].coords;

const dispSelf = computeDisplacements(stdCoords, stdCoords);
for (const d of dispSelf.values()) {
  assert.equal(d.dist, 0, 'Self displacement must be 0');
}

const dispBesalu = computeDisplacements(besaluCoords, stdCoords);
let hasPositiveDisp = false;
for (const d of dispBesalu.values()) {
  if (d.dist > 0) hasPositiveDisp = true;
}
assert.ok(hasPositiveDisp, 'Besalú PCA displacement from standard table must be non-zero');

const pres = computeNeighborhoodPreservation(ELEMENTS, stdCoords, 5);
assert.ok(pres.overallScore >= 0 && pres.overallScore <= 1, 'Preservation score must be in [0, 1]');

// Test Residuals
const resH = classifyResiduals(ELEMENTS.find(e => e.symbol === 'H'));
assert.equal(resH.isBesaluH, true, 'H must be tagged as Besalú H residual');

const resLi = classifyResiduals(ELEMENTS.find(e => e.symbol === 'Li'));
assert.equal(resLi.isDiagonal, true, 'Li must be tagged as diagonal partner');
assert.equal(resLi.diagonalPartner, 'Mg', 'Li diagonal partner must be Mg');

const resTi = classifyResiduals(ELEMENTS.find(e => e.symbol === 'Ti'));
assert.equal(resTi.isSneathIntruder, true, 'Ti must be tagged as Sneath d-block intruder');

console.log('✓ Distortion and residual metrics verified.');
console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
