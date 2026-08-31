"""Check the render: levels, headroom, and a spectrogram of the descent.

Uses PIL rather than matplotlib so the project needs nothing installed beyond
what is already here.
"""

import json
import sys
import wave

import numpy as np
from scipy import signal
from PIL import Image, ImageDraw


def read24(path):
    with wave.open(path, "rb") as w:
        assert w.getsampwidth() == 3, w.getsampwidth()
        n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
        raw = np.frombuffer(w.readframes(n), dtype=np.uint8).reshape(-1, 3)
    v = (
        raw[:, 0].astype(np.int32)
        | (raw[:, 1].astype(np.int32) << 8)
        | (raw[:, 2].astype(np.int32) << 16)
    )
    v = np.where(v & 0x800000, v - (1 << 24), v)
    return v.reshape(-1, ch).astype(np.float64) / (2 ** 23 - 1), sr


def dbfs(x):
    return 20.0 * np.log10(np.abs(x) + 1e-12)


def magma(v):
    """Cheap perceptual ramp: black -> purple -> orange -> white."""
    stops = np.array(
        [[0, 0, 8], [40, 11, 84], [123, 28, 109], [200, 55, 84],
         [249, 142, 8], [252, 255, 164]], dtype=float
    )
    x = np.clip(v, 0, 1) * (len(stops) - 1)
    i = np.floor(x).astype(int)
    i = np.clip(i, 0, len(stops) - 2)
    f = (x - i)[..., None]
    return (stops[i] * (1 - f) + stops[i + 1] * f).astype(np.uint8)


def main(path="line-probe.wav"):
    x, sr = read24(path)
    meta = json.load(open(path.replace(".wav", ".json"), encoding="utf-8"))

    print(f"{path}: {len(x)/sr:.1f}s  {sr} Hz  {x.shape[1]}ch  24-bit")
    print(f"peak      {dbfs(np.max(np.abs(x))):.2f} dBFS")
    print(f"rms       {dbfs(np.sqrt(np.mean(x**2))):.2f} dBFS")
    print(f"dc offset {np.mean(x):.2e}")
    print(f"clipped   {int(np.sum(np.abs(x) >= 0.999))} samples")

    corr = np.corrcoef(x[:, 0], x[:, 1])[0, 1]
    print(f"L/R corr  {corr:.3f}  (low is correct: the line is uncorrelated)")

    n = (len(x) // sr) * sr
    blocks = np.sqrt(np.mean(x[:n].reshape(-1, sr, x.shape[1]) ** 2, axis=(1, 2)))
    q = np.percentile(dbfs(blocks), [5, 50, 95])
    print(f"1s rms    5% {q[0]:.1f}   median {q[1]:.1f}   95% {q[2]:.1f} dBFS")
    print(f"quiet     {int(np.sum(dbfs(blocks) < -55))}/{len(blocks)} seconds below -55 dBFS")

    log = meta["log"]
    ok = [a for a in log if a["result"]]
    frags = [f for a in log for f in a["fragments"]]
    lens = np.array([f["len_s"] for f in frags])
    print(f"attempts  {len(log)} total, {len(ok)} connected, {len(log)-len(ok)} failed")
    print(f"fragments {len(frags)}  len min {lens.min():.3f} "
          f"median {np.median(lens):.3f} max {lens.max():.3f} s")
    gaps = np.diff(np.sort([f["at_s"] for f in frags]))
    print(f"gaps      median {np.median(gaps):.2f} s, longest {gaps.max():.2f} s")

    mono = x.mean(axis=1)
    f, t, S = signal.spectrogram(mono, sr, nperseg=4096, noverlap=3072)
    S = 10 * np.log10(S + 1e-16)
    keep = f <= 4200
    S, f = S[keep], f[keep]

    norm = np.clip((S - (-150.0)) / (-70.0 - (-150.0)), 0, 1)
    img = magma(norm[::-1])  # low frequency at the bottom
    im = Image.fromarray(img, "RGB").resize((1500, 520), Image.BILINEAR)

    d = ImageDraw.Draw(im)
    for a in meta["log"]:
        px = int(a["negotiated_at_s"] / t[-1] * im.width)
        label = a["result"]["mode"] if a["result"] else "no carrier"
        d.line([(px, 0), (px, 12)], fill=(255, 255, 255), width=1)
        d.text((px + 2, 2), label, fill=(255, 255, 255))
    out = path.replace(".wav", "-spectrogram.png")
    im.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main(*sys.argv[1:])
