"""Signal generators for the ITU-T handshake sequence.

Every generator here is built from the published spec rather than sampled from a
recording. Frequencies, durations and levels are cited inline so the render can
be checked against the Recommendations.

References
    ITU-T V.8    Procedures for starting sessions of data transmission over the
                 PSTN. ANSam, CM, JM.
    ITU-T V.21   300 bit/s duplex FSK. Channel 1 (low) 980/1180 Hz,
                 channel 2 (high) 1650/1850 Hz.
    ITU-T V.34   Line probing signals L1 and L2.
"""

import numpy as np

SR = 48000

# --- V.21 FSK ---------------------------------------------------------------
# V.21 channel 1 is used by the calling DCE, channel 2 by the answering DCE.
# Mark is binary 1, space is binary 0.
V21_LOW = {"mark": 980.0, "space": 1180.0}
V21_HIGH = {"mark": 1650.0, "space": 1850.0}
V21_BAUD = 300.0

# --- V.8 ANSam --------------------------------------------------------------
# 2100 Hz sinewave, amplitude modulated by a 15 Hz sinewave envelope, with a
# phase reversal every 450 ms.
ANSAM_CARRIER = 2100.0
ANSAM_MOD = 15.0
ANSAM_REVERSAL = 0.450

# --- V.34 line probe --------------------------------------------------------
# Twenty-one tones, 150 Hz to 3750 Hz on a 150 Hz grid, with four omitted.
PROBE_SPACING = 150.0
PROBE_OMITTED = {900.0, 1200.0, 1800.0, 2400.0}
PROBE_TONES = [
    f
    for f in np.arange(150.0, 3750.0 + 1.0, PROBE_SPACING)
    if f not in PROBE_OMITTED
]
# L1 is 24 repetitions of the 1/150 s period at +6 dB on nominal; L2 is the
# same comb at nominal level for at least 550 ms plus the round trip delay.
PROBE_PERIOD = 1.0 / PROBE_SPACING
L1_REPEATS = 24
L1_GAIN_DB = 6.0
L2_MIN = 0.550

# V.34 negotiates one of six symbol rates and a bit rate on a 2400 bit/s grid.
V34_SYMBOL_RATES = [2400, 2743, 2800, 3000, 3200, 3429]
V34_BIT_RATES = list(range(2400, 33600 + 1, 2400))
# Below V.34 the ladder falls back through the older Recommendations.
FALLBACK_LADDER = [14400, 9600, 4800, 2400, 1200, 300]


def _t(dur):
    return np.arange(int(round(dur * SR))) / SR


def db(x):
    return 10.0 ** (x / 20.0)


def ansam(dur):
    """V.8 ANSam: the answering modem saying it is there and it speaks V.8."""
    t = _t(dur)
    envelope = 1.0 + 0.2 * np.sin(2.0 * np.pi * ANSAM_MOD * t)
    # Phase reversals every 450 ms disable network echo suppressors.
    reversals = np.floor(t / ANSAM_REVERSAL) % 2.0
    phase = 2.0 * np.pi * ANSAM_CARRIER * t + np.pi * reversals
    sig = envelope * np.sin(phase)
    return sig * _edge(len(sig))


def v21(bits, channel="high", baud=V21_BAUD):
    """Frequency-shift keying of an actual bit sequence.

    CM and JM are carried this way at 300 bit/s. The audible warble is the bit
    pattern itself, so what is heard is the content of the negotiation and not
    an impression of it.
    """
    tones = V21_HIGH if channel == "high" else V21_LOW
    samples_per_bit = int(round(SR / baud))
    freqs = np.repeat(
        [tones["mark"] if b else tones["space"] for b in bits], samples_per_bit
    )
    # Integrate instantaneous frequency so the carrier stays phase continuous
    # across bit boundaries, as a real FSK modulator does.
    phase = 2.0 * np.pi * np.cumsum(freqs) / SR
    return np.sin(phase) * _edge(len(phase))


def probe(dur, gain_db=0.0):
    """V.34 L1/L2 line probe: the 21 tone comb.

    Phases follow a Schroeder-style quadratic distribution, which is what keeps
    a sum of equal-amplitude tones from stacking into an impulse. The spec fixes
    the phases for the same reason.
    """
    t = _t(dur)
    n = len(PROBE_TONES)
    sig = np.zeros_like(t)
    for k, f in enumerate(PROBE_TONES):
        phi = np.pi * k * k / n
        sig += np.sin(2.0 * np.pi * f * t + phi)
    sig /= np.sqrt(n)
    return sig * db(gain_db) * _edge(len(sig))


def probe_pair(round_trip=0.08):
    """L1 then L2, at the durations the Recommendation gives."""
    l1 = probe(L1_REPEATS * PROBE_PERIOD, gain_db=L1_GAIN_DB)
    l2 = probe(L2_MIN + round_trip, gain_db=0.0)
    return np.concatenate([l1, l2])


def _edge(n, ms=4.0):
    """Short raised-cosine edges. Real line signalling is switched, not faded,
    but an instantaneous edge produces a click that is louder than this piece."""
    k = min(int(SR * ms / 1000.0), n // 2)
    if k < 2:
        return np.ones(n)
    w = np.ones(n)
    ramp = 0.5 * (1.0 - np.cos(np.pi * np.arange(k) / k))
    w[:k] = ramp
    w[-k:] = ramp[::-1]
    return w


def bits_from_bytes(data, sync_ones=32):
    """CM and JM are octet sequences preceded by a synchronisation run.

    The octet tables in V.8 encode call function and available modulation modes.
    The bytes passed in stand for a specific negotiated capability set; the
    framing and the resulting audio are as specified.
    """
    bits = [1] * sync_ones
    for byte in data:
        bits.append(0)  # start bit
        bits.extend((byte >> i) & 1 for i in range(8))  # LSB first
        bits.append(1)  # stop bit
    return bits
