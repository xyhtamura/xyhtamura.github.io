"""Turning a measurement into a decision.

This is the part of the piece that is not composed. The probe is measured, the
usable band falls out of the measurement, and the mode is whatever the line will
carry. As the line degrades the ladder descends on its own; the descent is not
written into the score.

The threshold table below is a simplification. V.34 selects symbol rate, carrier
and data rate from tables in the Recommendation using attenuation distortion and
signal-to-noise measurements together; what is used here is a single ordered
ladder keyed on usable bandwidth and mean SNR, which reproduces the behaviour
that matters for the piece (higher rates die first, from the top of the band
down) without reproducing the tables. See NOTES.md.
"""

import numpy as np

from protocol import PROBE_TONES

USABLE_SNR_DB = 8.0

# name, bit rate, symbol rate, carrier Hz, min usable bandwidth Hz, min mean SNR dB
MODES = [
    ("V.34 33600", 33600, 3429, 1959, 3200, 34.0),
    ("V.34 28800", 28800, 3200, 1920, 3000, 30.0),
    ("V.34 24000", 24000, 3000, 1800, 2800, 26.0),
    ("V.34 19200", 19200, 2800, 1800, 2600, 22.0),
    ("V.34 14400", 14400, 2743, 1800, 2400, 19.0),
    ("V.32bis 14400", 14400, 2400, 1800, 2200, 17.0),
    ("V.32 9600", 9600, 2400, 1800, 2000, 14.0),
    ("V.32 4800", 4800, 2400, 1800, 1700, 11.0),
    ("V.22bis 2400", 2400, 600, 1700, 1200, 9.0),
    ("V.22 1200", 1200, 600, 1700, 900, 7.0),
    ("V.21 300", 300, 300, 1080, 600, 4.0),
]


def usable_band(snr_db):
    """The spectrum the receiver can actually use.

    Usable bandwidth is the total of the tones that survive, not the longest
    unbroken run of them. A single null in the middle of the band costs a modem
    the tones inside it and nothing more — V.34 answers a notch with
    pre-emphasis, it does not abandon everything above it. Measuring the
    contiguous run instead makes a bridged-tap reflection catastrophic and sends
    the ladder jumping several rungs at once.
    """
    idx = [i for i, good in enumerate(snr_db >= USABLE_SNR_DB) if good]
    if len(idx) < 2:
        return None
    return {
        "indices": idx,
        "low_hz": PROBE_TONES[idx[0]],
        "high_hz": PROBE_TONES[idx[-1]],
        "bandwidth_hz": len(idx) * 150.0,
        "mean_snr_db": float(np.mean(snr_db[idx])),
    }


def choose(snr_db):
    """The negotiated result, or None if the line will not carry a connection."""
    band = usable_band(snr_db)
    if band is None:
        return None
    for name, bit_rate, symbol_rate, carrier, min_bw, min_snr in MODES:
        if band["bandwidth_hz"] >= min_bw and band["mean_snr_db"] >= min_snr:
            return {
                "mode": name,
                "bit_rate": bit_rate,
                "symbol_rate": symbol_rate,
                "carrier_hz": carrier,
                "bits_per_symbol": bit_rate / symbol_rate,
                **band,
            }
    return None


def capability_octets(result):
    """Bytes for the CM/JM sequence that correspond to what was measured.

    V.8 CM and JM carry a call function and a list of modulation modes the DCE
    is willing to use. Here the list is derived from the measurement, so the
    audible 300 bit/s warble differs from attempt to attempt in step with what
    the line was found to be.
    """
    if result is None:
        return [0x00, 0x00]
    idx = [i for i, m in enumerate(MODES) if m[0] == result["mode"]][0]
    bw = int(result["bandwidth_hz"]) // 150
    snr = max(0, min(63, int(result["mean_snr_db"])))
    return [0xE0 | (idx & 0x0F), bw & 0xFF, snr & 0x3F, (idx * 37 + bw) & 0xFF]
