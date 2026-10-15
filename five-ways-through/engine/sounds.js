// Reads one sound out of data/sounds.pak, written by scripts/pack_sounds.py.
// Each sound is stored XORed with a keystream seeded from its name, so the site
// serves no playable sound files. Where the server honours byte ranges (GitHub
// Pages does), only the index and the one sound are downloaded.
const PACK = new URL('../data/sounds.pak', import.meta.url).href;
const INDEX_BYTES = 4096;

function seedFor(name) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(name)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h || 1;
}
function unscramble(bytes, name) {
  let s = seedFor(name);
  for (let i = 0; i < bytes.length; i++) {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    bytes[i] ^= s & 0xff;
  }
  return bytes;
}

let whole = null;   // the full pack, when the server sent it all at once
async function range(start, end) {
  if (whole) return whole.slice(start, end);
  const response = await fetch(PACK, {headers: {Range: `bytes=${start}-${end - 1}`}});
  if (!response.ok) throw new Error(`sounds.pak: ${response.status}`);
  const buffer = await response.arrayBuffer();
  if (response.status === 200) { whole = buffer; return whole.slice(start, end); }
  return buffer;
}

let index = null;
async function readIndex() {
  const view = new DataView(await range(0, INDEX_BYTES));
  if (String.fromCharCode(...new Uint8Array(view.buffer, 0, 4)) !== 'FWT1') throw new Error('sounds.pak: not a sound pack');
  const entries = new Map(), count = view.getUint32(4, true);
  let p = 8;
  for (let i = 0; i < count; i++) {
    const n = view.getUint8(p), name = new TextDecoder().decode(new Uint8Array(view.buffer, p + 1, n));
    entries.set(name, {offset: view.getUint32(p + 1 + n, true), length: view.getUint32(p + 5 + n, true)});
    p += 9 + n;
  }
  return entries;
}

// The named sound's file bytes, ready for decodeAudioData.
export async function soundBytes(name) {
  index ||= readIndex();
  const entry = (await index).get(name);
  if (!entry) throw new Error(`sounds.pak has no ${name}`);
  return unscramble(new Uint8Array(await range(entry.offset, entry.offset + entry.length)), name).buffer;
}
