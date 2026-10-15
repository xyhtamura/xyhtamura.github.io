"""Write the favicon and share-card tags into every page of the series.

Each page gets one block between <!-- share --> and <!-- /share --> in its
<head>: the favicon, the Apple touch icon, a canonical URL, and Open Graph and
Twitter card tags pointing at card.jpg. Rerunning replaces the block, so the
pages cannot drift apart. make_credits.py calls this for credits.html, since it
rewrites that page.

Usage:
  python stamp_heads.py            # every page in PAGES
"""
import html
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SERIES = os.path.join(HERE, '..')
SITE = 'https://xyhtamura.github.io/five-ways-through/'
CARD_ALT = 'The title Five Ways Through over plants seen from below, ringed around a starry sky.'

# path: (title, description)
PAGES = {
    'index.html': ('Five Ways Through',
                   'Five short browser pieces among plants lit by a camera flash, played with a photographed hand, with sound. Each sentence of the text opens one.'),
    'credits.html': ('Credits · Five Ways Through', 'Credits and licences for Five Ways Through.'),
    'running/index.html': ('Running · Five Ways Through',
                           'Grab the overgrowth ahead and let it snap back; each clearing makes you run faster, and the flash takes on colour.'),
    'exchange/index.html': ('Exchange · Five Ways Through',
                            'By day with the flash on, press a plant and your hand takes its place in the brush, while the plant becomes your hand.'),
    'hours/index.html': ('Hours · Five Ways Through',
                         'Rush forward and drag across the sky to move through the hours while a chord changes its tuning.'),
    'toward/index.html': ('Toward · Five Ways Through',
                          'Walk on toward a lit payphone at the end of a row of poles, through changing colours. Hold to stop.'),
    'forgetting/index.html': ('Forgetting · Five Ways Through',
                              'Walk backwards in coloured dark past shide, picking up the things in the grass. You can carry only one.'),
}


def block(path, title, description):
    depth = path.count('/')
    rel = '../' * depth
    url = SITE + (path[:-len('index.html')] if path.endswith('index.html') else path)
    a = lambda s: html.escape(s, quote=True)
    lines = [
        '<!-- share -->',
        f'<link rel="icon" type="image/svg+xml" href="{rel}favicon.svg">',
        f'<link rel="apple-touch-icon" href="{rel}apple-touch-icon.png">',
        '<meta name="theme-color" content="#05060d">',
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Xyh Tamura">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:title" content="{a(title)}">',
        f'<meta property="og:description" content="{a(description)}">',
        f'<meta property="og:image" content="{SITE}card.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{a(CARD_ALT)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{a(title)}">',
        f'<meta name="twitter:description" content="{a(description)}">',
        f'<meta name="twitter:image" content="{SITE}card.jpg">',
        f'<meta name="twitter:image:alt" content="{a(CARD_ALT)}">',
        '<!-- /share -->',
    ]
    return '\n'.join(lines)


def stamp(path):
    title, description = PAGES[path]
    full = os.path.join(SERIES, path)
    s = io.open(full, encoding='utf-8').read()
    new = block(path, title, description)
    if '<!-- share -->' in s:
        s = re.sub(r'<!-- share -->.*?<!-- /share -->', lambda _: new, s, flags=re.S)
    else:
        if '</head>' not in s:
            sys.exit(f'{path}: no </head>')
        s = s.replace('</head>', new + '\n</head>', 1)
    # Keep the plain description in step with the card's.
    s = re.sub(r'<meta name="description" content="[^"]*">', lambda _: f'<meta name="description" content="{html.escape(description, quote=True)}">', s)
    io.open(full, 'w', encoding='utf-8', newline='\n').write(s)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    for path in PAGES:
        stamp(path)
    print(f'stamped {len(PAGES)} pages')


if __name__ == '__main__':
    main()
