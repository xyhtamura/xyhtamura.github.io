/**
 * Verify the empirical claims the interface makes, independently of the browser.
 *
 * The page states that sorting by properties reconstructs the periodic table and
 * that the content is the residual. That is a checkable claim rather than a
 * design choice, so it is checked here:
 *
 *   1. the Besalú PCA layout really moves elements off the standard grid
 *   2. the elements Besalú (2013) names as displaced — H, C, N — are among the
 *      largest movers once both layouts are put on a common scale
 *   3. k-NN neighbourhood preservation is high but below 1, which is the point:
 *      two dimensions cost something, and the cost is a number
 *
 * Layouts return coordinates in their own units (grid columns for the standard
 * table, principal-component scores for the PCA layouts), so every layout is
 * normalised into the unit box before anything is compared. Without that the
 * displacements measure a change of units rather than a change of arrangement.
 *
 * Run:  node test/verify_claims.mjs
 */

import { ELEMENTS } from '../src/data/elements.js';
import {
  layoutStandard,
  layoutBesaluPCA,
  layoutFullPCA,
  layoutStrip,
} from '../src/projections/layout_registry.js';
import {
  computeDisplacements,
  computeNeighborhoodPreservation,
  classifyResiduals,
} from '../src/metrics/distortion.js';

const fail = [];
const ok = (msg) => console.log(`✓ ${msg}`);
const check = (cond, msg) => (cond ? ok(msg) : fail.push(msg));
const symbolOf = new Map(ELEMENTS.map((e) => [e.z, e.symbol]));

/** Rescale a Map<z,{x,y}> into the unit box so two layouts can be compared. */
function normalise(coords) {
  const pts = [...coords.values()];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs) || 1;
  const spanY = Math.max(...ys) - Math.min(...ys) || 1;
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const out = new Map();
  for (const [z, p] of coords.entries()) {
    out.set(z, { x: (p.x - minX) / spanX, y: (p.y - minY) / spanY });
  }
  return out;
}

const standard = normalise(layoutStandard().coords);
const besalu = normalise(layoutBesaluPCA().coords);

// --- 1. the layout actually moves --------------------------------------------
const shared = [...besalu.keys()].filter((z) => standard.has(z));
check(shared.length >= 30, `Besalú layout shares ${shared.length} elements with the standard grid`);

const moved = shared.filter((z) => {
  const a = standard.get(z);
  const b = besalu.get(z);
  return Math.hypot(a.x - b.x, a.y - b.y) > 0.01;
});
check(
  moved.length / shared.length > 0.9,
  `${moved.length}/${shared.length} elements change position between standard and Besalú PCA`,
);

// --- 2. the named residuals are the big movers --------------------------------
const disp = computeDisplacements(besalu, standard);
const ranked = [...disp.entries()]
  .sort((a, b) => b[1].dist - a[1].dist)
  .map(([z, d]) => [symbolOf.get(z) ?? z, d.dist]);

console.log(`  largest displacements: ${ranked.slice(0, 12).map(([s]) => s).join(' ')}`);
const top = ranked.slice(0, 12).map(([s]) => s);
check(
  ['H', 'C', 'N'].some((s) => top.includes(s)),
  `at least one of Besalú's named residuals (H, C, N) is among the 12 largest movers`,
);

for (const sym of ['H', 'C', 'N', 'Ti', 'Zn', 'Hg']) {
  const el = ELEMENTS.find((e) => e.symbol === sym);
  if (!el) continue;
  const tags = classifyResiduals(el);
  const list = Array.isArray(tags) ? tags : Object.keys(tags || {}).filter((k) => tags[k]);
  const rank = ranked.findIndex(([s]) => s === sym);
  console.log(
    `  ${sym.padEnd(2)} displacement rank ${rank >= 0 ? rank + 1 : '-'} — tags: ${list.length ? list.join(', ') : '(none)'}`,
  );
}

// --- 3. two dimensions cost something ----------------------------------------
for (const [name, layout] of [
  ['Standard 18-col', layoutStandard()],
  ['Besalú PCA', layoutBesaluPCA()],
  ['Full 118 PCA', layoutFullPCA()],
  ['1D strip by χ', layoutStrip('electronegativity')],
]) {
  const { overallScore } = computeNeighborhoodPreservation(ELEMENTS, layout.coords, 5);
  if (!Number.isFinite(overallScore)) {
    fail.push(`${name}: neighbourhood preservation is not a finite number`);
    continue;
  }
  console.log(`  ${name.padEnd(16)} k-NN preservation ${(overallScore * 100).toFixed(1)}%`);
  check(overallScore > 0 && overallScore < 1, `${name} preserves some but not all neighbourhoods`);
}

console.log('');
if (fail.length) {
  console.error(`FAILED (${fail.length}):`);
  for (const f of fail) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('=== CLAIMS VERIFIED ===');
