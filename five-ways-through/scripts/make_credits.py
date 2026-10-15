"""Write credits.html from the rigs shipped in data/ and the herbarium ledger.

Every herbarium rig in data/herbarium/index.json must have an entry in
2d/botanicals/ASSETS.md (species, institution, barcode, licence); the script
fails if one does not, so a specimen cannot ship uncredited.

Usage:
  python make_credits.py
  python make_credits.py --ledger F:/xyh/2d/botanicals/ASSETS.md
"""
import argparse
import html
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SERIES = os.path.join(HERE, '..')
LICENCES = {'CC-BY 4.0': ('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'),
            'CC0': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/')}


def ledger_entries(path):
    text = io.open(path, encoding='utf-8').read()
    entries = {}
    for block in re.split(r'\n\s*\d+\.\s+\*\*`', text)[1:]:
        name = block.split('.jpg`', 1)[0]
        species = re.search(r'\*Species\*:\s*(.+)', block).group(1).strip()
        inst = re.search(r'\*Institution\*:\s*(.+?), barcode `([^`]+)`', block)
        lic = re.search(r'\*License\*:\s*([^|\n]+?)\s*(?:\||\n)', block).group(1).strip()
        gbif = re.search(r'\((https://www\.gbif\.org/occurrence/\d+)\)', block)
        entries[name] = {'species': species, 'institution': inst.group(1).strip(), 'barcode': inst.group(2),
                         'licence': lic, 'gbif': gbif.group(1) if gbif else None}
    return entries


def md_italics(s):
    return re.sub(r'\*([^*]+)\*', r'<i>\1</i>', html.escape(s))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--ledger', default=os.path.join(SERIES, '..', '..', '2d', 'botanicals', 'ASSETS.md'))
    ap.add_argument('--out', default=os.path.join(SERIES, 'credits.html'))
    args = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    entries = ledger_entries(args.ledger)
    rigs = [e['name'] for e in json.load(open(os.path.join(SERIES, 'data', 'herbarium', 'index.json'), encoding='utf-8'))]
    missing = [r for r in rigs if r not in entries]
    if missing:
        sys.exit(f'no ledger entry for: {missing}')
    items = []
    for r in sorted(rigs):
        e = entries[r]
        name, url = LICENCES.get(e['licence'], (e['licence'], None))
        lic = f'<a href="{url}">{name}</a>' if url else html.escape(name)
        record = f' (<a href="{e["gbif"]}">GBIF record</a>)' if e['gbif'] else ''
        items.append(f'    <li>{md_italics(e["species"])}. {html.escape(e["institution"])}, barcode {html.escape(e["barcode"])}{record}. {lic}.</li>')
    page = TEMPLATE.replace('{{SPECIMENS}}', '\n'.join(items)).replace('{{COUNT}}', str(len(rigs)))
    io.open(args.out, 'w', encoding='utf-8', newline='\n').write(page)
    print(f'wrote {args.out}: {len(rigs)} specimens')
    # The share tags live in one place; put them back on the page just rewritten.
    import stamp_heads
    if os.path.abspath(args.out) == os.path.abspath(os.path.join(SERIES, 'credits.html')):
        stamp_heads.stamp('credits.html')


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Credits · Five Ways Through</title>
<meta name="description" content="Credits and licences for Five Ways Through.">
<link rel="stylesheet" href="engine/text.css">
</head>
<body>
<main class="credits">
  <h1><a href="./">Five Ways Through</a> · Credits</h1>
  <!-- Written by scripts/make_credits.py from data/ and 2d/botanicals/ASSETS.md; edit the script, not this file. -->

  <p>Made by Xyh Tamura: concept, code, sound design, and the photographs of the hand.</p>

  <h2>Plants</h2>
  <p>{{COUNT}} herbarium specimen scans. Each was cut out from its sheet, its edge colours were extended, and it was rigged as a jointed mesh that moves in the wind.</p>
  <ul>
{{SPECIMENS}}
  </ul>
  <p>Hydrangeas, malunggay, and sunflowers, and the things lying in the grass in <i>Forgetting</i>, are cutouts from Xyh Tamura's photographs for Foam Green City, licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>

  <h2>Payphone</h2>
  <p>Payphone model by <a href="https://www.cgtrader.com/items/2789976">mechano-file on CGTrader</a>, offered free. Its texture was multiplied by its ambient occlusion map and reduced to 1,024 pixels.</p>

  <h2>Sound</h2>
  <p>The synth voices, chords, and tunings are written in Web Audio for these pieces. The tunings are equal temperament, just minor, septimal (7/6, 3/2, 7/4), and Whitewood35.</p>
  <p>The opening page loops Xyh Tamura's theme, made with Kontakt factory library strings and two wind recordings, its ending crossfaded over its start.</p>
  <p>Wind recordings from <i>Winds of Nature</i>, a royalty-free sound library by BOOM Library, cut into loops with the high frequencies lifted.</p>

  <h2>Type</h2>
  <p>Averia Sans Libre by Dan Sayers, made by averaging the fonts on its designer's computer, under the <a href="fonts/OFL.txt">SIL Open Font License 1.1</a>.</p>

  <h2>Code</h2>
  <p>WebGL 2 and Web Audio, written for these pieces, with no libraries.</p>

  <p class="foot"><a href="./">Back to the text</a></p>
</main>
</body>
</html>
"""

if __name__ == '__main__':
    main()
