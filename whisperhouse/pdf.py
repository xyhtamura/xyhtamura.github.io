"""Print pn.html and prepend it to the unchanged score.

Requires PyMuPDF, Node.js, Playwright, and Chromium (or --browser).
Serve F:/xyh on port 8000 before running. Prose lives in pn.html.

Usage:
    python whisperhouse/pdf.py --modules PATH_TO_NODE_MODULES --browser PATH_TO_BROWSER
    python whisperhouse/pdf.py --url http://localhost:8000/xyhtamura.github.io/whisperhouse/pn.html
"""

import argparse
import json
from pathlib import Path
import subprocess
import sys
import tempfile

import pymupdf


PRINT_HTML = r"""
const {createRequire} = require('node:module');
const path = require('node:path');
const options = JSON.parse(process.argv[1]);
const runtime = options.modules
  ? createRequire(path.join(path.resolve(options.modules), '_whisperhouse.cjs'))
  : require;
const {chromium} = runtime('playwright');
(async () => {
  const browser = await chromium.launch({headless: true,
    ...(options.browser ? {executablePath: options.browser} : {})});
  try {
    const page = await browser.newPage();
    const response = await page.goto(options.url, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) throw new Error('Print page failed to load');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('main')).maxWidth === '896px');
    await page.evaluate(async () => {
      await document.fonts.load('16px "Cormorant Garamond"');
      await document.fonts.load('16px Inter');
      await document.fonts.ready;
      if (!document.fonts.check('16px "Cormorant Garamond"') || !document.fonts.check('16px Inter'))
        throw new Error('Print fonts failed to load');
    });
    await page.pdf({path: options.output, preferCSSPageSize: true,
      printBackground: true, displayHeaderFooter: false});
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
"""


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    folder = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--url', default='http://localhost:8000/xyhtamura.github.io/whisperhouse/pn.html')
    parser.add_argument('--node', default='node', help='Node.js executable')
    parser.add_argument('--modules', help='Directory containing the Playwright package')
    parser.add_argument('--browser', help='Chromium, Edge, or Chrome executable')
    args = parser.parse_args()

    # Stage both outputs so a failed print leaves the existing PDFs intact.
    with tempfile.TemporaryDirectory(prefix='whisperhouse-pdf-', dir=folder) as staging:
        notes_path = Path(staging) / 'programnotes.pdf'
        full_path = Path(staging) / 'whisperhousefull.pdf'
        options = dict(url=args.url, modules=args.modules, browser=args.browser, output=str(notes_path))
        subprocess.run([args.node, '-e', PRINT_HTML, json.dumps(options)], check=True)
        with pymupdf.open(notes_path) as notes, pymupdf.open(folder / 'whisperhouse.pdf') as score:
            if not notes.page_count or any(not page.get_text().strip() for page in notes):
                raise ValueError('Printed notes contain an empty page')
            notes_pages = notes.page_count
            notes.insert_pdf(score)
            notes.set_metadata({'title': 'whisper house | Program notes and score', 'author': 'Xyh Tamura'})
            notes.save(full_path)
        notes_path.replace(folder / 'programnotes.pdf')
        full_path.replace(folder / 'whisperhousefull.pdf')
    print(f'Printed {notes_pages} pages of notes; combined with the unchanged score.')


if __name__ == '__main__':
    main()
