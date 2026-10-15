"""Cut seamless wind loops from field recordings, with the highs lifted.

Each loop takes `length` seconds from `start`, plus `fade` more seconds that are
crossfaded (equal power) over its opening, so the end runs into the start with
no seam. A high shelf brightens recordings that came out dull; the loop is then
levelled to a target RMS and written as stereo MP3, outside the site repository:
the published copy is the scrambled pack made from them by pack_sounds.py.

The list of loops lives in LOOPS below: one per piece, named for it.

Usage:
  python make_wind_loops.py --src "F:/xyh/musicprod/audio/Winds Of Nature"
  python pack_sounds.py
  python make_wind_loops.py --src ... --only running --shelf 5
"""
import argparse
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
RATE = 48000
# name: (file, start seconds, loop length, crossfade[, shelf dB]). A file is found in --src
# unless the entry gives a path; a shelf given here overrides --shelf.
THEME = os.path.join(HERE, '..', '..', '..', 'ephemeralrenders', 'brush', 'tremolo.flac')
LOOPS = {
    'running': ('QP02 0214 Wind grass strong gusty with lulls.wav', 20, 42, 4),
    'exchange': ('QP02 0198 Wind grass quiet zephyrs.wav', 30, 44, 5),
    'hours': ('QP02 0187 Wind deciduous forest slowly changing.wav', 6, 60, 6),
    'toward': ('QP02 0203 Wind grass moderate consistent full body.wav', 40, 44, 5),
    'forgetting': ('QP02 0161 Wind plants gentle breeze soft leaf rustles.wav', 25, 44, 5),
    # The opening page: Xyh's theme looped with its ending crossfaded over its start,
    # unshelved because it is already mixed, and a second wind take to swell against it.
    'theme': (THEME, 0, 9.8, 2.0, 0),
    # A light leaf rustle; the whistling grass take (QP02 0210) was too much for Xyh.
    'opening-wind': ('QP02 0158 Wind plants leaves rustle.wav', 20, 48, 5),
}


def decode(path, start, seconds):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(seconds), '-i', path,
           '-f', 'f32le', '-ac', '2', '-ar', str(RATE), '-']
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def loop(audio, length, fade):
    n, f = int(length * RATE), int(fade * RATE)
    if len(audio) < n + f:
        sys.exit(f'recording too short for a {length}+{fade} s loop')
    body, tail = audio[:n].copy(), audio[n:n + f]
    t = np.linspace(0, np.pi / 2, f, dtype=np.float32)[:, None]
    body[:f] = body[:f] * np.sin(t) + tail * np.cos(t)
    return body


def encode(audio, out, shelf, freq, rms_db, bitrate):
    rms = np.sqrt(np.mean(audio ** 2)) or 1
    audio = audio * (10 ** (rms_db / 20) / rms)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(RATE), '-i', '-',
           '-af', f'treble=g={shelf}:f={freq}:t=s:w=0.7,alimiter=limit=0.89',
           '-c:a', 'libmp3lame', '-b:a', bitrate, out]
    subprocess.run(cmd, input=audio.astype(np.float32).tobytes(), check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--src', required=True, help='folder holding the recordings')
    ap.add_argument('--out', default=os.path.join(HERE, '..', '..', '..', 'ephemeralrenders', 'brush', 'five-ways-wind'))
    ap.add_argument('--only', nargs='*', help='pieces to make; default all')
    ap.add_argument('--shelf', type=float, default=4.0, help='high shelf gain, dB')
    ap.add_argument('--freq', type=float, default=3500, help='high shelf corner, Hz')
    ap.add_argument('--rms', type=float, default=-24, help='target RMS before the shelf, dBFS')
    ap.add_argument('--bitrate', default='128k')
    args = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    os.makedirs(args.out, exist_ok=True)
    for name, (file, start, length, fade, *shelf) in LOOPS.items():
        if args.only and name not in args.only:
            continue
        path = file if os.path.isabs(file) else os.path.join(args.src, file)
        audio = loop(decode(path, start, length + fade + .5), length, fade)
        out = os.path.join(args.out, name + '.mp3')
        encode(audio, out, shelf[0] if shelf else args.shelf, args.freq, args.rms, args.bitrate)
        print(f'{name}: {os.path.basename(file)} from {start} s, {length} s loop -> {os.path.getsize(out) // 1024} KB')


if __name__ == '__main__':
    main()
