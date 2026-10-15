// Moving the scene's settings between looks: numbers and #rrggbb colours are
// interpolated, arrays element by element, anything else switches at halfway.
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export function mix(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (typeof a === 'string' && a[0] === '#' && typeof b === 'string' && b[0] === '#') { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); }
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mix(v, b[i], t));
  return t < .5 ? a : b;
}
const smooth = t => t * t * (3 - 2 * t);

// Sets every key named in the frames on `target`, for position p along frames
// [{at, ...settings}], sorted by `at`. Between frames the move is eased.
export function along(target, frames, p) {
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1].at) i++;
  const a = frames[i], b = frames[Math.min(i + 1, frames.length - 1)];
  const t = b === a ? 0 : smooth(Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))));
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (k === 'at') continue;
    target[k] = mix(a[k] ?? b[k], b[k] ?? a[k], t);
  }
}
