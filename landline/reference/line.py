"""The line.

The subscriber loop is the object the piece is about. Everything the modems do
is an attempt to find out what this is, and the piece degrades it over its
duration until nothing can be negotiated across it.

The same channel model is used twice: once to filter what the listener hears,
and once to produce the signal the receiving modem measures. The negotiation is
therefore a measurement of the audible line and not a decoration on top of one.
"""

import numpy as np

from protocol import SR, PROBE_TONES, PROBE_OMITTED, PROBE_SPACING

TELEPHONE_LOW = 300.0
TELEPHONE_HIGH = 3400.0

# Nominal RMS of the noise bed on a dry line, in dBFS, and how far it rises as
# the loop wets. The floor is meant to stay low: the call is lost because the
# signal is attenuated into the noise, not because the noise gets loud.
#
# Both the level rise and the impulse rate saturate at STORM_SATURATES. Induced
# noise on a loop does not grow without bound, but loss does — so past this
# point the bed holds still and only the signal keeps sinking. Without the cap
# these scale with raw storm, which the render now drives well past 1.0, and the
# end of the piece becomes loud crackle instead of near-silence.
NOISE_DBFS = -72.0
NOISE_STORM_RISE_DB = 13.0
STORM_SATURATES = 1.0


def response(freqs, storm):
    """Complex-magnitude response of the loop at a given storm level.

    storm runs 0 (a dry, short loop) to 1 (wet, long, and about to be unusable).
    Attenuation rises with frequency because that is what water and length do to
    twisted pair, so the top of the band is lost first and the negotiated rate
    falls with it.
    """
    f = np.asarray(freqs, dtype=float)
    h = np.ones_like(f)

    # Passband edges of the voice channel.
    h *= 1.0 / (1.0 + (TELEPHONE_LOW / np.maximum(f, 1.0)) ** 4)
    h *= 1.0 / (1.0 + (f / TELEPHONE_HIGH) ** 6)

    # Frequency-proportional loss that grows with the storm: the top of the band
    # is always lost first, which is why the negotiated rate falls with it.
    h *= np.exp(-storm * 2.8 * (f / TELEPHONE_HIGH))

    # Flat loss across the whole band, standing for series resistance on a long
    # wet loop. This is what finally takes the call: past a point there is not
    # enough signal left anywhere in the band to negotiate even 300 bit/s.
    h *= np.exp(-storm * 1.35)

    # A bridged tap reflection puts a null in the band and walks it downward as
    # the loop wets and its velocity of propagation changes.
    notch_f = 3100.0 - 900.0 * min(storm, 1.0)
    depth = min(0.9, 0.75 * storm)  # must stay below 1 or the null inverts phase
    h *= 1.0 - depth * np.exp(-(((f - notch_f) / 220.0) ** 2))

    return h


def filter_signal(sig, storm):
    if len(sig) == 0:
        return sig
    spec = np.fft.rfft(sig)
    freqs = np.fft.rfftfreq(len(sig), 1.0 / SR)
    return np.fft.irfft(spec * response(freqs, storm), n=len(sig))


def _tilt(freqs):
    """Loop noise is not flat; it rises toward the bottom of the band."""
    return (1.0 + 200.0 / np.maximum(freqs, 40.0)) ** 0.5


def _dry_gain():
    """RMS gain of tilt and band limit together on a dry line.

    Calibrating against this fixed reference keeps the absolute noise level from
    moving every time the channel model is edited, while leaving the storm's
    effect on the bed intact. Peak-normalising the filtered bed instead would
    couple level to storm backwards: a stormier, more heavily filtered bed would
    be boosted back up.
    """
    f = np.fft.rfftfreq(SR, 1.0 / SR)
    h = response(f, 0.0) * _tilt(f)
    return float(np.sqrt(np.mean(h ** 2)))


DRY_GAIN = _dry_gain()


def noise(n, storm, rng):
    """The near-silence.

    Hiss shaped to the voice band, mains hum and its harmonics, and impulse
    noise from switching and weather. This is the bed the whole piece sits on
    and the thing the probe is measuring against.
    """
    if n <= 0:
        return np.zeros(0)

    freqs = np.fft.rfftfreq(n, 1.0 / SR)

    white = rng.standard_normal(n)
    hiss = np.fft.irfft(np.fft.rfft(white) * _tilt(freqs), n=n)

    t = np.arange(n) / SR
    hum = np.zeros(n)
    for k, amp in ((1, 1.0), (2, 0.35), (3, 0.22), (5, 0.08)):
        hum += amp * np.sin(2.0 * np.pi * 50.0 * k * t + rng.uniform(0, 2 * np.pi))
    hum /= 1.65

    # Impulse noise: sparse at the start, frequent under weather.
    rate = 0.4 + 8.0 * min(storm, STORM_SATURATES) ** 2
    count = rng.poisson(rate * n / SR)
    clicks = np.zeros(n)
    if count:
        pos = rng.integers(0, n, size=count)
        for p in pos:
            length = int(rng.integers(4, 90))
            end = min(p + length, n)
            env = np.exp(-np.arange(end - p) / (length / 3.5))
            clicks[p:end] += env * rng.standard_normal(end - p) * rng.uniform(0.2, 1.0)

    # Hum and impulse noise are induced into the loop, so they reach the ear
    # through the same band-limited path as everything else. Filtering the bed
    # as a whole is what removes the 50 Hz fundamental: a handset earpiece does
    # not reproduce it, and what is left is the harmonics, which is what mains
    # hum on a telephone actually sounds like.
    # Shaping saturates with the level, for the same reason. The signal crosses
    # the whole loop and takes all of its loss; noise is induced along the loop's
    # length, so most of it enters past most of the attenuation. Letting the bed
    # take the full end-to-end loss makes it vanish late in the piece, which is
    # both wrong and the opposite of what the bed is for — it is the one thing
    # that never stops.
    bed = np.fft.irfft(
        np.fft.rfft(0.72 * hiss + 0.10 * hum + 0.30 * clicks)
        * response(freqs, min(storm, STORM_SATURATES) * 0.5),
        n=n,
    )
    # Deliberately not renormalised here. Peak-normalising after the filter
    # would make a more heavily filtered (stormier) bed get boosted back up,
    # which is the opposite of what the channel is supposed to be doing.
    # The floor rises as the storm builds, but only slightly. The connection is
    # lost because the signal is attenuated into the noise, not because the
    # noise gets loud — which is what keeps the end of the piece quiet.
    level = 10.0 ** (
        (NOISE_DBFS + NOISE_STORM_RISE_DB * min(storm, STORM_SATURATES)) / 20.0
    )
    return bed * level / DRY_GAIN


def measure(received, storm):
    """What the receiving modem learns from the probe.

    The four omitted tones in the V.34 comb exist so the receiver has places in
    the band where it can read noise with no signal present. That is exactly how
    the noise reference is taken here: signal power at the transmitted tones,
    noise power interpolated from the gaps.

    Returns per-tone signal-to-noise in dB.
    """
    n = len(received)
    win = np.hanning(n)
    spec = np.abs(np.fft.rfft(received * win)) ** 2
    freqs = np.fft.rfftfreq(n, 1.0 / SR)

    def power_at(f, width=40.0):
        sel = np.abs(freqs - f) <= width
        return spec[sel].sum() if sel.any() else 1e-30

    # Noise references. The comb sits on a 150 Hz grid, so every midpoint between
    # two grid frequencies carries no signal — the analysis window resolves well
    # under 150 Hz, so these bins are noise only. Together with the four tones
    # the standard deliberately omits, that gives a reference roughly every
    # 150 Hz across the band.
    #
    # Estimating the floor from only the four omitted tones is not enough. With
    # that few points the interpolated estimate is noisy enough that, on a line
    # carrying nothing at all, a few tones land above threshold by chance and the
    # receiver reports a connection in pure noise. A real receiver averages the
    # probe over L1 and L2 — some 700 ms — and does much better than that.
    refs = sorted(PROBE_OMITTED | set(np.arange(75.0, 3826.0, 150.0)))
    ref_p = np.array([power_at(f) for f in refs])
    # Three-point median across neighbouring references, to keep one unlucky bin
    # from dragging the local floor estimate down.
    if len(ref_p) >= 3:
        stack = np.vstack([
            np.r_[ref_p[0], ref_p[:-1]],
            ref_p,
            np.r_[ref_p[1:], ref_p[-1]],
        ])
        ref_p = np.median(stack, axis=0)
    noise_curve = np.interp(PROBE_TONES, refs, ref_p)

    snr = []
    for f, npow in zip(PROBE_TONES, noise_curve):
        s = power_at(f)
        snr.append(10.0 * np.log10(max(s - npow, 1e-30) / max(npow, 1e-30)))
    return np.array(snr)
