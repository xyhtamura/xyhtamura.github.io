"""Find the storm ceiling that makes the piece end past the failure point.

The audible noise floor and the descent are not independent. The negotiation is
a measurement of the same bed the listener hears, so lowering the floor raises
SNR and the line survives further into the storm. Any edit to NOISE_DBFS, to the
channel model, or to the ladder thresholds moves the point where the call dies,
and the storm curve has to be re-fitted to it or the piece either ends on a
working connection or fails far too early.

    python tune.py            # recommend --ceiling for render.py

The failure point is stochastic near the edge, so each level is tried several
times and the threshold is the lowest storm at which nothing connects on any
trial, at that level and every level above it.
"""

import argparse

import numpy as np

import line
import negotiate
from protocol import probe_pair, db
from render import GAIN_PROBE

# Fraction of the piece that should already be past the failure point.
FAIL_AT = 0.84


def connects(storm, rng):
    pr = probe_pair(round_trip=rng.uniform(0.04, 0.12))
    received = line.filter_signal(pr, storm) * db(GAIN_PROBE) + line.noise(
        len(pr), storm, rng
    )
    return negotiate.choose(line.measure(received, storm))


def sweep(lo=0.5, hi=8.0, step=0.1, trials=7, seed=11):
    rng = np.random.default_rng(seed)
    levels = np.arange(lo, hi + step / 2, step)
    survives = []
    for s in levels:
        ok = sum(1 for _ in range(trials) if connects(float(s), rng) is not None)
        survives.append(ok)
    return levels, np.array(survives)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--trials", type=int, default=7)
    p.add_argument("--step", type=float, default=0.1)
    a = p.parse_args()

    levels, survives = sweep(step=a.step, trials=a.trials)

    # Lowest level from which nothing connects, here or anywhere above.
    dead = None
    for i in range(len(levels)):
        if survives[i:].sum() == 0:
            dead = float(levels[i])
            break

    print(f"noise floor   {line.NOISE_DBFS:.1f} dBFS dry, "
          f"+{line.NOISE_STORM_RISE_DB:.0f} dB by storm {line.STORM_SATURATES}")
    last = None
    for s, ok in zip(levels, survives):
        if ok and (last is None or ok != last):
            pass
        last = ok
    marginal = [float(s) for s, ok in zip(levels, survives) if 0 < ok < a.trials]
    if marginal:
        print(f"marginal from {min(marginal):.2f} to {max(marginal):.2f} "
              f"(connects on some trials, not others)")
    if dead is None:
        print("no failure point found below storm 8.0 — the line never dies.")
        return

    ceiling = (dead - 0.04) / (FAIL_AT ** 2)
    print(f"dies at       storm {dead:.2f}")
    print(f"recommended   --ceiling {ceiling:.2f}")
    print(f"              (fails from {FAIL_AT:.0%} through the piece)")


if __name__ == "__main__":
    main()
