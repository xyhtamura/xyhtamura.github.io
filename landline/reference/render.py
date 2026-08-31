"""Line Probe — fixed media, stereo.

Renders the piece. Nothing here is sampled. Every sound is either a signal
defined in an ITU-T Recommendation or the modelled noise of the loop those
signals are trying to cross.

The whole negotiation runs: each attempt probes the line, measures what comes
back, and settles on a rate. But the attempt is never heard whole. What is
placed in the piece are fragments cut out of it, none longer than a second,
scattered across a window much wider than the attempt itself, so the attempts
overlap and their edges are not findable. The process is complete; the audition
of it is partial. The JSON written beside the audio logs the negotiation in
full, including the parts that were never sounded.

The stereo image is the two ends of the call: the originating DCE toward the
left, the answering DCE toward the right, the line itself uncorrelated across
both. Fragments keep a bias toward their source's side and scatter around it.
There is no reverberation and no processing beyond the channel model, because
anything else would be a space the signal is not in.

    python render.py [--seconds 300] [--seed 3] [--out line-probe-5.wav]
"""

import argparse
import json
import wave

import numpy as np

from protocol import SR, ansam, v21, probe_pair, bits_from_bytes, db
import line
import negotiate

# The piece is levelled from the bed, not from its peak. The bed is the one
# continuous thing in it and the level everything else is heard against, whereas
# the peak is whichever single fragment happened to come out loudest — letting
# that set the gain makes two renders of the same piece differ by several dB in
# how present the near-silence is. Peak headroom is checked, not targeted.
BED_TARGET_DBFS = -68.0
PEAK_CEILING_DBFS = -6.0

# Mix levels. The measurement must be taken at the same level the listener
# hears, or the negotiation stops being a measurement of the audible line and
# becomes a separate composed process that only resembles one. These constants
# are the single place both paths read from.
GAIN_ANSAM = -30.0
GAIN_PROBE = -26.0
GAIN_V21 = -32.0
GAIN_DATA = -33.0

# Fragments. Lengths are drawn log-uniform between these, so most are very
# short and a few approach the ceiling; the ceiling itself closes as the line
# degrades and there is less of anything to hear.
FRAG_MIN_S = 0.035
FRAG_MAX_S = 1.00
FRAG_MAX_S_LATE = 0.30

# How many fragments each attempt sheds, early and late.
FRAG_COUNT_EARLY = 8.0
FRAG_COUNT_LATE = 2.5

# Attempts are spaced closer than their scatter windows are wide, so the clouds
# overlap and no fragment can be assigned to an attempt by ear.
ATTEMPT_GAP_S = (12.0, 30.0)
SCATTER_WINDOW_S = (20.0, 52.0)

# Which part of an attempt a fragment is cut from.
SOURCE_WEIGHTS = {"probe": 0.30, "ansam": 0.20, "cm": 0.14, "jm": 0.14, "data": 0.22}


# --- placement --------------------------------------------------------------

def place(buf, pos, mono, pan=0.0, gain_db=0.0):
    """Additively mix a mono signal into the stereo buffer at a sample offset."""
    n = len(mono)
    if n == 0 or pos >= len(buf) or pos < 0:
        return
    n = min(n, len(buf) - pos)
    theta = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
    g = db(gain_db)
    buf[pos:pos + n, 0] += mono[:n] * np.cos(theta) * g
    buf[pos:pos + n, 1] += mono[:n] * np.sin(theta) * g


def window(n, rng):
    """Raised-cosine edges on a cut fragment.

    A fragment is a slice out of the middle of a continuous signal, so both ends
    are discontinuities. The fades are short enough to leave the attack intact —
    long enough only to keep the cut from being the loudest thing in it.
    """
    w = np.ones(n)
    for edge in (0, 1):
        k = min(int(SR * rng.uniform(0.003, 0.012)), n // 2)
        if k < 2:
            continue
        ramp = 0.5 * (1.0 - np.cos(np.pi * np.arange(k) / k))
        if edge == 0:
            w[:k] *= ramp
        else:
            w[-k:] *= ramp[::-1]
    return w


def cut(src, rng, max_len):
    """One fragment, log-uniform in length so short ones dominate."""
    n = len(src)
    if n < 16:
        return None
    dur = FRAG_MIN_S * (max_len / FRAG_MIN_S) ** rng.random()
    k = min(int(dur * SR), n)
    if k < 16:
        return None
    start = int(rng.integers(0, max(1, n - k)))
    seg = src[start:start + k].copy()
    return seg * window(len(seg), rng)


# --- weather ----------------------------------------------------------------

def smooth_noise(n, rng, smoothing=14):
    x = rng.standard_normal(n)
    k = max(3, n // smoothing)
    kern = np.hanning(k)
    kern /= kern.sum()
    x = np.convolve(x, kern, mode="same")
    return x / (np.max(np.abs(x)) + 1e-12)


def storm_curve(total_samples, rng, ceiling):
    """How bad the loop is, over the duration of the piece.

    A rising trend with gusts. The gusts matter: a line that only ever worsens
    gives a monotonic descent, and real weather lets a connection come back
    briefly before it goes for good. The ceiling is set from the measured
    failure threshold so the piece ends past it rather than grazing it.
    """
    n = max(2, total_samples // SR)
    t = np.linspace(0.0, 1.0, n)
    base = 0.04 + ceiling * t ** 2.0
    curve = np.clip(base + 0.14 * smooth_noise(n, rng), 0.0, ceiling * 1.15)
    return np.interp(
        np.arange(total_samples), np.linspace(0, total_samples - 1, n), curve
    )


# --- data ------------------------------------------------------------------

def _rrc(beta, sps, span=6):
    t = np.arange(-span * sps, span * sps + 1, dtype=float) / sps
    h = np.empty_like(t)
    for i, x in enumerate(t):
        if abs(x) < 1e-9:
            h[i] = 1.0 - beta + 4.0 * beta / np.pi
        elif beta > 0 and abs(abs(x) - 1.0 / (4.0 * beta)) < 1e-9:
            h[i] = (beta / np.sqrt(2.0)) * (
                (1 + 2 / np.pi) * np.sin(np.pi / (4 * beta))
                + (1 - 2 / np.pi) * np.cos(np.pi / (4 * beta))
            )
        else:
            num = np.sin(np.pi * x * (1 - beta)) + 4 * beta * x * np.cos(
                np.pi * x * (1 + beta)
            )
            den = np.pi * x * (1 - (4 * beta * x) ** 2)
            h[i] = num / den
    return h / np.sqrt(np.sum(h ** 2))


def data_burst(dur, result, rng):
    """Scrambled data at the negotiated mode.

    Once negotiation succeeds the signal stops being legible as tones and
    becomes shaped noise — which is what a working connection sounds like, and
    why the handshake is the only part of the internet anyone ever heard.
    """
    sps = max(4, int(round(SR / result["symbol_rate"])))
    nsym = max(8, int(round(dur * SR / sps)))
    bits = max(1, int(round(result["bits_per_symbol"])))
    side = max(2, int(round(2 ** (bits / 2.0))))

    lev = np.arange(side) * 2.0 - (side - 1)
    i = rng.choice(lev, nsym) / (side - 1)
    q = rng.choice(lev, nsym) / (side - 1)

    up_i = np.zeros(nsym * sps)
    up_q = np.zeros(nsym * sps)
    up_i[::sps] = i
    up_q[::sps] = q

    h = _rrc(0.25, sps)
    bi = np.convolve(up_i, h, mode="same")
    bq = np.convolve(up_q, h, mode="same")

    t = np.arange(len(bi)) / SR
    fc = result["carrier_hz"]
    sig = bi * np.cos(2 * np.pi * fc * t) - bq * np.sin(2 * np.pi * fc * t)
    return sig / (np.max(np.abs(sig)) + 1e-12)


# --- one attempt ------------------------------------------------------------

def attempt(s, rng):
    """Run a full call setup at storm level s.

    Returns the negotiated result and the labelled signals it produced. The
    signals are complete; the piece only ever hears pieces of them.
    """
    pr = probe_pair(round_trip=rng.uniform(0.04, 0.12))
    pr_line = line.filter_signal(pr, s)
    received = pr_line * db(GAIN_PROBE) + line.noise(len(pr), s, rng)
    result = negotiate.choose(line.measure(received, s))

    octets = negotiate.capability_octets(result)
    src = {
        "ansam": (line.filter_signal(ansam(rng.uniform(1.6, 3.3)), s), 0.55, GAIN_ANSAM),
        "probe": (pr_line, -0.55, GAIN_PROBE),
        "cm": (line.filter_signal(v21(bits_from_bytes(octets), "low"), s), -0.7, GAIN_V21),
        "jm": (line.filter_signal(v21(bits_from_bytes(octets[::-1]), "high"), s), 0.7, GAIN_V21),
    }
    if result is not None:
        hold = 1.4 + 6.5 * (result["bit_rate"] / 33600.0)
        src["data"] = (line.filter_signal(data_burst(hold, result, rng), s), 0.0, GAIN_DATA)
    return result, src


# --- the bed ----------------------------------------------------------------

def build_bed(n, storm, rng):
    """The line, under everything, for the whole duration.

    Generated in overlapping blocks with crossfades. Independent blocks butted
    together would step at every seam; at this level the step is small, but the
    bed is the one thing that never stops, so a periodic seam in it would be the
    most audible regularity in the piece.
    """
    out = np.zeros(n)
    L = int(SR * 8.0)
    O = int(SR * 1.0)
    hop = L - O
    fade = 0.5 * (1.0 - np.cos(np.pi * np.arange(O) / O))

    pos = 0
    while pos < n:
        k = min(L, n - pos)
        if k < 32:
            break
        s = float(storm[min(pos + k // 2, len(storm) - 1)])
        seg = line.noise(k, s, rng)
        if pos > 0 and k > O:
            seg[:O] *= fade
        if pos + k < n and k > O:
            seg[-O:] *= fade[::-1]
        out[pos:pos + k] += seg
        pos += hop
    return out


# --- the piece --------------------------------------------------------------

def render(seconds=300.0, seed=3, out="line-probe-5.wav", ceiling=3.06):
    rng = np.random.default_rng(seed)
    total = int(seconds * SR)
    pad = SR * 6
    buf = np.zeros((total + pad, 2))
    storm = storm_curve(total + pad, rng, ceiling)

    log = []
    t = rng.uniform(6.0, 14.0)
    n_attempt = 0

    while t < seconds:
        n_attempt += 1
        pos = int(t * SR)
        s = float(storm[min(pos, len(storm) - 1)])
        sn = min(1.0, s / ceiling)

        result, src = attempt(s, rng)

        # Fewer and shorter fragments as the line degrades: there is less of
        # anything getting through, and what does is briefer.
        mu = FRAG_COUNT_EARLY + (FRAG_COUNT_LATE - FRAG_COUNT_EARLY) * sn
        count = max(1, int(round(rng.normal(mu, 1.4))))
        max_len = FRAG_MAX_S + (FRAG_MAX_S_LATE - FRAG_MAX_S) * sn
        spread = rng.uniform(*SCATTER_WINDOW_S)

        names = [k for k in SOURCE_WEIGHTS if k in src]
        w = np.array([SOURCE_WEIGHTS[k] for k in names])
        w /= w.sum()

        placed = []
        for _ in range(count):
            name = names[int(rng.choice(len(names), p=w))]
            sig, bias, gain = src[name]
            frag = cut(sig, rng, max_len)
            if frag is None:
                continue
            at = pos + int(rng.uniform(-0.15, 1.0) * spread * SR)
            pan = float(np.clip(bias + rng.normal(0.0, 0.45), -1.0, 1.0))
            place(buf, at, frag, pan=pan, gain_db=gain + rng.uniform(-11.0, 0.0))
            placed.append({
                "source": name,
                "at_s": round(at / SR, 2),
                "len_s": round(len(frag) / SR, 3),
            })

        entry = {
            "attempt": n_attempt,
            "negotiated_at_s": round(t, 2),
            "storm": round(s, 3),
            "scatter_window_s": round(spread, 1),
            "fragments": sorted(placed, key=lambda f: f["at_s"]),
        }
        if result is None:
            entry["result"] = None
        else:
            entry["result"] = {
                k: (round(v, 2) if isinstance(v, float) else v)
                for k, v in result.items() if k != "indices"
            }
        log.append(entry)

        t += rng.uniform(*ATTEMPT_GAP_S)

    # Two independent beds: the line is uncorrelated across the two channels.
    bed_l = build_bed(len(buf), storm, rng)
    bed_r = build_bed(len(buf), storm, rng)
    bed_rms = float(np.sqrt(np.mean(bed_l ** 2 + bed_r ** 2) / 2.0))
    buf[:, 0] += bed_l
    buf[:, 1] += bed_r

    buf *= db(BED_TARGET_DBFS) / (bed_rms + 1e-30)

    fade = int(SR * 6.0)
    buf[-fade:] *= np.linspace(1.0, 0.0, fade)[:, None]

    peak_dbfs = 20.0 * np.log10(np.max(np.abs(buf)) + 1e-30)
    if peak_dbfs > PEAK_CEILING_DBFS:
        raise SystemExit(
            f"peak {peak_dbfs:.1f} dBFS exceeds the {PEAK_CEILING_DBFS:.0f} dBFS "
            f"ceiling; lower the fragment gains rather than limiting the output."
        )

    _write24(out, buf)

    n_frag = sum(len(e["fragments"]) for e in log)
    meta = {
        "title": "Line Probe",
        "duration_s": round(len(buf) / SR, 2),
        "sample_rate": SR,
        "channels": 2,
        "bit_depth": 24,
        "seed": seed,
        "storm_ceiling": ceiling,
        "bed_dbfs": BED_TARGET_DBFS,
        "peak_dbfs": round(float(peak_dbfs), 2),
        "attempts": len(log),
        "fragments": n_frag,
        "log": log,
    }
    with open(out.replace(".wav", ".json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    return meta


def _write24(path, buf):
    x = np.clip(buf, -1.0, 1.0)
    ints = (x * (2 ** 23 - 1)).astype(np.int32).reshape(-1)
    packed = np.empty((len(ints), 3), dtype=np.uint8)
    packed[:, 0] = ints & 0xFF
    packed[:, 1] = (ints >> 8) & 0xFF
    packed[:, 2] = (ints >> 16) & 0xFF
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(packed.tobytes())


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--seconds", type=float, default=300.0)
    p.add_argument("--seed", type=int, default=3)
    p.add_argument("--out", default="line-probe-5.wav")
    # Fitted by tune.py, which measures where the line stops carrying a call
    # and solves for the ceiling that puts the last 16% of the piece past it.
    # Re-run tune.py after any change to the noise floor, channel or ladder.
    p.add_argument("--ceiling", type=float, default=3.06)
    a = p.parse_args()
    m = render(a.seconds, a.seed, a.out, a.ceiling)
    print(f"{a.out}  {m['duration_s']}s  {m['attempts']} attempts  "
          f"{m['fragments']} fragments")
    for e in m["log"]:
        r = e["result"]
        print(f"  {e['negotiated_at_s']:>6.1f}s  storm {e['storm']:.2f}  "
              f"{(r['mode'] if r else 'no carrier'):<14} "
              f"{len(e['fragments'])} frags over {e['scatter_window_s']:.0f}s")
