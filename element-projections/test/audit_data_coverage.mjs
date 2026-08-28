/**
 * Audit how much of the 118-element dataset is actually measured.
 *
 * This matters more here than in most projects. The piece's whole claim is that
 * the interesting elements are the ones landing somewhere other than where the
 * standard table puts them. If an element's position comes from a fallback
 * constant rather than a measurement, its displacement is an artefact of the
 * fallback and the piece is pointing at nothing.
 *
 * Run:  node test/audit_data_coverage.mjs
 */

import { ELEMENTS } from '../src/data/elements.js';
import { BESALU_ELEMENTS } from '../src/data/besalu.js';
import { layoutBesaluPCA } from '../src/projections/layout_registry.js';
import { computeDisplacements } from '../src/metrics/distortion.js';

const FIELDS = [
  'atomicMass',
  'atomicRadius',
  'ionizationEnergy1',
  'electronAffinity',
  'electronegativity',
  'density',
  'meltingPoint',
  'boilingPoint',
];

console.log(`dataset: ${ELEMENTS.length} elements\n`);
console.log('field coverage (non-null):');
for (const f of FIELDS) {
  const have = ELEMENTS.filter((e) => e[f] != null).length;
  const missing = ELEMENTS.filter((e) => e[f] == null).map((e) => e.symbol);
  console.log(
    `  ${f.padEnd(18)} ${String(have).padStart(3)}/118` +
      (missing.length ? `   missing: ${missing.join(' ')}` : ''),
  );
}

// Which elements are placed in Besalu space from published scores, and which are
// extrapolated through the published loadings?
const layout = layoutBesaluPCA();
const extrapolated = [...layout.coords.entries()].filter(([, c]) => !c.isOriginalSample);
console.log(
  `\nBesalú PCA: ${BESALU_ELEMENTS.length} elements carry the paper's own scores, ` +
    `${extrapolated.length} are extrapolated through its loadings.`,
);

// Of the extrapolated ones, how many relied on a fallback for a PCA input?
const pcaInputs = ['atomicRadius', 'ionizationEnergy1', 'electronAffinity', 'electronegativity'];
const symbolOf = new Map(ELEMENTS.map((e) => [e.z, e.symbol]));
const onFallback = extrapolated
  .map(([z]) => ELEMENTS.find((e) => e.z === z))
  .filter((e) => e && pcaInputs.some((f) => e[f] == null));

console.log(
  `of those, ${onFallback.length} use at least one fallback constant for a PCA input:` +
    `\n  ${onFallback.map((e) => e.symbol).join(' ') || '(none)'}`,
);

// Cross-reference against the largest displacements.
const norm = (coords) => {
  const pts = [...coords.values()];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;
  return new Map(
    [...coords.entries()].map(([z, p]) => [z, { x: (p.x - minX) / spanX, y: (p.y - minY) / spanY }]),
  );
};

const { layoutStandard } = await import('../src/projections/layout_registry.js');
const disp = computeDisplacements(norm(layout.coords), norm(layoutStandard().coords));
const top20 = [...disp.entries()].sort((a, b) => b[1].dist - a[1].dist).slice(0, 20);
const fallbackSyms = new Set(onFallback.map((e) => e.symbol));

console.log('\ntop 20 displacements, flagged by data quality:');
for (const [z, d] of top20) {
  const sym = symbolOf.get(z);
  const flag = fallbackSyms.has(sym)
    ? 'FALLBACK'
    : layout.coords.get(z).isOriginalSample
      ? "Besalú's own"
      : 'extrapolated';
  console.log(`  ${sym.padEnd(3)} ${d.dist.toFixed(3)}  ${flag}`);
}

const suspect = top20.filter(([z]) => fallbackSyms.has(symbolOf.get(z))).length;
console.log(
  `\n${suspect}/20 of the largest displacements rest on at least one fallback constant.`,
);
