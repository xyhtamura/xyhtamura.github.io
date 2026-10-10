/** Check the Hax card images and layout in Edge. Root server: localhost:8000.
 * node scripts/check-hax.cjs --modules <node_modules> [--screenshots <folder>]
 */
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const option = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const modules = option('--modules');
const {chromium} = require(modules ? path.join(modules, 'playwright') : 'playwright');
const shots = option('--screenshots');
(async () => {
  if (shots) fs.mkdirSync(shots, {recursive: true});
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage({reducedMotion: 'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:8000/xyhtamura.github.io/somewarez-multicart/');
    await page.waitForSelector('.hack img');
    await page.evaluate(() => document.fonts.ready);
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, '../games.json'), 'utf8'));
    for (const width of [1280, 900, 768, 375]) {
      await page.setViewportSize({width, height: 1000});
      await page.locator('#hax').scrollIntoViewIfNeeded();
      const cards = await page.locator('.hack').evaluateAll(links => links.map(link => {
        const img = link.querySelector('img');
        return {href: link.href, loaded: img.complete && img.naturalWidth > 0,
          background: getComputedStyle(link).backgroundColor,
          captionFits: link.querySelector('.hax-caption').scrollWidth <= link.querySelector('.hax-caption').clientWidth};
      }));
      assert.deepEqual(cards.map(card => card.href), registry.extras.map(extra => extra.entry));
      assert(cards.every(card => card.loaded && card.captionFits && card.background === 'rgb(16, 30, 36)'), `Card check at ${width}`);
      assert.equal(await page.locator('#games .game').count(), 5);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
      if (shots && [1280, 375].includes(width)) await page.locator('#hax').screenshot({path: path.join(shots, `hax-${width}.png`)});
    }
    assert.deepEqual(errors, []);
    console.log('Hax: three loaded images, dark cards, matching links, five main games, and no overflow at 1280, 900, 768, and 375px.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
