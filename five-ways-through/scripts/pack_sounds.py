"""Pack sound files into one scrambled file, data/sounds.pak.

The pieces' recordings come from a sound library, which may be used inside a
work but not handed out as sound files. So nothing playable is published: each
file is XORed with a keystream (xorshift32 seeded from its name) and stored
behind a small index. engine/sounds.js reverses it in the browser. This is
scrambling, not security; anyone reading the code can undo it.

Layout, little-endian:
  'FWT1', uint32 count, then per entry: uint8 name length, name (UTF-8),
  uint32 offset, uint32 length; then the scrambled payloads.

Usage:
  python pack_sounds.py                       # every .mp3 in the default source folder
  python pack_sounds.py --src F:/xyh/ephemeralrenders/brush/five-ways-wind --out ../data/sounds.pak
"""
import argparse
import os
import struct
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SRC = os.path.join(HERE, '..', '..', '..', 'ephemeralrenders', 'brush', 'five-ways-wind')


def seed_for(name):
    """FNV-1a over the name, the same as seedFor() in engine/sounds.js."""
    h = 0x811c9dc5
    for b in name.encode('utf-8'):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return h or 1


def keystream(name, n):
    s, out = seed_for(name), np.empty(n, np.uint8)
    # Same xorshift32 as the browser: one byte per step, the low byte of the state.
    for i in range(n):
        s ^= (s << 13) & 0xffffffff; s ^= s >> 17; s ^= (s << 5) & 0xffffffff
        out[i] = s & 0xff
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--src', default=DEFAULT_SRC, help='folder of .mp3 files; each is named by its file name without .mp3')
    ap.add_argument('--out', default=os.path.join(HERE, '..', 'data', 'sounds.pak'))
    args = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    files = sorted(f for f in os.listdir(args.src) if f.endswith('.mp3'))
    if not files:
        sys.exit(f'no .mp3 files in {args.src}')
    names = [f[:-4] for f in files]
    blobs = [np.fromfile(os.path.join(args.src, f), np.uint8) for f in files]
    header = 8 + sum(1 + len(n.encode('utf-8')) + 8 for n in names)
    if header > 4096:
        sys.exit('index longer than the 4096 bytes engine/sounds.js reads first')
    with open(args.out, 'wb') as out:
        out.write(b'FWT1' + struct.pack('<I', len(names)))
        offset = header
        for n, b in zip(names, blobs):
            raw = n.encode('utf-8')
            out.write(struct.pack('<B', len(raw)) + raw + struct.pack('<II', offset, len(b)))
            offset += len(b)
        for n, b in zip(names, blobs):
            out.write((b ^ keystream(n, len(b))).tobytes())
    print(f'wrote {args.out}: {len(names)} sounds, {os.path.getsize(args.out) // 1024} KB ({", ".join(names)})')


if __name__ == '__main__':
    main()
