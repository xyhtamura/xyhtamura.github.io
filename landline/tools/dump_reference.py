"""Reference values from the Python renderer, for checking the browser port.

Prints JSON on stdout. The browser engine is checked against this by
`compare.mjs`, which runs the same three cases through the JavaScript modules
and diffs them.

The two implementations do not share a random number generator, so only the
deterministic parts are compared here: the channel response, the measurement of
a noise-free probe, and the ladder decision on fixed SNR vectors. Everything
random is checked in distribution instead, by `measure.mjs`.

    python dump_reference.py > reference.json

Run from this directory; it imports the renderer out of ../reference/.
"""

import json
import os
import sys

sys.path.insert(
    0,
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reference"),
)

import numpy as np  # noqa: E402

import line  # noqa: E402
import negotiate  # noqa: E402
from protocol import PROBE_TONES, probe_pair, db  # noqa: E402

STORMS = [0.0, 0.25, 0.5, 1.0, 1.75, 2.5, 3.06]
GAIN_PROBE = -26.0


def response_case():
    out = {}
    for s in STORMS:
        out[f"{s:.2f}"] = [float(x) for x in line.response(np.array(PROBE_TONES), s)]
    out["dry_gain"] = float(line.DRY_GAIN)
    return out


def measure_case():
    """The probe through the line with no noise added.

    Noise-free, so the result is a deterministic function of storm and can be
    compared across implementations directly. The SNR figures are large and
    unrealistic for that reason; what is being checked is the analysis, not the
    line.
    """
    out = {}
    for s in STORMS:
        pr = probe_pair(round_trip=0.08)
        received = line.filter_signal(pr, s) * db(GAIN_PROBE)
        snr = line.measure(received, s)
        result = negotiate.choose(snr)
        out[f"{s:.2f}"] = {
            "snr_db": [round(float(x), 6) for x in snr],
            "mode": None if result is None else result["mode"],
            "bandwidth_hz": None if result is None else result["bandwidth_hz"],
            "mean_snr_db": None if result is None else round(result["mean_snr_db"], 6),
        }
    return out


def ladder_case():
    """The ladder on hand-made SNR vectors, including its boundaries."""
    n = len(PROBE_TONES)
    cases = {
        "all_40db": [40.0] * n,
        "all_20db": [20.0] * n,
        "all_8db": [8.0] * n,
        "all_below": [7.9] * n,
        "top_half_dead": [30.0] * (n // 2) + [0.0] * (n - n // 2),
        "one_notch": [25.0] * 8 + [0.0, 0.0] + [25.0] * (n - 10),
        "two_tones": [0.0] * (n - 2) + [50.0, 50.0],
        "single_tone": [0.0] * (n - 1) + [50.0],
    }
    out = {}
    for name, snr in cases.items():
        r = negotiate.choose(np.array(snr))
        out[name] = None if r is None else {
            "mode": r["mode"],
            "bandwidth_hz": r["bandwidth_hz"],
            "mean_snr_db": round(float(r["mean_snr_db"]), 6),
            "octets": negotiate.capability_octets(r),
        }
    return out


def _xorshift32(seed):
    """A generator both implementations can run identically.

    numpy's PCG64 and the browser's sfc32 cannot be reconciled, but the noise in
    this case only has to be *the same on both sides*, not distributed like
    anything. Thirty-two-bit xorshift is small enough to write twice without
    the two copies drifting.
    """
    x = seed & 0xFFFFFFFF
    while True:
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= x >> 17
        x ^= (x << 5) & 0xFFFFFFFF
        yield x / 4294967296.0


def descent_case():
    """measure -> choose across the storm, with a noise floor both sides share.

    The noise-free case above cannot show the descent: with no floor, every
    storm level negotiates the same rate. Here a shared deterministic noise is
    added at a level that rises with the storm the way the real bed does, so the
    whole path from probe to ladder rung is compared, including the point where
    the line stops carrying anything.
    """
    out = {}
    for s in STORMS:
        pr = probe_pair(round_trip=0.08)
        received = line.filter_signal(pr, s) * db(GAIN_PROBE)
        gen = _xorshift32(0x1D0B57 + int(s * 1000))
        level = 10.0 ** ((line.NOISE_DBFS + line.NOISE_STORM_RISE_DB * min(s, 1.0)) / 20.0)
        noise = np.array([(next(gen) * 2.0 - 1.0) for _ in range(len(received))]) * level
        snr = line.measure(received + noise, s)
        result = negotiate.choose(snr)
        out[f"{s:.2f}"] = {
            "noise_level": level,
            "snr_db": [round(float(x), 6) for x in snr],
            "mode": None if result is None else result["mode"],
            "bandwidth_hz": None if result is None else result["bandwidth_hz"],
            "mean_snr_db": None if result is None else round(result["mean_snr_db"], 6),
        }
    return out


if __name__ == "__main__":
    print(json.dumps({
        "probe_tones": [float(f) for f in PROBE_TONES],
        "response": response_case(),
        "measure": measure_case(),
        "descent": descent_case(),
        "ladder": ladder_case(),
    }, indent=1))
